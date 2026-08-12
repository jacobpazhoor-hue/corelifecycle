import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import timeline from './timeline.json';
import {FramedScene, FOCUS, CountUp, NumberCard, splitMoney, isNegativeOverlay} from './director';
import {Move} from './photoStage';
import PHOTO_RAW from './photo_manifest.json';
// CRAYON signature devices (bible §6). Built in WO-5/6/7, wired to the timeline here in WO-12a.
import {TextCard, TextCardProps} from './textcard';
import {FloatingDialogue, SpeechBubble} from './bubble';
import {Panel, Panels} from './panels';
import {resolveSceneKey, sceneColors} from './crayonStyle';

const PHOTO = PHOTO_RAW as {mode: string; scenes: Record<string, {img: string; depth: string; move: Move}>; fallback: string[]};

// expo-out: fast in, slow settle — the entrance easing the count-up already uses, applied to text
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// NOTE (CRAYON_BIBLE §3 / §5, 2026-08-11): the per-level COLOR DRAMATURGY that used to live here —
// GRADE_STOPS + gradeTint() driving a global warm->cool->ember->gold tint, a progressive darkening and
// a saturation/contrast lift across the whole video — is GONE. The reference does not drift one palette
// over a fixed art set; each scene commits to its own dominant hue (bright cyan beach, saturated orange
// panel, brown warehouse, near-monochrome grey) and mood is carried by the palette swapping. Scenes now
// render ungraded; per-scene colour keys are a separate work order. Do not reintroduce a global grade.

// ============================================================================
// VIDEO v2 — director-based renderer. Each scene/beat becomes 2-3 SHOTS
// (wide -> medium -> short closeup) cut together, with the money number COUNTING
// UP over the cuts. Shot durations sum to the scene's VO duration, so audio stays
// perfectly synced. Reads the SAME timeline.json as the old Video (drop-in).
// ============================================================================
// 2026-07-20: cream -> white. Owner direction is the bright reference look; the cream base plus
// the heavy grade below is what read as dull/sepia. Figure fills keep their own cream (figure.tsx).
const PAPER = '#ffffff';
// The FONT / INK / NEG / NEG_SUB constants that used to sit here are gone with the money card's legacy
// styling (WO-15). It was the last chrome in this file set in `'Helvetica Neue', Helvetica, Arial` —
// named in bible §7 as a total mismatch — and the accents now come from the palette tokens in
// crayonStyle via `NumberCard`, not from four private hex values.

type Overlay = {big: string; sub: string | null} | null;

// ============================================================================
// SIGNATURE-DEVICE SCENE FIELDS (WO-12a) — CRAYON_BIBLE §6 devices 1–4.
//
// All three fields are OPTIONAL and additive: a timeline carrying none of them renders exactly as it
// did before this work order (verified byte-identical on a still). They follow the same path `overlay`
// and `level` already take — written by `content.py`, copied verbatim by `gen_voice_edge.py` into
// `timeline.json`, consumed here — rather than a parallel mechanism. `docs/BIBLE.md` §8 documents the
// exact key names for the writer.
// ============================================================================

/** Which ground a full-screen card sits on. Both are used by the reference (bible §6.1). */
type CardGround = 'white' | 'black';

/**
 * A full-screen text card (`textcard.tsx`). It covers the scene from its first frame for `hold`
 * seconds; omit `hold` and the card IS the scene, in which case the shot plan underneath is skipped
 * entirely — a card scene renders no art, so there is nothing to render.
 *
 * The chapter card is the episode's chapter boundary marker: 3–5 per episode (bible §1), title and
 * subtitle being the two halves of the reference's `Evocative Noun: Plain Explanation` chapter names.
 */
type CardT = (
  | {kind: 'chapter'; title: string; subtitle: string}
  | {kind: 'narration'; text: string}
  | {kind: 'word'; word: string}
) & {ground?: CardGround; hold?: number};

