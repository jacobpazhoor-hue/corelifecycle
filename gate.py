#!/usr/bin/env python3
"""CoreLifecycle pre-publish QUALITY GATE.  exit 0 = PASS (safe to publish), nonzero = HALT.
The autopilot runs this after building/rendering and MUST NOT upload on failure.

Checks: timeline integrity · every scene id maps to a component · every scene has clean 48k
audio (present, right rate, not silent, not clipping) · runtime >= routine.minMinutes ·
(optional) rendered video exists.  Usage: python3 gate.py [out/video.mp4]
"""
import json, os, re, sys
import soundfile as sf
import numpy as np

ROOT = os.path.dirname(os.path.abspath(__file__))
routine = json.load(open(os.path.join(ROOT, "ops", "routine.json")))
MIN_MIN = routine.get("minMinutes", 10)
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
_src = open(os.path.join(ROOT, "src", "scenes.tsx")).read()
_m = re.search(r"export const TEMPLATES[^{]*\{(.*?)\};", _src, re.S)
tmpl_keys = set(re.findall(r"(\w+):\s*S\d", _m.group(1))) if _m else set()
# composable packs are spread into TEMPLATES via ...PACK; collect their keys from stage.tsx
# (template FCs are zero-arg `name: () =>`; backdrops/props are `name: ({frame}) =>`, excluded)
_stage = os.path.join(ROOT, "src", "stage.tsx")
if os.path.exists(_stage):
    tmpl_keys |= set(re.findall(r"(\w+):\s*\(\)\s*=>", open(_stage).read()))
# variety: collect templates in order to flag adjacent repeats
prev_tmpl = None

fails, warns = [], []

# 1) timeline integrity
if sum(s["durationInFrames"] for s in tl["scenes"]) != tl["totalFrames"]:
    fails.append("timeline frames do not reconcile")

# 2) runtime
runtime_min = tl["totalFrames"] / tl["fps"] / 60
if runtime_min < MIN_MIN:
    fails.append(f"runtime {runtime_min:.1f}min < required {MIN_MIN}min")

# 3) per-scene: component + audio
for s in tl["scenes"]:
    tmpl = s.get("template")
    if tmpl not in tmpl_keys:
        fails.append(f"{s['id']}: template '{tmpl}' not in registry")
    if tmpl and tmpl == prev_tmpl:
        warns.append(f"{s['id']}: same template '{tmpl}' as previous scene (variety)")
    prev_tmpl = tmpl
    wav = os.path.join(ROOT, "public", s["audio"])
    if not os.path.exists(wav):
        fails.append(f"{s['id']}: missing audio"); continue
    info = sf.info(wav)
    if info.samplerate != 48000:
        warns.append(f"{s['id']}: audio {info.samplerate}Hz (expected 48000)")
    y, _ = sf.read(wav, dtype="float32")
    if y.ndim > 1: y = y.mean(axis=1)
    rms = float(np.sqrt(np.mean(y ** 2)))
    peak = float(np.max(np.abs(y)))
    if rms < 0.01: fails.append(f"{s['id']}: audio silent (rms {rms:.4f})")
    if peak >= 0.999: fails.append(f"{s['id']}: audio clipping (peak {peak:.3f})")

# 4) optional rendered video
if len(sys.argv) > 1:
    v = sys.argv[1]
    if not os.path.exists(v) or os.path.getsize(v) < 1_000_000:
        fails.append(f"video missing/too small: {v}")

print(f"runtime: {runtime_min:.1f} min | scenes: {len(tl['scenes'])} | warnings: {len(warns)} | failures: {len(fails)}")
for w in warns: print("  WARN:", w)
for f in fails: print("  FAIL:", f)
print("GATE: PASS ✅" if not fails else "GATE: HALT ❌ — do not publish")
sys.exit(1 if fails else 0)
