# CoreLifecycle — Full-Scale Improvement Roadmap
(Solutions for the pipeline audit. Each item: problem → solution → implementation → effort → deps.)

Pipeline today: 2AM launchd → daily_autopilot.sh → creative agent (topic/research/content.py) →
build.py (edge-TTS+master → numpy music → gate) → Remotion render (~28 min, 8GB M2) → reviewer
agent (16 stills → verdict.json → fix-loop) → gen_packaging → upload. Gate-gated + review-gated.

---
## 1. CLOUD RENDERING  ★ highest leverage (speed + reliability + laptop-free)
PROBLEM: ~28 min render on a shared 8GB laptop; ties up the Mac; competes with other projects;
a "revise" pass triggers a full re-render (up to ~90 min); render is where failures happen (silent
fail, duplicate render); requires the Mac awake at 2AM.

SOLUTION (phased):
- **Phase A — Remotion Lambda (render only).** Deploy a Remotion render function on AWS Lambda +
  an S3 "site". Frames render in parallel across hundreds of Lambdas → 10-min video in ~3–5 min.
  - Steps: AWS account + IAM user (scoped policy from `npx remotion lambda policies`); `npx remotion
    lambda functions deploy`; `npx remotion lambda sites create src/index.ts --site-name=corelifecycle`;
    set env keys (REMOTION_AWS_*). Change runner render step to
    `npx remotion lambda render <serveUrl> EveryLevelLawyer --out=...` then download the mp4 (or
    upload straight from S3). Audio (public/audio, music) must be bundled into the site (they are
    staticFile assets → deployed with the site) — re-run `sites create` each build OR host audio on S3.
  - Cost: ~$0.10–1.00 per 10-min 1080p render. Concurrency limit + Lambda 10GB mem (our per-figure
    feTurbulence is fine parallelized).
  - Gotcha: assets. Since VO/music change every video, re-deploy the site each run (`sites create`
    is ~30s) OR switch audio to `<Audio src={http S3 url}>` and push wavs to S3 in build.py.
- **Phase B — move the WHOLE autopilot off the Mac.** A cheap always-on box runs everything:
  - Option B1: **VPS** (Hetzner CX22 ~€4/mo or DO $6/mo): install node+python+chrome+remotion+ffmpeg,
    clone repo, move secrets, cron @2AM runs daily_autopilot.sh, render via Lambda (Phase A) or
    locally on the VPS. Fully laptop-independent. Simple, predictable cost.
    NOTE: Hermes Agent (installed) is built for exactly this — hosting an unattended agent on a $5
    box with messaging; could orchestrate the run + notify you on Telegram.
  - Option B2: **Modal** (modal.com, generous free tier): Python-native; a Modal app with a
    Chrome+Remotion image runs build+render serverless, sleeps when idle. Fits our Python pipeline.
RECOMMENDATION: Phase A now (Lambda) for fast/reliable renders; Phase B (VPS, likely + Hermes) next
to make it fully laptop-independent.
DECISION NEEDED: AWS-Lambda vs Modal vs VPS; budget ceiling.

---
## 2. TOPIC-SPECIFIC SCENE PACKS  ★ biggest quality gap for a multi-topic channel
PROBLEM: all 18 templates are office/finance (desk, boardroom, tower). Surgeon/soldier/athlete will
render in boardrooms — visually wrong. The channel will look identical across professions.

SOLUTION: a **composable scene system** instead of bespoke per-scene components.
- Refactor a scene into 3 layers: **backdrop** (far) + **setting/prop** (mid) + **figure** (near),
  each a small doodle module, composed by parameters. A scene = {backdrop, prop, action, expr, overlay}.
- Build doodle LIBRARIES:
  - Backdrops (~15): city skyline, hospital corridor, lecture hall, courtroom, battlefield/trench,
    stadium stands, lab, trading floor, factory, server room, campaign stage, mountain/expedition,
    open ocean/oil rig, parliament, plain studio.
  - Props (~20): desk+laptop, operating table+monitor, podium+mic, goalposts/scoreboard,
    sandbags/rifle rack, lab bench+beakers, conference table, jet, globe/warroom, empty chair,
    surgical tray, easel/whiteboard, anvil/forge, drafting table, server rack.
- The art-director picks a backdrop+prop per beat appropriate to the topic. A `docs/TEMPLATES.md`
  catalog lists every backdrop/prop (name → depiction → fitting topics) for the agent to choose from.
- Keep the existing 18 as presets that map onto the new system (back-compat).
- Phase by upcoming queue: surgeon (OR, ward, lecture hall, conference), then soldier, founder, athlete.
EFFORT: large (the core engine generalization) but it's the scalable foundation — do it once, every
future topic benefits. Add a gate check: flag if a topic uses an obviously-mismatched backdrop.

