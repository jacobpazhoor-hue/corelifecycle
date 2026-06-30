#!/usr/bin/env python3
"""Phase-2 audio polish (QUALITY_MAX_PLAN §2.5). Runs in build.py AFTER gen_voice + make_ambient.
Two render-safe, 100%-free, copyright-clean (all-numpy) upgrades:

  1. SIDECHAIN DUCK — dip public/music/ambient.wav under the narration so the VO is always clear
     (the #1 'amateur vs pro' tell). The duck envelope is built from the real VO windows in
     src/timeline.json + the per-scene VO wav lengths, smoothed for natural attack/release.

  2. SFX LAYER — synthesize tasteful transient SFX into public/music/sfx.wav (mono, full length):
     a soft WHOOSH rushing INTO every scene cut, and a BOOM + RISER on each level-start cut
     (trailer grammar: the sound 'hit' on the cut resets viewer attention). Video2 plays this as a
     separate Audio layer so the booms punch. These are SHORT transients at cuts — NOT a constant
     noise bed (which earlier read as static) — so they add production value without hiss.

Never hard-fails the build: on any error it still guarantees a valid (silent) sfx.wav so the
render can't break, and leaves ambient.wav untouched. Pure numpy/scipy/soundfile.
"""
import os, json, hashlib
import numpy as np
import soundfile as sf

ROOT = os.path.dirname(os.path.abspath(__file__))
MUSIC = os.path.join(ROOT, "public", "music")
AMB = os.path.join(MUSIC, "ambient.wav")
SFX = os.path.join(MUSIC, "sfx.wav")

DUCK_FLOOR = 0.42      # music multiplier while VO plays (0.42 => ~ -7.5 dB under speech)
SMOOTH_S = 0.18        # attack/release smoothing of the duck envelope (seconds)


def _seeded_rng(salt):
    topic = ""
    try:
        topic = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json"))).get("topic", "")
    except Exception:
        pass
    seed = int(hashlib.md5((topic + "|" + salt).encode()).hexdigest(), 16) % (2**32)
    return np.random.default_rng(seed)


def _norm(x, peak=0.9):
    m = float(np.max(np.abs(x))) if len(x) else 0.0
    return (x / m * peak).astype(np.float32) if m > 1e-9 else x.astype(np.float32)


# ---- transient SFX synths (all numpy; short, tasteful) ----
def whoosh(sr, dur=0.42, rng=None):
    rng = rng or np.random.default_rng(0)
    n = int(sr * dur); t = np.linspace(0, 1, n, endpoint=False)
    noise = rng.standard_normal(n).astype(np.float32)
    # soft band: smooth the noise (low-pass) so it's air, not hiss
    k = max(2, int(sr * 0.0012)); noise = np.convolve(noise, np.ones(k) / k, mode="same")
    env = (t ** 2.2) * np.clip((1 - t) * 6.0, 0, 1)          # rush in, hard stop at the cut
    sweep = np.sin(2 * np.pi * (1100 - 700 * t) * t / 1.0)    # faint downward whisper under the air
    return _norm(noise * env + 0.15 * sweep * env, 0.55)


def boom(sr, dur=0.75, rng=None):
    n = int(sr * dur); t = np.linspace(0, dur, n, endpoint=False)
    f = 78 * np.exp(-2.6 * t) + 42                             # 78Hz -> 42Hz drop
    body = np.sin(2 * np.pi * np.cumsum(f) / sr)
    env = np.exp(-5.5 * t)
    click = np.exp(-700 * t) * 0.5                             # transient attack
    return _norm(body * env + click, 0.95)


def riser(sr, dur=0.9, rng=None):
    rng = rng or np.random.default_rng(1)
    n = int(sr * dur); t = np.linspace(0, 1, n, endpoint=False)
    noise = rng.standard_normal(n).astype(np.float32)
    k = max(2, int(sr * 0.0009)); noise = np.convolve(noise, np.ones(k) / k, mode="same")
    tone = np.sin(2 * np.pi * (220 + 1100 * t ** 2) * t / 1.0)  # rising pitch into the cut
    env = t ** 1.8                                              # swells into the cut
    return _norm(noise * 0.5 * env + tone * env, 0.7)


