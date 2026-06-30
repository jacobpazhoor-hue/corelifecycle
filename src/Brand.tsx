import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StickFigure, LIGHT, PAPER} from './figure';
import {FACES} from './faces';
import * as A from './actions';
import meta from './episode_meta.json';

const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const SERIF = "Georgia, 'Times New Roman', serif";
const GOLD = '#e8b54b';
const INK = '#f4f7fb';
const rnd = (i: number) => {const x = Math.sin(i * 127.1 + 31.7) * 43758.5453; return x - Math.floor(x);};

const Defs: React.FC = () => (
  <defs>
    <radialGradient id="dark" cx="0.5" cy="0.42" r="0.7"><stop offset="0" stopColor="#1a2c41" /><stop offset="1" stopColor="#070d15" /></radialGradient>
    <linearGradient id="gold" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stopColor="#b9852f" /><stop offset="1" stopColor="#f3d488" /></linearGradient>
    <linearGradient id="bnr" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#0f1c2b" /><stop offset="1" stopColor="#05090f" /></linearGradient>
  </defs>
);

const Skyline: React.FC<{w: number; baseY: number; tint?: string; o?: number}> = ({w, baseY, tint = '#0e1a28', o = 1}) => {
  const b: {x: number; wd: number; h: number}[] = [];
  let x = -40, i = 0;
  while (x < w + 40) {const wd = 50 + rnd(i) * 85, h = 90 + rnd(i * 3 + 1) * 230; b.push({x, wd, h}); x += wd + 12 + rnd(i * 5) * 22; i++;}
  return (<g opacity={o}>{b.map((bb, idx) => <rect key={idx} x={bb.x} y={baseY - bb.h} width={bb.wd} height={bb.h} fill={tint} />)}</g>);
};

// ===== AVATAR CONCEPTS (drawn in local 0..800) =====
const A_serif: React.FC = () => (
  <g>
    <rect width={800} height={800} fill="url(#dark)" />
    <text x={400} y={540} textAnchor="middle" fontFamily={SERIF} fontSize={400} fontWeight={600} letterSpacing={-8} fill={INK}>CL</text>
    <rect x={250} y={580} width={300} height={9} fill={GOLD} />
  </g>
);
const A_bars: React.FC = () => {
  const xs = [205, 320, 435, 550], hs = [150, 235, 320, 410];
  return (
    <g>
      <rect width={800} height={800} fill="url(#dark)" />
      {xs.map((x, i) => <rect key={i} x={x} y={580 - hs[i]} width={68} height={hs[i]} rx={10} fill={i === 3 ? GOLD : INK} />)}
    </g>
  );
};
const A_ascent: React.FC = () => {
  const steps = [[200, 470], [300, 400], [400, 330], [500, 260]];
  return (
    <g>
      <rect width={800} height={800} fill="url(#dark)" />
      <circle cx={560} cy={240} r={120} fill={GOLD} opacity={0.18} />
      {steps.map(([x, y], i) => <rect key={i} x={x} y={y} width={96} height={96} rx={8} fill={i === 3 ? GOLD : INK} />)}
    </g>
  );
};
const A_ring: React.FC = () => (
  <g>
    <rect width={800} height={800} fill="url(#dark)" />
    <circle cx={400} cy={400} r={232} fill="none" stroke={GOLD} strokeWidth={9} opacity={0.9} />
    <text x={400} y={505} textAnchor="middle" fontFamily={SANS} fontSize={300} fontWeight={800} letterSpacing={-6} fill={INK}>CL</text>
  </g>
);

const CONCEPTS: {name: string; C: React.FC}[] = [
  {name: 'A · serif monogram', C: A_serif},
  {name: 'B · level bars', C: A_bars},
  {name: 'C · ascent steps', C: A_ascent},
  {name: 'D · ring monogram', C: A_ring},
];

