import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {StickFigure, LIGHT, SIL, DIM, PAPER} from './figure';
import {FACES, blendExpr} from './faces';
import * as A from './actions';
import {PACK_TEMPLATES} from './stage';

// DOODLE / whiteboard palette — black ink on light paper.
const INK = '#2a2620';
const COL = {city: PAPER, cityLit: '#efe2c2', mullc: '#c7bfae', floor: '#ece5d6', warm: '#e8a23a', box: PAPER, boxLine: INK, gold: '#e8b54b', ink: INK, line: '#cfc7b6'};
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x);};
const WIN_COLORS = ['#efe2c2', '#f3ecd8', '#e7dcc0', '#efe2c2']; // soft lit-window fills

const Defs: React.FC = () => (
  <defs>
    {/* hand-drawn line wobble + paper grain */}
    <filter id="rough" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter>
    <filter id="paper"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" result="t" /><feColorMatrix in="t" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.05 0" /></filter>
    {/* every "mood" id => a subtle paper tint (stays light, slight warm/cool variation) */}
    <linearGradient id="night" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f8f4ea" /><stop offset="1" stopColor="#ece4d3" /></linearGradient>
    <linearGradient id="teal" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f1f5f1" /><stop offset="1" stopColor="#e2ebe4" /></linearGradient>
    <linearGradient id="amber" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf3e2" /><stop offset="1" stopColor="#f0e4cc" /></linearGradient>
    <linearGradient id="crimson" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf0ec" /><stop offset="1" stopColor="#f1e1da" /></linearGradient>
    <linearGradient id="indigo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f4f2f8" /><stop offset="1" stopColor="#e6e2ee" /></linearGradient>
    <linearGradient id="dusk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#fbf2e0" /><stop offset="1" stopColor="#efe1cb" /></linearGradient>
    <linearGradient id="dayg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f9f6ed" /><stop offset="1" stopColor="#ece5d6" /></linearGradient>
    {/* glows => faint warm light spots on paper */}
    <radialGradient id="glow" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#fff3d6" stopOpacity="0.55" /><stop offset="1" stopColor="#fff3d6" stopOpacity="0" /></radialGradient>
    <radialGradient id="glowGold" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe6ab" stopOpacity="0.6" /><stop offset="1" stopColor="#ffe6ab" stopOpacity="0" /></radialGradient>
    <radialGradient id="glowTeal" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#d8efe6" stopOpacity="0.5" /><stop offset="1" stopColor="#d8efe6" stopOpacity="0" /></radialGradient>
    <radialGradient id="lightTop" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffffff" stopOpacity="0.7" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
    {/* very subtle warm paper edge vignette + faint sweep */}
    <radialGradient id="vig" cx="0.5" cy="0.5" r="0.75"><stop offset="0.6" stopColor="#6b5f48" stopOpacity="0" /><stop offset="1" stopColor="#6b5f48" stopOpacity="0.12" /></radialGradient>
    <linearGradient id="sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#ffffff" stopOpacity="0" /><stop offset="0.5" stopColor="#ffffff" stopOpacity="0.05" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></linearGradient>
  </defs>
);

const Skyline: React.FC<{frame: number; baseY: number; tint?: string; o?: number}> = ({frame, baseY, tint = COL.city, o = 1}) => {
  const b: {x: number; w: number; h: number}[] = [];
  let x = -40, i = 0;
  while (x < 1960) {const w = 42 + rnd(i) * 70, h = 110 + rnd(i * 3 + 1) * 330; b.push({x, w, h}); x += w + 8 + rnd(i * 5) * 18; i++;}
  return (<g opacity={o}>
    {b.map((bb, idx) => {
      const top = baseY - bb.h, cols = Math.max(1, Math.floor(bb.w / 20)), rows = Math.floor(bb.h / 28);
      const wins: React.ReactNode[] = [];
      for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
        const id = idx * 97 + c * 7 + r;
        const lit = rnd(id) > 0.55;
        const tw = lit && rnd(id * 2) > 0.8 ? (0.4 + 0.6 * (0.5 + 0.5 * Math.sin(frame * 0.12 + id))) : 1;
        wins.push(<rect key={c + '-' + r} x={bb.x + 8 + c * 20} y={top + 11 + r * 28} width={11} height={15} rx={1}
          fill={lit ? WIN_COLORS[Math.floor(rnd(id * 3) * WIN_COLORS.length)] : 'none'} stroke={INK} strokeWidth={1.6} opacity={lit ? tw : 0.55} />);
      }
      return <g key={idx}><rect x={bb.x} y={top} width={bb.w} height={bb.h} fill={PAPER} stroke={INK} strokeWidth={3} />{wins}</g>;
    })}
  </g>);
};

