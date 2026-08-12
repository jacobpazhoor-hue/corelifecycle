# CRAYON BIBLE — the replacement style canon

Supersedes `docs/BIBLE.md` wherever the two conflict. Every claim below traces to a captured frame,
a measured number, or a transcript line. Evidence lives in `docs/research/crayon/`:
`MEASUREMENTS.md` (numbers + integrity caveats), `frames/*.jpg` (verified-distinct frames),
`<videoId>/transcript.txt`, `<videoId>/thumb.png`, `chan.jsonl`.

Reference channel: **Crayon Capital**, 237K subs, 28 videos, "Big finance, drawn small."

> **Naming warning.** Despite the channel name and third-party tutorials calling it "hand-drawn crayon
> animation", the artwork is **clean flat vector**: 74–92% of pixels exactly equal their right neighbour
> across three verified-distinct frames. There is no crayon grain, no paper texture, no line boil.
> The *hand-drawn* quality of the channel lives **entirely in the typography** (a handwritten italic
> script used for all on-screen text) — not in the linework. Do not add texture to the art.

---

## 1. Format

**Third-person, past-tense EXPLAINER about real subjects.** Title formula `<Subject> Explained Like
You're 5` (17 of 28 videos); alternates `How <Person> Actually <Verb>ed <Thing>` and
`The <Superlative> <Noun> That <Surprise>`. Subjects are famous companies, people, scandals, crises.

Runtime **13–21 min** (all 28 fall in 10:14–21:00). **3–5 chapters**, each named in a two-part
`Evocative Noun: Plain Explanation` form — "The Trap: Learning Not to Trust", "The Mask: How Enron Hid
the Truth in Plain Sight", "The Day America Fell — Black Tuesday and the Market Collapse".

This replaces CoreLifecycle's second-person present-tense fictional POV ladder entirely.

## 2. Narration

- **148.5 WPM aggregate** (per-video range 139.2–152.9). Measured across 17,269 words / 116.3 min.
  **Metric definition (matters):** this is *transcript words ÷ total video minutes* — i.e. **runtime-inclusive**,
  counting pauses, music beats and dialogue. It is NOT speech-only WPM. Anything re-measuring this must
  compare like for like; the pipeline's own summary prints both, and speech-only runs ~3 WPM higher.
- Correction 2026-08-11: the pre-existing pipeline was **180.7 WPM at `RATE "+8%"`**, not the ~190 stated
  in earlier notes, and the voice's natural baseline is **~167 WPM**, not the ~174 claimed in a code comment.
  Both were measured by synthesising real scenes through the pipeline's own `master()` + `trim_silence()`.
- **Sentences average 7.5–10.6 words**, median 6–9. **40–59% of all sentences are under 8 words.**
- **29–68 explicit numbers per video** (~2–3.5 per minute).
- Second person appears but is a *seasoning*, not the frame: 2.6–13.4 "you" per 1000 words.
- Questions: 3–27 per video; the highest-question video (Singapore, 27) is also rhetorically driven.

### Hook — identical structure in all 7 autopsied videos, first ~30s
1. **Shock stat or paradox, one sentence.** "He lied about $1 stock, made millions, and only served 22 months in jail."
2. **Escalating consequence fragments.** "$600 billion gone. Retirement accounts vanish. Millions lose jobs."
3. **"But…" paradox turn.** "But not because it happened. Because no one could explain how."
4. **Thesis naming the subject.** "This is the story of Jordan Belfort, the man who scammed America and got rich again doing it."
5. **Hard cut to DATE + PLACE.** "Bayside, Queens, 1962." / "July 8th, 1839, Richford, New York."

### Ending
Thematic reflection, never plot resolution → a **direct quote** or a **callback to the opening image**
→ frequently a **forward tease** to a sequel. Complicit first-person-plural is characteristic:
"we applauded… We wanted to be him." **No CTA and no "subscribe" in the narration.**

## 3. Camera — LOCKED

Motion-locality maps (8×6 grid, per-cell luma diff inside single shots) on the flagship video:

- shot @238.0–239.5s — 9/48 cells active, **bottom two rows exactly 0.0**
- shot @708.6–711.0s — 7/48 cells active, **40/48 cells exactly 0.0**
- shot @922.8–925.8s — 28/48 cells active (the exception: a full-frame motion beat)

**The camera does not move.** No dolly, no push-in, no handheld drift, no parallax sway. Motion is
localised to characters and props. Whole-frame motion is a deliberate, occasional accent — roughly
1 shot in 3 at most, not the baseline.

This is the single largest inversion of the current CoreLifecycle engine, which applies an expo-out
dolly push plus sine+noise handheld sway to **every** shot.

## 4. Editing rhythm

Measured by frame-differencing with isolated-peak detection (a plateau of high diff is sustained
motion, not a cut), 287.2s sampled across five windows:

- **12.5 cuts/min · mean shot 4.79s**
- per-window means 3.87s / 4.57s / 5.17s / 5.36s / 6.36s
- median shot 2.67–6.81s; range 0.61s–16.46s
- **~40% of sampled frames are completely motionless** (whole-frame diff < 1.0/255)

Hold still, then change. Do not fill dead air with drift.

## 5. Art

Per-pixel measurement across three verified-distinct frames (1280×720 source):

| Metric | f@140 | f@505 | f@870 | Reading |
|---|---|---|---|---|
| flat-fill % | 84.4 | 92.2 | 74.4 | **~84% mean — flat vector, zero texture** |

| ink % (luma<70) | 10.0 | 70.0 | 27.3 | heavy black linework; varies with scene darkness |
| mean saturation | 0.482 | 0.646 | 0.308 | **highly variable by scene — not uniformly desaturated** |
| distinct quantised colours | 419 | 216 | 444 | restricted palette (5–11% of a 4096 space) |
| median stroke px | 7 | (n/a) | 4 | **≈6–10px at 1920** |

> ⚠ **The flat-fill band is RESOLUTION-DEPENDENT — quote a resolution or the number is meaningless.**
> Flat fill counts pixels equal to their right neighbour, so it is dominated by total edge length per row.
> The *same artwork* reads **~6.5 points higher at 1920 than at 1280**. All reference numbers above were
> measured on **native 1280×720** frames. CoreLifecycle renders at **1920**, so a 1920 reading must be
> compared against roughly **80–98%**, not 74–92%. Earlier work orders in this project reported 1920
> numbers against the 1280 band and therefore *understated* how empty our frames were. Any `gate.py`
> assertion (WO-12) must name the resolution it measures at.
>
> **Flat fill is also a DENSITY metric, not only a texture one.** Too *high* means the frame is empty.
> A solid ground with one prop measured 99.6% at 1920; the same template rebuilt to reference density
> measured 92.5% at 1920 / 85.7% at 1280 — mid-band against the reference's ~84% mean.

- **Outline:** uniform-weight pure black, smooth vector curves. No wobble, no taper, no displacement filter.
- **Fill:** flat, no gradients on characters. Backgrounds may carry a soft radial vignette/spotlight.
- **Character construction:** large rounded head; simple **black dot eyes**; **no nose**; small line or
  open mouth; hair as one solid black/brown shape; filled torso with collar/tie detail; short simple limbs.
- **Per-scene colour keying:** each scene commits to a dominant hue — a bright cyan/tan beach, a
  saturated orange panel, a brown warehouse, a near-monochrome grey. Mood is carried by the whole
  palette swapping, not by a global grade drifting over a fixed palette.

## 6. Signature devices (each confirmed in ≥2 videos)

1. **Full-screen text cards.** Both white-ground/black-text and black-ground/white-text. Centred,
   1–2 lines, always the handwritten italic script. Used for narration emphasis and single dramatic
   words (a near-black frame carrying only the word *"It"*).
2. **Chapter title cards.** Large title + smaller subtitle, matching the YouTube chapter names exactly
   ("The Day America Fell" / "Black Tuesday and the Market Collapse").
3. **Speech bubbles** with tails, handwritten italic text — and bubble-less floating handwritten
   dialogue laid directly over a scene.