export const AvatarOptions: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#02050a'}}>
    <svg viewBox="0 0 1632 1700" width="100%" height="100%">
      <Defs />
      {CONCEPTS.map((c, i) => {
        const ox = (i % 2) * 816 + 8, oy = Math.floor(i / 2) * 816 + 8;
        return (
          <g key={c.name} transform={`translate(${ox} ${oy})`}>
            <g><c.C /></g>
            <circle cx={400} cy={400} r={398} fill="none" stroke="#ffffff" strokeWidth={2} strokeDasharray="6 8" opacity={0.35} />
            <text x={400} y={788} textAnchor="middle" fontFamily={SANS} fontSize={30} fontWeight={600} letterSpacing={3} fill="#9bb4cc">{c.name.toUpperCase()}</text>
          </g>
        );
      })}
    </svg>
  </AbsoluteFill>
);

// circle-cropped previews of all 4, large + at true avatar size, on a YouTube-dark bg
const Circ: React.FC<{C: React.FC; cx: number; cy: number; r: number; id: string}> = ({C, cx, cy, r, id}) => {
  const s = (2 * r) / 800;
  return (
    <g transform={`translate(${cx - r} ${cy - r}) scale(${s})`}>
      <clipPath id={id}><circle cx={400} cy={400} r={400} /></clipPath>
      <g clipPath={`url(#${id})`}><C /></g>
      <circle cx={400} cy={400} r={398} fill="none" stroke="#2a2a2a" strokeWidth={3} />
    </g>
  );
};
export const AvatarPreview: React.FC = () => {
  const xs = [224, 600, 976, 1352];
  return (
    <AbsoluteFill style={{backgroundColor: '#181818'}}>
      <svg viewBox="0 0 1576 760" width="100%" height="100%">
        <Defs />
        {CONCEPTS.map((c, i) => (
          <g key={c.name}>
            <Circ C={c.C} cx={xs[i]} cy={300} r={170} id={'big' + i} />
            <Circ C={c.C} cx={xs[i]} cy={560} r={42} id={'sm' + i} />
            <text x={xs[i]} y={690} textAnchor="middle" fontFamily={SANS} fontSize={28} fontWeight={600} letterSpacing={2} fill="#aaa">{c.name.toUpperCase()}</text>
          </g>
        ))}
        <text x={788} y={640} textAnchor="middle" fontFamily={SANS} fontSize={22} fill="#666">↑ actual size on YouTube</text>
      </svg>
    </AbsoluteFill>
  );
};

// finalized avatar = Level Bars (user pick)
export const Avatar: React.FC = () => (
  <AbsoluteFill><svg viewBox="0 0 800 800" width="100%" height="100%"><Defs /><A_bars /></svg></AbsoluteFill>
);

// ===== BANNER CONCEPTS (2048x1152, safe center ~1235x338 => x 406..1642, y 407..745) =====
const BannerFrame: React.FC<{children: React.ReactNode; skyline?: boolean}> = ({children, skyline}) => (
  <AbsoluteFill style={{backgroundColor: '#05090f'}}>
    <svg viewBox="0 0 2048 1152" width="100%" height="100%">
      <Defs />
      <rect width={2048} height={1152} fill="url(#bnr)" />
      {skyline && <Skyline w={2048} baseY={1000} tint="#0c1826" o={0.55} />}
      {children}
    </svg>
  </AbsoluteFill>
);

// 1: minimal wordmark + short tagline, clean dark, faint skyline low
export const BannerA: React.FC = () => (
  <BannerFrame skyline>
    <text x={1024} y={540} textAnchor="middle" fontFamily={SANS} fontSize={118} fontWeight={800} letterSpacing={10} fill={INK}>CORELIFECYCLE</text>
    <rect x={904} y={582} width={240} height={4} fill={GOLD} />
    <text x={1024} y={648} textAnchor="middle" fontFamily={SANS} fontSize={34} fontWeight={600} letterSpacing={14} fill="#9bb4cc">THE ARCHITECTURE OF POWER</text>
  </BannerFrame>
);

