#!/usr/bin/env python3
"""Generate per-scene narration with edge-tts (Microsoft neural, free, more natural),
save mp3, and emit src/timeline.json. Duration derived from WordBoundary events
(no ffmpeg needed). Swap VOICE to re-render with a different narrator.
"""
import os, json, asyncio, hashlib
import numpy as np
import edge_tts
import soundfile as sf
from content import SCENES, FPS

CACHE_VERSION = "v8"   # v8: OWNER retune #2 — -7% -> -5% ("a little faster") AND the master() crispness
                       #     retune ("more crisp"). BOTH change the audio, so the bump is mandatory:
                       #     the DSP is not part of the cache key, only this constant is, so a DSP-only
                       #     edit without a bump is invisible. Verified: rebuild reported 0/202 reused.
                       # v7: OWNER retune, -10% -> -7% ("the voice needs to be slightly sped up").
                       # v6: narration rate retuned to -10% for canon-length sentences (see RATE).
                       # v5: crayon narration rate (-13%) + varied gaps + wider BEAT_GAP.
                       # MUST be bumped whenever RATE or the DSP chain changes: the per-scene cache key
                       # is hashed over it, and without a bump every scene reuses its old wav and the
                       # change is a silent no-op.

VOICE = "en-US-AndrewMultilingualNeural"  # most natural/human free voice; alts in voice_samples_v2/
DIALOGUE_VOICE = "en-US-ChristopherNeural"  # 2nd voice for in-world dialogue (mentor/rival) — deeper, distinct from the narrator
# CRAYON pacing (docs/CRAYON_BIBLE.md §2, docs/research/crayon/MEASUREMENTS.md): the reference channel
# narrates at 148.5 WPM aggregate (139.2–152.9 per video), and the metric is RUNTIME-INCLUSIVE —
# transcript words / total video minutes, counting the leads, gaps and dialogue beats. gate.py asserts
# that number against a 143–154 band.
#
# THE RATE IS A FUNCTION OF SENTENCE LENGTH, NOT JUST OF THE VOICE. -13% was measured correctly, but
# against the PREVIOUS episode, whose sentences average ~15 words. The crayon canon writes short
# fragments instead (8.47-word mean, 56.3% under 8 words — docs/BIBLE.md §3) and edge-tts inserts a
# sentence-final pause at every full stop, so the same rate reads materially slower on a canon script.
# At -13% the WO-13 sample episode landed at 143.4 WPM runtime: inside the current band by 0.4, close
# enough to trip gate.py's band-edge WARN, and outright REJECTED by the 145–152 band that preceded it.
# Nothing downstream can recover that — runtime WPM can never exceed speech WPM, and ~97% of runtime
# is speech, so zeroing every lead and gap in the episode would still only reach the speech rate.
#
# RE-MEASURED (WO-16, extended WO-17) on the WHOLE of the committed canon-compliant content.py — all
# 39 scenes, 2,091 words, through the real synth + master() + trim_silence() chain and
# gen_voice_edge's own per-scene timing arithmetic, including breaths and the two in-world dialogue
# lines:
#   RATE     speech WPM   runtime WPM   runtime
#   -13%       147.1        143.4       14.59 min   0.4 off the band floor
#   -12%       149.1        145.2       14.40 min
#   -11%       150.6        146.7       14.26 min
#   -10%       152.5        148.4       14.09 min   <- WO-16 value; 0.1 off the reference's aggregate
#    -9%       153.0        148.9       14.04 min   (edge-tts quantises: only +0.5 speech WPM for 1%)
#    -8%       155.0        150.8       13.86 min
#    -7%       156.8        152.5       13.71 min   <- chosen at the time (WO-17)
#    -6%       159.2        154.8       13.50 min   OVER the 154.0 ceiling of the time
#    -5%       160.8        156.3       13.38 min   OVER that ceiling
# The -10% row reproduces the WO-16 src/timeline.json frame for frame (25,364), which is what makes
# every row the same quantity gate.py recomputes rather than a parallel estimate.
#
# ^ THAT TABLE IS HISTORICAL AND ITS NUMBERS NO LONGER APPLY. It was measured on the 39-SCENE edit.
# The episode is now cut into 202 scenes, which changes runtime WPM at a FIXED rate by ~3 (39 scenes
# at -7% gave 152.5; 202 scenes at -7% also gave 152.5, but -6% moved 154.8 -> 154.2 and -5% moved
# 156.3 -> 155.6). Use the WO-31 table below for anything current; this one is kept only so the
# -13%/-10%/-7% decision history stays readable.
#
# WHY -7% AND NOT -10% (WO-17, 2026-08-12): the OWNER, watching the sample episode, asked for the
# voice to be "slightly sped up". -10% was tuned to the reference's 148.5 AGGREGATE, and the ear that
# has to live with the channel outranks that aggregate.
#
# RE-MEASURED AGAIN (WO-31, 2026-08-15) on the CURRENT 202-scene cut, because the table above was
# measured on the 39-scene WO-13 edit and runtime WPM is NOT a function of the rate alone — it moves
# with scene granularity too (see docs/BIBLE.md §3a: 39 scenes and 202 scenes both land at 152.5 at
# -7%, but the 141-scene draft in between hit 154.2). Same method as before: every scene of the
# committed content.py synthesised at each rate, through the real master() + trim_silence() chain and
# this file's own per-scene timing arithmetic. Validated by reproducing the committed
# src/timeline.json to within 6 frames of 29,112 (0.02%) and its runtime WPM exactly.
#   RATE     speech WPM   runtime WPM   runtime
#    -7%       170.8        152.5       16.18 min   <- previous value
#    -6%       173.0        154.2       16.00 min
#    -5%       174.8        155.6       15.85 min   <- CHOSEN (WO-31)
#    -4%       176.3        156.8       15.74 min
#
# WHY -5% (WO-31): the OWNER asked a SECOND time for the voice to be faster ("more crisp and a little
# faster"), having already been given -10% -> -7%. The first increment was +4.1 runtime WPM and was
# not enough, so this one is deliberately comparable rather than token: +3.1 WPM, 152.5 -> 155.6.
# -4% was measured and rejected as more than "a little"; -6% (+1.7) repeats the mistake of an
# increment too small to answer the note.
#
# THIS IS A DELIBERATE DEPARTURE FROM THE REFERENCE, NOT A MATCH TO IT — say so plainly rather than
# discovering it later. The reference channel's own per-video range is 139.2-152.9 WPM with a 148.5
# aggregate. 152.5 was at the very top of that range; 155.6 is 2.7 WPM ABOVE THE FASTEST VIDEO THE
# REFERENCE HAS. It is the owner's instruction and the owner outranks the reference, but nothing here
# should be read as "this is what the reference does". It is not.
# Cross-checked against the syllable-rate rule (WPM ~= 215 / syllables-per-word, because the voice
# speaks at a near-constant syllable rate): this script measures 1.4220 syllables/word over its 2,467
# words, so the rule predicts 151.2 WPM. -7% implied a constant of 216.9 (+0.9% over 215); -5% implies
# 221.3 (+2.9%). That is the same ~3% departure seen in the WPM table, from an independent direction —
# the words did not get shorter, the voice genuinely got faster.
#
# If you change this, BUMP CACHE_VERSION in the same edit or every scene reuses its cached wav.
# content.py ALSO carries the rate: it does `_s.setdefault("rate", NARRATION_RATE)` on every scene,
# and a per-scene `rate` WINS over this constant (`sc.get("rate", RATE)` below). Changing this value
# alone does nothing to an episode whose content.py sets its own — change both.
RATE = "-5%"                   # MEASURED 174.8 WPM speech / 155.6 runtime; re-measure if you change it
# Inter-scene silence. The reference's gaps measure 0.18–1.0s and VARY; one fixed value is a tell.
GAP_MIN, GAP_MAX = 0.25, 0.55           # ordinary scene-to-scene breath (deterministic per scene id)
TURN_GAP_MIN, TURN_GAP_MAX = 0.60, 1.00  # longer hold before a chapter/LEVEL turn
LEAD = 0.1                     # quiet before narration starts within a scene (was 0.2)
BEAT_GAP = 0.8                 # hold between narration and an in-world dialogue line (was 0.7)

