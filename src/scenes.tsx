import React from 'react';
import {useCurrentFrame, useVideoConfig, interpolate} from 'remotion';
import {StickFigure, LIGHT, SIL, DIM, PAPER} from './figure';
import {FACES, blendExpr} from './faces';
import * as A from './actions';
import {PACK_TEMPLATES, keyedTemplates, useSceneColors} from './stage';
// Shared set dressing (WO-8d). `INK`/`STROKE` are aliased because this file already owns a local
// `INK` — the warm doodle-era #2a2620 the pre-crayon art is still drawn in. New art uses CINK.
import {INK as CINK, STROKE as CSTROKE, PAPER_WHITE} from './crayonStyle';
import {
  SlabFloor, BuildingBand, BoxStack, CaseStack, Trolley, Cone, RopeLine,
  CrowdRow, CrowdHeads, OverShoulder, UnitWall, Fence,
} from './setdressing';
import meta from './episode_meta.json';

// Some "universal" templates (window/dinner/deskSilhouette/lobby) default to a generic corporate
// skyline + office setting. For a survival/disaster topic that reads as an unrelated career episode
// (a candlelit dinner for two suits instead of a family kitchen table). Gate a suburban-family art
// variant on the episode topic so every other topic keeps the original corporate look untouched.
const SURVIVAL_TOPIC = /zombie|apocalypse|outbreak|survive/i.test(
  ((meta as any)?.topic || '') + ' ' + ((meta as any)?.title || '')
);

// DOODLE / whiteboard palette — black ink on light paper.
const INK = '#2a2620';
// 2026-07-20 BRIGHT PASS: cream/tan -> white + cool neutrals, with the warm accents kept
// SATURATED (lit windows, gold) so colour reads as deliberate accent against white.
const COL = {city: '#ffffff', cityLit: '#ffd98a', mullc: '#b9c3cd', floor: '#eef2f6', warm: '#f5a623', box: '#ffffff', boxLine: INK, gold: '#f2b134', ink: INK, line: '#c2ccd6'};
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x);};
// The money caption card is pinned bottom-left (director.tsx CountUp: left 72, ~620 wide, ~330 tall),
// so any figure standing near the floor at x < CAPTION_SAFE_X renders BEHIND it. That silently ate
// the hero in the jet and tower scenes — measured 2026-07-20 across a per-scene sweep. New
// floor-level scenes should keep their subject right of this line (or raise it well above the card).
const CAPTION_SAFE_X = 760;

const WIN_COLORS = ['#ffd98a', '#ffe7b4', '#ffcf72', '#ffdf9c']; // soft lit-window fills

// PER-SCENE COLOUR KEYING (CRAYON_BIBLE §5), the same treatment stage.tsx got in WO-8c. The seven
// `night`/`teal`/`amber`/`crimson`/`indigo`/`dusk`/`dayg` linear ramps that painted every Frame, and
// the `vig` radial vignette laid over the top of every Frame at 0.12 alpha, went in WO-8b: Chromium
// DITHERS every gradient it paints, so adjacent pixels alternate by ±1 even inside a purely vertical
// ramp, which held flat fill — share of pixels exactly equal to their right neighbour — at 29.4%
// against the reference's measured 74–92%. Grounds stay flat solid fills for exactly that reason.
// What changed here is WHICH flat colour: WO-8b collapsed the seven washes onto three shared
// constants (BG_SKY/BG_COOL/BG_WARM), so an interior filing room sat on the same bright cyan as a
// driveway. Every Frame now takes its ground from the template's own key in SCENE_KEY_BY_TEMPLATE,
// bound by keyedTemplates() where TEMPLATES is built and read back through context by useSceneColors.

const Defs: React.FC = () => (
  <defs>
    {/* The `rough` (feDisplacementMap line wobble) and `paper` (feTurbulence grain) filters are gone:
        both had 0 usages, and the reference art carries no texture at all (bible §5's naming warning).
        What is left are the two LOCAL light gradients — a monitor wash and a window/skylight shaft.
        Neither ever fills the frame, so each one's dithering costs flat-fill only over its own ellipse. */}
    <radialGradient id="glowGold" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffe6ab" stopOpacity="0.6" /><stop offset="1" stopColor="#ffe6ab" stopOpacity="0" /></radialGradient>
    <radialGradient id="lightTop" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stopColor="#ffffff" stopOpacity="0.7" /><stop offset="1" stopColor="#ffffff" stopOpacity="0" /></radialGradient>
  </defs>
);

// The skyline no longer takes `frame`. Roughly one lit window in ten used to flicker on
// `sin(frame * 0.12 + id)`, and because those windows are scattered across the FULL width of the
// building band, a motion-locality map read every cell of the upper two grid rows as active — 15 of
// the 48 cells, in a file whose templates are supposed to be camera-locked (§3). Measured on t19
// (layoffs) 10 frames apart, freezing the twinkle moved the lock from 24/48 to 39/48 cells at exactly
// 0.0. Windows are simply lit or unlit now.
const Skyline: React.FC<{baseY: number; tint?: string; o?: number}> = ({baseY, tint = COL.city, o = 1}) => {
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
        wins.push(<rect key={c + '-' + r} x={bb.x + 8 + c * 20} y={top + 11 + r * 28} width={11} height={15} rx={1}
          fill={lit ? WIN_COLORS[Math.floor(rnd(id * 3) * WIN_COLORS.length)] : 'none'} stroke={INK} strokeWidth={1.6} opacity={lit ? 1 : 0.55} />);
      }
      return <g key={idx}><rect x={bb.x} y={top} width={bb.w} height={bb.h} fill={PAPER} stroke={INK} strokeWidth={3} />{wins}</g>;
    })}
  </g>);
};

