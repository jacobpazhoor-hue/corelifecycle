import React from 'react';

// Hand-drawn DOODLE / whiteboard stick figure: black ink on light paper, expressive face,
// little hands + feet, hair tuft, ground shadow, and a subtle "rough" (sketched) filter.

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
const INK = '#2a2620';
export const INKPAL: Palette = {limb: INK};
export const LIGHT: Palette = INKPAL;
export const DARK: Palette = INKPAL;
export const DIM: Palette = {limb: '#9a948a'};
export const SIL: Palette = INKPAL;

const D = Math.PI / 180;
export const SEG = {spine: 94, neck: 12, head: 36, upperArm: 50, foreArm: 46, thigh: 56, shin: 54};

type P = {x: number; y: number};
const down = (p: P, deg: number, len: number, facing: number): P => ({x: p.x + Math.sin(deg * D) * len * facing, y: p.y + Math.cos(deg * D) * len});
const blinkAt = (frame: number, seed = 0) => {const bc = (frame + seed) % 132; return bc < 7 ? Math.sin((bc / 7) * Math.PI) : 0;};

const Face: React.FC<{cx: number; cy: number; R: number; expr: Expr; lid: number; profile: boolean; facing: number; lookY: number; ink: string}> =
({cx, cy, R, expr, lid, profile, facing, lookY, ink}) => {
  const eyeDX = profile ? R * 0.3 * facing : R * 0.34;
  const eyeY = cy - R * 0.02;
  const ew = R * 0.15, eh = R * 0.21 * (1 - 0.8 * lid);
  const browY = cy - R * 0.34 - expr.browRaise * R * 0.2;
  const bw = R * 0.3;
  const my = cy + R * 0.46, mw = R * 0.42, ms = R * 0.06;
  const px = expr.look * R * 0.06, py = lookY * R * 0.05;

  const eye = (sx: number, key: string) => {
    const ex = cx + sx;
    if (lid > 0.9) return <line key={key} x1={ex - ew} y1={eyeY} x2={ex + ew} y2={eyeY} stroke={ink} strokeWidth={R * 0.07} strokeLinecap="round" />;
    return (
      <g key={key}>
        <ellipse cx={ex + px} cy={eyeY + py} rx={ew} ry={Math.max(1, eh)} fill={ink} />
        <circle cx={ex + px - ew * 0.3} cy={eyeY + py - eh * 0.4} r={R * 0.035} fill="#fff" />
      </g>
    );
  };
  const brow = (sx: number, dir: number, key: string) => {
    const ix = cx + sx - dir * bw * 0.5, iy = browY - expr.brow * R * 0.18;
    const ox = cx + sx + dir * bw * 0.5, oy = browY + Math.abs(expr.brow) * R * 0.03;
    return <path key={key} d={`M ${ix} ${iy} Q ${cx + sx} ${Math.min(iy, oy) - R * 0.05} ${ox} ${oy}`} fill="none" stroke={ink} strokeWidth={R * 0.075} strokeLinecap="round" />;
  };

  let mouth: React.ReactNode;
  if (expr.mouth === 'open') mouth = <ellipse cx={cx} cy={my} rx={mw * 0.26} ry={R * 0.14} fill="#fff" stroke={ink} strokeWidth={ms} />;
  else if (expr.mouth === 'frown') mouth = <path d={`M ${cx - mw / 2} ${my + R * 0.05} Q ${cx} ${my - R * 0.1} ${cx + mw / 2} ${my + R * 0.05}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else if (expr.mouth === 'smirk') mouth = <path d={`M ${cx - mw / 2} ${my + R * 0.05} Q ${cx + mw * 0.1} ${my + R * 0.04} ${cx + mw / 2} ${my - R * 0.07}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else if (expr.mouth === 'tight') mouth = <line x1={cx - mw * 0.34} y1={my} x2={cx + mw * 0.34} y2={my} stroke={ink} strokeWidth={ms * 1.3} strokeLinecap="round" />;
  // 'flat' MUST be a dead-straight line (hardened/hollow/cold). Before this branch it fell
  // through to the smiling default, which put a faint pleasant smile on every late-arc face.
  else if (expr.mouth === 'flat') mouth = <line x1={cx - mw * 0.4} y1={my} x2={cx + mw * 0.4} y2={my} stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else mouth = <path d={`M ${cx - mw * 0.4} ${my} Q ${cx} ${my + R * 0.06} ${cx + mw * 0.4} ${my}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;

  return (<g>
    {profile ? eye(eyeDX, 'e') : (<>{eye(-eyeDX, 'el')}{eye(eyeDX, 'er')}</>)}
    {profile ? brow(eyeDX, facing, 'b') : (<>{brow(-eyeDX, -1, 'bl')}{brow(eyeDX, 1, 'br')}</>)}
    {mouth}
  </g>);
};

export const StickFigure: React.FC<{
  pose: Pose; x: number; y: number; scale?: number; facing?: number;
  pal?: Palette; view?: 'front' | 'profile' | 'back'; expr?: Expr; frame?: number;
  showFace?: boolean; briefcase?: boolean; lineW?: number; rough?: boolean;
}> = ({
  pose, x, y, scale = 1, facing = 1, pal = INKPAL, view = 'profile',
  expr = {brow: 0, browRaise: 0, lid: 0, mouth: 'neutral', look: 0}, frame = 0,
  showFace = true, briefcase = false, lineW = 8, rough = true,
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
  const kneeN = down(hip, pose.legNearHip, SEG.thigh, facing);
  const footN = down(kneeN, pose.legNearHip + pose.legNearKnee, SEG.shin, facing);
  const kneeF = down(hip, pose.legFarHip, SEG.thigh, ffar);
  const footF = down(kneeF, pose.legFarHip + pose.legFarKnee, SEG.shin, ffar);

  const bone = (a: P, b: P, w: number, c: string, key: string) =>
    <path key={key} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />;
  const hand = (p: P, key: string) => <circle key={key} cx={p.x} cy={p.y} r={lineW * 1.0} fill={PAPER} stroke={ink} strokeWidth={lineW * 0.7} />;
  const foot = (k: P, f: P, key: string) => {
    const ang = Math.atan2(f.y - k.y, f.x - k.x) * 180 / Math.PI;
    return <ellipse key={key} cx={f.x} cy={f.y} rx={lineW * 2.0} ry={lineW * 1.0} fill={PAPER} stroke={ink} strokeWidth={lineW * 0.7} transform={`rotate(${ang + 90} ${f.x} ${f.y})`} />;
  };
  const lid = Math.min(1, expr.lid + blinkAt(frame, Math.round(x)));
  const R = SEG.head;
  const rid = 'rgh' + Math.round(x) + '_' + Math.round(scale * 100);
  const far = pal === DIM ? ink : ink;

  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      {rough && (<defs><filter id={rid} x="-15%" y="-15%" width="130%" height="130%">
        <feTurbulence type="fractalNoise" baseFrequency="0.02" numOctaves="2" seed="7" result="n" />
        <feDisplacementMap in="SourceGraphic" in2="n" scale="3.2" />
      </filter></defs>)}
      <g filter={rough ? `url(#${rid})` : undefined}>
        {/* ground shadow */}
        <ellipse cx={(footN.x + footF.x) / 2} cy={Math.max(footN.y, footF.y) + lineW * 1.4} rx={lineW * 4.5} ry={lineW * 1.1} fill="none" stroke="#cfc7b8" strokeWidth={lineW * 0.5} opacity={0.8} />
        {/* far limbs */}
        {bone(hip, kneeF, lineW, far, 'fl1')}{bone(kneeF, footF, lineW, far, 'fl2')}{foot(kneeF, footF, 'ff')}
        {bone(shoulder, elbowF, lineW * 0.95, far, 'fa1')}{bone(elbowF, handF, lineW * 0.95, far, 'fa2')}{hand(handF, 'fh')}
        {/* spine + neck */}
        {bone(hip, shoulder, lineW, ink, 'sp')}{bone(shoulder, headC, lineW, ink, 'nk')}
        {/* head (white fill, ink outline) + hair tuft */}
        <ellipse cx={headC.x} cy={headC.y} rx={R * 0.92} ry={R} fill={PAPER} stroke={ink} strokeWidth={lineW} />
        {[-0.4, -0.1, 0.2].map((o, i) => <path key={i} d={`M ${headC.x + o * R} ${headC.y - R * 0.9} q ${R * 0.08} ${-R * 0.3} ${R * 0.22} ${-R * 0.28}`} fill="none" stroke={ink} strokeWidth={lineW * 0.7} strokeLinecap="round" />)}
        {showFace && view !== 'back' && <Face cx={headC.x} cy={headC.y} R={R} lid={lid} profile={false} facing={facing} ink={ink}
          lookY={Math.sin(frame * 0.02 + 1) * 0.3 + pose.headTilt * 0.02}
          expr={{...expr, look: expr.look + Math.sin(frame * 0.027 + x) * 0.22 + (Math.sin(frame * 0.013 + x) > 0.97 ? 0.6 : 0)}} />}
        {/* near limbs */}
        {bone(hip, kneeN, lineW, ink, 'nl1')}{bone(kneeN, footN, lineW, ink, 'nl2')}{foot(kneeN, footN, 'nf')}
        {bone(shoulder, elbowN, lineW, ink, 'na1')}{bone(elbowN, handN, lineW, ink, 'na2')}{hand(handN, 'nh')}
        {briefcase && <rect x={handN.x - 26} y={handN.y + 4} width={52} height={38} rx={3} fill={PAPER} stroke={ink} strokeWidth={lineW * 0.7} />}
      </g>
    </g>
  );
};
