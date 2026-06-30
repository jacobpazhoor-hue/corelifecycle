import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StickFigure, LIGHT, SIL, PAPER} from './figure';
import {FACES} from './faces';
import * as A from './actions';
import {TEMPLATES} from './scenes';
import meta from './episode_meta.json';

// ============================================================================
// THUMBNAIL ARCHETYPES — 5 distinct layouts so every video does NOT look the same.
// Research-backed (2026): <=4 words, expressive face, ONE bold color pop, 1-2 hero
// elements, text upper area. The packager picks `thumb.archetype`; otherwise we
// rotate deterministically by topic so consecutive uploads differ.
// ============================================================================
const SANS = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = '#2a2620';
const GOLD = '#e8b54b';
// complementary color pops (one per archetype) for contrast/CTR
const POP = {crimson: '#c0392b', teal: '#1f9e8f', indigo: '#3a539b', orange: '#e07a2f', gold: GOLD};

const t = (meta as any).thumb || {};
const KICKER: string = t.kicker || 'EVERY LEVEL OF A';
const L1: string = t.line1 || '';
const L2: string = t.line2 || '';
const TAG: string = t.tag || '';
// apex number = the part after the arrow in the tag ("$0 → $5T" -> "$5T")
const BIG: string = t.big || (TAG.includes('→') ? TAG.split('→').pop()!.trim() : TAG);
const QUESTION: string = t.question || 'WHO IS ABOVE THEM?';
const SETTING: string = t.setting || '';
const EXPR = (FACES as any)[t.expr || 'smug'] || FACES.smug;
const RED = '#d62828';
const POVLINE: string = (t.povline || 'YOU BECOME').toUpperCase();
const KEYWORD: string = (t.keyword || L1 || 'THE BOSS').toUpperCase();
// before/after split fields (optional; sensible fallbacks so it works without prompt changes)
const BEFORE: string = (t.before || 'NOBODY').toUpperCase();
const AFTER: string = (t.after || KEYWORD || L1 || 'THE TOP').toUpperCase();

const Defs: React.FC = () => (
  <defs>
    <filter id="troughT" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter>
    {/* metallic gold (reads as foil, not flat yellow) + a soft drop-shadow so the hero lifts off the paper */}
    <linearGradient id="tgold" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f5d76e" /><stop offset="0.5" stopColor="#e8b54b" /><stop offset="1" stopColor="#b8860b" /></linearGradient>
    <filter id="tdrop" x="-25%" y="-25%" width="150%" height="150%"><feDropShadow dx="0" dy="12" stdDeviation="11" floodColor="#1a1208" floodOpacity="0.30" /></filter>
  </defs>
);

// metallic-gold pill helper (premium foil look for the tag/apex)
const GoldPill: React.FC<{x: number; y: number; w: number; h: number; label: string; fs: number}> = ({x, y, w, h, label, fs}) => (
  <g>
    <rect x={x} y={y} width={w} height={h} rx={7} fill="url(#tgold)" stroke={INK} strokeWidth={3} />
    <text x={x + w / 2} y={y + h / 2 + fs * 0.36} textAnchor="middle" fontFamily={SANS} fontSize={fs} fontWeight={800} fill={INK}>{label}</text>
  </g>
);

const Bars: React.FC<{y: number}> = ({y}) => (
  <g filter="url(#troughT)">{[60, 180, 300, 430, 560, 1060, 1180].map((x, i) => {const h = 90 + ((i * 67) % 150); return <rect key={i} x={x} y={y - h} width={64} height={h} fill={PAPER} stroke={INK} strokeWidth={3} />;})}</g>
);

