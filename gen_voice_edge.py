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

CACHE_VERSION = "v3"   # bump to force a full VO rebuild when master()/breath/dialogue logic changes

VOICE = "en-US-AndrewMultilingualNeural"  # most natural/human free voice; alts in voice_samples_v2/
DIALOGUE_VOICE = "en-US-ChristopherNeural"  # 2nd voice for in-world dialogue (mentor/rival) — deeper, distinct from the narrator
# Engagement tuning (2026-06-30, research-backed): faster delivery + far less dead air = the biggest
# "feels fast" lever for short attention spans. +10% ≈ ~165 WPM (sweet spot; hard cliff ~+15%/180 WPM).
RATE = "+8%"                   # ~190 WPM (Andrew's default is already ~174; +8% is faster-but-clear). Bump to +10% for ~195 if you want it hotter.
GAP = 0.25                     # silence after each scene (was 0.5 — cut dead air); per-scene `gap` overrides
LEAD = 0.1                     # quiet before narration starts within a scene (was 0.2)
BEAT_GAP = 0.7                 # longer hold for dramatic reveal/cliffhanger scenes (scene dict: gap=0.7)

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
    """Voice mastering: upsample 48k, high-pass, de-mud, presence shelf, de-ess, gentle
    harmonic exciter (real 'air'), soft compression, normalize. Keeps the edge voice but crisp.
    Returns (audio, new_sr)."""
    if y.ndim > 1:
        y = y.mean(axis=1)
    y = y.astype(np.float32)
    tgt = 48000
    if sr != tgt:                                                  # upsample (no aliasing on up)
        n2 = int(len(y) * tgt / sr)
        y = np.interp(np.linspace(0, len(y) - 1, n2), np.arange(len(y)), y).astype(np.float32)
        sr = tgt
    n = len(y)
    X = np.fft.rfft(y); fr = np.fft.rfftfreq(n, 1 / sr)
    g = np.ones_like(fr)
    g *= 1.0 / (1.0 + (85.0 / np.maximum(fr, 1.0)) ** 6)          # high-pass 85Hz
    g *= 1.0 - 0.32 * np.exp(-((fr - 320.0) / 140.0) ** 2)        # de-mud dip @320Hz
    g *= 1.0 - 0.25 * np.exp(-((fr - 2600.0) / 650.0) ** 2)       # nasal/boxy cut ~2.6k (-2.5dB, TTS tell)
    g *= 1.0 + 0.85 * (1.0 / (1.0 + np.exp(-(fr - 3200.0) / 600.0)))  # presence shelf ~+5dB
    g *= 1.0 - 0.5 * np.exp(-((fr - 7200.0) / 700.0) ** 2)        # de-ess notch @7.2k
    y_eq = np.fft.irfft(X * g, n=n).astype(np.float32)
    # subtle harmonic exciter -> perceived air (NOT noise: harmonics of existing presence band)
    hp = np.fft.irfft(X * (fr > 3000), n=n).astype(np.float32)
    harm = np.tanh(hp * 2.4).astype(np.float32)
    H = np.fft.rfft(harm); band = ((fr > 5000) & (fr < 12500)).astype(np.float32)
    air = np.fft.irfft(H * band, n=n).astype(np.float32)
    out = y_eq + air * 0.14                                        # modest -> crisp, never fizzy
    out = np.tanh(out * 1.45) / np.tanh(1.45)                      # gentle compression
    out = out / (np.max(np.abs(out)) + 1e-9) * 0.97
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
        gap = float(sc.get("gap", GAP))                           # per-scene override for dramatic holds
        total = LEAD + speech + gap
        nwords += nw
        speech_total += speech
        dur_f = max(1, round(total * FPS))
        scenes_out.append({
            "id": sc["id"], "level": sc["level"], "overlay": sc["overlay"],
            "template": sc.get("template", sc["id"]),
            "audio": f"audio/{sc['id']}.wav", "audioStartFrame": round(LEAD * FPS),
            "startFrame": cursor, "durationInFrames": dur_f,
        })
        print(f"{sc['id']}: speech {speech:5.2f}s -> scene {total:5.2f}s ({dur_f}f)")
        cursor += dur_f
        await asyncio.sleep(0.25)                                 # gentle pacing -> fewer rate-limit blips

    timeline = {"fps": FPS, "width": 1920, "height": 1080, "totalFrames": cursor, "voice": VOICE, "scenes": scenes_out}
    out = os.path.join(ROOT, "src", "timeline.json")
    json.dump(timeline, open(out, "w"), indent=2)
    wpm = nwords / (speech_total / 60) if speech_total else 0
    print(f"\nTOTAL: {cursor} frames = {cursor/FPS:.1f}s  ({nwords} words, ~{wpm:.0f} WPM, "
          f"{reused}/{len(SCENES)} scenes reused from cache, voice={VOICE} rate={RATE}) -> {out}")

asyncio.run(main())
