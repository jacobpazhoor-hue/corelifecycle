# Autonomous Improvement Loop (Ralph) + Caveman — Design

Date: 2026-07-12
Status: Approved design → ready for implementation plan
Owner: CoreLifecycle (@corelifecycle)

## Goal

Add a **daytime, self-improving loop** to CoreLifecycle that works through the
existing improvement backlog (`ops/improvements.json`) autonomously between the
nightly video runs, so channel/pipeline quality compounds without a human in the
loop. Layer in **caveman** token-compression where it is safe (chat + loop logs),
not where it would hurt quality (creative/reviewer/code-editing reasoning).

Three user-stated objectives: (1) auto-improve the channel, (2) cut token cost,
(3) more end-to-end autonomy.

## Non-goals / out of scope

- Replacing the nightly video autopilot (it is already a healthy fresh-context loop).
- Any change to how videos are published, reviewed, or rendered.
- Caveman applied to the creative writer, the reviewer, or code-editing reasoning.
- The loop publishing, unlisting, or touching live videos or `secrets/` (hard-fenced).

## Approach (chosen)

**Ralph-native.** Reuse the existing, proven harness at `~/ralph/ralph.sh`
(fresh `claude --print` per iteration against a `prd.json` story backlog, driven
by `~/ralph/ITERATION_PROMPT.md`). We only add: a backlog→prd converter, a
lock-aware launcher, and a launchd schedule. Rejected alternatives: folding
improvement into `daily_autopilot.sh` (tangles two concerns, hard to bound) and
a bespoke loop (reinvents Ralph).

## Decisions (locked with the user)

- **Autonomy:** full YOLO — `RALPH_YOLO=1` (skip-permissions), auto-commit to `main`.
- **Verify gate:** per-story acceptance check **plus** a global gate (`build.py`
  passes = quality gate + 1-frame smoke render). Fail → revert the change, do not
  mark the story passed.
- **Cadence:** one bounded pass at midday via launchd (~4 iterations), clear of the
  2 AM video run; holds the shared video lock so it never overlaps a render.
- **Hard fences (non-negotiable, even under YOLO):** never publish/unlist/touch live
  videos; never read or write `secrets/`; never fake `last_post.txt` /
  `produced_topics.json`.

## Architecture / components

### 1. Backlog → prd converter — `scripts/improvements_to_prd.py` (new)
- Reads `ops/improvements.json` (dict of 33 `{id, impact, note}` items).
- Emits `ralph/prd.json` in Ralph's schema: `{branchName: "main", userStories: [...]}`.
- One story per improvement item. Priority ordered by `impact` (high→med→low), then
  by original order. Fields per story: `id`, `title` (from id/note), `priority`,
  `passes: false` (preserve `true` for already-done ids across re-runs), `notes`
  (the item's `note`), and `acceptanceCriteria`.
- **Universal acceptance criteria appended to EVERY story:**
  1. `python3 build.py` exits 0 (gate + smoke render still pass).
  2. `git diff` touches no path under `secrets/` and none of the publish scripts
     (`scripts/yt_upload.py`, `scripts/yt_*`, publish/produced/last_post writes).
- Idempotent: re-running merges new backlog items as new `passes:false` stories and
  preserves the `passes` state of existing ones (so the nightly autopilot adding new
  learnings to `improvements.json` automatically becomes future work).

### 2. prd RULES preamble
`prd.json` carries a top-level `rules` string embedding the hard fences in loud
language, so every fresh iteration (which reads the prd) is reminded: no publish, no
secrets, no faking post-state; one story per iteration; revert on gate failure.

### 3. Lock-aware launcher — `scripts/improve_loop.sh` (new)
- Acquires the shared machine-wide lock `/tmp/video_autopilot.lock` (same protocol as
  `daily_autopilot.sh`: wait with stale-steal on dead holder; give up after a cap).
  Guarantees no overlap with any render (nightly, catchup, or Sammy).
- Regenerates the prd: `python3 scripts/improvements_to_prd.py`.
- Runs `RALPH_YOLO=1 ~/ralph/ralph.sh /Users/jacobpazhoor/CoreLifecycle 4`
  (bounded iteration cap = 4).
- Reuses the health/alert pattern from `daily_autopilot.sh finish()`: writes a status
  line and, on failure, appends to `runs/autopilot/ALERTS.log` + fires a desktop
  notification (so a broken pass surfaces same-day, incl. to the phone via Remote
  Control).
- Releases the shared lock on exit (trap).
- Pins the full toolchain `PATH` (launchd runs with a minimal PATH — same fix the
  video autopilot needed).

### 4. Schedule — `ops/com.corelifecycle.improve.plist` (new)
- launchd job, `StartCalendarInterval` ~12:30 PM local, runs `scripts/improve_loop.sh`.
- Logs to `runs/improve/<timestamp>.log`. Loaded once with `launchctl load`
  (documented; not auto-loaded without the user, matching the standing rule about not
  installing/unloading launchd jobs without consent).

### 5. Caveman integration
- **This chat:** `/caveman` on going forward (assistant replies compressed).
- **Loop logs/notes:** `improve_loop.sh` echoes and the iteration `progress.txt`
  summary use a compressed style. (Ralph's per-iteration *reasoning* is unchanged —
  it must stay full-fidelity to edit code correctly.)
- **Explicitly OFF:** the creative writer, the reviewer, and code-editing reasoning.
- Honest expectation documented: pipeline-side caveman savings are modest; the real
  lever is Ralph autonomy + fewer human round-trips.

## Data flow

```
ops/improvements.json ──(improvements_to_prd.py)──▶ ralph/prd.json
                                                        │
launchd 12:30 ─▶ improve_loop.sh ─(acquire shared lock)─┤
                                                        ▼
                          ~/ralph/ralph.sh  (RALPH_YOLO=1, cap 4)
                                                        │  per iteration (fresh claude):
                                                        │   pick first passes:false story
                                                        │   implement only that
                                                        │   run acceptance + build.py gate
                                                        │   pass? mark passes:true + commit main
                                                        │   fail? revert + note blocker
                                                        ▼
                          release shared lock ─▶ health/alert ─▶ (phone)
```
Ralph commits land on local `main`; they reach the cloud on the next video run
(the nightly `cloud_render.py` does `git add/commit/push` of `main`). No separate push.

## Error handling

- **Build gate fails after a story's change:** iteration reverts the working change,
  leaves the story `passes:false`, writes the blocker to the story `notes` +
  `progress.txt`, stops (a later pass or human retries). No bad commit lands.
- **Lock contention:** if a render holds the shared lock, the launcher waits; if it
  can't acquire within the cap, it exits cleanly (tomorrow's pass retries).
