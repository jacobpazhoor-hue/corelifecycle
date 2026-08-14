// CRAYON speech bubbles + floating dialogue — bible §6 device 3, typography §7.
//
// Two devices, both confirmed on the verified frames:
//   1. speech balloon  — rounded white balloon, uniform black outline, a tapered tail pointing at the
//                        speaker, handwritten italic text inside. Reference: wolf 9:20, two balloons on
//                        one frame ("Don't panic. / It will rise again." with a tail down-left onto the
//                        head below it, and "I want to complain!" lower-left); depression 15:00
//                        ("We're surviving." over the grey crowd).
//   2. floating dialogue — the SAME handwritten script laid straight onto the scene with NO balloon.
//                        Reference: wolf 3:34, three left-aligned white lines over a mid-grey office wall.
//
// Measured off the verified frames (each montage cell is one full 16:9 frame at 308x174, so
// 1 cell px = 6.234 px at 1920 wide / 6.207 px at 1080 tall):
//   wolf 9:20  lower balloon box x 18..187, y 101..133  -> 0.549 w x 0.184 h, ONE line of 19 chars
//   wolf 9:20  upper balloon box x 170..269, y 21..~51  -> 0.321 w x 0.172 h, TWO lines
//   wolf 9:20  ink of "I want to complain!" measures 113 x 15 cell px inside that 169 x 32 box, i.e.
//              ~1.7 em of horizontal padding a side against ~0.32 em vertical
//   wolf 9:20  balloon corner turns over ~7 cell px on a 32 cell px tall box -> radius ~0.28 of the
//              short side
//   wolf 9:20  balloon outline reads ~1 cell px (~6 px @1920) — inside the STROKE band, so the shared
//              token is used rather than a forked local weight
//   wolf 3:34  floating text is plain white on a #696969-class wall; adjacent pixels drop to 13–47
//              against a wall of ~105, which is a darker undershoot than JPEG ringing alone explains
//              -> read as a thin dark keyline on the glyphs (see FLOAT_KEYLINE_EM, flagged unverified)
//
// Everything is drawn as flat fills and uniform strokes. NO gradients anywhere: Chromium dithers every
// gradient it paints and the dither destroys the project's flat-fill metric (bible §5).
//
// The sizes below were CLOSED against the reference, not guessed: rendering "I want to complain!" with
// these constants and downsampling the 1920x1080 still to the reference's own 308x174 cell gives ink of
// 111 x 15 cell px against the reference's 113 x 15, inside a balloon of 149 x 30 against 169 x 32.
// The remaining 12% width gap is the deliberate PAD_X_EM compromise documented there.
//
// Presentational only: it renders a balloon / a line of dialogue and nothing else. `Video2.tsx` drives
// both from a scene's optional `bubbles` array (WO-12a); neither device knows about the timeline.

import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

import {CRAYON_FONT, CRAYON_TEXT_SLANT_DEG, INK, PAPER_WHITE, strokeAt} from './crayonStyle';
// measure/wrap/fit + the delayRender font gate, shared with textcard.tsx (WO-12a). This module's
// padding-aware fit is now the shared one, with textcard's zero-padding case falling out of it.
import {
  CRAYON_TEXT_WEIGHT,
  LINE_HEIGHT,
  faceMetrics,
  fitText,
  useCrayonFace,
} from './crayonText';

// ---------------------------------------------------------------------------
// Entrance
// ---------------------------------------------------------------------------

/**
 * Entrance length in frames, for BOTH devices. The only timing in this file.
 *
 * ⚠ UNVERIFIED, same caveat as TEXTCARD_ENTRANCE_FRAMES: the research never measured the reference's
 * reveal easing or duration (CRAYON_BIBLE closing "Open risks"). A balloon appearing is a cut in the
 * reference as far as anyone has measured, so this is deliberately short — a pop, not a move. The
 * camera stays locked: the entrance scales the balloon about its own centre and touches nothing else.
 */
export const BUBBLE_ENTRANCE_FRAMES = 5;

