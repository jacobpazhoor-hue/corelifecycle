import React from 'react';
import {useCurrentFrame} from 'remotion';
import {StickFigure, DIM, Expr} from './figure';
import * as A from './actions';
import {blinkOn, stepIndex} from './anim';
import {
  INK, PAPER_WHITE, STROKE, STROKE_THIN, TONE_MAX_STEP, shade, sceneTones, SceneTones,
} from './crayonStyle';
import {useSceneColors} from './stage';

// ============================================================================
// SET DRESSING — the shared library of reusable background/mid-ground furniture.
//
// WHY THIS EXISTS (CRAYON_BIBLE §5/§6, WO-8d). Our templates measured 91–100% flat fill against the
// reference channel's 74–92%. Flatter than the reference means LESS DRAWN, and that is what the
// remaining visual gap is: their frames carry furniture, prop clusters, layered depth and a grey
// anonymous crowd; ours carried a colour field, one figure and two shapes.
//
// Density at reference level is 100–200 individually outlined shapes per frame (measured: the
// verified 1280×720 reference frame `wolf_t0003.png` is ~150 drawn objects and lands at 77.5%).
// Authoring that per template, 358 times, by hand is not viable. Everything in this module is the
// part that is NOT scene-specific: a wall of drawer units, a corrugated shutter, a band of low
// buildings, a stack of cases, a queue rope, a paved floor, a crowd. A template composes these and
// then draws only its own hero prop.
//
// RULES every component here obeys:
//   - Flat vector only. No gradients anywhere: Chromium dithers every gradient it paints, which is
//     what destroyed this metric before (see stage.tsx's WO-8a note). Solid `fill` or nothing.
//   - Motion is LOCALISED and OPTIONAL (WO-14, revising WO-8d's blanket "nothing here animates").
//     A locked camera is not a frozen picture: the reference holds the frame still while characters
//     and props keep moving, and with the camera locked and nothing put back, WO-4 measured us at
//     80–90% motionless against the reference's ~40%. So a few components here now read `frame` —
//     the crowds, the screens, the phone lamp — under three standing constraints:
//       (a) only small elements move; no component may translate, scale or rotate a whole backdrop
//           plane or anything spanning most of the frame, which is what would re-break bible §3;
//       (b) every clock is seeded from the element's own identity, never shared, so a row never
//           pulses in unison — and only a seeded MINORITY of any crowd moves at all, so a crowd
//           cannot light up a whole band of the 8×6 motion-locality grid;
//       (c) frame 0 renders EXACTLY what it rendered before, so stills (thumbs.tsx) are unaffected.
//     Everything else here is still static, and structure — walls, floors, bands — always is.
//   - Colour comes from the scene's key via `useSceneColors()` (bg/mid/accent/crowd) plus INK and
//     PAPER_WHITE. Callers may override a fill, but the DEFAULT is always the scene's own token, so
//     dropping a cabinet wall into any template keys it correctly with no per-call palette work.
//
// TONES (WO-8e). WO-8d's verdict on its own prototype was that density alone does not close the gap:
// the frame was dense but MONOCHROME, because every component here defaulted to the one `mid` token.
// The reference commits to a dominant hue and then carries several distinct FLAT tones inside it —
// dark cabinets, a tan box, white paper, a navy suit, all in one restricted brown frame.
//
// So every default below now keys to a *role* in `sceneTones()` rather than to `mid`: structures step
// in tone with depth, the ground sits under the things standing on it, boxes and cases are a lighter
// material than the floor, crowd rows separate from each other. `shade()` returns flat solid colour
// only — no component here may introduce a gradient, at any depth, for any reason.
// ============================================================================

/** Deterministic hash-noise in [0,1). Same generator scenes.tsx/stage.tsx use, so a seeded layout
 *  renders identically on every machine and every frame (including cloud renders). */
const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1 + 31.7) * 43758.5453;
  return x - Math.floor(x);
};

/**
 * The active scene's flat tone set (WO-8e) — the material roles every default below keys to.
 * Templates composing their own bespoke props should use this too, so a hero prop lands in the same
 * restricted ladder as the furniture around it.
 */
export const useSceneTones = (): SceneTones => sceneTones(useSceneColors());

// ---------------------------------------------------------------------------
// GROUND
// ---------------------------------------------------------------------------

/**
 * A paved ground plane: a flat slab of `fill` under a hard ink horizon, scored into slabs.
 *
 * The scoring is not decoration — concrete aprons, tiled lobbies, warehouse floors and paved yards
 * all have joints, and it is the cheapest honest way to stop a ground plane reading as a colour
 * field. Rows converge toward the horizon so the plane reads as receding without any perspective
 * transform.
 *
 * TONE (WO-8e): the ground defaults to `floor` — one rung UNDER the mid-ground mass — so the
 * buildings, carts and boxes standing on it are no longer the same colour as it. The strip nearest
 * the horizon is drawn one rung lighter again (`farBand`), which is how flat art says "this plane
 * recedes" without a gradient.
 */
export const SlabFloor: React.FC<{
  y: number; fill?: string; cols?: number; rows?: number; bottom?: number; opacity?: number;
  farBand?: boolean;
}> = ({y, fill, cols = 9, rows = 5, bottom = 1080, opacity = 0.28, farBand = true}) => {
  const tn = useSceneTones();
  const h = bottom - y;
  const ground = fill ?? tn.floor;
  // row lines: spacing grows toward the viewer (t^1.9), i.e. slabs get taller as they approach
  const rowYs = Array.from({length: rows}, (_, i) => y + h * Math.pow((i + 1) / (rows + 1), 1.9));
  return (
    <g>
      <rect x={0} y={y} width={1920} height={h} fill={ground} />
      {farBand && rows > 0 && (
        <rect x={0} y={y} width={1920} height={rowYs[0] - y} fill={shade(ground, 1)} />
      )}
      <line x1={0} y1={y} x2={1920} y2={y} stroke={INK} strokeWidth={STROKE} />
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={opacity}>
        {rowYs.map((ry, i) => <line key={'r' + i} x1={0} y1={ry} x2={1920} y2={ry} />)}
        {Array.from({length: cols}, (_, i) => {
          // columns splay outward from the vanishing point at frame centre
          const t = (i + 0.5) / cols;
          const xTop = t * 1920;
          const xBot = 960 + (xTop - 960) * 2.1;
          return <line key={'c' + i} x1={xTop} y1={y} x2={xBot} y2={bottom} />;
        })}
      </g>
    </g>
  );
};

// ---------------------------------------------------------------------------
// WALLS / STRUCTURE
// ---------------------------------------------------------------------------

/**
 * A grid of drawer/locker/shelf units — the reference's filing-cabinet wall
 * (frames/wolf_office_singleframe.jpg, left third of frame).
 *
 * One component covers filing cabinets, lockers, server racks, deposit boxes, warehouse racking and
 * apothecary shelving; only the fill and the cell aspect change.
 *
 * TONE (WO-8e): the reference's cabinet wall is TWO tones — a dark carcass with lighter drawer fronts
 * set into it — which is what makes a grid of rectangles read as furniture instead of as a grid. So
 * `fill` is the drawer FACE, and the carcass behind it defaults two rungs down.
 */
