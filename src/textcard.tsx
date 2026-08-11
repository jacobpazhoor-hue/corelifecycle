// CRAYON full-screen text cards — bible §6 devices 1–2, typography §7.
//
// The reference channel's two text-card devices, both confirmed in ≥2 videos:
//   1. narration card  — 1–2 centred lines of handwritten script, white-ground/black-text OR
//                        black-ground/white-text, used for narration emphasis; and the dramatic
//                        single-word beat (a frame carrying only the word "It").
//   2. chapter card    — a large title over a smaller subtitle, matching the YouTube chapter names
//                        ("The Day America Fell" / "Black Tuesday and the Market Collapse").
//
// Measured off the verified frames (docs/research/crayon/frames/, each montage cell is one full
// 16:9 frame at 308×174, so 1 cell px = 6.207 px at 1080):
//   depression 2:00  white ground #ffffff, black text, 2 lines, line ink width 0.53 of frame width,
//                    line pitch 26 cell px ≈ 161 px @1080
//   depression 4:05  black ground #000000, white text, title 0.565 wide over subtitle 0.766 wide
//   depression 6:00  black ground, white text, one sentence wrapped to 2 lines, widest 0.805 of frame
//   wolf       7:10  black ground, the single word "It", ink height 16 cell px ≈ 0.13 of frame height
// (Both grounds sample as EXACTLY #000000 / #ffffff in those frames — hence INK / PAPER_WHITE, no
// separate "near-black" token.)
//
// Presentational only: it renders a card and nothing else. Timeline integration is a later work order.

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

import {CRAYON_FONT, CRAYON_SUBTITLE_RATIO, CRAYON_TEXT_SLANT_DEG, INK, PAPER_WHITE} from './crayonStyle';

// ---------------------------------------------------------------------------
// Entrance
// ---------------------------------------------------------------------------

/**
 * Entrance length in frames.
 *
 * ⚠ UNVERIFIED. The research explicitly did NOT measure the reference's reveal easing or duration
 * (CRAYON_BIBLE closing "Open risks"). This is a restrained placeholder — a fade with a small settle
 * — not a matched value. Retune here; nothing else in this file encodes the timing.
 */
export const TEXTCARD_ENTRANCE_FRAMES = 10;

/** The "settle" half of the entrance: how far the block rises into place, in px at 1080. Also unverified. */
const ENTRANCE_RISE_PX = 12;

// ---------------------------------------------------------------------------
// Layout constants (fractions of the composition, so the card is resolution-independent)
// ---------------------------------------------------------------------------

/** Text never crosses this fraction of the frame width. Reference widest line measured 0.805. */
const BOX_W_FRAC = 0.82;
/** …nor this fraction of the frame height. Generous: the reference blocks are far shorter. */
const BOX_H_FRAC = 0.62;

/** Cap sizes, as a fraction of frame height. Reference: narration ≈0.12, chapter title ≈0.13, "It" ≈0.13. */
const NARRATION_MAX_FRAC = 0.12;
const CHAPTER_TITLE_MAX_FRAC = 0.13;
const WORD_MAX_FRAC = 0.13;

/** Line pitch / font size. Reference pitch 26–28 cell px against a ~21 cell px ink height. */
const LINE_HEIGHT = 1.25;

/** Gap between the chapter title block and its subtitle, in title-em. Reference pitch 27 cell px. */
const CHAPTER_GAP_EM = 0.18;

/** The reference sets narration as 1–2 lines (bible §6.1); long lines shrink rather than wrap to 3. */
const NARRATION_MAX_LINES = 2;
const CHAPTER_TITLE_MAX_LINES = 2;
const CHAPTER_SUB_MAX_LINES = 2;

// One weight for everything. On the 4:05 reference the chapter title and its subtitle carry the same
// stroke weight — hierarchy is size alone — so a bold title would be an invention, not a match.
// (crayonFont.ts also registers Caveat 700; nothing here asks for it.)
const WEIGHT = 400;

/** skewX(-Ndeg): Caveat ships upright-only, so the reference's forward lean is synthetic (crayonStyle). */
const SLANT_TAN = Math.tan((CRAYON_TEXT_SLANT_DEG * Math.PI) / 180);

// ---------------------------------------------------------------------------
// Measurement
// ---------------------------------------------------------------------------

const MEASURE_PX = 100;

let measureCtx: CanvasRenderingContext2D | null = null;
const measureCache = new Map<string, number>();

