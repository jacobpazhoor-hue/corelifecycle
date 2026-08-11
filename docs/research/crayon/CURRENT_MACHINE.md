# Phase 0 — Map of the Current CoreLifecycle Machine

Written before any Crayon Capital judgement, so the gap analysis is honest.
Line counts as of 2026-08-11, branch `main`.

## Pipeline (build.py, 63 lines)

```
0)  syntax-gate content.py (SCENES, FPS) + ops/episode_meta.json (title/hook/body/tags/thumb)
    -> sync ops/episode_meta.json  ->  src/episode_meta.json   (Thumbnail reads it)
0.5) gen_scene_images.py         NON-FATAL (photo visual mode; no-op while visualMode="doodle")
1)  gen_voice_edge.py            VO per scene -> public/audio/tNN.wav + src/timeline.json
    make_ambient.py              3-act numpy score -> public/music/ambient.wav
1b) duck_music.py                NON-FATAL: sidechain duck + SFX layer -> public/music/sfx.wav
2)  gate.py                      HALT on fail
3)  smoke render                 npx remotion still EveryLevelLawyer, frame 0 + midpoint
```
Autopilot renders full only on `BUILD OK`. `audio_master.py` runs post-render (2-pass EBU R128 -> −14 LUFS / −1 dBTP, video stream copied, AAC 192k).

## Renderer

| File | Lines | Role |
|---|---|---|
| `src/Video2.tsx` | 256 | Composition `EveryLevelLawyer`. Per-scene `Beat`; shot planning; color dramaturgy; overlays; audio tracks. |
| `src/director.tsx` | 188 | `FramedScene` (wide/medium/closeup framing + dolly), `CountUp`, `NumberReveal`, `FOCUS` face map. |
| `src/scenes.tsx` | 609 | `TEMPLATES` registry — 19 core (S00–S19) + spread of `PACK_TEMPLATES`. |
| `src/stage.tsx` | 3971 | 27 topic packs (GEN/MED/STARTUP/MILITARY/SPORTS/HEDGE/REALESTATE/SPY/ROMAN/MAFIA/DYNASTY/SAMURAI/CARTEL/OCEAN/BLACKMARKET/NORTHKOREA/ZOMBIE/WASTE/LOTTERY/YAKUZA/MONGOL/GLADIATOR/BRATVA/SPACE/OTTOMAN/PIRATE/BASKETBALL). ~358 template/prop FCs. |
| `src/figure.tsx` | 229 | `StickFigure` — pose rig, `Face`, 7 `COSTUMES`, hair caps, `episodeCostume()` topic->wardrobe. |
| `src/thumbs.tsx` | 593 | 12 thumbnail archetypes in `ARCHES`; `pick()` by `t.archetype` else topic hash. |
| `src/Brand.tsx` | 199 | Logo / banner. |

### Character (figure.tsx)
Stick figure, **thin ink strokes** (`lineW = 8`) in `#2a2620` on cream `#f6f2e9`. Segment lengths `spine 94 / head 36 / upperArm 50 / foreArm 46 / thigh 56 / shin 54`. Head = ellipse `rx 0.92R, ry R`, paper-filled, ink outline. Face = filled ellipse eyes with a white catchlight, Q-curve brows, 6 mouth shapes (`neutral/flat/frown/open/smirk/tight`). Costume = a quad "jacket" wrapped around the spine vector + collar V + tie, plus a filled hair cap (`crop`/`mop`/`tuft`).
**Hand-drawn feel comes from two effects:** an SVG `feTurbulence`+`feDisplacementMap` "rough" filter (`baseFrequency 0.02`, `numOctaves 2`, `scale 3.2`) and a whole-figure `boil()` wobble on a ~5fps "shot on threes" clock, amplitude scaled down at large scale.

### Motion / camera (director.tsx + Video2.tsx)
- Shot types + zoom: `wide 1.0 / medium 1.5 / closeup 2.2`; per-shot dolly push to `1.075 / 1.05 / 1.03`.
- Easing: `EXPO = cubic-bezier(0.16, 1, 0.3, 1)` (fast start, slow settle) everywhere.
- Organic handheld: `sin(f*0.03)*0.20 + noise1(f*0.045)*0.12` X, `noise1(f*0.05)*0.10` Y — sub-pixel.
- `planShots()`: <95f = 1 shot; <200f = wide + (closeup|medium) at 55/45; else wide/medium/closeup with closeup ≤64f (~2.1s) and only where `FOCUS[template]` exists. `MAX_SHOT = 240f (8s)` hard re-cut.
- Level cuts: whip-in 70px over 7f + decaying `shake` + a 2-frame flash (`rgba(255,244,222)` 0.5→0).
- Fades are **floored**, never to zero: scene `beatOp` floor 0.4, intra-scene `ShotFade` floor 0.85 (white-flash regression guard).
- Color dramaturgy: `levelProgress` 0→1 by ordinal level index drives a CSS-only grade — tint gold→teal→ember→gold (`opacity 0.08→0.32`, soft-light), darken `0→0.16` multiply, `saturate(1→1.42) contrast(1→1.18) brightness(1→0.9)`.
- Overlays: level chip top-left (33px, ls 6, gold left-border, solid `#f6f2e9` card); money card bottom-left, `CountUp` spring pop (damping 11, mass 0.6, stiffness 170) + growing gold bar + highlighter underline; red `#c0392b` swap on negative/cost beats.
- Background `PAPER = #ffffff`; light vignette (`inset 0 0 220px 10px rgba(22,16,9,0.13)`).

### Audio
- VO: edge-tts `en-US-AndrewMultilingualNeural`, **RATE +8% (~190 WPM)**, GAP 0.25s, LEAD 0.1s, silence-trimmed, breath prepended >48 words. 2nd voice `en-US-ChristopherNeural` for in-world dialogue (thinner EQ + 34/63ms room slaps).
- Voice master (`master()`): 48k resample, HP 85, de-mud 300, nasal trim 2.6k, presence shelf 3.7k (+3.3dB), de-ess 7k (−4.7dB), air 9.5k (+1.4dB), roll-off >13.5k, soft-knee tanh, normalize 0.95.
- Music: `make_ambient.py`, 44.1k numpy, 3 acts, minor roots `A1 G1 B1 E1 C2 A#1`, crossfaded at act breaks.
- SFX: `sfx_lib.py` — `whoosh/thud/stamp/riser/pop/coin/heartbeat` + 8 diegetic beds (`rain/roomhum/casino/cellblock/street/wind/crowd/night`) chosen by template keyword.
- Mix: ambient 0.16, sfx 0.5; duck floor 0.42 under VO, 0.18s smoothing; one 1.3s silence beat before the midpoint reversal.

### Gate (gate.py)
Timeline frames reconcile · runtime ≥ `routine.minMinutes` · every scene template in registry · per-scene audio present / 48k / rms ≥ 0.01 / peak < 0.999 · optional rendered-video size. Adjacent-template repeat = WARN only.

### Writer canon (docs/BIBLE.md)
2nd-person **present-tense POV**; ≥11 min, 28–34 scenes, 2200–2600 words, scenes 60–85 words; cold open in medias res; 6–8 level ladder; midpoint reversal at ~50%; loop close on cost. Bans perception filters ("you see/feel/notice"). Title `Your Life as a [X] at Every Level` + stakes parenthetical, 40–65 chars.
