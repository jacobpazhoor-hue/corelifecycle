# CoreLifecycle token + cost audit

**Date:** 2026-08-15 · **Scope:** the nightly path in `scripts/daily_autopilot.sh` (launchd 20:00 +
2-hourly catchup) · **Brief:** *"as efficient as possible without risking quality but limiting token
usage."*

**Why now:** on 2026-08-13 the account's API quota was exhausted, the creative step's `claude` call
was rate-limited, and **nothing published**. This pipeline shares an API account with interactive
work, so tokens here are the difference between the channel posting and going dark.

**Nothing in this audit was changed.** This file is the only addition. Every recommendation below is
a proposal; the two that touch measured canon are called out as things I recommend **against**.

---

## 0. Where the numbers come from

Everything in this document is measured, not estimated, unless a row says "est".

* **Prompt/doc sizes:** `wc -c` / `wc -w` on the files in `docs/`.
* **Real token + cost figures:** the Claude Code session transcripts in
  `~/.claude/projects/-Users-jacobpazhoor-CoreLifecycle/*.jsonl`, which record `usage` per API turn
  (`input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`, `output_tokens`).
  Sessions are attributed to a role by their first user message (it is the prompt the shell passed).
  35 autopilot sessions from 2026-08-04 to 2026-08-15 were parsed.
* **Dollar figures** price those tokens at Sonnet rates ($3 / $3.75 / $0.30 / $15 per Mtok for
  input / cache-write / cache-read / output). Dollars are a proxy; the number that actually kills a
  night is **total context tokens moved**, which is given alongside.
* **Image token cost** uses the documented resize rule: a 1920×1080 PNG is scaled to 1568×882 and
  costs ≈ 1568×882/750 ≈ **1,844 tokens**.

---

## 1. Every LLM call in the nightly path

All six calls are `claude --print --model sonnet`. There is no model variation anywhere in the
pipeline today.

