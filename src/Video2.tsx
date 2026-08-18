import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, useVideoConfig, Easing} from 'remotion';
import timeline from './timeline.json';
import {
  FramedScene, FOCUS, CountUp, NumberCard, splitMoney, isNegativeOverlay, fadeRamp, noteRamp,
  // WO-34: the staged geometry three layers now read instead of guessing (QA defects 1, 4, 9).
  STAGING, cornerStyle, noteCorner, speakerHead, stagedHeads,
} from './director';
import {Move} from './photoStage';
import PHOTO_RAW from './photo_manifest.json';
// CRAYON signature devices (bible §6). Built in WO-5/6/7, wired to the timeline here in WO-12a.
import {TextCard, TextCardProps} from './textcard';
import {FloatingDialogue, SpeechBubble, Utterance, planBalloons} from './bubble';
import {useCrayonFace} from './crayonText';
import {Panel, Panels} from './panels';
// WO-19: the two devices COMPARISON scored as MISSING — the object showcase card (§6.6) and the
// over-the-shoulder foreground silhouette (§6.8).
import {ObjectCard, ShowcaseItem} from './objectcard';
import {Foreground, ForegroundT} from './foreground';
import {resolveSceneKey, sceneColors} from './crayonStyle';
// WO-27: the per-scene period flag — the room drawn with its era-marking props substituted out.
import {Era, PeriodProvider} from './setdressing';

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
// VIDEO v2 — director-based renderer. ONE FRAMING PER SCENE (WO-17): a scene is normally a single
// locked shot, so a visible cut happens when the SCENE — and therefore the artwork — changes. The
// money number counts up over the scene. Shot durations sum to the scene's VO duration, so audio
// stays perfectly synced. Reads the SAME timeline.json as the old Video (drop-in).
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
 * A full-screen card. It covers the scene from its first frame for `hold` seconds; omit `hold` and the
 * card IS the scene, in which case the shot plan underneath is skipped entirely — a card scene renders
 * no art, so there is nothing to render.
 *
 * The chapter card is the episode's chapter boundary marker: 3–5 per episode (bible §1), title and
 * subtitle being the two halves of the reference's `Evocative Noun: Plain Explanation` chapter names.
 *
 * `objects` (WO-19) is the fourth kind and the only one that is not text: the §6.6 object showcase,
 * isometric flat products on pure white. It rides the SAME field as the text cards deliberately —
 * it is a full-screen device with the same hold/cover semantics, `gate.py` already excludes `card`
 * scenes from its flat-fill sampling (a card is not art and measures ~100% flat), and a parallel
 * `objects=` scene field would have needed that exclusion added to a file this work order must not
 * touch.
 */
type CardT = (
  | {kind: 'chapter'; title: string; subtitle: string}
  | {kind: 'narration'; text: string}
  | {kind: 'word'; word: string}
  // a bare string is the object's name; the dict form adds `color` / `scale`
  | {kind: 'objects'; items: (string | ShowcaseItem)[]}
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
  /**
   * WHO SAYS IT — a role name from the scene's template (`director.tsx` `STAGING`). Balloons only.
   *
   * This is the whole writer-facing half of the WO-34 fix. A balloon's position and its tail are
   * derived from that person's head box, so naming the wrong person is visible in the picture and a
   * name that is not in the room halts the render. Omit it and the balloons of a scene are handed to
   * the room's speakers in order, alternating — the two-hander shape every bubble scene in this
   * format has: the visitor asks, the principal answers.
   */
  speaker?: string;
  /**
   * Float only. `x`/`y` on a BALLOON are IGNORED (WO-34) — see the block comment on `Balloons`.
   */
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
  /**
   * Balloon tail controls, ACCEPTED AND IGNORED (WO-34). They are still in the type because
   * `content.py` in the field still writes them, and a live nightly pipeline must not die on a key
   * that used to be legal; nothing reads them. See the block comment on `Balloons` for why they went.
   */
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
  card?: CardT; bubbles?: BubbleT[]; panels?: PanelsT; foreground?: ForegroundT; period?: string};
type Shot = {type: string; dur: number; focus: [number, number]};

