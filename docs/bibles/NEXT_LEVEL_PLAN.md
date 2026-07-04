# NEXT_LEVEL_PLAN — CoreLifecycle Evolution Master Plan (2026-07-04)

**Written by:** Fable 5 (research synthesis from 4 parallel deep-research streams, all sources live-verified 2026-07-04)
**Written for:** the executing model (Opus/Sonnet interactive sessions). Execute phase-by-phase, validate each phase before the next, commit per phase. This plan is ADDITIVE to what already shipped — do not redo QUALITY_MAX_PLAN Phases 1-5 or the 2026-06-30 engagement pass (voice +8%/gap .25/trim, shot cap 240f, sway, intrigue thumbnails, 4-stop grade — all live).

---

## 0. STRATEGIC VERDICT (read first — this frames every choice below)

**Stay in the niche. Do NOT pivot styles. Get richer, not different.**

The live competitive data says our exact position is correct and the ceiling is high:
- **Hypothetically (@HypotheticallyHQ): 306K subs, 34 videos, hits of 2.1M–5.3M — and it's a DOODLE STICK-FIGURE character in painted environments.** The niche's ceiling channel uses our style, executed richer. The stick figure reads as "you = blank avatar" — it's a feature.
- MasterPOVs: 57.8K subs in 6 months, daily, accelerating. The Life Outline: 89K in 6 months from just 15 videos (crime ladders). The niche is hot AND being carpet-bombed by 2026 startups — differentiation comes from CRAFT (animation/sound/story), which none of the volume players invest in.
- Mega-virals cluster at **10–17 min** (6.1M @ 10:01, 5.3M @ 16:27, 2.79M @ 10:29). Our 11–13 min target is exactly in the pocket. Do not stretch to 25+ like MasterPOVs (watch-hours play, lower viral ceiling).
- **Nobody in the niche does real motion.** Every competitor is stills/slideshows with pans. A genuinely ANIMATED doodle video (Phase 1) is a visible moat no volume channel can copy by hand.

**The play:** keep `Your Life as a [X] at Every Level` as the spine; add two proven adjacent title formats (Phase 4) that reuse the whole engine; upgrade animation + sound + story craft to Hypothetically-level richness; run the growth ops the data validates (Phase 5).

**Hard constraints (unchanged):** 100% FREE. Crime topics = cautionary dramatized POV, never how-to. Secrets stay local. RENDER BUDGET: cloud shards are CPU-only — every new visual must be `transform`/`opacity` math (NO per-frame SVG filters, NO @remotion/motion-blur Trail/CameraMotionBlur, no huge per-frame blurs). If the shard render step in a cloud run approaches ~45 min, lower the `/1250` divisor in `.github/workflows/render.yml` plan step (more, smaller shards).

---

## PHASE 1 — ANIMATION ENGINE 2.0 (`src/anim.ts` new + `figure.tsx` + `director.tsx` + `stage.tsx`)
*The moat. Everything below is pure transform math — render-cheap, validated technique-by-technique.*

Create **`src/anim.ts`** — a shared animation library. Then wire it into the components. Implement in this order (impact-per-effort, per research):

### 1.1 Secondary-motion lag (the single biggest "alive" win)
Re-evaluate the same spring/curve with per-part frame delays: head lags body 2–3f, arms 3–5f, held props 4–6f. `spring({frame: frame - delay, fps, config})`. Apply to EVERY figure pose change in `figure.tsx`.

### 1.2 Anticipation + overshoot everywhere
- Anticipation: move 10–20% OPPOSITE for 15–25% of the action duration before any major move: `interpolate(f, [0, 6, 18], [0, -15, 100])`.
- Overshoot vocabulary (mass=1): lively gesture `{stiffness:170, damping:15}` (one overshoot); bouncy cartoon `{stiffness:300, damping:10}`; heavy object `{mass:3, stiffness:80, damping:14}`; no-bounce `{damping:200}`. Put these in `anim.ts` as named presets (`GESTURE`, `CARTOON`, `HEAVY`, `SNAP`).
- Volume-preserving squash & stretch: `scaleY = 1+s; scaleX = 1/(1+s)`, transform-origin at feet. Landing: s=-0.25 for 3–4f; jump: squash s=-0.15 (~6f) then stretch s=+0.2.