/**
 * One utterance over the scene (`bubble.tsx`): a tailed balloon pointing at its speaker, or the same
 * handwritten script laid straight onto the frame with no balloon. Timing is in seconds from the
 * scene's own start; omit both and the line holds for the rest of the scene.
 */
type BubbleT = {
  /** 'bubble' (default) draws the balloon; 'float' is the bubble-less floating dialogue. */
  kind?: 'bubble' | 'float';
  text: string;
  x?: number;
  y?: number;
  /**
   * Seconds from the scene's own start. Named `at`, NOT `from`: `from` is a Python keyword, so
   * `dict(from=3.0)` is a SyntaxError in content.py and the writer could never emit it.
   */
  at?: number;
  dur?: number;
  maxWidth?: number;
  maxLines?: number;
  /** balloon only — which edge the tail leaves from, i.e. roughly where the speaker stands */
  tail?: 'left' | 'right' | 'down' | 'up' | 'none';
  tailAt?: number;
  tailLength?: number;
  tailSkew?: number;
  /** float only */
  align?: 'center' | 'left';
  color?: string;
  keyline?: number;
};

/**
 * One cell of a split. `template` renders that template as a centre crop inside the cell; a cell with
 * no template is a flat colour block and must therefore name its own `ground`.
 */
type PanelCellT = {template?: string; ground?: string; scale?: number; offsetX?: number; offsetY?: number};

/** A scene rendered as a multi-panel split (`panels.tsx`) INSTEAD of a cut shot plan. */
type PanelsT = {
  variant: 'v2' | 'diagonal2' | 'grid4';
  cells: PanelCellT[];
  split?: number;
  splitY?: number;
  lean?: number;
};

type SceneT = {id: string; level: string | null; overlay: Overlay; template: string;
  audio: string; audioStartFrame?: number; startFrame: number; durationInFrames: number;
  card?: CardT; bubbles?: BubbleT[]; panels?: PanelsT};
type Shot = {type: string; dur: number; focus: [number, number]};

// ============================================================================
// EDITING RHYTHM (CRAYON_BIBLE §4, measured in docs/research/crayon/MEASUREMENTS.md).
// Reference: 12.5 cuts/min · mean shot 4.79s · per-window means 3.87–6.36s ·
// median shot 2.67–6.81s · range 0.61–16.46s · ~40% of sampled frames completely
// motionless. "Hold still, then change" — the reference does NOT fill dead air with drift.
// ============================================================================
const TARGET_SHOT = 144; // 4.79s @30fps — the measured mean shot length; drives the shot COUNT
// The reference's LONGEST measured shot, 16.46s. This replaces the old 240f/8s "retention" ceiling,
// which was a CoreLifecycle doctrine number with nothing behind it: the reference happily holds a
// locked frame for 16s. It is now an INVARIANT, not a re-cutter — the planner is duration-driven, so
// a shot this long is arithmetically unreachable, and if one ever appears the weight table below is
// broken and we want to hear about it rather than paper over it with an invisible sub-cut.
const MAX_SHOT = 494;

// WHY THE SUB-CUTTER (`capShots`) IS GONE, 2026-08-11.
// It split any shot over MAX_SHOT into equal sub-cuts of the SAME shot type on the SAME focus point.
// Under the old moving camera each sub-cut restarted the dolly push, so it read as a change; with the
// camera locked (CRAYON_BIBLE §3) it produces NO visible change at all — an invisible "cut" that is
// only a ShotFade dip. That is worse than useless: it inflates the cut count in any plan-based
// accounting while the viewer sees nothing, so it corrupts the exact metric this file is tuned
// against. Making it vary the framing was the alternative, but then a scene's rhythm would come from
// two uncoordinated places — planShots' proportional split AND an equal-division cap — and the mean
// shot length could not be tuned. Instead the rhythm is planned ONCE, from the target shot length, so
// every emitted cut is a genuine re-frame and no shot ever needs rescuing. The bible backs the holds:
// 40% of reference frames are motionless and shots run to 16.46s.

