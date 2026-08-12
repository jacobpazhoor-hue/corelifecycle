# CoreLifecycle Production Bible — the WRITER canon (every video obeys this)

**Rewritten 2026-08-11 (WO-10) for the full format swap.** The channel no longer writes second-person
present-tense fictional POV ladders ("Your Life as a [X] at Every Level"). It writes **third-person,
past-tense explainers about real subjects** — real companies, people, scandals, crises.

Two documents, two jobs — do not confuse them:

| doc | owns | status |
|---|---|---|
| `docs/CRAYON_BIBLE.md` | the **measured style spec** — art, camera, editing, typography, sound, packaging | **read-only evidence.** Never edit it to make a script fit. |
| **this file** | the **writer canon** — what the script says, how it is shaped, what numbers it must hit | edit here when a *writing* rule changes |

Every number below traces to `docs/research/crayon/MEASUREMENTS.md` (7 transcripts, 17,269 words,
116.3 min) and was **independently re-measured from the raw transcripts on 2026-08-11** for the three
reference videos cited throughout: `HawmGu7oNrc` (Wolf of Wall Street), `LuEcoqizj0o` (Great
Depression), `sMH8WchxQR8` (Rockefeller). Re-measurement reproduced the published table to within
rounding, so the rules in this file genuinely describe the reference, not an idealisation of it.

> Every quotation below was copied from those transcript files and re-checked against them. The
> transcripts are **ASR output**, so proper nouns are mangled in the raw text ("Belelfford" for
> Belfort, "Terraneian" for Mediterranean) and sentence punctuation is approximate. Names are
> corrected and sentence breaks lightly normalised in the quotes here; the wording is untouched.

---

## 0. What survived the swap, and why

These rules were kept because they are **format-independent craft**, and every one of them is visible
in the reference transcripts:

- **Causality — "but / therefore", never "and then."** Every beat connects by complication or
  consequence. The reference is built on this: *"Against Clark's judgment, they took on a brilliant
  chemist… **But** the tension between the partners grew like a cancer."* / *"They thought they had
  won. **They were wrong.**"*
- **Specificity over abstraction.** Exact objects, exact numbers, named people. The reference never
  says "he was frugal"; it says *"ordering a factory to use exactly 39 drops of solder to seal a
  kerosene tin because 40 was a waste and 38 leaked."*
- **A recurring motif as a callback engine.** The old canon called this a *sensory anchor*. In the new
  format it is a **factual through-line** — an object, a phrase, or an epithet re-triggered at every
  escalation. Rockefeller's episode runs two at once: *"ledger A"* (the boyhood notebook → *"the ledger
  A mindset"* applied to oil → *"his ledger A obsession"* applied to the world) and the epithet *"the
  bookkeeper"* (*"By age 30, the bookkeeper had done it"* → *"By 1879, the bookkeeper had finally
  finished the map"* → *"By the 1890s, the bookkeeper was worth over $900 million"*).
- **One share-worthy "wait — that's real?" beat.** Shares are weighted far above likes. Reference:
  *"he posed as a deaf-mute beggar to eavesdrop on farmers"*; *"smuggling cash stuffed envelopes sewn
  into her bra."*
- **Anaphora at theme moments.** *"Turned 22 months into a book deal. Turned fraud into fame."*
- **Sentence-length variation with short punches at peaks** (now with a *lower* target — see §3).
- **Pattern interrupt every ~30–45s** and **never the same template on two adjacent scenes.**
- **Promise → payoff ledger** as a comment at the top of `content.py`. An unpaid setup is the
  mid-video cliff the algorithm punishes, in an explainer exactly as in a story.
- **Structural variation across consecutive episodes** — check the last ~2 entries in
  `ops/produced_topics.json` and deliberately differ (cold-open type, act-2 shape, ending flavour).
- **Silence as the strongest emphasis tool**, spent once, on the biggest reversal.
- **Quality gate discipline** — `gate.py` HALTs; never publish broken.

These rules were **deleted** because they only existed to serve the POV format:

