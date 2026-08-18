# CoreLifecycle nightly flow audit

**Date:** 2026-08-17 · **Scope:** the end-to-end nightly sequence — `scripts/daily_autopilot.sh`
(launchd 20:00 + 2-hourly catchup) and everything it shells out to · **Brief:** find what can still
fail in *flow*: silently, or in a way that darkens the channel.

**No behaviour was changed by this audit. No code was edited. This file is the only addition.**
Nothing was rendered, built, published or uploaded. The one thing that was executed is the unit
suite (`python3 -m unittest discover -s tests -t .` → 38 tests, OK) — read-only and offline.

---

## 0. The state this audit found the pipeline in

This is not a hypothetical audit. Every number below is from the live repo at the time of writing.

| fact | value | source |
|---|---|---|
| free disk | **6.3 GiB of 228 GiB (97 % used)** | `df -h` |
| last publish | 2026-08-16 | `runs/last_post.txt` |
| tonight's 20:00 run | **FAIL — local render died `No space left on device`** | `runs/autopilot/20260817_2000.log` |
| the 08-17 08:15 run | FAIL — render failed after revision | `runs/autopilot/status.log` |
| tonight's 22:14 catchup | **exited immediately: "2 full attempts already today — budget cap"** | `runs/autopilot/20260817_2214.log` |
| daily attempt ledger | `{"date": "2026-08-17", "count": 2}` | `runs/autopilot_attempts.json` |
| owed-episode marker | `madoff` (built, gate-passed, never published) | `runs/owed_episode.txt` |
| launchd | both jobs loaded; `com.corelifecycle.daily` last exit status **1** | `launchctl list` |

So: the channel is dark tonight, the cause is disk, and the budget cap has locked out every
remaining catchup for the day. `docs/TOKEN_AUDIT.md` §6 called disk **"the acute risk"** on
2026-08-15 with 5.6 GiB free. Two days later it took the night. That is finding **R1**, and it is
the reason the risk register below is ordered the way it is.

---

## 1. The step map

Legend: **shell** = a command `daily_autopilot.sh` runs · **LLM** = a `claude --print --model sonnet`
call · *checked?* = does the runner detect a failure of this step.

`daily_autopilot.sh` has **no `set -e`**. Every "no" in the *checked?* column is a command whose
failure lets the run continue with whatever the previous run left on disk.

