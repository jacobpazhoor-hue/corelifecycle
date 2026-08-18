import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring, Easing} from 'remotion';
import {TEMPLATES} from './scenes';
import slice from './slice.json';
import {PhotoStage, Move} from './photoStage';
import {
  CRAYON_FONT, CRAYON_SUBTITLE_RATIO, CRAYON_TEXT_SLANT_DEG, INK, PAPER_WHITE,
  sceneColors, shade, strokeAt,
} from './crayonStyle';
import {CRAYON_TEXT_WEIGHT, LINE_HEIGHT, fitText, measureEm, useCrayonFace} from './crayonText';

// ============================================================================
// DIRECTION / ANIMATION ENGINE (vertical slice of the Quality Plan).
// A beat = several SHOTS (wide / medium / closeup / insert) cut together, so the
// video has real editing rhythm instead of one static framing per scene. Plus a
// motion-graphics money count-up (the channel's signature reveal). Self-contained
// composition ("Slice") — does NOT touch the nightly Video/timeline path.
// ============================================================================
const PAPER = '#ffffff';  // bright base (2026-07-20) — see Video2.tsx

// A recurring pipeline defect (6+ episodes): cost/loss overlays ("-$235K debt", "-1 KIA", "BURNED",
// "THE FARM IS SOLD", "MURDERED") rendered in the same GOLD as income/gain beats, flattening the
// moral-erosion contrast the story is built on. Detect a loss/cost beat from its own text so the
// renderer can switch to a red/amber accent without touching per-episode content.py.
const NEGATIVE_WORDS = /\b(DEBT|OWE|DRAWDOWN|KIA|BURNED?|MURDERED|KILLED|EVICTIONS?|CLEARED|SOLD|LOSS|LOST|FIRED|LAYOFFS?|BANKRUPT|DEAD|ARRESTED|INDICTED|SEIZED|FROZEN|DEFAULT(?:ED)?|CRASH(?:ED)?|DECIMATION)\b/i;
export const isNegativeOverlay = (big?: string | null, sub?: string | null): boolean => {
  const b = (big ?? '').trim();
  if (!b) return false;
  if (b.startsWith('-')) return true; // "-$235K", "-1 KIA"
  const money = splitMoney(b);
  if (money !== null && money.num < 0) return true; // "$-235,000" form
  return NEGATIVE_WORDS.test(`${b} ${sub ?? ''}`);
};

// Per-template FACE focus points (nx,ny in 0-1). Only templates with a clearly front-facing,
// locatable face are listed.
//
// THE EXPLAINER TEMPLATES (src/explainer.tsx) ARE DELIBERATELY ABSENT, and adding them is not a
// pending chore (WO-17, 2026-08-12). The owner's defect on the sample episode was "there's so many
// random zooms and stuff" — Video2's planner re-cropping one piece of artwork to manufacture cuts.
// A FOCUS entry does not fix that: it only aims the crop better. A closeup is still `scale(2.2)` on
// the SAME art under a locked camera, which is a zoom, not a cut. So Video2 now renders one framing
// per scene and never re-crops, and wiring FOCUS for the thirteen explainer templates would put the
// zoom back — this time on 31 of 39 scenes, since "has a face and runs long" is not a rare condition.
// The close-up survives as `closeUpPortrait`, a TEMPLATE whose subject is a face large in frame:
// cutting to it changes the artwork, so it is a real cut between set-ups, and the writer places it on
// the beat that earns it. Faces here still serve `panels` cells and the `Slice` composition below.
export const FOCUS: Record<string, [number, number]> = {
  hospitalRounds: [0.30, 0.66], consult: [0.39, 0.62], training: [0.33, 0.62],
  decoration: [0.50, 0.60], serverScale: [0.50, 0.60], victory: [0.50, 0.56],
  startupGrow: [0.30, 0.64], lectureHallScene: [0.51, 0.16],
  supervisor: [0.17, 0.66], atrium: [0.50, 0.78], warRoom: [0.51, 0.78], layoffs: [0.19, 0.78],
  boardroomHead: [0.50, 0.56], emptyChair: [0.29, 0.78], fileWall: [0.22, 0.74], podiumScene: [0.58, 0.78],
  countRoom: [0.28, 0.62], foundationScene: [0.32, 0.78],
};

// ============================================================================
// STAGING — WHERE THE PEOPLE ARE (WO-34). QA defects 1, 4 and 9.
//
// THE PROBLEM ALL THREE SHARE. `bubble.tsx`, the number note and `panels.tsx` all have to place
// something ON a frame whose contents they cannot see: the templates in `explainer.tsx` draw the
// figures, and every layer over them was positioned by a constant or by a writer typing coordinates
// into `content.py`. So the shipped episode put speech balloons over two men's heads with tails
// pointing into empty ceiling, dropped number cards on top of seated crowds, and cropped a wide
// composition down its own middle through a figure.
//
// None of that is visible to anything this project measures. Flat fill, camera lock and the colour
// work all PASSED on the frame where two men are decapitated by their own balloons. It took a
// frame-by-frame watch by eye to find, twice.
//
// THE FIX IS DATA, IN ONE PLACE. Each template publishes where its people's heads are — measured off
// that template's own figure call sites, in frame fractions — plus the props an overlay must not
// cover and the x a half-width crop should centre on. Everything else is derived:
//
//   * a balloon is placed in the free band ABOVE every head it would otherwise cross, in the lane of
//     frame nearest its own speaker, with a tail solved to point at that speaker's head (`bubble.tsx`
//     `planBalloons`), and a scene names its speaker by ROLE — a name checked against the room —
//     rather than by typing an x and a side;
//   * the number note's corner is the corner of the frame with the least of this in it (`noteCorner`),
//     and it shrinks rather than overlapping;
//   * a panel cell re-centres on `panelX` instead of taking the middle of the frame (`panels.tsx`).
//
// WHY THE NUMBERS LIVE HERE AND NOT IN `explainer.tsx`. Ideally a template would publish its own
// anchors through a context, next to the call site that draws the figure, so the two cannot drift.
// That is the right end state and it is written down as such in `docs/BIBLE.md` §8. It is NOT what
// this work order could build: `explainer.tsx` is owned by concurrent work, and a registry that at
// least EXISTS and RAISES on a name it does not know is a large step up from three layers each
// guessing separately. The staging is arithmetic on the figure rig, not taste — head centre is
// `(x + dx·scale, y + dy·scale)` for the pose's own spine/neck/head angles (see `figure.tsx` SEG), so
// it can be re-derived whenever a template moves someone.
// ============================================================================