- Second-person present tense as the frame; the "you…you…you" drone and its imperative break.
- The **ban on perception filters**. It was a POV rule (filters push the viewer out of the body). In
  third person the reference uses them freely and well: *"Rockefeller looked at that river and saw
  money disappearing."* Do not carry the ban over.
- Body-based dread ("your hands are steady"), the 2–3-senses-per-scene rule, the fictional named
  mentor/rival, the shared fictional universe and its one unresolved thread, the rank-ladder
  escalation spine, and the `LEVEL 0N ·` label vocabulary.
- Anything that invents facts. The subject is **real**; invention is now a defect, not a device.

---

## 1. Format

**Third-person, past-tense explainer about a real subject.** A famous company, person, scandal,
crisis, or institution. Not a documentary voice — a *storyteller's* voice applied to true events.

- **Runtime 13–21 min.** (All 28 reference videos fall in 10:14–21:00; the seven best sit 13:12–20:16.)
  `ops/routine.json` currently sets `minMinutes: 11`, so the gate floor is *below* the band — the
  writer, not the gate, is responsible for clearing 13 min.
- **3–5 chapters**, each named in the two-part **`Evocative Noun: Plain Explanation`** form:
  "The Trap: Learning Not to Trust" · "The Mask: How Enron Hid the Truth in Plain Sight" ·
  "The Day America Fell: Black Tuesday and the Market Collapse".
- Chapters are a *structural* instruction to the writer and a *packaging* deliverable (they go in the
  description timestamps). See §8 for what is renderable on screen today.

## 2. Voice and tense

- **Past tense is the spine.** Measured on the three references: past-tense markers outnumber
  present-tense markers 234:6 (Wolf), 263:12 (Rockefeller), 212:18 (Depression).
- **Present tense is a licensed device for one act, not the default.** The Great Depression episode
  runs its "party before the fall" act in present tense — *"Imagine waking up in 1922. The war is
  over. The mustaches are ridiculous. And the economy, it's vibing."* — then hard-cuts to past for
  the crash: *"October 29th, 1929. America woke up rich and went to bed broke."* If you use this,
  use it for a whole act and make the switch land on a date.
- **Second person is seasoning, measured at 2.6–13.4 "you" per 1000 words** (re-measured: 9.8 Wolf /
  7.0 Depression / 11.4 Rockefeller). It appears as a direct address inside a general truth —
  *"You know things are bad when your barber, your butcher, and your dog all start giving stock
  tips"* / *"If you give a man a lamp, you own his nights"* — never as the frame. A script that reads
  as "you are the character" has failed the format.
- **Register varies by subject, deliberately.** Villain biographies (Wolf, Rockefeller) are straight
  and noirish. Systemic crises (Depression, 2008) are comic and anachronistic —
  *"Jazz music becomes the Wi-Fi of the 20s"* / *"the financial equivalent of saying, 'Sure, I'll
  marry you. We've been on two dates.'"* Pick one register per episode and hold it; a biography that
  cracks jokes about its subject's victims reads as callous.
- **Complicit first-person plural at the close** — "we", not "they". See §7.

## 3. The numbers a script must hit

| metric | target | measured range (7 refs) |
|---|---|---|
| **Pace** | **148.5 WPM** | 139.2–152.9 |
| Sentence length, mean | **7.5–10.6 words** | same |
| Sentence length, median | **6–9 words** | same |
| Sentences under 8 words | **40–59%** | 39.9–58.7% |
| Explicit numbers | **29–68 per video** (~2–3.5/min) | same |
| Questions | 3–27 per video | same |
| "you" per 1000 words | 2.6–13.4 | same |
| Total words | **~2,000–3,100** for a 13–21 min runtime | 1,870–3,099 |

> **WPM metric definition — this matters and has already burned one work order.**
> 148.5 WPM is **transcript words ÷ total video minutes**: **runtime-inclusive**, counting pauses,
> music beats, dialogue and text cards. It is **NOT speech-only WPM**. Speech-only runs roughly
> 3 WPM higher on the same audio. Anything that re-measures this must compare like for like.
> `gen_voice_edge.py` now prints **both** at the end of a build — `"~X WPM speech / Y WPM runtime"` —
> and the runtime figure is the one to compare against 148.5. The synth rate is `RATE = "-13%"`,
> measured (not assumed) at 149.1 speech / 145.7 runtime.