// ============================================================================
// EDITING RHYTHM (CRAYON_BIBLE §4, measured in docs/research/crayon/MEASUREMENTS.md).
// Reference: 12.5 cuts/min · mean shot 4.79s · per-window means 3.87–6.36s ·
// median shot 2.67–6.81s · range 0.61–16.46s · ~40% of sampled frames completely
// motionless. "Hold still, then change" — the reference does NOT fill dead air with drift.
// ============================================================================
// WHY THE RE-CROPPING SHOT PLANNER IS GONE (WO-17, 2026-08-12) — OWNER DEFECT, watching
// out/lehman_brothers.mp4: "there's so many random zooms and stuff."
//
// The planner used to split every scene into round(D / 144) shots off a weighted cycle of framings,
// manufacturing the reference's 12.5 cuts/min out of a six-template episode whose scenes run ~21s.
// But a "framing" is a STATIC CROP of the same artwork at scale 1.0 / 1.5 / 2.2 (director.tsx SCALE),
// and the camera is locked (CRAYON_BIBLE §3), so cutting wide -> medium on one template does not
// produce a cut: it produces the SAME ROOM at a different zoom level, with nothing in it having
// moved or changed. WO-13's own comparison already recorded the symptom without chasing it — "soft
// cuts (8.94/min detected vs 12.5 — wide<->medium on identical art isn't a visible cut, because none
// of the six templates is in FOCUS)". MEASURED on out/lehman_brothers.mp4, the exact file the owner
// watched (whole-frame luma diff, isolated peaks at >=3x local prominence AND an absolute 5.0/255
// floor): 160 cuts in 14.09 min = 11.35 cuts/min, mean shot 5.25s — of which only 38 were scene
// changes. The other 122, three quarters of them, were re-crops of art the viewer was already looking
// at. That is what reads as a random zoom.
//
// The reference cuts between DIFFERENT SET-UPS. So does this now: one framing per scene, and a cut
// happens when the scene — and therefore the artwork — changes. Re-rendered and re-measured over a
// four-scene window, EVERY detected cut is a scene boundary and no cut occurs inside a scene (two
// stills 4.3s apart inside one scene are 98.2% bit-identical). Whole episode: 38 cuts in 13.71 min =
// 2.77 cuts/min, mean shot 21.1s — the scene length itself.
//
// That is 4.5x under the reference's 12.5 cuts/min, and every scene now out-holds the reference's
// longest measured shot (16.46s). Both facts are ACCEPTED and neither is fixable here: gate.py
// deliberately does not assert cuts/min, and the route back to the reference's rhythm is MORE,
// SHORTER SCENES ON MORE TEMPLATES (a concurrent work order takes the set from 6 to 13), not more
// crops of six. A crop cannot buy editing rhythm — that was the whole defect.
//
// DO NOT "restore editing rhythm" by re-adding a cycle here. It is not editing rhythm; it is a zoom.

// THE EXCEPTION THAT IS *NOT* HERE: an intra-scene "cut-in" onto a face.
//
// The obvious concession — let a very long scene on a template with a locatable face (director.tsx
// FOCUS) cut once from its establishing framing to a 2.2x closeup — was built, measured and then
// removed, for three reasons:
//   1. IT CANNOT BE SEEN TO WORK. No template this episode renders has a FOCUS entry, and WO-8h's
//      thirteen explainer templates have none either, so the branch would ship having never put a
//      frame on screen. Shipping an unverified re-frame path is exactly how this defect arrived.
//   2. THE GATE WOULD NOT BE RARE. Every eligible scene is a long scene: 31 of this episode's 39
//      scenes already run past the reference's longest measured shot. "Face + long" is therefore a
//      condition that fires on almost every scene of a face-template episode — one re-crop per scene,
//      which is the same machine at a quarter speed, not an exception.
//   3. THERE IS ALREADY AN HONEST CLOSE-UP. WO-8h added `closeUpPortrait`, a template whose whole
//      subject is a face large in frame. Cutting to it is a real cut between SET-UPS — different
//      artwork, chosen by the writer at the beat that earns it — instead of a renderer heuristic
//      inferring an emotional beat from frame arithmetic, which nothing in timeline.json marks.
// The corollary, and the answer to "should FOCUS be wired for the explainer templates": no. A FOCUS
// entry does not turn a re-crop into a cut, it only aims it better; the close-up belongs to
// `closeUpPortrait` at the scene level. See director.tsx's note on the FOCUS map.

