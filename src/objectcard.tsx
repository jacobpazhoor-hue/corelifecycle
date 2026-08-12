// CRAYON object showcase card — bible §6 device 6, "isometric flat products floating on pure white".
//
// COMPARISON scored this MISS ("not built"). It is the reference's "here is the thing being sold /
// bought / repossessed" beat, and a finance explainer hits that constantly.
//
// MEASURED off the 0:35 cell of `docs/research/crayon/frames/depression_montage_verified.jpg` (each
// montage cell is one full 16:9 frame; the crop below is x 4–304 / y 156–322, ink = luma < 190):
//
//   three objects — a toaster, an upright vacuum, a refrigerator — on a ground that samples EXACTLY
//   #f8f8f8-to-white, no floor, no shadow, no horizon line;
//   object ink widths      0.300 · 0.250 · 0.203 of frame width
//   object tops            0.193 · 0.181 · 0.199 of frame height
//   object bases           0.837 · 0.789 · 0.801
//   object heights         0.645 · 0.608 · 0.602   <- all three within 7% of each other
//   the row spans x 0.073 → 0.903, i.e. 0.83 of the frame, centred
//   ink covers 28.5% of the cell
//
// The heights are the finding: a toaster is drawn as tall as a refrigerator. These are not props at
// real-world relative scale, they are SHOWCASE objects, each filling its own share of the frame — so
// the layout below sets every object to ONE target height and lets the widths fall where they may.
//
// Colour, sampled from the same cell: a grey body #a8a8a8, a navy #384858, a saturated teal #50c0b8
// with its shaded faces at #388080 — one flat tone per face, three tones per object, nothing blended.
// Every fill here is a flat colour off `shade()`'s ladder. NO GRADIENTS: Chromium dithers every
// gradient it paints and the dither destroys the flat-fill metric (bible §5).
//
// Nothing animates per frame except the shared card entrance (opacity + a small rise on the ROW, not
// on the frame) — the camera is locked (bible §3).

import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';

import {INK, PAPER_WHITE, STROKE, shade} from './crayonStyle';
import {TEXTCARD_ENTRANCE_FRAMES} from './textcard';

// ---------------------------------------------------------------------------
// Isometric primitives
//
// Authoring space is the 1920×1080 viewBox scaled per object (see `place()`), with each object drawn
// around x=0 and standing ON y=0, growing upward into negative y. That is what lets the layout put a
// row of unrelated objects on one baseline without every drawing agreeing on a bounding box.
// ---------------------------------------------------------------------------

/** Screen delta of one unit along the +X (right-and-back) iso axis. 30° isometric. */
const AX = Math.cos(Math.PI / 6);
const AY = Math.sin(Math.PI / 6);

type Pt = [number, number];
const pts = (p: Pt[]): string => p.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(' ');

/**
 * A flat isometric box, anchored at its nearest-bottom corner.
 *
 * Three visible faces, three flat tones off one colour: top lightest, left the base colour, right one
 * rung down. That three-tone read is what makes the reference's toaster and fridge look solid without
 * a single gradient.
 */
const IsoBox: React.FC<{
  x: number; y: number; w: number; d: number; h: number; color: string; stroke: number;
}> = ({x, y, w, d, h, color, stroke}) => {
  const O: Pt = [x, y];
  const X: Pt = [O[0] + AX * w, O[1] - AY * w];
  const Y: Pt = [O[0] - AX * d, O[1] - AY * d];
  const XY: Pt = [O[0] + AX * w - AX * d, O[1] - AY * w - AY * d];
  const up = (p: Pt): Pt => [p[0], p[1] - h];
  const common = {stroke: INK, strokeWidth: stroke, strokeLinejoin: 'round' as const};
  return (
    <g {...common}>
      <polygon points={pts([O, X, up(X), up(O)])} fill={shade(color, -1)} />
      <polygon points={pts([O, Y, up(Y), up(O)])} fill={color} />
      <polygon points={pts([up(O), up(X), up(XY), up(Y)])} fill={shade(color, 1)} />
    </g>
  );
};