**How to hit the sentence numbers:** write in fragments. Roughly half of all reference sentences are
under eight words, and a large share are not grammatical sentences at all — *"No war, no warning."* /
*"Trust is weakness."* / *"Enter Wall Street."* / *"Scorched earth."* / *"Gone."* If a paragraph
averages fifteen words a sentence, it is the old canon's rhythm, not this one.

**How to hit the number density:** ~2–3.5 explicit numbers per minute means a number in most scenes.
Dates, dollar figures, percentages, counts, ages. *"22 of the 26 refineries in Cleveland had
surrendered"* is worth more than "almost all of them".

## 4. The hook — five steps, first ~30 seconds

Identical structure in all seven autopsied videos. Reproduce it in order.

1. **Shock stat or paradox, one sentence.**
2. **Escalating consequence fragments.**
3. **The paradox turn** — usually "But…", sometimes "And when…".
4. **Thesis naming the subject** — very often the literal words *"This is the story of…"*.
5. **Hard cut to DATE + PLACE.**

**Worked example — Wolf of Wall Street (`HawmGu7oNrc`), verbatim:**

1. "He lied about $1 stock, made millions, and only served 22 months in jail."
2. "Then Hollywood turned his crimes into a blockbuster."
3. "And the wildest part, people still cheer for him."
4. "This is the story of Jordan Belfort, the man who scammed America and got rich again doing it."
5. "Bayside, Queens, 1962."

**Worked example — Rockefeller (`sMH8WchxQR8`), verbatim:**

1. "This man controlled 90% of America's oil."
2. / 3. "And when the government shattered his empire to stop him, he actually became richer."
4. "This is the story of John D. Rockefeller, the most hated businessman who became the world's first
   billionaire."
5. "July 8th, 1839, Richford, New York. A baby was born into poverty."

