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
- **Never the same template on two adjacent scenes.** (The old "pattern interrupt every ~30–45s" is
  superseded: §3a moves the set-up every **1–2 sentences**, which makes a 30–45s interrupt a slow one.)
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
  `ops/routine.json` sets `minMinutes: 13` / `maxMinutes: 21`, so the gate floor is *at* the band and
  `gate.py` HALTs in BOTH directions — an episode under 13 min or over 21 min does not build.
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
> and the runtime figure is the one to compare against 148.5. The synth rate is `RATE = "-7%"`
> (`gen_voice_edge.py`, `CACHE_VERSION` v7 — the OWNER retune from -10%), measured (not assumed) at
> **156.8 speech / 152.5 runtime**. `content.py`'s `NARRATION_RATE` carries the same value and stamps
> it onto every scene; a per-scene `rate` wins over both, so changing one alone is a silent no-op.
> §3a's table below reports the same -7% figures — if this line and that table ever disagree again,
> `gen_voice_edge.py` is the truth.

**How to hit the sentence numbers:** write in fragments. Roughly half of all reference sentences are
under eight words, and a large share are not grammatical sentences at all — *"No war, no warning."* /
*"Trust is weakness."* / *"Enter Wall Street."* / *"Scorched earth."* / *"Gone."* If a paragraph
averages fifteen words a sentence, it is the old canon's rhythm, not this one.

**How to hit the number density:** ~2–3.5 explicit numbers per minute means a number in most scenes.
Dates, dollar figures, percentages, counts, ages. *"22 of the 26 refineries in Cleveland had
surrendered"* is worth more than "almost all of them".

> The words in this table are the whole script's. **How they are cut into scenes is a separate number
> and it is just as measured — see §3a.** Hitting every band above and still writing 39 scenes produces
> the WO-13 defect: a script that reads right and edits like a slideshow.

## 3a. Scene granularity — the edit is a WRITING job

**Since WO-17 there is exactly one framing per scene.** `planShots` no longer re-crops the same artwork
to manufacture rhythm (of 160 detected cuts in the WO-13 build, 122 were re-crops of a picture that had
not changed — the owner saw them as "so many random zooms"). A scene is now a *shot*. Nothing in the
renderer can add a cut. **The cut rate is the writer's number, and it is set by how many scenes you
write.**

The WO-13 build is what one framing per scene looks like on the old scene budget: 39 scenes over
13.7 min = a **21.1s mean scene** against the reference's **4.79s mean shot**, and at 8 evenly spaced
samples it showed **4 distinct set-ups out of 8** where both reference montages show **8 of 8**.

### The target

| | reference | **write to this** | WO-13 build | WO-22 | **WO-30** |
|---|---|---|---|---|---|
| narration words per scene | ~12 (at its rate) | **mean 10–16, see below** | 54 | 12.6 | 12.2 |
| mean scene | 4.79s | **4.5–5.5s** | 21.1s | 4.95s | **4.80s** |
| **median scene** | **2.67–6.81s** | **below the mean** | — | 4.83s | **4.57s** |
| **longest shot** | **16.46s** | **one at 14–16s** | — | 9.80s | **15.50s** |
| **shortest shot** | **0.61s** | **~1s, ~15 of them** | — | 1.17s | **1.00s** |
| cuts/min | 12.5 | **10–13** | 2.8 | 12.4 | **12.5** |
| scenes per episode | — | **180–210** (15–17 min) | 39 | 196 | 202 |
| distinct set-ups in 8 evenly spaced samples | 8/8 | **8/8** | 4/8 | 8/8 | **8/8** |
| same template within | never repeats | **≥ 3 scenes apart** | adjacent-only rule | ≥ 3 | ≥ 3 |

### THE RHYTHM RULE — write a DISTRIBUTION, not a mean (WO-30)

**Hitting the reference's mean and missing its spread is the defect this rule exists to prevent.** The
WO-22 build sat at a 4.95s mean — 0.16s off the reference — and the final review still called the edit
a tell, in these words: *"our longest hold is 9.8s where theirs runs to 16.5s. Ours never pauses."*
Its shot lengths ran 1.17–9.80s with a **1.77s standard deviation** and a median (4.83s) sitting
*above* its mean. That is a metronome. The reference is measured at mean 4.79s over a **0.61–16.46s**
range, and its per-window medians (2.67s, 2.98s, 4.62s, 5.07s, 6.81s) sit mostly *below* its window
means — many short shots, a few long holds, right-skewed.

Budget it explicitly, per episode:

| band | how many | what goes there |
|---|---|---|
| **HOLD 12–16s** | **4–6, one of them 14–16s** | the first real reveal · the mechanism definition · the MIDPOINT REVERSAL · the last shot. 30–40 words, 4–5 sentences, ONE set-up. |
| long 8–12s | 10–14 | a continuous piece of reasoning; a reflective beat; an inventory read slowly |
| the bulk 3–7s | ~60% of scenes | ordinary explanation |
| **PUNCH ≤2.5s** | **25–30, of which ~6 at ~1s** | a single word · a bare date · a hard number · a turn · a verdict |

Concrete tests, all cheap to run on the built timeline:

- **The longest shot must be ≥ 12s.** If the maximum is under 12s the episode has no pause in it,
  whatever the mean says.
- **The median must be below the mean.** Equal means symmetric means metronomic.
- **Standard deviation ≥ ~2.3s.** WO-22 measured 1.77s and read as uniform; WO-30 measures 2.45s.
- **No more than ~5 consecutive scenes inside ±1s of each other.** That run *is* the metronome.

**How to build a hold without breaking the WPM arithmetic.** Runtime is set by the WORD count, not by
the scene count — a scene boundary costs `LEAD` + gap ≈ 0.49s and the per-scene audio constant recovers
almost exactly that much, so **merging and splitting are close to runtime-neutral**. So: **pay for
every hold with a split somewhere else.** Merge two or three adjacent scenes whose narration is one
thought onto one set-up, and split a punch off the front of a long scene elsewhere to keep the count.
WO-30 did this seventeen times in both directions on a script whose narration is otherwise **verbatim**
the WO-22 text: 202 scenes against 196, 2,467 words against 2,468, runtime 16.18 min against 16.16, and
runtime WPM moved 152.7 → 152.5.

**What makes a beat want a hold:** the sentences only mean something *together* (a definition and its
worked example; a reveal and its consequence), or the viewer has just been given something to feel and
a cut would make them re-anchor instead. **What makes a beat want a punch:** it is one fact, one word,
or one turn, and the next shot is the point.

Scenes may be very short. A one-word scene (`"Unless."`) measures **1.17s**, and `"Move two."` /
`"Not one."` measure **1.00s** — 30 frames. Sub-38-frame scenes used to kill the render; that whole
class is closed by construction (WO-25/WO-28 swept `interpolate` over D=1..600), and WO-30 rendered
first, middle and last frames of a 30-frame scene to confirm it. **Render one anyway if you write
one** — it costs one `npx remotion still`.

A recurring one-beat shot is a *motif*, not a metronome, as long as it is spaced: WO-30's four
"Move one/two/three/four" punches sit 3–12 scenes apart and nothing else nearby is that short.

### The WPM arithmetic is NOT what it looks like — measure, and read this before "fixing" a HALT

Splitting a scene does two opposite things at once, and the second one is easy to miss:

- it **adds** `LEAD` (0.1s) + an inter-scene gap — **measured 0.516s per scene boundary** across the
  WO-22 build — which pushes runtime WPM *down*; and