---
## 3. RELIABILITY HARDENING  ★ required before trusting fully-unattended nights
PROBLEMS: agent rewrites content.py / edits Brand.tsx nightly (can break Python/TSX); render success
checked weakly; no lock against double renders; headless reviewer untested; failures are silent.
SOLUTIONS (each small, high-value):
- **Data-driven packaging**: agent writes `ops/episode_meta.json` {topic, title, hook, body, tags,
  thumb_kicker, thumb_big1, thumb_big2, thumb_tag}. gen_packaging.py + Thumbnail comp READ that JSON
  (Thumbnail via a generated `src/episode_meta.json` import). → agent never edits .tsx/.py nightly.
- **Syntax + smoke gates** (in build.py, before the long render): `python3 -c "import content"`
  (catch script breakage); `npx remotion still EveryLevelLawyer out/_smoke.png --frame=0` (catch
  TSX/scene errors in seconds before a 28-min render).
- **Render verification**: rely on exit code (no `| tail`), then assert file exists + size>50MB +
  (optional) frame-count via remotion. HALT on any miss.
- **Run lock**: `mkdir runs/.lock` at start (atomic); exit if present; trap-remove on exit. Prevents
  double/overlapping renders (today's bug).
- **Status + notify**: final log line PUBLISHED <url> / HALTED <reason>; push a Telegram/email note
  (via Hermes or a webhook) on finish/halt so you know each morning without checking.
- **Watchdog**: a 9AM cron checks "did a run log + upload happen overnight?" → alert if not.

---
## 4. AUDIO REVIEW (close the reviewer's blind spot)
PROBLEM: reviewer judges stills only; can't verify the narration sounds right.
SOLUTION: `qa_audio.py` → transcribe the rendered VO with **faster-whisper** (CPU, ~1–2 min on M2) →
compare transcript to content.py narration (word-coverage per scene, flag dropouts/garble) + numpy
loudness/silence/clipping check → write out/review/audio_report.json → REVIEW_PROMPT reads it so the
reviewer actually evaluates sound. EFFORT: small (pip faster-whisper + one script + prompt line).

---
## 5. POLISH: MUSIC / VOICE / HYGIENE
- **Music variety**: make_ambient reads episode_meta (per-topic key/tempo/motif seed) → a different
  bed each video; or a rotating library of 6 pre-made beds. Remove dead 29MB ambience.wav.
- **Voice premium tier**: gen_voice supports ELEVEN_API_KEY → ElevenLabs 44.1kHz (crisp + natural)
  with edge-TTS as free fallback. ~$5–22/mo. Keep the mastering chain on top.
- **fps 30→24**: ~20% fewer frames = ~20% faster render, no perceptual loss for this style.
- **Repo hygiene**: move one-off experiments (gemini_test, pollinations_test, voice_shootout*,
  voice_master_test, gen_images, gen_voice[kokoro], make_ambience) → `experiments/`; delete dead
  SCENE_COMPONENTS map + unused imports. Less agent confusion + risk.

---
## 6. GROWTH / DATA (after a few videos + some views)
- **Analytics loop**: weekly cron → yt_analytics (views, CTR, avg%viewed, 30s-retention) →
  ops/analytics.json → showrunner/packager/art-director read it: repeat high-CTR thumbnail/title
  patterns, favor topics that landed, fix pacing where retention dipped. Closes the learning loop
  (currently self-critique only).
- **A/B**: generate 3 thumbnail variants + 2 titles; use YouTube Studio "Test & Compare" for
  thumbnails; track title CTR over time; feed winners to the packager.
- **Shorts** (big growth lever): a 1080×1920 VerticalShort composition reusing the scene system;
  shorts_cut.py picks the 2–3 punchiest beats (a level + its number reveal) → renders vertical →
  uploads as Shorts. (Reuse Sammy's shorts know-how.)
- **Parallax depth** (the "3D" ask): the composable scene system renders backdrop on a far plane
  (moves little) + props/figure near (move more) under the camera push = real depth.

---
## SUGGESTED ORDER
1. Reliability hardening (#3) — quick, protects every unattended night. DO FIRST.
2. Audio review (#4) — small, closes the reviewer gap.
3. Cloud rendering Phase A (#1) — kills the bottleneck. (decision: provider)
4. Topic scene packs / composable system (#2) — the big quality+parallax foundation.
5. Polish (#5) + Cloud Phase B (laptop-free).
6. Growth/data (#6) once views accrue.
