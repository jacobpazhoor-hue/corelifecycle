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
// Presentational only: it renders a card and nothing else. `Video2.tsx` drives it from a scene's
// optional `card` field (WO-12a); the card knows nothing about the timeline.

import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

import {CRAYON_FONT, CRAYON_SUBTITLE_RATIO, CRAYON_TEXT_SLANT_DEG, INK, PAPER_WHITE} from './crayonStyle';
// measure/wrap/fit + the delayRender font gate, shared with bubble.tsx (WO-12a). The arithmetic is
// unchanged — it was tuned here against measured reference dimensions and simply moved out.
import {CRAYON_TEXT_WEIGHT, Fit, LINE_HEIGHT, balancedWrap, fitText, lineEm, useCrayonFace} from './crayonText';

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

/** Cap sizes, as a fraction of frame height. Reference: narration ≈0.12, "It" ≈0.13. */
const NARRATION_MAX_FRAC = 0.12;
const WORD_MAX_FRAC = 0.13;

// ---------------------------------------------------------------------------
// Narration line width — WO-25.
//
// The narration card had the SAME defect the chapter title had before WO-19, and it is worth stating
// as one fact: a height cap alone does not set type, it only stops type. §7's narration anchor is a
// WIDTH — "narration line ≈0.53 w" — and with `NARRATION_MAX_FRAC` as the only real constraint the
// card simply ran the line out to whatever `BOX_W_FRAC` (0.82) allowed. Measured on the WO-23 build,
// six cards ran 0.499–0.797 w, mean **0.622** against the reference cell's 0.536: t023 set
// "Lehman would never be small again." as ONE line 0.80 of the frame wide. That is not a copy bug
// dressed as a layout bug — the copy makes it worse, but the layout had no width target at all.
//
// So narration is set TO the measure, exactly as the chapter title is (`fitToMeasure` below is now
// shared by both): the size follows from the width the line has to fill, and the height cap goes back
// to being what it was always meant to be, a ceiling.
// ---------------------------------------------------------------------------

/** The measured anchor (bible §7): the reference's narration line fills ≈0.53 of frame width. */
const NARRATION_W_FRAC = 0.53;

/**
 * Floor below which a narration block spends another line rather than shrinking further, as a
 * fraction of frame height.
 *
 * The trade is arithmetic and cannot be wished away: at the reference's own type size a line reaches
 * 0.53 w at about 22 characters, so copy longer than that either sets smaller on one line (hitting
 * the width anchor) or wraps to two and comes in UNDER it (hitting the size anchor). 0.07 h is where
 * this episode's six cards split: the two shortest reach the anchor on one line at 0.079 h, the four
 * longest wrap to two and land 0.48–0.53 w at full 0.10–0.12 h size. Lower this and every card
 * becomes one small thin line; raise it and every card wraps and undershoots the anchor.
 */
const NARRATION_MIN_FRAC = 0.07;

// ---------------------------------------------------------------------------
// Chapter title size — WO-19.
//
// WHY THIS IS NOT A PLAIN `maxFontSize` ANY MORE. The chapter title used to be fitted exactly like
// the narration line: "as large as the box allows, capped at 0.13 of frame height". Re-measuring the
// 4:05 reference cell directly (`depression_montage_verified.jpg`, x 616–924 / y 152–326, ink =
// luma > 110) gives title ink 0.5649 w × 0.1322 h over subtitle ink 0.7662 w × 0.0977 h — and our
// card, set on the reference's OWN string, measured 0.5245 w × 0.1204 h. i.e. the same shapes, ~7%
// small, because 0.13 h was the only thing setting the size and Caveat's advance width at that size
// simply does not reach the anchor.
//
// The height cap ALSO makes the title length-dependent in the wrong direction: it hands every title
// the same type size, so a short one ("The Cotton Store", the string COMPARISON measured at
// **0.425 w**) sets far narrower than the anchor while a long one runs past it. §7's anchor is a
// WIDTH — "chapter title ≈ 0.565 w" — so the title is now set TO that measure and the height follows,
// which is what makes titles of different lengths read at one confident weight on the frame.
//
// (COMPARISON §3 fix #9 blamed the subtitle: "our 45-character subtitle wraps to two lines, and
// because title and subtitle are size-locked at 0.75, the wrap scales the whole block down". That is
// NOT what happens. Measured: `fitText` sizes that subtitle at 2 lines × 0.75 of a 140.4 px title,
// which fits its box with room to spare, so the pair-scaling below never fires and the title lands at
// exactly the cap either way. The cap was the whole miss; the subtitle was a bystander.)
// ---------------------------------------------------------------------------

/** The measured anchor (bible §7): the reference's chapter title fills 0.565 of frame width. */
const CHAPTER_TITLE_W_FRAC = 0.565;

/**
 * Ceiling on the title's type size, as a fraction of frame height. It is a GUARD, not the size: it
 * exists only so a two-word title ("The Trap") cannot inflate to poster scale chasing the width
 * anchor. 0.166 h is the size at which a 16-character title — the length of this pipeline's own
 * chapter names, and the shortest that still reaches the anchor — sets at exactly 0.565 w, so every
 * title from there up hits the anchor and only shorter ones are held back by this.
 */
const CHAPTER_TITLE_MAX_FRAC = 0.166;

/**
 * Floor below which a ONE-line title is judged too small to be a title, and the wrap goes to two
 * lines instead. 0.105 h is where the title's own type size falls to the reference subtitle's
 * (0.0977 h of ink ≈ 0.105 h set) — a title that sets smaller than a subtitle is a broken hierarchy,
 * which is the only reason to spend a second line.
 */
const CHAPTER_TITLE_MIN_FRAC = 0.105;