export const UnitWall: React.FC<{
  x: number; y: number; w: number; h: number; cols: number; rows: number;
  fill?: string; carcass?: string; handle?: boolean; opacity?: number;
}> = ({x, y, w, h, cols, rows, fill, carcass, handle = true, opacity = 1}) => {
  const tn = useSceneTones();
  const face = fill ?? tn.body;
  const box = carcass ?? shade(face, -2);
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const cx = x + k * cw, cy = y + r * ch;
      cells.push(<rect key={`u${r}_${k}`} x={cx + 3} y={cy + 3} width={cw - 6} height={ch - 6}
        fill={face} stroke={INK} strokeWidth={STROKE_THIN} />);
      if (handle) {
        cells.push(<rect key={`h${r}_${k}`} x={cx + cw * 0.36} y={cy + ch * 0.56} width={cw * 0.28}
          height={Math.max(4, ch * 0.07)} rx={2} fill={INK} />);
      }
    }
  }
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={box} stroke={INK} strokeWidth={STROKE} />
      {cells}
    </g>
  );
};

/**
 * A corrugated/ribbed panel: hangar shutter, roller door, radiator, blind, container side.
 * Vertical ribs when `dir` is 'v' (a shutter is horizontal-ribbed — pass 'h').
 *
 * TONE (WO-8e): defaults one rung under the mid-ground mass, because a shutter is a different
 * material from the wall it is set into and a same-tone door disappears into its building.
 */
export const RibbedPanel: React.FC<{
  x: number; y: number; w: number; h: number; ribs: number;
  fill?: string; dir?: 'v' | 'h'; opacity?: number;
}> = ({x, y, w, h, ribs, fill, dir = 'h', opacity = 1}) => {
  const tn = useSceneTones();
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill ?? tn.floor} stroke={INK} strokeWidth={STROKE_THIN} />
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.7}>
        {Array.from({length: ribs}, (_, i) => {
          const t = (i + 1) / (ribs + 1);
          return dir === 'h'
            ? <line key={i} x1={x} y1={y + h * t} x2={x + w} y2={y + h * t} />
            : <line key={i} x1={x + w * t} y1={y} x2={x + w * t} y2={y + h} />;
        })}
      </g>
    </g>
  );
};

/**
 * A band of low buildings along a base line — hangars, warehouses, a terminal, a village street,
 * a factory row. Each unit gets a shutter or a window strip, so the band carries detail instead of
 * being a silhouette.
 *
 * TONE (WO-8e). A band used to be ONE colour, which is what made a dense skyline still read as a
 * single slab of hue. Now:
 *   - neighbouring units alternate deterministically between two rungs, so the row has facets;
 *   - `depth` lifts the whole band toward the sky — stack two bands at depth 1 and 0 and the far one
 *     sits behind the near one on tone alone, no haze, no gradient, no opacity trick;
 *   - the parapet sits a rung under its wall and the window blocks three rungs under, which is what
 *     separates a building from the building beside it when both share a fill.
 */
export const BuildingBand: React.FC<{
  baseY: number; x0: number; x1: number; n: number; seed?: number;
  fill?: string; opacity?: number; minH?: number; maxH?: number; depth?: number;
}> = ({baseY, x0, x1, n, seed = 0, fill, opacity = 1, minH = 90, maxH = 190, depth = 0}) => {
  const tn = useSceneTones();
  const base = fill ?? tn.body;
  if (!Number.isInteger(depth) || Math.abs(depth) > TONE_MAX_STEP - 1) {
    throw new Error(
      `BuildingBand depth must be a whole rung within ±${TONE_MAX_STEP - 1} (it is combined with the ` +
      `per-unit facet rung), got ${depth}`
    );
  }
  // Every tone below is a net step off ONE base colour, clamped to the ladder — a band can never
  // wander outside the scene's restricted palette however it is nested.
  const rung = (step: number) => shade(base, Math.max(-TONE_MAX_STEP, Math.min(TONE_MAX_STEP, step)));
  const units: React.ReactNode[] = [];
  const span = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const s = seed * 977 + i * 13;
    const w = span * (0.72 + rnd(s) * 0.24);
    const bx = x0 + i * span + (span - w) / 2;
    const h = minH + rnd(s + 3) * (maxH - minH);
    const top = baseY - h;
    const shutter = rnd(s + 7) > 0.45;
    const step = depth + (rnd(s + 11) > 0.5 ? 1 : 0);
    const wall = rung(step);
    const parapet = rung(step - 1);
    const glass = rung(step - 3);
    const door = rung(step - 2);
    // A taller unit carries more storeys / more shutter ribs. Detail density tracks the drawn size
    // instead of a fixed count, so the same component reads correctly as a 90px shed and a 500px hangar.
    const winRows = Math.max(1, Math.round(h / 190));
    const doorH = Math.min(h * 0.62, 250);
    units.push(
      <g key={i}>
        <rect x={bx} y={top} width={w} height={h} fill={wall} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* roof lip — reads as a parapet, and separates neighbouring units of the same fill */}
        <rect x={bx - 8} y={top - 10} width={w + 16} height={12} fill={parapet} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        {/* storey bands: what stops a tall block reading as one slab */}
        {Array.from({length: winRows}, (_, r) => (
          <g key={'w' + r}>
            <line x1={bx} y1={top + (h - doorH) * ((r + 1) / (winRows + 1))} x2={bx + w}
              y2={top + (h - doorH) * ((r + 1) / (winRows + 1))} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.45} />
            {Array.from({length: 7}, (_, k) => (
              <rect key={k} x={bx + w * (0.07 + k * 0.128)} y={top + (h - doorH) * ((r + 0.25) / (winRows + 1)) + 14}
                width={w * 0.088} height={Math.min(64, (h - doorH) / (winRows + 1) * 0.5)}
                fill={glass} />
            ))}
          </g>
        ))}
        {shutter
          ? <RibbedPanel x={bx + w * 0.16} y={baseY - doorH} w={w * 0.68} h={doorH} ribs={Math.max(6, Math.round(doorH / 24))} fill={door} />
          : <RibbedPanel x={bx + w * 0.1} y={baseY - doorH} w={w * 0.8} h={doorH} ribs={Math.max(5, Math.round(w / 34))} dir="v" fill={door} />}
      </g>
    );
  }
  return <g opacity={opacity}>{units}</g>;
};

/**
 * A suspended ceiling with a tile grid and recessed light panels.
 *
 * Built by FLIPPING `SlabFloor`: a ceiling and a floor are the same receding plane seen from the
 * other side, and `matrix(1 0 0 -1 0 y)` maps the region [0,y] onto [y,0], so the slab joints
 * converge at the wall line and splay toward the frame edge exactly as they should. Reusing the
 * component also means a ceiling picks up the same `farBand` depth rung the floor does, for free.
 */
