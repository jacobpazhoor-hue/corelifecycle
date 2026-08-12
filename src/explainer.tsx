import React from 'react';
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {StickFigure, LIGHT, DIM} from './figure';
import {FACES} from './faces';
import * as A from './actions';
import {keyedTemplates, useSceneColors} from './stage';
import {
  INK, PAPER_WHITE, STROKE, STROKE_THIN, SceneKey, SCENE_KEY_BY_TEMPLATE, shade,
} from './crayonStyle';
import {
  SlabFloor, UnitWall, RibbedPanel, BuildingBand, BoxStack, CaseStack, Trolley, Cone,
  CrowdRow, CrowdHeads, Fence, useSceneTones,
} from './setdressing';

// ============================================================================
// EXPLAINER TEMPLATES — the environment set for the new format (WO-8f).
//
// WHY THIS FILE EXISTS. The channel is becoming a third-person explainer about real companies,
// people and financial scandals. docs/research/crayon/TEMPLATE_STRATEGY.md measured what that does
// to the template library: the legacy 358-template sprawl is a consequence of the OLD format's
// topic-locked packs (ROMAN, CARTEL, SAMURAI…), where "for any given episode, the long tail IS the
// episode" — rebuilding even the top 100 still leaves some episode 57% un-restyled. The explainer
// format instead runs on a narrow, repeating environment set of ~20-30 archetypes reused by every
// episode, which is exactly why the reference channel's frames can be dense: a small set gets the
// investment.
//
// This file is the first six of that set. The legacy templates in stage.tsx/scenes.tsx are NOT
// touched — they stay in the registry, unrestyled, for anyone who still wants the old format.
//
// RULES, all of them load-bearing and all inherited from CRAYON_BIBLE + WO-8d/8e:
//
//   - **Flat vector only. No gradients, anywhere, for any reason.** Chromium dithers every gradient
//     it paints — adjacent pixels alternate by ±1 even inside a purely vertical ramp — which is what
//     collapsed flat fill from ~99% to 29% in WO-8a. Solid `fill` or nothing.
//   - **Locked camera (§3).** Nothing here takes `frame` for whole-frame motion. `useCurrentFrame`
//     is read ONLY to pose the one or two hero figures; every wall, prop and crowd member is static,
//     so composing more set dressing can never cost motion-locality cells.
//   - **Density is the metric.** Flat fill is a DENSITY reading, not only a texture one: too HIGH
//     means the frame is empty. The reference band is 74-92% measured on native 1280×720, and the
//     same artwork reads ~6.5 points higher at 1920. Every template below was rendered natively at
//     both resolutions and measured, not downscaled.
//   - **Reuse before inventing.** Anything not specific to one archetype belongs in setdressing.tsx.
//     What is local to this file is a second tier — the *explainer furniture kit* below — shared by
//     two or more of the six templates. Only the last mile is per-template.
//   - **Grey anonymous crowd + colour hero (§6.5).** Background people are `DIM` (grey fills, pure
//     black outlines); the subject is the only figure in full colour.
// ============================================================================

/** Deterministic hash-noise in [0,1). Same generator scenes.tsx/stage.tsx/setdressing.tsx use, so a
 *  seeded layout renders identically on every machine and every frame (including cloud renders). */
const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1 + 31.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * director.tsx pins the money count-up card bottom-left (left 72, ~620 wide, ~330 tall), so anything
 * near the floor at x < this renders BEHIND it. Measured 2026-07-20; it silently ate the hero in two
 * scenes.tsx templates. Every hero below is staged to the right of it.
 */
const CAPTION_SAFE_X = 760;

// ---------------------------------------------------------------------------
// Frame
// ---------------------------------------------------------------------------

/**
 * The scene's flat full-frame ground plus the 1920×1080 authoring viewBox.
 *
 * scenes.tsx has its own private `Frame`; this is a deliberate copy rather than an import, because
 * that one also mounts `<Defs>` — two radial gradients left over from the doodle era. Nothing here
 * may reference a gradient, so the defs block is simply absent, which makes it impossible for a
 * template in this file to acquire one by accident.
 */
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{display: 'block'}}>
    <rect x={0} y={0} width={1920} height={1080} fill={useSceneColors().bg} />
    {children}
  </svg>
);

// ---------------------------------------------------------------------------
// THE EXPLAINER FURNITURE KIT
//
// The second tier of reuse. setdressing.tsx owns what is common to ALL crayon art (grounds, walls,
// crowds, boxes, fences); this owns what is common to the INDOOR-CORPORATE-AND-DOMESTIC world the
// explainer format lives in and nothing else needs — desks, screens, chairs, glazing, paperwork.
// Every component here is used by at least two of the six templates below; anything used once is
// written inline in its template instead, so this tier does not silently become a dumping ground.
// ---------------------------------------------------------------------------

/**
 * A suspended ceiling with a tile grid and recessed light panels.
 *
 * Built by FLIPPING `SlabFloor`: a ceiling and a floor are the same receding plane seen from the
 * other side, and `matrix(1 0 0 -1 0 y)` maps the region [0,y] onto [y,0], so the slab joints
 * converge at the wall line and splay toward the frame edge exactly as they should. Reusing the
 * component also means a ceiling picks up the same `farBand` depth rung the floor does, for free.
 */
const Ceiling: React.FC<{y?: number; lights?: number; fill?: string}> = ({y = 200, lights = 4, fill}) => {
  const tn = useSceneTones();
  const panel = fill ?? tn.back;
  return (
    <g>
      <g transform={`matrix(1 0 0 -1 0 ${y})`}>
        <SlabFloor y={0} bottom={y} cols={19} rows={6} fill={panel} opacity={0.22} />
      </g>
      {/* recessed fittings: a white panel in a dark reveal. The one honest bit of white in a dark
          interior, and what stops the top eighth of an interior frame reading as an empty band. */}
      {Array.from({length: lights}, (_, i) => {
        const w = 1920 / (lights + 0.6);
        const cx = w * 0.55 + i * w;
        return (
          <g key={i}>
            <rect x={cx - w * 0.3} y={y * 0.28} width={w * 0.6} height={y * 0.3} fill={shade(panel, -2)}
              stroke={INK} strokeWidth={STROKE_THIN} />
            <rect x={cx - w * 0.26} y={y * 0.33} width={w * 0.52} height={y * 0.2} fill={PAPER_WHITE} />
            <line x1={cx} y1={y * 0.33} x2={cx} y2={y * 0.53} stroke={INK} strokeWidth={STROKE_THIN * 0.5} opacity={0.5} />
          </g>
        );
      })}
    </g>
  );
};

/**
 * A run of glazing — a curtain wall, an office window, a shopfront, a living-room window.
 *
 * `pane` fills the opening; pass `null` to leave it unpainted, which is how a caller puts something
 * BEHIND the glass (draw the sky and the skyline first, then lay the mullions over the top). There
 * is no clip path and no mask: the caller sizes its own content to the opening, because a clip is
 * one more thing that can silently swallow art the metrics cannot see.
 */
const Glazing: React.FC<{
  x: number; y: number; w: number; h: number; bays?: number; rows?: number;
  pane?: string | null; sill?: boolean;
}> = ({x, y, w, h, bays = 3, rows = 1, pane, sill = true}) => {
  const tn = useSceneTones();
  const glass = pane === null ? null : (pane ?? tn.deep);
  const bar = shade(tn.body, -2);
  return (
    <g>
      {glass && <rect x={x} y={y} width={w} height={h} fill={glass} />}
      {/* mullions: solid bars, not lines, so they read as frame members at 1920 */}
      {Array.from({length: bays - 1}, (_, i) => (
        <rect key={'m' + i} x={x + (w * (i + 1)) / bays - 7} y={y} width={14} height={h} fill={bar}
          stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
      ))}
      {Array.from({length: rows - 1}, (_, i) => (
        <rect key={'t' + i} x={x} y={y + (h * (i + 1)) / rows - 7} width={w} height={14} fill={bar}
          stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
      ))}
      <rect x={x} y={y} width={w} height={h} fill="none" stroke={INK} strokeWidth={STROKE} />
      {sill && <rect x={x - 16} y={y + h} width={w + 32} height={20} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />}
    </g>
  );
};

/**
 * A desk / table / counter seen head-on: a light top slab over a darker apron, on square legs.
 *
 * Deliberately NOT drawn in perspective. The reference's desks are near-orthographic slabs
 * (wolf_office_singleframe, the 3:34 office), and a foreshortened top is a large flat quadrilateral
 * that buys nothing but flat-fill budget.
 */
const Desk: React.FC<{
  x: number; y: number; w: number; h?: number; legH?: number; fill?: string; drawers?: number;
}> = ({x, y, w, h = 34, legH = 120, fill, drawers = 0}) => {
  const tn = useSceneTones();
  const top = fill ?? tn.card;
  const apron = shade(top, -2);
  return (
    <g>
      {/* legs first, so the apron's outline crosses in front of them */}
      <rect x={x + 22} y={y + h} width={26} height={legH} fill={apron} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x + w - 48} y={y + h} width={26} height={legH} fill={apron} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x} y={y + h} width={w} height={h * 1.5} fill={apron} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 10} y={y} width={w + 20} height={h} rx={6} fill={top} stroke={INK} strokeWidth={STROKE} />
      {Array.from({length: drawers}, (_, i) => (
        <g key={i}>
          <rect x={x + w - 250 + i * 0} y={y + h + h * 1.5 + i * 62} width={230} height={54} fill={top}
            stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={x + w - 175} y={y + h + h * 1.5 + i * 62 + 24} width={80} height={9} rx={4} fill={INK} />
        </g>
      ))}
    </g>
  );
};

/**
 * A monitor / CRT / wall display. `content` picks what is on the glass:
 *   'text'  — ruled lines, a document or an order blotter
 *   'chart' — a candle/step line over a baseline, the scene's accent
 *   'grid'  — a quote grid, dense blocks of figures
 * A screen is the densest cheap prop in an office frame and the one place a dark interior gets a
 * legitimate patch of light, so every desk below carries at least one.
 */
