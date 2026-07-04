#!/usr/bin/env python3
"""Procedural sound-design library (NEXT_LEVEL_PLAN Phase 2 / Sound 2.0).

100% numpy — no sample files, no downloads, no licensing, deterministic, and identical on the
cloud render shards. Two families:

  TRANSIENT SFX  — short one-shots placed on cuts/reveals by duck_music.py:
     whoosh, thud, stamp (level-card brand sound), riser, pop, coin, heartbeat.
  AMBIENCE BEDS  — long looping diegetic textures mixed WAY under the voice by make_ambient.py
     (kills the 'TTS floating in a digital void' tell): rain, roomhum, casino, cellblock,
     street, wind, crowd, night.

Everything returns mono float32. Transients are peak-normalised; beds are RMS-levelled low.
Pass a numpy Generator (rng) for reproducibility. Nothing here can raise on normal input.
"""
import numpy as np

try:
    from scipy.signal import lfilter
    _HAVE_SCIPY = True
except Exception:
    _HAVE_SCIPY = False


# ---------- helpers ----------
def _norm(x, peak=0.9):
    m = float(np.max(np.abs(x))) if len(x) else 0.0
    return (x / m * peak).astype(np.float32) if m > 1e-9 else np.asarray(x, np.float32)


def _lp(x, cutoff_norm):
    """One-pole low-pass; cutoff_norm in (0,1] ~ b coefficient. Vectorised (scipy) w/ py fallback."""
    b = float(np.clip(cutoff_norm, 1e-5, 0.999))
    if _HAVE_SCIPY:
        return lfilter([b], [1.0, -(1.0 - b)], x).astype(np.float32)
    y = np.empty_like(x, dtype=np.float32); acc = 0.0
    for i in range(len(x)):
        acc += b * (x[i] - acc); y[i] = acc
    return y


def _hp(x, cutoff_norm):
    """Crude high-pass = signal minus its low-passed version."""
    return (x - _lp(x, cutoff_norm)).astype(np.float32)


def _smooth(x, k):
    k = max(1, int(k))
    if k <= 1:
        return x.astype(np.float32)
    return np.convolve(x, np.ones(k) / k, mode="same").astype(np.float32)


# ---------- transient SFX ----------
def whoosh(sr, dur=0.40, rng=None, direction="in"):
    """Air rushing toward a cut: band-limited noise swept by a moving low-pass + faint pitch fall.
    direction 'in' peaks at the end (into the cut); 'out' decays from the start."""
    rng = rng or np.random.default_rng(0)
    n = int(sr * dur); t = np.linspace(0, 1, n, endpoint=False)
    noise = rng.standard_normal(n).astype(np.float32)
    noise = _smooth(noise, sr * 0.0011)                       # soften to 'air' not hiss
    # a moving band: multiply the noise envelope by a resonant-ish sweep (approx via 2 lp stages)
    body = _lp(noise, 0.02 + 0.06 * t.mean())                 # cheap tone shaping
    env = (t ** 2.3) if direction == "in" else ((1 - t) ** 2.3)
    env = env * np.clip((1 - t) * 6.0, 0, 1) if direction == "in" else env
    whisper = np.sin(2 * np.pi * (1200 - 750 * t) * t)        # downward doppler whisper under the air
    return _norm(body * env + 0.14 * whisper * env, 0.55)


def thud(sr, dur=0.55, rng=None, weight=1.0):
    """Body impact: pitched sine drop (78->40 Hz) + attack click + short woody mid. Synced to hit-stop."""
    n = int(sr * dur); t = np.linspace(0, dur, n, endpoint=False)
    f = (78 * np.exp(-3.0 * t) + 40) * (0.85 + 0.3 * weight)
    body = np.sin(2 * np.pi * np.cumsum(f) / sr)
    env = np.exp(-6.0 * t)
    click = np.exp(-800 * t) * 0.55                            # transient snap
    wood = np.sin(2 * np.pi * 190 * t) * np.exp(-24 * t) * 0.25
    return _norm(body * env + click + wood, 0.95)


def stamp(sr, dur=0.34, rng=None):
    """Level-card brand sound: a crisp 'cha-chunk' — noise transient + mid thock + tiny metal tail.
    This is the channel's signature 'a rank just locked in' sound; keep it consistent."""
    rng = rng or np.random.default_rng(7)
    n = int(sr * dur); t = np.linspace(0, dur, n, endpoint=False)
    burst = _hp(rng.standard_normal(n).astype(np.float32), 0.25) * np.exp(-55 * t) * 0.7
    thock = np.sin(2 * np.pi * 240 * t) * np.exp(-30 * t)
    ring = np.sin(2 * np.pi * 1600 * t) * np.exp(-40 * t) * 0.18
    sub = np.sin(2 * np.pi * (150 * np.exp(-8 * t) + 55) * t) * np.exp(-9 * t) * 0.5
    return _norm(burst + thock + ring + sub, 0.92)