// A framing = a static crop (director.tsx SCALE / FramedScene) plus a horizontal shift of the focus
// point. At `wide` the scale is 1.0, so the crop is the identity and `dx` does nothing — the scene
// renders its artwork untouched, which is what every scene now gets. `medium` exists for ONE case:
// two consecutive scenes on the SAME template, where identical art at an identical scale would make
// the scene cut invisible. gate.py only WARNs on that (it is a content-variety defect, not a render
// defect), so the renderer must still put something on screen when it happens — a visible re-crop
// beats no cut at all. It does not fire on this episode: no two adjacent scenes share a template.
type Framing = {type: string; dx: number};
const ESTABLISH: Framing = {type: 'wide', dx: 0};
const REFRAME: Framing = {type: 'medium', dx: -0.18};
const DEFAULT_FOCUS: [number, number] = [0.5, 0.55];

type Plan = {shots: Shot[]; framing: Framing};

/**
 * Plan one scene: exactly ONE shot, spanning the whole scene. `prev` is the previous scene's template
 * and framing, and is used only to break a same-template repeat across a scene boundary.
 *
 * The plan sums to D — the audio is one continuous file per scene, so a plan that does not sum to D
 * desyncs it. The shot list is kept as a list rather than collapsed to a single shot because `Beat`
 * lays shots out in Sequences and a future device (a genuine second set-up, not a crop) would slot in
 * here; nothing about the current plan needs more than one entry.
 */