/** Advance width of `text` in em, measured in the real vendored face via a 2D canvas. */
const measureEm = (text: string, weight: number): number => {
  const key = `${weight}|${text}`;
  const hit = measureCache.get(key);
  if (hit !== undefined) return hit;
  if (!measureCtx) {
    const ctx = document.createElement('canvas').getContext('2d');
    if (!ctx) {
      throw new Error('textcard: no 2D canvas context — cannot measure text for auto-fit');
    }
    measureCtx = ctx;
  }
  measureCtx.font = `${weight} ${MEASURE_PX}px "${CRAYON_FONT}"`;
  const em = measureCtx.measureText(text).width / MEASURE_PX;
  measureCache.set(key, em);
  return em;
};

/**
 * Width in em of a laid-out line: its advance width plus the horizontal excursion the skew adds
 * (skewX is applied about the block centre, so half the line box leans each way).
 */
const lineEm = (text: string, weight: number): number => measureEm(text, weight) + SLANT_TAN * LINE_HEIGHT;

// ---------------------------------------------------------------------------
// Wrapping + fitting
// ---------------------------------------------------------------------------

type Fit = {lines: string[]; fontSize: number};

/**
 * Break `words` into exactly `n` lines minimising the widest line (DP over break points), so a
 * two-line card reads as two balanced lines instead of one full line plus an orphan.
 * Returns null when there are fewer words than lines.
 */
const balancedWrap = (words: string[], n: number, weight: number): string[] | null => {
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

type FitOpts = {maxLines: number; maxFontSize: number; boxWidth: number; boxHeight: number; weight: number};

/** Largest font size (capped) at which `text` fits the box, choosing the best line count. */
const fitText = (text: string, opts: FitOpts): Fit => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    throw new Error('textcard: refusing to render an empty text card');
  }
  let best: Fit | null = null;
  for (let n = 1; n <= Math.min(opts.maxLines, words.length); n++) {
    const lines = balancedWrap(words, n, opts.weight);
    if (!lines) continue;
    const widest = Math.max(...lines.map((l) => lineEm(l, opts.weight)));
    const fontSize = Math.min(
      opts.maxFontSize,
      opts.boxWidth / widest,
      opts.boxHeight / (n * LINE_HEIGHT)
    );
    // strictly-greater keeps the fewest lines on a tie (the reference prefers 1 line, then 2)
    if (!best || fontSize > best.fontSize + 0.5) best = {lines, fontSize};
  }
  if (!best) {
    throw new Error(`textcard: could not lay out ${JSON.stringify(text)} in ${opts.maxLines} line(s)`);
  }
  return best;
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/** white = black text on white paper; black = white text on black. Both are used by the reference. */
export type CrayonGround = 'white' | 'black';

export type TextCardKind =
  /** 1–2 centred lines of narration. `text` is one string; line breaking is automatic. */
  | {kind: 'narration'; text: string}
  /** Large title over a subtitle at CRAYON_SUBTITLE_RATIO of its size (the 4:05 reference). */
  | {kind: 'chapter'; title: string; subtitle: string}
  /** One short word alone on the frame (the 7:10 "It" reference). Ground is normally 'black'. */
  | {kind: 'word'; word: string};

export type TextCardProps = TextCardKind & {
  ground: CrayonGround;
  /** Play the entrance from the current Sequence's frame 0. Off = render settled (stills, thumbs). */
  animate?: boolean;
};

const Line: React.FC<{text: string; fontSize: number; weight: number}> = ({text, fontSize, weight}) => (
  <div
    style={{
      fontSize,
      fontWeight: weight,
      lineHeight: LINE_HEIGHT,
      // synthetic oblique: Caveat has no italic cut (crayonStyle.CRAYON_TEXT_SLANT_DEG)
      transform: `skewX(-${CRAYON_TEXT_SLANT_DEG}deg)`,
      // wrapping is computed above; never let the browser re-break a line
      whiteSpace: 'pre',
    }}
  >
    {text}
  </div>
);