/** A figure's head, in frame fractions: centre plus full size. The unit the whole mechanism runs on. */
export type HeadBox = {cx: number; cy: number; w: number; h: number};

/** A rectangle in frame fractions. */
export type Zone = {x0: number; y0: number; x1: number; y1: number};

export type Staging = {
  /**
   * The room's speaking parts, IN THE ORDER A CONVERSATION IN THIS ROOM RUNS — the visitor who asks
   * first, then the principal who answers. A scene that does not name its speakers gets them in this
   * order, alternating, which is what a two-hander is; a scene that does name them overrides it.
   */
  speakers: {role: string; head: HeadBox}[];
  /**
   * Everybody else's heads: crowd rows, seated banks, background figures. They cannot speak, but a
   * balloon must not cover them either — this list is what stopped both sofa men losing their heads
   * to one balloon that belonged to only one of them. A row at a single depth is given as ONE band
   * rather than one box per figure: it is conservative in the right direction (it blocks slightly
   * more than the figures do) and it does not go stale when a row's seeded jitter changes.
   */
  extraHeads: HeadBox[];
  /** Props an overlay card must not land on. Only ones a viewer would notice losing. */
  props?: Zone[];
  /**
   * Where a HALF-WIDTH framing of this room should centre, as a fraction of frame width.
   *
   * A `v2` panel cell is 16:19, not 16:9, so it can only show about half the composition. Taking the
   * middle half is what sliced a figure at the seam and cropped the chart's own y-axis off the left
   * edge (QA defect 9). This is the x that keeps the room's SUBJECT in the cell: the chart on
   * `chartBoard`, the hero at his desk on `officeFloor`, the couple on `domesticInterior`.
   */
  panelX: number;
};

/**
 * Measured off `explainer.tsx`'s figure call sites. Head centre = the figure's staged (x, y) plus the
 * pose's own head offset times its scale; head size = the drawn head box (`figure.tsx` HEAD_HW/HEAD_HH)
 * times the same scale. Rows carry their seeded position/scale jitter in the box.
 */
export const STAGING: Record<string, Staging> = {
  boardroom: {
    // the far side of the table asks; the man standing at the head of it answers
    speakers: [
      {role: 'guest', head: {cx: 0.2448, cy: 0.6187, w: 0.0871, h: 0.1353}},
      {role: 'hero', head: {cx: 0.9177, cy: 0.5878, w: 0.0710, h: 0.1374}},
    ],
    extraHeads: [
      {cx: 0.5182, cy: 0.6187, w: 0.6537, h: 0.1353},   // the six directors along the far side
      {cx: 0.3932, cy: 0.7760, w: 0.5827, h: 0.1722},   // the four backs at the near edge
    ],
    panelX: 0.55,
  },
  domesticInterior: {
    speakers: [
      {role: 'right', head: {cx: 0.5074, cy: 0.6052, w: 0.0649, h: 0.1256}},
      {role: 'left', head: {cx: 0.4034, cy: 0.6123, w: 0.0624, h: 0.1208}},
    ],
    extraHeads: [],
    props: [{x0: 0.102, y0: 0.659, x1: 0.251, y1: 0.841}],   // the television on its low stand
    panelX: 0.455,
  },
  officeFloor: {
    speakers: [
      {role: 'colleague', head: {cx: 0.5531, cy: 0.7296, w: 0.1191, h: 0.1490}},
      {role: 'hero', head: {cx: 0.6636, cy: 0.7173, w: 0.0624, h: 0.1208}},
    ],
    extraHeads: [
      {cx: 0.1953, cy: 0.6120, w: 0.3842, h: 0.0923},
      {cx: 0.8052, cy: 0.6120, w: 0.3875, h: 0.0923},
    ],
    panelX: 0.66,
  },
  chartBoard: {
    speakers: [{role: 'presenter', head: {cx: 0.7720, cy: 0.6729, w: 0.0698, h: 0.1350}}],
    extraHeads: [
      {cx: 0.1302, cy: 0.7774, w: 0.1074, h: 0.1637},
      {cx: 0.2917, cy: 0.7777, w: 0.1114, h: 0.1694},
      {cx: 0.4688, cy: 0.7801, w: 0.1195, h: 0.1808},
      {cx: 0.6302, cy: 0.7785, w: 0.1236, h: 0.1865},
    ],
    // the easel board IS this template's subject, and the plant is the near-left corner
    props: [{x0: 0.109, y0: 0.181, x1: 0.585, y1: 0.676}, {x0: 0.021, y0: 0.870, x1: 0.096, y1: 1.0}],
    panelX: 0.347,
  },
  closeUpPortrait: {
    speakers: [{role: 'hero', head: {cx: 0.5946, cy: 0.5769, w: 0.3428, h: 0.6633}}],
    extraHeads: [
      {cx: 0.1771, cy: 0.5502, w: 0.2417, h: 0.1065},
      {cx: 0.8618, cy: 0.5733, w: 0.0477, h: 0.0924},
    ],
    panelX: 0.595,
  },
  courtHearing: {
    speakers: [
      {role: 'judge', head: {cx: 0.8515, cy: 0.5543, w: 0.0563, h: 0.1090}},
      {role: 'defendant', head: {cx: 0.5050, cy: 0.5042, w: 0.0673, h: 0.1303}},
      {role: 'counsel', head: {cx: 0.2952, cy: 0.7389, w: 0.0600, h: 0.1161}},
    ],
    extraHeads: [
      {cx: 0.0781, cy: 0.6433, w: 0.1067, h: 0.1349},
      {cx: 0.1875, cy: 0.6391, w: 0.0871, h: 0.1353},
    ],
    panelX: 0.5,
  },
  broadcastDesk: {
    speakers: [
      {role: 'coAnchor', head: {cx: 0.4312, cy: 0.6056, w: 0.0686, h: 0.1327}},
      {role: 'anchor', head: {cx: 0.5830, cy: 0.5876, w: 0.0734, h: 0.1421}},
    ],
    extraHeads: [],
    panelX: 0.5,
  },
  crowdQueue: {
    speakers: [{role: 'hero', head: {cx: 0.6313, cy: 0.7248, w: 0.0710, h: 0.1374}}],
    extraHeads: [{cx: 0.3281, cy: 0.6518, w: 0.5672, h: 0.0952}],
    panelX: 0.63,
  },
  cityStreet: {
    speakers: [{role: 'hero', head: {cx: 0.5672, cy: 0.4669, w: 0.0624, h: 0.1208}}],
    extraHeads: [
      {cx: 0.5026, cy: 0.5868, w: 0.9894, h: 0.0824},
      {cx: 0.4323, cy: 0.5909, w: 0.7769, h: 0.1044},
      {cx: 0.7943, cy: 0.5345, w: 0.2455, h: 0.1335},
    ],
    panelX: 0.567,
  },
  bankExterior: {
    speakers: [{role: 'hero', head: {cx: 0.6510, cy: 0.7393, w: 0.0649, h: 0.1256}}],
    extraHeads: [
      {cx: 0.2526, cy: 0.7746, w: 0.4581, h: 0.1202},
      {cx: 0.8802, cy: 0.7880, w: 0.2857, h: 0.1311},
    ],
    panelX: 0.65,
  },
  exchangeFloor: {
    speakers: [{role: 'hero', head: {cx: 0.6102, cy: 0.6658, w: 0.0759, h: 0.1469}}],
    extraHeads: [
      {cx: 0.5026, cy: 0.5495, w: 0.7558, h: 0.0980},
      {cx: 0.5146, cy: 0.6152, w: 0.7049, h: 0.0782},
      {cx: 0.5052, cy: 0.6410, w: 0.8896, h: 0.1292},
      {cx: 0.5062, cy: 0.7103, w: 0.9102, h: 0.1113},
    ],
    panelX: 0.61,
  },
  factoryFloor: {
    speakers: [
      {role: 'worker', head: {cx: 0.3550, cy: 0.7309, w: 0.0502, h: 0.0971}},
      {role: 'hero', head: {cx: 0.6523, cy: 0.7228, w: 0.0686, h: 0.1327}},
    ],
    extraHeads: [{cx: 0.5208, cy: 0.6299, w: 0.5048, h: 0.1037}],
    panelX: 0.656,
  },
  // A pile of cuttings. Nobody is in it, so nobody in it can speak — a `bubbles=` scene on this
  // template raises rather than drawing a tail into a document fan.
  newsMontage: {speakers: [], extraHeads: [], panelX: 0.5},
};