### 1.3 Idle system — nothing on screen is EVER frozen (Kurzgesagt rule)
In `figure.tsx`, layered and always-on:
- Breathing: chest `scaleY: 1 + 0.02*sin(2π*f/(fps*3.5))` (~17 breaths/min).
- Blink: every 2–6s seeded-random per character; close 2f, open 3f, occasional double-blink (exists partially — verify and enrich).
- Weight shift: hips `translateX: 2*sin(2π*f/(fps*7))`.
- Gaze saccades: retarget look every 1.5–4s with `{stiffness:250, damping:22}`; head follows at 30% amplitude, 3f later.

### 1.4 Arcs — kill robotic straight-line movement
Never lerp positions linearly. Route hand/head/prop moves through a quadratic bezier, control point offset perpendicular to the chord by 15–30% of chord length. Add `arcLerp(from, to, t, bend)` to `anim.ts`.

### 1.5 Pre-baked boil (hand-drawn wobble) — the "drawn by hand" feel, render-cheap
Do NOT animate SVG filters. Pre-generate **2–3 seeded variants** of stroke paths (jitter vertices with seeded noise, or rough.js `seed:1|2|3`) and cycle at 5fps: `variant = Math.floor(f/(fps/5)) % 3` — true "shooting on threes," costs an array index. Start with the figure's ink outline + key props. (rough.js ~9kB, memoize by (shape, seed); optional `perfect-freehand` for tapered strokes.)

### 1.6 Impact language: hit-stop, impact frames, smears
- **Hit-stop:** freeze BOTH parties 2–3f on any contact/slam/reveal-thud. Free and transformative (Alan Becker technique).
- **Impact frame:** 1–2 frame full-screen inversion (paper→ink, ink→paper outlines) on the episode's 2–3 biggest hits only.
- **Smears:** on fast limb/prop moves, 1–2 frames of 2–3 ghost copies at previous positions (40/20% opacity) OR stretch the limb into a capsule along the motion vector. This REPLACES motion blur (which is banned on CPU).
- **Screen shake:** `noise2D` from `@remotion/noise` (pure JS), `amp = A*e^(-f/6)`, A=12px impacts / 3px rumbles, +1–2° rotation noise. Never `Math.random()`.

### 1.7 Camera language 2.0 (`director.tsx`)
- Keep the EXPO push-in on every held shot (exists) but add: **whip-pan cuts** (6–8f huge-velocity translateX + pre-baked streak overlay, cut mid-whip, next scene whips in same direction) between levels; **dolly-zoom** (cam scale 1→1.3 while BG layer scales 1→0.85) on the midpoint reversal ONLY; **speed ramp** util `rampTime(f, [0,10,14,30],[0,4,26,40])` for slow-in/burst/slow-out around impacts.
- Every camera move gets a whoosh (Phase 2 wires audio).

### 1.8 Parallax + foreground occluders (`stage.tsx`)
3 layers: BG texture ×0.2, midground props ×0.6, characters ×1.0 — plus a **foreground occluder** (oversized soft ink blob / shelf edge / passerby silhouette at ×1.4, 30–60% opacity) drifting through during camera moves. Add per-template occluder hooks; retrofit the 5 most-used templates first.

### 1.9 Walk cycles + two-bone IK (`figure.tsx`) — do LAST, biggest lift
- Sine locomotion: φ=2π·f·(steps/s)/fps; hipY = A·sin(2φ) (A≈3–6px); thighL = swing·sin(φ), thighR = sin(φ+π) (25–35° walk); shin = bend·max(0,sin(φ+0.5)); arms counter-phase; torso lean 5°; head bob = 0.5·hipY delayed 2f. Multiply one side ×1.07 (asymmetry reads hand-made).
- Analytic 2-bone IK for reaches (law of cosines, clamp to [|L1−L2|, L1+L2], Ryan Juckett method); drive the IK target with a GESTURE spring.
- New template verbs: walk-in entrances, handoff reaches, desk-slam, collapse-into-chair.