4. **Multi-panel splits** divided by black gutters — 2-panel vertical, 2-panel diagonal, 4-panel grid —
   each panel independently colour-keyed.
5. **Grey anonymous crowd + colour hero.** Background people are featureless grey ovals; the subject
   is the only figure rendered in full colour. The channel's primary focal hierarchy device, used in
   video *and* thumbnails.
6. **Object showcase cards** — isometric flat products floating on pure white.
7. **Document/newspaper montage** — scattered, slightly rotated paper cutouts with serif headlines.
8. **Over-the-shoulder framing** with a dark foreground silhouette for depth.

## 7. Typography

All on-screen text uses a **handwritten italic script**. This is the channel's entire "hand-drawn"
signature and is non-negotiable for a match. Titles set large and centred.

**Subtitle ratio ≈ 0.75** (corrected 2026-08-11). An initial eyeball estimate of ~0.5 was wrong; measuring
the 4:05 chapter card two ways — cell-pixel height (23 px title vs 17 px subtitle) and width-per-character
(0.565 frame / 20 chars vs 0.766 frame / 36 chars) — both land at **0.72–0.77**.

**Hierarchy is size alone, not weight.** Title and subtitle both read at a regular weight in the reference;
setting the title bolder overshoots anything visible in the frames.

Measured size anchors, as a fraction of frame width/height: narration line ≈ 0.53 w · chapter title ≈ 0.565 w ·
single-word beat ink height ≈ 0.092 h. The single-word beat is deliberately **small on a large empty ground** —
not a huge word. One reference single-word beat sits ~14% from the left rather than centred; treat off-axis
placement as permitted, not required (n=1).

Thumbnail text is the exception: heavy geometric sans, ALL CAPS.

**Current CoreLifecycle uses `'Helvetica Neue', Helvetica, Arial` everywhere — a total mismatch.**
A free, offline-bundlable handwritten face (Caveat / Kalam / Patrick Hand / Architects Daughter class)
must be vendored into the repo for deterministic Remotion renders.

## 8. Sound

Web Audio analysis, four valid windows (≥242 samples each, 16–38 Hz):

| Window | Music bed | Gap low-band | Duck under VO |
|---|---|---|---|
| 6s (hook) | yes | −57.0 dB | 15.1 dB |
| 240s (body) | **no — true silence** | −75.2 dB | 29.0 dB |
| 650s (body) | yes | −46.9 dB | 8.2 dB |
| 935s (ending) | yes | −62.2 dB | 13.7 dB |

- A music bed is **generally present** and **sidechain-ducked 8–15 dB** under narration.
- **Deliberate music-free passages exist** — the 240s window's −75 dB gap floor is real silence, not a
  low bed. Silence is used as a structural device, not merely one beat before a midpoint.
- Inter-sentence gaps are **0.18–1.0s**, longer and more varied than CoreLifecycle's fixed 0.25s.

## 9. Packaging

- **Titles 36–64 chars.**
- **Thumbnails:** flat vector matching the video art. Two observed treatments — (a) a solid amber band
  across the top carrying black ALL-CAPS text; (b) white ALL/mixed-case text with a heavy black outline,
  top-positioned. Composition: one hero character in **full colour**, centre or right, against a
  **desaturated grey crowd or environment**, with a **single saturated accent** (a red crash line, the
  amber bar). Faces are pushed hard — open mouths with visible teeth and tongue, worry lines, "!!"
  marks, stress squiggles.

---

## Production reality check

Third-party sources state Crayon Capital pays **human animators, thousands of dollars per video**. The
reference is hand-keyed, not procedural, and the tutorials' suggested replication path is paid AI video
generation — incompatible with CoreLifecycle's standing $0 constraint.

This is survivable because the measured style is **easier** to generate procedurally than what
CoreLifecycle does today: a locked camera with localised element animation is strictly cheaper than a
constantly-moving camera with a turbulence-displaced, boiling figure over ~358 hand-built SVG templates.
The hard cost is not motion — it is **re-arting the template library** into flat colour-keyed scenes.
