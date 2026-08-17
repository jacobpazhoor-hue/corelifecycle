# QA watch — madoff episode, 2026-08-17

**List only. Nothing here is fixed yet.** Ranked by what a viewer notices first, not by how hard it is
to fix.

## How this was watched

74 frames rendered straight from the composition — no full render, no `out/episode.mp4`:

```bash
npx remotion still EveryLevelLawyer <out>.jpeg --frame=<n> --jpeg-quality=85 --gl=angle --log=error
```

69 sampled scenes (every `card`/`overlay`/`bubbles`/`panels`/`dialogue`/`foreground` scene, ≥3 frames
per environment, plus 16 evenly-spaced buckets across all 29,552 frames), + the 5 chapter cards at
`startFrame+34` + the `Thumbnail` composition. 2 minutes, 15 MB, deleted after. `src/timeline.json`
was verified in sync with `content.py` first (193 scenes, ids identical, 0 stale VO cache entries),
so these frames are the current script — including the revision agent's fix to t001
("almost fifty years", no longer "twenty").

Frame numbers below are absolute, at 30 fps. Re-render any of them with the command above.

---

## The list

### 1. Speech balloons cover the speakers' faces, and their tails point at nobody — CRITICAL
`t063b` f10670, `t024` f4459, `t064` f10820, `t091` f14978, `t149b` f25765 — all 5 bubble scenes.

At f10670 both men on the sofa are **decapitated by their own balloons**: suits and ties visible,
heads entirely behind white boxes. In the four boardroom bubble scenes the upper balloon's tail
points **left into empty ceiling** every single time, while the only character who could be speaking
(Madoff) stands at the far right — so "I don't discuss the strategy. Just the results." (f4459),
"You're standing on it." (f10820) and "No. Of course not." (f14978) are all attributed to nothing.
The two balloons together also cover ~40% of the frame and hide the scene's own wall chart.

**Fix:** in `src/bubble.tsx`, anchor each balloon to its speaker's head box and place it in the
nearest free quadrant *above* that head, never overlapping it; derive tail direction from the
speaker's x rather than a fixed side; cap total balloon area at ~25% of frame.

### 2. The same picture, over and over — CRITICAL
Measured: **49 of 2,346 sampled frame pairs are near-identical** (mean |Δluma| < 3/255 at 160×90);
~35 of those are scene art rather than text cards. Worst offenders:

| pair | Δ | apart |
|---|---|---|
| `t117` f19636 ~ `t133` f22469 | 0.19 | 2m50s |
| `t073` f12422 ~ `t088` f14488 | 0.24 | 1m08s |
| `t098` f16181 ~ `t151` f26154 | 0.39 | 3m19s |
| `t006` f1353 ~ `t040` f6972 | 1.11 | 3m07s |
| `t001c` f370 ~ `t097` f15984 | 0.90 | 4m40s |
| `t001` f105 ~ `t168` f29354 | 1.58 | opening ~ closing shot |

The pink living room appears essentially unchanged 6 times, the yellow chartBoard 4+, the blue
boardroom 6, the terracotta close-up room 3. A template renders the same image regardless of which
scene is using it, so 25 boardroom scenes are one picture seen 25 times.

**Fix:** give each environment in `src/explainer.tsx` a small deterministic variation seeded on the
scene id — camera height/lateral offset, prop set A/B/C, populated vs empty, day vs night key — so
repeat visits to a room are recognisably the same room from a different angle, not the same frame.

### 3. Whole frames of placeholder block-glyph "text" — HIGH
`t063` f10498 and `t102` f17049 (newsMontage, 19 scenes) are **nothing but** black rectangles
standing in for words across seven documents. Same treatment on the protest placards at `t001c`
f370 / `t097` f15984 (three signs, all glyphs, held up as the focal point), the chartBoard title at
`t021`/`t027`/`t073`/`t105`, the broadcastDesk banners at `t120` f20071, and the exchangeFloor
ticker at `t003` f813.

