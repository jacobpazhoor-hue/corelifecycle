# CoreLifecycle Daily Autopilot — architecture & status

Goal: produce + publish a fresh ≥10-min "Every Level of a [Profession]" video to @corelifecycle
**every day at ~2 AM, unattended, public** (user's chosen settings in ops/routine.json).

## How it runs (target design, mirrors the proven Sammi autopilot)
launchd (2 AM, survives restarts) → scripts/daily_autopilot.sh → `claude --print "$(cat
docs/AUTOPILOT_PROMPT.txt)"` (headless agentic run). The standing prompt drives subagents through:
showrunner → writer → art-director → build → **gate** → render → QA stills → package → **gate** →
publish (yt_upload.py) → retro (update ledger/topics/bible). Gate-gated: a broken video HALTs and
is left for review instead of published. Config in ops/routine.json; learning in
ops/improvements.json + ops/produced_topics.json; canon in docs/BIBLE.md.

## Built so far ✅
- Voice (crisp 48k mastering), white-figure engine, props, packaging step (gen_packaging.py),
  thumbnail comp, uploader (yt_upload.py), banner script.
- **ops/routine.json** (config, enabled:false), **gate.py** (pre-publish quality gate),
  **ops/improvements.json** + **ops/produced_topics.json** (learning), **docs/BIBLE.md** (canon),
  **docs/AUTOPILOT_PROMPT.txt** (the brain), engagement + packaging playbooks.

## The ONE big piece still required ⛔ (blocks topic-general daily)
**Scene-template registry.** Right now scenes.tsx has bespoke components per lawyer scene id. For
the autopilot to build ANY topic, scenes must become reusable TEMPLATES keyed by name+params
(desk, boardroom, window, dinner, atrium, street, jet, revolving-door, war-room, lobby, …), so the
writer/art-director compose a new video by *choosing templates*, not writing new code. This is the
next build (improvements.json: "scene-template-registry").

## Go-live sequence (do NOT skip)
1. Build the scene-template registry (+ scene-variety check in gate.py).
2. Run the autopilot MANUALLY 3–5× as supervised DRY RUNS (publishMode private) — confirm the gate
   reliably catches bad videos and the output is good.
3. Add narrow upload permission to ~/.claude/settings.json: "Bash(python3 scripts/yt_upload.py:*)".
4. Set ops/routine.json enabled:true; install launchd:
   cp ops/com.corelifecycle.daily.plist ~/Library/LaunchAgents/ && launchctl load …
5. Keep the Mac plugged in + awake at 2 AM (pmset wake schedule).

## Off switch
launchctl unload …  OR set ops/routine.json enabled:false (every run then stops at approval).
