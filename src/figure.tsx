import React from 'react';
import meta from './episode_meta.json';
import {blink as idleBlink, gaze as idleGaze} from './anim';
import {INK, PAPER_WHITE, STROKE, STROKE_THIN} from './crayonStyle';

// CRAYON character (bible §5 "Character construction"): large rounded head, plain black dot eyes,
// NO nose, a small mouth line, hair as one solid shape, a filled torso with collar/tie, short simple
// stick limbs. Uniform-weight pure-black outline, flat fills, zero gradients.
//
// This deliberately replaced the whiteboard-doodle figure. Two things were removed outright:
//   - the `rough` feTurbulence/feDisplacementMap filter, and
//   - the whole-figure `boil()` wobble
// Both existed to fake a hand-drawn look. The reference art is clean flat vector — measured at
// 74–92% flat fill with zero texture (docs/research/crayon/MEASUREMENTS.md). That channel's
// hand-drawn quality lives entirely in its typography, which crayonFont/crayonStyle own.
// The `rough` prop survives as an accepted no-op so the ~28 existing call sites keep compiling.

export type Pose = {
  spineLean: number; headTilt: number;
  armNearShoulder: number; armNearElbow: number;
  armFarShoulder: number; armFarElbow: number;
  legNearHip: number; legNearKnee: number;
  legFarHip: number; legFarKnee: number;
  bob: number;
};
export type Expr = {brow: number; browRaise: number; lid: number; mouth: 'neutral' | 'flat' | 'frown' | 'open' | 'smirk' | 'tight'; look: number};
export type Palette = {limb: string};

export const PAPER = '#f6f2e9';
export const INKPAL: Palette = {limb: INK};
export const LIGHT: Palette = INKPAL;
export const DARK: Palette = INKPAL;
export const DIM: Palette = {limb: '#9a948a'};
export const SIL: Palette = INKPAL;

// Flat character fills, sampled off the reference thumbnail (docs/research/crayon/HawmGu7oNrc/thumb.png):
// skin rgb(239,208,171), shirt rgb(251,251,251), suit rgb(32,35,55).
const SKIN = '#efd0ab';
// Background people are featureless grey, never coloured — the "grey crowd + colour hero" focal
// device (bible §6.5). Callers opt in by passing pal={DIM}, and the costume is desaturated to these
// greys rather than skipped, so a crowd figure still has a torso silhouette.
const CROWD_FILL = '#c9c4bb';
const CROWD_SKIN: CostumeSkin = {body: '#a8a49c', accent: '#8e8a82', collar: '#c9c4bb', hair: '#8e8a82', hairStyle: 'crop'};

const D = Math.PI / 180;

// ---------------------------------------------------------------------------
// PROPORTIONS (WO-2b). WO-2 fixed how the character is DRAWN; these numbers fix how it is BUILT.
// The old rig (spine 94, head 36, upperArm 50, foreArm 46, thigh 56, shin 54) put 110 units of leg
// against a 94-unit torso, so the figure read as spindly: legs longer than the whole torso, a small
// head, and a body that occupied ~6% of frame width against the reference's ~14%.
//
// Measured off the reference (docs/research/crayon/frames/*, docs/research/crayon/HawmGu7oNrc/thumb.png).
// The montage cells are 308×173 px each and each cell is one whole 16:9 frame, so 1 cell px = 6.234 px
// at 1920; wolf_t0003.png is a native 1280×720 frame, so 1 px = 1.5 px at 1920.
//
//   ratio                      | 4:56 stairs | 2:08 boxes | t0003 | 10:10 couple | used here
//   head height / figure height|    0.33     |    0.34    |   —   |      —       |   0.35
//   head width / head height   |    0.93     |    0.85    | 1.04  |     0.88     |   0.92
//   torso width / head width   |    1.00     |    0.85    | 0.95  |     1.28     |   1.03
//   torso height / head height |    1.10     |    1.00    | 1.06  |     1.41     |   1.13
//   leg length / torso height  |    0.73     |    0.75    |   —   |      —       |   0.69
//   limb stroke / head width   |    0.054    |     —      | 0.040 |     0.058    |   0.075 (see below)
//   figure width / frame width |    0.140    |    0.140   |   —   |      —       |  ~0.10 (see below)
//
// Three things are deliberately LEFT ALONE so the ~358 stage templates keep composing:
//   - thigh + shin: unchanged, so a figure's feet land on exactly the pixel they landed on before.
//     Call sites pass `y` as the HIP, so any change here would lift every figure off its ground.
//   - the arm chain grows by the SAME factor as the spine (×1.40). The shoulder rises with a longer
//     spine, which drags every hand with it; growing the arms in step puts the typing/signing hand
//     back within ~15 units of where it was instead of ~40 above the prop it is meant to touch.
//   - `scale`: the growth is baked into the segment lengths, so the ~28 call sites and the ~358
//     template `fig={{scale: …}}` specs are untouched.
export const SEG = {spine: 132, neck: 12, head: 52, upperArm: 70, foreArm: 64, thigh: 56, shin: 54};

