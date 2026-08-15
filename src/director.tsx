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
};

/**
 * A flat handwritten note carrying one figure and its caption. Presentational only — the caller owns
 * placement, opacity and any entrance transform, exactly as `TextCard` leaves its own Sequence to
 * `Video2`.
 */
export const NumberCard: React.FC<NumberCardProps> = ({figure, measure, sub, negative = false, rule = 1}) => {
  const {width, height} = useVideoConfig();
  // Auto-fit measures in the REAL vendored face; measuring before the woff2 is live would size the
  // note against a fallback. The shared gate holds the render open until the face is available and
  // cancels it outright rather than ever falling back to a system sans (crayonText.ts).
  const ready = useCrayonFace('number card');
  // Not laid out yet: the delayRender above guarantees no frame is ever captured in this state.
  if (!ready) return null;

  const boxWidth = width * NOTE_MAX_W_FRAC;
  const boxHeight = height * NOTE_MAX_H_FRAC;
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

// ---- positioned count-up overlay (sits on the scene shots, lower-left, while framing cuts) ----
export const CountUp: React.FC<{from: number; to: number; suffix?: string; sub?: string | null; dur: number; negative?: boolean}> =
({from, to, suffix = '', sub, dur, negative = false}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
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
    <div style={{position: 'absolute', bottom: 96, left: 72, opacity: op, transformOrigin: 'left bottom', transform: `scale(${pop})`}}>
      <NumberCard
        figure={fmt(val, dp) + suffix}
        measure={[fmt(from, dp) + suffix, fmt(to, dp) + suffix]}
        sub={sub}
        negative={negative}
        rule={rule}
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