| # | Stage | line | reads | writes | shells out to | checked? |
|---|---|---|---|---|---|---|
| — | cd + PATH pin + `exec >> $LOG` | 7–17 | — | `runs/autopilot/YYYYMMDD_HHMM.log` | — | n/a |
| A | enabled gate | 18 | `ops/routine.json` | — | `grep` | exit 0 if disabled |
| B | already-posted-today gate | 22–23 | `runs/last_post.txt` | — | `date`, `cat` | exit 0 |
| C | daily budget gate | 27–32 | `runs/autopilot_attempts.json` | — | `python3` | **fail-OPEN** (R15) |
| D | `caffeinate -dimsu -w $$ &` | 37 | — | — | `caffeinate` | no |
| E | run lock `runs/.lock` (+ PID-reuse liveness) | 49–117 | `runs/.lock/{holder,holder_cmd}` | same + `ALERTS.log` | `ps`, `stat`, `kill -0` | yes, exit 0 |
| F | shared lock `/tmp/video_autopilot.lock` (waits ≤ 4 h) | 124–141 | lock dir | lock dir | `ps`, `stat`, `sleep` | yes, exit 0 (R6) |
| G | `trap finish EXIT` installed | 178 | — | — | — | — |
| H | analytics refresh | 271 | YouTube API | `ops/analytics.json` | `scripts/yt_analytics.py` | **no** (`\|\| echo`) |
| I | REUSE-vs-WRITE decision (runner, not agent) | 331–356 | `runs/owed_episode.txt`, `ops/episode_meta.json`, `ops/produced_topics.json`, `docs/research/*.md` | — | `python3`, `find`, `shasum` | n/a |
| J | **CREATIVE agent** | 362–364 | `docs/AUTOPILOT_PROMPT.txt` + BIBLE + CRAYON_BIBLE + TEMPLATES + 4 ops JSONs | `content.py`, `ops/episode_meta.json`, `docs/research/<slug>.md` | **LLM** | **no** — covered by K/L |
| K | work-fingerprint accounting | 365–371 | content.py + meta + `ls -l docs/research` | `runs/autopilot_attempts.json` | `shasum`, `python3` | n/a (R2) |
| L | short-circuit detection | 375–380 | topic + research hash | — | `python3` | yes, exit 0 |
| M | anti-duplicate new-topic guard | 386–391 | `ops/produced_topics.json` | — | `python3` | yes, exit 0 |
| N | `count_attempt` (unconditional) | 394 | — | `runs/autopilot_attempts.json` | `python3` | (R2) |
| O | **BUILD** `python3 build.py` (tee'd) | 411–412 | see §1a | see §1a | `python3` | yes (`pipestatus[1]`) |
| P | **GATE-REPAIR agent** (only on a failed build) | 416 | `tail -40` of the build log | `content.py`, `ops/episode_meta.json` | **LLM** | no — covered by Q |
| Q | rebuild once | 421–423 | — | — | `python3 build.py` | yes → HALT |
| R | write owed-episode marker | 432 | `ops/episode_meta.json` | `runs/owed_episode.txt` | `python3` | no |
| S | **RENDER** (`render()`, 180–210) | 436 | see §1b | `out/episode.mp4` (+ `out/short.mp4`, `out/thumbnail.png`, `out/upload_kit.json`, `src/timeline.json` on the cloud path) | `cloud_render.py` → `modal_render.py` → `npx remotion render` | yes → FAIL, exit 1 |
| T | `audio_master.py` (skipped if cloud) | 209 | `out/episode.mp4` | `out/episode.mp4` | `python3` | **no** (`\|\| echo`) |
| U | **PACKAGE** `package()` (211–224) | 441 | `ops/episode_meta.json`, `src/timeline.json` | `out/thumbnail.png`, `out/upload_kit.json`, rewrites `ops/episode_meta.json` body | `npx remotion still Thumbnail`, `gen_packaging.py` | still: **NO** (R5) · packaging: yes → HALT |
| V | **REVIEW** `review()` (225–266) | 442 | see §1c | `out/review/{watch/*.png, reviewed_render.json, audio_report.json, facts.json, verdict.json}` | `qa_watch.py`, `qa_sample.py`, `upload_guard.py stamp`, `qa_audio.py`, `review_facts.py`, **LLM** | mixed — see R3, R4, R10 |
| W | read verdict | 443, 267 | `out/review/verdict.json` | — | `python3` | defaults to `reject` **only if the file is unreadable** (R4) |
| X | revision loop ×2 → O, S, U, V | 446–461 | `out/review/verdict.json` | content.py + tsx | **LLM** + build + render + package + review | agent call: **no** |
| Y | non-approve exit | 463–469 | — | clears `runs/owed_episode.txt` | — | yes, exit 0 |
| Z | **FINAL GATE** `gate.py out/episode.mp4` | 473 | see §1d | `out/_gate/*.png` | `npx remotion still` | yes → HALT (but see R8) |
| AA | **PUBLISH** `yt_upload.py --privacy public` | 497 | `out/upload_kit.json`, `out/review/{verdict,reviewed_render}.json`, `secrets/token.json` | `out/uploads.json` | `upload_guard`, Google API | yes → FAIL |
| AB | mark produced | 501–509 | `ops/episode_meta.json`, `out/uploads.json` | `ops/produced_topics.json` | `python3` | **no** (`\|\| echo`) |
| AC | mark posted | 510 | — | `runs/last_post.txt` | `date` | **no** |
| AD | clear owed marker | 511 | — | removes `runs/owed_episode.txt` | `rm` | no |
| AE | Short path | 520–546 | — | — | — | **skipped** (`autoShorts:false`) |
| AF | `finish()` trap | 151–177 | `runs/last_post.txt` | `runs/CHANNEL_STATUS.txt`, `ALERTS.log`, `status.log`; releases both locks | `osascript` | n/a |

### §1a — inside `build.py`

| step | line | reads | writes | fatal? |
|---|---|---|---|---|
| import-gate `content.py` | 26–27 | `content.py` | — | **yes** |
| validate `ops/episode_meta.json` (title, hook, body, tags, thumb.{kicker,line1,tag}) | 28–35 | `ops/episode_meta.json` | — | **yes** |
| sync Remotion copy | 38 | meta | `src/episode_meta.json` | no check |
| `gen_scene_images.py` | 42 | `ops/routine.json` visualMode | scene images | **no** — by design |
| `scripts/wpm_predict.py` | 52–55 | `content.py`, `gate.py` source | — | **no** — by design (R11) |
| `gen_voice_edge.py` | 58–60 | `content.py`, `public/audio/.vo_cache.json` | `public/audio/*.{mp3,wav}`, `.vo_cache.json`, **`src/timeline.json`** | **yes** |
| `make_ambient.py` | 58–60 | `src/timeline.json`, meta topic | `public/music/ambient.wav` | **yes** (but see R17) |
| `duck_music.py` | 62 | ambient + per-scene VO | `ambient.wav`, `public/music/sfx.wav` | **no** — and it can never fail (R17) |
| `gate.py` (no arg) | 65–66 | see §1d | `out/_gate/*.png` | **yes** |
| smoke render frames 0 + mid | 69–73 | `src/timeline.json` | `out/_smoke_{n}.png` | **yes** |

### §1b — inside `render()` (daily_autopilot.sh:180–210)

1. `rm -f out/episode.mp4 out/short.mp4` (181) — good: no stale mp4 can survive a failed render.
   **`out/thumbnail.png` and `out/upload_kit.json` are NOT cleared.** → R5.
2. If `secrets/gh.env` exists → `scripts/cloud_render.py $NEWTOPIC` (186): stages
   `content.py src ops/episode_meta.json docs/research`, commits, pushes to `main`, dispatches
   `.github/workflows/render.yml`, polls ≤ 115 min, downloads the artifact and
   **`extractall` at the repo root** — which replaces `out/episode.mp4`, `out/short.mp4`,
   `out/thumbnail.png`, `out/upload_kit.json`, `out/short_kit.json` and **`src/timeline.json`**.
3. Else if `useModal:true` → `modal_render.py` (189). Currently `false`.
4. Else → **local** `npx remotion render` at concurrency 2, then on failure purge caches and retry at
   concurrency 1 (192–202).
5. Verify `out/episode.mp4` exists and is > 50 MB (204–206).
6. `audio_master.py` unless the cloud already mastered (209), **non-fatal**.

The cloud workflow's `prepare` job runs `python build.py` **again on the runner** — a second,
independent VO synthesis. The artifact carries the cloud's `src/timeline.json` back, so the local
timeline is replaced by the one that actually describes the downloaded mp4. That is correct and
deliberate; note it, because several later steps measure off `src/timeline.json` and not off the mp4.

### §1c — inside `review()` (daily_autopilot.sh:225–266)

1. **Prune** `out/review/*.png` and `watch/ check_watch/ short_watch/` (236–237).
   **`verdict.json`, `facts.json` and `audio_report.json` are not pruned.** → R3, R4.
2. `qa_watch.py out/episode.mp4 || qa_sample.py` (238) → `out/review/watch/*.png` (48 frames).
3. Frame floor: HALT if fewer than **1** frame (244–249). → R10.
4. `upload_guard.py stamp out/episode.mp4` (256) → `out/review/reviewed_render.json` (sha256).
   Non-fatal, but a failure here blocks the upload later.
5. `qa_audio.py` (258) → `out/review/audio_report.json`. **Non-fatal.**
6. `scripts/review_facts.py` (264) → `out/review/facts.json`. **Non-fatal.**
7. **Reviewer LLM** with `docs/REVIEW_PROMPT.txt` (265). **Unchecked.** It writes
   `out/review/verdict.json`.

### §1d — what `gate.py` actually checks

Reads `ops/routine.json` (runtime band), `src/timeline.json`, `content.py`'s `SCENES`,
`src/scenes.tsx` → `src/explainer.tsx` (template registry), the per-scene wavs under `public/`, and
`staging_check.py` (which re-derives head anchors from `src/figure.tsx` + `src/explainer.tsx` and
compares them to `src/director.tsx`'s `STAGING`). It renders 4 style stills through
`npx remotion still` for the flat-fill / camera-lock assertions.

**`python3 gate.py` and `python3 gate.py out/episode.mp4` run the same checks.** The file argument
adds exactly one thing (gate.py:403–406): the file exists and is ≥ 1 MB. The "final gate" never
decodes the mp4, never compares its duration or frame count to `src/timeline.json`, and never
verifies that the encoded file is the thing that was gated. → R8.

---

## 2. Per-step failure behaviour — the unchecked commands

`set -e` is absent. These are every command whose failure is not detected, ranked by what it lets
through.

| line | command | on failure the run… | consequence |
|---|---|---|---|
| 213 | `npx remotion still Thumbnail out/thumbnail.png` | continues | **publishes the previous episode's thumbnail** (R5) |
| 265 | `"$CLAUDE" … REVIEW_PROMPT` | continues | **acts on the previous run's verdict** (R4) |
| 264 | `python3 scripts/review_facts.py` | continues | reviewer gets last episode's measurements (R3) |
| 258 | `python3 qa_audio.py` | continues | reviewer gets last episode's audio report (R3) |
| 453 | `"$CLAUDE" …` revision agent | continues | rebuild + re-render + re-review with **zero changes**; burns two full renders, then HALTs |
| 501–509 | mark-produced `python3 -c` | continues | topic never recorded → a later run can re-produce it; only `title_live` (last 25 uploads) stands in the way |
| 510 | `date +%F > runs/last_post.txt` | continues | the already-posted-today guard is disarmed for the day |
| 209 | `audio_master.py` | continues | publishes an un-mastered (not −14 LUFS) episode |
| 271 | `scripts/yt_analytics.py` | continues | creative agent reads stale analytics — low harm |
| 256 | `upload_guard.py stamp` | continues | fails **safe**, but only at the upload, after the reviewer has already been paid for |
| 293 | `count_attempt`'s `python3 … \|\| true` | continues | the daily cap silently stops incrementing (R15) |
| 42, 52, 62 | `build.py` non-fatal steps | continue | by design; documented in build.py |

Checked and correct: 412/421 (`${pipestatus[1]}` — right for zsh, 1-indexed), 436, 454, 455, 473,
497, 220–223 (`gen_packaging`), 246–249 (frame floor), 377–380, 387–390.

---

## 3. Silent-wrong-result paths

This is the section that matters. Every one of these produces a *plausible* artifact rather than an
error.

### S1 — the reviewer is handed the previous episode's measurements
`review()` prunes `out/review/*.png` and the watch dirs (236–237) but **not** `facts.json` or
`audio_report.json`. Both are written by non-fatal calls (258, 264). `REVIEW_PROMPT.txt:37` calls
`facts.json` **"DETERMINISTIC MEASUREMENTS OF THIS EPISODE"** and `:55` calls `audio_report.json`
**"your EARS"**. The prompt explicitly vouches for the freshness of the PNGs — *"the runner deletes
every frame from the previous episode before it samples this one"* (`REVIEW_PROMPT.txt:33–34`) —
and says nothing of the kind about these two, because there is nothing to say.

If `review_facts.py` throws (it has no top-level try/except; a KeyError on a new content field is
enough) the reviewer reads last episode's runtime, scene count, WPM, chapter timestamps, shot
distribution and thumbnail-archetype history, believing them to be tonight's. It will then flag
phantom defects or, worse, sign off on real ones. The prompt tells it to use these numbers *instead
of* re-deriving them (`REVIEW_PROMPT.txt:45`), so the redundancy that would catch the error has
been deliberately removed.

**This is the same bug that was fixed for the PNGs, one file extension short of complete.** The
stale-frame prune was written with full awareness of the failure mode and stopped at `*.png`.

### S2 — the revision agent applies last episode's fix list
The reviewer LLM call (265) is unchecked and `verdict.json` is never deleted. On a rate-limit or 401
— which is exactly what happened on 2026-08-13 — `decision()` (267) reads the *previous* verdict.
`out/review/verdict.json` on disk right now says `"revise"`. So the failure mode is: the loop enters
a revision pass and hands the fix agent a `fixes` array written about a **different episode**
(`daily_autopilot.sh:453` — *"Read out/review/verdict.json … and apply its 'fixes' PRECISELY"*).
The agent edits `content.py` and `.tsx` files to satisfy notes about a video that no longer exists,
then the runner rebuilds and re-renders. Two renders and an LLM pass, spent making tonight's episode
worse.

`decision()`'s `|| echo reject` fallback does **not** cover this: it fires only when the file is
missing or unparseable, never when it is present and stale.

A stale `"approve"` is caught — but only by `upload_guard.py`'s check 8 (verdict mtime < render
mtime, `upload_guard.py:193–197`). That is a single mtime comparison standing between a failed
reviewer call and an unreviewed public post.

### S3 — last night's thumbnail on tonight's video
`render()` clears `out/episode.mp4` (181) but not `out/thumbnail.png`. `package()` regenerates it
with an **unchecked** `npx remotion still Thumbnail` (213). `gen_packaging.py` hardcodes
`"thumbnail": "out/thumbnail.png"` (gen_packaging.py:247) and **never checks that the file exists,
is non-empty, or is newer than the render**. `yt_upload.py:170` uploads whatever is at that path.

The `package()` comment (211–219) explains at length why an unchecked `gen_packaging.py` would ship
the previous episode's kit — and then leaves the still one line above it unchecked. The thumbnail is
the single most visible artifact the channel produces.

### S4 — `gate.py`'s timeline-staleness check is directional
gate.py:233–238 compares `src/timeline.json` to `content.py` **by scene-ID membership only**:
it HALTs when the timeline names an ID that `content.py` no longer has. Scene IDs restart at `t001`
every episode. So a timeline left over from a **shorter** previous episode is a subset of tonight's
IDs, `_missing` is empty, and the gate proceeds — then computes runtime and runtime-WPM off the
stale frame durations (gate.py:240–247) and checks stale `template`/`audio` values (250–268). None
of those checks compare a scene's *audio* to its *current narration text*; that correspondence is
not checkable by this script at all. A PASS on a timeline belonging to a different episode is
reachable.

In practice `gen_voice_edge.py` rewrites `src/timeline.json` on every build, so this needs a build
that skips VO — which the cloud path's artifact extraction does do (it overwrites `src/timeline.json`
from the runner). Low likelihood, but the check reads as stronger than it is.