def _add(buf, x, start):
    a = max(0, start); b = min(len(buf), start + len(x))
    if b > a:
        buf[a:b] += x[(a - start):(b - start)]


def main():
    tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
    fps = tl["fps"]
    scenes = tl["scenes"]

    # establish length/sr/channels from the existing ambient bed
    try:
        amb, sr = sf.read(AMB, dtype="float32", always_2d=True)
        N = amb.shape[0]
    except Exception as e:
        print("  duck_music: no readable ambient.wav (", e, ") — writing silent sfx only")
        amb, sr, N = None, 44100, int((tl.get("totalFrames", 0) / max(fps, 1) + 2) * 44100)

    # 1) DUCK ENVELOPE from real VO windows -------------------------------------------------
    if amb is not None:
        gain = np.ones(N, dtype=np.float32)
        ducked = 0
        for s in scenes:
            ap = os.path.join(ROOT, "public", s["audio"]) if not s["audio"].startswith("/") else s["audio"]
            try:
                vo_len_s = sf.info(ap).frames / sf.info(ap).samplerate
            except Exception:
                vo_len_s = s["durationInFrames"] / fps
            start_s = (s["startFrame"] + s.get("audioStartFrame", 0)) / fps
            a = int(start_s * sr); b = min(N, int((start_s + vo_len_s) * sr))
            if b > a:
                gain[a:b] = DUCK_FLOOR; ducked += 1
        # smooth for natural attack/release (symmetric moving average)
        try:
            from scipy.ndimage import uniform_filter1d
            gain = uniform_filter1d(gain, size=max(3, int(SMOOTH_S * sr)), mode="nearest")
        except Exception:
            k = max(3, int(SMOOTH_S * sr)); gain = np.convolve(gain, np.ones(k) / k, mode="same").astype(np.float32)
        amb *= gain[:, None]
        sf.write(AMB, amb.astype(np.float32), sr)
        print(f"  duck_music: ducked ambient under {ducked} VO windows (floor {DUCK_FLOOR}, smooth {SMOOTH_S}s)")

    # 2) SFX LAYER -------------------------------------------------------------------------
    sfx = np.zeros(N, dtype=np.float32)
    rng = _seeded_rng("sfx")
    w = whoosh(sr, rng=rng); b_ = boom(sr, rng=rng); r = riser(sr, rng=rng)
    n_wh = n_lv = 0
    for i, s in enumerate(scenes):
        cut = int(s["startFrame"] / fps * sr)
        is_level = bool(s.get("level"))
        if i == 0:
            _add(sfx, b_ * 0.6, cut + int(0.15 * sr))          # soft cold-open punch
            continue
        if is_level:
            _add(sfx, r, cut - len(r)); _add(sfx, b_, cut); n_lv += 1   # riser into + boom on the level cut
        else:
            _add(sfx, w * 0.8, cut - len(w)); n_wh += 1                 # whoosh into a normal cut
    # safety limiter
    sfx = np.tanh(sfx * 1.2).astype(np.float32)
    sf.write(SFX, sfx, sr)
    print(f"  duck_music: wrote sfx.wav ({n_wh} whooshes, {n_lv} level boom+risers, {len(sfx)/sr:.0f}s @ {sr}Hz)")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # never break the build over audio polish; guarantee a valid silent sfx.wav exists
        print("  duck_music: non-fatal error —", e)
        try:
            tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
            N = int((tl.get("totalFrames", 0) / max(tl["fps"], 1) + 2) * 44100)
            sf.write(SFX, np.zeros(max(N, 44100), dtype=np.float32), 44100)
            print("  duck_music: wrote silent sfx.wav fallback")
        except Exception as e2:
            print("  duck_music: could not write fallback sfx.wav —", e2)