// big hand-drawn head with an expression (for THE FACE / THE QUESTION)
const BigHead: React.FC<{cx: number; cy: number; r: number; mood?: string; sil?: boolean}> = ({cx, cy, r, mood = 'smug', sil = false}) => {
  // "shock" = face-of-fear (the #1 CTR lever when you have no real faces): huge eyes, open mouth,
  // raised brows, a sweat drop. Pushed past what a real face can do — that's the point.
  const shock = mood === 'shock' || mood === 'fear' || mood === 'worried';
  const em = shock ? 1.55 : 1;
  const ew = r * 0.16 * em, eh = r * 0.2 * em, ex = r * 0.4, ey = r * 0.18;
  const fill = sil ? INK : PAPER;
  if (sil) return <g filter="url(#troughT)"><circle cx={cx} cy={cy} r={r} fill={INK} /></g>;
  return (
    <g filter="url(#troughT)">
      <circle cx={cx} cy={cy} r={r} fill={fill} stroke={INK} strokeWidth={r * 0.07} />
      {/* brows (raised high for shock) */}
      {shock ? (<>
        <path d={`M ${cx - ex - ew} ${cy - ey - eh - 24} q ${ew} ${-14} ${ew * 2} ${-2}`} fill="none" stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" />
        <path d={`M ${cx + ex - ew} ${cy - ey - eh - 24} q ${ew} ${-2} ${ew * 2} ${-14}`} fill="none" stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" />
      </>) : (<>
        <path d={`M ${cx - ex - ew} ${cy - ey - eh - 14} q ${ew} ${mood === 'cold' ? 6 : -10} ${ew * 2} ${mood === 'smug' ? 2 : -2}`} fill="none" stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" />
        <path d={`M ${cx + ex - ew} ${cy - ey - eh - 14} q ${ew} ${mood === 'smug' ? 2 : -2} ${ew * 2} ${mood === 'cold' ? 6 : -10}`} fill="none" stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" />
      </>)}
      {/* eyes */}
      <ellipse cx={cx - ex} cy={cy - ey} rx={ew} ry={eh} fill={PAPER} stroke={INK} strokeWidth={r * 0.04} />
      <ellipse cx={cx + ex} cy={cy - ey} rx={ew} ry={eh} fill={PAPER} stroke={INK} strokeWidth={r * 0.04} />
      <circle cx={cx - ex + 2} cy={cy - ey + 3} r={ew * 0.5} fill={INK} />
      <circle cx={cx + ex + 2} cy={cy - ey + 3} r={ew * 0.5} fill={INK} />
      {/* mouth: shock open O / smug smirk / cold flat / hardened down */}
      {shock
        ? <ellipse cx={cx} cy={cy + r * 0.46} rx={r * 0.18} ry={r * 0.24} fill={INK} />
        : <path d={mood === 'cold' ? `M ${cx - r * 0.3} ${cy + r * 0.45} L ${cx + r * 0.3} ${cy + r * 0.45}`
            : mood === 'hollow' ? `M ${cx - r * 0.3} ${cy + r * 0.5} q ${r * 0.3} ${-r * 0.2} ${r * 0.6} 0`
            : `M ${cx - r * 0.3} ${cy + r * 0.42} q ${r * 0.32} ${r * 0.22} ${r * 0.62} ${-r * 0.04}`}
            fill="none" stroke={INK} strokeWidth={r * 0.06} strokeLinecap="round" />}
      {/* hair tuft */}
      <path d={`M ${cx - r * 0.5} ${cy - r * 0.82} q ${r * 0.2} ${-r * 0.3} ${r * 0.45} ${-r * 0.05} q ${r * 0.2} ${-r * 0.25} ${r * 0.4} ${r * 0.02}`} fill="none" stroke={INK} strokeWidth={r * 0.06} strokeLinecap="round" />
      {/* sweat drop (shock only) */}
      {shock && <path d={`M ${cx + r * 0.74} ${cy - r * 0.2} q ${r * 0.12} ${r * 0.16} 0 ${r * 0.28} q ${-r * 0.12} ${-r * 0.12} 0 ${-r * 0.28}`} fill="#7fb8d8" stroke={INK} strokeWidth={r * 0.025} />}
    </g>
  );
};

const Wrap: React.FC<{bg?: string; children: React.ReactNode}> = ({bg = PAPER, children}) => (
  <AbsoluteFill style={{backgroundColor: bg}}>
    <svg viewBox="0 0 1280 720" width="100%" height="100%"><Defs />{children}</svg>
  </AbsoluteFill>
);