/** How far under full size the entrance starts. Unverified, kept small so the frame never reads as moving. */
const ENTRANCE_SCALE_FROM = 0.92;

// ---------------------------------------------------------------------------
// Balloon geometry (fractions, so a balloon is resolution-independent)
// ---------------------------------------------------------------------------

/**
 * Text size cap as a fraction of frame height.
 *
 * Derived by rendering the reference's own string, "I want to complain!", and comparing ink widths
 * like for like at the reference's own 308 px cell resolution: the reference measures 113 cell px of
 * ink, a 0.075 h setting measures 87 — a 1.30x ratio, i.e. the reference sets that balloon at ~0.098 h.
 * 0.095 leans on that measurement while giving back a little to the 9:20 frame's OTHER balloon, which
 * is visibly smaller (two lines inside a 100 cell px box) — the reference does not use one balloon size.
 */
const BUBBLE_TEXT_MAX_FRAC = 0.095;

/** Default width ceiling for a balloon, as a fraction of frame width. Reference widest measured 0.549. */
const BUBBLE_MAX_W_FRAC = 0.56;

/** …and a height ceiling, so a badly-wrapped balloon shrinks rather than swallowing the frame. */
const BUBBLE_MAX_H_FRAC = 0.5;

/**
 * Balloon padding, in em of its own text.
 *
 * Vertical is measured: the 9:20 lower balloon is 32 cell px tall around a single line set at ~16.9
 * cell px, i.e. 1.25 em of line box plus 2 x 0.32 em.
 * Horizontal is a COMPROMISE, flagged as such: that same balloon pads 28-29 cell px a side (~1.7 em),
 * but the upper balloon on the same frame pads far tighter. 1.2 em sits between them — wide enough to
 * read as the reference's lozenge, not so wide that a two-line balloon becomes a banner.
 */
const PAD_X_EM = 1.2;
const PAD_Y_EM = 0.32;

/** Corner radius as a fraction of the balloon's SHORT side. Reference ~7 cell px on a 32 cell px box. */
const RADIUS_FRAC = 0.28;

/** Default tail length as a fraction of frame height, and its half-width as a fraction of that length. */
const TAIL_LEN_FRAC = 0.075;
const TAIL_HALF_W_OF_LEN = 0.4;

/** A balloon wraps to at most this many lines before it starts shrinking its text instead. */
const BUBBLE_MAX_LINES = 4;

// ---------------------------------------------------------------------------
// Floating dialogue
// ---------------------------------------------------------------------------

/**
 * Floating dialogue runs SMALLER than balloon text — the reference does not shout when it drops the
 * balloon. Closed the same way: at 0.085 h the rendered block's line pitch measures 18 cell px against
 * the 3:34 reference's 17, over three lines of comparable ink.
 */
const FLOAT_TEXT_MAX_FRAC = 0.085;

/** Default width ceiling for a floating block. The 3:34 block measures 113/308 = 0.367 w over 3 lines. */
const FLOAT_MAX_W_FRAC = 0.44;

/** Floating dialogue wraps freely; it is dialogue, not a card, so it is allowed to run long. */
const FLOAT_MAX_LINES = 5;

/**
 * Flat keyline drawn under the floating glyphs, in em, so unballooned script survives whatever it
 * lands on. The 3:34 wall itself is generous (~#696969, ~5.6:1 against white) — the keyline is for the
 * rest of the frame, where the same block can cross a pale prop, a lit window or a white shirt and the
 * contrast collapses to nothing. A balloon solves that with a white ground; this is its substitute.
 *
 * ⚠ PARTLY UNVERIFIED. Pixels bordering the reference's glyphs undershoot to 13–47 against a wall of
 * ~105, which is consistent with a keyline and larger than the surrounding JPEG ringing — but the
 * montage cell is 308 px wide, far too coarse to measure a keyline's width. This is a stroke, never a
 * blur: a soft shadow would be a gradient, and Chromium dithers gradients.
 *
 * 0.045 → 0.07 em (WO-25). The keyline is no longer decoration on a colour choice that was expected to
 * be right; it is now the ONLY thing guaranteeing legibility when the glyphs land on a plane the
 * renderer cannot see (see `FloatingDialogueProps.color`), so it is sized to do that job. Measured on
 * the two failing scenes at 1920: 0.07 em is ~6 px around an 88 px glyph — the same order as the
 * canon's own 8 px linework, i.e. it reads as the drawing's outline weight rather than as a halo.
 */
