import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StickFigure, LIGHT, SIL, PAPER} from './figure';
import {FACES} from './faces';
import * as A from './actions';
import {TEMPLATES} from './scenes';
import meta from './episode_meta.json';

// ============================================================================
// THUMBNAIL ENGINE v2 (2026 high-CTR redesign — see NEXT_LEVEL_PLAN research).
// "Directed bright": a SATURATED radial burst that ends in a DARK vignette, a doodle hero
// RIM-LIT + GLOWING so it pops off the color, <=3 energy layers (sunburst / spotlight / accent),
// and HEAVY stroked ALL-CAPS text with ONE hot accent word. No more flat cream paper.
// Thumbnails are STILLS (rendered once) so rich SVG filters (glow/blur) are fine here.
// ============================================================================
const SANS = "'Arial Black', 'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = '#0d0d0d';

// mood palettes: core->mid->rim radial, two ray colors, hot accent (keyword), glow color
type Mood = {core: string; mid: string; rim: string; ray: string; accent: string; glow: string; pill: string};
const MOODS: Record<string, Mood> = {
  danger:   {core: '#3E6FA3', mid: '#22364a', rim: '#0a0f16', ray: '#5a86b5', accent: '#FFC21A', glow: '#6ea6de', pill: '#C81E1E'},
  crime:    {core: '#8E2F6B', mid: '#2e0f28', rim: '#0d040b', ray: '#c04f9a', accent: '#FFC21A', glow: '#d15fa8', pill: '#C81E1E'},
  epic:     {core: '#C8873A', mid: '#4f3218', rim: '#140b04', ray: '#e0a84f', accent: '#FFE08A', glow: '#e8a84f', pill: '#8C3E12'},
  tactical: {core: '#FFB800', mid: '#FF6A00', rim: '#1A0F00', ray: '#FFCE3A', accent: '#FFE500', glow: '#FFB800', pill: '#C81E1E'},
  electric: {core: '#00E5FF', mid: '#0057B8', rim: '#03060F', ray: '#38B6FF', accent: '#FFE500', glow: '#00E5FF', pill: '#0B4FA8'},
  money:    {core: '#FFD54A', mid: '#1f7a4d', rim: '#06140b', ray: '#3fbf75', accent: '#FFE07A', glow: '#FFD54A', pill: '#0F7A3D'},
  royal:    {core: '#B06CFF', mid: '#5a2a9e', rim: '#0c0518', ray: '#8f5cf0', accent: '#FFE500', glow: '#B06CFF', pill: '#5A2A9E'},
  survival: {core: '#12C2C9', mid: '#0a4a6e', rim: '#020a12', ray: '#3fd9de', accent: '#FF7A00', glow: '#12C2C9', pill: '#0A4A6E'},
};
// topic -> mood hints (crime/military/war -> danger; wealth -> money; spy/tech -> electric; royalty -> royal)
const MOOD_HINTS: Array<[RegExp, string]> = [
  // BUILDER/STARTUP lane first (2026-07-19): our #1 video is 'founder' (41% of all channel views)
  // and the queue now leads with startup_unicorn. Without this, 'Every Level of a Startup — From
  // Garage to $1B Unicorn' matched NOTHING and fell through to the steel-blue `danger` default.
  // Routes to `money` (gold/green) — the right read for a build-wealth ladder.
  [/startup|founder|unicorn|venture|entrepreneur|\bipo\b|\bceo\b|garage|silicon.?valley|self.?made/i, 'money'],
  [/\b(spy|cia|fbi|nsa|mi6)\b|intellig|undercover|hacker|cyber/i, 'electric'],
  [/billion|wealth|money|heir|mogul|trillion|lottery|fortune|diamond/i, 'money'],
  [/cartel|mafia|\bmob\b|mobster|hitman|assassin|kingpin|bratva|yakuza|triad|\bgang|narco|smuggl|heist|cocaine|prison|inmate|convict/i, 'crime'],
  [/samurai|gladiator|pirate|viking|warlord|shogun|ronin|spartan|colosseum|conquistador|crusad|\bknight/i, 'epic'],
  [/king|emperor|empire|royal|dynasty|throne|medieval|ottoman|monarch|pharaoh|roman|\brome\b/i, 'royal'],
  [/survive|stranded|lost at sea|castaway|marooned|shipwreck|ocean|desert|jungle|wilderness|avalanche|blizzard|arctic|mountain|storm/i, 'survival'],
  [/special.?forces|soldier|military|\bwar\b|sniper|marine|commando|\barmy|\bnavy|spec.?ops|regime|dictator|north.?korea/i, 'danger'],
];
function moodFor(): Mood {
  const m = (meta as any).thumb?.mood;
  if (m && MOODS[m]) return MOODS[m];
  const topic = ((meta as any).topic || '') + ' ' + ((meta as any).title || '');
  for (const [re, name] of MOOD_HINTS) if (re.test(topic)) return MOODS[name];
  return MOODS.danger;
}
const M = moodFor();