// ---- 1. THE CLIMB — profession + $0→$X + ascending bars + figure (the original look) ----
const ThumbClimb: React.FC = () => {
  const big = Math.min(128, Math.floor(1150 / (Math.max(L1.length, L2.length, 1) * 0.62)));
  return (
    <Wrap>
      <Bars y={720} />
      <line x1={0} y1={720} x2={1280} y2={720} stroke={INK} strokeWidth={4} />
      <g filter="url(#tdrop)"><StickFigure pose={A.stand(0)} x={1040} y={700} scale={4.3} facing={1} view="front" expr={EXPR} pal={LIGHT} rough frame={0} /></g>
      <text x={66} y={140} fontFamily={SANS} fontSize={54} fontWeight={800} letterSpacing={2} fill={INK}>{KICKER}</text>
      <text x={64} y={272} fontFamily={SANS} fontSize={big} fontWeight={800} fill={INK}>{L1}</text>
      {L2 ? <text x={64} y={272 + big} fontFamily={SANS} fontSize={big} fontWeight={800} fill={INK}>{L2}</text> : null}
      <GoldPill x={66} y={(L2 ? 272 + big : 272) + 40} w={Math.max(360, TAG.length * 28)} h={68} label={TAG} fs={48} />
    </Wrap>
  );
};

// ---- 2. THE NUMBER — one giant apex number, tiny figure dwarfed, crimson pop ----
const ThumbNumber: React.FC = () => {
  const fs = Math.min(440, Math.floor(1240 / Math.max(BIG.length, 1) * 1.55));
  const uw = Math.min(900, BIG.length * fs * 0.42); // underline ~ number width
  return (
    <Wrap>
      <text x={66} y={104} fontFamily={SANS} fontSize={44} fontWeight={800} letterSpacing={3} fill={INK}>{KICKER} {L1}{L2 ? ' ' + L2 : ''}</text>
      <text x={600} y={460} textAnchor="middle" fontFamily={SANS} fontSize={fs} fontWeight={800} letterSpacing={-6} fill={INK}>{BIG}</text>
      {/* crimson UNDERLINE under the number (emphasis, not a strike-through) */}
      <rect x={600 - uw / 2} y={500} width={uw} height={30} rx={4} fill={POP.crimson} />
      <text x={66} y={684} fontFamily={SANS} fontSize={50} fontWeight={800} fill={POP.crimson}>{TAG}</text>
      <StickFigure pose={A.lookUp(0)} x={1170} y={712} scale={2.5} facing={-1} view="front" expr={FACES.worried} pal={LIGHT} rough frame={0} />
    </Wrap>
  );
};

// ---- 3. THE FACE — big expressive head + bold word, teal band ----
const ThumbFace: React.FC = () => (
  <Wrap>
    <rect x={760} y={0} width={520} height={720} fill={POP.teal} opacity={0.16} />
    <text x={60} y={150} fontFamily={SANS} fontSize={48} fontWeight={800} letterSpacing={2} fill={INK}>{KICKER}</text>
    <text x={58} y={320} fontFamily={SANS} fontSize={132} fontWeight={800} fill={INK}>{L1}</text>
    {L2 ? <text x={58} y={452} fontFamily={SANS} fontSize={132} fontWeight={800} fill={INK}>{L2}</text> : null}
    <rect x={60} y={(L2 ? 452 : 320) + 36} width={Math.max(320, TAG.length * 26)} height={62} rx={6} fill={POP.teal} />
    <text x={60 + Math.max(320, TAG.length * 26) / 2} y={(L2 ? 452 : 320) + 80} textAnchor="middle" fontFamily={SANS} fontSize={44} fontWeight={800} fill="#fff">{TAG}</text>
    <BigHead cx={1010} cy={330} r={250} mood={t.expr || 'smug'} />
  </Wrap>
);