const Mullions: React.FC<{o?: number}> = ({o = 0.5}) => (
  <g stroke={COL.line} strokeWidth={3} opacity={o}>
    {[0, 240, 480, 720, 960, 1200, 1440, 1680, 1920].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={840} />)}
    <line x1={0} y1={150} x2={1920} y2={150} /><line x1={0} y1={500} x2={1920} y2={500} />
  </g>
);

// atmosphere: top color haze + a slow moving light sweep + drifting dust (stimulation/refinement)
const Atmos: React.FC<{frame: number; haze?: string}> = ({frame, haze = 'glow'}) => {
  const sx = -700 + ((frame * 2.4) % 3400);
  return (
    <g>
      <ellipse cx={760} cy={-120} rx={1500} ry={560} fill={`url(#${haze})`} opacity={0.22} />
      <rect x={sx} y={-60} width={560} height={1200} fill="url(#sweep)" transform={`skewX(-16)`} />
      {Array.from({length: 13}).map((_, i) => {
        const x = rnd(i * 1.7) * 1920 + Math.sin(frame * 0.012 + i) * 44;
        const y = (((rnd(i * 2.3) * 1080) - (frame / 30) * (6 + rnd(i) * 14)) % 1120 + 1120) % 1120;
        return <circle key={i} cx={x} cy={y} r={1.6} fill="#b8b0a0" opacity={0.16} />;
      })}
    </g>
  );
};

// ---- animated layers ----
const Rain: React.FC<{frame: number; count?: number; o?: number}> = ({frame, count = 70, o = 0.22}) => {
  const ls: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = rnd(i * 3.1) * 2000 - 40, speed = 900 + rnd(i * 5.3) * 700, len = 16 + rnd(i * 7.7) * 24;
    const y = (((rnd(i * 9.1) * 1200) + (frame / 30) * speed) % 1180) - 40;
    ls.push(<line key={i} x1={x} y1={y} x2={x - 7} y2={y + len} stroke={COL.line} strokeWidth={2} opacity={o * 0.7} />);
  }
  return <g>{ls}</g>;
};
const Steam: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => (
  <g>{[0, 1, 2].map((i) => {const ph = frame * 0.06 + i * 1.7; return <path key={i} d={`M ${x + i * 7 - 7} ${y} q ${Math.sin(ph) * 9} -22 ${Math.sin(ph + 1) * 3} -46`} fill="none" stroke={COL.line} strokeWidth={3} strokeLinecap="round" opacity={0.5} />;})}</g>
);
const Coffee: React.FC<{x: number; y: number; frame: number}> = ({x, y, frame}) => (
  <g>
    <Steam x={x} y={y - 16} frame={frame} />
    <path d={`M ${x - 15} ${y} L ${x - 12} ${y + 28} Q ${x} ${y + 36} ${x + 12} ${y + 28} L ${x + 15} ${y} Z`} fill={PAPER} stroke={INK} strokeWidth={3} />
    <path d={`M ${x + 15} ${y + 4} q 15 4 0 20`} fill="none" stroke={INK} strokeWidth={4} />
    <ellipse cx={x} cy={y} rx={15} ry={5} fill="#7a5a3a" stroke={INK} strokeWidth={2} />
  </g>
);
const ScreenLines: React.FC<{x: number; y: number; w: number; frame: number}> = ({x, y, w, frame}) => {
  const rows: React.ReactNode[] = [];
  for (let i = 0; i < 6; i++) {const ly = y + i * 9 - ((frame * 0.4) % 9); rows.push(<rect key={i} x={x} y={ly} width={w * (0.35 + rnd(i * 4.2) * 0.55)} height={3} rx={1.5} fill={INK} opacity={0.55} />);}
  const caret = Math.floor(frame / 14) % 2 ? <rect x={x} y={y + 50} width={7} height={10} fill="#e6f3ff" /> : null;
  return <g>{rows}{caret}</g>;
};