### 1.10 Cutaway gags (Sam O'Nella technique) — optional, high-charm
`<CutawayGag>` component: white flash in → absurd literal illustration of a spoken phrase + figure reaction → snap back (~45f). Writer triggers it via a scene-dict field `cutaway="..."`. 1–3 per episode max.

**Phase 1 validation:** `python3 build.py` green → `npx remotion still` 6 spot frames (idle, walk, hit-stop, smear, occluder, whip-pan mid-frame) → 300-frame segment render locally at concurrency 2 → **time one cloud shard before/after** (compare render-step minutes in Actions) — if shard time grows >40%, drop divisor 1250→900. Update BIBLE.md Visuals section + TEMPLATES.md verbs.

---

## PHASE 2 — SOUND DESIGN 2.0 (`duck_music.py` + new `sfx_place.py` + `gen_voice_edge.py`)
*After the script, audio is the #1 amateur-vs-pro tell. Concrete mix numbers throughout.*

### 2.1 SFX source — DONE (2026-07-04): built PROCEDURALLY in `sfx_lib.py`, not downloaded
Decision during execution: instead of downloading CC0 sample files, `sfx_lib.py` SYNTHESISES every
SFX + ambience in numpy — 100% free, deterministic, zero-dependency, identical on the cloud shards
(no fetch step / committed binaries), copyright-bulletproof, and consistent with make_ambient/
duck_music. If a future session wants richer *real* samples: Sonniss #GameAudioGDC (royalty-free,
monetized-YT OK), Kenney.nl / Pixabay / freesound-CC0 — but the procedural route is preferred here.

### 2.2 SFX placement engine (replace synthesized whoosh/boom in `duck_music.py` with placed samples)
Rules: every camera move = whoosh (peak 1–2f BEFORE visual impact); every contact/slam = thud synced to hit-stop; every overlay pop-in = soft foley pop; level-card reveal = signature "stamp" sound (brand). Music ducks −6dB under SFX hits.

### 2.3 Diegetic beds per level + music act-switching
- Each LEVEL gets a quiet diegetic bed (rain / office hum / casino floor / cell block / street) at −50 to −60 dB under the voice — kills the "TTS floating in digital void" tell. Source CC0 ambiences (freesound).
- Music: **change track/key at every act break** (levels 1→2 cluster, midpoint, final act). Extend `make_ambient.py` to render 3–4 sections in different keys/BPM (60–80 BPM reflective, 100–120 builds) instead of one loop. Mix: music −20 to −25 dB under voice in narrative, −8 to −12 dB in action beats.
- **One full-silence beat per episode:** strip music+SFX entirely for ~1.5s before the midpoint-reversal line (silence is the strongest emphasis tool). Heartbeat+riser at the climax ONLY (once).

### 2.4 TTS humanization (`gen_voice_edge.py` master())
- Add **breath samples** (CC0, ~-30dB) before long sentences (brains flag breathlessness as synthetic ~90s in).
- Cut nasal **2–4 kHz** by ~2–3dB in the EQ chain (add to the existing FFT gains).
- Per-scene prosody: scene dict may set `rate="-10%"` (gravity moments) or `+12%` (action) — pass through to edge-tts per call.
- Room tone: the diegetic beds (2.3) serve this; ensure something is always under the voice.

### 2.5 Second voice — in-world dialogue (the pattern-interrupt + anti-"templated" differentiator)
- New scene-dict field `dialogue={speaker:"mentor", text:"...", voice:"en-US-GuyNeural"}` — rendered as a SEPARATE edge-tts call with different EQ (band-pass narrower + slight tight reverb) so it sits "in the world" vs the dry narrator. 2–4 short lines per episode (mentor's warning, rival's taunt). gen_voice concatenates into the scene wav.
- This also structurally varies episodes — YPP's July-2025 "inauthentic/templated" policy targets variable-swapped template scripts; dialogue + varied structure is our compliance moat.