// The DRAWN head is larger than SEG.head so the chin sits on the shoulders (the reference's
// no-visible-neck silhouette). The reference head is close to round — measured w/h 0.85–1.04, mean
// 0.92 — where the old 1.02/1.26 pair drew it at 0.81, i.e. visibly egg-shaped and too narrow for
// its height. 1.13/1.23 lands at 0.92.
const HEAD_HW = 1.13;   // half-width  as a multiple of SEG.head
const HEAD_HH = 1.23;   // half-height as a multiple of SEG.head
/** Drawn head width in figure units — the yardstick every other proportion below is quoted against. */
const HEAD_W = 2 * HEAD_HW * SEG.head;

/**
 * Limb stroke as a fraction of head width.
 *
 * MEASURED on the reference: 0.040 (t0003, a 7px arm against a 174px head at 1280) to 0.058
 * (10:10, 2.5 cell px against a 43 cell px head). This is a DELIBERATE OVERSHOOT of that band.
 * The reference's figures fill ~14% of frame width; ours fill ~10% even after this work order, so a
 * strictly-scaled limb would render at 6–7 units — which at our in-frame size is the wire the owner
 * review is complaining about. 0.075 keeps the limb marginally heavier than the silhouette outline
 * (STROKE 8 vs 8.8) and reads stocky at the size we actually render at.
 */
const LIMB_W_RATIO = 0.075;

/** How far below the hip the garment hem falls, as a multiple of SEG.head. The reference's jacket
 *  hem covers the hip joint and the top of the thigh, which is most of what shortens the leg read. */
const HEM_DROP = 0.22;

type P = {x: number; y: number};
const down = (p: P, deg: number, len: number, facing: number): P => ({x: p.x + Math.sin(deg * D) * len * facing, y: p.y + Math.cos(deg * D) * len});

// Interior detail (collar, tie, fringe) is drawn thinner than the silhouette outline, the same
// ratio the measured stroke band carries (bible §5: outline ≈6–10px at 1920).
const detailRatio = STROKE_THIN / STROKE;