// a row of suburban houses (pitched roof, lit window, dark door) instead of a corporate skyline —
// the SURVIVAL_TOPIC variant behind the window/dinner/deskSilhouette/lobby universal templates.
const SuburbRow: React.FC<{frame: number; baseY: number; o?: number}> = ({frame, baseY, o = 1}) => {
  const xs = [140, 420, 700, 980, 1260, 1540, 1820];
  return (<g opacity={o}>
    {xs.map((x, i) => {
      const w = 240, h = 150 + (i % 2) * 26, top = baseY - h, roofH = 64;
      const lit = rnd(i * 3.3) > 0.4;
      return (
        <g key={i}>
          <polygon points={`${x} ${top} ${x + w / 2} ${top - roofH} ${x + w} ${top}`} fill={PAPER} stroke={INK} strokeWidth={3} />
          <rect x={x + 6} y={top} width={w - 12} height={h} fill={PAPER} stroke={INK} strokeWidth={3} />
          <rect x={x + w * 0.20} y={top + h * 0.30} width={w * 0.20} height={h * 0.24} rx={1}
            fill={lit ? WIN_COLORS[Math.floor(rnd(i * 5) * WIN_COLORS.length)] : 'none'} stroke={INK} strokeWidth={2} />
          <rect x={x + w * 0.58} y={top + h * 0.5} width={w * 0.16} height={h * 0.5} fill={INK} opacity={0.4} />
        </g>
      );
    })}
  </g>);
};

const Mullions: React.FC<{o?: number}> = ({o = 0.5}) => (
  <g stroke={COL.line} strokeWidth={3} opacity={o}>
    {[0, 240, 480, 720, 960, 1200, 1440, 1680, 1920].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={840} />)}
    <line x1={0} y1={150} x2={1920} y2={150} /><line x1={0} y1={500} x2={1920} y2={500} />
  </g>
);

// `Atmos` is gone. It painted three separate bible violations over EVERY Frame: a 1500×560 radial
// haze ellipse across the whole top of frame, a `sweep` gradient bar tracked across the full width
// every frame, and 13 dust motes drifting on `frame`. The haze and the sweep were full-frame
// gradients (§5, and see the BG_* note above on Chromium's dithering); the sweep and the motes were
// whole-frame motion (§3 — the reference camera is static, motion is localised to characters/props).

// ---- static weather layers ----
// Rain is drawn, not animated. It used to advance every streak by speed/30 px per frame across the
// full height of frame, which a motion-locality map reads as whole-frame motion in every cell (§3).
// Kept rather than deleted because six templates (S00/S01/S04/S06/S07/S08) use it as the only thing
// outside the window, and drawn-in streaks are ordinary flat-vector shorthand for rain.
const Rain: React.FC<{count?: number; o?: number}> = ({count = 70, o = 0.22}) => {
  const ls: React.ReactNode[] = [];
  for (let i = 0; i < count; i++) {
    const x = rnd(i * 3.1) * 2000 - 40, len = 16 + rnd(i * 7.7) * 24;
    const y = ((rnd(i * 9.1) * 1200) % 1180) - 40;
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
// `Clouds` (0 usages), `CarLights` (S03's traffic streaks) and `Motes` (16 dust circles, S02) are all
// gone: each drifted across the full width or height on `frame`, which is the whole-frame motion §3
// forbids. Clouds was dead code. CarLights is deleted rather than frozen because it draws headlight
// ellipses with no vehicle under them — parked on the road they read as unexplained glowing blobs,
// and S03's street already reads from the skyline, the kerb line and the ink road line.

// No `bg` prop any more: the ground is the template's colour key, not a per-scene choice out of three
// shared constants. Overriding it here would put a scene's dominant hue in two places.
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{display: 'block'}}>
    <Defs />
    <rect x={0} y={0} width={1920} height={1080} fill={useSceneColors().bg} />
    {children}
  </svg>
);

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
    {SURVIVAL_TOPIC ? <SuburbRow frame={f} baseY={760} /> : <Skyline baseY={760} />}
    <Rain o={0.26} /><Mullions o={0.55} />
    <StickFigure pose={A.sit(f)} x={1180} y={886} scale={1.2} facing={-1} view="profile" expr={FACES.tired} pal={LIGHT} frame={f} />
    <Desk y={830} />
    <Laptop cx={1095} deskY={830} frame={f} w={124} h={80} />
  </Frame>);
};
const S01: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Frame>
    <Skyline baseY={620} tint="#0e1925" o={0.8} /><Rain o={0.18} /><Mullions o={0.4} />
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
  return (<Frame>{boxes}
    <StickFigure pose={A.lookUp(f)} x={420} y={830} scale={1.35} facing={1} view="front" expr={FACES.worried} pal={LIGHT} frame={f} />
  </Frame>);
};
const S03: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [CAPTION_SAFE_X, 1400]);  // was 560 -> started behind the caption card
  return (<Frame>
    <polygon points="120,1080 380,120 520,120 520,1080" fill={PAPER} stroke={INK} strokeWidth={3} /><polygon points="1800,1080 1540,160 1400,160 1400,1080" fill={PAPER} stroke={INK} strokeWidth={3} /><polygon points="560,1080 720,80 980,80 1040,1080" fill={PAPER} stroke={INK} strokeWidth={3} />
    <rect x={812} y={150} width={120} height={90} fill={COL.warm} opacity={0.9} /><rect x={812} y={150} width={120} height={90} fill="none" stroke={INK} strokeWidth={6} />
    <Skyline baseY={1010} tint="#0a1119" o={0.7} />
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
    <Skyline baseY={460} tint="#0e1925" o={0.7} /><Rain o={0.12} /><Mullions o={0.3} />
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
    <Skyline baseY={520} tint="#13202e" o={0.5} /><Rain count={40} o={0.1} />
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
  // window: ONE big picture window (sill + single cross-mullion), not the full curtain-wall grid
  // every other office template shares — so this reads as "standing at the glass", not a repeat
  // of the generic skyline-behind-a-desk shot.
  // The mullion cross is offset well clear of the figure's own x/head-height (both used to sit at
  // the window's exact center, so the bars drew straight across the face and torso in every frame).
  const f = useCurrentFrame();
  return (<Frame>
    {SURVIVAL_TOPIC ? <SuburbRow frame={f} baseY={780} /> : <Skyline baseY={780} tint="#13202e" />}
    <Rain o={0.3} />
    <rect x={520} y={90} width={880} height={700} fill="none" stroke={INK} strokeWidth={9} />
    <line x1={720} y1={90} x2={720} y2={790} stroke={INK} strokeWidth={6} /><line x1={520} y1={230} x2={1400} y2={230} stroke={INK} strokeWidth={6} />
    <rect x={0} y={790} width={1920} height={290} fill={COL.floor} /><rect x={0} y={790} width={1920} height={8} fill={INK} />
    <rect x={460} y={780} width={1000} height={22} fill={PAPER} stroke={INK} strokeWidth={4} />
    <StickFigure pose={A.stand(f)} x={960} y={770} scale={1.6} facing={1} view="profile" expr={FACES.hollow} pal={LIGHT} frame={f} />
  </Frame>);
};
const S08: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames: d} = useVideoConfig();
  const t8 = interpolate(f, [d * 0.25, d * 0.6], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<Frame>
    <Skyline baseY={640} tint="#13202e" o={0.7} /><Rain o={0.1} /><Mullions o={0.35} />
    <StickFigure pose={A.sign(f, fps)} x={820} y={836} scale={1.55} facing={1} view="profile" expr={blendExpr(FACES.neutral, FACES.smug, t8)} pal={LIGHT} frame={f} />
    <Desk y={830} />
    <Document x={965} y={814} handX={956} handY={786} />
  </Frame>);
};
// ---------------------------------------------------------------------------
// S09 `jet` — the WO-8d density prototype.
//
// WHAT WAS HERE: a solid gold field, a dark blob standing in for an aircraft, one ground line and
// one walking figure. It measured 99.6% flat fill against the reference channel's 74–92% band — i.e.
// almost nothing was drawn. Emptiness, not linework or palette, was the last visible gap.
//
// WHAT IT IS NOW: a private-jet departure on an FBO apron, built in four depth planes the way the
// reference builds a frame (CRAYON_BIBLE §5/§6):
//   far   — hangar/terminal band, control tower, mast lights, windsock, two parked light aircraft
//   deep  — a grey anonymous crowd behind a press rope (the §6.5 focal device), heads-only back row
//   mid   — the aircraft itself, ground-support clutter (bowser, baggage trolley, cases, boxes, cones)
//   near  — the coloured hero walking to the airstair, over an ink-silhouette foreground shoulder (§6.8)
//
// Everything that is not aircraft-specific comes from ./setdressing, which is the reusable half of
// this work; only the airframe, the bowser and the apron markings below are bespoke to this scene.
// Flat vector throughout — no gradients (Chromium dithers them, which is what destroyed this metric
// before), and every set-dressing element is static, so the camera lock is untouched.
// ---------------------------------------------------------------------------
const HORIZON = 700;      // apron meets sky
const APRON = 980;        // where the aircraft's wheels and the near ground crew stand