- it **removes one sentence-final pause from inside the synthesised utterance** (`trim_silence()` cuts
  the tail of every scene's audio), which pushes **speech** WPM *up*.

Measured on this same script and subject, at `RATE = "-7%"`:

| scenes | mean scene | speech WPM | **runtime WPM** | verdict |
|---|---|---|---|---|
| 39 | 21.1s | 156.8 | 152.5 | PASS |
| 141 | 6.81s | 167.1 | **154.2** | **HALT** — over `gate.py`'s 154.0 ceiling |
| 196 | 4.95s | 170.5 | 152.7 | PASS |
| 202 | 4.80s | 170.9 | 152.5 | PASS — WO-30, same words re-cut into a wide distribution |

So runtime WPM is **not** monotonic in scene count: the speech-rate gain outruns the gap cost until
roughly 7s and then falls behind it. There is a **dead zone around a 6.5–7.5s mean scene** where the
number climbs through the ceiling. Both the 21s edit and the 5s edit clear the gate; the 6.8s draft in
between did not.

**The actionable rule that follows:** if `gate.py` reports runtime WPM *above* the band, **split more
scenes** — do not lengthen them, and never touch `gen_voice_edge.RATE`. If it reports *below* the band,
add words. The floor is only reachable by extrapolation somewhere under a ~3s mean scene, which no
other rule here would let you write anyway.

### Why 10–13 cuts/min and not more, when the gate would allow it

The measured band leaves room to cut faster still. Four reasons not to, and none of them is taste:

1. **Inventory. This is the one axis where copying the reference makes the copy worse.** The reference
   hand-draws every set-up and *never repeats one*. We have 13 environments and reuse all of them. At
   the WO-22 cut rate the same room already comes back after a measured **minimum of 12s and a mean of
   59s**. Cutting twice as fast halves both. The reference's 12.5 cuts/min is affordable *for it*
   because it never pays the repetition price; we pay it on every cut.
2. **We cannot cut mid-sentence; the reference can.** One scene is one synthesised utterance, so every
   cut lands on a full stop with a silence in it. The reference cuts underneath continuous narration.
   Past ~13 cuts/min our scenes fall below one sentence each and we would be fragmenting sentences
   purely to make a cut, which reads as a stutter, not a rhythm.
3. **Ten words is not an explanation.** A 4.8s scene is ~12 words. The format's promise is "explained
   like you're 5", and the mechanism beats (what a repo *is*, what a tranche *is*) need two or three
   sentences standing in one place. Below ~10 words a scene, the teaching stops. **This is a bound on
   the MEAN, not a floor on any one scene** — the rhythm rule above spends 25–30 scenes an episode at
   1–3 words precisely so the mechanism beats can be 30–40-word holds and the mean still lands.
4. **Gate headroom.** 152.7 sits 1.3 under the ceiling. That is margin for the next script's prose, not
   spare capacity to spend on cuts.

### Vary the SET-UP, not just the template

At this cut rate the 13-name template list is not enough on its own. What counts as a set-up change:

- a different `template=` — the base move;
- a full-screen `card=` (`chapter` / `narration` / `word` / `objects`) — the card *is* the picture;
- a `panels=` split — a new composition even when the cells reuse rooms already seen;
- `foreground=dict(kind="overShoulder", …)` — the same room, watched from behind someone;
- **`closeUpPortrait` used as a genuine cut-in** — one face, after a wide, is the cheapest real cut we
  have. Spend it on reactions and verdicts.

Budget per episode, roughly: 5 chapter cards · 4–6 narration cards · 3–4 word cards · 1–3 object cards ·
3–4 panel splits · 3–5 over-the-shoulder foregrounds · 5–10 bubble/float beats.

### Two mechanical consequences of short scenes

- **`gen_voice_edge.py` only auto-inserts a breath on scenes over 48 words**, and at this granularity no
  scene comes close to 48. Set **`breath=True`** by hand on ~10–15 scenes (chapter openings, the beat
  after a silence) or the whole episode synthesises without one — brains flag impossible breathlessness.
- **Leave `gap=` alone.** The engine's per-scene hashed gaps are what score the §8 MATCH on varied
  inter-scene silence (37 distinct values across 39 gaps). Clamping every gap toward the bottom of the
  reference's 0.18–1.0s band would buy a little more cut rate and would trade a measured MATCH for it.
  The one licensed exception is still `gap=1.4` on the scene before the midpoint reversal.
- A chapter card holds 2.4s, so **give a chapter's opening scene at least ~12 words** or the card covers
  the whole scene and the chapter opens on a card cutting to nothing.

### Measure it, do not estimate it

After `gen_voice_edge.py`, sample the timeline at **8 evenly spaced points** (the density of the
reference's own montage sheets), resolve what is on screen at each — card kind, panel split, or template
— and count the distinct values. **Report it as x/8.** Reference 8/8, WO-13 4/8, WO-22 8/8, WO-30 8/8.

> **A 12s+ hold pulls sample points onto whatever room it sits in.** WO-30 dropped to 7/8 the moment
> two of its holds landed on the same template, and got 8/8 back by moving ONE scene's `template=`.
> So: do not put your holds in the busiest room, re-measure after every hold you add, and fix a
> collision by re-templating a *neighbouring* beat rather than by shortening the hold.

And measure the **distribution** in the same pass — `mean, median, min, max, standard deviation and the
deciles` of `durationInFrames / fps`. Against the reference (mean 4.79s, range 0.61–16.46s):

| | WO-22 | **WO-30** |
|---|---|---|
| mean / median | 4.95s / 4.83s (median *above* mean) | **4.80s / 4.57s** |
| min / max | 1.17s / 9.80s | **1.00s / 15.50s** |
| standard deviation | 1.77s | **2.45s** |
| deciles | 1.17 · 2.63 · 3.37 · 3.87 · 4.37 · 4.83 · 5.40 · 5.78 · 6.60 · 7.30 · 9.80 | **1.00 · 1.97 · 2.71 · 3.31 · 3.87 · 4.57 · 5.17 · 5.69 · 6.65 · 7.46 · 15.50** |
| shots ≥ 12s | **0** | **6** |
| shots ≤ 2.5s | 9 | **29** |

> **The 30s-sample repeat share is inventory-bound, not cadence-bound — do not chase it.** Sampling
> every 30s across a 16-min episode takes 33 samples from a vocabulary of 13 rooms, so at least
> 20 of them must repeat: **61% is the floor**, and the WO-22 build measures exactly 61% — the same
> figure the 39-scene build measured, because cutting faster does not add rooms. That number only moves
> when the template set grows.

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

> **Prefer `bubbles=` to voiced `dialogue=`, and keep the voiced kind to 2–4 lines an episode.** A
> voiced line costs `BEAT_GAP` plus its own speech time — 4s of runtime carrying **zero narration
> words** — and runtime WPM is `words / runtime`. Four voiced lines cost roughly 2.5 WPM off the gate's
> figure. A speech balloon or a floating line costs nothing and, unlike the reference's own dialogue,
> is what the reference actually *shows*: its exchanges are drawn on screen, not always spoken.

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

### AVAILABLE TODAY (safe to emit) — the THIRTEEN explainer environments
WO-8f built six of them and WO-8h added seven more. They are the restyled, reference-density set, and
an episode in this format uses **these and nothing else**:

> `officeFloor` · `boardroom` · `exchangeFloor` · `cityStreet` · `domesticInterior` · `newsMontage` ·
> `bankExterior` · `courtHearing` · `factoryFloor` · `broadcastDesk` · `crowdQueue` ·
> `closeUpPortrait` · `chartBoard`

**Source of truth is `EXPLAINER_TEMPLATES` in `src/explainer.tsx`**, spread into `TEMPLATES` in
`src/scenes.tsx`; `gate.py` derives the registry by following those spreads and HALTs on a `template=`
it cannot find. `docs/TEMPLATES.md` still documents only the **legacy** 358-template library and does
**not** list the thirteen — do not go looking for them there, and do not emit a legacy name from there
either. Those render, but in the old line-art-on-warm-paper style, and they look wrong beside these.

Pick the environment the *fact* happened in, never the one that looks good. `closeUpPortrait` is the
exception to that rule: it depicts nowhere, so it is free to use as a **cut-in on a reaction, a verdict
or a one-line judgement** (§3a), which is what makes it the most valuable name on the list.

### PERIOD — never put a dated machine under narration from a century that had not invented it

**There IS a period flag now (WO-27): `period="pre1900"` on the scene.** It is opt-in, per scene, and
default off — a scene that does not set it renders exactly what it always did (proved by render: all
thirteen templates at native 1280, before and after, identical SHA-256). With it set, the template
draws the same room with its era-marking props **substituted**, not deleted: ledgers and paper for
monitors, an open ledger for a keyboard, an inkstand for a desk phone, a chalk board for the
electronic quote board, pendant lamps for recessed panels, a wooden chair for a swivel chair, a
masonry skyline for a glazed one, a dray for a car, a barrel for a traffic cone, a plate camera on a
tripod for a studio camera.

WO-26 wrote the rule this section used to carry, and it was right for the art that existed then: the
QA of the Lehman build scored 1844 Alabama narration over CRT monitors, a projector, a parked car and
a glass skyline (COMPARISON.md §7 defect 4), and the only fix available was to AVOID nine of the
thirteen rooms. **That cost was the reason for WO-27:** a pre-1900 chapter had four rooms where a
modern one had thirteen, and the topic queue is mostly historical subjects (`tulip_mania`,
`weimar_hyperinflation`, `carnegie`, `jp_morgan_1907`, `ford_five_dollar_day`, `de_beers`).

**The rooms were never the problem — a counting house, an exchange, a mill, a court and a street all
existed in 1844.** A short list of props was, and props can be swapped.

#### The tiers WITH the flag on

Read off the JSX in `src/explainer.tsx` and off rendered frames, both modes, one per template.
Re-check them if the art changes.

**⚠ WO-29 CORRECTED THIS TABLE BY LOOKING AT THE FRAMES.** WO-27 wrote it off the JSX and scored ten
rooms PERIOD-CLEAN. Rendered and read (`out/_wo27/final3_on_*.png`, and this build's own stills),
**four of those ten do not hold up**. The cause is one thing and it is worth knowing before you trust
any row here: **a substituted prop inherits the scene's own tone ladder, so a "wooden" prop is only
wooden in a WARM-keyed room.** In a blue- or purple-keyed room the same geometry reads as modern
painted furniture, or as a screen. The tiers below are the corrected ones.

| Tier | Rooms | Note |
|---|---|---|
| **ERA-FREE, no flag needed** | `newsMontage` · `courtHearing` | printed sheets; a panelled bench, gallery and wall clock. Setting `period` on `courtHearing` still helps a little (its ceiling panels become pendants) but nothing in it contradicts a century. |
| **PERIOD-CLEAN with `period="pre1900"`** | `bankExterior` · `officeFloor` · `chartBoard` · `closeUpPortrait` · `domesticInterior` | Five rooms verified on the frame. `bankExterior` is the best in the library — pediment, columns, gas lanterns, a loaded dray, a pillar box. `officeFloor` becomes a convincing counting house. All five are warm-keyed, which is not a coincidence (see the warning above). |
| **PERIOD-CAVEATED, one use at a time** | `cityStreet` | The flag fixes the facades, the setts and the vehicles' bodies, but the drays have **no horse** (they read as parked handcarts), and the ground-floor retail fascia band and the rectangular-headed lamp standards are untouched. Fine at the far plane of a wide establishing shot; wrong for any shot where the eye rests on the road. |
| **PERIOD-PLAUSIBLE, use with judgement** | `broadcastDesk` | Broadcasting does not exist before 1920, so the flag does not pretend it does: it redraws the composition as a **press rostrum**. Correct for a hearing, an inquiry or a public statement; wrong for anything the narration calls a broadcast — and on the frame it still reads as a TV studio with an antique camera parked in it. |
| **DO NOT USE before 1900, flag or no flag** | `factoryFloor` · `exchangeFloor` · `boardroom` · `crowdQueue` | `factoryFloor` is the worst and WO-26 was already treating it as "near-neutral": the flag changes only the beacon, the chevrons and the cones, and leaves circular dial gauges and lit push-button panels on every machine, an electric extractor fan, a roller shutter with a lit sign strip, and blue overhead pipework. `exchangeFloor` and `boardroom` are blue-keyed, so the chalk slate reads as an electronic quote board and the easel boards read as flat screens. `crowdQueue` is purple-keyed and its bank is still a ribbon-glazed curtain-wall block with a roller shutter, filling a third of the frame. |
| **ERA-MARKED, still, without the flag** | all eleven non-era-free rooms | Nothing changed for a scene that does not set `period`. The old rule stands there in full. |

That is **eight of thirteen rooms available to a pre-1900 chapter** — five clean, one caveated, two
era-free — against WO-26's four, one of which (`factoryFloor`) was itself wrong. So the count of rooms
that are genuinely era-correct goes **3 → 8**. WO-29 built the Lehman chapter 1 on exactly those eight.

#### What each room does with the flag

| Room | With `period="pre1900"` |
|---|---|
| `officeFloor` | Monitors → framed ledger boards on easels; keyboards → open ledgers; desk phone → inkstand and hand bell; the sprinklered service duct → a timber beam on iron brackets; the lit exit sign → a painted name board; the water cooler → a cast-iron stove with a flue; the extinguisher → a fire bucket; swivel chairs → turned wooden chairs; ceiling panels → pendant lamps. |
| `boardroom` | The curtain wall → three tall round-headed sash windows in a masonry wall (piers, arches, sill course laid over the glazing); the ceiling projector → a three-burner gasolier; table screen → ledger board; chairs and ceiling as above; the city outside → masonry. |
| `exchangeFloor` | The electronic quote board → a **chalk slate** in a timber frame, ruled into columns, with chalked symbols, figures and ticks — and it stops reprinting itself; the running ticker → a bill board of pasted notices; every desk screen, keyboard and phone substitutes; cone → barrel. |
| `cityStreet` | Cars → drays (the travelling one keeps the identical wrap arithmetic, so the motion is unchanged); traffic signal → an advertising column of pasted bills; lane markings and the zebra crossing → granite setts; the news box → a newsvendor's stand; the facade's storey-high glazing → punched sash windows with lintels and sills; the far skyline → masonry. |
| `domesticInterior` | The television → a framed picture propped on the same stand between two candlesticks; armchair → wooden chair; the roofline through the window → masonry. |
| `bankExterior` | The parked car → a dray; the news box → a pillar box; cone → barrel; the flanking blocks → masonry. |
| `courtHearing` | Ceiling panels → pendant lamps. Nothing else needed. |
| `factoryFloor` | Painted floor hazard chevrons → sett paving; the flashing beacon → a shift bell on the same post; cones → barrels. |
| `broadcastDesk` | See the caveat above: studio lamps → hanging oil lamps; the backdrop screen → a painted board (neutral ground, hand-lettered straps, the same panorama and chart); the mic → a carafe and tumbler; wall and floor screens → framed charts and easel boards; the studio camera → a **plate camera on a wooden tripod** with the dark cloth over it. |
| `crowdQueue` | Skyline bands → masonry; cone → barrel. Nothing bespoke — the queue, the placards, the shut door and the barriers were already period. |
| `closeUpPortrait` | Both monitors, the keyboard and the desk phone substitute; the printer → a stack of ledgers with an oil lamp on it; the skyline in the bay → masonry; ceiling → pendants. |
| `chartBoard` | The laptop and the projector body → a ledger stack with rolled sheets; the chart is on an easel already; ceiling → pendants; chairs → wooden. |
| `newsMontage` | Nothing. It is paper. |

#### The rules that did NOT change

* **A full-screen `card=` with no `hold` still carries no era at all**, because the art underneath is
  never rendered (§8 `card=`). It remains the cheapest period-correct surface in the format.
* **Set the era off the NARRATION, scene by scene** — not off the chapter, and not off the topic. A
  chapter that opens in 1844 and closes in 1994 crosses the line inside itself, and `period` is a
  per-scene field precisely so it can. Monitors are wrong before ~1970; a glazed skyline and a car are
  wrong before ~1900; print and a courtroom are never wrong. **A mill is never wrong as a SUBJECT and
  is wrong as OUR ART** — see `factoryFloor` in the DO-NOT-USE tier; that distinction is exactly the
  trap WO-26 fell into.
* **A `panels=` split takes the flag too** — it is applied to every cell — so a deliberately multi-era
  montage should *not* set it; the modern cell is correct there, because the cell *is* the later decade.
* **Do not set `period` on a modern scene to "make it look classic".** It is an accuracy switch, not a
  mood one, and the number note, balloons and cards are unaffected by it either way.

#### What the flag does NOT fix

Named because a reviewer will see them: the **figures still wear modern suits and ties** (that is
`figure.tsx`, not the templates); `crowdQueue`'s bank door keeps a horizontally-ribbed shutter panel
that reads as a roller door if you look for it; and `broadcastDesk` remains a room whose *name* is an
anachronism whatever is drawn in it. The flag removes dated MACHINES, which is what a viewer notices.

**WO-29 adds three more, all measured on rendered frames.** (1) `factoryFloor`'s MACHINES were never
substituted at all — dial gauges, lit push-button panels, an electric extractor fan, a roller shutter
and overhead pipework all survive the flag, which is why it moved to the DO-NOT-USE tier. (2) The
substituted props take the SCENE'S TONE LADDER, so in a blue or purple key the "wooden" forms read as
modern painted furniture; this is the single reason three rooms fail, and the real fix is a
period-specific wood/iron token pair on `SceneTones` keyed off shell warmth rather than off the scene
hue. (3) `Cone`'s barrel banded a near-white body with two `accentDeep` hoops, which in an orange-keyed
room reproduced the signature of the traffic cone it replaces — **fixed in WO-29**, the hoops are now
iron (`tn.deep`) and only the lid keeps the accent.

### The vocabulary is 13 rooms, not 13 shots
The environment archetypes the old canon listed in plain English (office · boardroom · trading floor ·
bank exterior · street · domestic interior · courtroom · factory · newspaper montage · broadcast ·
crowd · close-up · chart) now all exist as real names above. The three that never became rooms —
**multi-panel split**, **full-screen text card** and the **over-the-shoulder foreground** — are the
devices below, and at the §3a cut rate they carry as much of the variety as the rooms do.

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
| `text` | narration only | 1–2 lines; line breaking is automatic, long text shrinks rather than wrapping to 3. **Keep it inside ~30 characters per line** — see the sizing note below |
| `word` | word only | ONE short word, set small on a large empty ground — not a huge word |
| `items` | objects only | 1–5 objects; see the object card below |
| `ground` | no | `"white"` or `"black"`. Defaults: chapter/word → black, narration/objects → white |
| `hold` | no | seconds the card covers the scene. Omitted = the whole scene |

**The chapter card is how a chapter boundary is now marked. Emit 3–5 per episode** (§1), on the first
scene of each chapter, with the chapter's own two-part name split across `title` and `subtitle` — the
same names used in the description timestamps. Give that scene the chapter's opening narration: the
card holds while the line plays, exactly as the reference does.

**Narration sizing (WO-25).** The narration line is set the same way the chapter title is: to §7's
measured **0.53 of frame width**, with the old 0.12 h type size demoted to a ceiling. Before this it had
no width target at all and simply ran out to the 0.82 w box — the WO-23 build measured six cards at
0.499–0.797 w, mean **0.622**, against the reference's 0.536, with one 34-character sentence set as a
single line 0.80 of the frame wide. Measured after: 0.499–0.527 w, **mean 0.514**.

The trade the engine cannot make for you: at the reference's own type size a line reaches 0.53 w at
about **22 characters**, so copy longer than that either sets smaller on one line or wraps to two and
comes in under the anchor. The card picks whichever keeps the type above 0.07 h. **Write narration
cards at ~22–30 characters per line, two lines at most** and both anchors land together — that is what
the reference's own cards do, and it is the only half of this that is not the renderer's job.

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
| `align` / `color` | `"left"` / **black** | float only. See the colour note below before overriding |
| `maxWidth` / `maxLines` | — | ceilings; past them the text shrinks instead of growing |

**Floating dialogue is BLACK by default, and you should almost never override it (WO-25).** This
device produced the same defect — white script, illegible, on a pale ground — in two consecutive QA
passes, at t28 and then at t022, because the renderer chose the colour from the scene's colour KEY. A
key's ground is the flat colour a template paints *first and then covers*; what a line actually lands
on is a wall, a card, a window or a prop off the tone ladder, and the ladder's light rungs are by
design the large-area tones. So the rule read the right value of the wrong quantity and could only
ever be right on some scenes. Unballooned script now sets in black with a flat white keyline, which
separates against every tone the palette can produce, and per-scene `color=` patches (t105 carried one)
are no longer needed. Pass `color="#ffffff"` only for the reference's deliberate white-over-mid-grey-
wall look, and only when you have looked at the frame. **If a line has to survive anything at all, use
a balloon** — it brings its own white ground.

**Balloons are opaque, always.** They cut in at full opacity with a small scale settle; there is no
fade. A balloon that is see-through for even a few frames is a publishable frame with a translucent
balloon in it (QA caught exactly that at t051), and the reference's balloons are flat opaque white
with a uniform black keyline in every frame they exist.

#### `panels=` — multi-panel split (bible §6.4)
Replaces the scene's whole shot plan with one static split — a split *is* a composition, so it never
re-frames. A cell with no `template` is a flat colour block and **must** then name its own `ground`.

A cell shows its template scaled to **cover** the cell and cropped to it, so it only ever crops what
the cell's own shape forces. A `grid4` cell is exactly half the frame in both axes — the same 16:9
shape — so a grid cell now shows the **whole** composition with nothing cut; `v2` and `diagonal2` cells
are taller than 16:9 and still take a native-scale centre crop, exactly as before. WO-25 changed this
because the old flat native crop cut a figure's head on the `grid4` bottom-left cell (QA, t017) and
threw away three quarters of every cell's picture. A grid cell is denser as a result — t017 measured
82.8% flat fill before and **75.4%** after, still inside the 74–92% band, but a grid4 split of four
already-dense rooms is now the closest this pipeline gets to the low edge.

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

#### `period=` — draw the room without its dated machines (WO-27)

One string, on the scene, beside `template=`. **`period="pre1900"` is the only accepted value**; any
other string RAISES with the scene id at render time rather than silently doing nothing (which would
be the anachronism the flag exists to prevent, discovered in the finished file).

```python
dict(id="t005", template="officeFloor", period="pre1900",
     narration=("Montgomery, Alabama, 1844. A German immigrant named Henry Lehman opened a shop."))
```

| behaviour | detail |
|---|---|
| scope | The scene's ART — the room, and every cell of a `panels=` split. Cards, balloons, the number note and the `foreground=` silhouette are era-free already and are untouched. |
| default | **Off.** A scene without it renders exactly as before; verified by rendering all thirteen templates at native 1280 before and after WO-27 for identical SHA-256. |
| what it changes | Props, never the room. `template=` still names the environment, the composition is unchanged, and the hero, crowd and camera are where they were. |
| what it costs | A little motion: a chalk board does not reprint, an inkstand has no message lamp, a bell does not flash. Measured, period mode's camera lock is equal or HIGHER, never lower. |
| what it does not cost | Density or colour. Every suppression is a substitution at the same footprint; measured, flat fill stays inside the 74–92% band on all thirteen and coloured coverage is at or below the modern room's on twelve of thirteen. |

The per-room effects are tabled in **§8 PERIOD** above. Read that before setting the flag: two rooms
never need it, ten are clean with it, and `broadcastDesk` becomes a press rostrum, which is right for
a hearing and wrong for anything the narration calls a broadcast.

#### `overlay=` — the number note, and the one deliberate deviation from the reference

One dict, `big` plus `sub`. It draws a small flat note low-left over the scene's art: the figure in
handwritten script on white paper with a uniform black keyline and one flat accent rule, its caption
under it. A figure that starts with `$` **counts up** to its value; anything else is set verbatim.

```python
overlay=dict(big="$613 BILLION", sub="IN DEBT — FILED AT 1:45 A.M.")
overlay=dict(big="-$3.9B", sub="THE THIRD QUARTER")      # a loss beat: the accent turns red
overlay=dict(big="30 TO 1", sub="BORROWED AGAINST ITS OWN MONEY")   # non-$: static, verbatim
```

**Read this before you use it. THE REFERENCE DOES NOT DO THIS.** `docs/CRAYON_BIBLE.md` §2 is explicit:
across every captured frame, montage and thumbnail, **no reference frame carries a numeric overlay
card**. Every on-screen number there is one of three things — lettering on a prop inside the scene, a
full-screen text card, or a balloon. The "29–68 numbers per video" figure in §2 is a count of numbers
in the **transcript**, i.e. numbers the narrator *says*, not numbers drawn on the frame.

The note is kept anyway, and WO-25 re-argued it rather than inheriting it: figures reach the renderer
as a scene field with no prop to letter, the count-up is this channel's own signature reveal, and the
alternative — routing every figure to a full-screen card — would put a card every ~35 seconds and
blank the picture at each one, which is a *larger* deviation from the reference's rhythm than the note
is. What WO-25 did change is the scope:

* **The note is a reveal, not a label.** It enters, counts, holds long enough to read, and lifts, over
  about 3.5 seconds — it no longer sits on the frame for the whole scene. Measured on the sample
  episode that is ~4% of all frames, down from ~11.7%. The bible's finding is about a *persistent*
  card, and this is the half of it the renderer can honestly answer.
* **It is dropped, by design, on any scene that already carries `card=`, `bubbles=` or `panels=`.**
  Those are the reference's own carriers for a number; a note on top of one is a second device saying
  the same thing, and on `panels` it covered a quarter of the split (QA, t017). This is documented,
  not silent: if you write both, the note is the one that goes.

**So: prefer the reference's carriers.** Put the figure in the narration and let a `card=` or a
`bubbles=` line carry it on screen where the beat deserves a full frame, and keep `overlay=` for the
beat where a figure genuinely has to land on a picture. Budget **well under one per ten scenes**;
eighteen in a 196-scene episode is the count QA flagged, and about half of those were dates and plain
counts that the narration was already saying out loud.

| key | required | meaning |
|---|---|---|
| `big` | yes | the figure. Must be non-empty or the build raises. Leading `$` = count-up |
| `sub` | no | the caption under it — the unit, the date, the source |

A `$` figure keeps everything after its leading digits **verbatim**, so `"$250K / YR"` shows in full
and never truncates to `"$250"`. A figure that reads as a cost or loss — a leading `-`, a negative
amount, or a word like DEBT / SOLD / BANKRUPT / LOSS in either half — switches the accent from
gain-gold to the loss red automatically; do not try to set a colour.

#### `level=` — still required, no longer drawn
`level` is the pipeline's **structural** chapter marker and must still be set on the first scene of
each chapter. `gen_voice_edge.scene_gap()` reads it to lengthen the pre-chapter silence and
`duck_music.py` keys the chapter-start SFX off it.

**It no longer renders anything.** WO-12a deleted the gold-bar top-left chip: it was Helvetica in a
handwritten-script canon (§7), force-uppercased, carried a `boxShadow`, showed no measured frame's
behaviour, and announced a chapter the chapter *card* now announces properly. Do not write copy for
it — nobody sees the string. The visible chapter name is `card=dict(kind="chapter", …)`.

#### `breath=` — ask for an inhale
`gen_voice_edge.py` prepends a soft synthetic inhale to any scene over **48 words**. At §3a scene
lengths nothing reaches 48, so the automatic breath never fires and the episode synthesises without
one. Set `breath=True` on ~10–15 scenes by hand — chapter openings, the scene after a silence beat, the
first line of a new movement.

### Rotation rules
Never the same template on two adjacent scenes, and **at least two other set-ups between any two uses
of one template** (§3a). Aim for **8 distinct set-ups in 8 evenly spaced samples** and measure it —
that number, not cuts/min, is what a viewer experiences as variety.

**Watch the most-placed room.** A template used ~20 times in a 196-scene episode reads as "the same
picture again" long before the rotation rule is broken, because a room's contents do not change
between placements — only the narration over it does (QA scored this on `officeFloor`). Two fixes,
both writer-side: **place it less** (most over-use is a default, and there is usually a room that fits
the line *better* — "lawyers drafting a filing" is `courtHearing`, "they found out from the news" is
`newsMontage`), and **vary what surrounds it** — a `panels=` split so it arrives as half a frame, a
`foreground=` silhouette, a card or an object showcase on the beat beside it. **Print the histogram
before you stop** and keep it flat: no room much past **~1 use per 10 scenes** (the WO-30 build
measures 21/202 at the top and 8/202 at the bottom, i.e. 1-in-9.6 to 1-in-25.3 — a dated record of
that build, not a target to reproduce). `closeUpPortrait` is the one
licensed to sit at that ceiling — it depicts nowhere, so it is a cut-in rather than a room repeating.

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

What a *writer* needs from those sections: scenes are short and still. A locked camera and one framing
per scene mean a scene's narration must be interesting standing still — there is no push-in to carry a
flat line, and since WO-17 there is no re-crop either. The reference's 4.79s mean shot is a **writing**
instruction, not a rendering one; §3a is where it turns into a scene budget.

## 11. Build discipline

`python3 build.py` syntax-checks `content.py` + `ops/episode_meta.json`, synthesises VO, runs
`gate.py`, and does a 2-frame smoke render (frame 0 and the midpoint). It HALTs rather than shipping
broken. Read the printed `WPM speech / WPM runtime` line every build and compare the **runtime**
figure to the **145–152 target**. That is the target, not the gate: `gate.py` HALTs only outside
**143–154** (`WPM_LO`/`WPM_HI`), deliberately wider than the target because the reference channel's
own per-video spread is 139.2–152.9 and a false HALT blocks publishing outright. An episode at 153 is
a craft note, not a build failure.

## Brand
Channel @corelifecycle. Thumbnail/typography brand rules live in `docs/CRAYON_BIBLE.md` §7 and §9.