/** Every head a layer must keep clear of, speaking or not. */
export const stagedHeads = (template: string): HeadBox[] => {
  const st = STAGING[template];
  return st ? [...st.speakers.map((s) => s.head), ...st.extraHeads] : [];
};

/**
 * The head box of the speaker for balloon `index` of a scene, by role or by position in the room.
 *
 * RAISES, three ways, and each one is a defect that used to render silently:
 *   * a template with no staging at all — the renderer would have no idea where anyone is;
 *   * a template with staging but nobody in it who can speak;
 *   * a role that is not in the room, which is a typo or a memory of a different template.
 * The alternative to raising is a balloon pointing at a default, which is what shipped.
 */
export const speakerHead = (
  template: string, role: string | undefined, index: number, sceneId: string
): HeadBox => {
  const st = STAGING[template];
  if (!st) {
    throw new Error(
      `${sceneId}: template '${template}' has no entry in director.tsx STAGING, so the renderer does ` +
      `not know where anybody in it is standing — a balloon there could only be placed by guessing. ` +
      `Add its speakers' head boxes to STAGING (measured off its figure call sites), or move the ` +
      `dialogue to a template that has them.`
    );
  }
  if (st.speakers.length === 0) {
    throw new Error(
      `${sceneId}: template '${template}' draws no people, so it has no speakers — a \`bubbles=\` line ` +
      `on it would be a balloon with a tail pointing at nothing. Use \`card=\` or a \`kind="float"\` ` +
      `line for narration over this template.`
    );
  }
  if (role === undefined) return st.speakers[index % st.speakers.length].head;
  const hit = st.speakers.find((s) => s.role === role);
  if (!hit) {
    throw new Error(
      `${sceneId}: nobody called ${JSON.stringify(role)} is in '${template}' — its speakers are ` +
      `${st.speakers.map((s) => `'${s.role}'`).join(', ')}`
    );
  }
  return hit.head;
};

