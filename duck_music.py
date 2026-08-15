#!/usr/bin/env python3
"""Sound-design placement engine. Runs in build.py AFTER gen_voice + make_ambient.
Pure numpy/scipy/soundfile; NEVER hard-fails the build.

Does three things to the already-generated bed (public/music/ambient.wav) and an SFX layer
(public/music/sfx.wav that Video2 plays as a separate Audio track):

  1. SIDECHAIN DUCK — dip the music/ambience under every VO window (built from real VO wav
     lengths in src/timeline.json) so narration is always clear (#1 amateur-vs-pro tell).
  2. SILENCE BEAT — ~1.3s where music falls to near-silence right before the midpoint
     reversal line, then swells back (silence is the strongest emphasis tool; use once).
  3. DRY PASSAGES — whole spans of runtime with no music bed at all (structural silence).

=============================================================================================
NO TRANSIENT SFX ARE PLACED. THIS IS DELIBERATE — DO NOT "RESTORE" THEM (WO-31, 2026-08-15).
=============================================================================================
This file used to place a whoosh INTO EVERY NORMAL CUT, a riser + brand STAMP + thud on every
LEVEL cut, a soft POP on every number/overlay reveal, a cold-open thud, and a climax heartbeat.
The last build before this change logged 196 whooshes, 5 level stamps, 18 pops and a heartbeat
in a 16-minute episode. The OWNER's note was "there is a weird sound when each clip changes that
does not need to be there" — that is the whoosh, at ~12.4 per minute, on essentially every cut.

The whole vocabulary was then re-examined rather than just the one the owner named, and NONE of
it had evidence behind it. docs/CRAYON_BIBLE.md §8 records what was actually MEASURED off the
reference channel: a music bed ducked 8-15 dB under narration, and deliberate music-free
passages. That is the entire measured sound design. The reference's SFX vocabulary is explicitly
recorded as NOT measured. The transients were carried over unexamined from the retired doodle-era
format, and two of them were provably furniture from a format this channel no longer is:
  * the STAMP is documented in sfx_lib.py as "the channel's signature 'a rank just locked in'
    sound". There is no rank ladder in the explainer format. `level` here holds "CH 1".."CH 5" —
    CHAPTER markers. There was no rank locking in; the sound was announcing a thing that does
    not exist.
  * the POP fired on every big-number overlay — 18 of them, ~0.35s after a cut, i.e. LANDING ON
    TOP OF THE NARRATION the sidechain duck exists to keep clear. It fought the one measured
    thing in the file.
The whoosh, riser, cold-open thud and climax heartbeat are removed on the same reasoning: the
measured reference is narration over a ducked bed, not a sound-effects reel, so absent evidence
the default is silence. The heartbeat is the closest call of the group — it is one 4s scoring
bed rather than per-cut furniture — but it is unmeasured, and it was anchored to the last `level`
scene, i.e. to the same chapter-marker scaffolding as the stamp.

sfx.wav is STILL WRITTEN, silent, at full runtime length. Video2.tsx mounts it unconditionally
(<Audio src={staticFile('music/sfx.wav')} volume={0.5} />), so the file has to exist and be the
right length; removing the write would break the render, not quieten it.
sfx_lib.py's synth functions are LEFT IN PLACE and untouched. They are a library, not a policy —
they are deterministic, copyright-clean and cost nothing unused, and the judgement being recorded
here is about PLACEMENT. If a future measurement of the reference justifies one, place it here.

On any error it still writes a valid (silent) sfx.wav and leaves ambient.wav usable so the
render can't break.
"""
import os, json
import numpy as np
import soundfile as sf
# NOTE: sfx_lib is deliberately NOT imported any more — this file no longer places any transient
# SFX (see the docstring). sfx_lib.py itself is kept: it still owns the AMBIENCE BEDS that
# make_ambient.py builds the music from.

ROOT = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.path.join(ROOT, "public", "music")
AMB = os.path.join(MUSIC, "ambient.wav")
SFX = os.path.join(MUSIC, "sfx.wav")