const Monitor: React.FC<{
  x: number; y: number; w?: number; h?: number; content?: 'text' | 'chart' | 'grid';
  stand?: boolean; seed?: number;
}> = ({x, y, w = 190, h = 132, content = 'text', stand = true, seed = 0}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const glass = shade(tn.deep, -1);
  const pad = 14;
  const ix = x + pad, iy = y + pad, iw = w - pad * 2, ih = h - pad * 2;
  return (
    <g>
      {stand && (
        <g>
          <rect x={x + w / 2 - 14} y={y + h} width={28} height={26} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <rect x={x + w / 2 - 52} y={y + h + 24} width={104} height={13} rx={5} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      )}
      <rect x={x} y={y} width={w} height={h} rx={8} fill={tn.body} stroke={INK} strokeWidth={STROKE * 0.75} />
      <rect x={ix} y={iy} width={iw} height={ih} fill={glass} />
      {content === 'text' && Array.from({length: 6}, (_, i) => (
        <rect key={i} x={ix + 8} y={iy + 10 + i * (ih - 16) / 6} width={iw * (0.4 + rnd(seed * 31 + i) * 0.5)}
          height={Math.max(4, ih * 0.055)} fill={PAPER_WHITE} opacity={0.85} />
      ))}
      {content === 'chart' && (
        <g>
          <polyline
            points={Array.from({length: 9}, (_, i) =>
              `${ix + 6 + (i * (iw - 12)) / 8},${iy + ih * (0.82 - 0.6 * rnd(seed * 17 + i))}`).join(' ')}
            fill="none" stroke={c.accent} strokeWidth={STROKE_THIN * 0.9} strokeLinejoin="round" />
          <line x1={ix + 4} y1={iy + ih * 0.9} x2={ix + iw - 4} y2={iy + ih * 0.9} stroke={PAPER_WHITE} strokeWidth={2} opacity={0.6} />
        </g>
      )}
      {content === 'grid' && Array.from({length: 12}, (_, i) => (
        <rect key={i} x={ix + 7 + (i % 3) * (iw / 3)} y={iy + 8 + Math.floor(i / 3) * (ih / 4)}
          width={iw / 3 - 14} height={Math.max(4, ih * 0.09)}
          fill={rnd(seed * 53 + i) > 0.68 ? c.accent : PAPER_WHITE} opacity={0.85} />
      ))}
    </g>
  );
};

/** A keyboard slab with key rows — the small prop that turns a desk into a workstation. */
const Keyboard: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 178}) => {
  const tn = useSceneTones();
  return (
    <g>
      <rect x={x} y={y} width={w} height={26} rx={5} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      {Array.from({length: 3}, (_, r) => (
        <line key={r} x1={x + 8} y1={y + 7 + r * 6} x2={x + w - 8} y2={y + 7 + r * 6}
          stroke={INK} strokeWidth={1.6} opacity={0.5} />
      ))}
    </g>
  );
};

/**
 * A swivel chair in profile — back, seat, gas post, five-star base on castors.
 * `back` draws it seen from behind (the reference's 3:34 office foreground), which is how an empty
 * chair in the near plane buys depth without a large black silhouette mass.
 */
const Chair: React.FC<{x: number; y: number; s?: number; facing?: number; fill?: string}> =
({x, y, s = 1, facing = 1, fill}) => {
  const tn = useSceneTones();
  const skin = fill ?? shade(tn.body, -1);
  return (
    <g>
      <rect x={x - 58 * s} y={y - 250 * s} width={116 * s} height={150 * s} rx={22 * s} fill={skin}
        stroke={INK} strokeWidth={STROKE * 0.8} />
      <line x1={x - 40 * s} y1={y - 178 * s} x2={x + 40 * s} y2={y - 178 * s} stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.5} />
      <rect x={x - 66 * s + facing * 12 * s} y={y - 106 * s} width={132 * s} height={26 * s} rx={10 * s}
        fill={skin} stroke={INK} strokeWidth={STROKE * 0.7} />
      <rect x={x - 8 * s} y={y - 82 * s} width={16 * s} height={54 * s} fill={INK} />
      {[-1, -0.45, 0.45, 1].map((k, i) => (
        <g key={i}>
          <line x1={x} y1={y - 30 * s} x2={x + k * 62 * s} y2={y - 6 * s} stroke={INK} strokeWidth={STROKE_THIN * 1.1} strokeLinecap="round" />
          <circle cx={x + k * 62 * s} cy={y} r={8 * s} fill={INK} />
        </g>
      ))}
    </g>
  );
};

/** A loose scatter of paper on a surface: overlapping ruled sheets, slightly rotated. */
const Papers: React.FC<{x: number; y: number; n?: number; s?: number; seed?: number}> =
({x, y, n = 3, s = 1, seed = 0}) => (
  <g>
    {Array.from({length: n}, (_, i) => {
      const r = seed * 211 + i * 9;
      const px = x + (rnd(r) - 0.5) * 60 * s;
      const py = y - i * 5 * s;
      const rot = (rnd(r + 2) - 0.5) * 26;
      return (
        <g key={i} transform={`rotate(${rot} ${px} ${py})`}>
          <rect x={px - 52 * s} y={py - 34 * s} width={104 * s} height={68 * s} fill={PAPER_WHITE}
            stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          {Array.from({length: 4}, (_, k) => (
            <line key={k} x1={px - 40 * s} y1={py - 22 * s + k * 14 * s} x2={px + (k === 3 ? 12 : 40) * s}
              y2={py - 22 * s + k * 14 * s} stroke={INK} strokeWidth={1.8 * s} opacity={0.55} />
          ))}
        </g>
      );
    })}
  </g>
);

/** A desk telephone — base, keypad, cradled handset, coiled cord. The reference office's one
 *  unmissable prop (wolf_office_singleframe, every cell). */
const DeskPhone: React.FC<{x: number; y: number; s?: number; facing?: number}> = ({x, y, s = 1, facing = 1}) => (
  <g>
    <path d={`M ${x} ${y} L ${x + 128 * s} ${y} L ${x + 116 * s} ${y - 44 * s} L ${x + 10 * s} ${y - 44 * s} Z`}
      fill={INK} stroke={INK} strokeWidth={STROKE_THIN * 0.8} strokeLinejoin="round" />
    {Array.from({length: 6}, (_, i) => (
      <rect key={i} x={x + 22 * s + (i % 3) * 22 * s} y={y - 34 * s + Math.floor(i / 3) * 16 * s}
        width={13 * s} height={9 * s} fill={PAPER_WHITE} opacity={0.75} />
    ))}
    <rect x={x + 4 * s} y={y - 62 * s} width={124 * s} height={24 * s} rx={11 * s} fill={INK} />
    <path d={`M ${x + (facing > 0 ? 128 : 4) * s} ${y - 30 * s} q ${facing * 30 * s} ${16 * s} ${facing * 6 * s} ${30 * s}`}
      fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
  </g>
);

/**
 * A head-and-shoulders portrait, flat: hair mass, face, collar, shoulders. Small enough to sit
 * inside a picture frame or a newspaper's photo box, which are the two places the format needs one
 * (a wall of directors, a front-page mugshot). Kept STROKE-heavy so it still reads at 90px.
 */
const Portrait: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
  const tn = useSceneTones();
  return (
    <g>
      <path d={`M ${cx - r * 1.7} ${cy + r * 2.2} Q ${cx} ${cy + r * 0.3} ${cx + r * 1.7} ${cy + r * 2.2} Z`}
        fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <ellipse cx={cx} cy={cy} rx={r * 0.92} ry={r} fill={shade(tn.card, 2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <path d={`M ${cx - r * 0.92} ${cy - r * 0.16} Q ${cx - r * 0.8} ${cy - r * 1.2} ${cx} ${cy - r * 1.06}
                Q ${cx + r * 0.8} ${cy - r * 1.2} ${cx + r * 0.92} ${cy - r * 0.16}
                Q ${cx + r * 0.5} ${cy - r * 0.62} ${cx} ${cy - r * 0.56}
                Q ${cx - r * 0.5} ${cy - r * 0.62} ${cx - r * 0.92} ${cy - r * 0.16} Z`} fill={INK} />
      <circle cx={cx - r * 0.32} cy={cy + r * 0.06} r={r * 0.11} fill={INK} />
      <circle cx={cx + r * 0.32} cy={cy + r * 0.06} r={r * 0.11} fill={INK} />
      <path d={`M ${cx - r * 0.26} ${cy + r * 0.54} q ${r * 0.26} ${r * 0.16} ${r * 0.52} 0`}
        fill="none" stroke={INK} strokeWidth={Math.max(2, r * 0.09)} strokeLinecap="round" />
      <rect x={cx - r * 0.22} y={cy + r * 1.0} width={r * 0.44} height={r * 1.0} fill={PAPER_WHITE}
        stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
    </g>
  );
};

/**
 * A framed thing on a wall: a chart board, a picture, a certificate, a portrait.
 * `art` selects the flat content — 'bars' (a chart), 'line' (a trend), 'scape' (a landscape),
 * 'head' (a portrait). Used by the boardroom, the trading floor, the office and the living room,
 * which is most of what a wall between waist height and the ceiling is made of.
 */
const WallFrame: React.FC<{
  x: number; y: number; w: number; h: number; art?: 'bars' | 'line' | 'scape' | 'head' | 'blank';
  seed?: number; ground?: string;
}> = ({x, y, w, h, art = 'bars', seed = 0, ground}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const face = ground ?? PAPER_WHITE;
  const ix = x + 16, iy = y + 16, iw = w - 32, ih = h - 32;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE * 0.9} />
      <rect x={ix} y={iy} width={iw} height={ih} fill={face} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {art === 'bars' && (
        <g>
          {Array.from({length: 7}, (_, i) => {
            const bh = ih * (0.2 + rnd(seed * 41 + i) * 0.66);
            return <rect key={i} x={ix + 14 + (i * (iw - 28)) / 7} y={iy + ih - 12 - bh}
              width={(iw - 28) / 7 - 10} height={bh} fill={i === 6 ? c.accent : tn.body}
              stroke={INK} strokeWidth={STROKE_THIN * 0.6} />;
          })}
          <line x1={ix + 8} y1={iy + ih - 12} x2={ix + iw - 8} y2={iy + ih - 12} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      )}
      {art === 'line' && (
        <g>
          <polyline points={Array.from({length: 8}, (_, i) =>
            `${ix + 10 + (i * (iw - 20)) / 7},${iy + ih * (0.85 - 0.68 * (i / 7) * (0.6 + rnd(seed * 23 + i) * 0.7))}`).join(' ')}
            fill="none" stroke={c.accent} strokeWidth={STROKE_THIN * 1.2} strokeLinejoin="round" />
          <line x1={ix + 8} y1={iy + ih - 12} x2={ix + iw - 8} y2={iy + ih - 12} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <line x1={ix + 12} y1={iy + 8} x2={ix + 12} y2={iy + ih - 12} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      )}
      {art === 'scape' && (
        <g>
          <rect x={ix} y={iy} width={iw} height={ih * 0.55} fill={shade(c.bg, 1)} />
          <rect x={ix} y={iy + ih * 0.55} width={iw} height={ih * 0.45} fill={tn.floor} />
          <path d={`M ${ix} ${iy + ih * 0.55} L ${ix + iw * 0.3} ${iy + ih * 0.2} L ${ix + iw * 0.56} ${iy + ih * 0.55} Z`} fill={tn.body} />
          <path d={`M ${ix + iw * 0.44} ${iy + ih * 0.55} L ${ix + iw * 0.74} ${iy + ih * 0.28} L ${ix + iw} ${iy + ih * 0.55} Z`} fill={tn.deep} />
          <circle cx={ix + iw * 0.82} cy={iy + ih * 0.2} r={ih * 0.1} fill={c.accent} />
        </g>
      )}
      {art === 'head' && (
        <Portrait cx={ix + iw / 2} cy={iy + ih * 0.5} r={Math.min(iw, ih) * 0.3} />
      )}
    </g>
  );
};