**Documented variant — Great Depression (`LuEcoqizj0o`).** Steps 1–3 are intact ("It's the Great
Depression. You woke up rich, then went to bed broke. No war, no warning, just a terrifying crash
that wiped out $200 billion…"), step 4 is replaced by a **question thesis** ("So, what the hell
happened?"), and step 5 becomes a **rewind to a year** rather than a date-and-place ("Let's rewind to
the party before the fall. Imagine waking up in 1922."). Use this variant for a *systemic* subject
that has no single birthplace. Do not use it for a person.

Note what the hook never contains: no logo, no "in this video", no channel name, no subscribe.

## 5. Body structure

- **Chronological spine**, chaptered. Origin → the mechanism → the peak → the exposure → the
  reckoning is the reference's default shape for a person; boom → crash → consequence → recovery for
  a crisis.
- **Every chapter ends on a forward hook**, and the hook is a *question the next chapter answers*:
  *"But there was a new problem. When you own 90% of the world, you have a massive target on your
  back, and that target was about to be painted red."* / *"The crash wasn't the bottom. It was just
  the beginning. And what waited below — that's where things get dark."*
- **Explain the mechanism, don't gesture at it.** The format's whole promise is "explained like
  you're 5". The reference stops and teaches: what a pump and dump *is*, what a margin call *is*,
  what the three pillars of the South Improvement Company *were* (the rebate, the spy network, the
  drawback), each named and defined in one short sentence.
- **One midpoint reversal**, structural not fictional — the moment the subject's own machine turns on
  them (the leak, the raid, the journalist, Black Tuesday). Set `gap=1.4` on the scene immediately
  before that line, once per episode, so the sound engine drops to near-silence and the line lands raw.
- **Analogy is the primary teaching tool** and is allowed to be absurd in the comic register:
  *"the day the stock market didn't just fall — it performed a flawless 10-meter dive into concrete."*
- **Accuracy is a hard constraint.** Every date, figure and quote must be verified in
  `docs/research/<slug>.md` before it enters the script, and anything unverified must be flagged
  there and then either verified or cut. There is no fictional-composite escape hatch any more.

## 6. Dialogue — now a primary device, not a garnish

The old canon allowed 2–4 audio-only lines per episode. The reference uses **far more**: short
in-world exchanges, usually two to four lines, rendered as speech bubbles or floating handwritten
text, dropped in to dramatise a decision rather than narrate it.

> "One lemon ice, please." / "For you, two for one, but only if you tell three friends." / "What are
> you, 12?" / "16, and I'm going to be rich."

> "Jump, son. I'll catch you." … "Remember, never trust anyone completely, not even me."

> "Everyone, please, your money is completely safe. Okay, not completely."

Rules: **exchanges, not conversations** (2–4 lines, then back to narration); every exchange must
*replace* narration that would otherwise explain the same beat; period-plausible phrasing; and the
lines carry characterisation the narrator then declines to spell out. Emit them with the existing
`dialogue=dict(text=...)` scene field (optional `voice=`, `rate=`); `BEAT_GAP` is 0.8s.

## 7. The ending

**Thematic reflection → a direct quote or a callback to the opening → often a forward tease.**
Never plot resolution. Never a CTA; the words "subscribe", "like" and "comment" do not appear in
narration at all.

**Reflection + complicit "we" + quote — Wolf of Wall Street, verbatim close:**

> "He didn't just escape justice, he sold it. Turned 22 months into a book deal. Turned fraud into
> fame. And maybe the scariest part, **we** applauded. 'I was guilty of being greedy,' he once said,
> 'but so is everybody else.' Maybe that's why he got away with it. Because deep down, **we** never
> wanted him punished. **We** wanted to be him."

**Unanswered question + quote — Rockefeller, verbatim close:**

> "Was it guilt? A genuine awakening? Or the final brilliant con of a man who knew that history is
> written by the winners? We'll never know. What we do know is that on May 23rd, 1937, the machine
> finally stopped. … As Rockefeller himself once put it, 'I believe the power to make money is a gift
> from God…'"

**Forward tease — Great Depression, verbatim close:**

> "But as America stood back up, it didn't realize that something else was already on the horizon,
> something darker, louder, global, and this time the whole world would feel it."

Pick one of the three shapes per episode and vary it against the last two produced.

## 8. Scene requirements — environments, and what actually exists today

The writer emits a `template=` per scene. **Read this section before writing a single one.**

### AVAILABLE TODAY (safe to emit)
Only the templates catalogued in **`docs/TEMPLATES.md`** exist in the registry
(`src/scenes.tsx` `TEMPLATES`, packs in `src/stage.tsx`). A `template=` value not in that catalogue
will not render. Of the catalogue, these documented entries map onto explainer environments and are
the interim safe set: `deskSilhouette` · `desk` · `deskClose` · `fileWall` · `tower` · `window` ·
`signing` · `boardroomNotes` · `boardroomHead` · `atrium` · `dinner` · `layoffs` · `revolvingDoor` ·
`warRoom` · `emptyChair` · `lobby` · `tradingFloor` · `pnlWall` · `courtroom` · `podiumScene` ·
`streetCorner` · `prisonCell`.

> ⚠ **Caveat, stated plainly:** those templates *render*, but most are still in the old
> line-art-on-warm-paper style. Only the handful touched by WO-8a–8d are at reference density. An
> episode built on this interim set is a **script test, not a publishable episode.**

### ASPIRATIONAL — the environment vocabulary to write toward (DOES NOT EXIST YET)
`docs/research/crayon/TEMPLATE_STRATEGY.md` retired the plan to restyle the 358-template library.
It is being replaced by a **new set of ~20–30 dense explainer templates**, which **a later work order
(WO-8f / WO-8g) has not yet built**. Until it does, the following are **environment archetypes in
plain English, deliberately NOT template identifiers** — they are what a scene should *depict*, and
they are the reason the environment set is narrow enough to be built properly:

> office / cubicle floor · boardroom · trading floor · bank or institutional exterior · street ·
> domestic interior · courtroom or hearing · factory / industrial · newspaper & document montage ·
> broadcast or news frame · crowd or queue · character close-up · chart & diagram ·
> multi-panel split · full-screen text card

**Do not invent a camelCase name from that list and put it in `template=`.** None of them are
registered. When WO-8f lands the real set, `docs/TEMPLATES.md` becomes the source of truth for their
actual names, and this section gets rewritten to point at them.

### SIGNATURE DEVICES — AVAILABLE TODAY (WO-12a wired them to the renderer)

The devices below were built in WO-5/6/7 and were dead code until WO-12a. They are now live:
`content.py` emits them, `gen_voice_edge.py` copies them verbatim into `timeline.json`, and
`src/Video2.tsx` renders them. **All are optional** — a scene that sets none of them renders exactly
as scenes always have. WO-19 added the last two of the bible's eight: the **object showcase card**
(a fourth `card` kind) and the **over-the-shoulder foreground** (`foreground=`).

Malformed values **raise** and stop the build; they are never silently dropped. Spelling a key wrong
is the one failure that stays silent, because an unknown key is simply ignored — copy the names below.

#### `card=` — full-screen card (bible §6.1–6.2, §6.6)
One dict. Covers the scene from its first frame; **omit `hold` and the card IS the scene** (no art is
rendered underneath at all), or set `hold` in seconds to show the card and then cut to the scene's art.

```python
card=dict(kind="chapter", title="The Mask", subtitle="How Enron Hid the Truth in Plain Sight")
card=dict(kind="narration", text="Nobody could explain how the money actually arrived.")
card=dict(kind="word", word="It")
card=dict(kind="chapter", title="The Trap", subtitle="Learning Not to Trust", hold=2.2)
card=dict(kind="objects", items=["briefcase", "cashStack", "safe"])
```

| key | required | meaning |
|---|---|---|
| `kind` | yes | `"chapter"` · `"narration"` · `"word"` · `"objects"` |
| `title` / `subtitle` | chapter only | the two halves of the `Evocative Noun: Plain Explanation` chapter name |
| `text` | narration only | 1–2 lines; line breaking is automatic, long text shrinks rather than wrapping to 3 |
| `word` | word only | ONE short word, set small on a large empty ground — not a huge word |
| `items` | objects only | 1–5 objects; see the object card below |
| `ground` | no | `"white"` or `"black"`. Defaults: chapter/word → black, narration/objects → white |
| `hold` | no | seconds the card covers the scene. Omitted = the whole scene |

**The chapter card is how a chapter boundary is now marked. Emit 3–5 per episode** (§1), on the first
scene of each chapter, with the chapter's own two-part name split across `title` and `subtitle` — the
same names used in the description timestamps. Give that scene the chapter's opening narration: the
card holds while the line plays, exactly as the reference does.

**Chapter title sizing (WO-19).** The title is set to the reference's measured measure — 0.565 of frame
width — instead of to a fixed type size, so titles of different lengths read at one confident weight.
Titles of ~16 characters and up land on the anchor exactly; shorter ones ("The Trap") are held at a
size ceiling and set narrower, which is fine and intended. A title long enough that one line would set
smaller than its own subtitle breaks to two lines. **A subtitle much past ~45 characters still costs
you**: title and subtitle are size-locked at 0.75, so a very wide subtitle pulls the pair down. Keep
subtitles inside about 45 characters and the title lands on the anchor.

#### `card=dict(kind="objects", …)` — object showcase card (bible §6.6)
Isometric flat products floating on pure white — the reference's 0:35 frame (a toaster, a vacuum, a
refrigerator). Use it for the "here is the thing" beat: the product, the collateral, the paperwork.