// ---- 4. THE SETTING — the topic's own scene behind a bold word ----
const ThumbSetting: React.FC = () => {
  const Art = TEMPLATES[SETTING] || TEMPLATES['desk'];
  const big = Math.min(118, Math.floor(1120 / (Math.max(L1.length, L2.length, 1) * 0.62)));
  const bandH = (L2 ? big * 2 + 60 : big + 60);
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <AbsoluteFill>{Art ? <Art /> : null}</AbsoluteFill>
      <svg viewBox="0 0 1280 720" width="100%" height="100%"><Defs />
        {/* solid ink band, top — high-contrast reversed-out title over the scene */}
        <rect x={0} y={0} width={1280} height={bandH + 70} fill={INK} />
        <text x={64} y={64} fontFamily={SANS} fontSize={42} fontWeight={800} letterSpacing={2} fill={GOLD}>{KICKER}</text>
        <text x={60} y={64 + big} fontFamily={SANS} fontSize={big} fontWeight={800} fill="#f6f2e9">{L1}</text>
        {L2 ? <text x={60} y={64 + big * 2} fontFamily={SANS} fontSize={big} fontWeight={800} fill="#f6f2e9">{L2}</text> : null}
        {/* tag pill, bottom-left (clear of the timestamp) */}
        <rect x={64} y={620} width={Math.max(340, TAG.length * 27)} height={68} rx={6} fill={POP.orange} />
        <text x={64 + Math.max(340, TAG.length * 27) / 2} y={668} textAnchor="middle" fontFamily={SANS} fontSize={46} fontWeight={800} fill="#fff">{TAG}</text>
      </svg>
    </AbsoluteFill>
  );
};

// ---- 5. THE QUESTION — curiosity-gap line + silhouette, indigo pop ----
const ThumbQuestion: React.FC = () => {
  const words = QUESTION.toUpperCase().split(' ');
  const lines: string[] = [];
  let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > 12) { lines.push(cur.trim()); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return (
    <Wrap>
      <text x={64} y={120} fontFamily={SANS} fontSize={44} fontWeight={800} letterSpacing={2} fill={INK}>{KICKER} {L1}{L2 ? ' ' + L2 : ''}</text>
      <rect x={0} y={170} width={64} height={ lines.length * 132 + 30 } fill={POP.indigo} />
      {lines.map((ln, i) => <text key={i} x={96} y={300 + i * 132} fontFamily={SANS} fontSize={120} fontWeight={800} fill={i === lines.length - 1 ? POP.indigo : INK}>{ln}</text>)}
      <BigHead cx={1080} cy={420} r={210} sil />
    </Wrap>
  );
};

// ---- POV (MasterPOVs formula) — hero figure + "YOU [VERB] / KEYWORD"(red) + curved arrow ----
const ThumbPov: React.FC = () => {
  const mood = (FACES as any)[t.expr || 'cold'] || FACES.cold;
  const kw = Math.min(170, Math.floor(1010 / Math.max(KEYWORD.length, 1) * 0.95));
  return (
    <Wrap>
      {/* hero figure, right — lifted off the paper with a soft drop-shadow */}
      <g filter="url(#tdrop)"><StickFigure pose={A.stand(0)} x={1045} y={706} scale={4.5} facing={-1} view="front" expr={mood} pal={LIGHT} rough frame={0} /></g>
      {/* second-person caption, left: verb phrase (ink) + KEY WORD (red) */}
      <text x={74} y={296} fontFamily={SANS} fontSize={74} fontWeight={800} letterSpacing={2} fill={INK}>{POVLINE}</text>
      <text x={70} y={300 + kw} fontFamily={SANS} fontSize={kw} fontWeight={800} letterSpacing={-1} fill={RED}>{KEYWORD}</text>
      {/* hand-drawn curved arrow: caption -> figure */}
      <g filter="url(#troughT)" stroke={INK} strokeWidth={9} fill="none" strokeLinecap="round">
        <path d="M 660 250 Q 800 150 905 235" />
        <path d="M 905 235 L 866 216 M 905 235 L 882 272" />
      </g>
    </Wrap>
  );
};

