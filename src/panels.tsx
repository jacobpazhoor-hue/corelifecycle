// CRAYON multi-panel splits — bible §6 device 4.
//
// "Multi-panel splits divided by black gutters — 2-panel vertical, 2-panel diagonal, 4-panel grid —
// each panel independently colour-keyed."
//
// Measured off the verified frames (each montage cell is one full 16:9 frame at 308x174, so
// 1 cell px = 6.234 px at 1920 wide / 6.207 px at 1080 tall):
//
//   depression 10:10  2-panel VERTICAL. The only fully-dark columns in the cell are 153 and 154 of
//                     308 — a 2 cell px gutter (~12 px @1920) centred exactly on the half. Interior
//                     night on the left, exterior dust on the right: two grounds, two colour keys.
//                     No gutter on the outer edges; both panels bleed to the frame edge.
//   wolf       12:22  4-panel GRID. Fully-dark rows 85 and 86 of 174 — the same 2 cell px gutter, again
//                     on the half. (The vertical gutter never reads as fully dark at this resolution,
//                     so the grid's two gutters are taken to be the same weight as the measured one.)
//                     All four panels are independently graded: navy, blue-grey, violet, teal.
//   wolf        9:20  2-panel DIAGONAL. Tracing the orange/navy boundary gives dx/dy = -1.179 over the
//                     top-right run (rows 3..31) and -1.086 over the bottom-left run (rows 136..171);
//                     corrected for the cell's aspect that is a boundary ~49° off vertical, leaning so
//                     the TOP edge sits right of the bottom edge. The boundary carries a dark line
//                     about 1 cell px wide (~6 px @1920) — thinner than the grid gutters, and at the
//                     anti-aliasing floor, so it is drawn at the shared gutter weight rather than
//                     forked (see PANEL_GUTTER_AT_1920).
//
// Flat only. The gutter is a flat INK ground showing through the gaps between the panels, and each
// panel paints one flat colour behind its children. NO gradients: Chromium dithers every gradient it
// paints and the dither destroys the project's flat-fill metric (bible §5).
//
// Nothing here animates. A split is a layout, and the camera is locked.
//
// Presentational only: it composes children into cells and nothing else. Timeline integration is a
// later work order — this file has no importers yet, exactly like textcard.tsx.

import React from 'react';
import {AbsoluteFill, useVideoConfig} from 'remotion';

import {INK} from './crayonStyle';
import {SceneGroundOverride} from './stage';

// ---------------------------------------------------------------------------
// Geometry
// ---------------------------------------------------------------------------

/**
 * Gutter thickness in px at 1920 wide, scaled to the real composition width by `gutterPx()`.
 * Measured 2 cell px on both the 10:10 vertical split and the 12:22 grid = 12.5 px @1920.
 */
export const PANEL_GUTTER_AT_1920 = 12;

/**
 * Default diagonal lean: horizontal run per unit of vertical drop, so the boundary's TOP end sits to
 * the RIGHT of its bottom end — the direction both of the 9:20 reference's parallel diagonals lean.
 * 1.13 is the mean of the two traced runs (1.179 top-right, 1.086 bottom-left), i.e. ~49° off vertical.
 */
export const PANEL_DIAGONAL_LEAN = 1.13;

const gutterPx = (width: number): number => (PANEL_GUTTER_AT_1920 * width) / 1920;

// ---------------------------------------------------------------------------
// A panel
// ---------------------------------------------------------------------------

export type Panel = {
  /**
   * The panel's own flat ground. Each cell in the reference commits to its own colour key, so this is
   * required, not defaulted: an unset ground would let two cells share a hue by accident, which is the
   * one thing an independently-keyed split must not do.
   *
   * AUTHORITATIVE OVER `children`. A template child paints its own full-frame ground from its colour
   * key, which used to land on top of this one and discard it — a cell asking for the reference's
   * saturated orange got its template's brown instead, silently. `Cell` now publishes this colour as
   * the scene ground for the child's whole subtree, so the cell's ground is the ground whatever it
   * contains. The caller is not overruled and is not ignored.
   */
  ground: string;
  /**
   * Anything: a scene, a figure, a prop cluster. Children are laid out on a FULL-FRAME canvas which is
   * then centred on this panel and clipped to it — so a full-frame composition passed straight in
   * arrives as a centre crop at its native scale, which is what the 10:10 split does with its interior.
   * Use `scale` to pull the whole frame back inside a smaller cell instead.
   */
  children?: React.ReactNode;
  /** Uniform scale of the child canvas about its own centre. 1 = native (a crop). */
  scale?: number;
  /** Shift of the child canvas inside the panel, as fractions of the FRAME. Re-centres the crop. */
  offsetX?: number;
  offsetY?: number;
};

/**
 * One cell: a clipped window, a flat ground, and a full-frame child canvas centred inside it.
 *
 * `left/top/width/height` are the cell's rectangle in px. Rectangular variants use it directly;
 * the diagonal variant hands it the whole frame and adds a `clipPath` on top.
 */
const Cell: React.FC<{
  panel: Panel;
  left: number;
  top: number;
  width: number;
  height: number;
  frameWidth: number;
  frameHeight: number;
  clipPath?: string;
}> = ({panel, left, top, width, height, frameWidth, frameHeight, clipPath}) => {
  const {ground, children, scale = 1, offsetX = 0, offsetY = 0} = panel;
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        width,
        height,
        overflow: 'hidden',
        backgroundColor: ground,
        clipPath,
      }}
    >
      <div
        style={{
          position: 'absolute',
          // the child canvas is frame-sized and centred on the cell, so a full-frame scene crops
          left: (width - frameWidth) / 2 + offsetX * frameWidth,
          top: (height - frameHeight) / 2 + offsetY * frameHeight,
          width: frameWidth,
          height: frameHeight,
          transform: scale === 1 ? undefined : `scale(${scale})`,
        }}
      >
        {/* the cell's ground wins over the child template's keyed ground — see `Panel.ground`.
            With no template this is a no-op, and with a template whose key already resolves to this
            colour (the writer-facing default) it is the identity, so only an explicit override moves. */}
        <SceneGroundOverride ground={ground}>{children}</SceneGroundOverride>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Diagonal clipping
