#!/usr/bin/env python3
"""Deterministic build step for the active content.py: crisp VO -> music -> gate -> smoke render.
Exit 0 only if everything PASSES. The autopilot calls this, then does the full render only on PASS.

Hardening (so an agent edit can't silently break the nightly run):
  - syntax-gate content.py and ops/episode_meta.json BEFORE doing any work
  - sync ops/episode_meta.json -> src/episode_meta.json (the Thumbnail reads it)
  - quality gate (gate.py)
  - fast SMOKE render (1 frame at start + 1 mid) to catch TSX/scene errors before the 28-min render
"""
import subprocess, sys, os, json
ROOT = os.path.dirname(os.path.abspath(__file__))
# Use the EXACT interpreter that launched build.py for every Python sub-step, so the nightly run can
# never hit "No module named numpy" even if PATH is wrong (launchd minimal-PATH bug, 2026-06-22).
PY = sys.executable or "python3"

def run(cmd):
    cmd = cmd.replace("python3", PY, 1) if cmd.startswith("python3") else cmd
    print("+", cmd, flush=True)
    return subprocess.call(cmd, cwd=ROOT, shell=True)

def die(msg):
    print("BUILD HALT —", msg); sys.exit(1)

# 0) SYNTAX GATES — fail fast & loud if the agent broke the inputs
if run("python3 -c \"import content; assert content.SCENES and content.FPS\"") != 0:
    die("content.py is broken (import/SCENES/FPS). Fix before building.")
try:
    meta = json.load(open(os.path.join(ROOT, "ops", "episode_meta.json")))
    for k in ("title", "hook", "body", "tags", "thumb"):
        assert meta.get(k), f"episode_meta.json missing '{k}'"
    for k in ("kicker", "line1", "tag"):
        assert meta["thumb"].get(k), f"episode_meta.json thumb missing '{k}'"
except Exception as e:
    die(f"ops/episode_meta.json invalid: {e}")

# sync the Remotion-importable copy the Thumbnail reads
json.dump({"thumb": meta["thumb"], "topic": meta.get("topic", "")}, open(os.path.join(ROOT, "src", "episode_meta.json"), "w"), indent=2)

# 1) VO + music
for step in ("python3 gen_voice_edge.py", "python3 make_ambient.py"):
    if run(step) != 0:
        die(f"failed at: {step}")
# 1b) Phase-2 audio polish: duck music under VO + synth SFX layer (non-fatal; guarantees sfx.wav)
run("python3 duck_music.py")

# 2) quality gate
if run("python3 gate.py") != 0:
    print("BUILD HALT — gate failed, do not render/publish."); sys.exit(1)

# 3) SMOKE render — cheap insurance that the composition actually renders before the long job
tl = json.load(open(os.path.join(ROOT, "src", "timeline.json")))
mid = max(1, tl["totalFrames"] // 2)
for fr in (0, mid):
    if run(f"npx remotion still EveryLevelLawyer out/_smoke_{fr}.png --frame={fr} --timeout=120000") != 0:
        die(f"smoke render failed at frame {fr} — composition would fail the full render. Fix scenes.tsx/content.py.")

print("BUILD OK — gate + smoke passed, safe to render.")
sys.exit(0)