def riser(sr, dur=0.9, rng=None):
    """Tension swell INTO a cut: rising filtered noise + rising tone."""
    rng = rng or np.random.default_rng(1)
    n = int(sr * dur); t = np.linspace(0, 1, n, endpoint=False)
    noise = _smooth(rng.standard_normal(n).astype(np.float32), sr * 0.0009)
    tone = np.sin(2 * np.pi * (220 + 1100 * t ** 2) * t)
    env = t ** 1.8
    return _norm(noise * 0.5 * env + tone * env, 0.7)


def pop(sr, dur=0.14, rng=None):
    """Soft UI foley for an overlay/number pop-in: quick sine blip + micro click."""
    n = int(sr * dur); t = np.linspace(0, dur, n, endpoint=False)
    f = 640 * np.exp(-11 * t) + 240
    blip = np.sin(2 * np.pi * np.cumsum(f) / sr) * np.exp(-16 * t)
    click = np.exp(-900 * t) * 0.3
    return _norm(blip + click, 0.5)


def coin(sr, dur=0.20, rng=None):
    """Bright metallic tick for money — two close inharmonic partials, fast decay."""
    n = int(sr * dur); t = np.linspace(0, dur, n, endpoint=False)
    s = (np.sin(2 * np.pi * 2400 * t) + 0.6 * np.sin(2 * np.pi * 3300 * t)) * np.exp(-30 * t)
    return _norm(s, 0.4)


def heartbeat(sr, dur=2.0, bpm=64, rng=None):
    """Lub-dub heartbeat bed for the climax ONLY. Returns `dur` seconds of soft sub thumps."""
    n = int(sr * dur); out = np.zeros(n, dtype=np.float32)
    beat = int(sr * 60.0 / max(bpm, 30))
    one = int(sr * 0.14)
    te = np.linspace(0, 0.14, one, endpoint=False)
    lub = np.sin(2 * np.pi * 50 * te) * np.exp(-22 * te)
    dub = np.sin(2 * np.pi * 44 * te) * np.exp(-26 * te) * 0.7
    for start in range(0, n - beat, beat):
        a = start
        if a + one < n:
            out[a:a + one] += lub
        b = start + int(0.22 * sr)
        if b + one < n:
            out[b:b + one] += dub
    return _norm(out, 0.85)


