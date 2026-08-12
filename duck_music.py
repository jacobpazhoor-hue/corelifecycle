#!/usr/bin/env python3
"""Sound-design placement engine (NEXT_LEVEL_PLAN Sound 2.2/2.3). Runs in build.py AFTER
gen_voice + make_ambient. Pure numpy/scipy/soundfile; NEVER hard-fails the build.

Does four things to the already-generated bed (public/music/ambient.wav) and a new SFX layer
(public/music/sfx.wav that Video2 plays as a separate Audio track):

  1. SIDECHAIN DUCK — dip the music/ambience under every VO window (built from real VO wav
     lengths in src/timeline.json) so narration is always clear (#1 amateur-vs-pro tell).
  2. SFX PLACEMENT (samples from sfx_lib) — whoosh INTO every normal cut; riser + brand STAMP +
     thud on every LEVEL cut; a soft POP on every number/overlay reveal; a cold-open thud.
  3. SILENCE BEAT — ~1.3s where music+SFX fall to near-silence right before the midpoint
     reversal line, then swell back (silence is the strongest emphasis tool; use once).
  4. CLIMAX HEARTBEAT — a single soft heartbeat bed under the final level's approach.

All synths are in sfx_lib.py (deterministic, copyright-clean). On any error it still writes a
valid (silent) sfx.wav and leaves ambient.wav usable so the render can't break.
"""
import os, json, hashlib
import numpy as np
import soundfile as sf
import sfx_lib as L

ROOT = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.path.join(ROOT, "public", "music")
AMB = os.path.join(MUSIC, "ambient.wav")
SFX = os.path.join(MUSIC, "sfx.wav")

# Ducking depth is measured, not guessed: docs/CRAYON_BIBLE.md §8 gives duck-under-VO of 15.1 / 8.2 /
# 13.7 dB across the three windows that carry a bed — an 8–15 dB band, mid ≈ 11.5 dB. The old 0.42
# (-7.5 dB) sat shallower than every measured window.
DUCK_FLOOR = 0.27       # music multiplier under VO (-11.4 dB — middle of the measured 8–15 dB band)
SFX_DIP = 0.6           # extra music dip under a level SFX hit (~ -4.4 dB) so stamps punch
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


def _seeded_rng(salt):
    topic = ""
    try:
        topic = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json"))).get("topic", "")
    except Exception:
        pass
    seed = int(hashlib.md5((topic + "|" + salt).encode()).hexdigest(), 16) % (2**32)
    return np.random.default_rng(seed)


