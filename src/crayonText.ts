// CRAYON shared text engine — measure, wrap, fit, and the font gate.
//
// WHY THIS FILE EXISTS (WO-12a). `textcard.tsx` (WO-5) and `bubble.tsx` (WO-6/7) were each built
// self-contained and proven in isolation, and each grew its own copy of the same ~90 lines: a canvas
// em-measurement against the REAL vendored Caveat, a balanced-wrap DP over break points, a solve for
// the largest font size that fits a box, and a delayRender() gate that holds the render open until the
// face is live. WO-6/7 flagged the duplication explicitly and recommended this extraction. Both copies
// were tuned against measured reference dimensions, so this module is a MERGE, not a rewrite: every
// formula below is byte-for-byte the arithmetic both files already ran.
//
// The two copies differed in exactly two ways, both now parameters rather than forks:
//   * textcard passed a `weight` through (it registers Caveat 400 and 700 even though nothing asks for
//     700 today); bubble hardcoded 400. -> `weight`, defaulting to CRAYON_TEXT_WEIGHT.
//   * bubble fitted a box that INCLUDES balloon padding, in em of the text's own size (which is what
//     makes a balloon that grows with its text solvable in one step instead of iteratively); textcard
//     had no padding. -> `padXEm` / `padYEm`, defaulting to 0, which reduces bubble's formula exactly
//     to textcard's.
//
// Non-negotiable, and preserved verbatim: text is measured in the vendored face or NOT AT ALL. There is
// no fallback to a system sans anywhere in here — `useCrayonFace` holds the render open with
// delayRender() and `cancelRender()`s outright if the face never registers, because a card silently set
// in Helvetica would ship an episode in the wrong typeface (CRAYON_BIBLE §7).
//
// One deliberate difference from the two originals: the diagnostic strings for the two unreachable
// low-level failures (no 2D canvas context; TextMetrics without fontBoundingBox*) now say `crayonText:`
// instead of `textcard:` / `bubble:`, because the code that raises them no longer belongs to either
// module, and `fitText`'s empty-input message is one shared phrasing instead of two. Every caller-facing
// message that names a module still does, via `who`.

import {useEffect, useState} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';

import {CRAYON_FONT, CRAYON_TEXT_SLANT_DEG} from './crayonStyle';

// ---------------------------------------------------------------------------
// Shared type-setting constants
// ---------------------------------------------------------------------------

/** The size the 2D canvas measures at; results are divided back out to em, so this is arbitrary. */
export const MEASURE_PX = 100;

/** Line pitch / font size. Reference pitch 26–28 cell px against a ~21 cell px ink height. */
export const LINE_HEIGHT = 1.25;

/**
 * One weight for everything. On the 4:05 reference chapter card the title and its subtitle carry the
 * same stroke weight — hierarchy is size alone — so a bold title would be an invention, not a match.
 * (crayonFont.ts also registers Caveat 700; nothing in the renderer asks for it.)
 */
export const CRAYON_TEXT_WEIGHT = 400;

/** skewX(-Ndeg): Caveat ships upright-only, so the reference's forward lean is synthetic (crayonStyle). */
export const SLANT_TAN = Math.tan((CRAYON_TEXT_SLANT_DEG * Math.PI) / 180);

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

let measureCtx: CanvasRenderingContext2D | null = null;
const measureCache = new Map<string, number>();

/** The shared measuring context, with the face + weight already selected. */
const context2d = (weight: number): CanvasRenderingContext2D => {
  if (!measureCtx) {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) {
      throw new Error('crayonText: no 2D canvas context — cannot measure text for auto-fit');
    }
    measureCtx = ctx;
  }
  measureCtx.font = `${weight} ${MEASURE_PX}px "${CRAYON_FONT}"`;
  return measureCtx;
};

/** Advance width of `text` in em, measured in the real vendored face via a 2D canvas. */
export const measureEm = (text: string, weight: number = CRAYON_TEXT_WEIGHT): number => {
  const key = `${weight}|${text}`;
  const hit = measureCache.get(key);
  if (hit !== undefined) return hit;
  const em = context2d(weight).measureText(text).width / MEASURE_PX;
  measureCache.set(key, em);
  return em;
};

/**
 * Width in em of a laid-out line: its advance width plus the horizontal excursion the skew adds
 * (skewX is applied about the block centre, so half the line box leans each way).
 */