### S5 — the final gate does not gate the file
`gate.py out/episode.mp4` (473) adds only "exists and ≥ 1 MB" over the pre-render run
(gate.py:403–406). Everything else is re-measured off `content.py` and `src/timeline.json`. It cannot
detect an mp4 that is the wrong length, truncated at 3 minutes, or silent — `render()`'s 50 MB floor
(206) is the only size sanity check, and a 50 MB mp4 is not a 16-minute episode.

### S6 — `review_facts.py` is structurally blind to the mp4
It reads `src/timeline.json`, `ops/episode_meta.json` and `content.py`, and **never opens
`out/episode.mp4`** (no ffprobe, no duration read). Its output is labelled to the reviewer as
measurements of the rendered video. It does have a source-vs-source staleness field
(`narration.timeline_stale_vs_content`, review_facts.py:194) but nothing source-vs-render.

### S7 — every state file is written by truncate-in-place
`gen_scene_images.py:170` is the **only** `os.replace` in the codebase. `ops/produced_topics.json`,
`runs/autopilot_attempts.json`, `out/uploads.json`, `out/upload_kit.json`, `src/timeline.json` and
all of `out/review/*.json` are written as `json.dump(…, open(path, "w"))`. That truncates first. On
the disk this pipeline is currently running on (6.3 GiB free, and a render that just hit ENOSPC),
an interrupted write leaves a **zero-length or half-written state file**.

The worst target is `ops/produced_topics.json` (written at daily_autopilot.sh:501–509, immediately
after a successful upload — the highest-risk moment, because the disk is at its fullest). It is the
entire duplicate-guard history, 37 episodes. Destroy it and the next creative agent picks the first
topic in `topic_queue.json`, which it has already produced, and the anti-duplicate guard at 387
agrees because the history is gone.