/**
 * Blocks of set type, drawn as geometry rather than as text.
 *
 * WHY NOT REAL TEXT. These templates are TOPIC-AGNOSTIC archetypes (the same contract scenes.tsx's
 * header states) — the episode's actual words arrive from director.tsx as overlays, so a literal
 * headline baked into the art would be wrong for every episode but one. What a headline contributes
 * to a FRAME is its shape and weight, and that is what this draws: word-length runs with a serif
 * slab at each end, which is what reads as a serif masthead at frame scale (bible §6.7).
 */
const SerifWords: React.FC<{
  x: number; y: number; w: number; h: number; words?: number; seed?: number; fill?: string; serif?: boolean;
}> = ({x, y, w, h, words = 3, seed = 0, fill, serif = true}) => {
  const ink = fill ?? INK;
  const out: React.ReactNode[] = [];
  const gap = Math.max(1.6, h * 0.16);
  let cx = x;
  for (let i = 0; i < words; i++) {
    const r = seed * 401 + i * 13;
    // A word is drawn LETTER BY LETTER. The first pass drew each word as one solid slab, and three
    // stacked slabs read as a redacted document rather than as a headline. Per-letter blocks read as
    // set type at frame scale — and they are also the cheapest density in the file, since a headline
    // goes from 1 edge pair to ~5.
    const letters = 3 + Math.floor(rnd(r) * 4);
    const widths = Array.from({length: letters}, (_, k) => h * (0.4 + rnd(r + k * 3) * 0.3));
    const ww = widths.reduce((a, b) => a + b, 0) + gap * (letters - 1);
    if (cx + ww > x + w) break;      // never run past the box; a short line reads as ragged setting
    let lx = cx;
    for (let k = 0; k < letters; k++) {
      out.push(<rect key={`${i}_${k}`} x={lx} y={y} width={widths[k]} height={h} fill={ink} />);
      lx += widths[k] + gap;
    }
    // the serif: a foot rule under the whole word, which is what a slab face reads as at this size
    if (serif) {
      out.push(<rect key={'f' + i} x={cx} y={y + h} width={ww} height={Math.max(1.6, h * 0.14)} fill={ink} />);
    }
    cx += ww + h * 0.6;
  }
  return <g>{out}</g>;
};

/** Ruled body copy — a column of thin ink lines with a ragged last line. */
const TextLines: React.FC<{
  x: number; y: number; w: number; n: number; gap?: number; th?: number; seed?: number; opacity?: number;
}> = ({x, y, w, n, gap = 13, th = 4, seed = 0, opacity = 0.8}) => (
  <g fill={INK} opacity={opacity}>
    {Array.from({length: n}, (_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w * (i === n - 1 ? 0.42 + rnd(seed + i) * 0.3 : 0.86 + rnd(seed * 7 + i) * 0.14)} height={th} />
    ))}
  </g>
);

/** A potted plant — pot, soil line, five flat leaves. Two of the six use one. */
const Plant: React.FC<{x: number; y: number; s?: number; seed?: number}> = ({x, y, s = 1, seed = 0}) => {
  const tn = useSceneTones();
  return (
    <g>
      {Array.from({length: 6}, (_, i) => {
        const a = -70 + i * 28 + (rnd(seed * 17 + i) - 0.5) * 12;
        const len = (110 + rnd(seed * 7 + i) * 70) * s;
        const rad = (a * Math.PI) / 180;
        const tx = x + Math.sin(rad) * len, ty = y - 70 * s - Math.cos(rad) * len;
        return <path key={i} d={`M ${x} ${y - 66 * s} Q ${(x + tx) / 2 + 30 * s} ${(y - 66 * s + ty) / 2} ${tx} ${ty}
          Q ${(x + tx) / 2 - 26 * s} ${(y - 66 * s + ty) / 2} ${x} ${y - 66 * s} Z`}
          fill={shade(tn.body, 2)} stroke={INK} strokeWidth={STROKE_THIN} />;
      })}
      <path d={`M ${x - 46 * s} ${y - 74 * s} L ${x + 46 * s} ${y - 74 * s} L ${x + 34 * s} ${y} L ${x - 34 * s} ${y} Z`}
        fill={tn.card} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={x - 48 * s} y={y - 84 * s} width={96 * s} height={16 * s} rx={5 * s} fill={shade(tn.card, -1)}
        stroke={INK} strokeWidth={STROKE_THIN} />
    </g>
  );
};

/**
 * A seated row of grey anonymous workers.
 *
 * setdressing's `CrowdRow` only stands — every interior in this format is full of people SITTING, at
 * desks and around tables, and a standing row behind a desk reads as a queue. Static at frame 0 for
 * the same reason CrowdRow is: a crowd must never cost camera-lock cells.
 */
