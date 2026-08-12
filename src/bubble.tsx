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
// Presentational only: it renders a balloon / a line of dialogue and nothing else. Timeline integration
// is a later work order — this file has no importers yet, exactly like textcard.tsx.

import React, {useEffect, useState} from 'react';
import {
  AbsoluteFill,
  cancelRender,
  continueRender,
  delayRender,
  interpolate,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion';

import {CRAYON_FONT, CRAYON_TEXT_SLANT_DEG, INK, PAPER_WHITE, strokeAt} from './crayonStyle';

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

/** Line pitch / font size, matching textcard.tsx so both devices set the same script the same way. */
const LINE_HEIGHT = 1.25;

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
 */
const FLOAT_KEYLINE_EM = 0.045;

// One weight for everything, as in textcard.tsx: the reference's hierarchy is size, never stroke weight.
const WEIGHT = 400;

/** skewX(-Ndeg): Caveat ships upright-only, so the reference's forward lean is synthetic (crayonStyle). */
const SLANT_TAN = Math.tan((CRAYON_TEXT_SLANT_DEG * Math.PI) / 180);

// ---------------------------------------------------------------------------
// Measurement
//
// Deliberately duplicated from textcard.tsx rather than imported: that module exports a card and
// nothing else, and this work order builds self-contained components. Same technique, same guarantees
// — measure in the REAL vendored face via a 2D canvas, behind delayRender, cancelRender on failure,
// never a silent fall back to a system sans.
// ---------------------------------------------------------------------------

const MEASURE_PX = 100;

let measureCtx: CanvasRenderingContext2D | null = null;
const measureCache = new Map<string, number>();

const context2d = (): CanvasRenderingContext2D => {
  if (!measureCtx) {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) {
      throw new Error('bubble: no 2D canvas context — cannot measure text for auto-fit');
    }
    measureCtx = ctx;
  }
  measureCtx.font = `${WEIGHT} ${MEASURE_PX}px "${CRAYON_FONT}"`;
  return measureCtx;
};

/** Advance width of `text` in em, measured in the real vendored face. */
const measureEm = (text: string): number => {
  const hit = measureCache.get(text);
  if (hit !== undefined) return hit;
  const em = context2d().measureText(text).width / MEASURE_PX;
  measureCache.set(text, em);
  return em;
};

/**
 * Ascent/descent of the face, in em. Used to put each SVG baseline at the optical centre of its line
 * box; SVG's own `dominant-baseline` keywords are defined against x-height/ideographic boxes and put a
 * face with Caveat's very tall ascenders visibly high in a balloon.
 */
let faceMetrics: {ascent: number; descent: number} | null = null;
const metrics = (): {ascent: number; descent: number} => {
  if (faceMetrics) return faceMetrics;
  const m = context2d().measureText('Hgpqy');
  if (m.fontBoundingBoxAscent === undefined || m.fontBoundingBoxDescent === undefined) {
    throw new Error('bubble: TextMetrics has no fontBoundingBox* — cannot place baselines');
  }
  faceMetrics = {
    ascent: m.fontBoundingBoxAscent / MEASURE_PX,
    descent: m.fontBoundingBoxDescent / MEASURE_PX,
  };
  return faceMetrics;
};

/**
 * Width in em of a laid-out line: its advance width plus the horizontal excursion the skew adds
 * (skewX is applied about the block centre, so half the line box leans each way).
 */
const lineEm = (text: string): number => measureEm(text) + SLANT_TAN * LINE_HEIGHT;

// ---------------------------------------------------------------------------
// Wrapping + fitting
// ---------------------------------------------------------------------------

/**
 * Break `words` into exactly `n` lines minimising the widest line (DP over break points), so a
 * two-line balloon reads as two balanced lines instead of one full line plus an orphan.
 * Returns null when there are fewer words than lines.
 */
const balancedWrap = (words: string[], n: number): string[] | null => {
  if (n > words.length) return null;
  const W = words.length;
  const span = (i: number, j: number): number => lineEm(words.slice(i, j).join(' '));

  // best[k][i] = minimal achievable widest-line using k lines for words[0..i)
  const best: number[][] = Array.from({length: n + 1}, () => new Array<number>(W + 1).fill(Infinity));
  const cut: number[][] = Array.from({length: n + 1}, () => new Array<number>(W + 1).fill(-1));
  best[0][0] = 0;
  for (let k = 1; k <= n; k++) {
    for (let i = k; i <= W; i++) {
      for (let j = k - 1; j < i; j++) {
        if (best[k - 1][j] === Infinity) continue;
        const cand = Math.max(best[k - 1][j], span(j, i));
        if (cand < best[k][i]) {
          best[k][i] = cand;
          cut[k][i] = j;
        }
      }
    }
  }
  if (best[n][W] === Infinity) return null;
  const out: string[] = [];
  let i = W;
  for (let k = n; k >= 1; k--) {
    const j = cut[k][i];
    out.unshift(words.slice(j, i).join(' '));
    i = j;
  }
  return out;
};

type Fit = {lines: string[]; fontSize: number; widestEm: number};