ROOT = os.path.dirname(os.path.abspath(__file__))
AUDIO = os.path.join(ROOT, "public", "audio")
os.makedirs(AUDIO, exist_ok=True)

SYNTH_TIMEOUT = 45   # seconds per attempt — a stalled edge-tts socket has no timeout of its own and
                     # would hang the whole build forever; wait_for turns a hang into a retry.

async def synth_mp3(text, path, rate=RATE, tries=6):
    """Synth one scene to mp3. edge-tts intermittently throws NoAudioReceived OR silently HANGS on a
    stalled socket (no built-in timeout) — wrap each attempt in a hard timeout AND retry with backoff
    so one blip/hang doesn't kill the build. `rate` may be overridden per scene."""
    async def _fetch():
        comm = edge_tts.Communicate(text, VOICE, rate=rate)
        data = bytearray()
        async for chunk in comm.stream():
            if chunk["type"] == "audio":
                data += chunk["data"]
        if not data:
            raise edge_tts.exceptions.NoAudioReceived("empty stream")
        return data
    last = None
    for attempt in range(tries):
        try:
            data = await asyncio.wait_for(_fetch(), timeout=SYNTH_TIMEOUT)
            with open(path, "wb") as f:
                f.write(data)
            return
        except (Exception, asyncio.TimeoutError) as e:           # transient/hang: back off and retry
            last = e
            await asyncio.sleep(1.5 * (attempt + 1))
    raise last

