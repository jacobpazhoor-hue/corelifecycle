# CoreLifecycle — Quality Maximization Master Plan
*Deep-research-backed, 100% free, tuned for the Remotion + edge-tts + numpy pipeline on an 8GB M2 Mac.*
*Compiled 2026-06-28 from 6 parallel research streams (algorithm/retention, animation, audio, color, story, packaging). Sources cited inline; full source lists in `docs/research/`.*

---

## 0. North-Star Metrics (what "maximized" actually means)

Stop optimizing vibes; optimize these numbers. From the 2026 algorithm research:

| Metric | Target | Why it's the lever |
|---|---|---|
| **Retention at 0:30** | **≥78%** held | First-30s retention is the #3 ranking signal (weight 85); >40% drop here = algorithm stops recommending. 55%+ of viewers leave in minute one. |
| **Avg percentage viewed** | **45–55%** (of 12 min) | Viral bar for 5–15 min videos. Platform avg is only ~23.7%; 1M+ view videos avg ~76%. |
| **CTR (browse/suggested)** | **6–8%+** | 4–5% avg, 6–8% good, 10%+ elite. A 2% lift roughly doubles lifetime views (compounding distribution). |
| **Shares** | ≥1 "send-this" moment/video | Shares weigh 5–8× likes; now a top satisfaction signal. |
| **Session continuation** | playlists + next-ep tease | Session time is now one of the most heavily weighted factors. |

The new (April 2026) signal stack, by weight: post-view satisfaction (95) > shares (88) > **first-30s retention (85)** > repeat views (80) > returns-to-channel (72) > completion (68) > total watch time (45) > CTR (38). *Source: outlierkit.com/resources/youtube-viewer-satisfaction-algorithm-2026.*

**Implication:** the script's hook + the packaging are worth more than any animation polish. Sequence the work accordingly (below).

---

## 1. Priority Ladder (do in this order — highest impact-per-free-effort first)

Each item: **[pillar] what · expected impact · render/compute cost on 8GB · pipeline target file.**

### TIER 1 — Biggest free wins (mostly writing + cheap render)
1. **[Story] Cold-open hook rewrite (first 8s, no logo).** Massive — moves the #3 signal. Free. → `AUTOPILOT_PROMPT.txt`, `content.py`.
2. **[Story] Stacked open-loops + per-level re-hooks + but/therefore causality.** Massive retention. Free. → `AUTOPILOT_PROMPT.txt`.
3. **[Audio] Mastering pass: pedalboard VO chain → sidechain duck → 2-pass −14 LUFS.** The #1 "amateur vs pro" tell. ~Free (CPU ffmpeg). → new `audio_master.py`, `build.py`.
4. **[Packaging] Title formula upgrade (stakes parenthetical + 2nd person).** Direct CTR. Free. → `AUTOPILOT_PROMPT.txt`, `gen_packaging.py`.
5. **[Packaging] Title↔thumbnail synergy rule (never repeat words).** Direct CTR. Free. → `thumbs.tsx`, prompt.
6. **[Animation] `spring()` + expo-out easing + staggered entrances everywhere.** Single biggest "looks pro" jump. Free (pure math). → `director.tsx`, `Video2.tsx`.

### TIER 2 — High impact, modest build (cheap render)
7. **[Color] Per-level color dramaturgy driven by one `levelProgress` var (warm→cool→red→gold).** Cinematic + signals escalation. Cheap. → `director.tsx`, `Video2.tsx`, `stage.tsx`.
8. **[Color] Free CSS/SVG grade stack (feColorMatrix LUT + lifted blacks + warm bloom + cool-contrast vignette).** Cinematic look. Cheap-medium. → `Video2.tsx` overlay layer.
9. **[Audio] CC0 SFX layer: whoosh-into-cut + boom-on-cut + risers into level changes + ambience beds.** Cheap retention via audio sync. Free files. → `audio_master.py`, scene metadata.
10. **[Animation] Layered parallax depth (BG/MG/FG at different rates) + DoF blur.** Converts flat 2D → 3D camera feel. Cheap-medium. → `stage.tsx` (split layers), `director.tsx`.
11. **[Animation] SVG path "draw-on" (stroke-dashoffset) for line-art + arrows + numbers.** Core doodle craft signature. Cheap. → `stage.tsx`, `director.tsx`.
12. **[Packaging] Niche thumbnail formula rotation (Hero+Arrow / Ladder / Before-After / Face-of-Fear / Pattern-Interrupt) + exaggerated doodle emotion.** Direct CTR. Cheap. → `thumbs.tsx`.