type FitOpts = {
  maxLines: number;
  maxFontSize: number;
  /** Box the LINES must fit, in px. Balloon padding is added by the caller via `padEm`. */
  boxWidth: number;
  boxHeight: number;
  /** Extra em added to the measured block on each axis before it is fitted (balloon padding). */
  padXEm: number;
  padYEm: number;
  who: string;
};

/**
 * Largest font size (capped) at which `text` fits the box, choosing the line count that yields it.
 *
 * All the width arithmetic is in em, which is what makes a balloon that GROWS work: the balloon's
 * padding scales with the text, so "box width = (widest line + 2·padX) · fontSize" can be solved for
 * fontSize directly instead of iterating.
 */
const fitText = (text: string, opts: FitOpts): Fit => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    throw new Error(`${opts.who}: refusing to render empty dialogue`);
  }
  let best: Fit | null = null;
  for (let n = 1; n <= Math.min(opts.maxLines, words.length); n++) {
    const lines = balancedWrap(words, n);
    if (!lines) continue;
    const widestEm = Math.max(...lines.map(lineEm));
    const fontSize = Math.min(
      opts.maxFontSize,
      opts.boxWidth / (widestEm + 2 * opts.padXEm),
      opts.boxHeight / (n * LINE_HEIGHT + 2 * opts.padYEm)
    );
    // strictly-greater keeps the fewest lines on a tie (a balloon prefers 1 line, then 2)
    if (!best || fontSize > best.fontSize + 0.5) best = {lines, fontSize, widestEm};
  }
  if (!best) {
    throw new Error(`${opts.who}: could not lay out ${JSON.stringify(text)} in ${opts.maxLines} line(s)`);
  }
  return best;
};

// ---------------------------------------------------------------------------
// Font gate
//
// Auto-fit measures in the REAL face; measuring before the vendored woff2 is live would size the
// balloon against a fallback. Hold the render open until the face is available (loadFont() in
// crayonFont.ts already cancels the render outright if the file is missing).
// ---------------------------------------------------------------------------

const useCrayonFace = (who: string): boolean => {
  const [ready, setReady] = useState(
    () => typeof document !== 'undefined' && document.fonts.check(`${MEASURE_PX}px "${CRAYON_FONT}"`)
  );
  useEffect(() => {
    if (ready) return;
    const handle = delayRender(`${who}: waiting for the ${CRAYON_FONT} face`);
    let settled = false;
    const done = () => {
      if (settled) return;
      settled = true;
      continueRender(handle);
    };
    document.fonts
      .load(`${WEIGHT} ${MEASURE_PX}px "${CRAYON_FONT}"`)
      .then((faces) => {
        if (faces.length === 0) {
          cancelRender(new Error(`${who}: the ${CRAYON_FONT} face never registered — cannot auto-fit text`));
          return;
        }
        setReady(true);
        done();
      })
      .catch((err) => cancelRender(err));
    return done;
  }, [ready, who]);
  return ready;
};

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
  const {ascent, descent} = metrics();
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

/** Restrained entrance: opacity plus a scale about the element's own centre. The camera never moves. */
const useEntrance = (animate: boolean): {opacity: number; scale: number} => {
  const frame = useCurrentFrame();
  if (!animate) return {opacity: 1, scale: 1};
  const t = interpolate(frame, [0, BUBBLE_ENTRANCE_FRAMES], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });
  return {opacity: t, scale: ENTRANCE_SCALE_FROM + (1 - ENTRANCE_SCALE_FROM) * t};
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
  /** Glyph colour. White is the reference (over a mid-grey wall); INK reads on a pale ground. */
  color?: string;
  /** Width ceiling as a fraction of frame width. */
  maxWidth?: number;
  /** Wrap ceiling. Past this the text shrinks instead of adding lines. */
  maxLines?: number;
  /**
   * Flat keyline under the glyphs so white script survives a mid-tone ground, in em (see
   * FLOAT_KEYLINE_EM). Pass 0 for the bare glyphs. The keyline is INK when the text is light and
   * PAPER_WHITE when it is not, so it always separates rather than thickening.
   */
  keyline?: number;
  /** Play the entrance from the current Sequence's frame 0. */
  animate?: boolean;
};

/** Relative luminance, to pick a keyline that contrasts with the glyph rather than merging into it. */
const isLight = (hex: string): boolean => {
  const m = /^#([0-9a-fA-F]{6})$/.exec(hex.trim());
  if (!m) {
    throw new Error(`bubble: FloatingDialogue colour must be #rrggbb, got ${JSON.stringify(hex)}`);
  }
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.5;
};

export const FloatingDialogue: React.FC<FloatingDialogueProps> = ({
  text,
  x = 0.5,
  y = 0.22,
  align = 'left',
  color = PAPER_WHITE,
  maxWidth = FLOAT_MAX_W_FRAC,
  maxLines = FLOAT_MAX_LINES,
  keyline = FLOAT_KEYLINE_EM,
  animate = true,
}) => {
  const {width, height} = useVideoConfig();
  const ready = useCrayonFace('floating dialogue');
  const {opacity, scale} = useEntrance(animate);

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
          fill={color}
          keyline={keyline * fit.fontSize}
          keylineColor={isLight(color) ? INK : PAPER_WHITE}
        />
      </svg>
    </AbsoluteFill>
  );
};