const t = (meta as any).thumb || {};
const KICKER: string = (t.kicker || 'EVERY LEVEL OF A').toUpperCase();
const L1: string = (t.line1 || '').toUpperCase();
const L2: string = (t.line2 || '').toUpperCase();
const TAG: string = (t.tag || '').toUpperCase();
const BIG: string = (t.big || (TAG.includes('→') ? TAG.split('→').pop()!.trim() : TAG)).toUpperCase();
const QUESTION: string = (t.question || 'WHO IS ABOVE THEM?').toUpperCase();
const SETTING: string = t.setting || '';
const POVLINE: string = (t.povline || 'YOU ARE').toUpperCase();
const KEYWORD: string = (t.keyword || L1 || 'THE BOSS').toUpperCase();
const BEFORE: string = (t.before || 'NOBODY').toUpperCase();
const AFTER: string = (t.after || KEYWORD || 'THE TOP').toUpperCase();

// ---------- shared defs: gradients, glow/rim, sunburst, tape ----------
const Defs: React.FC = () => (
  <defs>
    <radialGradient id="bggrad" cx="50%" cy="44%" r="72%">
      <stop offset="0%" stopColor={M.core} />
      <stop offset="46%" stopColor={M.mid} />
      <stop offset="100%" stopColor={M.rim} />
    </radialGradient>
    <radialGradient id="spot" cx="50%" cy="0%" r="80%">
      <stop offset="0%" stopColor="#ffffff" stopOpacity="0.55" />
      <stop offset="55%" stopColor="#ffffff" stopOpacity="0.06" />
      <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
    </radialGradient>
    {/* LIGHT vignette: on a white base a heavy black edge turns the frame muddy/grey — the exact
        "dull" look we're fixing. Just enough edge weight to contain the frame in the YT grid. */}
    <radialGradient id="vig" cx="50%" cy="50%" r="74%">
      <stop offset="62%" stopColor="#000" stopOpacity="0" />
      <stop offset="100%" stopColor="#000" stopOpacity="0.14" />
    </radialGradient>
    {/* HERO POP: white rim + colored outer glow so a black doodle floats off the bright bg */}
    <filter id="heroPop" x="-45%" y="-45%" width="190%" height="190%">
      <feMorphology in="SourceAlpha" operator="dilate" radius="9" result="rimA" />
      <feFlood floodColor="#ffffff" result="wht" />
      <feComposite in="wht" in2="rimA" operator="in" result="rim" />
      <feGaussianBlur in="rimA" stdDeviation="16" result="gb" />
      <feFlood floodColor={M.glow} floodOpacity="0.95" result="gc" />
      <feComposite in="gc" in2="gb" operator="in" result="glow" />
      <feMerge><feMergeNode in="glow" /><feMergeNode in="rim" /><feMergeNode in="SourceGraphic" /></feMerge>
    </filter>
    <filter id="txtsh" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="5" stdDeviation="4" floodColor="#000" floodOpacity="0.85" />
    </filter>
    <filter id="rough" x="-4%" y="-4%" width="108%" height="108%"><feTurbulence type="fractalNoise" baseFrequency="0.013" numOctaves="2" seed="4" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3" /></filter>
    {/* soft bloom for the cinematic backlight glow behind the hero */}
    <filter id="softblur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="70" /></filter>
  </defs>
);

// radiating sunburst wedges behind the subject (cheap, huge energy)
const Sunburst: React.FC<{cx?: number; cy?: number; n?: number}> = ({cx = 850, cy = 300, n = 26}) => {
  const R = 1500;
  const wedges = Array.from({length: n}, (_, i) => {
    const a0 = (i / n) * Math.PI * 2, a1 = ((i + 0.5) / n) * Math.PI * 2;
    const p = (a: number) => `${cx + Math.cos(a) * R} ${cy + Math.sin(a) * R}`;
    return <polygon key={i} points={`${cx},${cy} ${p(a0)} ${p(a1)}`} fill={M.ray} opacity={0.18} />;
  });
  return <g>{wedges}</g>;
};