### TIER 3 — Polish & atmosphere (medium render, use selectively)
13. **[Animation] `@remotion/transitions` (slide/wipe/clockWipe/iris + custom ink-wipe) instead of plain crossfade.** Edited-video feel. Low-medium. → `Video2.tsx`.
14. **[Animation/Color] Hand-drawn "boil" wobble via feTurbulence→feDisplacementMap (stepped 8–12fps).** Authentic hand-drawn life. MEDIUM (one filter/scene, tight region). → `stage.tsx`.
15. **[Color] Film grain (animated feTurbulence overlay) + halation + selective chromatic aberration that ramps with stakes.** Premium film finish. Cheap-medium. → `Video2.tsx`.
16. **[Audio] Rework numpy score from loop → sectioned 12-min emotional arc (drone→pulse→swell→climax→resolve), rendered as stems, ducked independently.** Cinematic scoring. Free (numpy). → `make_music`/score generator.
17. **[Animation] Motion blur (`@remotion/motion-blur`) on the few fast shots only.** Shutter feel. EXPENSIVE — selective, samples ≤6, drop concurrency. → `director.tsx`.

### TIER 4 — Optional / experimental (verify cost first)
18. **[Audio] Two-tier narration: Kokoro (bulk) + Chatterbox (emotional/climax lines).** Expressive VO. Heavy (already run on sibling project). → TTS step.
19. **[Audio] ACE-Step (MIT) bespoke cinematic stems via free Colab T4 → mix locally.** Owned, claim-proof music. Off-Mac (Colab). → asset bank.
20. **[Animation] Rough.js / react-rough-fiber sketch rendering of backdrops (fixed seed for determinism).** Stronger hand-drawn look. One-time gen. → build step.

---

## 2. Pillar Deep-Dives

### 2.1 STORY (highest leverage — narration drives everything)

**Macro-structure** = Dan Harmon Story Circle mapped onto the rank ladder, with South Park **but/therefore** causality between every level, riding **stacked open loops**.

Scene-by-scene skeleton for a ~12–13 min / ~28–34 scene episode (each beat names its retention job):
- **0:00–0:20 Cold open / in-medias-res** — drop into the peak-danger moment of the whole arc, cut away before resolution. This is the master loop the ending pays off. *No logo, no "in this video."*
- **0:20–0:35 Promise + theme/cost line** — the dread loop: *"You want this. You don't know yet what it costs."*
- **0:35–1:30 Level 1 — comfort + want** — concrete sensory lack, named want, a named person. Empathy must land <60s.
- **Levels 2–6 — adapt + escalate** (~60–110s each) — each level is a micro story-circle: new world → task → complication (**but**) → consequence that promotes you (**therefore**) → one-line loop into the next rank. Each level raises **danger, status, OR moral cost.**
- **≈Level 2–3 Mentor beat** — named figure (sets up later betrayal/loss).
- **≈50% mark Midpoint reversal** — the single biggest completion lever: betrayal / cost revealed / the thing you wanted starts to rot.
- **Levels 7–8 — get it, at cost** (~8:30–10:30) — deliver the fantasy, immediately undercut; resolve the cold-open loop here.
- **Last 60–90s — pay the price + loop close** — end on cost, bend back to the opening image (rewatchable, circular).

**Pacing law:** one complete idea every 60–90s; pattern-interrupt every 30–45s; re-hook (open a new loop) every 30–60s.

**POV craft rules** (drop into the script prompt as hard constraints):
1. Present tense, always ("You walk in," never "walked").
2. Sensory + body-based dread every level (heartbeat, dry mouth, cold hands).
3. Break "you…you…you" drone with the **imperative** ("Don't look back. Count the doors.") — the #1 anti-gimmick fix.
4. Give "you" agency via choices and costs.
5. Foreshadow the unknown cost ("You don't know yet what it costs").
6. "You" is still a real character (want, flaw, a name others call you).
7. State the fact, not the feeling ("Your hands are steady. That's the part that scares you.").
8. Specificity over abstraction ("Forty-two hundred in a cereal box," not "good money").
9. Anaphora at theme moments ("Money buys medicine. Money buys safety. Money buys a way out.").
10. Sentence-length variation: avg <15 words, 2–4 word punches at peaks.