# ---------- ambience beds (long, loopable, mixed very low) ----------
def _bed_env(n, sr):
    """Gentle 1s fade in/out so a bed can be dropped into a window without clicks."""
    e = np.ones(n, dtype=np.float32); f = min(int(sr * 1.0), n // 2)
    if f > 1:
        e[:f] = np.linspace(0, 1, f); e[-f:] = np.linspace(1, 0, f)
    return e


def rain(sr, dur, rng):
    n = int(sr * dur)
    base = _lp(rng.standard_normal(n).astype(np.float32), 0.06) * 0.5      # steady hiss-rain
    drips = np.zeros(n, dtype=np.float32)
    for _ in range(int(dur * 2.2)):                                        # sparse fat drops
        p = int(rng.uniform(0, max(1, n - sr)))
        le = int(sr * rng.uniform(0.04, 0.10)); te = np.linspace(0, 1, le, endpoint=False)
        drips[p:p + le] += (np.sin(2 * np.pi * rng.uniform(900, 1800) * te) * np.exp(-30 * te)) * 0.4
    return _norm((base + drips) * _bed_env(n, sr), 0.6)


def roomhum(sr, dur, rng):
    n = int(sr * dur); t = np.arange(n) / sr
    hum = (np.sin(2 * np.pi * 60 * t) + 0.4 * np.sin(2 * np.pi * 120 * t)) * 0.12
    air = _lp(rng.standard_normal(n).astype(np.float32), 0.015) * 0.25
    return _norm((hum + air) * _bed_env(n, sr), 0.5)


def casino(sr, dur, rng):
    n = int(sr * dur)
    murmur = _lp(rng.standard_normal(n).astype(np.float32), 0.03) * 0.35   # crowd murmur
    murmur *= (0.7 + 0.3 * np.sin(2 * np.pi * np.arange(n) / (sr * 6.0)))
    dings = np.zeros(n, dtype=np.float32)
    for _ in range(int(dur * 0.7)):
        p = int(rng.uniform(0, max(1, n - sr))); le = int(sr * 0.25); te = np.linspace(0, 1, le, endpoint=False)
        dings[p:p + le] += (np.sin(2 * np.pi * rng.uniform(1600, 2600) * te) * np.exp(-14 * te)) * 0.2
    return _norm((murmur + dings) * _bed_env(n, sr), 0.55)


def cellblock(sr, dur, rng):
    n = int(sr * dur)
    rumble = _lp(rng.standard_normal(n).astype(np.float32), 0.008) * 0.4   # low concrete rumble
    drips = np.zeros(n, dtype=np.float32)
    for _ in range(int(dur * 0.8)):                                        # reverberant drips
        p = int(rng.uniform(0, max(1, n - sr))); le = int(sr * 0.5); te = np.linspace(0, 1, le, endpoint=False)
        d = np.sin(2 * np.pi * rng.uniform(700, 1300) * te) * np.exp(-8 * te)
        drips[p:p + le] += d * 0.3
    return _norm((rumble + drips) * _bed_env(n, sr), 0.5)


def street(sr, dur, rng):
    n = int(sr * dur)
    traffic = _lp(rng.standard_normal(n).astype(np.float32), 0.012) * 0.4
    passes = np.zeros(n, dtype=np.float32)
    for _ in range(int(dur * 0.5)):                                        # cars passing (swell)
        p = int(rng.uniform(0, max(1, n - 2 * sr))); le = int(sr * rng.uniform(1.0, 2.0))
        te = np.linspace(0, 1, le, endpoint=False)
        swell = np.sin(np.pi * te) * _lp(rng.standard_normal(le).astype(np.float32), 0.05)
        passes[p:p + le] += swell * 0.5
    return _norm((traffic + passes) * _bed_env(n, sr), 0.55)


def wind(sr, dur, rng):
    n = int(sr * dur)
    w = _lp(rng.standard_normal(n).astype(np.float32), 0.02)
    lfo = 0.5 + 0.5 * np.sin(2 * np.pi * np.arange(n) / (sr * 9.0))
    return _norm(w * lfo * 0.5 * _bed_env(n, sr), 0.55)


def crowd(sr, dur, rng):
    n = int(sr * dur)
    m = _lp(rng.standard_normal(n).astype(np.float32), 0.04) * 0.4
    m *= (0.6 + 0.4 * np.sin(2 * np.pi * np.arange(n) / (sr * 4.0)))
    return _norm(m * _bed_env(n, sr), 0.5)


def night(sr, dur, rng):
    n = int(sr * dur)
    air = _lp(rng.standard_normal(n).astype(np.float32), 0.01) * 0.3
    crickets = np.zeros(n, dtype=np.float32)
    for _ in range(int(dur * 3)):
        p = int(rng.uniform(0, max(1, n - sr))); le = int(sr * 0.08); te = np.linspace(0, 1, le, endpoint=False)
        crickets[p:p + le] += (np.sin(2 * np.pi * 4200 * te) * np.exp(-40 * te)) * 0.12
    return _norm((air + crickets) * _bed_env(n, sr), 0.45)


# palette used by make_ambient to assign a distinct diegetic bed per level
BEDS = {
    "rain": rain, "roomhum": roomhum, "casino": casino, "cellblock": cellblock,
    "street": street, "wind": wind, "crowd": crowd, "night": night,
}
BED_ORDER = ["roomhum", "street", "rain", "crowd", "casino", "night", "wind", "cellblock"]

# rough keyword -> bed hints so a template can pick a fitting ambience when obvious
BED_HINTS = [
    (("street", "walk", "alley", "car", "revolv"), "street"),
    (("jet", "sky", "tower", "window", "roof"), "wind"),
    (("board", "office", "desk", "laptop", "notes", "atrium", "lobby"), "roomhum"),
    (("dinner", "party", "gala", "club", "casino", "atrium"), "casino"),
    (("war", "globe", "situation", "bunker"), "roomhum"),
    (("cell", "prison", "vault", "empty"), "cellblock"),
    (("rain", "storm", "night"), "rain"),
]


def bed_for(template, idx):
    """Pick a diegetic bed name for a level: keyword hint if any, else deterministic rotation."""
    tl = (template or "").lower()
    for keys, name in BED_HINTS:
        if any(k in tl for k in keys):
            return name
    return BED_ORDER[idx % len(BED_ORDER)]