It reads as an unfinished render, and it lands hardest on the scenes about **documents**
("Statements went out on real letterhead", "a nineteen-page memo with a title that did not hide its
point").

**Fix:** the glyph blocks are fine as *body* text at small scale. Anything the narration names —
a headline, a placard, a chart title, a lower third — should carry real short words from the scene.
Add an optional `label=` to the relevant props in `src/setdressing.tsx` / `src/explainer.tsx`.

### 4. Number cards are dropped on top of people — HIGH
`t122` f20490 (card covers two seated figures — heads above it, legs below it, torsos gone),
`t150` f25948 (covers a seated figure and half the desk), `t141` f24093 and `t113` f19101 (each
covers 2–3 crowd figures), `t027` f4879 and `t105` f17682 (cover the plant and the left chairs),
`t143` f24488 (covers the TV).

Placement is hard-coded bottom-left in every one of the 10 overlay scenes.

**Fix:** in `src/Video2.tsx`/`src/director.tsx`, pick the overlay corner per scene by measuring which
quadrant is emptiest (or declare a safe corner per environment), and let the card shrink rather than
overlap a figure.

### 5. The over-the-shoulder foreground is a featureless black blob — HIGH
`t026` f4726, `t058` f9647, `t096` f15858, `t115` f19312, `t100b`, `t148` — all 6 `foreground:
overShoulder` scenes.

It has no internal detail, no rim, no shoulder line: a black circle on a black mass. At f9647 it
**covers Madoff's own face**, leaving a sliver, so the subject is hidden behind an unreadable shape.

**Fix:** give the silhouette a light keyline and a hint of collar/hair inside `src/figure.tsx`'s
foreground variant, cap it at ~18% of frame width, and place it on the opposite side from the hero.

### 6. Characters smile through the worst beats — HIGH
`t120` f20071 and `t153` f26653: **both news anchors are grinning** while the narration reports the
$50bn fraud and then DiPascali's death before sentencing. `t143` f24488: Mark Madoff's suicide, over
the cheerful pink living room with two neutral/smiling figures. `t127` f21537: a grey figure in the
courtroom gallery is smiling at the guilty plea while every other face is blank.

Register is meant to be "straight and noirish, held throughout" (content.py header).

**Fix:** drive mouth/brow from a per-scene `mood=` (default neutral on this format), and never let
the random face pool emit a smile in a scene tagged grave.

### 7. The picture says the opposite of the narration — HIGH
- `t021` f4113 "Use options to **cap** the losses, and the gains" → a **falling** chart.
- `t027` f4879 "**funneled in** $7.2 billion" → the same falling chart.
- `t067` f11283 and `t107b` f17988 "the statements, still **climbing**" → the falling chart again,
  as the left half of a split screen whose whole point is the contrast.
- `t097` f15984 "So the money **kept arriving**" → an angry protest with placards.
- `t158` f27406 "Bernie Madoff **died** in federal prison" → an object card of a **filing cabinet
  and a safe**.
- `t020b` f3972 "stock, options, and a promise" (three things) → a **laptop and a stack of coins**
  (two things, one of them anachronistic).

**Fix:** the chartBoard's chart direction has to be a scene field (`chart="up"|"down"|"flat"`), not a
constant. Object cards need a per-scene object list rather than a generic finance pair.

### 8. Every named person is drawn as Madoff — HIGH
`t074` f12576 introduces **Harry Markopolos** — same black hair, same navy suit, same red tie as
Madoff. `t141` f24093's card reads "PETER MADOFF'S SENTENCE" over the Bernie hero. `t143` f24488's
card reads "MARK MADOFF" over the same pair. And `t007` f1523 / `t043` / `t117` / `t133` seat **two
identical Madoffs** side by side on the sofa, which reads as a cloning bug rather than two people.

**Fix:** two or three alternate hero palettes (hair, suit, tie) selectable per scene, and never emit
the same head twice in one frame.

### 9. Split panels bisect a figure at the seam and crop the art — MED-HIGH
`t067` f11283, `t107b` f17988, `t146` f25012 — all 3 `panels` scenes. Each panel is the same wide
environment art cropped to half width, so the chart loses its y-axis off the left edge and a figure
gets sliced down the middle at the divider (at f11283 and f17988 a disembodied arm and hand float at
the seam). `t146`'s pairing is also wrong: the narration contrasts the **19th floor with the 17th**,
the panels show an office and a living room.

**Fix:** `src/panels.tsx` should request a half-width framing from the environment (recentre on the
subject) instead of cropping a 1920-wide composition, and add a per-panel caption.

### 10. The close-up crops the top of the head and breaks scale — MED-HIGH
`t056` f9296, `t096` f15858, `t134` f22652, `t162` f28122 — `closeUpPortrait` is the most-used
environment (28 scenes). The head is cut off by the top frame edge, and a full-size room sits behind
it at normal scale, with background figures roughly one-sixth the height of the face — it reads as a
head pasted onto a wide shot rather than a close-up. Two of those background figures have no visible
body (heads floating at desk level).

**Fix:** shrink the head to fit with headroom, and blur/flatten/darken the environment behind a
close-up so the scale relationship stops being readable as an error.

### 11. A card contradicts the line it illustrates — MED
`t051` f8775: narration is "He put it in **two words**." The full-screen card reads **"It's all
fake."** — three. (`content.py` `t051`: `dialogue={"text": "It's all fake."}`.)

**Fix:** writer-side — either "in three words" or a genuinely two-word quote.

### 12. Figures and props intersect — MED
- `t006` f1353 / `t040` f6972: a grey figure is **impaled by the desk monitor** — head above it, legs
  below it, body gone. Two figures do this in the same shot.
- `t015` f2964, `t021` f4113, `t024`, `t064`, `t091`, `t122`: seated figures' legs are drawn **in
  front of** the chair backs that should occlude them, in every chair, in every boardroom/chartBoard.
- `t074` f12576, `t168` f29354: two cars **stacked on top of each other** at the kerb.
- `t001b` f277 / `t026` f4726: a pedestrian stands at roof height **on** a parked car; crowd figures'
  legs are cut off by the bottom frame edge and the leftmost/rightmost figures are sliced by the side
  edges in every exterior.
- `t007` f1523: the seated men's legs pass through the sofa front.

**Fix:** z-order figures behind desk/chair props by their ground-y, inset the crowd row so the end
figures are whole, and give the car row a lane so two never share an x.

### 13. Number-card subtitles are mustard on white — MED
`t027` f4879, `t105` f17682, `t113` f19101, `t141` f24093, `t150` f25948 — "FUNNELED IN BY ONE FEEDER
FUND", "OF REAL LOSSES EVENTUALLY RECOVERED" etc. are noticeably harder to read than the black
headline above them. `t122` f20490 uses red on white and is fine, so the palette is picking the
subtitle colour from the scene key without a contrast floor.

**Fix:** a contrast floor on the subtitle (or just always ink-on-white), independent of scene key.

### 14. Era mismatches in the 1960 scenes — MED
`t006` f1353 ("A twenty-two-year-old named Bernie Madoff started a small trading firm **that year**"
— 1960) shows two desktop monitors with colour screens and a 5-star gas-lift swivel chair.
`t007` f1523 (the $5,000 stake, same year) shows a flat-panel TV on a stand. `t003` f813 puts
blue-bezel flat monitors on the exchange floor.

The `period="pre1900"` flag exists (`docs/research/crayon/COMPARISON.md` §5) but there is no
mid-century tier, so 1960 renders as present day.

**Fix:** add `period="mid20c"` — CRT/no screen, rotary phone, fixed-base chair, paper ledger — and
tag the 1960–1980 scenes with it.

### 15. Three environments are garish — MED
`t021`/`t027`/`t073`/`t105` chartBoard: saturated yellow wall panels + yellow chairs + yellow chart
bars, so the data barely separates from the wall. `t120` f20071 / `t153` f26653 broadcastDesk:
crimson walls + hot-pink chart panel + mustard bands. `t001c` f370 / `t097` crowdQueue: violet
buildings under a flat mid-grey sky with no sky feeling at all.

**Fix:** drop the key's saturation on wall/ground planes and keep the chroma on props — which is also
what `COMPARISON.md` §4 MISS #1 asks for (rich colour buckets 77.3 vs a reference 113, floor cases
`factoryFloor` 43–49, `courtHearing` 52, `officeFloor` 54–55, `exchangeFloor` 61).