**Phase 2 validation:** build → listen QA via qa_audio/faster-whisper still green → check LUFS via audio_master 2-pass numbers → render a 60s segment with an act-break music switch + silence beat and listen. Update BIBLE.md Voice & audio.

---

## PHASE 3 — STORY 2.0 (`docs/AUTOPILOT_PROMPT.txt` + `docs/BIBLE.md` + `content.py` schema)
*Current skeleton (cold open, promise+cost, mini-circles, midpoint, loop close) stays. Add:*

### 3.1 Minute-3 re-engagement (MrBeast rule)
At ~2:30–3:30 place the FIRST full spectacle/reversal of act one — not a tease, a delivered jaw-drop (the biggest number, the first betrayal, the first kill). The leaked-doc finding: minute 1 sells the watch; minute 3 re-buys it.

### 3.2 Promise→payoff ledger (retention integrity)
Writer must list, in a comment atop content.py, every open loop with the scene id where it pays off. The reviewer (REVIEW_PROMPT) verifies: NO loop unresolved except ONE deliberate universe-thread (3.6). Broken promises create the mid-video cliff the algorithm punishes.

### 3.3 POV craft upgrades (hard rules → AUTOPILOT_PROMPT)
- **BAN perception filters**: never "you see/you notice/you feel" — describe the world directly; the "you" is assumed (DM-craft finding: filters push the viewer OUT).
- **2–3 senses per scene**, favoring sound/smell as the second impression.
- Emotions are NEVER asserted ("you feel terrified") — state the fact that implies it ("Your hands are steady. That's the part that scares you." — already canon; enforce harder).
- **Sensory anchor motif**: each episode picks ONE recurring physical sensation/object (the ring, the smell of gun oil, the weight of the envelope) that re-triggers at each level-up — an NLP-anchoring callback engine. Add `anchor` note to research doc + writer step.

### 3.4 Dialogue beats (with Phase 2.5)
2–4 in-world lines max, placed at: the mentor's first warning (act 1), the rival/betrayal beat (midpoint), the last line before loop-close. Dialogue = pattern interrupt; sparse is the craft.

### 3.5 Structural variation between episodes (YPP compliance + freshness)
Rotate at least one structural choice per episode: cold-open type (mid-action / aftermath / flash-forward), act-2 shape (rise-fall vs fall-rise), ending (cyclical vs door-left-open). AUTOPILOT_PROMPT gets a "never produce two consecutive episodes with identical structure" rule.

### 3.6 Shared universe (binge/session engine)
- Recurring background elements across episodes: the same bar, the same fixer/lawyer character (voiced by the second TTS voice), a recurring object. One 5-second cold-open cross-reference to a prior episode when natural.
- Each episode resolves its OWN loop but plants exactly one unresolved universe thread.
- Session contribution is the top 2026 long-form signal — serialization is mechanically favored.

**Phase 3 validation:** produce one full episode with the new prompt; reviewer verdict ≥ approve; runtime still 11–13 min; WPM ~190.

---

## PHASE 4 — FORMAT EXTENSIONS (title spines that reuse the WHOLE engine)
*Same pipeline, same visuals, new demand pools. Add to `ops/topic_queue.json` with a `format` field; writer maps format→structure.*

1. **Scenario POV one-offs** — `POV: You're a Trillionaire` (2.1M), `What It's Like to Be a Black Market Surgeon` (5.3M), `You Wake Up in the Year 2526` (344K — all Hypothetically). Levels → escalating days/decisions. Widens topics 10× beyond careers.
2. **Survival ladders** — `Could You Survive [X]?` (Survive History 334–419K/video; zombie Day 1 770K; ocean-survival 7.7M). Level cards → `HOUR 1 / DAY 3 / WEEK 2` cards. Question-title CTR machine. Trivial engine change (level label strings).
3. **Historical empire POV** — proven outliers on MasterPOVs (Aztec 53K vs ~10K baseline; North Korea 211K; Medieval 74K) + Sleepless Historian (702K) proves bottomless second-person history appetite. Already in our queue DNA — weight it UP.
4. *(Later / opt-in)* fiction-fandom ranks (Viltrumite 2.4M, Clone Trooper 544K) — IP-adjacent art risk; only with original designs. *(Later)* compilation megacuts (POVrank 1.5–1.8h Part 1/2 recuts) — zero-marginal-cost watch hours once we have 20+ episodes; pure ffmpeg concat op.