/** The airframe: a mid-size business jet, nose left, forward airstair down, tail exiting frame right. */
const BizJet: React.FC = () => {
  const c = useSceneColors();
  const skin = PAPER_WHITE;
  return (
    <g>
      {/* wing seen behind the fuselage, swept back to the right */}
      <path d="M 1560 782 L 1786 754 L 1796 774 L 1568 802 Z" fill={skin} stroke={CINK} strokeWidth={CSTROKE * 0.7} />
      {/* tail fin + T-tail plane */}
      <path d="M 1660 776 L 1782 596 L 1838 596 L 1810 780 Z" fill={skin} stroke={CINK} strokeWidth={CSTROKE} strokeLinejoin="round" />
      <path d="M 1706 604 L 1914 578 L 1918 602 L 1712 628 Z" fill={skin} stroke={CINK} strokeWidth={CSTROKE * 0.8} strokeLinejoin="round" />
      <path d="M 1764 620 L 1830 610" stroke={CINK} strokeWidth={CSTROKE * 0.5} opacity={0.5} />
      {/* fuselage */}
      <path d="M 884 838 C 900 792 1010 770 1180 768 L 1600 768 C 1720 768 1800 746 1904 698 L 1914 716
               C 1800 786 1700 886 1560 890 L 1180 890 C 1010 890 900 884 884 838 Z"
        fill={skin} stroke={CINK} strokeWidth={CSTROKE} strokeLinejoin="round" />
      {/* aft engine nacelle */}
      <rect x={1616} y={764} width={196} height={96} rx={48} fill={skin} stroke={CINK} strokeWidth={CSTROKE} />
      <ellipse cx={1624} cy={812} rx={14} ry={44} fill={CINK} />
      <ellipse cx={1806} cy={812} rx={10} ry={36} fill={CINK} opacity={0.35} />
      <line x1={1660} y1={772} x2={1660} y2={856} stroke={CINK} strokeWidth={CSTROKE * 0.4} opacity={0.45} />
      {/* the one saturated note: the operator's cheatline */}
      <path d="M 896 850 L 1560 866 L 1700 806 L 1692 786 L 1556 840 L 898 830 Z" fill={c.accent} />
      {/* cockpit glass + cabin window row */}
      <path d="M 966 806 L 1058 792 L 1050 820 L 958 826 Z" fill={CINK} />
      {Array.from({length: 9}, (_, i) => (
        <rect key={i} x={1190 + i * 62} y={790} width={26} height={30} rx={9} fill={CINK} />
      ))}
      {/* skin panel joints — real airframe detail, and what stops a 700px fuselage reading as one blob */}
      <g stroke={CINK} strokeWidth={CSTROKE * 0.35} opacity={0.4} fill="none">
        <path d="M 1160 770 C 1150 812 1152 856 1166 888" />
        <path d="M 1360 768 C 1352 812 1354 856 1366 890" />
        <path d="M 1560 768 C 1554 812 1556 856 1566 890" />
        <line x1={1060} y1={840} x2={1600} y2={848} />
      </g>
      {/* forward airstair: door, five treads, two rails */}
      <rect x={1090} y={780} width={78} height={108} rx={10} fill={skin} stroke={CINK} strokeWidth={CSTROKE * 0.7} />
      <rect x={1150} y={826} width={10} height={18} rx={4} fill={CINK} />
      {Array.from({length: 5}, (_, i) => {
        const t = i / 5, t2 = (i + 1) / 5;
        const x1 = 1092 - t * 92, x2 = 1092 - t2 * 92;
        const y1 = 890 + t * 90, y2 = 890 + t2 * 90;
        return <path key={i} d={`M ${x1} ${y1} L ${x1 + 34} ${y1} L ${x2 + 34} ${y2} L ${x2} ${y2} Z`}
          fill={c.mid} stroke={CINK} strokeWidth={CSTROKE * 0.5} />;
      })}
      <line x1={1086} y1={880} x2={992} y2={968} stroke={CINK} strokeWidth={CSTROKE * 0.6} strokeLinecap="round" />
      <line x1={1132} y1={886} x2={1038} y2={974} stroke={CINK} strokeWidth={CSTROKE * 0.6} strokeLinecap="round" />
      {/* near wing, low and coming toward the viewer */}
      <path d="M 1286 884 L 1512 872 L 1436 968 L 1204 962 Z" fill={skin} stroke={CINK} strokeWidth={CSTROKE} strokeLinejoin="round" />
      <line x1={1310} y1={890} x2={1240} y2={958} stroke={CINK} strokeWidth={CSTROKE * 0.4} opacity={0.4} />
      <rect x={1408} y={936} width={30} height={12} rx={4} fill={c.accent} />
      {/* landing gear */}
      {[{gx: 930, gy: 886}, {gx: 1350, gy: 890}, {gx: 1436, gy: 890}].map((g, i) => (
        <g key={i}>
          <line x1={g.gx} y1={g.gy} x2={g.gx} y2={APRON - 16} stroke={CINK} strokeWidth={CSTROKE * 1.3} />
          <ellipse cx={g.gx} cy={APRON - 4} rx={i === 0 ? 24 : 30} ry={i === 0 ? 22 : 26} fill={CINK} />
          <ellipse cx={g.gx} cy={APRON - 4} rx={i === 0 ? 8 : 10} ry={i === 0 ? 7 : 9} fill={c.mid} />
        </g>
      ))}
    </g>
  );
};