**Hook templates** (pick/rotate; all 2nd-person present):
- Cold-open: *"The gun is already in your hand. Thirty seconds ago you were someone's son. Let's go back six years."*
- Stakes/dread: *"By the time you reach the top, three people you trust will be dead. One because of you."*
- Promise: *"By the last level, you'll run an empire — and understand why men like you don't grow old."*
- Question: *"How does a fifteen-year-old lookout become the most feared man in the city? One level at a time."*
- Contradiction: *"You have ten million dollars and you sleep with the lights on. Here's how both became true."*

**High-ceiling topics** (curiosity ceiling = forbidden access + legible rank ladder + life/death-or-vast-wealth stakes + built-in cost arc): Cartel, Hitman, Spy, Mafia, Roman Emperor, Samurai/Yakuza, $100M inheritance (count-up shines), Astronaut, Empire-builder, Smuggler/Diamond dealer. White-collar (lawyer/doctor) = lower ceiling; inject scandal/danger to compete. *(Aligns with current `topic_queue.json`.)*

> **Keep our differentiator:** MasterPOVs uses *no* number overlays — our animated money/stat count-up is a genuine edge. Keep it, make it cinematic (§2.3).

### 2.2 PACKAGING (CTR — ~50% title, ~50% thumbnail; the click gate)