### 16. Staging puts Madoff in the wrong chair — MED
`t113` f19101 and `t127` f21537: Madoff stands centred **behind the raised bench, under the seal**,
where the judge sits; the actual judge is a small figure off to the right. `t120` f20071: Madoff sits
**behind the news desk as an anchor**, reporting his own fraud.

**Fix:** courtHearing needs a defendant mark distinct from the bench; broadcastDesk needs the subject
on the guest side or on a screen behind the anchors.

### 17. Thumbnail — MED
`Thumbnail` composition, `out/thumbnail.png`. Madoff is **grinning broadly**; the ground is a flat
mid-grey field with no depth or backlight (the standing note for this channel is dark, mood-tinted,
bright only on subject and text); "$65 BILLION" sits on top of his hair; and the crowd row is cut off
at the bottom and both side edges. It also says **$65 BILLION** where the episode's own card says
**$64.8 BILLION** (t121).

**Fix:** neutral-to-grim expression, dark tinted ground with a soft rim behind the head, lift the
number clear of the hair, match the episode's figure.

### 18. A blue-skinned face in the courtroom — LOW-MED
`t113` f19101 and `t127` f21537: the framed portrait on the right wall renders with a **violet face**
while every other character is the standard skin tone. The portrait prop is tinting with the scene
key instead of holding its own palette.

---

## Noted, not mine

- **Flicker.** Another agent is fixing an alternating every-other-frame signal in characters/screens.
  Stills cannot show it and I did not touch `src/figure.tsx`, `src/explainer.tsx` or `src/scenes.tsx`.
  Their commit `892d409` ("a walking figure re-rolled its whole idle every frame") landed during this
  watch, so figure poses may differ slightly from the frames described above; nothing in the list
  above depends on pose.
- **Still open from `docs/research/crayon/COMPARISON.md` §4**, unchanged by this episode: rich colour
  buckets 77.3 vs reference 113 (see item 15), and shot range 0.00–9.80 s vs a reference 0.61–16.46 s
  with zero shots ≥12 s — a writing instruction, not an art one.

## What is actually fine — do not "fix" these

Chapter cards (f1311, f6908, f12364, f16986, f21455) are clean, legible and well-composed. Word cards
("Split-Strike" f3860, "Chosen" f8002, "Guilty" f22003) and narration cards ("A regulator by day.
A fraud by night." f600, the Markopolos memo title f14183) are legible with good contrast and correct
line width. The bankExterior neoclassical facade, the newsMontage document fan (as *composition*) and
the exchangeFloor board are all strong images. `gate.py` passes: 16.4 min, 143.4 WPM, 193 scenes,
0 failures.