/** A smaller aircraft parked further down the ramp — fuselage, fin, wing, wheels. Repeated along
 *  the hangar line so the stand reads as one slot on a busy ramp, not as an empty field. */
const RampAircraft: React.FC<{x: number; y: number; s: number; flip?: number}> = ({x, y, s, flip = 1}) => {
  const c = useSceneColors();
  return (
    <g transform={`translate(${x} ${y}) scale(${s * flip} ${s})`} opacity={0.85}>
      <path d="M -150 -40 C -140 -62 -80 -70 -20 -70 L 96 -70 C 140 -70 176 -84 210 -102 L 214 -90
               C 180 -62 152 -34 110 -32 L -20 -32 C -80 -32 -142 -30 -150 -40 Z"
        fill={PAPER_WHITE} stroke={CINK} strokeWidth={CSTROKE * 0.55} strokeLinejoin="round" />
      <path d="M 106 -70 L 150 -152 L 176 -152 L 164 -70 Z" fill={PAPER_WHITE} stroke={CINK} strokeWidth={CSTROKE * 0.55} />
      <path d="M -12 -34 L 74 -38 L 42 -6 L -46 -4 Z" fill={PAPER_WHITE} stroke={CINK} strokeWidth={CSTROKE * 0.55} />
      <path d="M -148 -46 L 96 -50 L 130 -68 L 126 -78 L 94 -60 L -146 -56 Z" fill={c.accent} />
      <path d="M -128 -56 L -84 -62 L -88 -48 L -132 -46 Z" fill={CINK} />
      {[-100, -70, -40].map((wx, i) => <rect key={i} x={wx} y={-62} width={13} height={15} rx={5} fill={CINK} />)}
      <ellipse cx={-118} cy={-24} rx={12} ry={11} fill={CINK} />
      <ellipse cx={4} cy={-4} rx={15} ry={13} fill={CINK} />
    </g>
  );
};

/** Apron fuel bowser — tank, cab, hose reel. The scene's one vehicle. */
const FuelBowser: React.FC = () => {
  const c = useSceneColors();
  return (
    <g>
      <rect x={296} y={834} width={262} height={90} rx={44} fill={c.mid} stroke={CINK} strokeWidth={CSTROKE * 0.8} />
      <line x1={366} y1={836} x2={366} y2={922} stroke={CINK} strokeWidth={CSTROKE * 0.4} opacity={0.5} />
      <line x1={470} y1={836} x2={470} y2={922} stroke={CINK} strokeWidth={CSTROKE * 0.4} opacity={0.5} />
      <rect x={206} y={840} width={96} height={84} rx={10} fill={c.mid} stroke={CINK} strokeWidth={CSTROKE * 0.8} />
      <rect x={222} y={856} width={60} height={36} rx={5} fill={CINK} opacity={0.7} />
      <rect x={300} y={888} width={58} height={44} rx={6} fill={c.accent} stroke={CINK} strokeWidth={CSTROKE * 0.5} />
      <path d="M 358 906 q 46 26 84 4" fill="none" stroke={CINK} strokeWidth={CSTROKE * 0.6} strokeLinecap="round" />
      {[248, 380, 494].map((wx, i) => (
        <g key={i}>
          <circle cx={wx} cy={942} r={30} fill={CINK} />
          <circle cx={wx} cy={942} r={11} fill={c.mid} />
        </g>
      ))}
    </g>
  );
};

