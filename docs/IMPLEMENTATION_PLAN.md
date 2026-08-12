# Crayon Replication — Implementation Plan (awaiting owner approval)

Spec: `docs/CRAYON_BIBLE.md`. Evidence: `docs/research/crayon/`.
Branch: `crayon-style` (not yet created). Nothing published; branch left unmerged for review.
Execution rule: every work order below is executed by an **opus subagent**; the style decisions and
accept/reject calls stay with the main session.

## Gap table

| # | Aspect | Crayon Capital (measured) | CoreLifecycle today | Change required | Files |
|---|---|---|---|---|---|
| 1 | Camera | Locked; 40/48 grid cells exactly 0.0 | Expo-out dolly push `1.0→1.075` + sine/noise handheld sway on every shot | **Delete all camera motion.** Keep framing types as static crops | `director.tsx` |
| 2 | Line | Clean uniform vector, ~6–10px @1920 | `feTurbulence`+`feDisplacementMap` (scale 3.2) + `boil()` wobble, `lineW 8` | **Remove rough filter + boil**; uniform stroke | `figure.tsx` |
| 3 | Character | Round head, dot eyes, no nose, solid hair shape, filled body | Stick figure, ellipse eyes w/ catchlight, Q-curve brows, quad "jacket" | **Rewrite the figure** | `figure.tsx` |
| 4 | Fill | ~84% flat fill, per-scene colour key | Line-art on warm paper `#f6f2e9`, global escalating grade | **Restyle to flat colour fields**; drop the global grade | `stage.tsx`, `scenes.tsx`, `Video2.tsx` |
| 5 | Grade | Palette swaps per scene | `levelProgress` tint gold→teal→ember→gold + darken + saturate | **Remove `GRADE_STOPS` dramaturgy**; per-scene keys instead | `Video2.tsx` |
| 6 | Editing | 12.5 cuts/min, mean 4.79s, ~40% frames static | `MAX_SHOT` 240f, 1–3 shots/scene, never static (constant drift) | Retime shot planner to ~4.8s mean; allow true holds | `Video2.tsx` |
| 7 | Text cards | Full-screen white/black cards, handwritten italic | none | **New component** | new `textcard.tsx` |
| 8 | Chapters | 3–5 on-screen chapter cards | none | **New component** + writer emits chapters | new `textcard.tsx`, `content.py` |
| 9 | Bubbles | Speech bubbles w/ tails + floating handwritten dialogue | none (dialogue is audio-only, 2nd voice) | **New component** | new `bubble.tsx` |
| 10 | Panels | 2-panel vertical/diagonal, 4-panel grid, black gutters | none | **New component** | new `panels.tsx` |
| 11 | Crowd | Grey featureless ovals behind a colour hero | none | **New component** | new `crowd.tsx` |
| 12 | Type | Handwritten italic script everywhere | `'Helvetica Neue', Helvetica, Arial` | **Vendor a free handwritten font**, offline | `public/fonts/`, all TSX |
| 13 | Voice | 148.5 WPM | ~190 WPM (`RATE "+8%"`) | **Recalibrate rate** to hit ~148; widen gaps to 0.18–1.0s | `gen_voice_edge.py` |
| 14 | Music | Bed present, ducked 8–15 dB; deliberate silent passages | Continuous ambient 0.16, duck floor 0.42, one silence beat | Retune duck depth; support scored/dry passages | `duck_music.py`, `make_ambient.py` |
| 15 | Writing | 3rd-person past explainer, 7.5–10.6 word sentences, real subjects | 2nd-person present fiction, <15 word target, POV ladder | **Replace writer canon** | `docs/BIBLE.md`, `docs/AUTOPILOT_PROMPT.txt` |
| 16 | Topics | Famous companies/people/scandals | Fictional "Your Life as a [X]" rank ladders | **Replace topic strategy** | `ops/topic_queue.json`, prompt |
| 17 | Titles | `<Subject> Explained Like You're 5`, 36–64 ch | `Your Life as a [X] at Every Level` + parenthetical | New title formula | `docs/AUTOPILOT_PROMPT.txt` |
| 18 | Thumbs | Colour hero vs grey crowd, amber band or outlined white caps | 12 doodle archetypes, gold pills, curved arrow | **Rebuild archetypes** | `thumbs.tsx` |
| 19 | Gate | — | Checks doodle-era invariants | Add flat-fill / locked-camera / WPM assertions | `gate.py` |

## Work orders (sequenced; each is one opus subagent)

Each order ends with: render comparison stills via `npx remotion still`, main session reviews against the
named reference frame, iterate until accepted, `build.py` stays green, commit on `crayon-style`.

**WO-1 · Foundation: font + palette tokens.** Vendor a free handwritten italic face into
`public/fonts/` with an offline `@font-face`; define the flat-colour token set and per-scene key
helper. *Accept:* a Remotion still renders the face with no network access.

**WO-2 · Character rewrite (`figure.tsx`).** Round head, dot eyes, no nose, solid hair shape, filled
body, uniform ~8px stroke. Remove `feTurbulence` filter and `boil()`. *Accept:* side-by-side against
`frames/wolf_montage_verified.jpg` (0:48, 4:56) — head/eye/limb proportions within eyeball match;
measured flat-fill ≥80% on a rendered still.

**WO-3 · Camera lock (`director.tsx`, `Video2.tsx`).** Delete `PUSH_TO`, `EXPO` dolly, `swayX/swayY`,
foreground occluder, whip/shake/flash. Keep wide/medium/closeup as static crops. *Accept:* motion-locality
map on our own render shows ≥35/48 cells at exactly 0.0 inside a shot.