// BRIGHT background (2026-07-19): a mainly-WHITE field with a soft mood-colored bloom behind the
// hero. Owner's call — the dark cinematic look read as too dark. White is also the highest-contrast
// backdrop for a BLACK doodle hero, which is the channel's whole visual identity.
// Guard against the old failure mode: the ORIGINAL bland version was flat CREAM (#f6f2e9) with grey
// text. This is pure #fff + saturated color + heavy black ink, which is bright, NOT washed out.
// `sun` kept for signature compat but ignored.
const EnergyBG: React.FC<{burstX?: number; sun?: boolean}> = ({burstX = 850}) => (
  <>
    <rect x={0} y={0} width={1280} height={720} fill="#ffffff" />
    {/* mood color lives ONLY here — a soft saturated bloom behind the subject, plus a floor wash,
        so the frame reads bright-white overall but never empty */}
    <ellipse cx={burstX} cy={330} rx={340} ry={300} fill={M.core} opacity={0.20} filter="url(#softblur)" />
    <ellipse cx={burstX} cy={315} rx={190} ry={170} fill={M.core} opacity={0.16} filter="url(#softblur)" />
    <ellipse cx={640} cy={815} rx={820} ry={150} fill={M.mid} opacity={0.10} filter="url(#softblur)" />
    <rect x={0} y={0} width={1280} height={720} fill="url(#vig)" />
  </>
);

// heavy stroked ALL-CAPS text (outlined + shadow) — legible on any bright bg
// On the BRIGHT base the default flipped (2026-07-19): BLACK ink with a WHITE halo — max contrast
// on white, and the halo keeps it legible where it crosses the hero or a color bloom. Hot accent
// words pass st="#111" so they keep a dark outline and still punch.
const Punch: React.FC<{x: number; y: number; fs: number; fill?: string; children: React.ReactNode; anchor?: string; angle?: number; sw?: number; st?: string}> =
({x, y, fs, fill = INK, children, anchor = 'start', angle = 0, sw, st = '#ffffff'}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontSize={fs} fontWeight={900}
    fill={fill} stroke={st} strokeWidth={sw ?? Math.max(6, fs * 0.09)} paintOrder="stroke"
    strokeLinejoin="round" filter="url(#txtsh)" transform={angle ? `rotate(${angle} ${x} ${y})` : undefined}>{children}</text>
);

// hot-accent keyword on a siren pill (breaking-news pop), slight angle
const KeyPill: React.FC<{x: number; y: number; fs: number; label: string; anchor?: string; angle?: number; maxW?: number}> =
({x, y, fs, label, anchor = 'start', angle = -5, maxW = 660}) => {
  const ff = Math.min(fs, Math.floor((maxW - 56) / Math.max(label.length * 0.6, 1)));  // auto-fit long labels
  const w = label.length * ff * 0.62 + 52, h = ff * 1.36;
  const px = anchor === 'middle' ? x - w / 2 : x;
  return (
    <g transform={`rotate(${angle} ${x} ${y})`}>
      <rect x={px} y={y - h * 0.8} width={w} height={h} rx={12} fill={M.pill} stroke="#000" strokeWidth={5} filter="url(#txtsh)" />
      <text x={px + w / 2} y={y + ff * 0.06} textAnchor="middle" fontFamily={SANS} fontSize={ff} fontWeight={900}
        fill={M.accent} stroke="#000" strokeWidth={Math.max(4, ff * 0.06)} paintOrder="stroke" strokeLinejoin="round">{label}</text>
    </g>
  );
};

// diagonal danger tape band with a keyword (on-brand for military/crime)
const Tape: React.FC<{y: number; label: string}> = ({y, label}) => (
  <g transform={`rotate(-6 640 ${y})`}>
    <rect x={-40} y={y - 46} width={1360} height={92} fill={M.accent} stroke="#000" strokeWidth={5} />
    <g clipPath="none">{Array.from({length: 40}, (_, i) => <rect key={i} x={-40 + i * 36} y={y - 46} width={16} height={92} fill="#000" opacity={0.16} transform={`skewX(-20)`} />)}</g>
    <text x={640} y={y + 20} textAnchor="middle" fontFamily={SANS} fontSize={58} fontWeight={900} fill="#000">{label}</text>
  </g>
);