// A framing = a static crop (see director.tsx SCALE / FramedScene) plus a horizontal shift of the
// focus point, plus that shot's share of the scene. Every entry differs in SCALE from both of its
// neighbours INCLUDING ACROSS THE WRAP, so consecutive shots can never be the same crop — that is
// what makes the cut visible with the camera locked. `dx` moves the crop off the focus point so two
// mediums in one scene are not the same composition (any focus in 0–1 is safe: scaling about the
// focus point can never expose an edge). `w` sums to exactly the cycle length, so the mean shot in a
// scene is TARGET_SHOT regardless of where in the cycle it starts. Wides carry the long holds,
// closeups are the shortest — punctuation, as in the old plan's 64f closeup cap.
type Framing = {type: string; dx: number; w: number};
const FRAMINGS_FACE: Framing[] = [ // templates with a locatable face (FOCUS) — closeups allowed
  {type: 'wide', dx: 0, w: 1.30},
  {type: 'medium', dx: -0.20, w: 0.95},
  {type: 'wide', dx: 0, w: 1.35},
  {type: 'closeup', dx: 0, w: 0.55},
  {type: 'wide', dx: 0, w: 1.10},
  {type: 'medium', dx: 0.20, w: 0.75},
];
const FRAMINGS_FLAT: Framing[] = [ // no locatable face: a 2.2x closeup would frame nothing, so wide/medium only
  {type: 'wide', dx: 0, w: 1.45},
  {type: 'medium', dx: -0.18, w: 0.70},
  {type: 'wide', dx: 0, w: 1.05},
  {type: 'medium', dx: 0.18, w: 0.80},
];
const DEFAULT_FOCUS: [number, number] = [0.5, 0.55];

// Distribute a scene's duration across shots (always sums to D — the audio is one continuous file
// per scene, so a shot plan that does not sum to D desyncs it). `phase` is a RUNNING shot index
// across the whole video, so a scene starts its cycle where the previous scene stopped: adjacent
// entries always differ in scale, which means the first shot of a scene can never repeat the framing
// of the last shot of the one before it (two consecutive scenes on the same template would otherwise
// cut to an identical frame).
function planShots(s: SceneT, phase: number): Shot[] {
  const D = s.durationInFrames;
  const face = FOCUS[s.template];
  const cycle = face ? FRAMINGS_FACE : FRAMINGS_FLAT;
  const focus = face ?? DEFAULT_FOCUS;
  const n = Math.max(1, Math.round(D / TARGET_SHOT));
  const picks = Array.from({length: n}, (_, i) => cycle[(phase + i) % cycle.length]);
  const wsum = picks.reduce((a, p) => a + p.w, 0);
  const shots: Shot[] = [];
  let used = 0;
  for (let i = 0; i < n; i++) {
    // last shot absorbs the rounding remainder so the plan sums to D exactly
    const dur = i === n - 1 ? D - used : Math.round((D * picks[i].w) / wsum);
    used += dur;
    const fx = Math.min(0.98, Math.max(0.02, focus[0] + picks[i].dx));
    shots.push({type: picks[i].type, dur, focus: [fx, focus[1]]});
  }
  for (const sh of shots) {
    if (sh.dur < 1 || sh.dur > MAX_SHOT) {
      throw new Error(`planShots(${s.id}): ${sh.dur}f shot is outside 1..${MAX_SHOT} — the framing weight table is broken`);
    }
  }
  return shots;
}

// ============================================================================
// DEVICE BUILDERS — scene JSON -> the WO-5/6/7 components' own prop types.
//
// These are the ONLY place a raw timeline record is turned into device props, so every malformed
// field is caught in one place and RAISED. Nothing here falls back silently: a split with the wrong
// number of cells, a cell with neither a template nor a ground, or an unknown card kind all throw
// with the scene id in the message, because a device that quietly renders nothing is a defect that
// only shows up in the finished 15-minute file.
// ============================================================================

/** Reference grounds: the 4:05 chapter card and the 7:10 single-word beat are black, the 2:00 narration white. */
const CARD_DEFAULT_GROUND: Record<string, CardGround> = {chapter: 'black', narration: 'white', word: 'black'};