// Real laptop: keyboard base + upright screen (faces viewer) + glow. Character sits BEHIND it.
const Laptop: React.FC<{cx: number; deskY: number; frame: number; w?: number; h?: number; glow?: boolean; lit?: boolean}> =
({cx, deskY, frame, w = 170, h = 104, glow = true, lit = true}) => {
  const hw = w / 2, kbTop = deskY - 18, scrTop = kbTop - h;
  const flick = 0.78 + 0.22 * Math.sin(frame * 0.35);
  const clip = `lap${Math.round(cx)}_${Math.round(deskY)}`;
  return (
    <g>
      {glow && lit && <ellipse cx={cx} cy={scrTop + h * 0.55} rx={w * 0.9} ry={h} fill="url(#glowGold)" opacity={0.4 + 0.2 * Math.sin(frame * 0.35)} />}
      {/* keyboard base (perspective slab) */}
      <path d={`M ${cx - hw - 14} ${deskY} L ${cx + hw + 14} ${deskY} L ${cx + hw} ${kbTop} L ${cx - hw} ${kbTop} Z`} fill={PAPER} stroke={INK} strokeWidth={4} />
      <rect x={cx - w * 0.16} y={deskY - 13} width={w * 0.32} height={8} rx={2} fill="none" stroke={INK} strokeWidth={1.6} />
      {/* screen */}
      <rect x={cx - hw} y={scrTop} width={w} height={h} rx={8} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={cx - hw + 9} y={scrTop + 9} width={w - 18} height={h - 18} rx={2} fill="#f0ebdd" />
      {lit && (
        <>
          <clipPath id={clip}><rect x={cx - hw + 9} y={scrTop + 9} width={w - 18} height={h - 18} rx={2} /></clipPath>
          <g clipPath={`url(#${clip})`}>
            {[0, 1, 2, 3, 4, 5, 6].map((i) => {
              const step = (h - 18) / 6;
              const ly = scrTop + 14 + i * step - ((frame * 0.5) % step);
              return <rect key={i} x={cx - hw + 16} y={ly} width={(w - 32) * (0.32 + rnd(i * 4.2) * 0.55)} height={3} rx={1.5} fill={INK} opacity={0.7} />;
            })}
            {Math.floor(frame / 16) % 2 ? <rect x={cx - hw + 16} y={scrTop + h - 22} width={7} height={9} fill={INK} /> : null}
          </g>
        </>
      )}
    </g>
  );
};

// Document on the desk + pen (for signing scenes)
const Document: React.FC<{x: number; y: number; handX: number; handY: number}> = ({x, y, handX, handY}) => (
  <g>
    <g transform={`rotate(-7 ${x} ${y})`}>
      <rect x={x - 58} y={y - 38} width={116} height={76} rx={3} fill={PAPER} stroke={INK} strokeWidth={3} />
      {[0, 1, 2].map((i) => <rect key={i} x={x - 44} y={y - 24 + i * 13} width={88} height={3} rx={1.5} fill={COL.line} />)}
      <line x1={x - 30} y1={y + 20} x2={x + 34} y2={y + 20} stroke={INK} strokeWidth={2} />
    </g>
    {/* pen from hand to paper */}
    <line x1={handX} y1={handY} x2={x - 6} y2={y + 12} stroke={INK} strokeWidth={6} strokeLinecap="round" />
  </g>
);
const Clouds: React.FC<{frame: number; baseY: number; o?: number}> = ({frame, baseY, o = 0.12}) => (
  <g>{[0, 1, 2, 3, 4].map((i) => {const x = ((rnd(i * 2.7) * 2200) + (frame / 30) * (16 + i * 6)) % 2400 - 220; const y = baseY + rnd(i * 3.9) * 110 - 55; const s = 120 + rnd(i * 5.1) * 120; return <ellipse key={i} cx={x} cy={y} rx={s} ry={s * 0.4} fill="#ffffff" opacity={o} />;})}</g>
);
const CarLights: React.FC<{frame: number; y: number}> = ({frame, y}) => (
  <g>{[0, 1, 2, 3, 4, 5].map((i) => {const dir = i % 2 ? 1 : -1; const t = ((frame / 30) * (240 + i * 50) + rnd(i) * 1920) % 2000; const x = dir > 0 ? t - 40 : 1960 - t; return <ellipse key={i} cx={x} cy={y} rx={22} ry={4} fill={dir > 0 ? '#ffd9a0' : '#ff8575'} opacity={0.5} />;})}</g>
);
const Motes: React.FC<{frame: number; n?: number}> = ({frame, n = 16}) => (
  <g>{Array.from({length: n}).map((_, i) => {const x = rnd(i * 1.3) * 1920 + Math.sin(frame * 0.01 + i) * 28; const y = (((rnd(i * 2.1) * 1080) - (frame / 30) * (8 + rnd(i) * 16)) % 1120 + 1120) % 1120; return <circle key={i} cx={x} cy={y} r={1.7} fill="#cfe0f0" opacity={0.16} />;})}</g>
);

