# CLC Illustrated-Cinematic Upgrade — Design Spec

**Date:** 2026-07-31
**Status:** Approved design, pending spec review → implementation plan
**Owner:** Jacob
**Scope of first build:** §2 Image Gen · §3 Depth+Camera · §4 Style System · §5 Autopilot Safety. §6 pilot execution is owner-run after the build.

## Goal

Upgrade CoreLifecycle's visual look from flat SVG "doodle" backdrops to **cinematic illustrated stills with real camera motion**, while preserving the three properties that make CLC viable:

1. **Free** — $0 marginal cost per episode (free image API, no paid GPU/API).
2. **Deterministic** — same inputs → same render, so cloud/Modal renders stay offline & reproducible.
3. **Unattended** — the nightly launchd autopilot keeps working with no human in the loop.

Explicitly chosen over: photoreal (costs $1–5/ep, uncanny-valley + consistency risk) and true generated video motion ($20–100/ep, non-deterministic). Those are documented as future upgrade paths, not this build.

## Non-goals

- Not touching `content.py` script structure, edge-tts voice, numpy music/ducking, mastering, thumbnails, upload, or the launchd autopilot orchestration.
- Not generating physical motion (walking, gestures). "Motion" here is a **virtual camera over still images**.
- Not building a paid/photoreal path now (parked as §7 Future).

## Architecture overview

CLC's scene list (`content.py: SCENES`) stays the single source of truth. Each scene names a `template`. Today that template draws an SVG doodle in `src/stage.tsx`. New path: each scene also gets a **generated illustrated still** + a **depth map**, and a new Remotion component renders that still with a cinematic camera move. The SVG doodle stage is **retained as a per-scene fallback**.

```
content.py (SCENES, source of truth)
      │
      ├─ gen_scene_images.py  ──►  images/<slug>/tNN.jpg   (illustrated still, cached, committed)
      │        │                    images/<slug>/tNN.depth.png (depth map, cached, committed)
      │        └─ on failure: mark scene → doodle fallback
      │
      ├─ gen_voice_edge.py → make_ambient.py → duck_music.py   (UNCHANGED)
      │
      └─ Remotion render
             PhotoStage({image, depthMap})  ← if visualMode="photo" and assets exist
             stage.tsx doodle template        ← fallback / visualMode="doodle"
```

### Build step insertion (build.py)

`build.py` current order: content syntax-gate (step 0) → VO → ambient → duck → gate → smoke render.

Insert **step 0.5** `gen_scene_images.py` immediately after the content syntax-gate and before VO (images depend only on `content.py`, not audio). It is **non-fatal**: any scene it can't generate is flagged for doodle fallback so the nightly never dies on a free-API hiccup. Images+depth are written and cached before the smoke render (step 3) and full render consume them, keeping both offline & deterministic.

## §2 — Image generation module (`gen_scene_images.py`)

**Responsibility:** produce one cached illustrated still + depth map per scene, deterministically, for free; never block the build on failure.

- **Prompt** = `scene.visual` (a short visual-intent string added per scene, or derived from existing scene text) + the **locked style suffix** from `ops/photo_style.json` + POV framing directive.
- **POV constraint (consistency mechanism):** prompts are first-person / over-shoulder / environment-from-your-eyes; avoid recurring face-on humans. This is what keeps a free model visually coherent across ~26 scenes and matches the "*your* life as a [X]" format.
- **Determinism:** fixed per-scene seed (derived from `slug + scene.id`), fixed model, fixed style suffix → re-runs reproduce byte-stable images. Images cached to `images/<slug>/tNN.jpg`; committed so cloud/Modal render is offline.
- **Source:** Pollinations (free, keyless). Model selected for painterly/depth-friendly output (see §3 constraint).
- **Failure handling:** retry + backoff on network/rate-limit; on final failure, write nothing and record the scene id in `images/<slug>/_fallback.json` so the renderer uses the doodle template. A whole-API outage degrades gracefully to today's doodle episode.
- **Cache reuse:** if a valid cached image+depth already exist for `(slug, scene.id, prompt-hash)`, skip regeneration.

## §3 — Depth + 2.5D camera engine