const Hero: React.FC<{x: number; y: number; scale: number; facing?: number; expr?: any; pose?: any; pal?: any}> =
({x, y, scale, facing = -1, expr, pose, pal = LIGHT}) => (
  <g filter="url(#heroPop)"><StickFigure pose={pose ?? A.stand(0)} x={x} y={y} scale={scale} facing={facing} view="front" expr={expr} pal={pal} rough frame={0} /></g>
);

const Wrap: React.FC<{children: React.ReactNode; burstX?: number; sun?: boolean}> = ({children, burstX, sun}) => (
  <AbsoluteFill style={{backgroundColor: M.rim}}>
    <svg viewBox="0 0 1280 720" width="100%" height="100%"><Defs /><EnergyBG burstX={burstX} sun={sun} />{children}</svg>
  </AbsoluteFill>
);

const face = (name: string, fb = 'cold') => (FACES as any)[t.expr || name] || (FACES as any)[fb] || FACES.cold;

// big expressive head (shock = fear-of-God: huge eyes, O-mouth, sweat) for FACE/QUESTION
const BigHead: React.FC<{cx: number; cy: number; r: number; mood?: string; sil?: boolean}> = ({cx, cy, r, mood = 'shock', sil = false}) => {
  const shock = mood === 'shock' || mood === 'fear' || mood === 'worried';
  const em = shock ? 1.6 : 1;
  const ew = r * 0.17 * em, eh = r * 0.21 * em, ex = r * 0.4, ey = r * 0.16;
  if (sil) return <g filter="url(#heroPop)"><circle cx={cx} cy={cy} r={r} fill={INK} /></g>;
  return (
    <g filter="url(#heroPop)">
      <circle cx={cx} cy={cy} r={r} fill={PAPER} stroke={INK} strokeWidth={r * 0.07} />
      {shock ? (<>
        <path d={`M ${cx - ex - ew} ${cy - ey - eh - 26} q ${ew} ${-16} ${ew * 2} ${-2}`} fill="none" stroke={INK} strokeWidth={r * 0.055} strokeLinecap="round" />
        <path d={`M ${cx + ex - ew} ${cy - ey - eh - 26} q ${ew} ${-2} ${ew * 2} ${-16}`} fill="none" stroke={INK} strokeWidth={r * 0.055} strokeLinecap="round" />
      </>) : (<>
        <path d={`M ${cx - ex - ew} ${cy - ey - eh - 14} q ${ew} ${mood === 'cold' ? 6 : -10} ${ew * 2} ${-2}`} fill="none" stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" />
        <path d={`M ${cx + ex - ew} ${cy - ey - eh - 14} q ${ew} ${-2} ${ew * 2} ${mood === 'cold' ? 6 : -10}`} fill="none" stroke={INK} strokeWidth={r * 0.05} strokeLinecap="round" />
      </>)}
      <ellipse cx={cx - ex} cy={cy - ey} rx={ew} ry={eh} fill="#fff" stroke={INK} strokeWidth={r * 0.04} />
      <ellipse cx={cx + ex} cy={cy - ey} rx={ew} ry={eh} fill="#fff" stroke={INK} strokeWidth={r * 0.04} />
      <circle cx={cx - ex + 2} cy={cy - ey + 3} r={ew * (shock ? 0.32 : 0.5)} fill={INK} />
      <circle cx={cx + ex + 2} cy={cy - ey + 3} r={ew * (shock ? 0.32 : 0.5)} fill={INK} />
      {shock
        ? <ellipse cx={cx} cy={cy + r * 0.48} rx={r * 0.19} ry={r * 0.26} fill={INK} />
        : <path d={mood === 'cold' ? `M ${cx - r * 0.3} ${cy + r * 0.45} L ${cx + r * 0.3} ${cy + r * 0.45}` : `M ${cx - r * 0.3} ${cy + r * 0.42} q ${r * 0.32} ${r * 0.22} ${r * 0.62} ${-r * 0.04}`}
            fill="none" stroke={INK} strokeWidth={r * 0.06} strokeLinecap="round" />}
      <path d={`M ${cx - r * 0.5} ${cy - r * 0.82} q ${r * 0.2} ${-r * 0.3} ${r * 0.45} ${-r * 0.05} q ${r * 0.2} ${-r * 0.25} ${r * 0.4} ${r * 0.02}`} fill="none" stroke={INK} strokeWidth={r * 0.06} strokeLinecap="round" />
      {shock && <>
        <path d={`M ${cx + r * 0.78} ${cy - r * 0.16} q ${r * 0.12} ${r * 0.16} 0 ${r * 0.28} q ${-r * 0.12} ${-r * 0.12} 0 ${-r * 0.28}`} fill="#4FC3F7" stroke={INK} strokeWidth={r * 0.025} />
        <path d={`M ${cx - r * 0.8} ${cy - r * 0.02} q ${r * 0.1} ${r * 0.14} 0 ${r * 0.24} q ${-r * 0.1} ${-r * 0.1} 0 ${-r * 0.24}`} fill="#4FC3F7" stroke={INK} strokeWidth={r * 0.022} />
      </>}
    </g>
  );
};