const Frame: React.FC<{children: React.ReactNode; bg?: string; haze?: string; atmos?: boolean}> = ({children, bg = 'url(#night)', haze = 'glow', atmos = true}) => {
  const f = useCurrentFrame();
  return (
    <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{display: 'block'}}>
      <Defs />
      <rect x={0} y={0} width={1920} height={1080} fill={bg} />
      {atmos && <Atmos frame={f} haze={haze} />}
      {children}
      <rect x={0} y={0} width={1920} height={1080} fill="url(#vig)" />
    </svg>
  );
};

const Desk: React.FC<{y: number}> = ({y}) => (
  <g>
    <rect x={0} y={y} width={1920} height={1080 - y} fill={COL.floor} />
    <line x1={0} y1={y} x2={1920} y2={y} stroke={INK} strokeWidth={5} strokeLinecap="round" />
  </g>
);

// ---- scenes ----
const S00: React.FC = () => {
  const f = useCurrentFrame();
  return (<Frame>
    <Skyline frame={f} baseY={760} /><Rain frame={f} o={0.26} /><Mullions o={0.55} />
    <StickFigure pose={A.sit(f)} x={1180} y={886} scale={1.2} facing={-1} view="profile" expr={FACES.tired} pal={LIGHT} frame={f} />
    <Desk y={830} />
    <Laptop cx={1095} deskY={830} frame={f} w={124} h={80} />
  </Frame>);
};
const S01: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Frame>
    <Skyline frame={f} baseY={620} tint="#0e1925" o={0.8} /><Rain frame={f} o={0.18} /><Mullions o={0.4} />
    <StickFigure pose={A.type_(f, fps)} x={870} y={858} scale={1.6} facing={1} view="profile" expr={FACES.exhausted} pal={LIGHT} frame={f} />
    <Desk y={830} />
    <Laptop cx={930} deskY={830} frame={f} w={186} h={114} />
    <Coffee x={720} y={812} frame={f} />
  </Frame>);
};
const S02: React.FC = () => {
  const f = useCurrentFrame();
  const boxes: React.ReactNode[] = [];
  for (let c = 0; c < 7; c++) for (let r = 0; r < 6; r++) {const x = 740 + c * 152, y = 230 + r * 112; boxes.push(<g key={c + '_' + r}><rect x={x} y={y} width={142} height={102} fill={COL.box} stroke={COL.boxLine} strokeWidth={4} /><line x1={x} y1={y + 34} x2={x + 142} y2={y + 34} stroke={COL.boxLine} strokeWidth={3} /><rect x={x + 50} y={y + 12} width={42} height={14} fill="#566a7e" /></g>);}
  return (<Frame>{boxes}<Motes frame={f} n={20} />
    <StickFigure pose={A.lookUp(f)} x={420} y={830} scale={1.35} facing={1} view="front" expr={FACES.worried} pal={LIGHT} frame={f} />
  </Frame>);
};
const S03: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [560, 1320]);
  return (<Frame>
    <polygon points="120,1080 380,120 520,120 520,1080" fill={PAPER} stroke={INK} strokeWidth={3} /><polygon points="1800,1080 1540,160 1400,160 1400,1080" fill={PAPER} stroke={INK} strokeWidth={3} /><polygon points="560,1080 720,80 980,80 1040,1080" fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={812} y={150} width={120} height={90} fill={COL.warm} opacity={0.9} /><rect x={812} y={150} width={120} height={90} fill="none" stroke={INK} strokeWidth={6} />
    <Skyline frame={f} baseY={1010} tint="#0a1119" o={0.7} />
    <CarLights frame={f} y={1002} />
    <line x1={0} y1={1010} x2={1920} y2={1010} stroke={INK} strokeWidth={8} />
    <StickFigure pose={A.walk(f, fps)} x={x} y={952} scale={0.62} facing={1} view="profile" expr={FACES.earnest} pal={LIGHT} frame={f} />
  </Frame>);
};
const Junior: React.FC<{x: number; s: number; f: number; fps: number}> = ({x, s, f, fps}) => (
  <StickFigure pose={A.type_(f + x, fps)} x={x} y={690} scale={s} facing={x > 960 ? -1 : 1} view="profile" pal={DIM} showFace={false} frame={f} />
);
const S04: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Frame>
    <Skyline frame={f} baseY={460} tint="#0e1925" o={0.7} /><Rain frame={f} o={0.12} /><Mullions o={0.3} />
    <polygon points="430,980 1490,980 1240,640 680,640" fill={PAPER} stroke={INK} strokeWidth={5} />
    <Junior x={560} s={0.6} f={f} fps={fps} /><Junior x={1360} s={0.6} f={f + 30} fps={fps} />
    <StickFigure pose={A.sign(f, fps)} x={960} y={836} scale={0.95} facing={1} view="profile" expr={FACES.focused} pal={LIGHT} frame={f} />
    <Document x={1050} y={818} handX={1043} handY={804} />
    <rect x={300} y={930} width={1320} height={150} fill={COL.floor} />
  </Frame>);
};
const S05: React.FC = () => {
  // deskClose — a CLOSE-UP INSERT, not another laptop-and-skyline wide (t09 owns that framing):
  // the diligence folder + a contract page filling the frame, ONE customer line highlighted.
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  // the moral turn: starts focused, shifts to conflicted as he reads the buried line
  const t = interpolate(f, [d * 0.35, d * 0.7], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // the highlight + red circle draw ON as the realization lands
  const hl = interpolate(f, [d * 0.3, d * 0.55], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<Frame>
    <StickFigure pose={A.sit(f)} x={400} y={880} scale={1.9} facing={1} view="profile" expr={blendExpr(FACES.focused, FACES.conflicted, t)} pal={LIGHT} frame={f} />
    <Desk y={840} />
    {/* diligence folder under the page */}
    <g transform="rotate(-3 1100 620)">
      <rect x={690} y={330} width={820} height={560} rx={10} fill="#e3d5ae" stroke={INK} strokeWidth={5} />
      <path d="M 690 348 L 690 330 Q 690 316 704 316 L 930 316 L 972 348" fill="#e3d5ae" stroke={INK} strokeWidth={4} />
    </g>
    {/* the contract page (the insert itself) */}
    <g transform="rotate(2 1120 620)">
      <rect x={780} y={362} width={680} height={516} rx={6} fill={PAPER} stroke={INK} strokeWidth={5} />
      <rect x={830} y={402} width={300} height={10} rx={5} fill={INK} opacity={0.7} />
      {[0, 1, 2, 3, 5, 6, 7].map((i) => <rect key={i} x={830} y={452 + i * 46} width={i % 3 ? 560 : 420} height={7} rx={3.5} fill={COL.line} />)}
      {/* THE buried customer line: gold highlight + a hand-drawn red circle around it */}
      <rect x={822} y={622} width={580 * hl} height={28} fill={COL.gold} opacity={0.5} />
      <rect x={830} y={636} width={560} height={7} rx={3.5} fill={INK} opacity={0.85} />
      <ellipse cx={1112} cy={638} rx={314} ry={40} fill="none" stroke="#c0392b" strokeWidth={5} opacity={hl} />
    </g>
  </Frame>);
};
const S06: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames: d} = useVideoConfig();
  const t6 = interpolate(f, [d * 0.2, d * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<Frame>
    <rect x={0} y={0} width={1920} height={1080} fill={COL.floor} /><rect x={560} y={120} width={900} height={840} fill={PAPER} stroke={INK} strokeWidth={3} />
    <Skyline frame={f} baseY={520} tint="#13202e" o={0.5} /><Rain frame={f} count={40} o={0.1} />
    <StickFigure pose={A.type_(f, fps)} x={790} y={742} scale={0.66} facing={1} view="profile" pal={DIM} showFace={false} frame={f} />
    <StickFigure pose={A.type_(f + 40, fps)} x={1170} y={742} scale={0.66} facing={-1} view="profile" pal={DIM} showFace={false} frame={f} />
    <rect x={690} y={760} width={236} height={120} fill={PAPER} stroke={INK} strokeWidth={2} /><rect x={1074} y={760} width={236} height={120} fill={PAPER} stroke={INK} strokeWidth={2} />
    <Laptop cx={848} deskY={760} frame={f} w={72} h={48} />
    <Laptop cx={1112} deskY={760} frame={f + 20} w={72} h={48} />
    <rect x={120} y={60} width={360} height={1020} fill={PAPER} stroke={INK} strokeWidth={3} /><rect x={120} y={60} width={40} height={1020} fill={INK} />
    <StickFigure pose={A.stand(f)} x={330} y={770} scale={1.5} facing={1} view="front" expr={blendExpr(FACES.neutral, FACES.hardened, t6)} pal={LIGHT} frame={f} />
  </Frame>);
};
const S07: React.FC = () => {
  const f = useCurrentFrame();
  return (<Frame>
    <Skyline frame={f} baseY={780} tint="#13202e" /><Rain frame={f} o={0.24} /><Mullions o={0.5} />
    <StickFigure pose={A.stand(f)} x={960} y={770} scale={1.6} facing={1} view="profile" expr={FACES.hollow} pal={LIGHT} frame={f} />
  </Frame>);
};
const S08: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames: d} = useVideoConfig();
  const t8 = interpolate(f, [d * 0.25, d * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<Frame>
    <Skyline frame={f} baseY={640} tint="#13202e" o={0.7} /><Rain frame={f} o={0.1} /><Mullions o={0.35} />
    <StickFigure pose={A.sign(f, fps)} x={820} y={836} scale={1.55} facing={1} view="profile" expr={blendExpr(FACES.neutral, FACES.smug, t8)} pal={LIGHT} frame={f} />
    <Desk y={830} />
    <Document x={965} y={814} handX={956} handY={786} />
  </Frame>);
};
const S09: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [480, 1180]);
  return (<Frame bg="url(#dusk)">
    <g fill="#111b27" opacity={0.95}><ellipse cx={1500} cy={780} rx={360} ry={48} /><polygon points="1500,760 1360,690 1330,700 1470,775" /><polygon points="1760,760 1840,690 1855,705 1800,775" /><polygon points="1230,782 1180,782 1210,756 1245,762" /></g>
    <line x1={0} y1={900} x2={1920} y2={900} stroke="#1a2230" strokeWidth={10} /><rect x={0} y={900} width={1920} height={180} fill="#1b2430" opacity={0.6} />
    <StickFigure pose={A.walk(f, fps)} x={x} y={840} scale={1.0} facing={1} view="profile" expr={FACES.cold} pal={LIGHT} briefcase frame={f} />
  </Frame>);
};
// shared private-dinner backdrop (two figures, candle) — used by L5 & L7
const Dinner: React.FC<{f: number; mainExpr: any}> = ({f, mainExpr}) => (
  <>
    <Skyline frame={f} baseY={520} tint="#10202e" o={0.4} /><Mullions o={0.22} />
    <ellipse cx={970} cy={700} rx={300} ry={170} fill="#f2c14e" opacity={0.1} />
    <ellipse cx={970} cy={700} rx={150} ry={90} fill="#f2c14e" opacity={0.1} />
    <StickFigure pose={A.sit(f)} x={700} y={762} scale={1.2} facing={1} view="profile" expr={mainExpr} pal={LIGHT} frame={f} />
    <StickFigure pose={A.sit(f + 50)} x={1240} y={762} scale={1.2} facing={-1} view="profile" pal={DIM} showFace={false} frame={f} />
    <rect x={0} y={722} width={1920} height={358} fill={COL.floor} /><rect x={0} y={722} width={1920} height={8} fill={INK} />
    {/* the dinner table between them — top + two legs, so it reads as a MEAL, not a street */}
    <rect x={800} y={694} width={340} height={16} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    <line x1={846} y1={710} x2={834} y2={806} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <line x1={1094} y1={710} x2={1106} y2={806} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    {/* candle + glasses ON the tabletop */}
    <rect x={964} y={666} width={10} height={28} fill="#e9eef4" /><ellipse cx={969} cy={660} rx={6} ry={11} fill="#ffd9a0" />
    <rect x={860} y={672} width={8} height={22} rx={2} fill="#9fb6cf" opacity={0.6} /><rect x={1080} y={672} width={8} height={22} rx={2} fill="#9fb6cf" opacity={0.6} />
  </>
);