export const Ceiling: React.FC<{y?: number; lights?: number; fill?: string}> = ({y = 200, lights = 4, fill}) => {
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
 * A classical colonnade — the institutional front (bank, courthouse, exchange, treasury).
 *
 * The single most repeated exterior in a finance explainer, and the reference's own
 * (`LuEcoqizj0o/thumb.png` is a stone frontage of regular bays). Drawn as a DARK RECESS with columns
 * standing in front of it, which is what makes a portico read as a covered space rather than as
 * stripes painted on a wall — and the recess is also where a doorway, a queue or a shadowed figure
 * can be laid without inventing another plane.
 *
 * TONE: stone is the scene's LIGHT material (`card`), not its ground colour, because a portico is
 * lighter than everything around it in every reference frame that has one. The recess is the deep
 * rung, the flutes are ink lines rather than a second fill.
 */
export const Colonnade: React.FC<{
  x: number; y: number; w: number; h: number; n: number;
  fill?: string; recess?: string; flutes?: number;
}> = ({x, y, w, h, n, fill, recess, flutes = 4}) => {
  const tn = useSceneTones();
  const stone = fill ?? tn.card;
  const dark = recess ?? shade(tn.deep, -1);
  const bay = w / n;
  const colW = bay * 0.46;
  const capH = Math.max(14, h * 0.07);
  const baseH = Math.max(12, h * 0.055);
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={dark} stroke={INK} strokeWidth={STROKE} />
      {/* the stylobate the columns stand on — without it the shafts float on the recess */}
      <rect x={x - 10} y={y + h - baseH * 0.5} width={w + 20} height={baseH * 0.9} fill={shade(stone, -1)}
        stroke={INK} strokeWidth={STROKE_THIN} />
      {Array.from({length: n}, (_, i) => {
        const cx = x + (i + 0.5) * bay;
        const sx = cx - colW / 2;
        const shaftTop = y + capH, shaftBot = y + h - baseH;
        return (
          <g key={i}>
            {/* shaft */}
            <rect x={sx} y={shaftTop} width={colW} height={shaftBot - shaftTop} fill={stone}
              stroke={INK} strokeWidth={STROKE_THIN} />
            {/* flutes: ink lines, never a second fill — a fluted shaft with painted stripes reads as
                a barber's pole at frame scale */}
            <g stroke={INK} strokeWidth={STROKE_THIN * 0.5} opacity={0.4}>
              {Array.from({length: flutes}, (_, k) => (
                <line key={k} x1={sx + (colW * (k + 1)) / (flutes + 1)} y1={shaftTop + 8}
                  x2={sx + (colW * (k + 1)) / (flutes + 1)} y2={shaftBot - 8} />
              ))}
            </g>
            {/* capital: echinus + abacus, both wider than the shaft */}
            <rect x={sx - colW * 0.13} y={y + capH * 0.42} width={colW * 1.26} height={capH * 0.6}
              fill={shade(stone, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
            <rect x={sx - colW * 0.2} y={y} width={colW * 1.4} height={capH * 0.46}
              fill={stone} stroke={INK} strokeWidth={STROKE_THIN} />
            {/* base */}
            <rect x={sx - colW * 0.16} y={shaftBot} width={colW * 1.32} height={baseH}
              fill={shade(stone, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
          </g>
        );
      })}
    </g>
  );
};

/**
 * A flight of steps seen head-on, narrowing with height so the flight reads as receding.
 *
 * `inset` is how much narrower the TOP tread is than the bottom one; 0 gives a plain stair, and a
 * positive value gives the splayed civic flight every institutional frontage sits on. Drawn top
 * tread first so each nearer (wider) step overlaps the one behind it, which is the only reason a
 * flat stair reads as a stair rather than as a stack of bars.
 */
export const Steps: React.FC<{
  x0: number; x1: number; yTop: number; yBottom: number; n?: number; inset?: number; fill?: string;
}> = ({x0, x1, yTop, yBottom, n = 6, inset = 0, fill}) => {
  const tn = useSceneTones();
  const tread = fill ?? tn.card;
  const midX = (x0 + x1) / 2;
  const hwBot = (x1 - x0) / 2;
  const hwTop = hwBot - inset;
  if (hwTop <= 0) {
    throw new Error(`Steps inset ${inset} is wider than the flight (${hwBot} half-width): the top ` +
      `tread would have negative width`);
  }
  const out: React.ReactNode[] = [];
  for (let i = n - 1; i >= 0; i--) {
    const kT = (i + 1) / n, kB = i / n;                       // 0 at the bottom step
    const yT = yBottom + (yTop - yBottom) * kT;
    const yB = yBottom + (yTop - yBottom) * kB;
    const hwT = hwBot + (hwTop - hwBot) * kT;
    const hwB = hwBot + (hwTop - hwBot) * kB;
    // alternate a rung so a deep flight has treads instead of one wedge of colour
    const face = i % 2 ? tread : shade(tread, -1);
    out.push(
      <g key={i}>
        <path d={`M ${midX - hwT} ${yT} L ${midX + hwT} ${yT} L ${midX + hwB} ${yB} L ${midX - hwB} ${yB} Z`}
          fill={face} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
        {/* the nosing: the one line that separates a tread from its riser */}
        <line x1={midX - hwT} y1={yT} x2={midX + hwT} y2={yT} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      </g>
    );
  }
  return <g>{out}</g>;
};

/**
 * An overhead truss / gantry — a factory roof rig, a studio lighting grid, a stage bar.
 *
 * Two chords with a zigzag web between them, plus drop rods at intervals for whatever the template
 * hangs off it. Structure, so it never animates: only the things a caller hangs on it do.
 */
export const TrussRig: React.FC<{
  x0: number; x1: number; y: number; h?: number; bays?: number; drops?: number; dropH?: number;
  fill?: string;
}> = ({x0, x1, y, h = 56, bays = 14, drops = 0, dropH = 60, fill}) => {
  const tn = useSceneTones();
  const steel = fill ?? tn.deep;
  const step = (x1 - x0) / bays;
  return (
    <g>
      <rect x={x0} y={y} width={x1 - x0} height={h * 0.22} fill={steel} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <rect x={x0} y={y + h * 0.78} width={x1 - x0} height={h * 0.22} fill={steel} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.9} fill="none" opacity={0.9}>
        {Array.from({length: bays}, (_, i) => (
          <path key={i} d={`M ${x0 + i * step} ${y + h * 0.22} L ${x0 + (i + 0.5) * step} ${y + h * 0.78}
                            L ${x0 + (i + 1) * step} ${y + h * 0.22}`} />
        ))}
      </g>
      {Array.from({length: drops}, (_, i) => {
        const dx = x0 + ((i + 0.5) * (x1 - x0)) / drops;
        return <rect key={'d' + i} x={dx - 5} y={y + h} width={10} height={dropH} fill={steel}
          stroke={INK} strokeWidth={STROKE_THIN * 0.6} />;
      })}
    </g>
  );
};

/**
 * A run of parallel pipework with periodic flanges — factory wall, plant room, utility basement,
 * ship's engine room.
 *
 * `x0`/`x1` are always ALONG the run and `y` is always the cross-axis position of the first pipe,
 * so a riser (`dir="v"`) takes `x0`/`x1` as its TOP and BOTTOM and `y` as its x. Stated because it
 * reads wrong at the call site otherwise.
 *
 * Pipes alternate a tone rung so a bank of them reads as several services rather than as one striped
 * slab, and each pipe carries its own ink outline so the run keeps its edge count up at 1280.
 */
export const PipeRun: React.FC<{
  x0: number; x1: number; y: number; n?: number; gap?: number; th?: number; flanges?: number;
  fill?: string; dir?: 'h' | 'v';
}> = ({x0, x1, y, n = 3, gap = 30, th = 22, flanges = 6, fill, dir = 'h'}) => {
  const tn = useSceneTones();
  const metal = fill ?? tn.body;
  const len = x1 - x0;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const off = i * gap;
        const skin = shade(metal, (i % 3) - 1);
        const px = dir === 'h' ? x0 : y + off;
        const py = dir === 'h' ? y + off : x0;
        const w = dir === 'h' ? len : th;
        const hh = dir === 'h' ? th : len;
        return (
          <g key={i}>
            <rect x={dir === 'h' ? px : px} y={dir === 'h' ? py : py} width={w} height={hh}
              rx={th * 0.28} fill={skin} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
            {Array.from({length: flanges}, (_, k) => {
              const t = (k + 0.5) / flanges;
              return dir === 'h'
                ? <rect key={k} x={x0 + len * t - th * 0.22} y={py - th * 0.16} width={th * 0.44}
                    height={th * 1.32} fill={shade(skin, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
                : <rect key={k} x={px - th * 0.16} y={x0 + len * t - th * 0.22} width={th * 1.32}
                    height={th * 0.44} fill={shade(skin, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />;
            })}
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
export const Glazing: React.FC<{
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

// ---------------------------------------------------------------------------
// PROP CLUSTERS
// ---------------------------------------------------------------------------

/**
 * A leaning stack of cardboard boxes — the reference's storage room (wolf montage 2:08). Each box
 * gets a lid seam and a tape strip, which is what makes a pile read as boxes and not as blocks.
 *
 * TONE (WO-8e): cardboard is the scene's LIGHT material (`card`), not its ground colour — in the
 * reference office a tan box sits against near-black cabinets, and in the storage room the boxes are
 * the lightest thing in a dark room. Boxes in one pile alternate a rung so the stack has faces.
 */
export const BoxStack: React.FC<{
  x: number; baseY: number; n?: number; s?: number; seed?: number; fill?: string;
}> = ({x, baseY, n = 4, s = 1, seed = 0, fill}) => {
  const tn = useSceneTones();
  const card = fill ?? tn.card;
  const boxes: React.ReactNode[] = [];
  let y = baseY;
  for (let i = 0; i < n; i++) {
    const r = seed * 313 + i * 7;
    const w = (110 + rnd(r) * 70) * s;
    const h = (74 + rnd(r + 2) * 34) * s;
    const bx = x - w / 2 + (rnd(r + 4) - 0.5) * 34 * s;
    const face = rnd(r + 9) > 0.5 ? card : shade(card, -1);
    y -= h;
    boxes.push(
      <g key={i}>
        <rect x={bx} y={y} width={w} height={h} fill={face} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* lid flap: a second flat tone across the top third, so a box has a top as well as a front */}
        <rect x={bx} y={y} width={w} height={h * 0.3} fill={shade(face, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        <rect x={bx + w * 0.42} y={y} width={w * 0.16} height={h * 0.3} fill={INK} opacity={0.25} />
      </g>
    );
  }
  return <g>{boxes}</g>;
};

/**
 * A stack of suitcases/crates on a baggage cart, shipping pallet or porter's trolley.
 *
 * TONE (WO-8e): cases cycle three materials — white, the light `card` tone and the mid-ground body —
 * because a real luggage pile is the densest bit of material variety in a frame, and a two-tone
 * alternation reads as a pattern rather than as a pile.
 */
export const CaseStack: React.FC<{
  x: number; baseY: number; n?: number; s?: number; seed?: number;
}> = ({x, baseY, n = 4, s = 1, seed = 0}) => {
  const tn = useSceneTones();
  const skins = [PAPER_WHITE, tn.card, tn.body];
  const out: React.ReactNode[] = [];
  let y = baseY;
  for (let i = 0; i < n; i++) {
    const r = seed * 71 + i * 5;
    const w = (96 + rnd(r) * 54) * s;
    const h = (34 + rnd(r + 1) * 22) * s;
    const bx = x - w / 2 + (rnd(r + 3) - 0.5) * 22 * s;
    y -= h;
    out.push(
      <g key={i}>
        <rect x={bx} y={y} width={w} height={h} rx={6 * s} fill={skins[i % skins.length]} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* strap + handle: the two details that make a rounded rect read as luggage */}
        <line x1={bx + w * 0.3} y1={y} x2={bx + w * 0.3} y2={y + h} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        <rect x={bx + w * 0.44} y={y - 7 * s} width={w * 0.2} height={8 * s} rx={4 * s} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      </g>
    );
  }
  return <g>{out}</g>;
};

/**
 * A wheeled flatbed — baggage cart, hand truck, service trolley, gurney base.
 *
 * TONE (WO-8e): the bed is the mid-ground body tone and the wheel hubs are the light `card` tone, so
 * a hub reads inside its black tyre instead of vanishing into the ground behind the cart.
 */
export const Trolley: React.FC<{x: number; y: number; w?: number; s?: number}> = ({x, y, w = 300, s = 1}) => {
  const tn = useSceneTones();
  const wheelR = 24 * s;
  return (
    <g>
      <rect x={x} y={y} width={w} height={18 * s} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x + 10} y={y + 18 * s} width={16 * s} height={26 * s} fill={INK} opacity={0.6} />
      <rect x={x + w - 26 * s} y={y + 18 * s} width={16 * s} height={26 * s} fill={INK} opacity={0.6} />
      <circle cx={x + 46 * s} cy={y + 44 * s + wheelR} r={wheelR} fill={INK} />
      <circle cx={x + w - 46 * s} cy={y + 44 * s + wheelR} r={wheelR} fill={INK} />
      <circle cx={x + 46 * s} cy={y + 44 * s + wheelR} r={wheelR * 0.38} fill={tn.card} />
      <circle cx={x + w - 46 * s} cy={y + 44 * s + wheelR} r={wheelR * 0.38} fill={tn.card} />
      {/* draw bar */}
      <line x1={x} y1={y + 6 * s} x2={x - 70 * s} y2={y + 52 * s} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
    </g>
  );
};

/**
 * Safety cone — apron, roadworks, gym, film set, warehouse. The scene accent gets one honest use.
 * TONE (WO-8e): the base skirt takes the accent's shadow rung, which is what gives a 56px prop a
 * readable form at 1920 without a gradient.
 */
export const Cone: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <g>
      <path d={`M ${x} ${y - 56 * s} L ${x + 26 * s} ${y} L ${x - 26 * s} ${y} Z`} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 20 * s} y={y - 34 * s} width={40 * s} height={10 * s} fill={PAPER_WHITE} />
      <rect x={x - 34 * s} y={y - 6 * s} width={68 * s} height={12 * s} rx={3 * s} fill={tn.accentDeep} stroke={INK} strokeWidth={STROKE_THIN} />
    </g>
  );
};

/**
 * A hand-held placard on a stick — picket line, breadline, protest, bank run.
 *
 * The reference uses one in BOTH captured thumbnails (`LuEcoqizj0o` "GIVE US WORK, NOT HUNGER",
 * `KE-WJevx-7c` "WE GOT SOLD OUT"): a pale board tilted a few degrees above a grey crowd, carrying
 * two short lines. The lettering is `SerifWords` geometry rather than real text for the same reason
 * everything else here is — a template is topic-agnostic and the episode's words arrive as overlays.
 *
 * `y` is where the holder's HANDS are, not the board: a placard whose pole stops in mid-air is the
 * commonest way this prop goes wrong.
 */
export const Placard: React.FC<{
  x: number; y: number; w?: number; h?: number; tilt?: number; poleH?: number; seed?: number;
  fill?: string;
}> = ({x, y, w = 190, h = 120, tilt = -7, poleH = 150, seed = 0, fill}) => {
  const tn = useSceneTones();
  const board = fill ?? PAPER_WHITE;
  const topY = y - poleH;
  return (
    <g transform={`rotate(${tilt} ${x} ${y})`}>
      <rect x={x - 7} y={topY} width={14} height={poleH} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <rect x={x - w / 2} y={topY - h} width={w} height={h} fill={board} stroke={INK} strokeWidth={STROKE} />
      <SerifWords x={x - w / 2 + w * 0.1} y={topY - h + h * 0.22} w={w * 0.8} h={h * 0.17} words={2} seed={seed * 7} />
      <SerifWords x={x - w / 2 + w * 0.1} y={topY - h + h * 0.58} w={w * 0.8} h={h * 0.17} words={2} seed={seed * 11} />
    </g>
  );
};

/** Stanchion + rope queue barrier — red carpet, bank queue, press line, museum, checkpoint. */
export const RopeLine: React.FC<{x0: number; x1: number; y: number; posts?: number; s?: number}> =
({x0, x1, y, posts = 4, s = 1}) => {
  const c = useSceneColors();
  const step = (x1 - x0) / Math.max(1, posts - 1);
  const top = y - 96 * s;
  return (
    <g>
      {Array.from({length: posts - 1}, (_, i) => {
        const ax = x0 + i * step, bx = ax + step;
        return <path key={'r' + i} d={`M ${ax} ${top + 8 * s} Q ${(ax + bx) / 2} ${top + 46 * s} ${bx} ${top + 8 * s}`}
          fill="none" stroke={c.accent} strokeWidth={STROKE_THIN * 1.4} strokeLinecap="round" />;
      })}
      {Array.from({length: posts}, (_, i) => {
        const px = x0 + i * step;
        return (
          <g key={'p' + i}>
            <rect x={px - 5 * s} y={top} width={10 * s} height={96 * s} fill={INK} />
            <ellipse cx={px} cy={top} rx={12 * s} ry={9 * s} fill={INK} />
            <ellipse cx={px} cy={y} rx={22 * s} ry={8 * s} fill={INK} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// INTERIOR KIT — desks, screens, seating, paperwork, wall art
//
// WO-8f authored these inside explainer.tsx as a private second tier, because the library above was
// built for exteriors and yards and had nothing for a room. WO-8g promoted them here unchanged:
// the explainer format is ~20-30 indoor-corporate-and-domestic archetypes, so templates 7-25 need
// this kit as much as the first six did, and a second tier that only one module can import is a
// fork of the library, not a layer on it.
//
// Same rules as everything above: flat vector only, every default drawn from
// `useSceneTones()`/`useSceneColors()` so a prop dropped into any template keys itself correctly
// with no per-call palette work, and any motion localised, seeded and zero at frame 0 (see the
// module header). Furniture is static; the screens and the phone lamp are not.
// ---------------------------------------------------------------------------

/**
 * A desk / table / counter seen head-on: a light top slab over a darker apron, on square legs.
 *
 * Deliberately NOT drawn in perspective. The reference's desks are near-orthographic slabs
 * (wolf_office_singleframe, the 3:34 office), and a foreshortened top is a large flat quadrilateral
 * that buys nothing but flat-fill budget.
 */
export const Desk: React.FC<{
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
 * legitimate patch of light, so every desk in the explainer set carries at least one.
 *
 * ANIMATION (WO-14). A screen is the prop the format has the strongest licence to move: a live chart
 * ticks, a quote grid reprints, a document grows a line. The motion is DISCRETE — the content is
 * re-derived from a seeded step counter, not slid — because a screen updates in jumps and because a
 * jump inside a ~180×140 prop is far too small to be mistaken for a cut by peak-based cut detection.
 * Each screen's step period and phase come from its own `seed`, so a wall of them scatters instead
 * of blinking as one. `live={false}` opts a screen out (a photograph on a wall, a dead terminal).
 */
export const Monitor: React.FC<{
  x: number; y: number; w?: number; h?: number; content?: 'text' | 'chart' | 'grid';
  stand?: boolean; seed?: number; live?: boolean;
}> = ({x, y, w = 190, h = 132, content = 'text', stand = true, seed = 0, live = true}) => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  const glass = shade(tn.deep, -1);
  const pad = 14;
  const ix = x + pad, iy = y + pad, iw = w - pad * 2, ih = h - pad * 2;
  // The chart scrolls one SAMPLE per step, so the trace slides left a slot at a time and gains a new
  // right-hand point — a live trace, not a redraw. `text` and `grid` reprint a couple of cells.
  const k = live ? stepIndex(f, seed * 1.9 + 5, 110) : 0;
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
        // only the last two lines re-set, the way a document being written does
        <rect key={i} x={ix + 8} y={iy + 10 + i * (ih - 16) / 6}
          width={iw * (0.4 + rnd(seed * 31 + i + (i >= 4 ? k : 0)) * 0.5)}
          height={Math.max(4, ih * 0.055)} fill={PAPER_WHITE} opacity={0.85} />
      ))}
      {content === 'chart' && (
        <g>
          <polyline
            points={Array.from({length: 9}, (_, i) =>
              `${ix + 6 + (i * (iw - 12)) / 8},${iy + ih * (0.82 - 0.6 * rnd(seed * 17 + i + k))}`).join(' ')}
            fill="none" stroke={c.accent} strokeWidth={STROKE_THIN * 0.9} strokeLinejoin="round" />
          <line x1={ix + 4} y1={iy + ih * 0.9} x2={ix + iw - 4} y2={iy + ih * 0.9} stroke={PAPER_WHITE} strokeWidth={2} opacity={0.6} />
        </g>
      )}
      {content === 'grid' && Array.from({length: 12}, (_, i) => (
        // one column of the grid reprints per step, so a quote screen is never wholly repainted
        <rect key={i} x={ix + 7 + (i % 3) * (iw / 3)} y={iy + 8 + Math.floor(i / 3) * (ih / 4)}
          width={iw / 3 - 14} height={Math.max(4, ih * 0.09)}
          fill={rnd(seed * 53 + i + (i % 3 === k % 3 ? k : 0)) > 0.68 ? c.accent : PAPER_WHITE} opacity={0.85} />
      ))}
    </g>
  );
};

/** A keyboard slab with key rows — the small prop that turns a desk into a workstation. */
export const Keyboard: React.FC<{x: number; y: number; w?: number}> = ({x, y, w = 178}) => {
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
export const Chair: React.FC<{x: number; y: number; s?: number; facing?: number; fill?: string}> =
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
export const Papers: React.FC<{x: number; y: number; n?: number; s?: number; seed?: number}> =
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
 *  unmissable prop (wolf_office_singleframe, every cell).
 *
 *  WO-14: it carries a message lamp that blinks on its own seeded clock. Nothing moves — one small
 *  fill switches — so it is the cheapest possible sign of life, and a bank of phones blinks as a
 *  scatter rather than in time. */
export const DeskPhone: React.FC<{
  x: number; y: number; s?: number; facing?: number; seed?: number; live?: boolean;
}> = ({x, y, s = 1, facing = 1, seed = 0, live = true}) => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const lit = live && blinkOn(f, seed + x * 0.011, 150, 42);
  return (
    <g>
      <path d={`M ${x} ${y} L ${x + 128 * s} ${y} L ${x + 116 * s} ${y - 44 * s} L ${x + 10 * s} ${y - 44 * s} Z`}
        fill={INK} stroke={INK} strokeWidth={STROKE_THIN * 0.8} strokeLinejoin="round" />
      {Array.from({length: 6}, (_, i) => (
        <rect key={i} x={x + 22 * s + (i % 3) * 22 * s} y={y - 34 * s + Math.floor(i / 3) * 16 * s}
          width={13 * s} height={9 * s} fill={PAPER_WHITE} opacity={0.75} />
      ))}
      <rect x={x + 4 * s} y={y - 62 * s} width={124 * s} height={24 * s} rx={11 * s} fill={INK} />
      <rect x={x + 96 * s} y={y - 38 * s} width={14 * s} height={9 * s} rx={3 * s}
        fill={lit ? c.accent : shade(c.crowd, -2)} />
      <path d={`M ${x + (facing > 0 ? 128 : 4) * s} ${y - 30 * s} q ${facing * 30 * s} ${16 * s} ${facing * 6 * s} ${30 * s}`}
        fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
    </g>
  );
};

/** A potted plant — pot, soil line, five flat leaves. */
export const Plant: React.FC<{x: number; y: number; s?: number; seed?: number}> = ({x, y, s = 1, seed = 0}) => {
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
 * A head-and-shoulders portrait, flat: hair mass, face, collar, shoulders. Small enough to sit
 * inside a picture frame or a newspaper's photo box, which are the two places the format needs one
 * (a wall of directors, a front-page mugshot). Kept STROKE-heavy so it still reads at 90px.
 */
export const Portrait: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
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
 * 'head' (a portrait). Used by the boardroom, the exchange floor, the office and the living room,
 * which is most of what a wall between waist height and the ceiling is made of.
 */
export const WallFrame: React.FC<{
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
 * A large flat chart — the subject of a frame rather than a prop on a wall.
 *
 * `WallFrame`'s `bars`/`line` art is a 150px picture; this is the whole board: axes with ticks,
 * ruled gridlines, a labelled title block and a series big enough to be what the shot is ABOUT
 * (bible §6 — the format's most repeated single-subject frame after the text card). It is also the
 * content a studio backdrop screen carries, which is why it lives here rather than in one template.
 *
 * `crash` overlays the reference's signature red down-leg (`LuEcoqizj0o/thumb.png`,
 * `KE-WJevx-7c/thumb.png` — a saturated polyline collapsing across a desaturated field), which is
 * the one saturated note a `grey`-keyed chart scene gets.
 *
 * ANIMATION: `live` re-derives ONLY the newest column from a seeded step counter, exactly as
 * `Monitor` does. One bar of ten changing on an ~4s clock is a single motion-locality cell, where
 * re-deriving the whole series would repaint the frame's largest object.
 */
export const ChartPlot: React.FC<{
  x: number; y: number; w: number; h: number; bars?: number; kind?: 'bars' | 'line' | 'area';
  seed?: number; live?: boolean; ground?: string; crash?: boolean; grid?: number;
}> = ({x, y, w, h, bars = 9, kind = 'bars', seed = 0, live = false, ground, crash = false, grid = 4}) => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  const face = ground ?? PAPER_WHITE;
  const padL = w * 0.09, padB = h * 0.13, padT = h * 0.16, padR = w * 0.05;
  const px = x + padL, py = y + padT;
  const pw = w - padL - padR, ph = h - padT - padB;
  const k = live ? stepIndex(f, seed * 2.3 + 7, 120) : 0;
  // the newest column is the only one that re-derives; everything left of it is fixed by its seed
  const val = (i: number) => 0.18 + rnd(seed * 61 + i * 5 + (i === bars - 1 ? k : 0)) * 0.74;
  const bw = pw / bars;
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} fill={face} stroke={INK} strokeWidth={STROKE} />
      {/* title block — a chart with no heading reads as a window with bars in it */}
      <SerifWords x={x + padL} y={y + h * 0.045} w={pw * 0.62} h={h * 0.062} words={2} seed={seed * 3} />
      <line x1={x + padL} y1={y + padT * 0.78} x2={x + w - padR} y2={y + padT * 0.78}
        stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.5} />
      {/* Ruled gridlines + their value ticks down the left axis, and a VERTICAL rule per category.
          The vertical ones are not decoration: flat fill counts pixels equal to their RIGHT
          neighbour, so a horizontal rule contributes almost nothing to it while a vertical rule
          breaks every row it crosses. A plot ruled only horizontally measured 99.3% flat over its
          upper half — the emptiest cell in any template in this file — with the ruling in place. */}
      <g opacity={0.32}>
        {Array.from({length: grid}, (_, i) => {
          const gy = py + (ph * (i + 1)) / (grid + 1);
          return (
            <g key={i}>
              <line x1={px} y1={gy} x2={px + pw} y2={gy} stroke={INK} strokeWidth={STROKE_THIN * 0.5} />
              <rect x={x + padL * 0.24} y={gy - 3} width={padL * 0.5} height={6} fill={INK} />
            </g>
          );
        })}
        {Array.from({length: bars - 1}, (_, i) => {
          const gx = px + (pw * (i + 1)) / bars;
          return (
            <g key={'v' + i}>
              <line x1={gx} y1={py} x2={gx} y2={py + ph} stroke={INK} strokeWidth={STROKE_THIN * 0.5} />
              <rect x={gx - 3} y={py + ph} width={6} height={padB * 0.24} fill={INK} />
            </g>
          );
        })}
      </g>
      {kind === 'bars' && Array.from({length: bars}, (_, i) => {
        const bh = ph * val(i);
        return <rect key={i} x={px + i * bw + bw * 0.16} y={py + ph - bh} width={bw * 0.68} height={bh}
          fill={i === bars - 1 ? c.accent : shade(tn.body, i % 2)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />;
      })}
      {kind !== 'bars' && (() => {
        const pts = Array.from({length: bars}, (_, i) =>
          [px + i * (pw / (bars - 1)), py + ph - ph * val(i)] as [number, number]);
        const line = pts.map((p) => `${p[0]},${p[1]}`).join(' ');
        return (
          <g>
            {kind === 'area' && (
              <path d={`M ${px} ${py + ph} L ${pts.map((p) => `${p[0]} ${p[1]}`).join(' L ')} L ${px + pw} ${py + ph} Z`}
                fill={shade(tn.body, 1)} stroke="none" />
            )}
            <polyline points={line} fill="none" stroke={INK} strokeWidth={STROKE * 0.7} strokeLinejoin="round" />
            {pts.map((p, i) => <circle key={i} cx={p[0]} cy={p[1]} r={STROKE * 0.7} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />)}
          </g>
        );
      })()}
      {/* axes last, so a series never paints over its own baseline */}
      <line x1={px} y1={py} x2={px} y2={py + ph} stroke={INK} strokeWidth={STROKE * 0.8} />
      <line x1={px} y1={py + ph} x2={px + pw} y2={py + ph} stroke={INK} strokeWidth={STROKE * 0.8} />
      {/* category labels under the baseline */}
      <TextLines x={px + bw * 0.2} y={py + ph + padB * 0.3} w={pw * 0.9} n={1} gap={9} th={5} seed={seed * 9} opacity={0.55} />
      {crash && (
        <polyline
          points={Array.from({length: 6}, (_, i) => {
            const t = i / 5;
            const jag = i % 2 ? 0.1 : 0;
            return `${px + pw * t},${py + ph * (0.14 + 0.72 * t - jag)}`;
          }).join(' ')}
          fill="none" stroke={c.accent} strokeWidth={STROKE * 1.5} strokeLinejoin="round" strokeLinecap="round" />
      )}
    </g>
  );
};

/**
 * Blocks of set type, drawn as geometry rather than as text.
 *
 * WHY NOT REAL TEXT. Templates are TOPIC-AGNOSTIC archetypes — the episode's actual words arrive
 * from director.tsx as overlays, so a literal headline baked into the art would be wrong for every
 * episode but one. What a headline contributes to a FRAME is its shape and weight, and that is what
 * this draws: word-length runs with a serif slab at each end, which is what reads as a serif
 * masthead at frame scale (bible §6.7).
 */
export const SerifWords: React.FC<{
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
export const TextLines: React.FC<{
  x: number; y: number; w: number; n: number; gap?: number; th?: number; seed?: number; opacity?: number;
}> = ({x, y, w, n, gap = 13, th = 4, seed = 0, opacity = 0.8}) => (
  <g fill={INK} opacity={opacity}>
    {Array.from({length: n}, (_, i) => (
      <rect key={i} x={x} y={y + i * gap} width={w * (i === n - 1 ? 0.42 + rnd(seed + i) * 0.3 : 0.86 + rnd(seed * 7 + i) * 0.14)} height={th} />
    ))}
  </g>
);

// ---------------------------------------------------------------------------
// PEOPLE
// ---------------------------------------------------------------------------

/**
 * How many of a crowd's bodies carry idle motion (WO-14).
 *
 * NOT all of them, and the reason is the camera-lock metric: a row spanning the frame with every
 * body moving lights up a whole band of the 8×6 motion-locality grid, which is the same failure as
 * a moving camera dressed up as character animation. A seeded MINORITY moves — chosen by the same
 * hash that placed the figure, so it is stable per element and not a live coin-flip — and each of
 * those runs on its own phase and rate inside StickFigure. The rest hold, exactly as before.
 *
 * A real crowd behaves this way too: at any instant most of a room is still and a few people are
 * shifting, which is what makes the mass read as people rather than as one pulsing organism.
 */
const CROWD_ALIVE = 0.34;
/** `frac` lets a template dial its own crowd down (or off) where the composition cannot afford the
 *  motion-locality cells — an occluded row behind a desk bank buys nothing and costs the same. */
const crowdAlive = (s: number, frac = CROWD_ALIVE): boolean => rnd(s + 13) < frac;

/**
 * A row of grey anonymous background people — the channel's primary focal-hierarchy device
 * (bible §6.5: "grey anonymous crowd + colour hero"), used behind the coloured subject.
 *
 * Depth jitter (±`dz`) keeps the row from reading as a chorus line, and roughly a third of the row
 * (see `crowdAlive`) carries a `subtle` idle so the background is not a photograph behind a moving
 * hero. The rest are still posed at frame 0 and are byte-identical to what they rendered before.
 */
export const CrowdRow: React.FC<{
  y: number; x0: number; x1: number; n: number; scale?: number; seed?: number;
  facing?: number; view?: 'front' | 'profile' | 'back'; dz?: number; alive?: number;
  /**
   * Draw faces on the row. OFF by default, which is right at episode scale — a background walker is
   * ~0.6 of the hero and its face would be noise competing with the one character the shot is about.
   * A THUMBNAIL is the other case: there the crowd is drawn near hero size, and a featureless head
   * over a same-width torso reads as a headless pill rather than a person (the reference's own crowd
   * carry eyes, brows and mouths at that size). So it is a switch, not a new default.
   */
  showFace?: boolean;
  /** Expression for the faces, when `showFace` is on. Defaults to StickFigure's neutral. */
  expr?: Expr;
}> = ({y, x0, x1, n, scale = 0.6, seed = 0, facing = 1, view = 'front', dz = 26, alive: aliveFrac,
       showFace = false, expr}) => {
  const f = useCurrentFrame();
  const step = n > 1 ? (x1 - x0) / (n - 1) : 0;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const s = seed * 149 + i * 11;
        const back = (rnd(s + 5) - 0.5) * 2;      // -1 .. 1 depth offset
        const alive = crowdAlive(s, aliveFrac);
        return (
          <StickFigure
            key={i}
            pose={A.stand(0)}
            x={x0 + i * step + (rnd(s) - 0.5) * step * 0.34}
            y={y + back * dz}
            scale={scale * (1 + back * 0.07)}
            facing={rnd(s + 2) > 0.5 ? facing : -facing}
            view={view}
            pal={DIM}
            showFace={showFace}
            expr={expr}
            frame={alive ? f : 0}
            idle={alive ? 'subtle' : 'none'}
          />
        );
      })}
    </g>
  );
};

/**
 * A seated row of grey anonymous workers.
 *
 * `CrowdRow` only STANDS, and every interior in the explainer format is full of people sitting — at
 * desks, around tables, in a gallery — where a standing row behind a desk reads as a queue. Same
 * contract as `CrowdRow` otherwise: DIM fills, no faces, and the same seeded minority (`crowdAlive`)
 * carrying a `subtle` idle while the rest hold.
 *
 * A working seat also gets its typing hands driven by the frame rather than frozen at 0 — a bank of
 * people at keyboards with nothing moving is the single most obviously dead thing in an office
 * frame — and each seat's typing clock is offset by its own seeded stagger so the row is not one
 * choir hitting the keys together.
 *
 * `working` swaps the seated pose for a typing one, which is what a desk bank needs.
 */
export const SeatedRow: React.FC<{
  y: number; x0: number; x1: number; n: number; scale?: number; seed?: number; facing?: number;
  view?: 'front' | 'profile' | 'back'; working?: boolean; alive?: number;
}> = ({y, x0, x1, n, scale = 0.8, seed = 0, facing = 1, view = 'front', working = false, alive: aliveFrac}) => {
  const f = useCurrentFrame();
  const step = n > 1 ? (x1 - x0) / (n - 1) : 0;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const s = seed * 173 + i * 19;
        const alive = crowdAlive(s, aliveFrac);
        // the typing clock is per-seat: a whole-number frame offset drawn from the seat's own seed
        const tf = alive ? f + Math.floor(rnd(s + 21) * 90) : 0;
        return (
          <StickFigure
            key={i}
            pose={working ? A.type_(tf, 30) : A.sit(tf)}
            x={x0 + i * step + (rnd(s) - 0.5) * step * 0.18}
            y={y + (rnd(s + 4) - 0.5) * 14}
            scale={scale * (0.95 + rnd(s + 2) * 0.1)}
            facing={view === 'front' ? (rnd(s + 6) > 0.5 ? facing : -facing) : facing}
            view={view}
            pal={DIM}
            showFace={false}
            frame={alive ? f : 0}
            idle={alive ? 'subtle' : 'none'}
          />
        );
      })}
    </g>
  );
};

