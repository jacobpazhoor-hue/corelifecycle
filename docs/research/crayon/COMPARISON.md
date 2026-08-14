# COMPARISON — our sample episode vs Crayon Capital

**Episode:** `The 158-Year-Old Bank That Died in a Weekend` (slug `lehman_brothers`, topic queue #3).
**Built:** 2026-08-12, WO-29. **Runtime:** 16.16 min · 196 scenes · 2,468 words · 29,085 frames.
**Render:** `out/episode.mp4`, **221 MB** (gitignored — not committed). `out/thumbnail.png`, 188 KB.
**Gate:** `python3 build.py` → `GATE: PASS ✅`, **0 warnings, 0 failures**.
**Previous measured build:** WO-23, same episode, scored **45 MATCH · 9 CLOSE · 5 MISS**.
**What changed since:** chapter 1's 1844–1865 span and the ending's 1844 callback now set
`period="pre1900"` and are built from **eight** rooms instead of WO-26's four; one art fix (the barrel
prop). No narration string was touched, so §1 and §2 are byte-identical by construction — and are
re-measured below rather than carried over.

> **How to read this.** Every number was measured on this build unless a row says otherwise, and one
> row (§8 inter-sentence gaps) says otherwise. Where a metric is method- or resolution-dependent the
> method is stated inline, because the same artwork scores anywhere in the band if you change either.
> Flat fill is always a **native 1280×720 render (`--scale=0.6666667`)**, never a downscale.
> Motionless share is always **5 Hz**, with its threshold stated. Saturation is always **three
> statistics**. `n=90` art scenes were sampled for art metrics — three times WO-23's 31, which is why
> two rows move on sample size alone; that is called out where it happens.

---

## 0. Two measurement corrections that change verdicts

**(a) The saturation MISS in the previous build was a methodology error, not a defect.**
The bible's §5 band (0.308 / 0.482 / 0.646) and the previous build's "our mean 0.209" are **different
statistics**. Settled on the only lossless reference artefact, `frames/wolf_t0003.png` (native
1280×720 PNG — my toolchain reproduces the project's own recorded **77.48% flat fill** and **113 rich
colour buckets** on that exact file, so the path is calibrated):

| statistic on `wolf_t0003.png` | value |
|---|---|
| all-pixel HSV-S mean | **0.137** |
| mean over *coloured* pixels (S > 0.02) | **0.552** |
| coloured fraction of frame | **0.25** |

Only the **coloured-pixel** figure lands inside the bible's 0.308–0.646. The previous COMPARISON
compared our **all-pixel** mean against that **coloured-pixel** band, which is why the row read MISS.
Lossy-source bias was measured rather than assumed: native → 308×174 + JPEG moves all-pixel S only
0.137 → 0.130 (−5%) but moves coloured-pixel S 0.552 → 0.417 (−24%), because JPEG fringing inflates
the coloured mask. **The all-pixel statistic is the robust one.** Both are reported below.

**(b) Rich-colour count.** The previous build's "179 vs 216–444" used the raw distinct-colour count,
which `CRAYON_BIBLE.md` §5 explicitly says never to gate on. The correct measure is buckets carrying
>0.02% of pixels (reference = **113**). Re-measured on that metric below.

**(c) The chapter-title anchor is string-length-dependent.** 0.565 w was measured on a 20-character
title. Our chapter titles are 9–16 characters, so absolute width is not comparable; width-per-character
and cap height are. Both are given in §7.

---

## 1. Build and render

`python3 build.py` → **BUILD OK**, `GATE: PASS ✅`, 0 warnings, 0 failures. `npx tsc --noEmit` clean.
`gate.py` was not modified.

Gate's own four style samples, native 1280×720: flat fill **83.97 / 87.23 / 90.01 / 86.88 %**,
locked cells **40 / 36 / 34 / 39** of 48, runtime 16.2 min, 152.7 WPM, 196 scenes.

### Rendering, re-engineered around the two disk bombs — again

The owner's disk has been filled twice by this project. WO-23 identified both mechanisms and this
render reuses its method:

1. **Video.** Remotion keeps the *entire* JPEG frame sequence in `$TMPDIR` and stitches at the end —
   0.2215 MB/frame → **6.3 GiB** for 29,085 frames.
2. **Audio.** `remotion render --codec=wav` pads **every one of the 196 VO assets to the full 969.5 s
   timeline** before mixing; WO-23 measured 5.4 → 1.6 GiB in five minutes and aborted at the floor.