const Face: React.FC<{cx: number; cy: number; hw: number; hh: number; expr: Expr; lid: number; lookY: number; ink: string}> =
({cx, cy, hw, hh, expr, lid, lookY, ink}) => {
  const eyeDX = hw * 0.30;
  const eyeY = cy + hh * 0.06;
  // Plain filled circles. The reference has NO catchlight and no lash — a dot is the whole eye.
  const eyeR = hw * 0.115;
  const browY = eyeY - hh * 0.24 - expr.browRaise * hh * 0.10;
  const bw = hw * 0.28;
  const my = cy + hh * 0.40, mw = hw * 0.62, ms = hw * 0.10;
  const px = expr.look * hw * 0.07, py = lookY * hh * 0.05;

  const eye = (sx: number, key: string) => {
    const ex = cx + sx;
    if (lid > 0.9) return <line key={key} x1={ex - eyeR * 1.3} y1={eyeY} x2={ex + eyeR * 1.3} y2={eyeY} stroke={ink} strokeWidth={eyeR * 1.1} strokeLinecap="round" />;
    return <circle key={key} cx={ex + px} cy={eyeY + py} r={eyeR * (1 - 0.55 * lid)} fill={ink} />;
  };
  // Brows are EXPRESSION, not anatomy: the reference's resting face is dots + mouth and nothing else,
  // and brows appear only when the character is pushing an emotion. Drawing them always put a
  // permanent scowl on every neutral figure.
  const showBrow = Math.abs(expr.brow) > 0.15 || Math.abs(expr.browRaise) > 0.15;
  const brow = (sx: number, dir: number, key: string) => {
    const ix = cx + sx - dir * bw, iy = browY - expr.brow * hh * 0.12;
    const ox = cx + sx + dir * bw, oy = browY + Math.abs(expr.brow) * hh * 0.02;
    return <line key={key} x1={ix} y1={iy} x2={ox} y2={oy} stroke={ink} strokeWidth={ms * 0.9} strokeLinecap="round" />;
  };

  let mouth: React.ReactNode;
  if (expr.mouth === 'open') mouth = <ellipse cx={cx} cy={my} rx={mw * 0.28} ry={hh * 0.13} fill="#7a3b3b" stroke={ink} strokeWidth={ms * 0.8} />;
  else if (expr.mouth === 'frown') mouth = <path d={`M ${cx - mw / 2} ${my + hh * 0.05} Q ${cx} ${my - hh * 0.09} ${cx + mw / 2} ${my + hh * 0.05}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else if (expr.mouth === 'smirk') mouth = <path d={`M ${cx - mw / 2} ${my + hh * 0.04} Q ${cx + mw * 0.1} ${my + hh * 0.03} ${cx + mw / 2} ${my - hh * 0.06}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else if (expr.mouth === 'tight') mouth = <line x1={cx - mw * 0.34} y1={my} x2={cx + mw * 0.34} y2={my} stroke={ink} strokeWidth={ms * 1.3} strokeLinecap="round" />;
  // 'flat' MUST be a dead-straight line (hardened/hollow/cold). Before this branch it fell
  // through to the smiling default, which put a faint pleasant smile on every late-arc face.
  else if (expr.mouth === 'flat') mouth = <line x1={cx - mw * 0.4} y1={my} x2={cx + mw * 0.4} y2={my} stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else mouth = <path d={`M ${cx - mw * 0.4} ${my} Q ${cx} ${my + hh * 0.06} ${cx + mw * 0.4} ${my}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;

  return (<g>
    {eye(-eyeDX, 'el')}{eye(eyeDX, 'er')}
    {showBrow && (<>{brow(-eyeDX, -1, 'bl')}{brow(eyeDX, 1, 'br')}</>)}
    {mouth}
  </g>);
};

// ---------------------------------------------------------------------------
// COSTUMES (2026-07-19). The bare stick figure reads as "generic doodle"; a filled
// torso + hair is what makes a character look like SOMEBODY at thumbnail size. Limbs stay
// thin sticks — the silhouette is unchanged, so every existing pose still works.
// `none` is the default, so nothing renders differently unless a caller opts in.
export type Costume = 'none' | 'suit' | 'uniform' | 'scrubs' | 'royal' | 'street' | 'field';
// The VIDEO has ~28 StickFigure call sites and no central wrapper, so the episode's costume is
// resolved HERE and used as the default. One topic -> one wardrobe, thumbnail and video alike.
// A call site can still override per-figure (crowds/silhouettes) by passing `costume` explicitly.
const COSTUME_HINTS: Array<[RegExp, Costume]> = [
  [/surgeon|doctor|medic|hospital|nurse|\bmd\b/i, 'scrubs'],
  [/king|emperor|empire|royal|dynasty|throne|monarch|pharaoh|sultan|ottoman|\brome\b|roman/i, 'royal'],
  [/special.?forces|soldier|military|\bwar\b|sniper|marine|commando|\barmy|\bnavy|spec.?ops|regime|dictator|north.?korea|guard/i, 'uniform'],
  [/cartel|mafia|\bmob\b|mobster|hitman|assassin|kingpin|bratva|yakuza|gang|narco|smuggl|prison|inmate|convict|street/i, 'street'],
  [/survive|stranded|castaway|shipwreck|jungle|desert|wilderness|arctic|mountain|pirate|explorer|miner|farm/i, 'field'],
  [/startup|founder|unicorn|venture|entrepreneur|\bipo\b|\bceo\b|banker|lawyer|trader|hedge|billion|trillion|mogul|heir|executive|corporate|spy|agent/i, 'suit'],
];
export function episodeCostume(): Costume {
  const m = meta as any;
  if (m?.thumb?.costume) return m.thumb.costume as Costume;
  const topic = (m?.topic || '') + ' ' + (m?.title || '');
  for (const [re, name] of COSTUME_HINTS) if (re.test(topic)) return name;
  return 'suit';
}
type CostumeSkin = {body: string; accent: string; collar: string; hair: string; hairStyle: 'crop' | 'mop' | 'tuft'};
export const COSTUMES: Record<Exclude<Costume, 'none'>, CostumeSkin> = {
  suit:    {body: '#202337', accent: '#c9243f', collar: '#ffffff', hair: '#111111', hairStyle: 'mop'},   // founder/finance/mob
  uniform: {body: '#3c4a33', accent: '#d4af37', collar: '#cdd3bd', hair: '#171717', hairStyle: 'crop'},  // military/regime
  scrubs:  {body: '#1f7a86', accent: '#ffffff', collar: '#d8f0f3', hair: '#241a12', hairStyle: 'crop'},  // medical
  royal:   {body: '#5a2a9e', accent: '#f2c230', collar: '#f6e7bd', hair: '#1d1208', hairStyle: 'mop'},   // empire/monarch
  street:  {body: '#33383f', accent: '#b8342b', collar: '#9aa0a8', hair: '#15100c', hairStyle: 'mop'},   // cartel/survival
  field:   {body: '#6b5433', accent: '#2f4a2a', collar: '#cbbb95', hair: '#2a1c10', hairStyle: 'tuft'},  // explorer/worker
};

export const StickFigure: React.FC<{
  pose: Pose; x: number; y: number; scale?: number; facing?: number;
  pal?: Palette; view?: 'front' | 'profile' | 'back'; expr?: Expr; frame?: number;
  showFace?: boolean; briefcase?: boolean; lineW?: number; costume?: Costume;
  /** Accepted and ignored — the sketch filter is gone (see the header note). Kept so call sites compile. */
  rough?: boolean;
}> = ({
  pose, x, y, scale = 1, facing = 1, pal = INKPAL, view = 'profile',
  expr = {brow: 0, browRaise: 0, lid: 0, mouth: 'neutral', look: 0}, frame = 0,
  showFace = true, briefcase = false, lineW = STROKE, costume = episodeCostume(),
}) => {
  const front = view === 'front';
  const ink = pal.limb;
  const hip: P = {x: 0, y: -pose.bob};
  const shoulder: P = {x: hip.x + Math.sin(pose.spineLean * D) * SEG.spine * facing, y: hip.y - Math.cos(pose.spineLean * D) * SEG.spine};
  const headA = pose.spineLean + pose.headTilt;
  const headC: P = {x: shoulder.x + Math.sin(headA * D) * (SEG.neck + SEG.head) * facing, y: shoulder.y - Math.cos(headA * D) * (SEG.neck + SEG.head)};

  const ffar = front ? -facing : facing;
  const elbowN = down(shoulder, pose.armNearShoulder, SEG.upperArm, facing);
  const handN = down(elbowN, pose.armNearShoulder + pose.armNearElbow, SEG.foreArm, facing);
  const elbowF = down(shoulder, pose.armFarShoulder, SEG.upperArm, ffar);
  const handF = down(elbowF, pose.armFarShoulder + pose.armFarElbow, SEG.foreArm, ffar);
  // hips sit a little apart (real stance width) instead of one point — otherwise a near/far leg
  // pair with matching hip+knee angles (the common standing pose, seen in profile) draws as one
  // exact overlapping line instead of two legs. Scaled with the head (i.e. with the whole figure),
  // because 11 units of stance under a 121-unit-wide torso reads as one leg again.
  const HIP_W = SEG.head * 0.31;
  const hipN: P = {x: hip.x + HIP_W * facing, y: hip.y};
  const hipF: P = {x: hip.x - HIP_W * facing, y: hip.y};
  const kneeN = down(hipN, pose.legNearHip, SEG.thigh, facing);
  const footN = down(kneeN, pose.legNearHip + pose.legNearKnee, SEG.shin, facing);
  const kneeF = down(hipF, pose.legFarHip, SEG.thigh, ffar);
  const footF = down(kneeF, pose.legFarHip + pose.legFarKnee, SEG.shin, ffar);

  // Background people are flat grey with no costume colour; the hero keeps full colour.
  const crowd = pal === DIM;
  const skinFill = crowd ? CROWD_FILL : SKIN;
  const detailW = lineW * detailRatio;
  // Limbs are stroked at a weight PROPORTIONAL to the figure (LIMB_W_RATIO of head width), not at the
  // flat outline default — the reference scales its limb weight with the character, so a small
  // background walker and a hero must not share one absolute stroke. `lineW` still governs: passing a
  // heavier outline scales the limbs with it.
  const limbW = HEAD_W * LIMB_W_RATIO * (lineW / STROKE);

  const bone = (a: P, b: P, w: number, c: string, key: string) =>
    <path key={key} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />;
  const hand = (p: P, key: string) => <circle key={key} cx={p.x} cy={p.y} r={limbW * 1.0} fill={skinFill} stroke={ink} strokeWidth={detailW} />;
  // Shoes are solid, not outlined-and-hollow: flat fill, no interior line (bible §5 "flat fills").
  const foot = (k: P, f: P, key: string) => {
    const ang = Math.atan2(f.y - k.y, f.x - k.x) * 180 / Math.PI;
    return <ellipse key={key} cx={f.x} cy={f.y} rx={limbW * 2.0} ry={limbW * 1.0} fill={ink} transform={`rotate(${ang + 90} ${f.x} ${f.y})`} />;
  };
  const seed = Math.round(x);
  const lid = Math.min(1, expr.lid + idleBlink(frame, seed));
  const R = SEG.head;
  const HW = R * HEAD_HW, HH = R * HEAD_HH;

  // --- costume geometry: a filled torso wrapped around the EXISTING spine line, so the pose
  //     rig is untouched. Built from the spine vector so it leans/bobs with the body. The shape
  //     is the reference's bell: rounded shoulders, flaring slightly WIDER at the hem. ---
  const dressed = costume !== 'none' ? COSTUMES[costume] : null;
  const skin = dressed && crowd ? {...CROWD_SKIN, hairStyle: dressed.hairStyle} : dressed;
  const bodyFill = skin ? skin.body : (crowd ? CROWD_FILL : PAPER_WHITE);
  const torso = (() => {
    const vx = shoulder.x - hip.x, vy = shoulder.y - hip.y;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len, uy = vy / len;          // along spine, hip -> shoulder
    const px = -uy, py = ux;                     // perpendicular
    // The reference torso is about as wide as the head and flares a little to the hem: measured
    // torso-width / head-width 0.85–1.28 across four frames, mean 1.02. These half-widths put the
    // hem at 1.03 × head width and the shoulder line at 0.90 × head width.
    const sw = R * 1.02, hw = R * 1.16;          // half-widths at shoulder / hem
    // Shoulder line sits slightly above the joint and the hem slightly below the hip, so the head
    // meets the collar and the legs emerge from under the garment.
    const sx = shoulder.x + ux * R * 0.06, sy = shoulder.y + uy * R * 0.06;
    const hx = hip.x - ux * R * HEM_DROP, hy = hip.y - uy * R * HEM_DROP;
    const A = [sx + px * sw, sy + py * sw], B = [hx + px * hw, hy + py * hw];
    const C = [hx - px * hw, hy - py * hw], Dp = [sx - px * sw, sy - py * sw];
    // top: a cubic with both controls pushed straight "up" the spine -> flat top, round corners
    const k = R * 0.28;
    const d = `M ${A[0]} ${A[1]} L ${B[0]} ${B[1]} Q ${hx - ux * R * 0.10} ${hy - uy * R * 0.10} ${C[0]} ${C[1]} L ${Dp[0]} ${Dp[1]} ` +
      `C ${Dp[0] + ux * k} ${Dp[1] + uy * k} ${A[0] + ux * k} ${A[1] + uy * k} ${A[0]} ${A[1]} Z`;

    if (!skin) return <path key="torso" d={d} fill={bodyFill} stroke={ink} strokeWidth={lineW} strokeLinejoin="round" />;

    // Shirt panel + tie down the chest centre, in the same spine frame. The reference shows a
    // narrow white strip between the lapels carrying the tie, not a bare V.
    const nx = sx - ux * R * 0.02, ny = sy - uy * R * 0.02;               // collar notch height
    const shTop = sw * 0.26, shBot = hw * 0.20;                           // shirt half-widths
    const bx = hx + ux * R * 0.06, by = hy + uy * R * 0.06;               // shirt hem
    const shirt = `M ${nx + px * shTop} ${ny + py * shTop} L ${bx + px * shBot} ${by + py * shBot} ` +
      `L ${bx - px * shBot} ${by - py * shBot} L ${nx - px * shTop} ${ny - py * shTop} Z`;
    // lapel V: a SHORT notch from either side of the collar down to the knot — the reference's
    // lapel sits in the top third of the chest, not as a slash across the whole torso.
    const vX = nx - ux * R * 0.34, vY = ny - uy * R * 0.34;
    const lapel = `M ${nx + px * sw * 0.60} ${ny + py * sw * 0.60} L ${vX} ${vY} L ${nx - px * sw * 0.60} ${ny - py * sw * 0.60}`;
    // tie: knot at the notch, blade tapering down the shirt
    const tw = R * 0.15, tipX = vX - ux * R * 0.80, tipY = vY - uy * R * 0.80;
    const tie = `M ${vX + px * tw} ${vY + py * tw} L ${tipX + px * tw * 0.45} ${tipY + py * tw * 0.45} ` +
      `L ${tipX} ${tipY} L ${tipX - px * tw * 0.45} ${tipY - py * tw * 0.45} L ${vX - px * tw} ${vY - py * tw} Z`;
    return (
      <g key="torso">
        <path d={d} fill={skin.body} stroke={ink} strokeWidth={lineW} strokeLinejoin="round" />
        <path d={shirt} fill={skin.collar} stroke={ink} strokeWidth={detailW} strokeLinejoin="round" />
        <path d={lapel} fill="none" stroke={ink} strokeWidth={detailW} strokeLinejoin="round" />
        <path d={tie} fill={skin.accent} stroke={ink} strokeWidth={detailW} strokeLinejoin="round" />
      </g>
    );
  })();

  // Hair as ONE solid shape (bible §5), sized to the drawn head box and sitting slightly proud of
  // the skull the way the reference's does. Each style differs only in its bottom (fringe) edge.
  const hair = (() => {
    if (!skin || view === 'back') return null;
    const hx = headC.x, hy = headC.y;
    // Measured on the reference thumbnail: hair occupies the top ~22% of the head box and sits a
    // few px proud of the skull. Anything lower reads as a helmet rather than hair.
    const HWh = HW * 1.04, top = hy - HH * 1.05, rc = HWh * 0.62;
    const cap = (byL: number, byR: number, bottom: string) =>
      `M ${hx + HWh} ${byR} L ${hx + HWh} ${top + rc} Q ${hx + HWh} ${top} ${hx + HWh - rc} ${top} ` +
      `L ${hx - HWh + rc} ${top} Q ${hx - HWh} ${top} ${hx - HWh} ${top + rc} L ${hx - HWh} ${byL} ${bottom} Z`;
    let d: string;
    if (skin.hairStyle === 'crop') {
      // flat, even fringe — military / clinical
      const b = hy - HH * 0.55;
      d = cap(b, b, `L ${hx + HWh} ${b}`);
    } else if (skin.hairStyle === 'mop') {
      // side part: dips low over the left brow, swept up and back on the right
      const bl = hy - HH * 0.36, br = hy - HH * 0.64;
      d = cap(bl, br, `Q ${hx - HWh * 0.28} ${hy - HH * 0.26} ${hx + HWh} ${br}`);
    } else {
      // 'tuft' — the same solid cap with a shaggier, uneven fringe
      const bl = hy - HH * 0.46, br = hy - HH * 0.42;
      d = cap(bl, br, `Q ${hx - HWh * 0.45} ${hy - HH * 0.66} ${hx} ${hy - HH * 0.48} Q ${hx + HWh * 0.5} ${hy - HH * 0.28} ${hx + HWh} ${br}`);
    }
    return <path d={d} fill={skin.hair} stroke={ink} strokeWidth={lineW} strokeLinejoin="round" />;
  })();

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {/* contact shadow: a flat fill, not a sketched outline */}
      <ellipse cx={(footN.x + footF.x) / 2} cy={Math.max(footN.y, footF.y) + limbW * 1.2} rx={limbW * 4.5} ry={limbW * 1.1} fill={INK} opacity={0.10} />
      {/* far limbs */}
      {bone(hipF, kneeF, limbW, ink, 'fl1')}{bone(kneeF, footF, limbW, ink, 'fl2')}{foot(kneeF, footF, 'ff')}
      {bone(shoulder, elbowF, limbW, ink, 'fa1')}{bone(elbowF, handF, limbW, ink, 'fa2')}{hand(handF, 'fh')}
      {/* spine + neck — the torso is painted OVER the spine so the body reads as one solid mass */}
      {bone(hip, shoulder, limbW, ink, 'sp')}{bone(shoulder, headC, limbW, ink, 'nk')}
      {torso}
      {/* head: a large rounded rect (not an ellipse) in flat skin, then the solid hair shape */}
      <rect x={headC.x - HW} y={headC.y - HH} width={HW * 2} height={HH * 2} rx={HW * 0.62} ry={HW * 0.62}
        fill={view === 'back' && skin ? skin.hair : skinFill} stroke={ink} strokeWidth={lineW} />
      {hair}
      {showFace && view !== 'back' && <Face cx={headC.x} cy={headC.y} hw={HW} hh={HH} lid={lid} ink={ink}
        lookY={idleGaze(frame, seed + 5) * 0.3 + pose.headTilt * 0.02}
        expr={{...expr, look: expr.look + idleGaze(frame, seed) * 0.6}} />}
      {/* near limbs */}
      {bone(hipN, kneeN, limbW, ink, 'nl1')}{bone(kneeN, footN, limbW, ink, 'nl2')}{foot(kneeN, footN, 'nf')}
      {bone(shoulder, elbowN, limbW, ink, 'na1')}{bone(elbowN, handN, limbW, ink, 'na2')}{hand(handN, 'nh')}
      {briefcase && <rect x={handN.x - 26} y={handN.y + 4} width={52} height={38} rx={3} fill={skin ? skin.body : PAPER_WHITE} stroke={ink} strokeWidth={lineW} />}
    </g>
  );
};