/**
 * A QUEUE — a line of grey figures receding along a diagonal, near-large to far-small.
 *
 * `CrowdRow` places a row at ONE depth, which is a chorus line; a queue is the format's other crowd
 * shape entirely (the breadline, the bank run, the line at the door — bible §6.5 and the reference's
 * depression montage) and it is the one that carries real depth in a flat frame, because the scale
 * ramp does the work a perspective transform is not allowed to do.
 *
 * Drawn FAR-TO-NEAR so each nearer figure occludes the one behind it, which is the whole reason a
 * line of overlapping bodies reads as a queue and not as a scatter. Scale falls on a mild curve
 * rather than linearly, so the far end compresses the way a real line does.
 *
 * Motion: the same seeded minority as every other crowd here (`crowdAlive`), and only the NEAR half
 * is eligible — a 0.3-scale body at the far end moves too few pixels to register as anything except
 * an extra active cell on the lock grid.
 *
 * `faceScale` is the fix for a defect this project has now shipped twice: a `DIM` figure drawn near
 * hero size with no face reads as a headless grey pill, not as a person (COMPARISON's thumbnail MISS
 * #13, and `cityStreet`'s own "two grey boulders" note). A queue is the one crowd whose scale RANGE
 * crosses that threshold inside a single call, so it cannot be a boolean the way `CrowdRow`'s is:
 * every figure drawn at or above this scale gets a face, everything smaller stays featureless.
 */