// dp = decimal places to keep. Count-ups pass the precision of their SETTLED target so a
// fractional figure like 6.8 ("$6.8B") never rounds up to "$7" mid- or end-of-count.
export const fmt = (v: number, dp = 0) => '$' + v.toLocaleString('en-US', {minimumFractionDigits: dp, maximumFractionDigits: dp});
export const decimalsOf = (v: number) => {const s = String(v); const i = s.indexOf('.'); return i < 0 ? 0 : s.length - i - 1;};
// parse "$475,000" / "$5,300,000,000,000" -> number; non-numeric (e.g. "1 IN 3") -> null
export const parseNum = (s?: string | null): number | null => {
  if (!s) return null;
  const m = s.replace(/,/g, '').match(/-?\$?\s*(-?\d+(?:\.\d+)?)/);
  if (!m || !/\d/.test(s)) return null;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) ? v : null;
};
// split a $-overlay into the part that counts up and the literal remainder that must
// stay on screen: "$250K / YR" -> {num: 250, suffix: "K / YR"}. The count-up animates
// only the leading digits; the suffix renders verbatim so the FULL label always shows
// ("$250K / YR", never a truncated "$250"). Non-$ strings -> null (render static).
export const splitMoney = (s?: string | null): {num: number; suffix: string} | null => {
  const m = s?.trim().match(/^\$\s*(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const v = parseFloat(m[1].replace(/,/g, ''));
  return Number.isFinite(v) ? {num: v, suffix: m[2]} : null;
};

// EXPO-OUT — fast start, slow settle. Used by the count-up's bar wipe (an element animation, which
// the reference DOES do); it is deliberately no longer applied to the frame itself.
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// ============================================================================
// RAMP SAFETY (WO-25) — the render-killer class, made impossible by construction.
//
// `interpolate` requires a STRICTLY INCREASING input range and THROWS otherwise ("inputRange must be
// strictly monotonically increasing", remotion/dist/cjs/interpolate.js). Every ramp in this renderer
// is built out of the scene's own length, so a short scene can fold a range back on itself and kill
// the WHOLE render at one arbitrary frame. It has happened once for real — `Video2`'s
// `[10, 28, D - 10, D]` evaluated to `[10, 28, 25, 35]` at `t065` ("Unless.", 35 frames) and took the
// entire 29,085-frame episode with it — and `docs/BIBLE.md` §3a explicitly licenses one-word scenes,
// so a short scene is a SUPPORTED input, not an edge case. The gate's eight sampled stills cannot see
// this and neither can a two-frame smoke render.
//
// Two rules, applied at every site that derives a stop from a duration:
//   1. SCALE the stop pattern to the scene, so a short scene gets the same animation compressed
//      rather than a clipped or dropped one;
//   2. pass the result through `rising()`, which is the explicit clamp: it can only ever move a stop
//      LATER, never earlier, so a range that already fits is returned unchanged and one that does not
//      is nudged into strict order instead of throwing.
// Rule 2 alone is enough to make the crash impossible; rule 1 is what keeps the animation looking
// right while it does.
// ============================================================================

/**
 * Smallest gap `rising` leaves between two stops. A fraction of a frame: large enough that the
 * float arithmetic is unambiguous, far smaller than the 1-frame grid anything is ever sampled on, so
 * a collapsed segment reads as an instantaneous step rather than as a visible ramp.
 */
export const RAMP_EPS = 1 / 256;

/**
 * A strictly-increasing copy of `stops`, for `interpolate`'s input range.
 *
 * Non-finite input RAISES: a NaN stop means the caller's arithmetic is wrong, and silently ordering
 * NaN would hide that. Anything else is clamped forward, never backward.
 */
export const rising = (who: string, stops: number[]): number[] => {
  if (stops.length < 2) {
    throw new Error(`${who}: an interpolate input range needs at least 2 stops, got ${stops.length}`);
  }
  const out: number[] = [];
  for (let i = 0; i < stops.length; i++) {
    const s = stops[i];
    if (!Number.isFinite(s)) {
      throw new Error(`${who}: ramp stop ${i} is ${s} — a ramp built from a duration must be finite`);
    }
    out.push(i === 0 ? s : Math.max(s, out[i - 1] + RAMP_EPS));
  }
  return out;
};

// ---- the number note's own timing, in frames of a scene long enough to hold all of it ------------
/** Beats after the cut before the note starts, so it lands ON the scene rather than with it. */
const NOTE_LEAD = 8;
/** Entrance: opacity + the spring pop. */
const NOTE_ENTER = 4;
// reviewer fix (t002 "$638 BILLION" on a $639B figure, t041 "30 TO 1" caught mid-exit at ~34%
// opacity): both defects are the SAME root cause — a random still (or a viewer who simply pauses)
// is more likely to land on a mid-count or mid-fade frame than on the settled figure, because COUNT
// used to be more than half of the note's life and HOLD less than a third. COUNT is now short enough
// to reliably reach its rounded target well inside any scene long enough to run it at all, and the
// reclaimed time goes to HOLD, so "settled, full-opacity, correct" is now the note's dominant state
// rather than its minority one.
/** How long the figure counts (a `CountUp`) or simply sits legible (a static figure). */
const NOTE_COUNT = 40;
/** Settled and readable, after the count lands. */
const NOTE_HOLD = 55;
/** Exit. */
const NOTE_EXIT = 8;
/** The device's whole life, ~3.5s. See `noteRamp` for why it is a life and not a scene-long hold. */
export const NOTE_SPAN = NOTE_LEAD + NOTE_ENTER + NOTE_COUNT + NOTE_HOLD + NOTE_EXIT;

/**
 * The number note's stops, fitted to a scene of `dur` frames.
 *
 * THE NOTE IS A REVEAL, NOT A LABEL (WO-25). `CRAYON_BIBLE.md` §2's finding is specifically that **no
 * captured reference frame carries a PERSISTENT numeric overlay card**; the note used to hold from
 * frame 10 to `dur - 18`, i.e. essentially the whole scene, which is exactly the persistent card the
 * evidence rules out. It now enters, counts, settles, holds long enough to read, and lifts — so the
 * figure is delivered on its beat and the frame goes back to being a picture. Measured against this
 * episode that takes the device from ~11.7% of all frames to ~4%.
 *
 * Every stop is a fraction of the scene when the scene is shorter than `NOTE_SPAN`, so the whole
 * pattern compresses instead of running off the end, and the result is `rising()`-clamped so no
 * duration can produce a non-monotonic range.
 */
export const noteRamp = (dur: number): {op: number[]; count: number[]; rule: number[]} => {
  if (!(dur > 0)) {
    throw new Error(`noteRamp: a scene duration must be positive, got ${dur}`);
  }
  const k = Math.min(1, dur / NOTE_SPAN);
  const t0 = NOTE_LEAD * k;                 // start of the entrance
  const t1 = t0 + NOTE_ENTER * k;           // settled in
  const tCount = t1 + NOTE_COUNT * k;       // the figure has landed
  const t2 = tCount + NOTE_HOLD * k;        // start of the exit
  const t3 = t2 + NOTE_EXIT * k;            // gone
  return {
    op: rising('number note opacity', [t0, t1, t2, t3]),
    count: rising('number note count', [t1, tCount]),
    // the accent rule wipes across during the entrance and the first third of the count
    rule: rising('number note rule', [t0, t1 + NOTE_COUNT * 0.35 * k]),
  };
};

/**
 * Symmetric in/out fade stops for a clip of `dur` frames, holding at full for the middle.
 * `fade` is the intended ramp length and is itself compressed on a clip too short to hold two of them.
 */
export const fadeRamp = (who: string, dur: number, fade: number): number[] => {
  const f = Math.max(RAMP_EPS, Math.min(fade, dur / 4));
  return rising(who, [0, f, dur - f, dur]);
};

// ---- framed shot of a scene template (wide/medium/closeup crop onto a focus point) ----
// LOCKED CAMERA (CRAYON_BIBLE §3). The shot type is a STATIC crop — scale + transformOrigin on the
// focus point — and nothing else. No dolly push, no drift, no handheld sway. Motion-locality maps of
// the reference channel measured 40 of 48 background cells at EXACTLY 0.0 inside a single shot, whole
// rows at zero, and ~40% of sampled frames completely motionless. Motion is localised to characters
// and props; the frame never moves. Re-adding a per-frame transform here re-breaks that.
const SCALE: Record<string, number> = {wide: 1.0, medium: 1.5, closeup: 2.2};
export const FramedScene: React.FC<{template: string; type: string; focus: [number, number]; dur: number; photo?: {img: string; depth: string; move: Move}}> =
({template, type, focus, dur, photo}) => {
  if (photo) {
    return <PhotoStage img={photo.img} depth={photo.depth} move={photo.move} dur={dur} />;
  }
  const Art = TEMPLATES[template];
  const s = SCALE[type] ?? 1.0;
  const [fx, fy] = focus;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${s})`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}>
        {Art ? <Art /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ============================================================================
// THE NUMBER NOTE (WO-15) — CRAYON_BIBLE §5 (Art) + §7 (Typography).
//
// WHAT THE REFERENCE ACTUALLY DOES WITH NUMBERS. Nothing in the captured evidence
// (docs/research/crayon/frames/) carries a persistent corner figure card — the same finding that
// retired the `level` chip in WO-12a. Across the two verified montages, the single-frame strip and the
// seven thumbnails, EVERY on-screen number or label is one of exactly three things, and all three are
// the handwritten script:
//   * lettering ON a prop, inside the scene: the "PENNY STOCKS" box (wolf 2:30–15:40), the newspaper
//     headlines at 15:02, the "FBI" jacket flashes at 12:22, the monitor at 9:20;
//   * a full-screen text card (bible §6.1/§6.2) — which the pipeline now has as `scene.card`;
//   * a speech balloon or floating dialogue (§6.3).
// Worth stating plainly because the work order cites §2's "29–68 explicit numbers per video": that
// figure is a count of numbers in the TRANSCRIPT (MEASUREMENTS.md's writing table, alongside word and
// question counts), i.e. numbers the narrator SAYS. It is not a count of on-screen figures. So the
// reference presents its numbers in-scene and in narration, not as a persistent overlay.
//
// The overlay nevertheless stays, and is not merely tolerated: this pipeline's numbers arrive from
// `content.py` as a scene-level `overlay` field with no prop to letter and no guarantee the narration
// lands on the same beat, and the count-up is the channel's own signature reveal. Deleting it would
// drop the format's densest device on the floor to chase a device (in-scene lettering) that belongs to
// the template library, not to the renderer — and the work order that re-arts the templates is where
// that can honestly be built. What IS fixed here is the MATERIAL: the note is now made of the same
// three things the reference's balloons and cutouts are made of — flat white paper, one uniform pure
// black keyline, and handwritten script — instead of a cream Helvetica chip with a gradient
// highlighter and a drop shadow.
//
// ---------------------------------------------------------------------------------------------
// WO-25 RE-DECIDED THIS, AND NARROWED IT. QA on the rendered episode counted **18 numeric overlay
// cards** and called it a house style the reference does not have. The re-decision, in full:
//
// KEPT, because the alternative is worse. "Route every figure to a full-screen text card" is the
// obvious removal path — the card device now exists and is wired (`scene.card`) — but this episode
// already spends 10 full-screen cards in 16 minutes, and adding 18 more would put one every ~35
// seconds and blank the picture at every single number, which is a bigger deviation from the
// reference's own rhythm than the note is. Text cards are also opaque and full-frame, so they would
// have started colliding with `gate.py`'s flat-fill sampling (a card measures ~100% flat and the
// gate excludes `card` scenes by reading the timeline, which cannot see a card the renderer invents).
//
// NARROWED, three ways, all of them things the evidence actually objects to:
//   1. NOT PERSISTENT. The bible's finding is precisely that no reference frame carries a *persistent*
//      numeric overlay card. The note is now a REVEAL with a life of ~3.5s (`noteRamp`) instead of a
//      label that holds for the whole scene: on this episode that is ~4% of frames, down from ~11.7%.
//   2. NEVER WHERE A REFERENCE CARRIER IS ALREADY ON THE SCENE. A scene carrying a `card`, a balloon
//      or a `panels` split already has somewhere the reference itself puts a number, so `Video2`
//      suppresses the note there (it also fixes QA's t017 defect: the split IS the composition, and
//      the note was covering a quarter of it).
//   3. SAME MATERIAL AS A BALLOON, unchanged from WO-15 — flat white paper, one uniform pure-black
//      keyline, handwritten script, one FLAT accent rule, red on a loss beat.
// The deviation that remains is written down in `docs/BIBLE.md` §8 rather than left implicit, and the
// writer-facing instruction is there too: prefer `card=`/`bubbles=`, and let `overlay=` be the beat
// where a figure has to land on a picture.
//
// Flat fills only. The old card painted a `linear-gradient` highlighter behind the figure and a
// `boxShadow` under the card; Chromium dithers every gradient it paints, and a shadow IS a gradient
// (bible §5, crayonStyle's tone-ladder note, bubble.tsx's header). Measured, those two alone cost
// ~4.5 points of flat fill on a mid-count frame. The accent survives as a FLAT rule.
// ============================================================================

/** The two accents. Both are existing palette tokens, not new hex: gain-gold and the loss red. */
const GAIN = sceneColors('gold').bg;      // #e8b54b — income, gain, the good years
const LOSS = sceneColors('grey').accent;  // #c0392b — cost/loss beats (see isNegativeOverlay)

/**
 * Caption ink, per accent. The caption sits on the note's own white paper, so each accent is dropped
 * down its OWN tone ladder (`shade`) rather than being hand-picked: gain-gold starts at 1.88:1 against
 * white and needs the full −3 rungs to reach 3.44:1, while the loss red already sits at 5.44:1 and
 * −1 (7.06:1) is enough to hold it off the rule above it. Same ladder, different depth, because the
 * two accents start at different lightness.
 */
const CAPTION_INK = {gain: shade(GAIN, -3), loss: shade(LOSS, -1)};

// Note geometry, all in em of the fitted figure size, so the note scales as ONE object rather than a
// box of independently-tuned pixel constants. The proportions are the old card's, carried over:
// its 7px rule under a 128px figure is 0.055em, its 14px gap 0.11em.
const NOTE_PAD_X_EM = 0.24;
const NOTE_PAD_Y_EM = 0.16;
const NOTE_RADIUS_EM = 0.14;
const RULE_H_EM = 0.055;
const RULE_GAP_EM = 0.11;
const CAPTION_GAP_EM = 0.07;

/** Figure size cap, as a fraction of frame height. Reference anchors (§7): chapter title ≈0.13 h. */
const FIGURE_MAX_FRAC = 0.10;
/** The note never crosses this fraction of the frame width, its own padding included… */
const NOTE_MAX_W_FRAC = 0.42;
/** …nor this fraction of its height. Generous: one figure line plus a caption is far shorter. */
const NOTE_MAX_H_FRAC = 0.30;
/** The reference wraps a subtitle to at most 2 lines (bible §6.1); a longer caption shrinks instead. */
const CAPTION_MAX_LINES = 2;

// ---------------------------------------------------------------------------
// WHICH CORNER THE NOTE SITS IN (WO-34, QA defect 4)
// ---------------------------------------------------------------------------
//
// It used to be bottom-left in all ten overlay scenes, plus one hand-written per-scene nudge for the
// one case somebody noticed. QA found seven more: `t122` covers two seated figures (heads above the
// card, legs below it, torsos gone), `t150` a seated figure and half a desk, `t141` and `t113` two or
// three crowd figures each, `t027` and `t105` the plant and the left chairs, `t143` the television.
//
// The corner is now chosen per scene by measuring which one is emptiest — not from pixels, which the
// renderer has no access to, but from the same staged occupancy `planBalloons` uses: every head the
// template declares, taken down to the floor (a figure is a head with a body under it, and the shipped
// defect is torsos, not faces), plus the props worth not covering. And when no corner is completely
// clear the note SHRINKS to the largest size that is, rather than sitting on somebody at full size.

/** The note's margins from the frame edges, as fractions — the old `bottom: 96, left: 72` at 1920. */
const NOTE_MARGIN_X = 72 / 1920;
const NOTE_MARGIN_Y = 96 / 1080;

export type NoteCorner = 'bottom-left' | 'bottom-right' | 'top-left' | 'top-right';

/**
 * Preference order, used only to break ties between corners that are equally empty. Bottom-left comes
 * first so a scene with nobody in the way keeps the placement every episode before this one used.
 */
const CORNER_ORDER: NoteCorner[] = ['bottom-left', 'bottom-right', 'top-left', 'top-right'];

/** The rectangle a note of relative size `k` would occupy in `corner`. */
const cornerRect = (corner: NoteCorner, k: number): Zone => {
  const w = NOTE_MAX_W_FRAC * k;
  const h = NOTE_MAX_H_FRAC * k;
  const left = corner.endsWith('left');
  const top = corner.startsWith('top');
  const x0 = left ? NOTE_MARGIN_X : 1 - NOTE_MARGIN_X - w;
  const y0 = top ? NOTE_MARGIN_Y : 1 - NOTE_MARGIN_Y - h;
  return {x0, y0, x1: x0 + w, y1: y0 + h};
};

const overlapArea = (a: Zone, b: Zone): number =>
  Math.max(0, Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)) *
  Math.max(0, Math.min(a.y1, b.y1) - Math.max(a.y0, b.y0));

/**
 * What a note must not land on: every declared head carried down to the bottom of the frame, plus the
 * template's named props.
 */
export const stagedOccupancy = (template: string): Zone[] => {
  const st = STAGING[template];
  if (!st) return [];
  const bodies = stagedHeads(template).map((h) => ({
    x0: h.cx - h.w / 2,
    y0: h.cy - h.h / 2,
    x1: h.cx + h.w / 2,
    y1: 1,
  }));
  return [...bodies, ...(st.props ?? [])];
};

/** Relative sizes tried, largest first, when no corner is clear at full size. */
const NOTE_SHRINK_STEPS = [1, 0.92, 0.84, 0.76, 0.68, 0.6];

/**
 * The emptiest corner for this template's number note, and how large the note may be there.
 *
 * `null` for a template with no staging — the legacy `scenes.tsx` pack, which this work order did not
 * measure. Those keep the bottom-left placement they have always had rather than being moved on a
 * guess.
 */
export const noteCorner = (template: string): {corner: NoteCorner; size: number} | null => {
  const zones = stagedOccupancy(template);
  if (zones.length === 0) return null;
  const scored = CORNER_ORDER.map((corner) => {
    const rect = cornerRect(corner, 1);
    return {corner, area: zones.reduce((a, z) => a + overlapArea(rect, z), 0)};
  });
  const best = scored.reduce((a, b) => (b.area < a.area ? b : a));
  // …and then take the largest size that is actually clear in it. At the common case — a corner with
  // nothing in it — the first step succeeds and the note is full size.
  for (const size of NOTE_SHRINK_STEPS) {
    const rect = cornerRect(best.corner, size);
    if (zones.every((z) => overlapArea(rect, z) === 0)) return {corner: best.corner, size};
  }
  // Nowhere is clear even at the smallest step: take the emptiest corner at that size. The note still
  // has to render — it is the scene's figure — so this is the least-bad placement, not a silent pass.
  return {corner: best.corner, size: NOTE_SHRINK_STEPS[NOTE_SHRINK_STEPS.length - 1]};
};

/** The CSS offsets that put a note of relative size `size` in `corner`. */
export const cornerStyle = (corner: NoteCorner, width: number, height: number): React.CSSProperties => ({
  position: 'absolute',
  [corner.startsWith('top') ? 'top' : 'bottom']: NOTE_MARGIN_Y * height,
  [corner.endsWith('left') ? 'left' : 'right']: NOTE_MARGIN_X * width,
});

/**
 * Caption:figure size ratio — deliberately NOT `CRAYON_SUBTITLE_RATIO` itself.
 *
 * 0.75 is the measured ratio of a chapter card's SUBTITLE to its title (§7): two lines of the same
 * sentence, the second explaining the first. A note's caption is a different relationship — the figure
 * is the entire point of the device and the caption names the unit it is measured in. Built at 0.75
 * and rendered, the caption is simply the bigger object: it is almost always the longer string
 * ("G LEAGUE, FIVE MONTHS" against "$40,500"), so it wraps to two lines at three-quarter size and
 * outweighs the number the overlay exists to show. Half the subtitle ratio keeps the hierarchy carried
 * by size alone, as §7 requires, with the figure on top of it. Derived from the token rather than
 * hand-set, so a retune of the measured ratio still moves this.
 */
const CAPTION_RATIO = CRAYON_SUBTITLE_RATIO / 2;

/** Full-screen NumberReveal: the text-card size anchors (§7 — chapter title ≈0.13 h, widest line 0.805 w). */
const REVEAL_FIGURE_FRAC = 0.13;
const REVEAL_BOX_W_FRAC = 0.82;

export type NumberCardProps = {
  /** The figure exactly as it should read THIS frame ("$40,500", "0.03%", "-1 KIA"). */
  figure: string;
  /**
   * Every label the note must be able to hold. The widest is what it is SIZED against, so an
   * animating figure never re-flows, re-sizes or clips as its digits grow — and a long unit suffix
   * ("$250K / YR") is inside the box from the first frame. Defaults to `[figure]`.
   */
  measure?: string[];
  sub?: string | null;
  /** Cost/loss beat: swaps the accent from gain-gold to the loss red (see `isNegativeOverlay`). */
  negative?: boolean;
  /** 0..1 wipe of the accent rule. 1 = full width (a static overlay); `CountUp` animates it. */
  rule?: number;
  /**
   * Relative size ceiling, 0..1, multiplying the note's own width/height fractions.
   *
   * How "let the card shrink rather than overlap a figure" is actually done (QA defect 4): `noteCorner`
   * hands back the largest size that is clear in the corner it picked, and the note is fitted to that
   * box. It is a CEILING on the auto-fit, not a transform — the figure is re-set at the smaller size,
   * so the linework and the keyline keep the weight the rest of the frame is drawn at.
   */
  size?: number;
};

/**
 * A flat handwritten note carrying one figure and its caption. Presentational only — the caller owns
 * placement, opacity and any entrance transform, exactly as `TextCard` leaves its own Sequence to
 * `Video2`.
 */
export const NumberCard: React.FC<NumberCardProps> = ({figure, measure, sub, negative = false, rule = 1, size = 1}) => {
  const {width, height} = useVideoConfig();
  // Auto-fit measures in the REAL vendored face; measuring before the woff2 is live would size the
  // note against a fallback. The shared gate holds the render open until the face is available and
  // cancels it outright rather than ever falling back to a system sans (crayonText.ts).
  const ready = useCrayonFace('number card');
  // Not laid out yet: the delayRender above guarantees no frame is ever captured in this state.
  if (!ready) return null;

  if (!(size > 0 && size <= 1)) {
    throw new Error(`number card: size must be in (0, 1], got ${size}`);
  }
  const boxWidth = width * NOTE_MAX_W_FRAC * size;
  const boxHeight = height * NOTE_MAX_H_FRAC * size;
  const candidates = measure?.length ? measure : [figure];
  const widest = candidates.reduce((a, c) => (measureEm(c) > measureEm(a) ? c : a));
  const fit = fitText(widest, {
    who: 'number card',
    maxLines: 1, // a figure is one line by definition; too long a label shrinks, never wraps
    maxFontSize: height * FIGURE_MAX_FRAC,
    boxWidth,
    boxHeight,
    padXEm: NOTE_PAD_X_EM,
    padYEm: NOTE_PAD_Y_EM,
  });
  const fs = fit.fontSize;
  const padX = NOTE_PAD_X_EM * fs;
  const padY = NOTE_PAD_Y_EM * fs;
  // CAPTION_RATIO is a CEILING here, not a lock (which is what textcard.tsx's chapter card does with
  // its own ratio): an overlay caption is a whole clause — "NO GUARANTEE PAST DAY 10" — so it is
  // allowed to come down off the ratio to fit rather than widen the note past NOTE_MAX_W_FRAC.
  const capFit = sub
    ? fitText(sub, {
        who: 'number card',
        maxLines: CAPTION_MAX_LINES,
        maxFontSize: fs * CAPTION_RATIO,
        boxWidth: boxWidth - 2 * padX,
        boxHeight: boxHeight - 2 * padY,
      })
    : null;
  const capSize = capFit ? capFit.fontSize : 0;
  const contentW = Math.max(fit.widestEm * fs, capFit ? capFit.widestEm * capSize : 0);
  const accent = negative ? LOSS : GAIN;
  // synthetic oblique: Caveat has no italic cut (crayonStyle.CRAYON_TEXT_SLANT_DEG), as in textcard/bubble
  const slant = `skewX(-${CRAYON_TEXT_SLANT_DEG}deg)`;

  return (
    <div
      style={{
        width: contentW,
        // EXPLICIT, and load-bearing: the page renders under a global `box-sizing: border-box`, which
        // would make `width` the OUTER width and quietly shrink the content box by the padding and the
        // keyline — measured, that clipped the caption 46px outside the note's right edge. Every
        // dimension here is solved from the em box of the fitted text, so the box must be the content.
        boxSizing: 'content-box',
        padding: `${padY}px ${padX}px`,
        backgroundColor: PAPER_WHITE,
        // Flat white paper behind a uniform pure-black keyline — the exact material bubble.tsx gives a
        // speech balloon (fill PAPER_WHITE, stroke INK, strokeAt(width)), which is how the reference
        // floats text over artwork. NO boxShadow: a shadow is a blur is a gradient.
        border: `${strokeAt(width)}px solid ${INK}`,
        borderRadius: NOTE_RADIUS_EM * fs,
        fontFamily: CRAYON_FONT,
        fontWeight: CRAYON_TEXT_WEIGHT,
      }}
    >
      {/* the accent, as a FLAT rule. It is the only thing that distinguishes a cost/loss beat from a
          gain beat at a glance, so it is drawn whether or not the note carries a caption. */}
      <div
        style={{
          width: contentW * Math.min(1, Math.max(0, rule)),
          height: RULE_H_EM * fs,
          backgroundColor: accent,
          marginBottom: RULE_GAP_EM * fs,
        }}
      />
      <div style={{fontSize: fs, lineHeight: LINE_HEIGHT, color: INK, whiteSpace: 'pre', transform: slant}}>
        {figure}
      </div>
      {capFit?.lines.map((l, i) => (
        <div
          key={i}
          style={{
            fontSize: capSize,
            lineHeight: LINE_HEIGHT,
            color: negative ? CAPTION_INK.loss : CAPTION_INK.gain,
            whiteSpace: 'pre',
            transform: slant,
            marginTop: i === 0 ? CAPTION_GAP_EM * fs : 0,
          }}
        >
          {l}
        </div>
      ))}
    </div>
  );
};

// ---- positioned count-up overlay (sits on the scene shots, in its scene's emptiest corner) ----
export const CountUp: React.FC<{
  from: number; to: number; suffix?: string; sub?: string | null; dur: number; negative?: boolean;
  /** Where the note sits. Chosen per scene by `noteCorner`; bottom-left is the historical default. */
  corner?: NoteCorner;
  /** Relative size, 0..1 — `noteCorner`'s answer to "shrink rather than overlap a figure". */
  size?: number;
}> =
({from, to, suffix = '', sub, dur, negative = false, corner = 'bottom-left', size = 1}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  // One timing for the whole device, fitted to the scene and monotonic by construction (`noteRamp`).
  // The old stops were literals against `dur` — `[16, min(dur-12, 84)]` and `[10, 24, dur-18, dur]` —
  // and the second of those is the render-killer this work order was opened on: it went backwards for
  // any scene under 43 frames.
  const ramp = noteRamp(dur);
  const p = interpolate(f, ramp.count, [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const val = from + (to - from) * p;
  const op = interpolate(f, ramp.op, [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // spring-driven pop on the reveal (overshoots then settles -> reads "earned", not scripted)
  const sp = spring({frame: Math.max(0, f - ramp.op[0]), fps, config: {damping: 11, mass: 0.6, stiffness: 170}});
  const pop = interpolate(sp, [0, 1], [0.8, 1]);
  // the rule wipes in as a FRACTION of the note's own width now, not a hardcoded 340px
  const rule = interpolate(f, ramp.rule, [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const dp = decimalsOf(to);
  // Only the leading digits animate; `suffix` is rendered verbatim, so the note reads the FULL label
  // ("$250K / YR", never a truncated "$250"). Both ENDPOINTS are handed to the note to size against —
  // `val` never leaves the interval between them, so neither the settled label nor a carried-forward
  // opening figure that happens to be the longer of the two can ever overflow.
  return (
    <div style={{
      ...cornerStyle(corner, width, height),
      opacity: op,
      // the spring pop grows the note out of the corner it is anchored to, not out of frame
      transformOrigin: `${corner.endsWith('left') ? 'left' : 'right'} ${corner.startsWith('top') ? 'top' : 'bottom'}`,
      transform: `scale(${pop})`,
    }}>
      <NumberCard
        figure={fmt(val, dp) + suffix}
        measure={[fmt(from, dp) + suffix, fmt(to, dp) + suffix]}
        sub={sub}
        negative={negative}
        rule={rule}
        size={size}
      />
    </div>
  );
};

// ---- motion-graphics money reveal: count-up + climbing gold bar + label (full-screen insert) ----
export const NumberReveal: React.FC<{from: number; to: number; label: string; dur: number}> =
({from, to, label, dur}) => {
  const f = useCurrentFrame();
  const {width, height} = useVideoConfig();
  const ready = useCrayonFace('number reveal');
  // Same class of bug as `CountUp`'s: `[10, min(dur - 14, 78)]` goes backwards for any insert under
  // 25 frames. Clamped, not left to the caller to keep long enough.
  const p = interpolate(f, rising('number reveal count', [10, Math.min(dur - 14, 78)]), [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const val = from + (to - from) * p;
  const dp = decimalsOf(to);
  const pop = interpolate(f, [6, 16, 24], [0.8, 1.06, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // (this pair is monotonic for every dur — both stops clamp at the same time and the unclamped
  // difference is a constant 8 — but it is built from `dur`, so it goes through the same guard.)
  const labelOp = interpolate(f, rising('number reveal label', [Math.min(dur - 10, 70), Math.min(dur - 2, 80)]),
    [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // Not laid out yet — as in NumberCard, the font gate guarantees no frame is captured here.
  if (!ready) return <AbsoluteFill style={{backgroundColor: PAPER}} />;

  // A full-screen insert is the same class of device as a text card, so it takes the card's own size
  // anchor (§7: chapter title ≈0.13 h) instead of the old flat 188px — which, at a trillion-dollar
  // figure, ran off both edges of the frame.
  const opening = fmt(from, dp);
  const settled = fmt(to, dp);
  const fit = fitText(measureEm(settled) > measureEm(opening) ? settled : opening, {
    who: 'number reveal', maxLines: 1, maxFontSize: height * REVEAL_FIGURE_FRAC,
    boxWidth: width * REVEAL_BOX_W_FRAC, boxHeight: height * 0.4,
  });
  // same figure-and-its-unit relationship as the note, so the same ratio — not the chapter card's
  const labelFit = fitText(label, {
    who: 'number reveal', maxLines: CAPTION_MAX_LINES, maxFontSize: fit.fontSize * CAPTION_RATIO,
    boxWidth: width * REVEAL_BOX_W_FRAC, boxHeight: height * 0.25,
  });
  const slant = `skewX(-${CRAYON_TEXT_SLANT_DEG}deg)`;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, justifyContent: 'center', alignItems: 'center',
      fontFamily: CRAYON_FONT, fontWeight: CRAYON_TEXT_WEIGHT, textAlign: 'center'}}>
      {/* the climbing bar is already a flat fill; it is an ELEMENT animation, which the reference does */}
      <div style={{height: 16, width: `${interpolate(p, [0, 1], [60, 760])}px`, background: GAIN, borderRadius: 8, marginBottom: 40}} />
      <div style={{transform: `scale(${pop}) ${slant}`, color: INK, fontSize: fit.fontSize,
        lineHeight: LINE_HEIGHT, whiteSpace: 'pre'}}>{fmt(val, dp)}</div>
      <div style={{opacity: labelOp, marginTop: 34}}>
        {labelFit.lines.map((l, i) => (
          <div key={i} style={{color: CAPTION_INK.gain, fontSize: labelFit.fontSize, lineHeight: LINE_HEIGHT,
            whiteSpace: 'pre', transform: slant}}>{l}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

type Shot = {type: string; dur: number; numberFx?: {from: number; to: number; label: string}};
type Beat = {id: string; template: string; focus?: [number, number]; shots: Shot[]};

const ShotView: React.FC<{beat: Beat; shot: Shot}> = ({beat, shot}) => {
  const f = useCurrentFrame();
  // quick crossfade in/out for a clean cut. `fadeRamp` compresses the 5-frame ramp on a shot shorter
  // than 10 frames, where the literal range used to fold back on itself and throw.
  const op = interpolate(f, fadeRamp('slice shot', shot.dur, 5), [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      {shot.type === 'insert' && shot.numberFx
        ? <NumberReveal {...shot.numberFx} dur={shot.dur} />
        : <FramedScene template={beat.template} type={shot.type} focus={beat.focus ?? [0.5, 0.5]} dur={shot.dur} />}
    </AbsoluteFill>
  );
};

export const Slice: React.FC = () => {
  const beats = slice.beats as Beat[];
  let t = 0;
  const seqs: React.ReactNode[] = [];
  for (const beat of beats) {
    for (let i = 0; i < beat.shots.length; i++) {
      const shot = beat.shots[i];
      seqs.push(
        <Sequence key={`${beat.id}-${i}`} from={t} durationInFrames={shot.dur}>
          <ShotView beat={beat} shot={shot} />
        </Sequence>);
      t += shot.dur;
    }
  }
  return <AbsoluteFill style={{backgroundColor: PAPER}}>{seqs}</AbsoluteFill>;
};

export const SLICE_FRAMES = (slice.beats as Beat[]).reduce(
  (a, b) => a + b.shots.reduce((x, s) => x + s.dur, 0), 0);