| # | Call | Where | Prompt handed in | Model | Max/night | Measured cost per invocation (context tokens / $) | Earns its cost? |
|---|---|---|---|---|---|---|---|
| 1 | **Creative agent** | `daily_autopilot.sh:225` | `docs/AUTOPILOT_PROMPT.txt` (31,817 B) + it reads BIBLE 62,436 B, CRAYON_BIBLE 14,085 B, TEMPLATES 40,945 B, 4 ops JSONs (161,146 B) | sonnet | 2 counted + **unbounded uncounted** (see §5) | full write: 5.7M–35.6M / **$9.07–$17.64**; reuse-branch runs: 0.9M–2.5M / $0.80–$2.31 | **Yes.** Writes a ~200-scene script to six simultaneous numeric bands. Nothing else can do this. |
| 2 | **Gate-repair agent** (new, WO-32) | `daily_autopilot.sh:262` — inline 3.4 KB prompt + `tail -40` of the build log | inline only; instructs reading BIBLE §3/§3a | sonnet | 1 per attempt → **2** | **never fired** — no session in 11 days of logs matches its prompt. est 5M–8M / ~$4–6 | **Probably.** One cold run left a well-formed 220-scene episode at 136.4 WPM = a hard HALT and a dark night. Cheaper than losing the night. Unproven. |
| 3 | **Reviewer** | `daily_autopilot.sh:216` (`review()`) | `docs/REVIEW_PROMPT.txt` (12,323 B) + **48 PNG frames (88,510 tok)** + content.py, timeline.json, audio_report.json, research, BIBLE, CRAYON_BIBLE | sonnet | **3 per attempt → 6** | 4.7M–18.1M / **$3.50–$13.35** (mean $8.97 crayon-era) | **Yes, and it is the most expensive thing in the pipeline.** It caught a wrong stat card and a clipped overlay on 2026-08-15. It is the only thing between the pipeline and a public post. |
| 3b | **Fact-checker sub-agent** | spawned *by* the reviewer, not by the shell | ad-hoc prompt: cross-check every narration/overlay/card claim against `docs/research/<slug>.md` | sonnet | 0–1 per review pass (**model's discretion, uncapped**) | folded into the parent session (session `37d14fd5`, $13.13 total) | **Yes** in principle — accuracy is the highest-severity rubric item. But it is undeclared and uncapped; the reviewer may spawn one, several, or none. |
| 4 | **Revision agent** | `daily_autopilot.sh:290` — inline 1.9 KB prompt | inline only; reads `verdict.json`, then explores | sonnet | **2 per attempt → 4** | 3.7M–13.2M / **$1.72–$7.21** (mean $5.18) | **Yes**, but it is the worst offender for turn count (101–123 turns, one tool call per turn). |
| 5 | **Short reviewer** | `daily_autopilot.sh:362` | `docs/SHORT_REVIEW_PROMPT.txt` (2,072 B) + `out/review/short_watch/*.png` | sonnet | **0** | n/a | **Correctly disabled.** `autoShorts:false` since 2026-07-19 (12 Shorts, ~4 views median). Leave it off. |
| — | *Improve loop* (`improve_loop.sh`, 4 Ralph passes at 12:30) | `ops/com.corelifecycle.improve.plist` | — | — | **0 — plist is not loaded** (`launchctl list` shows only `daily` and `catchup`) | — | Out of the nightly path. Worth knowing it exists: loading it would add 4 uncapped agent passes/day on the same account. |

### Measured session log (all autopilot sessions, 2026-08-04 → 2026-08-15)

| date | time | role | turns | image blocks | cache-read | output | context total | $ |
|---|---|---|---|---|---|---|---|---|
| 08-04 | 17:12 | CREATIVE | 186 | 16 | 33.2M | 274,835 | 33.9M | 16.64 |
| 08-04 | 19:14 | REVIEWER | 77 | 96 | 8.8M | 120,536 | 10.1M | 9.32 |
| 08-04 | 19:20 | REVISION | 65 | 0 | 3.6M | 22,084 | 3.7M | 1.72 |
| 08-04 | 21:16 | REVIEWER | 76 | 96 | 10.0M | 68,145 | 11.4M | 9.20 |
| 08-05 | 22:32 | CREATIVE | 112 | 0 | 15.7M | 261,969 | 16.3M | 10.69 |
| 08-06 | 19:15 | CREATIVE | 111 | 0 | 16.2M | 188,452 | 16.7M | 9.60 |
| 08-07 | 06:05 | REVIEWER | 95 | 98 | 12.7M | 77,900 | 13.9M | 9.30 |
| 08-08 | 08:01 | CREATIVE | 148 | 22 | 29.3M | 222,173 | 30.0M | 14.97 |
| 08-10 | 19:09 | CREATIVE | 135 | 0 | 19.0M | 191,355 | 19.6M | 10.82 |
| 08-11 | 23:05 | REVIEWER | 73 | 96 | 7.5M | 117,389 | 8.9M | 9.06 |
| 08-11 | 23:10 | REVISION | 123 | 0 | 11.4M | 78,687 | 11.6M | 5.36 |
| 08-14 | 01:25 | CREATIVE | 168 | 20 | 34.9M | 283,931 | **35.6M** | **17.64** |
| 08-15 | 06:43 | CREATIVE | 19 | 0 | 1.0M | 15,453 | 1.2M | 1.02 |
| 08-15 | 07:39 | REVIEWER | 66 | 38 | 7.0M | 121,605 | 7.5M | 5.89 |
| 08-15 | 07:48 | REVISION | 123 | 8 | 12.9M | 95,840 | 13.2M | 6.42 |
| 08-15 | 08:51 | REVIEWER | 94 | 104 | 12.9M | 148,991 | 14.9M | **13.35** |
| 08-15 | 08:59 | REVISION | 101 | 8 | 10.9M | 176,677 | 11.2M | 7.21 |
| 08-15 | 11:15 | CREATIVE | 37 | 0 | 2.4M | 14,064 | 2.5M | 1.45 |
| 08-15 | 12:35 | REVIEWER | 137 | 102 | 16.3M | 113,370 | **18.1M** | 13.13 |

Role averages across all 35 sessions: **CREATIVE** $5.76 avg / $17.64 max / 68.7 turns · **REVIEWER**
$8.74 avg / $13.35 max / 81.6 turns / **85.8 image blocks** · **REVISION** $5.18 avg / $7.21 max /
**103.0 turns**.

Daily totals: 08-04 **$38.27** · 08-08 $21.44 · 08-11 $22.76 · 08-14 $23.62 · **08-15 $48.47**.

---

## 2. Prompt and canon sizes — measured

| file | bytes | words | ~tokens | read by | note |
|---|---|---|---|---|---|
| `docs/AUTOPILOT_PROMPT.txt` | **31,817** | 4,829 | ~7,954 | creative (as the prompt) | |
| `docs/BIBLE.md` | **62,436** | 10,389 | ~15,609 | creative, reviewer | "READ FIRST", in full |
| `docs/TEMPLATES.md` | **40,945** | 6,541 | ~10,236 | creative | **legacy catalog it is forbidden to use** |
| `docs/CRAYON_BIBLE.md` | 14,085 | 2,185 | ~3,521 | creative, reviewer | read-only style spec |
| `docs/REVIEW_PROMPT.txt` | **12,323** | 1,826 | ~3,080 | reviewer (as the prompt) | |
| `docs/SHORT_REVIEW_PROMPT.txt` | 2,072 | 298 | ~518 | short reviewer (disabled) | |
| `ops/improvements.json` | **125,531** | — | ~31,382 | creative ("READ FIRST") | 68 backlog + **49 `done` (44,786 B)** |
| `ops/topic_queue.json` | 12,349 | — | ~3,087 | creative | |
| `ops/analytics.json` | 15,091 | — | ~3,772 | creative | prompt says **ignore it** |
| `ops/produced_topics.json` | 8,175 | — | ~2,043 | creative, reviewer | |
| `content.py` | 65,278 | — | ~16,319 | reviewer, revision | |
| `src/timeline.json` | 56,855 | — | ~14,213 | reviewer | |
| `out/review/audio_report.json` | 39,207 | — | ~9,801 | reviewer | |
| **`out/review/watch/*.png`** | **48 files, 49.6 MB** | — | **~88,510** | reviewer | **the single largest input in the pipeline** |
| `docs/research/crayon/*` | 21 MB dir; COMPARISON.md 34,411 B | — | — | **nobody, nightly** | referenced by BIBLE/CRAYON_BIBLE as provenance only — no nightly agent reads it. Not a cost. |

**Creative agent front-load:** 31,817 + 62,436 + 14,085 + 40,945 + 161,146 (ops) = **310,429 B ≈
77,600 tokens** before it writes a word — and every one of those tokens is re-sent on all 19–186
turns of the session.

**Reviewer front-load:** 12,323 (prompt) + 88,510 tok (frames) + 65,278 + 56,855 + 39,207 + research
≈ **~150,000 tokens**, resident for all 66–137 turns. Measured peak context: **237,056 tokens**
(session `b9a8651b`).

### Growth during the restyle (the brief's suspicion, confirmed)

| file | 2026-08-11 (WO-10, format swap) | 2026-08-13 (now) | growth |
|---|---|---|---|
| `docs/AUTOPILOT_PROMPT.txt` | 12,571 B | 31,817 B | **+153%** in 2 days, 8 commits |
| `docs/BIBLE.md` | 25,888 B | 62,436 B | **+141%** |
| `docs/REVIEW_PROMPT.txt` | 5,629 B (unchanged since 07-04) | 12,323 B | **+119%** in one commit |

Total nightly canon went from ~44 KB to ~107 KB in 48 hours.

### Redundancy — where it actually is

**(a) 53% of `AUTOPILOT_PROMPT.txt` restates `BIBLE.md`, which the same agent reads in full.**
Block-by-block:

| prompt block | lines | bytes | restates |
|---|---|---|---|
| SCENE GRANULARITY / rhythm rule | 56–100 | 3,982 | BIBLE §3a (lines 141–320) |
| THE HOOK, five steps | 101–110 | 641 | BIBLE §4 |
| BODY / chapters / reversal / ending | 111–128 | 1,443 | BIBLE §5, §7 |
| THE NUMBERS + register + dialogue | 130–152 | 1,741 | BIBLE §3, §6 |
| TEMPLATES + PERIOD + histogram | 153–201 | 4,331 | BIBLE §8 |
| PACKAGE COPY / thumbnail archetypes | 202–254 | 4,712 | BIBLE §9 + CRAYON §9 |
| **total duplicated** | | **16,850 B (53%)** | |
| WO-32 headless / build-timeout | 275–301 | 2,492 | **unique** |
| WO-32 failed-check list + WPM predictor | 303–360 | 5,159 | **unique** |

The prompt is candid about it — line 130 literally says *"THE NUMBERS YOUR SCRIPT MUST HIT (measured;
BIBLE.md §3 has the full table)"*. Verbatim overlap is only 5.8% of the prompt (268 words in 16 runs
of ≥12 words); the duplication is **semantic**, which is why a diff does not show it. Sample verbatim
runs that do appear in both:

> *"uses THESE AND NOTHING ELSE: officeFloor, boardroom, exchangeFloor, cityStreet,
> domesticInterior, newsMontage, bankExterior, courtHearing, factoryFloor, broadcastDesk,
> crowdQueue, closeUpPortrait, chartBoard"* — 34 words, in AUTOPILOT_PROMPT ×2, BIBLE §8, and twice
> more inside `daily_autopilot.sh` (the gate-repair prompt line 266 and the revision prompt line
> 290). **Five copies of the same 13 names ship every night.**

> *"our longest hold is 9.8s where theirs runs to 16.5s. Ours never pauses."* — 16 words, in
> AUTOPILOT_PROMPT lines 65–66 and BIBLE §3a.

**(b) `docs/TEMPLATES.md` — 40,945 B / ~10,236 tokens read only to be told not to use it.** The
prompt's own description (lines 13–15):

> *"docs/TEMPLATES.md — the LEGACY scene-template catalog. It does NOT list the thirteen restyled
> explainer environments this format uses… Do not emit a legacy name."*

The thirteen legal names are given inline in the prompt twice. The agent gains nothing from the
catalog and is at risk of copying from it.

**(c) `ops/improvements.json` — 125,531 B / ~31,382 tokens in READ FIRST**, of which the `done` array
is 49 shipped items / **44,786 B / ~11,200 tokens** of pure history. Step 6 only asks the agent to
move shipped items to `done` and add 1–3 ideas.

**(d) `ops/analytics.json` — 3,772 tokens the prompt explicitly tells the agent to ignore**
(lines 17–19): *"analytics are from the OLD POV format — they say nothing about which explainer
subjects work. Ignore their topic guidance until this format has its own view data."* The shell
refreshes it at step 0 every run regardless.