**This pass started with 5.0 GiB free — 2.4 GiB less than WO-23 had.** The superseded 210 MB
`episode.mp4` was deleted first. Video was rendered `--muted` in **10** frame-range segments (WO-23
used 7; ten holds peak temp lower) with `$TMPDIR` pointed at a directory under `out/` and cleared
between every segment, then concatenated with stream copy. Measured peak temp per segment **0.79 GiB**;
segments are ~20 MB each, ~198 MB concatenated.

Audio was summed directly from the composition's own graph (`src/Video2.tsx`: per-scene VO at
`audioStartFrame`, bed at 0.16, sfx at 0.5) with Remotion's bundled ffmpeg, applying the **−3 dB pan
law** Remotion uses when upmixing mono — VO and sfx at v/√2, the already-stereo bed at its literal
volume. **Validated against a Remotion-rendered 20 s window of the real composition**: RMS ratio
**1.0025** (0.02 dB), peak 0.6803 vs 0.6794, waveform correlation **0.997**, residual 22.8 dB below
signal. The one discrepancy is a flat **2048-sample offset**, which is AAC encoder priming on the
decoded reference (my pre-encode WAV sits at lag 0), not a placement error — it is exactly 2×1024 and
appears equally in Remotion's own output.

**Disk floor: 1.5 GiB, never approached.** Minimum free observed at any point **3.1 GiB** (sampled
mid-segment); minimum logged between segments 3.8 GiB. Result: **29,085 frames exactly**, 16:09.50,
1920×1080, h264 + AAC 48 kHz stereo, **221 MB**.

---

## 2. Spec checklist — every item in `CRAYON_BIBLE.md`

Columns are **WO-23**, the last build measured end-to-end, and **WO-29**, this one. Everything between
them (WO-24 colour/motion, WO-25 short-scene fix and card measure, WO-26 period writing rule, WO-27 the
period art flag, WO-28 the render-killer sweep) shipped **without a full re-measure**, so several rows
below move for reasons this work order did not cause. Where that is so, it is named.

### §1 Format
| Spec | WO-23 | **WO-29 (this build)** | Verdict |
|---|---|---|---|
| 3rd-person past-tense explainer, real subject | MATCH | unchanged — past-tense spine, sources in `docs/research/lehman_brothers.md` | **MATCH** |
| Title formula + 36–64 chars | 44 | **44 chars**, `superlative` formula | **MATCH** |
| Runtime 13–21 min | 16.16 | **16.16 min** (969.5 s, 29,085 frames) | **MATCH** |
| 3–5 chapters, `Evocative Noun: Plain Explanation` | 5 | **5**, all two-part | **MATCH** |

### §2 Narration
Narration is byte-identical to WO-23: this work order changed `template=` and added `period=`, and
touched no narration string. All 196 VO assets were reused from cache. The rows are re-measured, not
carried over, and they reproduce.

| Spec | WO-23 | **WO-29** | Verdict |
|---|---|---|---|
| **148.5 WPM runtime-inclusive** | 152.7 | **152.7** | **CLOSE** — inside the channel's per-video spread (139.2–152.9), 4.2 over the aggregate, 1.3 under the gate ceiling |
| Sentence mean 7.5–10.6 | 8.60 | **8.60** (287 sentences) | **MATCH** |
| Sentence median 6–9 | 7 | **7** | **MATCH** |
| 40–59% under 8 words | 50.9% | **50.9%** | **MATCH** |
| 29–68 explicit numbers | 49 | **49** | **MATCH** |
| Questions 3–27 | 4 | **4** | **MATCH** |
| "you" 2.6–13.4 /1000 words | 5.67 | **5.67** (14 raw) | **MATCH** |
| Total words 2,000–3,100 | 2,468 | **2,468** | **MATCH** |
| Hook — 5 steps in order | MATCH | t001 shock · t002 fragments · t003 "But…" · t004 thesis · t005 "Montgomery, Alabama, 1844." | **MATCH** |
| Ending: reflection → callback, no CTA | MATCH | t135 complicit "we" + t141 machine callback; no subscribe/like/comment | **MATCH** |

### §3 Camera — LOCKED
| Spec | WO-23 | **WO-29** | Verdict |
|---|---|---|---|
| Locked camera, ≥35/48 cells at exactly 0.0 | mean 39.0/48, min 36 (n=31) | **mean 37.4/48, min 24, max 48 (n=90)** — reference locked shots 40/48 and 41/48; **18 of 90 below 35** | **CLOSE** ⬇ |
| No dolly / push-in / sway / parallax | MATCH | none in `director.tsx` | **MATCH** |
| Whole-frame motion ≈1 shot in 3 at most | MATCH | none sampled | **MATCH** |