export const lineEm = (text: string, weight: number = CRAYON_TEXT_WEIGHT): number =>
  measureEm(text, weight) + SLANT_TAN * LINE_HEIGHT;

/**
 * Ascent/descent of the face, in em. Used to put an SVG baseline at the optical centre of its line
 * box; SVG's own `dominant-baseline` keywords are defined against x-height/ideographic boxes and put a
 * face with Caveat's very tall ascenders visibly high in a balloon.
 */
const metricsCache = new Map<number, {ascent: number; descent: number}>();
export const faceMetrics = (weight: number = CRAYON_TEXT_WEIGHT): {ascent: number; descent: number} => {
  const hit = metricsCache.get(weight);
  if (hit) return hit;
  const m = context2d(weight).measureText('Hgpqy');
  if (m.fontBoundingBoxAscent === undefined || m.fontBoundingBoxDescent === undefined) {
    throw new Error('crayonText: TextMetrics has no fontBoundingBox* — cannot place baselines');
  }
  const out = {
    ascent: m.fontBoundingBoxAscent / MEASURE_PX,
    descent: m.fontBoundingBoxDescent / MEASURE_PX,
  };
  metricsCache.set(weight, out);
  return out;
};

// ---------------------------------------------------------------------------
// Wrapping + fitting
// ---------------------------------------------------------------------------

/**
 * Break `words` into exactly `n` lines minimising the widest line (DP over break points), so a
 * two-line block reads as two balanced lines instead of one full line plus an orphan.
 * Returns null when there are fewer words than lines.
 */
export const balancedWrap = (
  words: string[],
  n: number,
  weight: number = CRAYON_TEXT_WEIGHT
): string[] | null => {
  if (n > words.length) return null;
  const W = words.length;
  const span = (i: number, j: number): number => lineEm(words.slice(i, j).join(' '), weight);

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

export type Fit = {
  lines: string[];
  fontSize: number;
  /** Widest laid-out line, in em — what a balloon sizes its own box from. */
  widestEm: number;
};

export type FitOpts = {
  /** Names the calling module in error messages ('textcard', 'bubble', 'floating dialogue', …). */
  who: string;
  maxLines: number;
  maxFontSize: number;
  /** Box the LINES-PLUS-PADDING must fit, in px. */
  boxWidth: number;
  boxHeight: number;
  weight?: number;
  /** Extra em added to the measured block on each axis before it is fitted (balloon padding). */
  padXEm?: number;
  padYEm?: number;
};

/**
 * Largest font size (capped) at which `text` fits the box, choosing the line count that yields it.
 *
 * All the width arithmetic is in em, which is what makes a balloon that GROWS work: the balloon's
 * padding scales with the text, so "box width = (widest line + 2·padX) · fontSize" can be solved for
 * fontSize directly instead of iterating. With padX/padY at their 0 defaults this is exactly the
 * plain-block fit a full-screen text card wants.
 */
export const fitText = (text: string, opts: FitOpts): Fit => {
  const weight = opts.weight ?? CRAYON_TEXT_WEIGHT;
  const padXEm = opts.padXEm ?? 0;
  const padYEm = opts.padYEm ?? 0;
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    throw new Error(`${opts.who}: refusing to lay out empty text`);
  }
  let best: Fit | null = null;
  for (let n = 1; n <= Math.min(opts.maxLines, words.length); n++) {
    const lines = balancedWrap(words, n, weight);
    if (!lines) continue;
    const widestEm = Math.max(...lines.map((l) => lineEm(l, weight)));
    const fontSize = Math.min(
      opts.maxFontSize,
      opts.boxWidth / (widestEm + 2 * padXEm),
      opts.boxHeight / (n * LINE_HEIGHT + 2 * padYEm)
    );
    // strictly-greater keeps the fewest lines on a tie (the reference prefers 1 line, then 2)
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
// Auto-fit measures in the REAL face; measuring before the vendored woff2 is live would size the block
// against a fallback. Hold the render open until the face is available (loadFont() in crayonFont.ts
// already cancels the render outright if the file is missing).
// ---------------------------------------------------------------------------

export const useCrayonFace = (who: string): boolean => {
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
      .load(`${CRAYON_TEXT_WEIGHT} ${MEASURE_PX}px "${CRAYON_FONT}"`)
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
