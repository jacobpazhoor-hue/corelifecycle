import React from 'react';
import {AbsoluteFill} from 'remotion';
import {StickFigure, DIM, SEG, Expr, Pose, Costume, episodeCostume} from './figure';
import * as A from './actions';
import {TEMPLATES} from './scenes';
import {BuildingBand, CrowdHeads, CrowdRow, SlabFloor} from './setdressing';
import {INK, PAPER_WHITE, STROKE, STROKE_THIN, shade} from './crayonStyle';
import {THUMB_FONT, THUMB_WEIGHT} from './thumbFont';
import meta from './episode_meta.json';

// ============================================================================
// THUMBNAIL ENGINE v3 (WO-11) — rebuilt to the MEASURED reference spec, CRAYON_BIBLE §9 + §6.5.
//
// The v2 engine ("directed bright": white paper, radial mood blooms, glowing doodle hero, siren
// pills, danger tape) was a generic high-CTR look invented before the reference channel was
// measured. It is gone. What replaced it is what the seven reference thumbnails in
// docs/research/crayon/*/thumb.png actually do, and nothing else:
//
//   1. ONE hero character in FULL COLOUR, centre or right, cropped as a BUST — head and shoulders,
//      legs off the bottom edge. The head is the biggest thing in frame after the type.
//   2. A DESATURATED GREY crowd or environment behind it. Grey people carry the SAME pure-black
//      outline as the hero (figure.tsx's DIM); only their fills are drained.
//   3. A SINGLE saturated accent — the red crash line, or the amber bar. Never two.
//   4. Two text treatments, both a heavy GEOMETRIC sans in ALL CAPS:
//        (a) a solid amber band across the top carrying black caps   -> BandTitle
//        (b) white caps with a heavy black outline, top-positioned   -> Outline / TitleBlock
//      Thumbnail text is the ONE place the channel does not use the handwritten face, so nothing
//      here touches Caveat/crayonStyle's typography tokens.
//   5. Faces PUSHED HARD: open mouths with visible teeth and tongue, gritted teeth, worry lines,
//      "!!" / "??" / "?!" marks, stress squiggles. Emotion is the #1 CTR lever and there are no
//      real faces to carry it.
//
// MEASURED TOKENS (sampled off the reference PNGs, not eyeballed):
//   amber band  #fdb719   (43% of the band area in HawmGu7oNrc)
//   crash red   #cb0000   (the Great Depression line, the single largest saturated region)
//   crowd fill  ~#b4b4b4  (figure.tsx's CROWD_FILL #c9c4bb is the shared token and matches)
//   grey field  #373737 / #575757 / #232323 across four of the seven references
//   type        cap height 51px @1280 in the amber band; 105px @1280 for the ROCKEFELLER wordmark.
//               WO-21 re-measured that wordmark properly: 1119px of ink over a 105px cap is
//               width/cap 10.66 with 26-27px stems (stem/cap 0.252), which is Montserrat's
//               proportion, not a grotesque's — see src/thumbFont.ts for the full candidate table
//               and why Montserrat ExtraBold is now vendored and set here.
//
// Everything is authored on a 1920x1080 viewBox, the same space as scenes.tsx/stage.tsx/
// setdressing.tsx, so the shared set-dressing library and the episode's own scene art drop straight
// in and the thumbnail matches the video's look. The Thumbnail composition is 1280x720; the SVG
// scales.
//
// Thumbnails are STILLS (one frame), so every figure is drawn at frame 0 and nothing animates.
// ============================================================================

/**
 * The reference's thumbnail face: a heavy GEOMETRIC sans in caps. WO-11 had no such face vendored
 * and used the system `Arial Black` — a grotesque, close in weight but a different letterform
 * skeleton (tighter apertures, a different R/G/S/C), which at thumbnail size reads as a different
 * brand. WO-21 vendored Montserrat ExtraBold (SIL OFL) and this is now it.
 *
 * DELIBERATELY NO FALLBACK CHAIN. `'Montserrat', sans-serif` would let a missing woff2 ship a
 * thumbnail in the system sans silently; thumbFont.ts cancelRender()s instead, so by the time a
 * frame is drawn this family is loaded or there is no frame.
 */
const SANS = THUMB_FONT;

/** The amber bar (treatment a). Measured #fdb719. */
const AMBER = '#fdb719';
/**
 * The crash red. Measured #cb0000. Deliberately CONSTANT and never keyed to the mood: the red line
 * against a drained frame IS the device, and letting it drift with the palette (a green "crash"
 * line in `money` mood) throws the signal away. Same reason the v2 engine pinned its arrow red.
 */
const RED = '#cb0000';

// ---------------------------------------------------------------------------
// Mood -> environment
// ---------------------------------------------------------------------------

/**
 * A mood is TWO colours now, not eight: the desaturated field the frame is built out of, and the
 * one saturated note an archetype is allowed where it is not already spending it on RED or AMBER.
 * Every other tone in a frame is a `shade()` rung off `field`, so a thumbnail lands on the same
 * restricted flat palette as the video (crayonStyle's tone ladder) instead of its own gradient set.
 *
 * The eight NAMES are unchanged from v2 on purpose: `thumb.mood` values already written into
 * ops/episode_meta.json and into docs/AUTOPILOT_PROMPT.txt keep resolving.
 */