export const CrowdColumn: React.FC<{
  xNear: number; yNear: number; xFar: number; yFar: number; n: number;
  scaleNear?: number; scaleFar?: number; seed?: number; facing?: number;
  view?: 'front' | 'profile' | 'back'; alive?: number; faceScale?: number; expr?: Expr;
}> = ({xNear, yNear, xFar, yFar, n, scaleNear = 1, scaleFar = 0.34, seed = 0, facing = 1,
       view = 'profile', alive: aliveFrac, faceScale = 0.82, expr}) => {
  const f = useCurrentFrame();
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        // t: 0 at the far end, 1 at the near end. i counts from the far end so the draw order is
        // back-to-front and React's key order IS the paint order.
        const t = n > 1 ? i / (n - 1) : 1;
        const s = seed * 311 + i * 23;
        const ease = Math.pow(t, 1.6);                 // the far end compresses, as a real line does
        const scale = scaleFar + (scaleNear - scaleFar) * ease;
        const jitter = (rnd(s) - 0.5) * 0.5;           // ±half a slot, so the line is not a comb
        const x = xFar + (xNear - xFar) * (ease + jitter * (1 / n));
        const y = yFar + (yNear - yFar) * ease;
        const alive = t > 0.5 && crowdAlive(s, aliveFrac);
        return (
          <StickFigure
            key={i}
            pose={A.stand(0)}
            x={x}
            y={y}
            scale={scale}
            facing={facing}
            view={view}
            pal={DIM}
            showFace={scale >= faceScale}
            expr={expr}
            frame={alive ? f : 0}
            idle={alive ? 'subtle' : 'none'}
          />
        );
      })}
    </g>
  );
};