export const TextCard: React.FC<TextCardProps> = (props) => {
  const {ground, animate = true} = props;
  const frame = useCurrentFrame();
  const {width, height} = useVideoConfig();

  // Auto-fit measures in the REAL face; measuring before the vendored woff2 is live would size the
  // card against a fallback. Hold the render open until the face is available (loadFont() in
  // crayonFont.ts already cancels the render outright if the file is missing).
  const [fontReady, setFontReady] = useState(
    () => typeof document !== 'undefined' && document.fonts.check(`${MEASURE_PX}px "${CRAYON_FONT}"`)
  );
  useEffect(() => {
    if (fontReady) return;
    const handle = delayRender(`textcard: waiting for the ${CRAYON_FONT} face`);
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
          cancelRender(new Error(`textcard: the ${CRAYON_FONT} face never registered — cannot auto-fit text`));
          return;
        }
        setFontReady(true);
        done();
      })
      .catch((err) => cancelRender(err));
    return done;
  }, [fontReady]);

  const boxWidth = width * BOX_W_FRAC;
  const boxHeight = height * BOX_H_FRAC;

  const op = animate
    ? interpolate(frame, [0, TEXTCARD_ENTRANCE_FRAMES], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})
    : 1;
  const rise = animate
    ? interpolate(frame, [0, TEXTCARD_ENTRANCE_FRAMES], [ENTRANCE_RISE_PX * (height / 1080), 0], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
      })
    : 0;

  // Not laid out yet: the delayRender above guarantees no frame is captured in this state.
  const body = fontReady ? renderBody(props, boxWidth, boxHeight, height) : null;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: ground === 'white' ? PAPER_WHITE : INK,
        color: ground === 'white' ? INK : PAPER_WHITE,
        fontFamily: CRAYON_FONT,
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
      }}
    >
      <div style={{opacity: op, transform: `translateY(${rise}px)`}}>{body}</div>
    </AbsoluteFill>
  );
};

const renderBody = (
  props: TextCardProps,
  boxWidth: number,
  boxHeight: number,
  height: number
): React.ReactNode => {
  if (props.kind === 'narration' || props.kind === 'word') {
    const isWord = props.kind === 'word';
    const text = isWord ? props.word : props.text;
    const fit = fitText(text, {
      maxLines: isWord ? 1 : NARRATION_MAX_LINES,
      maxFontSize: height * (isWord ? WORD_MAX_FRAC : NARRATION_MAX_FRAC),
      boxWidth,
      boxHeight,
      weight: WEIGHT,
    });
    return fit.lines.map((l, i) => <Line key={i} text={l} fontSize={fit.fontSize} weight={WEIGHT} />);
  }

  // chapter: title + subtitle locked at CRAYON_SUBTITLE_RATIO of the title size.
  // NOTE: re-measuring the 4:05 frame puts the reference's own ratio nearer 0.72–0.77 (title ink
  // 23 cell px / 0.565 frame wide vs subtitle 17 cell px / 0.766 frame wide for 36 chars), not the
  // 0.5 the bible states. This file deliberately obeys the shared token rather than forking it —
  // if the token is retuned in crayonStyle.ts, this card follows automatically.
  const title = fitText(props.title, {
    maxLines: CHAPTER_TITLE_MAX_LINES,
    maxFontSize: height * CHAPTER_TITLE_MAX_FRAC,
    boxWidth,
    boxHeight: boxHeight * 0.6,
    weight: WEIGHT,
  });
  const subWrap = fitText(props.subtitle, {
    maxLines: CHAPTER_SUB_MAX_LINES,
    // fit at the ratio first; the shared scale below is what actually enforces the box
    maxFontSize: title.fontSize * CRAYON_SUBTITLE_RATIO,
    boxWidth,
    boxHeight: boxHeight * 0.4,
    weight: WEIGHT,
  });

  // Keep the ratio exact: whatever the subtitle needed, scale BOTH so title:subtitle stays 1:ratio.
  let titleSize = Math.min(title.fontSize, subWrap.fontSize / CRAYON_SUBTITLE_RATIO);
  const blockHeight = (t: number) =>
    t * LINE_HEIGHT * title.lines.length +
    t * CHAPTER_GAP_EM +
    t * CRAYON_SUBTITLE_RATIO * LINE_HEIGHT * subWrap.lines.length;
  if (blockHeight(titleSize) > boxHeight) {
    titleSize = (titleSize * boxHeight) / blockHeight(titleSize);
  }
  const subSize = titleSize * CRAYON_SUBTITLE_RATIO;

  return (
    <>
      {title.lines.map((l, i) => (
        <Line key={`t${i}`} text={l} fontSize={titleSize} weight={WEIGHT} />
      ))}
      <div style={{height: titleSize * CHAPTER_GAP_EM}} />
      {subWrap.lines.map((l, i) => (
        <Line key={`s${i}`} text={l} fontSize={subSize} weight={WEIGHT} />
      ))}
    </>
  );
};
