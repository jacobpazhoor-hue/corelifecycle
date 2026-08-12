# COMPARISON — our sample episode vs Crayon Capital

**Episode:** `The 158-Year-Old Bank That Died in a Weekend` (slug `lehman_brothers`, topic queue #3).
**Built:** 2026-08-12, WO-23. **Runtime:** 16.16 min · 196 scenes · 2,468 words · 29,085 frames.
**Render:** `out/episode.mp4`, **210 MB** (gitignored — not committed). `out/thumbnail.png`, 188 KB.
**Gate:** `python3 gate.py out/episode.mp4` → **PASS**, 0 warnings, 0 failures.
**Previous measured build:** WO-13, 14.09 min · 39 scenes, scored **39 MATCH · 7 CLOSE · 13 MISS**.

> **How to read this.** Every number was measured on this build. Where a metric is method- or
> resolution-dependent the method is stated inline, because the same artwork scores anywhere in the
> band if you change either. Flat fill is always a **native 1280×720 render (`--scale=0.6666667`)**,
> never a downscale. Motionless share is always **5 Hz**. Saturation is now reported as **two
> statistics** — see the methodology note below, it is the correction that matters most in this pass.
> `n=31` art scenes were sampled for art metrics; 39 stills were read by eye for QA.

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

`python3 build.py` → **BUILD OK**, `GATE: PASS ✅`, 0 warnings, 0 failures.
The registry bug that produced 39 false HALTs in WO-13 is gone (WO-16 rewrote the registry to follow
the spreads out of `TEMPLATES`), so the gate now measures this episode for real.

### One render-killing defect, found by rendering and not by the gate

`src/Video2.tsx:378` built the static-overlay ramp as `interpolate(f, [10, 28, D - 10, D], …)`.
`interpolate` requires a strictly increasing input range, so **any scene shorter than 38 frames threw
and killed the whole render** — `[10, 28, 25, 35]` at `t065` ("Unless.", 35 frames, frame 13298).
The ramps are computed unconditionally, so the scene did not even need an overlay to crash.

This matters beyond the one-line fix: §3a of `docs/BIBLE.md` explicitly licenses one-word scenes and
cites this very 1.17s scene as in-range, so **35 frames is a supported input that had never been
rendered**. The gate renders 8 stills and cannot see it; the smoke render checks frames 0 and
`totalFrames/2` and cannot see it either. Fixed by compressing the ramp into whatever room the scene
has. `gate.py` was **not** modified.

**Latent, not fixed, reported:** `src/director.tsx:315` (`CountUp`) has the identical bug at
`[10, 24, dur - 18, dur]` — it throws for any scene under 43 frames. No short scene in this episode
carries a numeric overlay, so it never fires here. It will fire the first time a writer puts an
overlay on a punch scene.

### Rendering had to be re-engineered around two disk bombs

The owner's disk has been filled twice by this project. Both mechanisms were identified this pass:

1. **Video.** Remotion 4.0.474 keeps the *entire* JPEG frame sequence in `$TMPDIR` and stitches at the
   end — measured **0.2215 MB/frame → 6.3 GiB** for 29,085 frames, against 7.4 GiB free. The first
   attempt was on that trajectory and was killed at frame ~4,500.
2. **Audio.** `remotion render --codec=wav` pads **every one of the 196 VO assets to the full 969.5s
   timeline** before mixing. Free space went **5.4 GiB → 1.6 GiB in five minutes** without finishing;
   I aborted at the floor, and killing it returned 4.3 GiB instantly (the space was held in unlinked
   open files).

Working method: video rendered in **7 frame-range segments** with the temp dir cleared between them
(peak ~0.93 GiB), concatenated with stream-copy; audio summed directly from the composition's own
graph. The audio mixer was **validated against a Remotion-rendered 30s window of the real
composition** — identical gains and bit-exact residual on most scenes, after discovering that Remotion
applies the **−3 dB pan law** when upmixing mono assets (VO 0.705 = 1/√2, sfx 0.345 = 0.50/√2,
already-stereo bed 0.1595 = its literal 0.16). Residual difference is a ≤16-sample (0.33 ms) placement
offset on some scenes — inaudible, and it affects none of the §8 numbers, which are measured on the
source stems rather than the mux.

Result: **29,085 frames exactly**, 16:09.50, 1920×1080, AAC 48 kHz stereo. **Minimum free disk during
the successful render: 3.43 GiB**, never near the 1.5 GiB abort floor.

---

## 2. Spec checklist — every item in `CRAYON_BIBLE.md`

### §1 Format
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| 3rd-person past-tense explainer, real subject | MATCH | past-tense spine, sources in `docs/research/lehman_brothers.md` | **MATCH** |
| Title formula + 36–64 chars | 44 | **44 chars**, `superlative` formula | **MATCH** |
| Runtime 13–21 min | 14.09 | **16.16 min** | **MATCH** |
| 3–5 chapters, `Evocative Noun: Plain Explanation` | 5 | **5**, all two-part | **MATCH** |

### §2 Narration
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| **148.5 WPM runtime-inclusive** | 148.4 | **152.7** | **CLOSE** — inside the channel's per-video spread (139.2–152.9) but 4.2 over the aggregate, and 1.3 under the gate ceiling |
| Sentence mean 7.5–10.6 | 8.47 | **8.60** (287 sentences) | **MATCH** |
| Sentence median 6–9 | 7 | **7** | **MATCH** |
| 40–59% under 8 words | 56.3% | **50.9%** | **MATCH** |
| 29–68 explicit numbers | 49 | **49** strict (22 digit + 27 multi-word spelled) = 3.03/min | **MATCH** |
| Questions 3–27 | 3 | **4** | **MATCH** |
| "you" 2.6–13.4 /1000 words | 4.3 | **5.67** (14 raw) | **MATCH** |
| Total words 2,000–3,100 | 2,091 | **2,468** | **MATCH** |
| Hook — 5 steps in order | MATCH | t001 shock · t002 fragments · t003 "But…" · t004 thesis · t005 "Montgomery, Alabama, 1844." | **MATCH** |
| Ending: reflection → callback, no CTA | MATCH | t135 complicit "we" + t141 machine callback; no subscribe/like/comment | **MATCH** |

### §3 Camera — LOCKED
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| Locked camera, ≥35/48 cells at exactly 0.0 | 33–48, CLOSE | **mean 39.0/48, min 36, max 48** (n=31 scenes) — reference locked shots 40/48 and 41/48 | **MATCH** ⬆ |
| No dolly / push-in / sway / parallax | MATCH | none in `director.tsx` | **MATCH** |
| Whole-frame motion ≈1 shot in 3 at most | MATCH | none sampled | **MATCH** |

### §4 Editing rhythm
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| 12.5 cuts/min | detected 8.94 | **detected 15.22** (246 cuts / 969.6s) | **CLOSE** ⬆ — inside the reference's own per-window range 9.3–15.9, but 22% over the aggregate |
| Mean shot 4.79s | 6.68s | **3.94s** | **CLOSE** ⬆ — inside the reference's per-window means 3.87–6.36s |
| Median shot 2.67–6.81s | 5.07s | **4.00s** | **MATCH** |
| Range 0.61–16.46s | 1.07–36.87s | **0.40–9.60s** | **MISS** — reversed: the 36.9s hold is gone, but now there is *no* long hold at all (max is 58% of the reference's ceiling) and the floor undercuts it |
| ~40% motionless frames @5 Hz | 55.5% | **68.0%** (@15 Hz 82.2%, @30 Hz 85.9%) | **MISS** ⬇ — regressed; too still |

> **Detector calibration** (the previous build reported a bare number). On synthetic data with planted
> cuts: **93% recall, 0 false positives**, and it correctly ignores a sustained-motion plateau. On real
> footage it found exactly **34** visible changes in segment 0 against **34** expected from the timeline
> (27 scene cuts + 3 card lifts + 4 overlay reveals), so it counts what a viewer sees as a change, not
> only scene boundaries. Episode-wide the timeline predicts 230 visible changes; 246 detected.

### §5 Art (native 1280×720 `--scale=0.6666667`, n=31 art scenes)
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| Flat fill 74.4–92.2%, mean ~84% | 87.69 | **mean 87.48**, min 79.92, max 90.66 · **31/31 in band** | **CLOSE** — still ~3.5 pts above the reference mean, i.e. emptier |
| — one scene out of band | t25 at 92.51, MISS | **0/31 out of band; none above the 92.0 gate ceiling** | **MATCH** ⬆ |
| Ink 10–70% | MATCH, `officeFloor` 71–79 over | **mean 39.3**, range 15.1–71.9; only `domesticInterior` 71.6 marginally over | **MATCH** |
| **Saturation** — see §0(a) | 0.209 vs 0.308–0.646, MISS (*wrong statistic*) | **all-pixel 0.445** (0.321–0.638) vs reference **0.137** native PNG / **0.231** montage art cells · **coloured-pixel 0.561** vs reference **0.552** · **coloured fraction 0.799** vs reference **0.25** | **MISS** — direction **reversed**: we now *over*-saturate |
| Rich colour buckets (>0.02% of pixels; reference 113) | measured on the wrong metric (179 vs 216–444) | **mean 92**, 27/31 below 113 | **MISS** |
| Stroke ≈6–10px at 1920 | MATCH | `STROKE = 8`, `STROKE_THIN = 5` | **MATCH** |
| Uniform pure-black outline, no wobble/taper | MATCH | vector strokes, no displacement filter | **MATCH** |
| Flat fill, no gradients on characters | MATCH | none in `explainer.tsx` by construction | **MATCH** |
| Character construction | MATCH | as drawn | **MATCH** |
| **Per-scene colour keying** | 6 templates shared 3 keys, MISS | **13 templates, 13 committed hues** — verified by eye: blue `exchangeFloor`, violet `crowdQueue`, gold `chartBoard`, brown `officeFloor`, magenta `domesticInterior`, crimson `broadcastDesk`, teal `factoryFloor`, amber `bankExterior`, indigo `courtHearing` | **MATCH** ⬆ |

> **Flat-fill trap check.** Flat fill counts *right*-neighbour equality, so horizontal rules do not
> register. Measured both ways: ours reads **87.48% right / 81.91% down** — a 5.6-point gap — where the
> reference PNG reads **77.48 / 77.24**, i.e. symmetric. Our art carries noticeably more horizontal
> banding (ceiling strips, desk rows, shelf lines) than the reference's does.

### §6 Signature devices
| # | Device | WO-13 | **This build** |
|---|---|---|---|
| 1 | Full-screen text cards, both grounds | MATCH | **MATCH** — 6 narration (white), 4 word (black) |
| 2 | Chapter title cards | MATCH | **MATCH** — 5, one line each, subtitles all ≤32 chars |
| 3 | Speech bubbles + floating dialogue | CLOSE | **CLOSE** — 6 scenes; the balloon is translucent with no black keyline and one float is illegible (defects 1–2 below) |
| 4 | Multi-panel splits | MATCH | **MATCH** — `grid4` t017, `v2` t070, `diagonal2` t121 |
| 5 | Grey anonymous crowd + colour hero | MATCH in-video, thumb defective | **MATCH** — and the thumbnail crowd now has faces |
| 6 | Object showcase cards | **MISS — not built** | **MATCH** ⬆ — built, t035 and t063, isometric flat props on pure white |
| 7 | Document / newspaper montage | MATCH | **MATCH** — `newsMontage`, the closest frame we have to the reference |
| 8 | Over-the-shoulder, dark foreground silhouette | **MISS — not built** | **MATCH** ⬆ — built, t020 / t040 / t092 |

### §7 Typography
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| Handwritten italic script for all on-screen text | CLOSE | Caveat + 6° synthetic oblique; no legacy face anywhere in the live path | **CLOSE** — Caveat has no true italic cut |
| Subtitle ratio ≈0.75 | MATCH | `CRAYON_SUBTITLE_RATIO = 0.75` | **MATCH** |
| Hierarchy by size alone, not weight | MATCH | same weight both halves | **MATCH** |
| Narration line ≈0.53 w | 0.534, MATCH | **0.622 w** mean (0.499–0.797) vs the reference cell's **0.536 w** | **MISS** ⬇ — regression; the WO-22 card copy is wordier, so lines run long and set small |
| Chapter title ≈0.565 w | 0.425, MISS | **0.415 w** absolute — but **0.0350 w/char vs the reference's 0.0288** (21% *larger* per character) and cap height **0.118–0.121 h vs 0.141 h** | **CLOSE** ⬆ — see §0(c); the absolute figure is a string-length artefact, the type is slightly small, not small by a third |
| Single-word beat ink height ≈0.092 h | 0.094 | **0.094 / 0.096 / 0.104 h** | **MATCH** |
| Thumbnail: heavy geometric sans, ALL CAPS | MATCH | Montserrat ExtraBold, vendored | **MATCH** |

> Reference values here were measured **like-for-like** off the `depression_montage_verified` cells with
> the same band-finder used on ours: chapter title **0.576 w / 0.141 h**, narration line **0.536 w**.
> Those reproduce the bible's documented 0.565 and 0.53 to within 2%, which is the check that the
> method is sound.

### §8 Sound
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| Music bed generally present | MATCH | present across 95% of 969.5s | **MATCH** |
| **Ducked 8–15 dB under VO** | **1.6 dB, unimodal — MISS** | **11.37 dB.** Recovered envelope (ducked ÷ un-ducked bed) is exactly two-valued: **1.000 and 0.270**. Bed RMS histogram is **BIMODAL** — modes at **−31.2 dB and −20.3 dB, 10.9 dB apart**, dip ratio 0.19. Returns to full bed in **583** gaps. | **MATCH** ⬆ |
| Deliberate music-free passages | 54s (6.3%), CLOSE | **48.7s (5.0%)** in 2 passages of 26.6s and 22.1s | **CLOSE** |
| Inter-sentence gaps 0.18–1.0s, varied | median 0.39s, 73% in band | median **0.21s**, p10 0.09, p90 0.48; **59% in band** | **CLOSE** ⬇ — mild regression |
| Inter-scene gaps varied (not one fixed value) | 37 distinct / 39 | **148 distinct values across 196 gaps**, 0.34–1.50s | **MATCH** |

> **A regression found and fixed inside this work order.** `duck_music._pick_dry` placed a music-free
> passage **one scene** long. That was a length only by accident: at WO-13's 21.1s mean scene it gave
> 54s (6.3%), and the WO-22 re-cut to a 4.95s mean scene silently took the identical code to **8.6s
> (0.9%)**. Passages are now specified in **seconds** (`DRY_LEN_S = 22.0`) and extend over consecutive
> unblocked scenes, restoring 48.7s. Duck depth and bimodality are unaffected.

### §9 Packaging
| Spec | WO-13 | **This build** | Verdict |
|---|---|---|---|
| Title 36–64 chars | 44 | 44 | **MATCH** |
| Thumbnail flat vector matching the video art | MATCH | yes | **MATCH** |
| Hero in full colour vs desaturated grey field | MATCH | yes | **MATCH** |
| Single saturated accent | MATCH | red crash polyline only | **MATCH** |
| Pushed face (open mouth, teeth, marks, squiggles) | MATCH | open mouth with teeth, worry lines, `!!`, stress squiggles | **MATCH** |
| Outlined white caps *or* amber band | MATCH | outlined white caps, Montserrat ExtraBold | **MATCH** |
| Grey crowd with readable figures | **crowd headless — MISS** | **MATCH** ⬆ — three grey figures with eyes and mouths, inside the frame |
| *(also)* kicker rendered | dropped silently | **"158 YEARS OLD" renders** | fixed |

---

## Tally

| | MATCH | CLOSE | MISS |
|---|---|---|---|
| WO-13 (previous) | 39 | 7 | 13 |
| **WO-23 (this build)** | **45** | **9** | **5** |
| delta | **+6** | +2 | **−8** |

Per section (MATCH/CLOSE/MISS) — §1 4/0/0 · §2 9/1/0 · §3 3/0/0 · §4 1/2/2 · §5 7/1/2 · §6 7/1/0 ·
§7 4/2/1 · §8 3/2/0 · §9 7/0/0.

**Fixed since WO-13:** duck depth, per-scene colour keying, object showcase card, over-the-shoulder
silhouette, thumbnail crowd, thumbnail kicker, camera lock, the flat-fill outlier, chapter-card wrap.
**Regressed:** motionless share, narration-card line width, inter-sentence gaps, runtime WPM, and
saturation flipped from under to over.

---

## 3. Every remaining MISS, with a concrete fix

| # | MISS | Measured | Fix |
|---|---|---|---|
| 1 | **Saturation overshot.** WO-20 chased the bible's 0.308–0.646, which is a *coloured-pixel* band, using an *all-pixel* meter. | all-pixel **0.445** vs reference **0.137** (native PNG) — **3.25×**; vs the 11 montage art cells' 0.231 — **1.93×**. **8 of the reference's 11 art cells are less saturated than our least-saturated frame.** Our max 0.638 exceeds the reference's max 0.480. | The chroma *intensity* is already right — coloured-pixel S **0.561 vs 0.552**. The overshoot is **coverage**: we colour **79.9%** of the frame where the reference colours **25%**. Target **all-pixel 0.17–0.22** by cutting coloured coverage to ~0.30–0.40: keep the committed hue on the hero, key props and one accent plane, and return grounds, floors, ceilings and background architecture to near-neutral greys/off-whites. Second, **restore variance** — 4 of the reference's 11 art cells sit at 0.027–0.107 and we have **nothing below 0.321**; the bible's own words are "highly variable by scene". `broadcastDesk` (0.601), `domesticInterior` (0.526) and `factoryFloor` (0.525) are the three to drain first. |
| 2 | **Motionless 68.0% @5 Hz vs ~40%** — worse than WO-13's 55.5%. | @5 Hz 68.0 · @15 Hz 82.2 · @30 Hz 85.9 | This is the price of WO-17: with one framing per scene there is no re-crop, so between cuts *nothing* moves except the handful of elements each template animates. The cut rate cannot fix it (we already overshoot on cuts and it still got worse). Add a second and third animated element per template in the **lower half** of the frame, where the zero-cells cluster — a drifting figure, a ticker, a turning fan, paper settling. Cheap because the camera stays locked. |
| 3 | **Shot range 0.40–9.60s vs 0.61–16.46s.** | max hold is 58% of the reference's ceiling; min undercuts its floor | The writer now owns the cut rate (§3a), so this is a writing instruction: budget **two or three scenes per episode at 12–16s** — a mechanism explainer or a reflective beat that stands still — and stop writing sub-0.6s fragments. The reference's rhythm is not uniformly fast; it is fast *with occasional long holds*, and we have flattened it. |
| 4 | **Rich colour buckets 92 vs 113** (correct metric, >0.02% of pixels). | 27/31 frames below 113; `factoryFloor` 59.5, `officeFloor` 60.5, `domesticInterior` 71.5 | Same root cause as #1 inverted: each key is a single-hue tone ladder, so a frame has many *pixels* of colour but few *distinct* tones. Give each key 2–3 secondary tones (a contrasting prop family, a second material) rather than more of the same hue. Fixing #1 by neutralising grounds will help here too, because neutrals add buckets the ladder does not. |
| 5 | **Narration card line 0.622 w vs 0.536 w** — regression from WO-13's 0.534. | 6 cards, 0.499–0.797 w; the worst is t023 at 0.797 on a single line | The card copy got wordier in the WO-22 rewrite. Cap narration-card text at **~30 characters per line, 2 lines max**, so the line sets at the reference's width and size. This is a `content.py` writing rule, not an engine change. |

---

## 4. QA — 39 stills read by eye across the episode

**No crashes, no blank frames, no text running off-frame, no figure collisions that read as bugs, and
no legacy Helvetica/Arial styling anywhere.** Source check confirms it: only `textcard.tsx` and
`bubble.tsx` set a font, both `CRAYON_FONT`. The one-word scene `t065` that killed the render now
renders correctly (frame 13316).

| # | Defect | Where | Fix |
|---|---|---|---|
| 1 | **Floating dialogue illegible — white script on a pale wall.** This is the *same defect* the previous COMPARISON recorded at t28 and it has **not** been fixed, only moved. | t022, 2:48 — "Lehman will never be small again." over `closeUpPortrait`'s pale terracotta | Pick the float colour from the scene's own ground luma instead of leaving it to the writer: dark ink on any ground above ~55% luma. Doing it in `bubble.tsx` fixes it for every future episode; doing it per scene invites the third recurrence. |
| 2 | **Speech balloon is translucent and has no black keyline** — the window mullions read straight through it, and the reference's balloons are solid white with a heavy black outline (§5 "uniform pure-black outline"). | t051, 5:58 | Set the balloon fill opaque and give it the standard `STROKE` keyline. |
| 3 | **Colours that read as lurid** — the frames a viewer would call "wrong colour" rather than "moody". | `broadcastDesk` crimson (sat 0.601), `domesticInterior` magenta (0.526), `crowdQueue` violet, `chartBoard` gold | MISS #1's coverage fix. These four are the templates to drain first. |
| 4 | **Period/anachronism mismatch through chapters 1–2.** The narration is in 1844–1850s Alabama; the pictures are modern rooms with computer monitors, LED tickers and glass skyscrapers. | t005b (cotton growers → modern protest queue with skyline), t006b (1840s cotton economy → projector and bar chart), t007b (1840s → CRT monitors), t010; also a modern car parked in the 1850 `bankExterior` at t009 | Same class of defect as WO-13's "living room over a dry-goods shop", now spread over two chapters. Cheapest fix is a **period prop-suppression flag** on the template set (`era="historic"` hides monitors/tickers/cars and swaps the skyline for low masonry) rather than four new templates. |
| 5 | **Panel cell clipping.** In the `grid4` split a grey figure's head is cut by the bottom-left cell edge, and the overlay card covers much of that cell. | t017, 2:12 | Inset the figure baseline inside a panel cell, and suppress the number-card overlay on `panels` scenes — the split is already the composition. |
| 6 | **`officeFloor` reads identical across uses** — two samples 25s apart are near-indistinguishable apart from the OTS silhouette. | t092 vs t095b, 10:29 / 10:53 | The 13-room library is being asked to carry 196 scenes. Vary dressing per use (lights on/off, boxes packed, chairs empty) so a returning room reads as the *same room later*, not as a repeated asset. |
| 7 | **18 numeric overlay cards, a device with no reference support.** `CRAYON_BIBLE.md` §2 states plainly that *no captured reference frame carries a persistent numeric overlay card* — on-screen numbers appear only as lettering on an in-scene prop, in a text card, or in a balloon. | throughout, e.g. t002, t009, t020, t112 | Not scored as a MISS because no spec row covers it, but it is a visible house style the reference does not have. Either migrate the figures onto in-scene props/cards, or record the deviation deliberately in the bible. |

### Thumbnail
Montserrat ExtraBold caps ✅ · kicker "158 YEARS OLD" renders ✅ (was silently dropped) · grey crowd
has eyes and mouths and sits inside the frame ✅ (was three headless pills) · desaturated grey field,
single red accent, pushed face with teeth, `!!` and squiggles ✅.
**At 120 px wide the headline reads clearly; the kicker and the `$613 BILLION` placard do not.**
One construction defect: **the hero's arms render as two detached black brackets** either side of the
head, not joined to the torso — visible at full size.

---

## 5. Could a viewer tell our frames from theirs?

**On a text card, no.** Narration cards, chapter cards and the single-word beat use the same font
class, the same grounds and the same hierarchy, and the two size anchors I can measure like-for-like
(single-word ink height 0.094 vs 0.092; chapter cap height 0.118 vs 0.141) are close. The narration
card's line now runs long, which is a copy-length problem, not a design one.

**On a single mid-body frame, mostly no — and for a new reason.** The environment library went from 6
to 13, all thirteen are individually keyed, the object card and the over-the-shoulder silhouette both
exist, and the density is right (flat fill 31/31 in band, camera lock at the reference's own 39–41/48).
`newsMontage`, `bankExterior`, `courtHearing` and `exchangeFloor` would pass. What now gives us away in
a still is **colour**: we paint 80% of the frame where the reference paints 25%, so our frames read
hotter and flatter-keyed than theirs. A viewer would not name it; they would call our episode
"cartoonish" and theirs "designed".

**Over sixteen minutes — much harder than before, but yes.** The structural problem WO-13 died on is
gone: **8/8 distinct set-ups** in 8 evenly-spaced samples against the reference's 8/8 (was 4/8), the
30s repeat share is down from 69% to **58%**, no template repeats adjacently, and a set-up returns
after a mean of 79s. What is left is second-order and now measurable:

1. **Stillness.** 68% of 5 Hz samples are completely motionless against the reference's ~40%. This is
   the single biggest remaining tell and it got *worse*, not better — one framing per scene bought
   honest cuts and paid for them in dead air between cuts.
2. **Colour temperature.** 3.25× the reference's all-pixel saturation, with no low-saturation frames
   at all where the reference has four in eleven.
3. **Rhythm flattening.** We cut faster than the reference (15.2 vs 12.5/min) and never hold longer
   than 9.6s where it holds to 16.5s. The reference alternates; we are uniform.
4. **Period drift** in the first two chapters, which no amount of art quality hides when the narrator
   says 1844 and the frame shows a CRT.

**Verdict.** Writing, camera, sound, devices, packaging and per-frame density are at reference
standard, and the environment library is no longer the blocker it was — that was WO-13's structural
failure and it is closed. The remaining gap is a **grade-and-motion** problem, not a content one: drain
the chroma coverage, restore saturation variance, add a second animated element per template, and buy
back two or three long holds. Those are four bounded changes, none of them a new template tranche.
This build is materially closer than WO-13 and, unlike WO-13, its remaining defects are all things I
can put a number on.