# Ducking depth is measured, not guessed: docs/CRAYON_BIBLE.md §8 gives duck-under-VO of 15.1 / 8.2 /
# 13.7 dB across the three windows that carry a bed — an 8–15 dB band, mid ≈ 11.5 dB. The old 0.42
# (-7.5 dB) sat shallower than every measured window.
DUCK_FLOOR = 0.27       # music multiplier under VO (-11.4 dB — middle of the measured 8–15 dB band)
# SFX_DIP is GONE with the level stamps it existed to make room for (see the module docstring): it
# dipped the bed an extra ~4.4 dB around every LEVEL cut purely so a stamp could punch through. With
# no stamp, that dip was a 0.3s hole in the music with nothing in it.
SILENCE_S = 1.3         # pre-reversal silence window length
SILENCE_FLOOR = 0.06    # music level during the silence beat
SILENCE_EDGE_S = 0.06   # fade in/out of the silence beat (it now drops from a FULL bed — no click)

# SIDECHAIN — the duck is triggered by the VO WAVEFORM, not by scene rectangles. Measured on the
# sample episode: one rectangle per scene covers 97.3% of the runtime (there are only 38 inter-scene
# gaps, 22.0s in total), so the bed sat at the floor CONTINUOUSLY — the recovered gain envelope showed
# 0.00 dB between VO and gaps and the bed's RMS histogram was unimodal. The reference's audible
# breathing lives in the INTER-SENTENCE gaps INSIDE each VO wav (median 0.33s, ~25% of VO time), which
# a per-scene rectangle cannot see. The old SMOOTH_S=0.18 symmetric boxcar made it worse: a low-pass
# smears both edges equally, so even a real gap never got back to full bed.
VO_HOP_S = 0.010        # sidechain detector hop (also the envelope's block grid)
VO_GATE_DB = -30.0      # speech gate, relative to that VO file's own p95 block level
DUCK_ATTACK_S = 0.04    # bed dips this fast into a word
DUCK_RELEASE_S = 0.07   # ...and climbs back this fast out of one (reference gaps are 0.18–1.0s)
DUCK_LOOKAHEAD_S = 0.04 # start the dip early so the floor is reached BY the first syllable
DUCK_HOLD_S = 0.05      # hold the duck past a word so the bed can't flap inside a sentence

# DRY PASSAGES — the reference's 240s window has a -75.2 dB gap floor: the bed is genuinely absent,
# not merely low. Silence is used as a STRUCTURAL device (whole passages), not just one pre-midpoint
# beat, so entire scenes are run music-free at intervals through the body of the episode.
DRY_FLOOR = 2e-4        # ~ -74 dB: true silence, matching the measured music-free window
DRY_FADE_S = 0.35       # fade the bed out/in at the edges of a dry passage (no click, reads deliberate)
DRY_TARGETS = (0.24, 0.64)   # fractions of runtime to aim a dry passage at (240/993s in the reference)
DRY_EVERY_MIN = 6.0     # one dry passage per ~6 min of runtime, capped by len(DRY_TARGETS)
# LENGTH of a music-free passage, in SECONDS — the thing that must stay constant when the edit changes.
# A passage used to be "one scene", which is a length only by accident: at the WO-13 granularity
# (21.1s mean scene) two passages came to 54s = 6.3% of runtime and measured CLOSE against the
# reference, and the WO-22 re-cut (4.95s mean scene) silently took the same two passages to 8.6s =
# 0.9% without anything in this file changing. 22s x 2 restores the WO-13 share at the new granularity.
DRY_LEN_S = 22.0


# (_seeded_rng was removed with the transient SFX — it existed only to give the whoosh/riser/stamp
#  synths a per-topic deterministic seed. Nothing in this file is random any more.)