const cardProps = (card: CardT, sceneId: string): TextCardProps => {
  const ground = card.ground ?? CARD_DEFAULT_GROUND[card.kind];
  switch (card.kind) {
    case 'chapter':
      return {kind: 'chapter', title: card.title, subtitle: card.subtitle, ground};
    case 'narration':
      return {kind: 'narration', text: card.text, ground};
    case 'word':
      return {kind: 'word', word: card.word, ground};
    default:
      throw new Error(
        `${sceneId}: unknown card kind ${JSON.stringify((card as {kind: unknown}).kind)} — ` +
          `card.kind must be 'chapter', 'narration' or 'word'`
      );
  }
};

/** How long the card covers the scene, in frames. No `hold` = the whole scene (the card IS the scene). */
const cardHoldFrames = (card: CardT, D: number, fps: number, sceneId: string): number => {
  if (card.hold === undefined) return D;
  if (!(card.hold > 0)) {
    throw new Error(`${sceneId}: card.hold must be a positive number of seconds, got ${card.hold}`);
  }
  // clamped to the scene: a card outliving its own Sequence would be cut mid-hold anyway
  return Math.min(D, Math.max(1, Math.round(card.hold * fps)));
};

const CELLS_PER_VARIANT: Record<PanelsT['variant'], number> = {v2: 2, diagonal2: 2, grid4: 4};

const cellToPanel = (cell: PanelCellT, sceneId: string, dur: number): Panel => {
  // A cell's flat ground defaults to the colour key its OWN template commits to, so a split is
  // independently keyed (bible §6.4) without the writer picking hex. A cell with no template has no
  // key to borrow — and defaulting it from the scene id would give every such cell in the scene the
  // SAME ground, which is the one thing an independently-keyed split must not do — so it must say.
  if (!cell.ground && !cell.template) {
    throw new Error(`${sceneId}: a panel cell with no \`template\` must name its own flat \`ground\``);
  }
  const ground = cell.ground ?? sceneColors(resolveSceneKey(sceneId, cell.template)).bg;
  return {
    ground,
    scale: cell.scale,
    offsetX: cell.offsetX,
    offsetY: cell.offsetY,
    // 'wide' = the template at native scale, centre-cropped to the cell. The camera is locked, so a
    // panel never re-frames; `scale`/`offsetX`/`offsetY` on the cell are the only crop controls.
    children: cell.template ? (
      <FramedScene template={cell.template} type="wide" focus={FOCUS[cell.template] ?? DEFAULT_FOCUS} dur={dur} />
    ) : undefined,
  };
};

const buildPanels = (spec: PanelsT, sceneId: string, dur: number): React.ReactNode => {
  const want = CELLS_PER_VARIANT[spec.variant];
  if (want === undefined) {
    throw new Error(
      `${sceneId}: unknown panel variant ${JSON.stringify(spec.variant)} — expected 'v2', 'diagonal2' or 'grid4'`
    );
  }
  if (!Array.isArray(spec.cells) || spec.cells.length !== want) {
    throw new Error(
      `${sceneId}: panels.variant '${spec.variant}' needs exactly ${want} cells, got ${spec.cells?.length ?? 0}`
    );
  }
  const p = spec.cells.map((c) => cellToPanel(c, sceneId, dur));
  if (spec.variant === 'grid4') {
    return <Panels variant="grid4" panels={[p[0], p[1], p[2], p[3]]} split={spec.split} splitY={spec.splitY} />;
  }
  if (spec.variant === 'diagonal2') {
    return <Panels variant="diagonal2" panels={[p[0], p[1]]} split={spec.split} lean={spec.lean} />;
  }
  return <Panels variant="v2" panels={[p[0], p[1]]} split={spec.split} />;
};

