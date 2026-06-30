#!/usr/bin/env python3
"""Render evenly-spaced sample stills from the current video for the REVIEWER agent.
Output: out/review/NN_f<frame>.png  (+ clears old). Usage: python3 qa_sample.py [N]"""
import os, sys, json, glob, subprocess

ROOT = os.path.dirname(os.path.abspath(__file__))
N = int(sys.argv[1]) if len(sys.argv) > 1 else 16
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
total = tl["totalFrames"]
rev = os.path.join(ROOT, "out", "review")
os.makedirs(rev, exist_ok=True)
for old in glob.glob(os.path.join(rev, "*.png")):
    os.remove(old)

frames = [int(total * (i + 0.5) / N) for i in range(N)]
for i, fr in enumerate(frames):
    out = os.path.join(rev, f"{i:02d}_f{fr}.png")
    subprocess.call(f'npx remotion still EveryLevelLawyer "{out}" --frame={fr} --timeout=60000',
                    shell=True, cwd=ROOT)
print(f"rendered {N} review stills -> {rev}")
