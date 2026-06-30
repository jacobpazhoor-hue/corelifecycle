# CoreLifecycle — Quality Step-Change Plan
How to make EVERY video significantly better (creativity, accuracy, animation, sound) AND keep
raising the ceiling each time. Honest diagnosis + concrete things to BUILD.

## Where quality actually is now (honest)
- **Writing/creativity** — strong formula ("Every Level of X", escalation spine), but every video is
  the SAME linear shape; one showrunner agent; hooks aren't optimized; few surprising beats. 7/10.
- **Accuracy** — a research doc per topic, hybrid web-verify, flagged estimates. Decent but numbers
  are point-guesses, unaudited, no citations, nothing blocks a wrong number. 6.5/10.
- **Animation/visuals** — THE weakest link. Simple stick figures, a small pose set
  (stand/sit/walk/type/sign/lookUp), mostly-static SVG backdrops, one framing per scene, motion =
  a camera push + minor prop wiggle. It reads, but it looks basic and samey. 5/10.
- **Sound** — edge-TTS + a good mastering chain, but ONE numpy drone for the whole 12 min (now only
  seeded per topic) at a fixed volume; monotone VO; no SFX, no arc, no ducking. 6/10.
- **The "better each time" engine** — we have a reviewer + improvements.json, but it's self-critique
  only, not scored over time, not analytics-driven, learnings aren't codified. 6/10.

Biggest perceived-quality levers, in order: **ANIMATION/DIRECTION > SOUND > CREATIVITY > ACCURACY.**

## The keystone to CREATE: a Production Spec (storyboard JSON)
Today content.py couples the script to a single template per scene — that ceiling-caps every craft.
Replace it with one rich intermediate artifact, `ops/production_spec.json`, per video. Each BEAT:
```
{ id, level, narration, emotion,            // writers' room fills these (+ sources)
  shots: [ {type:"wide|medium|closeup|insert", dur, staging:{backdrop,props,figures:[{pose,action,expr,pos}]}} ],
  numberFx: {value, from, label, style:"countup|bar|compare"},   // the signature money reveal
  musicCue: {section:"intro|build|turn|climax|resolve", intensity:0-1},
  sources: ["MGMA 2024 ...","..."] }
```
Why this is the unlock: every department can now improve INDEPENDENTLY (writers fill narration/
emotion/sources; the director fills shots/staging/numberFx; the composer reads musicCue; the
reviewer critiques each field; the gate checks sources). It also enables MULTI-SHOT editing — the
single biggest visual upgrade. content.py becomes a thin generator of this spec; Video.tsx renders
shots (not one-framing scenes).

---
## 1. ANIMATION / DIRECTION ENGINE (biggest lift, 100% free, in-doodle)
We will NOT switch to AI imagery (you chose doodle; AI = cost + style drift). Instead push the
doodle engine to a premium "motion-graphics explainer" look:
- **Multi-shot staging + cuts** — a beat becomes 2-4 shots (wide establish → medium → CLOSE-UP on
  the face at the emotional turn → INSERT on the number/prop). Real editing rhythm; the #1 upgrade.
- **A "Director" pass** — turns each beat's emotion + content into a varied shot list (angle, scale,
  duration) so no two scenes feel framed the same. Codifies cinematography rules.
- **Acting library** — expand poses/gestures: head turns, reactions, weight shifts, two-character
  interaction, idle variation, hand props (scalpel, phone, pen). Figures ACT, not just stand.
- **Motion-graphics number reveals** — the money number COUNTS UP / a bar climbs / "vs" comparisons.
  This is the channel's signature moment; make it satisfying (your `number-motion` backlog item).
- **Living backdrops** — multi-plane parallax + foreground occluders + ambient life (background
  figures working, vehicles, equipment moving) so scenes feel alive, not static line art.
- **Transitions** — match-cuts / clean wipes between beats instead of hard cuts/fades only.
- Validate via the StageTest contact-sheet + qa_watch on the real render.

## 2. SOUND DESIGN (free, numpy + edge-TTS)
- **Arc-aware sectional music** — make_ambient reads musicCue and composes the bed in SECTIONS that
  follow the story: sparse intro → rising tension per level → a shift at the moral turn → resolve.
  Not one 12-min drone.
- **Mood/motif library** — per-topic + per-section motifs (already seeded; add real variation).
- **Tasteful synth stingers** — a clean musical swell/hit on each number reveal + transitions
  (numpy-synthesized tones, NOT noise — we learned noise = "staticy" and is banned).
- **Mix** — duck music under VO (sidechain), swell in the gaps, crossfade sections.
- **VO prosody** — edge-TTS supports per-segment rate/pitch/volume; drive it from `emotion` so heavy
  lines slow + drop, hooks punch. Kills the monotone. Stays 100% free.

## 3. CREATIVITY / WRITERS' ROOM (multi-stage script)
Replace the single showrunner with a small writers' room (headless claude --print stages):
- **Researcher** → facts + the comp ladder (feeds accuracy).
- **Story architect** → picks a NARRATIVE SHAPE from a library (the ladder, the fall, the gatekeeper,
  the system-above) for variety; sets the emotional arc + open-loop/payoff.
- **Hook lab** → generate 5 cold opens, score (curiosity gap, specificity, stakes), keep the best.
- **Line editor** → punchy visceral second-person prose; cut filler; vary sentence rhythm.
- Output: the narration + emotion fields of the production spec.

## 4. ACCURACY SYSTEM (trust)
- **Fact-check agent** (web) — verifies every on-screen number + claim, attaches `sources`, and
  HARD-GATES the build if a headline number is unverified or contradicted.
- **Numbers with ranges + dates + source** (e.g., "$475K median, MGMA 2024") not point guesses.
- **Claims ledger** per video → auditable, improves over time.

## 5. THE QUALITY FLYWHEEL (better each time, for real)
- **Scorecard over time** — reviewer scores 6 axes (creativity/accuracy/animation/sound/pacing/hook)
  → ops/scorecard.json trend. The system TARGETS THE WEAKEST AXIS on the next video.
- **Codify learnings** — reviewer fixes that recur get promoted into docs/BIBLE.md rules so mistakes
  don't repeat.
- **Analytics-driven** (once views accrue) — CTR/retention (needs Analytics-API re-auth) feeds the
  hook lab + thumbnail/title A/B; double down on what actually retains.
- **Weekly studio retro agent** — reviews last N videos + scores + analytics → proposes BIBLE/system
  changes → improvements.json.

---
## Sequencing (recommended)
1. **Production spec + Direction/Animation engine** (#1) — biggest visible jump. Prove it on ONE
   video (a "vertical slice") before wiring nightly.
2. **Sound design** (#2) — arc-aware music + stingers + prosody + ducking.
3. **Writers' room + Hook lab** (#3) — richer, more varied, more gripping scripts.
4. **Accuracy system** (#4) — fact-check gate + citations.
5. **Quality flywheel** (#5) — scorecard + weakest-axis targeting + retro; runs continuously.

## Constraints to respect
Free-only (edge-TTS + numpy + doodle; no paid AI imagery/voice unless you opt in); M2/8GB local
(Modal capped this cycle → local render); headless-reliable (every new step must run unattended,
gate-protected, and never block the nightly publish). Each upgrade lands behind the existing gate +
reviewer so a bad change HALTs instead of shipping.