type Mood = {field: string; accent: string};
const MOODS: Record<string, Mood> = {
  danger:   {field: '#4a4f55', accent: '#e0a13c'},  // cool institutional grey — the default
  crime:    {field: '#3f3a44', accent: '#a8446f'},
  epic:     {field: '#4e453a', accent: '#e0a13c'},
  tactical: {field: '#4a4a42', accent: '#d4af37'},
  electric: {field: '#3a444f', accent: '#2ec4d6'},
  money:    {field: '#454a42', accent: '#e8b54b'},
  royal:    {field: '#413c4c', accent: '#c9a227'},
  survival: {field: '#3f4a4c', accent: '#e8541f'},
};
// topic -> mood hints (first match wins). Unchanged from v2 — these route topics correctly and the
// only thing that changed underneath is what a mood RESOLVES to.
const MOOD_HINTS: Array<[RegExp, string]> = [
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

/** The flat tone ladder a frame is built from — every rung derived from the mood's own field. */
type Env = {field: string; far: string; back: string; floor: string; deep: string; accent: string};
const E: Env = {
  field: M.field,
  far: shade(M.field, 2),     // distant structures, lifted toward the sky
  back: shade(M.field, 1),    // second plane
  floor: shade(M.field, -1),  // ground, one rung under what stands on it
  deep: shade(M.field, -2),   // recesses, ceiling, window blocks
  accent: M.accent,
};

// The episode's wardrobe comes from figure.tsx, which already owns the topic->costume table and is
// what the VIDEO uses. v2 kept a second copy of that table here, so a topic could in principle
// dress the hero differently in the thumbnail than in the episode.
const COSTUME: Costume = episodeCostume();

// ---------------------------------------------------------------------------
// Copy
// ---------------------------------------------------------------------------

const t = (meta as any).thumb || {};
const KICKER: string = (t.kicker || '').toUpperCase();
const L1: string = (t.line1 || '').toUpperCase();
const L2: string = (t.line2 || '').toUpperCase();
const TAG: string = (t.tag || '').toUpperCase();
const BIG: string = (t.big || (TAG.includes('→') ? TAG.split('→').pop()!.trim() : TAG)).toUpperCase();
const QUESTION: string = (t.question || 'WHO PAID FOR IT?').toUpperCase();
const SETTING: string = t.setting || '';
const KEYWORD: string = (t.keyword || L1 || 'THE BOSS').toUpperCase();
const BEFORE: string = (t.before || 'BEFORE').toUpperCase();
const AFTER: string = (t.after || KEYWORD).toUpperCase();
/** The headline every archetype falls back to when it needs one line of type. */
const HEAD: string = [L1, L2].filter(Boolean).join(' ') || KICKER || KEYWORD;

// ---------------------------------------------------------------------------
// Type
// ---------------------------------------------------------------------------

/**
 * SVG's textAnchor is a closed set. v2 typed this prop as `string` and passed it straight through,
 * which was the repo's only tsc error (thumbs.tsx(168,21)); the fix is the real union, not a cast.
 */
type Anchor = 'inherit' | 'middle' | 'start' | 'end';

/**
 * Advance width per character, in em, for the face this file sets.
 *
 * These are the VENDORED FACE'S OWN NUMBERS, not a class heuristic. WO-11's table was five buckets
 * calibrated for Arial Black (cap 0.743em, space 0.30em); Montserrat is a different face with a
 * different width model, and a bucket is a bad model of it in any case — its caps run from I at
 * 0.339em to W at 1.184em, so ONE flat cap width is up to 58% wrong on a single letter. "THE WOLF
 * OF WALL STREET" is 3 W's; that error does not average out.
 *
 * Read straight off `public/fonts/montserrat-latin-800-normal.woff2` and cross-checked against the
 * browser that actually renders it: a canvas `measureText` probe at 1000px inside the real Remotion
 * render agreed to 4 decimal places on all 13 characters spot-checked (I .339, W 1.184, M .954,
 * space .291, 0 .685, $ .647, . .283, ? .597, ' .242, - .388, J .557, L .610, 1 .405).
 *
 * KERNING is not modelled — this sums bare advances, and the browser then kerns. Measured on the
 * strings this file sets, kerning only ever takes width AWAY (0 to -0.94%: "NBA PLAYER" 6.890 ->
 * 6.825, "SUPERMAX" 6.059 -> 6.011, "ROCKEFELLER" 7.686 -> 7.686). So the estimate is high by under
 * 1%, i.e. type under-fills its box by under 1% and can never overflow it on that account.
 *
 * Every overflow bug in this file's history came from sizing text without measuring it against the
 * box it has to live in, so the arithmetic lives in exactly one place.
 */
const EM: Record<string, number> = {
  A: 0.786, B: 0.769, C: 0.730, D: 0.826, E: 0.672, F: 0.642, G: 0.770, H: 0.806, I: 0.339,
  J: 0.557, K: 0.752, L: 0.610, M: 0.954, N: 0.806, O: 0.846, P: 0.737, Q: 0.846, R: 0.740,
  S: 0.647, T: 0.635, U: 0.786, V: 0.766, W: 1.184, X: 0.737, Y: 0.693, Z: 0.679,
  '0': 0.685, '1': 0.405, '2': 0.599, '3': 0.603, '4': 0.700, '5': 0.607, '6': 0.649, '7': 0.632,
  '8': 0.669, '9': 0.649,
  ' ': 0.291, '!': 0.301, '"': 0.462, '#': 0.730, '$': 0.647, '%': 0.897, '&': 0.752, "'": 0.242,
  '(': 0.369, ')': 0.369, '*': 0.453, '+': 0.609, ',': 0.283, '-': 0.388, '.': 0.283, '/': 0.415,
  ':': 0.283, ';': 0.283, '<': 0.609, '=': 0.609, '>': 0.609, '?': 0.597, '@': 1.036,
  '[': 0.389, ']': 0.389, '_': 0.500, '|': 0.314,
};
/**
 * A character the table does not name is by definition one nobody planned for, so it is charged the
 * face's WIDEST glyph (W). That can only make the fitted size too small, never too large — the safe
 * direction, and a visibly short line is a defect you can see, where an overflow runs off the frame.
 * It is not a fallback for a MISSING character: `advance()` throws for anything the vendored subset
 * cannot set at all, before it ever gets here.
 */
const EM_UNKNOWN = 1.184;

/**
 * The unicode ranges the vendored woff2 covers — the `latin` subset, copied from
 * @fontsource/montserrat@5.3.0's unicode.json. Everything this file sets is uppercased ASCII in
 * practice, but `thumb.tag` is documented to accept "TIRO → CAESAR" style copy, and U+2192 is NOT
 * in this subset: under Arial Black that arrow drew, under a latin-subset webfont it is a tofu box
 * shipped to the feed. So it HALTS instead, the same way `thumb.setting`/`thumb.prop` halt on a name
 * they cannot honour.
 */
const VENDORED_RANGES: Array<[number, number]> = [
  [0x0000, 0x00ff], [0x0131, 0x0131], [0x0152, 0x0153], [0x02bb, 0x02bc], [0x02c6, 0x02c6],
  [0x02da, 0x02da], [0x02dc, 0x02dc], [0x0304, 0x0304], [0x0308, 0x0308], [0x0329, 0x0329],
  [0x2000, 0x206f], [0x20ac, 0x20ac], [0x2122, 0x2122], [0x2191, 0x2191], [0x2193, 0x2193],
  [0x2212, 0x2212], [0x2215, 0x2215], [0xfeff, 0xfeff], [0xfffd, 0xfffd],
];
const covered = (c: string): boolean => {
  const cp = c.codePointAt(0)!;
  return VENDORED_RANGES.some(([lo, hi]) => cp >= lo && cp <= hi);
};

const advance = (text: string): number => {
  let w = 0;
  for (const c of text) {
    if (!covered(c)) {
      throw new Error(
        `Thumbnail copy contains "${c}" (U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}) ` +
        `in "${text}", which the vendored ${THUMB_FONT} latin subset cannot set — it would render as ` +
        `a tofu box. Rewrite the copy in latin-1 characters (for an arrow, "->" sets fine).`,
      );
    }
    w += EM[c] ?? EM_UNKNOWN;
  }
  // Floor of one widest glyph so an empty string cannot divide fitFs() by zero.
  return Math.max(w, EM_UNKNOWN);
};
const fitFs = (text: string, maxW: number, cap: number) =>
  Math.max(40, Math.min(cap, Math.floor(maxW / advance(text))));
const textW = (text: string, fs: number) => advance(text) * fs;
/** Montserrat's caps are 0.700em tall (measured: `measureText('H').actualBoundingBoxAscent` at
 *  1000px = 700.0); a baseline this far below a box's centre centres them in it. Arial Black's were
 *  0.716em, so the old 0.358 now sits caps ~1% of the size low in the amber band. */
const CAP_MID = 0.350;

/** Greedy wrap to at most `max` characters a line, so a long line fits its column at a usable size. */
const wrap = (text: string, max: number): string[] => {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/).filter(Boolean)) {
    if (cur && (cur + ' ' + w).length > max) { out.push(cur); cur = w; } else cur = cur ? cur + ' ' + w : w;
  }
  if (cur) out.push(cur);
  return out;
};

