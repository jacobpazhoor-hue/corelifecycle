# CoreLifecycle Production Bible (the canon — every video obeys this)

## Concept  (POV immersion — the MasterPOVs model)
**"Your Life as a [X] at Every Level / at Every Rank"** — the viewer LIVES the climb in first-hand
POV. Not a documentary ABOUT a job; a STORY where YOU are the person, rising rank by rank from the
bottom to the anonymous people at the top. Money + power + moral erosion, but felt PERSONALLY.
Topics are dramatic / exotic / high-stakes (crime, war, empire, espionage, wealth, power, danger),
not just white-collar careers — that is where the curiosity + clicks live.

## Voice & audio  (tuned for short attention spans — see docs/bibles/ENGAGEMENT_PLAN.md)
- Engine: **edge-tts `en-US-AndrewMultilingualNeural`**. **RATE `+8%`** (~190 WPM — faster/energetic;
  Andrew's default is already brisk ~174; hard stop +15%). **GAP `0.25s`** after each scene (was 0.5 —
  cutting dead air is the biggest "feels fast" lever), with a per-scene `gap=0.7` override ONLY on
  dramatic reveal/cliffhanger beats. **LEAD `0.1s`**. Each clip is **silence-trimmed** (breaths/tails).
- ALWAYS run through the **mastering chain** in gen_voice_edge.py `master()`: 48kHz upsample,
  HP 85Hz, de-mud 320Hz, presence shelf ~3.2k, de-ess 7.2k, gentle harmonic exciter (air),
  soft compression, normalize 0.97. Crisp + clear, never staticy. Final mix is loudnorm'd to −14 LUFS
  (audio_master.py) with music ducked under VO + transient SFX on cuts (duck_music.py).

## Script (writer) — POV STORYTELLING (study docs/MASTERPOVS_ANALYSIS.md + docs/bibles/QUALITY_MAX_PLAN.md §2.1)
RETENTION IS THE METRIC. North-star: hold **≥78% of viewers at 0:30**, **45–55% average-percent-viewed**
across the full run (the viral bar for 12-min videos). The first 30s + the level transitions are where
the graph bleeds — that's where the craft goes. >55% of viewers leave in minute one.
- **≥11 minutes** runtime (~12-13 ideal). ~3-4 scenes per level (~28-34 scenes), ~2200-2600 words.
  Scenes ~60–85 words (one idea each). Gate HALTS if < routine.minMinutes.