def _pick_dry(scenes, total_f, fps, mid_i, level_idx):
    """SPANS of consecutive scenes to run MUSIC-FREE, each about DRY_LEN_S long.

    Returns (first_index, last_index) pairs, inclusive. Skips the cold open (it needs its bed), every
    LEVEL cut and the midpoint silence-beat pair (no double-dipping), snaps each DRY_TARGETS fraction
    to the nearest surviving scene start, then
    EXTENDS forward over consecutive unblocked scenes until the passage reaches DRY_LEN_S.

    It used to return single scene indices, i.e. a passage was exactly one scene long. That is a
    length only by accident, and the accident broke: silence is a STRUCTURAL device in the reference
    (a whole window measured at -75.2 dB), so a passage has to be specified in seconds. Measured on
    this episode, one-scene passages gave 8.6s of music-free runtime (0.9%) where the 39-scene build
    had given 54s (6.3%) from the very same code.
    """
    runtime = total_f / max(fps, 1)
    want = max(1, min(len(DRY_TARGETS), int(round(runtime / 60.0 / DRY_EVERY_MIN))))
    blocked = {0, len(scenes) - 1, mid_i, mid_i - 1} | set(level_idx)
    spans, used = [], set()
    for frac in DRY_TARGETS[:want]:
        cands = [i for i in range(len(scenes)) if i not in blocked and i not in used]
        if not cands:
            break
        target = frac * runtime
        i0 = min(cands, key=lambda i: abs(scenes[i]["startFrame"] / fps - target))
        i1 = i0
        acc = scenes[i0]["durationInFrames"] / fps
        while (acc < DRY_LEN_S and i1 + 1 < len(scenes)
               and (i1 + 1) not in blocked and (i1 + 1) not in used):
            i1 += 1
            acc += scenes[i1]["durationInFrames"] / fps
        spans.append((i0, i1))
        used |= set(range(i0, i1 + 1))
    return sorted(spans)


def _speech_flags(path):
    """Per-VO_HOP_S speech-presence flags for one VO wav. edge-tts silence sits near -90 dB and
    speech near -23 dB, so a gate relative to the file's own loud level separates them cleanly."""
    x, vsr = sf.read(path, dtype="float32", always_2d=True)
    x = x.mean(axis=1)
    h = max(1, int(VO_HOP_S * vsr)); m = len(x) // h
    if m < 1:
        return np.zeros(0, dtype=bool)
    rms = np.sqrt(np.mean(x[:m * h].reshape(m, h) ** 2, axis=1))
    db = 20 * np.log10(np.maximum(rms, 1e-9))
    return db > np.percentile(db, 95) + VO_GATE_DB


def _slew(target, hop_s, attack_s, release_s):
    """Attack/release limiter on the block-rate gain target — a real sidechain envelope (fast down
    into a word, quick back up out of it), NOT a symmetric low-pass. Rates are full-scale-per-time,
    so the bed reaches the floor in attack_s and returns to full in release_s."""
    down = 1.0 / max(attack_s / hop_s, 1.0)
    up = 1.0 / max(release_s / hop_s, 1.0)
    out = np.empty_like(target)
    cur = float(target[0])
    for i in range(len(target)):
        t = float(target[i])
        if t < cur:
            cur = max(t, cur - down)
        elif t > cur:
            cur = min(t, cur + up)
        out[i] = cur
    return out


def _to_samples(blocks, step, n):
    """Block-rate envelope -> sample rate by linear interpolation (a plain hold would step 10ms
    stairs into the bed and click)."""
    cur = np.repeat(blocks, step)
    nxt = np.repeat(np.concatenate([blocks[1:], blocks[-1:]]), step)
    if len(cur) < n:
        pad = np.full(n - len(cur), blocks[-1], dtype=np.float32)
        cur = np.concatenate([cur, pad]); nxt = np.concatenate([nxt, pad])
    cur = cur[:n]; nxt = nxt[:n]
    ramp = np.tile((np.arange(step, dtype=np.float32) / step), len(blocks))
    ramp = ramp[:n] if len(ramp) >= n else np.concatenate([ramp, np.zeros(n - len(ramp), np.float32)])
    nxt -= cur; nxt *= ramp; cur += nxt
    return cur.astype(np.float32)


def _add(buf, x, start):
    a = max(0, start); b = min(len(buf), start + len(x))
    if b > a:
        buf[a:b] += x[(a - start):(b - start)]


