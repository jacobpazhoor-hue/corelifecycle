# Crayon Capital — Measured Data (Phase 1)

Every number here came from a tool run against the real channel on 2026-08-11, not from memory.
Raw artefacts: `chan.jsonl` (28 videos), `<videoId>/transcript.txt`, `<videoId>/*.info.json`, `<videoId>/thumb.png`.

## Channel

237,000 subscribers · 28 videos · tagline "Big finance, drawn small".
**Format: 3rd-person past-tense EXPLAINER** — "<Subject> Explained Like You're 5". Real companies, people, scandals. Not POV, not fiction.

Top 7 by views (the autopsy set):

| Views | Len | Ch | ID | Title |
|---|---|---|---|---|
| 4,180,864 | 16:33 | 4 | HawmGu7oNrc | The Wolf of Wall Street Scam Explained Like You're 5 |
| 2,679,505 | 16:29 | 4 | LuEcoqizj0o | The Great Depression Explained Like You're 5 |
| 2,247,853 | 13:26 | 4 | KE-WJevx-7c | The 2008 Financial Crisis Explained Like You're 5 |
| 1,219,596 | 20:16 | 4 | sMH8WchxQR8 | Rockefeller: The First Confirmed Billionaire |
| 939,239 | 20:13 | 4 | rSgS4wNLLDM | How Jeff Bezos Actually Built Amazon |
| 896,055 | 16:08 | 3 | y51JjcymEAY | The Man Who Built Singapore in One Generation |
| 871,542 | 13:12 | 4 | VSbO8vmZNm0 | The $63 BILLION Company That Sold Nothing |

Runtime range across all 28: 10:14 – 21:00. Chapters: 3–5, always named in a two-part
`Evocative Noun: Plain Explanation` form ("The Trap: Learning Not to Trust", "The Mask: How Enron Hid the Truth in Plain Sight").

## Editing rhythm — measured by frame-differencing (video HawmGu7oNrc)

Method: canvas sampling at 16.5 samples/sec during 3× playback; cuts = isolated local peaks with
≥3× prominence over the local baseline (a plateau of high diff is sustained motion, not a cut).

| Window | Cuts/min | Avg shot | Median shot | Min | Max | Static frames |
|---|---|---|---|---|---|---|
| 22–94s | 9.3 | 6.36s | 6.81s | 1.47s | 16.46s | 31.8% |
| 200–272s | 11.7 | 5.36s | 4.62s | 2.93s | 8.30s | 38.9% |
| 450–522s | 15.9 | 3.87s | 2.98s | 0.61s | 10.41s | 44.0% |
| 700–772s | 10.9 | 5.17s | 5.07s | 1.78s | 11.26s | 40.7% |
| 900–972s | 11.7 | 4.57s | 2.67s | 1.58s | 13.92s | 38.1% |

**Aggregate: 60 cuts over 287.2s sampled (29% of the video) = 12.5 cuts/min, mean shot 4.79s.**
"Static frames" = sampled frames whose whole-frame diff < 1.0/255 — i.e. nothing moved at all.
**~40% of all sampled frames are completely motionless.**

## Camera behaviour — motion-locality map (8×6 grid, seek-based)

Per-cell mean abs luma diff between consecutive in-shot frames. A moving camera makes *every* cell
non-zero; a locked camera leaves background cells at exactly 0.

- **Shot @238.0–239.5s** — 9/48 cells active, **bottom 2 rows entirely 0.0**. Locked camera.
- **Shot @708.6–711.0s** — 7/48 cells active, **40/48 cells exactly 0.0**. Locked camera.
- **Shot @922.8–925.8s** — 28/48 cells active, only 1 zero cell, max 94.3. Full-frame motion.

**Verdict: locked-off camera with localised element animation is the DEFAULT (2 of 3 sampled shots);
whole-frame motion is an occasional deliberate exception, not the baseline.**

## ⚠ DATA-INTEGRITY CAVEAT (2026-08-11)

Chrome freezes video decoding while the browser window is backgrounded (`document.hidden === true`).
Seeks still resolve and `currentTime` still advances, but `drawImage(video)` returns a **stale frame**.
Proven: frames sampled at t=120, t=600 and t=880 all returned the identical hash `1776210264`.

Consequences for this document:
- **Cut/shot-length table — TRUSTED.** Captured during live 3× playback with 16.5 samples/sec and
  correct span advancement, which is only possible with an active decoder.
- **Motion-locality maps — TRUSTED.** A frozen decoder yields all-zero diffs; these returned non-zero,
  varying per-cell values (max 13.3 / 8.0 / 94.3), so frames genuinely differed.
- **Art per-pixel measurement — VALID NUMBERS, UNVERIFIED TIMESTAMP.** The figures below describe a
  genuine Crayon Capital frame, but the "@470s" attribution is not reliable. Re-measure across several
  confirmed-distinct frames before treating the palette as channel-wide.