const SeatedRow: React.FC<{
  y: number; x0: number; x1: number; n: number; scale?: number; seed?: number; facing?: number;
  view?: 'front' | 'profile' | 'back'; working?: boolean;
}> = ({y, x0, x1, n, scale = 0.8, seed = 0, facing = 1, view = 'front', working = false}) => {
  const step = n > 1 ? (x1 - x0) / (n - 1) : 0;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const s = seed * 173 + i * 19;
        return (
          <StickFigure
            key={i}
            pose={working ? A.type_(0, 30) : A.sit(0)}
            x={x0 + i * step + (rnd(s) - 0.5) * step * 0.18}
            y={y + (rnd(s + 4) - 0.5) * 14}
            scale={scale * (0.95 + rnd(s + 2) * 0.1)}
            facing={view === 'front' ? (rnd(s + 6) > 0.5 ? facing : -facing) : facing}
            view={view}
            pal={DIM}
            showFace={false}
            frame={0}
          />
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// 1. officeFloor — cubicles/desks, monitors, chairs, filing cabinets, papers, background workers
//
// Keyed `interior`: the reference's own office is a brown/near-black key — dark filing cabinets, a
// tan box, a navy suit, white paper (docs/research/crayon/frames/wolf_office_singleframe.jpg).
//
// Four planes: back wall (cabinets / notice board / door / glazing / shelving), the cubicle bank and
// its heads-over-partitions crowd, the near desk bank with the coloured hero, and an empty swivel
// chair in the near plane for depth — the reference's 3:34 office does exactly this, and a chair
// back is unambiguous where a black silhouette mound is not.
// ---------------------------------------------------------------------------
const OFFICE_WALL = 756;   // where the back wall meets the floor
const OFFICE_DESK = 902;   // near desk top

const OfficeFloor: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <Frame>
      <Ceiling y={190} lights={4} />
      {/* boxed service duct with hanger straps and sprinkler heads — a real office ceiling is not a
          plane, and this band is what stops the top sixth of the frame reading as one colour */}
      <rect x={0} y={190} width={1920} height={34} fill={tn.back} stroke={INK} strokeWidth={STROKE_THIN} />
      {Array.from({length: 16}, (_, i) => (
        <rect key={i} x={30 + i * 120} y={184} width={15} height={46} fill={tn.deep} stroke={INK} strokeWidth={2.4} />
      ))}
      {Array.from({length: 8}, (_, i) => (
        <circle key={'s' + i} cx={140 + i * 232} cy={244} r={9} fill={tn.deep} stroke={INK} strokeWidth={2.6} />
      ))}
      {/* --- back wall: a demountable partition system, so it carries panel joints rather than being
          the single largest flat region in the frame --- */}
      {Array.from({length: 20}, (_, i) => (
        <line key={i} x1={i * 98} y1={224} x2={i * 98} y2={OFFICE_WALL} stroke={INK} strokeWidth={2.4} opacity={0.3} />
      ))}
      <line x1={0} y1={470} x2={1920} y2={470} stroke={INK} strokeWidth={2.4} opacity={0.3} />
      <rect x={0} y={OFFICE_WALL - 34} width={1920} height={34} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the filing wall, straight off the reference frame: 3 columns × 4 drawers, dark carcass */}
      <UnitWall x={26} y={372} w={404} h={384} cols={3} rows={4} />
      <BoxStack x={150} baseY={372} n={2} s={0.58} seed={3} />
      <BoxStack x={330} baseY={372} n={1} s={0.5} seed={9} />
      <WallFrame x={54} y={266} w={166} h={92} art="line" seed={31} />
      <WallFrame x={250} y={266} w={166} h={92} art="bars" seed={33} />
      {/* notice board: pinned paper is the cheapest honest density on an office wall */}
      <rect x={470} y={288} width={336} height={270} fill={tn.card} stroke={INK} strokeWidth={STROKE} />
      {Array.from({length: 9}, (_, i) => {
        const px = 498 + (i % 3) * 100, py = 314 + Math.floor(i / 3) * 76;
        return (
          <g key={i} transform={`rotate(${(rnd(i * 5) - 0.5) * 14} ${px + 34} ${py + 26})`}>
            <rect x={px} y={py} width={70} height={56} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
            <TextLines x={px + 8} y={py + 12} w={54} n={3} gap={11} th={3} seed={i * 3} opacity={0.6} />
            <circle cx={px + 35} cy={py + 6} r={5} fill={c.accent} />
          </g>
        );
      })}
      {/* credenza under the board, with files and paperwork landed on it */}
      <UnitWall x={470} y={596} w={336} h={160} cols={3} rows={1} />
      <CaseStack x={548} baseY={596} n={3} s={0.48} seed={23} />
      <Papers x={720} y={584} n={2} s={0.58} seed={27} />
      {/* flush door with a vision panel, under a lit exit sign */}
      <RibbedPanel x={846} y={352} w={182} h={404} ribs={2} dir="v" />
      <rect x={886} y={392} width={102} height={128} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <circle cx={1004} cy={572} r={9} fill={INK} />
      <rect x={874} y={294} width={126} height={44} rx={6} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <SerifWords x={892} y={308} w={92} h={17} words={1} seed={2} fill={PAPER_WHITE} serif={false} />
      {/* window onto the block opposite — lit slabs behind the glass, then the mullions over them */}
      <rect x={1086} y={278} width={520} height={296} fill={shade(tn.deep, -1)} />
      {Array.from({length: 33}, (_, i) => (
        <rect key={i} x={1100 + (i % 11) * 46} y={300 + Math.floor(i / 11) * 90} width={26} height={54}
          fill={rnd(i * 11) > 0.45 ? c.accent : shade(tn.deep, 0)} opacity={0.85} />
      ))}
      <Glazing x={1086} y={278} w={520} h={296} bays={4} rows={2} pane={null} />
      {/* radiator under the sill, and a fire extinguisher on the pier beside it */}
      <RibbedPanel x={1124} y={628} w={444} h={128} ribs={13} dir="v" />
      <rect x={1624} y={624} width={40} height={96} rx={12} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={1636} y={604} width={16} height={24} fill={INK} />
      {/* ring-binder shelving */}
      <UnitWall x={1690} y={344} w={206} h={412} cols={1} rows={4} handle={false} />
      {Array.from({length: 42}, (_, i) => {
        const col = i % 7, row = Math.floor(i / 7);
        return <rect key={i} x={1706 + col * 26} y={366 + row * 102} width={20} height={72 + rnd(i * 3) * 14}
          fill={rnd(i * 7) > 0.7 ? c.accent : shade(tn.card, -(i % 3))}
          stroke={INK} strokeWidth={2.4} />;
      })}
      <circle cx={1044} cy={234} r={38} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <line x1={1044} y1={234} x2={1044} y2={210} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <line x1={1044} y1={234} x2={1062} y2={244} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />

      {/* --- floor --- */}
      <SlabFloor y={OFFICE_WALL} cols={26} rows={10} />

      {/* --- cubicle bank: workers behind partitions, heads and shoulders showing over the top.
          Figures first, partitions over them: the partition line crossing their chests is what puts
          them BEHIND it rather than standing loose on the floor. --- */}
      <SeatedRow y={766} x0={90} x1={660} n={4} scale={0.56} seed={5} working view="front" />
      <SeatedRow y={766} x0={1258} x1={1834} n={4} scale={0.56} seed={11} working view="front" />
      <RibbedPanel x={20} y={706} w={744} h={192} ribs={11} dir="v" fill={tn.back} />
      <RibbedPanel x={1160} y={706} w={744} h={192} ribs={11} dir="v" fill={tn.back} />
      {[20, 1160].map((px, i) => (
        <g key={i}>
          <rect x={px} y={698} width={744} height={18} rx={8} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          {/* returns coming toward the viewer at each end of the run */}
          <rect x={px + (i ? 726 : 0)} y={706} width={18} height={192} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        </g>
      ))}
      {/* surface-run conduit dropping from the duct to the sockets — an office wall is never bare */}
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.8} fill="none" opacity={0.55}>
        <path d="M 452 230 L 452 640 L 470 640" />
        <path d="M 1638 230 L 1638 300" />
        <path d="M 820 230 L 820 296" />
      </g>
      <rect x={440} y={636} width={26} height={120} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the aisle between the banks: cooler, bin, archive boxes, a colleague crossing */}
      <rect x={800} y={764} width={78} height={26} rx={6} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={806} y={676} width={66} height={92} rx={10} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} opacity={0.85} />
      <rect x={800} y={790} width={78} height={104} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
      <BoxStack x={1076} baseY={880} n={3} s={0.6} seed={21} />
      <RibbedPanel x={912} y={794} w={82} h={100} ribs={6} dir="v" fill={tn.body} />
      <StickFigure pose={A.stand(0)} x={1000} y={790} scale={0.72} facing={-1} view="profile"
        pal={DIM} showFace={false} frame={0} />

      {/* --- near plane: the hero's desk bank ---
          The figures go down BEFORE the desk so the slab occludes their laps; the props go down
          after it. The hero's slot (x 1180-1480) is deliberately kept clear of every monitor —
          in the first render a 196px monitor sat exactly on him and swallowed the only colour
          in the frame. */}
      <Chair x={1330} y={1054} s={1.05} facing={-1} />
      <StickFigure pose={A.type_(f, 30)} x={1330} y={966} scale={1.02} facing={-1} view="front"
        expr={FACES.focused} pal={LIGHT} frame={f} />
      <SeatedRow y={968} x0={1062} x1={1062} n={1} scale={0.96} seed={31} working view="front" />
      <Desk x={560} y={OFFICE_DESK} w={1120} legH={146} drawers={0} />
      {/* drawer pedestals under the slab, and the cable run behind them */}
      {[642, 1544].map((px, i) => (
        <g key={i}>
          <rect x={px} y={OFFICE_DESK + 40} width={158} height={140} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={px + 8} y={OFFICE_DESK + 48 + r * 44} width={142} height={38} fill={shade(tn.card, -1)}
                stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
              <rect x={px + 58} y={OFFICE_DESK + 64 + r * 44} width={42} height={7} rx={3} fill={INK} />
            </g>
          ))}
        </g>
      ))}
      <path d={`M 820 ${OFFICE_DESK + 92} q 120 44 250 6 q 130 -38 250 10 q 120 46 200 -8`}
        fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.6} />
      <Monitor x={598} y={OFFICE_DESK - 152} w={182} h={140} content="chart" seed={8} />
      <Monitor x={824} y={OFFICE_DESK - 146} w={176} h={134} content="text" seed={4} />
      <Keyboard x={614} y={OFFICE_DESK - 4} w={158} />
      <Keyboard x={840} y={OFFICE_DESK - 4} w={150} />
      <DeskPhone x={1502} y={OFFICE_DESK - 2} s={0.9} />
      <Papers x={1214} y={OFFICE_DESK - 18} n={3} s={0.74} seed={6} />
      <rect x={1450} y={OFFICE_DESK - 42} width={40} height={40} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <path d={`M 1490 ${OFFICE_DESK - 34} q 20 8 0 18`} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <BoxStack x={1618} baseY={OFFICE_DESK - 2} n={1} s={0.72} seed={14} />
      {/* the near, empty chair — foreground depth without a large black mass */}
      <Chair x={430} y={1080} s={1.5} facing={1} fill={shade(tn.body, -2)} />
      <Papers x={1636} y={1050} n={2} s={0.9} seed={17} />
      <Plant x={1844} y={1080} s={1.05} seed={12} />
      <BoxStack x={132} baseY={1074} n={2} s={0.9} seed={19} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 2. boardroom — long table, seated figures, wall screen or chart, window wall
//
// Keyed `grey`: the institutional/bureaucratic key, consistent with the canon's existing
// `boardroomNotes`/`boardroomHead` mapping in SCENE_KEY_BY_TEMPLATE.
//
// The window wall is drawn as GLASS WITH A CITY BEHIND IT — sky tone, then a two-deep BuildingBand,
// then the mullions over the top. That is one reuse of the library doing the work of a bespoke
// backdrop, and it gives the frame a real second depth plane through the glass.
// ---------------------------------------------------------------------------
const BOARD_WALL = 700;
const BOARD_TABLE = 866;