const S10: React.FC = () => {  // Equity Partner — the dinner
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const t = interpolate(f, [d * 0.3, d * 0.65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<Frame bg="url(#amber)" haze="glowGold"><Dinner f={f} mainExpr={blendExpr(FACES.cold, FACES.smug, t)} /></Frame>);
};

const S11: React.FC = () => {  // book of business — boardroom power
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Frame>
    <Skyline frame={f} baseY={440} tint="#0e1925" o={0.7} /><Mullions o={0.3} />
    <polygon points="380,980 1540,980 1300,610 620,610" fill={PAPER} stroke={INK} strokeWidth={5} />
    <StickFigure pose={A.type_(f, fps)} x={620} y={700} scale={0.58} facing={1} view="profile" pal={DIM} showFace={false} frame={f} />
    <StickFigure pose={A.type_(f + 33, fps)} x={1300} y={700} scale={0.58} facing={-1} view="profile" pal={DIM} showFace={false} frame={f} />
    <StickFigure pose={A.stand(f)} x={960} y={628} scale={1.0} facing={1} view="front" expr={FACES.cold} pal={LIGHT} frame={f} />
    <rect x={300} y={930} width={1320} height={150} fill={COL.floor} />
  </Frame>);
};

const S12: React.FC = () => {  // managing partner — the atrium / running the machine
  const f = useCurrentFrame();
  const lines: React.ReactNode[] = [];
  for (let i = 0; i <= 10; i++) {const x = i * 192; lines.push(<line key={i} x1={x} y1={0} x2={960 + (x - 960) * 1.9} y2={900} stroke={COL.mullc} strokeWidth={4} opacity={0.4} />);}
  return (<Frame bg="url(#indigo)">
    <Skyline frame={f} baseY={600} tint="#1a2440" o={0.55} />
    {lines}
    <ellipse cx={960} cy={120} rx={520} ry={220} fill="url(#lightTop)" opacity={0.5} />
    <rect x={0} y={900} width={1920} height={180} fill={COL.floor} /><rect x={0} y={900} width={1920} height={8} fill={INK} />
    <StickFigure pose={A.stand(f)} x={960} y={892} scale={1.5} facing={1} view="front" expr={FACES.hardened} pal={LIGHT} frame={f} />
  </Frame>);
};