- **Iteration crash / API error:** ralph.sh continues to next iteration; the bounded
  cap and the launchd schedule bound total exposure.
- **Backlog empty:** iteration prints `RALPH_ALL_DONE` and stops; launcher exits idle.

## Collision & safety analysis

- Midday vs 2 AM nightly → no schedule overlap; shared lock covers catchup/Sammy.
- Commits to `main` during the day do not conflict with the nightly run (serialized by
  lock + time); worst case is a merge-clean fast-forward on the next `cloud_render`.
- YOLO risk is bounded by: the global `build.py` gate before every commit, the hard
  fences, the 4-iteration cap, one-story-per-iteration, and same-day failure alerts.

## Testing / verification (for the implementation)

1. `improvements_to_prd.py`: run it, assert `ralph/prd.json` is valid, has 33 stories,
   priority-ordered, every story carries the two universal criteria, and re-running
   preserves `passes` states (idempotency).
2. `improve_loop.sh` dry path: run with a tiny cap on a scratch story that makes a
   trivial safe edit; confirm it acquires+releases the shared lock, `build.py` runs,
   the commit lands on `main`, and a forced build-failure triggers a revert (no commit).
3. Fence check: a deliberately out-of-bounds story (touch `secrets/`) must NOT be
   marked passed and must not commit.
4. launchd plist validates (`plutil -lint`) and, once loaded, fires the launcher.

## Files

- New: `scripts/improvements_to_prd.py`, `scripts/improve_loop.sh`,
  `ops/com.corelifecycle.improve.plist`, `ralph/prd.json` (generated),
  `ralph/progress.txt` (runtime), `runs/improve/` (logs).
- Reused unchanged: `~/ralph/ralph.sh`, `~/ralph/ITERATION_PROMPT.md`, `build.py`,
  the shared lock protocol + alert pattern from `scripts/daily_autopilot.sh`.
- `.gitignore`: ensure `ralph/runs/` and `runs/improve/` are ignored; `ralph/prd.json`
  + `ralph/progress.txt` may be committed (state) or ignored — default: commit prd,
  ignore progress/runs.

## Build ownership

Fable-tier plans + writes this spec and the implementation plan; sonnet/haiku subagents
execute the plan (per standing rule "Fable plans, cheap executes").