> **This row went DOWN and the sample size is most of the reason.** WO-23 sampled 31 art scenes;
> this pass samples **90** — every scene that renders art and runs ≥150 frames, which is the same
> eligibility rule `gate.py` uses. The wider net catches the templates WO-23's 31 missed:
> `closeUpPortrait` scores **24/48 on all six of its samples** (the 5.6× head fills three cell rows and
> its eyes/mouth animate — WO-27 measured the identical 24 and showed it is pre-existing, not caused by
> the period flag), `exchangeFloor` 34 and `boardroom`/`broadcastDesk` 35.9. Strip `closeUpPortrait`
> and the mean is **38.3**. The camera itself is still locked — a real camera regression drives *every*
> sample toward zero and four scenes here sit at 48/48. But the honest number is 37.4, not 39.0, and it
> is under the reference's own 40–41.

### §4 Editing rhythm
| Spec | WO-23 | **WO-29** | Verdict |
|---|---|---|---|
| 12.5 cuts/min | detected 15.22 | **detected 14.54** (235 cuts / 969.6 s) | **CLOSE** ⬆ — inside the reference's per-window range 9.3–15.9, now 16% over the aggregate rather than 22% |
| Mean shot 4.79 s | 6.68 → 3.94 s | **4.11 s** | **CLOSE** ⬆ — inside the reference's per-window means 3.87–6.36 s |
| Median shot 2.67–6.81 s | 4.00 s | **4.17 s** | **MATCH** |
| Range 0.61–16.46 s | 0.40–9.60 s | **0.00–9.80 s** | **MISS** — still no long hold; max is 60% of the reference ceiling |
| ~40% motionless frames @5 Hz | 68.0% | **20.2% @ ε<0.5/255 · 42.4% @ ε<1.0/255** (@15 Hz 45.5 / 65.6) | **CLOSE** ⬆ — see the caveat |

> **Cut detector.** Absolute floor 5.0/255 mean |Δluma| **and** ≥3× the local median, on a 15 Hz,
> 960×540 grey decode of the finished MP4. Without the floor a slow element drift scores as a cut;
> without the prominence test a cut between two similar rooms scores as nothing. The 0.00 s minimum is
> a detector artefact — two adjacent 15 Hz samples both crossing on one cut — not a 0-frame shot.
>
> **The motionless row is the one number in this document I cannot give you a clean before/after.**
> WO-23 reported 68.0% @5 Hz and did not record its threshold or its decode resolution, and the file it
> measured was deleted to make disk room for this render. Mine is stated in full: 5 Hz, 960×540 grey,
> lossless PNG pipe off `out/episode.mp4`, motionless = mean |Δluma| below ε. The number is strongly
> threshold-dependent — 8.0% at ε<0.1, 20.2% at ε<0.5, 42.4% at ε<1.0 — so quoting one figure without
> the ε is meaningless. What is safe to say: **under every threshold I measured, the frames are far
> less still than 68%**, and WO-24 ("put motion back between the cuts") is the reason. At ε<1.0 we sit
> at 42.4% against the reference's ~40%. I am scoring it CLOSE rather than MATCH because the threshold
> that produces the match was chosen after seeing the answer.

### §5 Art (native 1280×720 `--scale=0.6666667`, **n=90** art scenes)
| Spec | WO-23 (n=31) | **WO-29 (n=90)** | Verdict |
|---|---|---|---|
| Flat fill 74.4–92.2%, mean ~84% | mean 87.48 | **mean 87.27**, min 75.42, max 90.73 | **CLOSE** — still ~3.3 pts above the reference mean, i.e. emptier |
| — any scene out of band | 0/31 | **0/90 out of band**, none above the 92.0 gate ceiling | **MATCH** |
| Ink 10–70% | mean 39.3, max 71.9 (one over) | **mean 34.8**, range **15.2–65.2 — 90/90 in band** | **MATCH** ⬆ |
| **Saturation** — three statistics, always | all-pixel **0.445** · coloured **0.561** · coverage **0.799** | **all-pixel 0.176** (0.076–0.322) · **coloured-pixel 0.495** (0.358–0.656) · **coverage 0.350** (0.203–0.633) — reference **0.137 / 0.552 / 0.247** | **CLOSE** ⬆⬆ |
| Rich colour buckets (>0.02% of pixels; reference 113) | mean 92 | **mean 77.3**, 8/90 ≥113, min 43 | **MISS** ⬇ |
| Stroke ≈6–10 px at 1920 | MATCH | `STROKE = 8`, `STROKE_THIN = 5` | **MATCH** |
| Uniform pure-black outline, no wobble/taper | MATCH | vector strokes, no displacement filter | **MATCH** |
| Flat fill, no gradients on characters | MATCH | none in `explainer.tsx` by construction | **MATCH** |
| Character construction | MATCH | as drawn | **MATCH** |
| Per-scene colour keying | MATCH | 13 rooms, 13 committed hues; **21 distinct (room, period) pairs** now render | **MATCH** |

