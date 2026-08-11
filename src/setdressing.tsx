import React from 'react';
import {StickFigure, DIM} from './figure';
import * as A from './actions';
import {INK, PAPER_WHITE, STROKE, STROKE_THIN} from './crayonStyle';
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
//   - Static. Nothing here takes `frame` and nothing animates, so composing more set dressing can
//     never cost camera-lock cells (bible §3). Motion stays with the characters and hero props.
//   - Colour comes from the scene's key via `useSceneColors()` (bg/mid/accent/crowd) plus INK and
//     PAPER_WHITE. Callers may override a fill, but the DEFAULT is always the scene's own token, so
//     dropping a cabinet wall into any template keys it correctly with no per-call palette work.
// ============================================================================

/** Deterministic hash-noise in [0,1). Same generator scenes.tsx/stage.tsx use, so a seeded layout
 *  renders identically on every machine and every frame (including cloud renders). */
const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1 + 31.7) * 43758.5453;
  return x - Math.floor(x);
};

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
 */
export const SlabFloor: React.FC<{
  y: number; fill?: string; cols?: number; rows?: number; bottom?: number; opacity?: number;
}> = ({y, fill, cols = 9, rows = 5, bottom = 1080, opacity = 0.28}) => {
  const c = useSceneColors();
  const h = bottom - y;
  // row lines: spacing grows toward the viewer (t^1.9), i.e. slabs get taller as they approach
  const rowYs = Array.from({length: rows}, (_, i) => y + h * Math.pow((i + 1) / (rows + 1), 1.9));
  return (
    <g>
      <rect x={0} y={y} width={1920} height={h} fill={fill ?? c.mid} />
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
 */
export const UnitWall: React.FC<{
  x: number; y: number; w: number; h: number; cols: number; rows: number;
  fill?: string; handle?: boolean; opacity?: number;
}> = ({x, y, w, h, cols, rows, fill, handle = true, opacity = 1}) => {
  const c = useSceneColors();
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const cx = x + k * cw, cy = y + r * ch;
      cells.push(<rect key={`u${r}_${k}`} x={cx + 3} y={cy + 3} width={cw - 6} height={ch - 6}
        fill={fill ?? c.mid} stroke={INK} strokeWidth={STROKE_THIN} />);
      if (handle) {
        cells.push(<rect key={`h${r}_${k}`} x={cx + cw * 0.36} y={cy + ch * 0.56} width={cw * 0.28}
          height={Math.max(4, ch * 0.07)} rx={2} fill={INK} />);
      }
    }
  }
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill ?? c.mid} stroke={INK} strokeWidth={STROKE} />
      {cells}
    </g>
  );
};

/**
 * A corrugated/ribbed panel: hangar shutter, roller door, radiator, blind, container side.
 * Vertical ribs when `dir` is 'v' (a shutter is horizontal-ribbed — pass 'h').
 */