/** Treatment (b): white caps with a heavy black outline. Legible over art, crowd or sky. */
const Outline: React.FC<{
  x: number; y: number; fs: number; children: React.ReactNode;
  anchor?: Anchor; fill?: string; sw?: number;
}> = ({x, y, fs, children, anchor = 'start', fill = PAPER_WHITE, sw}) => (
  <text x={x} y={y} textAnchor={anchor} fontFamily={SANS} fontSize={fs} fontWeight={THUMB_WEIGHT}
    fill={fill} stroke={INK} strokeWidth={sw ?? fs * 0.11} paintOrder="stroke" strokeLinejoin="round">
    {children}
  </text>
);

/**
 * `thumb.kicker` — the small line that sets the headline up ("158 YEARS OLD" over "DEAD IN A
 * WEEKEND"). It carries the hook's number, so losing it costs the thumbnail its whole setup.
 *
 * It USED to be lost: `HEAD` takes the kicker only as a THIRD fallback (`line1 line2 || kicker ||
 * keyword`), so on every episode that fills `line1` — i.e. every normal one — the kicker was read
 * out of `episode_meta.json`, uppercased, and then referenced by exactly one of the nine archetypes.
 * Eight silently dropped it. It is now drawn by the two shared type components, which between them
 * cover seven of the nine, and `Thumbnail` REFUSES to render on the other two rather than dropping
 * it again (see KICKERLESS_ARCHES).
 *
 * Set at ~0.42 of the headline and placed UNDER the block rather than over it: at `crash`'s cap of
 * 140 the headline's own caps already reach y=50 from a baseline of 150, and a kicker above that
 * would be clipped off the top edge.
 */
const KICKER_FRAC = 0.42;
const Kicker: React.FC<{
  x: number; baseline: number; maxW: number; cap: number; anchor?: Anchor;
  /** The headline this kicker sits under, so an episode whose HEAD *is* the kicker (no `line1`,
   *  no `line2` — `HEAD`'s own second fallback) does not set the same words twice. */
  over: string;
}> = ({x, baseline, maxW, cap, anchor = 'start', over}) => {
  if (!KICKER || KICKER === over) return null;
  const fs = fitFs(KICKER, maxW, Math.round(cap * KICKER_FRAC));
  // Drop = the kicker's own cap height (0.700em in Montserrat, was 0.716 in Arial Black) plus a
  // little, plus a clear gap of 0.30 of the HEADLINE's size. Its own height alone put its caps 3px
  // under the headline's baseline and the two blocks touched.
  const drop = Math.round(fs * 0.76 + cap * 0.30);
  return <Outline x={x} y={baseline + drop} fs={fs} anchor={anchor}>{KICKER}</Outline>;
};

/** A wrapped, auto-fitted block of treatment-(b) type. Returns its own bottom edge via `onBottom`. */
const TitleBlock: React.FC<{
  text: string; x: number; y: number; maxW: number; cap?: number; anchor?: Anchor; perLine?: number;
  hot?: number;   // index of a line drawn in the mood accent instead of white
}> = ({text, x, y, maxW, cap = 150, anchor = 'start', perLine = 15, hot = -1}) => {
  const lines = wrap(text, perLine);
  const longest = lines.reduce((a, b) => (advance(a) >= advance(b) ? a : b), '');
  const fs = fitFs(longest, maxW, cap);
  const lh = Math.round(fs * 1.06);
  return (
    <g>
      {lines.map((ln, i) => (
        <Outline key={i} x={x} y={y + i * lh} fs={fs} anchor={anchor} fill={i === hot ? E.accent : PAPER_WHITE}>
          {ln}
        </Outline>
      ))}
      <Kicker x={x} baseline={y + (lines.length - 1) * lh} maxW={maxW} cap={fs} anchor={anchor} over={text} />
    </g>
  );
};

/**
 * Treatment (a): the amber band. MEASURED off HawmGu7oNrc at 1280 and scaled x1.5 — the bar spans
 * x 72..1199 and y 73..202 with a ~3px black border and its caps centred in it, which is the
 * geometry below.
 */
const BAND = {x: 108, y: 110, w: 1692, h: 194};
const BandTitle: React.FC<{text: string}> = ({text}) => {
  const fs = fitFs(text, BAND.w - 130, 132);
  return (
    <g>
      <rect x={BAND.x} y={BAND.y} width={BAND.w} height={BAND.h} fill={AMBER} stroke={INK} strokeWidth={STROKE} />
      <text x={BAND.x + BAND.w / 2} y={BAND.y + BAND.h / 2 + fs * CAP_MID} textAnchor="middle"
        fontFamily={SANS} fontSize={fs} fontWeight={THUMB_WEIGHT} fill={INK}>{text}</text>
      {/* the kicker sits on the art just under the bar — there is nothing above it but frame edge */}
      <Kicker x={BAND.x + BAND.w / 2} baseline={BAND.y + BAND.h} maxW={BAND.w - 130} cap={fs}
        anchor="middle" over={text} />
    </g>
  );
};

// ---------------------------------------------------------------------------
// The pushed face
// ---------------------------------------------------------------------------

/**
 * figure.tsx's shared Face() is deliberately subtle — dot eyes, a small mouth line — because it has
 * to hold up across a whole episode. A thumbnail needs the opposite, and the reference agrees: every
 * one of the seven hero faces is pushed past anything that appears in the video. So the hero is
 * drawn with `showFace={false}` and this overlay lands on its head instead. Nothing in figure.tsx
 * changes.
 */
type Push = 'panic' | 'shock' | 'angry' | 'smug' | 'grim' | 'worried';

/** thumb.expr still names a FACES key; this maps the ones that make sense onto a pushed treatment. */
const PUSH_BY_EXPR: Record<string, Push> = {
  shock: 'shock', awe: 'shock',
  worried: 'worried', conflicted: 'worried', earnest: 'worried',
  exhausted: 'grim', tired: 'grim', hollow: 'grim', cold: 'grim', neutral: 'grim',
  hardened: 'angry', focused: 'angry',
  smug: 'smug',
};
/** The archetype's own default wins only when the episode did not name an expression. */
const pushFor = (fallback: Push): Push => PUSH_BY_EXPR[t.expr as string] ?? fallback;

