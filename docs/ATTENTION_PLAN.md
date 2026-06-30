# CoreLifecycle — Attention & Thumbnail Plan (research-backed)
Goal: maximize CTR + retention for short attention spans. Make videos best-quality, creative,
accurate. Sources: 2026 thumbnail/retention/title guides (see chat for links).

## The numbers that matter (2026 research)
- **71% decide in the first 3 SECONDS** whether to keep watching; **55% drop within the first minute.**
- A **pattern interrupt in the first 5s = +23% retention**; interrupts/visual changes **every 3-8s**;
  a deliberate **re-hook at the ~40% mark** (where curiosity fades). Interrupts can lift watch time
  up to ~85%.
- **Thumbnails:** <4 words of text = **+30% CTR**; an **expressive face = +20-30% CTR**; high contrast
  (complementary pairs: yellow/violet, blue/orange, red/cyan); **1-2 hero elements** only; text in the
  **upper area** (avoid the timestamp/progress bar); natural > exaggerated expressions.
- **Titles:** curiosity-gap / number / versus / warning formulas push CTR >8% — BUT the algorithm now
  **penalizes click-and-quit** (high CTR + low watch time). The title must be a **promise, not a trick**
  → accuracy + delivery are themselves ranking levers.
- Retention benchmark for our length (10-15 min): **40-50%** is good.

## Problem #1 — thumbnails are IDENTICAL every video (the explicit ask)
Today `Brand.tsx Thumbnail` is one fixed layout (kicker + profession + gold $ + smug figure). Every
video looks the same → no novelty, no testing, capped CTR.

### Build: a THUMBNAIL ARCHETYPE system (rotate + A/B)
5 distinct doodle thumbnail templates, each picked per video by the packager (and 2-3 rendered as
**A/B variants** for YouTube's Test & Compare, which picks the winner by watch-time share):
| archetype | what it shows | when |
|---|---|---|
| **THE NUMBER** | one giant number ($2.4B) + tiny figure dwarfed by it | money-shock topics |
| **THE FACE** | big expressive close-up doodle face + 2-3 words | emotional/relatable angle |
| **THE CLIMB** | "$0 → $209B" with a visual ascending ladder/bars | escalation framing |
| **THE SETTING** | the topic's iconic scene (OR / trading floor / battlefield) + bold word | strong-visual topics |
| **THE QUESTION** | curiosity-gap line ("WHO'S ABOVE THEM?") + a silhouette | mystery/open-loop angle |
Rules baked in: ≤4 words, one bold COLOR POP per archetype (complementary to the paper, e.g. a
crimson or teal block — not always gold), 1-2 hero elements, text upper-third, mobile-legible at
small size, NEVER the same archetype two videos in a row. `episode_meta.json` gains
`thumb.archetype` + `thumb.variants` (the packager/art-director chooses); Root renders the chosen
comp(s); upload sets the primary + (later) submits A/B variants.

## Problem #2 — the first 3 seconds / the hook
- Open on a **3-5s pattern-interrupt cold open**: the BIGGEST number on screen immediately + a spoken
  open-loop question it doesn't answer yet ("$209 billion flows through people you've never heard of.
  This is how you become one.").
- The director should make scene 1 a **fast, punchy ≤8s** beat (not a slow establishing shot), with
  the count-up hitting in the first seconds.
- The on-screen title card + the spoken hook must MATCH the thumbnail/title promise (no bait).

## Problem #3 — retention across 10-14 min (short attention spans)
The director engine already enables this — tighten it:
- **Cut/visual change every 5-8s** (wide→medium→closeup→insert cadence already does this; enforce a
  max shot length ≈8s).
- **Count-up reveals are retention spikes** — space them as the escalation beats (one per level).
- **Re-hook at ~40%**: a 2-3s teaser of the climax ("but the top level isn't even a job…").
- **Audio shift at ~25-35s** + a stinger on each number reveal (ties to the SOUND plan: arc-aware
  music + clean synth stingers + duck under VO).
- Keep episodes **10-11 min** (shorter = higher retention %, and faster/safer local render).

## Problem #4 — titles
Packager rotates proven formulas (curiosity gap, specific number, versus, warning) — e.g.
"Every Level of a Founder — and Who Owns the Last One", "$0 to $209B: Every Level of a Founder".
Always deliverable (no click-and-quit). Store the formula used so the flywheel can learn which wins.

## Problem #5 — accuracy = trust = retention
Fact-check every on-screen number with sources (a wrong/exaggerated number that viewers sense →
click-and-quit → algorithmic penalty). Numbers carry a source+date; a fact-check gate blocks an
unverified headline number. (This is also QUALITY_PLAN #4.)

## The flywheel (close the loop with real behavior)
- Pull **CTR + retention curve** per video (needs the YouTube Analytics API scope — one re-auth).
- **A/B thumbnails** (3 variants) → keep the winning archetype patterns.
- Read the **retention curve**: a steep <30s drop → fix the hook; a dip at 40% → strengthen the re-hook.
- Track which **title formula + thumbnail archetype + hook style** wins → the showrunner doubles down.
- Weekly retro feeds rules into docs/BIBLE.md.

## Build sequence (recommended)
1. **Thumbnail archetype system** (the explicit ask; contained, high-CTR ROI) — 5 templates +
   per-video selection + variety rule; prove with a few rendered examples.
2. **Hook + cold-open** upgrade in the director (3-5s interrupt, biggest number first, re-hook at 40%).
3. **Title formula rotation** in the packager.
4. **Sound stingers + arc music** (QUALITY_PLAN #2) — the audio pattern-interrupts.
5. **Accuracy fact-check gate** (QUALITY_PLAN #4).
6. **Analytics flywheel + A/B** (needs Analytics-API re-auth) once views accrue.