// ---- 6. THE LADDER — visualizes the "every level" promise: rising steps, tiny climber -> big apex ----
const ThumbLadder: React.FC = () => {
  const mood = (FACES as any)[t.expr || 'smug'] || FACES.smug;
  const baseY = 692, sw = 150, sh = 78; // step width / rise per step (lower top step so the hero fits)
  const steps = [0, 1, 2, 3].map((i) => ({x: 540 + i * sw, top: baseY - (i + 1) * sh}));
  return (
    <Wrap>
      <line x1={0} y1={baseY} x2={1280} y2={baseY} stroke={INK} strokeWidth={4} />
      {steps.map((s, i) => <rect key={i} x={s.x} y={s.top} width={sw} height={baseY - s.top} fill={PAPER} stroke={INK} strokeWidth={4} />)}
      {/* tiny climber at the bottom, big hero on the top step */}
      <StickFigure pose={A.stand(0)} x={470} y={baseY} scale={1.15} facing={1} view="front" expr={FACES.earnest} pal={LIGHT} rough frame={0} />
      <g filter="url(#tdrop)"><StickFigure pose={A.stand(0)} x={steps[3].x + sw / 2} y={steps[3].top} scale={1.7} facing={-1} view="front" expr={mood} pal={LIGHT} rough frame={0} /></g>
      <text x={64} y={120} fontFamily={SANS} fontSize={52} fontWeight={800} letterSpacing={2} fill={INK}>{KICKER}</text>
      <text x={62} y={236} fontFamily={SANS} fontSize={Math.min(132, Math.floor(900 / Math.max(L1.length, 1)))} fontWeight={800} fill={INK}>{L1}</text>
      <GoldPill x={62} y={288} w={Math.max(300, BIG.length * 48)} h={80} label={BIG} fs={56} />
    </Wrap>
  );
};

// ---- 7. THE BEFORE/AFTER — dim "nobody" vs bold apex, split down the middle (transformation hook) ----
const ThumbBefore: React.FC = () => {
  const mood = (FACES as any)[t.expr || 'smug'] || FACES.smug;
  return (
    <Wrap>
      <line x1={640} y1={150} x2={640} y2={720} stroke={INK} strokeWidth={6} />
      <text x={640} y={70} textAnchor="middle" fontFamily={SANS} fontSize={42} fontWeight={800} letterSpacing={2} fill={INK}>{KICKER} {L1}</text>
      {/* BEFORE — left, dim, smaller + lower so the label clears the head */}
      <StickFigure pose={A.stand(0)} x={320} y={714} scale={2.7} facing={1} view="front" expr={FACES.earnest} pal={SIL} rough frame={0} />
      <text x={320} y={176} textAnchor="middle" fontFamily={SANS} fontSize={Math.min(86, Math.floor(620 / Math.max(BEFORE.length, 1)))} fontWeight={800} fill={INK} opacity={0.5}>{BEFORE}</text>
      {/* AFTER — right, bold + red, lifted off the page */}
      <g filter="url(#tdrop)"><StickFigure pose={A.stand(0)} x={968} y={714} scale={2.9} facing={-1} view="front" expr={mood} pal={LIGHT} rough frame={0} /></g>
      <text x={968} y={176} textAnchor="middle" fontFamily={SANS} fontSize={Math.min(96, Math.floor(740 / Math.max(AFTER.length, 1)))} fontWeight={800} fill={RED}>{AFTER}</text>
    </Wrap>
  );
};

const ARCHES: Record<string, React.FC> = {pov: ThumbPov, ladder: ThumbLadder, beforeafter: ThumbBefore, number: ThumbNumber, face: ThumbFace, setting: ThumbSetting, question: ThumbQuestion, climb: ThumbClimb};
// weighted to FAVOR the MasterPOVs POV thumbnail + the other high-click single-focal archetypes
// (ladder = the "every level" promise; beforeafter = transformation). The busy old "climb" is rare.
const ORDER = ['pov', 'number', 'ladder', 'question', 'pov', 'beforeafter', 'face', 'number', 'setting', 'pov', 'ladder', 'question', 'climb'];

// pick: explicit archetype, else deterministic rotation by topic so consecutive videos differ
function pick(): React.FC {
  if (t.archetype && ARCHES[t.archetype]) return ARCHES[t.archetype];
  const topic = (meta as any).topic || L1 || 'x';
  let h = 0; for (const c of topic) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ARCHES[ORDER[h % ORDER.length]];
}

export const Thumbnail: React.FC = () => {
  const C = pick();
  return <C />;
};

// individual archetypes exposed for the contact-sheet / examples
export const ThumbAll: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#ccc', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridAutoRows: '1fr', gap: 6}}>
    {Object.keys(ARCHES).map((k) => <div key={k} style={{position: 'relative', border: '2px solid #333'}}>{React.createElement(ARCHES[k])}<div style={{position: 'absolute', top: 4, left: 6, background: 'rgba(255,255,255,0.8)', font: '700 20px monospace', padding: '2px 6px'}}>{k}</div></div>)}
  </AbsoluteFill>
);