- **WRITE IN SECOND-PERSON, PRESENT-TENSE POV — the viewer IS the character, living it.**
- **THE STORY SKELETON (Harmon story-circle mapped onto the rank ladder):**
  1. **COLD OPEN** (first ~15s): in medias res at the most dangerous/highest-status moment of the
     WHOLE arc, then cut away before it resolves. No logo, no intro, no "in this video." This is the
     master open loop the ending pays off.
  2. **PROMISE + COST-LINE**: state the through-line the ending answers ("You want this. You don't
     know yet what it costs.").
  3. **LEVEL 1 — comfort + want**: concrete sensory lack (an exact object/number, not "poor"), a
     named want, a named person. CARE inside 60s.
  4. **LEVELS 2–6 — adapt + escalate**: each level a mini story-circle (new world → task →
     complication → promotion → hook into next rank); each raises danger, status, OR moral cost.
  5. **MIDPOINT REVERSAL (~50%)**: betrayal / death / the real cost revealed — the biggest completion
     lever. The thing you wanted starts to rot.
  6. **LEVELS 7–8 — get it, at cost**: deliver the fantasy, undercut it, resolve the cold-open loop.
  7. **LOOP CLOSE**: end on what victory COST; bend the last image back to the opening (cyclical,
     rewatchable). Never a triumphant ending.
- **CAUSALITY — but/therefore, never "and then."** Every level/beat connects by complication (but) or
  consequence (therefore). If "and then" fits between two beats, rewrite one.
- **PACING**: pattern-interrupt every 30–45s (new template/tone/threat — hence no adjacent-template
  repeats); re-hook (open a fresh loop) at the end of every level.
- **POV sentence craft (hard rules):**
  - Present tense always. Short, declarative, ONE idea per line — staccato; average <15 words, with
    2–4 word punches at peaks.
  - Break "you…you…you" drone with the **IMPERATIVE** ("Don't look back. Count the doors.").
  - **Body-based dread — state the FACT, not the feeling** ("Your hands are steady. That's what
    scares you."), never "you feel scared."
  - **SPECIFICITY over abstraction** ("Forty-two hundred in a cereal box," not "good money").
  - **Anaphora** at theme moments ("Money buys medicine. Money buys safety. Money buys a way out.").
  - One **share-worthy** "wait — that's real?" beat (shocking true fact/number; shares ≈ 5–8× likes).
- **A NAMED MENTOR / rival** introduced early — attach to them, set up a betrayal/loss payoff.
- **Escalation spine**: each level's number bigger; power widens; morality erodes
  (earnest → exhausted → hardened → hollow). Numbers serve the STORY (woven into POV, never listed).

## Visuals (art-director)
- Character: clean **white stick figure** with an expressive face (eyes/brows/mouth, blink,
  idle eye motion). Face always front (both eyes). Limbs originate from spine (no detachment).
- **Expression arc** across levels: earnest → exhausted → focused → conflicted → hardened →
  hollow/smug. Blend expressions mid-scene at pivotal beats.
- **SCENE VARIETY IS MANDATORY:** no two adjacent scenes share the same background template.
  Rotate archetypes (desk/laptop · file wall · tower · boardroom · window · dinner · atrium ·
  street/walk · jet · revolving-door · war-room/globe · empty-chair · lobby). Each scene needs
  distinct, engaging imagery + motion (camera push-in, rain, screens, steam, car-lights, motes).
- Props sit IN FRONT of the figure (laptop/document drawn after figure; hands hidden behind) —
  avoids hand/prop misalignment.
- Palette: hand-drawn DOODLE (ink #2a2620 on warm paper) but **MOODIER + more cinematic** than bright
  white — slightly desaturated, dim, lamp-glow warmth, stronger edge vignette (MasterPOVs is muted +
  atmospheric, never flat-bright). Gold accent (#e8b54b) for money/levels; occasional bold color pop.
- Director engine (Video2/director.tsx): every scene = multi-shot (wide → medium → CLOSE-UP on the
  face at the emotional beat → INSERT), money COUNTS UP. Keep this — it's an edge MasterPOVs lacks.
  Camera is an EXPO-OUT dolly push (per shot type); count-up pops via spring; text entrances are
  staggered (Phase 3).
- **Per-level COLOR DRAMATURGY (Phase 4, automatic):** Video2 derives a `levelProgress` (0→1) from the
  LEVEL labels and grades each scene warm→cool→ember→rich-gold as the climb rises (CSS-only tint +
  darkening + bloom + saturation lift; NO SVG filters → render-safe). The writer doesn't set colors —
  just label each level ("LEVEL 0N · …") and the grade escalates itself. Keep warm-paper noir as the
  baseline (level 1); the world cools, then darkens toward the apex.
- Overlays: level label top-left; big number bottom-left (the escalation), gold sub-caption.

## Packaging (packager) — see PACKAGING_PLAYBOOK.md + QUALITY_MAX_PLAN.md §2.2 (title ≈50% of CTR,
   thumbnail ≈50%; target browse/suggested CTR 6–8%+).
- Title (second-person POV): **`Your Life as a [X] at Every Level`** + a **stakes PARENTHETICAL**
  ("(Most Die at Level 4)", "(You Won't Survive Level 7)") — parens lift CTR ~15–20%. **40–65 chars**,
  hook front-loaded in the first ~40. NEVER the generic word "Architect."
- Description: hook (first 150 chars, second-person) → keyword paragraph → AUTO chapters → a BINGE/next
  tease ("Watch the whole series — every life, every level") → CTA → hashtags → disclaimer.
- Thumbnail (MasterPOVs formula): a bold HERO figure (≥40% of frame, ONE focal point) + a provocative
  caption with the KEY WORD in RED + a hand-drawn **curved arrow** text → figure.
  - **SYNERGY RULE: thumbnail SHOWS, title TELLS — never the same words.** Title "Spy" → thumbnail
    keyword is a DIFFERENT tension (BURNED / TRAITOR / LEVEL 9 / DON'T RUN), never "SPY."
  - **EMOTION is the #1 CTR lever and we have no real faces** → push the doodle expression HARDER than
    a real face could (expr "shock" = huge eyes/open mouth/sweat = face-of-fear). Up to ~30% CTR.
  - **Premium doodle finish:** metallic gold pills (`#tgold` gradient, not flat yellow), heroes lifted
    off the page with a drop-shadow (`#tdrop`), heavy hero outline / figure-ground depth.
  - ≤3 words; high contrast (reserve saturated red + gold as accent-only against muted paper); rotate
    the archetype every video (thumbs.tsx: pov/ladder/beforeafter/number/face/question/setting/climb —
    FAVOR pov/number/ladder/question, climb rare); mobile-readable at 120px.
  - A/B via YouTube Studio Test & Compare (UI-only; pick meaningfully different formulas, not near-dupes).

## Engagement — see ENGAGEMENT_RESEARCH.md.  Quality gate — gate.py (HALT on fail, never publish broken).
## Brand: channel @corelifecycle, bars logo + bars banner, gold accent.