const Boardroom: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <Frame>
      <Ceiling y={172} lights={3} />
      {/* --- the curtain wall, and the city seen through it --- */}
      <rect x={556} y={214} width={1364} height={486} fill={shade(c.bg, 2)} />
      <BuildingBand baseY={700} x0={560} x1={1930} n={9} seed={31} depth={2} minH={120} maxH={300} opacity={0.55} />
      <BuildingBand baseY={700} x0={540} x1={1940} n={6} seed={7} depth={1} minH={90} maxH={230} />
      <Glazing x={556} y={214} w={1364} h={486} bays={6} rows={3} pane={null} sill={false} />
      {/* --- the left wall: presentation screen, charts, a credenza --- */}
      <rect x={0} y={172} width={560} height={528} fill={tn.panel} stroke={INK} strokeWidth={STROKE_THIN} />
      <WallFrame x={40} y={216} w={470} h={272} art="line" seed={5} />
      {/* NOT portraits. Three framed heads at exactly seated-head height, on the wall directly
          behind the far side of the table, read as three men standing in lit doorways — the
          composition defect neither metric can see. Charts carry the same density with no
          ambiguity about what is a person and what is on the wall. */}
      <WallFrame x={40} y={506} w={148} h={172} art="bars" seed={2} />
      <WallFrame x={206} y={506} w={148} h={172} art="line" seed={9} />
      <WallFrame x={372} y={506} w={148} h={172} art="scape" seed={14} />
      <rect x={0} y={670} width={1920} height={30} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* --- floor, with a bordered rug under the table --- */}
      <SlabFloor y={BOARD_WALL} cols={24} rows={10} />
      <path d="M 244 890 L 1700 890 L 1900 1080 L 40 1080 Z" fill={shade(tn.floor, 2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 288 918 L 1656 918 L 1826 1064 L 116 1064 Z" fill="none" stroke={INK} strokeWidth={STROKE_THIN} opacity={0.55} />
      {/* credenza against the window wall, with a water tray and a phone */}
      <UnitWall x={1500} y={606} w={392} h={96} cols={4} rows={1} />
      {Array.from({length: 5}, (_, i) => (
        <rect key={i} x={1534 + i * 74} y={566} width={26} height={42} rx={4} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      ))}
      {/* ceiling-mounted projector over the table */}
      <rect x={886} y={172} width={112} height={62} rx={10} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={936} y={140} width={14} height={34} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <rect x={996} y={192} width={24} height={24} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />

      {/* --- the table and the people around it ---
          Chairs first, then the far-side figures over them, then the table slab over their laps:
          in the first render the chairs were drawn last and every far-side director had a chair
          back floating across his chest. */}
      {[430, 640, 850, 1060, 1270, 1480].map((cx, i) => (
        <Chair key={i} x={cx} y={890} s={0.62} facing={1} fill={tn.deep} />
      ))}
      <SeatedRow y={834} x0={470} x1={1520} n={6} scale={0.86} seed={13} view="front" />
      {/* the slab: a long boardroom table, near edge wider than the far edge */}
      <path d={`M 210 ${BOARD_TABLE} L 1712 ${BOARD_TABLE} L 1856 ${BOARD_TABLE + 88} L 66 ${BOARD_TABLE + 88} Z`}
        fill={tn.card} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`M 66 ${BOARD_TABLE + 88} L 1856 ${BOARD_TABLE + 88} L 1856 ${BOARD_TABLE + 122} L 66 ${BOARD_TABLE + 122} Z`}
        fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <line x1={228} y1={BOARD_TABLE + 40} x2={1700} y2={BOARD_TABLE + 40} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.35} />
      {/* what is ON the table: folders, glasses, a carafe, a laptop, notepads */}
      {[300, 520, 740, 960, 1180, 1400, 1620].map((px, i) => (
        <g key={i}>
          <rect x={px - 54} y={BOARD_TABLE + 22} width={108} height={54} rx={4} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={px - 42} y={BOARD_TABLE + 34} w={84} n={3} gap={11} th={3} seed={i * 5} opacity={0.5} />
          <rect x={px + 62} y={BOARD_TABLE + 26} width={26} height={40} rx={3} fill={shade(c.bg, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ))}
      <rect x={880} y={BOARD_TABLE - 46} width={44} height={70} rx={8} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      <Monitor x={1276} y={BOARD_TABLE - 96} w={158} h={110} content="grid" stand={false} seed={12} />
      <Papers x={620} y={BOARD_TABLE + 52} n={2} s={0.62} seed={19} />

      {/* --- near plane: the two backs at the near edge, and the hero standing at the head --- */}
      <StickFigure pose={A.stand(f)} x={1770} y={862} scale={1.16} facing={-1} view="profile"
        expr={FACES.hardened} pal={LIGHT} frame={f} />
      <SeatedRow y={1054} x0={330} x1={1180} n={4} scale={1.12} seed={23} view="back" />
      {[300, 590, 880, 1170].map((cx, i) => (
        <Chair key={i} x={cx} y={1096} s={1.16} facing={1} fill={shade(tn.body, -2)} />
      ))}
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 3. tradingFloor — banks of desks and screens, standing/gesturing figures, ticker or board
//
// Keyed `grey`, which is what SCENE_KEY_BY_TEMPLATE already records for this name (paired there with
// an `alarm` pnlWall — grey floor, red board).
//
// NOTE ON THE NAME. This template REPLACES stage.tsx's hedge-fund `tradingFloor` in the TEMPLATES
// record, because EXPLAINER_TEMPLATES is spread after PACK_TEMPLATES. That is deliberate and it is
// the only collision in the six: the explainer format needs this exact archetype, and the legacy
// pack version is a one-figure frame from the era TEMPLATE_STRATEGY.md retires. The legacy component
// is not deleted — it is still exported from stage.tsx.
// ---------------------------------------------------------------------------
const TRADE_WALL = 640;

/** The house quote board: rows of symbol/price/direction cells. Bespoke to this template, and the
 *  single densest object in the six — ~150 outlined blocks across the back wall. */
const QuoteBoard: React.FC<{x: number; y: number; w: number; h: number; cols: number; rows: number}> =
({x, y, w, h, cols, rows}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const s = r * 37 + k * 11;
      const cx = x + k * cw, cy = y + r * ch;
      const up = rnd(s) > 0.42;
      cells.push(
        <g key={`${r}_${k}`}>
          <rect x={cx + 5} y={cy + 4} width={cw * 0.3} height={ch * 0.42} fill={PAPER_WHITE} opacity={0.9} />
          <rect x={cx + cw * 0.38} y={cy + 4} width={cw * 0.42} height={ch * 0.42}
            fill={up ? c.accent : PAPER_WHITE} opacity={0.9} />
          <path d={up
            ? `M ${cx + cw * 0.86} ${cy + ch * 0.42} L ${cx + cw * 0.94} ${cy + ch * 0.06} L ${cx + cw * 1.02} ${cy + ch * 0.42} Z`
            : `M ${cx + cw * 0.86} ${cy + ch * 0.06} L ${cx + cw * 0.94} ${cy + ch * 0.42} L ${cx + cw * 1.02} ${cy + ch * 0.06} Z`}
            fill={up ? c.accent : PAPER_WHITE} />
        </g>
      );
    }
  }
  return (
    <g>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE} />
      {cells}
      {Array.from({length: rows - 1}, (_, i) => (
        <line key={i} x1={x - 12} y1={y + (i + 1) * ch - 2} x2={x + w + 12} y2={y + (i + 1) * ch - 2}
          stroke={PAPER_WHITE} strokeWidth={1.6} opacity={0.25} />
      ))}
    </g>
  );
};

/** One bank of trading desks: a slab, a wall of screens on it, keyboards, phones and paper.
 *  Repeated at three depths, which is what a trading floor IS. */
const DeskBank: React.FC<{y: number; s: number; seats: number; seed: number}> = ({y, s, seats, seed}) => {
  const w = 1920 * s * 1.06;
  const x0 = 960 - w / 2;
  const seatW = w / seats;
  return (
    <g>
      {Array.from({length: seats * 2 }, (_, i) => (
        <Monitor key={'m' + i}
          x={x0 + (Math.floor(i / 2) + 0.5) * seatW - seatW * 0.42 + (i % 2) * seatW * 0.44}
          y={y - 128 * s}
          w={seatW * 0.4} h={124 * s}
          content={rnd(seed * 13 + i) > 0.5 ? 'chart' : 'grid'} stand={false} seed={seed * 3 + i} />
      ))}
      <Desk x={x0} y={y} w={w} h={30 * s} legH={150 * s} />
      {Array.from({length: seats}, (_, i) => (
        <g key={'k' + i}>
          <Keyboard x={x0 + (i + 0.5) * seatW - seatW * 0.18} y={y - 6} w={seatW * 0.36} />
          <DeskPhone x={x0 + (i + 0.5) * seatW + seatW * 0.22} y={y - 2} s={0.62 * s * 2.4} />
        </g>
      ))}
    </g>
  );
};

const TradingFloor: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <Frame>
      {/* --- ceiling, service run and the board wall --- */}
      <Ceiling y={150} lights={5} />
      {/* structural piers at the ends of the pit, with a wall screen mounted on each. The first pass
          hung monitors on drop rods over the board and the board covered every one of them — all that
          rendered was four black rods hanging off the ceiling with nothing on them. */}
      <rect x={0} y={150} width={1920} height={26} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      {[10, 1810].map((px, i) => (
        <g key={i}>
          <rect x={px} y={176} width={100} height={TRADE_WALL - 176} fill={tn.back} stroke={INK} strokeWidth={STROKE} />
          <rect x={px - 10} y={176} width={120} height={22} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
          <Monitor x={px + 6} y={236} w={88} h={128} content={i ? 'grid' : 'chart'} stand={false} seed={40 + i} />
          <Monitor x={px + 6} y={392} w={88} h={128} content={i ? 'chart' : 'grid'} stand={false} seed={44 + i} />
        </g>
      ))}
      <QuoteBoard x={168} y={196} w={1584} h={244} cols={12} rows={5} />
      {/* the running ticker strip under the board */}
      <rect x={0} y={452} width={1920} height={56} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <SerifWords x={40} y={466} w={1840} h={24} words={13} seed={5} fill={c.accent} serif={false} />
      {/* the public gallery over the pit: a panelled wall, a row of house clocks, spectators behind a
          rail. This band was the frame's largest empty region until it got a floor of its own — and
          an exchange gallery is what is actually there. */}
      {Array.from({length: 20}, (_, i) => (
        <line key={i} x1={i * 98} y1={508} x2={i * 98} y2={TRADE_WALL} stroke={INK} strokeWidth={2.4} opacity={0.18} />
      ))}
      {[126, 346, 566, 786, 1136, 1356, 1576, 1796].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={546} r={21} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
          <line x1={cx} y1={546} x2={cx + Math.round(Math.cos(i * 1.3) * 12)} y2={546 + Math.round(Math.sin(i * 1.3) * 12)}
            stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          <line x1={cx} y1={546} x2={cx} y2={531} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      ))}
      <CrowdHeads y={592} x0={120} x1={1800} n={17} rows={2} r={15} seed={4} />
      <Fence x0={110} x1={1810} y={628} h={54} posts={26} opacity={0.75} />
      <rect x={0} y={TRADE_WALL - 30} width={1920} height={30} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <SlabFloor y={TRADE_WALL} cols={26} rows={11} />

      {/* --- far bank: seated rows, then the desk slab over their laps --- */}
      <SeatedRow y={706} x0={330} x1={1600} n={7} scale={0.6} seed={3} working view="front" />
      <DeskBank y={742} s={0.62} seats={5} seed={2} />
      {/* standing figures between the banks — the floor's characteristic gesture, arms up. `climb`
          at frame 0 is a raised-arms pose; the crowd stays static so the camera lock is untouched. */}
      {[380, 706, 1268, 1596].map((x, i) => (
        <StickFigure key={i} pose={i % 2 ? A.climb(0, 30) : A.stand(0)} x={x} y={790}
          scale={0.66} facing={i % 2 ? 1 : -1} view="front" pal={DIM} showFace={false} frame={0} />
      ))}

      {/* --- mid bank --- */}
      <SeatedRow y={846} x0={240} x1={1700} n={6} scale={0.82} seed={9} working view="front" />
      <DeskBank y={898} s={0.84} seats={4} seed={6} />
      <Papers x={300} y={1010} n={3} s={0.9} seed={12} />
      <Papers x={1660} y={1002} n={2} s={0.85} seed={16} />
      {[196, 1748].map((x, i) => (
        <StickFigure key={i} pose={A.climb(0, 30)} x={x} y={946} scale={0.94}
          facing={i ? -1 : 1} view="front" pal={DIM} showFace={false} frame={0} />
      ))}

      {/* discarded paper all over the floor between the banks — the format's shorthand for a bad day */}
      {[[120, 1002], [520, 986], [960, 1004], [1420, 992], [1810, 1006]].map(([px, py], i) => (
        <g key={i} transform={`rotate(${(rnd(i * 9) - 0.5) * 50} ${px} ${py})`}>
          <rect x={px - 44} y={py - 28} width={88} height={56} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={px - 34} y={py - 16} w={68} n={3} gap={12} th={3.4} seed={i * 7} opacity={0.55} />
        </g>
      ))}
      {/* --- near plane: the coloured hero on the phone, over the near desk edge --- */}
      <StickFigure pose={A.stand(f)} x={1180} y={962} scale={1.24} facing={-1} view="front"
        expr={FACES.shock} pal={LIGHT} frame={f} />
      <Desk x={-40} y={1016} w={2000} h={38} legH={70} />
      <Monitor x={230} y={882} w={230} h={166} content="chart" seed={21} />
      <Monitor x={506} y={888} w={214} h={160} content="grid" seed={23} />
      <Monitor x={1470} y={888} w={214} h={160} content="chart" seed={27} />
      <Monitor x={1712} y={894} w={196} h={154} content="grid" seed={29} />
      <Keyboard x={280} y={1054} w={190} />
      <Keyboard x={1516} y={1054} w={172} />
      <DeskPhone x={760} y={1056} s={1.15} />
      <Papers x={912} y={1046} n={2} s={0.9} seed={31} />
      <Cone x={1880} y={1010} s={0.6} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 4. cityStreet — building fronts at street level, signage, pedestrians, kerb, vehicles