**(e) A genuinely superseded — and now factually wrong — line in `BIBLE.md`.** Line 125:

> *"The synth rate is `RATE = "-13%"`, measured (not assumed) at 149.1 speech / 145.7 runtime."*

`gen_voice_edge.py:64` is **`RATE = "-7%"`** (`CACHE_VERSION = "v7"` — *"OWNER retune, -10% -> -7%"*),
and BIBLE line 226 correctly says `-7%` thirty lines later. The writer canon contradicts itself about
the one constant that governs the WPM band it HALTs on. This is a correctness bug, not just bloat.

---

## 3. Model choice

Every call is sonnet. My conclusions, conservative on purpose:

| call | smaller model? | reasoning |
|---|---|---|
| **Reviewer** | **No. Do not downgrade.** | It holds a 237k-token context containing 48 images, cross-checks facts against a research doc, measures a 202-scene timeline, and is the last gate before a public YouTube post. Vision-plus-long-context judgement is precisely where a smaller model degrades first, and its failure mode is *silent approval*, which publishes the defect. It caught a wrong stat card and a clipped overlay on 2026-08-15 — both are exactly the class of thing a cheaper model glosses. |
| **Creative** | **No. Do not downgrade.** | Writes ~2,000–3,100 words across ~200 scenes while simultaneously holding runtime-inclusive WPM 145–152, syllables/word 1.42–1.45, mean scene 4.5–5.5s, sd ≥2.3s, a template histogram cap, and a device budget. Cold runs of this prompt on *sonnet* already failed five of those checks (WO-32). There is no headroom to spend. |
| **Revision agent** | **No** — but for a different reason. | It applies the reviewer's verdict literally into `.tsx` and `content.py`. A weaker model here does not produce a cheaper fix, it produces a *wrong edit* that the next review pass has to catch, costing a whole extra review + render. Its cost problem is turn count (103 avg), not model. |
| **Gate-repair** | **Plausibly haiku — but I do not recommend it yet.** | It is the narrowest task (fix one named gate failure, same topic, no creative judgement). But it has **never fired**, so there is zero evidence about how hard it actually is, and its failure mode is a HALT that darkens the channel. Revisit after it has run 5 times on sonnet. |
| **Fact-checker sub-agent** | **Possibly haiku.** | Mechanical cross-reference of claims against one document. Lowest-judgement task in the pipeline. But it is spawned at the reviewer's discretion with an ad-hoc prompt, so there is no place to set the model without formalising it first. |

**There is no safe model downgrade available in this pipeline today.** Every saving below is
structural.

---

## 4. Retry and loop amplification — worst case

### Shell-level loops (all bounded)

```
per attempt:  creative ×1  →  build  →  [gate-repair ×1 + rebuild]  →  render ×1
              →  review ×1  →  while decision==revise && tries<2:
                                   revision ×1 → build → render ×1 → package → review ×1
```

Per attempt: **1 creative + 1 gate-repair + 3 reviewer + 2 revision = 7 LLM sessions, 3 full
renders.** `MAX_BUILDS_PER_DAY=2` → **14 LLM sessions and 6 full renders per night.**

### Agent-internal loops (unbounded)

Two prompts instruct an agent to loop with no cap:

* `AUTOPILOT_PROMPT.txt:290` — *"IF THE CALL TIMES OUT, RUN THE SAME COMMAND AGAIN… Repeat until it
  prints either BUILD OK or a real gate failure you can act on."*
* `daily_autopilot.sh:266` (gate-repair) — *"run `python3 build.py` in the FOREGROUND… until it
  prints BUILD OK or a different failure."*

Both are bounded only by the CLI's own turn limit. The instruction is correct — the VO cache does
make each re-run cheaper — but "repeat until" with no count is the shape of a runaway.

### The real amplification bug: the daily budget only counts *successful* creative passes

`daily_autopilot.sh:241` increments `runs/autopilot_attempts.json` **after** the step-1b new-topic
guard, deliberately (comment: a 2026-07-24 fix so two transient failures could not burn the day's
budget). The consequence:

> **A creative agent that fails *after doing work* is never counted, so the 2-hourly catchup can fire
> up to 12 times a day, spending a full creative session each time, with `MAX_BUILDS_PER_DAY=2`
> never reached.**

Evidence in the logs: **2026-08-14 has three creative sessions** ($17.64, $0.80, $1.68) against a cap
of 2. On the specific 2026-08-13 quota-exhaustion this was self-limiting — those invocations cost
$0.00 and 1 turn because the rate limit hit immediately. The dangerous case is the *partial* failure:
research done, content half-written, agent dies — repeated up to 12×.

### Worst-case night, before recommendations

Using measured **maxima** per role (gate-repair estimated, never observed):

| | sessions | context tokens | $ |
|---|---|---|---|
| creative ×2 | 2 | 71.2M | 35.3 |
| gate-repair ×2 (est) | 2 | ~16M | ~10 |
| reviewer ×6 | 6 | 108.6M | 80.1 |
| revision ×4 | 4 | 52.8M | 28.8 |
| **total** | **14** | **~249M** | **~$154** |
| *plus* uncounted failed-creative catchups | up to +10 | unbounded | unbounded |