- **Audio window @240s — TRUSTED** (315 samples @16.1 Hz). **Audio window @4s — DISCARDED** (6 samples,
  throttled).

Re-runs must assert `document.hidden === false` and verify consecutive frame hashes differ.

## Art — per-pixel measurement (single frame, 1280×720 source; timestamp unverified — see caveat)

| Metric | Value | Meaning |
|---|---|---|
| `flatPct` | **77.4%** | pixels exactly equal to their right neighbour → flat vector fills |
| `inkPct` | **20.8%** | pixels with luma < 70 → very heavy black outlining |
| `satMean` | **0.251** | moderate/low mean saturation |
| stroke width | **p25 4px · median 6px · p75 7px** @1280 wide → **≈9px at 1920** | thick, uniform |
| distinct quantised colours | 545 / 4096 buckets | restricted palette |

Palette at that frame: `#88ccee` 26.9% (sky) · `#cccccc` 9.6% · `#777777` 8.7% · `#ddaa88` 6.9% (skin) ·
`#111111` 5.7% · `#000000` 5.6% · `#ffffff` 5.6% · `#888888` 3.3% · `#222222` 2.8% · `#aabbbb` 2.1%.

**77.4% flatness settles the open question: the art is CLEAN FLAT VECTOR, not crayon-textured**, despite
the channel name and despite a third-party tutorial describing it as "hand-drawn crayon animation".
Confirmed visually in-frame at ~96s: uniform thick black outlines, flat fills, circular dot eyes, no nose,
solid-shape hair, no line wobble, no paper grain.

## Writing — from transcripts (all 7)

| Video | Words | WPM | Sentences | Avg sent | Median | <8 words | you/1k | Questions | Numbers |
|---|---|---|---|---|---|---|---|---|---|
| Wolf of Wall Street | 2447 | 147.9 | 288 | 8.5 | 7 | 54.2% | 9.8 | 3 | 37 |
| 2008 Crisis | 1870 | 139.2 | 248 | 7.5 | 7 | 58.1% | 13.4 | 17 | 32 |
| Great Depression | 2431 | 147.5 | 312 | 7.8 | 6 | 58.7% | 7.0 | 13 | 30 |
| Enron | 1910 | 144.7 | 206 | 9.3 | 8 | 48.1% | 9.4 | 9 | 40 |
| Bezos | 3057 | 151.2 | 305 | 10.0 | 8 | 44.3% | 2.6 | 5 | 46 |
| Rockefeller | 3099 | 152.9 | 291 | 10.6 | 9 | 39.9% | 11.0 | 10 | 68 |
| Singapore | 2455 | 152.2 | 307 | 8.0 | 7 | 55.7% | 12.6 | 27 | 29 |

**Aggregate: 17,269 words / 116.3 min = 148.5 WPM.**

### Hook formula (identical across all 7, first ~30s)
1. **Shock stat or paradox, one sentence.** "He lied about $1 stock, made millions, and only served 22 months in jail."
2. **Escalating consequence fragments.** "$600 billion gone. Retirement accounts vanish. Millions lose jobs."
3. **"But…" paradox turn.** "But not because it happened. Because no one could explain how."
4. **Thesis naming the subject.** "This is the story of Jordan Belfort, the man who scammed America and got rich again doing it."
5. **Hard cut to DATE + PLACE.** "Bayside, Queens, 1962." / "July 8th, 1839, Richford, New York."

### Ending formula
Thematic reflection (never plot resolution) → a **direct quote** or a **callback to the opening** →
often a **forward tease** to a sequel. Complicit first-person-plural: "we applauded… We wanted to be him."
No CTA, no "subscribe" in the narration.

## Packaging

Titles 36–64 chars. Dominant formula `<Subject> Explained Like You're 5` (17 of 28); the rest are
`How <Person> Actually <Verb>ed <Thing>` or `The <Superlative> <Noun> That <Surprise>`.

Thumbnails (viewed at full size): flat vector cartoon matching the video art. Two treatments observed —
(a) solid **amber/yellow band** across the top with black ALL-CAPS text; (b) **white text with heavy black
outline**, mixed case, top-positioned. Composition: one hero character right or centre, rendered in
**full colour**, against a **desaturated/greyscale crowd or environment**; a single saturated accent
(red crash-line, amber bar). Faces are large and highly expressive — open mouths, visible teeth/tongue,
worry lines, "!!" marks, sweat/stress squiggles.

## External cross-check
Third-party tutorials confirm the channel model (finance-documentary explainers of famous subjects) and
state Crayon Capital pays **real human animators, thousands of dollars per video** — meaning the
reference is hand-animated, not procedurally generated. Their recommended replication route is paid
AI video generation (Google Flow / Veo), which is incompatible with CoreLifecycle's $0 constraint.