const S09: React.FC = () => {
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const c = useSceneColors();
  // The hero walks the last few metres to the airstair foot. Kept right of CAPTION_SAFE_X so the
  // money card never eats him, and the travel is short — the reference's figures cross a few body
  // widths per shot, they do not traverse the frame.
  const x = interpolate(f, [0, durationInFrames], [CAPTION_SAFE_X + 20, 986]);
  return (<Frame>
    {/* --- far plane: terminal side of the field ---
        Two bands: a distant low one for depth, then the hangar line the stand actually backs onto.
        The hangar line is TALL on purpose — an empty upper half was most of what made the old frame
        read as a colour field, and an FBO stand is genuinely backed by hangars, not by open sky. */}
    <BuildingBand baseY={HORIZON - 8} x0={-80} x1={1990} n={13} seed={21} opacity={0.4} minH={230} maxH={470} />
    {/* control tower, mast lights, windsock and the parked light aircraft all sit BETWEEN the two
        bands, so the near hangar line occludes their feet the way a real field reads. */}
    <g opacity={0.55}>
      <rect x={196} y={330} width={78} height={370} fill={c.mid} stroke={CINK} strokeWidth={CSTROKE * 0.7} />
      <rect x={158} y={272} width={154} height={76} rx={10} fill={c.mid} stroke={CINK} strokeWidth={CSTROKE * 0.7} />
      <rect x={174} y={288} width={122} height={40} fill={CINK} opacity={0.6} />
      <line x1={235} y1={272} x2={235} y2={216} stroke={CINK} strokeWidth={CSTROKE * 0.5} />
      {[640, 1080, 1520, 1840].map((mx, i) => (
        <g key={i}>
          <line x1={mx} y1={HORIZON} x2={mx} y2={470} stroke={CINK} strokeWidth={CSTROKE * 0.45} />
          <rect x={mx - 32} y={456} width={64} height={16} rx={4} fill={c.mid} stroke={CINK} strokeWidth={CSTROKE * 0.4} />
        </g>
      ))}
      <line x1={430} y1={HORIZON} x2={430} y2={520} stroke={CINK} strokeWidth={CSTROKE * 0.45} />
      <path d="M 430 530 L 500 516 L 494 552 L 430 560 Z" fill={c.accent} stroke={CINK} strokeWidth={CSTROKE * 0.4} />
    </g>
    {/* the hangar line the stand backs onto — OPAQUE, so everything above reads as behind it */}
    <BuildingBand baseY={HORIZON} x0={-60} x1={1980} n={8} seed={9} minH={300} maxH={560} />

    {/* --- the apron itself, scored into slabs --- */}
    <SlabFloor y={HORIZON} cols={18} rows={9} />
    {/* painted stand markings: taxiway lead-in + the stop bar the nosewheel sits on */}
    <g fill={PAPER_WHITE} opacity={0.5}>
      {Array.from({length: 9}, (_, i) => <rect key={i} x={70 + i * 118} y={1006 + i * 6} width={64} height={11} rx={5} />)}
      {Array.from({length: 8}, (_, i) => <rect key={'t' + i} x={1180 + i * 96} y={1042} width={54} height={10} rx={5} />)}
      <rect x={856} y={1024} width={210} height={13} rx={6} />
      <rect x={950} y={996} width={13} height={62} rx={6} />
    </g>

    {/* other traffic on the ramp, parked nose-in along the hangar line. Only the two that stay
        VISIBLE past the hero jet are drawn — a third at x=640 was fully swallowed by the crowd. */}
    <RampAircraft x={1220} y={790} s={0.66} />
    <RampAircraft x={1690} y={772} s={0.52} />

    {/* --- deep plane: the grey anonymous crowd behind the airfield fence (bible §6.5).
        Crowd first, fence over the top: the rails crossing their legs is what puts them on the far
        side of it instead of loose on the apron with the hero. --- */}
    <CrowdHeads y={742} x0={60} x1={960} n={18} rows={3} r={14} seed={4} />
    <CrowdRow y={794} x0={110} x1={900} n={9} scale={0.4} seed={2} dz={14} />
    <Fence x0={-20} x1={1010} y={852} h={92} posts={19} opacity={0.6} />

    {/* --- mid plane: ground support clutter, then the aircraft --- */}
    <FuelBowser />
    <BoxStack x={452} baseY={950} n={3} s={0.72} seed={5} />
    <BoxStack x={186} baseY={996} n={3} s={0.66} seed={12} />
    {/* a ground-crew tool chest — the same drawer-grid component as the reference's filing wall */}
    <UnitWall x={92} y={862} w={150} h={104} cols={2} rows={3} />
    <Trolley x={560} y={880} w={286} s={0.86} />
    <CaseStack x={636} baseY={882} n={4} s={0.84} seed={3} />
    <CaseStack x={790} baseY={982} n={3} s={0.66} seed={8} />
    <CrowdRow y={868} x0={700} x1={800} n={2} scale={0.52} seed={7} dz={8} />
    {/* servicing trolley behind the tail — drawn first so the airframe occludes it */}
    <Trolley x={1636} y={904} w={200} s={0.6} />
    <CaseStack x={1700} baseY={906} n={3} s={0.58} seed={14} />
    <BizJet />
    {/* ground crew standing on the near apron, in FRONT of the aircraft, so they read at their own
        depth. At the old y=914/scale 0.58 they sat at fuselage height and looked stuck to the jet. */}
    <CrowdRow y={992} x0={1180} x1={1420} n={3} scale={0.5} seed={11} dz={8} />
    <CrowdRow y={946} x0={1690} x1={1830} n={2} scale={0.44} seed={17} dz={6} />
    {[880, 1180, 1548, 1760, 1310].map((cx, i) => <Cone key={i} x={cx} y={APRON + 14} s={0.62} />)}
    {/* wheel chocks at the main gear */}
    <g fill={c.accent} stroke={CINK} strokeWidth={CSTROKE * 0.4}>
      <path d="M 1306 986 L 1338 962 L 1338 986 Z" /><path d="M 1484 986 L 1452 962 L 1452 986 Z" />
    </g>

    {/* the red carpet at the stair foot — the reason he is walking there */}
    <path d="M 906 1002 L 1092 1002 L 1128 1062 L 872 1062 Z" fill={c.accent} stroke={CINK} strokeWidth={CSTROKE * 0.5} />

    {/* --- near plane: the coloured hero, then the foreground silhouette --- */}
    <StickFigure pose={A.walk(f, fps)} x={x} y={860} scale={1.15} facing={1} view="profile" expr={FACES.cold} pal={LIGHT} briefcase frame={f} />
    <OverShoulder side="left" y={1120} scale={0.66} />
  </Frame>);
};
// shared private-dinner backdrop — used by L5 & L7 (corporate: two suits, candle + wine) and,
// under SURVIVAL_TOPIC, an ordinary family table (a kid-scaled second figure, plates, no candle).
const Dinner: React.FC<{f: number; mainExpr: any}> = ({f, mainExpr}) => (
  <>
    {SURVIVAL_TOPIC ? <SuburbRow frame={f} baseY={520} o={0.6} /> : <><Skyline baseY={520} tint="#10202e" o={0.4} /><Mullions o={0.22} /></>}
    {!SURVIVAL_TOPIC && <><ellipse cx={970} cy={700} rx={300} ry={170} fill="#f2c14e" opacity={0.1} />
    <ellipse cx={970} cy={700} rx={150} ry={90} fill="#f2c14e" opacity={0.1} /></>}
    <StickFigure pose={A.sit(f)} x={700} y={762} scale={1.2} facing={1} view="profile" expr={mainExpr} pal={LIGHT} frame={f} />
    <StickFigure pose={A.sit(f + 50)} x={1240} y={762} scale={SURVIVAL_TOPIC ? 0.8 : 1.2} facing={-1} view="profile"
      pal={LIGHT} costume={SURVIVAL_TOPIC ? 'none' : undefined} expr={FACES.earnest} frame={f} />
    <rect x={0} y={722} width={1920} height={358} fill={COL.floor} /><rect x={0} y={722} width={1920} height={8} fill={INK} />
    {/* the dinner table between them — top + two legs, so it reads as a MEAL, not a street */}
    <rect x={800} y={694} width={340} height={16} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
    <line x1={846} y1={710} x2={834} y2={806} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    <line x1={1094} y1={710} x2={1106} y2={806} stroke={INK} strokeWidth={5} strokeLinecap="round" />
    {SURVIVAL_TOPIC ? (
      /* two plain plates instead of a candle + wine glasses — an ordinary family meal, not a formal dinner */
      <>
        <ellipse cx={880} cy={686} rx={34} ry={10} fill="#eef2f6" stroke={INK} strokeWidth={3} />
        <ellipse cx={1060} cy={686} rx={34} ry={10} fill="#eef2f6" stroke={INK} strokeWidth={3} />
        <rect x={958} y={670} width={22} height={30} rx={3} fill="#dfe7ee" stroke={INK} strokeWidth={2.5} />
      </>
    ) : (
      /* candle + glasses ON the tabletop */
      <>
        <rect x={964} y={666} width={10} height={28} fill="#e9eef4" /><ellipse cx={969} cy={660} rx={6} ry={11} fill="#ffd9a0" />
        <rect x={860} y={672} width={8} height={22} rx={2} fill="#9fb6cf" opacity={0.6} /><rect x={1080} y={672} width={8} height={22} rx={2} fill="#9fb6cf" opacity={0.6} />
      </>
    )}
  </>
);

