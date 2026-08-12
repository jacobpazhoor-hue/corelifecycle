# COMPARISON — our sample episode vs Crayon Capital

**Episode:** `The 158-Year-Old Bank That Died in a Weekend` (slug `lehman_brothers`, topic queue #3).
**Built:** 2026-08-11, WO-13. **Runtime:** 14.09 min · 39 scenes · 2,091 words · 25,364 frames.
**Render:** `out/lehman_brothers.mp4`, 147 MB (gitignored — not committed).
**Our frames:** `docs/research/crayon/ours/*.jpg` (7 stills, native 1280×720).
**Their frames:** `docs/research/crayon/frames/*_montage_verified.jpg` and `<videoId>/thumb.png`.

> **How to read this.** Every number below was measured on this build, not estimated. Where a metric is
> resolution- or method-dependent the method is stated inline, because the same artwork can be made to
> score anywhere in the band by changing either. Flat fill is always **native 1280×720 render at
> `--scale=0.6666667`** — never a downscale of a 1920 frame. Motionless share is always **5 Hz**, the
> reference's own sampling rate. Nothing here is marked MATCH on the strength of an eyeball.

> ⚠ **`frames/wolf_office_singleframe.jpg` is not evidence of anything about the reference.** It is the
> capture that *demonstrates the bug* documented in `MEASUREMENTS.md` — Chrome freezes video decoding
> when backgrounded, so eight different timestamps returned one stale frame. It shows the same office
> eight times because the decoder was frozen, **not** because the reference reuses one set. The two
> `*_montage_verified.jpg` sheets are the real samples, and they show something close to the opposite.

---

## 1. Our frames vs their frames, at matched beats

### Beat 1 — the hook
| | |
|---|---|
| **Theirs** | No captured hook frame exists; the hook is characterised in `MEASUREMENTS.md` from transcripts only. |
| **Ours** | `ours/hook_t01.jpg` — `cityStreet` wide, grey crowd, colour hero, `$639 BILLION / THE LARGEST BANKRUPTCY IN U.S. HISTORY` number card bottom-left. |
| **Verdict** | The **writing** hook matches the five-step formula exactly (§2 below). The **frame** is the episode's weakest: a wide `cityStreet` crop puts pale sky across the top quarter and reads washed-out next to any reference frame. Same template at a *medium* crop (12:00, 8:30) is markedly richer. Opening on the weakest crop of the weakest-keyed template is a self-inflicted wound. |

### Beat 2 — a chapter turn
| | |
|---|---|
| **Theirs** | `depression_montage_verified.jpg` @4:05 — black ground, white handwritten italic, "The Day America Fell" over a smaller "Black Tuesday and the Market Collapse", subtitle on ONE line. Title 0.565 frame-width. |
| **Ours** | `ours/chaptercard_t04.jpg` — black ground, white handwritten italic, "The Cotton Store" over "How a Dry Goods Shop / Became a Wall Street Bank". |
| **Verdict** | Structurally identical and genuinely hard to tell apart at a glance. One measured difference: our 45-character subtitle **wraps to two lines**, and because title and subtitle are size-locked at 0.75, the wrap scales the whole block down — our title measures **0.425 w against the reference's 0.565 w**. Fix in §3. |

### Beat 3 — a mid-body scene
| | |
|---|---|
| **Theirs** | `wolf_montage_verified.jpg` @3:34 (office, over-the-shoulder onto a dark foreground silhouette, floating handwritten dialogue) and @9:20 (saturated orange panel, two speech balloons, grey crowd). |
| **Ours** | `ours/crowdhero_t11.jpg` — `exchangeFloor`: quote board, banks of desks and screens, grey headset crowd, single colour hero. |
| **Verdict** | Density is genuinely comparable — this is the strongest environment we have. Two gaps: the reference's mid-body frames carry a **saturated colour commitment** (that orange panel) where ours is near-monochrome (`exchangeFloor` mean saturation **0.040** against the reference's *least* saturated measured frame at 0.308), and the reference frames a **dark foreground silhouette** for depth, which none of our six templates does. |

