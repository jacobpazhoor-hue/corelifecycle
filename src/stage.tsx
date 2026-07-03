import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {StickFigure, LIGHT, SIL, DIM, PAPER} from './figure';
import {FACES, blendExpr} from './faces';
import * as A from './actions';

// ============================================================================
// COMPOSABLE DOODLE STAGE — topic-specific scene packs.
// A scene = a backdrop (far plane) + an optional prop (mid) + figure(s) (near),
// composed by <Stage>, with subtle multi-plane parallax for depth ("3D" feel).
// Self-contained (own Defs/Frame) so it never disturbs the original scenes.tsx.
// New templates are exported as packs and merged into TEMPLATES in scenes.tsx.
// ============================================================================
const INK = '#2a2620';
const PAPERC = PAPER;
const FLOOR = '#ece5d6';
const LINE = '#cfc7b6';
const GOLD = '#e8b54b';
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x);};

const Defs: React.FC = () => (
  <defs>
    <filter id="srough" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter>
    <linearGradient id="spaper" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8f4ea" /><stop offset="1" stopColor="#ece4d3" /></linearGradient>
    <linearGradient id="sclean" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f7f4" /><stop offset="1" stopColor="#e6efe7" /></linearGradient>
    <linearGradient id="swarm" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf3e2" /><stop offset="1" stopColor="#f0e4cc" /></linearGradient>
    <radialGradient id="sglow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3d6" stopOpacity="0.5" /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></radialGradient>
    <radialGradient id="svig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#6b5f48" stopOpacity="0" /><stop offset="1" stopColor="#6b5f48" stopOpacity="0.12" /></radialGradient>
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
      {Array.from({length: 6}).map((_, r) => Array.from({length: 12}).map((_, c) => <rect key={r + '_' + c} x={c * 170 + (r % 2 ? 85 : 0)} y={200 + r * 104} width={150} height={90} fill="none" stroke={LINE} strokeWidth={2} opacity={0.32} />))}
      <rect x={1380} y={240} width={200} height={160} fill="#2a313a" stroke={INK} strokeWidth={4} />{[0, 1, 2].map((i) => <line key={i} x1={1430 + i * 50} y1={240} x2={1430 + i * 50} y2={400} stroke={INK} strokeWidth={3} />)}<ellipse cx={1480} cy={320} rx={150} ry={190} fill="url(#sglow)" opacity={0.3} />
      <rect x={200} y={640} width={360} height={40} fill={PAPERC} stroke={INK} strokeWidth={4} /><rect x={200} y={680} width={24} height={140} fill={PAPERC} stroke={INK} strokeWidth={3} /><rect x={536} y={680} width={24} height={140} fill={PAPERC} stroke={INK} strokeWidth={3} />
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
  plain: () => <g />,
};
// tiny helper so inline math reads cleanly above
function y_(v: number) {return v;}

// =================== PROPS (mid plane) ===================
const PROP: Record<string, React.FC<{frame: number}>> = {
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
      extras={[{pose: A.sit(f), x: 1200, y: 900, scale: 1.2, view: 'profile', facing: -1, pal: DIM, face: false}]} />;},
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
    return <Stage backdrop="serverRoom" prop="mapTable" bg="url(#sclean)" figBehind
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

export const PACK_TEMPLATES: Record<string, React.FC> = {...GEN, ...MED, ...STARTUP, ...MILITARY, ...SPORTS, ...HEDGE, ...REALESTATE, ...SPY, ...ROMAN, ...MAFIA, ...DYNASTY};