**WO-4 · Editing retime (`Video2.tsx`).** Shot planner targets mean 4.79s, allows true static holds.
*Accept:* our render measures 10–15 cuts/min and ≥30% motionless frames using the same detector.

**WO-5 · Text cards + chapters (new `textcard.tsx`).** White-ground and black-ground full-screen cards,
handwritten italic, title+subtitle chapter variant. *Accept:* matches `frames/depression_montage_verified.jpg`
at 2:00, 4:05, 6:00.

**WO-6 · Bubbles + floating dialogue (new `bubble.tsx`).** *Accept:* matches Wolf 3:34 and 9:20, Depression 15:00.

**WO-7 · Panels + crowd (new `panels.tsx`, `crowd.tsx`).** 2-panel vertical/diagonal, 4-panel grid with
black gutters; grey featureless crowd behind a colour hero. *Accept:* matches Wolf 9:20 and 12:22,
Depression 10:10 and 15:00.

**WO-8 · Template restyle (`stage.tsx`, `scenes.tsx`) — the big one.** Convert the template library from
line-art-on-paper to flat colour-keyed scenes. ~358 template/prop FCs across 27 packs; **must be split
across several parallel subagents by pack**, with a shared style helper landed first. *Accept:* per-pack
flat-fill ≥80% and no residual paper texture.

**WO-9 · Audio (`gen_voice_edge.py`, `duck_music.py`, `make_ambient.py`).** Calibrate rate to ~148 WPM
(measure, don't assume the % — Andrew's baseline is ~174), gaps 0.18–1.0s, duck 8–15 dB, support dry
passages. *Accept:* rendered episode measures 145–152 WPM.

**WO-10 · Writer canon + topics (`docs/BIBLE.md`, `docs/AUTOPILOT_PROMPT.txt`, `ops/topic_queue.json`).**
3rd-person past explainer; the 5-step hook; ending formula; 3–5 chapters; 7.5–10.6 word sentences;
13–21 min; new title formula; real-subject topic strategy. *Accept:* a generated script measures within
those bounds before any render.

**WO-11 · Thumbnails (`thumbs.tsx`).** Colour hero vs grey crowd; amber band and outlined-caps
treatments; pushed facial expressions. *Accept:* side-by-side against the 7 captured `thumb.png` files.

**WO-12 · Gate (`gate.py`).** Add flat-fill, camera-lock, cuts/min and WPM assertions.

**WO-13 · Sample episode + comparison.** Fresh `content.py` in the new style, `python3 build.py`, full
render, QA stills every ~30s, assemble `docs/research/crayon/COMPARISON.md` with our frames vs theirs at
matched beats and a MATCH/CLOSE/MISS checklist. Iterate until nothing is MISS.

## Revision 2026-08-11 — WO-3's scope was wrong

WO-2 ran a controlled experiment that **disproved the stated premise** that `figure.tsx`'s `boil()` was
capping the camera-lock measurement at 22/48 cells. Removing boil changes the cell count not at all
(22/48 → 22/48); the *old* boiling figure also reaches 41/48 once the real blockers are neutralised.
Boil's amplitude (±0.35px) was never large enough to move the figure into new grid cells. What its
removal actually bought was a ~30% cut in motion energy (whole-frame mean |Δluma| 0.1533 → 0.1074).

The real blockers all live in `src/stage.tsx`, which WO-3 was never scoped to touch:

1. **`Stage` parallax sway**, `stage.tsx:2914-2915` — `const sway = Math.sin(f * 0.012); const far =
   sway * 5, near = sway * 16;` translates the backdrop and figure planes every frame. This is exactly
   the parallax drift bible §3 forbids, and it is the remaining camera motion.
2. **Frame-filling gradients in `Defs`** — `sclean` (linear) and `svig` (radial vignette painted over
   every `Stage`). The radial varies *horizontally* across every pixel, so no pixel equals its right
   neighbour anywhere in frame; this alone destroys the flat-fill metric.
3. **`Motes`** — 14 dust circles drifting across the whole frame every frame.

With those three neutralised, the committed figure measures **99.3% flat fill and 41/48 cells at exactly
0.0** — both targets comfortably met. So the character work is correct and the gate was blocked upstream.

**New WO-8a (stage foundation)** is therefore inserted before the per-pack restyle, and it — not WO-3 —
owns finishing the camera lock. WO-3 stands as a partial pass.

### Also corrected
- `CRAYON_SUBTITLE_RATIO` measured at **~0.75**, not the 0.5 originally specified (see bible §7).
- **Figure scale is a real mismatch**: our figures occupy ~6% of frame width against the reference's
  ~15%, making an 8px stroke read ~3× heavier relative to the head. This is a template-scale problem,
  fixable only in the restyle (WO-8), not in `figure.tsx`.
- `srough` (a `feTurbulence` filter def) is defined in `stage.tsx` but has **0 usages** — dead code.

## Open risks

1. **WO-8 is the schedule.** ~358 template FCs is the bulk of the work and the main quality risk.
2. **Topic swap changes the channel's identity**, not just its look — the back catalogue will no longer
   match new uploads, which can suppress suggested-video performance during the transition.
3. **Hand-animated reference.** Their per-scene bespoke illustration cannot be fully matched by a
   template library; expect the closest gap to remain "scene variety", not style.
4. **Two devices are still unmeasured**: exact text-reveal easing/duration, and the SFX vocabulary.
   Both need a foregrounded-window pass to nail; currently specified from stills only.