### Topic queue refresh (demand-proven, each cite = the video that proves it)
Crime ladders: Mexican cartel (6.1M TheLifeOutline), Italian mafia (2.79M Hypothetically), Bratva (621K), Triad (247K), hitman (73K MPOV), prison informant, prison escape, smuggler, yakuza.
Military/agency: Special Forces (674K MPOV — their #1), spy/CIA, FBI undercover, MI6/DEA org ladders.
Wealth/status abstract: Fame (446K MPOV #2), Trillionaire scenario (2.1M), lottery levels, inheriting $100M, diamond dealer, music industry, BigLaw (96K POVBiz).
History: Roman legion, Aztec, Ottoman, Mongol, samurai (Life By Rank), Somali pirate (1aZ7...), medieval kingdom, North Korea (211K).
Survival scenarios: zombie day 1 (770K), lost at sea (7.7M nick kratka), dinosaur era, Alcatraz escape.
**Selection rule:** topic ≈ 60–80% of variance (MasterPOVs 14.7× spread same-channel). Pick from proven list; 1-in-4 slots may be an original swing.

---

## PHASE 5 — GROWTH OPS (`ops/routine.json` + process; mostly configuration, some user actions)

1. **Cadence** *(recommend to user — their call)*: data says 1–3 longs/week out-earns daily per-video (18K-channel AIR study; notification cap 3/day; MasterPOVs' 87 videos ≈ 4/wk average). RECOMMEND: **4 longs/week** (Mon/Wed/Fri/Sun launchd calendar) + **2–3 Shorts/week**, reinvesting freed compute in Phase 1–3 quality. Keep daily only if the user prefers volume lottery tickets.
2. **Shorts funnel**: every Short = a same-universe cliffhanger scene cut from a long, WITH the related-video link set (25–40% Shorts share is the sweet spot; ~5% link CTR is healthy; funnel channels report 25–40% higher long-form discovery).
3. **Test & Compare on EVERY upload**: 3 thumbnails AND 3 titles (2025 feature; winner by watch-time share, ~2 weeks). Autopilot already renders ThumbAll variants — export the top-3 as the test set. *(Upload API may not support T&C — user does this in Studio; add to a `docs/WEEKLY_OPS.md` checklist.)*
4. **Retro-packaging rule**: any video with high impressions + CTR <3% after 14 days gets a new thumbnail/title from a different archetype (Vevo evidence: revives old videos).
5. **Community flywheel**: pin a DEBATE question per video ("Would you have taken the deal at Level 4?" — challenge-pins got +37% replies); reply/heart hard in the first 6–12h; weekly community POLL = "which life next?" (1.5–6×
 engagement; doubles as free topic validation).
6. **Binge design**: series playlists (Crime Ladders / Empires / Survival); end screen = the ONE video ≥70% would want next + scripted last-20s handoff line ("your next level →"); end-screen clickers watch 2× longer sessions.
7. *(Later, ≥20K subs)* sister-channel collab-credit seeding (the MasterPOVs×Fletch play) and localization (LOCALIZATION_PLAN.md already exists).

---

## PHASE 6 — MEASUREMENT LOOP (`ops/analytics.json` + REVIEW)
- KPIs: **≥70% retention @0:30 · 40–55% APV (50%+ = 3× recommendation odds) · CTR 4–8% · session: end-screen CTR ≥5.5%**. A +10pt retention ≈ +25% impressions.
- After each publish: log topic/format/archetype/structure-variant into analytics.json; the writer favors patterns of top performers once real view data exists (already in AUTOPILOT_PROMPT — keep feeding it).
- Retention-graph review (user exports or Studio screenshots): find the biggest cliff, map it to scene id, write the fix into `ops/improvements.json`.

---

## EXECUTION ORDER & FILE MAP
| # | Phase | Files | Est. sessions |
|---|-------|-------|----|
| 1 | **✅ DONE 2026-07-04** — Sound 2.0 (sfx_lib.py synths, 3-act score, per-level diegetic beds, placed SFX, silence beat, climax heartbeat, TTS nasal-cut/breath/per-scene-rate). Validated gate PASS + true mix peak 0.994 (no clip) + build green. Commit 883ff42. | sfx_lib.py (new), duck_music.py, make_ambient.py, gen_voice_edge.py, BIBLE.md | done |
| 2 | **✅ DONE 2026-07-04** — Anim core: src/anim.ts (full util lib: noise, spring presets+step, arcLerp, squash, anticipate/overshoot, idle, shake, transform-boil, hitStop) + wired universal idle (breath+head-lag, double-blink, noise-gaze, boil wobble) into figure.tsx/actions.ts + organic handheld camera in director.tsx. Validated no cost regression, gate PASS. Commit cee45cd. **Still TODO from Phase 1** (need scene-event plumbing → fold into phases 4/7): springs on entrances, arcs on gestures, IK reaches, walk-cycle overhaul, hit-stop/impact-frames/smears on real impact events, parallax/occluders (1.7–1.9), cutaway gags (1.10). anim.ts already exports the utilities for all of these. | src/anim.ts (new), figure.tsx, actions.ts, director.tsx | done |
| 3 | **✅ DONE 2026-07-04** — Story 2.0: 2nd-voice dialogue (gen_voice DIALOGUE_VOICE + master_dialogue + scene `dialogue` field, validated) + prompt/BIBLE/reviewer upgrades (minute-3 re-engagement, silence-before-reversal gap=1.4, ban perception filters, sensory-anchor motif, dialogue beats, shared universe, structural variation, promise→payoff ledger). Applies to next writer run. Commit f599930. | gen_voice_edge.py, AUTOPILOT_PROMPT.txt, BIBLE.md, REVIEW_PROMPT.txt | done |
| 4 | Anim 1.7–1.8 (camera 2.0, parallax/occluders) | director.tsx, stage.tsx | 1 |
| 5 | Formats + topic queue (Phase 4) | ops/topic_queue.json, AUTOPILOT_PROMPT.txt, thumbs.tsx (HOUR/DAY cards) | 1 |
| 6 | Growth ops config + WEEKLY_OPS.md (Phase 5) | ops/routine.json, launchd plists (if cadence change), docs/WEEKLY_OPS.md | 1 |
| 7 | Anim 1.9–1.10 (walk/IK, cutaways) | figure.tsx, anim.ts, stage.tsx | 1–2 |

**Every phase:** `python3 build.py` green → spot stills → segment render → commit → and for visual phases, one cloud dispatch to confirm shard timing (render step <45 min; else lower the 1250 divisor). Update BIBLE.md as rules change — the BIBLE is canon; this plan is the roadmap.

## RESEARCH PROVENANCE (for the executor's trust + deeper digging)
Stream A (niche meta): MasterPOVs/Hypothetically/TheLifeOutline/Wallace/ChillPovGuy/POVrank/Judicium/SurviveHistory stats scraped live 2026-07-04; thumbnails image-verified. Stream B (animation): Alan Becker 12-principles, Ryan Juckett 2-bone IK, Little Polygon locomotion, Maxime Heckel spring physics, Remotion docs (paths/noise/transitions cheap; motion-blur expensive), rough.js/perfect-freehand, Camillo Visini boil (per-frame filter = the banned pattern). Stream C (story/retention): Retention Rabbit 2025 benchmarks, Paddy Galloway via Colin&Samir, MrBeast leaked production doc, DM-craft perception-filter research, edge-tts SSML limits, YPP July-2025 authenticity policy, AIR mix-numbers. Stream D (growth): vidIQ MasterPOVs outlier data, 1of10 outlier methodology, AIR 18K-channel cadence study, Buffer 1.8M-video timing study, TubeBuddy end-screen data, Test&Compare (Tubefilter), CHI 2025 creator-hearts study.