// figure.tsx's drawn-head multipliers. They are module-private there, so they are restated (not
// re-derived) here; the overlay has to land on the head the rig actually draws.
const HEAD_HW = 1.13, HEAD_HH = 1.23;
const D2R = Math.PI / 180;
type HeadBox = {cx: number; cy: number; hw: number; hh: number};
/** Where StickFigure will draw the head, for a figure placed at (x, hipY) — x/y are the HIP. */
const headBox = (x: number, hipY: number, scale: number, facing: number, p: Pose): HeadBox => {
  const shX = Math.sin(p.spineLean * D2R) * SEG.spine * facing;
  const shY = -p.bob - Math.cos(p.spineLean * D2R) * SEG.spine;
  const a = (p.spineLean + p.headTilt) * D2R;
  return {
    cx: x + scale * (shX + Math.sin(a) * (SEG.neck + SEG.head) * facing),
    cy: hipY + scale * (shY - Math.cos(a) * (SEG.neck + SEG.head)),
    hw: scale * SEG.head * HEAD_HW,
    hh: scale * SEG.head * HEAD_HH,
  };
};

/** Inner-brow tilt per mood: >0 raises the inner end (worry), <0 drops it (anger). */
const BROW_TILT: Record<Push, number> = {panic: 0.95, shock: 0.75, worried: 0.85, angry: -1, smug: -0.7, grim: -0.15};
const MOUTH_RED = '#7a2f2f';
const TONGUE = '#b5544f';

const PushedFace: React.FC<{box: HeadBox; mood: Push; lw: number}> = ({box, mood, lw}) => {
  const {cx, cy, hw, hh} = box;
  const uid = `t${Math.round(cx)}_${Math.round(cy)}`;
  const eyeDX = hw * 0.31, eyeY = cy + hh * 0.05;
  const browY = eyeY - hh * 0.30, bw = hw * 0.28;
  const my = cy + hh * 0.45;
  const open = mood === 'panic' || mood === 'shock';
  const wideEye = open || mood === 'worried';
  const tilt = BROW_TILT[mood];

  const eyes = wideEye ? (
    [-1, 1].map((s) => (
      <g key={s}>
        <ellipse cx={cx + s * eyeDX} cy={eyeY} rx={hw * 0.16} ry={hh * 0.185}
          fill={PAPER_WHITE} stroke={INK} strokeWidth={lw * 0.6} />
        <circle cx={cx + s * eyeDX} cy={eyeY + hh * 0.03} r={hw * 0.062} fill={INK} />
      </g>
    ))
  ) : (
    [-1, 1].map((s) => <circle key={s} cx={cx + s * eyeDX} cy={eyeY} r={hw * 0.115} fill={INK} />)
  );

  // grim is the reference's "unimpressed" read (y51JjcymEAY): one brow flat, the other cocked.
  const brow = (s: number) => {
    const lift = mood === 'grim' && s > 0 ? hh * 0.11 : 0;
    // SVG y grows downward, so raising the inner end means SUBTRACTING: a positive tilt has to
    // lower the y of the inner end. Getting this backwards drew the reference's angry V as a
    // worried peak and vice versa — the two most-used faces in the set, both wrong.
    const dy = -tilt * hh * 0.075;
    const x0 = cx + s * eyeDX - s * bw, x1 = cx + s * eyeDX + s * bw;
    return (
      <line key={`b${s}`} x1={x0} y1={browY + dy - lift} x2={x1} y2={browY - dy - lift}
        stroke={INK} strokeWidth={lw * 1.25} strokeLinecap="round" />
    );
  };

  let mouth: React.ReactNode;
  if (open) {
    // The reference's panic mouth: a dark rounded cavity, a white upper-tooth strip with gaps, and
    // a tongue sitting in the bottom of it. This is the single biggest emotion cue in the frame.
    const mw = mood === 'shock' ? hw * 0.36 : hw * 0.46;
    const mh = mood === 'shock' ? hh * 0.26 : hh * 0.21;
    mouth = (
      <g>
        <defs><clipPath id={uid}><ellipse cx={cx} cy={my} rx={mw} ry={mh} /></clipPath></defs>
        <ellipse cx={cx} cy={my} rx={mw} ry={mh} fill={MOUTH_RED} stroke={INK} strokeWidth={lw} />
        <g clipPath={`url(#${uid})`}>
          <ellipse cx={cx} cy={my + mh * 0.92} rx={mw * 0.66} ry={mh * 0.62} fill={TONGUE} stroke={INK} strokeWidth={lw * 0.55} />
          <rect x={cx - mw * 0.62} y={my - mh * 1.06} width={mw * 1.24} height={mh * 0.62} fill={PAPER_WHITE} stroke={INK} strokeWidth={lw * 0.55} />
          <line x1={cx} y1={my - mh * 1.06} x2={cx} y2={my - mh * 0.44} stroke={INK} strokeWidth={lw * 0.45} />
        </g>
      </g>
    );
  } else if (mood === 'angry') {
    // gritted teeth (sMH8WchxQR8)
    const mw = hw * 0.52, mh = hh * 0.11;
    mouth = (
      <g>
        <rect x={cx - mw} y={my - mh} width={mw * 2} height={mh * 2} rx={mh * 0.5}
          fill={PAPER_WHITE} stroke={INK} strokeWidth={lw * 0.85} />
        <line x1={cx - mw} y1={my} x2={cx + mw} y2={my} stroke={INK} strokeWidth={lw * 0.6} />
        {[-0.6, -0.2, 0.2, 0.6].map((f) => (
          <line key={f} x1={cx + mw * f} y1={my - mh} x2={cx + mw * f} y2={my + mh} stroke={INK} strokeWidth={lw * 0.45} />
        ))}
      </g>
    );
  } else if (mood === 'smug') {
    mouth = <path d={`M ${cx - hw * 0.42} ${my - hh * 0.05} Q ${cx} ${my + hh * 0.22} ${cx + hw * 0.42} ${my - hh * 0.05}`}
      fill="none" stroke={INK} strokeWidth={lw * 1.35} strokeLinecap="round" />;
  } else if (mood === 'worried') {
    mouth = <path d={`M ${cx - hw * 0.30} ${my + hh * 0.05} Q ${cx} ${my - hh * 0.10} ${cx + hw * 0.30} ${my + hh * 0.05}`}
      fill="none" stroke={INK} strokeWidth={lw * 1.25} strokeLinecap="round" />;
  } else {
    mouth = <line x1={cx - hw * 0.26} y1={my} x2={cx + hw * 0.26} y2={my} stroke={INK} strokeWidth={lw * 1.25} strokeLinecap="round" />;
  }

  // Worry creases over the brow — present on every stressed face in the reference set.
  const creases = mood === 'panic' || mood === 'worried' || mood === 'angry' ? (
    [-1, 1].map((s) => (
      <path key={`c${s}`} d={`M ${cx + s * hw * 0.30} ${browY - hh * 0.20} q ${s * hw * 0.16} ${-hh * 0.06} ${s * hw * 0.30} ${hh * 0.01}`}
        fill="none" stroke={INK} strokeWidth={lw * 0.7} strokeLinecap="round" />
    ))
  ) : null;

  return <g>{eyes}{brow(-1)}{brow(1)}{creases}{mouth}</g>;
};