//
// Keyed `daylight`: the only one of the six under open sky, and the reference's own cyan/tan key.
//
// The facade row is the reuse showcase: a shopfront is a `UnitWall` of upper windows + a `Glazing`
// shopfront + a `RibbedPanel` awning + a `SerifWords` fascia sign, which is four library/kit
// components and about ten bespoke lines per building.
// ---------------------------------------------------------------------------
const STREET_KERB = 812;    // pavement front edge / kerb line
const STREET_ROAD = 858;    // road surface starts

/**
 * One street-level building front.
 *
 * `topY` is the parapet, and it is a REQUIRED argument rather than "off the top of the frame": the
 * first render ran every facade to y=-20 and the result had no sky at all in a template keyed
 * `daylight` — a street with no sky reads as an interior corridor. Varying the parapet also gives
 * the row a skyline of its own.
 *
 * Reuse: the upper storeys are a `UnitWall` with the handles turned off, the awning is a
 * `RibbedPanel`, the shopfront is `Glazing` and the fascia is `SerifWords`.
 */
const Facade: React.FC<{x: number; w: number; topY: number; baseY: number; seed: number}> =
({x, w, topY, baseY, seed}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const step = rnd(seed * 3) > 0.5 ? 0 : 1;
  const wall = shade(tn.body, step + 1);
  // Glass keys to `crowd`, darkened. A shopfront seen from OUTSIDE reads dark, and `crowd` is the
  // only desaturated neutral the scene's four tokens carry — `bg` darkened gave saturated cyan panes
  // that read as backlit signage, and `mid` darkened gave terracotta panes that read as brick.
  const glass = shade(c.crowd, -2);
  const fasciaY = baseY - 236;
  const winTop = topY + 76;
  const winH = fasciaY - winTop - 30;
  // Small panes, many of them: the first render used ~5×3 storey-high openings and the frontage read
  // as a glass curtain wall on a high street.
  const storeys = Math.max(3, Math.round(winH / 72));
  return (
    <g>
      <rect x={x} y={topY} width={w} height={baseY - topY} fill={wall} stroke={INK} strokeWidth={STROKE} />
      {/* parapet + cornice */}
      <rect x={x - 14} y={topY - 26} width={w + 28} height={30} fill={shade(wall, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 8} y={topY + 44} width={w + 16} height={16} fill={shade(wall, -2)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {/* upper storeys: a grid of sash windows is literally a UnitWall with no handles */}
      <UnitWall x={x + 22} y={winTop} w={w - 44} h={winH} cols={Math.max(3, Math.round(w / 62))} rows={storeys}
        handle={false} fill={glass} carcass={wall} />
      {/* string course between storeys, and a fire escape on one front in three */}
      {rnd(seed * 11) > 0.62 && (
        <g stroke={INK} strokeWidth={STROKE_THIN * 0.8} fill="none" opacity={0.85}>
          {Array.from({length: storeys}, (_, i) => (
            <rect key={i} x={x + 26} y={winTop + ((i + 1) * winH) / storeys - 16} width={w - 52} height={12}
              fill={shade(wall, -2)} />
          ))}
          <line x1={x + w * 0.5} y1={winTop} x2={x + w * 0.5} y2={winTop + winH} />
        </g>
      )}
      {/* fascia sign */}
      <rect x={x + 8} y={fasciaY} width={w - 16} height={64} fill={shade(wall, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <SerifWords x={x + 34} y={fasciaY + 20} w={w - 68} h={24} words={2} seed={seed * 5} fill={PAPER_WHITE} />
      {/* awning + shopfront */}
      <RibbedPanel x={x + 8} y={fasciaY + 64} w={w - 16} h={40} ribs={Math.max(5, Math.round(w / 46))} dir="v" fill={c.accent} />
      <Glazing x={x + 26} y={fasciaY + 116} w={w - 176} h={baseY - fasciaY - 116} bays={2} rows={2}
        pane={glass} sill={false} />
      <rect x={x + w - 134} y={fasciaY + 116} width={104} height={baseY - fasciaY - 116} fill={shade(wall, -2)}
        stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x + w - 118} y={fasciaY + 136} width={72} height={56} fill={glass} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <circle cx={x + w - 46} cy={baseY - 66} r={8} fill={INK} />
      {/* step up to the door */}
      <rect x={x + w - 146} y={baseY - 22} width={128} height={12} fill={shade(wall, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
    </g>
  );
};

/** A saloon car in profile. The only vehicle bespoke to the six. */
const Car: React.FC<{x: number; y: number; s?: number; facing?: number; body?: string}> =
({x, y, s = 1, facing = 1, body}) => {
  const tn = useSceneTones();
  const paint = body ?? tn.card;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <path d="M -190 0 L -190 -46 Q -186 -62 -150 -66 L -96 -104 Q -84 -114 -60 -114 L 44 -114
               Q 68 -114 82 -100 L 128 -66 Q 178 -62 186 -46 L 186 0 Z"
        fill={paint} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M -88 -70 L -46 -104 L -8 -104 L -8 -70 Z" fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <path d="M 8 -70 L 8 -104 L 40 -104 L 74 -70 Z" fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <line x1={-8} y1={-70} x2={-8} y2={-46} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <rect x={-186} y={-40} width={34} height={12} rx={5} fill={PAPER_WHITE} stroke={INK} strokeWidth={2.4} />
      <rect x={152} y={-40} width={34} height={12} rx={5} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={2.4} />
      {[-116, 112].map((wx, i) => (
        <g key={i}>
          <circle cx={wx} cy={0} r={40} fill={INK} />
          <circle cx={wx} cy={0} r={15} fill={tn.card} />
        </g>
      ))}
    </g>
  );
};

const CityStreet: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <Frame>
      {/* --- far: the block behind, lifted two rungs so it sits back without haze or a gradient.
          Its parapets stay ABOVE the near frontage's, so it reads as taller towers further off. --- */}
      <BuildingBand baseY={560} x0={-60} x1={1990} n={8} seed={41} depth={2} minH={300} maxH={520} opacity={0.6} />
      {/* --- the street-level frontage. Parapets vary so the row has a skyline of its own, and every
          one of them leaves sky above: `daylight` is the only key of the six that gets any. --- */}
      <Facade x={-30} w={430} topY={214} baseY={STREET_KERB} seed={2} />
      <Facade x={396} w={380} topY={158} baseY={STREET_KERB} seed={7} />
      <Facade x={772} w={452} topY={252} baseY={STREET_KERB} seed={4} />
      <Facade x={1220} w={396} topY={182} baseY={STREET_KERB} seed={9} />
      <Facade x={1612} w={350} topY={286} baseY={STREET_KERB} seed={6} />

      {/* --- pavement, kerb, road --- */}
      <rect x={0} y={STREET_KERB} width={1920} height={STREET_ROAD - STREET_KERB} fill={tn.card}
        stroke={INK} strokeWidth={STROKE_THIN} />
      {Array.from({length: 15}, (_, i) => (
        <line key={i} x1={i * 132} y1={STREET_KERB} x2={i * 132 - 26} y2={STREET_ROAD} stroke={INK} strokeWidth={2} opacity={0.35} />
      ))}
      <SlabFloor y={STREET_ROAD} cols={12} rows={6} fill={tn.deep} opacity={0.18} farBand={false} />
      {/* lane markings, a crossing and two manhole covers — the road was the emptiest region of the
          first render, and a road is not a plain slab */}
      <g fill={PAPER_WHITE} opacity={0.75}>
        {Array.from({length: 8}, (_, i) => <rect key={i} x={40 + i * 250} y={992 + i * 3} width={140} height={14} rx={7} />)}
        {Array.from({length: 7}, (_, i) => (
          <rect key={'z' + i} x={1300 + i * 88} y={STREET_ROAD + 6} width={52} height={74} />
        ))}
      </g>
      {[[300, 916], [1096, 950]].map(([mx, my], i) => (
        <g key={i}>
          <ellipse cx={mx} cy={my} rx={48} ry={16} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <ellipse cx={mx} cy={my} rx={32} ry={10} fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />
        </g>
      ))}

      {/* --- deep plane: pedestrians on the pavement.
          The first render put a `CrowdHeads` mass here and the heads read as a mound of small people
          sitting on the kerb — heads-only works against a WALL, not on an open pavement. Two full
          `CrowdRow`s at different scales carry the same depth honestly. --- */}
      <CrowdRow y={716} x0={70} x1={1860} n={13} scale={0.42} seed={5} dz={10} />
      <CrowdRow y={744} x0={160} x1={1500} n={7} scale={0.54} seed={23} dz={12} />
      <Fence x0={1580} x1={1920} y={806} h={62} posts={8} opacity={0.5} />

      {/* --- street furniture --- */}
      {[250, 1040, 1780].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 9} y={STREET_KERB - 372} width={18} height={372} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <path d={`M ${lx} ${STREET_KERB - 372} q 0 -34 42 -34`} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.4} />
          <rect x={lx + 26} y={STREET_KERB - 412} width={54} height={20} rx={8} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <ellipse cx={lx} cy={STREET_KERB} rx={22} ry={7} fill={INK} opacity={0.35} />
        </g>
      ))}
      {/* traffic signal + a litter bin + a news box */}
      <rect x={1470} y={STREET_KERB - 402} width={18} height={402} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <rect x={1442} y={STREET_KERB - 470} width={74} height={132} rx={12} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={1479} cy={STREET_KERB - 440 + i * 40} r={15}
          fill={i === 0 ? c.accent : i === 1 ? shade(c.accent, 2) : PAPER_WHITE} />
      ))}
      <RibbedPanel x={634} y={STREET_KERB - 96} w={78} h={96} ribs={5} dir="v" fill={tn.body} />
      <rect x={626} y={STREET_KERB - 106} width={94} height={14} rx={6} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <rect x={1156} y={STREET_KERB - 124} width={92} height={124} rx={8} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={1172} y={STREET_KERB - 108} width={60} height={44} fill={PAPER_WHITE} stroke={INK} strokeWidth={2.4} />
      <TextLines x={1178} y={STREET_KERB - 100} w={48} n={3} gap={11} th={3} seed={4} opacity={0.6} />
      <BoxStack x={890} baseY={STREET_KERB} n={2} s={0.5} seed={11} />
      <CaseStack x={1330} baseY={STREET_KERB} n={3} s={0.6} seed={13} />

      {/* --- road traffic. Drawn far-to-near so a nearer car occludes the one behind it --- */}
      <Car x={430} y={946} s={0.62} facing={1} body={shade(tn.body, -1)} />
      <Car x={1500} y={968} s={0.72} facing={-1} body={tn.card} />
      <Car x={880} y={1064} s={1.0} facing={1} body={c.accent} />
      <Cone x={1698} y={1010} s={0.8} />
      <Cone x={1790} y={1024} s={0.8} />

      {/* --- near plane: the coloured hero walking the pavement, right of the caption card.
          The first render put two `view="back"` crowd figures beside him at scale 0.96; a DIM figure
          from behind has no face and no costume detail, so at hero scale they read as two grey
          boulders. Profile at a smaller scale reads as people. --- */}
      <StickFigure pose={A.walk(f, fps)} x={CAPTION_SAFE_X + 300} y={702} scale={1.02} facing={1}
        view="profile" expr={FACES.cold} pal={LIGHT} briefcase frame={f} />
      <CrowdRow y={730} x0={1390} x1={1660} n={2} scale={0.78} seed={17} dz={8} view="profile" facing={-1} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 5. domesticInterior — a home room: sofa/table, lamp, window, pictures, domestic clutter