> **Saturation is the big mover, and WO-24 — not this work order — moved it.** The 3.25× overshoot
> WO-23 recorded is gone: all-pixel is **0.176 against the reference's 0.137 (1.28×)**, inside the
> 0.17–0.22 target WO-23's own fix note set. Coloured-pixel **0.495** sits inside the bible's
> 0.308–0.646 band (83/90 frames do). Coverage fell **0.799 → 0.350**, into the 0.30–0.40 target.
> **Variance is back too**, which was half of MISS #1: WO-23 had *nothing* below 0.321 where the
> reference has 4 of 11 cells at 0.027–0.107; this build puts **34 of 90 frames below the reference's
> own 0.137**, from `exchangeFloor` at 0.088 to `bankExterior` at 0.322. The three rooms WO-23 named to
> drain all drained — `domesticInterior` 0.526 → 0.197, `factoryFloor` 0.525 → 0.204, `broadcastDesk`
> 0.601 → 0.291. The hottest room is now `bankExterior` (0.317 all-pixel, **0.619 coverage** — it paints
> 62% of its frame), which is also the best-looking period room, so draining it costs something real.
>
> **Colour buckets went the wrong way and the previous fix note predicted the opposite.** WO-23 wrote
> that neutralising grounds "will help here too, because neutrals add buckets the ladder does not."
> Measured: **92 → 77.3**. Neutralising a plane replaces a family of tinted tones with one grey, which
> removes buckets. The two effects fight, and on this art the removal wins.
>
> **Flat-fill trap check.** Flat fill counts *right*-neighbour equality, so horizontal rules barely
> register. Both directions: ours **87.27 right / 81.89 down**, a 5.4-point gap, where the reference
> PNG reads **77.48 / 77.24** — symmetric. Our art still carries noticeably more horizontal banding
> (ceiling strips, desk rows, shelf lines) than the reference's does. Unchanged from WO-23's 5.6.

### §6 Signature devices
| # | Device | WO-23 | **WO-29** |
|---|---|---|---|
| 1 | Full-screen text cards, both grounds | MATCH | **MATCH** — 6 narration (white), 4 word (black); `t065` "Unless." verified rendering |
| 2 | Chapter title cards | MATCH | **MATCH** — 5, one line each, subtitles ≤32 chars |
| 3 | Speech bubbles + floating dialogue | CLOSE | **CLOSE** ⬆ — balloon is now opaque with a full black keyline (t051, t077 verified); t022's float is now black-with-white-halo and legible; **t105's is still white-on-pale** |
| 4 | Multi-panel splits | MATCH | **MATCH** — `grid4` t017, `v2` t070 and t085, `diagonal2` t121, all verified rendering |
| 5 | Grey anonymous crowd + colour hero | MATCH | **MATCH** |
| 6 | Object showcase cards | MATCH | **MATCH** — t035 verified, isometric props on pure white |
| 7 | Document / newspaper montage | MATCH | **MATCH** |
| 8 | Over-the-shoulder, dark foreground silhouette | MATCH | **MATCH** — t007 (right edge, period) and t020 (left edge) verified |

### §7 Typography
| Spec | WO-23 | **WO-29** | Verdict |
|---|---|---|---|
| Handwritten italic script for all on-screen text | CLOSE | Caveat + 6° synthetic oblique; no legacy face in the live path | **CLOSE** — Caveat has no true italic cut |
| Subtitle ratio ≈0.75 | MATCH | `CRAYON_SUBTITLE_RATIO = 0.75` | **MATCH** |
| Hierarchy by size alone, not weight | MATCH | same weight both halves | **MATCH** |
| Narration line ≈0.53 w | **0.622 w**, MISS | **0.515 w** widest line per card (0.500–0.528); 0.493 over all 11 lines — reference cell **0.536 w** | **MATCH** ⬆ |
| Chapter title ≈0.565 w | 0.415 w | **0.416 w** absolute · **0.0352 w/char vs the reference's 0.0288** · cap height **0.121 h vs 0.141 h** | **CLOSE** |
| Single-word beat ink height ≈0.092 h | 0.094 | **0.099 h** mean (0.094 / 0.096 / 0.099 / 0.106) | **MATCH** |
| Thumbnail: heavy geometric sans, ALL CAPS | MATCH | Montserrat ExtraBold, vendored | **MATCH** |