Heaviest **observed** day: 2026-08-15, 7 sessions, **68.7M context tokens, $48.47** — and that day
still did not publish a public video.

**Renders:** 6 cloud renders × 22 GitHub Actions jobs (1 prepare + 20 shards + 1 stitch, from
`shards = max(8, min(20, ceil(29112/1250)))` = 20) = **132 runner jobs / night**, roughly
2,000–2,500 runner-minutes. Free (public repo) but not free in wall clock.

---

## 5. Wasted work

1. **The reviewer reads 48 images one per turn.** Measured tool-call histogram for session
   `b9a8651b`: `{1 tool call per assistant turn: 69}` — **never more than one**. 50 distinct PNGs,
   50 turns. Because each API turn re-sends the whole accumulated context, loading N images serially
   costs O(N²): the 48th frame sits on top of 47 × 1,844 = 86,668 tokens of earlier frames. This
   alone accounts for ~2.2M of the session's 14.9M context tokens, before the ~44 remaining
   analysis turns each re-pay the full 88,510-token image block.
2. **The reviewer re-derives the same measurements by hand every night.** Session `37d14fd5` spent
   **39 Bash turns** re-discovering the repo (`ls docs/`, `ls src/`, `ls ops/`, `git log -20 --
   ops/episode_meta.json`) and re-computing, with ad-hoc python one-liners, the scene count, shot
   distribution, template histogram, chapter timestamps, title character count and archetype
   history — all deterministic, all computable in <1s by a script. At ~133k context per turn that is
   ~2.6M tokens re-spent nightly on arithmetic.
3. **VO is synthesised twice per render.** `build.py` synthesises ~200 edge-tts clips locally (cached
   by `CACHE_VERSION` + text hash in `public/audio/.vo_cache.json`), then `.gitignore` excludes
   `public/audio/`, so the cloud `prepare` job runs `python build.py` and synthesises all ~200 clips
   again from scratch. There is no Actions cache keyed on the content hash. On a worst-case night
   this happens 6 times.
4. **22 jobs × (`apt-get install` + `npm ci` + `npx remotion browser ensure`) per render.** Node
   modules are cached (`cache: npm`); the Chromium download and the apt packages are not. That is 22
   Chromium fetches per render, ~132 per worst-case night.