function planShots(s: SceneT, prev: {template: string; framing: Framing} | null): Plan {
  const D = s.durationInFrames;
  const focus = FOCUS[s.template] ?? DEFAULT_FOCUS;
  // Same template two scenes running: take the other framing so the cut is visible. Otherwise the
  // artwork itself changes at the cut and the scene establishes untouched.
  const framing = prev && prev.template === s.template
    ? (prev.framing === ESTABLISH ? REFRAME : ESTABLISH)
    : ESTABLISH;
  const fx = Math.min(0.98, Math.max(0.02, focus[0] + framing.dx));
  const shots: Shot[] = [{type: framing.type, dur: D, focus: [fx, focus[1]]}];
  const total = shots.reduce((a, sh) => a + sh.dur, 0);
  if (total !== D || shots.some((sh) => sh.dur < 1)) {
    throw new Error(`planShots(${s.id}): plan [${shots.map((sh) => sh.dur).join(', ')}] does not ` +
      `partition the scene's ${D} frames — the audio would desync`);
  }
  return {shots, framing};
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

/**
 * Reference grounds: the 4:05 chapter card and the 7:10 single-word beat are black, the 2:00 narration
 * white, and the 0:35 object showcase is white ("floating on pure white", bible §6.6).
 */
const CARD_DEFAULT_GROUND: Record<string, CardGround> = {
  chapter: 'black', narration: 'white', word: 'black', objects: 'white',
};

/** The card element itself — text cards go to `textcard.tsx`, the object showcase to `objectcard.tsx`. */
const cardElement = (card: CardT, sceneId: string): React.ReactNode => {
  const ground = card.ground ?? CARD_DEFAULT_GROUND[card.kind];
  if (card.kind === 'objects') {
    if (!Array.isArray(card.items)) {
      throw new Error(`${sceneId}: card.kind 'objects' needs an \`items\` list of object names`);
    }
    // `items=["safe", "laptop"]` and `items=[dict(kind="safe", color="#c8663f")]` are both writable;
    // the string form is the common case and normalises here, in the one place raw records are read
    const items: ShowcaseItem[] = card.items.map((it) =>
      typeof it === 'string' ? {kind: it} : it
    );
    return <ObjectCard items={items} ground={ground} />;
  }
  return <TextCard {...textCardProps(card, ground, sceneId)} />;
};

const textCardProps = (card: CardT, ground: CardGround, sceneId: string): TextCardProps => {
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
          `card.kind must be 'chapter', 'narration', 'word' or 'objects'`
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
    // RE-FRAME, DON'T CENTRE-CROP (WO-34, QA defect 9). A `v2` cell is half the frame's width and all
    // of its height, so a centre crop keeps the middle and throws the outer quarters away — which is
    // what cut `chartBoard`'s chart off its own y-axis and sliced `officeFloor`'s hero at the gutter,
    // leaving an arm and a hand floating at the seam. The cell now asks the environment where its
    // subject is (`STAGING[template].panelX`) and slides onto it, clamped so it can never uncover the
    // frame's edge. Undeclared templates (the legacy pack) keep the centre crop.
    subjectX: cell.template ? STAGING[cell.template]?.panelX : undefined,
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

/**
 * The scene's era, or null for the modern default (WO-27).
 *
 * `period` is an OPT-IN visual field on the same path as `card`/`panels`/`foreground`: written in
 * `content.py`, copied verbatim by `gen_voice_edge.py`, consumed here. It changes what the room is
 * DRESSED with, never which room it is — `template=` still names the environment.
 *
 * An unrecognised value RAISES, with the scene id, like every other device builder in this file. It
 * would otherwise be the one failure that shows up as "the era flag did nothing", i.e. exactly the
 * anachronism the flag exists to prevent, discovered in the finished 15-minute file.
 */
const ERAS: Era[] = ['pre1900'];
const sceneEra = (scene: SceneT): Era | null => {
  if (scene.period === undefined || scene.period === null) return null;
  if ((ERAS as string[]).includes(scene.period)) return scene.period as Era;
  throw new Error(
    `${scene.id}: unknown period ${JSON.stringify(scene.period)} — period must be one of ` +
    `${ERAS.map((e) => `'${e}'`).join(', ')} (docs/BIBLE.md §8 PERIOD lists what each room does with it)`
  );
};

// ============================================================================
// BALLOONS AND FLOATS — one scene's dialogue (WO-34, QA defect 1)
//
// WHAT THIS REPLACES. Each line used to be handed to `SpeechBubble` with the `x`, `y` and `tail` the
// writer typed into `content.py`, and the balloons of a scene never knew about each other or about
// the people in the room. Shipped, that put two men's heads entirely behind white boxes at `t063b`
// and pointed the upper balloon's tail into empty ceiling in all four boardroom scenes while the only
// possible speaker stood at the far right — three of Madoff's lines attributed to nobody.
//
// WHAT REPLACES IT. The scene names WHO speaks (`speaker="hero"`, or nothing, which alternates through
// the room's speakers in order); `director.tsx` resolves that to a measured head box, raising on a
// name the room does not have; and `planBalloons` places every line of the scene at once, so a balloon
// clears every head, two balloons never overlap, and every tail is solved to point at its own speaker.
//
// `x` / `y` / `tail` / `tailAt` / `tailSkew` ARE IGNORED ON A BALLOON, and that is deliberate rather
// than an oversight. They are the mechanism the defect came through: a coordinate and a side, typed
// against a room the writer cannot see, with nothing able to check them. Honouring them "when they
// look fine" would keep exactly the failure mode — a placement nobody verified — so the balloon takes
// its place from the staging, always. They stay in the type only because content.py in the field
// still emits them and a live nightly pipeline must not die on a key that used to be legal;
// `docs/BIBLE.md` §8 tells the writer to stop writing them. `maxWidth` / `maxLines` still apply:
// those are ceilings on the TEXT, which the writer can reason about without seeing the art.
//
// FLOATING DIALOGUE IS UNCHANGED. It has no tail and no speaker — it is script laid on the frame, not
// an utterance from a person in it — so `x`/`y` still position it exactly as before.
// ============================================================================
const Balloons: React.FC<{scene: SceneT; D: number}> = ({scene, D}) => {
  const {fps, width, height} = useVideoConfig();
  // The plan measures text in the REAL vendored face (crayonText's canvas), so it has to sit behind
  // the same gate the components use — a plan made against a fallback face would size every balloon
  // wrongly and the placement is computed FROM the size. The gate holds the render open, so no frame
  // is ever captured in the un-ready state.
  const ready = useCrayonFace('bubble layout');
  const lines = scene.bubbles ?? [];
  const timing = (b: BubbleT) => {
    const bFrom = Math.max(0, Math.round((b.at ?? 0) * fps));
    return {bFrom, bDur: b.dur === undefined ? Math.max(1, D - bFrom) : Math.max(1, Math.round(b.dur * fps))};
  };

  const floats = lines.map((b, i) => ({b, i})).filter(({b}) => b.kind === 'float');
  const balloons = lines.map((b, i) => ({b, i})).filter(({b}) => b.kind !== 'float');

  // Placed only when the face is live; the floats need no measurement of ours, so they mount either way.
  const placements = ready && balloons.length > 0
    ? planBalloons(
        balloons.map(({b}, k): Utterance => ({
          text: b.text,
          head: speakerHead(scene.template, b.speaker, k, scene.id),
          maxWidth: b.maxWidth,
          maxLines: b.maxLines,
        })),
        {width, height, heads: stagedHeads(scene.template), who: scene.id}
      )
    : null;

  return (
    <>
      {floats.map(({b, i}) => {
        const {bFrom, bDur} = timing(b);
        return (
          <Sequence key={`f${i}`} from={bFrom} durationInFrames={bDur}>
            <FloatingDialogue
              text={b.text} x={b.x} y={b.y} align={b.align} color={b.color}
              // NO `ground` (WO-25). The renderer used to hand the scene key's flat `bg` over and let
              // the device pick white or INK off its luminance; the key's `bg` is the colour a
              // template paints FIRST and then covers, not the colour behind the glyphs, so the rule
              // was right on some scenes and wrong on others — white-on-pale at t28, "fixed", then
              // white-on-pale again at t022. `color` is still forwarded verbatim, but it can no
              // longer choose an unreadable result: the device pairs it with the further of INK /
              // PAPER_WHITE, requires 7:1 between the two, and raises otherwise (WO-31). Anything
              // this renderer can pass either reads or halts the build; `bubble.tsx` has the argument.
              maxWidth={b.maxWidth} maxLines={b.maxLines} keyline={b.keyline}
            />
          </Sequence>
        );
      })}
      {placements && balloons.map(({b, i}, k) => {
        const {bFrom, bDur} = timing(b);
        return (
          <Sequence key={`b${i}`} from={bFrom} durationInFrames={bDur}>
            <SpeechBubble text={b.text} {...placements[k]} />
          </Sequence>
        );
      })}
    </>
  );
};

const Beat: React.FC<{scene: SceneT; from: number | null; shots: Shot[]}> = ({scene, from, shots}) => {
  const f = useCurrentFrame();
  const {fps, width, height} = useVideoConfig();
  const D = scene.durationInFrames;
  // Scene-cut fade: previously ramped all the way to 0 opacity over 16 frames (~0.53s) on EACH side
  // of a cut, so any frame sampled inside that ~1s combined window at a scene boundary reads as a
  // near-blank white flash (mistaken for a compositing bug in QA — commandPost's t21/t25 samples
  // landed exactly there). Floor keeps SOME content visible through the cut; shorter window means
  // less of the runtime is ever in the dim zone at all.
  // ...and the 8-frame ramp is COMPRESSED on a scene too short to hold two of them: `[0, 8, D-8, D]`
  // is non-monotonic for any scene of 16 frames or fewer, which is the same render-killer class as the
  // overlay ramp below (see director.tsx's RAMP SAFETY note). The 0.4 floor is unchanged — it is the
  // white-flash guard, not a fade length.
  const beatOp = interpolate(f, fadeRamp('scene cut', D, 8), [0.4, 1, 1, 0.4], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // The shot plan is made once in Video2, which is the only place that can see the PREVIOUS scene's
  // framing — the state planShots needs to keep two consecutive scenes on one template from opening
  // on the same frame. Normally the plan is a single shot spanning the whole scene (WO-17).
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
  // ONE TIMING FOR BOTH FLAVOURS OF NOTE (WO-25). The static figure used to run its own pair of ramps
  // built from D by hand — `[10, min(20, cardOut-1), cardOut, D]` — and that hand-built arithmetic is
  // exactly what killed the WO-23 render: `interpolate` needs a strictly increasing input range, and
  // `[10, 28, D-10, D]` evaluated to `[10, 28, 25, 35]` at t065 ("Unless.", 35 frames) and took the
  // whole 29,085-frame episode down with it. Even after that patch the range still went backwards for
  // any scene of 11 frames or fewer. It is now `noteRamp`, which the count-up shares: the pattern
  // scales to the scene AND is clamped monotonic, so no duration can produce a bad range.
  //
  // It is also a REVEAL now rather than a hold — see director.tsx's number-note block for the whole
  // argument. The exit LIFT stays: the note reads as a quick slide-away, not a lingering blend that
  // lets the art ghost through it (reviewer defect, t23 "SEC WELLS NOTICE").
  const noteOp = noteRamp(D).op;
  const staticOp = interpolate(f, noteOp, [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const staticRise = interpolate(f, noteOp, [18, 0, 0, -16], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});

  // WHERE THE NUMBER NOTE IS NOT DRAWN (WO-25). `CRAYON_BIBLE.md` §2: every on-screen number in the
  // captured reference is lettering on a prop, a full-screen text card, or a balloon — never a
  // persistent corner card. The note survives as a narrow deviation (director.tsx argues it in full),
  // and the first half of the narrowing is this: a scene that ALREADY carries one of the reference's
  // own carriers does not get one.
  //   * `card`  — a full-screen card covers the frame anyway, so the note under it was invisible work
  //               (t005 and t114 in the sample episode drew a note nothing ever saw);
  //   * `bubbles` — the balloon is where the reference puts a spoken figure;
  //   * `panels`  — QA defect 5: on `grid4` t017 the note covered a quarter of the split. The split IS
  //                 the composition; a card laid over one of its cells is a second one.
  // This is a documented, deliberate drop, not a silent one — `docs/BIBLE.md` §8 tells the writer.
  const noteSuppressed = Boolean(scene.card || scene.bubbles?.length || scene.panels);

  // WHERE the note goes, when it goes anywhere (WO-34, QA defect 4). Ten overlay scenes all put it
  // bottom-left, and QA found seven of them sitting on people — two seated figures at t122 with their
  // heads above the card and their legs below it, a seated figure and half a desk at t150, two or
  // three crowd figures at t141 and t113. `noteCorner` scores the four corners against the template's
  // staged occupancy and returns the emptiest one plus the largest size that is actually clear in it.
  // `null` for the legacy `scenes.tsx` templates, which this work order did not measure: those keep
  // the placement they have always had rather than being moved on a guess.
  const note = noteCorner(scene.template);

  const photo = PHOTO.mode === 'photo' && PHOTO.scenes[scene.id] ? PHOTO.scenes[scene.id] : undefined;

  // A card with no `hold` covers the scene end to end, so there is no point cutting art underneath it
  // (TextCard paints an opaque ground from its very first frame — only the TEXT fades in — so nothing
  // below it is ever visible). A `hold` shorter than the scene keeps the shots: the art is already
  // mid-shot when the card lifts, which reads as the reference's cut back out of a card.
  const cardFrames = scene.card ? cardHoldFrames(scene.card, D, fps, scene.id) : 0;
  const artHidden = cardFrames >= D;

  // WO-27: the era wraps the ART ONLY — the shot plan and every cell of a `panels` split, which is
  // every path that mounts a template. The devices layered over it need no era: a card renders no
  // art at all, a balloon and the number note are lettering on white paper, and the `foreground`
  // silhouette is a black mass. Wrapping is a no-op when `period` is absent (the default), which is
  // what keeps every existing scene byte-identical.
  const era = sceneEra(scene);
  const inEra = (art: React.ReactNode) =>
    era ? <PeriodProvider era={era}>{art}</PeriodProvider> : art;

  let t = 0;
  // THE CUT FADE IS A PICTURE FADE, NOT A FRAME FADE (WO-31).
  //
  // `beatOp` used to sit on the scene's whole subtree, so at each end of every scene it composited
  // the LETTERING toward the white PAPER along with the art. That is where the white-on-pale float
  // defect actually came from, and it is why three rounds of colour fixes could not close it: at
  // beatOp 0.4 an INK glyph composites to #999 and its PAPER_WHITE keyline stays #fff, so the device
  // arrives at the one state its own design rules out — pale script with a pale halo on a pale wall —
  // no matter which colour anybody picks. Measured at t105 (frame 21693): darkest pixel in the whole
  // frame #727272, the "black" script among them.
  //
  // This is WO-25's own doctrine applied one layer up. It deleted the balloon's 5-frame entrance fade
  // on the grounds that "a device that is see-through for a sixth of a second is see-through" and
  // "a reference balloon is flat opaque white with a uniform black keyline in EVERY FRAME IT EXISTS".
  // `beatOp` was making that false again for 16 frames of every scene — longer than the ramp WO-25
  // removed — and for floating dialogue, which has no opaque lozenge to hide the loss, it is fatal
  // rather than cosmetic.
  //
  // So the fade wraps the PICTURE — the shots, the panels split, the foreground silhouette and the
  // number note — and the lettering cuts. Stacking order is unchanged (art, note, balloons, card) and
  // the card keeps its own copy of the same fade, so a card scene still cuts in and out exactly as
  // before; the only frames that differ anywhere are the ones where a balloon or a float was being
  // washed. `backgroundColor: PAPER` moves outside the fade, which is a no-op: it was fading over the
  // identical PAPER the composition root paints.
  const picture = (art: React.ReactNode) => <AbsoluteFill style={{opacity: beatOp}}>{art}</AbsoluteFill>;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
     {picture(<>
      {/* shots cut together underneath — ungraded, and with no transform of their own: the frame is
          locked, so the only thing that ever moves is what the scene template animates internally.
          A `panels` scene (bible §6.4) replaces the whole shot plan with one static split: a split IS
          a composition, so re-framing inside it would be a second camera on top of a locked one. */}
      {!artHidden && (
        <AbsoluteFill>
          {inEra(scene.panels
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
              }))}
        </AbsoluteFill>
      )}

      {/* over-the-shoulder foreground silhouette (bible §6.8), painted over the cut art at native
          frame scale — see `foreground.tsx` for why it does not scale with the shot. Under the money
          card and the dialogue: it is scenery, and a balloon must never end up behind it. Suppressed
          while a full-screen card covers the scene, for the same reason the shots are. */}
      {!artHidden && scene.foreground && <Foreground spec={scene.foreground} sceneId={scene.id} />}

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
      {scene.overlay && !noteSuppressed && (money !== null
        ? <CountUp from={from ?? 0} to={money.num} suffix={money.suffix} sub={scene.overlay.sub} dur={D}
            negative={negOverlay} corner={note?.corner} size={note?.size} />
        : (
          // Non-numeric overlays ("1 IN 3", "-1 KIA", "10-DAY DEAL", "0.03%") render VERBATIM as one
          // static line — no count-up, no re-formatting as a dollar amount, and no forced uppercase:
          // the note sets whatever `content.py` wrote (WO-15; the retired `level` chip's caps-lock the
          // writer could not opt out of was one of the three reasons it went).
          // reviewer fix (t15 "4,000 BALISH"): the warCouncil mapTable prop's edge sat under this
          // card's default left:72 corner -- nudged left so the card clears the table. That template
          // is in the legacy `scenes.tsx` pack, which WO-34 did not measure, so it keeps the hand
          // nudge; every staged template gets its corner from `noteCorner` instead.
          <div style={note
            ? {...cornerStyle(note.corner, width, height), opacity: staticOp, transform: `translateY(${staticRise}px)`}
            : {position: 'absolute', bottom: 96, left: scene.id === 't15' ? 34 : 72, opacity: staticOp,
               transform: `translateY(${staticRise}px)`}}>
            <NumberCard figure={big} sub={scene.overlay.sub} negative={negOverlay} size={note?.size} />
          </div>
        ))}
     </>)}

      {/* speech balloons + floating dialogue (bible §6.3), over the art and over the money card.
          Each line gets its own Sequence, which is what makes the component's entrance fire when the
          LINE appears rather than when the scene does — and lets two speakers alternate in one scene,
          as the 9:20 reference frame does with its two balloons. */}
      {scene.bubbles?.length ? <Balloons scene={scene} D={D} /> : null}

      {/* full-screen card (bible §6.1/§6.2/§6.6) — narration beat, single dramatic word, the chapter
          card, or the object showcase. LAST in the stack because it is full-screen and opaque: it
          covers the art, the money card and any balloon for exactly as long as it holds. */}
      {scene.card && (
        <Sequence from={0} durationInFrames={cardFrames}>
          {/* the card keeps the scene-cut fade it has always had — it is a full-screen opaque device
              that cuts in and out with the scene, not lettering laid over a picture, and its own
              ground moves with it, so the wash never separates its glyphs from what is behind them */}
          {picture(cardElement(scene.card, scene.id))}
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
  // The RANGE is compressed on a short shot (`fadeRamp`): `[0, 4, dur-4, dur]` folds back on itself
  // for any shot of 8 frames or fewer, and since WO-17 a shot IS a whole scene — the same one-word-
  // scene path that killed the WO-23 render. The 0.85 floor itself is untouched.
  const op = interpolate(f, fadeRamp('shot cut', dur, 4), [0.85, 1, 1, 0.85], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
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
  // The previous scene's template and framing — the ONLY cross-scene state the planner needs now that
  // a scene is one framing: it exists so two consecutive scenes on the same template do not open on
  // an identical frame (see planShots).
  let prev: {template: string; framing: Framing} | null = null;
  for (const s of scenes) {
    const money = splitMoney(s.overlay?.big);
    const from = money && last && last.suffix === money.suffix ? last.num : null;
    const {shots, framing} = planShots(s, prev);
    prev = {template: s.template, framing};
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