def _pick_dry(scenes, total_f, fps, mid_i, level_idx):
    """Whole scenes to run MUSIC-FREE. Skips the cold open (it needs its bed), every LEVEL cut (the
    riser/stamp needs music to punch out of) and the midpoint silence-beat pair (no double-dipping),
    then snaps each DRY_TARGETS fraction to the nearest surviving scene start."""
    runtime = total_f / max(fps, 1)
    want = max(1, min(len(DRY_TARGETS), int(round(runtime / 60.0 / DRY_EVERY_MIN))))
    blocked = {0, len(scenes) - 1, mid_i, mid_i - 1} | set(level_idx)
    chosen = []
    for frac in DRY_TARGETS[:want]:
        cands = [i for i in range(len(scenes)) if i not in blocked and i not in chosen]
        if not cands:
            break
        target = frac * runtime
        chosen.append(min(cands, key=lambda i: abs(scenes[i]["startFrame"] / fps - target)))
    return sorted(chosen)


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
    # climax = last level scene (else last scene)
    level_idx = [i for i, s in enumerate(scenes) if s.get("level")]
    climax_i = level_idx[-1] if level_idx else (len(scenes) - 1)

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
        # extra brief dip so level SFX hits punch through the music
        for i in level_idx:
            c = scenes[i]["startFrame"] / fps
            a = max(0, int((c - 0.05) / VO_HOP_S)); b = min(nb, int((c + 0.25) / VO_HOP_S))
            target[a:b] = np.minimum(target[a:b], DUCK_FLOOR * SFX_DIP)
        gain = _to_samples(_slew(target, VO_HOP_S, DUCK_ATTACK_S, DUCK_RELEASE_S), step, N)
        edges = np.diff(np.concatenate([[1], speech.astype(np.int8)]))
        opens = int(np.sum(edges < 0))                                       # speech -> gap edges
        print(f"  duck_music: sidechain — bed ducked over {100 * speech.mean():.0f}% of the runtime, "
              f"returning to full bed in {opens} inter-sentence/scene gaps")

    # 2) SFX LAYER -------------------------------------------------------------------------
    sfx = np.zeros(N, dtype=np.float32)
    rng = _seeded_rng("sfx")
    wh = L.whoosh(sr, rng=rng); rs = L.riser(sr, rng=rng)
    st = L.stamp(sr, rng=rng); th = L.thud(sr, rng=rng); pp = L.pop(sr, rng=rng)
    n_wh = n_lv = n_pop = 0
    for i, s in enumerate(scenes):
        cut = int(s["startFrame"] / fps * sr)
        if i == 0:
            _add(sfx, th * 0.6, cut + int(0.15 * sr))                    # cold-open punch
        elif s.get("level"):
            _add(sfx, rs, cut - len(rs))                                 # riser into the level cut
            _add(sfx, st, cut)                                           # brand STAMP on the cut
            _add(sfx, th * 0.7, cut)                                     # low thud for weight
            n_lv += 1
        else:
            _add(sfx, wh * 0.8, cut - len(wh)); n_wh += 1                # whoosh into a normal cut
        # soft POP when a number/overlay reveals (~0.35s after the scene starts)
        ov = s.get("overlay")
        if ov and (ov.get("big") if isinstance(ov, dict) else False):
            _add(sfx, pp * 0.7, cut + int(0.35 * sr)); n_pop += 1   # soft — it lands over speech

    # 4) CLIMAX HEARTBEAT — one soft heartbeat leading into the final level ----------------
    if 0 <= climax_i < len(scenes):
        c = int(scenes[climax_i]["startFrame"] / fps * sr)
        hb = L.heartbeat(sr, dur=4.0, bpm=66, rng=rng) * 0.5
        _add(sfx, hb, c - len(hb))

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
        for i in dry:
            a = int(scenes[i]["startFrame"] / fps * sr)
            b = min(N, int((scenes[i]["startFrame"] + scenes[i]["durationInFrames"]) / fps * sr))
            if b - a <= 2 * f:
                continue
            seg = np.full(b - a, DRY_FLOOR, dtype=np.float32)
            seg[:f] = np.linspace(1.0, DRY_FLOOR, f)                  # np.minimum below keeps the duck
            seg[-f:] = np.linspace(DRY_FLOOR, 1.0, f)                 # bed returns on the next cut
            gain[a:b] = np.minimum(gain[a:b], seg)
        if dry:
            print(f"  duck_music: {len(dry)} dry (music-free) passage(s) at "
                  f"{[scenes[i]['id'] for i in dry]} — bed at {20*np.log10(DRY_FLOOR):.0f} dB")

    # apply duck + write
    if amb is not None:
        amb *= gain[:, None]
        sf.write(AMB, amb.astype(np.float32), sr)
        print(f"  duck_music: duck applied across {len(scenes)} scenes (floor {DUCK_FLOOR})")
    sfx = np.tanh(sfx * 1.15).astype(np.float32)                          # safety limiter
    sf.write(SFX, sfx, sr)
    print(f"  duck_music: sfx.wav — {n_wh} whooshes, {n_lv} level stamps, {n_pop} pops, "
          f"heartbeat@{scenes[climax_i]['id'] if scenes else '?'} ({len(sfx)/sr:.0f}s @ {sr}Hz)")


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
