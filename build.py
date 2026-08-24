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
    for k in ("line1", "tag"):
        assert meta["thumb"].get(k), f"episode_meta.json thumb missing '{k}'"
except Exception as e:
    die(f"ops/episode_meta.json invalid: {e}")

# `kicker` is required only where it can be DRAWN. `wordmark` and `beforeafter` have no kicker slot
# and src/thumbs.tsx THROWS rather than dropping the copy, so on those two an EMPTY kicker is the
# correct value — demanding one unconditionally (as this did until 2026-08-24) would make the
# archetype rotation unbuildable half the time. thumb_check.py owns both sets, derived from
# src/thumbs.tsx; it also runs in gate.py, which is where the wrong-pair HALT is reported in full.
# A thumbs.tsx this cannot parse is its own HALT, not a silently skipped requirement.
import thumb_check
try:
    _arch_order, _kickerless = thumb_check.arch_sets()
except thumb_check.ThumbParseError as e:
    die(f"cannot read the thumbnail archetype sets out of src/thumbs.tsx: {e}")
_arch, _ = thumb_check.resolve_archetype(meta, _arch_order)
if _arch not in _kickerless and not meta["thumb"].get("kicker"):
    die(f"ops/episode_meta.json thumb missing 'kicker' (the '{_arch}' archetype draws one)")

# sync the Remotion-importable copy the Thumbnail reads
json.dump({"thumb": meta["thumb"], "topic": meta.get("topic", "")}, open(os.path.join(ROOT, "src", "episode_meta.json"), "w"), indent=2)

# 0.5) SCENE IMAGES (photo visual mode) — NON-FATAL: any failure falls back to doodle per scene,
# and visualMode="doodle" makes this a no-op. Must run before the smoke render consumes assets.
run("python3 gen_scene_images.py")

# 0.6) NARRATION RATE, PREDICTED BEFORE SYNTHESIS — deliberately NON-FATAL, deliberately LOUD.
# gate.py can only measure runtime WPM after every scene has been synthesised, so a rate problem
# currently surfaces at the END of the night as a HALT with nothing uploaded. This predicts the same
# quotient from content.py alone (docs/BIBLE.md §3a, validated to 0.6 WPM on the last two episodes),
# so the writer/repair agent sees it while it is still a cheap rewrite.
# IT DOES NOT BLOCK THE BUILD, and that is the whole design: the predictor cannot see a gap change, a
# scene-count change or a RATE change, so a false positive here must never be able to do what it
# exists to prevent — cost a night's upload. gate.py stays the only authority.
if run("python3 scripts/wpm_predict.py") != 0:
    print("!! WPM PREDICTION IS OUTSIDE gate.py's BAND — gate.py will very likely HALT this build\n"
          "!! after the VO is synthesised. Fix the SCRIPT now (see the advice printed above);\n"
          "!! building on regardless because the prediction is an estimate, not the gate.", flush=True)

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
