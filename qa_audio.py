#!/usr/bin/env python3
"""Audio QA for the reviewer: transcribe each scene's narration (faster-whisper, CPU/free) and
check it against the written script, plus level/clipping/silence stats. Closes the reviewer's
blind spot (it only sees stills). Writes out/review/audio_report.json for REVIEW_PROMPT to read.

Per scene: word-coverage (how much of the script the VO actually says — catches dropouts/garble),
duration, loudness (rms/peak), silence ratio. Flags low coverage, clipping, dead air.
"""
import os, re, json, sys
import numpy as np
import soundfile as sf
from scipy.signal import resample_poly

ROOT = os.path.dirname(os.path.abspath(__file__))
import content  # SCENES with id + narration
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
audio_by_id = {s["id"]: s["audio"] for s in tl["scenes"]}
narr_by_id = {s["id"]: s["narration"] for s in content.SCENES}

STOP = set("a an the and or but of to in on at for with is are was were be been it this that as you your "
           "i we they he she his her their our its not no do does did has have had will would can could "
           "so if then than there here from by about into out up down over under one".split())
def words(t):
    return [w for w in re.findall(r"[a-z']+", t.lower()) if w not in STOP and len(w) > 1]

def load16k(path):
    y, sr = sf.read(path, dtype="float32")
    if y.ndim > 1: y = y.mean(axis=1)
    stats = dict(rms=float(np.sqrt(np.mean(y**2))), peak=float(np.max(np.abs(y))),
                 dur=round(len(y)/sr, 1),
                 silence=round(float(np.mean(np.abs(y) < 0.005)), 2))
    if sr != 16000:
        from math import gcd
        g = gcd(sr, 16000); y = resample_poly(y, 16000 // g, sr // g)
    return y.astype("float32"), stats

print("loading faster-whisper base (first run downloads ~145MB)...", flush=True)
from faster_whisper import WhisperModel
model = WhisperModel("base", device="cpu", compute_type="int8")

scenes, low = [], []
for sid, narr in narr_by_id.items():
    rel = audio_by_id.get(sid)
    wav = os.path.join(ROOT, "public", rel) if rel else None
    if not wav or not os.path.exists(wav):
        scenes.append(dict(id=sid, error="missing audio")); low.append(sid); continue
    y, st = load16k(wav)
    segs, _ = model.transcribe(y, language="en", beam_size=1)
    heard = " ".join(s.text for s in segs)
    nw, hw = words(narr), set(words(heard))
    cov = round(sum(1 for w in nw if w in hw) / max(1, len(nw)), 2)
    flags = []
    # base-model coverage runs ~0.70–0.95 on clean VO; only a real dropout/garble drives it low
    if cov < 0.6: flags.append("low word-coverage (likely dropout/garble — listen)")
    if st["peak"] >= 0.999: flags.append("clipping")
    if st["silence"] > 0.4: flags.append("excess silence/dead air")
    if flags: low.append(sid)
    scenes.append(dict(id=sid, coverage=cov, **st, flags=flags))

covs = [s["coverage"] for s in scenes if "coverage" in s]
report = dict(
    summary=dict(scenes=len(scenes), avg_coverage=round(sum(covs)/max(1, len(covs)), 2),
                 flagged=low,
                 verdict=("clean" if not low else f"{len(low)} scene(s) need an ear: {', '.join(low)}")),
    scenes=scenes)
os.makedirs(os.path.join(ROOT, "out", "review"), exist_ok=True)
out = os.path.join(ROOT, "out", "review", "audio_report.json")
json.dump(report, open(out, "w"), indent=2)
print(f"avg word-coverage {report['summary']['avg_coverage']} | flagged {len(low)} | wrote {out}")
for s in scenes:
    if s.get("flags") or s.get("error"):
        print("  ", s["id"], s.get("error") or s["flags"], f"cov={s.get('coverage')}")