```python
card=dict(kind="objects", items=["houseModel", "coinStack"])
card=dict(kind="objects", items=[dict(kind="safe", color="#c8663f"), "filingCabinet"], hold=3.0)
```

`items` is a list of 1–5 entries, each either an object name or a dict with `kind` plus optional
`color` (a hex flat fill, shaded automatically into its three faces) and `scale` (relative size; the
default puts every object at the same height, which is what the reference does — its toaster is drawn
as tall as its refrigerator).

The library today is **`briefcase` · `cashStack` · `coinStack` · `filingCabinet` · `houseModel` ·
`laptop` · `phone` · `refrigerator` · `safe`**. An unknown name raises and the message lists the
library. Adding one is a single entry in `OBJECTS` in `src/objectcard.tsx` — its extents, its colour
and its drawing — and nothing else changes.

#### `bubbles=` — speech balloons and floating dialogue (bible §6.3)
A LIST, so two speakers can share one frame as the reference's 9:20 frame does. Timing is in seconds
from the scene's own start; omit `at`/`dur` and the line holds for the whole scene. (The start key is
`at`, not `from` — `from` is a Python keyword and `dict(from=…)` will not parse.)

```python
bubbles=[dict(text="Don't panic. It will rise again.", x=0.72, y=0.18, tail="down", tailSkew=-0.25),
         dict(text="I want to complain!", x=0.30, y=0.62, tail="right", at=3.0, dur=2.5)]
bubbles=[dict(kind="float", text="Three years of losses, moved off the books.", x=0.30, y=0.24)]
```