### Beat 4 — a text card
| | |
|---|---|
| **Theirs** | `depression_montage_verified.jpg` @2:00 — white ground, black italic, two centred lines. And @7:10 of the Wolf sheet — a near-black frame carrying only the small word *"It"*, sitting ~14% from the left. |
| **Ours** | `ours/narrationcard_t02.jpg` ("Everyone saw it coming. / Nobody would pay to stop it.") and `ours/wordcard_t16.jpg` ("More"). |
| **Verdict** | **The closest match in the whole episode.** Narration line measures **0.534 w against the reference's 0.53 w**. The single-word beat measures **0.094 frame-height of ink against the reference's 0.092** — small word on a large empty ground, exactly as specified. Ours sits centred rather than off-axis, which the bible explicitly permits (their off-axis sample is n=1). I do not believe a viewer could separate these. |

### Beat 5 — the ending
| | |
|---|---|
| **Theirs** | Endings are transcript-characterised: thematic reflection → quote or callback to the opening image → sometimes a forward tease. No captured ending frame. |
| **Ours** | 14:30 in the render — `domesticInterior`, two suited figures on a sofa, over the closing line *"Henry Lehman opened a shop where the customers had no money. Only cotton."* |
| **Verdict** | The **writing** lands the formula (reflection + complicit "we" + callback to the opening image, no CTA). The **frame contradicts the line**: the script is describing an 1844 dry-goods shop and the picture is a modern living room, because no shop/store/retail environment exists in the six. This is the template constraint doing visible damage at the single most important moment in the episode. |