/** Gap between the chapter title block and its subtitle, in title-em. Reference pitch 27 cell px. */
const CHAPTER_GAP_EM = 0.18;

/** The reference sets narration as 1–2 lines (bible §6.1); long lines shrink rather than wrap to 3. */
const NARRATION_MAX_LINES = 2;
const CHAPTER_TITLE_MAX_LINES = 2;
const CHAPTER_SUB_MAX_LINES = 2;

// The face is set at ONE weight throughout — see CRAYON_TEXT_WEIGHT in crayonText.ts. On the 4:05
// reference the chapter title and its subtitle carry the same stroke weight; hierarchy is size alone.
const WEIGHT = CRAYON_TEXT_WEIGHT;

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
  // card against a fallback. The shared gate holds the render open until the face is available, and
  // cancels it outright rather than ever falling back to a system sans (crayonText.ts).
  const fontReady = useCrayonFace('textcard');

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
  const body = fontReady ? renderBody(props, boxWidth, boxHeight, width, height) : null;

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

/**
 * Set a block TO a measured width anchor rather than to a box. Used by BOTH the chapter title
 * (0.565 w) and the narration line (0.53 w) — §7 states both as widths.
 *
 * Differs from `fitText` in the one way that matters: `fitText` maximises the type size and takes
 * whichever line count gets it there, which — once the size is driven by a target width instead of a
 * cap — would break every block onto two lines (halve the widest line and the size doubles). So this
 * takes the FEWEST lines that still set at or above `floor`, which is what puts the widest line ON the
 * measure whenever the copy is long enough to reach it, and only spends another line when reaching it
 * would set the type below floor.
 *
 * `boxWidth` never binds: both anchors are inside BOX_W_FRAC (0.82 w) by construction, so the measure
 * is always the narrower constraint. `boxHeight` still does, for a two-line block.
 */
const fitToMeasure = (
  text: string,
  opts: {who: string; measure: number; ceiling: number; floor: number; maxLines: number; boxHeight: number}
): Fit => {
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) {
    throw new Error(`textcard: refusing to lay out an empty ${opts.who}`);
  }
  let fit: Fit | null = null;
  for (let n = 1; n <= Math.min(opts.maxLines, words.length); n++) {
    const lines = balancedWrap(words, n, WEIGHT);
    if (!lines) continue;
    const widestEm = Math.max(...lines.map((l) => lineEm(l, WEIGHT)));
    const fontSize = Math.min(opts.ceiling, opts.measure / widestEm, opts.boxHeight / (n * LINE_HEIGHT));
    fit = {lines, fontSize, widestEm};
    if (fontSize >= opts.floor) break; // fewest lines that still set at the device's own scale
  }
  if (!fit) {
    throw new Error(`textcard: could not lay out ${opts.who} ${JSON.stringify(text)}`);
  }
  return fit;
};

const renderBody = (
  props: TextCardProps,
  boxWidth: number,
  boxHeight: number,
  width: number,
  height: number
): React.ReactNode => {
  if (props.kind === 'word') {
    // The single-word beat is one word alone on the frame: there is no line to set to a measure, and
    // its anchor is stated as an INK HEIGHT (0.092 h), which the 0.13 h cap already lands. Unchanged.
    const fit = fitText(props.word, {
      who: 'textcard',
      maxLines: 1,
      maxFontSize: height * WORD_MAX_FRAC,
      boxWidth,
      boxHeight,
      weight: WEIGHT,
    });
    return fit.lines.map((l, i) => <Line key={i} text={l} fontSize={fit.fontSize} weight={WEIGHT} />);
  }

  if (props.kind === 'narration') {
    const fit = fitToMeasure(props.text, {
      who: 'narration line',
      measure: width * NARRATION_W_FRAC,
      ceiling: height * NARRATION_MAX_FRAC,
      floor: height * NARRATION_MIN_FRAC,
      maxLines: NARRATION_MAX_LINES,
      boxHeight,
    });
    return fit.lines.map((l, i) => <Line key={i} text={l} fontSize={fit.fontSize} weight={WEIGHT} />);
  }

  // chapter: title + subtitle locked at CRAYON_SUBTITLE_RATIO of the title size.
  // NOTE: re-measuring the 4:05 frame puts the reference's own ratio nearer 0.72–0.77 (title ink
  // 23 cell px / 0.565 frame wide vs subtitle 17 cell px / 0.766 frame wide for 36 chars), not the
  // 0.5 the bible states. This file deliberately obeys the shared token rather than forking it —
  // if the token is retuned in crayonStyle.ts, this card follows automatically.
  //
  // WO-19: both halves are fitted against the WHOLE box height, not a 0.6 / 0.4 pre-partition of it.
  // The partition was a second, blunter copy of the joint clamp a few lines below — and a harmful one:
  // a two-line subtitle allowed 0.4 of the box came out at 107 px where the ratio wanted 134 px, so the
  // pair-scaling dragged the title down with it and "The Cotton Store" set at 0.432 w instead of the
  // 0.565 anchor. Vertical fit is `blockHeight()`'s job, once, on the assembled block; each half only
  // needs its own line count and the ratio.
  const title = fitToMeasure(props.title, {
    who: 'chapter title',
    measure: width * CHAPTER_TITLE_W_FRAC,
    ceiling: height * CHAPTER_TITLE_MAX_FRAC,
    floor: height * CHAPTER_TITLE_MIN_FRAC,
    maxLines: CHAPTER_TITLE_MAX_LINES,
    boxHeight,
  });
  const subWrap = fitText(props.subtitle, {
    who: 'textcard',
    maxLines: CHAPTER_SUB_MAX_LINES,
    // fit at the ratio first; the shared scale below is what actually enforces the box
    maxFontSize: title.fontSize * CRAYON_SUBTITLE_RATIO,
    boxWidth,
    boxHeight,
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
