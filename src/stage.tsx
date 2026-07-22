import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {StickFigure, LIGHT, SIL, DIM, PAPER} from './figure';
import {FACES, blendExpr} from './faces';
import * as A from './actions';
import meta from './episode_meta.json';

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
      {/* desks row */}
      {[300, 760].map((x) => <rect key={x} x={x} y={640} width={300} height={26} rx={4} fill={PAPERC} stroke={INK} strokeWidth={4} />)}
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
};
// tiny helper so inline math reads cleanly above
function y_(v: number) {return v;}

// =================== PROPS (mid plane) ===================
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
    return <Stage backdrop="podiumStage" prop="podium" bg="url(#swarm)"
      fig={{pose: A.stand(f), x: 1110, y: 940, scale: 1.5, view: 'front', expr: FACES.cold}} />;},
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
    return <Stage backdrop="garage" prop="bench" bg="url(#spaper)" figBehind
      fig={{pose: A.type_(f, fps), x: 900, y: 878, scale: 1.25, view: 'profile', facing: 1, expr: FACES.earnest}} />;},
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
  warCouncil: () => {const f = useCurrentFrame();
    return <Stage backdrop="tentCamp" prop="mapTable" bg="url(#sclean)" figBehind
      fig={{pose: A.stand(f), x: 800, y: 856, scale: 1.25, view: 'front', expr: FACES.cold}}
      extras={[{pose: A.stand(f), x: 1180, y: 856, scale: 1.1, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
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
  // the tea room: the sit-down, the warning, the politics — a low table by the tokonoma
  teaCeremony: () => {const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
    const t = interpolate(f, [d * 0.3, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
    return <Stage backdrop="teaRoom" prop="teaTable" bg="url(#swarm)" figBehind
      fig={{pose: A.sit(f), x: 680, y: 800, scale: 1.2, view: 'profile', facing: 1, expr: blendExpr(FACES.focused, FACES.conflicted, t)}}
      extras={[{pose: A.sit(f + 40), x: 1240, y: 800, scale: 1.2, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
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

export const PACK_TEMPLATES: Record<string, React.FC> = {...GEN, ...MED, ...STARTUP, ...MILITARY, ...SPORTS, ...HEDGE, ...REALESTATE, ...SPY, ...ROMAN, ...MAFIA, ...DYNASTY, ...SAMURAI, ...CARTEL, ...OCEAN, ...BLACKMARKET, ...NORTHKOREA, ...ZOMBIE};