def master(y, sr):
    """Voice mastering — CLEAN chain (fixes grain/fizz). edge-tts is band-limited to ~12kHz, so the
    old harmonic EXCITER (tanh drive) was fabricating fizzy high-end = the graininess. Instead:
    proper band-limited resample to 48k, HP, de-mud, gentle nasal trim, clean PRESENCE + AIR shelves
    (linear, no distortion), de-ess, roll OFF the empty >13.5k band (artifact/fizz), gentle soft-knee
    compression, normalize with headroom. Crisp from real presence, not synthetic air. Returns (audio, sr).

    CRISPNESS RETUNE (WO-31, 2026-08-15) — the OWNER asked twice for the voice to be "more crisp".
    THE DE-ESS WAS THE THING COSTING CRISPNESS, and not at its centre — at its SKIRT. At 0.42 deep
    with sigma=850 the Gaussian was still cutting -3.07dB at 6.5kHz and -0.97dB at 6.0kHz, i.e. it
    was scooping the top of the CLARITY band (4-6.5k, where consonant definition lives) as collateral
    on every syllable, sibilant or not. That is only worth paying on a genuinely essy source, and
    edge-tts's Andrew is not one. Three changes, ALL LINEAR EQ:
      * de-ess sigma 850 -> 620 (and 0.42 -> 0.40 deep, centre 7000 -> 7100Hz). The depth AT THE
        CENTRE is essentially kept — -4.73dB before, -4.44dB now, so real ess energy is still
        controlled — but the skirt comes off the clarity band: 6.5kHz -3.07 -> -1.48dB, 6.0kHz
        -0.97 -> -0.15dB, 5.0kHz -0.01 -> -0.00dB. This is the change that does most of the work.
      * presence shelf +3.3dB@3.7k -> +4.6dB@3.1k (0.45/700 -> 0.66/560): more lift, and the lower,
        tighter knee puts the whole 4-6.5k band on the shelf's flat top instead of part-way up its
        slope (at 4kHz the shelf alone was only 60% engaged before).
      * roll-off 13.5k -> 14.5k. NOT an attempt to add air. The 6th-order corner at 13.5k was still
        -3.5dB at 12kHz, which is INSIDE the source's real content — it was discarding genuine top
        end in order to kill a fizz band that starts above it. At 14.5k the same corner is -2.4dB
        at 12k. Nothing is created above ~12k either way; there is nothing up there to create.
    NOT DONE, DELIBERATELY: no harmonic exciter, no synthesised air. edge-tts is band-limited to
    ~12kHz; a previous version fabricated high end with tanh drive and the grain that caused is the
    reason this chain was rewritten (see the paragraph above). The only nonlinearity is the UNCHANGED
    soft-knee tanh, and it was checked rather than assumed: its residual against a scale-matched
    linear reference moved -32.75 -> -32.35 dB, so it is doing the same amount of work as before.

    MEASURED, old chain vs new, over 39 real narration scenes of this episode (band RMS via Parseval,
    after master() + trim_silence()):
        presence  4-6.5k   -31.83 -> -30.53 dB   +1.30
        sibilance 6-8k     -40.47 -> -38.52 dB   +1.95
        air       9-12k    -44.04 -> -42.76 dB   +1.28
        body      0.3-3k   -19.76 -> -19.98 dB   -0.22
        peak (linear)        0.950 -> 0.950      +0.000  (both normalise to 0.95)
        broadband RMS      -16.48 -> -16.62 dB   -0.14   <- it did NOT just get louder; it got
                                                            marginally QUIETER while the bands rose.
    Sibilance was checked for SPIKINESS, not just level, because "louder esses" and "sharper esses"
    are different failures: the 6-8k band's crest factor moved 27.10 -> 27.07 dB (flat, marginally
    calmer) and the loudest 10ms sibilant block rose +1.99dB against the band mean's +1.95dB — i.e.
    the peaks tracked the band exactly. The band was LIFTED, not SHARPENED. The 6-8k rise is larger
    than the 4-6.5k rise by construction and not by accident: 6-6.5k belongs to both bands, and it is
    precisely the region the old de-ess skirt was over-cutting."""
    if y.ndim > 1:
        y = y.mean(axis=1)
    y = y.astype(np.float32)
    tgt = 48000
    if sr != tgt:
        try:                                                       # proper anti-imaging resample (clean)
            from scipy.signal import resample_poly
            from math import gcd
            gg = gcd(tgt, int(sr))
            y = resample_poly(y, tgt // gg, int(sr) // gg).astype(np.float32)
        except Exception:                                          # fallback: linear interp
            n2 = int(len(y) * tgt / sr)
            y = np.interp(np.linspace(0, len(y) - 1, n2), np.arange(len(y)), y).astype(np.float32)
        sr = tgt
    n = len(y)
    X = np.fft.rfft(y); fr = np.fft.rfftfreq(n, 1 / sr)
    g = np.ones_like(fr)
    g *= 1.0 / (1.0 + (85.0 / np.maximum(fr, 1.0)) ** 6)          # high-pass 85Hz (rumble)
    g *= 1.0 - 0.28 * np.exp(-((fr - 300.0) / 130.0) ** 2)        # de-mud dip @300Hz
    g *= 1.0 - 0.14 * np.exp(-((fr - 2600.0) / 700.0) ** 2)       # gentle nasal trim (-1.3dB, keep clarity)
    g *= 1.0 + 0.66 * (1.0 / (1.0 + np.exp(-(fr - 3100.0) / 560.0)))  # CLEAN presence shelf ~+4.6dB (crisp consonants)
    g *= 1.0 - 0.40 * np.exp(-((fr - 7100.0) / 620.0) ** 2)       # de-ess @7.1k — as DEEP, much NARROWER (see below)
    g *= 1.0 + 0.18 * (1.0 / (1.0 + np.exp(-(fr - 9500.0) / 900.0)))  # small CLEAN air shelf ~+1.4dB (sparkle)
    g *= 1.0 / (1.0 + (fr / 14500.0) ** 6)                        # roll OFF the empty >14.5k fizz band
    out = np.fft.irfft(X * g, n=n).astype(np.float32)
    out = np.tanh(out * 1.25) / np.tanh(1.25)                     # gentle soft-knee compression (less drive)
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.95              # normalize with headroom
    return out.astype(np.float32), sr

def master_dialogue(y, sr):
    """In-world treatment for the 2nd voice (dialogue): thinner + a tight room slap so it sits
    'in the scene' next to the dry, intimate narrator (a real pattern-interrupt). Returns (audio, sr)."""
    if y.ndim > 1:
        y = y.mean(axis=1)
    y = y.astype(np.float32)
    tgt = 48000
    if sr != tgt:
        n2 = int(len(y) * tgt / sr)
        y = np.interp(np.linspace(0, len(y) - 1, n2), np.arange(len(y)), y).astype(np.float32)
        sr = tgt
    n = len(y); X = np.fft.rfft(y); fr = np.fft.rfftfreq(n, 1 / sr)
    g = np.ones_like(fr)
    g *= 1.0 / (1.0 + (120.0 / np.maximum(fr, 1.0)) ** 6)         # thinner low end (HP 120)
    g *= 1.0 + 0.30 * np.exp(-((fr - 1900.0) / 700.0) ** 2)      # slight mid presence (intelligible)
    g *= 1.0 / (1.0 + (fr / 6200.0) ** 4)                         # roll highs >6.2k (less 'air' than narrator)
    y = np.fft.irfft(X * g, n=n).astype(np.float32)
    # tight room: two short slaps (~34/63 ms) -> places the voice in a space
    room = y.copy()
    for ms, amp in ((34, 0.22), (63, 0.12)):
        d = int(sr * ms / 1000)
        if d < n:
            room[d:] += y[:-d] * amp
    out = np.tanh(room * 1.4) / np.tanh(1.4)
    return (out / (np.max(np.abs(out)) + 1e-9) * 0.9).astype(np.float32), sr

def trim_silence(y, sr, thresh=0.012, pad=0.04):
    """Trim leading/trailing near-silence (TTS breaths/tails) so dead air doesn't accumulate per scene."""
    a = np.abs(y)
    idx = np.where(a > thresh)[0]
    if len(idx) == 0:
        return y
    p = int(pad * sr)
    return y[max(0, idx[0] - p):min(len(y), idx[-1] + p)]

def breath(sr, dur=0.24, peak=0.085, seed=0):
    """A soft, airy inhale to prepend before longer lines — brains flag impossible breathlessness
    as synthetic ~90s into TTS, so a real breath every so often reads as human. Crude band-pass
    noise (air, not hiss) under a smooth inhale envelope. Deterministic per seed."""
    rng = np.random.default_rng(seed)
    n = int(sr * dur); tt = np.linspace(0, 1, n, endpoint=False)
    noise = rng.standard_normal(n).astype(np.float32)
    k1 = max(2, int(sr * 0.0006)); k2 = max(2, int(sr * 0.004))
    band = np.convolve(noise, np.ones(k1) / k1, mode="same") - np.convolve(noise, np.ones(k2) / k2, mode="same")
    env = np.sin(np.pi * tt) ** 1.5                              # inhale: rise then settle
    b = (band * env).astype(np.float32)
    m = float(np.max(np.abs(b)))
    return (b / m * peak).astype(np.float32) if m > 1e-9 else b

def scene_gap(sc, nxt):
    """Deterministic VARIED silence after a scene, inside the reference's measured 0.18–1.0s band.
    A writer's explicit `gap=` always wins — duck_music.py keys its silence beat off gaps >= 1.4,
    so auto gaps are capped below that by construction. Hashed on the scene id => stable across runs."""
    if sc.get("gap") is not None:
        return float(sc["gap"])
    turn = bool(nxt and nxt.get("level"))
    lo, hi = (TURN_GAP_MIN, TURN_GAP_MAX) if turn else (GAP_MIN, GAP_MAX)
    frac = int(hashlib.md5(sc["id"].encode()).hexdigest()[:8], 16) / 0xFFFFFFFF
    return round(lo + (hi - lo) * frac, 3)

async def main():
    scenes_out = []
    cursor = 0
    nwords = 0
    speech_total = 0.0
    # per-scene VO CACHE: skip re-synth when a scene's narration/rate/dialogue is unchanged. Makes
    # iterative edits fast AND makes a hung/crashed build RESUMABLE (finished scenes stay cached).
    cache_path = os.path.join(AUDIO, ".vo_cache.json")
    try:
        cache = json.load(open(cache_path))
    except Exception:
        cache = {}
    reused = 0
    for i, sc in enumerate(SCENES):
        rate = sc.get("rate", RATE)                              # per-scene prosody override
        nw = len(sc["narration"].split())
        wav = os.path.join(AUDIO, f"{sc['id']}.wav")
        key = hashlib.md5(("|".join([CACHE_VERSION, sc["narration"], str(rate),
            json.dumps(sc.get("dialogue"), sort_keys=True), str(nw > 48 or sc.get("breath")),
            str(i > 0)])).encode()).hexdigest()
        if os.path.exists(wav) and cache.get(sc["id"]) == key:   # reuse cached wav (skip network synth)
            y, sr = sf.read(wav, dtype="float32")
            if y.ndim > 1:
                y = y.mean(axis=1)
            reused += 1
        else:
            mp3 = os.path.join(AUDIO, f"{sc['id']}.mp3")
            await synth_mp3(sc["narration"], mp3, rate=rate)
            y, sr = sf.read(mp3, dtype="float32")
            y, sr = master(y, sr)
            y = trim_silence(y, sr)                              # cut TTS breaths/tails (dead air)
            # prepend a soft real breath before longer lines (not the cold open) — human-izes the TTS
            if i > 0 and (nw > 48 or sc.get("breath")):
                br = breath(sr, seed=(hash(sc["id"]) & 0xffff))
                y = np.concatenate([br, np.zeros(int(0.05 * sr), np.float32), y]).astype(np.float32)
            # in-world DIALOGUE (2nd voice) — mentor's warning / rival's taunt, appended after narration.
            dlg = sc.get("dialogue")
            if dlg:
                for j, d in enumerate(dlg if isinstance(dlg, list) else [dlg]):
                    dtext = d["text"] if isinstance(d, dict) else str(d)
                    dvoice = (d.get("voice") if isinstance(d, dict) else None) or DIALOGUE_VOICE
                    drate = (d.get("rate") if isinstance(d, dict) else None) or "+0%"
                    dmp3 = os.path.join(AUDIO, f"{sc['id']}_d{j}.mp3")
                    await synth_mp3(dtext, dmp3, rate=drate)
                    dy, dsr = sf.read(dmp3, dtype="float32")
                    dy, dsr = master_dialogue(dy, dsr)
                    dy = trim_silence(dy, dsr)
                    y = np.concatenate([y, np.zeros(int(BEAT_GAP * sr), np.float32), dy]).astype(np.float32)
                print(f"  {sc['id']}: +{len(dlg if isinstance(dlg,list) else [dlg])} in-world dialogue line(s)")
            sf.write(wav, y, sr)
            cache[sc["id"]] = key
            json.dump(cache, open(cache_path, "w"))             # save INCREMENTALLY -> crash-resumable
        speech = len(y) / sr
        gap = scene_gap(sc, SCENES[i + 1] if i + 1 < len(SCENES) else None)
        total = LEAD + speech + gap
        nwords += nw
        speech_total += speech
        dur_f = max(1, round(total * FPS))
        rec = {
            "id": sc["id"], "level": sc["level"], "overlay": sc["overlay"],
            "template": sc.get("template", sc["id"]),
            "audio": f"audio/{sc['id']}.wav", "audioStartFrame": round(LEAD * FPS),
            "startFrame": cursor, "durationInFrames": dur_f,
            "gap": gap,   # carry the writer's per-scene gap through to timeline.json so
                          # duck_music.py's silence-beat placement can honor it (not just LEAD/GAP math)
        }
        # CRAYON signature devices (WO-12a) — full-screen card (text OR the WO-19 object showcase),
        # speech balloons / floating dialogue, multi-panel split, and the WO-19 over-the-shoulder
        # foreground silhouette. Purely VISUAL: they change nothing about synthesis, timing or
        # the VO cache key, so they are passed through verbatim and ONLY when the writer set them.
        # A scene with none of them therefore emits byte-for-byte the record it emitted before.
        # Field shapes are documented for the writer in docs/BIBLE.md §8; Video2.tsx validates them
        # and RAISES on a malformed one rather than silently dropping the device.
        # WO-27 adds `period` to the same list: the scene's era ("pre1900"), which makes the template
        # draw its room with the era-marking props substituted out (ledgers for monitors, a chalk
        # board for an electronic one, masonry for a glazed skyline). Same contract as the devices —
        # visual only, passed through verbatim, absent unless the writer set it.
        for key in ("card", "bubbles", "panels", "foreground", "period"):
            if sc.get(key) is not None:
                rec[key] = sc[key]
        scenes_out.append(rec)
        print(f"{sc['id']}: speech {speech:5.2f}s -> scene {total:5.2f}s ({dur_f}f)")
        cursor += dur_f
        await asyncio.sleep(0.25)                                 # gentle pacing -> fewer rate-limit blips

    timeline = {"fps": FPS, "width": 1920, "height": 1080, "totalFrames": cursor, "voice": VOICE, "scenes": scenes_out}
    out = os.path.join(ROOT, "src", "timeline.json")
    json.dump(timeline, open(out, "w"), indent=2)
    wpm = nwords / (speech_total / 60) if speech_total else 0
    # runtime WPM is the metric the reference was measured with (transcript words / video minutes),
    # so print both: speech-only WPM and words-per-minute-of-runtime. gate.py asserts 143–154 on the
    # runtime figure; the writing target is the reference's 148.5 aggregate.
    rt_wpm = nwords / (cursor / FPS / 60) if cursor else 0
    print(f"\nTOTAL: {cursor} frames = {cursor/FPS:.1f}s  ({nwords} words, ~{wpm:.1f} WPM speech / "
          f"{rt_wpm:.1f} WPM runtime, {reused}/{len(SCENES)} scenes reused from cache, "
          f"voice={VOICE} rate={RATE}) -> {out}")

asyncio.run(main())