const FLOAT_KEYLINE_EM = 0.07;

/**
 * The keyline is the device's GROUND, so it has a floor and the floor is not negotiable.
 *
 * A balloon guarantees legibility with an opaque white lozenge. Floating dialogue has no lozenge, so
 * the keyline is the only ground the glyphs ever get — it is what the contrast guarantee below is
 * computed against. `keyline={0}` therefore no longer means "bare glyphs"; it means "no ground", and
 * the device raises instead of drawing a line whose legibility is a coin toss against art it cannot
 * see. A caller can still make the keyline HEAVIER.
 */
const FLOAT_KEYLINE_MIN_EM = 0.06;

/**
 * The contrast a glyph must carry against its own keyline, as a WCAG ratio.
 *
 * 7:1 is WCAG AAA for body text. It is reachable by construction — INK against PAPER_WHITE is 21:1 —
 * so this threshold only ever fires on a colour that could not have been legible: a mid-grey glyph
 * contrasts with neither black nor white and fails whichever keyline it is given. That is the case
 * the device now REFUSES rather than renders.
 */
const FLOAT_MIN_CONTRAST = 7;

// One weight for everything, as in textcard.tsx: the reference's hierarchy is size, never stroke weight.
const WEIGHT = CRAYON_TEXT_WEIGHT;

// ---------------------------------------------------------------------------
// Balloon outline
// ---------------------------------------------------------------------------

/** Which edge the tail leaves from. 'none' draws a plain balloon (a thought/label, or an off-screen speaker). */
export type BubbleTail = 'left' | 'right' | 'down' | 'up' | 'none';

type TailSpec = {
  side: BubbleTail;
  /** Where the tail sits along its edge, 0..1 measured left→right (top/bottom) or top→bottom (sides). */
  at: number;
  /** Tail length, in px. */
  len: number;
  /** Half-width of the tail's base, in px. */
  halfW: number;
  /** Lateral lean of the tip, as a multiple of `len`. 0 = square out; the reference's tails lean. */
  skew: number;
};

/**
 * One continuous path for balloon + tail, so the outline has no seam where the tail meets the body.
 *
 * The rectangle is walked CLOCKWISE from the top-left corner, and the tail is spliced into whichever
 * edge it leaves from — which is why each side below inserts its two base points in a different order.
 * Building it as one path (rather than a bordered div plus an overlaid triangle) is what keeps the
 * outline a single uniform stroke and the fill a single flat region.
 */