const S10: React.FC = () => {  // Equity Partner — the dinner
  const f = useCurrentFrame(); const {durationInFrames: d} = useVideoConfig();
  const t = interpolate(f, [d * 0.3, d * 0.65], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (<Frame><Dinner f={f} mainExpr={blendExpr(FACES.cold, FACES.smug, t)} /></Frame>);
};

const S11: React.FC = () => {  // book of business — boardroom power
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  return (<Frame>
    <Skyline baseY={440} tint="#0e1925" o={0.7} /><Mullions o={0.3} />
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
  return (<Frame>
    <Skyline baseY={600} tint="#1a2440" o={0.55} />
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
  return (<Frame>
    <Skyline baseY={520} tint="#2a1622" o={0.5} /><Mullions o={0.28} />
    <rect x={1760} y={300} width={150} height={620} fill={PAPER} stroke={INK} strokeWidth={3} /><rect x={1760} y={300} width={20} height={620} fill={INK} />
    {leavers}
    {/* color pop: red EXIT sign — pulled in from x1775 (right edge 1893, only 27px from the 1920
        canvas edge): the auto-director's dolly-in push (even the mild 1.0->1.075 wide-shot push,
        let alone the medium/closeup zooms) was enough to shove it past the frame boundary mid-shot,
        rendering as a single clipped "E" (reviewer t22 defect). Now clear of every shot's safe zone. */}
    <rect x={1550} y={250} width={118} height={40} rx={4} fill="#c0392b" /><text x={1609} y={279} textAnchor="middle" fill="#fff" fontFamily="'Helvetica Neue', sans-serif" fontWeight={800} fontSize={24} letterSpacing={2}>EXIT</text>
    <rect x={0} y={912} width={1920} height={168} fill={COL.floor} />
    <StickFigure pose={A.stand(f)} x={360} y={904} scale={1.5} facing={1} view="front" expr={FACES.hollow} pal={LIGHT} frame={f} />
  </Frame>);
};

const S14: React.FC = () => {  // power broker — the revolving door (govt <-> capital)
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [760, 1180]);
  const cols = [0, 1, 2, 3, 4].map((i) => <rect key={i} x={250 + i * 80} y={420} width={36} height={400} fill={PAPER} stroke={INK} strokeWidth={3} />);
  return (<Frame>
    {/* government building left. A solid-INK base/steps strip (x230-630,y820) used to sit here —
        under this template's default-center zoom (no FOCUS entry), anything left-of-origin drifts
        FARTHER toward the bottom-left corner as the shot dollies in, and that opaque rect's edge
        ended up poking out past the money-card's left:72 boundary as an unexplained black block
        (reviewer t23/t24 defect). The columns already read as a building without it, so it's cut
        rather than repositioned — any point this far left-of-origin drifts into the same blind
        corner regardless of size. */}
    <polygon points="210,420 590,420 400,300" fill={PAPER} stroke={INK} strokeWidth={3} />{cols}
    {/* glass tower right */}
    <rect x={1340} y={180} width={420} height={700} fill={PAPER} stroke={INK} strokeWidth={3} /><Skyline baseY={880} tint="#0c1826" o={0.5} />
    <line x1={0} y1={910} x2={1920} y2={910} stroke={INK} strokeWidth={8} />
    <StickFigure pose={A.walk(f, fps)} x={x} y={870} scale={0.9} facing={1} view="profile" expr={FACES.smug} pal={LIGHT} frame={f} />
  </Frame>);
};

const S15: React.FC = () => {  // the private dinner — Geneva
  const f = useCurrentFrame();
  return (<Frame><Dinner f={f} mainExpr={FACES.cold} /></Frame>);
};

const S16: React.FC = () => {  // the Architect — war room / sovereign
  const f = useCurrentFrame();
  // Globe center offset LEFT of the figure's x (980) — centered directly behind previously read as a
  // halo/hat at the exploit-reveal beat (reviewer defect, t19). Off-axis keeps it a background prop.
  const gx = 640, gy = 420;
  const cities = [[gx - 220, gy - 10], [gx + 200, gy - 60], [gx, gy + 80], [gx - 140, gy + 120], [gx + 260, gy + 100], [gx + 100, gy - 140]];
  const lit = (i: number) => i % 2 === 0;
  return (<Frame>
    {/* side screens */}
    <rect x={60} y={300} width={260} height={420} fill={PAPER} stroke={INK} strokeWidth={3} /><ScreenLines x={84} y={320} w={210} frame={f} />
    <rect x={1600} y={300} width={260} height={420} fill={PAPER} stroke={INK} strokeWidth={3} /><ScreenLines x={1624} y={320} w={210} frame={f} />
    {/* globe */}
    <circle cx={gx} cy={gy} r={240} fill="none" stroke={INK} strokeWidth={3} />
    <ellipse cx={gx} cy={gy} rx={240} ry={90} fill="none" stroke={INK} strokeWidth={2} />
    <ellipse cx={gx} cy={gy} rx={120} ry={240} fill="none" stroke={INK} strokeWidth={2} />
    <path d={`M ${gx - 160} ${gy - 80} Q ${gx + 100} ${gy - 200} ${gx + 200} ${gy - 60}`} fill="none" stroke="#f2c14e" strokeWidth={2} opacity={0.6} />
    <path d={`M ${gx - 140} ${gy + 120} Q ${gx + 20} ${gy + 200} ${gx + 260} ${gy + 100}`} fill="none" stroke={INK} strokeWidth={2} opacity={0.5} />
    {cities.map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={lit(i) ? 7 : 5} fill={lit(i) ? '#f2c14e' : '#bfe0ff'} opacity={lit(i) ? 0.9 * (0.6 + 0.4 * Math.sin(f * 0.12 + i)) : 0.5} />)}
    <rect x={0} y={900} width={1920} height={180} fill={COL.floor} />
    <StickFigure pose={A.stand(f)} x={980} y={892} scale={1.5} facing={1} view="front" expr={FACES.cold} pal={LIGHT} frame={f} />
  </Frame>);
};

const S17: React.FC = () => {  // the trust — no title; empty chair, others sign
  const f = useCurrentFrame();
  if (SURVIVAL_TOPIC) {
    // the communal table — Mara's folding chair sits empty, untouched plate; Dec eats alone and fast.
    // Deliberately ONE figure + a conspicuously empty seat (vs. Dinner's two-figures-facing pattern
    // used elsewhere in this episode) so the grief beat reads as an absence, not just another meal.
    return (<Frame>
      <SuburbRow frame={f} baseY={520} o={0.3} />
      <rect x={0} y={722} width={1920} height={358} fill={COL.floor} /><rect x={0} y={722} width={1920} height={8} fill={INK} />
      {/* the communal table */}
      <rect x={790} y={694} width={360} height={16} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
      <line x1={838} y1={710} x2={826} y2={860} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      <line x1={1102} y1={710} x2={1114} y2={860} stroke={INK} strokeWidth={5} strokeLinecap="round" />
      {/* Dec's plate, near seat — half-eaten */}
      <ellipse cx={870} cy={686} rx={34} ry={10} fill="#eef2f6" stroke={INK} strokeWidth={3} />
      {/* Mara's plate, far seat — untouched, pushed away */}
      <ellipse cx={1050} cy={678} rx={32} ry={9} fill="#eef2f6" stroke={INK} strokeWidth={3} opacity={0.55} />
      {/* the empty folding chair, pulled out slightly — drawn with no figure in it */}
      <g stroke={INK} strokeWidth={4} fill="none" opacity={0.85} transform="rotate(-4 1150 830)">
        <rect x={1100} y={772} width={100} height={14} rx={4} fill={PAPER} />
        <line x1={1108} y1={786} x2={1100} y2={866} /><line x1={1192} y1={786} x2={1200} y2={866} />
        <line x1={1108} y1={772} x2={1104} y2={702} /><line x1={1192} y1={772} x2={1196} y2={702} />
        <line x1={1105} y1={702} x2={1197} y2={702} />
      </g>
      <StickFigure pose={A.sit(f)} x={870} y={762} scale={0.82} facing={1} view="profile" costume="none" expr={FACES.hollow} pal={LIGHT} frame={f} />
    </Frame>);
  }
  return (<Frame>
    <Skyline baseY={820} tint="#13202e" /><Mullions o={0.45} />
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
  // lobby: a bright daytime atrium with its OWN furniture (reception desk, tiled floor, a potted
  // plant) instead of the same night skyline-behind-glass every other office template reuses.
  const f = useCurrentFrame(); const {fps, durationInFrames} = useVideoConfig();
  const x = interpolate(f, [0, durationInFrames], [520, 1040]);
  const tiles = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => <line key={i} x1={i * 192} y1={905} x2={i * 192} y2={1080} stroke={COL.line} strokeWidth={3} opacity={0.5} />);
  return (<Frame>
    {SURVIVAL_TOPIC ? <SuburbRow frame={f} baseY={760} /> : <Skyline baseY={760} tint="#13202e" o={0.5} />}
    <ellipse cx={1500} cy={300} rx={300} ry={420} fill="url(#lightTop)" opacity={0.35} />
    <rect x={0} y={905} width={1920} height={175} fill={COL.floor} />{tiles}<rect x={0} y={905} width={1920} height={8} fill={INK} />
    {SURVIVAL_TOPIC ? (
      /* a boarded front door + the kid already waiting at the gate — the door-knock ritual's
         receiving end (t14 Cole's knock, t30 the new boy) — instead of the reception desk */
      <>
        <rect x={140} y={660} width={260} height={250} fill={PAPER} stroke={INK} strokeWidth={5} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={150} y1={700 + i * 55} x2={390} y2={692 + i * 55} stroke={INK} strokeWidth={8} opacity={0.7} />)}
        <StickFigure pose={A.stand(f)} x={270} y={870} scale={0.85} facing={1} view="front" costume="none" expr={FACES.earnest} pal={LIGHT} frame={f} />
      </>
    ) : (
      <>
        {/* reception desk, set back left */}
        <rect x={90} y={780} width={340} height={130} fill={PAPER} stroke={INK} strokeWidth={5} /><rect x={90} y={780} width={340} height={16} fill={INK} opacity={0.15} />
        {/* potted plant, right foreground */}
        <rect x={1720} y={940} width={70} height={40} rx={6} fill={PAPER} stroke={INK} strokeWidth={4} />
        <path d="M 1755 940 Q 1700 880 1730 830 M 1755 940 Q 1810 890 1780 820 M 1755 940 Q 1755 860 1755 810" fill="none" stroke="#2f7a4a" strokeWidth={6} strokeLinecap="round" />
      </>
    )}
    <StickFigure pose={A.walk(f, fps)} x={x} y={897} scale={0.9} facing={1} view="profile" expr={FACES.earnest} pal={LIGHT} frame={f} />
  </Frame>);
};