| key | default | meaning |
|---|---|---|
| `kind` | `"bubble"` | `"bubble"` draws the balloon; `"float"` is bubble-less script laid on the scene |
| `text` | — | one utterance; the balloon grows to hold it |
| `x` / `y` | 0.5 / 0.24 | balloon or block centre, as fractions of the frame |
| `at` / `dur` | 0 / rest of scene | seconds from the scene's start, and how long the line holds |
| `tail` | `"down"` | balloon only: `left` `right` `down` `up` `none` — roughly where the speaker is |
| `tailAt` / `tailSkew` | 0.5 / 0 | where along that edge the tail sits, and how far its tip leans |
| `align` / `color` | `"left"` / white | float only. Pass `color="#000000"` over a PALE scene |
| `maxWidth` / `maxLines` | — | ceilings; past them the text shrinks instead of growing |

#### `panels=` — multi-panel split (bible §6.4)
Replaces the scene's whole shot plan with one static split — a split *is* a composition, so it never
re-frames. Each cell renders a template as a centre crop; a cell with no `template` is a flat colour
block and **must** then name its own `ground`.

```python
panels=dict(variant="v2", cells=[dict(template="fileWall"), dict(template="drivewayHoop")])
panels=dict(variant="grid4", cells=[dict(template="fileWall"), dict(template="tradingFloor"),
                                    dict(template="dinner"), dict(template="boardroomNotes")])
panels=dict(variant="diagonal2", cells=[dict(template="courtroom"), dict(ground="#e8541f")])
```

`variant` is `"v2"` (2 cells, vertical gutter) · `"diagonal2"` (2 cells, leaning gutter) · `"grid4"`
(4 cells, reading order). Cell count must match exactly or the build raises. Optional: `split`,
`splitY`, `lean` on the split; `ground`, `scale`, `offsetX`, `offsetY` on a cell. A cell's ground
defaults to the colour key its own template commits to, which is what keeps the panels
independently keyed — **so choose templates on DIFFERENT keys**, or two cells land on one hue.

#### `foreground=` — over-the-shoulder silhouette (bible §6.8)
One dict. Paints a near-black head-and-shoulder mass against one frame edge, over the scene's art, so
the scene reads as being watched from behind someone — the reference's main depth cue
(`wolf_montage_verified.jpg` @3:34: an ordinary office, framed past a dark chair-back and head). Works
with **any** template, including a `panels` scene.

```python
foreground=dict(kind="overShoulder", side="left")
foreground=dict(kind="overShoulder", side="right", scale=0.8, y=1010)
```

| key | required | meaning |
|---|---|---|
| `kind` | yes | `"overShoulder"` — the only foreground device |
| `side` | **yes** | `"left"` or `"right"`: which edge the figure stands at |
| `scale` | no | 0.4–1.6, default 1. Outside that band it raises |
| `y` | no | baseline in the 1920×1080 frame, default 1080 (the bottom edge) |