/**
 * A packed mass of featureless grey heads — the reference's deep crowd (depression montage 15:00),
 * where the back rows are heads only. Far cheaper than full figures and reads correctly as a mass.
 *
 * TONE (WO-8e): rows step one rung LIGHTER with depth, so the mass separates into rows and off the
 * wall behind it instead of reading as a single grey clot. The reference's stair crowd does exactly
 * this — the figures behind are paler than the ones in front.
 *
 * MOTION (WO-14): the same seeded minority as the figure crowds nods, each on its own slow clock,
 * and only by a fraction of a head radius. A deep crowd is the classic place for unison motion to
 * ruin a frame, so the fraction is deliberately small and no two heads share a period.
 */
export const CrowdHeads: React.FC<{
  y: number; x0: number; x1: number; n: number; rows?: number; r?: number; seed?: number;
  fill?: string; alive?: number;
}> = ({y, x0, x1, n, rows = 2, r = 34, seed = 0, fill, alive = 0.14}) => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const out: React.ReactNode[] = [];
  // row 0 is the front row; each row behind it lifts a rung, capped so a deep crowd stays on ladder
  const rowFill = (row: number) => shade(fill ?? c.crowd, Math.min(TONE_MAX_STEP, row));
  for (let row = 0; row < rows; row++) {
    const tone = rowFill(row);
    for (let i = 0; i < n; i++) {
      const s = seed * 613 + row * 97 + i * 17;
      const step = (x1 - x0) / n;
      const cx = x0 + (i + 0.5) * step + (rnd(s) - 0.5) * step * 0.5;
      const cy = y - row * r * 1.15 + (rnd(s + 3) - 0.5) * r * 0.4;
      const rr = r * (0.86 + rnd(s + 6) * 0.28);
      // a nod: ±0.16 of a head radius, on a period of its own. The same frame-0 ramp StickFigure
      // uses, so a still (thumbs.tsx composes this crowd) renders exactly as it did before.
      const nod = crowdAlive(s, alive)
        ? Math.sin((f / 30) * 2.4 * (0.6 + rnd(s + 8) * 0.8) + rnd(s + 9) * 6.283) * rr * 0.16 * Math.min(1, Math.max(0, f / 8))
        : 0;
      out.push(
        <g key={`${row}_${i}`} transform={nod === 0 ? undefined : `translate(0 ${nod.toFixed(3)})`}>
          {/* shoulders under the head so the mass reads as people, not as bubbles */}
          <path d={`M ${cx - rr * 1.5} ${cy + rr * 2.4} Q ${cx} ${cy + rr * 0.5} ${cx + rr * 1.5} ${cy + rr * 2.4} Z`}
            fill={tone} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <ellipse cx={cx} cy={cy} rx={rr} ry={rr * 1.1} fill={tone} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        </g>
      );
    }
  }
  return <g>{out}</g>;
};