const S13: React.FC = () => {  // layoffs — right-sizing; people leaving
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const leavers = [980, 1180, 1380, 1560].map((x0, i) => {
    const x = x0 + ((f * 0.6) % 240); const s = 0.6 - i * 0.04;
    return <StickFigure key={i} pose={A.walk(f + i * 40, fps)} x={x} y={904} scale={s} facing={1} view="profile" pal={DIM} showFace={false} frame={f} />;
  });
  return (<Frame bg="url(#crimson)" haze="glowGold">
    <Skyline frame={f} baseY={520} tint="#2a1622" o={0.5} /><Mullions o={0.28} />
    <rect x={1760} y={300} width={150} height={620} fill={PAPER} stroke={INK} strokeWidth={3} /><rect x={1760} y={300} width={20} height={620} fill={INK} />
    {leavers}
    {/* color pop: red EXIT sign */}
    <rect x={1775} y={250} width={118} height={40} rx={4} fill="#c0392b" /><text x={1834} y={279} textAnchor="middle" fill="#fff" fontFamily="'Helvetica Neue', sans-serif" fontWeight={800} fontSize={24} letterSpacing={2}>EXIT</text>
    <rect x={0} y={912} width={1920} height={168} fill={COL.floor} />
    <StickFigure pose={A.stand(f)} x={360} y={904} scale={1.5} facing={1} view="front" expr={FACES.hollow} pal={LIGHT} frame={f} />
  </Frame>);
};

