# Autonomous Improvement Loop (Ralph + Caveman) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a scheduled midday loop that autonomously works through `ops/improvements.json` via the existing Ralph harness, improving the CoreLifecycle pipeline between nightly video runs.

**Architecture:** A Python converter turns the backlog into a Ralph `prd.json`; a lock-aware zsh launcher regenerates the prd and runs a bounded `RALPH_YOLO=1` pass; a launchd plist fires it at 12:30 PM. Every story must pass `build.py` (gate + smoke) before its change is kept; hard fences forbid publishing/secrets. Spec: `docs/superpowers/specs/2026-07-12-autonomous-improvement-loop-design.md`.

**Tech Stack:** Python 3.12 (stdlib only), zsh, launchd, `~/ralph/ralph.sh` (jq-based), `build.py`.

## Global Constraints

- Repo root: `/Users/jacobpazhoor/CoreLifecycle` (all paths relative to it unless absolute).
- Python: stdlib only, no new pip deps. Interpreter `python3` (3.12 framework build).
- Ralph harness is REUSED UNCHANGED at `~/ralph/ralph.sh` + `~/ralph/ITERATION_PROMPT.md` — do not edit them.
- Hard fences (must appear verbatim in the prd `rules`): the loop NEVER publishes/unlists/uploads or touches any live video/YouTube API; NEVER reads/writes/commits anything under `secrets/`; NEVER edits `scripts/yt_upload.py` or writes `runs/last_post.txt` / `ops/produced_topics.json`.
- Autonomy: full YOLO (`RALPH_YOLO=1`), auto-commit to `main`, iteration cap = 4.
- Verify gate: `python3 build.py` exits 0 before any story is marked passed; on failure the iteration discards its change (`git checkout -- .`) and does not commit.
- Do NOT run `launchctl load` — leave loading the plist to the user (standing rule: never load/unload the user's launchd jobs without consent).
- Commit style: end messages with the repo's standard `Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>` trailer.

---

### Task 1: Backlog → prd converter

**Files:**
- Create: `scripts/improvements_to_prd.py`
- Test: `tests/test_improvements_to_prd.py`
- Modify: `.gitignore`

**Interfaces:**
- Produces: `ralph/prd.json` with shape `{"branchName": "main", "rules": <str>, "userStories": [{"id","title","priority","passes","notes","acceptanceCriteria":[...]}]}`. `ralph.sh` consumes it via `jq '[.userStories[] | select(.passes == false)] | length'`.

- [ ] **Step 1: Write the failing test**

Create `tests/test_improvements_to_prd.py`:

```python
#!/usr/bin/env python3
"""Structural + idempotency tests for the backlog->prd converter. Run: python3 tests/test_improvements_to_prd.py"""
import json, os, subprocess, sys
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PRD = os.path.join(ROOT, "ralph", "prd.json")

def run():
    subprocess.run([sys.executable, "scripts/improvements_to_prd.py"], cwd=ROOT, check=True)
    return json.load(open(PRD))

def test_structure():
    p = run()
    assert p["branchName"] == "main", p["branchName"]
    assert "secrets/" in p["rules"] and "build.py" in p["rules"], "rules must state the fences + gate"
    backlog = json.load(open(os.path.join(ROOT, "ops", "improvements.json")))["backlog"]
    assert len(p["userStories"]) == len(backlog), (len(p["userStories"]), len(backlog))
    prios = [s["priority"] for s in p["userStories"]]
    assert prios == sorted(prios), "stories must be priority-sorted ascending"
    for s in p["userStories"]:
        crit = " ".join(s["acceptanceCriteria"])
        assert "build.py" in crit and "secrets/" in crit, s["id"]
        assert len(s["acceptanceCriteria"]) >= 3, s["id"]

def test_idempotency_preserves_passed():
    p = run()
    first_id = p["userStories"][0]["id"]
    p["userStories"][0]["passes"] = True
    json.dump(p, open(PRD, "w"), indent=2)     # simulate the loop marking one story done
    p2 = run()                                  # re-run converter
    got = next(s for s in p2["userStories"] if s["id"] == first_id)
    assert got["passes"] is True, "re-running the converter must NOT regress a passed story"

if __name__ == "__main__":
    test_structure(); test_idempotency_preserves_passed()
    print("OK: all converter tests passed")
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /Users/jacobpazhoor/CoreLifecycle && python3 tests/test_improvements_to_prd.py`
Expected: FAIL — `FileNotFoundError`/`CalledProcessError` because `scripts/improvements_to_prd.py` does not exist yet.

- [ ] **Step 3: Write the converter**

Create `scripts/improvements_to_prd.py`:

```python
#!/usr/bin/env python3
"""Convert ops/improvements.json (the autopilot's learning backlog) into a Ralph prd.json.
Each backlog item -> one user story. A story stays passed if it is in improvements.json "done"
OR was already marked passed in an existing prd.json, so re-running never regresses completed work.
See docs/superpowers/specs/2026-07-12-autonomous-improvement-loop-design.md."""
import json, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
IMP = os.path.join(ROOT, "ops", "improvements.json")
PRD = os.path.join(ROOT, "ralph", "prd.json")
IMPACT_RANK = {"high": 1, "med": 2, "medium": 2, "low": 3}

RULES = (
    "You are improving the CoreLifecycle video pipeline. HARD RULES (never violate, even though "
    "permissions are off): (1) NEVER publish, unlist, upload, or touch any live video or the YouTube "
    "API. (2) NEVER read, write, move, or commit anything under secrets/. (3) NEVER edit "
    "scripts/yt_upload.py or any publish path, and NEVER write runs/last_post.txt or "
    "ops/produced_topics.json. (4) One story per iteration. (5) VERIFY GATE before marking a story "
    "passed: run `python3 build.py` and it MUST exit 0 (quality gate + 1-frame smoke render); also run "
    "`git diff --name-only` and confirm it touches nothing under secrets/ and no publish path. "
    "(6) If build.py fails OR the diff is out of bounds: run `git checkout -- .` to DISCARD the code "
    "change, write the blocker into the story's notes and progress.txt, do NOT set passes:true, do NOT "
    "commit the code change, and stop. (7) Keep progress.txt notes TERSE (caveman-brief), facts only."
)

def build_prd():
    d = json.load(open(IMP))
    backlog = d.get("backlog", []) if isinstance(d, dict) else (d if isinstance(d, list) else [])
    done = d.get("done", []) if isinstance(d, dict) else []
    done_ids = {x["id"] for x in done}
    if os.path.exists(PRD):
        try:
            done_ids |= {s["id"] for s in json.load(open(PRD)).get("userStories", []) if s.get("passes")}
        except Exception:
            pass
    stories = []
    for i, item in enumerate(backlog):
        rank = IMPACT_RANK.get(str(item.get("impact", "med")).lower(), 2)
        note = item.get("note", "")
        stories.append({
            "id": item["id"],
            "title": item["id"].replace("-", " "),
            "priority": rank * 1000 + i,
            "passes": item["id"] in done_ids,
            "notes": note,
            "acceptanceCriteria": [
                f"The improvement described in notes is implemented: {note[:400]}",
                "`python3 build.py` exits 0 (quality gate + 1-frame smoke render still pass).",
                "`git diff --name-only` touches nothing under secrets/ and no publish path "
                "(scripts/yt_upload.py, ops/produced_topics.json, runs/last_post.txt).",
            ],
        })
    stories.sort(key=lambda s: s["priority"])
    prd = {"branchName": "main", "rules": RULES, "userStories": stories}
    os.makedirs(os.path.dirname(PRD), exist_ok=True)
    json.dump(prd, open(PRD, "w"), indent=2)
    return prd

if __name__ == "__main__":
    p = build_prd()
    npass = sum(1 for s in p["userStories"] if s["passes"])
    print(f"prd.json: {len(p['userStories'])} stories ({npass} already passed) -> {PRD}")
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /Users/jacobpazhoor/CoreLifecycle && python3 tests/test_improvements_to_prd.py`
Expected: PASS — `OK: all converter tests passed`.

- [ ] **Step 5: Ignore Ralph runtime files**

Append to `.gitignore` (create the lines if absent):

```
# Ralph improvement loop runtime (keep prd.json tracked, ignore the rest)
ralph/runs/
ralph/progress.txt
ralph/STOP
runs/improve/
```

- [ ] **Step 6: Commit**

```bash
cd /Users/jacobpazhoor/CoreLifecycle
git add scripts/improvements_to_prd.py tests/test_improvements_to_prd.py .gitignore
git commit -m "feat(improve): backlog->ralph prd converter + tests

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 2: Lock-aware launcher

**Files:**
- Create: `scripts/improve_loop.sh`

**Interfaces:**
- Consumes: `scripts/improvements_to_prd.py` (Task 1), `~/ralph/ralph.sh`, the shared lock `/tmp/video_autopilot.lock`.
- Produces: a bounded YOLO Ralph pass; logs to `runs/improve/<timestamp>.log`; failure alert to `runs/autopilot/ALERTS.log` + desktop notification.

- [ ] **Step 1: Write the launcher**

Create `scripts/improve_loop.sh`:

```bash
#!/bin/zsh
# CoreLifecycle daytime improvement loop: regenerate the Ralph prd from ops/improvements.json,
# then run a bounded YOLO Ralph pass — clear of the 2AM video run and holding the shared video
# lock so it never overlaps a render. Spec: docs/superpowers/specs/2026-07-12-autonomous-improvement-loop-design.md
cd /Users/jacobpazhoor/CoreLifecycle || exit 1
setopt NO_NOMATCH 2>/dev/null
# launchd runs with a minimal PATH — pin the full toolchain (python3 with our packages, node/npx, jq)
export PATH="/Library/Frameworks/Python.framework/Versions/3.12/bin:/usr/local/bin:/opt/homebrew/bin:/Users/jacobpazhoor/.local/bin:/usr/bin:/bin:/usr/sbin:/sbin"
mkdir -p runs/improve
LOG="runs/improve/$(date +%Y%m%d_%H%M).log"
exec >> "$LOG" 2>&1
echo "=== improve start $(date) ==="

# SHARED machine-wide video lock (daily_autopilot.sh + Sammy use the same one) — WAIT, never overlap a render
SHARED_LOCK="/tmp/video_autopilot.lock"; _w=0; GOT_SHARED=""
while ! mkdir "$SHARED_LOCK" 2>/dev/null; do
  _h="$(cat "$SHARED_LOCK/holder" 2>/dev/null)"
  _age=$(( $(date +%s) - $(stat -f %m "$SHARED_LOCK" 2>/dev/null || echo 0) ))
  if [ "$_age" -gt 10800 ] || { [ -n "$_h" ] && ! kill -0 "$_h" 2>/dev/null; }; then rm -rf "$SHARED_LOCK"; continue; fi
  [ "$_w" -ge 3600 ] && { echo "shared video lock held >1h — skip today"; exit 0; }
  echo "waiting on shared video lock (pid ${_h:-?}) ${_w}s"; sleep 120; _w=$(( _w + 120 ))
done
echo $$ > "$SHARED_LOCK/holder"; GOT_SHARED=1

finish() { [ -n "$GOT_SHARED" ] && rm -rf "$SHARED_LOCK" 2>/dev/null; echo "=== improve end $(date) ==="; }
trap finish EXIT

# regenerate the prd from the latest backlog
python3 scripts/improvements_to_prd.py || { echo "prd regen failed"; exit 1; }

# bounded YOLO Ralph pass (user chose full YOLO; cap 4). Hard fences live in the prd rules.
export RALPH_YOLO=1
RALPH_SH="$HOME/ralph/ralph.sh"
[ -x "$RALPH_SH" ] || { echo "no $RALPH_SH"; exit 1; }
command -v jq >/dev/null 2>&1 || { echo "jq not found (ralph.sh needs it) — install with: brew install jq"; exit 1; }
"$RALPH_SH" /Users/jacobpazhoor/CoreLifecycle 4
RC=$?
echo "ralph exit=$RC"

if [ "$RC" -ne 0 ]; then
  echo "$(date '+%F %H:%M') IMPROVE FAIL rc=$RC (see $LOG)" >> runs/autopilot/ALERTS.log
  osascript -e "display notification \"improve loop failed rc=$RC\" with title \"CoreLifecycle improve\" sound name \"Basso\"" 2>/dev/null
fi
```

- [ ] **Step 2: Make it executable + syntax-check**

Run:
```bash
cd /Users/jacobpazhoor/CoreLifecycle
chmod +x scripts/improve_loop.sh
zsh -n scripts/improve_loop.sh && echo "SYNTAX OK"
```
Expected: `SYNTAX OK`.

- [ ] **Step 3: Dry-run verification (no real agents spawned)**

Touch a STOP file so `ralph.sh` halts immediately at its loop top instead of spawning `claude` iterations, then run the launcher and confirm it regenerates the prd, acquires+releases the shared lock, and exits clean.

Run:
```bash
cd /Users/jacobpazhoor/CoreLifecycle
mkdir -p ralph && touch ralph/STOP
scripts/improve_loop.sh
echo "launcher rc=$?"
rm -f ralph/STOP
test ! -e /tmp/video_autopilot.lock && echo "SHARED LOCK RELEASED"
test -f ralph/prd.json && echo "PRD GENERATED"
tail -5 runs/improve/*.log | tail -8
```
Expected: launcher `rc=0`; `SHARED LOCK RELEASED`; `PRD GENERATED`; log shows `improve start`, `ralph: ... STOP file — halting` (or `ALL STORIES PASS`), and `improve end`.
Note: if `/tmp/video_autopilot.lock` is held by a real render at test time, the launcher will wait — run the dry-run when no video render is active.

- [ ] **Step 4: Commit**

```bash
cd /Users/jacobpazhoor/CoreLifecycle
git add scripts/improve_loop.sh
git commit -m "feat(improve): lock-aware YOLO launcher for the Ralph improvement pass

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 3: launchd schedule

**Files:**
- Create: `ops/com.corelifecycle.improve.plist`

**Interfaces:**
- Consumes: `scripts/improve_loop.sh` (Task 2).

- [ ] **Step 1: Write the plist**

Create `ops/com.corelifecycle.improve.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key><string>com.corelifecycle.improve</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/zsh</string>
    <string>/Users/jacobpazhoor/CoreLifecycle/scripts/improve_loop.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict><key>Hour</key><integer>12</integer><key>Minute</key><integer>30</integer></dict>
  <key>StandardOutPath</key><string>/Users/jacobpazhoor/CoreLifecycle/runs/improve/launchd.out</string>
  <key>StandardErrorPath</key><string>/Users/jacobpazhoor/CoreLifecycle/runs/improve/launchd.err</string>
  <key>ProcessType</key><string>Background</string>
  <key>LowPriorityIO</key><true/>
</dict>
</plist>
```

- [ ] **Step 2: Validate the plist**

Run: `plutil -lint /Users/jacobpazhoor/CoreLifecycle/ops/com.corelifecycle.improve.plist`
Expected: `... OK`.

- [ ] **Step 3: Commit**

```bash
cd /Users/jacobpazhoor/CoreLifecycle
git add ops/com.corelifecycle.improve.plist
git commit -m "feat(improve): launchd plist (12:30 daily, unloaded until user opts in)

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

### Task 4: Wire-up, initial prd, and operator docs

**Files:**
- Create: `ralph/prd.json` (generated, tracked)
- Modify: `docs/AUTOPILOT.md`

**Interfaces:**
- Consumes: all prior tasks.

- [ ] **Step 1: Generate the initial prd**

Run:
```bash
cd /Users/jacobpazhoor/CoreLifecycle
python3 scripts/improvements_to_prd.py
python3 -c "import json;p=json.load(open('ralph/prd.json'));print('stories',len(p['userStories']),'branch',p['branchName'])"
```
Expected: prints `stories 33 branch main` (count matches the backlog).

- [ ] **Step 2: Add an operator section to `docs/AUTOPILOT.md`**

Append this section verbatim:

```markdown
## Daytime improvement loop (Ralph)

A midday loop works through `ops/improvements.json` autonomously, improving the pipeline
between nightly video runs. Pieces:
- `scripts/improvements_to_prd.py` — regenerates `ralph/prd.json` from the backlog (idempotent).
- `scripts/improve_loop.sh` — holds the shared video lock, then runs a bounded `RALPH_YOLO=1`
  pass (cap 4) via `~/ralph/ralph.sh`. Each story must pass `python3 build.py` before commit;
  hard fences forbid publishing/secrets (see the prd `rules`).
- `ops/com.corelifecycle.improve.plist` — fires it at 12:30 PM.

**Enable it (one-time, user runs this):**
```
cp ops/com.corelifecycle.improve.plist ~/Library/LaunchAgents/
launchctl load ~/Library/LaunchAgents/com.corelifecycle.improve.plist
```
**Run once by hand:** `scripts/improve_loop.sh`
**Pause a pass:** `touch ralph/STOP` (remove it to resume).
```

- [ ] **Step 3: End-to-end wiring check (STOP dry-run)**

Run:
```bash
cd /Users/jacobpazhoor/CoreLifecycle
touch ralph/STOP; scripts/improve_loop.sh; echo "rc=$?"; rm -f ralph/STOP
```
Expected: `rc=0`, and `runs/improve/*.log` shows a clean start→end with the prd regenerated.

- [ ] **Step 4: Commit**

```bash
cd /Users/jacobpazhoor/CoreLifecycle
git add ralph/prd.json docs/AUTOPILOT.md
git commit -m "feat(improve): initial prd + operator docs; loop ready to enable

Co-Authored-By: Claude Opus 4.8 (1M context) <noreply@anthropic.com>"
```

---

## Notes for the implementer

- Do not edit `~/ralph/ralph.sh` or `~/ralph/ITERATION_PROMPT.md` — they are shared across projects.
- Do not run `launchctl load` — enabling the schedule is the user's explicit step (documented in Task 4).
- If `jq` is missing, the launcher exits with an install hint; that is expected until `brew install jq` is run (note it in the handoff, don't auto-install).
- The dry-run steps use `ralph/STOP` so no real `claude` iterations (and no token spend) happen during implementation/verification.