const Beat: React.FC<{scene: SceneT; from: number | null; shots: Shot[]}> = ({scene, from, shots}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const D = scene.durationInFrames;
  // Scene-cut fade: previously ramped all the way to 0 opacity over 16 frames (~0.53s) on EACH side
  // of a cut, so any frame sampled inside that ~1s combined window at a scene boundary reads as a
  // near-blank white flash (mistaken for a compositing bug in QA — commandPost's t21/t25 samples
  // landed exactly there). Floor keeps SOME content visible through the cut; shorter window means
  // less of the runtime is ever in the dim zone at all.
  const fade = 8;
  const beatOp = interpolate(f, [0, fade, D - fade, D], [0.4, 1, 1, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // shots (and their per-shot focus points) are planned once in Video2 so the framing cycle can run
  // continuously across scene boundaries — see planShots' `phase`.
  // LOCKED CAMERA (CRAYON_BIBLE §3): the level-cut whip-in, the decaying screen shake and the cut
  // flash are gone, as is the drifting foreground occluder (a parallax depth cue that only made sense
  // under a moving camera). The level cut is now carried by the SFX and the level label alone.
  // Only animate a money count-up when the overlay is genuinely a dollar figure
  // (string starts with '$'). Otherwise — command counts ("~150 UNDER YOUR
  // COMMAND") and cost beats ("-1 KIA") — render the full string verbatim as
  // static big text instead of mis-formatting it as a dollar amount.
  // splitMoney keeps the unit suffix ("K / YR", "/ WK") so the count-up shows the
  // FULL label, never a truncated "$250".
  const money = splitMoney(scene.overlay?.big);
  const negOverlay = scene.overlay ? isNegativeOverlay(scene.overlay.big, scene.overlay.sub) : false;
  // The note lays its figure out with the shared text engine, which refuses empty input (crayonText's
  // `fitText`). Catch it HERE, where the scene id is in hand, rather than letting the render die with
  // a message that cannot say which scene wrote the bad overlay — the same rule the device builders
  // above follow. An overlay whose figure is blank is malformed content, not a case to render around.
  if (scene.overlay && !scene.overlay.big?.trim()) {
    throw new Error(`${scene.id}: overlay.big is empty — an overlay must carry a figure to show`);
  }

  // static (non-numeric) overlay fallback, matches the count-up styling
  const big = scene.overlay?.big ?? '';
  // was [20, 36, ...]: a 16-frame ramp left the card at low opacity/contrast for a long,
  // clearly-visible beat (e.g. the "2011" fileWall share-beat) before settling. Matches
  // CountUp's snappier onset so text reads at full contrast almost as soon as it appears.
  // EXIT window shortened from 18->10 frames (was D-18,D): over a busy backdrop (e.g. revolvingDoor's
  // window grid) the old long linear fade spent many frames at mid-opacity, letting the art bleed
  // through the card and read as a double-exposed ghost (reviewer defect, t23 "SEC WELLS NOTICE").
  // Paired with an exit LIFT below so the card reads as a quick slide-away, not a lingering blend.
  const staticOp = interpolate(f, [10, 20, D - 10, D], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const staticRise = interpolate(f, [10, 28, D - 10, D], [18, 0, 0, -16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});

  const photo = PHOTO.mode === 'photo' && PHOTO.scenes[scene.id] ? PHOTO.scenes[scene.id] : undefined;

  // A card with no `hold` covers the scene end to end, so there is no point cutting art underneath it
  // (TextCard paints an opaque ground from its very first frame — only the TEXT fades in — so nothing
  // below it is ever visible). A `hold` shorter than the scene keeps the shots: the art is already
  // mid-shot when the card lifts, which reads as the reference's cut back out of a card.
  const cardFrames = scene.card ? cardHoldFrames(scene.card, D, fps, scene.id) : 0;
  const artHidden = cardFrames >= D;

  let t = 0;
  return (
    <AbsoluteFill style={{opacity: beatOp, backgroundColor: PAPER}}>
      {/* shots cut together underneath — ungraded, and with no transform of their own: the frame is
          locked, so the only thing that ever moves is what the scene template animates internally.
          A `panels` scene (bible §6.4) replaces the whole shot plan with one static split: a split IS
          a composition, so re-framing inside it would be a second camera on top of a locked one. */}
      {!artHidden && (
        <AbsoluteFill>
          {scene.panels
            ? buildPanels(scene.panels, scene.id, D)
            : shots.map((sh, i) => {
                const seq = (
                  <Sequence key={i} from={t} durationInFrames={sh.dur}>
                    <ShotFade dur={sh.dur}>
                      <FramedScene template={scene.template} type={sh.type} focus={sh.focus} dur={sh.dur} photo={photo} />
                    </ShotFade>
                  </Sequence>);
                t += sh.dur;
                return seq;
              })}
        </AbsoluteFill>
      )}

      {/* No global overlays sit between the shots and the text any more: the mood grade, the warm
          bloom, the inset vignette and the top/bottom darkening gradient were all whole-frame washes
          over a flat-vector look that is supposed to read bright and per-scene keyed. The bible allows
          a soft radial spotlight, but as part of a BACKGROUND, not as a composite layer over everything. */}

      {/* THE `level` CHIP IS GONE (WO-12a, 2026-08-11). It rendered `scene.level` force-uppercased in
          a gold-bar-and-drop-shadow card set in Helvetica, top-left, persisting across every cut of a
          chapter's first scene. Three independent reasons it had to go, in order of weight:
            1. NOT IN THE REFERENCE. No measured frame carries a persistent corner label of any kind.
               The chapter turn is marked by a full-screen chapter CARD (bible §6.2) — which, as of
               this work order, finally exists as `scene.card` — so the chip was standing in for a
               device we now have, and keeping both would announce every chapter twice.
            2. WRONG TYPOGRAPHY, LOUDLY. Bible §7: ALL on-screen text is the handwritten script, and
               "current CoreLifecycle uses Helvetica everywhere" is named there as a total mismatch.
               This chip was the last piece of chrome still setting FONT, force-uppercasing (a caps
               lock the writer cannot opt out of) and painting a `boxShadow` — a soft blur, i.e. a
               gradient, which Chromium dithers (§5).
            3. IT WAS FORMAT CHROME. `LEVEL 01 · THE DRIVEWAY` is the retired POV ladder's furniture;
               the new canon's chapters are named `Evocative Noun: Plain Explanation`, which is a
               title-over-subtitle shape — exactly what TextCard kind="chapter" sets, and what the chip
               could not show at all.
          The FIELD stays, and stays required: `level` is the pipeline's structural chapter marker.
          `gen_voice_edge.scene_gap()` reads the NEXT scene's `level` to lengthen the pre-chapter
          silence, and `duck_music.py` keys the chapter-start SFX off it. Only its rendering is gone. */}

      {/* money: animated count-up if numeric, else static styled text. COST/loss beats (debt, KIA,
          burned, sold, murdered...) get a red/amber accent instead of gain-gold so the moral-erosion
          beats read as losses, not more income. */}
      {scene.overlay && (money !== null
        ? <CountUp from={from ?? 0} to={money.num} suffix={money.suffix} sub={scene.overlay.sub} dur={D} negative={negOverlay} />
        : (
          // Non-numeric overlays ("1 IN 3", "-1 KIA", "10-DAY DEAL", "0.03%") render VERBATIM as one
          // static line — no count-up, no re-formatting as a dollar amount, and no forced uppercase:
          // the note sets whatever `content.py` wrote (WO-15; the retired `level` chip's caps-lock the
          // writer could not opt out of was one of the three reasons it went).
          // reviewer fix (t15 "4,000 BALISH"): the warCouncil mapTable prop's edge sat under this
          // card's default left:72 corner -- nudged left so the card clears the table.
          <div style={{position: 'absolute', bottom: 96, left: scene.id === 't15' ? 34 : 72, opacity: staticOp,
            transform: `translateY(${staticRise}px)`}}>
            <NumberCard figure={big} sub={scene.overlay.sub} negative={negOverlay} />
          </div>
        ))}

      {/* speech balloons + floating dialogue (bible §6.3), over the art and over the money card.
          Each line gets its own Sequence, which is what makes the component's entrance fire when the
          LINE appears rather than when the scene does — and lets two speakers alternate in one scene,
          as the 9:20 reference frame does with its two balloons. */}
      {scene.bubbles?.map((b, i) => {
        const bFrom = Math.max(0, Math.round((b.at ?? 0) * fps));
        const bDur = b.dur === undefined ? Math.max(1, D - bFrom) : Math.max(1, Math.round(b.dur * fps));
        return (
          <Sequence key={`b${i}`} from={bFrom} durationInFrames={bDur}>
            {b.kind === 'float' ? (
              <FloatingDialogue
                text={b.text} x={b.x} y={b.y} align={b.align} color={b.color}
                maxWidth={b.maxWidth} maxLines={b.maxLines} keyline={b.keyline}
              />
            ) : (
              <SpeechBubble
                text={b.text} x={b.x} y={b.y} tail={b.tail} tailAt={b.tailAt}
                tailLength={b.tailLength} tailSkew={b.tailSkew} maxWidth={b.maxWidth} maxLines={b.maxLines}
              />
            )}
          </Sequence>
        );
      })}

      {/* full-screen text card (bible §6.1/§6.2) — narration beat, single dramatic word, or the
          chapter card. LAST in the stack because it is full-screen and opaque: it covers the art, the
          money card and any balloon for exactly as long as it holds. */}
      {scene.card && (
        <Sequence from={0} durationInFrames={cardFrames}>
          <TextCard {...cardProps(scene.card, scene.id)} />
        </Sequence>
      )}

      <Sequence from={scene.audioStartFrame ?? 0}><Audio src={staticFile(scene.audio)} /></Sequence>
    </AbsoluteFill>
  );
};

const ShotFade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  // FLOOR the shot fade (was [0,1,1,0]). Shots inside a scene are laid out in NON-overlapping
  // Sequences, so a fade-to-0 never crossfades with the next shot — it just dips the only mounted
  // shot to ~0 opacity over the white PAPER background (Beat, line 131) for a frame or two, which
  // reads as a near-blank white FLASH at every internal shot cut (reviewer f_030 / frame ~12655,
  // min-luma 148 mid-scene). This is the same bug class the scene-level `beatOp` already fixed by
  // flooring at 0.4; intra-scene cuts should be subtler, so floor high (0.85) — a barely-perceptible
  // softening that can never reveal enough white to blank the frame. 2026-07-22.
  const op = interpolate(f, [0, 4, dur - 4, dur], [0.85, 1, 1, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: op}}>{children}</AbsoluteFill>;
};

export const Video2: React.FC = () => {
  const scenes = timeline.scenes as SceneT[];
  // The levelProgress that used to be computed here drove the per-level colour grade only; with the
  // grade removed (see the note at the top of this file) nothing consumes it, so it is gone too.
  // carry the previous figure into the next count-up ONLY when the unit suffix matches
  // ("$5M / YR" -> "$500M / YR" counts 5->500; "$200 / WK" -> "$250K / YR" restarts at 0
  // instead of counting across incompatible units)
  let last: {num: number; suffix: string} | null = null;
  const out: React.ReactNode[] = [];
  // running shot index across the whole video — keeps the framing cycle continuous through scene
  // cuts so no scene ever opens on the framing the previous one closed with (see planShots).
  let phase = 0;
  for (const s of scenes) {
    const money = splitMoney(s.overlay?.big);
    const from = money && last && last.suffix === money.suffix ? last.num : null;
    const shots = planShots(s, phase);
    phase += shots.length;
    out.push(
      <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames}>
        <Beat scene={s} from={from} shots={shots} />
      </Sequence>);
    if (money !== null) last = money;
  }
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      {out}
      <Audio src={staticFile('music/ambient.wav')} volume={0.16} />
      {/* Phase-2 transient SFX (whoosh-into-cut, boom+riser on level starts) — pre-baked by duck_music.py */}
      <Audio src={staticFile('music/sfx.wav')} volume={0.5} />
    </AbsoluteFill>
  );
};