> **The narration-card MISS was fixed by WO-25 and this is its first measurement.** WO-25 gave the
> card a *width* target (`NARRATION_W_FRAC = 0.53`) instead of only a height cap, and set the type to
> the measure the way the chapter title already was. WO-23's worst card, t023 at 0.797 w on one line,
> now sets at **0.516**. WO-25's own prediction — "the four longest wrap to two and land 0.48–0.53 w"
> — reproduces exactly.

### §8 Sound
| Spec | WO-23 | **WO-29** | Verdict |
|---|---|---|---|
| Music bed generally present | MATCH | bed present in **100%** of 100 ms windows outside the two deliberate dry passages | **MATCH** |
| **Ducked 8–15 dB under VO** | 11.37 dB, bimodal | **11.37 dB.** Recovered envelope (ducked ÷ un-ducked bed) is **exactly two-valued: 1.000 (10.9%) and 0.270 (70.0%)**, plus 0.000 (5.0%, the dry passages). Bed RMS histogram **BIMODAL** — modes at **−31.8 dB and −19.6 dB, 12.2 dB apart**, dip ratio **0.16**. Returns to full bed in **583** gaps. | **MATCH** |
| Deliberate music-free passages | 48.7 s (5.0%) | **48.5 s (5.0%)** in 2 passages (27.3 s, 22.8 s) | **CLOSE** |
| Inter-sentence gaps 0.18–1.0 s, varied | median 0.21 s, 59% in band | **carried over unchanged** — all 196 VO assets were reused from cache, so this is byte-identical | **CLOSE** ⬇ |
| Inter-scene gaps varied (not one fixed value) | 148 distinct / 196 | **149 distinct values across 196 gaps**, 0.25–1.40 s | **MATCH** |

> The duck envelope was recovered the way the bible's §5 note requires — by regenerating the un-ducked
> bed with `make_ambient.py` and **dividing**, not by eyeballing an RMS curve. The result being exactly
> two-valued is the proof the sidechain is doing what it claims. The ducked bed was backed up and
> restored, so nothing the render consumed was left modified.

### §9 Packaging
| Spec | WO-23 | **WO-29** | Verdict |
|---|---|---|---|
| Title 36–64 chars | 44 | 44 | **MATCH** |
| Thumbnail flat vector matching the video art | MATCH | yes | **MATCH** |
| Hero in full colour vs desaturated grey field | MATCH | yes | **MATCH** |
| Single saturated accent | MATCH | red crash polyline only | **MATCH** |
| Pushed face (open mouth, teeth, marks, squiggles) | MATCH | open mouth with teeth, worry lines, `!!`, squiggles | **MATCH** |
| Outlined white caps *or* amber band | MATCH | outlined white caps, Montserrat ExtraBold | **MATCH** |
| Grey crowd with readable figures | MATCH | three grey figures with eyes and mouths, inside the frame | **MATCH** |

---

## 3. Tally

| | MATCH | CLOSE | MISS |
|---|---|---|---|
| WO-13 | 39 | 7 | 13 |
| WO-23 | 45 | 9 | 5 |
| **WO-29 (this build)** | **45** | **12** | **2** |
| delta vs WO-23 | **0** | **+3** | **−3** |

Per section (MATCH/CLOSE/MISS) — §1 4/0/0 · §2 9/1/0 · §3 2/1/0 · §4 1/3/1 · §5 7/2/1 · §6 7/1/0 ·
§7 5/2/0 · §8 3/2/0 · §9 7/0/0.

**MATCH did not move, and that is the honest headline.** Three MISSes closed (saturation, narration
card width, and one of the two rhythm rows) but two of those landed as CLOSE rather than MATCH, and
**§3 camera lock fell from MATCH to CLOSE** on a sample three times larger. The MISS column is the
real gain: **5 → 2**.

**Closed since WO-23:** saturation overshoot (WO-24), narration-card line width (WO-25), motionless
share (WO-24), the speech balloon's missing keyline, the t022 float's legibility, the number-card
overlay on `panels` scenes, the period anachronism through chapter 1 (WO-26 → WO-27 → this).
**Regressed and said so:** rich colour buckets 92 → 77.3, camera lock mean 39.0 → 37.4.

---

## 4. Every remaining MISS, with a concrete fix