//
// Keyed `interior` — the bible's own description of that key is "enclosed, lamp-lit, wooden, dark",
// which is a living room exactly. The reference's domestic frames (depression montage 10:10) are a
// small room seen head-on with a window, a couple, and very little floor: the density lives in the
// wall and the furniture, not in the plane.
// ---------------------------------------------------------------------------
const HOME_WALL = 792;

/** A three-seat sofa, head-on: base, back, arms, cushions, feet. */
const Sofa: React.FC<{x: number; y: number; w?: number; h?: number; fill?: string}> =
({x, y, w = 720, h = 210, fill}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const skin = fill ?? shade(tn.body, 2);
  const armW = w * 0.13;
  return (
    <g>
      {/* back first, then arms and seat over it */}
      <rect x={x + armW * 0.5} y={y - h} width={w - armW} height={h * 0.86} rx={20} fill={skin}
        stroke={INK} strokeWidth={STROKE} />
      {Array.from({length: 3}, (_, i) => (
        <rect key={i} x={x + armW * 0.7 + i * ((w - armW * 1.4) / 3)} y={y - h + 14}
          width={(w - armW * 1.4) / 3 - 12} height={h * 0.6} rx={14} fill={shade(skin, 1)}
          stroke={INK} strokeWidth={STROKE_THIN} />
      ))}
      <rect x={x} y={y - h * 0.62} width={armW} height={h * 0.68} rx={16} fill={shade(skin, -1)} stroke={INK} strokeWidth={STROKE} />
      <rect x={x + w - armW} y={y - h * 0.62} width={armW} height={h * 0.68} rx={16} fill={shade(skin, -1)} stroke={INK} strokeWidth={STROKE} />
      <rect x={x + armW * 0.4} y={y - h * 0.3} width={w - armW * 0.8} height={h * 0.34} rx={12} fill={shade(skin, -2)}
        stroke={INK} strokeWidth={STROKE} />
      {/* one accent cushion — the scene's single saturated note */}
      <rect x={x + w - armW * 2.1} y={y - h * 0.78} width={armW * 0.86} height={armW * 0.86} rx={10}
        fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} transform={`rotate(-12 ${x + w - armW * 1.7} ${y - h * 0.5})`} />
      <rect x={x + 22} y={y + h * 0.04} width={18} height={26} fill={INK} />
      <rect x={x + w - 40} y={y + h * 0.04} width={18} height={26} fill={INK} />
    </g>
  );
};

/** A standard lamp: base, stem, shade, and the flat pool of light it justifies. */
const FloorLamp: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <g>
      <ellipse cx={x} cy={y} rx={44 * s} ry={13 * s} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 6 * s} y={y - 330 * s} width={12 * s} height={330 * s} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <path d={`M ${x - 54 * s} ${y - 330 * s} L ${x + 54 * s} ${y - 330 * s} L ${x + 78 * s} ${y - 232 * s} L ${x - 78 * s} ${y - 232 * s} Z`}
        fill={c.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={x - 78 * s} y={y - 240 * s} width={156 * s} height={12 * s} fill={PAPER_WHITE} opacity={0.8} />
    </g>
  );
};

const DomesticInterior: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <Frame>
      {/* --- wall: papered above a dado rail, panelled below.
          The paper carries a small repeated motif as well as its stripe: a flat wall is the single
          largest region in a head-on domestic frame, and the reference's rooms are papered. --- */}
      <rect x={0} y={0} width={1920} height={470} fill={tn.panel} />
      {Array.from({length: 25}, (_, i) => (
        <line key={i} x1={i * 78} y1={0} x2={i * 78} y2={470} stroke={INK} strokeWidth={2} opacity={0.16} />
      ))}
      <g opacity={0.2} fill="none" stroke={INK} strokeWidth={2.4}>
        {Array.from({length: 100}, (_, i) => {
          const col = i % 25, row = Math.floor(i / 25);
          const mx = 39 + col * 78, my = 58 + row * 116;
          return <path key={i} d={`M ${mx} ${my - 15} q 15 15 0 30 q -15 -15 0 -30 Z`} />;
        })}
      </g>
      <rect x={0} y={462} width={1920} height={22} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={0} y={HOME_WALL - 44} width={1920} height={44} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the window, curtained, with the neighbouring roofline through it */}
      <rect x={706} y={168} width={508} height={356} fill={shade(c.bg, 3)} />
      <BuildingBand baseY={524} x0={712} x1={1210} n={3} seed={19} depth={1} minH={110} maxH={190} opacity={0.8} />
      <Glazing x={706} y={168} w={508} h={356} bays={2} rows={2} pane={null} />
      {[660, 1218].map((cx, i) => (
        <path key={i} d={`M ${cx} 140 L ${cx + (i ? 60 : -60)} 140 L ${cx + (i ? 74 : -74)} 560 L ${cx + (i ? -6 : 6)} 560 Z`}
          fill={c.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      ))}
      <rect x={640} y={128} width={640} height={22} rx={9} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* pictures, a clock and a shelf of books */}
      <WallFrame x={168} y={192} w={302} h={216} art="scape" seed={3} />
      <WallFrame x={196} y={444} w={124} h={150} art="head" seed={5} />
      <WallFrame x={344} y={444} w={124} h={150} art="head" seed={8} />
      <WallFrame x={1436} y={210} w={190} h={150} art="scape" seed={11} />
      <circle cx={1720} cy={256} r={62} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
      <line x1={1720} y1={256} x2={1720} y2={214} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <line x1={1720} y1={256} x2={1748} y2={272} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      {/* a bookcase is a UnitWall without handles, plus spines */}
      <UnitWall x={1420} y={412} w={392} h={344} cols={1} rows={4} handle={false} />
      {Array.from({length: 44}, (_, i) => {
        const col = i % 11, row = Math.floor(i / 11);
        return <rect key={i} x={1442 + col * 32} y={432 + row * 86} width={24} height={54 + rnd(i * 5) * 12}
          fill={rnd(i * 3) > 0.78 ? c.accent : shade(tn.card, -(i % 3))}
          stroke={INK} strokeWidth={2.6} />;
      })}
      {/* radiator under the window */}
      <RibbedPanel x={780} y={608} w={352} h={140} ribs={11} dir="v" />

      {/* --- floor: boards, and a bordered rug the furniture stands on --- */}
      <SlabFloor y={HOME_WALL} cols={30} rows={7} />
      <path d="M 250 962 L 1670 962 L 1830 1080 L 90 1080 Z" fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 300 992 L 1620 992 L 1740 1064 L 180 1064 Z" fill="none" stroke={INK} strokeWidth={STROKE_THIN} opacity={0.7} />
      {Array.from({length: 10}, (_, i) => (
        <rect key={i} x={330 + i * 132} y={1006} width={78} height={50} fill={c.accent} opacity={0.5}
          transform={`skewX(${-6})`} />
      ))}

      {/* --- furniture --- */}
      <FloorLamp x={1268} y={834} s={0.95} />
      <Plant x={106} y={856} s={0.95} seed={4} />
      <BoxStack x={1830} baseY={866} n={2} s={0.62} seed={7} />
      {/* a side table with a table lamp and a stack of post, left of the sofa */}
      <Desk x={392} y={806} w={150} h={22} legH={78} fill={shade(tn.card, -1)} />
      <Papers x={452} y={798} n={2} s={0.5} seed={29} />
      <Sofa x={560} y={880} w={720} h={214} />
      {/* the coffee table and what is on it */}
      <Desk x={700} y={936} w={452} h={26} legH={96} fill={shade(tn.card, -1)} />
      <Papers x={800} y={928} n={3} s={0.62} seed={13} />
      <rect x={996} y={906} width={44} height={34} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <path d="M 1040 914 q 22 8 0 18" fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <rect x={1064} y={914} width={78} height={22} rx={5} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* an armchair on the right, and the television it faces on its own low stand */}
      <Chair x={1620} y={962} s={1.0} facing={-1} fill={shade(tn.body, 1)} />
      <Desk x={168} y={916} w={330} h={24} legH={96} fill={shade(tn.card, -2)} />
      <Monitor x={196} y={712} w={286} h={196} content="text" seed={17} />
      {/* a dropped newspaper on the boards, and the day's post on the floor by the door */}
      <Papers x={1420} y={1046} n={2} s={1.0} seed={33} />

      {/* --- the people. BOTH in colour: the reference's domestic frames run a coloured couple
          (depression montage 10:10), which is the one place the grey-crowd rule is relaxed. --- */}
      <StickFigure pose={A.sit(f)} x={CAPTION_SAFE_X + 250} y={858} scale={1.06} facing={-1} view="front"
        expr={FACES.worried} pal={LIGHT} frame={f} />
      <StickFigure pose={A.sit(0)} x={740} y={858} scale={1.02} facing={1} view="front"
        expr={FACES.tired} pal={LIGHT} frame={0} />
      <Plant x={1866} y={1060} s={1.15} seed={9} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 6. newsMontage — the §6.7 device: scattered, slightly rotated newspaper/document cutouts with
//    serif headline blocks (docs/research/crayon/frames/wolf_montage_verified.jpg, 15:02).
//
// Keyed `interior`, not `grey`. The reference's own montage cell lays the cuttings on a WARM dark
// ground (wolf_montage_verified.jpg, 15:02), and measured, the `grey` key put this template at 17
// rich colours — a white/black/grey frame has almost no palette at all. `interior` gives it a brown
// ground, a tan newsprint stock and an amber accent for the flashes, and the archive/records reading
// ("enclosed, lamp-lit, wooden, dark") fits a document pile as well as bureaucracy does.
//
// Every sheet is STATIC and rotated by a fixed seeded angle — there is no drift, no flutter and no
// per-frame anything in this template at all, which makes it the strictest camera-lock case of the
// six (all 48 motion cells read exactly 0.0).
// ---------------------------------------------------------------------------