**Titles** (40–65 chars, front-load hook in first 40, 2nd person):
- Base + stakes parenthetical: `Your Life as a Spy at Every Level (You Won't Survive Level 7)`
- Brackets/parens lift CTR ~15–20% — put the stakes there.
- Power-word buckets: curiosity (Secret/Untold/Nobody Survives), scale (Every/Ultimate), urgency (Or Die/Hunted/Before It's Too Late), specificity (numbers/$).
- Emojis: good on Shorts, sparing/none on long-form. Never repeat "Architect"-style flat role-only titles.

**Thumbnails** — 5 formulas to rotate (we already have a dispatcher; expand it):
1. **Hero + Red Keyword + Curved Arrow** (default; vary keyword SURVIVE/BETRAYED/EMPEROR/HUNTED + arrow target).
2. **Ladder / Levels motif** (climbing tiers, size progression — visualizes "every level").
3. **Before/After split** (nobody → boss).
4. **Face-of-Fear** (extreme close on terrified doodle + one threat from edge).
5. **Single Subject + Pattern Interrupt** (one inverted element — skull crown, etc.).

**CTR rules tuned to doodle/no-real-faces:**
- One focal point ≥40% of canvas (one big hero, everything else recedes).
- **Emotion is the #1 CTR lever you're missing** → exaggerate doodle expression past what a real face can (huge eyes, sweat, open-mouth shock, body language). Up to ~30% CTR.
- ≤3 words; bold condensed sans (Anton/Bebas Neue) + thick outline + drop shadow.
- Contrast ≥4.5:1; reserve saturated red + gold as accent-only against muted paper.
- Curiosity gap IN the image (unexplained threat/door/arrow target).
- Mobile-first: must read at ~1 inch.
- **Premium doodle moves:** real paper+ink texture (not flat white), varying stroke width + slight jitter, gold rendered as metallic gradient (`#d4af37→#f5d76e→#b8860b`) with dark stroke, figure-ground depth (heavy hero outline + paper drop-shadow; thinner/lower-opacity background), consistent system every episode = brand.

**Synergy rule:** thumbnail SHOWS, title TELLS — never the same words. If title says "Spy," thumbnail says `BETRAYED` or `LEVEL 9`. Two different reasons to stop.

**Free testing:** YouTube native **Test & Compare** (Studio desktop, Advanced Features on) — 3 variants, optimizes on watch-time share, runs ≤2 weeks. Test different *formulas*, not near-identical art. Pre-test: 1-inch shrink, squint/blur (one focal point?), grayscale (contrast survives?).

### 2.3 ANIMATION (the "looks pro" jump — mostly free)

**Free, biggest-first:**
1. **`spring()` for every entrance/camera push** (overshoot+settle reads as craft; replace linear Ken-Burns). `damping:200` clean, `12–18` snappy. Drive `scale`/`translate`. *Source: remotion.dev/docs/spring.*
2. **Expo-out easing** for non-spring tweens: `Easing.bezier(0.16,1,0.3,1)`. Always `clamp` both extrapolations. Ease-in only for exits.
3. **Staggered entrances** — offset each element by `index * 2–4` frames (cascade). Highest polish-per-effort.
4. **Layered parallax** — split each backdrop into BG/MG/FG SVG groups, one spring drives all, multiply translate by depth factor (`bg*0.2, mg*0.5, fg*1.0`), blur FG/BG 2–4px for fake DoF. THE flat→3D cue.
5. **SVG draw-on** — `pathLength="1"` + animate `strokeDashoffset` 1→0, stagger per path. Native, cheap; no GSAP needed.
6. **Count-up upgrade** — spring-decelerated digits + scale-pop + tabular/monospace figures so width doesn't jitter (we already have count-up; make it spring-eased).
7. **Transitions** (`@remotion/transitions` + `<TransitionSeries>` w/ `springTiming`) — slide/wipe/clockWipe/iris, plus a **custom `clip-path` ink-wipe** reveal. Low-medium cost.
8. **Motion blur** (`@remotion/motion-blur` `<CameraMotionBlur>`/`<Trail>`) — EXPENSIVE (N× subtree renders); only short fast beats, samples ≤6, children must be `position:absolute`, drop `--concurrency`.

**Hand-drawn craft:**
- **Boil/wobble**: `feTurbulence type=turbulence baseFrequency=0.03 numOctaves=2` → `feDisplacementMap scale=3–8` (subtle) or `15–25` (strong). Step the seed at 8–12fps (`Math.floor(frame/(fps*0.1))%4`), NOT every frame — authentic cadence is "on twos/threes." ONE filter per scene, tight `<filter>` region. *Source: camillovisini.com/coding/simulating-hand-drawn-motion-with-svg-filters.*
- **Rough.js / react-rough-fiber / svg2roughjs** for sketchy multi-stroke edges — **fix the `seed`** or frames flicker (Remotion renders frames independently/out-of-order). Pre-bake to static paths.
- **rough-notation** for hand-drawn underline/circle/box on keywords.
- **Paper texture**: CC0 paper PNG (ambientcg.com) at `mix-blend-mode:multiply` 8–20%, or procedural feTurbulence `fractalNoise baseFrequency=0.9`.

**8GB determinism cautions (critical):** anything random (Rough.js, particles, feTurbulence seed, Lottie expressions) MUST be a pure function of `useCurrentFrame()` or you get flicker. Animated SVG filters are the #1 perf cost — one boil/fog per scene, tight regions, step noise. Lower `--concurrency` (2) on filter/blur/motion-blur comps. Render blurred BG/FG layers at reduced resolution.

**GitHub repos:** remotion-dev/skills, remotion-dev/motion-blur-example, rough-stuff/rough, Bowen7/react-rough-fiber, fskpf/svg2roughjs, rough-stuff/rough-notation, veltman/flubber (shape morph), theatre-js/theatre, madjin/awesome-cc0.

### 2.4 COLOR (cinematic range + escalation signal — free, browser-renderable)

**Keep "warm-paper noir" as the house identity** (it differentiates us in a dark-mode feed — ~60% of 2026 views). Build a 5-mood library, tuned to our paper/ink/gold base:
- **A. Warm-Paper Noir** (default/recruit): paper `#f6f2e9`, ink `#2a2620`, gold `#e8b54b`, + shadow `#171410`.
- **B. Teal & Orange** (action): shadow teal `#103a45`, warm subject `#e8954b`.
- **C. Cool Noir / Night** (surveillance/betrayal): bg `#0d1117`, ink-on-dark `#e8e2d4`, cyan `#3fb6c4`.
- **D. Danger Red** (climax only, spend rarely): bg `#1a0e0c`, blood `#d7382c`.
- **E. Gold & Onyx** (apex/power): onyx `#14110c`, rich gold `#caa23a`.

**Rule:** ≤3 colors doing work per frame — a dark mass, paper/ink line art, exactly one accent.

**Escalating dramaturgy** (the Breaking-Bad move — palette darkens as you rise). Drive it from ONE `levelProgress` (0→1) variable; `interpolate()` background hue, accent, `saturate()`, and vignette opacity off it. Ramp warm→cool→red→gold as control is gained then lost. **Reserve red** (if it's every level it means nothing). One discordant hue for a single betrayal/twist shock beat.

**Free grade stack** (stack bottom→top in `Video2.tsx`): art → **feColorMatrix LUT** (teal-orange split) → **lifted blacks** (overlay `#1f2a2e` `screen` 10%, or feComponentTransfer slope 0.92 intercept 0.06 — never pure-black shadows) → **warm bloom/halation** (`blur(8px) brightness(1.4)` `screen` 55%, tinted gold) → **mood tint** (`soft-light`, hue from level) → **grain** → **cool-contrast vignette** (`radial-gradient(... transparent 45%, #0c1c20 100%)` `multiply` 70%) → chromatic-aberration edges. `feColorMatrix` is the free "LUT"; tune live at fecolormatrix.com.

**Texture:** animated film grain (feTurbulence `fractalNoise baseFrequency=0.65`, shift seed/position per frame, `overlay` 6–10%); halation around gold; chromatic aberration that ramps UP with level intensity ("reality breaking down" at climax). Keep total overlay opacity modest or it muddies line art.

**Thumbnail color:** dark-grounded 60/30/10, warm-figure pop on cool ground (subject +10–15% saturation over bg), red/coral keyword (`#d7382c` or dark-mode-proof `#ff5a4d`) with outline+glow, optional lime `#b6ff3a` eye-stop. High-contrast bold colors ≈ +20–30% CTR; 5px accent border ≈ +5–10%.

### 2.5 AUDIO (the biggest "amateur vs pro" tell after the script)

**Mastering chain** (new `audio_master.py`, run in `build.py` before mux). Order: per-line VO cleanup (pedalboard) → mix VO+score with sidechain duck (ffmpeg) → SFX layer → final 2-pass loudnorm.
- **VO cleanup (Spotify pedalboard):** HighpassFilter 85Hz → Compressor(thr −20, ratio 3, atk 5, rel 120) → de-ess → Reverb(room 0.18, wet 0.10) for "space" → +2dB.
- **Sidechain duck (ffmpeg `sidechaincompress`):** music dips to ≈−30/−35 LUFS under speech, sits ≈−16 in gaps; VO ≈−14.
- **Final loudness (2-pass `loudnorm`):** `I=-14:TP=-1:LRA=11`, `linear=true` (preserves crescendos, no pumping). YouTube normalizes to ~−14 and only turns *down* — so hit −14 to keep our punch. Wrapper: `slhck/ffmpeg-normalize`.

**SFX layer (CC0: Freesound filtered-to-CC0, Pixabay SFX, 99Sounds, Mixkit, YT Audio Library):**
- **Whoosh ~0.3s before a hard cut → boom ON the cut frame** (trailer grammar; resets attention).
- **Risers into each level change**, sub-bass impacts on title/number reveals, **ambience beds** under every scene (room tone/wind/city hum) so it's never "dead."
- **Sound bridge / J-cut**: start next scene's ambience a beat before the visual cut.
- **Foley for doodle strokes** (pencil-scratch/paper) synced to draw-on animation = big perceived value.

**Music — three tracks, all free + claim-safe:**
1. **Backbone:** YouTube Audio Library + Pixabay (the only two effectively claim-proof). Incompetech/FMA are great but CC-BY (must credit, not whitelisted → manual dispute risk).
2. **Bespoke (owned, claim-proof):** improve the **numpy score** from loop → **sectioned 12-min arc** (drone intro → low pulse → sustained minor/Aeolian pad → swell + counter-line → climax → resolve). Cinematic harmony (minor, sustained, borrowed chords, slow harmonic rhythm, "low drone + subtle pulse + space"). Render as **stems** (sub-drone/pad/pulse/melody) → automate each across the arc + duck independently. Tension devices: rising-pitch drone into each level, sub-boom on reveals, accelerando toward climax, lengthening reverb tail.
3. **Optional AI:** **ACE-Step 1.5 (MIT, Apple-Silicon MLX)** for owned stems — borderline on 8GB (use 2B variant or free Colab T4 to batch a stem bank). **Avoid MusicGen (CC-BY-NC) and XTTS-v2 (CPML) for monetized content.** Stable Audio Open = good for ≤47s SFX/risers (verify revenue-threshold license).

**Narration:** edge-tts Andrew is solid but has zero emotion control + is a server dependency. Optional upgrade = two-tier **Kokoro-82M (Apache-2.0, easy on 8GB) for bulk + Chatterbox (MIT, emotion dial) for climax lines** — both already run on the sibling Sammi project. Open with a **2-second audio hook** (signature riser + first line landing on a swell).

---

## 3. Pipeline Mapping (what changes where)

| Change | File(s) | Notes |
|---|---|---|
| Hook + loops + but/therefore + POV rules + topic ceiling | `docs/AUTOPILOT_PROMPT.txt`, `docs/BIBLE.md` | Hard constraints in the WRITE step; reviewer checks them. |
| Title formula + stakes parenthetical + synergy | `AUTOPILOT_PROMPT.txt`, `gen_packaging.py` | Title never repeats thumbnail words. |
| `levelProgress` color ramp + 5-mood palette | `src/director.tsx`, `src/Video2.tsx`, `src/stage.tsx` | One variable drives hue/accent/saturate/vignette. |
| Free grade stack (LUT/lifted-blacks/bloom/grain/vignette) | `src/Video2.tsx` | Stacked overlay layers above shots, below text. |
| spring/easing/stagger/parallax/draw-on | `src/director.tsx`, `src/stage.tsx` | Backdrops split into depth layers. |
| Transitions + selective motion blur | `src/Video2.tsx`, `src/director.tsx` | `springTiming`; motion blur only fast beats. |
| Boil/wobble + paper texture + rough sketch | `src/stage.tsx` (+ optional build step) | Fixed seeds for determinism. |
| Thumbnail formulas + premium doodle + emotion | `src/thumbs.tsx` | Expand archetype dispatcher; metallic gold gradient. |
| Audio mastering chain + SFX + ambience | new `audio_master.py`, `build.py`, scene meta | pedalboard + ffmpeg; CC0 SFX bank under `public/sfx/`. |
| Sectioned numpy score + stems | music generator (`make_*` / score step) | 12-min arc, ducked stems. |
| QA gates for new metrics | `qa_watch.py`, `qa_audio.py`, `gate.py` | Add: hook-present check, LUFS check, palette-shift check. |

---

## 4. Phased Rollout (vertical-slice validated, your preferred cadence)

Each phase: build → render ONE slice/episode → eyeball + QA gates → commit → roll into nightly autopilot. Never batch-merge unvalidated.

- **Phase 1 — Story + Packaging (Tier 1 #1,2,4,5).** Pure prompt/script + title/thumb text. Zero render risk. Biggest metric impact. Validate on next episode's script + thumbnail.
- **Phase 2 — Audio mastering (Tier 1 #3, Tier 2 #9).** `audio_master.py` + CC0 SFX bank. Validate: VO clear, music ducks, −14 LUFS measured, booms on cuts.
- **Phase 3 — Animation base (Tier 1 #6, Tier 2 #10,11).** spring/easing/stagger + parallax + draw-on. Validate one render on 8GB for cost + no flicker.
- **Phase 4 — Color (Tier 2 #7,8).** `levelProgress` ramp + grade stack. Validate palette escalates across levels, line art still legible.
- **Phase 5 — Thumbnail formulas (Tier 2 #12).** Expand `thumbs.tsx`; A/B via Test & Compare.
- **Phase 6 — Polish (Tier 3 #13–16).** transitions, boil, grain/halation, sectioned score. Watch render cost; selective motion blur last.
- **Phase 7 — Optional (Tier 4 #18–20).** Kokoro+Chatterbox VO, ACE-Step stems, Rough.js — only if cost/quality justify.

**Continuous-improvement loop:** after each published video, log CTR + retention-at-30s + avg-%-viewed vs 28-day baseline into `ops/improvements.json`; let the nightly reviewer flag the weakest metric and propose the next fix from this plan.

---

## 5. Free Asset / Tool Shortlist (bookmark)

- **SFX (CC0):** freesound.org (filter CC0), pixabay.com/sound-effects, 99sounds.org, mixkit.co, YouTube Audio Library.
- **Music (claim-safe):** YouTube Audio Library, Pixabay Music. (Owned: numpy + ACE-Step MIT.)
- **Textures (CC0):** ambientcg.com, opengameart.org; grain: motionarray free pack or procedural feTurbulence.
- **Fonts:** Google Fonts via `@remotion/google-fonts` — Anton/Bebas Neue (thumb keyword), Caveat/Patrick Hand (doodle labels).
- **Libs:** `@remotion/transitions`, `@remotion/motion-blur`, `@remotion/lottie`, rough.js, react-rough-fiber, rough-notation, flubber, spotify/pedalboard, slhck/ffmpeg-normalize.
- **Tuning:** fecolormatrix.com (LUT), lottiefiles.com/free-animations (Lottie Simple License — verify per file).

---

*Bottom line: the single highest-ROI free moves are (1) a hard cold-open + open-loop script discipline, (2) the pedalboard→duck→−14 LUFS audio master with boom-on-cut SFX, (3) spring/stagger/parallax animation, and (4) the per-level color ramp + dark-grounded emotional thumbnails. Story and packaging first — they gate everything downstream.*