| # | MISS | Measured | Fix |
|---|---|---|---|
| 1 | **Rich colour buckets 77.3 vs 113** — and *worse* than WO-23's 92. | 8/90 frames ≥113. Floor: `factoryFloor` 43–49, `courtHearing` 52, `officeFloor` 54–55, `exchangeFloor` 61. Ceiling: `bankExterior` 116–123, `broadcastDesk` 103, `crowdQueue` 101. | WO-23 predicted neutralising grounds would *add* buckets; it removed them, because a neutralised plane collapses a family of tinted tones into one grey. The two are not in conflict if the chroma is **moved rather than deleted**: give every key a **second material family** — one prop group in a complementary hue at the same lightness (leather/brass in `officeFloor`, timber/canvas in `factoryFloor`, green baize/oxblood in `courtHearing`) — instead of more rungs of the same ladder. Target the four floor rooms first; each needs ~60 more buckets and a single extra material family is worth roughly that. Do **not** solve it by re-saturating grounds: that would reopen MISS #1, which cost two work orders to close. |
| 2 | **Shot range 0.00–9.80 s vs 0.61–16.46 s.** | max hold 9.80 s = 60% of the reference ceiling; 21 shots under 0.61 s; **0 shots ≥12 s** against the reference's several | Unchanged from WO-23 and still a **writing** instruction, because since WO-17 the writer owns the cut rate: budget **two or three scenes per episode at 12–16 s** — a mechanism teardown or a reflective beat that stands still — and stop writing sub-0.6 s fragments. The arithmetic warning in §3a applies: removing scenes to lengthen holds pushes runtime WPM up through the 6.5–7.5 s dead zone, so **lengthen a few scenes without changing the count** — merge two adjacent fragments into one held shot and split a long scene elsewhere to pay for it. |

---

## 5. The period flag in production — what WO-29 actually changed

WO-27 built `period="pre1900"` and proved it byte-identical when off. This build is the first to
**use** it: the 1844–1865 span `t005`–`t015b` (19 scenes) and the ending's 1844 callback `t138`/`t139`
now set it. Narration was not touched, so scene count, runtime and WPM are byte-identical to WO-23.

**WO-27's tier table does not survive contact with its own rendered frames.** It lists ten rooms as
PERIOD-CLEAN. Judged off `out/_wo27/final3_on_*.png` and off this build's own stills, **four of the ten
do not hold up**, and the cause is one thing worth naming: *the substituted props inherit the scene's
tone ladder, so a "wooden" prop is only wooden in a warm-keyed room.*

| Room | WO-27 tier | **Measured on the frame** | Used pre-1900 here |
|---|---|---|---|
| `bankExterior` | clean | **best of the set** — pediment, columns, gas lanterns, a dray of wooden barrels, a pillar box | 3× |
| `officeFloor` | clean | **counting house** — timber beam on iron brackets, pendants, ledger drawers, turned chair | 3× |
| `domesticInterior` | clean | good — candlesticks and a framed picture where the TV was, masonry through the sash | 3× |
| `chartBoard` | clean | good — wooden easel, slat chairs, ledger stack | 1× |
| `closeUpPortrait` | clean | good — terracotta key, so its easel boards read as wood | 0 (histogram ceiling) |
| `newsMontage` | era-free | correct, it is paper | 4× |
| `courtHearing` | era-free | correct | 2× |
| `cityStreet` | clean | **caveated** — drays have shafts and a correct load but no horse; the ground-floor retail fascia band and the rectangular-headed lamp standards are untouched by the flag | 1× |
| `factoryFloor` | clean | **FAILS** — machines keep circular dial gauges and lit push-button panels, plus an electric extractor fan, a roller shutter with a lit sign strip, and blue overhead pipework | 2×, both short |
| `exchangeFloor` | clean | **FAILS** (blue key) — the chalked slate still reads as a dark electronic quote board; blue-framed easel boards read as flat screens | 0 |
| `boardroom` | clean | **FAILS** (blue key) — arches and gasolier are right, but the framed chart reads as a wall screen and the table ledger board as a laptop | 0 |
| `crowdQueue` | clean | **FAILS** (purple key) — the bank it queues outside is still a ribbon-glazed curtain-wall block with a roller shutter, and it is a third of the frame | 0 |
| `broadcastDesk` | plausible | agrees with WO-27 — still reads as a TV studio with an antique camera in it | 0 |

**So the honest count is EIGHT usable rooms, not twelve** — against WO-26's four, one of which
(`factoryFloor`) was itself wrong. Rooms that are genuinely era-correct went **3 → 8**. The span now
runs newsMontage 4 · bankExterior 3 · officeFloor 3 · domesticInterior 3 · factoryFloor 2 ·
courtHearing 2 · chartBoard 1 · cityStreet 1.