// raidScene — a dedicated cold-open visual: federal agents carrying servers out in evidence boxes,
// the desk's monitor still glowing behind them. deskSilhouette (S00) reads as an ordinary late-night
// work desk; the cold open's narration promises the single highest-leverage beat in the episode
// (agents, evidence bags, a wallet frozen mid-raid), so it gets its own backdrop instead of reusing
// the same plain desk shot t18 already owns (reviewer defect: the cold open undersold its own hook).
// No FOCUS entry on purpose — this always frames as wide/medium, never an auto-closeup crop.
const S19: React.FC = () => {
  const f = useCurrentFrame(); const {fps} = useVideoConfig();
  const agent = (x0: number, s: number, delay: number) => (
    <g key={x0}>
      <StickFigure pose={A.walk(f + delay, fps)} x={x0} y={904} scale={s} facing={1} view="profile" pal={DIM} showFace={false} frame={f} />
      {/* evidence box carried under the near arm, red tape stripe across the seam */}
      <g transform={`translate(${x0 + 24 * s} ${904 - 108 * s})`}>
        <rect x={-28} y={-20} width={56} height={40} fill={PAPER} stroke={INK} strokeWidth={3} />
        <rect x={-28} y={-3} width={56} height={7} fill="#c0392b" opacity={0.9} />
      </g>
    </g>
  );
  return (<Frame>
    <Skyline baseY={760} tint="#0e1925" o={0.6} /><Mullions o={0.35} />
    <rect x={0} y={820} width={1920} height={260} fill={COL.floor} /><rect x={0} y={820} width={1920} height={8} fill={INK} />
    {/* the abandoned desk — a monitor nobody's unplugged yet, still glowing */}
    <rect x={1440} y={760} width={280} height={26} rx={4} fill={PAPER} stroke={INK} strokeWidth={4} />
    <Laptop cx={1540} deskY={760} frame={f} w={130} h={86} />
    {/* the server rack, one unit already pulled */}
    <rect x={1660} y={520} width={160} height={300} fill={PAPER} stroke={INK} strokeWidth={4} />
    {Array.from({length: 5}).map((_, r) => <line key={r} x1={1660} y1={556 + r * 52} x2={1820} y2={556 + r * 52} stroke={INK} strokeWidth={2} opacity={0.5} />)}
    {/* agents, evidence boxes under one arm, carrying the servers out */}
    {agent(560, 0.72, 0)}
    {agent(760, 0.62, 24)}
    {/* the protagonist — kept right of CAPTION_SAFE_X so the $ overlay card never eats him — watching
        it happen from what's left of his own office */}
    <StickFigure pose={A.stand(f)} x={1020} y={920} scale={1.4} facing={-1} view="profile" expr={FACES.hollow} pal={LIGHT} frame={f} />
  </Frame>);
};

// Reusable, TOPIC-AGNOSTIC visual archetypes. Any topic's script composes a video by picking
// template names per scene (see content.py / docs/BIBLE.md). Adjacent scenes must differ.
export const TEMPLATES: Record<string, React.FC> = {
  // keyedTemplates() binds each name to its SCENE_KEY_BY_TEMPLATE colour key here, where the name is
  // still known — <Frame> reads it back through context. PACK_TEMPLATES is already keyed by stage.tsx.
  ...keyedTemplates({
    deskSilhouette: S00, desk: S01, fileWall: S02, tower: S03, boardroomNotes: S04,
    deskClose: S05, supervisor: S06, window: S07, signing: S08, jet: S09,
    dinner: S10, boardroomHead: S11, atrium: S12, layoffs: S13, revolvingDoor: S14,
    warRoom: S16, emptyChair: S17, lobby: S18, raidScene: S19,
  }),
  // composable topic packs (src/stage.tsx): generic + medical + startup + military + sports
  ...PACK_TEMPLATES,
};