const S14: React.FC = () => {  // power broker — the revolving door (govt <-> capital)
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [760, 1180]);
  const cols = [0, 1, 2, 3, 4].map((i) => <rect key={i} x={250 + i * 80} y={420} width={36} height={400} fill={PAPER} stroke={INK} strokeWidth={3} />);
  return (<Frame>
    {/* government building left */}
    <polygon points="210,420 590,420 400,300" fill={PAPER} stroke={INK} strokeWidth={3} />{cols}<rect x={230} y={820} width={400} height={16} fill={INK} />
    {/* glass tower right */}
    <rect x={1340} y={180} width={420} height={700} fill={PAPER} stroke={INK} strokeWidth={3} /><Skyline frame={f} baseY={880} tint="#0c1826" o={0.5} />
    <line x1={0} y1={910} x2={1920} y2={910} stroke={INK} strokeWidth={8} />
    <StickFigure pose={A.walk(f, fps)} x={x} y={870} scale={0.9} facing={1} view="profile" expr={FACES.smug} pal={LIGHT} frame={f} />
  </Frame>);
};

const S15: React.FC = () => {  // the private dinner — Geneva
  const f = useCurrentFrame();
  return (<Frame bg="url(#amber)" haze="glowGold"><Dinner f={f} mainExpr={FACES.cold} /></Frame>);
};

