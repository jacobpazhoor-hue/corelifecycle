import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {StickFigure, LIGHT, SIL, DIM, PAPER} from './figure';
import {FACES, blendExpr} from './faces';
import * as A from './actions';
import meta from './episode_meta.json';
import {SceneVariantContext} from './sceneVariant';

// ============================================================================
// COMPOSABLE DOODLE STAGE — topic-specific scene packs.
// A scene = a backdrop (far plane) + an optional prop (mid) + figure(s) (near),
// composed by <Stage>, with subtle multi-plane parallax for depth ("3D" feel).
// Self-contained (own Defs/Frame) so it never disturbs the original scenes.tsx.
// New templates are exported as packs and merged into TEMPLATES in scenes.tsx.
// ============================================================================
// Mirrors scenes.tsx's SURVIVAL_TOPIC gate: reused "universal" templates (like MILITARY's
// commandPost) default to a corporate/generic backdrop that reads wrong for a disaster/outbreak
// episode — gate a rustic variant on topic so every other topic's look stays untouched.
const SURVIVAL_TOPIC = /zombie|apocalypse|outbreak|survive/i.test(
  ((meta as any)?.topic || '') + ' ' + ((meta as any)?.title || '')
);
const INK = '#2a2620';
const PAPERC = PAPER;
const FLOOR = '#eef2f6';   // bright pass 2026-07-20 (was tan #ece5d6)
const LINE = '#c2ccd6';
const GOLD = '#e8b54b';
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x);};

const Defs: React.FC = () => (
  <defs>
    <filter id="srough" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter>
    <linearGradient id="spaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#bfe4f7" /><stop offset="1" stopColor="#f4fbff" /></linearGradient>
    <linearGradient id="sclean" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f2fbff" /><stop offset="1" stopColor="#d8eefb" /></linearGradient>
    <linearGradient id="swarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fff7e2" /><stop offset="1" stopColor="#ffeac0" /></linearGradient>
    <radialGradient id="sglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3d6" stopOpacity="0.5" /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></radialGradient>
    <radialGradient id="svig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#5b6875" stopOpacity="0" /><stop offset="1" stopColor="#5b6875" stopOpacity="0.05" /></radialGradient>
  </defs>
);

// drifting dust for life
const Motes: React.FC<{frame: number; n?: number}> = ({frame, n = 14}) => (
  <g>{Array.from({length: n}).map((_, i) => {const x = rnd(i * 1.3) * 1920 + Math.sin(frame * 0.01 + i) * 26; const y = (((rnd(i * 2.1) * 1080) - (frame / 30) * (7 + rnd(i) * 14)) % 1120 + 1120) % 1120; return <circle key={i} cx={x} cy={y} r={1.6} fill="#b8b0a0" opacity={0.16} />;})}</g>
);

const Floor: React.FC<{y: number}> = ({y}) => (
  <g><rect x={0} y={y} width={1920} height={1080 - y} fill={FLOOR} /><line x1={0} y1={y} x2={1920} y2={y} stroke={INK} strokeWidth={5} strokeLinecap="round" /></g>
);

// the ancestor portrait hall — shared by the empty-frame (t02/t15) and filled-frame (t29)
// backdrops. `filled`: the fifth frame holds YOUR portrait — fresher ink than the ancestors,
// lit by its own glow, so the loop-close payoff is unmistakable at a glance.
const PortraitWallArt: React.FC<{frame: number; filled?: boolean}> = ({frame, filled = false}) => (
  <g>
    <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
    <rect x={0} y={120} width={1920} height={720} fill="#d9cba8" stroke="none" opacity={0.35} />
    <line x1={0} y1={620} x2={1920} y2={620} stroke={INK} strokeWidth={3} opacity={0.5} />
    {Array.from({length: 12}).map((_, i) => <line key={i} x1={80 + i * 165} y1={620} x2={80 + i * 165} y2={840} stroke={INK} strokeWidth={2} opacity={0.3} />)}
    {/* four gilt ancestor portraits + the fifth frame (empty until the loop closes) */}
    {[{x: 240, fifth: false}, {x: 570, fifth: false}, {x: 900, fifth: false}, {x: 1230, fifth: false}, {x: 1560, fifth: true}].map((p, i) => {
      const empty = p.fifth && !filled;
      const fresh = p.fifth && filled;
      return (
        <g key={i}>
          {fresh && <ellipse cx={p.x + 120} cy={370} rx={230} ry={280} fill="url(#sglow)" opacity={0.7} />}
          <rect x={p.x - 14} y={186} width={268} height={368} fill={GOLD} stroke={INK} strokeWidth={4} opacity={fresh ? 0.95 : 0.75} />
          <rect x={p.x} y={200} width={240} height={340} fill={empty ? '#efe8d8' : PAPERC} stroke={INK} strokeWidth={4} />
          {!empty && <g opacity={fresh ? 1 : 0.6}>
            <circle cx={p.x + 120} cy={310} r={44} fill="none" stroke={INK} strokeWidth={3.5} />
            <path d={`M ${p.x + 42} 540 q 78 -140 156 0`} fill="none" stroke={INK} strokeWidth={3.5} />
            <path d={`M ${p.x + 96} 300 q 8 -10 16 0 M ${p.x + 128} 300 q 8 -10 16 0`} fill="none" stroke={INK} strokeWidth={2.5} />
            <line x1={p.x + 104} y1={336} x2={p.x + 136} y2={336} stroke={INK} strokeWidth={2.5} />
          </g>}
          <rect x={p.x + 70} y={560} width={100} height={22} rx={4} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={fresh ? 1 : 0.8} />
        </g>
      );
    })}
    <ellipse cx={960} cy={360} rx={620} ry={260} fill="url(#sglow)" opacity={0.25} />
  </g>
);

// A rolling/jagged ridgeline path from x=0..W, deterministic per seed. `roll` in [0..1]:
// 0 = sharp mountain peaks, 1 = smooth rounded hills. `amp` = crest height variation.
const ridgePath = (crestY: number, amp: number, seed: number, roll = 0.7, W = 1920, H = 1120) => {
  const seg = 150 + Math.round(rnd(seed) * 90);           // peak spacing varies per layer
  const pk: Array<[number, number]> = [];
  for (let x = 0; x <= W + seg; x += seg) pk.push([x, crestY - rnd(seed + x * 1.7) * amp]);  // peak tops
  let d = `M 0 ${pk[0][1].toFixed(1)}`;
  for (let i = 1; i < pk.length; i++) {
    const [x, y] = pk[i], [px, py] = pk[i - 1], mx = (px + x) / 2;
    if (roll < 0.5) {                                      // SHARP peaks: notch down to a valley, straight climb up
      const vy = Math.max(py, y) + amp * 0.4 * (1 - roll * 2);
      d += ` L ${mx.toFixed(1)} ${vy.toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    } else {                                               // ROUNDED hills: quadratic crest between peaks
      const cy = Math.min(py, y) - amp * (roll - 0.35);
      d += ` Q ${mx.toFixed(1)} ${cy.toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
  }
  return d + ` L ${W} ${H} L 0 ${H} Z`;
};

// Layered ridgelines with atmospheric depth (far = higher + paler, near = lower + darker),
// contour shading on the front ridge, and scattered doodle trees. Keeps the hand-drawn ink look.
const Ridges: React.FC<{baseY: number; layers?: number; seed?: number; roll?: number; amp?: number;
  tint?: string; trees?: number; treeKind?: 'pine' | 'round'}> =
({baseY, layers = 3, seed = 1, roll = 0.7, amp = 90, tint = PAPERC, trees = 0, treeKind = 'round'}) => {
  const rows = Array.from({length: layers}, (_, i) => {
    const depth = i / Math.max(layers - 1, 1);            // 0 = farthest, 1 = nearest
    const crestY = baseY - (layers - 1 - i) * amp * 0.9;  // farther ridges sit higher
    const op = 0.32 + depth * 0.5;                        // nearer = more opaque
    return {i, depth, crestY, op, d: ridgePath(crestY, amp * (0.7 + depth * 0.6), seed + i * 53, roll)};
  });
  return (
    <g>
      {rows.map(({i, crestY, op, d}) => (
        <path key={i} d={d} fill={tint} stroke={INK} strokeWidth={2 + i} opacity={op} strokeLinejoin="round" />
      ))}
      {/* scattered doodle trees along the front slope */}
      {trees > 0 && Array.from({length: trees}).map((_, k) => {
        const x = 40 + (k + rnd(seed + k) * 0.6) * (1840 / trees);
        const y = baseY - 8 + rnd(seed + k * 3.3) * 46;
        const s = 0.7 + rnd(seed + k * 2.1) * 0.7;
        return treeKind === 'pine'
          ? <path key={k} d={`M ${x} ${y - 60 * s} l ${-20 * s} ${44 * s} l ${40 * s} 0 Z M ${x} ${y - 36 * s} l ${-26 * s} ${50 * s} l ${52 * s} 0 Z`}
              fill={tint} stroke={INK} strokeWidth={2.2} opacity={0.55} strokeLinejoin="round" />
          : <g key={k} opacity={0.5}><ellipse cx={x} cy={y - 30 * s} rx={26 * s} ry={22 * s} fill={tint} stroke={INK} strokeWidth={2.2} /><line x1={x} y1={y - 12 * s} x2={x} y2={y + 6 * s} stroke={INK} strokeWidth={3} /></g>;
      })}
    </g>
  );
};

// Basketball hoop art shared across the basketball pack's backdrops (driveway/gym/arena) — a
// backboard, an orange rim, and a net of converging lines, in local coords with origin at the rim.
const HoopArt: React.FC<{x: number; y: number; scale?: number}> = ({x, y, scale = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <rect x={-90} y={-170} width={180} height={120} fill="#f4f1e8" stroke={INK} strokeWidth={5} />
    <rect x={-46} y={-138} width={92} height={56} fill="none" stroke={INK} strokeWidth={3} opacity={0.6} />
    <line x1={-90} y1={-50} x2={90} y2={-50} stroke={INK} strokeWidth={4} />
    <ellipse cx={0} cy={-38} rx={54} ry={12} fill="none" stroke="#c0392b" strokeWidth={7} />
    {[-40, -20, 0, 20, 40].map((lx) => <line key={lx} x1={lx * 0.9} y1={-32} x2={lx * 0.35} y2={38} stroke={INK} strokeWidth={2} opacity={0.5} />)}
  </g>
);

// Side-profile open-wheel racecar art shared across the motorsport pack's backdrops (kart track,
// paddock, grid, crash barrier) — front + rear wheel, low sidepod body, nose cone, cockpit + halo
// bump, rear wing, in local coords with origin near the rear-wheel/ground contact line.
const RaceCarArt: React.FC<{opacity?: number; livery?: string}> = ({opacity = 1, livery = '#c0392b'}) => (
  <g opacity={opacity}>
    <circle cx={190} cy={-40} r={54} fill={PAPERC} stroke={INK} strokeWidth={6} /><circle cx={190} cy={-40} r={18} fill="#c9c2ad" stroke={INK} strokeWidth={3} />
    <circle cx={-210} cy={-30} r={44} fill={PAPERC} stroke={INK} strokeWidth={6} /><circle cx={-210} cy={-30} r={15} fill="#c9c2ad" stroke={INK} strokeWidth={3} />
    <path d="M -230 -60 L -150 -110 L 60 -118 L 150 -95 L 230 -70 L 230 -40 L 150 -40 L -150 -40 L -230 -40 Z" fill={PAPERC} stroke={INK} strokeWidth={5} />
    <path d="M -230 -60 L -280 -50 L -280 -36 L -230 -40 Z" fill={livery} stroke={INK} strokeWidth={4} />
    <path d="M -40 -118 L -10 -150 L 40 -150 L 60 -118 Z" fill="#1c2026" stroke={INK} strokeWidth={4} />
    <path d="M -20 -150 L -20 -178 L 34 -178 L 34 -150" fill="none" stroke={INK} strokeWidth={6} />
    <line x1={210} y1={-95} x2={210} y2={-135} stroke={INK} strokeWidth={5} />
    <rect x={175} y={-150} width={80} height={16} fill={livery} stroke={INK} strokeWidth={4} />
    <rect x={-150} y={-90} width={280} height={14} fill={livery} opacity={0.85} />
  </g>
);

// =================== BACKDROPS (far plane) ===================
const BG: Record<string, React.FC<{frame: number}>> = {
  // tiered lecture hall — med school / training / any "learning" beat
  lectureHall: ({frame}) => (
    <g>
      {[0, 1, 2, 3, 4].map((r) => {const y = 300 + r * 92; const w = 1400 + r * 80; const x = 960 - w / 2;
        return <g key={r}><rect x={x} y={y} width={w} height={46} fill={PAPERC} stroke={INK} strokeWidth={3} />
          {Array.from({length: 9}).map((_, c) => <rect key={c} x={x + 60 + c * (w - 120) / 8 - 14} y={y - 30} width={28} height={30} rx={5} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.85} />)}</g>;})}
      <rect x={620} y={170} width={680} height={120} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // operating room — clean tiles + overhead light + vitals monitor
  operatingRoom: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="none" />
      {[260, 560, 860].map((y) => <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke={LINE} strokeWidth={2} opacity={0.5} />)}
      {[480, 960, 1440].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={860} stroke={LINE} strokeWidth={2} opacity={0.5} />)}
      {/* overhead surgical light */}
      <ellipse cx={960} cy={150} rx={150} ry={60} fill="url(#sglow)" opacity={0.9} />
      <ellipse cx={960} cy={150} rx={110} ry={42} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[-60, -20, 20, 60].map((dx) => <circle key={dx} cx={960 + dx} cy={150} r={14} fill="none" stroke={INK} strokeWidth={2} />)}
      <line x1={960} y1={108} x2={960} y2={40} stroke={INK} strokeWidth={4} />
      {/* vitals monitor */}
      <rect x={1560} y={230} width={300} height={200} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <polyline points={`1580,330 1640,330 1660,${300 + Math.sin(frame * 0.5) * 4} 1680,360 1700,300 1720,330 1840,330`} fill="none" stroke="#c0392b" strokeWidth={3} />
      <text x={1580} y={410} fontFamily="monospace" fontSize={26} fill={INK}>{72 + (Math.floor(frame / 18) % 6)} bpm</text>
    </g>
  ),
  // hospital ward — row of beds receding
  hospitalWard: ({frame}) => (
    <g>
      {[0, 1, 2].map((i) => {const x = 1040 + i * 300; const s = 1 - i * 0.16; const y = 600 + i * 30;
        return <g key={i} opacity={1 - i * 0.16}>
          {/* mattress */}
          <rect x={x} y={y} width={240 * s} height={56 * s} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} />
          {/* headboard */}
          <rect x={x} y={y - 70 * s} width={20 * s} height={70 * s} fill={PAPERC} stroke={INK} strokeWidth={4} />
          {/* pillow + patient lump */}
          <ellipse cx={x + 44 * s} cy={y + 10 * s} rx={30 * s} ry={16 * s} fill={PAPERC} stroke={INK} strokeWidth={3} />
          <path d={`M ${x + 70 * s} ${y + 6} q ${90 * s} ${-34 * s} ${170 * s} 0`} fill="none" stroke={INK} strokeWidth={3} />
          {/* legs */}
          <line x1={x + 10 * s} y1={y + 56 * s} x2={x + 10 * s} y2={y + 96 * s} stroke={INK} strokeWidth={3} />
          <line x1={x + 230 * s} y1={y + 56 * s} x2={x + 230 * s} y2={y + 96 * s} stroke={INK} strokeWidth={3} /></g>;})}
      {[300, 700].map((x) => <rect key={x} x={x} y={140} width={150} height={220} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.5} />)}
      <line x1={0} y1={140} x2={1920} y2={140} stroke={LINE} strokeWidth={2} opacity={0.5} />
    </g>
  ),
  // scan / x-ray lightbox wall — medical "file wall"
  scanWall: ({frame}) => (
    <g>{Array.from({length: 10}).map((_, i) => {const c = i % 5, r = Math.floor(i / 5); const x = 700 + c * 230, y = 230 + r * 300;
      return <g key={i}><rect x={x} y={y} width={200} height={260} rx={4} fill="#eef1f4" stroke={INK} strokeWidth={4} />
        {/* ribcage / skull doodle */}
        <ellipse cx={x + 100} cy={y + 90} rx={56} ry={66} fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />
        {[0, 1, 2, 3].map((k) => <path key={k} d={`M ${x + 60} ${y + 150 + k * 24} q 40 18 80 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />)}</g>;})}</g>
  ),
  // podium / press stage — generic for any topic (pitch, press, address)
  podiumStage: ({frame}) => (
    <g>
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={250} rx={420} ry={200} fill="url(#sglow)" opacity={0.7} />
      {/* audience silhouettes */}
      {Array.from({length: 16}).map((_, i) => {const x = 120 + i * 116; return <g key={i} opacity={0.5}><circle cx={x} cy={1000} r={26} fill={INK} /><rect x={x - 26} y={1020} width={52} height={60} fill={INK} /></g>;})}
    </g>
  ),
  // tiled lab / research bench backdrop
  lab: ({frame}) => (
    <g>
      <rect x={0} y={700} width={1920} height={60} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[860, 1180, 1500].map((x, i) => <g key={x}><rect x={x} y={636} width={60} height={66} fill={PAPERC} stroke={INK} strokeWidth={3} /><path d={`M ${x + 14} ${y_(636)} l 0 26 l -10 18 l 32 0 l -10 -18 l 0 -26`} fill="none" stroke={INK} strokeWidth={2.5} /><ellipse cx={x + 18} cy={690} rx={12} ry={8} fill={GOLD} opacity={0.5} /></g>)}
      {[200, 520].map((x) => <rect key={x} x={x} y={160} width={170} height={220} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.55} />)}
    </g>
  ),
  // --- startup / founder ---
  garage: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      {/* roller garage door */}
      <rect x={120} y={170} width={620} height={610} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={120} y1={270 + i * 100} x2={740} y2={270 + i * 100} stroke={INK} strokeWidth={3} opacity={0.55} />)}
      {/* stacked moving boxes */}
      <rect x={1500} y={560} width={150} height={140} fill={PAPERC} stroke={INK} strokeWidth={3} /><line x1={1500} y1={600} x2={1650} y2={600} stroke={INK} strokeWidth={2} />
      <rect x={1660} y={520} width={130} height={180} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <rect x={1540} y={420} width={120} height={130} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  startupOffice: ({frame}) => (
    <g>
      {/* exposed-brick back wall + big whiteboard */}
      {Array.from({length: 6}).map((_, r) => Array.from({length: 14}).map((_, c) => <rect key={r + '_' + c} x={40 + c * 140 + (r % 2 ? 70 : 0)} y={120 + r * 70} width={120} height={56} fill="none" stroke={LINE} strokeWidth={2} opacity={0.5} />))}
      <rect x={1180} y={170} width={560} height={300} fill="#fbfcfb" stroke={INK} strokeWidth={4} />
      <path d="M 1240 420 L 1340 280 L 1420 360 L 1540 250" fill="none" stroke="#c0392b" strokeWidth={4} />
      {/* desks row — left desk previously sat at x300-600/y760, which still crossed the standing
          front-figure's torso at x540/y880 (the rough hand-drawn wobble filter jitters the jacket's
          edge independently of this rigid rect, so the "occluded" boundary read as the bar piercing
          his body instead of passing cleanly behind him — reviewer t07 defect #2). Moved clear of the
          figure's whole silhouette (arms included, ~x390-690) instead of merely behind the torso. */}
      <rect x={60} y={760} width={200} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={760} y={640} width={300} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
    </g>
  ),
  serverRoom: ({frame}) => (
    <g>
      {[120, 420, 720, 1220, 1520].map((x, i) => (
        <g key={x}><rect x={x} y={220} width={180} height={620} fill={PAPERC} stroke={INK} strokeWidth={4} />
          {Array.from({length: 9}).map((_, r) => <g key={r}><line x1={x} y1={260 + r * 64} x2={x + 180} y2={260 + r * 64} stroke={INK} strokeWidth={2} opacity={0.5} />
            <circle cx={x + 150} cy={244 + r * 64} r={5} fill={(i + r) % 3 ? GOLD : '#5bbf7a'} opacity={0.7 + 0.3 * Math.sin(frame * 0.2 + i + r)} /></g>)}</g>))}
    </g>
  ),
  // the survival-topic command post: a canvas A-frame tent + a staked state flag out front, with
  // rustic crate seating — reused for both the checkpoint tent (early) and the year-later camp
  // council, so it reads as a command post without ever looking like a corporate server room.
  commandTent: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {/* A-frame canvas tent, center-right */}
      <polygon points="660,820 960,260 1260,820" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <polygon points="900,820 960,320 1020,820" fill="#e6dcc4" stroke={INK} strokeWidth={3} />
      <line x1={960} y1={320} x2={960} y2={820} stroke={INK} strokeWidth={2} opacity={0.5} />
      {/* guy-lines + stakes */}
      <line x1={660} y1={820} x2={560} y2={880} stroke={INK} strokeWidth={2.5} /><line x1={1260} y1={820} x2={1360} y2={880} stroke={INK} strokeWidth={2.5} />
      {/* staked state flag, out front */}
      <line x1={1560} y1={860} x2={1560} y2={260} stroke={INK} strokeWidth={5} />
      <path d={`M 1560 260 L 1740 ${300 + Math.sin(frame * 0.08) * 10} L 1560 ${340 + Math.sin(frame * 0.08) * 6} Z`} fill="#c0392b" stroke={INK} strokeWidth={3} />
      <circle cx={1650} cy={296 + Math.sin(frame * 0.08) * 8} r={22} fill={GOLD} stroke={INK} strokeWidth={2} opacity={0.85} />
      {/* rustic crates, camp-council seating */}
      <rect x={300} y={700} width={140} height={120} fill={PAPERC} stroke={INK} strokeWidth={3.5} /><line x1={300} y1={760} x2={440} y2={760} stroke={INK} strokeWidth={2} opacity={0.5} />
      <rect x={460} y={740} width={110} height={80} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  ipoFloor: ({frame}) => (
    <g>
      {/* giant ticker board */}
      <rect x={360} y={150} width={1200} height={300} fill="#10151b" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((r) => <g key={r}>{Array.from({length: 7}).map((_, c) => {const up = (c + r) % 2; return <g key={c}><text x={420 + c * 165} y={235 + r * 90} fontFamily="monospace" fontSize={34} fill={up ? '#5bbf7a' : '#e06a5a'}>{up ? '▲' : '▼'}{(10 + ((c * 7 + r * 3 + Math.floor(frame / 15)) % 90))}</text></g>;})}</g>)}
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
    </g>
  ),
  // --- military / soldier ---
  barracks: ({frame}) => (
    <g>
      {[0, 1, 2].map((i) => {const x = 1060 + i * 290; const s = 1 - i * 0.16;
        return <g key={i} opacity={1 - i * 0.16}><rect x={x} y={560} width={230 * s} height={50 * s} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
          <rect x={x} y={560 - 70 * s} width={230 * s} height={46 * s} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
          <rect x={x} y={490 - 70 * s} width={16 * s} height={150 * s} fill={PAPERC} stroke={INK} strokeWidth={4} />
          <rect x={x + 214 * s} y={490 - 70 * s} width={16 * s} height={150 * s} fill={PAPERC} stroke={INK} strokeWidth={4} /></g>;})}
      {[300, 660].map((x) => <rect key={x} x={x} y={150} width={150} height={230} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.5} />)}
    </g>
  ),
  battlefield: ({frame}) => (
    <g>
      {/* distant ridge + smoke */}
      <path d="M 0 560 Q 480 470 960 540 T 1920 520 L 1920 720 L 0 720 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[400, 1100, 1600].map((x, i) => <g key={x} opacity={0.18}>{[0, 1, 2].map((k) => <circle key={k} cx={x + Math.sin(frame * 0.02 + i) * 14} cy={460 - k * 50} r={40 + k * 24} fill={INK} />)}</g>)}
      {/* trench line + sandbags */}
      <rect x={0} y={720} width={1920} height={360} fill={FLOOR} /><line x1={0} y1={720} x2={1920} y2={720} stroke={INK} strokeWidth={5} />
      {Array.from({length: 12}).map((_, i) => <ellipse key={i} cx={120 + i * 150} cy={720} rx={80} ry={34} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
    </g>
  ),
  paradeGround: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {/* flagpoles */}
      {[260, 960, 1660].map((x, i) => <g key={x}><line x1={x} y1={180} x2={x} y2={820} stroke={INK} strokeWidth={5} />
        <path d={`M ${x} 200 L ${x + 120 + Math.sin(frame * 0.05 + i) * 10} 230 L ${x} 300 Z`} fill={i === 1 ? GOLD : PAPERC} stroke={INK} strokeWidth={3} /></g>)}
      {/* formation rows of small marks */}
      {[0, 1, 2].map((r) => Array.from({length: 10}).map((_, c) => <circle key={r + '_' + c} cx={460 + c * 110} cy={620 + r * 56} r={9} fill={INK} opacity={0.45 - r * 0.1} />))}
    </g>
  ),
  // --- sports / athlete ---
  lockerRoom: ({frame}) => (
    <g>
      {Array.from({length: 9}).map((_, i) => {const x = 140 + i * 190; return <g key={i}><rect x={x} y={180} width={170} height={460} fill={PAPERC} stroke={INK} strokeWidth={4} />
        <line x1={x} y1={400} x2={x + 170} y2={400} stroke={INK} strokeWidth={3} opacity={0.5} /><circle cx={x + 140} cy={410} r={6} fill="none" stroke={INK} strokeWidth={3} /></g>;})}
      <rect x={0} y={760} width={1920} height={60} fill={PAPERC} stroke={INK} strokeWidth={4} />{/* bench */}
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} />
    </g>
  ),
  stadiumField: ({frame}) => (
    <g>
      {/* stands */}
      {[0, 1, 2, 3].map((r) => <rect key={r} x={-20} y={140 + r * 70} width={1960} height={40} fill={PAPERC} stroke={INK} strokeWidth={2} opacity={0.6 - r * 0.08} />)}
      {Array.from({length: 60}).map((_, i) => <circle key={i} cx={40 + (i % 30) * 64} cy={170 + Math.floor(i / 30) * 70} r={7} fill={INK} opacity={0.3} />)}
      {/* pitch + goalposts + centre line */}
      <rect x={0} y={760} width={1920} height={320} fill="#eef2e6" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <line x1={960} y1={760} x2={960} y2={1080} stroke={INK} strokeWidth={3} opacity={0.5} /><circle cx={960} cy={920} r={90} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
      <g stroke={INK} strokeWidth={5} fill="none"><path d="M 120 760 L 120 660 L 320 660 L 320 760" /></g>
    </g>
  ),
  gym: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      {/* weight rack */}
      <rect x={1380} y={300} width={420} height={40} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[1430, 1530, 1630, 1730].map((x) => <g key={x}><line x1={x} y1={340} x2={x} y2={420} stroke={INK} strokeWidth={3} /><circle cx={x} cy={450} r={28} fill={PAPERC} stroke={INK} strokeWidth={4} /></g>)}
      {[280, 520].map((x) => <rect key={x} x={x} y={160} width={170} height={220} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.5} />)}
    </g>
  ),
  // --- hedge fund / trading ---
  tradingWall: ({frame}) => (
    <g>
      {/* bank of dark monitors, each a tiny live chart */}
      {Array.from({length: 15}).map((_, i) => {const c = i % 5, r = Math.floor(i / 5); const x = 360 + c * 250, y = 150 + r * 196;
        const up = (c + r + Math.floor(frame / 40)) % 2 === 0;
        return <g key={i}><rect x={x} y={y} width={212} height={156} rx={6} fill="#10151b" stroke={INK} strokeWidth={4} />
          <polyline points={Array.from({length: 7}).map((_, k) => `${x + 18 + k * 30},${y + 120 - ((Math.sin(k * 1.1 + i * 1.7 + frame * 0.05) * 0.5 + 0.5) * 78)}`).join(' ')} fill="none" stroke={up ? '#5bbf7a' : '#e06a5a'} strokeWidth={3} />
          <text x={x + 16} y={y + 36} fontFamily="monospace" fontSize={24} fill={up ? '#5bbf7a' : '#e06a5a'}>{up ? '▲' : '▼'}{(10 + ((i * 7 + Math.floor(frame / 15)) % 88))}</text></g>;})}
      {/* floor */}
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
    </g>
  ),
  // --- real estate / property ---
  // suburban house with a FOR SALE yard sign — the entry agent / first deal
  suburbHouse: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {/* house body + pitched roof */}
      <rect x={1060} y={520} width={520} height={300} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 1030 520 L 1320 360 L 1610 520 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      {/* door */}
      <rect x={1280} y={680} width={92} height={140} fill={PAPERC} stroke={INK} strokeWidth={4} /><circle cx={1358} cy={752} r={5} fill={INK} />
      {/* windows */}
      {[1110, 1430].map((x) => <g key={x}><rect x={x} y={580} width={110} height={92} fill="#dfe7ee" stroke={INK} strokeWidth={4} /><line x1={x + 55} y1={580} x2={x + 55} y2={672} stroke={INK} strokeWidth={2} /><line x1={x} y1={626} x2={x + 110} y2={626} stroke={INK} strokeWidth={2} /></g>)}
      {/* FOR SALE yard sign */}
      <line x1={760} y1={820} x2={760} y2={618} stroke={INK} strokeWidth={6} />
      <rect x={658} y={556} width={204} height={92} fill={GOLD} stroke={INK} strokeWidth={4} />
      <text x={760} y={596} textAnchor="middle" fontFamily={SANS} fontSize={30} fontWeight={800} fill={INK}>FOR</text>
      <text x={760} y={632} textAnchor="middle" fontFamily={SANS} fontSize={30} fontWeight={800} fill={INK}>SALE</text>
    </g>
  ),
  // apartment-block facade, grid of windows (some lit) — landlord / portfolio of doors
  apartmentBlock: ({frame}) => (
    <g>
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      <rect x={300} y={420} width={300} height={440} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.45} />
      <rect x={1040} y={200} width={620} height={660} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {Array.from({length: 6}).map((_, r) => Array.from({length: 5}).map((_, c) => {const lit = (r * 5 + c + Math.floor(frame / 30)) % 4 === 0;
        return <rect key={r + '_' + c} x={1080 + c * 112} y={240 + r * 100} width={70} height={62} fill={lit ? GOLD : '#dfe7ee'} stroke={INK} strokeWidth={3} opacity={lit ? 0.72 : 1} />;}))}
      <rect x={1300} y={760} width={100} height={100} fill={PAPERC} stroke={INK} strokeWidth={4} />
    </g>
  ),
  // tower crane + steel-frame building under construction — the developer
  constructionSite: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      {/* steel frame */}
      <rect x={1080} y={300} width={520} height={540} fill="none" stroke={INK} strokeWidth={4} />
      {[1, 2, 3, 4].map((r) => <line key={'h' + r} x1={1080} y1={300 + r * 108} x2={1600} y2={300 + r * 108} stroke={INK} strokeWidth={3} opacity={0.7} />)}
      {[1, 2, 3].map((c) => <line key={'v' + c} x1={1080 + c * 130} y1={300} x2={1080 + c * 130} y2={840} stroke={INK} strokeWidth={2} opacity={0.5} />)}
      {/* tower crane: mast, jib, A-frame, counter-weight */}
      <line x1={760} y1={840} x2={760} y2={200} stroke={INK} strokeWidth={6} />
      <line x1={520} y1={200} x2={1180} y2={200} stroke={INK} strokeWidth={6} />
      <line x1={520} y1={200} x2={760} y2={120} stroke={INK} strokeWidth={4} /><line x1={1180} y1={200} x2={760} y2={120} stroke={INK} strokeWidth={4} />
      <rect x={498} y={186} width={42} height={36} fill={INK} />
      {/* hook line + swinging load */}
      <line x1={1060} y1={200} x2={1060} y2={356 + Math.sin(frame * 0.05) * 20} stroke={INK} strokeWidth={2} />
      <rect x={1030} y={356 + Math.sin(frame * 0.05) * 20} width={62} height={42} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // framed blueprints on a wall — planning / fund war-room backdrop for the scale model
  blueprintWall: ({frame}) => (
    <g>
      {[300, 560, 1280, 1540].map((x) => <g key={x}><rect x={x} y={160} width={210} height={264} fill="#e9eef4" stroke={INK} strokeWidth={3} />
        {[0, 1, 2].map((k) => <line key={k} x1={x + 20} y1={206 + k * 62} x2={x + 190} y2={206 + k * 62} stroke={INK} strokeWidth={2} opacity={0.4} />)}
        <rect x={x + 42} y={244} width={120} height={120} fill="none" stroke="#3a6ea5" strokeWidth={2} opacity={0.6} /></g>)}
    </g>
  ),
  // rooftop railing over a dense night skyline — the empire / mogul apex
  cityRoof: ({frame}) => (
    <g>
      {[{x: 120, w: 160, h: 420}, {x: 300, w: 130, h: 560}, {x: 460, w: 180, h: 360}, {x: 680, w: 140, h: 640}, {x: 860, w: 200, h: 480}, {x: 1100, w: 150, h: 600}, {x: 1290, w: 170, h: 400}, {x: 1500, w: 140, h: 560}, {x: 1680, w: 160, h: 460}].map((b, i) => (
        <g key={i}><rect x={b.x} y={760 - b.h} width={b.w} height={b.h} fill={PAPERC} stroke={INK} strokeWidth={3} />
          {Array.from({length: Math.floor(b.h / 70)}).map((_, r) => Array.from({length: Math.floor(b.w / 50)}).map((_, c) => {const lit = (i * 7 + r * 3 + c + Math.floor(frame / 40)) % 5 === 0;
            return <rect key={r + '_' + c} x={b.x + 12 + c * 50} y={760 - b.h + 18 + r * 70} width={26} height={34} fill={lit ? GOLD : '#33414f'} opacity={lit ? 0.8 : 0.5} />;}))}</g>))}
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={4} />
      {Array.from({length: 24}).map((_, i) => <line key={i} x1={40 + i * 80} y1={760} x2={40 + i * 80} y2={820} stroke={INK} strokeWidth={3} />)}
    </g>
  ),
  // --- spy / espionage ---
  // the Farm: training ground — chain-link fence, paper targets, a watchtower
  farm: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <line x1={0} y1={300} x2={1920} y2={300} stroke={INK} strokeWidth={4} />
      {Array.from({length: 26}).map((_, i) => <line key={'p' + i} x1={i * 78} y1={300} x2={i * 78} y2={820} stroke={INK} strokeWidth={2} opacity={0.3} />)}
      {Array.from({length: 13}).map((_, i) => <line key={'h' + i} x1={0} y1={338 + i * 38} x2={1920} y2={338 + i * 38} stroke={INK} strokeWidth={1.5} opacity={0.18} />)}
      {/* watchtower */}
      <g><line x1={1560} y1={820} x2={1600} y2={420} stroke={INK} strokeWidth={5} /><line x1={1760} y1={820} x2={1720} y2={420} stroke={INK} strokeWidth={5} />
        <rect x={1560} y={340} width={210} height={90} fill={PAPERC} stroke={INK} strokeWidth={4} /><path d="M 1545 340 L 1665 290 L 1785 340 Z" fill={PAPERC} stroke={INK} strokeWidth={4} /></g>
      {/* paper targets */}
      {[260, 520].map((x) => <g key={x}><line x1={x} y1={820} x2={x} y2={560} stroke={INK} strokeWidth={4} /><circle cx={x} cy={520} r={46} fill={PAPERC} stroke={INK} strokeWidth={4} /><circle cx={x} cy={520} r={26} fill="none" stroke={INK} strokeWidth={3} /><circle cx={x} cy={520} r={9} fill="#c0392b" opacity={0.6} /></g>)}
    </g>
  ),
  // night street — surveillance / a tail: lit facade, streetlamps with glow, a lone doorway
  nightStreet: ({frame}) => (
    <g>
      <rect x={0} y={180} width={1920} height={560} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.5} />
      {Array.from({length: 18}).map((_, i) => {const lit = (i + Math.floor(frame / 40)) % 5 === 0; return <rect key={i} x={60 + i * 100} y={240} width={50} height={70} fill={lit ? GOLD : '#33414f'} stroke={INK} strokeWidth={2} opacity={lit ? 0.7 : 0.4} />;})}
      <rect x={0} y={740} width={1920} height={340} fill={FLOOR} /><line x1={0} y1={740} x2={1920} y2={740} stroke={INK} strokeWidth={5} />
      {[360, 1160].map((x) => <g key={x}><line x1={x} y1={740} x2={x} y2={300} stroke={INK} strokeWidth={5} /><path d={`M ${x} 300 q 0 -20 40 -20`} fill="none" stroke={INK} strokeWidth={5} /><circle cx={x + 44} cy={286} r={14} fill={GOLD} opacity={0.9} /><ellipse cx={x + 44} cy={300} rx={150} ry={300} fill="url(#sglow)" opacity={0.5} /></g>)}
      <rect x={1520} y={520} width={120} height={220} fill={PAPERC} stroke={INK} strokeWidth={4} /><rect x={1548} y={560} width={64} height={180} fill="#2a313a" stroke={INK} strokeWidth={3} />
    </g>
  ),
  // park — the dead drop: a tree, a streetlamp glow, a low wall with a chalk signal mark
  parkDrop: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <line x1={1620} y1={780} x2={1620} y2={460} stroke={INK} strokeWidth={14} />
      <circle cx={1620} cy={400} r={130} fill={PAPERC} stroke={INK} strokeWidth={4} /><circle cx={1540} cy={460} r={80} fill={PAPERC} stroke={INK} strokeWidth={4} /><circle cx={1710} cy={450} r={86} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <line x1={300} y1={780} x2={300} y2={360} stroke={INK} strokeWidth={5} /><circle cx={300} cy={344} r={16} fill={GOLD} opacity={0.85} /><ellipse cx={300} cy={360} rx={120} ry={240} fill="url(#sglow)" opacity={0.45} />
      <rect x={520} y={620} width={520} height={120} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[560, 640, 720, 800, 880, 960].map((x) => <line key={x} x1={x} y1={620} x2={x} y2={740} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <line x1={580} y1={650} x2={620} y2={690} stroke="#c0392b" strokeWidth={5} opacity={0.8} /><line x1={620} y1={650} x2={580} y2={690} stroke="#c0392b" strokeWidth={5} opacity={0.8} />
    </g>
  ),
  // safehouse target wall — pinned photos, a map, red string (the corkboard), single lamp
  safehouseWall: ({frame}) => (
    <g>
      <rect x={520} y={120} width={1340} height={560} fill="#d8cdb4" stroke={INK} strokeWidth={5} />
      <rect x={560} y={170} width={360} height={300} fill="#e9eef4" stroke={INK} strokeWidth={3} />
      <path d="M 580 320 Q 700 250 900 300" fill="none" stroke="#3a6ea5" strokeWidth={2} opacity={0.6} />
      {[{x: 980, y: 170}, {x: 1180, y: 200}, {x: 1400, y: 160}, {x: 1620, y: 210}, {x: 1120, y: 420}, {x: 1380, y: 440}, {x: 1600, y: 430}].map((p, i) => <g key={i}><rect x={p.x} y={p.y} width={120} height={150} fill={PAPERC} stroke={INK} strokeWidth={3} /><circle cx={p.x + 60} cy={p.y + 56} r={26} fill="none" stroke={INK} strokeWidth={2} /><circle cx={p.x + 60} cy={p.y + 18} r={9} fill="#c0392b" opacity={0.7} /></g>)}
      <path d="M 1040 246 L 1240 276 L 1460 236 L 1180 496 L 1440 516" fill="none" stroke="#c0392b" strokeWidth={2} opacity={0.55} />
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
    </g>
  ),
  // embassy station — the seal, a flag, a steel vault door
  embassyOffice: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <circle cx={960} cy={290} r={120} fill={PAPERC} stroke={INK} strokeWidth={5} /><circle cx={960} cy={290} r={90} fill="none" stroke={INK} strokeWidth={2} />
      <path d="M 960 220 L 982 290 L 960 360 L 938 290 Z" fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.7} />
      <g><line x1={300} y1={760} x2={300} y2={240} stroke={INK} strokeWidth={6} /><path d={`M 300 260 L ${440 + Math.sin(frame * 0.05) * 10} 290 L 300 360 Z`} fill={PAPERC} stroke={INK} strokeWidth={3} /></g>
      <rect x={1480} y={300} width={300} height={420} rx={10} fill={PAPERC} stroke={INK} strokeWidth={5} /><circle cx={1630} cy={510} r={70} fill="none" stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={1630} y1={510} x2={1630 + 70 * Math.cos(i * Math.PI / 3)} y2={510 + 70 * Math.sin(i * Math.PI / 3)} stroke={INK} strokeWidth={3} />)}
    </g>
  ),
  // bare interrogation / debrief room — a hanging bulb + cone of light over the dark
  interrogRoom: ({frame}) => (
    <g>
      {[420, 720].map((y) => <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke={LINE} strokeWidth={2} opacity={0.4} />)}
      <line x1={960} y1={0} x2={960} y2={150} stroke={INK} strokeWidth={3} /><circle cx={960} cy={164} r={16} fill={GOLD} opacity={0.9} />
      <path d="M 960 164 L 660 760 L 1260 760 Z" fill="url(#sglow)" opacity={0.6} />
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
    </g>
  ),
  // --- Roman empire / legion ---
  // the forum: a temple facade (columns + pediment), steps, a civic crowd — civic life, the mob, arrival
  romanForum: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      <g>
        {[0, 1, 2].map((i) => <rect key={i} x={1120 - i * 30} y={764 + i * 26} width={760 + i * 60} height={26} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
        {[1180, 1300, 1420, 1540, 1660].map((x) => <g key={x}><rect x={x} y={360} width={56} height={404} fill={PAPERC} stroke={INK} strokeWidth={4} />{[0, 1, 2, 3, 4].map((k) => <line key={k} x1={x + 12 + k * 9} y1={360} x2={x + 12 + k * 9} y2={764} stroke={INK} strokeWidth={1.5} opacity={0.3} />)}</g>)}
        <path d="M 1150 360 L 1480 250 L 1810 360 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      </g>
      {Array.from({length: 13}).map((_, i) => <g key={i} opacity={0.4}><circle cx={120 + i * 72} cy={800} r={22} fill={INK} /><rect x={120 + i * 72 - 22} y={820} width={44} height={50} fill={INK} /></g>)}
    </g>
  ),
  // marching camp / drill ground: an earth rampart of pointed stakes + a standard pole
  marchCamp: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <line x1={0} y1={480} x2={1920} y2={480} stroke={INK} strokeWidth={3} opacity={0.45} />
      {Array.from({length: 24}).map((_, i) => {const x = 40 + i * 80; return <path key={i} d={`M ${x} 480 L ${x} 380 L ${x - 12} 360 M ${x} 380 L ${x + 12} 360`} stroke={INK} strokeWidth={3} fill="none" opacity={0.7} />;})}
      <line x1={300} y1={800} x2={300} y2={300} stroke={INK} strokeWidth={6} />
      <rect x={300} y={324} width={116} height={88} fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.8} />
      <circle cx={300} cy={296} r={14} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // night legionary camp: rows of leather tents receding + a campfire glow
  tentCamp: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {[0, 1].map((r) => {const y = 560 + r * 150; const s = 1 - r * 0.18;
        return Array.from({length: 6}).map((_, i) => {const x = 160 + i * 320 * s + r * 130;
          return <g key={r + '_' + i} opacity={1 - r * 0.28}><path d={`M ${x} ${y} L ${x + 120 * s} ${y - 120 * s} L ${x + 240 * s} ${y} Z`} fill={PAPERC} stroke={INK} strokeWidth={3} />
            <line x1={x + 120 * s} y1={y - 120 * s} x2={x + 120 * s} y2={y} stroke={INK} strokeWidth={2} opacity={0.4} /></g>;});})}
      <ellipse cx={960} cy={902} rx={150} ry={62} fill="url(#sglow)" opacity={0.85} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${938 + k * 22} 902 q ${-6 + Math.sin(frame * 0.3 + k) * 6} -42 6 -72`} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.75} />)}
    </g>
  ),
  // the battle line: distant ridge + smoke, spear tips, a wall of shields (scuta) across the front
  battleLine: ({frame}) => (
    <g>
      <path d="M 0 520 Q 480 440 960 500 T 1920 480 L 1920 700 L 0 700 Z" fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.5} />
      {[360, 980, 1500].map((x, i) => <g key={x} opacity={0.1}>{[0, 1, 2, 3].map((k) => <circle key={k} cx={x + Math.sin(frame * 0.02 + i) * 12 + (k % 2 ? 20 : -14)} cy={520 - k * 34} r={26 + k * 10} fill="#9a917f" />)}</g>)}
      <rect x={0} y={700} width={1920} height={380} fill={FLOOR} /><line x1={0} y1={700} x2={1920} y2={700} stroke={INK} strokeWidth={5} />
      {Array.from({length: 20}).map((_, i) => <line key={'s' + i} x1={80 + i * 96} y1={900} x2={80 + i * 96} y2={560 - (i % 3) * 30} stroke={INK} strokeWidth={3} opacity={0.45} />)}
      {Array.from({length: 9}).map((_, i) => {const x = 40 + i * 215; return <g key={i}><rect x={x} y={900} width={180} height={190} rx={18} fill={PAPERC} stroke={INK} strokeWidth={5} />
        <line x1={x + 90} y1={900} x2={x + 90} y2={1080} stroke={INK} strokeWidth={2} opacity={0.4} />
        <circle cx={x + 90} cy={985} r={20} fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.6} /></g>;})}
    </g>
  ),
  // a century in formation: ranks of helmeted marks + standards (the centurion's command)
  formation: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {[420, 960, 1500].map((x, i) => <g key={x}><line x1={x} y1={620} x2={x} y2={260} stroke={INK} strokeWidth={4} />
        {i === 1 ? <path d={`M ${x - 26} 300 q 26 -34 52 0 q -26 24 -52 0`} fill={GOLD} stroke={INK} strokeWidth={3} /> : <rect x={x - 22} y={290} width={44} height={50} fill={PAPERC} stroke={INK} strokeWidth={3} />}
        <circle cx={x} cy={250} r={10} fill={GOLD} stroke={INK} strokeWidth={2} /></g>)}
      {[0, 1, 2, 3].map((r) => Array.from({length: 12}).map((_, c) => {const x = 380 + c * 100; const y = 600 + r * 60; return <g key={r + '_' + c} opacity={0.55 - r * 0.1}><circle cx={x} cy={y} r={14} fill={PAPERC} stroke={INK} strokeWidth={2.5} /><path d={`M ${x - 14} ${y - 4} q 14 -16 28 0`} fill="none" stroke={INK} strokeWidth={2} /><line x1={x + 16} y1={y - 20} x2={x + 16} y2={y + 30} stroke={INK} strokeWidth={2} /></g>;}))}
    </g>
  ),
  // the aquila: the legion's eagle standard raised over the ranks — primus pilus / first cohort
  eagleField: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={290} rx={220} ry={260} fill="url(#sglow)" opacity={0.4} />
      <line x1={960} y1={820} x2={960} y2={250} stroke={INK} strokeWidth={8} />
      <circle cx={960} cy={300} r={46} fill="none" stroke={GOLD} strokeWidth={6} />
      <g><ellipse cx={960} cy={258} rx={26} ry={40} fill={GOLD} stroke={INK} strokeWidth={3} /><circle cx={960} cy={210} r={16} fill={GOLD} stroke={INK} strokeWidth={3} />
        <path d="M 960 244 L 798 204 L 868 262 Z" fill={GOLD} stroke={INK} strokeWidth={3} /><path d="M 960 244 L 1122 204 L 1052 262 Z" fill={GOLD} stroke={INK} strokeWidth={3} /></g>
      <rect x={916} y={372} width={88} height={50} fill={PAPERC} stroke={INK} strokeWidth={3} /><text x={960} y={408} textAnchor="middle" fontFamily={SANS} fontSize={26} fontWeight={800} fill={INK}>SPQR</text>
      {[0, 1, 2].map((r) => Array.from({length: 14}).map((_, c) => <circle key={r + '_' + c} cx={120 + c * 130} cy={650 + r * 54} r={11} fill={INK} opacity={0.3 - r * 0.07} />))}
    </g>
  ),
  // the triumph: a triumphal arch, crowds lining the street, falling laurel — the apex / the fall
  triumphStreet: ({frame}) => (
    <g>
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      <g>
        <rect x={620} y={200} width={680} height={520} fill={PAPERC} stroke={INK} strokeWidth={5} />
        <path d="M 720 720 L 720 460 Q 960 320 1200 460 L 1200 720" fill={FLOOR} stroke={INK} strokeWidth={5} />
        <rect x={620} y={150} width={680} height={66} fill={PAPERC} stroke={INK} strokeWidth={5} />
        <text x={960} y={198} textAnchor="middle" fontFamily={SANS} fontSize={38} fontWeight={800} fill={INK} opacity={0.7}>S · P · Q · R</text>
        {[840, 900, 1020, 1080].map((x) => <line key={x} x1={x} y1={150} x2={x} y2={112} stroke={INK} strokeWidth={3} />)}
        <rect x={928} y={96} width={64} height={26} fill={INK} opacity={0.7} />
      </g>
      {Array.from({length: 10}).map((_, i) => <g key={'l' + i} opacity={0.4}><circle cx={60 + i * 54} cy={820} r={20} fill={INK} /><rect x={60 + i * 54 - 20} y={840} width={40} height={40} fill={INK} /></g>)}
      {Array.from({length: 10}).map((_, i) => <g key={'r' + i} opacity={0.4}><circle cx={1390 + i * 54} cy={820} r={20} fill={INK} /><rect x={1390 + i * 54 - 20} y={840} width={40} height={40} fill={INK} /></g>)}
      {Array.from({length: 18}).map((_, i) => {const x = rnd(i * 3.1) * 1920; const y = ((rnd(i * 1.7) * 900 + (frame / 30) * (22 + rnd(i) * 22)) % 900); return <path key={i} d={`M ${x} ${y} q 6 -8 12 0 q -6 8 -12 0`} fill={GOLD} opacity={0.5} />;})}
    </g>
  ),
  // the imperial throne hall: tall columns, a purple drape, a dais, the throne
  throneHall: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      {[120, 360, 1560, 1800].map((x) => <g key={x}><rect x={x} y={160} width={70} height={680} fill={PAPERC} stroke={INK} strokeWidth={4} />{[0, 1, 2, 3, 4, 5].map((k) => <line key={k} x1={x + 12 + k * 9} y1={160} x2={x + 12 + k * 9} y2={840} stroke={INK} strokeWidth={1.5} opacity={0.3} />)}<rect x={x - 10} y={140} width={90} height={26} fill={PAPERC} stroke={INK} strokeWidth={4} /></g>)}
      <path d="M 700 160 Q 960 220 1220 160 L 1220 520 Q 960 470 700 520 Z" fill="#7a2d2d" stroke={INK} strokeWidth={3} opacity={0.45} />
      {[0, 1, 2].map((i) => <rect key={i} x={760 - i * 70} y={720 + i * 40} width={400 + i * 140} height={40} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
      <g><rect x={870} y={560} width={180} height={170} fill={PAPERC} stroke={INK} strokeWidth={5} /><rect x={858} y={518} width={204} height={56} fill={GOLD} stroke={INK} strokeWidth={4} opacity={0.6} /></g>
    </g>
  ),
  // the curia (Senate): tiered benches of toga'd senators facing an open floor
  curia: ({frame}) => (
    <g>
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      <rect x={300} y={120} width={1320} height={300} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.4} />
      {[0, 1, 2, 3].map((r) => {const y = 520 + r * 84; const inset = r * 70;
        return <g key={r}>
          <rect x={120 + inset} y={y} width={560 - inset} height={56} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.9} />
          <rect x={1240} y={y} width={560 - inset} height={56} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.9} />
          {Array.from({length: 6}).map((_, c) => <circle key={'l' + c} cx={170 + inset + c * 88} cy={y - 6} r={18} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}
          {Array.from({length: 6}).map((_, c) => <circle key={'r' + c} cx={1290 + c * 88} cy={y - 6} r={18} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.5} />)}
        </g>;})}
    </g>
  ),
  // the Praetorian camp (castra praetoria): a crenellated wall, crossed spears, helmeted guards
  praetorianCastra: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <rect x={0} y={300} width={1920} height={260} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {Array.from({length: 24}).map((_, i) => <rect key={i} x={i * 80} y={260} width={50} height={50} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
      {Array.from({length: 8}).map((_, r) => Array.from({length: 16}).map((_, c) => <rect key={r + '_' + c} x={20 + c * 120 + (r % 2 ? 60 : 0)} y={320 + r * 30} width={100} height={24} fill="none" stroke={LINE} strokeWidth={1.5} opacity={0.4} />))}
      {Array.from({length: 10}).map((_, i) => {const x = 120 + i * 190; return <g key={i} opacity={0.55}>
        <line x1={x - 20} y1={820} x2={x + 30} y2={600} stroke={INK} strokeWidth={3} /><line x1={x + 30} y1={820} x2={x - 20} y2={600} stroke={INK} strokeWidth={3} />
        <circle cx={x} cy={720} r={20} fill={PAPERC} stroke={INK} strokeWidth={3} /><path d={`M ${x - 20} 702 q 20 -30 40 0`} fill="none" stroke={INK} strokeWidth={3} /><line x1={x} y1={700} x2={x} y2={672} stroke="#7a2d2d" strokeWidth={6} /></g>;})}
    </g>
  ),
  // the banquet (triclinium): a fluted colonnade, a draped swag of cloth, low tiled-roof rooftops
  // beyond — a Roman feast hall. Deliberately NO high-rises / mullion grid (would be anachronistic).
  banquetHall: ({frame}) => (
    <g>
      {/* low tiled-roof rooftops glimpsed beyond the colonnade (sloped tile, never skyscrapers) */}
      <g opacity={0.5}>
        {[{x: 470, w: 250, h: 86}, {x: 720, w: 320, h: 120}, {x: 1040, w: 230, h: 78}, {x: 1230, w: 210, h: 104}].map((b, i) => {
          const top = 430 - b.h;
          return <g key={i}>
            <rect x={b.x} y={top} width={b.w} height={b.h} fill={PAPERC} stroke={INK} strokeWidth={3} />
            <path d={`M ${b.x - 16} ${top} L ${b.x + b.w / 2} ${top - 44} L ${b.x + b.w + 16} ${top} Z`} fill={PAPERC} stroke={INK} strokeWidth={3} />
            {Array.from({length: Math.floor(b.w / 26)}).map((_, k) => <line key={k} x1={b.x + 8 + k * 26} y1={top} x2={b.x + 8 + k * 26 - 8} y2={top - 22} stroke={INK} strokeWidth={1.5} opacity={0.4} />)}
          </g>;})}
      </g>
      {/* fluted columns framing the hall (open in the centre for the diners) */}
      {[120, 360, 1480, 1720].map((x) => <g key={x}>
        <rect x={x} y={150} width={66} height={572} fill={PAPERC} stroke={INK} strokeWidth={4} />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={x + 12 + k * 10} y1={150} x2={x + 12 + k * 10} y2={722} stroke={INK} strokeWidth={1.5} opacity={0.3} />)}
        <rect x={x - 10} y={130} width={86} height={24} fill={PAPERC} stroke={INK} strokeWidth={4} />
      </g>)}
      {/* draped swag of cloth hung across the upper colonnade */}
      <path d="M 186 166 Q 833 312 1480 166 L 1480 110 L 186 110 Z" fill="#7a2d2d" stroke={INK} strokeWidth={3} opacity={0.45} />
      {/* warm lamplight over the table */}
      <ellipse cx={970} cy={650} rx={360} ry={150} fill="url(#sglow)" opacity={0.7} />
      {/* floor */}
      <rect x={0} y={722} width={1920} height={358} fill={FLOOR} /><line x1={0} y1={722} x2={1920} y2={722} stroke={INK} strokeWidth={5} />
    </g>
  ),
  // --- Mafia / Cosa Nostra ---
  // tenement street corner at dusk: brick facade, lit windows, stoop steps, a lamppost glow — the block
  tenement: ({frame}) => (
    <g>
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      <rect x={1080} y={200} width={620} height={660} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {Array.from({length: 5}).map((_, r) => Array.from({length: 4}).map((_, c) => {const lit = (r * 4 + c + Math.floor(frame / 45)) % 5 === 0; return <rect key={r + '_' + c} x={1120 + c * 140} y={250 + r * 118} width={80} height={82} fill={lit ? GOLD : '#cbb48a'} stroke={INK} strokeWidth={3} opacity={lit ? 0.6 : 1} />;}))}
      {[0, 1, 2, 3].map((i) => <line key={'fe' + i} x1={1110} y1={332 + i * 130} x2={1360} y2={332 + i * 130} stroke={INK} strokeWidth={3} opacity={0.5} />)}
      <line x1={1120} y1={332} x2={1120} y2={852} stroke={INK} strokeWidth={3} opacity={0.5} />
      {[0, 1, 2].map((i) => <rect key={'st' + i} x={1040 - i * 40} y={800 + i * 20} width={220 + i * 80} height={22} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
      <line x1={360} y1={860} x2={360} y2={360} stroke={INK} strokeWidth={6} /><path d="M 360 360 q 0 -22 44 -22" fill="none" stroke={INK} strokeWidth={6} /><circle cx={408} cy={344} r={15} fill={GOLD} opacity={0.9} /><ellipse cx={408} cy={360} rx={150} ry={320} fill="url(#sglow)" opacity={0.4} />
    </g>
  ),
  // social-club interior: a saint picture, a tricolore stripe, an espresso machine, a warm hanging lamp
  clubInterior: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <g opacity={0.5}><rect x={200} y={220} width={70} height={220} fill="#4a7a4a" stroke={INK} strokeWidth={2} /><rect x={270} y={220} width={70} height={220} fill={PAPERC} stroke={INK} strokeWidth={2} /><rect x={340} y={220} width={70} height={220} fill="#a23a3a" stroke={INK} strokeWidth={2} /></g>
      <rect x={860} y={300} width={200} height={210} fill="#efe8d6" stroke={INK} strokeWidth={4} /><path d="M 860 300 q 100 -70 200 0" fill="#efe8d6" stroke={INK} strokeWidth={4} /><circle cx={960} cy={366} r={30} fill="none" stroke={INK} strokeWidth={3} /><path d="M 902 500 q 58 -54 116 0" fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
      <rect x={1360} y={520} width={420} height={40} fill={PAPERC} stroke={INK} strokeWidth={4} /><rect x={1480} y={410} width={180} height={110} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} /><rect x={1520} y={430} width={40} height={30} fill={INK} opacity={0.25} /><circle cx={1622} cy={442} r={12} fill={GOLD} opacity={0.6} /><line x1={1560} y1={520} x2={1560} y2={542} stroke={INK} strokeWidth={3} />
      <line x1={620} y1={140} x2={620} y2={230} stroke={INK} strokeWidth={3} /><path d="M 578 230 h 84 l -16 42 h -52 z" fill={PAPERC} stroke={INK} strokeWidth={3} /><ellipse cx={620} cy={320} rx={130} ry={70} fill="url(#sglow)" opacity={0.55} />
    </g>
  ),
  // dim back room for the card game / sit-down: paneled wall, a bottle shelf, a low lamp cone
  cardRoom: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      {[300, 1500].map((x) => <g key={x} opacity={0.5}><rect x={x} y={220} width={140} height={300} fill={PAPERC} stroke={INK} strokeWidth={3} />{[0, 1, 2].map((k) => <rect key={k} x={x + 20} y={260 + k * 90} width={100} height={8} fill={INK} opacity={0.3} />)}</g>)}
      <rect x={760} y={300} width={400} height={12} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[800, 860, 920, 1040, 1100].map((x) => <g key={x}><rect x={x} y={250} width={22} height={50} fill={PAPERC} stroke={INK} strokeWidth={2.5} /><rect x={x + 6} y={232} width={10} height={20} fill={PAPERC} stroke={INK} strokeWidth={2} /></g>)}
      <line x1={960} y1={140} x2={960} y2={250} stroke={INK} strokeWidth={3} /><path d="M 900 250 h 120 l -20 46 h -80 z" fill={PAPERC} stroke={INK} strokeWidth={4} /><ellipse cx={960} cy={540} rx={340} ry={170} fill="url(#sglow)" opacity={0.72} />
    </g>
  ),
  // Italian restaurant: wood wainscot, a chianti shelf, framed photos, warm lamplight — the sit-down / the hit
  restaurant: ({frame}) => (
    <g>
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <rect x={0} y={560} width={1920} height={200} fill="#d9c3a0" opacity={0.4} /><line x1={0} y1={560} x2={1920} y2={560} stroke={INK} strokeWidth={3} opacity={0.5} />
      {Array.from({length: 12}).map((_, i) => <line key={i} x1={i * 170} y1={560} x2={i * 170} y2={760} stroke={INK} strokeWidth={2} opacity={0.22} />)}
      <rect x={120} y={300} width={360} height={12} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[150, 210, 270, 330, 390].map((x) => <g key={x}><rect x={x} y={244} width={26} height={56} fill={PAPERC} stroke={INK} strokeWidth={2.5} /><rect x={x + 7} y={222} width={12} height={24} fill={PAPERC} stroke={INK} strokeWidth={2} /><rect x={x} y={280} width={26} height={20} fill="#a23a3a" opacity={0.4} /></g>)}
      {[1360, 1560].map((x) => <g key={x}><rect x={x} y={250} width={150} height={190} fill="#efe8d6" stroke={INK} strokeWidth={4} /><circle cx={x + 75} cy={322} r={28} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} /></g>)}
      <ellipse cx={960} cy={520} rx={360} ry={150} fill="url(#sglow)" opacity={0.6} />
    </g>
  ),
  // dark brick alley at night: converging walls, a caged door bulb, trash cans — making your bones / a hit
  alley: ({frame}) => (
    <g>
      <path d="M 0 120 L 620 300 L 620 820 L 0 1080 Z" fill="#cfc3ab" stroke={INK} strokeWidth={4} opacity={0.5} />
      <path d="M 1920 120 L 1300 300 L 1300 820 L 1920 1080 Z" fill="#cfc3ab" stroke={INK} strokeWidth={4} opacity={0.5} />
      <rect x={620} y={300} width={680} height={520} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {Array.from({length: 5}).map((_, r) => Array.from({length: 6}).map((_, c) => <rect key={r + '_' + c} x={620 + c * 114 + (r % 2 ? 57 : 0)} y={300 + r * 104} width={100} height={90} fill="none" stroke={LINE} strokeWidth={1.5} opacity={0.35} />))}
      <rect x={900} y={560} width={120} height={260} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <circle cx={960} cy={520} r={14} fill={GOLD} opacity={0.85} /><ellipse cx={960} cy={540} rx={150} ry={220} fill="url(#sglow)" opacity={0.4} />
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {[1170, 1272].map((x) => <g key={x}><rect x={x} y={700} width={90} height={120} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} /><ellipse cx={x + 45} cy={700} rx={46} ry={12} fill={PAPERC} stroke={INK} strokeWidth={3} /></g>)}
    </g>
  ),
  // the making ceremony: a ring of dim men, a low table, a single candle glow — omertà sworn on a saint
  ceremonyRoom: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      {Array.from({length: 7}).map((_, i) => {const x = 360 + i * 200; return <g key={i} opacity={0.38}><circle cx={x} cy={520} r={28} fill={INK} /><rect x={x - 30} y={548} width={60} height={230} fill={INK} /></g>;})}
      <rect x={760} y={640} width={400} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <ellipse cx={960} cy={600} rx={240} ry={150} fill="url(#sglow)" opacity={0.6} />
    </g>
  ),
  // the waterfront: harbor water, a gantry crane, stacked shipping containers, a bollard — the rackets / docks
  waterfront: ({frame}) => (
    <g>
      <rect x={0} y={420} width={1920} height={180} fill="#b9c6cc" opacity={0.4} />
      {Array.from({length: 5}).map((_, i) => <path key={i} d={`M 0 ${470 + i * 26} q 480 12 960 0 t 960 0`} fill="none" stroke={INK} strokeWidth={1.5} opacity={0.14} />)}
      <path d="M 1360 560 L 1820 560 L 1740 620 L 1440 620 Z" fill={PAPERC} stroke={INK} strokeWidth={4} opacity={0.7} /><line x1={1520} y1={560} x2={1520} y2={440} stroke={INK} strokeWidth={4} opacity={0.6} />
      <g><line x1={300} y1={760} x2={300} y2={220} stroke={INK} strokeWidth={6} /><line x1={560} y1={760} x2={560} y2={220} stroke={INK} strokeWidth={6} /><line x1={260} y1={220} x2={720} y2={220} stroke={INK} strokeWidth={6} /><line x1={640} y1={220} x2={640} y2={380 + Math.sin(frame * 0.05) * 16} stroke={INK} strokeWidth={2} /><rect x={616} y={380 + Math.sin(frame * 0.05) * 16} width={48} height={40} fill={PAPERC} stroke={INK} strokeWidth={3} /></g>
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      {[{x: 760, y: 600, c: '#7a5a3a'}, {x: 960, y: 600, c: '#4a6a7a'}, {x: 860, y: 480, c: '#6a4a4a'}].map((b, i) => <g key={i}><rect x={b.x} y={b.y} width={190} height={160} fill={b.c} stroke={INK} strokeWidth={4} opacity={0.3} /><rect x={b.x} y={b.y} width={190} height={160} fill="none" stroke={INK} strokeWidth={4} />{Array.from({length: 9}).map((_, k) => <line key={k} x1={b.x + 18 + k * 19} y1={b.y} x2={b.x + 18 + k * 19} y2={b.y + 160} stroke={INK} strokeWidth={1.5} opacity={0.3} />)}</g>)}
      <path d="M 1360 760 q 0 -46 40 -46 q 40 0 40 46 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
    </g>
  ),
  // the boss's back-office / study: blinded window, a framed picture, a wall sconce glow
  donStudy: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={220} y={200} width={420} height={360} fill="#2a313a" stroke={INK} strokeWidth={4} />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={220} y1={240 + i * 38} x2={640} y2={240 + i * 38} stroke={PAPERC} strokeWidth={4} opacity={0.5} />)}
      <rect x={1360} y={260} width={200} height={150} fill="#efe8d6" stroke={INK} strokeWidth={4} /><path d="M 1400 384 q 60 -50 120 0" fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
      <ellipse cx={1660} cy={360} rx={90} ry={160} fill="url(#sglow)" opacity={0.4} />
    </g>
  ),
  // the Commission room: a dark paneled hall, a low chandelier cone over a round table (with roundTable prop)
  commissionRoom: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <rect x={0} y={140} width={1920} height={520} fill="#3a332a" opacity={0.22} />
      {Array.from({length: 8}).map((_, i) => <rect key={i} x={60 + i * 230} y={200} width={180} height={360} fill="none" stroke={INK} strokeWidth={2} opacity={0.28} />)}
      <line x1={960} y1={140} x2={960} y2={240} stroke={INK} strokeWidth={3} /><path d="M 880 240 h 160 l -30 60 h -100 z" fill={PAPERC} stroke={INK} strokeWidth={4} /><ellipse cx={960} cy={620} rx={540} ry={220} fill="url(#sglow)" opacity={0.5} />
    </g>
  ),
  // the count room: a naked bulb over the dark, a small barred window, a shelf — the skim
  countRoomBg: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <line x1={960} y1={0} x2={960} y2={150} stroke={INK} strokeWidth={3} /><circle cx={960} cy={166} r={16} fill={GOLD} opacity={0.9} /><path d="M 960 166 L 640 800 L 1280 800 Z" fill="url(#sglow)" opacity={0.5} />
      <rect x={240} y={240} width={180} height={140} fill="#2a313a" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((i) => <line key={i} x1={288 + i * 48} y1={240} x2={288 + i * 48} y2={380} stroke={INK} strokeWidth={3} />)}
      <rect x={1480} y={360} width={300} height={12} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // the courtroom: a raised judge's bench, a seal, a flag, a gallery rail — RICO / the stand
  courtroomBg: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <rect x={620} y={520} width={680} height={300} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={700} y={440} width={520} height={90} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <circle cx={960} cy={360} r={70} fill={PAPERC} stroke={INK} strokeWidth={4} /><circle cx={960} cy={360} r={48} fill="none" stroke={INK} strokeWidth={2} /><path d="M 960 320 l 16 40 l -16 40 l -16 -40 Z" fill={GOLD} stroke={INK} strokeWidth={2} opacity={0.6} />
      <line x1={1360} y1={820} x2={1360} y2={300} stroke={INK} strokeWidth={5} /><path d="M 1360 320 L 1500 342 L 1360 402 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
      <rect x={0} y={780} width={1920} height={16} fill={PAPERC} stroke={INK} strokeWidth={4} />{Array.from({length: 20}).map((_, i) => <line key={i} x1={60 + i * 98} y1={796} x2={60 + i * 98} y2={820} stroke={INK} strokeWidth={3} />)}
    </g>
  ),
  // the cell: brick wall, a bunk, a small barred window with moonlight (bars are the cellBars prop, in front)
  cellBlock: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {Array.from({length: 6}).map((_, r) => Array.from({length: 12}).map((_, c) => <rect key={r + '_' + c} x={c * 170 + (r % 2 ? 85 : 0)} y={200 + r * 104} width={150} height={90} fill="none" stroke={LINE} strokeWidth={2} opacity={0.55} />))}
      <rect x={1380} y={240} width={200} height={160} fill="#2a313a" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((i) => <line key={i} x1={1430 + i * 50} y1={240} x2={1430 + i * 50} y2={400} stroke={INK} strokeWidth={3} />)}<ellipse cx={1480} cy={320} rx={150} ry={190} fill="url(#sglow)" opacity={0.3} />
      <rect x={200} y={640} width={360} height={40} fill={PAPERC} stroke={INK} strokeWidth={4} /><rect x={200} y={680} width={24} height={140} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={536} y={680} width={24} height={140} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {/* the cell door: a load-bearing element at scene-center so a mid-frame camera crop is never
          near-blank paper — heavy plank door, hinges, a small barred slot, and the deadbolt.
          Fill is a dark weathered-wood tone (NOT PAPERC): after the 2026-07 bright-palette pass the
          old paper-white door left a tight insert crop on it reading as a blank near-white frame
          (reviewer f_030). Dark mass here keeps every crop/fade of this scene from washing out.
          Plank grooves, the barred slot, and the steel deadbolt are lightened so they read on wood. */}
      <rect x={820} y={260} width={280} height={560} fill="#544636" stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={820 + i * 70} y1={260} x2={820 + i * 70} y2={820} stroke="#7d6e58" strokeWidth={2} opacity={0.6} />)}
      <rect x={870} y={340} width={180} height={70} fill="none" stroke="#9a8a72" strokeWidth={3} />{[0, 1, 2, 3].map((i) => <line key={i} x1={890 + i * 40} y1={340} x2={890 + i * 40} y2={410} stroke="#9a8a72" strokeWidth={2.5} />)}
      <rect x={1050} y={540} width={44} height={22} rx={3} fill="#8a93a0" stroke={INK} strokeWidth={3} /><circle cx={1030} cy={551} r={7} fill="#8a93a0" stroke={INK} strokeWidth={2.5} />
      <rect x={806} y={244} width={14} height={590} fill={INK} opacity={0.5} /><rect x={806} y={280} width={14} height={30} fill={INK} opacity={0.7} /><rect x={806} y={760} width={14} height={30} fill={INK} opacity={0.7} />
    </g>
  ),
  // the Feds' listening post: a wall of pinned surveillance photos + red string, a blinded window (reelDeck prop)
  wiretapRoom: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={1180} y={140} width={680} height={520} fill="#d8cdb4" stroke={INK} strokeWidth={5} />
      {[{x: 1220, y: 190}, {x: 1400, y: 210}, {x: 1600, y: 180}, {x: 1300, y: 400}, {x: 1540, y: 420}].map((p, i) => <g key={i}><rect x={p.x} y={p.y} width={130} height={150} fill={PAPERC} stroke={INK} strokeWidth={3} /><circle cx={p.x + 65} cy={p.y + 62} r={26} fill="none" stroke={INK} strokeWidth={2} /><circle cx={p.x + 65} cy={p.y + 16} r={8} fill="#c0392b" opacity={0.7} /></g>)}
      <path d="M 1285 252 L 1465 272 L 1665 242 L 1365 462 L 1605 482" fill="none" stroke="#c0392b" strokeWidth={2} opacity={0.55} />
      <rect x={140} y={200} width={360} height={300} fill="#2a313a" stroke={INK} strokeWidth={4} />{Array.from({length: 8}).map((_, i) => <line key={i} x1={140} y1={236 + i * 34} x2={500} y2={236 + i * 34} stroke={PAPERC} strokeWidth={4} opacity={0.5} />)}
    </g>
  ),
  // --- Dynasty / generational wealth ---
  // the estate seen from the gates: a columned mansion on a rise, hedgerows, a fountain, dusk glow
  estateGrounds: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={330} rx={520} ry={240} fill="url(#sglow)" opacity={0.5} />
      {/* mansion: center block + portico + two wings, roof balustrade */}
      <g opacity={0.92}>
        <rect x={560} y={330} width={240} height={180} fill={PAPERC} stroke={INK} strokeWidth={4} />
        <rect x={1120} y={330} width={240} height={180} fill={PAPERC} stroke={INK} strokeWidth={4} />
        <rect x={790} y={280} width={340} height={230} fill={PAPERC} stroke={INK} strokeWidth={4} />
        <path d="M 770 280 L 960 200 L 1150 280 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
        {[830, 890, 1030, 1090].map((x) => <line key={x} x1={x} y1={510} x2={x} y2={330} stroke={INK} strokeWidth={3.5} />)}
        {Array.from({length: 4}).map((_, c) => <rect key={'wl' + c} x={584 + c * 56} y={366} width={30} height={44} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.7} />)}
        {Array.from({length: 4}).map((_, c) => <rect key={'wr' + c} x={1144 + c * 56} y={366} width={30} height={44} fill="none" stroke={INK} strokeWidth={2.5} opacity={0.7} />)}
        {[584, 640, 1224, 1280].map((x) => <rect key={'w2' + x} x={x} y={440} width={30} height={44} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.55} />)}
        {Array.from({length: 16}).map((_, i) => <line key={'b' + i} x1={572 + i * 50} y1={330} x2={572 + i * 50} y2={310} stroke={INK} strokeWidth={2.5} opacity={0.6} />)}
        <line x1={560} y1={310} x2={1360} y2={310} stroke={INK} strokeWidth={3} opacity={0.6} />
      </g>
      {/* driveway sweeping to the portico + fountain */}
      <path d="M 960 510 L 900 840 L 1200 840 L 1000 510 Z" fill={FLOOR} stroke={INK} strokeWidth={3} opacity={0.6} />
      <g><ellipse cx={960} cy={640} rx={110} ry={30} fill={PAPERC} stroke={INK} strokeWidth={4} /><line x1={960} y1={636} x2={960} y2={560} stroke={INK} strokeWidth={4} /><path d={`M 940 ${566 + Math.sin(frame * 0.15) * 3} q 20 -26 40 0`} fill="none" stroke={INK} strokeWidth={3} opacity={0.7} /></g>
      {/* hedgerows */}
      {[240, 430, 1490, 1680].map((x, i) => <g key={x}><path d={`M ${x - 90} 840 q 90 -${120 + (i % 2) * 26} 180 0 Z`} fill={PAPERC} stroke={INK} strokeWidth={4} /></g>)}
    </g>
  ),
  // the portrait hall: dark panelled wall, gilt-framed ancestors, ONE EMPTY FRAME waiting (the signature)
  portraitWall: ({frame}) => <PortraitWallArt frame={frame} />,
  // the loop-close payoff (t29): the SAME hall, but the fifth frame now HOLDS a portrait —
  // "your frame is no longer empty" made visible. t02/t15 keep portraitWall (empty).
  portraitWallFilled: ({frame}) => <PortraitWallArt frame={frame} filled />,
  // the yacht deck: railing over open sea, sun glitter, superstructure + mast lines — nowhere near land
  seaDeck: ({frame}) => (
    <g>
      {/* sea + horizon */}
      <rect x={0} y={470} width={1920} height={310} fill="#dfe7e4" opacity={0.8} />
      <line x1={0} y1={470} x2={1920} y2={470} stroke={INK} strokeWidth={2.5} opacity={0.5} />
      {Array.from({length: 14}).map((_, i) => {const x = (rnd(i * 2.3) * 1920 + frame * (0.4 + rnd(i) * 0.5)) % 1920; return <line key={i} x1={x} y1={510 + rnd(i * 1.7) * 220} x2={x + 46} y2={510 + rnd(i * 1.7) * 220} stroke={GOLD} strokeWidth={3} opacity={0.5} />;})}
      <circle cx={1520} cy={330} r={70} fill={GOLD} opacity={0.35} />
      {/* superstructure block + raked mast */}
      <g opacity={0.9}>
        <rect x={60} y={430} width={430} height={350} rx={14} fill={PAPERC} stroke={INK} strokeWidth={4} />
        {[110, 230, 350].map((x) => <rect key={x} x={x} y={480} width={90} height={50} rx={10} fill="#2a313a" stroke={INK} strokeWidth={3} opacity={0.75} />)}
        <line x1={430} y1={430} x2={560} y2={250} stroke={INK} strokeWidth={4} /><line x1={560} y1={250} x2={330} y2={300} stroke={INK} strokeWidth={3} opacity={0.7} />
      </g>
      {/* deck + railing */}
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      {Array.from({length: 20}).map((_, i) => <line key={i} x1={i * 101} y1={780} x2={i * 101} y2={646} stroke={INK} strokeWidth={3.5} opacity={0.85} />)}
      <line x1={0} y1={646} x2={1920} y2={646} stroke={INK} strokeWidth={5} /><line x1={0} y1={712} x2={1920} y2={712} stroke={INK} strokeWidth={3} opacity={0.7} />
      {Array.from({length: 10}).map((_, i) => <line key={'p' + i} x1={40 + i * 210} y1={800 + (i % 2) * 30} x2={160 + i * 210} y2={800 + (i % 2) * 30} stroke={INK} strokeWidth={2} opacity={0.25} />)}
    </g>
  ),
  // the gala ballroom: chandelier, arched windows with swags, dim guests holding flutes
  ballroom: ({frame}) => (
    <g>
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      {/* arched windows + drape swags */}
      {[240, 730, 1220].map((x) => <g key={x}>
        <path d={`M ${x} 660 L ${x} 300 Q ${x + 130} 190 ${x + 260} 300 L ${x + 260} 660 Z`} fill="#2a313a" stroke={INK} strokeWidth={4} opacity={0.5} />
        <line x1={x + 130} y1={230} x2={x + 130} y2={660} stroke={PAPERC} strokeWidth={4} opacity={0.5} />
        <line x1={x} y1={430} x2={x + 260} y2={430} stroke={PAPERC} strokeWidth={4} opacity={0.5} />
        <path d={`M ${x - 20} 300 Q ${x + 130} 400 ${x + 280} 300 L ${x + 280} 250 L ${x - 20} 250 Z`} fill="#7a2d2d" stroke={INK} strokeWidth={3} opacity={0.4} />
      </g>)}
      {/* chandelier */}
      <g>
        <line x1={1700} y1={0} x2={1700} y2={170} stroke={INK} strokeWidth={4} />
        <ellipse cx={1700} cy={240} rx={170} ry={130} fill="url(#sglow)" opacity={0.9} />
        {[0, 1, 2].map((t) => <g key={t}>{Array.from({length: 5 + t * 2}).map((_, i) => {const n = 5 + t * 2; const dx = (i - (n - 1) / 2) * (150 - t * 40) / n; return <g key={i}><line x1={1700} y1={170} x2={1700 + dx} y2={200 + t * 42} stroke={INK} strokeWidth={2} opacity={0.6} /><circle cx={1700 + dx} cy={208 + t * 42} r={7} fill={GOLD} stroke={INK} strokeWidth={2} /></g>;})}</g>)}
      </g>
      {/* dim guests with champagne flutes */}
      {[140, 420, 620, 1060, 1320, 1560].map((x, i) => <g key={x} opacity={0.4}>
        <circle cx={x} cy={720 - (i % 2) * 14} r={24} fill={INK} />
        <path d={`M ${x - 30} ${744 - (i % 2) * 14} q 30 -22 60 0 L ${x + 34} 860 L ${x - 34} 860 Z`} fill={INK} />
        <line x1={x + 40} y1={730 - (i % 2) * 14} x2={x + 52} y2={700 - (i % 2) * 14} stroke={INK} strokeWidth={3} />
        <path d={`M ${x + 48} ${700 - (i % 2) * 14} l 4 -18 l 10 0 l 4 18 Z`} fill="none" stroke={INK} strokeWidth={2.5} />
      </g>)}
    </g>
  ),
  // the family vault: a great circular trust-vault door in a wall of deed boxes — paper, not gold
  vaultHall: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      {/* deed-box walls flanking the door */}
      {[0, 1400].map((x0) => <g key={x0}>{Array.from({length: 7}).map((_, r) => Array.from({length: 4}).map((_, c) => (
        <g key={r + '_' + c}><rect x={x0 + 40 + c * 120} y={180 + r * 92} width={104} height={76} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.8} />
        <circle cx={x0 + 92 + c * 120} cy={218 + r * 92} r={6} fill="none" stroke={INK} strokeWidth={2} opacity={0.7} /></g>)))}</g>)}
      {/* the circular vault door, slightly lit */}
      <ellipse cx={960} cy={520} rx={330} ry={330} fill="url(#sglow)" opacity={0.4} />
      <circle cx={960} cy={520} r={300} fill={PAPERC} stroke={INK} strokeWidth={6} />
      <circle cx={960} cy={520} r={252} fill="none" stroke={INK} strokeWidth={3.5} opacity={0.7} />
      <circle cx={960} cy={520} r={120} fill="none" stroke={INK} strokeWidth={4} />
      {[0, 60, 120].map((a) => {const rad = ((a + frame * 0.1) * Math.PI) / 180; const c = Math.cos(rad), s = Math.sin(rad); return <line key={a} x1={960 - c * 116} y1={520 - s * 116} x2={960 + c * 116} y2={520 + s * 116} stroke={INK} strokeWidth={5} />;})}
      {Array.from({length: 12}).map((_, i) => {const rad = (i * 30 * Math.PI) / 180; return <circle key={i} cx={960 + Math.cos(rad) * 276} cy={520 + Math.sin(rad) * 276} r={10} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.8} />;})}
      <rect x={1250} y={430} width={40} height={180} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} />
    </g>
  ),
  // --- Samurai / feudal Japan ---
  // the rice paddy where you start (and where the sword ends): terraced water, a distant castle keep
  riceField: ({frame}) => (
    <g>
      <path d="M 0 470 Q 400 400 820 460 T 1920 440 L 1920 640 L 0 640 Z" fill="#d9cba8" stroke={INK} strokeWidth={3} opacity={0.4} />
      {/* the lord's castle keep on the far hill (upturned-eave tenshu silhouette) */}
      <g opacity={0.7} transform="translate(1480 250)">
        <rect x={0} y={130} width={190} height={100} fill={PAPERC} stroke={INK} strokeWidth={3} />
        <path d="M -18 130 Q 95 92 208 130 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
        <rect x={40} y={64} width={110} height={66} fill={PAPERC} stroke={INK} strokeWidth={3} />
        <path d="M 22 64 Q 95 34 168 64 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
        <path d="M 40 40 Q 95 22 150 40 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
      </g>
      {/* flooded paddy + curved terrace lines + rice stalks */}
      <rect x={0} y={640} width={1920} height={440} fill="#e5e9d6" />
      <line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3, 4].map((r) => <path key={r} d={`M 0 ${700 + r * 82} Q 960 ${678 + r * 82} 1920 ${700 + r * 82}`} fill="none" stroke={INK} strokeWidth={2} opacity={0.32} />)}
      {Array.from({length: 40}).map((_, i) => <line key={i} x1={30 + i * 48} y1={700 + (i % 5) * 68} x2={30 + i * 48} y2={674 + (i % 5) * 68} stroke="#7a8a4a" strokeWidth={3} opacity={0.5} />)}
    </g>
  ),
  // the dojo: a shoji back wall, a plank floor, a rack of practice weapons — training, the recruit
  dojo: ({frame}) => (
    <g>
      <rect x={180} y={140} width={1560} height={520} fill="#f2ecdd" stroke={INK} strokeWidth={4} />
      {Array.from({length: 8}).map((_, c) => <line key={'v' + c} x1={180 + (c + 1) * 173} y1={140} x2={180 + (c + 1) * 173} y2={660} stroke={INK} strokeWidth={2} opacity={0.5} />)}
      {[0, 1, 2].map((r) => <line key={'h' + r} x1={180} y1={140 + (r + 1) * 130} x2={1740} y2={140 + (r + 1) * 130} stroke={INK} strokeWidth={2} opacity={0.5} />)}
      <rect x={0} y={660} width={1920} height={420} fill="#e7d8b8" /><line x1={0} y1={660} x2={1920} y2={660} stroke={INK} strokeWidth={5} />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={0} y1={720 + i * 40} x2={1920} y2={720 + i * 40} stroke={INK} strokeWidth={1.5} opacity={0.18} />)}
      {/* weapon rack of bokken / spears */}
      <g transform="translate(1560 300)">
        <rect x={0} y={0} width={210} height={26} fill={PAPERC} stroke={INK} strokeWidth={3} />
        <rect x={0} y={310} width={210} height={26} fill={PAPERC} stroke={INK} strokeWidth={3} />
        {[26, 78, 130, 182].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={336} stroke={INK} strokeWidth={4} />)}
      </g>
    </g>
  ),
  // the battle: tall nobori war-banners, a burning castle in the distance, a hedge of spear tips
  sengokuField: ({frame}) => (
    <g>
      <ellipse cx={1560} cy={430} rx={260} ry={150} fill="url(#sglow)" opacity={0.5} />
      {[1480, 1600].map((x, i) => <g key={x} opacity={0.16}>{[0, 1, 2].map((k) => <circle key={k} cx={x + Math.sin(frame * 0.02 + i) * 12} cy={430 - k * 46} r={34 + k * 20} fill={INK} />)}</g>)}
      <path d="M 0 560 Q 480 490 960 540 T 1920 520 L 1920 720 L 0 720 Z" fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.45} />
      {[170, 410, 1360, 1620].map((x, i) => <g key={x}>
        <line x1={x} y1={760} x2={x} y2={200} stroke={INK} strokeWidth={5} />
        <rect x={x} y={210} width={64} height={300} fill={i % 2 ? GOLD : '#b23b3b'} stroke={INK} strokeWidth={3} opacity={0.8} />
        <circle cx={x + 32} cy={272} r={18} fill={PAPERC} stroke={INK} strokeWidth={3} /></g>)}
      {Array.from({length: 18}).map((_, i) => <line key={i} x1={70 + i * 104} y1={860} x2={70 + i * 104} y2={582 - (i % 3) * 26} stroke={INK} strokeWidth={3} opacity={0.5} />)}
      <rect x={0} y={720} width={1920} height={360} fill={FLOOR} /><line x1={0} y1={720} x2={1920} y2={720} stroke={INK} strokeWidth={5} />
    </g>
  ),
  // the great castle gate: a sloped stone base (ishigaki), a curved-roof gatehouse, heavy doors
  castleGate: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      <path d="M 360 840 L 460 430 L 1460 430 L 1560 840 Z" fill="#d8ccb0" stroke={INK} strokeWidth={4} />
      {[500, 570, 640, 710, 780].map((y) => <line key={y} x1={480} y1={y} x2={1440} y2={y} stroke={INK} strokeWidth={2} opacity={0.28} />)}
      <rect x={820} y={560} width={280} height={280} fill="#4a3d2a" stroke={INK} strokeWidth={4} />
      <line x1={960} y1={560} x2={960} y2={840} stroke={INK} strokeWidth={3} opacity={0.6} />
      {[880, 1040].map((x) => <circle key={x} cx={x} cy={700} r={7} fill={GOLD} opacity={0.6} />)}
      <rect x={440} y={306} width={1040} height={124} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 380 306 Q 500 214 700 230 L 1220 230 Q 1420 214 1540 306 Z" fill="#7a2d2d" stroke={INK} strokeWidth={4} opacity={0.55} />
      <path d="M 380 306 Q 424 288 388 252 M 1540 306 Q 1496 288 1532 252" fill="none" stroke={INK} strokeWidth={5} />
    </g>
  ),
  // the tea room: tatami, a tokonoma alcove with a hanging scroll + a single flower — politics, the order
  teaRoom: ({frame}) => (
    <g>
      <rect x={0} y={120} width={1920} height={640} fill="#efe7d4" />
      <rect x={230} y={200} width={300} height={520} fill="#e2d7bd" stroke={INK} strokeWidth={4} />
      <rect x={330} y={250} width={100} height={300} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((k) => <line key={k} x1={352} y1={292 + k * 74} x2={408} y2={292 + k * 74} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <line x1={380} y1={632} x2={380} y2={560} stroke="#5a7a3a" strokeWidth={3} /><circle cx={380} cy={550} r={12} fill={GOLD} opacity={0.7} stroke={INK} strokeWidth={2} />
      <rect x={0} y={760} width={1920} height={320} fill="#e7dcc0" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      {Array.from({length: 5}).map((_, c) => <line key={'v' + c} x1={(c + 1) * 384} y1={760} x2={(c + 1) * 384} y2={1080} stroke={INK} strokeWidth={2} opacity={0.28} />)}
      {[864, 984].map((y) => <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke={INK} strokeWidth={2} opacity={0.28} />)}
    </g>
  ),
  // the lord's audience hall: a big clan crest (mon), a raised dais (jodan), rows of kneeling retainers
  lordHall: ({frame}) => (
    <g>
      <rect x={0} y={120} width={1920} height={640} fill="#efe6d1" />
      <circle cx={960} cy={324} r={112} fill="none" stroke={INK} strokeWidth={5} opacity={0.5} />
      <circle cx={960} cy={324} r={70} fill={GOLD} stroke={INK} strokeWidth={4} opacity={0.32} />
      <path d="M 960 262 L 992 324 L 960 386 L 928 324 Z" fill="none" stroke={INK} strokeWidth={4} opacity={0.6} />
      <rect x={0} y={760} width={1920} height={320} fill="#e5dabc" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      {[0, 1].map((i) => <rect key={i} x={700 - i * 90} y={648 + i * 60} width={520 + i * 180} height={60} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <circle key={'L' + r + '_' + c} cx={180 + c * 118} cy={844 + r * 68} r={13} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.5 - r * 0.1} />))}
      {[0, 1, 2].map((r) => [0, 1, 2, 3].map((c) => <circle key={'R' + r + '_' + c} cx={1310 + c * 118} cy={844 + r * 68} r={13} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.5 - r * 0.1} />))}
    </g>
  ),
  // the top of the keep (donjon): upturned eaves overhead, a balcony rail, the domain spread below
  keepTop: ({frame}) => (
    <g>
      {Array.from({length: 14}).map((_, i) => <path key={i} d={`M ${80 + i * 130} 620 l 46 -26 l 46 26 Z`} fill={PAPERC} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <path d="M 0 660 Q 960 630 1920 660 L 1920 780 L 0 780 Z" fill="#d9cba8" stroke={INK} strokeWidth={2} opacity={0.4} />
      <path d="M 120 224 Q 500 128 960 156 Q 1420 128 1800 224 L 1800 262 Q 960 214 120 262 Z" fill="#7a2d2d" stroke={INK} strokeWidth={4} opacity={0.55} />
      <path d="M 120 224 Q 78 192 38 150 M 1800 224 Q 1842 192 1882 150" fill="none" stroke={INK} strokeWidth={5} />
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      <line x1={0} y1={782} x2={1920} y2={782} stroke={INK} strokeWidth={4} />
      {Array.from({length: 24}).map((_, i) => <line key={i} x1={40 + i * 80} y1={782} x2={40 + i * 80} y2={820} stroke={INK} strokeWidth={3} />)}
    </g>
  ),
  // the seppuku garden: raked gravel, a single pine, a white mat — the ordered death (the midpoint)
  seppukuGarden: ({frame}) => (
    <g>
      <rect x={0} y={120} width={1920} height={520} fill="#e9e0cc" /><line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={4} opacity={0.6} />
      <g transform="translate(1500 300)"><line x1={0} y1={340} x2={0} y2={150} stroke={INK} strokeWidth={8} />
        {[0, 1, 2].map((k) => <g key={k}><path d={`M -8 ${190 + k * 58} q -70 -22 -122 4`} fill="none" stroke="#5a6a3a" strokeWidth={5} opacity={0.6} /><path d={`M 8 ${190 + k * 58} q 70 -22 122 4`} fill="none" stroke="#5a6a3a" strokeWidth={5} opacity={0.6} /></g>)}</g>
      <rect x={0} y={640} width={1920} height={440} fill="#ece5d2" />
      {Array.from({length: 9}).map((_, r) => <line key={r} x1={0} y1={700 + r * 44} x2={1920} y2={700 + r * 44} stroke={INK} strokeWidth={1.5} opacity={0.2} />)}
      <rect x={740} y={846} width={440} height={150} fill="#f6f2e8" stroke={INK} strokeWidth={4} />
      {/* the short blade on a small stand beside the mat */}
      <rect x={1210} y={812} width={96} height={22} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <path d="M 1224 812 q 60 -8 118 -2" fill="none" stroke={INK} strokeWidth={4} />
    </g>
  ),
  // the shogun's grand hall (Edo): gilded folding screens, a high tiered dais, long rows of vassals
  shogunHall: ({frame}) => (
    <g>
      <rect x={0} y={120} width={1920} height={640} fill="#e9d8a6" opacity={0.6} />
      {[0, 1, 2, 3, 4, 5].map((c) => <line key={c} x1={c * 320} y1={120} x2={c * 320} y2={760} stroke={INK} strokeWidth={3} opacity={0.4} />)}
      {[300, 780, 1300, 1700].map((x, i) => <path key={x} d={`M ${x} ${268 + i * 18} q 60 -42 120 0 q 44 -30 92 6 q 22 40 -38 46 l -184 0 q -42 -30 8 -52 Z`} fill={GOLD} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <rect x={0} y={760} width={1920} height={320} fill="#e2d6b6" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <rect key={i} x={640 - i * 130} y={600 + i * 54} width={640 + i * 260} height={54} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
      {[0, 1, 2, 3].map((r) => Array.from({length: 6}).map((_, c) => <circle key={r + '_' + c} cx={200 + c * 260 + (r % 2 ? 60 : 0)} cy={882 + r * 50} r={12} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.5 - r * 0.08} />))}
    </g>
  ),
  // the rice broker's counting house: a noren, a wall of rice bales, an abacus + stacked koban gold
  merchantHouse: ({frame}) => (
    <g>
      <rect x={0} y={120} width={1920} height={70} fill="#5a6b7a" opacity={0.5} />
      {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={i * 400 + 200} y1={190} x2={i * 400 + 200} y2={120} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      {[0, 1, 2, 3].map((r) => Array.from({length: 4}).map((_, c) => <g key={r + '_' + c}>
        <ellipse cx={1360 + c * 132} cy={782 - r * 90} rx={64} ry={44} fill="#e3d6ad" stroke={INK} strokeWidth={3} />
        <line x1={1360 + c * 132 - 64} y1={782 - r * 90} x2={1360 + c * 132 + 64} y2={782 - r * 90} stroke={INK} strokeWidth={2} opacity={0.4} /></g>))}
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <rect x={360} y={720} width={360} height={90} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={390} y={740} width={180} height={54} fill="#e7d8b8" stroke={INK} strokeWidth={3} />
      {[0, 1, 2, 3].map((r) => <line key={r} x1={390} y1={748 + r * 12} x2={570} y2={748 + r * 12} stroke={INK} strokeWidth={1.5} opacity={0.5} />)}
      {[0, 1, 2, 3, 4].map((c) => <circle key={c} cx={410 + c * 36} cy={766} r={6} fill={INK} opacity={0.6} />)}
      {[0, 1, 2].map((k) => <ellipse key={k} cx={648} cy={790 - k * 14} rx={30} ry={12} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.85} />)}
    </g>
  ),
  // --- cartel / narco (mexican_cartel) ---
  // the border desert: heat sky, distant mesa, a tall receding border fence, a dirt road, cacti —
  // the halcón lookout on the edge of town, the crossing, and the cyclical loop close
  borderDesert: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={620} fill="#e9d9b6" opacity={0.5} />
      {/* distant mesa / hills */}
      <path d="M 0 560 L 260 470 L 520 540 L 560 470 L 760 560 Z" fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.55} />
      <path d="M 1180 560 L 1400 460 L 1520 520 L 1700 450 L 1920 560 Z" fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.55} />
      {/* the border fence receding to a vanishing point */}
      {Array.from({length: 22}).map((_, i) => {const t = i / 21; const x = 940 + (i - 4) * (70 - t * 40); const h = 150 - t * 90; return <line key={i} x1={x} y1={620} x2={x} y2={620 - h} stroke={INK} strokeWidth={3} opacity={0.5 - t * 0.2} />;})}
      <line x1={620} y1={556} x2={1920} y2={470} stroke={INK} strokeWidth={3} opacity={0.4} />
      <line x1={620} y1={600} x2={1920} y2={520} stroke={INK} strokeWidth={3} opacity={0.4} />
      <rect x={0} y={620} width={1920} height={460} fill={FLOOR} /><line x1={0} y1={620} x2={1920} y2={620} stroke={INK} strokeWidth={5} />
      {/* dirt road */}
      <path d="M 760 1080 L 900 620 L 1000 620 L 1160 1080 Z" fill="#e0d4bb" stroke={INK} strokeWidth={2} opacity={0.6} />
      {/* saguaro cacti */}
      {[220, 1600].map((x, i) => <g key={x}><line x1={x} y1={880} x2={x} y2={660} stroke={INK} strokeWidth={9} /><path d={`M ${x} 760 q -46 0 -46 -46 M ${x} 800 q 46 0 46 -50`} fill="none" stroke={INK} strokeWidth={9} /></g>)}
      <ellipse cx={1500} cy={200} rx={70} ry={70} fill="url(#sglow)" opacity={0.8} />
    </g>
  ),
  // la sierra: pine-covered mountains, a hillside track, tarp shelters of a clandestine camp / hideout
  sierraCamp: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={640} fill="#d9cdae" opacity={0.4} />
      {/* layered mountain ridgelines — depth-cued, pine-dotted, contour-shaded */}
      <Ridges baseY={520} layers={4} seed={7} roll={0.22} amp={112} trees={11} treeKind="pine" />
      <rect x={0} y={520} width={1920} height={120} fill="url(#svig)" opacity={0.3} />
      <rect x={0} y={640} width={1920} height={440} fill={FLOOR} /><line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={5} />
      {/* tarp lean-to shelters */}
      {[300, 1560].map((x, i) => <g key={x} opacity={0.9}><path d={`M ${x - 90} 720 L ${x} 640 L ${x + 90} 720 Z`} fill={PAPERC} stroke={INK} strokeWidth={4} /><line x1={x} y1={640} x2={x} y2={720} stroke={INK} strokeWidth={2} opacity={0.4} /></g>)}
      {/* a low campfire glow */}
      <ellipse cx={1560} cy={760} rx={70} ry={26} fill="url(#sglow)" opacity={0.7} />
    </g>
  ),
  // the narco ranch: an adobe compound wall with an iron gate, a low ranch house, palms, an antenna —
  // the jefe de plaza's finca and the patrón's fortress (the cold open + the apex)
  narcoRanch: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={560} fill="#dfd2b0" opacity={0.4} />
      {/* layered rolling hills behind — depth-cued with scattered brush */}
      <Ridges baseY={512} layers={3} seed={4} roll={0.9} amp={70} trees={7} treeKind="round" />
      {/* the ranch house */}
      <rect x={1120} y={360} width={560} height={200} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1120} y={330} width={560} height={36} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[1180, 1320, 1460, 1600].map((x) => <rect key={x} x={x} y={410} width={70} height={80} fill="#c9b98f" stroke={INK} strokeWidth={3} />)}
      {/* antenna / dish */}
      <line x1={1640} y1={330} x2={1640} y2={250} stroke={INK} strokeWidth={3} /><path d="M 1622 258 a 22 22 0 0 1 36 0" fill="none" stroke={INK} strokeWidth={3} />
      {/* palms */}
      {[260, 900].map((x, i) => <g key={x}><line x1={x} y1={560} x2={x + 8} y2={330} stroke={INK} strokeWidth={7} />{[-1, 0, 1].map((k) => <path key={k} d={`M ${x + 8} 330 q ${k * 70} -30 ${k * 120} 20`} fill="none" stroke={INK} strokeWidth={4} />)}</g>)}
      <rect x={0} y={560} width={1920} height={520} fill={FLOOR} /><line x1={0} y1={560} x2={1920} y2={560} stroke={INK} strokeWidth={5} />
      {/* the compound wall + iron gate across the front */}
      <rect x={0} y={560} width={1920} height={26} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {Array.from({length: 26}).map((_, i) => <line key={i} x1={40 + i * 74} y1={586} x2={40 + i * 74} y2={640} stroke={INK} strokeWidth={2} opacity={0.35} />)}
      <g><rect x={820} y={520} width={280} height={120} fill="none" stroke={INK} strokeWidth={5} />{Array.from({length: 9}).map((_, i) => <line key={i} x1={840 + i * 30} y1={520} x2={840 + i * 30} y2={640} stroke={INK} strokeWidth={3} />)}<line x1={960} y1={520} x2={960} y2={640} stroke={INK} strokeWidth={5} /></g>
    </g>
  ),
  // the roadside narco shrine: an arched niche, candles, a robed hooded figure (folk-saint silhouette),
  // marigolds — the vow, protection, the medallion anchor (cautionary, never an endorsement)
  narcoShrine: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      {/* the little chapel niche */}
      <path d="M 1320 780 L 1320 380 Q 1320 250 1490 250 Q 1660 250 1660 380 L 1660 780 Z" fill="#efe6cf" stroke={INK} strokeWidth={5} />
      <ellipse cx={1490} cy={430} rx={150} ry={200} fill="url(#sglow)" opacity={0.55} />
      {/* the robed hooded folk-saint figure inside */}
      <path d="M 1490 340 q -70 40 -70 140 q 0 130 70 220 q 70 -90 70 -220 q 0 -100 -70 -140 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <circle cx={1490} cy={392} r={40} fill="#e6dcc4" stroke={INK} strokeWidth={4} />
      <path d="M 1490 470 l 0 130 M 1440 520 l 100 0" stroke={INK} strokeWidth={4} opacity={0.5} />
      {/* candles */}
      {[1360, 1410, 1570, 1620].map((x, i) => <g key={x}><rect x={x - 8} y={700} width={16} height={60} fill={PAPERC} stroke={INK} strokeWidth={2.5} /><path d={`M ${x} 700 q ${-4 + Math.sin(frame * 0.3 + i) * 4} -24 4 -40`} fill="none" stroke={GOLD} strokeWidth={4} /></g>)}
      {/* marigolds */}
      {[1300, 1690].map((x) => <circle key={x} cx={x} cy={760} r={14} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.8} />)}
    </g>
  ),
  // la plaza: a small-town square — a church with a bell tower and dome, a low colonnade, a kiosk —
  // territory, the piso (turf tax), the town living under your thumb
  townPlaza: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={800} fill="#e4d8ba" opacity={0.35} />
      {/* the church: facade, bell tower, dome */}
      <rect x={1240} y={360} width={360} height={440} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1300} y={220} width={110} height={160} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 1290 220 L 1355 150 L 1420 220 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 1470 360 q 80 -130 160 0 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <line x1={1550} y1={230} x2={1550} y2={190} stroke={INK} strokeWidth={4} /><line x1={1534} y1={206} x2={1566} y2={206} stroke={INK} strokeWidth={4} />
      <rect x={1370} y={620} width={100} height={180} fill="#c9b98f" stroke={INK} strokeWidth={4} /><path d="M 1370 620 q 50 -50 100 0" fill="#c9b98f" stroke={INK} strokeWidth={4} />
      {/* a low arcaded colonnade on the left */}
      {[120, 300, 480, 660].map((x) => <g key={x}><rect x={x} y={520} width={140} height={280} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.85} /><path d={`M ${x + 20} 560 q 50 -46 100 0`} fill="none" stroke={INK} strokeWidth={3} /></g>)}
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      {/* the central kiosk / bandstand */}
      <g><ellipse cx={960} cy={840} rx={130} ry={30} fill={PAPERC} stroke={INK} strokeWidth={3} />{[880, 960, 1040].map((x) => <line key={x} x1={x} y1={840} x2={x} y2={720} stroke={INK} strokeWidth={4} />)}<path d="M 850 720 q 110 -60 220 0 Z" fill={PAPERC} stroke={INK} strokeWidth={4} /></g>
    </g>
  ),
  // --- Ocean / survival (could_you_survive_ocean) ---
  // open swell: no land, a low horizon, rolling whitecaps, a drifting sun-glint — the void
  oceanSwell: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={430} fill="#cfdbe0" opacity={0.7} />
      <rect x={0} y={430} width={1920} height={650} fill="#9fb2bb" opacity={0.85} />
      <line x1={0} y1={430} x2={1920} y2={430} stroke={INK} strokeWidth={2.5} opacity={0.45} />
      {Array.from({length: 9}).map((_, i) => {const yy = 480 + i * 62; const ph = frame * (0.006 + i * 0.001); return <path key={i} d={`M 0 ${yy} q 240 ${16 + Math.sin(ph) * 8} 480 0 t 480 0 t 480 0 t 480 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.12 + i * 0.02} />;})}
      {Array.from({length: 10}).map((_, i) => {const x = (rnd(i * 3.1) * 1920 + frame * (0.3 + rnd(i) * 0.4)) % 1920; const y = 540 + rnd(i * 1.9) * 400; return <path key={'w' + i} d={`M ${x} ${y} q 22 -12 44 0`} fill="none" stroke={PAPERC} strokeWidth={3} opacity={0.5} />;})}
      <circle cx={1560} cy={250} r={62} fill={GOLD} opacity={0.26} />
    </g>
  ),
  // the storm: dark, driving rain, a big cresting wave, the broken mast of the boat going down
  stormSea: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#6f8088" opacity={0.55} />
      <rect x={0} y={0} width={1920} height={1080} fill="#2a313a" opacity={0.26} />
      <path d="M 1180 1080 Q 1240 520 1520 460 Q 1360 560 1420 720 Q 1560 640 1720 700 Q 1500 780 1520 1080 Z" fill="#7d919a" stroke={INK} strokeWidth={5} opacity={0.85} />
      <line x1={620} y1={980} x2={430} y2={420} stroke={INK} strokeWidth={7} opacity={0.8} />
      <line x1={520} y1={700} x2={340} y2={636} stroke={INK} strokeWidth={4} opacity={0.55} />
      {Array.from({length: 60}).map((_, i) => {const x = (rnd(i * 5.1) * 1920 + frame * 6) % 1920; const y = (rnd(i * 2.7) * 1080 + frame * 22) % 1080; return <line key={i} x1={x} y1={y} x2={x - 14} y2={y + 42} stroke={PAPERC} strokeWidth={1.5} opacity={0.32} />;})}
      <rect x={0} y={900} width={1920} height={180} fill="#5a6b73" opacity={0.7} />
    </g>
  ),
  // dead calm: a flat mirror sea, a huge low sun, its reflection column, heat shimmer — the thirst
  glassCalm: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={470} fill="#f2e9d4" opacity={0.8} />
      <rect x={0} y={470} width={1920} height={610} fill="#c8d3d2" opacity={0.9} />
      <line x1={0} y1={470} x2={1920} y2={470} stroke={INK} strokeWidth={2} opacity={0.4} />
      <circle cx={960} cy={430} r={150} fill={GOLD} opacity={0.4} />
      <circle cx={960} cy={430} r={150} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.5} />
      <path d="M 900 480 L 1020 480 L 1130 1080 L 790 1080 Z" fill={GOLD} opacity={0.16} />
      {Array.from({length: 6}).map((_, i) => <line key={i} x1={0} y1={560 + i * 84} x2={1920} y2={560 + i * 84} stroke={PAPERC} strokeWidth={2} opacity={0.28} />)}
      {Array.from({length: 8}).map((_, i) => {const x = (rnd(i * 4.3) * 1920 + frame * 0.6) % 1920; return <line key={'s' + i} x1={x} y1={500 + rnd(i) * 90} x2={x + 40} y2={500 + rnd(i) * 90} stroke={GOLD} strokeWidth={2} opacity={0.38} />;})}
    </g>
  ),
  // the night sea: stars, a moon and its path, a faint red flare-glow low — the long dark
  nightSea: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#20262e" />
      <rect x={0} y={470} width={1920} height={610} fill="#171c22" />
      <line x1={0} y1={470} x2={1920} y2={470} stroke="#3a4650" strokeWidth={2} />
      {Array.from({length: 70}).map((_, i) => {const x = rnd(i * 3.7) * 1920; const y = rnd(i * 1.3) * 440; const tw = 0.35 + 0.4 * Math.sin(frame * 0.05 + i); return <circle key={i} cx={x} cy={y} r={1.6} fill={PAPERC} opacity={tw} />;})}
      <circle cx={1420} cy={210} r={54} fill={PAPERC} opacity={0.85} />
      <path d="M 1360 480 L 1480 480 L 1600 1080 L 1240 1080 Z" fill={PAPERC} opacity={0.08} />
      <ellipse cx={360} cy={780} rx={300} ry={210} fill="#c0392b" opacity={0.15} />
    </g>
  ),
  // a cargo ship on the day horizon, drifting slowly across, oblivious — the ship that never sees you
  horizonShip: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={430} fill="#cfdbe0" opacity={0.7} />
      <rect x={0} y={430} width={1920} height={650} fill="#9fb2bb" opacity={0.85} />
      <line x1={0} y1={430} x2={1920} y2={430} stroke={INK} strokeWidth={2.5} opacity={0.45} />
      {(() => {const sx = 220 + (frame * 0.22) % 1480; return (<g opacity={0.72} transform={`translate(${sx} 0)`}>
        <rect x={0} y={372} width={300} height={42} fill="#2a313a" stroke={INK} strokeWidth={2} />
        <rect x={210} y={332} width={52} height={42} fill="#2a313a" stroke={INK} strokeWidth={2} />
        {Array.from({length: 8}).map((_, i) => <rect key={i} x={22 + i * 30} y={352} width={16} height={20} fill={GOLD} opacity={0.5} />)}
      </g>);})()}
      {Array.from({length: 7}).map((_, i) => <path key={i} d={`M 0 ${500 + i * 72} q 240 16 480 0 t 480 0 t 480 0 t 480 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.13} />)}
      <circle cx={300} cy={220} r={58} fill={GOLD} opacity={0.22} />
    </g>
  ),
  // a dorsal fin cutting the swell + slow fish shadows below the raft — what the shade draws
  finWater: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={430} fill="#cfdbe0" opacity={0.7} />
      <rect x={0} y={430} width={1920} height={650} fill="#93a7b0" opacity={0.9} />
      <line x1={0} y1={430} x2={1920} y2={430} stroke={INK} strokeWidth={2.5} opacity={0.45} />
      {Array.from({length: 7}).map((_, i) => <path key={i} d={`M 0 ${500 + i * 72} q 240 14 480 0 t 480 0 t 480 0 t 480 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.13} />)}
      {(() => {const fx = 300 + (frame * 1.1) % 1300; return (<g transform={`translate(${fx} 0)`}><path d="M 0 700 Q 34 610 80 700 Q 46 686 0 700 Z" fill="#3a4650" stroke={INK} strokeWidth={4} /><path d={`M -40 712 q 60 10 130 0`} fill="none" stroke={PAPERC} strokeWidth={2} opacity={0.5} /></g>);})()}
      {[{x: 1380, y: 840}, {x: 1520, y: 900}, {x: 1250, y: 920}].map((s, i) => <ellipse key={i} cx={s.x + Math.sin(frame * 0.02 + i) * 20} cy={s.y} rx={70} ry={20} fill="#3a4650" opacity={0.25} />)}
    </g>
  ),
  // a half-swamped fishing panga adrift, tilted, a nameplate on the bow — the boat that didn't make it
  driftPanga: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={450} fill="#cfdbe0" opacity={0.7} />
      <rect x={0} y={450} width={1920} height={630} fill="#9fb2bb" opacity={0.85} />
      <line x1={0} y1={450} x2={1920} y2={450} stroke={INK} strokeWidth={2.5} opacity={0.4} />
      {(() => {const bob = Math.sin(frame * 0.03) * 8; return (<g transform={`translate(0 ${bob}) rotate(-8 960 720)`}>
        <path d="M 620 700 Q 960 620 1320 700 L 1240 822 L 700 822 Z" fill={PAPERC} stroke={INK} strokeWidth={5} opacity={0.92} />
        <rect x={880} y={636} width={140} height={70} fill={PAPERC} stroke={INK} strokeWidth={4} />
        <line x1={700} y1={760} x2={1240} y2={760} stroke={INK} strokeWidth={2} opacity={0.35} />
        <rect x={940} y={742} width={150} height={30} fill="#2a313a" stroke={INK} strokeWidth={2} opacity={0.7} />
        {Array.from({length: 5}).map((_, i) => <line key={i} x1={958 + i * 26} y1={750} x2={972 + i * 26} y2={764} stroke={PAPERC} strokeWidth={2} opacity={0.7} />)}
      </g>);})()}
      <path d="M 620 820 Q 960 800 1320 820 L 1320 900 L 620 900 Z" fill="#8aa3ad" stroke="none" opacity={0.5} />
    </g>
  ),
  // land on the horizon + an approaching fishing boat, coming toward you at last — the rescue
  landfall: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={440} fill="#dfe7de" opacity={0.75} />
      <rect x={0} y={440} width={1920} height={640} fill="#a7bab0" opacity={0.85} />
      <line x1={0} y1={440} x2={1920} y2={440} stroke={INK} strokeWidth={2.5} opacity={0.4} />
      <path d="M 1200 440 Q 1500 400 1920 428 L 1920 470 L 1200 470 Z" fill="#7a8f74" stroke={INK} strokeWidth={3} opacity={0.7} />
      {[1360, 1500, 1660].map((x) => <g key={x}><line x1={x} y1={440} x2={x} y2={358} stroke={INK} strokeWidth={4} opacity={0.6} />{[-1, 1].map((s) => <path key={s} d={`M ${x} 360 q ${s * 40} -20 ${s * 70} 6`} fill="none" stroke={INK} strokeWidth={3} opacity={0.6} />)}</g>)}
      {(() => {const sx = 760 - frame * 0.18; return (<g opacity={0.88} transform={`translate(${sx} 0)`}>
        <path d="M 0 560 Q 90 520 180 560 L 150 622 L 30 622 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
        <line x1={90} y1={520} x2={90} y2={438} stroke={INK} strokeWidth={4} />
        <path d="M 90 446 L 152 470 L 90 500 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
      </g>);})()}
      <circle cx={560} cy={240} r={72} fill={GOLD} opacity={0.32} />
      {Array.from({length: 6}).map((_, i) => <path key={i} d={`M 0 ${520 + i * 82} q 240 14 480 0 t 480 0 t 480 0 t 480 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.12} />)}
    </g>
  ),
  // a container ship's lit hull sliding past, close, at night — the cold open + its payoff
  shipNight: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1c222a" />
      <rect x={0} y={520} width={1920} height={560} fill="#141a20" />
      {Array.from({length: 40}).map((_, i) => <circle key={i} cx={rnd(i * 3.7) * 1920} cy={rnd(i * 1.3) * 380} r={1.4} fill={PAPERC} opacity={0.45 + 0.3 * Math.sin(frame * 0.05 + i)} />)}
      {(() => {const sx = -220 + frame * 0.55; return (<g transform={`translate(${sx} 0)`}>
        <rect x={0} y={232} width={1500} height={300} fill="#2a313a" stroke={INK} strokeWidth={3} opacity={0.95} />
        <rect x={1140} y={118} width={230} height={120} fill="#2a313a" stroke={INK} strokeWidth={3} />
        {Array.from({length: 22}).map((_, i) => <circle key={i} cx={60 + i * 66} cy={272} r={7} fill={GOLD} opacity={0.85} />)}
        {Array.from({length: 5}).map((_, i) => <rect key={'w' + i} x={1160 + i * 40} y={148} width={22} height={30} fill={GOLD} opacity={0.7} />)}
        {Array.from({length: 10}).map((_, i) => <rect key={'c' + i} x={40 + i * 140} y={332} width={120} height={128} fill="none" stroke={INK} strokeWidth={2} opacity={0.4} />)}
      </g>);})()}
      <path d="M 0 540 L 1920 540 L 1920 720 L 0 640 Z" fill={GOLD} opacity={0.06} />
    </g>
  ),
  // --- North Korea: the river border at night, a watchtower + a sweeping searchlight, the far
  // bank's dim lights just out of reach — the cold-open + loop-close master anchor ---
  riverBorder: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#171b20" />
      <rect x={0} y={560} width={1920} height={520} fill="#0f1317" />
      <line x1={0} y1={560} x2={1920} y2={560} stroke="#3a4650" strokeWidth={2} opacity={0.6} />
      {Array.from({length: 50}).map((_, i) => {const x = rnd(i * 3.7) * 1920; const y = rnd(i * 1.9) * 480; const tw = 0.3 + 0.4 * Math.sin(frame * 0.05 + i); return <circle key={i} cx={x} cy={y} r={1.4} fill={PAPERC} opacity={tw} />;})}
      {/* the far bank — dim rooftops + lit windows, another country, unreachable */}
      <rect x={0} y={500} width={1920} height={60} fill="#20262e" opacity={0.7} />
      {[260, 520, 900, 1300, 1620].map((x, i) => <rect key={i} x={x} y={470 + (i % 2) * 10} width={26} height={40} fill="#3a4650" opacity={0.55} />)}
      {[300, 560, 940, 1340, 1660].map((x, i) => <circle key={i} cx={x} cy={490} r={4} fill={GOLD} opacity={0.35} />)}
      {/* the watchtower, near bank, screen-right */}
      <g transform="translate(1620 0)">
        <line x1={0} y1={860} x2={0} y2={400} stroke="#0d1013" strokeWidth={10} />
        <rect x={-70} y={330} width={140} height={90} fill="#0d1013" stroke="#0a0c0e" strokeWidth={3} />
        <rect x={-40} y={350} width={80} height={40} fill="#3a4650" opacity={0.6} />
        <path d="M -80 330 L 0 288 L 80 330 Z" fill="#0d1013" />
      </g>
      {/* the searchlight, slowly sweeping the river */}
      {(() => {const ang = -2.4 + Math.sin(frame * 0.012) * 0.5; const len = 1400;
        const x2 = 1620 + Math.cos(ang) * len; const y2 = 340 + Math.sin(ang) * len;
        return <polygon points={`1620,340 ${x2 - 70},${y2} ${x2 + 70},${y2}`} fill={GOLD} opacity={0.09} />;})()}
      <rect x={0} y={840} width={1920} height={240} fill="#232a24" /><line x1={0} y1={840} x2={1920} y2={840} stroke="#0d1013" strokeWidth={5} />
    </g>
  ),
  plain: () => <g />,
  // --- Zombie apocalypse pack: new bespoke backdrops (the rest of the ladder composes from
  // MILITARY/MED/MAFIA/SAMURAI/universal packs — see docs/TEMPLATES.md) ---
  // a dark suburban street, one flickering lamp, dead cars askew — the cold-open + loop-close street
  hordeAvenue: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={620} fill="#232a2f" />
      <rect x={0} y={620} width={1920} height={460} fill="#171b1d" />
      <line x1={0} y1={620} x2={1920} y2={620} stroke={INK} strokeWidth={3} opacity={0.5} />
      {[80, 460, 840, 1220, 1600].map((x, i) => (
        <g key={i} opacity={0.75}>
          <rect x={x} y={440 + (i % 2) * 12} width={220} height={190} fill="#2c333a" stroke={INK} strokeWidth={2.5} />
          <rect x={x + 30} y={480 + (i % 2) * 12} width={50} height={60} fill={i === 2 ? GOLD : '#171b1d'} opacity={i === 2 ? 0.55 : 1} />
          <rect x={x + 130} y={480 + (i % 2) * 12} width={50} height={60} fill="#171b1d" />
        </g>
      ))}
      <line x1={1020} y1={620} x2={1020} y2={330} stroke="#0d1013" strokeWidth={8} />
      <ellipse cx={1020} cy={320} rx={60} ry={40} fill={GOLD} opacity={0.12 + 0.08 * Math.sin(frame * 0.4)} />
      {Array.from({length: 4}).map((_, i) => (
        <ellipse key={i} cx={((rnd(i * 3) * 1920) + frame * 0.3) % 1920} cy={640 + i * 30} rx={260} ry={60} fill="#3a4650" opacity={0.14} />
      ))}
      {[{x: 260, r: -8}, {x: 1500, r: 6}].map((c, i) => (
        <g key={i} transform={`translate(${c.x} 780) rotate(${c.r})`} opacity={0.7}>
          <path d="M -140 60 L -140 10 L -90 -30 L 90 -30 L 140 10 L 140 60 Z" fill="#2c333a" stroke={INK} strokeWidth={3} />
          <circle cx={-90} cy={64} r={26} fill="#171b1d" stroke={INK} strokeWidth={3} /><circle cx={90} cy={64} r={26} fill="#171b1d" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <rect x={0} y={900} width={1920} height={180} fill="#171b1d" />
    </g>
  ),
  // gridlocked evacuation highway — packed cars at angles, city smoke, a helicopter that won't stop
  highwayGridlock: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={520} fill="#cdbfa0" />
      <rect x={0} y={520} width={1920} height={560} fill="#8f8877" />
      {[680, 900, 1120].map((y) => <line key={y} x1={0} y1={y} x2={1920} y2={y} stroke="#f4ead0" strokeWidth={4} strokeDasharray="40 30" opacity={0.5} />)}
      {[120, 260, 420, 560].map((x, i) => <rect key={i} x={x} y={340 - i * 10} width={70} height={120 + i * 14} fill="#a89a7c" opacity={0.6} />)}
      {[180, 480].map((x, i) => <path key={i} d={`M ${x} 340 q ${20 + i * 10} -120 -10 -220 q 40 40 10 260`} fill="#5b6875" opacity={0.35} />)}
      {Array.from({length: 10}).map((_, i) => {
        const col = i % 5; const row = Math.floor(i / 5);
        const x = 260 + col * 300 + rnd(i) * 40; const y = 640 + row * 220 + rnd(i * 2) * 20; const rot = -6 + rnd(i * 3) * 12;
        return (
          <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`}>
            <path d="M -110 40 L -110 0 L -70 -26 L 70 -26 L 110 0 L 110 40 Z" fill={PAPERC} stroke={INK} strokeWidth={3.5} />
            <circle cx={-70} cy={44} r={22} fill="#3a3630" /><circle cx={70} cy={44} r={22} fill="#3a3630" />
          </g>
        );
      })}
      <g transform={`translate(${1500 + Math.sin(frame * 0.02) * 30} 160)`} opacity={0.7}>
        <ellipse cx={0} cy={0} rx={22} ry={8} fill={INK} /><line x1={0} y1={0} x2={-14} y2={-16} stroke={INK} strokeWidth={2} />
        <polygon points="0,4 -70,220 70,220" fill={GOLD} opacity={0.1} />
      </g>
    </g>
  ),
  // the looted grocery aisle — toppled shelves, spilled cans, a flickering strip light
  storeAisle: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={700} fill="#e7e2d4" />
      <rect x={0} y={700} width={1920} height={380} fill="#c9c2ac" />
      {[{x: 60, tip: 0}, {x: 420, tip: 1}, {x: 700, tip: 1}, {x: 1120, tip: 0}, {x: 1420, tip: 0}, {x: 1740, tip: 1}].map((s, i) => (
        <g key={i} transform={`translate(${s.x} 500) ${s.tip ? 'rotate(24)' : ''}`}>
          <rect x={0} y={0} width={180} height={220} fill="#d9d2bd" stroke={INK} strokeWidth={3} opacity={0.55} />
          {[0, 1, 2, 3].map((r) => <line key={r} x1={0} y1={r * 55} x2={180} y2={r * 55} stroke={INK} strokeWidth={2} opacity={0.4} />)}
        </g>
      ))}
      {Array.from({length: 14}).map((_, i) => {const x = rnd(i * 3.1) * 1800 + 60; const y = 760 + rnd(i * 1.4) * 220;
        return <ellipse key={i} cx={x} cy={y} rx={20} ry={12} fill={PAPERC} stroke={INK} strokeWidth={2} opacity={0.7} />;})}
      <rect x={760} y={40} width={400} height={16} fill={GOLD} opacity={0.35 + 0.25 * Math.sin(frame * 0.5)} />
      <path d="M 1600 0 L 1920 0 L 1920 480 L 1600 480 Z" fill="#b9d4de" opacity={0.4} />
      <path d="M 1650 40 L 1700 200 L 1620 260 L 1720 380 L 1780 120 Z" fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
    </g>
  ),
  // the boarded-up room — cross-nailed planks over the window, furniture stacked against the door
  bunkerRoom: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={780} fill="#3a352c" />
      <rect x={0} y={780} width={1920} height={300} fill="#2a261f" />
      <rect x={640} y={140} width={640} height={480} fill="#171410" />
      {Array.from({length: 6}).map((_, i) => <rect key={i} x={640} y={160 + i * 78} width={640} height={16} fill={PAPERC} stroke={INK} strokeWidth={3} transform={`rotate(${i % 2 ? 2 : -2} 960 ${168 + i * 78})`} />)}
      <line x1={700} y1={620} x2={1560} y2={140} stroke={PAPERC} strokeWidth={1} opacity={0.15} />
      <rect x={80} y={520} width={260} height={260} fill="#241f18" stroke={INK} strokeWidth={3} opacity={0.85} />
      <rect x={110} y={470} width={200} height={70} fill="#241f18" stroke={INK} strokeWidth={3} opacity={0.85} />
      {/* the kerosene lantern, so the glow reads as coming from something */}
      <ellipse cx={1720} cy={640} rx={70} ry={44} fill={GOLD} opacity={0.2 + 0.09 * Math.sin(frame * 0.3)} />
      <line x1={1720} y1={780} x2={1720} y2={700} stroke={INK} strokeWidth={4} />
      <rect x={1696} y={664} width={48} height={40} rx={4} fill="#241f18" stroke={INK} strokeWidth={3} />
      <path d="M 1712 664 Q 1720 636 1728 664 Z" fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.9} />
    </g>
  ),
  // the checkpoint — jersey barriers, a razor-wire coil, a floodlight tower — martial-law triage
  checkpointBarrier: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={600} fill="#20262b" />
      <rect x={0} y={600} width={1920} height={480} fill="#171b1e" />
      {Array.from({length: 8}).map((_, i) => <path key={i} d={`M ${40 + i * 240} 700 L ${100 + i * 240} 620 L ${180 + i * 240} 620 L ${220 + i * 240} 700 Z`} fill="#8f9499" stroke={INK} strokeWidth={2.5} opacity={0.7} />)}
      {Array.from({length: 24}).map((_, i) => <circle key={i} cx={i * 84} cy={560} r={30} fill="none" stroke="#c2ccd6" strokeWidth={2} opacity={0.5} />)}
      <g transform="translate(1650 0)">
        <line x1={0} y1={860} x2={0} y2={360} stroke="#0d1013" strokeWidth={10} />
        <rect x={-80} y={280} width={160} height={100} fill="#0d1013" stroke="#0a0c0e" strokeWidth={3} />
        {(() => {const ang = -2.1 + Math.sin(frame * 0.02) * 0.35; const len = 1500; const x2 = Math.cos(ang) * len; const y2 = 320 + Math.sin(ang) * len;
          return <polygon points={`0,320 ${x2 - 80},${y2} ${x2 + 80},${y2}`} fill={GOLD} opacity={0.1} />;})()}
      </g>
      <rect x={0} y={840} width={1920} height={240} fill="#232a24" /><line x1={0} y1={840} x2={1920} y2={840} stroke="#0d1013" strokeWidth={5} />
    </g>
  ),
  // the walled camp — a perimeter of stacked shipping containers, string lights, a watchtower
  campPerimeter: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={620} fill="#2c3038" />
      <rect x={0} y={620} width={1920} height={460} fill="#20242a" />
      {Array.from({length: 8}).map((_, i) => (
        <rect key={i} x={i * 240} y={380} width={230} height={220} fill={i % 2 ? '#6b7a52' : '#7a5b3c'} stroke={INK} strokeWidth={3} opacity={0.85} />
      ))}
      {Array.from({length: 8}).map((_, i) => <rect key={'d' + i} x={i * 240} y={200} width={230} height={190} fill={i % 2 ? '#7a5b3c' : '#6b7a52'} stroke={INK} strokeWidth={3} opacity={0.75} />)}
      {Array.from({length: 16}).map((_, i) => <circle key={i} cx={i * 120 + 40} cy={370} r={4} fill={GOLD} opacity={0.4 + 0.3 * Math.sin(frame * 0.2 + i)} />)}
      <g transform="translate(1680 0)">
        <line x1={0} y1={620} x2={0} y2={160} stroke="#171b1d" strokeWidth={10} />
        <rect x={-70} y={90} width={140} height={80} fill="#171b1d" stroke={INK} strokeWidth={3} />
      </g>
      <rect x={0} y={840} width={1920} height={240} fill="#3a4536" /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} opacity={0.4} />
    </g>
  ),
  // --- waste-hauling roll-up (self_made_billionaire) ---
  // a small cemetery: scattered headstones, a low iron fence, the fresh mound with flowers —
  // the cold open + its loop-close payoff
  cemetery: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {[{x: 200, y: 760, s: 0.8}, {x: 420, y: 780, s: 0.7}, {x: 1500, y: 780, s: 0.7}, {x: 1700, y: 760, s: 0.8}].map((h, i) => (
        <path key={i} opacity={0.7} d={`M ${h.x} ${h.y} L ${h.x} ${h.y - 90 * h.s} Q ${h.x + 30 * h.s} ${h.y - 120 * h.s} ${h.x + 60 * h.s} ${h.y - 90 * h.s} L ${h.x + 60 * h.s} ${h.y} Z`} fill={PAPERC} stroke={INK} strokeWidth={3} />
      ))}
      {/* the fresh mound + flowers, set apart to the right so it never underlaps a standing figure */}
      <ellipse cx={1580} cy={862} rx={170} ry={32} fill="#c9b98f" stroke={INK} strokeWidth={3} opacity={0.85} />
      {[1500, 1560, 1620].map((x, i) => <circle key={x} cx={x} cy={844} r={9} fill={i % 2 ? '#c0392b' : GOLD} opacity={0.8} />)}
      {/* low iron fence, far background */}
      <line x1={0} y1={700} x2={1920} y2={700} stroke={INK} strokeWidth={3} opacity={0.4} />
      {Array.from({length: 24}).map((_, i) => <line key={i} x1={i * 84} y1={660} x2={i * 84} y2={700} stroke={INK} strokeWidth={2} opacity={0.4} />)}
    </g>
  ),
  // a curb-side row of small houses at dawn, a bin at the curb — the origin route + its callback
  residentialDawn: ({frame}) => (
    <g>
      <rect x={0} y={840} width={1920} height={240} fill={FLOOR} /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      {[{x: 60, w: 260, h: 220}, {x: 340, w: 220, h: 190}, {x: 1440, w: 220, h: 190}, {x: 1680, w: 240, h: 220}].map((h, i) => (
        <g key={i} opacity={0.9}>
          <rect x={h.x} y={840 - h.h} width={h.w} height={h.h} fill={PAPERC} stroke={INK} strokeWidth={3} />
          <path d={`M ${h.x - 20} ${840 - h.h} L ${h.x + h.w / 2} ${840 - h.h - 90} L ${h.x + h.w + 20} ${840 - h.h} Z`} fill={PAPERC} stroke={INK} strokeWidth={3} />
          <circle cx={h.x + h.w * 0.25} cy={840 - h.h * 0.4} r={7} fill={GOLD} opacity={0.6 + 0.3 * Math.sin(frame * 0.1 + i)} />
        </g>
      ))}
      <line x1={200} y1={840} x2={200} y2={480} stroke={INK} strokeWidth={5} />
      <ellipse cx={200} cy={470} rx={30} ry={16} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <ellipse cx={200} cy={490} rx={70} ry={40} fill="url(#sglow)" opacity={0.6} />
      <rect x={1120} y={780} width={70} height={70} rx={6} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // the fenced yard — chain-link, sodium light, a receding row of parked trucks — the scaling fleet
  truckDepot: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {/* the fleet, receding into depth — reviewer fix: reuse the exact dawnRoute truck illustration
          (scaled down per row) instead of a separate boxy stand-in, so the story's central prop reads
          as the same vehicle throughout the episode */}
      {[0, 1, 2].map((i) => {const x = 1120 + i * 230; const s = 1 - i * 0.18; const y = 700 + i * 14;
        const k = 0.24 * s; const cx = x + 110 * s; const groundY = y + 110 * s;
        return <g key={i} transform={`translate(${cx} ${groundY}) scale(${k})`}><WasteTruckArt opacity={1 - i * 0.16} /></g>;})}
      <line x1={0} y1={760} x2={1920} y2={760} stroke="#8a949c" strokeWidth={4} opacity={0.7} />
      {Array.from({length: 30}).map((_, i) => <path key={i} d={`M ${i * 64} 660 L ${i * 64 + 32} 760 M ${i * 64 + 32} 660 L ${i * 64} 760`} stroke="#8a949c" strokeWidth={1.5} opacity={0.5} />)}
      <line x1={1700} y1={820} x2={1700} y2={340} stroke={INK} strokeWidth={5} />
      <ellipse cx={1700} cy={330} rx={40} ry={18} fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.8} />
      <ellipse cx={1700} cy={360} rx={90} ry={50} fill="url(#sglow)" opacity={0.5} />
    </g>
  ),
  // the tipping face — a mound of waste, a bulldozer silhouette, a lit flare stack, circling gulls
  landfillFace: ({frame}) => (
    <g>
      <rect x={0} y={880} width={1920} height={200} fill={FLOOR} /><line x1={0} y1={880} x2={1920} y2={880} stroke={INK} strokeWidth={5} />
      <path d="M 0 880 Q 400 620 900 700 Q 1300 760 1920 640 L 1920 880 Z" fill="#c9b98f" stroke={INK} strokeWidth={4} opacity={0.9} />
      {Array.from({length: 10}).map((_, i) => <line key={i} x1={140 + i * 170} y1={840 - (i % 3) * 30} x2={180 + i * 170} y2={820 - (i % 3) * 30} stroke={INK} strokeWidth={2} opacity={0.3} />)}
      <g transform="translate(1120 640)">
        <rect x={-70} y={-20} width={140} height={50} fill="#3a4048" stroke={INK} strokeWidth={3} />
        <rect x={-40} y={-55} width={70} height={40} fill="#3a4048" stroke={INK} strokeWidth={3} />
        <line x1={-80} y1={30} x2={80} y2={30} stroke={INK} strokeWidth={6} />
      </g>
      <line x1={1600} y1={880} x2={1600} y2={480} stroke="#5b6875" strokeWidth={10} />
      <path d={`M 1600 480 q ${10 + Math.sin(frame * 0.3) * 8} -40 0 -70 q ${-10 - Math.sin(frame * 0.25) * 8} 30 0 70`} fill="#e08a4a" opacity={0.85} />
      {[0, 1, 2].map((i) => {const a = frame * 0.02 + i * 2.1; return <path key={i} d={`M ${700 + Math.cos(a) * 200} ${360 + Math.sin(a) * 60} q 14 -10 28 0 q 14 10 28 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />;})}
    </g>
  ),
  // a convenience-store checkout counter — ticket rack + glowing LOTTERY sign behind the register —
  // the cold open + its loop-close payoff, the Friday ticket ritual
  counterStore: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={0} y={260} width={1920} height={520} fill={PAPERC} opacity={0.45} />
      <rect x={620} y={300} width={520} height={340} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {Array.from({length: 6}).map((_, i) => (
        <rect key={i} x={640 + (i % 3) * 170} y={320 + Math.floor(i / 3) * 160} width={150} height={140} rx={4}
          fill={i % 2 ? GOLD : '#c0392b'} opacity={0.75} stroke={INK} strokeWidth={2} />
      ))}
      <rect x={640} y={216} width={500} height={64} rx={8} fill="#c0392b" stroke={INK} strokeWidth={3} />
      <text x={890} y={260} fontSize={38} fontWeight={900} fill="#fff" textAnchor="middle" fontFamily="Arial Black, sans-serif">LOTTERY</text>
      <ellipse cx={890} cy={248} rx={280} ry={90} fill="url(#sglow)" opacity={0.55 + 0.15 * Math.sin(frame * 0.08)} />
      <rect x={1150} y={700} width={640} height={140} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1150} y={660} width={640} height={44} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <rect x={1610} y={636} width={110} height={72} rx={6} fill="#3a4048" stroke={INK} strokeWidth={3} />
      <rect x={40} y={520} width={260} height={260} fill="none" stroke={INK} strokeWidth={3} opacity={0.4} />
      {[0, 1, 2].map((i) => <line key={i} x1={40} y1={600 + i * 60} x2={300} y2={600 + i * 60} stroke={INK} strokeWidth={2} opacity={0.35} />)}
      <rect x={700} y={140} width={520} height={22} rx={4} fill="#fff7e2" stroke={INK} strokeWidth={2} opacity={0.9} />
    </g>
  ),
  // a modest single-wide home at dusk — porch light, propane tank, gravel drive — the ordinary want
  // before any of this existed, the Level-1 comfort beat
  trailerHome: ({frame}) => (
    <g>
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      <rect x={520} y={600} width={780} height={260} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={520} y={572} width={780} height={30} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((i) => (
        <rect key={i} x={600 + i * 220} y={660} width={130} height={110} fill={i === 1 ? '#fff3d6' : '#dce8f2'} stroke={INK} strokeWidth={3} opacity={i === 1 ? 0.9 : 0.7} />
      ))}
      <ellipse cx={710} cy={720} rx={160} ry={90} fill="url(#sglow)" opacity={0.5 + 0.15 * Math.sin(frame * 0.06)} />
      <rect x={480} y={800} width={70} height={90} rx={30} fill="#c7cfd6" stroke={INK} strokeWidth={3} />
      <rect x={520} y={860} width={200} height={60} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.8} />
      <circle cx={560} cy={780} r={10} fill={GOLD} opacity={0.85} />
      {Array.from({length: 40}).map((_, i) => <circle key={i} cx={(i * 53) % 1920} cy={870 + (i * 7) % 40} r={2} fill="#8a949c" opacity={0.3} />)}
    </g>
  ),
  // --- Yakuza pack (yakuza) ---
  // narrow Kabukichō-style neon alley at night, converging facades, red/gold neon signboards, hanging
  // lanterns — the cold open (AFTERMATH) + its torch-passing loop-close payoff
  kabukichoAlley: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#181418" />
      <rect x={0} y={700} width={1920} height={380} fill="#0f0c10" /><line x1={0} y1={700} x2={1920} y2={700} stroke="#000" strokeWidth={3} opacity={0.5} />
      {Array.from({length: 5}).map((_, i) => <rect key={i} x={i * 400 - 60} y={720 + i * 10} width={220} height={6} fill={GOLD} opacity={0.08 + 0.05 * Math.sin(frame * 0.05 + i)} />)}
      <path d="M 0 60 L 640 260 L 640 720 L 0 720 Z" fill="#241f28" stroke={INK} strokeWidth={3} opacity={0.9} />
      <path d="M 1920 60 L 1280 260 L 1280 720 L 1920 720 Z" fill="#241f28" stroke={INK} strokeWidth={3} opacity={0.9} />
      {[{x: 120, c: '#c0392b'}, {x: 220, c: GOLD}, {x: 320, c: '#c0392b'}, {x: 1560, c: GOLD}, {x: 1660, c: '#c0392b'}, {x: 1760, c: GOLD}].map((s, i) => (
        <g key={i}>
          <rect x={s.x} y={140} width={70} height={420} fill="#100d12" stroke={s.c} strokeWidth={3} opacity={0.9} />
          {Array.from({length: 5}).map((_, k) => <rect key={k} x={s.x + 14} y={170 + k * 76} width={42} height={50} fill={s.c} opacity={0.35 + 0.25 * Math.sin(frame * 0.08 + i + k)} />)}
        </g>
      ))}
      {[760, 1160].map((x) => (
        <g key={x}><line x1={x} y1={0} x2={x} y2={220} stroke="#000" strokeWidth={3} />
          <ellipse cx={x} cy={250} rx={44} ry={58} fill="#c0392b" stroke={INK} strokeWidth={3} opacity={0.85} />
          <ellipse cx={x} cy={250} rx={90} ry={140} fill="url(#sglow)" opacity={0.35} /></g>
      ))}
      <rect x={0} y={1000} width={1920} height={80} fill="#000" opacity={0.4} />
    </g>
  ),
  // the shrine altar — a simplified vermillion torii + a low altar with two sake cups, dim witnesses
  // ringed behind — the sakazuki cup, poured three times across the arc
  shrineAltar: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      {Array.from({length: 6}).map((_, i) => {const x = 360 + i * 240; return <g key={i} opacity={0.35}><circle cx={x} cy={560} r={26} fill={INK} /><rect x={x - 28} y={586} width={56} height={210} fill={INK} /></g>;})}
      <g opacity={0.85}>
        <rect x={860} y={260} width={200} height={26} rx={4} fill="#a33a26" stroke={INK} strokeWidth={3} />
        <rect x={880} y={286} width={20} height={220} fill="#a33a26" stroke={INK} strokeWidth={3} />
        <rect x={1020} y={286} width={20} height={220} fill="#a33a26" stroke={INK} strokeWidth={3} />
        <rect x={840} y={310} width={240} height={16} fill="#a33a26" stroke={INK} strokeWidth={2.5} />
      </g>
      <rect x={840} y={640} width={240} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <circle cx={900} cy={624} r={14} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.9} />
      <circle cx={1020} cy={624} r={14} fill={GOLD} stroke={INK} strokeWidth={2.5} opacity={0.9} />
      <ellipse cx={960} cy={560} rx={260} ry={170} fill="url(#sglow)" opacity={0.6} />
    </g>
  ),
  // tattoo studio — a wall of flash sketches, a low work lamp over the stool — the irezumi, body debt
  tattooStudio: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <rect x={1240} y={200} width={560} height={480} fill="#d8cdb4" stroke={INK} strokeWidth={4} opacity={0.5} />
      {Array.from({length: 6}).map((_, i) => {const c = i % 3, r = Math.floor(i / 3); const x = 1280 + c * 170, y = 240 + r * 220;
        return <g key={i}><rect x={x} y={y} width={140} height={180} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.8} />
          <path d={`M ${x + 20} ${y + 140} q 30 -100 100 -110 q -40 40 -20 100`} fill="none" stroke={INK} strokeWidth={2} opacity={0.6} /></g>;})}
      <rect x={520} y={720} width={200} height={30} rx={10} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <line x1={620} y1={750} x2={620} y2={800} stroke={INK} strokeWidth={4} />
      <line x1={300} y1={300} x2={300} y2={560} stroke={INK} strokeWidth={3} />
      <ellipse cx={300} cy={576} rx={70} ry={22} fill={GOLD} opacity={0.8} />
      <ellipse cx={300} cy={600} rx={220} ry={140} fill="url(#sglow)" opacity={0.6} />
      <rect x={200} y={640} width={110} height={60} fill="#2a313a" stroke={INK} strokeWidth={3} opacity={0.7} />
    </g>
  ),
  // a bare tatami room — a low table, a folded white cloth + tray, a single hanging bulb — yubitsume
  yubitsumeRoom: ({frame}) => (
    <g>
      <rect x={0} y={820} width={1920} height={260} fill={FLOOR} /><line x1={0} y1={820} x2={1920} y2={820} stroke={INK} strokeWidth={5} />
      {Array.from({length: 6}).map((_, i) => <rect key={i} x={i * 320} y={820} width={300} height={260} fill="none" stroke={INK} strokeWidth={1.5} opacity={0.15} />)}
      <rect x={820} y={780} width={280} height={20} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={880} y={750} width={100} height={28} fill="#f7f3e8" stroke={INK} strokeWidth={2.5} opacity={0.95} />
      <line x1={900} y1={760} x2={960} y2={760} stroke="#c0392b" strokeWidth={2} opacity={0.6} />
      <ellipse cx={960} cy={620} rx={280} ry={180} fill="url(#sglow)" opacity={0.45} />
      <line x1={960} y1={140} x2={960} y2={300} stroke={INK} strokeWidth={2} opacity={0.5} />
      <ellipse cx={960} cy={310} rx={20} ry={12} fill={GOLD} opacity={0.7} />
    </g>
  ),
  // the pachinko hall — rows of glowing vertical machines — the front business, the earn
  pachinkoHall: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <rect x={0} y={140} width={1920} height={660} fill="#241f28" opacity={0.9} />
      {Array.from({length: 12}).map((_, i) => {const x = 40 + i * 158; const lit = (i + Math.floor(frame / 20)) % 4 === 0;
        return <g key={i}><rect x={x} y={220} width={130} height={500} fill="#302a34" stroke={INK} strokeWidth={2.5} />
          <circle cx={x + 65} cy={340} r={44} fill="none" stroke={lit ? GOLD : '#5a5460'} strokeWidth={3} opacity={lit ? 0.9 : 0.4} />
          {Array.from({length: 5}).map((_, k) => <circle key={k} cx={x + 30 + (k % 3) * 35} cy={480 + Math.floor(k / 3) * 60} r={4} fill={lit ? GOLD : '#5a5460'} opacity={0.6} />)}
        </g>;})}
      <ellipse cx={960} cy={560} rx={700} ry={160} fill="url(#sglow)" opacity={0.3 + 0.1 * Math.sin(frame * 0.05)} />
    </g>
  ),
  // the oyabun's study — donStudy's paneled/blinded office re-staged with a kamidana shrine shelf and
  // a mounted katana — power, giving the order
  oyabunStudy: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={220} y={200} width={420} height={360} fill="#2a313a" stroke={INK} strokeWidth={4} />
      {Array.from({length: 9}).map((_, i) => <line key={i} x1={220} y1={240 + i * 38} x2={640} y2={240 + i * 38} stroke={PAPERC} strokeWidth={4} opacity={0.5} />)}
      <rect x={1300} y={220} width={220} height={16} fill="#a33a26" stroke={INK} strokeWidth={2.5} opacity={0.85} />
      <rect x={1330} y={180} width={60} height={44} fill={PAPERC} stroke={INK} strokeWidth={2.5} />
      <path d="M 1320 180 L 1360 150 L 1400 180 Z" fill={PAPERC} stroke={INK} strokeWidth={2.5} />
      {/* reviewer fix: the katana previously floated with no visible support between the shelf above
          and the blade — two wall pegs (short posts + a cradle knob) now hang from the shelf's
          underside down to the blade, reading as a mounted katana-kake instead of a misplaced prop. */}
      <line x1={1360} y1={236} x2={1360} y2={302} stroke={INK} strokeWidth={4} />
      <circle cx={1360} cy={303} r={5} fill={INK} />
      <line x1={1460} y1={236} x2={1460} y2={286} stroke={INK} strokeWidth={4} />
      <circle cx={1460} cy={287} r={5} fill={INK} />
      <line x1={1310} y1={310} x2={1500} y2={280} stroke="#c9d3d8" strokeWidth={6} />
      <line x1={1310} y1={310} x2={1290} y2={330} stroke={INK} strokeWidth={6} />
      <ellipse cx={1660} cy={360} rx={90} ry={160} fill="url(#sglow)" opacity={0.4} />
    </g>
  ),
  // --- Mongol Empire pack (mongol_empire) ---
  // the ger camp on open steppe — rolling grassland (Ridges), two felt gers, a small penned herd —
  // the herder origin, the cold-open's "before", the loop-close callback
  steppeCamp: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#swarm)" />
      <Ridges baseY={620} layers={3} seed={11} roll={0.85} amp={70} tint={PAPERC} />
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      {[{x: 1420, s: 1.15}, {x: 1620, s: 0.85}].map((g, i) => (
        <g key={i} opacity={0.9} transform={`translate(${g.x} 780) scale(${g.s})`}>
          <path d="M -150 0 Q -150 -160 0 -180 Q 150 -160 150 0 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
          <ellipse cx={0} cy={-178} rx={26} ry={10} fill="#4a4038" stroke={INK} strokeWidth={3} />
          <rect x={-24} y={-60} width={48} height={60} fill="#3a3128" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      {Array.from({length: 10}).map((_, i) => {const x = 140 + i * 46 + (i % 3) * 10; const y = 920 + (i % 2) * 20; return <ellipse key={i} cx={x} cy={y} rx={20} ry={14} fill={PAPERC} stroke={INK} strokeWidth={2} opacity={0.8} />;})}
      <ellipse cx={1500} cy={700} rx={300} ry={120} fill="url(#sglow)" opacity={0.4} />
    </g>
  ),
  // the drill ground — straw-dummy target posts receding into the steppe, two waiting horses, distant
  // ridgeline — the arban recruit's mounted-archery training
  horsebackDrill: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      <Ridges baseY={560} layers={2} seed={22} roll={0.6} amp={60} tint={PAPERC} />
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      {[{x: 1500, s: 1}, {x: 1650, s: 0.8}, {x: 1780, s: 0.6}].map((p, i) => (
        <g key={i} opacity={0.85}>
          <line x1={p.x} y1={760} x2={p.x} y2={760 - 140 * p.s} stroke={INK} strokeWidth={4} />
          <circle cx={p.x} cy={760 - 160 * p.s} r={22 * p.s} fill={PAPERC} stroke={INK} strokeWidth={3} />
          <circle cx={p.x} cy={760 - 160 * p.s} r={8 * p.s} fill="#c0392b" opacity={0.7} />
        </g>
      ))}
      {[{x: 280, y: 820}, {x: 420, y: 840}].map((h, i) => (
        <g key={i} opacity={0.55} transform={`translate(${h.x} ${h.y})`}>
          <path d="M -60 0 Q -70 -60 -20 -70 L 40 -70 Q 70 -70 70 -30 L 70 0 Z" fill="#c2ccd6" stroke={INK} strokeWidth={2.5} />
          <line x1={-40} y1={0} x2={-40} y2={40} stroke={INK} strokeWidth={4} />
          <line x1={40} y1={0} x2={40} y2={40} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <ellipse cx={960} cy={500} rx={500} ry={160} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // the night raid — torches, burning tents on the far edge of a rival camp — the first khubi, jaghun command
  steppeRaid: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1c1a22" />
      <rect x={0} y={780} width={1920} height={300} fill="#141218" /><line x1={0} y1={780} x2={1920} y2={780} stroke="#000" strokeWidth={3} opacity={0.5} />
      {[{x: 1400}, {x: 1620}, {x: 1780}].map((t, i) => (
        <g key={i} opacity={0.8}>
          <path d={`M ${t.x - 70} 780 Q ${t.x - 70} 660 ${t.x} 640 Q ${t.x + 70} 660 ${t.x + 70} 780 Z`} fill="#241f28" stroke={INK} strokeWidth={3} />
          <path d={`M ${t.x - 10} 640 q ${8 + Math.sin(frame * 0.3 + i) * 10} -50 -6 -80 q -10 30 4 80`} fill="#e0703a" opacity={0.85} />
        </g>
      ))}
      {[240, 420].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={900} x2={x} y2={760} stroke={INK} strokeWidth={5} />
          <ellipse cx={x} cy={745} rx={18} ry={26} fill={GOLD} opacity={0.7 + 0.2 * Math.sin(frame * 0.4 + i)} />
          <ellipse cx={x} cy={745} rx={60} ry={90} fill="url(#sglow)" opacity={0.35} />
        </g>
      ))}
      <ellipse cx={1560} cy={700} rx={340} ry={160} fill="url(#sglow)" opacity={0.35} />
    </g>
  ),
  // the siege — a crenellated city wall on fire, smoke, a trebuchet in the foreground — the Khwarazmian
  // campaign, minghan/tumen command, the moral-cost beat
  siegeWalls: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a2530" />
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} opacity={0.15} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <rect x={0} y={500} width={1920} height={300} fill="#3a3440" stroke={INK} strokeWidth={4} />
      {Array.from({length: 20}).map((_, i) => <rect key={i} x={i * 100} y={470} width={60} height={40} fill="#3a3440" stroke={INK} strokeWidth={3} />)}
      {[300, 900, 1500].map((x, i) => (
        <path key={x} d={`M ${x} 500 q ${10 + Math.sin(frame * 0.2 + i) * 14} -70 -10 -120 q -14 40 4 120`} fill="#e0703a" opacity={0.8} />
      ))}
      {Array.from({length: 3}).map((_, i) => {const a = frame * 0.01 + i * 2; return <path key={i} d={`M ${500 + i * 400 + Math.cos(a) * 40} ${420 + Math.sin(a) * 20} q 40 -20 80 0 q 40 20 80 0`} fill="none" stroke="#8a8290" strokeWidth={3} opacity={0.5} />;})}
      <g transform="translate(300 780)" opacity={0.85}>
        <line x1={0} y1={0} x2={0} y2={-220} stroke={INK} strokeWidth={8} />
        <line x1={-30} y1={-10} x2={30} y2={-10} stroke={INK} strokeWidth={8} />
        <line x1={0} y1={-180} x2={-140} y2={-260} stroke={INK} strokeWidth={6} />
        <circle cx={-140} cy={-260} r={16} fill={INK} />
      </g>
      <ellipse cx={960} cy={560} rx={600} ry={160} fill="url(#sglow)" opacity={0.25} />
    </g>
  ),
  // the Yam relay post — a hitching rail of fresh horses, a post hut, a rider's dust trail streaking off
  // toward the horizon — the empire's speed, the share-worthy 200mi/day beat
  yamRelayStation: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#sclean)" />
      <Ridges baseY={540} layers={2} seed={33} roll={0.8} amp={50} tint={PAPERC} />
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <line x1={1280} y1={860} x2={1780} y2={860} stroke={INK} strokeWidth={5} />
      {[1360, 1500, 1650].map((x) => (
        <g key={x} opacity={0.7} transform={`translate(${x} 860)`}>
          <path d="M -50 0 Q -60 -55 -14 -64 L 34 -64 Q 62 -64 62 -26 L 62 0 Z" fill="#c2ccd6" stroke={INK} strokeWidth={2.5} />
          <line x1={-30} y1={0} x2={-30} y2={36} stroke={INK} strokeWidth={4} /><line x1={30} y1={0} x2={30} y2={36} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={1150} y={700} width={140} height={100} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 1136 700 L 1220 640 L 1304 700 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d={`M ${300 + (frame * 3) % 1200} 840 q -120 10 -220 30`} fill="none" stroke="#c9b98f" strokeWidth={10} opacity={0.4} />
      <ellipse cx={1220} cy={650} rx={260} ry={120} fill="url(#sglow)" opacity={0.35} />
    </g>
  ),
  // the great khan's audience tent — a felt-ribbed ger ceiling overhead, kneeling retainers either
  // side, a gold paiza tablet on its stand — the governor's investiture, taxation, the Yam authority
  khanAudienceTent: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#fdf3da" />
      <path d="M 0 620 Q 960 380 1920 620 L 1920 700 Q 960 480 0 700 Z" fill="#e8d9ab" stroke={INK} strokeWidth={4} opacity={0.85} />
      {Array.from({length: 9}).map((_, i) => {const x = 140 + i * 210; return <line key={i} x1={960} y1={440} x2={x} y2={640} stroke={INK} strokeWidth={2} opacity={0.3} />;})}
      <circle cx={960} cy={440} r={40} fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      {[0, 1, 2].map((i) => <ellipse key={'L' + i} cx={260 + i * 110} cy={860} rx={40} ry={26} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.55 - i * 0.08} />)}
      {[0, 1, 2].map((i) => <ellipse key={'R' + i} cx={1660 - i * 110} cy={860} rx={40} ry={26} fill={PAPERC} stroke={INK} strokeWidth={2.5} opacity={0.55 - i * 0.08} />)}
      <rect x={1440} y={700} width={70} height={110} rx={8} fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.85} />
      <ellipse cx={960} cy={620} rx={420} ry={140} fill="url(#sglow)" opacity={0.4} />
    </g>
  ),
  // the Khagan's throne hall — columns, a raised gold throne, a wall map of the empire with one
  // quarter shaded a colder tone (the khanates that no longer answer) — the flash-forward cold open
  // + the apex + its loop-close payoff
  khaganThrone: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#241f2c" />
      <rect x={0} y={780} width={1920} height={300} fill="#1a1620" /><line x1={0} y1={780} x2={1920} y2={780} stroke="#000" strokeWidth={3} opacity={0.5} />
      {[220, 1700].map((x) => (
        <g key={x} opacity={0.8}>
          <rect x={x - 30} y={200} width={60} height={580} fill="#3a3444" stroke={INK} strokeWidth={3} />
          <rect x={x - 46} y={170} width={92} height={34} fill="#3a3444" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <rect x={870} y={560} width={180} height={220} fill={GOLD} stroke={INK} strokeWidth={4} />
      {[610, 660, 710].map((y) => <line key={y} x1={880} y1={y} x2={1040} y2={y} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <path d="M 870 560 L 900 420 L 1020 420 L 1050 560 Z" fill={GOLD} stroke={INK} strokeWidth={4} />
      <rect x={760} y={760} width={400} height={40} fill="#3a3444" stroke={INK} strokeWidth={3} />
      <rect x={1180} y={260} width={520} height={340} fill="#efe6cf" stroke={INK} strokeWidth={4} opacity={0.9} />
      <path d="M 1180 260 L 1440 260 L 1440 600 L 1180 600 Z" fill={GOLD} fillOpacity={0.35} stroke={INK} strokeWidth={3} />
      <path d="M 1440 260 L 1700 260 L 1700 600 L 1440 600 Z" fill="#5b6875" fillOpacity={0.35} stroke={INK} strokeWidth={3} />
      <line x1={1440} y1={260} x2={1440} y2={600} stroke={INK} strokeWidth={3} opacity={0.6} />
      <ellipse cx={960} cy={560} rx={420} ry={180} fill="url(#sglow)" opacity={0.35} />
    </g>
  ),
  // --- Gladiator pack (gladiator) ---
  // the slave market — a raised auction block under a striped awning, a colonnaded market town
  // receding on one side — Level 1, "you are property," where the figure is bought
  slaveMarket: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      {Array.from({length: 6}).map((_, i) => {const x = 1180 + i * 120; return (
        <rect key={x} x={x} y={360 - i * 4} width={40 - i * 2} height={420 + i * 4} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.85 - i * 0.06} />
      );})}
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <path d="M 260 780 L 260 520 L 760 520 L 760 780 Z" fill={PAPERC} stroke={INK} strokeWidth={4} opacity={0.9} />
      {Array.from({length: 8}).map((_, i) => <rect key={i} x={260 + i * 62.5} y={520} width={31} height={40} fill={i % 2 ? '#c0392b' : PAPERC} opacity={0.6} />)}
      <line x1={260} y1={520} x2={260} y2={460} stroke={INK} strokeWidth={5} /><line x1={760} y1={520} x2={760} y2={460} stroke={INK} strokeWidth={5} />
      <rect x={340} y={780} width={280} height={80} fill="#8a6a42" stroke={INK} strokeWidth={4} />
      <rect x={370} y={730} width={220} height={50} fill="#a0805a" stroke={INK} strokeWidth={4} />
      {Array.from({length: 5}).map((_, i) => <line key={i} x1={370 + i * 44} y1={730} x2={370 + i * 44} y2={780} stroke={INK} strokeWidth={2} opacity={0.35} />)}
      <ellipse cx={500} cy={640} rx={340} ry={160} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // the ludus training yard — walled, dusty ground, a covered portico along one side, a weapon rack
  // of wooden swords + round shields against the back wall — the recurring "home base"
  ludusYard: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      <rect x={0} y={760} width={1920} height={320} fill="#e4d4ad" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <rect x={0} y={280} width={1920} height={480} fill={FLOOR} opacity={0.5} />
      <rect x={1400} y={340} width={520} height={30} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[1440, 1560, 1680, 1800].map((x) => <line key={x} x1={x} y1={370} x2={x} y2={760} stroke={INK} strokeWidth={5} />)}
      <path d="M 1400 340 L 1440 300 L 1920 300 L 1920 340 Z" fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.7} />
      <rect x={140} y={420} width={360} height={16} fill="#5a4530" stroke={INK} strokeWidth={3} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={180 + i * 80} y1={436} x2={180 + i * 80} y2={560} stroke="#6a5a3c" strokeWidth={10} strokeLinecap="round" />)}
      {[0, 1].map((i) => <circle key={i} cx={620 + i * 130} cy={480} r={54} fill="none" stroke={INK} strokeWidth={5} opacity={0.75} />)}
      {[0, 1].map((i) => <circle key={'d' + i} cx={620 + i * 130} cy={480} r={18} fill="#8a6a42" opacity={0.6} />)}
      <ellipse cx={960} cy={540} rx={600} ry={220} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // the porta — the dark stone tunnel/gate beneath the stands: iron portcullis bars, guttering wall
  // torches, a bright shaft of daylight ahead where the tunnel opens onto the sand — waiting to fight
  arenaGate: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1c1a22" />
      <rect x={0} y={820} width={1920} height={260} fill="#141218" /><line x1={0} y1={820} x2={1920} y2={820} stroke="#000" strokeWidth={3} opacity={0.5} />
      <path d="M 0 0 L 620 200 L 620 820 L 0 1080 Z" fill="#26222c" stroke={INK} strokeWidth={4} />
      <path d="M 1920 0 L 1300 200 L 1300 820 L 1920 1080 Z" fill="#26222c" stroke={INK} strokeWidth={4} />
      <path d="M 700 220 L 1220 220 L 1300 820 L 620 820 Z" fill="#f4dca0" opacity={0.9} />
      <ellipse cx={960} cy={520} rx={340} ry={340} fill="url(#sglow)" opacity={0.6} />
      {Array.from({length: 9}).map((_, i) => <rect key={i} x={660 + i * 72} y={220} width={14} height={600} fill="#0d0b10" opacity={0.92} />)}
      <rect x={660} y={220} width={648} height={20} fill="#0d0b10" opacity={0.92} />
      {[240, 1680].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={640} x2={x} y2={520} stroke={INK} strokeWidth={5} />
          <path d={`M ${x - 10} 520 q ${8 + Math.sin(frame * 0.3 + i) * 10} -46 -6 -76 q -10 30 6 76`} fill="#e0703a" opacity={0.85} />
          <ellipse cx={x} cy={520} rx={70} ry={100} fill="url(#sglow)" opacity={0.4} />
        </g>
      ))}
    </g>
  ),
  // the amphitheater sand — THE master reused backdrop: warm sand floor, tiered stone cavea receding
  // upward, a scalloped velarium shade awning along the top edge, a scattering of dim crowd marks
  arenaSand: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#sclean)" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path key={i} d={`M 0 ${360 + i * 62} Q 960 ${300 + i * 62} 1920 ${360 + i * 62} L 1920 ${400 + i * 62} Q 960 ${340 + i * 62} 0 ${400 + i * 62} Z`}
          fill={i % 2 ? '#d8cdb4' : '#e6ddc8'} stroke={INK} strokeWidth={2} opacity={0.7} />
      ))}
      {Array.from({length: 14}).map((_, i) => <path key={i} d={`M ${i * 140} 0 Q ${i * 140 + 70} 60 ${i * 140 + 140} 0`} fill="#c94f3f" stroke={INK} strokeWidth={2} opacity={0.55} />)}
      {Array.from({length: 40}).map((_, i) => {const row = i % 5; const x = rnd(i * 3.1) * 1900 + 10; const y = 372 + row * 62 + rnd(i * 1.7) * 20; return <ellipse key={i} cx={x} cy={y} rx={9} ry={12} fill="#2a2620" opacity={0.22} />;})}
      <rect x={0} y={660} width={1920} height={420} fill="#d9c08a" /><line x1={0} y1={660} x2={1920} y2={660} stroke={INK} strokeWidth={5} />
      {Array.from({length: 10}).map((_, i) => <ellipse key={i} cx={rnd(i * 2.7) * 1920} cy={700 + rnd(i * 4.1) * 340} rx={40} ry={6} fill="#c2a76e" opacity={0.4} />)}
      <ellipse cx={960} cy={780} rx={700} ry={220} fill="url(#sglow)" opacity={0.25} />
    </g>
  ),
  // the lanista's office — a desk with rolled scrolls + a wax tablet, a wall-mounted roster board of
  // tally lines, warm lamp-lit interior — the business of ownership
  ludusOffice: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={220} y={220} width={420} height={340} fill="#5a4530" stroke={INK} strokeWidth={4} />
      {Array.from({length: 7}).map((_, i) => <line key={i} x1={260} y1={264 + i * 40} x2={600} y2={264 + i * 40} stroke={PAPERC} strokeWidth={4} opacity={0.55} />)}
      <rect x={1300} y={760} width={480} height={30} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1340} y={790} width={400} height={110} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <rect x={1370} y={728} width={90} height={24} rx={12} fill="#e8d9ab" stroke={INK} strokeWidth={3} />
      <rect x={1470} y={732} width={80} height={20} rx={10} fill="#e8d9ab" stroke={INK} strokeWidth={3} />
      <rect x={1600} y={724} width={70} height={50} fill="#3a2f22" stroke={INK} strokeWidth={3} />
      <line x1={960} y1={0} x2={960} y2={140} stroke={INK} strokeWidth={3} /><circle cx={960} cy={156} r={16} fill={GOLD} opacity={0.9} /><path d="M 960 156 L 640 780 L 1280 780 Z" fill="url(#sglow)" opacity={0.4} />
    </g>
  ),
  // the imperial box (pulvinar) — the editor's raised viewing box overlooking the arena: an ornate
  // gold-accented railing in the foreground, purple drapery above, the sand + cavea glimpsed below —
  // a high vantage point looking down. Richer/cooler than arenaSand — the apex, above even the editor
  imperialBox: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a2233" />
      <path d="M 0 0 L 1920 0 L 1920 220 Q 960 320 0 220 Z" fill="#4a2f5a" stroke={INK} strokeWidth={4} opacity={0.9} />
      {Array.from({length: 10}).map((_, i) => <line key={i} x1={i * 213} y1={0} x2={i * 213} y2={220 + Math.sin(i) * 30} stroke={INK} strokeWidth={2} opacity={0.3} />)}
      {[0, 1, 2].map((i) => (
        <path key={i} d={`M 300 ${420 + i * 30} Q 960 ${390 + i * 30} 1620 ${420 + i * 30} L 1620 ${440 + i * 30} Q 960 ${410 + i * 30} 300 ${440 + i * 30} Z`}
          fill="#5a4d66" stroke={INK} strokeWidth={2} opacity={0.5} />
      ))}
      <rect x={300} y={520} width={1320} height={220} fill="#c9a86a" opacity={0.5} />
      <rect x={0} y={800} width={1920} height={280} fill="#241d2c" /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <rect x={0} y={760} width={1920} height={50} fill={GOLD} stroke={INK} strokeWidth={4} opacity={0.85} />
      {Array.from({length: 17}).map((_, i) => <rect key={i} x={40 + i * 112} y={810} width={20} height={200} fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.7} />)}
      <ellipse cx={960} cy={480} rx={600} ry={200} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // --- Bratva pack backdrops (bratva) ---
  // a grim Khrushchyovka courtyard block — repeating panel-facade windows (some lit), a broken swing
  // frame, a laundry line strung between two poles — Level 1 origin, the want
  courtyardBg: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#3a4048" />
      <rect x={0} y={80} width={1920} height={620} fill="#4a5058" stroke={INK} strokeWidth={4} />
      {Array.from({length: 8}).map((_, r) => Array.from({length: 12}).map((_, c) => {
        const lit = (r * 12 + c + Math.floor(frame / 50)) % 9 === 0;
        return <rect key={r + '_' + c} x={40 + c * 156} y={110 + r * 74} width={100} height={54} fill={lit ? GOLD : '#2a2f36'} stroke={INK} strokeWidth={2} opacity={lit ? 0.75 : 0.55} />;
      }))}
      <rect x={0} y={700} width={1920} height={380} fill={FLOOR} /><line x1={0} y1={700} x2={1920} y2={700} stroke={INK} strokeWidth={5} />
      <g opacity={0.7}><line x1={1300} y1={640} x2={1300} y2={900} stroke={INK} strokeWidth={5} /><line x1={1560} y1={640} x2={1560} y2={900} stroke={INK} strokeWidth={5} />
        <line x1={1300} y1={700} x2={1560} y2={700} stroke="#8a95a0" strokeWidth={3} /><line x1={1300} y1={640} x2={1560} y2={860} stroke="#8a95a0" strokeWidth={4} opacity={0.6} /></g>
      <line x1={220} y1={760} x2={620} y2={760} stroke={INK} strokeWidth={3} opacity={0.5} />
      {[280, 360, 440, 520].map((x, i) => <rect key={i} x={x} y={760 + Math.sin(frame * 0.04 + i) * 4} width={54} height={36} fill={i % 2 ? '#c9d4dc' : '#9fb0bd'} opacity={0.8} />)}
      <ellipse cx={960} cy={780} rx={600} ry={200} fill="url(#sglow)" opacity={0.25} />
    </g>
  ),
  // a bare back-room stool under a single bulb, a small table with ink bottles + a buzzing coil
  // tattoo rig — the recurring sensory anchor, re-triggered at every level-up
  tattooCellBg: ({frame}) => (
    <g>
      <rect x={0} y={800} width={1920} height={280} fill={FLOOR} /><line x1={0} y1={800} x2={1920} y2={800} stroke={INK} strokeWidth={5} />
      <rect x={0} y={0} width={1920} height={800} fill="#2c2824" />
      {Array.from({length: 24}).map((_, i) => <line key={i} x1={i * 82} y1={0} x2={i * 82} y2={800} stroke={INK} strokeWidth={1} opacity={0.12} />)}
      <rect x={1280} y={700} width={220} height={100} fill="#5a4530" stroke={INK} strokeWidth={4} />
      {[1320, 1370, 1420, 1460].map((x, i) => <rect key={i} x={x} y={720} width={22} height={40} fill={i % 2 ? '#8a3a2a' : '#2a2a2a'} stroke={INK} strokeWidth={2} opacity={0.85} />)}
      <circle cx={1360} cy={716} r={10} fill="#c9432a" opacity={0.8} />
      <line x1={640} y1={140} x2={640} y2={420} stroke={INK} strokeWidth={2} opacity={0.5} />
      <ellipse cx={640} cy={440} rx={30} ry={16} fill={GOLD} opacity={0.85} />
      <ellipse cx={640} cy={520} rx={260} ry={200} fill="url(#sglow)" opacity={0.55} />
    </g>
  ),
  // the banya (steam bathhouse) — wood-plank walls, a stove of glowing stones, drifting steam, a
  // low bench — the skhodka / sit-down where deals and verdicts happen
  banyaRoom: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill="#6a4f36" /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={0} y={0} width={1920} height={780} fill="#7a5c3e" />
      {Array.from({length: 16}).map((_, i) => <line key={i} x1={i * 122} y1={0} x2={i * 122} y2={780} stroke={INK} strokeWidth={2} opacity={0.18} />)}
      <rect x={1400} y={560} width={260} height={220} fill="#3a332c" stroke={INK} strokeWidth={4} />
      {Array.from({length: 12}).map((_, i) => <circle key={i} cx={1420 + (i % 4) * 56} cy={600 + Math.floor(i / 4) * 50} r={16} fill={i % 3 === 0 ? '#e8703a' : '#4a4038'} opacity={0.8} />)}
      <ellipse cx={1530} cy={520} rx={140} ry={90} fill="url(#sglow)" opacity={0.4} />
      {Array.from({length: 7}).map((_, i) => <ellipse key={i} cx={200 + i * 240 + Math.sin(frame * 0.03 + i) * 30} cy={300 + Math.cos(frame * 0.02 + i) * 60} rx={110} ry={60} fill="#fff" opacity={0.08 + 0.04 * Math.sin(frame * 0.05 + i)} />)}
      <rect x={200} y={700} width={520} height={30} rx={8} fill="#8a6a44" stroke={INK} strokeWidth={4} />
      <ellipse cx={960} cy={640} rx={700} ry={220} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // a small shop — a barred counter window, a wall calendar, sparse shelves — the krysha collection run
  shopCounter: ({frame}) => (
    <g>
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <rect x={0} y={0} width={1920} height={760} fill="#e6ddc8" opacity={0.5} />
      {Array.from({length: 4}).map((_, r) => Array.from({length: 6}).map((_, c) => (
        <rect key={r + '_' + c} x={80 + c * 260} y={100 + r * 130} width={200} height={100} fill="#d8cdb4" stroke={INK} strokeWidth={2} opacity={0.5} />
      )))}
      <rect x={1180} y={560} width={620} height={220} fill="#8a7a5a" stroke={INK} strokeWidth={4} />
      {Array.from({length: 8}).map((_, i) => <line key={i} x1={1200 + i * 76} y1={560} x2={1200 + i * 76} y2={780} stroke={INK} strokeWidth={3} opacity={0.5} />)}
      <rect x={1180} y={780} width={620} height={40} fill="#5a4d38" stroke={INK} strokeWidth={4} />
      <rect x={1620} y={300} width={90} height={130} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.85} />
      {Array.from({length: 4}).map((_, i) => <line key={i} x1={1636} y1={330 + i * 24} x2={1694} y2={330 + i * 24} stroke={INK} strokeWidth={1.5} opacity={0.4} />)}
      <ellipse cx={960} cy={560} rx={600} ry={180} fill="url(#sglow)" opacity={0.25} />
    </g>
  ),
  // a dim circle of candlelight — a folded prison blanket + a glass of tea in a metal holder on the
  // floor before the kneeling candidate, a ring of dim seated elders behind — the koronatsiya
  koronatsiyaCircle: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1c1a22" />
      <rect x={0} y={840} width={1920} height={240} fill="#151318" /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={5} />
      {Array.from({length: 8}).map((_, i) => {const a = (i / 8) * Math.PI * 2; const x = 960 + Math.cos(a) * 640, y = 700 + Math.sin(a) * 90;
        return <g key={i} opacity={0.4}><circle cx={x} cy={y - 40} r={24} fill={INK} /><rect x={x - 26} y={y - 16} width={52} height={190} fill={INK} /></g>;})}
      <rect x={900} y={820} width={120} height={16} fill="#8a3a2a" stroke={INK} strokeWidth={2} opacity={0.85} />
      <rect x={1040} y={800} width={30} height={40} fill="#c9c2a8" stroke={INK} strokeWidth={2} opacity={0.85} />
      {Array.from({length: 5}).map((_, i) => <circle key={i} cx={300 + i * 350} cy={500 + Math.sin(frame * 0.05 + i) * 10} r={6} fill={GOLD} opacity={0.6 + 0.3 * Math.sin(frame * 0.08 + i)} />)}
      <ellipse cx={960} cy={680} rx={340} ry={220} fill="url(#sglow)" opacity={0.5} />
    </g>
  ),
  // a wooden boardwalk pier at dusk — railing, a distant foreign skyline, a lit Ferris wheel silhouette
  // on the horizon — the network reaching abroad
  brightonBoardwalk: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={640} fill="#6a7a8c" />
      <rect x={0} y={560} width={1920} height={140} fill="#4a5a6c" opacity={0.7} />
      {Array.from({length: 6}).map((_, i) => <path key={i} d={`M 0 ${600 + i * 12} q 480 -10 960 0 t 960 0`} fill="none" stroke={PAPERC} strokeWidth={2} opacity={0.2} />)}
      <g opacity={0.6}>{[1300, 1400, 1500, 1560, 1660, 1740].map((x, i) => <rect key={i} x={x} y={480 - (i % 3) * 40} width={40} height={200 + (i % 3) * 40} fill="#2a2f38" />)}</g>
      <circle cx={1560} cy={420} r={70} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.6} />
      {Array.from({length: 8}).map((_, i) => {const a = (i / 8) * Math.PI * 2 + frame * 0.01; return <circle key={i} cx={1560 + Math.cos(a) * 70} cy={420 + Math.sin(a) * 70} r={7} fill={GOLD} opacity={0.7} />;})}
      <rect x={0} y={700} width={1920} height={380} fill="#8a6a44" /><line x1={0} y1={700} x2={1920} y2={700} stroke={INK} strokeWidth={5} />
      {Array.from({length: 25}).map((_, i) => <line key={i} x1={i * 80} y1={700} x2={i * 80} y2={1080} stroke={INK} strokeWidth={2} opacity={0.2} />)}
      <line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} opacity={0.5} />
      <ellipse cx={960} cy={520} rx={700} ry={200} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // the pakhan's office — a heavy desk, a samovar, a wall map of the country with regions pinned, a
  // fur ushanka on a hook — the apex, "the money still isn't yours"
  pakhanOffice: ({frame}) => (
    <g>
      <rect x={0} y={780} width={1920} height={300} fill={FLOOR} /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={5} />
      <rect x={220} y={180} width={520} height={420} fill="#3a4048" stroke={INK} strokeWidth={4} opacity={0.7} />
      <path d="M 240 200 q 220 -40 480 0 l 0 380 q -240 30 -480 0 Z" fill="none" stroke={GOLD} strokeWidth={2} opacity={0.5} />
      {[{x: 340, y: 300}, {x: 520, y: 380}, {x: 640, y: 260}].map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={10} fill="#c0392b" opacity={0.85} />)}
      <ellipse cx={1500} cy={520} rx={70} ry={100} fill="#8a6a44" stroke={INK} strokeWidth={4} />
      <ellipse cx={1500} cy={430} rx={40} ry={30} fill="#8a6a44" stroke={INK} strokeWidth={3} />
      <rect x={1470} y={400} width={60} height={16} fill={GOLD} opacity={0.8} />
      <ellipse cx={1720} cy={340} rx={60} ry={40} fill="#3a2f22" stroke={INK} strokeWidth={3} opacity={0.85} />
      <ellipse cx={960} cy={620} rx={600} ry={200} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // --- Space pack backdrops (astronaut) ---
  // a two-seat T-38 supersonic jet cockpit — canopy frame arching overhead, motion-streaked sky,
  // instrument dials in the foreground — ASCAN jet training, where the real training-fatality risk lives
  t38Cockpit: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#bfe4f7" />
      {Array.from({length: 10}).map((_, i) => {const y = 80 + i * 90; const off = (frame * 6 + i * 53) % 2200 - 300;
        return <rect key={i} x={off} y={y} width={220} height={8} fill="#fff" opacity={0.35} rx={4} />;})}
      <ellipse cx={960} cy={720} rx={1400} ry={520} fill="#eef2f6" opacity={0.5} />
      <path d="M -40 60 Q 960 -140 1960 60 L 1960 200 Q 960 20 -40 200 Z" fill="#2a2f38" stroke={INK} strokeWidth={5} opacity={0.92} />
      <path d="M 200 900 L 300 640 L 1620 640 L 1720 900 Z" fill="#1c1f26" stroke={INK} strokeWidth={5} />
      {[420, 620, 820, 1020, 1220, 1420].map((x, i) => <circle key={i} cx={x} cy={800} r={38} fill="#3a4048" stroke={GOLD} strokeWidth={3} opacity={0.85} />)}
      <rect x={0} y={920} width={1920} height={160} fill="#141820" /><line x1={0} y1={920} x2={1920} y2={920} stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={420} rx={700} ry={220} fill="url(#sglow)" opacity={0.35} />
    </g>
  ),
  // the Neutral Buoyancy Lab — a training pool with a submerged ISS mockup module, rising bubbles —
  // spacewalk training, the world's largest indoor pool (real, ~6.2M gallons)
  nbl: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1c5f7a" />
      <rect x={0} y={0} width={1920} height={1080} fill="url(#sclean)" opacity={0.25} />
      {Array.from({length: 16}).map((_, i) => <rect key={i} x={i * 120} y={40} width={110} height={40} fill="#2f7a94" opacity={0.3} />)}
      <ellipse cx={1420} cy={620} rx={340} ry={130} fill="#0f3a4d" stroke={INK} strokeWidth={4} opacity={0.75} />
      <rect x={1220} y={560} width={400} height={120} rx={60} fill="#14495e" stroke={INK} strokeWidth={4} opacity={0.8} />
      {[1280, 1360, 1440, 1520, 1600].map((x, i) => <circle key={i} cx={x} cy={620} r={16} fill="#bfe4f7" opacity={0.5} />)}
      {Array.from({length: 26}).map((_, i) => {const x = rnd(i * 3.3) * 1920; const y = (((rnd(i * 1.9) * 1080) - (frame / 30) * (20 + rnd(i) * 30)) % 1120 + 1120) % 1120;
        return <circle key={i} cx={x} cy={y} r={4 + rnd(i * 2) * 6} fill="#eaf7ff" opacity={0.35} />;})}
      <rect x={0} y={880} width={1920} height={200} fill="#0d2e3d" /><line x1={0} y1={880} x2={1920} y2={880} stroke={INK} strokeWidth={4} opacity={0.4} />
      <ellipse cx={900} cy={520} rx={620} ry={260} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // the launch capsule interior — curved conical hull, a round porthole showing the flame/sky, an
  // instrument panel, harness straps across the seat below — the danger beat, liftoff
  capsuleLaunch: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1a1c22" />
      <path d="M 0 0 Q 300 540 0 1080 L 300 1080 Q 500 540 300 0 Z" fill="#2a2d36" stroke={INK} strokeWidth={4} opacity={0.9} />
      <path d="M 1920 0 Q 1620 540 1920 1080 L 1620 1080 Q 1420 540 1620 0 Z" fill="#2a2d36" stroke={INK} strokeWidth={4} opacity={0.9} />
      {Array.from({length: 8}).map((_, i) => <circle key={i} cx={340 + i * 15} cy={120 + i * 90} r={5} fill={INK} opacity={0.3} />)}
      <circle cx={960} cy={300} r={150} fill="#0a0c12" stroke={PAPERC} strokeWidth={10} />
      {Array.from({length: 40}).map((_, i) => {const a = rnd(i * 7) * Math.PI * 2; const r = rnd(i * 3) * 130;
        return <circle key={i} cx={960 + Math.cos(a) * r} cy={300 + Math.sin(a) * r} r={1.4} fill="#fff" opacity={0.7} />;})}
      <ellipse cx={960} cy={420} rx={140} ry={70} fill={frame % 40 < 20 ? '#f2a33d' : '#e0703a'} opacity={0.5} />
      <rect x={620} y={700} width={680} height={200} rx={16} fill="#33383f" stroke={INK} strokeWidth={5} />
      {[700, 820, 940, 1060, 1180].map((x, i) => <rect key={i} x={x} y={730} width={60} height={40} fill="#3fb0e0" opacity={0.5} />)}
      <line x1={780} y1={900} x2={1140} y2={1080} stroke="#c0392b" strokeWidth={12} opacity={0.6} />
      <line x1={1140} y1={900} x2={780} y2={1080} stroke="#c0392b" strokeWidth={12} opacity={0.6} />
      <ellipse cx={960} cy={280} rx={200} ry={120} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // the ISS Cupola — the 7-window dome, Earth's curve filling the view — the recurring master anchor
  // for "first sight of Earth" and every quiet command-deck reflection after it
  cupolaEarth: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#05060a" />
      {Array.from({length: 70}).map((_, i) => {const x = rnd(i * 1.7) * 1920; const y = rnd(i * 2.3) * 500;
        return <circle key={i} cx={x} cy={y} r={rnd(i) * 1.6 + 0.4} fill="#fff" opacity={0.5 + rnd(i * 3) * 0.4} />;})}
      <path d="M -200 1080 Q 960 560 2120 1080 Z" fill="#1a5fae" stroke={INK} strokeWidth={4} />
      <path d="M -100 1000 Q 960 640 1980 1000 Z" fill="#2f7fd6" opacity={0.6} />
      {[300, 700, 1100, 1500].map((x, i) => <ellipse key={i} cx={x} cy={960 - i * 10} rx={90} ry={26} fill="#fff" opacity={0.5} />)}
      <path d="M 260 60 L 500 60 L 500 1080" fill="none" stroke="#0d0e12" strokeWidth={26} />
      <path d="M 1660 60 L 1420 60 L 1420 1080" fill="none" stroke="#0d0e12" strokeWidth={26} />
      <line x1={780} y1={60} x2={780} y2={1080} stroke="#0d0e12" strokeWidth={26} />
      <line x1={1140} y1={60} x2={1140} y2={1080} stroke="#0d0e12" strokeWidth={26} />
      <rect x={0} y={0} width={260} height={1080} fill="#0d0e12" />
      <rect x={1660} y={0} width={260} height={1080} fill="#0d0e12" />
      <rect x={0} y={0} width={1920} height={60} fill="#0d0e12" />
      <rect x={0} y={960} width={1920} height={30} fill="#1a1c22" />
      <ellipse cx={960} cy={700} rx={500} ry={220} fill="url(#sglow)" opacity={0.15} />
    </g>
  ),
  // outside the station — black starfield, the Earth's blue curve below, the truss the figure is
  // tethered to, a gold tether line — every EVA beat, including the midpoint water-intrusion reversal
  evaSpacewalk: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#05060a" />
      {Array.from({length: 90}).map((_, i) => {const x = rnd(i * 1.3) * 1920; const y = rnd(i * 2.9) * 760;
        return <circle key={i} cx={x} cy={y} r={rnd(i) * 1.6 + 0.4} fill="#fff" opacity={0.4 + rnd(i * 4) * 0.5} />;})}
      <path d="M -300 1080 Q 960 500 2220 1080 Z" fill="#1a5fae" stroke={INK} strokeWidth={4} />
      <path d="M -200 980 Q 960 580 2080 980 Z" fill="#2f7fd6" opacity={0.55} />
      <circle cx={1650} cy={220} r={90} fill="#fff6d8" opacity={0.9} />
      <circle cx={1650} cy={220} r={140} fill="url(#sglow)" opacity={0.5} />
      <rect x={0} y={640} width={1920} height={60} fill="#c9d3d8" stroke={INK} strokeWidth={4} opacity={0.85} />
      {Array.from({length: 16}).map((_, i) => <line key={i} x1={i * 130} y1={640} x2={i * 130 + 65} y2={700} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <rect x={1400} y={560} width={220} height={140} fill="#dbe3e8" stroke={INK} strokeWidth={4} opacity={0.85} />
      <path d={`M 1000 700 Q ${960 + Math.sin(frame * 0.05) * 20} 800 960 900`} fill="none" stroke="#f2c14e" strokeWidth={3} opacity={0.6} strokeDasharray="6 6" />
    </g>
  ),
  // Mission Control — a big wall screen with an orbit-track map, rows of consoles receding — the
  // ground side of every launch/EVA/landing, where the "1 vote" apex line lands
  missionControl: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#0c1420" />
      <rect x={260} y={80} width={1400} height={480} rx={10} fill="#0a1826" stroke={INK} strokeWidth={5} />
      <path d="M 320 500 Q 700 160 1080 500 T 1600 480" fill="none" stroke="#3fb0e0" strokeWidth={3} opacity={0.7} />
      {Array.from({length: 5}).map((_, i) => <circle key={i} cx={340 + i * 280} cy={220 + ((i * 57 + frame / 6) % 260)} r={8} fill="#f2c14e" opacity={0.85} />)}
      {Array.from({length: 40}).map((_, i) => {const x = 300 + rnd(i * 3) * 1300; const y = 120 + rnd(i * 5) * 420;
        return <circle key={i} cx={x} cy={y} r={1.2} fill="#fff" opacity={0.3} />;})}
      {[0, 1, 2].map((r) => (
        <g key={r} opacity={0.85 - r * 0.15}>
          <rect x={140 - r * 40} y={700 + r * 90} width={1640 + r * 80} height={70} rx={8} fill="#182636" stroke={INK} strokeWidth={3} />
          {Array.from({length: 8}).map((_, i) => <rect key={i} x={200 - r * 40 + i * 210} y={708 + r * 90} width={70} height={40} fill="#3fb0e0" opacity={0.35} />)}
        </g>
      ))}
      <rect x={0} y={980} width={1920} height={100} fill="#060a12" />
      <ellipse cx={960} cy={320} rx={700} ry={220} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // inside the ISS — equipment racks along curved walls, a small round Earth-glimpse window, cable
  // handholds — commanding the station, the day-to-day of Level 06
  stationOps: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#e8ecef" />
      <path d="M 0 0 Q 960 -80 1920 0 L 1920 1080 Q 960 1160 0 1080 Z" fill="#dde3e8" opacity={0.5} />
      {[0, 1].map((side) => (
        <g key={side} transform={side ? 'translate(1920,0) scale(-1,1)' : ''}>
          <rect x={40} y={140} width={340} height={760} fill="#c9d3d8" stroke={INK} strokeWidth={4} opacity={0.85} />
          {Array.from({length: 8}).map((_, i) => <rect key={i} x={64} y={170 + i * 88} width={292} height={64} fill="#eef2f6" stroke={INK} strokeWidth={2} opacity={0.7} />)}
        </g>
      ))}
      <circle cx={960} cy={300} r={80} fill="#05060a" stroke={PAPERC} strokeWidth={8} />
      <path d="M 900 340 Q 960 300 1020 340 L 1020 380 Q 960 350 900 380 Z" fill="#2f7fd6" opacity={0.8} />
      {Array.from({length: 6}).map((_, i) => <path key={i} d={`M ${500 + i * 160} 200 Q ${520 + i * 160} ${260 + Math.sin(frame * 0.03 + i) * 20} ${540 + i * 160} 320`} fill="none" stroke={INK} strokeWidth={2} opacity={0.3} />)}
      <rect x={0} y={940} width={1920} height={140} fill="#c2ccd6" /><line x1={0} y1={940} x2={1920} y2={940} stroke={INK} strokeWidth={4} />
      <ellipse cx={960} cy={500} rx={600} ry={260} fill="url(#sglow)" opacity={0.15} />
    </g>
  ),
  // the lunar surface — black sky, Earth hanging small and blue, grey cratered regolith, a footprint
  // trail, a planted flag — the cold open + the apex + its loop-close payoff, THE master reused anchor
  lunarSurface: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={620} fill="#05060a" />
      {Array.from({length: 60}).map((_, i) => {const x = rnd(i * 1.9) * 1920; const y = rnd(i * 3.1) * 560;
        return <circle key={i} cx={x} cy={y} r={rnd(i) * 1.5 + 0.4} fill="#fff" opacity={0.4 + rnd(i * 4) * 0.5} />;})}
      <circle cx={1560} cy={200} r={70} fill="#2f7fd6" />
      <path d="M 1500 170 Q 1560 150 1620 190 Q 1580 230 1520 210 Z" fill="#fff" opacity={0.6} />
      <ellipse cx={1560} cy={200} rx={110} ry={110} fill="url(#sglow)" opacity={0.35} />
      <rect x={0} y={620} width={1920} height={460} fill="#b7ada0" /><line x1={0} y1={620} x2={1920} y2={620} stroke={INK} strokeWidth={3} opacity={0.5} />
      {Array.from({length: 10}).map((_, i) => {const x = rnd(i * 2.3) * 1920; const y = 660 + rnd(i * 4.1) * 380; const r = 14 + rnd(i * 5) * 30;
        return <ellipse key={i} cx={x} cy={y} rx={r} ry={r * 0.4} fill="#a49a8c" stroke={INK} strokeWidth={2} opacity={0.5} />;})}
      {Array.from({length: 6}).map((_, i) => <ellipse key={i} cx={700 + i * 90} cy={940 - i * 4} rx={16} ry={9} fill="#8f8578" opacity={0.5} />)}
      <line x1={1300} y1={1000} x2={1300} y2={760} stroke={INK} strokeWidth={5} />
      <path d="M 1300 760 L 1440 780 L 1300 820 Z" fill="#c0392b" stroke={INK} strokeWidth={3} />
      <ellipse cx={960} cy={780} rx={700} ry={200} fill="url(#sglow)" opacity={0.15} />
    </g>
  ),
  // --- Ottoman Empire pack (ottoman_empire) ---
  // a Balkan hill village — the family's stone-and-timber house, a small church spire on the far
  // ridge — Level 1, the named want, the origin AND the devshirme-collection restage AND the loop
  // callback (the same village, generations later)
  balkanVillage: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      <Ridges baseY={600} layers={3} seed={41} roll={0.75} amp={65} tint={PAPERC} trees={6} treeKind="pine" />
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <rect x={220} y={560} width={360} height={200} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 200 560 L 400 460 L 600 560 Z" fill="#8a6a42" stroke={INK} strokeWidth={4} />
      <rect x={330} y={640} width={80} height={120} fill="#4a4038" stroke={INK} strokeWidth={3} />
      <rect x={250} y={600} width={50} height={50} fill="#cfe6f2" stroke={INK} strokeWidth={2.5} />
      <g transform="translate(1540 520)" opacity={0.8}>
        <rect x={-20} y={0} width={40} height={140} fill={PAPERC} stroke={INK} strokeWidth={3} />
        <path d="M -20 0 L 0 -60 L 20 0 Z" fill="#7a8b98" stroke={INK} strokeWidth={3} />
        <line x1={0} y1={-60} x2={0} y2={-84} stroke={INK} strokeWidth={3} />
        <line x1={-10} y1={-72} x2={10} y2={-72} stroke={INK} strokeWidth={3} />
      </g>
      <ellipse cx={960} cy={650} rx={500} ry={140} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // the acemi/Janissary barracks courtyard — an arcade of domed barracks buildings, and THE
  // sensory-anchor prop: the regimental cauldron (kazan-i-serif) with steam rising — training,
  // corps identity, every officer-command beat; re-staged (same art, different Stage) for the mutiny
  janissaryBarracks: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#swarm)" />
      <rect x={0} y={740} width={1920} height={340} fill={FLOOR} /><line x1={0} y1={740} x2={1920} y2={740} stroke={INK} strokeWidth={5} />
      {Array.from({length: 7}).map((_, i) => {const x = i * 280; return (
        <g key={i} opacity={0.85}>
          <rect x={x} y={420} width={220} height={320} fill={PAPERC} stroke={INK} strokeWidth={3.5} />
          <path d={`M ${x - 10} 420 Q ${x + 110} 360 ${x + 230} 420`} fill="none" stroke={INK} strokeWidth={3} />
          <circle cx={x + 110} cy={400} r={30} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.85} />
        </g>
      );})}
      <g transform="translate(1500 900)">
        <path d="M -90 -20 Q -90 60 0 60 Q 90 60 90 -20 Z" fill="#4a4038" stroke={INK} strokeWidth={4} />
        <ellipse cx={0} cy={-20} rx={90} ry={22} fill="#5a4a38" stroke={INK} strokeWidth={4} />
        <path d={`M -20 -50 q ${8 + Math.sin(frame * 0.15) * 8} -30 -6 -50`} fill="none" stroke="#c9b98f" strokeWidth={5} opacity={0.5} />
        <path d={`M 20 -50 q ${-8 + Math.sin(frame * 0.17) * 8} -34 6 -54`} fill="none" stroke="#c9b98f" strokeWidth={5} opacity={0.4} />
      </g>
      <ellipse cx={960} cy={560} rx={600} ry={180} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // the Imperial Council chamber (Divan-i Humayun) — a low U-shaped divan bench, a domed ceiling,
  // and the VERIFIED Tower of Justice grille high on the far wall, a dim shadow behind it — no
  // vizier ever knows, in the moment, whether the throne is watching. Level 07's share-worthy beat.
  divanChamber: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#fdf3da" />
      <path d="M 0 340 Q 960 120 1920 340" fill="none" stroke={INK} strokeWidth={4} opacity={0.5} />
      {Array.from({length: 9}).map((_, i) => {const x = 140 + i * 210; return <line key={i} x1={960} y1={180} x2={x} y2={360} stroke={INK} strokeWidth={2} opacity={0.3} />;})}
      <rect x={0} y={760} width={1920} height={320} fill={FLOOR} /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <rect x={560} y={800} width={800} height={40} fill="#8a6a42" stroke={INK} strokeWidth={3.5} />
      <rect x={560} y={760} width={800} height={40} fill="#c0392b" opacity={0.4} />
      <g transform="translate(1560 260)">
        <rect x={-70} y={-90} width={140} height={180} fill="#3a3444" stroke={INK} strokeWidth={4} opacity={0.9} />
        {Array.from({length: 6}).map((_, i) => <line key={i} x1={-70 + i * 24} y1={-90} x2={-70 + i * 24} y2={90} stroke={GOLD} strokeWidth={2} opacity={0.55} />)}
        {Array.from({length: 6}).map((_, i) => <line key={i} x1={-70} y1={-90 + i * 36} x2={70} y2={-90 + i * 36} stroke={GOLD} strokeWidth={2} opacity={0.55} />)}
        <ellipse cx={0} cy={0} rx={30} ry={60} fill="#0d0b10" opacity={0.35 + 0.15 * Math.sin(frame * 0.05)} />
      </g>
      <ellipse cx={960} cy={520} rx={620} ry={200} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // the sultan's audience hall — a gold throne on its dais, heavy drapery, and a small silk-cord
  // case set on a low cushion in the foreground — the MID-ACTION cold open, the Grand Vizier apex,
  // and the loop-close payoff (VERIFIED: strangulation, never blood, was the custom for high office)
  sultanAudience: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a1f22" />
      <rect x={0} y={780} width={1920} height={300} fill="#1e1618" /><line x1={0} y1={780} x2={1920} y2={780} stroke="#000" strokeWidth={3} opacity={0.5} />
      {[220, 1700].map((x) => (
        <g key={x} opacity={0.85}>
          <rect x={x - 30} y={200} width={60} height={580} fill="#3a2a2c" stroke={INK} strokeWidth={3} />
          <rect x={x - 46} y={170} width={92} height={34} fill="#3a2a2c" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      <path d="M 700 160 Q 960 260 1220 160 L 1220 500 Q 960 440 700 500 Z" fill="#5c1f24" opacity={0.85} stroke={INK} strokeWidth={3} />
      <rect x={860} y={560} width={200} height={220} fill={GOLD} stroke={INK} strokeWidth={4} />
      <path d="M 860 560 L 890 400 L 1030 400 L 1060 560 Z" fill={GOLD} stroke={INK} strokeWidth={4} />
      <rect x={740} y={760} width={440} height={40} fill="#3a2a2c" stroke={INK} strokeWidth={3} />
      <g transform="translate(1360 900)">
        <ellipse cx={0} cy={20} rx={60} ry={16} fill="#5c1f24" stroke={INK} strokeWidth={3} opacity={0.8} />
        <rect x={-34} y={-16} width={68} height={34} rx={4} fill="#efe6cf" stroke={INK} strokeWidth={3} />
        <line x1={-10} y1={0} x2={10} y2={0} stroke="#c0392b" strokeWidth={3} opacity={0.7} />
      </g>
      <ellipse cx={960} cy={620} rx={460} ry={200} fill="url(#sglow)" opacity={0.35} />
    </g>
  ),
  // --- Pirate pack (pirate — Golden Age of Piracy) ---
  // a poor coastal fishing cove — a leaning shack, a patched-net dinghy pulled up on the sand, a
  // rickety jetty — Level 1, the named want, the origin AND the loop-close callback (older, same cove)
  fishingCove: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      <rect x={0} y={640} width={1920} height={440} fill="#9fc4d6" opacity={0.55} /><line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={3} opacity={0.4} />
      <rect x={0} y={860} width={1920} height={220} fill={FLOOR} /><line x1={0} y1={860} x2={1920} y2={860} stroke={INK} strokeWidth={5} />
      <rect x={220} y={620} width={280} height={180} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <path d="M 200 620 L 360 520 L 520 620 Z" fill="#8a6a42" stroke={INK} strokeWidth={4} />
      <rect x={310} y={700} width={70} height={100} fill="#4a4038" stroke={INK} strokeWidth={3} />
      <path d="M 1200 900 L 1200 640 L 1650 640" fill="none" stroke="#8a6a42" strokeWidth={10} strokeLinecap="round" />
      {[1260, 1340, 1420, 1500, 1580].map((x) => <line key={x} x1={x} y1={640} x2={x} y2={700} stroke="#6a5636" strokeWidth={8} />)}
      <path d="M 1440 900 Q 1560 860 1700 900 L 1690 950 Q 1560 920 1450 950 Z" fill="#c9a876" stroke={INK} strokeWidth={3.5} />
      <ellipse cx={960} cy={700} rx={560} ry={160} fill="url(#sglow)" opacity={0.3} />
    </g>
  ),
  // a merchant/pirate ship's working deck — mainmast rising out of frame, coiled rope, a capstan,
  // open ocean horizon — THE recurring master/home-base beat: the grind, every rank still stands here
  shipDeck: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#swarm)" />
      <rect x={0} y={520} width={1920} height={120} fill="#4f7ea3" opacity={0.6} /><line x1={0} y1={520} x2={1920} y2={520} stroke={INK} strokeWidth={3} opacity={0.4} />
      <rect x={0} y={640} width={1920} height={440} fill="#c9a876" /><line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={5} />
      {Array.from({length: 14}).map((_, i) => <line key={i} x1={i * 140} y1={640} x2={i * 140} y2={1080} stroke="#8a6a42" strokeWidth={2} opacity={0.4} />)}
      <line x1={1500} y1={1080} x2={1500} y2={140} stroke="#4a3a26" strokeWidth={26} />
      <path d={`M 1500 200 Q ${1500 + Math.sin(frame * 0.03) * 30 + 220} 260 ${1500 + Math.sin(frame * 0.03) * 10 + 300} 460 L 1500 500 Z`} fill={PAPERC} stroke={INK} strokeWidth={3} opacity={0.85} />
      <g transform="translate(760 900)">
        <ellipse cx={0} cy={0} rx={70} ry={22} fill="#6a5636" stroke={INK} strokeWidth={4} />
        <circle cx={0} cy={-30} r={14} fill="#4a3a26" stroke={INK} strokeWidth={3} />
      </g>
      <path d="M 300 980 Q 380 940 460 980 Q 380 1000 300 980 Z" fill="#8a6a42" stroke={INK} strokeWidth={3} opacity={0.7} />
      <ellipse cx={960} cy={560} rx={640} ry={160} fill="url(#sglow)" opacity={0.25} />
    </g>
  ),
  // broadside battle — a foreground cannon mid-recoil, powder smoke, a damaged enemy ship silhouette
  // on a stormy horizon — the danger escalation beat, the taking of a prize
  broadsideBattle: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#3a4048" />
      <rect x={0} y={560} width={1920} height={120} fill="#5a6a76" opacity={0.7} /><line x1={0} y1={560} x2={1920} y2={560} stroke={INK} strokeWidth={3} opacity={0.4} />
      <rect x={0} y={680} width={1920} height={400} fill="#8a9aa2" /><line x1={0} y1={680} x2={1920} y2={680} stroke={INK} strokeWidth={5} />
      <g transform="translate(1420 480)" opacity={0.85}>
        <path d="M -120 120 L -60 -60 L 90 -60 L 130 120 Z" fill="#2c3238" stroke={INK} strokeWidth={4} />
        <line x1={20} y1={-60} x2={20} y2={-220} stroke="#1c2126" strokeWidth={10} />
        <path d="M 20 -190 L 100 -140 L 20 -110 Z" fill="#4a5258" opacity={0.7} />
      </g>
      {/* the deck cannon sits well clear of CAPTION_SAFE_X=760 so the money card never buries it */}
      <g transform="translate(1180 940)">
        <rect x={-40} y={-30} width={200} height={60} rx={10} fill="#3a2a20" stroke={INK} strokeWidth={5} />
        <circle cx={-170} cy={0} r={34} fill="#1c1a18" stroke={INK} strokeWidth={4} />
        <ellipse cx={-220} cy={-10} rx={70} ry={40} fill="#e6dfd0" opacity={frame % 30 < 10 ? 0.7 : 0.15} />
      </g>
      {Array.from({length: 5}).map((_, i) => {const t = (frame * 3 + i * 60) % 300;
        return <circle key={i} cx={960 - i * 20} cy={430 - t * 0.4} r={20 + t * 0.15} fill="#cfd6da" opacity={Math.max(0, 0.5 - t / 300)} />;})}
      <ellipse cx={1200} cy={520} rx={620} ry={220} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // Nassau harbor — the Republic of Pirates, palm-lined colonial waterfront, tavern fronts, a forest
  // of anchored masts in the bay — the haven, the pardon offered, the loot spent fast between voyages
  nassauHarbor: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#sclean)" />
      <rect x={0} y={560} width={1920} height={160} fill="#7fb3c9" opacity={0.55} /><line x1={0} y1={560} x2={1920} y2={560} stroke={INK} strokeWidth={3} opacity={0.4} />
      {/* anchored ships in the bay: a small hull + a single mast each, so they read as boats, not stray sticks */}
      {[380, 560, 1400, 1620].map((x, i) => (
        <g key={i} opacity={0.75}>
          <path d={`M ${x - 34} 558 Q ${x} 578 ${x + 34} 558 L ${x + 24} 578 L ${x - 24} 578 Z`} fill="#4a3a26" stroke={INK} strokeWidth={2.5} />
          <line x1={x} y1={558} x2={x} y2={400} stroke="#5a4a34" strokeWidth={4} />
          <path d={`M ${x} 410 L ${x + (i % 2 ? 46 : -46)} 460 L ${x} 480 Z`} fill={PAPERC} stroke={INK} strokeWidth={2} opacity={0.85} />
        </g>
      ))}
      <rect x={0} y={720} width={1920} height={360} fill={FLOOR} /><line x1={0} y1={720} x2={1920} y2={720} stroke={INK} strokeWidth={5} />
      {[120, 420, 720, 1560].map((x, i) => (
        <g key={i} opacity={0.9}>
          <rect x={x} y={480} width={220} height={240} fill={i % 2 ? '#d8c8a8' : PAPERC} stroke={INK} strokeWidth={3.5} />
          <path d={`M ${x - 14} 480 L ${x + 110} 410 L ${x + 234} 480 Z`} fill="#8a5a3a" stroke={INK} strokeWidth={3} />
        </g>
      ))}
      {/* palm trees — a leaning trunk with a canopy of fronds radiating from the TOP, not the mid-trunk */}
      {[240, 1780].map((x, i) => (
        <g key={i} transform={`translate(${x} 720)`}>
          <path d={`M 0 0 Q ${i % 2 ? 30 : -30} -140 0 -260`} fill="none" stroke="#5a4a34" strokeWidth={12} strokeLinecap="round" />
          {[-40, 10, 60, 110, 160].map((ang, k) => {const a = (ang - 90) * Math.PI / 180;
            return <path key={k} d={`M 0 -260 Q ${Math.cos(a) * 60} ${-260 + Math.sin(a) * 60 - 20} ${Math.cos(a) * 130} ${-260 + Math.sin(a) * 130}`} fill="none" stroke="#4a7a3a" strokeWidth={9} strokeLinecap="round" />;})}
        </g>
      ))}
      <ellipse cx={960} cy={560} rx={680} ry={180} fill="url(#sglow)" opacity={0.25} />
    </g>
  ),
  // the captain's great cabin — a chart table with compass + dividers, an open treasure chest, wide
  // stern windows on the night sea — command's private authority, the apex, "own nothing you can spend"
  captainsCabin: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#241c1a" />
      <rect x={0} y={780} width={1920} height={300} fill="#3a2a20" /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={4} opacity={0.5} />
      <path d="M 1180 140 Q 1550 100 1780 260 L 1780 700 Q 1550 620 1180 660 Z" fill="#0d1620" stroke={INK} strokeWidth={5} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={1230 + i * 140} y1={150} x2={1230 + i * 140} y2={670} stroke="#4a3a2c" strokeWidth={6} />)}
      {Array.from({length: 30}).map((_, i) => <circle key={i} cx={1250 + rnd(i * 3) * 500} cy={200 + rnd(i * 5) * 400} r={1.4} fill="#fff" opacity={0.5} />)}
      <rect x={520} y={760} width={480} height={44} fill="#5a4230" stroke={INK} strokeWidth={4} />
      <rect x={560} y={720} width={200} height={44} rx={4} fill="#e8dcc0" stroke={INK} strokeWidth={2.5} />
      <path d="M 620 742 Q 660 720 700 742" fill="none" stroke="#c0392b" strokeWidth={2} opacity={0.7} />
      <g transform="translate(360 900)">
        <path d="M -80 20 L -80 -30 L 80 -30 L 80 20 Z" fill="#5a4230" stroke={INK} strokeWidth={4} />
        <path d="M -84 -30 Q 0 -70 84 -30" fill={GOLD} stroke={INK} strokeWidth={4} />
        <rect x={-50} y={-24} width={100} height={16} fill={GOLD} opacity={0.85} />
      </g>
      <ellipse cx={960} cy={520} rx={520} ry={220} fill="url(#sglow)" opacity={0.2} />
    </g>
  ),
  // marooned — a bare sandbar, a single leaning palm, an empty horizon in every direction — the real,
  // verified discipline (theft, cowardice, breaking the Articles): left alone with almost nothing
  marooned: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#sclean)" />
      <rect x={0} y={600} width={1920} height={200} fill="#7fb3c9" opacity={0.5} /><line x1={0} y1={600} x2={1920} y2={600} stroke={INK} strokeWidth={3} opacity={0.4} />
      <ellipse cx={960} cy={880} rx={620} ry={140} fill="#e6d5a8" stroke={INK} strokeWidth={4} />
      <g transform="translate(1380 780)">
        <path d={`M 0 260 Q ${10 + Math.sin(frame * 0.02) * 8} 60 0 -140`} fill="none" stroke="#6a5636" strokeWidth={12} />
        {[0, 1, 2, 3, 4].map((i) => {const a = (i / 5) * Math.PI - Math.PI / 2 + Math.sin(frame * 0.02) * 0.08;
          return <path key={i} d={`M 0 -140 Q ${Math.cos(a) * 90} ${-140 + Math.sin(a) * 60 - 40} ${Math.cos(a) * 150} ${-140 + Math.sin(a) * 90}`} fill="none" stroke="#4a7a3a" strokeWidth={8} />;})}
      </g>
      <g transform="translate(680 940)" opacity={0.8}>
        <ellipse cx={0} cy={10} rx={22} ry={9} fill="#8a6a42" stroke={INK} strokeWidth={2.5} />
      </g>
      <ellipse cx={960} cy={640} rx={700} ry={200} fill="url(#sglow)" opacity={0.15} />
    </g>
  ),
  // Execution Dock — a gallows frame + noose, a small crowd silhouette, a gibbet cage set off to the
  // side (VERIFIED: Kidd's body gibbeted at Tilbury Point) — the reckoning, the cold open + its payoff
  executionDock: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#3a3a3e" />
      <rect x={0} y={640} width={1920} height={100} fill="#5a6268" opacity={0.7} /><line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={3} opacity={0.4} />
      <rect x={0} y={740} width={1920} height={340} fill="#8a8478" /><line x1={0} y1={740} x2={1920} y2={740} stroke={INK} strokeWidth={5} />
      <g transform="translate(900 400)">
        <line x1={-160} y1={340} x2={-160} y2={0} stroke="#3a2a20" strokeWidth={16} />
        <line x1={160} y1={340} x2={160} y2={0} stroke="#3a2a20" strokeWidth={16} />
        <line x1={-180} y1={0} x2={180} y2={0} stroke="#3a2a20" strokeWidth={18} />
        <line x1={0} y1={0} x2={0} y2={70} stroke="#1c1a18" strokeWidth={5} />
        <circle cx={0} cy={90} r={22} fill="none" stroke="#1c1a18" strokeWidth={5} />
      </g>
      <g transform="translate(1500 560)" opacity={0.85}>
        <line x1={0} y1={0} x2={0} y2={-160} stroke="#3a2a20" strokeWidth={10} />
        <path d="M -30 -40 L 30 -40 L 30 -160 L -30 -160 Z" fill="none" stroke="#2a2420" strokeWidth={4} />
        {Array.from({length: 5}).map((_, i) => <line key={i} x1={-30} y1={-52 + i * 24} x2={30} y2={-52 + i * 24} stroke="#2a2420" strokeWidth={3} />)}
      </g>
      {/* the dim crowd — head + shoulders + legs so they read as watching figures, not lamp posts */}
      {Array.from({length: 10}).map((_, i) => {const x = 40 + i * 190;
        return (
          <g key={i} opacity={0.55}>
            <circle cx={x} cy={772} r={14} fill="#20242a" />
            <path d={`M ${x - 20} 850 Q ${x} 782 ${x + 20} 850`} fill="#20242a" />
            <line x1={x - 8} y1={850} x2={x - 8} y2={890} stroke="#20242a" strokeWidth={7} />
            <line x1={x + 8} y1={850} x2={x + 8} y2={890} stroke="#20242a" strokeWidth={7} />
          </g>
        );})}
      <ellipse cx={900} cy={420} rx={500} ry={180} fill="url(#sglow)" opacity={0.15} />
    </g>
  ),
  // --- Basketball pack (basketball_player) ---
  // the driveway hoop — Level 1's named want, the origin, the loop-close callback: a modest house
  // facade, a cracked concrete driveway, a chain-link fence, a hoop bolted above the garage door
  drivewayHoop: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      <rect x={0} y={720} width={1920} height={360} fill="#c9c2ad" /><line x1={0} y1={720} x2={1920} y2={720} stroke={INK} strokeWidth={5} />
      {Array.from({length: 6}).map((_, i) => <line key={i} x1={i * 340} y1={720} x2={i * 340 + 170} y2={1080} stroke={INK} strokeWidth={2} opacity={0.25} />)}
      <rect x={900} y={280} width={620} height={460} fill={PAPERC} stroke={INK} strokeWidth={5} />
      <path d="M 860 280 L 1210 100 L 1560 280 Z" fill="#8a5a3a" stroke={INK} strokeWidth={4} />
      <rect x={960} y={520} width={500} height={220} fill="#c9b98f" stroke={INK} strokeWidth={4} />
      {[1010, 1210, 1410].map((x) => <line key={x} x1={x} y1={520} x2={x} y2={740} stroke={INK} strokeWidth={2} opacity={0.4} />)}
      <rect x={80} y={640} width={2} height={0} />
      {Array.from({length: 14}).map((_, i) => <line key={i} x1={40 + i * 22} y1={620} x2={40 + i * 22} y2={720} stroke={INK} strokeWidth={2} opacity={0.3} />)}
      <HoopArt x={1210} y={340} scale={0.85} />
      <ellipse cx={1210} cy={500} rx={520} ry={160} fill="url(#sglow)" opacity={0.15} />
    </g>
  ),
  // the high school gym — polished court, a hoop + scoreboard, tiered bleachers with a dim crowd
  highSchoolGym: ({frame}) => (
    <g>
      {[0, 1, 2, 3].map((r) => <rect key={r} x={-20} y={120 + r * 66} width={1960} height={38} fill={PAPERC} stroke={INK} strokeWidth={2} opacity={0.6 - r * 0.08} />)}
      {Array.from({length: 48}).map((_, i) => <circle key={i} cx={40 + (i % 24) * 80} cy={148 + Math.floor(i / 24) * 66} r={7} fill={INK} opacity={0.25} />)}
      <rect x={0} y={640} width={1920} height={440} fill="#d8a860" /><line x1={0} y1={640} x2={1920} y2={640} stroke={INK} strokeWidth={5} />
      <circle cx={960} cy={900} r={110} fill="none" stroke={INK} strokeWidth={4} opacity={0.5} />
      <line x1={960} y1={640} x2={960} y2={1080} stroke={INK} strokeWidth={3} opacity={0.4} />
      <rect x={870} y={500} width={220} height={36} fill="#141820" stroke={INK} strokeWidth={4} />
      <text x={980} y={526} textAnchor="middle" fontFamily={SANS} fontSize={26} fontWeight={800} fill={GOLD}>42-40</text>
      <HoopArt x={1560} y={720} scale={0.75} />
      <ellipse cx={960} cy={780} rx={640} ry={200} fill="url(#sglow)" opacity={0.18} />
    </g>
  ),
  // the G League bus — rows of seats receding, a window streaming blurred highway lights past —
  // the grind, the recurring mentor's coach seat
  gLeagueBus: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#1c2026" />
      <path d="M 1150 60 L 1900 60 L 1900 640 L 1150 640 Z" fill="#0d1520" stroke={INK} strokeWidth={5} />
      {Array.from({length: 22}).map((_, i) => {
        const t = (frame * 3 + i * 90) % 900 - 200;
        return <ellipse key={i} cx={1180 + (i % 6) * 130} cy={90 + t} rx={10} ry={38} fill="#f2c14e" opacity={0.35} />;})}
      {[0, 1, 2, 3].map((r) => (
        <g key={r} transform={`translate(${140 + r * 260} 700)`}>
          <rect x={-70} y={-140} width={140} height={140} rx={10} fill={PAPERC} stroke={INK} strokeWidth={4} />
          <rect x={-70} y={20} width={140} height={40} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
        </g>
      ))}
      <rect x={0} y={840} width={1920} height={240} fill="#141820" /><line x1={0} y1={840} x2={1920} y2={840} stroke={INK} strokeWidth={4} opacity={0.5} />
      <ellipse cx={960} cy={500} rx={700} ry={220} fill="url(#sglow)" opacity={0.12} />
    </g>
  ),
  // the arena court — THE recurring master backdrop, relit differently across levels: a hanging
  // jumbotron/scoreboard, a packed dark bowl of stands, a polished center-court logo, spotlight beams
  arenaCourt: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#151a22" />
      {[0, 1, 2, 3, 4].map((r) => <rect key={r} x={-20} y={80 + r * 60} width={1960} height={34} fill="#20262e" stroke={INK} strokeWidth={2} opacity={0.7 - r * 0.09} />)}
      {Array.from({length: 70}).map((_, i) => <circle key={i} cx={30 + (i % 35) * 55} cy={100 + Math.floor(i / 35) * 60} r={5} fill="#3a4250" opacity={0.5} />)}
      <rect x={780} y={30} width={360} height={140} fill="#0d1015" stroke={INK} strokeWidth={5} />
      <text x={960} y={110} textAnchor="middle" fontFamily={SANS} fontSize={40} fontWeight={800} fill={GOLD}>{(88 + Math.floor(frame / 20) % 30)}-{(84 + Math.floor(frame / 24) % 30)}</text>
      <rect x={0} y={700} width={1920} height={380} fill="#8a5a34" /><line x1={0} y1={700} x2={1920} y2={700} stroke={INK} strokeWidth={5} />
      <circle cx={960} cy={940} r={130} fill="none" stroke={GOLD} strokeWidth={5} opacity={0.55} />
      <line x1={960} y1={700} x2={960} y2={1080} stroke={GOLD} strokeWidth={3} opacity={0.4} />
      <HoopArt x={200} y={780} scale={0.7} />
      <HoopArt x={1720} y={780} scale={0.7} />
      {[520, 1400].map((x, i) => <ellipse key={i} cx={x} cy={260} rx={200} ry={520} fill="url(#sglow)" opacity={0.14} />)}
    </g>
  ),
  // the ice tub / training room — THE sensory-anchor home base: a steel ice tub, rolled athletic
  // tape, cold blue-white light, a wall clock counting the minutes of every recovery.
  // The clock face used to always read "12" (reviewer defect: identical across all 4 uses despite
  // the narration escalating from one knee to a full training-staff routine). It now reads the
  // scene's own occurrence index — the minute count climbs each time this template repeats.
  iceBathRoom: ({frame}) => {
    const occ = React.useContext(SceneVariantContext);
    const minutes = Math.min(8 + occ * 3, 20);
    return (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#sclean)" />
      <rect x={0} y={760} width={1920} height={320} fill="#cfe0e6" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      <rect x={980} y={640} width={520} height={220} rx={18} fill="#dfeef2" stroke={INK} strokeWidth={5} />
      <ellipse cx={1240} cy={648} rx={250} ry={26} fill="#a9d2de" stroke={INK} strokeWidth={4} />
      {Array.from({length: 6}).map((_, i) => (
        <ellipse key={i} cx={1050 + i * 60 + Math.sin(frame * 0.05 + i) * 6} cy={648 + Math.cos(frame * 0.05 + i) * 3}
          rx={14} ry={9} fill="#fff" stroke={INK} strokeWidth={1.5} opacity={0.85} />
      ))}
      <rect x={1360} y={480} width={26} height={170} fill="#c9c2ad" stroke={INK} strokeWidth={3} />
      <circle cx={1373} cy={470} r={30} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <text x={1373} y={480} textAnchor="middle" fontFamily={SANS} fontSize={22} fontWeight={700} fill={INK}>{minutes}</text>
      {[300, 460].map((x) => <rect key={x} x={x} y={560} width={70} height={120} rx={10} fill={PAPERC} stroke={INK} strokeWidth={3.5} />)}
      <ellipse cx={1100} cy={560} rx={520} ry={180} fill="url(#sglow)" opacity={0.12} />
    </g>
    );
  },
  // rafters retirement — an empty, dim arena; one spotlight on the bare court below; a jersey banner
  // hanging still in the rafters — the flash-forward cold open + its loop-close payoff
  rafterRetirement: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#0d1015" />
      {[0, 1, 2, 3, 4].map((r) => <rect key={r} x={-20} y={60 + r * 60} width={1960} height={32} fill="#161b22" stroke={INK} strokeWidth={2} opacity={0.5 - r * 0.06} />)}
      <rect x={0} y={720} width={1920} height={360} fill="#241c18" opacity={0.9} /><line x1={0} y1={720} x2={1920} y2={720} stroke={INK} strokeWidth={4} opacity={0.4} />
      <g transform="translate(1140 60)">
        <line x1={0} y1={0} x2={0} y2={-60} stroke="#2a2420" strokeWidth={6} />
        <rect x={-70} y={0} width={140} height={200} fill="#171a20" stroke={GOLD} strokeWidth={4} />
        <text x={0} y={70} textAnchor="middle" fontFamily={SANS} fontSize={44} fontWeight={800} fill={GOLD}>07</text>
        <text x={0} y={160} textAnchor="middle" fontFamily={SANS} fontSize={20} fontWeight={700} fill={GOLD} opacity={0.85}>RETIRED</text>
      </g>
      <ellipse cx={960} cy={900} rx={280} ry={90} fill="url(#sglow)" opacity={0.35} />
      <ellipse cx={960} cy={260} rx={180} ry={480} fill="url(#sglow)" opacity={0.1} />
    </g>
  ),
  // --- Motorsport pack (f1_driver) ---
  // the kart track — Level 1's named want, the origin, the loop-close callback: a scrappy local
  // asphalt circuit, a painted curb, a thin roadside barrier, two other kids' karts in the distance
  kartTrack: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#spaper)" />
      <rect x={0} y={660} width={1920} height={420} fill="#3a3f46" /><line x1={0} y1={660} x2={1920} y2={660} stroke={INK} strokeWidth={5} />
      {Array.from({length: 16}).map((_, i) => <rect key={i} x={i * 130} y={654} width={65} height={10} fill={i % 2 ? '#fff' : '#222'} />)}
      <rect x={0} y={1000} width={1920} height={80} fill="#8fa0ac" opacity={0.55} />
      {Array.from({length: 14}).map((_, i) => <rect key={i} x={30 + i * 140} y={1004} width={70} height={18} fill={i % 2 ? '#c0392b' : '#fff'} stroke={INK} strokeWidth={1} opacity={0.75} />)}
      <rect x={0} y={560} width={1920} height={100} fill="#c9c2ad" opacity={0.9} /><line x1={0} y1={560} x2={1920} y2={560} stroke={INK} strokeWidth={3} opacity={0.35} />
      {Array.from({length: 30}).map((_, i) => <line key={i} x1={i * 66} y1={560} x2={i * 66} y2={660} stroke={INK} strokeWidth={2} opacity={0.15} />)}
      <g transform="translate(1420 990) scale(0.55)"><RaceCarArt livery="#2e6f95" /></g>
      <g transform="translate(1640 986) scale(0.4)" opacity={0.5}><RaceCarArt livery="#5a8a3f" /></g>
      <ellipse cx={960} cy={800} rx={760} ry={220} fill="url(#sglow)" opacity={0.12} />
    </g>
  ),
  // the paddock garage — the F4/F3/F2 grind: a cramped concrete bay, stacked slick tires, a toolbox,
  // the car up on stands mid-strip — the family's debt made physical
  paddockGarage: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#20242a" />
      <rect x={0} y={780} width={1920} height={300} fill="#2b3038" /><line x1={0} y1={780} x2={1920} y2={780} stroke={INK} strokeWidth={4} opacity={0.5} />
      {Array.from({length: 6}).map((_, i) => <rect key={i} x={40 + i * 300} y={200} width={40} height={580} fill="#171a1f" opacity={0.35} />)}
      <rect x={1300} y={640} width={280} height={140} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <rect key={i} x={1320 + i * 90} y={660} width={70} height={100} fill="#c9c2ad" stroke={INK} strokeWidth={2} opacity={0.6} />)}
      <g transform="translate(700 940) scale(1.1)"><RaceCarArt livery="#e8b54b" /></g>
      <rect x={560} y={640} width={280} height={12} fill="#3a4048" />
      {Array.from({length: 14}).map((_, i) => <circle key={i} cx={80 + (i % 7) * 40} cy={900 + Math.floor(i / 7) * 70} r={26} fill="#171a1f" stroke={INK} strokeWidth={3} opacity={0.7} />)}
      <ellipse cx={960} cy={400} rx={600} ry={260} fill="url(#sglow)" opacity={0.1} />
    </g>
  ),
  // the grid walk — sponsor banners overhead, a formation of receding cars, a crowd behind barriers —
  // the F1 debut / rookie-race pressure beat
  gridWalk: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#swarm)" />
      <rect x={0} y={0} width={1920} height={140} fill="#151a20" />
      {Array.from({length: 9}).map((_, i) => <rect key={i} x={i * 220} y={0} width={110} height={140} fill={i % 2 ? '#c0392b' : '#e8b54b'} opacity={0.75} />)}
      <rect x={0} y={700} width={1920} height={380} fill="#4a4f56" /><line x1={0} y1={700} x2={1920} y2={700} stroke={INK} strokeWidth={5} />
      {[0, 1].map((r) => Array.from({length: 5}).map((_, i) => (
        <g key={`${r}-${i}`} transform={`translate(${1500 - i * 180 - r * 90} ${900 + r * 10}) scale(0.42)`} opacity={0.55}>
          <RaceCarArt livery={i % 2 ? '#2e6f95' : '#5a8a3f'} />
        </g>)))}
      {Array.from({length: 40}).map((_, i) => <circle key={i} cx={20 + (i % 20) * 96} cy={780 + Math.floor(i / 20) * 40} r={9} fill={INK} opacity={0.18} />)}
      <ellipse cx={960} cy={780} rx={800} ry={220} fill="url(#sglow)" opacity={0.14} />
    </g>
  ),
  // the pit wall — a bank of timing screens, headset cable, live lap times — team command, strategy,
  // the radio call that ends a season
  pitWall: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#171a20" />
      <rect x={620} y={90} width={680} height={420} fill="#0d1015" stroke={INK} strokeWidth={5} />
      {Array.from({length: 12}).map((_, i) => (
        <g key={i}>
          <rect x={650 + (i % 4) * 160} y={120 + Math.floor(i / 4) * 130} width={140} height={100} fill="#141820" stroke={GOLD} strokeWidth={2} opacity={0.5} />
          <text x={720 + (i % 4) * 160} y={175 + Math.floor(i / 4) * 130} textAnchor="middle" fontFamily={SANS} fontSize={22} fontWeight={700} fill={GOLD} opacity={0.7}>{`1:${18 + (i * 7) % 40}`}</text>
        </g>))}
      <rect x={0} y={760} width={1920} height={320} fill="#2a2f36" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={4} opacity={0.5} />
      <ellipse cx={960} cy={500} rx={640} ry={260} fill="url(#sglow)" opacity={0.1} />
    </g>
  ),
  // the cockpit — THE recurring sensory-anchor home base: a halo bar overhead, a five-point harness
  // cinched across the chest, tunnel-vision framing — tightens at every level-up
  cockpitClose: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#11151b" />
      <path d="M 200 1080 L 260 620 Q 300 340 960 300 Q 1620 340 1660 620 L 1720 1080 Z" fill="#0a0d12" />
      <path d="M 878 812 L 960 850 L 1042 812" fill="none" stroke="#3a2020" strokeWidth={24} strokeLinecap="round" />
      <path d="M 878 812 L 960 850 L 1042 812" fill="none" stroke="#c0392b" strokeWidth={10} strokeLinecap="round" opacity={0.9} />
      <rect x={800} y={848} width={320} height={34} fill="#3a2020" stroke={INK} strokeWidth={4} />
      <rect x={860} y={830} width={200} height={20} fill="#c0392b" opacity={0.85} />
      <circle cx={960} cy={848} r={20} fill="#2a2620" stroke={GOLD} strokeWidth={4} />
      <path d="M 700 180 Q 960 130 1220 180 L 1220 230 Q 960 190 700 230 Z" fill="none" stroke={GOLD} strokeWidth={6} opacity={0.7} />
      <ellipse cx={960} cy={600} rx={700} ry={420} fill="url(#sglow)" opacity={0.08} />
    </g>
  ),
  // the podium — three trophy steps, champagne spray, drifting confetti — the win, the apex, made real
  podiumSpray: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#swarm)" />
      {[0, 1, 2].map((i) => {const h = [220, 300, 180][i]; const x = [560, 900, 1260][i];
        return <g key={i}><rect x={x} y={1080 - h} width={260} height={h} fill={PAPERC} stroke={INK} strokeWidth={5} />
        <text x={x + 130} y={1080 - h + 50} textAnchor="middle" fontFamily={SANS} fontSize={40} fontWeight={800} fill={GOLD}>{[2, 1, 3][i]}</text></g>;})}
      {Array.from({length: 30}).map((_, i) => {const t = (frame * 4 + i * 37) % 700; return <circle key={i} cx={200 + (i * 63) % 1600} cy={t} r={4} fill={i % 3 ? GOLD : '#fff'} opacity={0.6} />;})}
      <rect x={870} y={640} width={180} height={20} fill="#c9c2ad" opacity={0.4} />
      <ellipse cx={960} cy={500} rx={800} ry={260} fill="url(#sglow)" opacity={0.16} />
    </g>
  ),
  // the crash barrier — a car against the tire wall, yellow marshal flags, dust — the danger beat, the
  // midpoint reversal, the reminder every level still carries the same real risk
  crashBarrier: ({frame}) => (
    <g>
      <rect x={0} y={0} width={1920} height={1080} fill="#2a2e34" />
      <rect x={0} y={760} width={1920} height={320} fill="#4a4f56" /><line x1={0} y1={760} x2={1920} y2={760} stroke={INK} strokeWidth={5} />
      {Array.from({length: 8}).map((_, i) => <circle key={i} cx={1500 + (i % 2) * 40} cy={700 + Math.floor(i / 2) * 70} r={34} fill="#171a1f" stroke={INK} strokeWidth={3} opacity={0.85} />)}
      <g transform="translate(1300 900) scale(0.7) rotate(18)"><RaceCarArt livery="#c0392b" /></g>
      {Array.from({length: 5}).map((_, i) => <rect key={i} x={200 + i * 90} y={640} width={70} height={30} fill="#e8b54b" opacity={0.85} transform={`rotate(${(frame * 0.5 + i * 7) % 4 - 2} ${235 + i * 90} 655)`} />)}
      <ellipse cx={1300} cy={820} rx={420} ry={200} fill="url(#svig)" opacity={0.3} />
      <ellipse cx={700} cy={500} rx={500} ry={260} fill="url(#sglow)" opacity={0.08} />
    </g>
  ),
};
// tiny helper so inline math reads cleanly above
function y_(v: number) {return v;}

// =================== PROPS (mid plane) ===================
// side-profile rear-loader garbage truck (cab + compactor body + rear hopper + exhaust stack), in
// local coords with the origin at the wheel/ground-contact line — a shared illustration so any scene
// that needs "the" truck (dawnRoute's foreground prop, truckYard's depot fleet) draws the same
// detailed art at whatever position/scale it needs instead of each authoring its own silhouette
// (reviewer fix: truckYard previously used a plain boxy stand-in that didn't match dawnRoute's truck).
const WasteTruckArt: React.FC<{opacity?: number}> = ({opacity = 1}) => (
  <g opacity={opacity}>
    <rect x={-305} y={-244} width={640} height={186} rx={8} fill={PAPERC} stroke={INK} strokeWidth={5} />
    <path d="M 335 -244 L 425 -244 L 445 -168 L 425 -58 L 335 -58 Z" fill={PAPERC} stroke={INK} strokeWidth={5} />
    <rect x={423} y={-74} width={18} height={26} fill="#c0392b" stroke={INK} strokeWidth={2} />
    <path d="M -445 -58 L -445 -168 L -385 -234 L -305 -234 L -305 -58 Z" fill={PAPERC} stroke={INK} strokeWidth={5} />
    <path d="M -425 -172 L -391 -222 L -319 -222 L -319 -172 Z" fill="#c9d3d8" stroke={INK} strokeWidth={4} />
    <line x1={-455} y1={-284} x2={-455} y2={-234} stroke={INK} strokeWidth={5} />
    {[-205, -85, 35, 155, 255].map((x) => <line key={x} x1={x} y1={-244} x2={x} y2={-58} stroke={INK} strokeWidth={2} opacity={0.4} />)}
    {[-365, 55, 295].map((x) => <g key={x}><circle cx={x} cy={-54} r={54} fill={PAPERC} stroke={INK} strokeWidth={6} /><circle cx={x} cy={-54} r={19} fill="#c9b98f" stroke={INK} strokeWidth={3} /></g>)}
  </g>
);
const PROP: Record<string, React.FC<{frame: number}>> = {
  // a side-profile pickup — the narco convoy truck; sits in FRONT of the figure (figBehind) so the
  // figure reads as standing beside / behind it. Reusable vehicle primitive (per improvements ledger).
  narcoTruck: ({frame}) => (
    <g>
      {/* bed + cab body */}
      <path d="M 560 900 L 560 800 L 980 800 L 1010 720 L 1180 720 L 1240 800 L 1360 800 L 1360 900 Z" fill={PAPERC} stroke={INK} strokeWidth={5} />
      {/* cab window */}
      <path d="M 1030 795 L 1055 740 L 1170 740 L 1215 795 Z" fill="#c9d3d8" stroke={INK} strokeWidth={4} />
      {/* bed rail */}
      <line x1={560} y1={800} x2={980} y2={800} stroke={INK} strokeWidth={4} />
      <rect x={600} y={760} width={40} height={40} fill="none" stroke={INK} strokeWidth={3} opacity={0.6} />
      {/* wheels */}
      {[700, 1240].map((x) => <g key={x}><circle cx={x} cy={900} r={62} fill={PAPERC} stroke={INK} strokeWidth={6} /><circle cx={x} cy={900} r={22} fill="#c9b98f" stroke={INK} strokeWidth={4} /></g>)}
      <line x1={1360} y1={840} x2={1400} y2={840} stroke={INK} strokeWidth={4} />
    </g>
  ),
  // a side-profile rear-loader garbage truck — cab + compactor body + rear hopper + exhaust stack.
  // Reusable vehicle primitive for the waste-hauling pack (per improvements ledger).
  wasteTruck: () => (
    <g transform="translate(925 960)"><WasteTruckArt /></g>
  ),
  operatingTable: ({frame}) => (
    <g>
      <rect x={620} y={720} width={680} height={36} rx={10} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {/* patient under drape */}
      <path d={`M 660 720 q 300 -70 600 0`} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <line x1={960} y1={700} x2={960} y2={724} stroke="#c0392b" strokeWidth={3} opacity={0.6} />
      <rect x={700} y={756} width={20} height={120} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={1200} y={756} width={20} height={120} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {/* instrument tray */}
      <rect x={1320} y={690} width={150} height={20} rx={4} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[1340, 1370, 1400, 1430].map((x) => <line key={x} x1={x} y1={690} x2={x + 8} y2={660} stroke={INK} strokeWidth={2.5} />)}
    </g>
  ),
  podium: ({frame}) => (
    <g>
      <path d="M 880 760 L 1040 760 L 1020 940 L 900 940 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={868} y={744} width={184} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {/* mic */}
      <line x1={1000} y1={744} x2={1014} y2={690} stroke={INK} strokeWidth={3} /><circle cx={1016} cy={684} r={9} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // podium topped with the gold "award shaped like a truck" (t26 industry award beat, reviewer fix:
  // this used to share the bare podium prop with t28's foundation ribbon-cutting and read identical)
  podiumTrophy: ({frame}) => (
    <g>
      <path d="M 880 760 L 1040 760 L 1020 940 L 900 940 Z" fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={868} y={744} width={184} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {/* trophy cup on the podium ledge, gold-plated per narration */}
      <rect x={944} y={706} width={32} height={38} fill={GOLD} stroke={INK} strokeWidth={3} />
      <path d="M 916 660 Q 916 706 960 706 Q 1004 706 1004 660 L 1004 634 L 916 634 Z" fill={GOLD} stroke={INK} strokeWidth={4} />
      <path d="M 916 642 Q 892 642 892 668 Q 892 690 916 690" fill="none" stroke={INK} strokeWidth={4} />
      <path d="M 1004 642 Q 1028 642 1028 668 Q 1028 690 1004 690" fill="none" stroke={INK} strokeWidth={4} />
      {/* tiny truck silhouette engraved on the cup face — "an award shaped like a truck" */}
      <g transform="translate(930 656) scale(0.46)">
        <rect x={0} y={20} width={56} height={24} fill={INK} opacity={0.85} />
        <path d="M 56 44 L 56 20 L 70 20 L 78 34 L 78 44 Z" fill={INK} opacity={0.85} />
        <circle cx={14} cy={46} r={8} fill={INK} opacity={0.85} /><circle cx={64} cy={46} r={8} fill={INK} opacity={0.85} />
      </g>
      {/* chrome-reflection glint the narration name-checks */}
      <circle cx={932} cy={648} r={5 + Math.sin(frame * 0.3) * 2} fill="#fff8d8" opacity={0.85} />
      <line x1={1000} y1={744} x2={1014} y2={690} stroke={INK} strokeWidth={3} /><circle cx={1016} cy={684} r={9} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // ribbon-cutting + donor plaque (t28 foundation beat, reviewer fix: give it a distinct silhouette
  // from t26's award podium instead of reusing the bare podium prop for both)
  ribbonPlaque: ({frame}) => (
    <g>
      <rect x={760} y={700} width={16} height={220} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1144} y={700} width={16} height={220} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {/* ribbon strung between the posts, cut at center */}
      <path d="M 776 786 Q 860 796 930 790" fill="none" stroke="#c0392b" strokeWidth={12} />
      <path d="M 990 790 Q 1060 796 1144 786" fill="none" stroke="#c0392b" strokeWidth={12} />
      {/* scissors at the cut */}
      <g transform={`translate(960 788) rotate(${18 + Math.sin(frame * 0.2) * 4})`}>
        <line x1={-26} y1={-10} x2={26} y2={10} stroke={INK} strokeWidth={4} />
        <line x1={-26} y1={10} x2={26} y2={-10} stroke={INK} strokeWidth={4} />
        <circle cx={-26} cy={-10} r={7} fill="none" stroke={INK} strokeWidth={3} />
        <circle cx={-26} cy={10} r={7} fill="none" stroke={INK} strokeWidth={3} />
      </g>
      {/* donor plaque with the founding-donor lines */}
      <rect x={860} y={840} width={200} height={94} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[0, 1, 2, 3].map((i) => <line key={i} x1={882} y1={864 + i * 18} x2={1038} y2={864 + i * 18} stroke={INK} strokeWidth={2} opacity={i === 0 ? 0.9 : 0.45} />)}
    </g>
  ),
  scrubSink: ({frame}) => (
    <g>
      <rect x={760} y={640} width={400} height={80} rx={10} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <line x1={960} y1={640} x2={960} y2={590} stroke={INK} strokeWidth={4} /><path d="M 960 590 q 0 -20 36 -20" fill="none" stroke={INK} strokeWidth={4} />
      {[0, 1, 2].map((i) => <line key={i} x1={996 + i * 4} y1={576} x2={996 + i * 4} y2={620 + Math.sin(frame * 0.3 + i) * 6} stroke="#9fc3e0" strokeWidth={2} opacity={0.7} />)}
    </g>
  ),
  bench: ({frame}) => (
    <g>
      <rect x={640} y={700} width={640} height={28} rx={5} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={680} y={728} width={18} height={150} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={1222} y={728} width={18} height={150} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {/* laptop on the bench */}
      <path d="M 900 700 L 1020 700 L 1010 648 L 910 648 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
      <rect x={912} y={596} width={96} height={56} rx={4} fill="#f0ebdd" stroke={INK} strokeWidth={3} />
    </g>
  ),
  mapTable: ({frame}) => (
    <g>
      <rect x={620} y={720} width={680} height={120} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={660} y={690} width={600} height={40} fill="#eef2f4" stroke={INK} strokeWidth={3} transform="skewX(-6)" />
      {/* map marks */}
      {[760, 900, 1040, 1160].map((x, i) => <circle key={x} cx={x} cy={712} r={6} fill={i % 2 ? '#c0392b' : GOLD} opacity={0.7 + 0.3 * Math.sin(frame * 0.2 + i)} />)}
      <path d="M 720 712 Q 900 690 1180 712" fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />
    </g>
  ),
  medalPodium: ({frame}) => (
    <g>
      <rect x={760} y={700} width={130} height={180} fill={PAPERC} stroke={INK} strokeWidth={4} /><text x={825} y={800} textAnchor="middle" fontFamily={SANS} fontSize={56} fontWeight={800} fill={INK}>2</text>
      <rect x={895} y={640} width={130} height={240} fill={GOLD} stroke={INK} strokeWidth={4} /><text x={960} y={770} textAnchor="middle" fontFamily={SANS} fontSize={64} fontWeight={800} fill={INK}>1</text>
      <rect x={1030} y={740} width={130} height={140} fill={PAPERC} stroke={INK} strokeWidth={4} /><text x={1095} y={820} textAnchor="middle" fontFamily={SANS} fontSize={50} fontWeight={800} fill={INK}>3</text>
    </g>
  ),
  ipoBell: ({frame}) => (
    <g>
      <rect x={910} y={560} width={100} height={20} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <path d="M 935 560 Q 935 470 985 470 Q 1035 470 1035 560 Z" fill={GOLD} stroke={INK} strokeWidth={4} transform={`rotate(${Math.sin(frame * 0.4) * 8} 985 470)`} />
      <line x1={985} y1={580} x2={985} y2={620} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // trading desk: low strip + two small terminals the figure sits behind
  deskTerminals: ({frame}) => (
    <g>
      <rect x={600} y={782} width={720} height={28} rx={5} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[700, 1140].map((x) => <g key={x}><rect x={x} y={690} width={120} height={86} rx={4} fill="#10151b" stroke={INK} strokeWidth={3} />
        <polyline points={`${x + 12},${752} ${x + 42},${720 + Math.sin(frame * 0.2 + x) * 4} ${x + 72},${740} ${x + 108},${708}`} fill="none" stroke="#5bbf7a" strokeWidth={2.5} />
        <rect x={x + 52} y={776} width={16} height={14} fill={PAPERC} stroke={INK} strokeWidth={2} /></g>)}
    </g>
  ),
  // scale architectural model of a development on a table — the developer / fund planning
  scaleModel: ({frame}) => (
    <g>
      <rect x={560} y={760} width={800} height={36} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={600} y={796} width={20} height={120} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={1300} y={796} width={20} height={120} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[{x: 660, h: 90}, {x: 740, h: 150}, {x: 824, h: 70}, {x: 902, h: 200}, {x: 1004, h: 120}, {x: 1092, h: 162}, {x: 1182, h: 92}, {x: 1252, h: 130}].map((b, i) => (
        <g key={i}><rect x={b.x} y={760 - b.h} width={56} height={b.h} fill={PAPERC} stroke={INK} strokeWidth={3} />
          {Array.from({length: Math.floor(b.h / 30)}).map((_, r) => <line key={r} x1={b.x} y1={760 - b.h + 18 + r * 30} x2={b.x + 56} y2={760 - b.h + 18 + r * 30} stroke={INK} strokeWidth={1.5} opacity={0.5} />)}</g>))}
    </g>
  ),
  // dead-drop parcel left at the wall
  package: ({frame}) => (
    <g><rect x={900} y={700} width={120} height={80} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} /><line x1={960} y1={700} x2={960} y2={780} stroke={INK} strokeWidth={3} /><line x1={900} y1={740} x2={1020} y2={740} stroke={INK} strokeWidth={3} /></g>
  ),
  // bare table + a folder under the bulb — recruiting / debriefing an asset
  interrogTable: ({frame}) => (
    <g>
      <rect x={760} y={740} width={400} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={780} y={766} width={16} height={110} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={1124} y={766} width={16} height={110} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <rect x={900} y={712} width={120} height={28} fill={PAPERC} stroke={INK} strokeWidth={3} transform="skewX(-8)" />
    </g>
  ),
  // sacrificial altar with a flame — the oath (sacramentum)
  altar: ({frame}) => (
    <g>
      <rect x={870} y={720} width={180} height={118} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={850} y={700} width={220} height={24} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={850} y={838} width={220} height={20} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <ellipse cx={960} cy={688} rx={70} ry={28} fill="url(#sglow)" opacity={0.8} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${940 + k * 20} 700 q ${-4 + Math.sin(frame * 0.3 + k) * 5} -34 4 -58`} fill="none" stroke={GOLD} strokeWidth={4} opacity={0.8} />)}
    </g>
  ),
  // the triumphal chariot (a quadriga) — the triumph. Figure (figBehind) stands inside the car.
  chariot: ({frame}) => (
    <g>
      {/* big wheel, drawn first so the car overlaps it */}
      <circle cx={900} cy={828} r={74} fill={PAPERC} stroke={INK} strokeWidth={5} /><circle cx={900} cy={828} r={10} fill={INK} />
      {[0, 1, 2, 3, 4, 5].map((i) => <line key={i} x1={900} y1={828} x2={900 + 74 * Math.cos(i * Math.PI / 3)} y2={828 + 74 * Math.sin(i * Math.PI / 3)} stroke={INK} strokeWidth={4} />)}
      {/* the car: a gold-rimmed basket the figure rides in */}
      <path d="M 792 812 L 1012 812 Q 1024 748 992 716 L 812 716 Q 786 748 792 812 Z" fill={GOLD} stroke="none" opacity={0.5} />
      <path d="M 792 812 L 1012 812 Q 1024 748 992 716 L 812 716 Q 786 748 792 812 Z" fill="none" stroke={INK} strokeWidth={5} />
      <path d="M 992 716 q 30 -8 22 -42" fill="none" stroke={INK} strokeWidth={4} />
      {/* draw-pole forward to the team */}
      <line x1={1006} y1={794} x2={1118} y2={742} stroke={INK} strokeWidth={5} />
      {/* the four-horse team (two clean profiles, overlapping) facing right */}
      {[{hx: 1140, o: 1}, {hx: 1174, o: 0.78}].map(({hx, o}, idx) => {const hy = 724; return (
        <g key={idx} opacity={o}>
          <ellipse cx={hx} cy={hy} rx={66} ry={24} fill={PAPERC} stroke={INK} strokeWidth={4} />
          <path d={`M ${hx + 50} ${hy - 12} Q ${hx + 92} ${hy - 30} ${hx + 96} ${hy - 66}`} fill="none" stroke={INK} strokeWidth={13} strokeLinecap="round" />
          <ellipse cx={hx + 101} cy={hy - 72} rx={20} ry={12} fill={PAPERC} stroke={INK} strokeWidth={4} transform={`rotate(-18 ${hx + 101} ${hy - 72})`} />
          <line x1={hx + 92} y1={hy - 82} x2={hx + 86} y2={hy - 96} stroke={INK} strokeWidth={3} />
          {[-44, -16, 28, 52].map((dx) => <line key={dx} x1={hx + dx} y1={hy + 20} x2={hx + dx} y2={hy + 72} stroke={INK} strokeWidth={5} strokeLinecap="round" />)}
          <path d={`M ${hx - 64} ${hy - 6} q -24 12 -18 48`} fill="none" stroke={INK} strokeWidth={5} />
        </g>);})}
    </g>
  ),
  // low banquet table with a lit candle and two wine cups — the feast (used by the Roman banquet)
  banquetTable: ({frame}) => (
    <g>
      <rect x={760} y={700} width={400} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={786} y={726} width={16} height={70} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={1118} y={726} width={16} height={70} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {/* candle + flame */}
      <rect x={954} y={664} width={12} height={36} fill="#e9eef4" stroke={INK} strokeWidth={2} />
      <ellipse cx={960} cy={656} rx={7} ry={13} fill={GOLD} opacity={0.85} />
      {[0, 1].map((k) => <path key={k} d={`M ${956 + k * 8} 656 q ${-3 + Math.sin(frame * 0.3 + k) * 4} -20 3 -36`} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.7} />)}
      {/* two wine cups */}
      {[836, 1060].map((x) => <path key={x} d={`M ${x} 684 q 12 24 24 0 Z`} fill={GOLD} stroke={INK} strokeWidth={3} opacity={0.6} />)}
    </g>
  ),
  // the boss's long banquet table seen head-on: plates + candles (figure at the head, extras dim on the sides)
  longTable: ({frame}) => (
    <g>
      <rect x={520} y={720} width={880} height={34} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={540} y={754} width={840} height={120} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[640, 780, 920, 1060, 1200].map((x) => <ellipse key={x} cx={x} cy={716} rx={34} ry={12} fill={PAPERC} stroke={INK} strokeWidth={3} />)}
      {[720, 1120].map((x) => <g key={x}><rect x={x} y={678} width={10} height={38} fill="#efe8d6" stroke={INK} strokeWidth={2} /><ellipse cx={x + 5} cy={670} rx={6} ry={11} fill={GOLD} opacity={0.85} /></g>)}
    </g>
  ),
  // the intimate dinner table: red-check cloth, a candle, two wine glasses — the sit-down / the restaurant hit
  dinerTable: ({frame}) => (
    <g>
      <rect x={700} y={720} width={520} height={30} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={716} y={750} width={488} height={110} fill={PAPERC} stroke={INK} strokeWidth={3} />
      {Array.from({length: 8}).map((_, c) => <line key={'v' + c} x1={716 + c * 61} y1={750} x2={716 + c * 61} y2={860} stroke="#a23a3a" strokeWidth={2} opacity={0.32} />)}
      {[0, 1].map((r) => <line key={'h' + r} x1={716} y1={786 + r * 38} x2={1204} y2={786 + r * 38} stroke="#a23a3a" strokeWidth={2} opacity={0.32} />)}
      <rect x={954} y={676} width={12} height={44} fill="#efe8d6" stroke={INK} strokeWidth={2} /><ellipse cx={960} cy={666} rx={7} ry={13} fill={GOLD} opacity={0.85} />
      {[0, 1].map((k) => <path key={k} d={`M ${957 + k * 6} 666 q ${-3 + Math.sin(frame * 0.3 + k) * 4} -18 3 -34`} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.7} />)}
      {[836, 1084].map((x) => <g key={x}><path d={`M ${x} 690 q 12 26 24 0 Z`} fill="#a23a3a" stroke={INK} strokeWidth={3} opacity={0.5} /><line x1={x + 12} y1={708} x2={x + 12} y2={722} stroke={INK} strokeWidth={2} /></g>)}
    </g>
  ),
  // the dinner table with the far seat EMPTY: same red-check table, but an unoccupied chair pulled
  // up to the far place setting — "the chair is empty" made visually true (the rat reveal)
  dinerTableEmptySeat: ({frame}) => (
    <g>
      {React.createElement(PROP.dinerTable, {frame})}
      {/* empty chair at the far seat: backrest, seat, legs — nobody in it */}
      <rect x={1348} y={596} width={16} height={172} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1246} y={756} width={114} height={16} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <line x1={1258} y1={772} x2={1258} y2={856} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={1352} y1={768} x2={1352} y2={856} stroke={INK} strokeWidth={4} strokeLinecap="round" />
      <line x1={1258} y1={820} x2={1352} y2={820} stroke={INK} strokeWidth={3} opacity={0.6} />
    </g>
  ),
  // the saint's card held to a flame at chest height — the omertà oath (figBehind so it reads as held)
  saintCard: ({frame}) => (
    <g>
      <rect x={904} y={628} width={112} height={150} rx={6} fill="#efe8d6" stroke={INK} strokeWidth={4} />
      <circle cx={960} cy={678} r={26} fill="none" stroke={INK} strokeWidth={3} /><path d="M 934 678 q 26 -34 52 0" fill="none" stroke={INK} strokeWidth={2} opacity={0.6} /><path d="M 926 742 q 34 -30 68 0" fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
      <ellipse cx={960} cy={628} rx={44} ry={28} fill="url(#sglow)" opacity={0.8} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${944 + k * 16} 638 q ${-4 + Math.sin(frame * 0.35 + k) * 6} -30 4 -56`} fill="none" stroke="#c0392b" strokeWidth={4} opacity={0.75} />)}
    </g>
  ),
  // the boss's desk + a high-back chair (figBehind sits in the chair behind it)
  bigDesk: ({frame}) => (
    <g>
      <rect x={900} y={560} width={120} height={210} rx={16} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={640} y={740} width={640} height={40} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={680} y={780} width={560} height={100} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <line x1={1180} y1={740} x2={1180} y2={694} stroke={INK} strokeWidth={3} /><path d="M 1180 694 q 0 -14 30 -14" fill="none" stroke={INK} strokeWidth={3} /><ellipse cx={1210} cy={722} rx={72} ry={30} fill="url(#sglow)" opacity={0.6} />
      <rect x={720} y={716} width={90} height={24} fill={PAPERC} stroke={INK} strokeWidth={3} transform="skewX(-8)" />
    </g>
  ),
  // the Commission's round table, ringed by dim seated bosses on the far side
  roundTable: ({frame}) => (
    <g>
      <ellipse cx={960} cy={780} rx={430} ry={124} fill={PAPERC} stroke={INK} strokeWidth={5} />
      <ellipse cx={960} cy={772} rx={360} ry={92} fill="#e9e2d0" stroke={INK} strokeWidth={2} opacity={0.6} />
      {[{x: 620, y: 694}, {x: 790, y: 662}, {x: 960, y: 650}, {x: 1130, y: 662}, {x: 1300, y: 694}].map((p, i) => <g key={i} opacity={0.5}><circle cx={p.x} cy={p.y} r={30} fill={INK} /><rect x={p.x - 34} y={p.y + 24} width={68} height={96} fill={INK} /></g>)}
    </g>
  ),
  // a table piled with banded cash, an adding machine, a duffel — the count room / the skim
  cashPiles: ({frame}) => (
    <g>
      <rect x={600} y={740} width={720} height={30} rx={5} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[{x: 660, h: 48}, {x: 742, h: 72}, {x: 824, h: 36}, {x: 1120, h: 60}, {x: 1202, h: 48}].map((b, i) => <g key={i}>{Array.from({length: Math.floor(b.h / 12)}).map((_, k) => <rect key={k} x={b.x} y={740 - 12 - k * 12} width={70} height={12} fill={k % 2 ? '#cde0c4' : '#bcd4b0'} stroke={INK} strokeWidth={2} />)}<line x1={b.x + 35} y1={740 - b.h} x2={b.x + 35} y2={740} stroke="#a23a3a" strokeWidth={4} opacity={0.5} /></g>)}
      <rect x={900} y={696} width={150} height={46} rx={6} fill={PAPERC} stroke={INK} strokeWidth={4} /><rect x={960} y={664} width={40} height={40} fill={PAPERC} stroke={INK} strokeWidth={3} />{[0, 1, 2].map((r) => [0, 1, 2].map((c) => <rect key={r + '_' + c} x={912 + c * 20} y={706 + r * 10} width={12} height={7} fill={INK} opacity={0.4} />))}
      <path d="M 1300 770 q 90 -50 180 0 l 0 40 q -90 30 -180 0 Z" fill={PAPERC} stroke={INK} strokeWidth={4} /><line x1={1330} y1={758} x2={1450} y2={758} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // the witness stand box beside the bench — the rat takes the stand
  witnessStand: ({frame}) => (
    <g>
      <rect x={1360} y={640} width={220} height={180} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={1360} y={600} width={220} height={44} fill={PAPERC} stroke={INK} strokeWidth={4} />
    </g>
  ),
  // foreground cell bars (figBehind puts the figure behind them — behind bars)
  cellBars: ({frame}) => (
    <g opacity={0.9}>
      {Array.from({length: 11}).map((_, i) => <line key={i} x1={80 + i * 180} y1={80} x2={80 + i * 180} y2={1080} stroke={INK} strokeWidth={9} />)}
      <line x1={0} y1={150} x2={1920} y2={150} stroke={INK} strokeWidth={9} />
      <line x1={0} y1={1000} x2={1920} y2={1000} stroke={INK} strokeWidth={9} />
    </g>
  ),
  // a reel-to-reel tape deck + headphones on a table — the wiretap
  reelDeck: ({frame}) => (
    <g>
      <rect x={600} y={720} width={520} height={30} rx={5} fill={PAPERC} stroke={INK} strokeWidth={4} />
      <rect x={660} y={640} width={340} height={80} rx={8} fill={PAPERC} stroke={INK} strokeWidth={4} />
      {[730, 930].map((x, i) => <g key={x}><circle cx={x} cy={680} r={30} fill={PAPERC} stroke={INK} strokeWidth={4} transform={`rotate(${(frame * (i ? -3 : 3)) % 360} ${x} 680)`} /><circle cx={x} cy={680} r={8} fill={INK} /></g>)}
      <line x1={760} y1={680} x2={900} y2={680} stroke={INK} strokeWidth={2} opacity={0.5} />
      <path d="M 1060 700 q 0 -60 60 -60 q 60 0 60 60" fill="none" stroke={INK} strokeWidth={4} /><rect x={1050} y={696} width={20} height={42} rx={6} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={1170} y={696} width={20} height={42} rx={6} fill={PAPERC} stroke={INK} strokeWidth={3} />
    </g>
  ),
  // wrought-iron estate gates with gold finials + a crest — the heir looks through them (figBehind)
  estateGates: ({frame}) => (
    <g>
      {/* stone pillars with lantern caps */}
      {[430, 1370].map((x) => <g key={x}>
        <rect x={x} y={300} width={120} height={560} fill={PAPERC} stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3, 4].map((k) => <line key={k} x1={x} y1={392 + k * 92} x2={x + 120} y2={392 + k * 92} stroke={INK} strokeWidth={2} opacity={0.4} />)}
        <rect x={x - 12} y={272} width={144} height={30} fill={PAPERC} stroke={INK} strokeWidth={4} />
        <rect x={x + 34} y={200} width={52} height={72} fill={PAPERC} stroke={INK} strokeWidth={4} /><path d={`M ${x + 26} 200 L ${x + 60} 168 L ${x + 94} 200 Z`} fill={PAPERC} stroke={INK} strokeWidth={4} /><circle cx={x + 60} cy={236} r={12} fill={GOLD} opacity={0.7} />
      </g>)}
      {/* bars + top rail arch + gold finials */}
      <path d="M 550 396 Q 960 300 1370 396" fill="none" stroke={INK} strokeWidth={7} />
      <line x1={550} y1={520} x2={1370} y2={520} stroke={INK} strokeWidth={5} opacity={0.8} />
      {Array.from({length: 13}).map((_, i) => {const x = 580 + i * 63.3; const top = 388 - Math.sin(((x - 550) / 820) * Math.PI) * 84;
        return <g key={i}><line x1={x} y1={860} x2={x} y2={top} stroke={INK} strokeWidth={6} />
          <path d={`M ${x - 8} ${top} L ${x} ${top - 22} L ${x + 8} ${top} Z`} fill={GOLD} stroke={INK} strokeWidth={2} /></g>;})}
      {/* the crest */}
      <circle cx={960} cy={470} r={54} fill={PAPERC} stroke={INK} strokeWidth={5} />
      <circle cx={960} cy={470} r={54} fill="none" stroke={GOLD} strokeWidth={3} opacity={0.8} />
      <text x={960} y={492} textAnchor="middle" fontFamily="Georgia, serif" fontSize={60} fontWeight={700} fill={INK} opacity={0.85}>H</text>
    </g>
  ),
  // the daishō on a stand: the paired long + short sword — the want-object (figBehind → in front)
  swordStand: ({frame}) => (
    <g transform="translate(1120 700)">
      <rect x={0} y={126} width={230} height={16} rx={4} fill="#3a2f22" stroke={INK} strokeWidth={3} />
      <rect x={22} y={64} width={12} height={66} fill="#3a2f22" stroke={INK} strokeWidth={2} />
      <rect x={196} y={64} width={12} height={66} fill="#3a2f22" stroke={INK} strokeWidth={2} />
      <path d="M -12 98 Q 112 76 242 98" fill="none" stroke={INK} strokeWidth={6} />
      <rect x={-28} y={90} width={32} height={14} rx={3} fill="#7a2d2d" stroke={INK} strokeWidth={2} />
      <path d="M 34 128 Q 128 114 220 128" fill="none" stroke={INK} strokeWidth={5} />
      <rect x={18} y={120} width={26} height={12} rx={3} fill="#7a2d2d" stroke={INK} strokeWidth={2} />
      <ellipse cx={115} cy={70} rx={140} ry={46} fill="url(#sglow)" opacity={0.55} />
    </g>
  ),
  // a low tea table: a bowl with steam + an iron kettle — the tea ceremony / the quiet sit-down
  teaTable: ({frame}) => (
    <g>
      <rect x={700} y={786} width={520} height={24} rx={6} fill="#6a4a2a" stroke={INK} strokeWidth={4} />
      <rect x={740} y={810} width={16} height={78} fill="#6a4a2a" stroke={INK} strokeWidth={3} /><rect x={1164} y={810} width={16} height={78} fill="#6a4a2a" stroke={INK} strokeWidth={3} />
      <path d="M 906 786 q 34 30 68 0 Z" fill={PAPERC} stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((k) => <path key={k} d={`M ${928 + k * 14} 782 q ${-5 + Math.sin(frame * 0.3 + k) * 5} -24 4 -44`} fill="none" stroke="#b8b0a0" strokeWidth={2} opacity={0.5} />)}
      <ellipse cx={1070} cy={778} rx={36} ry={26} fill={PAPERC} stroke={INK} strokeWidth={3} />
      <path d="M 1040 760 q 30 -20 60 0" fill="none" stroke={INK} strokeWidth={3} />
    </g>
  ),
  // the near tube of a life raft (foreground, figBehind → figure sits INSIDE it), with grab-ropes
  // and a bit of canopy edge; bobs gently. The home base of the whole ocean pack.
  raftHull: ({frame}) => {const bob = Math.sin(frame * 0.04) * 6;
    return (
      <g transform={`translate(0 ${bob})`}>
        <path d="M 380 500 Q 620 330 960 330 Q 1300 330 1540 500" fill="none" stroke={INK} strokeWidth={4} opacity={0.35} />
        <path d="M 340 1080 Q 340 838 620 810 L 1300 810 Q 1580 838 1580 1080 Z" fill="#d69a63" stroke={INK} strokeWidth={5} opacity={0.96} />
        {Array.from({length: 9}).map((_, i) => <line key={i} x1={520 + i * 100} y1={816} x2={520 + i * 100} y2={1010} stroke={INK} strokeWidth={2} opacity={0.28} />)}
        <path d="M 460 902 Q 960 862 1460 902" fill="none" stroke={INK} strokeWidth={3} opacity={0.5} />
        {Array.from({length: 12}).map((_, i) => <path key={'r' + i} d={`M ${430 + i * 92} 826 q 10 15 20 0`} fill="none" stroke={INK} strokeWidth={2} opacity={0.4} />)}
      </g>
    );},
  // a foreground swell crest across the bottom (figBehind → figure reads as IN the water) — capsize/adrift
  waveCrest: ({frame}) => {const a = Math.sin(frame * 0.05) * 10; const b = Math.cos(frame * 0.05) * 10;
    return (
      <g>
        <path d={`M 0 1080 L 0 ${936 + a} Q 480 ${900 - b} 960 ${934 + b} T 1920 ${938 + a} L 1920 1080 Z`} fill="#8aa3ad" stroke={INK} strokeWidth={5} opacity={0.92} />
        {Array.from({length: 8}).map((_, i) => {const x = (rnd(i * 2.3) * 1920 + frame * 0.5) % 1920; return <path key={i} d={`M ${x} ${928 + a} q 20 -12 40 0`} fill="none" stroke={PAPERC} strokeWidth={3} opacity={0.55} />;})}
      </g>
    );},
  // a barbed-wire fence across the foreground (figBehind → the wire reads IN FRONT of the figure) —
  // the river border checkpoint, North Korea pack
  wireFence: ({frame}) => (
    <g opacity={0.95}>
      <line x1={0} y1={760} x2={1920} y2={760} stroke="#0d1013" strokeWidth={6} />
      <line x1={0} y1={820} x2={1920} y2={820} stroke="#0d1013" strokeWidth={6} />
      {Array.from({length: 9}).map((_, i) => <line key={'p' + i} x1={i * 240} y1={730} x2={i * 240} y2={860} stroke="#0d1013" strokeWidth={10} />)}
      {Array.from({length: 40}).map((_, i) => {const x = i * 48; return <g key={i}>
        <line x1={x} y1={745} x2={x + 14} y2={775} stroke="#0d1013" strokeWidth={3} />
        <line x1={x + 14} y1={745} x2={x} y2={775} stroke="#0d1013" strokeWidth={3} />
        <line x1={x} y1={805} x2={x + 14} y2={835} stroke="#0d1013" strokeWidth={3} />
        <line x1={x + 14} y1={805} x2={x} y2={835} stroke="#0d1013" strokeWidth={3} />
      </g>;})}
    </g>
  ),
  // a crowd of dim, off-kilter shambling silhouettes filling the mid/background — the horde
  hordeCrowd: ({frame}) => (
    <g opacity={0.92}>
      {Array.from({length: 16}).map((_, i) => {
        const row = i % 2; const x = (rnd(i * 4.3) * 2100) - 90 + Math.sin(frame * 0.01 + i) * 6;
        const y = 840 + row * 90 + rnd(i * 1.7) * 30; const s = 0.9 + row * 0.35 + rnd(i * 2.1) * 0.25;
        const lean = -14 + rnd(i * 3.3) * 28;
        return (
          <g key={i} transform={`translate(${x} ${y}) scale(${s}) rotate(${lean})`} opacity={0.55 + row * 0.3}>
            <ellipse cx={0} cy={-150} rx={20} ry={24} fill="#10151b" />
            <line x1={0} y1={-128} x2={0} y2={-10} stroke="#10151b" strokeWidth={14} strokeLinecap="round" />
            <line x1={0} y1={-100} x2={-38} y2={-60} stroke="#10151b" strokeWidth={10} strokeLinecap="round" />
            <line x1={0} y1={-100} x2={34} y2={-140} stroke="#10151b" strokeWidth={10} strokeLinecap="round" />
            <line x1={0} y1={-10} x2={-16} y2={60} stroke="#10151b" strokeWidth={11} strokeLinecap="round" />
            <line x1={0} y1={-10} x2={18} y2={58} stroke="#10151b" strokeWidth={11} strokeLinecap="round" />
          </g>
        );
      })}
    </g>
  ),
  // two stout wooden palus training posts driven into the ground, wrapped strap-lines, a practice
  // sword leaning at the base of the near post — the ludus yard, figBehind (posts read in front)
  palusPost: ({frame}) => (
    <g opacity={0.95}>
      {[520, 660].map((x, i) => (
        <g key={x}>
          <line x1={x} y1={980} x2={x} y2={620} stroke="#6a5a3c" strokeWidth={30} strokeLinecap="round" />
          <line x1={x} y1={980} x2={x} y2={620} stroke={INK} strokeWidth={2} opacity={0.3} />
          {[700, 780, 860].map((y) => <line key={y} x1={x - 15} y1={y} x2={x + 15} y2={y + (i ? -6 : 6)} stroke="#3a2f22" strokeWidth={5} opacity={0.6} />)}
        </g>
      ))}
      <line x1={500} y1={980} x2={560} y2={860} stroke="#8a6a42" strokeWidth={10} strokeLinecap="round" />
      <line x1={500} y1={900} x2={520} y2={892} stroke="#8a6a42" strokeWidth={10} strokeLinecap="round" />
    </g>
  ),
  none: () => <g />,
};
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";

// =================== STAGE (composes planes with parallax) ===================
type Fig = {pose?: any; expr?: any; view?: 'front' | 'profile' | 'back'; facing?: 1 | -1; x?: number; y?: number; scale?: number; pal?: any; face?: boolean};
type StageProps = {
  backdrop: string; prop?: string; bg?: string;
  fig?: Fig; extras?: Fig[]; figBehind?: boolean;
};

const Stage: React.FC<StageProps> = ({backdrop, prop = 'none', bg = 'url(#spaper)', fig, extras = [], figBehind = false}) => {
  const f = useCurrentFrame();
  // subtle multi-plane parallax: far backdrop sways least, near props/figures more -> depth
  const sway = Math.sin(f * 0.012);
  const far = sway * 5, near = sway * 16;
  const B = BG[backdrop] || BG.plain;
  const P = PROP[prop] || PROP.none;
  const drawFig = (ff: Fig, key?: number) => (
    <StickFigure key={key} pose={ff.pose ?? A.stand(f)} x={ff.x ?? 960} y={ff.y ?? 892}
      scale={ff.scale ?? 1.4} facing={ff.facing ?? 1} view={ff.view ?? 'front'}
      expr={ff.expr ?? FACES.neutral} pal={ff.pal ?? LIGHT} showFace={ff.face !== false} frame={f} />
  );
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{display: 'block'}}>
      <Defs />
      <rect x={0} y={0} width={1920} height={1080} fill={bg} />
      <g transform={`translate(${far} 0)`}><B frame={f} /></g>
      <Motes frame={f} />
      <g transform={`translate(${near} 0)`}>
        {figBehind && fig && drawFig(fig)}
        {figBehind && extras.map((e, i) => drawFig(e, i))}
        <P frame={f} />
        {!figBehind && extras.map((e, i) => drawFig(e, i))}
        {!figBehind && fig && drawFig(fig)}
      </g>
      <rect x={0} y={0} width={1920} height={1080} fill="url(#svig)" />
    </svg>
  );
};

// =================== TEMPLATE PACKS ===================
// Generic (reusable by ANY topic)
const GEN = {
  lectureHallScene: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="lectureHall" bg="url(#spaper)"
      fig={{pose: A.sit(f), x: 980, y: 286, scale: 0.7, view: 'front', expr: FACES.earnest}}
      extras={[{pose: A.sit(f + 20), x: 700, y: 286, scale: 0.6, view: 'front', pal: DIM, face: false},
               {pose: A.sit(f + 40), x: 1240, y: 286, scale: 0.6, view: 'front', pal: DIM, face: false}]} />;},
  podiumScene: () => {const f = useCurrentFrame();
    return <Stage backdrop="podiumStage" prop="podiumTrophy" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 1110, y: 940, scale: 1.5, view: 'front', expr: FACES.cold}} />;},
  // distinct from podiumScene (reviewer fix: t26's trophy award and t28's foundation ribbon-cutting
  // were sharing the identical bare-podium staging) — ribbon + scissors + donor plaque, figure off to
  // the side as if just having cut it rather than standing to give a speech.
  foundationScene: () => {const f = useCurrentFrame();
    return <Stage backdrop="podiumStage" prop="ribbonPlaque" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 620, y: 940, scale: 1.5, view: 'front', facing: 1, expr: FACES.cold}} />;},
};

// Medical pack (surgeon / doctor)
const MED = {
  scrubIn: () => {const f = useCurrentFrame();
    return <Stage backdrop="lab" prop="scrubSink" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 700, y: 836, scale: 1.3, view: 'profile', facing: 1, expr: FACES.focused}} />;},
  operatingRoom: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="operatingRoom" prop="operatingTable" bg="url(#sclean)" figBehind
      fig={{pose: A.type_(f, fps), x: 860, y: 888, scale: 1.25, view: 'profile', facing: 1, expr: FACES.focused}}
      extras={[{pose: A.stand(f), x: 1190, y: 888, scale: 1.18, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  hospitalRounds: () => {const f = useCurrentFrame();
    return <Stage backdrop="hospitalWard" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 560, y: 860, scale: 1.45, view: 'front', expr: FACES.neutral}} />;},
  scanReview: () => {const f = useCurrentFrame();
    return <Stage backdrop="scanWall" bg="url(#spaper)"
      fig={{pose: A.lookUp(f), x: 420, y: 850, scale: 1.4, view: 'front', expr: FACES.worried}} />;},
  erTrauma: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [560, 1240]);
    return <Stage backdrop="hospitalWard" prop="operatingTable" bg="url(#sclean)"
      fig={{pose: A.walk(f, fps), x, y: 856, scale: 1.0, view: 'profile', facing: 1, expr: FACES.hardened}} />;},
  consult: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="lab" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 720, y: 892, scale: 1.4, view: 'front', expr: blendExpr(FACES.neutral, FACES.conflicted, t)}}
      extras={[{pose: A.sit(f), x: 1200, y: 900, scale: 1.2, view: 'profile', facing: -1, pal: DIM, expr: FACES.cold}]} />;},
};

// Startup pack (founder / tech)
const STARTUP = {
  garageStart: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    // x pulled left of the bench's laptop (fixed at x900-1020) — at x=900 the seated typing pose's
    // head lands directly under the laptop, and since figBehind draws the prop OVER the figure, the
    // laptop's PAPERC screen+base painted a blank pale shape over the face/hair (reviewer t05 defect).
    // y raised 878 -> 760 (2026-07-25): at 878 the head sat low enough that the bench's front edge
    // (y700-728) cut straight across the eyes, AND the same low head landed inside the bottom-left
    // money-card region once a medium/closeup shot pushed in on it (reviewer t05 defect #2). Raising
    // the anchor keeps the whole head above both the desk plane and the card for the scene's duration.
    return <Stage backdrop="garage" prop="bench" bg="url(#spaper)" figBehind
      fig={{pose: A.type_(f, fps), x: 780, y: 760, scale: 1.25, view: 'profile', facing: 1, expr: FACES.earnest}} />;},
  startupGrow: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="startupOffice" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 540, y: 880, scale: 1.5, view: 'front', expr: FACES.focused}}
      extras={[{pose: A.type_(f, fps), x: 980, y: 666, scale: 0.6, view: 'profile', facing: 1, pal: DIM, face: false},
               {pose: A.type_(f + 30, fps), x: 1300, y: 666, scale: 0.6, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  serverScale: () => {const f = useCurrentFrame();
    return <Stage backdrop="serverRoom" bg="url(#sclean)"
      fig={{pose: A.lookUp(f), x: 960, y: 880, scale: 1.4, view: 'front', expr: FACES.cold}} />;},
  ipoBell: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="ipoFloor" prop="ipoBell" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 760, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.smug, t)}} />;},
};

// Military pack (soldier)
const MILITARY = {
  bootcamp: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [620, 1180]);
    return <Stage backdrop="paradeGround" bg="url(#spaper)"
      fig={{pose: A.walk(f, fps), x, y: 808, scale: 1.0, view: 'profile', facing: 1, expr: FACES.exhausted}} />;},
  barracksLife: () => {const f = useCurrentFrame();
    return <Stage backdrop="barracks" bg="url(#spaper)"
      fig={{pose: A.sit(f), x: 560, y: 720, scale: 1.3, view: 'profile', facing: 1, expr: FACES.hollow}} />;},
  frontline: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [520, 1160]);
    return <Stage backdrop="battlefield" bg="url(#spaper)" figBehind
      fig={{pose: A.walk(f, fps), x, y: 748, scale: 0.95, view: 'profile', facing: 1, expr: FACES.hardened}} />;},
  commandPost: () => {const f = useCurrentFrame();
    return <Stage backdrop={SURVIVAL_TOPIC ? 'commandTent' : 'serverRoom'} prop="mapTable" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 800, y: 860, scale: 1.25, view: 'front', expr: FACES.cold}}
      extras={[{pose: A.stand(f), x: 1180, y: 860, scale: 1.1, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  decoration: () => {const f = useCurrentFrame();
    return <Stage backdrop="paradeGround" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 808, scale: 1.5, view: 'front', expr: FACES.hardened}} />;},
};

// Sports pack (athlete)
const SPORTS = {
  training: () => {const f = useCurrentFrame();
    return <Stage backdrop="gym" bg="url(#sclean)"
      fig={{pose: A.lookUp(f), x: 620, y: 878, scale: 1.45, view: 'front', expr: FACES.focused}} />;},
  lockerRoomScene: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="lockerRoom" prop="bench" bg="url(#spaper)" figBehind
      fig={{pose: A.sit(f), x: 760, y: 700, scale: 1.25, view: 'profile', facing: 1, expr: blendExpr(FACES.exhausted, FACES.conflicted, t)}} />;},
  gameDay: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [520, 1280]);
    return <Stage backdrop="stadiumField" bg="url(#sclean)"
      fig={{pose: A.walk(f, fps), x, y: 980, scale: 1.0, view: 'profile', facing: 1, expr: FACES.earnest}} />;},
  victory: () => {const f = useCurrentFrame();
    return <Stage backdrop="stadiumField" prop="medalPodium" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 648, scale: 1.15, view: 'front', expr: FACES.smug}} />;},
};

// Hedge fund / trading pack (hedge_fund_manager, trader)
const HEDGE = {
  tradingFloor: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="tradingWall" prop="deskTerminals" bg="url(#sclean)" figBehind
      fig={{pose: A.type_(f, fps), x: 960, y: 902, scale: 1.25, view: 'front', expr: FACES.focused}} />;},
  pnlWall: () => {const f = useCurrentFrame();
    return <Stage backdrop="tradingWall" bg="url(#sclean)"
      fig={{pose: A.lookUp(f), x: 540, y: 880, scale: 1.45, view: 'front', expr: FACES.cold}} />;},
};

// Real estate pack (real_estate_mogul, landlord, developer)
const REALESTATE = {
  openHouse: () => {const f = useCurrentFrame();
    return <Stage backdrop="suburbHouse" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 1250, y: 884, scale: 1.45, view: 'front', expr: FACES.earnest}} />;},
  rentalUnits: () => {const f = useCurrentFrame();
    return <Stage backdrop="apartmentBlock" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 1250, y: 904, scale: 1.45, view: 'front', expr: FACES.focused}} />;},
  constructionSite: () => {const f = useCurrentFrame();
    return <Stage backdrop="constructionSite" bg="url(#spaper)"
      fig={{pose: A.lookUp(f), x: 1250, y: 884, scale: 1.4, view: 'front', expr: FACES.cold}} />;},
  modelReview: () => {const f = useCurrentFrame();
    return <Stage backdrop="blueprintWall" prop="scaleModel" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 1100, y: 894, scale: 1.3, view: 'front', expr: FACES.cold}} />;},
  rooftopEmpire: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="cityRoof" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 1100, y: 812, scale: 1.4, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
};

// Spy / espionage pack (spy, intelligence officer)
const SPY = {
  tradecraft: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [640, 1160]);
    return <Stage backdrop="farm" bg="url(#spaper)"
      fig={{pose: A.walk(f, fps), x, y: 808, scale: 1.0, view: 'profile', facing: 1, expr: FACES.earnest}} />;},
  surveillance: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [520, 1180]);
    return <Stage backdrop="nightStreet" bg="url(#spaper)" figBehind
      fig={{pose: A.walk(f, fps), x, y: 868, scale: 1.05, view: 'profile', facing: 1, expr: FACES.focused}} />;},
  deadDrop: () => {const f = useCurrentFrame();
    return <Stage backdrop="parkDrop" prop="package" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 1060, y: 884, scale: 1.3, view: 'profile', facing: -1, expr: FACES.worried}} />;},
  safehouse: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="safehouseWall" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 340, y: 884, scale: 1.4, view: 'front', expr: blendExpr(FACES.focused, FACES.conflicted, t)}} />;},
  station: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="embassyOffice" prop="deskTerminals" bg="url(#sclean)" figBehind
      fig={{pose: A.type_(f, fps), x: 960, y: 902, scale: 1.25, view: 'front', expr: FACES.cold}} />;},
  debrief: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="interrogRoom" prop="interrogTable" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 720, y: 884, scale: 1.3, view: 'profile', facing: 1, expr: blendExpr(FACES.cold, FACES.hardened, t)}}
      extras={[{pose: A.sit(f), x: 1180, y: 884, scale: 1.2, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
};

// Roman empire pack (legionary -> centurion -> general -> Caesar -> the Guard)
const ROMAN = {
  triumph: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="triumphStreet" prop="chariot" bg="url(#swarm)" figBehind
      fig={{pose: A.stand(f), x: 900, y: 792, scale: 1.2, view: 'front', expr: blendExpr(FACES.awe, FACES.hollow, t)}} />;},
  romanOath: () => {const f = useCurrentFrame();
    return <Stage backdrop="romanForum" prop="altar" bg="url(#swarm)" figBehind
      fig={{pose: A.lookUp(f), x: 700, y: 856, scale: 1.35, view: 'front', expr: FACES.earnest}} />;},
  legionDrill: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [620, 1180]);
    return <Stage backdrop="marchCamp" bg="url(#spaper)"
      fig={{pose: A.walk(f, fps), x, y: 800, scale: 1.0, view: 'profile', facing: 1, expr: FACES.exhausted}} />;},
  legionCamp: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="tentCamp" bg="url(#spaper)"
      fig={{pose: A.sit(f), x: 600, y: 836, scale: 1.25, view: 'profile', facing: 1, expr: blendExpr(FACES.tired, FACES.hollow, t)}} />;},
  shieldWall: () => {const f = useCurrentFrame();
    return <Stage backdrop="battleLine" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 760, y: 960, scale: 1.15, view: 'profile', facing: 1, expr: FACES.hardened}} />;},
  centurionVitis: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="formation" bg="url(#spaper)"
      fig={{pose: A.armsCrossed(f), x: 960, y: 884, scale: 1.4, view: 'front', expr: blendExpr(FACES.focused, FACES.hardened, t)}} />;},
  firstSpear: () => {const f = useCurrentFrame();
    return <Stage backdrop="eagleField" bg="url(#swarm)"
      fig={{pose: A.lookUp(f), x: 600, y: 884, scale: 1.4, view: 'front', expr: FACES.cold}} />;},
  forumScene: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="romanForum" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 520, y: 868, scale: 1.4, view: 'front', expr: blendExpr(FACES.worried, FACES.conflicted, t)}} />;},
  // reviewer fix (t15): the mapTable prop's front face spans y720-840, which used to slice through
  // both figures' necks/chins at their old y=856 anchor -- raised both figures so the table crosses
  // at the chest/shoulder line instead, below the visible faces.
  warCouncil: () => {const f = useCurrentFrame();
    return <Stage backdrop="tentCamp" prop="mapTable" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 800, y: 822, scale: 1.25, view: 'front', expr: FACES.cold}}
      extras={[{pose: A.stand(f), x: 1180, y: 812, scale: 1.1, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  throne: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="throneHall" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 836, scale: 1.35, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
  senate: () => {const f = useCurrentFrame();
    return <Stage backdrop="curia" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 960, y: 856, scale: 1.4, view: 'front', expr: FACES.cold}} />;},
  praetorians: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="praetorianCastra" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 600, y: 884, scale: 1.4, view: 'front', expr: blendExpr(FACES.cold, FACES.smug, t)}} />;},
  // the banquet — two diners reclining over a low table by candlelight (replaces the anachronistic
  // modern-skyline 'dinner' template for the Roman feast scenes).
  banquet: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="banquetHall" prop="banquetTable" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 700, y: 762, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.cold, FACES.smug, t)}}
      extras={[{pose: A.sit(f + 50), x: 1240, y: 762, scale: 1.2, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
};

// Mafia / Cosa Nostra pack (associate -> soldier -> capo -> underboss -> boss -> Commission -> the fall)
const MAFIA = {
  // the boss at the head of a long table, others seated in the dim — the cold open + taking the throne.
  // The boss STANDS behind the table: y=720 puts his feet (~y 855) below the table line, hidden by
  // the table front (754-874), so he presides over it — never perched ON the tabletop.
  mobTable: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="restaurant" prop="longTable" bg="url(#swarm)" figBehind
      fig={{pose: A.stand(f), x: 960, y: 720, scale: 1.25, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}}
      extras={[{pose: A.sit(f + 30), x: 620, y: 748, scale: 1.05, view: 'profile', facing: 1, pal: DIM, face: false},
               {pose: A.sit(f + 60), x: 1300, y: 748, scale: 1.05, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the block: a kid on the corner under the lamppost — the want, and the cyclical loop close
  streetCorner: () => {const f = useCurrentFrame();
    return <Stage backdrop="tenement" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 560, y: 892, scale: 1.35, view: 'front', expr: FACES.earnest}} />;},
  // hanging out at the social club — the rules, omertà, the Dapper Don holding court
  socialClub: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="clubInterior" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 620, y: 892, scale: 1.35, view: 'front', expr: blendExpr(FACES.focused, FACES.smug, t)}}
      extras={[{pose: A.sit(f + 40), x: 1180, y: 900, scale: 1.15, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the back-room card table under the low lamp — the earn, a sit-down, your crew
  cardGame: () => {const f = useCurrentFrame();
    return <Stage backdrop="cardRoom" prop="dinerTable" bg="url(#spaper)" figBehind
      fig={{pose: A.sit(f), x: 700, y: 762, scale: 1.2, view: 'profile', facing: 1, expr: FACES.focused}}
      extras={[{pose: A.sit(f + 45), x: 1220, y: 762, scale: 1.2, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the dark alley under a caged bulb — making your bones / going to the mattresses
  backAlley: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="alley" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 700, y: 892, scale: 1.35, view: 'front', expr: blendExpr(FACES.worried, FACES.hardened, t)}} />;},
  // the making ceremony: the saint card to a flame, a ring of dim men behind — omertà sworn
  madeCeremony: () => {const f = useCurrentFrame();
    return <Stage backdrop="ceremonyRoom" prop="saintCard" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 960, y: 800, scale: 1.3, view: 'front', expr: FACES.hardened}} />;},
  // the restaurant sit-down / the classic mob hit — two at the table by candlelight
  redSauce: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="restaurant" prop="dinerTable" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 700, y: 762, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.cold, FACES.conflicted, t)}}
      extras={[{pose: A.sit(f + 50), x: 1220, y: 762, scale: 1.2, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the restaurant table with the far chair EMPTY — the rat reveal (t25): no companion figure,
  // just the boss staring across at an unoccupied chair. "THE CHAIR IS EMPTY" is visually true.
  redSauceAlone: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="restaurant" prop="dinerTableEmptySeat" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 700, y: 762, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
  // the docks: crane, containers, harbor — the rackets, the mob tax on the city
  waterfront: () => {const f = useCurrentFrame();
    return <Stage backdrop="waterfront" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 1250, y: 884, scale: 1.4, view: 'front', expr: FACES.cold}} />;},
  // behind the boss's desk — the sit-down where you give the order / made underboss
  donOffice: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="donStudy" prop="bigDesk" bg="url(#sclean)" figBehind
      fig={{pose: A.sit(f), x: 960, y: 700, scale: 1.2, view: 'front', expr: blendExpr(FACES.cold, FACES.hardened, t)}} />;},
  // the Commission: the round table of bosses in the dark — the board above the family
  commission: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="commissionRoom" prop="roundTable" bg="url(#spaper)" figBehind
      fig={{pose: A.sit(f), x: 960, y: 720, scale: 1.15, view: 'front', expr: blendExpr(FACES.cold, FACES.smug, t)}} />;},
  // the count room: cash piled under a naked bulb — the skim
  countRoom: () => {const f = useCurrentFrame();
    return <Stage backdrop="countRoomBg" prop="cashPiles" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 545, y: 892, scale: 1.25, view: 'front', expr: FACES.smug}} />;},
  // the courtroom: the defendant before the bench, a witness in the stand — RICO / the rat
  courtroom: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="courtroomBg" prop="witnessStand" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 820, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.worried, FACES.hollow, t)}}
      extras={[{pose: A.sit(f), x: 1470, y: 800, scale: 1.0, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the cell: the figure behind bars — the box or the cell
  prisonCell: () => {const f = useCurrentFrame();
    return <Stage backdrop="cellBlock" prop="cellBars" bg="url(#spaper)" figBehind
      fig={{pose: A.sit(f), x: 380, y: 640, scale: 1.15, view: 'front', expr: FACES.hollow}} />;},
  // the Feds' listening post: the reel-to-reel + the photo wall — omertà cracks, the tape
  wiretap: () => {const f = useCurrentFrame();
    return <Stage backdrop="wiretapRoom" prop="reelDeck" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 700, y: 892, scale: 1.3, view: 'front', expr: FACES.worried}} />;},
};

// Dynasty / generational wealth pack (billionaire_heir, old money)
const DYNASTY = {
  // the child heir at the wrought-iron gates, the mansion beyond — behind the bars (the gilded cage)
  heirGates: () => {const f = useCurrentFrame();
    return <Stage backdrop="estateGrounds" prop="estateGates" bg="url(#swarm)" figBehind
      fig={{pose: A.stand(f), x: 700, y: 888, scale: 1.15, view: 'front', expr: FACES.earnest}} />;},
  // the hall of ancestor portraits — four gilt frames and one EMPTY one, waiting
  portraitHall: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="portraitWall" bg="url(#spaper)"
      fig={{pose: A.lookUp(f), x: 560, y: 892, scale: 1.4, view: 'front', expr: blendExpr(FACES.neutral, FACES.conflicted, t)}} />;},
  // the loop closes (t29 ONLY): the same hall, but the fifth frame is no longer empty —
  // your portrait hangs in it, exactly when the VO says so
  portraitHallFilled: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="portraitWallFilled" bg="url(#spaper)"
      fig={{pose: A.lookUp(f), x: 560, y: 892, scale: 1.4, view: 'front', expr: blendExpr(FACES.neutral, FACES.hollow, t)}} />;},
  // the yacht deck at sea — the trust-fund years, the crowd that appears
  yachtDeck: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="seaDeck" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 1180, y: 892, scale: 1.4, view: 'front', expr: blendExpr(FACES.smug, FACES.hollow, t)}} />;},
  // the foundation gala — chandelier, dim guests with flutes, you hold court
  galaBallroom: () => {const f = useCurrentFrame();
    return <Stage backdrop="ballroom" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 840, y: 900, scale: 1.42, view: 'front', expr: FACES.cold}} />;},
  // the family vault — a great trust-vault door in a wall of deed boxes; paper, not gold
  familyVault: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="vaultHall" bg="url(#sclean)"
      fig={{pose: A.lookUp(f), x: 500, y: 888, scale: 1.4, view: 'front', expr: blendExpr(FACES.focused, FACES.hollow, t)}} />;},
};

// Samurai pack (ashigaru -> retainer -> mounted man -> karō -> daimyō -> great lord -> the sword ends)
const SAMURAI = {
  // the rice paddy: the peasant origin AND the loop close — you own nothing, a borrowed spear
  riceField: () => {const f = useCurrentFrame();
    return <Stage backdrop="riceField" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 620, y: 900, scale: 1.4, view: 'front', expr: FACES.earnest}} />;},
  // the dojo: training under the mentor, the code — later, the empty dojo of grief
  dojo: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="dojo" bg="url(#spaper)"
      fig={{pose: A.armsCrossed(f), x: 700, y: 900, scale: 1.4, view: 'front', expr: blendExpr(FACES.exhausted, FACES.focused, t)}} />;},
  // the daishō on the stand: getting your two swords — the want made real (figBehind → swords in front)
  daisho: () => {const f = useCurrentFrame();
    return <Stage backdrop="teaRoom" prop="swordStand" bg="url(#swarm)" figBehind
      fig={{pose: A.stand(f), x: 640, y: 900, scale: 1.35, view: 'front', expr: FACES.awe}} />;},
  // the battle: nobori banners, a burning castle, a hedge of spears — the war
  sengokuField: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [560, 1180]);
    return <Stage backdrop="sengokuField" bg="url(#spaper)" figBehind
      fig={{pose: A.walk(f, fps), x, y: 900, scale: 1.0, view: 'profile', facing: 1, expr: FACES.hardened}} />;},
  // the great castle gate: arrival, the sword hunt, the siege you hold, riding out to Edo
  castleGate: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="castleGate" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 560, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.worried, FACES.cold, t)}} />;},
  // the tea room: the sit-down, the warning, the politics — a low table by the tokonoma. Reviewer
  // fix: the seated second (Kenji, in the yakuza pack's reuse of this template) always rendered
  // face:false, a blank oval, across every one of his named/dialogue scenes — give him the same
  // eyes/brows/mouth rig as the protagonist, smug/cold to match his written characterization.
  teaCeremony: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="teaRoom" prop="teaTable" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 680, y: 800, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.focused, FACES.conflicted, t)}}
      extras={[{pose: A.sit(f + 40), x: 1240, y: 800, scale: 1.2, view: 'profile', facing: -1, pal: DIM, expr: FACES.smug}]} />;},
  // the lord's audience hall: presented, promoted, and later ruling from the dais yourself
  lordAudience: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="lordHall" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.35, view: 'front', expr: blendExpr(FACES.focused, FACES.cold, t)}} />;},
  // the top of the keep: the domain below — the daimyō apex / the great lord surveying his koku
  keepTop: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="keepTop" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 1120, y: 900, scale: 1.42, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
  // the seppuku garden: the ordered death — the cold open, the midpoint, and its payoff (a second behind)
  seppukuRite: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="seppukuGarden" bg="url(#spaper)" figBehind
      fig={{pose: A.sit(f), x: 940, y: 906, scale: 1.25, view: 'front', expr: blendExpr(FACES.hardened, FACES.hollow, t)}}
      extras={[{pose: A.stand(f), x: 1300, y: 900, scale: 1.3, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the shogun's grand hall in Edo: 30 million koku, and you a single mark in a long row
  shogunCourt: () => {const f = useCurrentFrame();
    return <Stage backdrop="shogunHall" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 960, y: 890, scale: 1.15, view: 'front', expr: FACES.worried}} />;},
  // the rice broker's counting house: the merchant with no sword who owns your debt and the edict
  merchantHouse: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="merchantHouse" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 620, y: 900, scale: 1.35, view: 'front', expr: blendExpr(FACES.worried, FACES.hollow, t)}} />;},
};

// Cartel / narco pack (halcón -> mule -> sicario -> plaza boss -> lieutenant -> patrón -> the market)
const CARTEL = {
  // the border desert: the halcón kid on the edge of town watching the road — L1 + the cyclical close
  lookoutCorner: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="borderDesert" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 520, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // la sierra: the mule route / moving up / the hunted run — a convoy pickup, the mountain track
  sierraRoute: () => {const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
    const x = interpolate(f, [0, durationInFrames], [500, 1060]);
    return <Stage backdrop="sierraCamp" prop="narcoTruck" bg="url(#spaper)" figBehind
      fig={{pose: A.walk(f, fps), x, y: 900, scale: 1.15, view: 'profile', facing: 1, expr: FACES.focused}} />;},
  // the roadside shrine: the vow, the medallion, protection — worried → hardened (cautionary)
  narcoShrineRite: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="narcoShrine" bg="url(#spaper)"
      fig={{pose: A.lookUp(f), x: 560, y: 884, scale: 1.4, view: 'front', expr: blendExpr(FACES.worried, FACES.hardened, t)}} />;},
  // la plaza: the town square — the piso (turf tax), territory, the town under your thumb
  plazaTown: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="townPlaza" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 620, y: 900, scale: 1.4, view: 'front', expr: blendExpr(FACES.focused, FACES.cold, t)}} />;},
  // the narco ranch: the walled compound — the jefe de plaza's finca AND the patrón's fortress
  // (the cold open + the apex). Figure offset LEFT off the centered gate (centered-landmark rule).
  ranchCompound: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="narcoRanch" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 480, y: 900, scale: 1.4, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
};

// Ocean / survival pack (the crossing -> cold shock -> thirst -> the ship -> sharks -> alone -> the storm -> the light)
// The life raft (raftHull, figBehind) is the reused master-loop base; waveCrest puts the figure IN the water.
const OCEAN = {
  // the delivery boat still whole, the sea kind — a working sailor on deck (comfort + want, L1).
  // reuses the DYNASTY seaDeck backdrop but stages the figure content, not the heir's smug.
  boatDeck: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="seaDeck" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 760, y: 892, scale: 1.35, view: 'front', expr: blendExpr(FACES.earnest, FACES.neutral, t)}} />;},
  // the capsize: the storm rolls the boat, the mast breaks — you go over the side into the dark water
  oceanCapsize: () => {const f = useCurrentFrame();
    return <Stage backdrop="stormSea" prop="waveCrest" bg="url(#sclean)" figBehind
      fig={{pose: A.lookUp(f), x: 820, y: 980, scale: 1.4, view: 'front', expr: FACES.shock}} />;},
  // the life raft by day: the home base — hunched in the tube on the swell (reused across the drift)
  raftDay: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="oceanSwell" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.sit(f), x: 960, y: 880, scale: 1.25, view: 'front', expr: blendExpr(FACES.worried, FACES.exhausted, t)}} />;},
  // the raft at night: stars, the moon path, the red flare-glow — the long dark, the first night
  raftNight: () => {const f = useCurrentFrame();
    return <Stage backdrop="nightSea" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.armsCrossed(f), x: 960, y: 880, scale: 1.25, view: 'front', expr: FACES.worried}} />;},
  // dead calm, the huge sun, the mirror sea — thirst; slumped, cracked, rationing
  glassCalm: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="glassCalm" prop="raftHull" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 960, y: 884, scale: 1.22, view: 'front', expr: blendExpr(FACES.exhausted, FACES.hollow, t)}} />;},
  // a warm squall — driving rain over the raft; face up, mouth open, catching fresh water (a mercy)
  rainSquall: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="stormSea" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.lookUp(f), x: 960, y: 884, scale: 1.24, view: 'front', expr: blendExpr(FACES.exhausted, FACES.earnest, t)}} />;},
  // a ship on the horizon by day — up on your knees, reaching, screaming at a bridge that never looks
  horizonShip: () => {const f = useCurrentFrame();
    return <Stage backdrop="horizonShip" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.lookUp(f), x: 700, y: 880, scale: 1.25, view: 'front', expr: FACES.earnest}} />;},
  // a fin cutting the swell, fish shadows below — what the raft's shade draws; the catch and the threat
  finWater: () => {const f = useCurrentFrame();
    return <Stage backdrop="finWater" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.lookUp(f), x: 1180, y: 880, scale: 1.22, view: 'front', expr: FACES.hardened}} />;},
  // the half-swamped panga adrift — the boat that didn't make it; you take its water, learn nothing
  driftPanga: () => {const f = useCurrentFrame();
    return <Stage backdrop="driftPanga" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 480, y: 880, scale: 1.22, view: 'front', expr: FACES.conflicted}} />;},
  // the bare open swell, no raft in frame, the void at scale — truly alone, the hallucination
  openSwell: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="oceanSwell" prop="waveCrest" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 960, y: 970, scale: 1.3, view: 'front', expr: blendExpr(FACES.hollow, FACES.exhausted, t)}} />;},
  // the ship's lit hull sliding past close at night — the cold open + its payoff, the last flare
  shipNight: () => {const f = useCurrentFrame();
    return <Stage backdrop="shipNight" prop="raftHull" bg="url(#sclean)" figBehind
      fig={{pose: A.lookUp(f), x: 640, y: 880, scale: 1.26, view: 'front', expr: FACES.shock}} />;},
  // land and a boat coming toward you at last — the rescue, at cost
  makeLandfall: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="landfall" prop="raftHull" bg="url(#swarm)" figBehind
      fig={{pose: A.lookUp(f), x: 720, y: 880, scale: 1.24, view: 'front', expr: blendExpr(FACES.hollow, FACES.awe, t)}} />;},
};

// Underground medicine pack (black_market_surgeon) — composed ENTIRELY from existing backdrops/props
// re-lit/re-staged (no new SVG art): the legit MED operatingRoom re-lit dim = the hidden basement OR;
// the MAFIA count room's cash pile = the organ-broker handoff; a private room re-lit = the pumping
// party; the clean operatingRoom with a guard extra = the syndicate's owned clinic.
const BLACKMARKET = {
  // a dim rented room, re-staged as the off-book cosmetic job — reuses donStudy (private, shuttered)
  hotelRoom: () => {const f = useCurrentFrame();
    return <Stage backdrop="donStudy" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 760, y: 892, scale: 1.3, view: 'front', expr: FACES.focused}}
      extras={[{pose: A.sit(f), x: 1280, y: 900, scale: 1.05, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the same operating room, re-lit warm/dim instead of clean — the hidden basement OR, off the books
  basementOR: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="operatingRoom" prop="operatingTable" bg="url(#swarm)" figBehind
      fig={{pose: A.type_(f, fps), x: 860, y: 888, scale: 1.25, view: 'profile', facing: 1, expr: FACES.hardened}} />;},
  // the cash-and-cooler handoff — reuses the count room's naked bulb + cash piles, a courier waiting
  coldCase: () => {const f = useCurrentFrame();
    return <Stage backdrop="countRoomBg" prop="cashPiles" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 545, y: 892, scale: 1.25, view: 'front', expr: FACES.hollow}}
      extras={[{pose: A.stand(f + 20), x: 1300, y: 892, scale: 1.15, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the syndicate's clean private clinic — the legit-looking OR again, but a guard stands in it now
  syndicateClinic: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="operatingRoom" prop="operatingTable" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 860, y: 888, scale: 1.25, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}}
      extras={[{pose: A.stand(f), x: 1300, y: 860, scale: 1.3, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
};

// North Korea pack (citizen -> party candidate -> cadre -> Pyongyang -> Central Committee ->
// Politburo -> the court -> the Family's money) — ONE new bespoke template (the river-border
// checkpoint, the cold-open/loop-close master anchor); everything else composes from existing packs.
const NORTHKOREA = {
  borderWire: () => {const f = useCurrentFrame();
    return <Stage backdrop="riverBorder" prop="wireFence" bg="url(#swarm)" figBehind
      fig={{pose: A.stand(f), x: 760, y: 900, scale: 1.3, view: 'front', expr: FACES.worried}} />;},
};

// Zombie apocalypse pack (survival format — HOUR 0 outbreak -> the walled camp). Only 7 new bespoke
// backdrops (the horde street, the highway, the looted store, the boarded room, the checkpoint, the
// camp wall); the rest of the ladder composes from MILITARY/MED/MAFIA/SAMURAI/universal packs.
const ZOMBIE = {
  // the horde filling a dark street — the cold open + its loop-close payoff. The crowd prop draws
  // BEHIND the figure (no figBehind) so the running hero stays the clear, legible foreground focal point.
  hordeStreet: () => {const f = useCurrentFrame(); const {fps, durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [0, d], [0, 1]);
    const x = interpolate(f, [0, d], [420, 1220]);
    return <Stage backdrop="hordeAvenue" prop="hordeCrowd" bg="url(#swarm)"
      fig={{pose: A.walk(f, fps, 2.6), x, y: 916, scale: 1.15, view: 'profile', facing: 1, expr: blendExpr(FACES.shock, FACES.hardened, t)}} />;},
  // the ordinary house going dark — boarding the windows, the last normal hour (reuses suburbHouse)
  suburbSiege: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="suburbHouse" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 1250, y: 884, scale: 1.4, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // the highway parking lot — gridlocked cars, smoke on the skyline, a helicopter that won't stop
  highwayJam: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="highwayGridlock" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.35, view: 'front', expr: blendExpr(FACES.worried, FACES.exhausted, t)}} />;},
  // the looted grocery aisle — toppled shelves, spilled cans, what's left to take
  storeRaid: () => {const f = useCurrentFrame();
    return <Stage backdrop="storeAisle" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 940, scale: 1.35, view: 'front', expr: FACES.focused}} />;},
  // the boarded room — cross-nailed planks, furniture against the door, the siege
  bunkerSiege: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="bunkerRoom" bg="url(#swarm)"
      fig={{pose: A.armsCrossed(f), x: 620, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.hardened, FACES.exhausted, t)}} />;},
  // the checkpoint — barriers, razor wire, the floodlight tower, martial-law triage
  checkpointTriage: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="checkpointBarrier" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 760, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.hollow, FACES.cold, t)}} />;},
  // the walled camp — shipping containers, string lights, a watchtower — the new world, at cost
  campWall: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="campPerimeter" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.4, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
};

// Waste-hauling roll-up pack (self_made_billionaire — one truck -> a regional roll-up -> owning
// disposal -> a PE recap -> a public company). 4 new bespoke backdrops (cemetery, residentialDawn,
// truckDepot, landfillFace) + 1 reusable vehicle prop (wasteTruck); the reversal reuses the existing
// SPY pack's `nightStreet` backdrop re-staged with the truck stopped, per the relit-backdrop pattern.
const WASTE = {
  // the graveside — the cold open, static at the edge of the plot (t01; "don't move yet")
  graveside: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="cemetery" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 1200, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.hollow, FACES.cold, t)}}
      extras={[{pose: A.stand(f + 10), x: 820, y: 900, scale: 1.1, view: 'front', pal: DIM, face: false},
               // reviewer fix: this was an identical faceless clone of the mourner beside her, but
               // narration names "a woman in a black coat" who glances back once — a visible,
               // uneasy, looking-away expression reads as a distinct figure, not a duplicated
               // silhouette (view/profile alone doesn't change this rig's face rendering).
               {pose: A.stand(f + 30), x: 990, y: 900, scale: 1.1, view: 'front', pal: DIM, face: true, expr: FACES.conflicted}]} />;},
  // the graveside, loop-close (t30): the narration explicitly promises "this time you walk all the
  // way to the stone, not the edge of the plot" — reviewer fix: t01 and t30 previously shared the
  // identical static `graveside` template with the figure fixed at the same edge mark (x=1200) in
  // both, so the payoff never visibly landed. Here the figure walks in from that same edge mark toward
  // the mound/headstone (cx=1580 in the cemetery backdrop), stopping right beside it, before the shot
  // ends — a visibly different blocking from the cold open's static edge mark.
  gravesideReturn: () => {const f = useCurrentFrame(); const {fps, durationInFrames: d} = useVideoConfig();
    const walkEnd = d * 0.6;
    const x = interpolate(f, [0, walkEnd], [1200, 1460], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    const arrived = f > walkEnd;
    const t = interpolate(f, [walkEnd, d], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="cemetery" bg="url(#spaper)"
      fig={{pose: arrived ? A.stand(f) : A.walk(f, fps), x, y: 900, scale: 1.3,
            view: 'profile', facing: 1, expr: blendExpr(FACES.cold, FACES.hollow, t)}}
      extras={[{pose: A.stand(f + 10), x: 860, y: 900, scale: 1.05, view: 'front', pal: DIM, face: false}]} />;},
  // one truck, one dawn route, the debt — the origin, reused later as a quiet callback. Reviewer fix:
  // `figBehind` drew the truck prop OVER the figure at the same x/y, so the opaque compactor box cut
  // the body in half (only the head above the roofline, legs below the chassis). Dropping figBehind
  // draws the figure LAST (in front of the truck) so it reads as standing beside/in front of it, whole.
  dawnRoute: () => {const f = useCurrentFrame();
    return <Stage backdrop="residentialDawn" prop="wasteTruck" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 906, scale: 1.25, view: 'profile', facing: 1, expr: FACES.earnest}} />;},
  // the fenced yard, the growing fleet
  truckYard: () => {const f = useCurrentFrame();
    return <Stage backdrop="truckDepot" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 860, y: 900, scale: 1.35, view: 'front', expr: FACES.focused}} />;},
  // the tipping face — owning disposal, not just collection, the biggest valuation lever
  landfillView: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="landfillFace" bg="url(#spaper)"
      fig={{pose: A.lookUp(f), x: 1010, y: 940, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.focused, t)}} />;},
  // the route again, at night, the truck stopped — the reversal (reuses SPY's nightStreet backdrop).
  // Reviewer fix: same figBehind-over-truck compositing bug as dawnRoute, and this is the midpoint
  // reversal (Marcus's death) — the episode's most important beat — so dropping figBehind here matters
  // most: the figure now draws whole, in front of the stopped truck, instead of split by the chassis.
  routeAftermath: () => {const f = useCurrentFrame();
    return <Stage backdrop="nightStreet" prop="wasteTruck" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 906, scale: 1.25, view: 'front', expr: FACES.hollow}}
      extras={[{pose: A.stand(f + 15), x: 1400, y: 906, scale: 1.05, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
};

// Lottery pack (lottery_winner — a scenario episode). Only 2 new bespoke backdrops (the ticket
// counter, the modest home); the rest of the ladder composes from DYNASTY (heirGates/estateGrounds/
// galaBallroom/yachtDeck/familyVault)/MAFIA (courtroom)/SPY (safehouse, repurposed as the forensic
// tracing board)/MED (consult)/REALESTATE (suburbHouse)/GEN (podiumScene/foundationScene)/universal.
const LOTTERY = {
  // the counter, Dale behind it — the cold open + its loop-close payoff, the Friday ticket ritual
  ticketCounter: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="counterStore" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 1300, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}}
      extras={[{pose: A.stand(f + 10), x: 1700, y: 880, scale: 1.05, view: 'front', pal: DIM, face: false}]} />;},
  // the modest home at dusk — comfort + the named want, before any of this existed. Figure kept well
  // clear of CAPTION_SAFE_X (this scene's long sub-caption widens the money card past the usual ~700px)
  trailerPorch: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="trailerHome" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 1220, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.exhausted, t)}} />;},
};

// Yakuza pack (yakuza — kobun -> wakashu -> shatei -> shatei-gashira -> shibuchō -> wakagashira ->
// oyabun -> kumichō). 6 new bespoke backdrops; the rest of the ladder composes from MAFIA's
// backAlley/countRoom/courtroom/prisonCell/wiretap/waterfront/commission, SAMURAI's teaCeremony,
// REALESTATE's rentalUnits/constructionSite, MED's hospitalRounds, and universal templates.
const YAKUZA = {
  // the neon alley — the cold open (AFTERMATH) + its torch-passing loop-close payoff
  neonAlley: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="kabukichoAlley" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 1220, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
  // the shrine altar — the sakazuki cup, poured three times across the arc (joining / made / kumichō).
  // The presiding figure is Sato, the named mentor who recurs across the whole arc — reviewer fix:
  // he (and Kenji, in teaCeremony below) previously always rendered face:false (a blank oval), even
  // in named, dialogue-bearing scenes. Giving him a face here reuses the same eyes/brows/mouth rig
  // as the protagonist, just dimmed/hardened to read as the elder presiding.
  shrineOathRite: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="shrineAltar" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 700, y: 800, scale: 1.2, view: 'front', expr: blendExpr(FACES.earnest, FACES.focused, t)}}
      extras={[{pose: A.sit(f + 30), x: 1220, y: 800, scale: 1.15, view: 'front', pal: DIM, expr: FACES.hardened}]} />;},
  // the tattoo parlor — the irezumi, body debt made real
  irezumiParlor: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="tattooStudio" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 640, y: 800, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.worried, FACES.hardened, t)}} />;},
  // the pachinko floor — the front business, the earn, rows of chrome and noise
  pachinkoFloor: () => {const f = useCurrentFrame();
    return <Stage backdrop="pachinkoHall" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 880, y: 900, scale: 1.3, view: 'front', expr: FACES.focused}} />;},
  // the oyabun's study — the kamidana + the mounted sword, giving the order
  oyabunOffice: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="oyabunStudy" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.hardened, t)}} />;},
  // the atonement room — yubitsume, the debt paid in a joint instead of yen
  yubitsumeRite: () => {const f = useCurrentFrame();
    return <Stage backdrop="yubitsumeRoom" bg="url(#spaper)"
      fig={{pose: A.sit(f), x: 960, y: 906, scale: 1.25, view: 'front', expr: FACES.hardened}} />;},
  // the tea room again, restaged for the split: reviewer fix — this scene and the earlier rivalry
  // sit-down (SAMURAI's teaCeremony) read as the same picture despite the escalation between them.
  // Front-on camera instead of the profile two-shot, the swordStand prop instead of the tea table,
  // cooler blue-toned light instead of warm, and Sato up on his feet and turned away rather than
  // seated across the table — he's already leaning toward the other room. Second reviewer fix: Sato
  // still rendered face:false (a blank oval) here despite the sibling shrineOathRite/teaCeremony fix
  // — give him the same eyes/brows/mouth rig, worried reading as the math running before his mouth does.
  teaCeremonySplit: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="teaRoom" prop="swordStand" bg="url(#spaper)" figBehind
      fig={{pose: A.sit(f), x: 620, y: 800, scale: 1.25, view: 'front', expr: blendExpr(FACES.worried, FACES.hardened, t)}}
      extras={[{pose: A.stand(f), x: 1280, y: 900, scale: 1.2, view: 'profile', facing: -1, pal: DIM, expr: FACES.worried}]} />;},
};

// Mongol Empire pack (mongol_empire — herder's son -> arban -> jaghun -> minghan -> tumen/noyan ->
// governor -> khan of a khanate -> Khagan). 7 new bespoke backdrops; the rest of the ladder composes
// from ROMAN's warCouncil/praetorians/throne/commission, SAMURAI's sengokuField/teaCeremony/
// merchantHouse, DYNASTY's portraitHall, SPY's debrief, and universal templates.
const MONGOL = {
  // the ger camp — comfort + the named want, before any of this existed; also the loop-close callback
  steppeCamp: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="steppeCamp" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 940, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // the drill ground — mounted-archery training, the arban recruit
  horsebackDrill: () => {const f = useCurrentFrame();
    return <Stage backdrop="horsebackDrill" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: FACES.focused}} />;},
  // the night raid — torches, burning tents — the first khubi, jaghun command
  steppeRaid: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="steppeRaid" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.focused, FACES.hardened, t)}} />;},
  // the siege — the Khwarazmian campaign, minghan/tumen command, the moral-cost beat
  siegeWalls: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="siegeWalls" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.hardened, FACES.hollow, t)}} />;},
  // the Yam relay post — the empire's speed, the share-worthy 200mi/day beat
  yamRelayStation: () => {const f = useCurrentFrame();
    return <Stage backdrop="yamRelayStation" bg="url(#sclean)"
      fig={{pose: A.lookUp(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: FACES.focused}} />;},
  // the audience tent — the governor's investiture, the paiza, tax/tribute authority
  khanAudienceTent: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="khanAudienceTent" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 906, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.focused, t)}} />;},
  // the Khagan's throne hall — the flash-forward cold open + the apex + its loop-close payoff
  khaganThrone: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="khaganThrone" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 960, y: 892, scale: 1.35, view: 'front', expr: blendExpr(FACES.hollow, FACES.cold, t)}} />;},
};

// Gladiator pack (gladiator — novicius through primus palus to lanista and the editor above). 6 new
// bespoke backdrops + 1 prop; the rest of the ladder composes from ROMAN's forumScene/praetorians/
// throne, MAFIA's countRoom, and SAMURAI's riceField.
const GLADIATOR = {
  // the slave market — the auction block, the awning, the market town — Level 1, "you are property"
  slaveMarket: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="slaveMarket" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 940, y: 896, scale: 1.3, view: 'front', expr: blendExpr(FACES.worried, FACES.hollow, t)}} />;},
  // the ludus training yard — the recurring home base. Reused ~8x across very different emotional
  // beats (training, the mentor, later teaching the next generation): every call site in content.py
  // is a SEPARATE scene pointing at this SAME function, so the expr here can't be overridden per
  // scene. Following raftDay/teaCeremony's pattern for a reused template — pick one neutral-ish
  // blended pair and let the surrounding, DISTINCT templates carry the sharper emotional beats.
  ludusYard: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="ludusYard" prop="palusPost" bg="url(#spaper)" figBehind
      fig={{pose: A.stand(f), x: 940, y: 900, scale: 1.3, view: 'profile', facing: 1, expr: blendExpr(FACES.earnest, FACES.hardened, t)}} />;},
  // the porta — the dark tunnel beneath the stands, torches, the bright shaft of sand-daylight ahead
  // — waiting to fight
  arenaGate: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="arenaGate" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.worried, FACES.focused, t)}} />;},
  // the amphitheater sand — THE master reused backdrop: the cold open, every fight beat, the
  // midpoint reversal
  arenaSand: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="arenaSand" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.38, view: 'front', expr: blendExpr(FACES.focused, FACES.hardened, t)}} />;},
  // the rudis — the wooden sword of freedom offered on the same sand, a dim figure extending it.
  // Shares arenaSand's backdrop art but is a distinct template/staging (kneeling, a second figure,
  // a cooler lamp-lit bg) so it never reads as the same picture as the regular fight beats.
  // reviewer fix (t22): the magistrate rendered face:false (a blank oval) on this held, static shot —
  // the episode's central emotional beat — while the protagonist beside him had full facial detail.
  // Give him the same eyes/brows/mouth rig, cold/formal to match a magistrate presiding over the rite.
  rudisCeremony: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="arenaSand" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 900, y: 906, scale: 1.25, view: 'front', expr: blendExpr(FACES.hollow, FACES.hardened, t)}}
      extras={[{pose: A.stand(f), x: 1300, y: 900, scale: 1.2, view: 'profile', facing: -1, pal: DIM, expr: FACES.cold}]} />;},
  // the lanista's office — the roster board, scrolls and a wax tablet on the desk — ownership, the
  // games-business ladder (Levels 3-4 roster tracking, later Level 7 as lanista)
  ludusOffice: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="ludusOffice" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.focused, FACES.cold, t)}} />;},
  // the imperial box — the editor's/emperor's pulvinar looking down over the sand — richer/cooler
  // than arenaSand, the apex above even the editor
  imperialBox: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="imperialBox" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
};

// Bratva pack (bratva — patsan -> boyevik -> brigadir -> avtoritet -> smotryashchiy -> vor v zakone
// (koronatsiya) -> a foreign cell -> pakhan). 7 new bespoke backdrops; the rest of the ladder
// composes from MAFIA's backAlley/countRoom/courtroom/wiretap/commission and universal templates
// (revolvingDoor for the bribed captain, boardroomNotes/signing for the legit front, jet/warRoom for
// the foreign cell, window/dinner/emptyChair/streetCorner elsewhere).
const BRATVA = {
  // the courtyard — Level 1 origin, the named want, before any of this
  courtyardBlock: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="courtyardBg" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // the tattoo cell — the recurring sensory anchor, a needle earning a mark. figBehind so the coil
  // rig table reads in front of the seated figure.
  tattooCell: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="tattooCellBg" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 900, y: 800, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.worried, FACES.hardened, t)}} />;},
  // the banya — the cold open (MID-ACTION) + every skhodka sit-down after it
  banyaSitDown: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="banyaRoom" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 820, y: 820, scale: 1.2, view: 'front', expr: blendExpr(FACES.cold, FACES.hardened, t)}}
      extras={[{pose: A.sit(f + 20), x: 1300, y: 820, scale: 1.15, view: 'front', pal: DIM, expr: FACES.hollow}]} />;},
  // the shop counter — a krysha collection run, a scared shopkeeper behind the register
  shopKrysha: () => {const f = useCurrentFrame();
    return <Stage backdrop="shopCounter" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 1220, y: 900, scale: 1.3, view: 'front', expr: FACES.cold}}
      extras={[{pose: A.stand(f), x: 1620, y: 900, scale: 0.95, view: 'front', pal: DIM, expr: FACES.worried}]} />;},
  // the koronatsiya circle — the crowning; a ring of dim elders, the code made literal
  koronatsiyaRite: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="koronatsiyaCircle" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 960, y: 900, scale: 1.25, view: 'front', expr: blendExpr(FACES.hollow, FACES.hardened, t)}} />;},
  // the Brighton boardwalk — the network reaching abroad (Solntsevskaya's real 1992 export, grounding
  // texture, not a literal claim of identity)
  brightonPier: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="brightonBoardwalk" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.focused, FACES.cold, t)}} />;},
  // the pakhan's office — the apex, the samovar and the wall map, the money still not yours
  pakhanApex: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="pakhanOffice" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.hollow, FACES.cold, t)}} />;},
};

// Space pack (astronaut — applicant -> ASCAN -> unassigned -> ISS crew member -> veteran/spacewalker
// -> Expedition Commander -> Chief Astronaut Office -> Artemis-era lunar commander). 8 new bespoke
// backdrops (this is the first off-world topic; nothing existing covers zero-g/vacuum/vehicle
// interiors). lunarSurface doubles as the cold open, the apex, and the loop-close payoff. cupolaEarth
// is the recurring sensory-anchor beat (first sight of Earth, re-triggered at every level-up).
const SPACE = {
  // the T-38 supersonic jet cockpit — ASCAN flight training, a named instructor in the back seat
  jetTrain: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="t38Cockpit" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 900, y: 860, scale: 1.2, view: 'front', expr: blendExpr(FACES.earnest, FACES.focused, t)}}
      extras={[{pose: A.sit(f + 15), x: 1320, y: 800, scale: 1.0, view: 'front', pal: DIM, expr: FACES.cold}]} />;},
  // the Neutral Buoyancy Lab — spacewalk training in the world's largest indoor pool, a submerged
  // ISS mockup, rising bubbles
  poolTrain: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="nbl" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 960, y: 760, scale: 1.15, view: 'front', expr: blendExpr(FACES.focused, FACES.hardened, t)}} />;},
  // the launch capsule — strapped into the seat, the porthole flame, the danger beat
  launchSeat: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="capsuleLaunch" bg="url(#swarm)"
      fig={{pose: A.sit(f), x: 960, y: 840, scale: 1.25, view: 'front', expr: blendExpr(FACES.worried, FACES.hardened, t)}} />;},
  // the ISS Cupola — the recurring master anchor: first sight of Earth, re-triggered every level-up
  cupolaView: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="cupolaEarth" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 960, y: 800, scale: 1.2, view: 'front', expr: blendExpr(FACES.awe, FACES.hollow, t)}} />;},
  // outside the station on tether — the calm before the midpoint reversal
  evaWalk: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="evaSpacewalk" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 960, y: 760, scale: 1.2, view: 'front', expr: blendExpr(FACES.focused, FACES.worried, t)}} />;},
  // the midpoint reversal itself — the real 2013 helmet water-intrusion type of emergency. Shares
  // evaWalk's backdrop art but is a distinct template/staging (zoomed tight on the visor, a cooler
  // gradient) so it never reads as the same picture as the calm EVA beat, per the
  // arenaSand/rudisCeremony shared-backdrop-distinct-staging pattern.
  evaEmergency: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="evaSpacewalk" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 960, y: 820, scale: 1.55, view: 'front', expr: blendExpr(FACES.worried, FACES.hollow, t)}} />;},
  // Mission Control — the ground side, the institutional-math beat (grounding who flies, who's cut)
  controlRoom: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="missionControl" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.25, view: 'front', expr: blendExpr(FACES.cold, FACES.hardened, t)}}
      extras={[{pose: A.sit(f), x: 1400, y: 900, scale: 0.9, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // inside the ISS — commanding the station, a crewmate nearby, Level 06 day-to-day
  stationCommand: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="stationOps" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 840, scale: 1.25, view: 'front', expr: blendExpr(FACES.hardened, FACES.cold, t)}}
      extras={[{pose: A.stand(f + 10), x: 1340, y: 850, scale: 1.0, view: 'profile', facing: -1, pal: DIM, expr: FACES.exhausted}]} />;},
  // the lunar surface — the flash-forward cold open, the Artemis-era apex, its loop-close payoff
  moonSurface: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="lunarSurface" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 960, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.awe, FACES.hollow, t)}} />;},
};

// Ottoman Empire pack (ottoman_empire — Balkan peasant boy -> acemi oglan -> Janissary -> corbaci ->
// sanjakbey -> beylerbey/pasha -> vizier -> Grand Vizier/Sadrazam). 4 new bespoke backdrops (a 5th
// template, cauldronRevolt, deliberately REUSES janissaryBarracks's exact backdrop art under a
// distinct staging, per the arenaSand/rudisCeremony and evaWalk/evaEmergency shared-backdrop
// pattern). The rest of the ladder composes from ROMAN's legionDrill/shieldWall/warCouncil/
// praetorians, SAMURAI's merchantHouse/lordAudience/keepTop, DYNASTY's portraitHall, and universal
// fileWall/dinner — deliberately avoiding modern-coded universal templates (desk/deskSilhouette/
// boardroomNotes/boardroomHead/revolvingDoor/warRoom/emptyChair all read anachronistic here).
const OTTOMAN = {
  // the Balkan hill village — Level 1's named want, the devshirme-collection restage, the loop callback
  balkanVillage: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="balkanVillage" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // the barracks courtyard — THE recurring sensory anchor (the regimental cauldron), training through
  // corbaci command
  janissaryBarracks: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="janissaryBarracks" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.hardened, t)}} />;},
  // the cauldron overturned — the MIDPOINT REVERSAL (the VERIFIED 1622 mutiny that deposed and killed
  // Sultan Osman II). Shares janissaryBarracks' exact backdrop art but a cooler, chaotic staging with
  // a dim massing crowd, per the arenaSand/rudisCeremony shared-backdrop-distinct-staging pattern.
  cauldronRevolt: () => {const f = useCurrentFrame();
    return <Stage backdrop="janissaryBarracks" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 906, scale: 1.4, view: 'front', expr: FACES.hollow}}
      extras={[{pose: A.stand(f + 12), x: 1360, y: 900, scale: 1.1, view: 'profile', facing: -1, pal: DIM, face: false},
               {pose: A.stand(f + 24), x: 1480, y: 906, scale: 1.0, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the Divan chamber — the Tower of Justice grille, Level 07's share-worthy "someone may be watching" beat
  divanChamber: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="divanChamber" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.focused, FACES.cold, t)}} />;},
  // the sultan's audience hall — the MID-ACTION cold open, the Grand Vizier apex, and the loop-close
  // payoff (the same silk-cord case, a different name on it)
  sultanAudience: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="sultanAudience" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.hollow, FACES.cold, t)}} />;},
};

// Pirate pack (pirate — green hand -> able seaman -> specialist (gunner/boatswain) -> quartermaster
// -> captain -> commodore/fleet command -> the reckoning). 7 new bespoke backdrops (this is the first
// tall-ship/naval topic; nothing existing covers rigging/broadsides/a gallows). The rest of the
// ladder composes from universal `signing` (the Articles, voted and signed by the whole crew) and
// MAFIA's `countRoom` (re-narrated: splitting shares of pieces of eight under a naked bulb),
// `courtroom` (the Admiralty trial), `prisonCell` (captured, awaiting trial) — crime-adjacent packs
// read fine for piracy per the cartel/yakuza/bratva cross-genre precedent. Also reuses OCEAN's
// `oceanCapsize` for the storm danger beat rather than authoring a second storm backdrop.
const PIRATE = {
  // the fishing cove — Level 1's named want, the origin, the loop-close callback (older, same cove)
  fishingCove: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="fishingCove" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // the working deck — THE recurring master/home-base beat, every rank still stands on this deck
  shipDeck: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="shipDeck" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.hardened, t)}} />;},
  // the broadside — a prize taken by force, the danger escalation, powder smoke and a damaged enemy hull
  broadsideBattle: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="broadsideBattle" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 906, scale: 1.35, view: 'front', expr: blendExpr(FACES.focused, FACES.hardened, t)}} />;},
  // Nassau harbor — the Republic of Pirates, the haven, the pardon offered, the loot spent fast
  nassauHarbor: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="nassauHarbor" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.exhausted, FACES.smug, t)}} />;},
  // the captain's great cabin — the chart table, the chest, the stern windows — command's private
  // authority, the apex: you can command a fortune and still not own a shilling of it
  captainsCabin: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="captainsCabin" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.hardened, FACES.hollow, t)}} />;},
  // marooned — the real, verified Articles punishment: a bare sandbar, an empty horizon, alone
  marooned: () => {const f = useCurrentFrame();
    return <Stage backdrop="marooned" bg="url(#sclean)"
      fig={{pose: A.sit(f), x: 900, y: 900, scale: 1.3, view: 'front', expr: FACES.hollow}} />;},
  // Execution Dock — the cold open + its loop-close payoff, the reckoning above every rank
  executionDock: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="executionDock" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 1000, scale: 1.3, view: 'front', expr: blendExpr(FACES.cold, FACES.hollow, t)}} />;},
};

// Basketball pack (basketball_player — driveway hopeful through college/G-League/two-way/drafted
// rookie/veteran/All-Star to a supermax superstar and the global-brand apex, and the empty rafters
// above all of it). 6 new bespoke backdrops (this is the first team-sport-arena topic; the existing
// generic SPORTS pack's stadiumField is soccer-coded and medalPodium is Olympic-coded, neither fits
// an NBA ladder). The rest of the ladder composes from universal `layoffs` (re-narrated: waived,
// cut from the roster), `signing`/`dinner`/`boardroomNotes`/`jet`/`window`/`tower`/`emptyChair`/
// `lobby` for agent/contract/endorsement beats, and the GEN pack's `podiumScene` for draft night and
// press conferences.
const BASKETBALL = {
  // the driveway hoop — Level 1's named want, the origin, the loop-close callback (older, same hoop)
  drivewayHoop: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="drivewayHoop" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 900, y: 892, scale: 1.3, view: 'front', expr: blendExpr(FACES.earnest, FACES.worried, t)}} />;},
  // the high school gym — the first spectacle, the scout in the stands, the scoreboard climbing
  highSchoolGym: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="highSchoolGym" bg="url(#swarm)" figBehind
      fig={{pose: A.type_(f, fps), x: 900, y: 866, scale: 1.3, view: 'profile', facing: 1, expr: FACES.focused}} />;},
  // the G League bus — the grind, the recurring mentor's coach seat, the long nights between towns
  gLeagueBus: () => {const f = useCurrentFrame();
    return <Stage backdrop="gLeagueBus" bg="url(#spaper)"
      fig={{pose: A.sit(f), x: 900, y: 700, scale: 1.25, view: 'profile', facing: 1, expr: FACES.exhausted}}
      extras={[{pose: A.sit(f + 10), x: 1160, y: 700, scale: 1.15, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
  // the arena court — THE recurring master backdrop, reused across the rookie debut, the veteran
  // grind, the All-Star run, and the supermax apex — relit differently (light/warm -> dark/gold) each
  // time per the ludusYard/arenaSand shared-backdrop-distinct-staging pattern
  arenaCourt: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="arenaCourt" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 900, y: 900, scale: 1.35, view: 'front', expr: blendExpr(FACES.focused, FACES.hardened, t)}} />;},
  // the ice tub — THE sensory anchor home base, re-triggered every level-up, bigger and colder each time
  iceBathRoom: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="iceBathRoom" bg="url(#sclean)"
      fig={{pose: A.sit(f), x: 900, y: 860, scale: 1.3, view: 'front', expr: blendExpr(FACES.hardened, FACES.hollow, t)}} />;},
  // rafters retirement — the flash-forward cold open + its loop-close payoff: the empty arena, the
  // jersey banner already hanging, cut away before the reason why is ever said out loud
  rafterRetirement: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="rafterRetirement" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 900, y: 990, scale: 1.3, view: 'front', expr: blendExpr(FACES.hollow, FACES.cold, t)}} />;},
};

// Motorsport pack (f1_driver — karting through F4/F3/F2 to an F1 reserve seat, a race seat, a
// podium, and a world championship, and the reckoning above even that). 7 new bespoke backdrops —
// this is the first single-seater-racing topic; nothing existing covers a cockpit/harness/pit wall.
// The rest of the ladder composes from universal `signing`/`dinner`/`boardroomNotes`/`window`/
// `fileWall`/`deskClose`/`layoffs` (re-narrated: a sponsor-funded seat "reevaluation").
const MOTORSPORT = {
  // the kart track — Level 1's named want, the origin, the loop-close callback
  kartTrack: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="kartTrack" bg="url(#spaper)"
      fig={{pose: A.stand(f), x: 960, y: 972, scale: 1.15, view: 'front', expr: blendExpr(FACES.earnest, FACES.focused, t)}} />;},
  // the paddock garage — the junior-formula grind, the family's debt made physical
  paddockGarage: () => {const f = useCurrentFrame();
    return <Stage backdrop="paddockGarage" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 1080, y: 900, scale: 1.3, view: 'profile', facing: -1, expr: FACES.exhausted}} />;},
  // the grid walk — the F1 debut, rookie-race pressure, the crowd behind the barriers
  gridWalk: () => {const f = useCurrentFrame(); const {fps} = useVideoConfig();
    return <Stage backdrop="gridWalk" bg="url(#swarm)"
      fig={{pose: A.walk(f, fps), x: 960, y: 940, scale: 1.3, view: 'profile', facing: 1, expr: FACES.worried}} />;},
  // the pit wall — team command, strategy, the radio call
  pitWall: () => {const f = useCurrentFrame();
    return <Stage backdrop="pitWall" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 1240, y: 900, scale: 1.25, view: 'front', expr: FACES.focused}} />;},
  // the cockpit — THE sensory-anchor home base, the harness tightening at every level-up
  cockpitClose: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="cockpitClose" bg="url(#spaper)"
      fig={{pose: A.sit(f), x: 960, y: 940, scale: 1.4, view: 'front', expr: blendExpr(FACES.cold, FACES.hardened, t)}} />;},
  // the podium — the win, the apex, made real
  podiumSpray: () => {const f = useCurrentFrame();
    return <Stage backdrop="podiumSpray" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 1030, y: 862, scale: 1.35, view: 'front', expr: FACES.smug}} />;},
  // the crash barrier — the danger beat, the midpoint reversal
  crashBarrier: () => {const f = useCurrentFrame();
    return <Stage backdrop="crashBarrier" bg="url(#sclean)"
      fig={{pose: A.stand(f), x: 1000, y: 900, scale: 1.3, view: 'front', expr: FACES.shock}} />;},
};

export const PACK_TEMPLATES: Record<string, React.FC> = {...GEN, ...MED, ...STARTUP, ...MILITARY, ...SPORTS, ...HEDGE, ...REALESTATE, ...SPY, ...ROMAN, ...MAFIA, ...DYNASTY, ...SAMURAI, ...CARTEL, ...OCEAN, ...BLACKMARKET, ...NORTHKOREA, ...ZOMBIE, ...WASTE, ...LOTTERY, ...YAKUZA, ...MONGOL, ...GLADIATOR, ...BRATVA, ...SPACE, ...OTTOMAN, ...PIRATE, ...BASKETBALL, ...MOTORSPORT};