// ---------------------------------------------------------------------------

type Pt = [number, number];

/**
 * Sutherland–Hodgman clip of a convex polygon against the half-plane `f(p) <= 0`.
 *
 * Used instead of a hand-written four-vertex polygon so the diagonal keeps working when the boundary
 * leaves through the top and bottom edges (steep lean) OR through the left and right edges (shallow
 * lean) — a hardcoded vertex list silently produces a wrong shape at one of those.
 */
const clipHalfPlane = (poly: Pt[], f: (p: Pt) => number): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const fa = f(a);
    const fb = f(b);
    if (fa <= 0) out.push(a);
    if (fa <= 0 !== fb <= 0) {
      const t = fa / (fa - fb);
      out.push([a[0] + t * (b[0] - a[0]), a[1] + t * (b[1] - a[1])]);
    }
  }
  return out;
};

const polygonCss = (poly: Pt[]): string =>
  `polygon(${poly.map(([px, py]) => `${px.toFixed(2)}px ${py.toFixed(2)}px`).join(', ')})`;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export type PanelsProps =
  /** Two cells side by side, split down the middle by a vertical gutter (depression 10:10). */
  | {variant: 'v2'; panels: [Panel, Panel]; split?: number}
  /**
   * Two cells split by a leaning straight gutter (wolf 9:20). `panels[0]` is the LEFT/lower-left side.
   * `split` is where the boundary crosses the vertical middle, as a fraction of frame width.
   */
  | {variant: 'diagonal2'; panels: [Panel, Panel]; split?: number; lean?: number}
  /** Four cells, reading order top-left, top-right, bottom-left, bottom-right (wolf 12:22). */
  | {variant: 'grid4'; panels: [Panel, Panel, Panel, Panel]; split?: number; splitY?: number};

/**
 * A multi-panel split. The root is a flat INK ground; the panels sit on top of it with a gap between
 * them, so the gutter IS the ground showing through and is guaranteed to be exactly `PANEL_GUTTER`
 * wide everywhere, including on the diagonal.
 *
 * Panels bleed to the frame edges — the reference never draws an outer border around the split.
 */
export const Panels: React.FC<PanelsProps> = (props) => {
  const {width, height} = useVideoConfig();
  const g = gutterPx(width);
  const half = g / 2;

  if (props.panels.some((p) => !p.ground)) {
    throw new Error('panels: every panel needs its own flat `ground` — the split is independently keyed');
  }

  const shared = {frameWidth: width, frameHeight: height};

  if (props.variant === 'v2') {
    const split = props.split ?? 0.5;
    const x = split * width;
    return (
      <AbsoluteFill style={{backgroundColor: INK}}>
        <Cell panel={props.panels[0]} left={0} top={0} width={x - half} height={height} {...shared} />
        <Cell panel={props.panels[1]} left={x + half} top={0} width={width - x - half} height={height} {...shared} />
      </AbsoluteFill>
    );
  }

  if (props.variant === 'grid4') {
    const x = (props.split ?? 0.5) * width;
    const y = (props.splitY ?? 0.5) * height;
    const cols: [number, number][] = [
      [0, x - half],
      [x + half, width - x - half],
    ];
    const rows: [number, number][] = [
      [0, y - half],
      [y + half, height - y - half],
    ];
    return (
      <AbsoluteFill style={{backgroundColor: INK}}>
        {props.panels.map((panel, i) => {
          const [left, w] = cols[i % 2];
          const [top, h] = rows[Math.floor(i / 2)];
          return <Cell key={i} panel={panel} left={left} top={top} width={w} height={h} {...shared} />;
        })}
      </AbsoluteFill>
    );
  }

  // diagonal2 — boundary x(y) = cx + lean * (cy - y), so y=0 (top) sits `lean*cy` RIGHT of centre.
  const lean = props.lean ?? PANEL_DIAGONAL_LEAN;
  const cx = (props.split ?? 0.5) * width;
  const cy = height / 2;
  const boundaryX = (y: number): number => cx + lean * (cy - y);

  // A perpendicular offset of `half` is a HORIZONTAL offset of half * sqrt(1 + lean²): the boundary's
  // normal is (1, lean)/sqrt(1+lean²), so sliding sideways buys less clearance the more it leans.
  const dx = half * Math.sqrt(1 + lean * lean);

  const rect: Pt[] = [
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
  ];
  const leftPoly = clipHalfPlane(rect, ([px, py]) => px - (boundaryX(py) - dx));
  const rightPoly = clipHalfPlane(rect, ([px, py]) => boundaryX(py) + dx - px);
  if (leftPoly.length < 3 || rightPoly.length < 3) {
    throw new Error(
      `panels: diagonal split (split=${props.split ?? 0.5}, lean=${lean}) leaves one side off-frame`
    );
  }

  return (
    <AbsoluteFill style={{backgroundColor: INK}}>
      <Cell
        panel={props.panels[0]}
        left={0}
        top={0}
        width={width}
        height={height}
        clipPath={polygonCss(leftPoly)}
        {...shared}
      />
      <Cell
        panel={props.panels[1]}
        left={0}
        top={0}
        width={width}
        height={height}
        clipPath={polygonCss(rightPoly)}
        {...shared}
      />
    </AbsoluteFill>
  );
};