**One art fix went in with it.** `Cone`'s period form — the barrel — banded a near-white body with two
`accentDeep` hoops, which in an orange-keyed room (`cityStreet`) reproduced the exact signature of the
modern traffic cone it exists to replace. The hoops are now iron (`tn.deep`); the lid keeps `c.accent`
so the frame does not lose its saturated note. Verified on the rendered frame.

**Rotation, measured, not asserted:**

| | WO-23 | **WO-29** |
|---|---|---|
| distinct set-ups in 8 evenly spaced samples | 8/8 | **8/8** |
| distinct set-ups in 12 samples | — | **8/12** |
| 30 s windows that show one room twice | 58% | **56.2%** (18/32) |
| mean return time for a set-up | 79 s | **85.8 s** |
| adjacent same-template pairs | 0 | **0** |
| template pairs at the minimum 2-scene reuse gap | 18 | **10** |
| busiest room | `closeUpPortrait` 20 | `chartBoard` / `closeUpPortrait` **20** (1.02 /10 scenes) |
| distinct **(room, period)** pairs rendered | 13 | **21** |

`officeFloor` goes 16 → 19, which partly reverses WO-26's de-duplication — but all three added uses
are **period**, and a period `officeFloor` is a counting house, not the open-plan room again. Counted
as (room, period) pairs the modern room did not gain a single use. `courtHearing` falls 9 → 6, which
is a correction: WO-26 had inflated it as a period workaround.

---

## 6. QA — stills read by eye across the finished episode

Frames were extracted from `out/episode.mp4` itself (not re-rendered), plus 90 native-1280 stills from
the art measurement. **No crashes, no blank frames, no text running off-frame, no legacy Helvetica/Arial
anywhere.** `t065` ("Unless.", 35 frames — the scene that killed the WO-23 render) renders correctly.

### Fixed since WO-23, verified on this build
* **Speech balloon** is opaque white with a full black keyline and tail (t051, t077). WO-23 defect 2 closed.
* **t022's floating dialogue** is black script with a white halo and is legible over the pale terracotta wall. WO-23 defect 1 closed *at that scene*.
* **The number-card overlay no longer covers a `panels` cell** — t017 sampled at 2 points in the scene shows no overlay. WO-23 defect 5, half closed.
* **The 1844 anachronisms are gone** from the historical span — no monitors, no projector, no parked car, no glass skyline under 1844 narration. WO-23 defect 4 closed.

### Open defects

| # | Defect | Where | Fix |
|---|---|---|---|
| 1 | **`factoryFloor`'s period mode is not period.** Circular dial gauges and lit push-button control panels on every machine, an electric extractor fan in a circular housing, a roller shutter with a lit sign strip above it, and blue service pipework across the full width — all under 1844/1865 narration. The flag changes only the beacon, the chevrons and the cones. | t007 (60.1 s), t015 (117.1 s) | Give the machine bodies a period form the way `Monitor` and `DeskPhone` got one: a belt-driven line shaft with pulleys and flat belts replacing the pipework, a gauge cluster that becomes a single brass dial, no lit indicators, and a plank door instead of the shutter. Until then this room should be **used once or not at all** before 1900 — it is the one weak room left in the span, and WO-26 was already using it as "near-neutral". |
| 2 | **`cityStreet`'s period mode leaves modern street furniture.** The ground-floor retail fascia band and the rectangular-headed lamp standards are untouched, and the drays have shafts but no horse, so they read as parked handcarts. | t011b (92.5 s) | Two small substitutions in the template — fascia band → a course of stone with painted shop names, lamp head → a glazed gas lantern on a scrolled bracket — plus a horse in the shafts of the *static* dray only (the travelling one must keep its wrap arithmetic). |
| 3 | **Floating dialogue is still not rule-driven.** t022 sets black-with-white-halo over a pale wall (correct); t105 sets **white with a thin dark outline over the same pale terracotta** and the pale patches measure ~2:1 contrast. The engine can do it; the choice is not derived from the ground. | t105 (721 s) | The fix WO-23 already specified and nobody has implemented: pick the float ink from the scene's own ground luma in `bubble.tsx` — dark ink above ~55% luma, light below. Doing it per scene invites a fourth recurrence. |
| 4 | **The number note and the over-the-shoulder silhouette occupy the same corner.** On t020 the white note card is pasted over the dark foreground silhouette in the lower left. Readable, but two devices stacked. | t020 (156 s) | Place the note on the side opposite `foreground.side` when both are present. |
| 5 | **Panel cell clipping persists.** In the `grid4` split the grey crowd's legs are cut by the horizontal gutter in the top-left and top-right cells. | t017 (130 s) | WO-23's fix still applies: inset the figure baseline inside a panel cell rather than letting the cell crop the shared stage. |
| 6 | **`closeUpPortrait` camera lock 24/48**, the lowest in the library and less than two-thirds of the reference's 40. | all 6 samples | The 5.6× head fills three cell rows and its eyes and mouth animate every frame. Either shrink the head or hold the blink/mouth still for the sampled interval; WO-27 measured the identical figure, so it is stable, not drifting. |
| 7 | **Figures wear modern suits and ties in every period scene.** | whole 1844 span | `figure.tsx`, not the templates — documented by WO-27 as out of scope for the flag, repeated here because a reviewer will see it before anything else on this list. A frock coat and a stock collar variant keyed off the same `usePeriod()` would close it. |