**Responsibility:** make still images feel like real camera moves.

- **Depth:** Depth Anything v2 produces a grayscale depth map per image. Runs locally (CPU/MPS) or on existing Modal infra (`modal_render.py` pattern); cost is pennies/free. Cached as `tNN.depth.png`.
- **Renderer:** new Remotion component `PhotoStage` in `src/` takes `{image, depthMap, move}` and displaces the image by depth to produce: **push-in, parallax pan, orbit-lite, rack-focus (depth-based blur), whip transition**. Move is chosen per scene (deterministic, e.g. by scene index) for variety.
- **Reuse existing safe patterns:** opacity/beat fades reuse the floored-fade pattern (`Video2.tsx` `ShotFade`, floored at 0.85; scene `beatOp` floored at 0.4) so there is no white-flash regression.
- **Honest constraint:** depth-parallax only reads well when the image has real depth (foreground↔background). The §4 style suffix therefore targets **layered painterly/illustrated** images, not flat vector cartoons. Validate on one test image before locking the style. For inherently flat scenes, the move degrades to a tasteful 2D Ken-Burns push, which is still acceptable.

## §4 — Style & consistency system (`ops/photo_style.json`)

Single config controlling the channel's entire look:

```json
{
  "visualMode": "photo",
  "model": "<pollinations model>",
  "styleSuffix": "cinematic illustrated, painterly depth, layered foreground and background, dramatic filmic lighting, muted cinematic palette, wide aspect",
  "povRules": "first-person or over-shoulder; environment from the viewer's eyes; avoid face-on recurring humans",
  "seedStrategy": "hash(slug + scene.id)",
  "moves": ["pushIn", "parallaxPan", "orbitLite", "rackFocus"]
}
```

Level cards, captions, and overlays render **over** `PhotoStage`, identical to today. Restyling the whole channel = editing one file.

## §5 — Autopilot safety & determinism

- **Mode toggle:** `ops/routine.json` gains `"visualMode": "photo" | "doodle"` (mirrored/overridable in `photo_style.json`). Default stays `doodle` until §6 pilot passes.
- **Guaranteed output:** per-scene fallback (§2) makes whole-episode failure impossible-by-design — worst case is today's doodle video.
- **Offline render:** images+depth generated and cached in build step 0.5, added to the render input set (alongside `content.py`, `src/`) so Modal/cloud render needs no network.
- **QA integration:** `qa_watch.py` already samples encoded frames; it now also catches blank/flat photo scenes and can trigger regen-or-fallback in the existing reviewer fix-loop.

## §6 — Rollout (owner-run, after build)

1. Ship with `visualMode="doodle"` default (no behavior change).
2. Manually build a few episodes with `visualMode="photo"`; eyeball quality, verify parallax reads as motion, verify no blank frames.
3. Compare retention/CTR against doodle episodes.
4. Flip default to `photo` only once it clearly wins. Doodle pipeline is never deleted.

## §7 — Future upgrades (not this build)

- **Photoreal:** swap Pollinations for paid FLUX-dev/Seedream (~$1–5/ep) — same pipeline, just the image source + style suffix change.
- **Real generated motion on hero shots:** 2–3 shots/ep via paid image-to-video, behind a manual reject gate.

## Testing

- **Unit:** prompt builder is a pure deterministic string; cache-hit logic; fallback-manifest writing; depth-map presence check.
- **Visual:** render a 3-scene slice in photo mode → `qa_watch` → assert no blank/flat frames and parallax motion present.
- **Integration:** full dry-run episode in photo mode (local + one Modal render) before enabling in autopilot.
- **Regression:** with `visualMode="doodle"`, output is byte-identical to pre-change (proves additive, non-breaking).

## Open validation items (resolve during implementation)

1. Confirm the best free Pollinations model for layered/painterly depth (test 3–5 style suffixes on one scene).
2. Confirm Depth Anything v2 runs acceptably local vs. needs Modal.
3. Decide where per-scene `visual` intent strings come from: add a `visual=` field to each `SCENES` dict, or derive from existing scene text. (Leaning: explicit `visual=` field, defaulted to a derivation, so authors can override.)