/** Floating "!!" / "??" / "?!" — the reference draws them white with a heavy black outline. */
const Marks: React.FC<{x: number; y: number; fs: number; text: string; angle?: number}> =
({x, y, fs, text, angle = 0}) => (
  <text x={x} y={y} textAnchor="middle" fontFamily={SANS} fontSize={fs} fontWeight={THUMB_WEIGHT}
    fill={PAPER_WHITE} stroke={INK} strokeWidth={fs * 0.14} paintOrder="stroke" strokeLinejoin="round"
    transform={angle ? `rotate(${angle} ${x} ${y})` : undefined}>{text}</text>
);

/** Stress squiggles rising off the head (LuEcoqizj0o, KE-WJevx-7c). */
const Squiggle: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => (
  <g stroke={PAPER_WHITE} strokeWidth={7 * s} fill="none" strokeLinecap="round">
    {[0, 1, 2].map((i) => (
      <path key={i} d={`M ${x - 26 * s} ${y - i * 30 * s} q ${13 * s} ${-16 * s} ${26 * s} 0 q ${13 * s} ${16 * s} ${26 * s} 0`} />
    ))}
  </g>
);

/** The single saturated accent, in its commonest reference form: a red market-crash polyline. */
const CrashLine: React.FC<{d: string; w?: number}> = ({d, w = 26}) => (
  <path d={d} fill="none" stroke={RED} strokeWidth={w} strokeLinejoin="round" strokeLinecap="round" />
);

// ---------------------------------------------------------------------------
// The hero bust
// ---------------------------------------------------------------------------

/**
 * Six of the seven references frame the hero as a BUST: the head is 25–45% of frame height and the
 * body runs off the bottom edge. That is what `hipY` past 1080 buys — the real rig, the real
 * costume, cropped the way the reference crops it.
 */
const Hero: React.FC<{
  x: number; hipY: number; scale: number; mood: Push; facing?: number; pose?: Pose; costume?: Costume;
  /** "!!" / "??" / "?!" — placed off the drawn head, never at a hand-guessed coordinate. */
  marks?: string;
  /** Which side of the head the marks and squiggle sit on. */
  markSide?: -1 | 1;
  squiggle?: boolean;
}> = ({x, hipY, scale, mood, facing = 1, pose, costume = COSTUME, marks, markSide = -1, squiggle}) => {
  const p = pose ?? A.stand(0);
  const box = headBox(x, hipY, scale, facing, p);
  return (
    <g>
      <StickFigure pose={p} x={x} y={hipY} scale={scale} facing={facing} view="front"
        showFace={false} costume={costume} frame={0} />
      <PushedFace box={box} mood={mood} lw={STROKE * scale} />
      {marks ? (
        <Marks x={box.cx + markSide * box.hw * 1.25} y={box.cy - box.hh * 1.15}
          fs={box.hh * 0.95} text={marks} angle={markSide * 8} />
      ) : null}
      {squiggle ? <Squiggle x={box.cx - markSide * box.hw * 1.35} y={box.cy - box.hh * 0.9} s={scale * 0.42} /> : null}
    </g>
  );
};

/**
 * Hands up beside the face — the reference's panic pose (KE-WJevx-7c, VSbO8vmZNm0). The shoulder
 * angle has to swing the upper arm nearly HORIZONTAL before the elbow lifts, or the forearm runs
 * diagonally across the face: figure.tsx draws the near arm after the head, and the character has no
 * neck, so an arm raised straight from the shoulder passes through the chin.
 */
const HANDS_UP: Pose = {
  ...A.stand(0),
  armNearShoulder: 95, armNearElbow: 80, armFarShoulder: 95, armFarElbow: 80,
};

// ---------------------------------------------------------------------------
// Environments (all desaturated, all built off the mood's tone ladder)
// ---------------------------------------------------------------------------

const Wrap: React.FC<{children: React.ReactNode}> = ({children}) => (
  <AbsoluteFill style={{backgroundColor: E.deep}}>
    <svg viewBox="0 0 1920 1080" width="100%" height="100%">{children}</svg>
  </AbsoluteFill>
);

/** Interior: a drained room with a dark ceiling — the Wolf of Wall Street backdrop. */
const GreyRoom: React.FC = () => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill={E.back} />
    <rect x={0} y={0} width={1920} height={330} fill={E.deep} />
    <line x1={0} y1={330} x2={1920} y2={330} stroke={INK} strokeWidth={STROKE} />
    {/* strip lights: the reference's ceiling carries two, and they stop the top band reading empty */}
    {/* Kept inside the amber band's own footprint (x 108..1800) so the `band` archetype hides them
        cleanly instead of leaving a shade poking out from behind the bar. */}
    {[350, 1570].map((lx) => (
      <g key={lx}>
        <path d={`M ${lx - 230} 250 L ${lx - 190} 206 L ${lx + 190} 206 L ${lx + 230} 250 Z`}
          fill={shade(E.far, 2)} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
        <rect x={lx - 190} y={196} width={380} height={16} fill={E.floor} stroke={INK} strokeWidth={STROKE_THIN} />
      </g>
    ))}
  </g>
);

/** Exterior: a drained street of low buildings under a flat sky. */
const GreyCity: React.FC<{horizon?: number}> = ({horizon = 700}) => (
  <g>
    <rect x={0} y={0} width={1920} height={1080} fill={E.far} />
    <BuildingBand baseY={horizon} x0={-80} x1={2000} n={6} seed={3} fill={E.back} depth={1} minH={300} maxH={520} />
    <BuildingBand baseY={horizon + 70} x0={-100} x1={2020} n={9} seed={11} fill={E.field} depth={0} minH={150} maxH={300} />
    <SlabFloor y={horizon + 70} fill={E.floor} rows={5} cols={9} bottom={1080} />
  </g>
);

/**
 * THE CROWD'S FACE.
 *
 * A thumbnail crowd figure is drawn at scale ~1.9, where its head is ~220 units across — big enough
 * that a blank head is not read as a head at all. `CrowdRow`'s episode-scale default of `showFace=false`
 * put a featureless rounded rect directly on top of a torso of almost exactly the same width (head
 * half-width R*1.13 against torso half-width R*1.02), so the two silhouettes fused and the row
 * rendered as a rank of headless pills — measured on the WO-13 `crash` thumbnail, where the head
 * occupies y 686..929 and carries nothing at all.
 *
 * The reference does the opposite: every grey figure in `LuEcoqizj0o/thumb.png` has eyes, brows and
 * a mouth, and the two nearest are visibly ANGRY — the crowd's mood is part of what the thumbnail
 * says. So the thumbnail crowd is drawn with faces, set to a flat scowl: brows down, mouth flat, no
 * blink (these are stills). It stays grey, uncostumed and smaller than the hero, so the colour-hero
 * focal device is untouched.
 */
const CROWD_EXPR: Expr = {brow: -0.55, browRaise: 0, lid: 0.18, mouth: 'flat', look: 0};