export const RibbedPanel: React.FC<{
  x: number; y: number; w: number; h: number; ribs: number;
  fill?: string; dir?: 'v' | 'h'; opacity?: number;
}> = ({x, y, w, h, ribs, fill, dir = 'h', opacity = 1}) => {
  const c = useSceneColors();
  return (
    <g opacity={opacity}>
      <rect x={x} y={y} width={w} height={h} fill={fill ?? c.mid} stroke={INK} strokeWidth={STROKE_THIN} />
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
 */
export const BuildingBand: React.FC<{
  baseY: number; x0: number; x1: number; n: number; seed?: number;
  fill?: string; opacity?: number; minH?: number; maxH?: number;
}> = ({baseY, x0, x1, n, seed = 0, fill, opacity = 1, minH = 90, maxH = 190}) => {
  const c = useSceneColors();
  const units: React.ReactNode[] = [];
  const span = (x1 - x0) / n;
  for (let i = 0; i < n; i++) {
    const s = seed * 977 + i * 13;
    const w = span * (0.72 + rnd(s) * 0.24);
    const bx = x0 + i * span + (span - w) / 2;
    const h = minH + rnd(s + 3) * (maxH - minH);
    const top = baseY - h;
    const shutter = rnd(s + 7) > 0.45;
    // A taller unit carries more storeys / more shutter ribs. Detail density tracks the drawn size
    // instead of a fixed count, so the same component reads correctly as a 90px shed and a 500px hangar.
    const winRows = Math.max(1, Math.round(h / 190));
    const doorH = Math.min(h * 0.62, 250);
    units.push(
      <g key={i}>
        <rect x={bx} y={top} width={w} height={h} fill={fill ?? c.mid} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* roof lip — reads as a parapet, and separates neighbouring units of the same fill */}
        <rect x={bx - 8} y={top - 10} width={w + 16} height={12} fill={fill ?? c.mid} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        {/* storey bands: what stops a tall block reading as one slab */}
        {Array.from({length: winRows}, (_, r) => (
          <g key={'w' + r}>
            <line x1={bx} y1={top + (h - doorH) * ((r + 1) / (winRows + 1))} x2={bx + w}
              y2={top + (h - doorH) * ((r + 1) / (winRows + 1))} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.45} />
            {Array.from({length: 7}, (_, k) => (
              <rect key={k} x={bx + w * (0.07 + k * 0.128)} y={top + (h - doorH) * ((r + 0.25) / (winRows + 1)) + 14}
                width={w * 0.088} height={Math.min(64, (h - doorH) / (winRows + 1) * 0.5)}
                fill={INK} opacity={0.5} />
            ))}
          </g>
        ))}
        {shutter
          ? <RibbedPanel x={bx + w * 0.16} y={baseY - doorH} w={w * 0.68} h={doorH} ribs={Math.max(6, Math.round(doorH / 24))} fill={fill ?? c.mid} />
          : <RibbedPanel x={bx + w * 0.1} y={baseY - doorH} w={w * 0.8} h={doorH} ribs={Math.max(5, Math.round(w / 34))} dir="v" fill={fill ?? c.mid} />}
      </g>
    );
  }
  return <g opacity={opacity}>{units}</g>;
};

// ---------------------------------------------------------------------------
// PROP CLUSTERS
// ---------------------------------------------------------------------------

/**
 * A leaning stack of cardboard boxes — the reference's storage room (wolf montage 2:08). Each box
 * gets a lid seam and a tape strip, which is what makes a pile read as boxes and not as blocks.
 */
export const BoxStack: React.FC<{
  x: number; baseY: number; n?: number; s?: number; seed?: number; fill?: string;
}> = ({x, baseY, n = 4, s = 1, seed = 0, fill}) => {
  const c = useSceneColors();
  const boxes: React.ReactNode[] = [];
  let y = baseY;
  for (let i = 0; i < n; i++) {
    const r = seed * 313 + i * 7;
    const w = (110 + rnd(r) * 70) * s;
    const h = (74 + rnd(r + 2) * 34) * s;
    const bx = x - w / 2 + (rnd(r + 4) - 0.5) * 34 * s;
    y -= h;
    boxes.push(
      <g key={i}>
        <rect x={bx} y={y} width={w} height={h} fill={fill ?? c.mid} stroke={INK} strokeWidth={STROKE_THIN} />
        <line x1={bx} y1={y + h * 0.3} x2={bx + w} y2={y + h * 0.3} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        <rect x={bx + w * 0.42} y={y} width={w * 0.16} height={h * 0.3} fill={INK} opacity={0.25} />
      </g>
    );
  }
  return <g>{boxes}</g>;
};

/** A stack of suitcases/crates on a baggage cart, shipping pallet or porter's trolley. */
export const CaseStack: React.FC<{
  x: number; baseY: number; n?: number; s?: number; seed?: number;
}> = ({x, baseY, n = 4, s = 1, seed = 0}) => {
  const c = useSceneColors();
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
        <rect x={bx} y={y} width={w} height={h} rx={6 * s} fill={i % 2 ? PAPER_WHITE : c.mid} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* strap + handle: the two details that make a rounded rect read as luggage */}
        <line x1={bx + w * 0.3} y1={y} x2={bx + w * 0.3} y2={y + h} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        <rect x={bx + w * 0.44} y={y - 7 * s} width={w * 0.2} height={8 * s} rx={4 * s} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      </g>
    );
  }
  return <g>{out}</g>;
};