// curved hand-drawn arrow (caption/eyeline -> subject)
const Arrow: React.FC<{d: string; heads: string}> = ({d, heads}) => (
  <g filter="url(#rough)" stroke={M.accent} strokeWidth={12} fill="none" strokeLinecap="round" paintOrder="stroke">
    <path d={d} stroke="#000" strokeWidth={20} /><path d={d} />
    <path d={heads} stroke="#000" strokeWidth={20} /><path d={heads} />
  </g>
);

// ==================== ARCHETYPES ====================

// POV (PRIMARY) — glowing hero + "YOU [VERB]" + KEYWORD pill + arrow, on the danger burst
const ThumbPov: React.FC = () => {
  const kw = Math.min(196, Math.floor(660 / Math.max(KEYWORD.length, 1)));
  return (
    <Wrap burstX={985}>
      <Hero x={1030} y={724} scale={4.3} facing={-1} expr={face('worried', 'worried')} />
      <Punch x={78} y={168} fs={86}>{POVLINE}</Punch>
      <KeyPill x={100} y={168 + kw + 46} fs={kw} label={KEYWORD} angle={-5} maxW={640} />
      <Arrow d="M 600 300 Q 780 210 905 305" heads="M 905 305 L 861 286 M 905 305 L 881 341" />
    </Wrap>
  );
};

// THE NUMBER — one colossal apex number, tiny dwarfed hero, siren underline
const ThumbNumber: React.FC = () => {
  const fs = Math.min(480, Math.floor(1300 / Math.max(BIG.length, 1) * 1.6));
  return (
    <Wrap burstX={600}>
      <Punch x={640} y={170} fs={50} anchor="middle">{(KICKER + ' ' + L1).trim()}</Punch>
      <Punch x={600} y={470} fs={fs} anchor="middle" sw={fs * 0.06}>{BIG}</Punch>
      <rect x={600 - Math.min(820, BIG.length * fs * 0.4) / 2} y={505} width={Math.min(820, BIG.length * fs * 0.4)} height={34} rx={6} fill={M.accent} stroke="#000" strokeWidth={5} />
      {TAG ? <KeyPill x={640} y={660} fs={58} label={TAG} anchor="middle" angle={-4} /> : null}
      <Hero x={1180} y={716} scale={2.7} facing={-1} expr={face('worried')} pose={A.lookUp(0)} />
    </Wrap>
  );
};

// THE FACE — huge shock head + bold word
const ThumbFace: React.FC = () => (
  <Wrap burstX={1010}>
    <Punch x={60} y={190} fs={64}>{L1 || KEYWORD}</Punch>
    {L2 ? <Punch x={60} y={330} fs={120}>{L2}</Punch> : null}
    {TAG ? <KeyPill x={70} y={L2 ? 470 : 320} fs={78} label={TAG} angle={-5} /> : null}
    <BigHead cx={1000} cy={340} r={270} mood={t.expr || 'shock'} />
  </Wrap>
);