/**
 * The grey anonymous crowd (bible §6.5) — heads massed behind a row of full figures.
 *
 * The row scale is deliberately ~0.6x the hero's: measured on HawmGu7oNrc the hero's head is 215px
 * wide at 1280 and the nearest crowd heads are ~150px. At parity the crowd competes with the hero
 * for the eye, which is the exact opposite of what the device is for.
 */
const GreyCrowd: React.FC<{headY?: number; rowY?: number; scale?: number}> =
({headY = 880, rowY = 1240, scale = 1.9}) => (
  <g>
    <CrowdHeads y={headY} x0={-40} x1={1960} n={10} rows={2} r={62} seed={5} fill={E.field} />
    <CrowdRow y={rowY} x0={-60} x1={1980} n={8} scale={scale} seed={2} view="front" dz={34}
      showFace expr={CROWD_EXPR} />
  </g>
);

// ==================== ARCHETYPES ====================
// Every one names the reference frame it is built from. Nine, so the autopilot's
// no-repeat-in-the-last-3 rotation always has a wide choice.

/**
 * BAND — docs/research/crayon/HawmGu7oNrc/thumb.png ("THE WOLF OF WALL STREET").
 * The channel's signature: an amber bar of black caps over a colour hero standing in a packed grey
 * crowd. The bar is this frame's single saturated accent, so there is no red anywhere in it.
 */
const ThumbBand: React.FC = () => (
  <Wrap>
    <GreyRoom />
    <GreyCrowd headY={900} rowY={1250} scale={1.9} />
    <Hero x={960} hipY={1200} scale={3.2} mood={pushFor('grim')} />
    <BandTitle text={HEAD} />
  </Wrap>
);

/**
 * CRASH — docs/research/crayon/LuEcoqizj0o/thumb.png ("The Great Depression").
 * A red crash polyline straight across a drained street, a panicking colour hero on the right with
 * "!!" and stress squiggles, and a small grey protest group on the left.
 */
const ThumbCrash: React.FC = () => (
  <Wrap>
    <GreyCity horizon={640} />
    {/* the reference's protest group stands on the street with its heads and shoulders clear of the
        placard — hips at 1180 pushed the hem off the bottom edge and left three blank heads stacked
        on three torsos of the same width. Faces on (see CROWD_EXPR) and the row lifted so the whole
        figure is in frame. */}
    <CrowdRow y={1060} x0={110} x1={520} n={3} scale={1.75} seed={7} view="front" dz={26}
      showFace expr={CROWD_EXPR} />
    {TAG ? (
      <g transform="rotate(-4 470 620)">
        <rect x={280} y={545} width={384} height={150} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
        <rect x={452} y={695} width={26} height={230} fill={E.floor} stroke={INK} strokeWidth={STROKE_THIN} />
        {wrap(TAG, 11).slice(0, 2).map((ln, i) => (
          <text key={i} x={472} y={600 + i * 60} textAnchor="middle" fontFamily={SANS}
            fontSize={fitFs(ln, 320, 46)} fontWeight={THUMB_WEIGHT} fill={INK}>{ln}</text>
        ))}
      </g>
    ) : null}
    <CrashLine d="M -30 520 L 330 210 L 560 600 L 830 400 L 1090 780 L 1400 640 L 1960 1060" />
    <Hero x={1430} hipY={1290} scale={3.3} mood={pushFor('panic')} pose={HANDS_UP} marks="!!" squiggle />
    <TitleBlock text={HEAD} x={70} y={150} maxW={900} cap={140} perLine={13} />
  </Wrap>
);

/**
 * SETTING — docs/research/crayon/KE-WJevx-7c/thumb.png ("THE 2008 FINANCIAL CRISIS").
 * The episode's OWN scene art, desaturated to a grey environment, with the colour hero in front of
 * it. This is the archetype that ties the thumbnail to the actual video.
 *
 * `thumb.setting` names a real template. An unknown name is an ERROR, not a silent substitution —
 * a thumbnail that quietly shipped a desk when the script asked for a trading floor is exactly the
 * kind of mismatch that never gets caught. An ABSENT setting is a different thing: it is the
 * documented default, and gets the grey city.
 */
const ThumbSetting: React.FC = () => {
  if (SETTING && !TEMPLATES[SETTING]) {
    throw new Error(
      `thumb.setting "${SETTING}" is not a template in scenes.tsx TEMPLATES. Use a real template ` +
      `name (see docs/TEMPLATES.md) or leave thumb.setting empty for the default grey city.`
    );
  }
  const Art = SETTING ? TEMPLATES[SETTING] : null;
  return (
    <Wrap>
      {Art ? (
        <g>
          {/* The scene art is authored in full colour for the VIDEO. Drained here, then washed with
              the mood's own FIELD colour rather than with ink: the pack backdrops range from a bright
              cyan sky to a near-black arena, and a wash toward mid-grey pulls both ends to the same
              desaturated middle. An ink wash only worked on the bright ones and crushed the rest. */}
          <g style={{filter: 'saturate(0.14) brightness(1.15) contrast(0.92)'}}><Art /></g>
          <rect x={0} y={0} width={1920} height={1080} fill={E.field} opacity={0.46} />
        </g>
      ) : <GreyCity horizon={660} />}
      <CrashLine d="M 1240 300 L 1390 560 L 1500 360 L 1610 690 L 1740 520 L 1900 1000" w={22} />
      <Hero x={540} hipY={1310} scale={3.3} mood={pushFor('panic')} pose={HANDS_UP} marks="??" markSide={1} />
      <TitleBlock text={HEAD} x={960} y={140} maxW={1500} cap={150} anchor="middle" perLine={17} />
    </Wrap>
  );
};

/**
 * WORDMARK — docs/research/crayon/sMH8WchxQR8/thumb.png ("ROCKEFELLER") and
 * rSgS4wNLLDM ("amazon"). One enormous name across the top, the hero's head overlapping the letters
 * from below, and red lines webbing out of him to markers on the skyline.
 */
const ThumbWordmark: React.FC = () => {
  const word = (L1 || KEYWORD).replace(/\s+/g, ' ').trim();
  const fs = fitFs(word, 1780, 240);
  const nodes = [[110, 690], [330, 800], [560, 730], [1380, 760], [1620, 690], [1840, 790]];
  return (
    <Wrap>
      <rect x={0} y={0} width={1920} height={1080} fill={E.deep} />
      <BuildingBand baseY={1080} x0={-80} x1={2000} n={8} seed={17} fill={E.field} depth={0} minH={360} maxH={640} />
      <Outline x={960} y={250} fs={fs} anchor="middle" sw={fs * 0.06}>{word}</Outline>
      <g stroke={RED} strokeWidth={10} fill="none" strokeLinecap="round">
        {nodes.map(([nx, ny], i) => (
          <path key={i} d={`M 960 560 Q ${(960 + nx) / 2} ${ny - 520} ${nx} ${ny}`} />
        ))}
      </g>
      {nodes.map(([nx, ny], i) => <circle key={i} cx={nx} cy={ny} r={24} fill={RED} stroke={INK} strokeWidth={STROKE_THIN} />)}
      {/* the head deliberately climbs into the letters — the reference lets the hat cover their feet */}
      <Hero x={960} hipY={1130} scale={3.4} mood={pushFor('angry')} />
    </Wrap>
  );
};

