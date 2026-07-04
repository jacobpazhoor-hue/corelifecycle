#!/usr/bin/env python3
"""Original, copyright-free cinematic score + diegetic ambience for the episode
(NEXT_LEVEL_PLAN Sound 2.3). Output: public/music/ambient.wav. All numpy.

Upgrades over the single-loop bed:
  * THREE ACTS with different key + tempo, crossfaded at the act breaks (setup / escalation+
    midpoint / climax) — 'the music changed' is a real retention lever at act boundaries.
  * PER-LEVEL DIEGETIC BEDS (rain / office hum / casino / cell block / street / wind / crowd /
    night), each mixed WAY under the voice, so the narration is never 'floating in a digital
    void' (the #1 TTS tell). Beds are chosen per level by template keyword, else rotated.
Deterministic per topic (same seed -> same score). duck_music.py runs AFTER this to duck the
whole bed under the VO, carve the pre-reversal silence beat, and add the transient SFX layer.
"""
import os, json, hashlib
import numpy as np
import soundfile as sf
import sfx_lib as L

ROOT = os.path.dirname(os.path.abspath(__file__))
SR = 44100

tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
FPS = tl["fps"]
scenes = tl["scenes"]
dur = tl["totalFrames"] / FPS + 2.0
N = int(SR * dur)
t = np.arange(N) / SR

topic = ""
try:
    topic = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json"))).get("topic", "")
except Exception:
    pass
seed = int(hashlib.md5(topic.encode()).hexdigest(), 16) if topic else 0
rng = np.random.default_rng(seed)

ROOTS = [55.0, 49.0, 61.74, 41.2, 65.41, 58.27]   # A1 G1 B1 E1 C2 A#1 — all sit well minor


def render_act(root, swell_cycle, pulse_secs, wash_amp, act_rng):
    """Full-length minor-key bed for one act's PARAMS (masked to its window later)."""
    def tone(freq, amp, detune=0.0):
        return amp * (np.sin(2 * np.pi * freq * t) + 0.5 * np.sin(2 * np.pi * (freq + detune) * t))
    mix = (tone(root, 0.30, 0.15) + tone(root * 1.5, 0.16, 0.12)
           + tone(root * 2, 0.12, 0.10) + tone(root * 2 * 1.1892, 0.07, 0.08))   # root/5th/8ve/m3
    mix *= 0.55 + 0.45 * (0.5 - 0.5 * np.cos(2 * np.pi * t / swell_cycle))        # breathing swell
    from scipy.signal import lfilter
    b = 0.0008
    wash = lfilter([b], [1.0, -(1.0 - b)], act_rng.standard_normal(N).astype(np.float32))
    mix = mix + wash * (wash_amp + 0.06 * np.sin(2 * np.pi * t / 17.0))
    # tension sub-pulse (tempo)
    period = int(SR * pulse_secs); env = np.exp(-np.linspace(0, 6, int(SR * 1.2)))
    sub = np.sin(2 * np.pi * 42 * np.arange(len(env)) / SR) * env * 0.18
    for s0 in range(0, N - len(sub), period):
        mix[s0:s0 + len(sub)] += sub
    return mix.astype(np.float32)


# ---- 3 acts: setup / escalation / climax, each a different key + faster tempo ----
b1, b2 = int(N * 0.35), int(N * 0.72)                    # act boundaries (samples)
xf = int(SR * 0.9)                                       # crossfade length
acts = [
    dict(root=ROOTS[seed % 6],        swell=22.0, pulse=8, wash=0.11),   # setup: slow, spacious
    dict(root=ROOTS[(seed + 2) % 6],  swell=16.0, pulse=6, wash=0.13),   # escalation: tighter
    dict(root=ROOTS[(seed + 4) % 6],  swell=11.0, pulse=4, wash=0.15),   # climax: urgent
]
segs = [render_act(a["root"], a["swell"], a["pulse"], a["wash"], np.random.default_rng(seed + i))
        for i, a in enumerate(acts)]

# masks that crossfade at the two boundaries and sum to 1 everywhere
def ramp(center, length, rising):
    m = np.zeros(N, dtype=np.float32); h = length // 2
    lo, hi = max(0, center - h), min(N, center + h)
    seg = np.linspace(0, 1, hi - lo) if rising else np.linspace(1, 0, hi - lo)
    m[lo:hi] = seg
    if rising:
        m[hi:] = 1.0
    else:
        m[:lo] = 1.0
    return m

m0 = ramp(b1, xf, rising=False)
m2 = ramp(b2, xf, rising=True)
m1 = np.clip(1.0 - m0 - m2, 0.0, 1.0)
music = (segs[0] * m0 + segs[1] * m1 + segs[2] * m2).astype(np.float32)

# gentle fade in/out
fade = int(SR * 3)
music[:fade] *= np.linspace(0, 1, fade); music[-fade:] *= np.linspace(1, 0, fade)
music = music / (np.max(np.abs(music)) + 1e-6) * 0.5

# ---- per-level diegetic beds (very low, under everything) ----
beds = np.zeros(N, dtype=np.float32)
level_scenes = [(i, s) for i, s in enumerate(scenes) if s.get("level")]
placed = []
for k, (si, s) in enumerate(level_scenes):
    start_s = s["startFrame"] / FPS
    end_frame = level_scenes[k + 1][1]["startFrame"] if k + 1 < len(level_scenes) else tl["totalFrames"]
    win_s = max(1.0, (end_frame - s["startFrame"]) / FPS)
    name = L.bed_for(s.get("template"), k)
    try:
        bed = L.BEDS[name](SR, win_s, np.random.default_rng(seed + 100 + k)) * 0.10
        a = int(start_s * SR); b = min(N, a + len(bed))
        beds[a:b] += bed[:b - a]
        placed.append(name)
    except Exception as e:
        print("  make_ambient: bed skip", name, e)

mix = np.clip(music + beds, -1.0, 1.0).astype(np.float32)
stereo = np.stack([mix, mix], axis=1).astype(np.float32)

out = os.path.join(ROOT, "public", "music"); os.makedirs(out, exist_ok=True)
path = os.path.join(out, "ambient.wav")
sf.write(path, stereo, SR)
print(f"wrote {path} ({dur:.1f}s) topic='{topic}' | 3 acts roots="
      f"{[round(a['root']) for a in acts]} | {len(placed)} level beds: {placed}")