// THE QUESTION — curiosity line + silhouette
const ThumbQuestion: React.FC = () => {
  const words = QUESTION.split(' '); const lines: string[] = []; let cur = '';
  for (const w of words) { if ((cur + ' ' + w).trim().length > 12) { lines.push(cur.trim()); cur = w; } else cur = (cur + ' ' + w).trim(); }
  if (cur) lines.push(cur);
  return (
    <Wrap burstX={1060}>
      {lines.map((ln, i) => <Punch key={i} x={70} y={250 + i * 128} fs={116} fill={i === lines.length - 1 ? M.accent : INK} st={i === lines.length - 1 ? '#111' : '#ffffff'}>{ln}</Punch>)}
      <BigHead cx={1080} cy={430} r={230} sil />
    </Wrap>
  );
};

// SCALE-TERROR — tiny hero dwarfed by a huge looming threat
const ThumbScaleTerror: React.FC = () => {
  const kw = Math.min(150, Math.floor(560 / Math.max(KEYWORD.length, 1)));  // fit pill in the left column (clear of silhouette)
  const cap = (KICKER + ' ' + L1).trim();
  const capFs = Math.min(56, Math.floor(1120 / Math.max(cap.length, 1)));   // caption fits above the pill on one line
  return (
    <Wrap burstX={940} sun={false}>
      <g opacity={0.92} filter="url(#heroPop)"><circle cx={940} cy={300} r={260} fill={INK} /><path d="M 690 560 Q 940 470 1190 560 L 1260 1090 L 620 1090 Z" fill={INK} /></g>
      <Hero x={300} y={706} scale={1.7} facing={1} expr={face('hollow')} pose={A.lookUp(0)} />
      <Punch x={70} y={120} fs={capFs}>{cap}</Punch>
      <KeyPill x={78} y={130 + capFs + kw} fs={kw} label={KEYWORD} angle={-4} maxW={600} />
    </Wrap>
  );
};

// REDACTED — withheld element (rough black box + red ?)
const ThumbRedacted: React.FC = () => (
  <Wrap burstX={1050}>
    <Hero x={1055} y={724} scale={4.3} facing={-1} expr={face('cold')} />
    <g filter="url(#rough)" transform="rotate(-3 340 430)">
      <rect x={120} y={300} width={450} height={270} rx={12} fill={INK} stroke="#fff" strokeWidth={6} />
      <text x={345} y={505} textAnchor="middle" fontFamily={SANS} fontSize={220} fontWeight={900} fill={M.accent} stroke="#000" strokeWidth={8} paintOrder="stroke">?</text>
    </g>
    <Punch x={120} y={650} fs={Math.min(120, Math.floor(900 / Math.max(KEYWORD.length, 1)))} fill={M.accent} st="#111">{KEYWORD}</Punch>
  </Wrap>
);

// EYELINE — gaze + arrow at a partly-shown mystery
const ThumbEyeline: React.FC = () => (
  <Wrap burstX={360}>
    <Hero x={345} y={724} scale={4.1} facing={1} expr={face('worried')} pose={A.lookUp(0)} />
    <g filter="url(#rough)"><rect x={1090} y={300} width={280} height={440} rx={16} fill={INK} stroke="#fff" strokeWidth={7} /><text x={1190} y={585} textAnchor="middle" fontFamily={SANS} fontSize={240} fontWeight={900} fill={M.accent} stroke="#000" strokeWidth={9} paintOrder="stroke">?</text></g>
    <Arrow d="M 560 360 Q 830 280 1075 430" heads="M 1075 430 L 1032 414 M 1075 430 L 1050 464" />
    <Punch x={70} y={680} fs={Math.min(112, Math.floor(940 / Math.max(KEYWORD.length, 1)))} fill={M.accent} st="#111">{KEYWORD}</Punch>
  </Wrap>
);

