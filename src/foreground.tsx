// CRAYON foreground silhouette — bible §6 device 8, "over-the-shoulder framing with a dark foreground
// silhouette for depth".
//
// WHAT WAS ACTUALLY MISSING. COMPARISON scored §6.8 as "not built", but the SHAPE was built: WO-8's
// `setdressing.tsx` exports `OverShoulder`, a near-black head-and-shoulder mass anchored to a frame
// edge, and it is drawn correctly. What did not exist was any way to USE it — one legacy scene
// (`scenes.tsx`, the `S`-series) places it by hand and nothing else can, because a template's contents
// are fixed at the template and the writer only picks a template name. So the device was unreachable
// from a script: not a missing drawing, a missing wire.
//
// This file is that wire. It takes the optional `foreground` field off a scene record and paints the
// silhouette over the scene's art, so ANY template can be framed over a shoulder — which is how the
// reference uses it (`wolf_montage_verified.jpg` @3:34: an ordinary office set, framed past a dark
// chair-back and the head of the person being sold to, with the dialogue floating over the gap).
//
// WHY IT IS NOT INSIDE THE SHOT'S CROP. `director.FramedScene` scales the art about the shot's focus
// point (wide 1.0 / medium 1.5 / closeup 2.2). Scaling the silhouette with it would make a 2.2x closeup
// blow the near-plane mass up to roughly half the frame, hiding the very scene it is supposed to frame
// — and a mass that large is also a large FLAT region, which is the metric the whole restyle is scored
// on (bible §5). So the silhouette is painted at native frame scale over the cut, and holds its size
// while the framing behind it changes. The camera is locked either way: nothing here animates.

import React from 'react';
import {AbsoluteFill} from 'remotion';

import {OverShoulder} from './setdressing';

/** The one device this field carries today. A union so a second near-plane mass can be added later. */
export type ForegroundT = {
  kind: 'overShoulder';
  /**
   * Which frame edge the silhouette is anchored to. REQUIRED, and deliberately not defaulted: a
   * silhouette on the wrong edge lands on top of the scene's colour hero and blacks him out (measured
   * — `boardroom` stages its hero at the right, and a right-side mass at scale 1 covered him). The
   * reference's 3:34 frame puts the near figure on the left and its subject on the right.
   */
  side: 'left' | 'right';
  /** Baseline the mass stands on, in the 1920×1080 frame. 1080 = the bottom edge. */
  y?: number;
  /** Size of the mass. 1 puts the head about a third of the frame height up. */
  scale?: number;
};

/** Sane band for `scale`: under this the mass reads as a prop, over it, it eats the frame. */
const SCALE_MIN = 0.4;
const SCALE_MAX = 1.6;

export const Foreground: React.FC<{spec: ForegroundT; sceneId: string}> = ({spec, sceneId}) => {
  if (spec.kind !== 'overShoulder') {
    throw new Error(
      `${sceneId}: unknown foreground kind ${JSON.stringify((spec as {kind: unknown}).kind)} — ` +
        `the only foreground device is 'overShoulder'`
    );
  }
  if (spec.side !== 'left' && spec.side !== 'right') {
    throw new Error(
      `${sceneId}: foreground.side must be 'left' or 'right', got ${JSON.stringify(spec.side)} — ` +
        `choose the edge AWAY from the scene's hero, or the silhouette covers him`
    );
  }
  const scale = spec.scale ?? 1;
  if (!(scale >= SCALE_MIN && scale <= SCALE_MAX)) {
    throw new Error(
      `${sceneId}: foreground.scale ${scale} is outside ${SCALE_MIN}–${SCALE_MAX} — below that the ` +
        `silhouette reads as a prop rather than a near plane, above it it covers the scene`
    );
  }
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        <OverShoulder side={spec.side} y={spec.y} scale={scale} />
      </svg>
    </AbsoluteFill>
  );
};