const balloonPath = (x0: number, y0: number, x1: number, y1: number, r: number, tail: TailSpec): string => {
  const w = x1 - x0;
  const h = y1 - y0;
  if (w <= 2 * r || h <= 2 * r) {
    throw new Error(`bubble: balloon ${w.toFixed(1)}x${h.toFixed(1)} is too small for corner radius ${r.toFixed(1)}`);
  }
  if (tail.side !== 'none') {
    const span = tail.side === 'left' || tail.side === 'right' ? h - 2 * r : w - 2 * r;
    if (2 * tail.halfW > span) {
      throw new Error(
        `bubble: tail base ${(2 * tail.halfW).toFixed(1)}px does not fit the ${tail.side} edge's ` +
          `${span.toFixed(1)}px straight run — shorten the tail or widen the balloon`
      );
    }
  }

  // Base centre, clamped so the whole base stays on the straight run between the corners.
  const along = (lo: number, hi: number): number =>
    Math.min(hi - tail.halfW, Math.max(lo + tail.halfW, lo + tail.at * (hi - lo)));

  const bx = along(x0 + r, x1 - r);
  const by = along(y0 + r, y1 - r);

  const d: string[] = [`M ${x0 + r} ${y0}`];

  // top edge, left -> right
  if (tail.side === 'up') {
    d.push(`L ${bx - tail.halfW} ${y0}`, `L ${bx + tail.skew * tail.len} ${y0 - tail.len}`, `L ${bx + tail.halfW} ${y0}`);
  }
  d.push(`L ${x1 - r} ${y0}`, `Q ${x1} ${y0} ${x1} ${y0 + r}`);

  // right edge, top -> bottom
  if (tail.side === 'right') {
    d.push(`L ${x1} ${by - tail.halfW}`, `L ${x1 + tail.len} ${by + tail.skew * tail.len}`, `L ${x1} ${by + tail.halfW}`);
  }
  d.push(`L ${x1} ${y1 - r}`, `Q ${x1} ${y1} ${x1 - r} ${y1}`);

  // bottom edge, right -> left
  if (tail.side === 'down') {
    d.push(`L ${bx + tail.halfW} ${y1}`, `L ${bx + tail.skew * tail.len} ${y1 + tail.len}`, `L ${bx - tail.halfW} ${y1}`);
  }
  d.push(`L ${x0 + r} ${y1}`, `Q ${x0} ${y1} ${x0} ${y1 - r}`);

  // left edge, bottom -> top
  if (tail.side === 'left') {
    d.push(`L ${x0} ${by + tail.halfW}`, `L ${x0 - tail.len} ${by + tail.skew * tail.len}`, `L ${x0} ${by - tail.halfW}`);
  }
  d.push(`L ${x0} ${y0 + r}`, `Q ${x0} ${y0} ${x0 + r} ${y0}`, 'Z');

  return d.join(' ');
};

// ---------------------------------------------------------------------------
// Shared text rendering
// ---------------------------------------------------------------------------

type TextBlockProps = {
  lines: string[];
  fontSize: number;
  /** SVG text anchor x: the block's centre when `align` is 'center', its left edge when 'left'. */
  anchorX: number;
  /** Block centre — the pivot the synthetic oblique is applied about, and the block's vertical middle. */
  pivotX: number;
  cy: number;
  align: 'center' | 'left';
  fill: string;
  /** Flat keyline under the glyphs, in px. 0 = none. Never a blur — a blur is a gradient. */
  keyline: number;
  keylineColor: string;
};

/**
 * The dialogue itself, as SVG text. Baselines are placed from the face's own ascent/descent so each
 * line sits at the optical centre of its line box, and the whole block is obliqued about its own
 * centre — the same synthetic italic textcard.tsx applies with CSS `skewX`.
 */
const TextBlock: React.FC<TextBlockProps> = ({
  lines,
  fontSize,
  anchorX,
  pivotX,
  cy,
  align,
  fill,
  keyline,
  keylineColor,
}) => {
  const {ascent, descent} = faceMetrics(WEIGHT);
  const blockH = lines.length * LINE_HEIGHT * fontSize;
  const top = cy - blockH / 2;
  const baseline = (i: number) =>
    top + (i + 0.5) * LINE_HEIGHT * fontSize + ((ascent - descent) / 2) * fontSize;

  return (
    <g transform={`translate(${pivotX} ${cy}) skewX(${-CRAYON_TEXT_SLANT_DEG}) translate(${-pivotX} ${-cy})`}>
      {lines.map((line, i) => (
        <text
          key={i}
          x={anchorX}
          y={baseline(i)}
          fontFamily={CRAYON_FONT}
          fontWeight={WEIGHT}
          fontSize={fontSize}
          textAnchor={align === 'center' ? 'middle' : 'start'}
          fill={fill}
          {...(keyline > 0
            ? {
                stroke: keylineColor,
                strokeWidth: keyline,
                strokeLinejoin: 'round' as const,
                paintOrder: 'stroke' as const,
              }
            : {})}
          // wrapping is computed above; SVG text never re-breaks, but be explicit about the spaces
          style={{whiteSpace: 'pre'}}
        >
          {line}
        </text>
      ))}
    </g>
  );
};