// 2: ultra-minimal, wordmark only, pure dark
export const BannerB: React.FC = () => (
  <BannerFrame>
    <text x={1024} y={560} textAnchor="middle" fontFamily={SERIF} fontSize={130} fontWeight={600} letterSpacing={6} fill={INK}>CoreLifecycle</text>
    <rect x={954} y={612} width={140} height={4} fill={GOLD} />
    <text x={1024} y={672} textAnchor="middle" fontFamily={SANS} fontSize={28} fontWeight={600} letterSpacing={16} fill="#8aa0b8">EVERY LEVEL OF AMBITION</text>
  </BannerFrame>
);

// 3: centered lockup — bars mark above a centered wordmark + tagline
export const BannerC: React.FC = () => {
  const hs = [34, 54, 74, 96], bw = 24, gap = 16;
  const total = hs.length * bw + (hs.length - 1) * gap;
  const x0 = 1024 - total / 2, top = 452;
  return (
    <BannerFrame>
      <g>
        {hs.map((h, i) => <rect key={i} x={x0 + i * (bw + gap)} y={top - h} width={bw} height={h} rx={5} fill={i === 3 ? GOLD : INK} />)}
      </g>
      <text x={1024} y={580} textAnchor="middle" fontFamily={SANS} fontSize={116} fontWeight={800} letterSpacing={8} fill={INK}>CORELIFECYCLE</text>
      <rect x={904} y={620} width={240} height={4} fill={GOLD} />
      <text x={1024} y={678} textAnchor="middle" fontFamily={SANS} fontSize={30} fontWeight={600} letterSpacing={11} fill="#9bb4cc">EVERY LEVEL OF POWER, MONEY &amp; AMBITION</text>
    </BannerFrame>
  );
};

// ===== THUMBNAIL 1280x720 (mobile-first, per PACKAGING_PLAYBOOK template) =====
export const Thumbnail: React.FC = () => {
  const t = meta.thumb;
  const bigLines = [t.line1, t.line2].filter(Boolean) as string[];
  const maxLen = Math.max(...bigLines.map((s) => s.length), 1);
  const big = Math.min(128, Math.floor(1150 / (maxLen * 0.62)));
  const firstY = bigLines.length > 1 ? 292 : 360;
  const lastY = firstY + (bigLines.length - 1) * big;
  const pillY = lastY + 50;
  const tagW = Math.max(360, t.tag.length * 28);
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <svg viewBox="0 0 1280 720" width="100%" height="100%">
        <defs><filter id="trough" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter></defs>
        <g filter="url(#trough)">
          {[60, 180, 300, 430, 560, 1060, 1180].map((x, i) => {const h = 120 + ((i * 67) % 170); return <rect key={i} x={x} y={720 - h} width={70} height={h} fill={PAPER} stroke="#2a2620" strokeWidth={3} />;})}
          <line x1={0} y1={720} x2={1280} y2={720} stroke="#2a2620" strokeWidth={4} />
          <StickFigure pose={A.stand(0)} x={1040} y={700} scale={4.3} facing={1} view="front" expr={FACES.smug} pal={LIGHT} rough frame={0} />
        </g>
        <text x={66} y={150} fontFamily={SANS} fontSize={58} fontWeight={800} letterSpacing={2} fill="#2a2620">{t.kicker}</text>
        {bigLines.map((line, i) => (
          <text key={i} x={64} y={firstY + i * big} fontFamily={SANS} fontSize={big} fontWeight={800} fill="#2a2620">{line}</text>
        ))}
        <rect x={66} y={pillY} width={tagW} height={68} rx={6} fill={GOLD} />
        <text x={66 + tagW / 2} y={pillY + 50} textAnchor="middle" fontFamily={SANS} fontSize={48} fontWeight={800} fill="#2a2620">{t.tag}</text>
      </svg>
    </AbsoluteFill>
  );
};