### S8 — the upload kit silently drops unknown fields
`gen_packaging.py:246–248` builds `out/upload_kit.json` as a fixed literal dict rather than by
copying from `ops/episode_meta.json`. Any key a creative agent adds to the meta — a new packaging
field, an end-screen setting, a pinned-comment variant — is silently discarded. The agent will
report having set it, the meta will contain it, and it will never reach YouTube. This is precisely
the "whitelist dropping unknown fields" shape.

### S9 — the VO cache key omits the voice
`gen_voice_edge.py`'s per-scene key hashes `CACHE_VERSION | narration | rate | dialogue | breath |
first-scene` but **not** the module-level `VOICE` constant. Changing the narrator without manually
bumping `CACHE_VERSION` reuses every cached clip under the new voice — an episode narrated in two
voices, which no gate checks for. Narration *text* is in the key, so the common case (edited script)
is safe.

### S10 — `duck_music.py` can never fail
Its entire `main()` is wrapped in `except Exception: print("non-fatal error")` with no re-raise and
no `sys.exit`, then falls through to writing a silent `sfx.wav` (and that fallback is itself wrapped
in a second swallow). It always exits 0, by explicit design. Combined with `build.py:62` also not
checking it, a total failure of the ducking + SFX layer is a single unread line in a 30 000-line log.
`make_ambient.py:30–33` similarly swallows an unreadable `ops/episode_meta.json` and seeds the score
from `topic=""` with no log — a plausible-but-wrong soundtrack.

### S11 — `gen_packaging.py` rewrites the description and only warns
Chapter **name** and **timestamp** drift between the writer's list and the on-screen cards is
auto-corrected in place — it rewrites `ops/episode_meta.json`'s body (gen_packaging.py:172–173) and
logs a warning (167–171). Only a *count* mismatch halts (136–139). The correction is the right
behaviour and it is self-verified (164–165), but the published description can differ from what the
writer wrote with nothing louder than a `⚠` in the log. The title lints (length, parenthetical,
retired POV wording, thumbnail/title overlap) are warn-only throughout (213–244).

### S12 — `wpm_predict.py`'s K is a two-episode constant, and `review_facts.py` imports it
`K = 210.0` was calibrated on exactly two episodes; a third (lehman) measured ~5 % off and was
excluded as "unexplained" rather than reconciled (wpm_predict.py:60–78). The file says plainly that
changing `gen_voice_edge.RATE` makes it stale. It gates nothing (build.py:52–55 warns and continues),
which is correct — but `scripts/review_facts.py:46` imports `syllables`, `gate_band` and `K` from it,
so the stale constant reaches `facts.json` and therefore the reviewer's judgement.

---

## 4. Races and concurrency

### C1 — the shared lock steals from a verified-live holder after 3 h (code contradicts its comment)
`daily_autopilot.sh:128–129` says: *"Steal only a lock nobody live holds … A live holder from the
other project is left alone — the whole point of this lock is to QUEUE."*

Line 130 is:
```zsh
if [ "$_age" -gt 10800 ]; then _steal=1; LOCK_WHY="lock age ${_age}s > 3h"
elif _lock_stale "$SHARED_LOCK"; then _steal=1
```
The age test runs **first and unconditionally**. A Sammy Sloth run that has been going 3 h — and
they routinely do — is stolen from regardless of liveness. `sammy-sloth-video/scripts/daily_autopilot.sh:122`
has the mirror-image rule, so **both projects steal from each other at the 3 h mark**. The result is
two heavy TTS + Remotion pipelines on an 8 GB Mac: swap death, and — see R1 — a shared temp volume
filling twice as fast. This is a plausible contributor to tonight's ENOSPC.

Note the runs/.lock path (107) does *not* have this bug: it calls `_lock_stale` alone. Only the
shared lock has the unconditional age override.

### C2 — `upload_guard.py` uses the un-fixed version of the PID check
`upload_guard.py:130` decides whether a foreign autopilot run is in flight with a bare
`os.kill(pid, 0)` — the exact check that PID recycling defeated on 2026-08-12 and that
`daily_autopilot.sh:49–94` was written to replace. It is the safe direction (a recycled PID makes the
guard *refuse* to publish, it never makes it permissive), but the consequence is that a stale
`runs/.lock` with a recycled holder blocks every hand-run recovery upload with
`"an autopilot run is IN FLIGHT"` and no way past it except the review override. Recovery is exactly
when you need the manual path to work.

### C3 — daily and catchup can start in the same minute and share a log file
Both plists run the same script. `LOG="runs/autopilot/$(date +%Y%m%d_%H%M).log"` (15) has
minute granularity, and the catchup's `StartInterval 7200` is unaligned to the clock. Two runs
starting in the same minute both `exec >>` the same file and interleave. The loser exits at the
run lock within a second or two, so the damage is cosmetic — but the forensic log for a real failure
can have a second run's header in the middle of it.

### C4 — no trap between the run lock and line 178
`mkdir runs/.lock` happens at 98–117; `trap finish EXIT` at 178. In between is the shared-lock wait,
which can `sleep` for up to **4 hours** (138). A kill during that window leaks `runs/.lock`. It
self-heals (the next run sees a dead PID and steals it) but it adds a `STALE LOCK stolen` line to
ALERTS.log that reads like a bug and isn't. Two `exit 0` paths in that window (110, 138) also skip
`finish()`, so `runs/CHANNEL_STATUS.txt` is not updated and no alert fires for them.

### C5 — `cloud_render.py` commits the whole git index
`cloud_render.py:100–105` stages only `RENDER_INPUTS` — but then calls
`git("commit", "-m", …)` with **no pathspec**, which commits everything already in the index. The
2026-07-20 fix removed `git add -A`; it did not make the commit path-scoped. Anything a human staged
and did not commit rides along to `main` under the message
`autopilot: <topic> content for cloud render`, and is rendered.

The narrower version of the same risk is still fully open: `git add -- src` and
`git add -- content.py` sweep in **any in-progress human edit** to those paths. A person editing
`src/explainer.tsx` at 20:05 has their half-finished change pushed and rendered.

### C6 — a matching-sha workflow run from a previous dispatch can be picked up
`cloud_render.py:129–132` selects the first workflow run whose `head_sha` equals the local HEAD. When
the commit is empty (nothing in `RENDER_INPUTS` changed), HEAD does not move, so a *previous*
completed run on the same sha is a valid match — and the first poll fires 20 s after dispatch, before
the new run necessarily appears. The download would then be **a previous render of the same sha**.
The 50 MB and sha256 checks would all pass; it is genuinely the same content, so this is benign in
the common case and wrong only if the source changed outside `RENDER_INPUTS`.

### C7 — a failed push still dispatches, then polls for 115 minutes
`cloud_render.py:106–109` treats a failed `git push` as non-fatal and proceeds to dispatch. The
dispatch runs against `main` as GitHub has it — i.e. the *previous* episode — and the sha match at
130 will never succeed, so the loop polls for the full `MAX_WAIT` of **115 minutes** before exiting
and falling back to the local render. That is a two-hour silent stall followed by the most dangerous
render path.

### C8 — editing the script while it runs
`daily_autopilot.sh` is 43 KB and executes for hours. zsh reads a script by byte offset, so an
in-place truncating rewrite mid-run (`>` redirection, some `sed -i` implementations) makes the shell
resume at a shifted offset and execute fragments. Most editors write-and-rename, which is safe
because the running shell keeps the old inode — but nothing in the flow guarantees that. The cheap
fix is to `cp` the script to a run-scoped temp under `runs/` and exec that.

---

## 5. Cross-run state that can go stale

| state | written by | read by | can disagree with | what happens |
|---|---|---|---|---|
| `runs/owed_episode.txt` | 432 (after BUILD OK) | 339 (REUSE decision) | `ops/episode_meta.json` topic | REUSE is only authorised on an exact match, and produced_topics is re-checked (341–344). **Sound.** Currently holds `madoff`. |
| `ops/produced_topics.json` | 501–509 only, on a real publish | 342, 387, creative agent, `yt_analytics.py` | YouTube | not atomic (S7); the update is non-fatal (AB) |
| `runs/last_post.txt` | 510 | 23, `finish()` | reality | unchecked write; an empty file silently disarms the same-day guard |
| `runs/autopilot_attempts.json` | 293 | 28 | — | fail-open both ways (R2, R15) |
| `out/review/verdict.json` | reviewer LLM | 267, 443, 458, revision agent | the render on disk | **never pruned** → S2 |
| `out/review/facts.json`, `audio_report.json` | 258, 264 (non-fatal) | reviewer LLM | the render | **never pruned** → S1 |
| `out/review/reviewed_render.json` | 256 | `upload_guard` | the bytes | correctly sha-bound — **safe** |
| `out/thumbnail.png`, `out/upload_kit.json` | 213, 220 | `yt_upload` | the render | thumbnail never cleared → S3 |
| `src/timeline.json` vs `content.py` | `gen_voice_edge` / the cloud artifact | `gate.py`, `review_facts.py`, `make_ambient`, `duck_music`, the reviewer | each other | ID-membership check only → S4 |
| `public/audio/*` VO cache | `gen_voice_edge` | build | `content.py` | keyed on narration text — **safe**; but never pruned (265 wavs for 193 scenes) |
| `runs/.lock`, `/tmp/video_autopilot.lock` | E, F | E, F, `upload_guard` | reality | C1, C2, C4 |
| `ops/routine.json` | human | A, `render()`, `gate.py`, `gen_scene_images` | the actual schedule | `"cron": "0 2 * * *"` and `_note: "produces … daily at 2AM"` while the loaded plist fires at **20:00**; `"visualMode": "doodle"` on a channel whose format is crayon. Config that lies to whoever reads it next. |

---

## 6. Resource preconditions

**There is no precondition check of any kind.** `grep -rn "df \|disk_usage\|statvfs" scripts/ *.py`
returns nothing. The flow does not check free disk, does not check the API quota, does not check
network reachability, and does not log any of the three.

* **Disk.** Discovered 6.5 hours in, as an ffmpeg muxer error inside a Remotion stack trace, on line
  ~30 000 of the log. The `render()` fallback chain commits to a **local** render — by far the most
  disk-hungry path (uncompressed WAV mix chunks plus ~29 500 frame PNGs in `$TMPDIR`) — with no idea
  how much space exists. The retry path does purge `$TMPDIR/remotion-*` and `/tmp/remotion-*` (200),
  but only *after* the first failure, and by then other writes may already have been truncated (S7).
  The sibling project already solved this: `sammy-sloth-video/scripts/daily_autopilot.sh` logs
  `power:`, `sleep-assertions:` and `disk:` at the top of every run, added 2026-08-11 after *"a
  near-miss … corrupted the webpack cache via ENOSPC."* CoreLifecycle logs none of them.
* **API quota.** `docs/TOKEN_AUDIT.md`'s opening line is the 2026-08-13 quota exhaustion that cost a
  night. The flow still has no pre-flight probe. The creative agent (J) is the first LLM call and the
  most expensive; a cheap probe there would convert a wasted night into an immediate, honest HALT.
  There is a partial mitigation — the work-fingerprint at 365–370 means an agent that dies instantly
  costs no budget — but the *run* is still consumed.
* **Network.** `cloud_render.py` handles poll blips well (125–128) and retries the artifact download
  three times with a curl fallback (157–170). This is the best-hardened resource path in the pipeline.

---

## 7. Observability

**If a night fails, is there one place that says why?** Almost, but not for the failure that
actually happens.

* `runs/autopilot/YYYYMMDD_HHMM.log` — the full run, including ~30 000 lines of ffmpeg output. The
  real cause is one line inside it.
* `runs/autopilot/status.log` — one line per run, appended by `notify()`. Good.
* `runs/autopilot/ALERTS.log` — dark-day alerts, lock steals and upload-guard decisions.
* `runs/CHANNEL_STATUS.txt` — the glanceable one: last publish, days dark, last run status.
* The alert itself is `osascript display notification` plus those files. The 2026-08-12 outage was
  invisible until someone asked, and the escalation added since is *still* a desktop notification and
  a file on the same machine. Nothing leaves the Mac.

Gaps:
* `notify()` is not called at all for the two most common failure shapes — the messages are already
  good, but "render failed/unverified" (436) does not say *why*, and the why (ENOSPC) is 30 000 lines
  up. `STATUS_MSG` should carry the last meaningful line of the failing step.
* No start-of-run resource line (disk / power / quota), unlike the sibling project.
* `runs/autopilot/` holds 308 entries and nothing prunes it.
* `docs/TOKEN_AUDIT.md`'s line citations are already stale — it points the reader at
  `daily_autopilot.sh:225` for the creative agent (now 362) and `:216` for the reviewer (now 225–266).
* `tests/` exists and passes (38 tests via `unittest`), but **pytest is not installed** on the
  framework Python the autopilot uses, and nothing in the nightly flow runs the suite.

---

## 8. Ranked risk register

Ranked by **expected cost of a dark night** (or, above the line, of a bad public post), not by how
interesting the bug is.

---

### R1 · No free-disk precondition; the local fallback is committed to blind — **HAPPENING NOW**
**What breaks.** `render()` falls through to a local Remotion render whenever the cloud path fails
for *any* reason, including a GitHub-side `cancelled`. A local render of a 16-minute episode needs
many GB of `$TMPDIR`. Nothing measures free space at any point.

**How it looks.** Exactly as it looked tonight: the run reaches `--- render ---`, polls GitHub for
81 minutes (244 polls), logs `workflow concluded 'cancelled'`, prints `rendering LOCALLY`, grinds for
~2 hours, and dies with `Error submitting a packet to the muxer: No space left on device` buried
inside an ffmpeg dump. `notify` says only `FAIL — render failed/unverified`. `CHANNEL_STATUS.txt`
says `DARK 1d`. Nothing anywhere says "disk".

**Likelihood.** Certain — it has fired four times in four days (08-14 ×2, 08-17 ×2) and the disk is
at 97 %. `docs/TOKEN_AUDIT.md` §6 flagged it on 08-15 at 5.6 GiB free.

**Fix.**
1. Log `df -h` (and `pmset -g batt`) at the top of every run, as Sammy does.
2. Before `render()`, require a floor — refuse the **local** path below ~25 GiB free and HALT with
   `notify "HALT" "insufficient disk (Xg free) — not starting a local render"`. A HALT that names
   the cause is worth far more than a 2-hour render that dies at 97 %.
3. Purge `$TMPDIR/remotion-*`, `/tmp/remotion-*`, `out/_smoke_*`, `out/_smoke_packs`, `out/scan` and
   old `runs/autopilot/*` **before** the render, not only after a failure.
4. Prune `public/audio/*.wav` for scene ids not in the current `content.py` (265 files for 193
   scenes today).

---

### R2 · The daily cap charges infrastructure failures, converting one bad render into a dark day
**What breaks.** `count_attempt` (394) fires unconditionally once the new-topic guard passes —
before the build, before the render. The fingerprint logic at 365–370 that exists precisely to avoid
charging for work not done is then bypassed. A run that dies at the render for a reason with no LLM
cost at all still spends one of two daily attempts.

Worse on the REUSE branch: the creative agent is *supposed* to write nothing, so line 369 prints
`creative agent changed no file — transient no-op, NOT counted` and line 394 immediately counts it
anyway. The comment at 392–393 (*"a successful pass always rewrites episode_meta.json, so the
fingerprint above has already counted it"*) is simply false on that branch.

**How it looks.** Tonight, exactly: two render failures → `{"date":"2026-08-17","count":2}` → the
22:14 catchup logs `2 full attempts already today — budget cap` and exits in 147 bytes. The channel
is locked dark until midnight for a reason that cost nothing in tokens. Every subsequent catchup logs
the same two lines and no alert fires, because `finish()` never runs for that exit path.

**Likelihood.** Certain — it is the live state.

**Fix.** Charge the budget for **creative work consumed**, which is what the fingerprint already
measures — drop the unconditional `count_attempt` at 394 and keep the one at 367. Then either
refund on a non-creative failure, or gate the cap on LLM cost rather than run count. At minimum,
make the cap exit call `notify` so the day going dark at the cap produces an alert instead of
silence.

---

### R3 · The reviewer judges tonight's episode with last episode's measurements — **silent**
**What breaks.** S1. `facts.json` and `audio_report.json` survive the review prune and are written by
non-fatal calls.

**How it looks.** A verdict that reads completely normally and cites specific numbers — runtime,
WPM, chapter timestamps, per-scene word coverage — all of which belong to a different video. Either
a phantom "revise" (burns a render and a fix pass on nothing) or an "approve" of an episode nobody
measured. Nothing in the log distinguishes it from a good review; the only trace is a single
`review_facts failed (non-fatal)` line 100 lines above the reviewer's output.

**Likelihood.** Medium — needs `review_facts.py` or `qa_audio.py` to throw. Neither has any
top-level exception handling, so any new/renamed field in `content.py` is enough.

**Fix.** Add `rm -f out/review/facts.json out/review/audio_report.json out/review/verdict.json` to
the existing prune at 236. Absence is safe — `REVIEW_PROMPT.txt:49` already says *"If the file is
missing, fall back to measuring by hand"*. Staleness is not.

---

### R4 · A failed reviewer call makes the runner act on the previous run's verdict — **silent**
**What breaks.** S2. Line 265 is unchecked and `verdict.json` is never deleted.

**How it looks.** `revise` → a fix agent applying another episode's notes, then a full rebuild and
re-render (hours), then a second review. `approve` → a publish attempt that `upload_guard` blocks on
a single mtime comparison, reported as `FAIL — upload step failed` with no hint that the reviewer
never ran.

**Likelihood.** Medium-high. The reviewer is the most expensive call in the pipeline (mean $8.97,
peak 237 k context tokens per `TOKEN_AUDIT.md` §1) and shares an account with interactive work; the
2026-08-13 rate-limit already killed a creative call the same way.

**Fix.** Two lines. Delete `verdict.json` in the prune (R3's fix covers it), and check the call:
```zsh
"$CLAUDE" --print --model sonnet "$(cat docs/REVIEW_PROMPT.txt)" \
  || { notify "HALT" "reviewer agent failed — not publishing unreviewed. See $LOG"; exit 0; }
```
Also tighten `upload_guard`'s check 8 from *verdict newer than render* to *verdict newer than
`reviewed_render.json`*: the stamp is written immediately before the reviewer starts
(`daily_autopilot.sh:256`), so it is a much sharper "this verdict came from this review".

---

### R5 · The previous episode's thumbnail published on tonight's video — **silent and public**
**What breaks.** S3. `npx remotion still Thumbnail` (213) is unchecked; `render()` clears the mp4 but
not the PNG; `gen_packaging.py:247` hardcodes the path with no freshness check.

**How it looks.** A correct video with the wrong face and the wrong number on the card, live on the
channel. The log shows a Remotion error at line 213 and then a completely normal `PUBLISHED`. The
reviewer would catch it *if* it inspects the thumbnail — but the thumbnail is not among the frames it
is handed, and `REVIEW_PROMPT.txt` points it at `facts.json "packaging"`, which is derived from
`ops/episode_meta.json`, not from the PNG.

**Likelihood.** Low-medium (a Thumbnail still is a small, reliable render) — but the cost is a bad
public post, not a dark night, which is why it sits above several likelier findings.

**Fix.** `rm -f out/thumbnail.png` in `render()` alongside the mp4 (181), and check the still:
```zsh
npx remotion still Thumbnail out/thumbnail.png --timeout=60000 \
  || { notify "HALT" "thumbnail still failed — out/thumbnail.png would be STALE. Not publishing."; exit 0; }
```
Optionally have `gen_packaging.py` assert `os.path.getmtime("out/thumbnail.png") >=
os.path.getmtime("out/episode.mp4")`.

---

### R6 · Both projects steal the shared lock from a live holder after 3 h
**What breaks.** C1 — `daily_autopilot.sh:130` overrides the liveness check with an unconditional age
test, contradicting its own comment two lines up. `sammy-sloth-video/.../daily_autopilot.sh:122` does
the same.

**How it looks.** `stealing stale /tmp/video_autopilot.lock (… lock age 11000s > 3h)` in ALERTS.log,
then two heavy pipelines on an 8 GB Mac. The visible symptom is not "lock stolen" — it is a render
that stalls, a `seekToFrame` hang, or ENOSPC. All three have been blamed on other causes.

**Likelihood.** Medium-high. CoreLifecycle runs routinely exceed 3 h (tonight's cloud poll alone was
81 minutes before the local render even started).

**Fix.** Delete the unconditional age branch and rely on `_lock_stale` alone, as the `runs/.lock`
path already does — its PID-reuse hardening is exactly what makes the raw age heuristic unnecessary.
Keep a much longer backstop (8–12 h) if one is wanted. The same change is needed on the Sammy side
for the queue to actually queue.

---

### R7 · No atomic state writes; an ENOSPC mid-write destroys the duplicate-guard history
**What breaks.** S7. `ops/produced_topics.json` is rewritten in place at 501–509, immediately after a
successful upload — the moment the disk is fullest.

**How it looks.** A published episode, then a truncated or empty `produced_topics.json` and a
`produced_topics update failed (non-fatal)` line. Days later the creative agent re-produces an
already-published topic and the guard at 387 waves it through because the history is gone. The only
remaining defence is `yt_upload.py`'s `title_live` check against the last 25 uploads.

**Likelihood.** Low per night, but the disk is at 97 % and the consequence is losing the state that
three separate guards depend on.

**Fix.** One helper — `json.dump` to `path + ".tmp"`, `os.replace(tmp, path)` — applied to
`produced_topics.json`, `uploads.json`, `autopilot_attempts.json`, `upload_kit.json` and
`timeline.json`. `gen_scene_images.py:170` already does exactly this and can be copied.

---

### R8 · The "final gate" gates almost nothing about the file
**What breaks.** S5 + S4. `gate.py out/episode.mp4` adds only a 1 MB existence check over the
pre-render run; `render()`'s only file assertion is > 50 MB.

**How it looks.** A truncated, wrong-length or silent mp4 passing the final gate and publishing.
Both checks pass on any file that is merely large.

**Likelihood.** Low today (the cloud stitch job asserts > 30 MB and the local path is usually all-or-
nothing) — but this is the last checkpoint before a public post, and it does not look at the artifact.

**Fix.** In the file-argument mode, `ffprobe` the duration and assert it matches
`src/timeline.json`'s `totalFrames / FPS` within a couple of seconds, and assert a non-silent audio
stream. Both are cheap and turn the final gate into an actual gate.

---

### R9 · `cloud_render.py` commits the whole index, and a failed push still costs 115 minutes
**What breaks.** C5 and C7.

**How it looks.** (C5) `git log` on `main` shows unrelated work under
`autopilot: <topic> content for cloud render`, and the render consumed a half-finished edit. (C7) the
log shows `cloud_render: git push failed`, then `waiting for run to appear...` 345 times, then a
local render — i.e. R1.

**Likelihood.** C5 medium (any human staging or editing `content.py`/`src/` during a run — and this
audit's own commit is in exactly that window). C7 low.

**Fix.** Make the commit path-scoped: `git commit -m … -- content.py src ops/episode_meta.json
docs/research`. Make a failed push fatal — dispatching a render of content GitHub does not have can
only waste time.

---

### R10 · The reviewer's frame floor is one
**What breaks.** `daily_autopilot.sh:246` HALTs only below **1** frame. `qa_watch.py` samples 48; a
partial failure (ffmpeg dying at frame 4 of 48) satisfies the floor and additionally triggers
`qa_sample.py` via the `||`.

**How it looks.** A confident verdict on a 16-minute video the reviewer saw four frames of. The log
line `review frames: 4 (all from THIS render)` is the only tell, and it reads like a success.

**Likelihood.** Low-medium. The cost is an approved defect, which is why it is not lower.

**Fix.** Floor at ~40 (or `QA_FRAMES × 0.8`), and print the expected count alongside the actual.

---

### R11 · The daily cap is fail-open in two places
`ATT_COUNT` (28) swallows every error into an empty string, which `${ATT_COUNT:-0}` turns into 0 —
an unreadable or corrupt ledger silently disables the cap. `count_attempt` (293) ends in
`|| true`, so a failed write silently stops it incrementing. Both directions are silent; combined with
R2 (fail-closed on infra failures) the budget can be simultaneously too strict and unenforceable.
**Fix:** distinguish "file absent" (0, fine) from "read failed" (treat as at-cap, and say so).

---

### R12 · A failed revision agent burns two renders proving nothing changed
Line 453 is unchecked. If the agent dies immediately, the loop rebuilds identical content, re-renders
(hours), re-reviews (the most expensive call in the pipeline), gets the same verdict, and repeats
once more before HALTing. The creative step already has the right tool for this — a work fingerprint
(366–370). The revision step has none. **Fix:** fingerprint `content.py` + `src/*.tsx` around the
call and HALT if nothing changed.

---

### R13 · `upload_guard`'s in-flight check is the un-fixed twin of the 08-12 PID bug
C2 — `upload_guard.py:130` uses a bare `kill -0`. It fails safe, but it blocks manual recovery
precisely when recovery is needed, with no way past except the review override.
**Fix:** reuse the started-before-the-lock test from `daily_autopilot.sh:49–94`.

---

### R14 · Silent audio degradations
`audio_master.py` is non-fatal (209) → an un-mastered episode publishes at the wrong loudness.
`duck_music.py` can never fail (S10) → the whole ducking + SFX layer can be absent with one unread
log line. `make_ambient.py:30–33` seeds the score from `topic=""` if the meta is unreadable, with no
log. `gen_voice_edge.py:189–196` falls back from `scipy.signal.resample_poly` to linear
interpolation on any exception with **no message at all**. `qa_audio.py` writes the report the
reviewer uses as "your ears" — and its own failure is non-fatal (R3).
**Fix:** log every one of these fallbacks with a `!!` prefix so a grep of the log finds them.

---

### R15 · `out/upload_kit.json` silently drops unknown meta fields
S8. Low cost today (nothing new is being added), but it is a trap laid for the next feature: an agent
sets a field, the meta shows it, YouTube never sees it, and no error is produced anywhere.
**Fix:** carry unknown `ops/episode_meta.json` keys through, or log the dropped ones.

---

### R16 · Observability gaps
`notify` messages do not carry the failing step's last line (R1's disk error is 30 000 lines up); no
start-of-run resource line; the cap-exit and lock-HALT paths skip `finish()` so no alert fires;
`runs/autopilot/` is unpruned at 308 entries; alerts never leave the Mac; `TOKEN_AUDIT.md`'s line
citations are stale; the test suite is not runnable under the autopilot's Python (no pytest) and is
never run nightly.
**Fix (cheapest first):** log `df -h` + `pmset -g batt` at run start; put the failing command's last
line into `STATUS_MSG`; call `notify` on the budget-cap and lock-HALT exits; add one off-machine
alert (a webhook or an email on `DARK >= 1`).

---

### R17 · Config that lies to the reader
`ops/routine.json` says `"cron": "0 2 * * *"` and *"produces+reviews+publishes daily at 2AM"* while
the loaded plist fires at **20:00**; `"visualMode": "doodle"` on a channel whose format is crayon and
whose retired format was called doodle (it is inert — `gen_scene_images.py` only acts on `"photo"` —
but it reads as a live setting naming the retired format). Cost is measured in a human's confusion
during an incident, which is when confusion is most expensive.

---

### R18 · Editing the running script
C8. Low likelihood, unbounded consequence, one-line fix (exec a run-scoped copy).

---

## 9. Already safe — verified, do not re-harden

* **Lock liveness against PID reuse** (`daily_autopilot.sh:49–94`). The "holder started after the
  lock was created" test is *sound*, not a heuristic: a recycled PID is by definition assigned to a
  process that forked after the original died, therefore after the lock directory existed. The
  120 s slack, the `holder_cmd` cross-check, and failing-toward-steal on an undeterminable holder are
  all correct. This closed the 08-12 outage properly. (`upload_guard.py:130` is a separate copy that
  was not updated — R13.)
* **`upload_guard.py`'s sha256 binding.** An approval blesses bytes, not a filename. The stamp, the
  re-hash at upload, the in-flight lock check, the `--publish-without-review-approval` +
  `--override-reason` pair, and the loud dual-log all work as documented. 38 unit tests pass,
  including the override path. This genuinely closes the 08-17 hand-run incident.
* **`package()`'s `gen_packaging.py` check** (220–223). The stale-kit hole is closed.
* **The stale-frame prune** (236–237) for `*.png` and the three watch dirs. Correct as far as it
  goes — it just needs the three JSONs added (R3).
* **Write-by-default + short-circuit detection** (297–380). The runner decides REUSE vs WRITE from
  `runs/owed_episode.txt`, the agent is told which branch it is on, and a pass that came back on the
  same topic with no research change is rejected. This closes the "validated the episode already on
  disk" bug, and the owed marker is correctly cleared on publish (511), on a non-approve verdict
  (466) and on a final-gate failure (473).
* **The anti-duplicate new-topic guard** (386–391) and the removal of `--force` from the episode
  upload (497).
* **`yt_upload.py`'s chunked resumable upload** (136–165): 16 MB chunks, six tries, exponential
  backoff, a reset failure budget on each landed chunk, and a deliberate re-raise on non-transient
  HTTP codes. This is the best error handling in the repo.
* **`cloud_render.py`'s download path** (150–172): `add_unredirected_header` so the token is not
  re-sent to Azure, zip validation, three attempts, a `curl -sL` fallback. Also its poll-blip
  tolerance (125–128).
* **`build.py`'s syntax gates** (26–35) and the two-frame smoke render (69–73) before the long render.
* **`gen_voice_edge.py`** does **not** fall back to silent audio — six retries then `raise`, uncaught,
  non-zero exit. The cache key includes the narration text, so an edited scene always re-synthesises.
* **`build_capped.sh`**: a file-backed attempt ledger that survives the tool call being killed, and
  refuses rather than drifting past the cap.
* **`staging_check.py`**: a checker that cannot parse is a HALT, not a pass; the `UNVERIFIED`
  whitelist cannot be silently widened (an unlisted underivable role is a hard FAIL).
* **`gate.py`'s exit contract**: no path returns 0 with a non-empty `fails`; `GATE_STYLE_FRAMES=0` is
  announced, not silent.
* **`${pipestatus[1]}`** at 412 and 421 — correct for zsh's 1-indexed array.
* **`autoShorts:false`** — correctly off; the whole Short path would post retired-format branding.

---

## 10. What I could not determine without running the pipeline

Stated plainly rather than guessed at:

* **Whether R5 has ever actually fired.** I did not find a published episode with a mismatched
  thumbnail; establishing that would mean comparing every `out/uploads.json` entry against the live
  channel, which is a network operation against production.
* **The real free-space requirement of a local render.** I did not run one. The ENOSPC in tonight's
  log happened while writing a ~98 MB audio chunk with 6.3 GiB free, which bounds it from below but
  does not give the true figure. The ~25 GiB floor in R1's fix is an engineering estimate, not a
  measurement — measure it on the next successful local render before hard-coding it.
* **Why the GitHub workflow concluded `cancelled`** on run 32086857638. That is on the GitHub side
  and needs the Actions log, which I did not fetch. It matters: if cancellations are frequent, the
  local fallback (R1) is being taken far more often than the design assumes.
* **Whether C6 (matching-sha pickup of a previous run) has ever selected a stale artifact.** It needs
  the workflow-run history for a repeated sha; I reasoned it from the code only.
* **Whether Sammy's shared-lock holder is ever written without a PID.** I read the current source
  (it does write `holder`), but not its history, so a legacy pid-less lock left by an older Sammy
  version would take CoreLifecycle down the >3 h legacy branch at line 67–69.
* **The exact behaviour of `zipfile.extractall`'s mtimes** for GitHub artifact zips, which is the
  input to `upload_guard`'s check 8 on the cloud path. The check held in every case I could reason
  through, but it depends on a timestamp GitHub controls, and that is worth replacing with the
  stamp-based comparison in R4's fix regardless.

---

## 11. The thing I would fix first, and the thing not on the brief

**First:** R1 and R2 together, tonight. They are not independent — R1 darkens a night and R2 makes
that night un-retryable. Three lines of `df` and one deleted `count_attempt` would have let tonight's
22:14 catchup run, and it would have HALTed in ten seconds with the word "disk" in the alert instead
of exiting silently at a budget cap.

**Not on the brief, and I think it belongs near the top:** the pipeline has excellent *guards* and
almost no *preconditions*. Every incident in the brief's history was caught, eventually, by something
downstream — a duplicate-title check, a sha256 stamp, an anti-duplicate topic guard, a frame-count
floor. Those are all detectors of a wrong thing that has already been built. What is missing at every
level is the cheap question asked **before** committing: is there disk, is there quota, is the lock
really free, did the previous step actually write its file. The most expensive failures in this
pipeline's history were all discovered hours after the point where a one-line check would have
answered them for free.

The second-order version of the same observation: **`out/` is treated as a workspace, but it is
read as a contract.** `render()` clears `episode.mp4` and `review()` clears `*.png` precisely because
someone was bitten by each. Every other artifact in `out/` — the thumbnail, the kit, the verdict, the
facts, the audio report — is still "whatever was there last". The general fix is not more guards; it
is a single `rm -rf out/review` + explicit artifact clearing at the top of each stage, so *absence*
rather than *staleness* is the failure mode. Absence is loud. Staleness is what publishes the wrong
episode.