def main():
    tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
    fps = tl["fps"]
    scenes = tl["scenes"]
    total_f = tl.get("totalFrames", 0)

    try:
        amb, sr = sf.read(AMB, dtype="float32", always_2d=True)
        N = amb.shape[0]
    except Exception as e:
        print("  duck_music: no readable ambient.wav (", e, ") — writing silent sfx only")
        amb, sr, N = None, 44100, int((total_f / max(fps, 1) + 2) * 44100)

    # VO window helper (real wav length; falls back to scene frames)
    def vo_window(s):
        ap = os.path.join(ROOT, "public", s["audio"]) if not s["audio"].startswith("/") else s["audio"]
        try:
            vlen = sf.info(ap).frames / sf.info(ap).samplerate
        except Exception:
            vlen = s["durationInFrames"] / fps
        start_s = (s["startFrame"] + s.get("audioStartFrame", 0)) / fps
        return start_s, vlen

    # midpoint reversal scene: the writer's explicit gap= is authoritative (a big gap on a scene
    # means "put the silence beat right after this one," per Phase 3 staging) — only fall back to
    # "VO start nearest 50% of runtime" when no scene sets a gap that large. Without this, a wide
    # gap the writer placed anywhere but exactly at the runtime midpoint got silently ignored by
    # the 50%-nearest heuristic (confirmed recurring — see ops/improvements.json).
    SILENCE_GAP_THRESHOLD = 1.4
    gap_i = next((i for i, s in enumerate(scenes) if s.get("gap", 0) >= SILENCE_GAP_THRESHOLD), None)
    if gap_i is not None and gap_i + 1 < len(scenes):
        mid_i = gap_i + 1
    else:
        mid_target = 0.5 * total_f / fps
        mid_i = min(range(len(scenes)), key=lambda i: abs(vo_window(scenes[i])[0] - mid_target)) if scenes else -1
    # chapter-turn scenes. Only _pick_dry uses these now (the climax heartbeat that was the other
    # consumer is gone) — a dry passage is not allowed to swallow a chapter turn.
    level_idx = [i for i, s in enumerate(scenes) if s.get("level")]

    # 1) DUCK ENVELOPE ---------------------------------------------------------------------
    gain = None
    if amb is not None:
        step = max(1, int(round(VO_HOP_S * sr)))
        nb = N // step + 1
        speech = np.zeros(nb, dtype=bool)
        for s in scenes:
            ap = os.path.join(ROOT, "public", s["audio"]) if not s["audio"].startswith("/") else s["audio"]
            try:
                on = _speech_flags(ap)
            except Exception as e:
                # unreadable VO: duck the whole scene rather than leave narration un-covered, and SAY so
                print(f"  duck_music: WARNING unreadable VO {s['audio']} ({e}) — ducking {s['id']} whole")
                start_s, vlen = vo_window(s)
                a = max(0, int(start_s / VO_HOP_S)); b = min(nb, int((start_s + vlen) / VO_HOP_S))
                speech[a:b] = True
                continue
            o = int(round((s["startFrame"] + s.get("audioStartFrame", 0)) / fps / VO_HOP_S))
            a = max(0, o); b = min(nb, o + len(on))
            if b > a:
                speech[a:b] |= on[a - o:b - o]
        # lookahead + hold: block i ducks if there is speech in [i - hold, i + lookahead]
        kl = int(DUCK_LOOKAHEAD_S / VO_HOP_S); kh = int(DUCK_HOLD_S / VO_HOP_S)
        if kl or kh:
            wide = np.convolve(speech.astype(np.float32), np.ones(kl + kh + 1, dtype=np.float32), mode="full")
            speech = wide[kl:kl + nb] > 0
        target = np.where(speech, DUCK_FLOOR, 1.0).astype(np.float32)
        # (the extra dip around every LEVEL cut is gone with the stamp it was making room for)
        gain = _to_samples(_slew(target, VO_HOP_S, DUCK_ATTACK_S, DUCK_RELEASE_S), step, N)
        edges = np.diff(np.concatenate([[1], speech.astype(np.int8)]))
        opens = int(np.sum(edges < 0))                                       # speech -> gap edges
        print(f"  duck_music: sidechain — bed ducked over {100 * speech.mean():.0f}% of the runtime, "
              f"returning to full bed in {opens} inter-sentence/scene gaps")

    # 2) SFX LAYER — intentionally EMPTY. See the module docstring: every transient this file used
    # to place (per-cut whoosh, level riser/stamp/thud, overlay pop, cold-open thud, climax
    # heartbeat) was retired doodle-era vocabulary with no measurement behind it, and the per-cut
    # whoosh was the sound the owner asked to have removed. The buffer is still allocated and still
    # written, at full length, because Video2.tsx mounts music/sfx.wav unconditionally.
    sfx = np.zeros(N, dtype=np.float32)

    # 3) SILENCE BEAT — make the true GAP before the midpoint reversal line fall silent -----
    # (the real dead-air is between the previous scene's VO end and this line's VO start; the
    #  writer sets a big `gap` on the pre-reversal scene for full drama — Phase 3.)
    if gain is not None and 0 < mid_i < len(scenes):
        mid_start, _ = vo_window(scenes[mid_i])
        prev_start, prev_len = vo_window(scenes[mid_i - 1])
        gap_start = prev_start + prev_len                                     # prev VO ends
        b = int(mid_start * sr); a = max(0, int(gap_start * sr) - int(0.1 * sr))
        # cap the fade to SILENCE_S so a huge gap doesn't kill too much music
        a = max(a, b - int(SILENCE_S * sr))
        if b - a > int(0.12 * sr):
            # the sidechain leaves the bed at FULL in this gap, so ramp into/out of the beat
            seg = np.full(b - a, SILENCE_FLOOR, dtype=np.float32)
            e = min(int(SILENCE_EDGE_S * sr), (b - a) // 3)
            seg[:e] = np.linspace(1.0, SILENCE_FLOOR, e)
            seg[-e:] = np.linspace(SILENCE_FLOOR, 1.0, e)
            gain[a:b] = np.minimum(gain[a:b], seg)                            # music -> near silence
            sfx[a:b] *= np.linspace(1.0, 0.0, b - a).astype(np.float32)       # kill SFX into silence
            print(f"  duck_music: silence beat {(b-a)/sr:.2f}s in the gap before {scenes[mid_i]['id']} "
                  f"(writer can widen with gap= for more drama)")

    # 5) DRY PASSAGES — whole scenes with NO music bed at all (structural silence) ----------
    if gain is not None and scenes:
        dry = _pick_dry(scenes, total_f, fps, mid_i, level_idx)
        f = int(DRY_FADE_S * sr)
        spans = []
        for i0, i1 in dry:
            a = int(scenes[i0]["startFrame"] / fps * sr)
            b = min(N, int((scenes[i1]["startFrame"] + scenes[i1]["durationInFrames"]) / fps * sr))
            if b - a <= 2 * f:
                continue
            seg = np.full(b - a, DRY_FLOOR, dtype=np.float32)
            seg[:f] = np.linspace(1.0, DRY_FLOOR, f)                  # np.minimum below keeps the duck
            seg[-f:] = np.linspace(DRY_FLOOR, 1.0, f)                 # bed returns on the next cut
            gain[a:b] = np.minimum(gain[a:b], seg)
            spans.append(f"{scenes[i0]['id']}-{scenes[i1]['id']} {(b-a)/sr:.1f}s")
        if spans:
            print(f"  duck_music: {len(spans)} dry (music-free) passage(s) — {', '.join(spans)} — "
                  f"bed at {20*np.log10(DRY_FLOOR):.0f} dB")

    # apply duck + write
    if amb is not None:
        amb *= gain[:, None]
        sf.write(AMB, amb.astype(np.float32), sr)
        print(f"  duck_music: duck applied across {len(scenes)} scenes (floor {DUCK_FLOOR})")
    sfx = np.tanh(sfx * 1.15).astype(np.float32)                          # safety limiter
    sf.write(SFX, sfx, sr)
    print(f"  duck_music: sfx.wav — SILENT by design, no transient SFX placed "
          f"(peak {float(np.max(np.abs(sfx))):.3f}; {len(sfx)/sr:.0f}s @ {sr}Hz)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print("  duck_music: non-fatal error —", e)
        try:
            tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
            N = int((tl.get("totalFrames", 0) / max(tl["fps"], 1) + 2) * 44100)
            sf.write(SFX, np.zeros(max(N, 44100), dtype=np.float32), 44100)
            print("  duck_music: wrote silent sfx.wav fallback")
        except Exception as e2:
            print("  duck_music: could not write fallback sfx.wav —", e2)