### Thumbnail
Montserrat ExtraBold caps ✅ · kicker "158 YEARS OLD" renders ✅ · grey crowd has eyes and mouths and
sits inside the frame ✅ · desaturated grey field, single red accent, pushed face with teeth, `!!` and
squiggles ✅.

**Both previously-recorded thumbnail defects reproduce and are NOT fixed:**
* **The hero's arms render as two detached black brackets** either side of the head, with a visible gap between each bracket and the torso. Confirmed at full size and in a 4× crop.
* **At 120 px wide only the headline reads.** "DEAD IN A WEEKEND" is clear; the kicker "158 YEARS OLD" and the `$613 BILLION` placard are both illegible smudges.

Fix for the arms: the arm path is being drawn from a shoulder anchor that sits inside the head's
bounding box, so the head's fill paints over the joint. Anchor the arm to the torso's shoulder line and
draw the arm *under* the head group. Fix for the 120 px legibility: the kicker and placard are carrying
information the headline already implies — either drop them or set the kicker at the headline's own
weight and half its size, which is the only size that survives the thumbnail rail.

---

## 7. Could a viewer tell our frames from Crayon Capital's?

**On a text card, no.** Unchanged, and now slightly better: the narration card's line sets at 0.515 w
against the reference cell's 0.536 (it was 0.622), the single-word beat measures 0.099 h against 0.092,
and the chapter card's type is 22% larger per character than the reference's rather than smaller.

**On a single mid-body frame — genuinely hard now, and for a different reason than last time.**
WO-23's answer was "mostly no, but colour gives us away: we paint 80% of the frame where the reference
paints 25%." That is fixed. Coverage is **0.350** and all-pixel saturation **0.176** against the
reference's 0.247 and 0.137 — 1.28×, not 3.25× — and the variance the bible asks for is back, with 34
of 90 frames now *below* the reference's own saturation. Flat fill is 90/90 in band. What is left in a
still is **tonal vocabulary**: 77 colour buckets against 113. Our frames are correctly *keyed* and
correctly *dense*, but each one is built from fewer distinct materials than theirs, so a reference
frame rewards a second look and ours does not. That is a subtler tell than "cartoonish", and it is the
one I would fix next.

**Over sixteen minutes — closer than WO-23, and the period work is why.** 8/8 distinct set-ups holds,
the 30 s repeat share is 56.2%, no template repeats adjacently, and the number of pairs sitting at the
minimum reuse gap nearly halved (18 → 10). The library effectively grew from 13 rooms to **21 rendered
(room, period) pairs** without a single new template. Three tells remain, all measured:

1. **Rhythm is uniform.** We cut at 14.5/min where the reference cuts at 12.5, and our longest hold is
   9.8 s where theirs runs to 16.5 s. The reference alternates fast passages with long stillnesses; we
   are metronomic. This is now the **largest** remaining structural difference — bigger than colour.
2. **Tonal vocabulary.** 77 buckets vs 113, as above.
3. **Two rooms that betray the century.** `factoryFloor`'s dial gauges and extractor fan, and
   `cityStreet`'s shop fascia and lamp standards, are visible in three of the nineteen 1844 scenes.
   Everything else in that span now reads as 1844.

**Verdict.** Writing, camera discipline, sound, devices and packaging are at reference standard and
have been since WO-23. The colour problem that defined the last measurement is closed. The environment
library is no longer a blocker in either direction — modern or historical. What separates our frames
from theirs is now **two bounded things**: a thinner material palette inside each keyed room, and an
edit that never stops moving. Neither needs a new template tranche, neither is a rewrite, and both have
a number attached. **A viewer comparing single frames would struggle; a viewer watching both episodes
end to end would still notice that ours never pauses.**