/**
 * Restrained entrance: a scale about the element's own centre, and NOTHING ELSE. The camera never
 * moves and the element is never transparent.
 *
 * THE OPACITY RAMP IS GONE (WO-25), and this is the whole of QA's "translucent, keyline-less speech
 * balloon" defect. It was not a fill or a stroke bug: the balloon's fill is `PAPER_WHITE` and its
 * stroke `INK` at `strokeAt(width)`, both opaque, both correct. What the reviewer caught at t051 was
 * frame 2 of a 5-frame fade from opacity 0 — the balloon at ~40% over a window grid, its "missing"
 * keyline just the same 40% of a black line. A device that is see-through for a sixth of a second is
 * see-through: five frames is a real, samplable, publishable state, and a reference balloon is flat
 * opaque white with a uniform black keyline in every frame it exists.
 *
 * A balloon appearing is a CUT in the reference as far as anyone has measured (see
 * BUBBLE_ENTRANCE_FRAMES), so cutting it in at full opacity is also the closer match. The small scale
 * settle stays: it is a shape animation, which the reference's element animations are, and it can
 * never make the balloon translucent.
 */
const useEntrance = (animate: boolean): {opacity: number; scale: number} => {
  const frame = useCurrentFrame();
  if (!animate) return {opacity: 1, scale: 1};
  const t = interpolate(frame, [0, BUBBLE_ENTRANCE_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {opacity: 1, scale: ENTRANCE_SCALE_FROM + (1 - ENTRANCE_SCALE_FROM) * t};
};

// ---------------------------------------------------------------------------
// Public API — SpeechBubble
// ---------------------------------------------------------------------------

export type SpeechBubbleProps = {
  /** One utterance. Line breaking is automatic; the balloon grows to hold it. */
  text: string;
  /** Balloon centre, as fractions of the frame. Defaults put it upper-centre, clear of a figure's head. */
  x?: number;
  y?: number;
  /** Which edge the tail leaves from, i.e. roughly where the speaker is. */
  tail?: BubbleTail;
  /** Where the tail sits along that edge, 0..1 (left→right on top/bottom, top→bottom on the sides). */
  tailAt?: number;
  /** Tail length as a fraction of frame height. */
  tailLength?: number;
  /**
   * Lateral lean of the tail's tip, as a multiple of its length. Positive leans right (top/bottom
   * tails) or down (side tails). The reference's balloons lean their tails toward the speaker rather
   * than dropping them square.
   */
  tailSkew?: number;
  /** Width ceiling as a fraction of frame width. The balloon is only ever as wide as its text needs. */
  maxWidth?: number;
  /** Wrap ceiling. Past this the text shrinks instead of adding lines. */
  maxLines?: number;
  /** Play the entrance from the current Sequence's frame 0. Off = render settled (stills, thumbs). */
  animate?: boolean;
};

export const SpeechBubble: React.FC<SpeechBubbleProps> = ({
  text,
  x = 0.5,
  y = 0.24,
  tail = 'down',
  tailAt = 0.5,
  tailLength = TAIL_LEN_FRAC,
  tailSkew = 0,
  maxWidth = BUBBLE_MAX_W_FRAC,
  maxLines = BUBBLE_MAX_LINES,
  animate = true,
}) => {
  const {width, height} = useVideoConfig();
  const ready = useCrayonFace('bubble');
  const {opacity, scale} = useEntrance(animate);

  // Not laid out yet: the delayRender in useCrayonFace guarantees no frame is captured in this state.
  if (!ready) return null;

  const fit = fitText(text, {
    maxLines,
    maxFontSize: height * BUBBLE_TEXT_MAX_FRAC,
    boxWidth: width * maxWidth,
    boxHeight: height * BUBBLE_MAX_H_FRAC,
    padXEm: PAD_X_EM,
    padYEm: PAD_Y_EM,
    who: 'bubble',
  });

  // The balloon is sized FROM the fitted text, which is why a long line cannot overflow it.
  const boxW = (fit.widestEm + 2 * PAD_X_EM) * fit.fontSize;
  const boxH = (fit.lines.length * LINE_HEIGHT + 2 * PAD_Y_EM) * fit.fontSize;
  const cx = x * width;
  const cy = y * height;
  const x0 = cx - boxW / 2;
  const y0 = cy - boxH / 2;

  const len = tailLength * height;
  const d = balloonPath(x0, y0, x0 + boxW, y0 + boxH, RADIUS_FRAC * Math.min(boxW, boxH), {
    side: tail,
    at: tailAt,
    len,
    halfW: TAIL_HALF_W_OF_LEN * len,
    skew: tailSkew,
  });

  return (
    <AbsoluteFill style={{opacity}}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        // scale about the balloon's own centre, not the frame's: the frame is locked
        style={{transform: `scale(${scale})`, transformOrigin: `${cx}px ${cy}px`}}
      >
        <path
          d={d}
          fill={PAPER_WHITE}
          stroke={INK}
          strokeWidth={strokeAt(width)}
          strokeLinejoin="round"
          // the tail's tip is a sharp spike; a mitre there would spear off-frame
          strokeMiterlimit={2}
        />
        <TextBlock
          lines={fit.lines}
          fontSize={fit.fontSize}
          anchorX={cx}
          pivotX={cx}
          cy={cy}
          align="center"
          fill={INK}
          // black script on a flat white balloon already separates; a keyline would only fatten it
          keyline={0}
          keylineColor={INK}
        />
      </svg>
    </AbsoluteFill>
  );
};

// ---------------------------------------------------------------------------
// Public API — FloatingDialogue
// ---------------------------------------------------------------------------

export type FloatingDialogueProps = {
  /** One utterance, laid straight onto the scene with no balloon (the wolf 3:34 reference). */
  text: string;
  /** Block centre, as fractions of the frame. */
  x?: number;
  y?: number;
  /** 3:34 sets its three lines flush left; centred is offered for a one-liner over a symmetric scene. */
  align?: 'center' | 'left';
  /**
   * Glyph colour. Defaults to INK.
   *
   * WHAT AN EXPLICIT COLOUR CAN AND CANNOT DO (WO-31). It chooses the POLARITY of the device — dark
   * script on a light keyline, or the reference's light script on a dark one. It cannot choose an
   * unreadable one: whatever it is, `keylineFor` pairs it with the opposite extreme and `assertLegible`
   * refuses the pair if it does not clear `FLOAT_MIN_CONTRAST`. There is no colour a caller can pass
   * that renders this device illegible against its own ground, and no way to render it without one.
   *
   * WHY THERE IS NO `ground` PARAMETER ANY MORE, AND WHY THE DEFAULT IS A CONSTANT (WO-25).
   *
   * This device has now produced the SAME defect — white script, illegible, on a pale ground — in two
   * consecutive QA passes, at t28 and then at t022. The first fix took a `ground` colour from the
   * caller and picked white or INK off its luminance. It did not work, and it could not have: the
   * colour the renderer had to give was `sceneColors(resolveSceneKey(...)).bg`, the scene KEY's ground
   * — and the key's `bg` is not the colour behind the glyphs. It is the colour of the base rect a
   * template paints FIRST and then covers. What is actually behind a line of floating dialogue is
   * whatever plane the template drew there, and those come off the TONE LADDER (`crayonStyle.shade`),
   * whose light rungs are by design the large-area tones — "the paper, plaster, cardboard and
   * newsprint that covers half of some frames". Measured on the failing frame: `closeUpPortrait` is
   * keyed `alarm`, whose `bg` is a dark saturated orange (relative luminance well under 0.5, so the
   * old rule chose white), while the wall the line lands on is `tn.card` and the window beside it is
   * `shade(c.bg, 3)` — both pale. The rule read the right value of the wrong quantity, so it was
   * always going to be right on some scenes and wrong on others, and "fixing" it per scene (t105 in
   * this very episode carries a hand-written `color="#000000"`) is how it kept coming back.
   *
   * A frame is not one colour, so no single sampled ground can be the answer either. What IS true for
   * every keyed tone the system can produce: `TONE_CEIL` (0.93) and `TONE_LUM_FLOOR` bound the ladder
   * away from both white and black, so INK glyphs carry real contrast against every plane in the
   * palette — most of them strongly — and the flat `FLOAT_KEYLINE_EM` keyline, drawn in the opposite
   * polarity, covers the dark end where that contrast is thinnest. That is a guarantee by
   * construction rather than a guess about art the renderer cannot see.
   *
   * The reference's own white-over-mid-grey-wall look (wolf 3:34) is still available, and is now an
   * explicit editorial choice: pass `color="#ffffff"` on a scene whose plane is genuinely mid-tone.
   */
  color?: string;
  /** Width ceiling as a fraction of frame width. */
  maxWidth?: number;
  /** Wrap ceiling. Past this the text shrinks instead of adding lines. */
  maxLines?: number;
  /**
   * The keyline's weight in em (see `FLOAT_KEYLINE_EM`), floored at `FLOAT_KEYLINE_MIN_EM`. Heavier
   * is allowed; lighter — and 0 in particular — RAISES, because the keyline is this device's ground
   * and without it legibility goes back to being a guess about art the renderer cannot see.
   */
  keyline?: number;
  /** Play the entrance from the current Sequence's frame 0. */
  animate?: boolean;
};

// ---------------------------------------------------------------------------
// The legibility guarantee (WO-31)
// ---------------------------------------------------------------------------
//
// THIS DEVICE HAS NOW PRODUCED THE SAME DEFECT IN FOUR CONSECUTIVE QA PASSES — t28, t022, t105, t105
// again — and every fix before this one changed a COLOUR. That is why they kept failing: the failing
// quantity was never the colour, it was the CONTRAST of a pair, and neither half of the pair was
// something the earlier rules actually held.
//
//   * Fix 1 paired the glyph with the scene key's `bg`. Wrong quantity: `bg` is the rect a template
//     paints first and then covers, not the plane under the glyphs.
//   * Fix 2 (WO-25) gave up on knowing the plane — correctly — and paired INK with a keyline in the
//     opposite polarity. Right idea, but it was left as a DEFAULT and a comment. `color` stayed an
//     open parameter documented as "an explicit editorial choice", `keyline` could still be set to 0,
//     and nothing anywhere computed the ratio the argument turned on. The guarantee was asserted in
//     prose and enforced nowhere.
//
// So the rule is moved out of the prose and into the code. The pair the device is judged on is
// (glyph, keyline) — both of them values this module chooses or validates, neither of them a guess
// about the art — and the ratio between them is COMPUTED and REQUIRED. An unreadable combination can
// no longer render: it raises.

/** WCAG relative luminance of an `#rrggbb`, with the sRGB transfer curve applied (not a raw mean). */
const luminance = (hex: string, who: string): number => {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) {
    throw new Error(`bubble: ${who} colour must be #rrggbb, got ${JSON.stringify(hex)}`);
  }
  const [r, g, b] = [0, 2, 4]
    .map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio, 1:1 (identical) to 21:1 (black on white). */
const contrast = (a: string, b: string, who: string): number => {
  const [la, lb] = [luminance(a, who), luminance(b, who)];
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
};

/**
 * The ground for `ink`: whichever of the palette's two extremes is further from it.
 *
 * Not `isLight(ink) ? INK : PAPER_WHITE` on a 0.5 split, which is the same coin-flip shape as the
 * rules that failed — it picks a side without ever asking how much contrast that side actually buys.
 * This picks the BETTER of the two and hands the number to `assertLegible`, so the choice and the
 * check are one computation.
 */
const keylineFor = (ink: string, who: string): string =>
  contrast(ink, PAPER_WHITE, who) >= contrast(ink, INK, who) ? PAPER_WHITE : INK;

/** The whole guarantee, in one place: no glyph/ground pair under `FLOAT_MIN_CONTRAST` ever renders. */
const assertLegible = (ink: string, ground: string, text: string): void => {
  const ratio = contrast(ink, ground, 'FloatingDialogue');
  if (ratio < FLOAT_MIN_CONTRAST) {
    throw new Error(
      `bubble: FloatingDialogue ${JSON.stringify(text.slice(0, 40))} would render illegibly — glyph ` +
      `${ink} against its best available keyline ${ground} is ${ratio.toFixed(2)}:1, under the ` +
      `${FLOAT_MIN_CONTRAST}:1 this device requires. Unballooned script has no balloon behind it, so ` +
      `the keyline is its only ground: a colour that contrasts with neither ${INK} nor ${PAPER_WHITE} ` +
      `cannot be made readable by any keyline at all. Pass a colour nearer one end of the ramp.`
    );
  }
};

export const FloatingDialogue: React.FC<FloatingDialogueProps> = ({
  text,
  x = 0.5,
  y = 0.22,
  align = 'left',
  color = INK,
  maxWidth = FLOAT_MAX_W_FRAC,
  maxLines = FLOAT_MAX_LINES,
  keyline = FLOAT_KEYLINE_EM,
  animate = true,
}) => {
  const {width, height} = useVideoConfig();
  const ready = useCrayonFace('floating dialogue');
  const {opacity, scale} = useEntrance(animate);

  // The pair, and the check on it. `luminance` validates the hex on the way through, so a malformed
  // writer-supplied colour still raises here rather than rendering as a browser-default black.
  const ink = color;
  const keylineColor = keylineFor(ink, 'FloatingDialogue');
  assertLegible(ink, keylineColor, text);
  // …and the one way a keyline could still go missing without the floor noticing: a writer-supplied
  // non-number. `NaN < FLOAT_KEYLINE_MIN_EM` is FALSE, so it would sail past the floor below and land
  // in `strokeWidth`, where SVG drops the attribute — bare glyphs, no ground, no error, which is the
  // exact failure the floor exists to make impossible. So the type is checked before the value.
  if (typeof keyline !== 'number' || !Number.isFinite(keyline)) {
    throw new Error(
      `bubble: FloatingDialogue ${JSON.stringify(text.slice(0, 40))} was given a non-numeric ` +
      `keyline ${JSON.stringify(keyline)}. It is a width in em and it is this device's only ground; ` +
      `a value SVG cannot use silently removes the ground rather than failing, so it raises here.`
    );
  }
  if (keyline < FLOAT_KEYLINE_MIN_EM) {
    throw new Error(
      `bubble: FloatingDialogue ${JSON.stringify(text.slice(0, 40))} was given keyline=${keyline} em, ` +
      `under the ${FLOAT_KEYLINE_MIN_EM} em floor. The keyline is this device's GROUND — it is the ` +
      `surface the ${FLOAT_MIN_CONTRAST}:1 guarantee is measured against — so thinning it away puts ` +
      `the glyphs back on whatever plane the template happened to draw, which is the defect this ` +
      `device has shipped three times. Heavier is fine; lighter is not.`
    );
  }

  if (!ready) return null;

  const fit = fitText(text, {
    maxLines,
    maxFontSize: height * FLOAT_TEXT_MAX_FRAC,
    boxWidth: width * maxWidth,
    boxHeight: height * BUBBLE_MAX_H_FRAC,
    padXEm: 0,
    padYEm: 0,
    who: 'floating dialogue',
  });

  const cx = x * width;
  const cy = y * height;
  // flush-left: `x` still names the block's centre, so the block's left edge is derived from its width
  const anchorX = align === 'center' ? cx : cx - (fit.widestEm * fit.fontSize) / 2;

  return (
    <AbsoluteFill style={{opacity}}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        width={width}
        height={height}
        style={{transform: `scale(${scale})`, transformOrigin: `${cx}px ${cy}px`}}
      >
        <TextBlock
          lines={fit.lines}
          fontSize={fit.fontSize}
          anchorX={anchorX}
          pivotX={cx}
          cy={cy}
          align={align}
          fill={ink}
          keyline={keyline * fit.fontSize}
          keylineColor={keylineColor}
        />
      </svg>
    </AbsoluteFill>
  );
};