5. **Stale review stills are a live correctness trap.** `out/review/` still holds 16 PNGs from
   **2026-06-21** (13 MB) — a retired-format episode. `REVIEW_PROMPT.txt:21` says *"If
   out/review/watch/ is empty, fall back to out/review/*.png source stills."* `qa_watch.py` clears
   only `out/review/watch/`, never these. If `qa_watch` ever produces zero frames and `qa_sample`
   also fails, **the reviewer would review a two-month-old video from the retired format and approve
   or reject the wrong episode.** Reviewing nothing is safer than reviewing the wrong thing.
6. **`ops/analytics.json` is refreshed at step 0 every run** (`yt_analytics.py`) and then the prompt
   tells the agent to ignore it.

---

## 6. Non-token cost

* **Local disk is the acute risk.** `df` reports **5.6 GiB free on `/`** (68% used). `out/` is 415 MB
  (`episode.mp4` 246 MB, `out/review` 98 MB, `out/scan` 29 MB from 2026-07-20, `out/_smoke_packs`
  21 MB), `node_modules` 532 MB, `public` 458 MB. A local fallback render (only taken when both cloud
  and Modal fail) writes temp frames on top of that. This is how a recent local render filled the
  disk and killed a run. `render()` already purges `remotion-*` temp dirs **only on failure**, and
  nothing ever prunes `out/scan`, `out/_smoke_packs`, `out/review/check_watch` (2026-07-20) or
  `out/review/short_watch` (2026-07-15).
* **Cloud render minutes:** free on a public repo, but 132 jobs/night at worst case, with ~2–4 min of
  uncached setup each, is ~4–8 hours of pure setup time spread across parallel runners.
* **`gate.py`'s style frames:** `N_SAMPLES=4` × 2 renders = **8 stills ≈ 13s per build**. At 6 builds
  a night that is ~78 seconds. **This is negligible and it buys a numeric flat-fill and camera-lock
  assertion. Do not touch it.** `GATE_STYLE_FRAMES=0` exists as an escape hatch; leave it alone.

---

## 7. Ranked savings — by saving-per-unit-risk

### SAFE TO DO NOW — the model sees byte-for-byte identical information

**S1. Tell the reviewer to read the frames in parallel batches. (rank 1 — best ratio in the audit)**
Add to `REVIEW_PROMPT.txt`, in the READ EVERYTHING FIRST block:
> *"Read the frames in BATCHES — issue 8–12 `Read` calls in a single message, not one per message.
> You must still look at every frame; batching only changes how many round-trips it takes."*
Same for `content.py` / `timeline.json` / `audio_report.json` / research (one batch).
* **Saving:** removes ~40–44 of the reviewer's 66–137 turns. At the measured 105k–150k context per
  turn during the loading phase: **4–6M context tokens per review pass, ~25–30% (~$3/pass, ~$9 on a
  3-pass night)**. It also removes ~40 API round-trips per pass — 120 fewer chances per night to hit
  the rate limit that darkened 2026-08-13.
* **Quality risk: none.** Identical frames, identical text, identical rubric. The only thing that
  changes is how many HTTP requests carry them.
* **Recommend: yes, first.**

**S2. Same batching instruction for the revision agent** (inline prompt, `daily_autopilot.sh:290`)
**and the creative agent.** Revision sessions run 101–123 turns at one tool call each.
* **Saving:** ~20–30% of each revision pass (~$1.5–2/pass, ~$6/night at 4 passes).
* **Quality risk: none.**
* **Recommend: yes.**

**S3. Prune `out/` of stale artifacts, and delete the 16 June stills.**
```
rm -rf out/review/*.png out/review/check_watch out/review/short_watch out/scan out/_smoke_packs
```
* **Saving:** ~75 MB now; more importantly it closes the wrong-episode fallback in §5.5.
* **Quality risk: none — it removes a trap.** (I did **not** run this; `out/` is gitignored and
  deletion is not reversible without a re-render, so it is the owner's call to press enter.)
* **Recommend: yes.**

### LOW RISK — needs a prompt or ops edit, sign-off wanted

**S4. Drop `docs/TEMPLATES.md` from the creative agent's READ FIRST.** Replace lines 13–15 with one
sentence: *"The legacy catalog `docs/TEMPLATES.md` is retired — never emit a name from it. The only
legal templates are the thirteen listed in step 3."*
* **Saving:** ~10,236 tokens of resident context × 19–186 turns. On a 135-turn creative session that
  is ~1.4M context tokens (~$0.4–1.0); on the front-load it is 13% of everything the agent reads.
* **Quality risk: low, and arguably negative.** The agent currently reads a 358-template catalog it
  is forbidden to use — removing it removes the temptation as well as the tokens. Residual risk: if
  anything else ever silently depended on it being in context.
* **Recommend: yes.**

**S5. Archive `ops/improvements.json`'s 49 `done` items to `ops/improvements_done.json`.**
* **Saving:** ~11,200 tokens of resident context per creative session.
* **Quality risk: none to output.** It is a shipped-work ledger; step 6 only appends. (I did not do
  this — the brief forbids editing `ops/*.json`.)
* **Recommend: yes.**

**S6. Drop `ops/analytics.json` from READ FIRST** until the crayon format has its own view data. The
prompt already tells the agent to ignore it.
* **Saving:** ~3,772 tokens resident.
* **Quality risk: none** while the "ignore it" instruction stands. Put it back the day analytics
  reflect the new format — and remember to, or topic selection goes permanently blind.
* **Recommend: yes, with a dated note in the prompt saying when to restore it.**

**S7. Emit `out/review/facts.json` from the shell before `review()`.** A small deterministic script
computing exactly what the reviewer re-derives by hand: runtime, scene count, mean/median/min/max/sd
of shot length, cuts/min, template histogram, adjacent-template repeats, device counts
(`dialogue=`/`bubbles=`/`panels=`/`foreground=`/each card kind), chapter card start timestamps vs the
`body` timestamps in `episode_meta.json`, title character count, sentence-length bands, number count,
"you"/1000, and the last 3 thumbnail archetypes. Point `REVIEW_PROMPT.txt` at it.
* **Saving:** ~15–25 turns per review pass ≈ **2–3M context tokens (~15–20%, ~$2/pass, ~$6/night)**.
* **Quality risk: low, and it probably *raises* quality** — these numbers are currently produced by
  ad-hoc one-liners written fresh each night, which is exactly how a timestamp check drifts. It adds
  information; it removes none. The reviewer keeps every frame and every file it has today.
* **Recommend: yes — this is the second-best item after S1.** It is new code, so it wants a test run
  against a known-good episode before it goes into the nightly path.

**S8. Cap the uncounted creative attempts.** Add a second counter incremented *before* the creative
call, e.g. `MAX_CREATIVE_ATTEMPTS_PER_DAY=4`, independent of `MAX_BUILDS_PER_DAY`.
* **Saving:** bounds an unbounded path — up to 10 extra creative sessions on a bad day.
* **Quality risk: low but real.** Too tight a cap on a day of transient failures means the catchup
  gives up and the channel goes dark, which is what the 2026-07-24 fix was protecting against. 4 is a
  guess; it should be at least 2 more than `MAX_BUILDS_PER_DAY`.
* **Recommend: yes, at 4 or 5.**

**S9. Cap the agent-internal "repeat until BUILD OK" loops.** Change both to *"re-run at most 4 times;
if it still has not printed BUILD OK, stop and report the last failure."*
* **Saving:** bounds the tail; no saving on a normal night.
* **Quality risk: low.** A cold build genuinely needs 2–3 re-runs (measured: a rerun with 189/220
  scenes cached completed in 3m20s), so 4 leaves headroom.
* **Recommend: yes.**

**S10. Cache the VO in Actions, keyed on a hash of `content.py` narration + `CACHE_VERSION`,** and
cache the Remotion browser + apt packages across the 22 jobs.
* **Saving:** no tokens; ~10–20 min off `prepare` per render and most of the 132 Chromium fetches.
* **Quality risk: none** if the key includes `CACHE_VERSION` (the same discipline
  `gen_voice_edge.py` already enforces).
* **Recommend: yes, low priority.** Free minutes make this a wall-clock fix, not a cost fix.

### HIGHER RISK — only with explicit owner sign-off

**M1. Stop telling the creative agent to read `BIBLE.md` end to end (62,436 B / ~15,609 tok); point
it at named sections.** The prompt already carries 16,850 B of BIBLE's operative rules inline.
* **Saving:** ~11–12k tokens resident × up to 186 turns — on a big creative session, **~2M context
  tokens (~$1)**, and 20% of the front-load.
* **Quality risk: MEDIUM, and I want to be blunt about it.** BIBLE.md holds the *worked examples* and
  the *measured tables* that the prompt compresses to a line — the WO-22-vs-WO-30 decile table, the
  four reasons the cut rate stops at 13/min, the hook examples. The prompt's restatements exist
  because WO-32 found the writer missing rules that lived only in the far document. Trimming the
  agent's access to the canon to save 12k tokens is exactly the trade the brief says not to make.
* **Recommend: only if paired with a rule that the prompt keeps every band and every trap inline —
  and re-check the first three episodes against §3/§3a by hand.** My own preference is to leave it.

**M2. Cut the reviewer's frames from 48 to 32, or downscale them below 1568px.**
* **Saving:** large and obvious — 16 fewer frames = 29,504 fewer resident tokens (~33% of the image
  block); downscaling to 1280×720 = 1,229 tok/frame instead of 1,844 (another 33%). Combined with S1,
  a review pass could drop under $5.
* **Quality risk: HIGH, and I recommend against both.**
  * **Fewer frames:** at 48 frames over 16.17 min with 202 scenes, the reviewer already only sees
    **24% of the scenes**. At 32 it sees 16%. A clipped overlay or a broken limb lives on *one*
    scene — this is a straight linear cut in the probability of catching the class of defect the
    reviewer was added for, and it caught exactly that class on 2026-08-15.
  * **Downscaling:** `gate.py:227` warns in its own comments that resampling changes what flat art
    measures — *"LANCZOS / BILINEAR / BOX resamples of one and the same frame score 76% / 84% / 89%,
    i.e. the resampler alone spans the whole band."* The reviewer judges rubric item 3 ("flat fills,
    no gradients") **by eye** on these frames. Introducing a second resample invites both false
    positives (interpolation reading as gradient) and false negatives.
  * The honest counter-argument is that the API already downscales 1920→1568 internally, and that
    `gate.py` asserts flat-fill and camera-lock **numerically at native 1280×720**, so the reviewer's
    visual style check is a backstop to a stronger machine check. If the owner wants this saving,
    downscaling is the *less* bad of the two — but I would take S1 + S7 first and see whether the
    cost problem is still there.
* **Recommend: no.**

**M3. Formalise the fact-checker sub-agent** (declare it in `REVIEW_PROMPT.txt`, cap it at one, give
it a fixed prompt, consider haiku).
* **Saving:** small and uncertain — possibly negative if the reviewer currently skips it some nights.
* **Quality risk:** making it *mandatory* costs more; making it *forbidden* removes an accuracy check
  on the highest-severity rubric item.
* **Recommend: formalise and cap at 1, do not remove.** The point is predictability, not saving.

**M4. Fix the stale `RATE = "-13%"` in `BIBLE.md:125`** to `-7%` with the correct measured figures.
* **Saving:** none.
* **Quality risk: none from the fix; a real risk from leaving it.** It is the constant the WPM band
  depends on, and the canon currently states it two ways 100 lines apart.
* **Recommend: yes — but as a canon edit it is the owner's call, which is why I did not make it.**

---

## 8. What I deliberately did NOT recommend

* **Downgrading the reviewer or the creative agent to a smaller model.** Both hold long contexts under
  hard measurable constraints; both fail *silently* when they degrade (a bad approval publishes, a
  missed band HALTs the night). The saving is real and I am still saying no.
* **Cutting frames or downscaling them** (M2 above) — a cheaper reviewer that sees less is a blind
  reviewer.
* **Deleting the WO-32 blocks from `AUTOPILOT_PROMPT.txt`** (lines 275–301 and 303–360, 7,651 B /
  ~1,913 tok). They are the largest *unique* chunk of the prompt and the most tempting single cut.
  Every line of them was bought with a failed night: the headless "never end your turn to wait" note
  (two cold runs died exactly that way), the `WPM ≈ 215 / (syllables per word)` predictor (two runs
  HALTed at 136.4 and 138.1 WPM and neither was fixable without it), the `template 'None' not in
  registry` trap, the device-under-spend list. **These are measurement traps learned the hard way and
  they are the cheapest insurance in the file.** Do not touch them.
* **Removing `audio_report.json` from the reviewer's reads** (~9,801 tok). It is the reviewer's only
  ears; the alternative is publishing dropouts.
* **Disabling `gate.py`'s style frames** (~13s/build). The cheapest quality assertion in the pipeline.
* **Re-enabling Shorts to amortise anything.** They are correctly off.

---

## 9. Worst-case night: before and after

| | sessions | context tokens | $ |
|---|---|---|---|
| **Before** (measured maxima; gate-repair est) | 14 | ~249M | ~$154 |
| **After S1+S2+S7** (zero information loss) | 14 | ~178M | ~$104 |
| **After S1+S2+S4–S7** | 14 | ~172M | ~$99 |
| **After all, incl. M1 (not recommended)** | 14 | ~166M | ~$95 |

Per-role, after S1/S2/S7:

| role | before (max) | after (est) | how |
|---|---|---|---|
| reviewer | $13.35 / 18.1M | ~$7.0 / ~10M | −40 turns (batching) −20 turns (facts.json) |
| revision | $7.21 / 13.2M | ~$5.4 / ~9.5M | −25 turns (batching) |
| creative | $17.64 / 35.6M | ~$15.5 / ~32M | −14k tokens resident (S4/S5/S6) |

**Typical (non-worst) night** — 1 attempt, 1 revision pass, based on 2026-08-15's actual sequence:
**$51.5 → ~$35**, a ~32% cut with **no change to what any agent reads or judges**.

And the number that matters more than dollars: S1 alone removes roughly **120 API round-trips per
worst-case night**, which is the mechanism by which 2026-08-13 went dark.

---

## 10. Changes made by this audit

**At the time of writing, one: this file.** No code, prompt, canon, `ops/*.json`, `gate.py`,
`content.py` or render was touched. Nothing was published or uploaded. Every item in §7 was a
proposal awaiting sign-off.

### APPLIED 2026-08-15 (owner sign-off — the zero-risk set + the two bugs)

| item | what shipped | where |
|---|---|---|
| **S1** | reviewer told to `Read` in batches of 8–12 per message; still reads all 48 frames | `docs/REVIEW_PROMPT.txt` |
| **S2 (revision only)** | same batching instruction in the revision prompt | `scripts/daily_autopilot.sh` |
| **S3** | stale frames pruned at the START of every `review()`, + a HARD ASSERT that HALTs when zero frames exist rather than reviewing blind | `scripts/daily_autopilot.sh` |
| **S7** | `out/review/facts.json` precomputed before every review pass | `scripts/review_facts.py` (new), wired in `review()` |
| **§4 bug** | daily budget now counts any creative pass that CONSUMED WORK (file fingerprint), not just successes | `scripts/daily_autopilot.sh` |
| **M4 bug** | `RATE = "-13%"` → `-7%`, plus three more stale constants found in the same sweep | `docs/BIBLE.md` |

**Deliberately NOT applied** (still awaiting sign-off): S4 (drop `TEMPLATES.md`), S5 (archive
`improvements.json` done-history), S6 (drop `analytics.json`), S8/S9 (cap the loops), S10 (Actions
caching), M1, M2, M3. Nothing in §8 was touched.

**Three further stale constants fixed in `BIBLE.md` alongside M4**, found by cross-checking every
numeric claim in the canon against the code that implements it:

* **line 78** — "`ops/routine.json` currently sets `minMinutes: 11`, so the gate floor is *below* the
  band". It is **13** (`ops/routine.json:6`), so `gate.py` HALTs in both directions. The doc was
  telling the writer the gate would not catch a short episode when it would.
* **line 866** — "does a **1-frame** smoke render". `build.py:57–59` renders **frame 0 and the
  midpoint** — two stills.
* **line 867** — "compare the **runtime** figure to **145–152**". That is the aggregate *target*;
  `gate.py:32` HALTs only outside **143–154**, deliberately wider (see its own comment). An episode
  at 153 was reading as a build failure against §11 when it passes.

**Found but deliberately NOT changed:** three claims in `docs/CRAYON_BIBLE.md` (§3 camera "applies an
expo-out dolly push … to every shot", §7 "Current CoreLifecycle uses Helvetica Neue everywhere … must
be vendored", §8 "CoreLifecycle's fixed 0.25s" gaps) describe the **pre-restyle** engine and are now
all fixed in code (`director.tsx` is locked, Caveat is vendored, gaps are hashed 0.25–0.55s). They are
the before-side of a deliberate gap analysis rather than assertions about current behaviour, and the
reviewer is explicitly instructed never to edit that file — so they were left alone and are recorded
here instead.