/** A wheeled flatbed — baggage cart, hand truck, service trolley, gurney base. */
export const Trolley: React.FC<{x: number; y: number; w?: number; s?: number}> = ({x, y, w = 300, s = 1}) => {
  const c = useSceneColors();
  const wheelR = 24 * s;
  return (
    <g>
      <rect x={x} y={y} width={w} height={18 * s} fill={c.mid} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x + 10} y={y + 18 * s} width={16 * s} height={26 * s} fill={INK} opacity={0.6} />
      <rect x={x + w - 26 * s} y={y + 18 * s} width={16 * s} height={26 * s} fill={INK} opacity={0.6} />
      <circle cx={x + 46 * s} cy={y + 44 * s + wheelR} r={wheelR} fill={INK} />
      <circle cx={x + w - 46 * s} cy={y + 44 * s + wheelR} r={wheelR} fill={INK} />
      <circle cx={x + 46 * s} cy={y + 44 * s + wheelR} r={wheelR * 0.38} fill={c.mid} />
      <circle cx={x + w - 46 * s} cy={y + 44 * s + wheelR} r={wheelR * 0.38} fill={c.mid} />
      {/* draw bar */}
      <line x1={x} y1={y + 6 * s} x2={x - 70 * s} y2={y + 52 * s} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
    </g>
  );
};

/** Safety cone — apron, roadworks, gym, film set, warehouse. The scene accent gets one honest use. */
export const Cone: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const c = useSceneColors();
  return (
    <g>
      <path d={`M ${x} ${y - 56 * s} L ${x + 26 * s} ${y} L ${x - 26 * s} ${y} Z`} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 20 * s} y={y - 34 * s} width={40 * s} height={10 * s} fill={PAPER_WHITE} />
      <rect x={x - 34 * s} y={y - 6 * s} width={68 * s} height={12 * s} rx={3 * s} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
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
// PEOPLE
// ---------------------------------------------------------------------------

/**
 * A row of grey anonymous background people — the channel's primary focal-hierarchy device
 * (bible §6.5: "grey anonymous crowd + colour hero"), used behind the coloured subject.
 *
 * Deliberately STATIC: every figure is posed at frame 0 and drawn faceless, so a crowd never costs
 * camera-lock cells and never pulls the eye off the hero. Depth jitter (±`dz`) keeps the row from
 * reading as a chorus line.
 */
export const CrowdRow: React.FC<{
  y: number; x0: number; x1: number; n: number; scale?: number; seed?: number;
  facing?: number; view?: 'front' | 'profile' | 'back'; dz?: number;
}> = ({y, x0, x1, n, scale = 0.6, seed = 0, facing = 1, view = 'front', dz = 26}) => {
  const step = n > 1 ? (x1 - x0) / (n - 1) : 0;
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const s = seed * 149 + i * 11;
        const back = (rnd(s + 5) - 0.5) * 2;      // -1 .. 1 depth offset
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
            showFace={false}
            frame={0}
          />
        );
      })}
    </g>
  );
};

/**
 * A packed mass of featureless grey heads — the reference's deep crowd (depression montage 15:00),
 * where the back rows are heads only. Far cheaper than full figures and reads correctly as a mass.
 */
export const CrowdHeads: React.FC<{
  y: number; x0: number; x1: number; n: number; rows?: number; r?: number; seed?: number; fill?: string;
}> = ({y, x0, x1, n, rows = 2, r = 34, seed = 0, fill}) => {
  const c = useSceneColors();
  const out: React.ReactNode[] = [];
  for (let row = 0; row < rows; row++) {
    for (let i = 0; i < n; i++) {
      const s = seed * 613 + row * 97 + i * 17;
      const step = (x1 - x0) / n;
      const cx = x0 + (i + 0.5) * step + (rnd(s) - 0.5) * step * 0.5;
      const cy = y - row * r * 1.15 + (rnd(s + 3) - 0.5) * r * 0.4;
      const rr = r * (0.86 + rnd(s + 6) * 0.28);
      out.push(
        <g key={`${row}_${i}`}>
          {/* shoulders under the head so the mass reads as people, not as bubbles */}
          <path d={`M ${cx - rr * 1.5} ${cy + rr * 2.4} Q ${cx} ${cy + rr * 0.5} ${cx + rr * 1.5} ${cy + rr * 2.4} Z`}
            fill={fill ?? c.crowd} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <ellipse cx={cx} cy={cy} rx={rr} ry={rr * 1.1} fill={fill ?? c.crowd} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
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