// LADDER — the "every level" promise: rising steps, tiny climber -> big apex hero
const ThumbLadder: React.FC = () => {
  const baseY = 694, sw = 150, sh = 80;
  const steps = [0, 1, 2, 3].map((i) => ({x: 540 + i * sw, top: baseY - (i + 1) * sh}));
  // L1 is auto-sized (short words hit the 140 cap), so a FIXED pill y collides with tall text —
  // "REGIME" (6 chars -> fs 140) had the pill clipping the letters. Derive the pill's y from the
  // actual L1 size: text baseline + its outline stroke + a gap + the pill's own box above its y.
  const fs1 = Math.min(140, Math.floor(900 / Math.max(L1.length, 1)));
  const pillFs = 72;
  const pillY = 270 + fs1 * 0.09 + 26 + pillFs * 1.36 * 0.8;
  return (
    <Wrap burstX={steps[3].x} sun={false}>
      {steps.map((s, i) => <rect key={i} x={s.x} y={s.top} width={sw} height={baseY - s.top} fill={INK} opacity={0.17} stroke={INK} strokeWidth={5} />)}
      <Hero x={470} y={baseY} scale={1.2} facing={1} expr={FACES.earnest} />
      <Hero x={steps[3].x + sw / 2} y={steps[3].top} scale={1.8} facing={-1} expr={face('smug')} />
      <Punch x={64} y={150} fs={54}>{KICKER}</Punch>
      <Punch x={62} y={270} fs={fs1}>{L1}</Punch>
      {BIG ? <KeyPill x={72} y={pillY} fs={pillFs} label={BIG} angle={-4} /> : null}
    </Wrap>
  );
};

// BEFORE/AFTER — dim "nobody" vs blazing apex
const ThumbBefore: React.FC = () => (
  <Wrap burstX={968} sun={false}>
    <line x1={640} y1={150} x2={640} y2={720} stroke={INK} strokeWidth={6} opacity={0.22} />
    <g opacity={0.5}><StickFigure pose={A.stand(0)} x={320} y={716} scale={2.8} facing={1} view="front" expr={FACES.earnest} pal={SIL} rough frame={0} /></g>
    <Punch x={320} y={180} fs={Math.min(92, Math.floor(640 / Math.max(BEFORE.length, 1)))} anchor="middle" fill="#6f6f6f">{BEFORE}</Punch>
    <Hero x={968} y={716} scale={3.0} facing={-1} expr={face('smug')} />
    <Punch x={968} y={180} fs={Math.min(104, Math.floor(760 / Math.max(AFTER.length, 1)))} anchor="middle" fill={M.accent} st="#111">{AFTER}</Punch>
    <Arrow d="M 470 250 Q 640 160 800 235" heads="M 800 235 L 758 218 M 800 235 L 776 272" />
  </Wrap>
);

// SETTING — the topic's own scene, darkened, under a bold reversed title
const ThumbSetting: React.FC = () => {
  const Art = TEMPLATES[SETTING] || TEMPLATES['desk'];
  const big = Math.min(120, Math.floor(1120 / (Math.max(L1.length, L2.length, 1) * 0.62)));
  return (
    <AbsoluteFill style={{backgroundColor: M.rim}}>
      <AbsoluteFill style={{filter: 'saturate(1.2) contrast(1.1) brightness(0.9)'}}>{Art ? <Art /> : null}</AbsoluteFill>
      <svg viewBox="0 0 1280 720" width="100%" height="100%"><Defs />
        <rect x={0} y={0} width={1280} height={720} fill="url(#vig)" />
        <Punch x={60} y={140} fs={big}>{L1}</Punch>
        {L2 ? <Punch x={60} y={140 + big} fs={big}>{L2}</Punch> : null}
        {TAG ? <KeyPill x={70} y={650} fs={66} label={TAG} angle={-5} /> : null}
      </svg>
    </AbsoluteFill>
  );
};

// CLIMB (legacy, rare) — reuse ladder look
const ThumbClimb: React.FC = ThumbLadder;

const ARCHES: Record<string, React.FC> = {pov: ThumbPov, scaleterror: ThumbScaleTerror, redacted: ThumbRedacted, eyeline: ThumbEyeline, ladder: ThumbLadder, beforeafter: ThumbBefore, number: ThumbNumber, face: ThumbFace, setting: ThumbSetting, question: ThumbQuestion, climb: ThumbClimb};
const ORDER = ['pov', 'scaleterror', 'number', 'redacted', 'ladder', 'eyeline', 'beforeafter', 'question', 'scaleterror', 'pov', 'redacted', 'face', 'eyeline', 'number', 'setting', 'ladder'];

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

export const ThumbAll: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#111', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridAutoRows: '1fr', gap: 6}}>
    {Object.keys(ARCHES).map((k) => <div key={k} style={{position: 'relative', border: '2px solid #333'}}>{React.createElement(ARCHES[k])}<div style={{position: 'absolute', top: 4, left: 6, background: 'rgba(0,0,0,0.7)', color: '#fff', font: '700 20px monospace', padding: '2px 6px'}}>{k}</div></div>)}
  </AbsoluteFill>
);