// ---------------------------------------------------------------------------
// FOREGROUND
// ---------------------------------------------------------------------------

/**
 * Over-the-shoulder foreground silhouette (bible §6.8) — a near-black head+shoulder mass anchored to
 * a bottom corner, which is how the reference builds depth in dialogue and observation shots
 * (wolf montage 3:34).
 *
 * Kept deliberately modest in area: a foreground mass is a LARGE flat region, so it buys depth at
 * the cost of the flat-fill budget.
 */
export const OverShoulder: React.FC<{side?: 'left' | 'right'; y?: number; scale?: number}> =
({side = 'right', y = 1080, scale = 1}) => {
  const dir = side === 'right' ? -1 : 1;
  const x = side === 'right' ? 1920 : 0;
  const hr = 104 * scale;                 // head radius
  const hx = x + dir * 210 * scale;       // head centre
  const hy = y - 372 * scale;
  const nk = hy + hr * 1.18;              // where the neck leaves the head
  const out = x + dir * 560 * scale;      // where the shoulder line reaches the floor
  return (
    <g fill="#0a0a0a">
      {/* shoulder + upper arm, sloping from the frame edge out past the head */}
      <path d={`M ${x} ${y}
                L ${x} ${nk + hr * 0.55}
                Q ${x + dir * 60 * scale} ${nk + hr * 0.10} ${hx - dir * hr * 0.55} ${nk}
                L ${hx + dir * hr * 0.55} ${nk}
                Q ${x + dir * 420 * scale} ${nk + hr * 0.55} ${out} ${y} Z`} />
      <ellipse cx={hx} cy={hy} rx={hr} ry={hr * 1.14} />
    </g>
  );
};

/**
 * A post-and-rail fence / barrier line — airfield perimeter, ranch, worksite, crowd barrier.
 * Layered in front of a distant crowd it is what separates "background people" from "extras
 * standing in the same room as the hero".
 */
export const Fence: React.FC<{
  x0: number; x1: number; y: number; h?: number; posts?: number; rails?: number; opacity?: number;
}> = ({x0, x1, y, h = 74, posts = 14, rails = 2, opacity = 0.8}) => (
  <g opacity={opacity} stroke={INK} strokeWidth={STROKE_THIN * 0.8} strokeLinecap="round">
    {Array.from({length: rails}, (_, i) => {
      const ry = y - h + (h * 0.55 * i) / Math.max(1, rails - 1);
      return <line key={'r' + i} x1={x0} y1={ry} x2={x1} y2={ry} />;
    })}
    {Array.from({length: posts}, (_, i) => {
      const px = x0 + ((x1 - x0) * i) / (posts - 1);
      return <line key={'p' + i} x1={px} y1={y - h} x2={px} y2={y} />;
    })}
  </g>
);