/**
 * BEFOREAFTER — docs/research/crayon/y51JjcymEAY/thumb.png ("1950s | TODAY").
 * A hard black gutter down the middle: a fully drained past on the left, the same city carrying the
 * mood's saturated accent on the right, and one unimpressed hero straddling the seam.
 */
const ThumbBefore: React.FC = () => (
  <Wrap>
    <g clipPath="url(#halfL)">
      <defs><clipPath id="halfL"><rect x={0} y={0} width={960} height={1080} /></clipPath></defs>
      <rect x={0} y={0} width={960} height={1080} fill={shade(E.field, 2)} />
      <BuildingBand baseY={860} x0={-60} x1={1000} n={4} seed={21} fill={E.floor} depth={0} minH={260} maxH={430} />
      <SlabFloor y={860} fill={E.deep} rows={4} cols={6} bottom={1080} />
    </g>
    <g clipPath="url(#halfR)">
      <defs><clipPath id="halfR"><rect x={960} y={0} width={960} height={1080} /></clipPath></defs>
      <rect x={960} y={0} width={960} height={1080} fill={shade(E.accent, 2)} />
      <BuildingBand baseY={840} x0={940} x1={2000} n={4} seed={33} fill={E.accent} depth={0} minH={340} maxH={560} />
      <SlabFloor y={840} fill={shade(E.accent, -1)} rows={4} cols={6} bottom={1080} />
    </g>
    <line x1={960} y1={0} x2={960} y2={1080} stroke={INK} strokeWidth={14} />
    <Outline x={470} y={160} fs={fitFs(BEFORE, 780, 120)} anchor="middle">{BEFORE}</Outline>
    <Outline x={1450} y={160} fs={fitFs(AFTER, 780, 120)} anchor="middle">{AFTER}</Outline>
    <Hero x={960} hipY={1240} scale={3.4} mood={pushFor('grim')} />
  </Wrap>
);