/** One cutting: masthead, rules, headline, a photo box with a flat portrait or chart, and columns. */
const NewsSheet: React.FC<{
  x: number; y: number; w: number; h: number; rot: number; seed: number;
  photo?: 'head' | 'chart' | 'none'; stock?: string; flash?: boolean;
}> = ({x, y, w, h, rot, seed, photo = 'head', stock, flash = false}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const paper = stock ?? PAPER_WHITE;
  const pad = w * 0.06;
  const iw = w - pad * 2;
  const photoH = photo === 'none' ? 0 : h * 0.3;
  const colTop = y + h * 0.44 + photoH * 0.1;
  const cols = 3;
  const colW = (iw - 26) / cols;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} fill={paper} stroke={INK} strokeWidth={STROKE} />
      {/* masthead + the two rules that bracket it. A `flash` puts the accent across the top corner,
          which is what a front page does and the one place this template gets saturated colour. */}
      {flash && <rect x={x} y={y} width={w} height={h * 0.038} fill={c.accent} />}
      <SerifWords x={x + pad} y={y + h * 0.06} w={iw} h={h * 0.062} words={2} seed={seed} />
      <line x1={x + pad} y1={y + h * 0.152} x2={x + w - pad} y2={y + h * 0.152} stroke={INK} strokeWidth={5} />
      <line x1={x + pad} y1={y + h * 0.172} x2={x + w - pad} y2={y + h * 0.172} stroke={INK} strokeWidth={2.5} />
      {/* dateline strip under the rules */}
      <TextLines x={x + pad} y={y + h * 0.186} w={iw * 0.5} n={1} gap={10} th={3.4} seed={seed * 2} opacity={0.5} />
      {/* headline: three ragged lines of set type, at body-copy weight rather than as censor bars —
          at h*0.055 with 3 words per line the first render read as redaction, not as type */}
      <SerifWords x={x + pad} y={y + h * 0.215} w={iw} h={h * 0.042} words={4} seed={seed * 3} />
      <SerifWords x={x + pad} y={y + h * 0.278} w={iw} h={h * 0.042} words={4} seed={seed * 5} />
      <SerifWords x={x + pad} y={y + h * 0.341} w={iw * 0.72} h={h * 0.042} words={3} seed={seed * 7} />
      {/* the picture */}
      {photo !== 'none' && (
        <g>
          <rect x={x + pad} y={y + h * 0.4} width={iw * 0.44} height={photoH} fill={tn.card}
            stroke={INK} strokeWidth={STROKE_THIN} />
          {photo === 'head' ? (
            <Portrait cx={x + pad + iw * 0.22} cy={y + h * 0.4 + photoH * 0.44} r={photoH * 0.22} />
          ) : (
            <g>
              {Array.from({length: 5}, (_, i) => {
                const bh = photoH * (0.25 + rnd(seed * 29 + i) * 0.6);
                return <rect key={i} x={x + pad + 12 + i * ((iw * 0.44 - 24) / 5)} y={y + h * 0.4 + photoH - 8 - bh}
                  width={(iw * 0.44 - 24) / 5 - 7} height={bh} fill={i === 4 ? c.accent : tn.body}
                  stroke={INK} strokeWidth={2.2} />;
              })}
            </g>
          )}
          {/* caption under the picture */}
          <TextLines x={x + pad} y={y + h * 0.4 + photoH + 12} w={iw * 0.44} n={2} gap={11} th={3.4} seed={seed * 5} opacity={0.7} />
        </g>
      )}
      {/* body columns, with rules between them */}
      {Array.from({length: cols}, (_, k) => {
        const cx = x + pad + k * (colW + 13);
        const skip = photo !== 'none' && k < 2;
        const top = skip ? colTop + photoH + 34 : colTop;
        const lines = Math.max(3, Math.floor((y + h - pad - top) / 13));
        return (
          <g key={k}>
            <TextLines x={cx} y={top} w={colW} n={lines} gap={13} th={3.6} seed={seed * 11 + k} opacity={0.72} />
            {k < cols - 1 && <line x1={cx + colW + 6} y1={colTop} x2={cx + colW + 6} y2={y + h - pad}
              stroke={INK} strokeWidth={2} opacity={0.4} />}
          </g>
        );
      })}
    </g>
  );
};

const NewsMontage: React.FC = () => {
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <Frame>
      {/* the surface the cuttings lie on — a flat slab, not a vignette */}
      <rect x={0} y={0} width={1920} height={1080} fill={tn.deep} />
      <rect x={0} y={0} width={1920} height={132} fill={shade(tn.deep, -1)} />
      <rect x={0} y={948} width={1920} height={132} fill={shade(tn.deep, -1)} />
      {/* a scatter of loose sheets under the papers, so the pile has a floor of its own */}
      {[[210, 250, -19], [1690, 300, 15], [330, 880, 12], [1610, 900, -14], [960, 210, 6]].map(([sx, sy, r], i) => (
        <g key={i} transform={`rotate(${r} ${sx} ${sy})`}>
          <rect x={sx - 130} y={sy - 90} width={260} height={180} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
          <TextLines x={sx - 108} y={sy - 66} w={216} n={9} gap={15} th={4} seed={i * 31} opacity={0.5} />
        </g>
      ))}

      {/* --- the cuttings, laid back-to-front so the hero cutting sits on top.
          Stocks alternate between white and two rungs of newsprint tan, because a pile of identical
          white rectangles reads as one object however many outlines it carries. --- */}
      <NewsSheet x={60} y={150} w={512} h={628} rot={-15} seed={3} photo="chart" stock={shade(tn.card, 2)} />
      <NewsSheet x={1340} y={128} w={512} h={628} rot={13} seed={9} photo="head" />
      <NewsSheet x={706} y={72} w={470} h={556} rot={-4} seed={17} photo="none" stock={shade(tn.card, 3)} />
      <NewsSheet x={1176} y={330} w={470} h={556} rot={20} seed={19} photo="none" stock={shade(tn.card, 1)} />
      <NewsSheet x={430} y={402} w={560} h={660} rot={7} seed={5} photo="head" flash />
      <NewsSheet x={1000} y={368} w={600} h={700} rot={-6} seed={11} photo="chart" flash />
      {/* a torn strip and a clipped document, the two things a montage always has one of */}
      <g transform="rotate(21 1780 660)">
        <rect x={1636} y={556} width={290} height={208} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
        <SerifWords x={1660} y={584} w={244} h={30} words={2} seed={23} />
        <TextLines x={1660} y={636} w={244} n={7} gap={15} th={4} seed={29} opacity={0.72} />
        <rect x={1660} y={556} width={44} height={22} fill={c.accent} />
      </g>
      <g transform="rotate(-16 200 830)">
        <rect x={68} y={716} width={278} height={224} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
        <SerifWords x={94} y={744} w={228} h={26} words={2} seed={37} />
        <TextLines x={94} y={794} w={228} n={8} gap={15} th={4} seed={41} opacity={0.72} />
        <rect x={276} y={700} width={26} height={58} rx={12} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.2} />
      </g>
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * Bind a template to an EXPLICIT colour key.
 *
 * WHY THIS INDIRECTION EXISTS. `keyedTemplates()` (stage.tsx) is the only exported way to put a
 * colour key into scene context — `SceneKeyContext` itself is private — and it derives the key from
 * the template NAME through `SCENE_KEY_BY_TEMPLATE`. Five of the six names below are not in that
 * table, and WO-8f may not edit crayonStyle.ts to add them, so they would fall through to
 * `resolveSceneKey`'s deterministic hash. Measured, that hash keys `officeFloor` and
 * `domesticInterior` as `daylight` — a filing floor and a living room on a bright cyan sky, which is
 * precisely the defect WO-8c's mapping exists to prevent — and `cityStreet` as `interior`, a brown
 * street with no sky.
 *
 * So each template is keyed through a PROXY name that the real table already maps to the key we
 * want, and the result is re-registered under its own name. The proxy is looked up from
 * SCENE_KEY_BY_TEMPLATE rather than hard-coded, and a key with no proxy throws rather than silently
 * falling back to a hue nobody chose.
 *
 * The right long-term fix is six entries in SCENE_KEY_BY_TEMPLATE; this is the shape that fix takes
 * until a work order is allowed to edit that file.
 */
const KEY_PROXY: Partial<Record<SceneKey, string>> = (() => {
  const out: Partial<Record<SceneKey, string>> = {};
  for (const [name, key] of Object.entries(SCENE_KEY_BY_TEMPLATE) as [string, SceneKey][]) {
    if (!(key in out)) out[key] = name;
  }
  return out;
})();

const keyedAs = (key: SceneKey, name: string, C: React.FC): React.FC => {
  const proxy = KEY_PROXY[key];
  if (!proxy) {
    throw new Error(
      `explainer.tsx cannot key "${name}" as "${key}": no template in SCENE_KEY_BY_TEMPLATE carries ` +
      `that key, so there is no proxy to borrow it from.`
    );
  }
  const Keyed = keyedTemplates({[proxy]: C})[proxy];
  Keyed.displayName = `Explainer(${name}:${key})`;
  return Keyed;
};

/**
 * The explainer environment set. Spread into `TEMPLATES` in scenes.tsx.
 *
 * ⚠ ONE NAME COLLIDES. `tradingFloor` also exists in stage.tsx's HEDGE pack. Because
 * EXPLAINER_TEMPLATES is spread AFTER PACK_TEMPLATES, this one wins. That is intended — the
 * explainer format needs the archetype under its natural name, and the legacy version is a
 * one-figure frame from the format TEMPLATE_STRATEGY.md retires — but it does change what a legacy
 * hedge-fund episode renders for that scene, and it is the only such change in this work order.
 */
export const EXPLAINER_TEMPLATES: Record<string, React.FC> = {
  officeFloor: keyedAs('interior', 'officeFloor', OfficeFloor),
  boardroom: keyedAs('grey', 'boardroom', Boardroom),
  tradingFloor: keyedAs('grey', 'tradingFloor', TradingFloor),
  cityStreet: keyedAs('daylight', 'cityStreet', CityStreet),
  domesticInterior: keyedAs('interior', 'domesticInterior', DomesticInterior),
  newsMontage: keyedAs('interior', 'newsMontage', NewsMontage),
};