const S16: React.FC = () => {  // the Architect — war room / sovereign
  const f = useCurrentFrame();
  const cities = [[760, 430], [1180, 380], [980, 520], [840, 560], [1240, 540], [1080, 300]];
  const lit = (i: number) => i % 2 === 0;
  return (<Frame bg="url(#teal)" haze="glowTeal">
    {/* side screens */}
    <rect x={60} y={300} width={260} height={420} fill={PAPER} stroke={INK} strokeWidth={3} /><ScreenLines x={84} y={320} w={210} frame={f} />
    <rect x={1600} y={300} width={260} height={420} fill={PAPER} stroke={INK} strokeWidth={3} /><ScreenLines x={1624} y={320} w={210} frame={f} />
    {/* globe */}
    <circle cx={980} cy={440} r={240} fill="none" stroke={INK} strokeWidth={3} />
    <ellipse cx={980} cy={440} rx={240} ry={90} fill="none" stroke={INK} strokeWidth={2} />
    <ellipse cx={980} cy={440} rx={120} ry={240} fill="none" stroke={INK} strokeWidth={2} />
    <path d={`M 820 360 Q 1080 240 1180 380`} fill="none" stroke="#f2c14e" strokeWidth={2} opacity={0.6} />
    <path d={`M 840 560 Q 1000 640 1240 540`} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
    {cities.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={lit(i) ? 7 : 5} fill={lit(i) ? '#f2c14e' : '#bfe0ff'} opacity={lit(i) ? 0.9 * (0.6 + 0.4 * Math.sin(f * 0.12 + i)) : 0.5} />)}
    <rect x={0} y={900} width={1920} height={180} fill={COL.floor} />
    <StickFigure pose={A.stand(f)} x={980} y={892} scale={1.5} facing={1} view="front" expr={FACES.cold} pal={LIGHT} frame={f} />
  </Frame>);
};

const S17: React.FC = () => {  // the trust — no title; empty chair, others sign
  const f = useCurrentFrame();
  return (<Frame>
    <Skyline frame={f} baseY={820} tint="#13202e" /><Mullions o={0.45} />
    {/* empty high-back executive chair, back to viewer */}
    <rect x={870} y={560} width={180} height={300} rx={28} fill={PAPER} stroke={INK} strokeWidth={4} />
    <rect x={900} y={840} width={120} height={70} fill={PAPER} stroke={INK} strokeWidth={2} />
    <ellipse cx={960} cy={905} rx={130} ry={20} fill="#000" opacity={0.3} />
    {/* faint trust -> holding -> SPV node diagram, top-left */}
    <g opacity={0.4} stroke={INK} strokeWidth={2} fill="none">
      <circle cx={260} cy={250} r={20} /><line x1={260} y1={270} x2={200} y2={330} /><line x1={260} y1={270} x2={320} y2={330} /><line x1={260} y1={270} x2={260} y2={340} />
      <circle cx={200} cy={350} r={14} /><circle cx={320} cy={350} r={14} /><circle cx={260} cy={360} r={14} />
    </g>
    <StickFigure pose={A.stand(f)} x={560} y={892} scale={1.1} facing={1} view="front" expr={FACES.smug} pal={LIGHT} frame={f} />
  </Frame>);
};

const S18: React.FC = () => {  // the loop closes — a new young associate walks in
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [520, 1040]);
  return (<Frame>
    <Skyline frame={f} baseY={760} tint="#13202e" o={0.85} /><Mullions o={0.5} />
    <ellipse cx={1500} cy={300} rx={300} ry={420} fill="url(#lightTop)" opacity={0.25} />
    <rect x={0} y={905} width={1920} height={175} fill={COL.floor} /><rect x={0} y={905} width={1920} height={8} fill={INK} />
    <StickFigure pose={A.walk(f, fps)} x={x} y={897} scale={0.9} facing={1} view="profile" expr={FACES.earnest} pal={LIGHT} frame={f} />
  </Frame>);
};

// Reusable, TOPIC-AGNOSTIC visual archetypes. Any topic's script composes a video by picking
// template names per scene (see content.py / docs/BIBLE.md). Adjacent scenes must differ.
export const TEMPLATES: Record<string, React.FC> = {
  deskSilhouette: S00, desk: S01, fileWall: S02, tower: S03, boardroomNotes: S04,
  deskClose: S05, supervisor: S06, window: S07, signing: S08, jet: S09,
  dinner: S10, boardroomHead: S11, atrium: S12, layoffs: S13, revolvingDoor: S14,
  warRoom: S16, emptyChair: S17, lobby: S18,
  // composable topic packs (src/stage.tsx): generic + medical + startup + military + sports
  ...PACK_TEMPLATES,
};