// ---------------------------------------------------------------------------
// POSTER props — flat vector, keyed to the environment, one accent note each.
// ---------------------------------------------------------------------------
const Prop: Record<string, React.FC> = {
  // ROCKET — startup / launch / founder
  rocket: () => (
    <g>
      <path d="M 210 0 q 120 150 120 330 l 0 300 q -120 60 -240 0 l 0 -300 q 0 -180 120 -330 Z"
        fill={shade(E.far, 1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 210 0 q 76 96 102 216 q -102 -46 -204 0 q 26 -120 102 -216 Z"
        fill={E.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <circle cx={210} cy={330} r={62} fill={E.deep} stroke={INK} strokeWidth={STROKE} />
      <path d="M 90 400 q -96 96 -74 230 q 52 -44 74 -78 Z" fill={E.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 330 400 q 96 96 74 230 q -52 -44 -74 -78 Z" fill={E.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 108 630 q 102 44 204 0 l -18 66 q -84 30 -168 0 Z" fill={E.floor} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
    </g>
  ),
  // SKYSCRAPER — corporate / empire / mogul
  tower: () => (
    <g>
      <path d="M 60 700 L 60 120 q 0 -40 40 -40 l 240 0 q 40 0 40 40 l 0 580 Z"
        fill={shade(E.far, 1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 380 700 L 380 250 q 0 -32 34 -32 l 160 0 q 34 0 34 32 l 0 450 Z"
        fill={E.far} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      {Array.from({length: 6}, (_, r) => Array.from({length: 4}, (_, c) => (
        <rect key={`${r}-${c}`} x={92 + c * 66} y={160 + r * 82} width={42} height={54} fill={E.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      )))}
      {Array.from({length: 5}, (_, r) => Array.from({length: 2}, (_, c) => (
        <rect key={`t${r}-${c}`} x={418 + c * 74} y={290 + r * 76} width={46} height={50} fill={E.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      )))}
    </g>
  ),
  // VAULT — money / wealth
  vault: () => (
    <g>
      <rect x={40} y={40} width={600} height={470} rx={26} fill={shade(E.far, 1)} stroke={INK} strokeWidth={STROKE} />
      <rect x={92} y={92} width={496} height={366} rx={16} fill={E.far} stroke={INK} strokeWidth={STROKE} />
      <circle cx={340} cy={275} r={112} fill={E.accent} stroke={INK} strokeWidth={STROKE} />
      {[0, 45, 90, 135].map((a) => (
        <rect key={a} x={331} y={181} width={18} height={188} rx={9} fill={E.far} stroke={INK} strokeWidth={STROKE_THIN} transform={`rotate(${a} 340 275)`} />
      ))}
      <circle cx={340} cy={275} r={46} fill={E.far} stroke={INK} strokeWidth={STROKE} />
      <circle cx={340} cy={275} r={16} fill={INK} />
      {/* hinges — what stops a rounded rect with a wheel on it reading as a washing machine */}
      {[130, 400].map((hy) => <rect key={hy} x={16} y={hy} width={40} height={64} rx={8} fill={E.deep} stroke={INK} strokeWidth={STROKE_THIN} />)}
    </g>
  ),
};
function propFor(): React.FC {
  const explicit = (meta as any).thumb?.prop;
  if (explicit) {
    if (!Prop[explicit]) {
      throw new Error(`thumb.prop "${explicit}" is not a poster prop. Use one of: ${Object.keys(Prop).join(', ')}.`);
    }
    return Prop[explicit];
  }
  const s = ((meta as any).topic || '') + ' ' + ((meta as any).title || '');
  if (/startup|founder|unicorn|venture|launch|entrepreneur|\bipo\b/i.test(s)) return Prop.rocket;
  if (/billion|trillion|wealth|money|heir|lottery|fortune|bank|hedge|vault/i.test(s)) return Prop.vault;
  return Prop.tower;
}

/**
 * POSTER — docs/research/crayon/VSbO8vmZNm0/thumb.png ("The Enron Scandal").
 * A big tilted object owning the middle of a near-black frame, a red crash line falling through it,
 * the hero reacting on the right with "?!", and the title low-left. Kept in the rotation by the
 * 2026-08-04 owner direction, which demoted it from house style to one option among many.
 */
const ThumbPoster: React.FC = () => {
  const Art = propFor();
  return (
    <Wrap>
      <rect x={0} y={0} width={1920} height={1080} fill={E.deep} />
      <rect x={0} y={0} width={1920} height={1080} fill={E.field} opacity={0.35} />
      <CrashLine d="M -20 60 L 250 230 L 380 140 L 620 430 L 900 300 L 1180 700 L 1360 600 L 1560 1100" />
      <g transform="translate(400 170) rotate(-14) scale(0.95)"><Art /></g>
      <Hero x={1520} hipY={1270} scale={3.1} mood={pushFor('shock')} pose={HANDS_UP} facing={-1}
        marks="?!" markSide={1} />
      <TitleBlock text={HEAD} x={70} y={830} maxW={840} cap={130} perLine={13} />
    </Wrap>
  );
};

/**
 * NUMBER — the episode's one colossal figure. Not a single reference frame but the reference's own
 * device (rSgS4wNLLDM sets the amazon wordmark at this size): giant type owning the frame, the hero
 * small and reacting to it, everything behind it drained.
 */
const ThumbNumber: React.FC = () => {
  const fs = fitFs(BIG, 1100, 270);
  const bw = Math.min(1100, textW(BIG, fs));
  return (
    <Wrap>
      <GreyRoom />
      <GreyCrowd headY={1000} rowY={1330} scale={1.8} />
      {KICKER ? <Outline x={720} y={250} fs={fitFs(KICKER, 1120, 84)} anchor="middle">{KICKER}</Outline> : null}
      <Outline x={720} y={620} fs={fs} anchor="middle" sw={fs * 0.075}>{BIG}</Outline>
      <rect x={720 - bw / 2} y={672} width={bw} height={30} fill={RED} stroke={INK} strokeWidth={STROKE_THIN} />
      <Hero x={1590} hipY={1280} scale={2.7} mood={pushFor('shock')} facing={-1} marks="!!" markSide={1} />
    </Wrap>
  );
};

/**
 * QUESTION — the curiosity-gap layout, dressed to spec: the question in outlined white caps down the
 * left, a worried colour hero right with "??" over him, grey crowd behind both.
 */
const ThumbQuestion: React.FC = () => (
  <Wrap>
    <GreyRoom />
    <GreyCrowd headY={840} rowY={1190} scale={1.8} />
    <TitleBlock text={QUESTION} x={70} y={270} maxW={980} cap={150} perLine={12} hot={wrap(QUESTION, 12).length - 1} />
    <Hero x={1500} hipY={1270} scale={3.1} mood={pushFor('worried')} facing={-1} marks="??" squiggle />
  </Wrap>
);

/**
 * LADDER — the grey-crowd/colour-hero focal device made literal: anonymous grey figures stranded on
 * the lower steps, the colour hero big in the foreground at the top of the climb, under the amber
 * bar. The second amber-band layout, so treatment (a) is not tied to one composition.
 *
 * The hero is NOT drawn standing on the apex step. It was, and it cannot be: at a head size that
 * carries an expression (>=190 units of half-height) a figure whose hip sits on a fourth step is
 * always behind the band. A bust in the near plane reads as "the one who made it" just as well and
 * keeps the face.
 */
const ThumbLadder: React.FC = () => {
  const baseY = 1000, sw = 250, sh = 88;
  const steps = [0, 1, 2, 3].map((i) => ({x: 130 + i * sw, top: baseY - (i + 1) * sh}));
  const GS = 1.05;  // grey climber scale
  return (
    <Wrap>
      <rect x={0} y={0} width={1920} height={1080} fill={E.back} />
      <SlabFloor y={baseY} fill={E.floor} rows={3} cols={8} bottom={1080} />
      {steps.map((s, i) => (
        <rect key={i} x={s.x} y={s.top} width={sw} height={baseY - s.top}
          fill={i % 2 ? E.field : shade(E.field, 1)} stroke={INK} strokeWidth={STROKE} />
      ))}
      {/* StickFigure's y is the HIP; thigh+shin is 110 units, so a figure standing ON a surface has
          to be lifted by 110*scale or its feet punch through it. */}
      {/* Climbers on the lower three only: a figure on the apex step lands its head inside the amber
          bar at any scale that still reads as a person. The empty top step is the point anyway. */}
      {steps.slice(0, 3).map((s, i) => (
        <StickFigure key={i} pose={A.stand(0)} x={s.x + sw / 2} y={s.top - 110 * GS} scale={GS}
          facing={1} view="front" pal={DIM} showFace expr={CROWD_EXPR} frame={0} />
      ))}
      <Hero x={1460} hipY={1300} scale={3.0} mood={pushFor('smug')} facing={-1} />
      <BandTitle text={HEAD} />
    </Wrap>
  );
};

// ==================== DISPATCH ====================
//
// ROTATION CONTRACT (docs/AUTOPILOT_PROMPT.txt, owner direction 2026-08-04). The creative agent
// picks `thumb.archetype` and MUST NOT reuse one from the last 3 produced episodes. `pick()`
// therefore resolves an explicit archetype first, and falls back to a TOPIC HASH only when the
// episode did not name one — the fallback is deterministic, so the same topic always lands on the
// same layout, and a missing/renamed archetype is visible rather than random per render.
//
// The keys below are the list docs/AUTOPILOT_PROMPT.txt tells the agent to rotate through. If a key
// changes here, that file changes in the same commit or the rotation silently degrades to the hash.
const ARCHES: Record<string, React.FC> = {
  band: ThumbBand,
  crash: ThumbCrash,
  setting: ThumbSetting,
  wordmark: ThumbWordmark,
  beforeafter: ThumbBefore,
  poster: ThumbPoster,
  number: ThumbNumber,
  question: ThumbQuestion,
  ladder: ThumbLadder,
};
const ORDER = Object.keys(ARCHES);

/**
 * The two layouts with nowhere to put `thumb.kicker`. `wordmark` gives the whole top of the frame to
 * one enormous word with the hero's head climbing into it, and `beforeafter` fills both top corners
 * with its own pair of labels; a third line in either is not a layout tweak, it is a different
 * archetype. Every other layout draws the kicker through `TitleBlock`/`BandTitle`, and `number` has
 * always drawn its own.
 */
const KICKERLESS_ARCHES = new Set(['wordmark', 'beforeafter']);

function pickName(): string {
  if (t.archetype && ARCHES[t.archetype]) return t.archetype;
  const topic = (meta as any).topic || L1 || 'x';
  let h = 0; for (const c of topic) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  return ORDER[h % ORDER.length];
}

export const Thumbnail: React.FC = () => {
  const name = pickName();
  // Dropping copy the writer supplied is a silent content loss, and this one carries the hook's
  // number, so it HALTs the build the way a bad `thumb.prop` does rather than rendering short.
  if (KICKER && KICKERLESS_ARCHES.has(name)) {
    throw new Error(
      `thumb.kicker "${KICKER}" cannot be drawn by the "${name}" archetype — its layout has no ` +
      `kicker slot. Either clear thumb.kicker, or pick an archetype that carries one: ` +
      `${ORDER.filter((k) => !KICKERLESS_ARCHES.has(k)).join(', ')}.`
    );
  }
  const C = ARCHES[name];
  return <C />;
};

export const ThumbAll: React.FC = () => (
  <AbsoluteFill style={{backgroundColor: '#111', display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gridAutoRows: '1fr', gap: 6}}>
    {Object.keys(ARCHES).map((k) => <div key={k} style={{position: 'relative', border: '2px solid #333'}}>{React.createElement(ARCHES[k])}<div style={{position: 'absolute', top: 4, left: 6, background: 'rgba(0,0,0,0.7)', color: '#fff', font: '700 20px monospace', padding: '2px 6px'}}>{k}</div></div>)}
  </AbsoluteFill>
);