/** A flat isometric cylinder — a coin, a can, a drum. Top ellipse + a straight side wall. */
const IsoCylinder: React.FC<{
  x: number; y: number; r: number; h: number; color: string; stroke: number;
}> = ({x, y, r, h, color, stroke}) => {
  const ry = r * AY; // the same 30° squash the boxes use, so cylinders sit in the same space
  const common = {stroke: INK, strokeWidth: stroke, strokeLinejoin: 'round' as const};
  return (
    <g {...common}>
      <path d={`M ${x - r} ${y - h} L ${x - r} ${y} A ${r} ${ry} 0 0 0 ${x + r} ${y} L ${x + r} ${y - h} Z`}
        fill={shade(color, -1)} />
      <ellipse cx={x} cy={y - h} rx={r} ry={ry} fill={shade(color, 1)} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// The object library
//
// TO ADD AN OBJECT: add one entry to OBJECTS. `height`/`width` are its authoring-space extents (the
// layout scales every object to one target height, so only their RATIO matters), and `draw` renders
// it standing on y=0 and centred on x=0. Nothing else in the file needs to change, and the new key is
// immediately writable from `content.py` — the validator's error message lists the registry, so a
// typo names the alternatives.
// ---------------------------------------------------------------------------

type DrawArgs = {color: string; stroke: number};

export type ShowcaseObject = {
  /**
   * The object's DRAWN extents in authoring units, `[x0, y0, x1, y1]`.
   *
   * Declared rather than derived because SVG cannot be measured before it is painted — and it must be
   * the real ink box, not the nominal size: an isometric box `h` tall occupies `h + (w + d)/2` on
   * screen, so a 196-unit fridge draws 287 units tall. The layout scales and centres on THIS box, so a
   * wrong one shows up immediately as an object hanging off the row. Each is verified against a
   * rendered still (`OBJECT_BOXES` check in the WO-19 probe).
   */
  box: [number, number, number, number];
  /** The object's own flat colour, overridable per use. */
  color: string;
  draw: (a: DrawArgs) => React.ReactNode;
};

/** Panel line / seam, drawn ON a face rather than as another box. */
const seam = (d: string, stroke: number) => (
  <path d={d} fill="none" stroke={INK} strokeWidth={stroke * 0.6} strokeLinecap="round" />
);

/**
 * A rectangle lying ON the right-hand (+X) face of a box anchored at (ax, ay): `u` runs along that
 * face (the iso axis), `v` runs up it. Doors, drawer fronts, latches and screens are all this shape.
 *
 * Worth a helper because the obvious alternative — an axis-aligned `<rect>` — is WRONG on a sloped
 * face and does not merely look flat: the first build's safe door and house windows hung off the
 * bottom-right of their own boxes, because a rect's bottom edge is horizontal where the face's is not.
 */
const faceRect = (ax: number, ay: number, u: number, v: number, du: number, dv: number): string => {
  const P = (uu: number, vv: number): Pt => [ax + AX * uu, ay - AY * uu - vv];
  return pts([P(u, v), P(u + du, v), P(u + du, v + dv), P(u, v + dv)]);
};

export const OBJECTS: Record<string, ShowcaseObject> = {
  /** The reference's own third object (0:35), at its sampled teal. */
  refrigerator: {
    box: [-93.5, -287, 64.1, 0], color: '#50c0b8',
    draw: ({color, stroke}) => (
      <g>
        <IsoBox x={-26} y={0} w={104} d={78} h={196} color={color} stroke={stroke} />
        {seam(`M -26 -132 L 64 -177`, stroke)}
        {seam(`M 44 -120 L 44 -84`, stroke)}
        {seam(`M 44 -168 L 44 -146`, stroke)}
      </g>
    ),
  },
  /** Three drawers, the paperwork object — records, filings, the archive beat. */
  filingCabinet: {
    box: [-84.6, -273, 59.1, 0], color: '#8d9199',
    draw: ({color, stroke}) => (
      <g>
        <IsoBox x={-24} y={0} w={96} d={70} h={190} color={color} stroke={stroke} />
        {/* TWO seams make THREE drawers over the 190-unit face; a handle sits centred in each */}
        {[63, 126].map((v) => (
          <g key={v}>{seam(`M -24 ${-v} L 59.1 ${-48 - v}`, stroke)}</g>
        ))}
        {[31, 94, 157].map((v) => (
          <polygon key={v} points={faceRect(-24, 0, 34, v, 30, 10)} fill={shade(color, -2)}
            stroke={INK} strokeWidth={stroke * 0.6} strokeLinejoin="round" />
        ))}
      </g>
    ),
  },
  /** A vault box with a dial — deposits, reserves, "where the money sits". */
  safe: {
    box: [-99.3, -266, 67, 0], color: '#4a5a6b',
    draw: ({color, stroke}) => (
      <g>
        <IsoBox x={-30} y={0} w={112} d={80} h={170} color={color} stroke={stroke} />
        {/* door, dial and handle all sit ON the +X face (u along it, v up it) */}
        <polygon points={faceRect(-30, 0, 14, 24, 84, 122)} fill={shade(color, 1)}
          stroke={INK} strokeWidth={stroke * 0.7} strokeLinejoin="round" />
        <circle cx={-30 + AX * 56} cy={-AY * 56 - 85} r={22} fill={shade(color, -2)}
          stroke={INK} strokeWidth={stroke * 0.7} />
        {seam(`M ${-30 + AX * 56} ${-AY * 56 - 107} l 0 44 M ${-30 + AX * 37} ${-AY * 37 - 85} l ${AX * 38} ${-AY * 38}`, stroke)}
        <polygon points={faceRect(-30, 0, 82, 78, 14, 12)} fill={shade(color, -2)}
          stroke={INK} strokeWidth={stroke * 0.6} strokeLinejoin="round" />
      </g>
    ),
  },
  /** The deal object — a case, a client, a meeting. */
  briefcase: {
    box: [-102.8, -214, 73.9, 0], color: '#7a4a2c',
    draw: ({color, stroke}) => (
      <g>
        <IsoBox x={-56} y={0} w={150} d={54} h={112} color={color} stroke={stroke} />
        {/* the clamshell seam, parallel to the top face's front edge */}
        {seam(`M -56 -58 L 74 -133`, stroke)}
        {/* handle: an arc standing ON the top face, spanning half its front-edge direction about the
            face centre (-4.5, -163) — its first placement started at y=-128, which is on the FRONT
            face, so it read as a squiggle drawn on the side of the case */}
        <path d={`M -37 -144 Q -4 -212 28 -182`} fill="none" stroke={INK}
          strokeWidth={stroke * 1.2} strokeLinecap="round" />
        <polygon points={faceRect(-56, 0, 88, 44, 26, 12)} fill={shade(color, -2)}
          stroke={INK} strokeWidth={stroke * 0.6} strokeLinejoin="round" />
      </g>
    ),
  },
  /** An open laptop — the modern trading / filing / "everyone is online now" object. */
  laptop: {
    box: [-161.6, -259, 69.9, 0], color: '#9aa2ab',
    draw: ({color, stroke}) => (
      <g>
        {/* base: w150 d100 h14, so its top face is A(-60,-14) B(69.9,-89) C(-16.7,-139) D(-146.6,-64) */}
        <IsoBox x={-60} y={0} w={150} d={100} h={14} color={color} stroke={stroke} />
        {/* keyboard patch, inset INSIDE that top face rather than drawn as a free parallelogram —
            the first build put it half off the base and it read as a loose flap */}
        <polygon points={pts([[-57.4, -27.5], [40, -83.7], [1, -106.2], [-96.4, -50]])}
          fill={shade(color, -2)} stroke={INK} strokeWidth={stroke * 0.6} strokeLinejoin="round" />
        {/* screen: stands on the base's BACK edge D→C and leans 15 units further back */}
        <polygon points={pts([[-146.6, -64], [-16.7, -139], [-31.7, -259], [-161.6, -184]])}
          fill={shade(color, -1)} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
        <polygon points={pts([[-137, -74], [-30, -136], [-42, -235], [-149, -173]])}
          fill={PAPER_WHITE} stroke={INK} strokeWidth={stroke * 0.6} strokeLinejoin="round" />
      </g>
    ),
  },
  /** A phone standing on end — the app, the alert, the retail investor. */
  phone: {
    box: [-36.5, -234, 39.7, 0], color: '#2f3742',
    draw: ({color, stroke}) => (
      <g>
        <IsoBox x={-14} y={0} w={62} d={26} h={190} color={color} stroke={stroke} />
        <polygon points={pts([[-8, -22], [-8, -178], [37, -204], [37, -48]])}
          fill={PAPER_WHITE} stroke={INK} strokeWidth={stroke * 0.6} strokeLinejoin="round" />
        {[0, 1, 2].map((i) => (
          <polygon key={i} points={pts([[0, -60 - i * 40], [0, -80 - i * 40], [30, -97 - i * 40], [30, -77 - i * 40]])}
            fill={shade(color, 2)} />
        ))}
      </g>
    ),
  },
  /** Banded notes — the cash beat. */
  cashStack: {
    box: [-155.1, -255, 57.9, 0], color: '#5f9e6b',
    draw: ({color, stroke}) => (
      // bundles stacked at exactly their own height (44), so they touch: at the first spacing (56)
      // they floated apart with white showing between them
      <g>
        {[0, 1, 2].map((i) => (
          <g key={i}>
            <IsoBox x={-72} y={-i * 44} w={150} d={96} h={44} color={color} stroke={stroke} />
            {/* two paper bands across the front face */}
            {seam(`M ${-72 + AX * 46} ${-i * 44 - AY * 46} l 0 -44`, stroke)}
            {seam(`M ${-72 + AX * 100} ${-i * 44 - AY * 100} l 0 -44`, stroke)}
          </g>
        ))}
      </g>
    ),
  },
  /** Stacked coins — reserves, savings, the small pile that is supposed to grow. */
  coinStack: {
    // the bottom coin's front arc dips ry (=39) BELOW the baseline, hence y1 = 39 rather than 0
    box: [-78, -219, 78, 39], color: '#d0a63c',
    draw: ({color, stroke}) => (
      <g>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <IsoCylinder key={i} x={0} y={-i * 30} r={78} h={30} color={color} stroke={stroke} />
        ))}
      </g>
    ),
  },
  /** A house — the mortgage, the collateral, the thing that was supposed to only go up. */
  houseModel: {
    box: [-124.9, -248, 60.5, 0], color: '#c8663f',
    draw: ({color, stroke}) => (
      // walls w116 d98 h106: top face A(-40,-106) B(60.5,-164) C(-24.4,-213) D(-124.9,-155).
      // The ridge runs along the depth axis, over the midpoints of AB and DC, raised 64:
      // R1(10.2,-199) R2(-74.6,-248). Visible from this corner: the AB gable and the AD slope.
      <g>
        <IsoBox x={-40} y={0} w={116} d={98} h={106} color={'#e2ded3'} stroke={stroke} />
        <polygon points={pts([[-40, -106], [60.5, -164], [10.2, -199]])}
          fill={shade(color, -1)} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
        <polygon points={pts([[-40, -106], [-124.9, -155], [-74.6, -248], [10.2, -199]])}
          fill={color} stroke={INK} strokeWidth={stroke} strokeLinejoin="round" />
        {/* door on the right-hand wall face, window beside it */}
        <polygon points={faceRect(-40, 0, 26, 0, 30, 56)} fill={shade('#e2ded3', -2)}
          stroke={INK} strokeWidth={stroke * 0.7} strokeLinejoin="round" />
        <polygon points={faceRect(-40, 0, 76, 30, 26, 26)} fill={PAPER_WHITE}
          stroke={INK} strokeWidth={stroke * 0.7} strokeLinejoin="round" />
      </g>
    ),
  },
};

