#!/usr/bin/env python3
"""Generate an original, copyright-free dark cinematic ambient bed sized to the
video length (from src/timeline.json). Output: public/music/ambient.wav.
Minor-key drone + slow swelling pad + airy noise wash. All numpy.
"""
import os, json, hashlib
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
SR = 44100
dur = tl["totalFrames"] / tl["fps"] + 2.0  # small tail
N = int(SR * dur)
t = np.arange(N) / SR

# Per-topic VARIETY: a deterministic seed from the topic varies the bed so every video sounds
# distinct (different key/breathing/pulse) while staying the same copyright-clean numpy style.
topic = ""
try:
    topic = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json"))).get("topic", "")
except Exception:
    pass
seed = int(hashlib.md5(topic.encode()).hexdigest(), 16) if topic else 0
rng = np.random.default_rng(seed)
ROOTS = [55.0, 49.0, 61.74, 41.2, 65.41, 58.27]  # A1 G1 B1 E1 C2 A#1 — all sit well minor
root = ROOTS[seed % len(ROOTS)]
swell_cycle = 18.0 + (seed % 9)   # 18–26 s breathing
pulse_secs = 5 + (seed % 4)       # 5–8 s tension pulse

def tone(freq, amp, detune=0.0):
    return amp * (np.sin(2*np.pi*freq*t) + 0.5*np.sin(2*np.pi*(freq+detune)*t))

# minor-ish drone on the chosen root: root, fifth, octave, minor third up the octave
mix = (tone(root, 0.30, 0.15)
       + tone(root*1.5, 0.16, 0.12)     # fifth
       + tone(root*2, 0.12, 0.10)       # octave
       + tone(root*2*1.1892, 0.07, 0.08))  # minor third

# slow amplitude swell (breathing)
swell = 0.55 + 0.45 * (0.5 - 0.5*np.cos(2*np.pi*t/swell_cycle))
mix *= swell

# airy high noise wash, slowly filtered by a slow LFO
noise = rng.standard_normal(N).astype(np.float32)
# one-pole low-pass for a soft hiss bed (vectorized via scipy — was a 28M-iter python loop)
from scipy.signal import lfilter
b = 0.0008
filt = lfilter([b], [1.0, -(1.0 - b)], noise).astype(np.float32)
wash = filt * (0.10 + 0.06*np.sin(2*np.pi*t/17.0))
mix = mix + wash

# subtle sub pulse (heartbeat of tension), period varies per topic
pulse = np.zeros(N)
period = int(SR*pulse_secs)
env = np.exp(-np.linspace(0, 6, int(SR*1.2)))
sub = np.sin(2*np.pi*42*np.arange(len(env))/SR) * env * 0.18
for start in range(0, N-len(sub), period):
    pulse[start:start+len(sub)] += sub
mix += pulse

# gentle fade in/out
fade = int(SR*3)
mix[:fade] *= np.linspace(0, 1, fade)
mix[-fade:] *= np.linspace(1, 0, fade)

# normalize quiet (it's a background bed; Remotion will set volume too)
mix = mix / (np.max(np.abs(mix)) + 1e-6) * 0.5
stereo = np.stack([mix, mix], axis=1).astype(np.float32)

out = os.path.join(ROOT, "public", "music")
os.makedirs(out, exist_ok=True)
import soundfile as sf
path = os.path.join(out, "ambient.wav")
sf.write(path, stereo, SR)
print(f"wrote {path}  ({dur:.1f}s)  topic='{topic}' root={root:.1f}Hz swell={swell_cycle:.0f}s pulse={pulse_secs}s")