⚠ **`side` is required on purpose. Pick the edge AWAY from the scene's colour hero** — measured: a
right-side silhouette at `scale=1` on `boardroom` (whose hero stands at the right) blacks the hero out
completely. It also costs a little density: the same scene measured 87.2% flat fill without it and
87.8% with, so use it as an occasional depth beat, not on every scene.

#### `level=` — still required, no longer drawn
`level` is the pipeline's **structural** chapter marker and must still be set on the first scene of
each chapter. `gen_voice_edge.scene_gap()` reads it to lengthen the pre-chapter silence and
`duck_music.py` keys the chapter-start SFX off it.

**It no longer renders anything.** WO-12a deleted the gold-bar top-left chip: it was Helvetica in a
handwritten-script canon (§7), force-uppercased, carried a `boxShadow`, showed no measured frame's
behaviour, and announced a chapter the chapter *card* now announces properly. Do not write copy for
it — nobody sees the string. The visible chapter name is `card=dict(kind="chapter", …)`.

### Still true regardless of which set is live
Never the same template on two adjacent scenes; rotate the environment every ~30–45s; pick the
environment the *fact* happened in, not the one that looks good.

## 9. Packaging

**Title — 36–64 characters.** Three formulas, in order of dominance (17 of 28 reference videos use
the first):

1. **`<Subject> Explained Like You're 5`** — "The Great Depression Explained Like You're 5" (44 chars),
   "The Wolf of Wall Street Scam Explained Like You're 5" (52).
2. **`How <Person> Actually <Verb>ed <Thing>`** — "How Jeff Bezos Actually Built Amazon" (36 — exactly
   on the floor; formula 2 titles run short, so check the count before committing one).
3. **`The <Superlative> <Noun> That <Surprise>`** — "The $63 BILLION Company That Sold Nothing" (41),
   "The Man Who Built Singapore in One Generation" (45).

(All counts verified 2026-08-11 against the real titles in `docs/research/crayon/MEASUREMENTS.md`.)

No stakes parenthetical. No "Every Level". No second person in the title.

**Description:** hook in the first 150 chars (third person, the paradox from the hook) → keyword
paragraph → **chapter timestamps using the exact two-part chapter names** → sources/credits →
hashtags → disclaimer. No "watch the whole series, every life every level" binge line — that was a
POV-format artefact.

**Thumbnail:** the full measured spec is `docs/CRAYON_BIBLE.md` §9 — one hero character in full
colour against a desaturated grey crowd, a single saturated accent, pushed facial expression, and
either an amber band with black ALL-CAPS text or heavy-outlined white caps. **The archetype rotation
rule stands**: rotate archetypes and never reuse one from the last 3 produced episodes (2026-08-04
owner direction). `src/thumbs.tsx` is being rebuilt by WO-11; the *rotation* rule survives that
rebuild, whatever the archetype names become.

## 10. Visuals and audio

Not specified here — see `docs/CRAYON_BIBLE.md`: §3 camera (locked, no dolly/sway), §4 editing
(12.5 cuts/min, mean shot 4.79s, ~40% motionless frames), §5 art (flat vector, per-scene colour key),
§6 signature devices, §7 typography (handwritten italic everywhere), §8 sound (bed ducked 8–15 dB,
deliberate silent passages, inter-sentence gaps 0.18–1.0s).

What a *writer* needs from those sections: scenes are short and still. Mean shot 4.79s and a locked
camera mean a scene's narration must be interesting standing still — there is no push-in to carry a
flat line.

## 11. Build discipline

`python3 build.py` syntax-checks `content.py` + `ops/episode_meta.json`, synthesises VO, runs
`gate.py`, and does a 1-frame smoke render. It HALTs rather than shipping broken. Read the printed
`WPM speech / WPM runtime` line every build and compare the **runtime** figure to 145–152.

## Brand
Channel @corelifecycle. Thumbnail/typography brand rules live in `docs/CRAYON_BIBLE.md` §7 and §9.