export type ObjectKind = keyof typeof OBJECTS;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

/** Every object is set to this fraction of frame height (reference: 0.602–0.645, i.e. one size). */
const OBJECT_H_FRAC = 0.62;
/** Where the row STANDS, as a fraction of frame height (reference bases: 0.789–0.837). */
const BASE_Y_FRAC = 0.81;
/** The row never spreads wider than this (reference row spans 0.83 of the frame). */
const ROW_W_FRAC = 0.86;
/** Gap between two objects, as a fraction of frame width (reference gaps 0.010 and 0.067). */
const GAP_FRAC = 0.035;
/** More than this and the objects are too small to read as products rather than icons. */
const MAX_OBJECTS = 5;

const VB_W = 1920;
const VB_H = 1080;

export type ShowcaseItem = {kind: string; color?: string; scale?: number};

export type ObjectCardProps = {
  items: ShowcaseItem[];
  /** Pure white is the device (bible §6.6); 'black' exists only for symmetry with the text cards. */
  ground?: 'white' | 'black';
  /** Play the entrance from the current Sequence's frame 0. Off = render settled (stills, thumbs). */
  animate?: boolean;
};

export const ObjectCard: React.FC<ObjectCardProps> = ({items, ground = 'white', animate = true}) => {
  const frame = useCurrentFrame();

  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('objectcard: an object showcase card needs at least one object');
  }
  if (items.length > MAX_OBJECTS) {
    throw new Error(
      `objectcard: ${items.length} objects on one card — the reference shows 3 and the layout holds at ` +
        `most ${MAX_OBJECTS}; split the beat across two cards`
    );
  }

  // resolve + scale. Every object is drawn at ONE target height (the measured reference behaviour),
  // times its own optional `scale` for the rare case where a beat wants a deliberately small thing
  // next to a big one.
  const placed = items.map((it) => {
    const def = OBJECTS[it.kind];
    if (!def) {
      throw new Error(
        `objectcard: unknown object ${JSON.stringify(it.kind)} — the library is ` +
          `${Object.keys(OBJECTS).sort().join(', ')}`
      );
    }
    if (it.scale !== undefined && !(it.scale > 0)) {
      throw new Error(`objectcard: ${it.kind}.scale must be a positive number, got ${it.scale}`);
    }
    const [x0, y0, x1, y1] = def.box;
    const s = ((VB_H * OBJECT_H_FRAC) / (y1 - y0)) * (it.scale ?? 1);
    return {def, color: it.color ?? def.color, s, w: (x1 - x0) * s, midX: (x0 + x1) / 2, footY: y1};
  });

  // one uniform shrink if the row is wider than the measure — relative sizes are preserved, because
  // scaling the objects individually to fit would throw away the "all one height" reading above
  const gap = VB_W * GAP_FRAC;
  const rowW = placed.reduce((a, p) => a + p.w, 0) + gap * (placed.length - 1);
  const fit = Math.min(1, (VB_W * ROW_W_FRAC) / rowW);
  const baseY = VB_H * BASE_Y_FRAC;

  let x = (VB_W - rowW * fit) / 2;
  const drawn = placed.map((p, i) => {
    const w = p.w * fit;
    const cx = x + w / 2;
    x += w + gap * fit;
    const s = p.s * fit;
    // translate so the object's own box centre lands on cx and its FOOT lands on baseY — objects do
    // not share an origin (a coin stack's front arc dips below its baseline, a laptop is drawn around
    // its base), so the box is what aligns them, not the drawing origin
    const tx = cx - p.midX * s;
    const ty = baseY - p.footY * s;
    return (
      <g key={i} transform={`translate(${tx.toFixed(2)} ${ty.toFixed(2)}) scale(${s.toFixed(4)})`}>
        {/* stroke divided by the object's own scale so every outline lands at STROKE in frame units,
            whatever size the object was drawn at (bible §5: uniform 6–10px outline at 1920) */}
        {p.def.draw({color: p.color, stroke: STROKE / s})}
      </g>
    );
  });

  const op = animate
    ? interpolate(frame, [0, TEXTCARD_ENTRANCE_FRAMES], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;

  return (
    <AbsoluteFill style={{backgroundColor: ground === 'white' ? PAPER_WHITE : INK}}>
      <svg viewBox={`0 0 ${VB_W} ${VB_H}`} width="100%" height="100%" style={{opacity: op}}>
        {drawn}
      </svg>
    </AbsoluteFill>
  );
};
