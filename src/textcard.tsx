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
import {CRAYON_TEXT_WEIGHT, LINE_HEIGHT, fitText, useCrayonFace} from './crayonText';

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
      who: 'textcard',
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
    who: 'textcard',
    maxLines: CHAPTER_TITLE_MAX_LINES,
    maxFontSize: height * CHAPTER_TITLE_MAX_FRAC,
    boxWidth,
    boxHeight: boxHeight * 0.6,
    weight: WEIGHT,
  });
  const subWrap = fitText(props.subtitle, {
    who: 'textcard',
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