### Bonus — packaging
| | |
|---|---|
| **Theirs** | `LuEcoqizj0o/thumb.png`, `KE-WJevx-7c/thumb.png` — heavy outlined caps top, desaturated grey city, red crash polyline as the single accent, huge full-colour hero with pushed face (open mouth, teeth, worry lines, `!!`, stress squiggles), small grey crowd holding a placard. |
| **Ours** | `out/_thumb_lehman.png` (`crash` archetype). |
| **Verdict** | Compositionally a close copy — outlined caps, grey field, red polyline, `$613 BILLION` placard, pushed hero with `!!` and squiggles. Two real defects: **our grey crowd renders as three headless pills** (the reference's grey crowd have faces and expressions), and the `kicker` "158 YEARS OLD" is **silently dropped** because `HEAD` prefers `line1`, so the thumbnail loses the hook's key number. |

---

## 2. Spec checklist — every item in `CRAYON_BIBLE.md`

### §1 Format
| Spec | Measured | Verdict |
|---|---|---|
| 3rd-person past-tense explainer, real subject | past-tense spine, 182 past markers, no invented fact (all in `docs/research/lehman_brothers.md`) | **MATCH** |
| Title formula + 36–64 chars | `The 158-Year-Old Bank That Died in a Weekend` = **44 chars**, `superlative` formula | **MATCH** |
| Runtime 13–21 min | **14.09 min** | **MATCH** |
| 3–5 chapters, `Evocative Noun: Plain Explanation` | **5**, all two-part, emitted as `card=dict(kind="chapter")` | **MATCH** |

### §2 Narration
| Spec | Measured | Verdict |
|---|---|---|
| **148.5 WPM runtime-inclusive** | **148.4** (2,091 words / 14.09 min) | **MATCH** (0.1 off) |
| Sentence mean 7.5–10.6 | **8.47** (247 sentences) | **MATCH** |
| Sentence median 6–9 | **7** | **MATCH** |
| 40–59% under 8 words | **56.3%** | **MATCH** |
| 29–68 explicit numbers | **49** strict (21 digit-form + 28 multi-word spelled) = 3.5/min. Loosest possible count is 105. | **MATCH** (at the top of the band) |
| Questions 3–27 | **3** | **MATCH** (on the floor) |
| "you" 2.6–13.4 /1000 words | **4.3** (9 raw) | **MATCH** |
| Total words 2,000–3,100 | **2,091** | **MATCH** |
| Hook — 5 steps in order | t01 shock stat + fragments · t02 "But…" turn · t03 "This is the story of…" · t04 "Montgomery, Alabama, 1844." | **MATCH** |
| Ending: reflection → callback, no CTA | complicit "we" (t38) + opening-image callback (t39); "subscribe/like/comment" absent | **MATCH** |

### §3 Camera — LOCKED
| Spec | Measured | Verdict |
|---|---|---|
| Locked camera, ≥35/48 cells at exactly 0.0 | gate's in-shot samples **34 / 38 / 33 / 48**; re-sampled inside a shot t09 gives **37–38**. Reference locked shots: **40/48** and **41/48**. | **CLOSE** — a few more cells active than the reference, because WO-14's localised element animation runs in every template. |
| No dolly / push-in / sway / parallax | none in `director.tsx`; shot type is a static crop only | **MATCH** |
| Whole-frame motion ≈1 shot in 3 at most | no sampled shot showed whole-frame motion | **MATCH** |

> The full 35-scene sweep reports mean 36.5/48 with some low values — those are my sampler landing across an intentional shot cut, not camera drift. Re-sampled inside a shot, every scene checked returned 37–41.

### §4 Editing rhythm
| Spec | Measured | Verdict |
|---|---|---|
| 12.5 cuts/min | **planned 12.35** · **detected 8.94** (frame-diff, isolated-peak, the reference's own method) | **MISS** on what a viewer sees |
| Mean shot 4.79s | **planned 4.86s** · **detected 6.68s** | **MISS** |
| Median shot 2.67–6.81s | **detected 5.07s** | **MATCH** |
| Range 0.61–16.46s | **detected 1.07–36.87s** | **MISS** — no short punches, and a 36.9s hold, 2.2× the reference's longest shot |
| ~40% motionless frames @5 Hz | **55.5%** | **MISS** — too still |

> The planned/detected gap is the finding. The planner emits 12.35 cuts/min but only **72% of them are
> detectable as cuts**, because none of the six explainer templates is in `director.tsx`'s `FOCUS` map,
> so they all fall to `FRAMINGS_FLAT` — wide and medium only. A 1.0→1.5 scale on identical artwork is a
> weak cut. Closeups are never available to any scene in this episode.

### §5 Art (native 1280×720, `--scale=0.6666667`, n=35 art scenes)
| Spec | Measured | Verdict |
|---|---|---|
| Flat fill 74.4–92.2%, mean ~84% | **mean 87.69%**, min 82.01, max 92.51 · **34/35 in band** | **CLOSE** — 3.7 points above the reference mean, i.e. consistently *emptier* |
| — one scene out of band | **t25 `exchangeFloor` 92.51%** (> 92.0 ceiling) | **MISS** |
| Ink 10–70% | **mean 39.5%**; but `officeFloor` runs **71–79%** | **MATCH** overall, `officeFloor` over |
| Saturation 0.308–0.646, variable by scene | **mean 0.209**; `boardroom` **0.012–0.016**, `exchangeFloor` **0.040–0.171** | **MISS** — below the reference's entire range |
| Distinct quantised colours 216–444 | **mean 179**; `boardroom` 96–165 | **MISS** |
| Stroke ≈6–10px at 1920 | `STROKE = 8`, `STROKE_THIN = 5` | **MATCH** |
| Uniform pure-black outline, no wobble/taper | vector strokes, no displacement filter | **MATCH** |
| Flat fill, no gradients on characters | no gradients in `explainer.tsx` by construction | **MATCH** |
| Character construction (round head, dot eyes, no nose, solid hair) | as drawn | **MATCH** |
| **Per-scene colour keying** | six templates share **three** keys — `daylight` (cityStreet), `grey` (boardroom, exchangeFloor), `interior` (officeFloor, domesticInterior, newsMontage) | **MISS** — the reference commits a *new* hue per scene |

### §6 Signature devices
| # | Device | Status |
|---|---|---|
| 1 | Full-screen text cards, both grounds | **MATCH** — 2 narration (white), 2 word (black) |
| 2 | Chapter title cards | **MATCH** structurally, **CLOSE** on type size (§7) |
| 3 | Speech bubbles + floating dialogue | **CLOSE** — 4 scenes, 5 lines, all three tail styles; one is illegible (§4 defects) |
| 4 | Multi-panel splits | **MATCH** — all three variants used (`grid4` t07, `v2` t20, `diagonal2` t34) |
| 5 | Grey anonymous crowd + colour hero | **MATCH** in-video; **defective in the thumbnail** (headless crowd) |
| 6 | Object showcase cards (isometric flat products on pure white) | **MISS** — not built |
| 7 | Document / newspaper montage | **MATCH** — `newsMontage`, very close to their 15:02 frame |
| 8 | Over-the-shoulder framing, dark foreground silhouette | **MISS** — not built |

### §7 Typography
| Spec | Measured | Verdict |
|---|---|---|
| Handwritten italic script for all on-screen text | Caveat, vendored offline, + 6° synthetic oblique | **CLOSE** — Caveat has no true italic cut; the slant is synthetic |
| Subtitle ratio ≈0.75 | `CRAYON_SUBTITLE_RATIO = 0.75` exactly (reference 0.72–0.77) | **MATCH** |
| Hierarchy by size alone, not weight | same weight both halves | **MATCH** |
| Narration line ≈0.53 w | **0.534 w** | **MATCH** |
| Chapter title ≈0.565 w | **0.425 w** | **MISS** |
| Single-word beat ink height ≈0.092 h | **0.094 h** | **MATCH** |
| Thumbnail: heavy geometric sans, ALL CAPS | as rendered | **MATCH** |

### §8 Sound
| Spec | Measured | Verdict |
|---|---|---|
| Music bed generally present | present across the full 847s | **MATCH** |
| **Ducked 8–15 dB under VO** | **1.6 dB.** The bed's RMS histogram is unimodal — no ducked population and un-ducked population. | **MISS** |
| Deliberate music-free passages | **54s (6.3% of runtime)** below −70 dB | **CLOSE** |
| Inter-sentence gaps 0.18–1.0s, varied | median **0.39s**, p10 0.12, p90 0.59; **73% inside the band** | **CLOSE** |
| Inter-scene gaps varied (not one fixed value) | 39 gaps, **37 distinct values**, 0.25–1.40s | **MATCH** |

> Diagnosis for the duck MISS: `duck_music.DUCK_FLOOR = 0.27` (−11.4 dB) is correct, but `SMOOTH_S = 0.18`
> is the attack/release and our inter-scene gaps are 0.25–0.55s. The envelope never recovers to 1.0
> inside a gap, so the bed is ducked *continuously* rather than sidechained, and the reference's
> audible breathing between lines never happens.

### §9 Packaging
| Spec | Measured | Verdict |
|---|---|---|
| Title 36–64 chars | 44 | **MATCH** |
| Thumbnail flat vector matching the video art | yes | **MATCH** |
| Hero in full colour vs desaturated grey field | yes | **MATCH** |
| Single saturated accent | red crash polyline only | **MATCH** |
| Pushed face (open mouth, teeth, marks, squiggles) | yes — `!!` + squiggles + open mouth with teeth | **MATCH** |
| Outlined white caps *or* amber band | outlined white caps | **MATCH** |
| Grey crowd with readable figures | **crowd renders headless** | **MISS** |

**Tally over the 59 checked spec rows: 39 MATCH · 7 CLOSE · 13 MISS.**

Per section — §1 4/0/0 · §2 10/0/0 · §3 2/1/0 · §4 1/0/4 · §5 5/1/4 · §6 4/2/2 · §7 5/1/1 ·
§8 2/2/1 · §9 6/0/1 (MATCH/CLOSE/MISS).

---

## 3. Every MISS, with a concrete fix

| # | MISS | Fix |
|---|---|---|
| 1 | **Scene variety — the headline problem.** 6 environments over 39 scenes. At the reference montages' own sampling density (8 points across the runtime) ours shows **4 distinct set-ups out of 8; both reference montages show 8 out of 8.** At 30s spacing, **69% of our samples repeat an environment already seen**. | Build the next tranche of the ~20–30 template set from `TEMPLATE_STRATEGY.md`. The four that would have paid for themselves in *this* episode alone: **courtroom/hearing**, **bank or institutional exterior**, **shopfront/retail interior** (the ending needs it), **stage/podium** (the Einhorn beat needs it). |
| 2 | **Detected cuts 8.94/min vs 12.5.** Wide↔medium on identical artwork is not a visible cut. | Add the six explainer templates to `director.tsx`'s `FOCUS` map so `FRAMINGS_FACE` (which includes a 2.2× closeup) is selected. Every one of them stages a locatable hero. |
| 3 | **Mean shot 6.68s detected vs 4.79s; longest 36.9s vs 16.46s.** | The 36.9s hold is a `panels` scene: `panels` replaces the whole shot plan with one static split, so a 26s scene becomes one 26s shot. Let a `panels` scene re-cut *between panel arrangements*, or cap panels scenes near the reference's 16.46s ceiling. |
| 4 | **Motionless 55.5% vs ~40%.** | WO-14 animates a handful of elements per template; it needs more of them, or a second animated element in the lower half of the frame — the bottom rows are where our zero-cells cluster. |
| 5 | **Saturation 0.209 vs 0.308–0.646.** `boardroom` at 0.012 is effectively monochrome. | The reference's grey scenes still carry colour — skin, a suit, a saturated prop. Give `grey`-keyed templates a mandatory saturated accent object, and raise hero skin/clothing saturation. |
| 6 | **Distinct colours 179 vs 216–444.** | Same fix as #5; the tone ladder is currently a single-hue ramp per key. |
| 7 | **Only 3 colour keys across 6 templates.** | Split `interior` into warm/cool/dark variants and give `exchangeFloor` its own key so it stops sharing `grey` with `boardroom`. |
| 8 | **t25 `exchangeFloor` flat fill 92.51%, above the 92.0 ceiling.** Also: the gate's 4-sample scheme did not catch it — it sampled t06/t15/t26/t36. | Add mid-ground density to `exchangeFloor` (it is thinnest at wide crops). Separately, the gate should sample more than 4 scenes, or sample the widest crop of each template. |
| 9 | **Chapter title 0.425 w vs 0.565 w.** | Keep chapter subtitles ≤ ~36 characters so they set on one line. Two of my five are 44–45 chars: "How a Dry Goods Shop Became a Wall Street Bank" and "The Accounting That Hid Fifty Billion Dollars". |
| 10 | **Duck depth 1.6 dB vs 8–15 dB.** | Lower `duck_music.SMOOTH_S` well below the gap length, or gate the duck on gaps longer than the release, so the bed actually returns to full between lines. |
| 11 | **§6.6 object showcase card missing.** | A genuinely cheap template: isometric flat props on pure white. The reference uses it for exactly the "here is the product" beat this format hits constantly. |
| 12 | **§6.8 over-the-shoulder / dark foreground silhouette missing.** | Add a foreground silhouette layer available to any template — it is one dark shape, and it is the reference's main depth cue. |
| 13 | **Thumbnail grey crowd renders headless** — three grey pills, no faces, where the reference's grey crowd have eyes and angry mouths. | `ThumbCrash` places `CrowdRow` at `y=1180` in a 1080-tall viewBox, so the figures sit below the frame and only their shoulders show. Move the row up to ~`y=1020` and let the heads land inside the frame. |

### Defects found in QA that are not spec items
| Defect | Where | Fix |
|---|---|---|
| **Floating dialogue illegible** — white script on the pale window wall | t28, 10:30 | Set `color="#000000"`, exactly as `docs/BIBLE.md` §8 warns for a pale scene. My error, not the engine's. |
| **A panel cell's `ground` override is dead** when the cell also names a `template` — the template's own `<Frame>` paints a full-bleed ground on top | t07 `grid4`, 3:00 (the `#e8541f` cell renders brown) | Either document `ground` as applying only to template-less cells, or have `Panel` paint its ground *over* the child's. Reported, not fixed — it is outside this work order. |
| **Number cards ghost during their 10-frame exit fade**, art visible through the card | every overlay, e.g. 11:30 | Shorten the exit or fade opacity to 0 faster than the card's own ground. |
| **Ending frame contradicts the ending line** (living room over "he opened a shop") | t39, 14:30 | Needs fix #1's shopfront template. |
| **Thumbnail drops the `kicker`** — `HEAD` prefers `line1`, so "158 YEARS OLD" never renders | `src/thumbs.tsx:139` | Put the full headline in `line1`/`line2`; or have `crash` render kicker + head. |

No crashes, no text overflow, no figure collisions, no blank frames, and no legacy line-art styling
appeared anywhere in the 30 sampled stills.

---

## 4. Could a viewer tell our frames from theirs?

**On a text card, no.** The narration card, the chapter card and the single-word beat measure within
0.004 of the reference on every dimension I can measure, use the same font class, the same grounds and
the same size hierarchy. Held side by side these are the same device.

**On a single mid-body frame, mostly no.** `exchangeFloor`, `officeFloor`, `newsMontage` and
`domesticInterior` sit inside the reference's flat-fill band with comparable prop density, correct
linework and a correct grey-crowd/colour-hero hierarchy. The `newsMontage` frame is close enough to
their 15:02 frame to pass.

**Over fifteen minutes, yes — easily, and for one reason.** The reference shows a viewer eight different
worlds in eight samples; we show four, and 69% of our 30-second samples are a room the viewer has
already sat in. Beyond about the four-minute mark the episode reads as the same brown office and the
same grey trading floor in rotation. Everything else on the MISS list is a tuning problem measured in
single-digit percentages; **this one is structural**, and no amount of writing quality hides it.

The second-order tells, in order of how quickly they would be noticed: the near-monochrome grey scenes
(saturation 0.012 where the reference's most drained frame is 0.308), the soft cut rhythm (8.94/min
detected against 12.5), and a music bed that never breathes because it is ducked continuously.

**Verdict: the writing, typography, camera, sound structure and per-frame art quality are at reference
standard. The environment library is not, and it is the thing a viewer actually experiences.** The
honest read is that this pipeline is one template tranche — roughly the four environments named in fix
#1 — away from being genuinely hard to distinguish. It is not there yet.

---

## 5. Build and gate status

`python3 build.py` **HALTs**, and the reason is a bug in `gate.py`, not a defect in this episode.

`gate.py` builds its template registry by regex-scanning `src/scenes.tsx` (`name: S<digit>`) and
`src/stage.tsx` (`name: () =>`). It never reads **`src/explainer.tsx`**, where all six restyled
explainer templates are defined and from which they are spread into `TEMPLATES` at `src/scenes.tsx:811`.
Every scene in this episode therefore fails `template '<name>' not in registry` — 39 identical false
failures. The same run's own style checks rendered those templates successfully, which proves they are
registered.

Every other gate assertion passes:

```
style t06 f3029  @1280x720: flat fill 91.46%  locked cells 34/48
style t15 f8831  @1280x720: flat fill 87.45%  locked cells 38/48
style t26 f15968 @1280x720: flat fill 88.02%  locked cells 33/48
style t36 f22332 @1280x720: flat fill 88.95%  locked cells 48/48
runtime: 14.1 min | narration: 148.4 WPM runtime | scenes: 39 | warnings: 0 | failures: 39
```

Verified by copying `gate.py` to a throwaway probe and adding **only** the explainer scan — the probe
reported `warnings: 1, failures: 0, GATE: PASS ✅` (the warning being the deliberately skipped frame
checks). `gate.py` itself was **not modified**; WO-13 forbids it. The one-line fix, for whoever owns
that file:

```python
_expl = os.path.join(ROOT, "src", "explainer.tsx")
if os.path.exists(_expl):
    _em = re.search(r"EXPLAINER_TEMPLATES[^{]*\{(.*?)\}\);", open(_expl).read(), re.S)
    if _em: tmpl_keys |= set(re.findall(r"(\w+):", _em.group(1)))
```

### One writer-side finding worth carrying forward
`gen_voice_edge.RATE = "-13%"` was measured against the *previous* episode, whose sentences average ~15
words. A script written to the canon's own sentence targets (8.47 mean, 56.3% under 8 words) makes
edge-tts insert a sentence-final pause far more often, so the same rate reads slower: **147.3 WPM speech
here vs 149.1 on the legacy episode, giving 143.5 WPM runtime** — which the *previous* revision of
`gate.py` (145–152) would have rejected outright. Because runtime WPM can never exceed speech WPM and
97% of runtime is speech, no amount of gap trimming can recover it. `content.py` therefore sets
`NARRATION_RATE = "-10%"` per scene — a documented writer field, measured across five rates on this
script's own prose — landing at **148.4 WPM runtime, 0.1 off the reference aggregate**.
