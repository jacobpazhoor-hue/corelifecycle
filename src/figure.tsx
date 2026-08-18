import React from 'react';
import meta from './episode_meta.json';
import {blink as idleBlink, gaze as idleGaze, idleBreath, pulse, wander, clamp01, hash} from './anim';
import {INK, PAPER_WHITE, STROKE, STROKE_THIN} from './crayonStyle';

// CRAYON character (bible §5 "Character construction"): large rounded head, plain black dot eyes,
// NO nose, a small mouth line, hair as one solid shape, a filled torso with collar/tie, short simple
// stick limbs. Uniform-weight pure-black outline, flat fills, zero gradients.
//
// This deliberately replaced the whiteboard-doodle figure. Two things were removed outright:
//   - the `rough` feTurbulence/feDisplacementMap filter, and
//   - the whole-figure `boil()` wobble
// Both existed to fake a hand-drawn look. The reference art is clean flat vector — measured at
// 74–92% flat fill with zero texture (docs/research/crayon/MEASUREMENTS.md). That channel's
// hand-drawn quality lives entirely in its typography, which crayonFont/crayonStyle own.
// The `rough` prop survives as an accepted no-op so the ~28 existing call sites keep compiling.

export type Pose = {
  spineLean: number; headTilt: number;
  armNearShoulder: number; armNearElbow: number;
  armFarShoulder: number; armFarElbow: number;
  legNearHip: number; legNearKnee: number;
  legFarHip: number; legFarKnee: number;
  bob: number;
};
export type Expr = {brow: number; browRaise: number; lid: number; mouth: Mouth; look: number};

/**
 * The mouth shapes. `'smile'` is NEW (2026-08-17) and it is the only shape that curves upward.
 *
 * It exists because `'neutral'` used to BE the smile: every shape had an explicit branch except
 * `'neutral'`, which fell through to a `Q` curve with its control point BELOW the corners — an
 * unmistakable grin. `FACES.neutral` and `FACES.earnest` both carry `mouth: 'neutral'`, so the two
 * news anchors reporting the $50bn fraud (t120 f20071) and DiPascali's death (t153 f26653) grinned
 * through both beats, as did the courtroom gallery at the guilty plea (t127) and the pair in the
 * living room over Mark Madoff's suicide (t143). This is the SAME class of bug the `'flat'` branch
 * above was added to fix; that fix patched one caller out of the default instead of the default.
 *
 * `'neutral'` is now a small level line — the reference's resting mouth (bible §5, "a small mouth
 * line"). A figure smiles only when a call site asks for `'smile'`, and `mood` (below) can veto even
 * that. Nothing in the codebase asks for it today, which is the point: on a noirish explainer the
 * default face must not be pleased.
 */
export type Mouth = 'neutral' | 'flat' | 'frown' | 'open' | 'smirk' | 'tight' | 'smile';

/**
 * PER-SCENE EMOTIONAL REGISTER (QA_WATCH item 6).
 *
 *   - `neutral` — the DEFAULT, and the register this format is written in ("straight and noirish,
 *                 held throughout", content.py header). An unmotivated smile is suppressed; every
 *                 other expression a call site asks for is passed through untouched.
 *   - `grim`    — a death, a sentencing, a ruin. Nothing pleasant survives: smile/smirk/neutral all
 *                 harden to `flat`, and the perky brow-raise is capped below the threshold that
 *                 draws brows at all. `frown`, `tight` and `open` (shock) pass through — those are
 *                 the right faces for a grim beat.
 *   - `bright`  — an explicit opt-in for the rare scene that is genuinely up. Passes everything.
 *
 * A scene sets it by wrapping its art in `<MoodProvider mood="grim">`; a single figure can override
 * with `mood=`. Both are optional and both default to `neutral`, so an untouched call site renders
 * exactly what it renders today — minus the smile it never asked for.
 */
export type Mood = 'neutral' | 'grim' | 'bright';

export const MoodContext = React.createContext<Mood>('neutral');
export const MoodProvider: React.FC<{mood: Mood; children?: React.ReactNode}> = ({mood, children}) => (
  <MoodContext.Provider value={mood}>{children}</MoodContext.Provider>
);

/** Applies a scene's register to one expression. Pure, exported so a template can reason about it. */
export function moodExpr(expr: Expr, mood: Mood): Expr {
  if (mood === 'bright') return expr;
  if (mood === 'neutral') return expr.mouth === 'smile' ? {...expr, mouth: 'neutral'} : expr;
  if (mood !== 'grim') {
    throw new Error(`unknown mood ${JSON.stringify(mood)} — expected 'neutral', 'grim' or 'bright'`);
  }
  const soft = expr.mouth === 'smile' || expr.mouth === 'smirk' || expr.mouth === 'neutral';
  return {...expr, mouth: soft ? 'flat' : expr.mouth, browRaise: Math.min(expr.browRaise, 0.12)};
}
/**
 * A palette separates the two things a figure is made of (WO-2c):
 *   - `limb`  — the LINEWORK colour. Every stroke on the figure: silhouette outline, limb sticks,
 *               head outline, face dots, collar/tie detail, shoes. Pure black in the reference,
 *               background crowd figures included.
 *   - `tone`  — the BODY-FILL treatment. `'grey'` swaps skin/costume/hair fills for the anonymous
 *               crowd greys and leaves the linework alone. Absent (the default) = full colour.
 *
 * The field is optional, so the existing `{limb: …}` literal form still type-checks.
 */
export type Palette = {limb: string; tone?: 'colour' | 'grey'};

export const PAPER = '#f6f2e9';
export const INKPAL: Palette = {limb: INK};
export const LIGHT: Palette = INKPAL;
export const DARK: Palette = INKPAL;
// DIM = the grey anonymous crowd (bible §6.5). It desaturates FILLS ONLY. It used to set `limb` to a
// grey, which greyed the outline too, and the crowd read as faded/washed-out — a rendering weakness
// rather than the deliberate focal device. Measured on the reference (4:56 stairs cell of
// docs/research/crayon/frames/wolf_montage_verified.jpg, and HawmGu7oNrc/thumb.png): the grey crowd
// carries the SAME pure-black uniform-weight outline and the same black stick limbs as the hero;
// only the skin/body fills are desaturated.
export const DIM: Palette = {limb: INK, tone: 'grey'};
export const SIL: Palette = INKPAL;

// Flat character fills, sampled off the reference thumbnail (docs/research/crayon/HawmGu7oNrc/thumb.png):
// skin rgb(239,208,171), shirt rgb(251,251,251), suit rgb(32,35,55).
// EXPORTED because a face drawn anywhere else must be this colour and not a scene tone. QA_WATCH
// item 18: `setdressing.Portrait` filled its face from `shade(tn.card, 2)`, the room's own tone
// ladder, so the framed portrait on the courtroom wall came out VIOLET on a blue-keyed scene
// (t113 f19101, t127 f21537) while every live character in the frame held this skin.
export const SKIN = '#efd0ab';
// Background people are featureless grey, never coloured — the "grey crowd + colour hero" focal
// device (bible §6.5). Callers opt in by passing pal={DIM}, and the costume is desaturated to these
// greys rather than skipped, so a crowd figure still has a torso silhouette. These are FILLS only:
// the outline around them stays INK (see the DIM note above).
const CROWD_FILL = '#c9c4bb';
const CROWD_SKIN: CostumeSkin = {body: '#a8a49c', accent: '#8e8a82', collar: '#c9c4bb', hair: '#8e8a82', hairStyle: 'crop'};

const D = Math.PI / 180;

// ---------------------------------------------------------------------------
// PROPORTIONS (WO-2b). WO-2 fixed how the character is DRAWN; these numbers fix how it is BUILT.
// The old rig (spine 94, head 36, upperArm 50, foreArm 46, thigh 56, shin 54) put 110 units of leg
// against a 94-unit torso, so the figure read as spindly: legs longer than the whole torso, a small
// head, and a body that occupied ~6% of frame width against the reference's ~14%.
//
// Measured off the reference (docs/research/crayon/frames/*, docs/research/crayon/HawmGu7oNrc/thumb.png).
// The montage cells are 308×173 px each and each cell is one whole 16:9 frame, so 1 cell px = 6.234 px
// at 1920; wolf_t0003.png is a native 1280×720 frame, so 1 px = 1.5 px at 1920.
//
//   ratio                      | 4:56 stairs | 2:08 boxes | t0003 | 10:10 couple | used here
//   head height / figure height|    0.33     |    0.34    |   —   |      —       |   0.35
//   head width / head height   |    0.93     |    0.85    | 1.04  |     0.88     |   0.92
//   torso width / head width   |    1.00     |    0.85    | 0.95  |     1.28     |   1.03
//   torso height / head height |    1.10     |    1.00    | 1.06  |     1.41     |   1.13
//   leg length / torso height  |    0.73     |    0.75    |   —   |      —       |   0.69
//   limb stroke / head width   |    0.054    |     —      | 0.040 |     0.058    |   0.075 (see below)
//   figure width / frame width |    0.140    |    0.140   |   —   |      —       |  ~0.10 (see below)
//
// Three things are deliberately LEFT ALONE so the ~358 stage templates keep composing:
//   - thigh + shin: unchanged, so a figure's feet land on exactly the pixel they landed on before.
//     Call sites pass `y` as the HIP, so any change here would lift every figure off its ground.
//   - the arm chain grows by the SAME factor as the spine (×1.40). The shoulder rises with a longer
//     spine, which drags every hand with it; growing the arms in step puts the typing/signing hand
//     back within ~15 units of where it was instead of ~40 above the prop it is meant to touch.
//   - `scale`: the growth is baked into the segment lengths, so the ~28 call sites and the ~358
//     template `fig={{scale: …}}` specs are untouched.
export const SEG = {spine: 132, neck: 12, head: 52, upperArm: 70, foreArm: 64, thigh: 56, shin: 54};

// The DRAWN head is larger than SEG.head so the chin sits on the shoulders (the reference's
// no-visible-neck silhouette). The reference head is close to round — measured w/h 0.85–1.04, mean
// 0.92 — where the old 1.02/1.26 pair drew it at 0.81, i.e. visibly egg-shaped and too narrow for
// its height. 1.13/1.23 lands at 0.92.
const HEAD_HW = 1.13;   // half-width  as a multiple of SEG.head
const HEAD_HH = 1.23;   // half-height as a multiple of SEG.head
/** Drawn head width in figure units — the yardstick every other proportion below is quoted against. */
const HEAD_W = 2 * HEAD_HW * SEG.head;

/**
 * Limb stroke as a fraction of head width.
 *
 * MEASURED on the reference: 0.040 (t0003, a 7px arm against a 174px head at 1280) to 0.058
 * (10:10, 2.5 cell px against a 43 cell px head). This is a DELIBERATE OVERSHOOT of that band.
 * The reference's figures fill ~14% of frame width; ours fill ~10% even after this work order, so a
 * strictly-scaled limb would render at 6–7 units — which at our in-frame size is the wire the owner
 * review is complaining about. 0.075 keeps the limb marginally heavier than the silhouette outline
 * (STROKE 8 vs 8.8) and reads stocky at the size we actually render at.
 */
const LIMB_W_RATIO = 0.075;

/** How far below the hip the garment hem falls, as a multiple of SEG.head. The reference's jacket
 *  hem covers the hip joint and the top of the thigh, which is most of what shortens the leg read. */
const HEM_DROP = 0.22;

type P = {x: number; y: number};
const down = (p: P, deg: number, len: number, facing: number): P => ({x: p.x + Math.sin(deg * D) * len * facing, y: p.y + Math.cos(deg * D) * len});

// Interior detail (collar, tie, fringe) is drawn thinner than the silhouette outline, the same
// ratio the measured stroke band carries (bible §5: outline ≈6–10px at 1920).
const detailRatio = STROKE_THIN / STROKE;

const Face: React.FC<{cx: number; cy: number; hw: number; hh: number; expr: Expr; lid: number; lookY: number; ink: string}> =
({cx, cy, hw, hh, expr, lid, lookY, ink}) => {
  const eyeDX = hw * 0.30;
  const eyeY = cy + hh * 0.06;
  // Plain filled circles. The reference has NO catchlight and no lash — a dot is the whole eye.
  const eyeR = hw * 0.115;
  const browY = eyeY - hh * 0.24 - expr.browRaise * hh * 0.10;
  const bw = hw * 0.28;
  const my = cy + hh * 0.40, mw = hw * 0.62, ms = hw * 0.10;
  const px = expr.look * hw * 0.07, py = lookY * hh * 0.05;

  const eye = (sx: number, key: string) => {
    const ex = cx + sx;
    if (lid > 0.9) return <line key={key} x1={ex - eyeR * 1.3} y1={eyeY} x2={ex + eyeR * 1.3} y2={eyeY} stroke={ink} strokeWidth={eyeR * 1.1} strokeLinecap="round" />;
    return <circle key={key} cx={ex + px} cy={eyeY + py} r={eyeR * (1 - 0.55 * lid)} fill={ink} />;
  };
  // Brows are EXPRESSION, not anatomy: the reference's resting face is dots + mouth and nothing else,
  // and brows appear only when the character is pushing an emotion. Drawing them always put a
  // permanent scowl on every neutral figure.
  const showBrow = Math.abs(expr.brow) > 0.15 || Math.abs(expr.browRaise) > 0.15;
  const brow = (sx: number, dir: number, key: string) => {
    const ix = cx + sx - dir * bw, iy = browY - expr.brow * hh * 0.12;
    const ox = cx + sx + dir * bw, oy = browY + Math.abs(expr.brow) * hh * 0.02;
    return <line key={key} x1={ix} y1={iy} x2={ox} y2={oy} stroke={ink} strokeWidth={ms * 0.9} strokeLinecap="round" />;
  };

  let mouth: React.ReactNode;
  if (expr.mouth === 'open') mouth = <ellipse cx={cx} cy={my} rx={mw * 0.28} ry={hh * 0.13} fill="#7a3b3b" stroke={ink} strokeWidth={ms * 0.8} />;
  else if (expr.mouth === 'frown') mouth = <path d={`M ${cx - mw / 2} ${my + hh * 0.05} Q ${cx} ${my - hh * 0.09} ${cx + mw / 2} ${my + hh * 0.05}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else if (expr.mouth === 'smirk') mouth = <path d={`M ${cx - mw / 2} ${my + hh * 0.04} Q ${cx + mw * 0.1} ${my + hh * 0.03} ${cx + mw / 2} ${my - hh * 0.06}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  else if (expr.mouth === 'tight') mouth = <line x1={cx - mw * 0.34} y1={my} x2={cx + mw * 0.34} y2={my} stroke={ink} strokeWidth={ms * 1.3} strokeLinecap="round" />;
  // 'flat' MUST be a dead-straight line (hardened/hollow/cold). Before this branch it fell
  // through to the smiling default, which put a faint pleasant smile on every late-arc face.
  else if (expr.mouth === 'flat') mouth = <line x1={cx - mw * 0.4} y1={my} x2={cx + mw * 0.4} y2={my} stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  // The ONLY upward curve, and it is now opt-in. See the `Mouth` note: this branch used to be the
  // fallthrough, so it was also what 'neutral' drew — every default face in the episode was smiling.
  else if (expr.mouth === 'smile') mouth = <path d={`M ${cx - mw * 0.4} ${my} Q ${cx} ${my + hh * 0.06} ${cx + mw * 0.4} ${my}`} fill="none" stroke={ink} strokeWidth={ms} strokeLinecap="round" />;
  // 'neutral' — and the fallthrough, so no unrecognised value can smile again. A small level line:
  // shorter and lighter than 'flat' (settled/hard) and than 'tight' (clenched), so the three still
  // read apart, but with no curvature in either direction.
  else mouth = <line x1={cx - mw * 0.30} y1={my} x2={cx + mw * 0.30} y2={my} stroke={ink} strokeWidth={ms * 0.85} strokeLinecap="round" />;

  return (<g>
    {eye(-eyeDX, 'el')}{eye(eyeDX, 'er')}
    {showBrow && (<>{brow(-eyeDX, -1, 'bl')}{brow(eyeDX, 1, 'br')}</>)}
    {mouth}
  </g>);
};

// ---------------------------------------------------------------------------
// COSTUMES (2026-07-19). The bare stick figure reads as "generic doodle"; a filled
// torso + hair is what makes a character look like SOMEBODY at thumbnail size. Limbs stay
// thin sticks — the silhouette is unchanged, so every existing pose still works.
// `none` is the default, so nothing renders differently unless a caller opts in.
export type Costume = 'none' | 'suit' | 'uniform' | 'scrubs' | 'royal' | 'street' | 'field';
// The VIDEO has ~28 StickFigure call sites and no central wrapper, so the episode's costume is
// resolved HERE and used as the default. One topic -> one wardrobe, thumbnail and video alike.
// A call site can still override per-figure (crowds/silhouettes) by passing `costume` explicitly.
const COSTUME_HINTS: Array<[RegExp, Costume]> = [
  [/surgeon|doctor|medic|hospital|nurse|\bmd\b/i, 'scrubs'],
  [/king|emperor|empire|royal|dynasty|throne|monarch|pharaoh|sultan|ottoman|\brome\b|roman/i, 'royal'],
  [/special.?forces|soldier|military|\bwar\b|sniper|marine|commando|\barmy|\bnavy|spec.?ops|regime|dictator|north.?korea|guard/i, 'uniform'],
  [/cartel|mafia|\bmob\b|mobster|hitman|assassin|kingpin|bratva|yakuza|gang|narco|smuggl|prison|inmate|convict|street/i, 'street'],
  [/survive|stranded|castaway|shipwreck|jungle|desert|wilderness|arctic|mountain|pirate|explorer|miner|farm/i, 'field'],
  [/startup|founder|unicorn|venture|entrepreneur|\bipo\b|\bceo\b|banker|lawyer|trader|hedge|billion|trillion|mogul|heir|executive|corporate|spy|agent/i, 'suit'],
];
export function episodeCostume(): Costume {
  const m = meta as any;
  if (m?.thumb?.costume) return m.thumb.costume as Costume;
  const topic = (m?.topic || '') + ' ' + (m?.title || '');
  for (const [re, name] of COSTUME_HINTS) if (re.test(topic)) return name;
  return 'suit';
}
export type CostumeSkin = {body: string; accent: string; collar: string; hair: string; hairStyle: 'crop' | 'mop' | 'tuft'};
export const COSTUMES: Record<Exclude<Costume, 'none'>, CostumeSkin> = {
  suit:    {body: '#202337', accent: '#c9243f', collar: '#ffffff', hair: '#111111', hairStyle: 'mop'},   // founder/finance/mob
  uniform: {body: '#3c4a33', accent: '#d4af37', collar: '#cdd3bd', hair: '#171717', hairStyle: 'crop'},  // military/regime
  scrubs:  {body: '#1f7a86', accent: '#ffffff', collar: '#d8f0f3', hair: '#241a12', hairStyle: 'crop'},  // medical
  royal:   {body: '#5a2a9e', accent: '#f2c230', collar: '#f6e7bd', hair: '#1d1208', hairStyle: 'mop'},   // empire/monarch
  street:  {body: '#33383f', accent: '#b8342b', collar: '#9aa0a8', hair: '#15100c', hairStyle: 'mop'},   // cartel/survival
  field:   {body: '#6b5433', accent: '#2f4a2a', collar: '#cbbb95', hair: '#2a1c10', hairStyle: 'tuft'},  // explorer/worker
};

// ---------------------------------------------------------------------------
// CAST SLOTS (QA_WATCH item 8, 2026-08-17). "Every named person is drawn as Madoff."
//
// `episodeCostume()` resolves ONE wardrobe from the topic and hands it to every figure in the
// episode as a default, so the hero, Harry Markopolos (t074 f12576), Peter Madoff (t141 f24093) and
// Mark Madoff (t143 f24488) all rendered as the same black-haired man in the same navy suit with the
// same red tie — and t007/t043/t117/t133 seated two of him side by side on one sofa, which reads as
// a cloning bug rather than as two people. The explainer format names several people per episode, so
// one wardrobe per episode is a structural limit, not a palette nit.
//
// A CAST SLOT is a second axis on top of the costume. The costume still says what KIND of person
// this is (finance/military/medical — chosen once, from the topic); the slot says WHICH person.
// Slot 0 is the lead and is byte-identical to `COSTUMES[costume]`, so every figure that does not ask
// for a slot renders exactly as it did before this change.
//
// The three cues are the ones that survive at our in-frame size (~10% of frame width): hair COLOUR,
// hair SHAPE, and the tie. The suit body moves too, but only within the muted band the restyle is
// scored on — measured saturation of the alternates' body fills is 0.18 and 0.31 against the
// reference suit's 0.42, so an alternate never becomes the brightest thing in the frame.
const CAST_ALTERNATES: ReadonlyArray<Pick<CostumeSkin, 'body' | 'accent' | 'hair' | 'hairStyle'>> = [
  // slot 1 — older, greying, cropped; cold slate suit, muted teal tie
  {body: '#3c4149', accent: '#3f6b63', hair: '#8d8377', hairStyle: 'crop'},
  // slot 2 — brown-haired, shaggier; warm taupe suit, muted gold tie
  {body: '#4a4033', accent: '#a8823c', hair: '#5d4327', hairStyle: 'tuft'},
];
/** How many distinguishable people one episode can stage. Slot 0 is the lead. */
export const CAST_SLOTS = CAST_ALTERNATES.length + 1;

/**
 * The wardrobe for one member of the cast. `cast` 0 returns the episode's lead wardrobe unchanged.
 * Throws on an out-of-range slot rather than wrapping — a scene asking for a fourth person is a
 * content error, and silently re-using person #1 is exactly the defect this exists to fix.
 */
export function castCostume(costume: Costume, cast = 0): CostumeSkin | null {
  if (costume === 'none') return null;
  if (!Number.isInteger(cast) || cast < 0 || cast >= CAST_SLOTS) {
    throw new Error(
      `cast slot ${cast} is out of range — there are ${CAST_SLOTS} slots (0 = the lead, ` +
        `1..${CAST_SLOTS - 1} = the other named people in the episode)`
    );
  }
  const base = COSTUMES[costume];
  return cast === 0 ? base : {...base, ...CAST_ALTERNATES[cast - 1]};
}

/**
 * A scene declares WHOSE scene it is by wrapping its art in `<CastProvider cast={n}>`; every figure
 * inside that does not name its own slot picks it up. That is the per-scene selector QA asked for:
 * one value on the scene record, one wrapper at the scene layer, no template rewrites.
 *
 * Default 0 keeps every existing frame identical.
 */
export const CastContext = React.createContext<number>(0);
export const CastProvider: React.FC<{cast: number; children?: React.ReactNode}> = ({cast, children}) => (
  <CastContext.Provider value={cast}>{children}</CastContext.Provider>
);

// ---------------------------------------------------------------------------
// LOCALISED IDLE (WO-14). CRAYON_BIBLE §3 locks the camera; it does NOT freeze the picture — the
// reference holds the frame still while its characters keep moving, and only ~40% of its sampled
// frames are completely motionless. WO-3 took our camera motion away and WO-4 measured what was
// left: 80–90% motionless, twice as still as the reference. The gap is here, in the figure.
//
// So every figure carries a small idle of its own, in POSE SPACE (angles + a hip shift), which means
// it costs one transform per figure and no extra geometry — this renders a ~27,000-frame episode.
// Three layers, deliberately different in rate so they never beat against each other:
//   - breath  — continuous, tiny. Stops a held figure reading as a cut-out. Below the frame-diff
//               threshold on its own; it is there for the eye, not for the metric.
//   - sway    — a slow weight shift, noise-driven, ~0.25 Hz.
//   - act     — an occasional GESTURE: the near arm lifts, the head follows a few frames late, the
//               body leans into it. This is the layer that actually moves pixels.
// Every layer's phase AND rate come from the figure's own seed (see anim.ts), so a crowd desynchs
// itself — a row driven off one clock pulses in unison, which reads worse than stillness.
export type IdleLevel = 'none' | 'subtle' | 'idle' | 'gesture';
/** `subtle` = a body in a background crowd, `idle` = a staged figure holding the frame, `gesture` =
 *  a figure that is speaking or acting. `none` freezes it (thumbnails, deliberate tableaux). */
const IDLE_GAIN: Record<IdleLevel, number> = {none: 0, subtle: 0.5, idle: 1, gesture: 1.55};

/** Calibration handle for the whole idle system. Raising this raises every figure's motion together;
 *  it is the one number to turn when the measured motionless-frame share moves out of band. */
const IDLE_SCALE = 1.7;

type IdleShift = {pose: Pose; dx: number; dy: number};

const idleFigure = (p: Pose, f: number, seed: number, level: IdleLevel, gain: number): IdleShift => {
  const g = IDLE_GAIN[level] * IDLE_SCALE * gain;
  // f === 0 is the codebase's existing idiom for "this figure is frozen" (thumbs.tsx, and every
  // crowd call site before this work order), and the ramp keeps that literally true: at frame 0 the
  // figure is EXACTLY the pose the template staged. It also means the idle eases in over 8 frames
  // after every cut instead of snapping to its seeded phase — `useCurrentFrame` is Sequence-local,
  // so each shot restarts at 0.
  const env = g * clamp01(f / 8);
  if (env <= 0) return {pose: p, dx: 0, dy: 0};

  const bpm = 12 + hash(seed * 1.3) * 6;                  // 12–18 breaths/min, per figure
  const ph = hash(seed) * 90;                             // breath phase, per figure
  const br = idleBreath(f + ph, 30, bpm);
  const brLag = idleBreath(f - 4 + ph, 30, bpm);          // head follows the chest, ~4 frames late
  const sway = wander(f, seed, 30, 0.26);
  const swayLag = wander(f - 5, seed, 30, 0.26);
  // ~one gesture every 2.8s, held for 1.0s. `pulse` jitters both period and phase off the seed.
  // WO-24 raised the DUTY CYCLE (104/24 -> 84/30, 23% -> 36% of frames) rather than the amplitude:
  // the gesture already clears the bible's |Δ| 1.0 motionless threshold comfortably when it fires
  // (measured peaks of 9.9-15.7 on the hero-carrying templates), so what was leaving 68% of samples
  // motionless was how OFTEN it fires, not how far it moves. Amplitude is unchanged, which is why
  // no figure got looser-limbed to buy the number.
  const act = pulse(f, seed + 4, 84, 30);
  const actLag = pulse(f - 5, seed + 4, 84, 30);

  return {
    pose: {
      ...p,
      spineLean: p.spineLean + env * (br * 0.7 + sway * 2.6 + act * 4.0),
      headTilt: p.headTilt + env * (brLag * 0.6 + swayLag * 3.2 + actLag * 5.5),
      bob: p.bob + env * (br * 1.1 + act * 3.4),
      armNearShoulder: p.armNearShoulder + env * (sway * 3.0 - act * 15.0),
      armNearElbow: p.armNearElbow + env * (actLag * 11.0),
      armFarShoulder: p.armFarShoulder + env * (swayLag * 2.4 - actLag * 8.0),
      armFarElbow: p.armFarElbow + env * (act * 6.0),
    },
    // A small whole-figure shift on top of the articulation. Pose angles rotate the body about the
    // hip, which barely moves the large filled masses (torso, head) that carry most of the figure's
    // area; a few units of translation moves all of it. Kept small enough that the contact shadow
    // travelling with the feet reads as a weight change, not as a slide.
    dx: env * (sway * 3.4 + act * 5.0),
    dy: env * (-act * 2.2 - br * 0.8),
  };
};

export const StickFigure: React.FC<{
  pose: Pose; x: number; y: number; scale?: number; facing?: number;
  pal?: Palette; view?: 'front' | 'profile' | 'back'; expr?: Expr; frame?: number;
  showFace?: boolean; briefcase?: boolean; lineW?: number; costume?: Costume;
  /** How much localised idle motion this figure carries (WO-14). Defaults to `idle`; every existing
   *  call site keeps compiling and a figure given `frame={0}` still renders exactly as before. */
  idle?: IdleLevel;
  /**
   * Multiplier on this ONE figure's idle (WO-24). Default 1; nothing else in the codebase passes it.
   *
   * It exists because the idle is authored in POSE SPACE, so its on-screen amplitude scales with the
   * figure. That is right almost everywhere and wrong at `closeUpPortrait`'s 5.6x: the same `subtle`
   * idle that moves a background body a few pixels swung that head about 70px a second — a reaction
   * shot lurching, not breathing. Turning IDLE_SCALE down instead would have taken the motion out of
   * every crowd in the episode to fix one figure, so the compensation lives at the one call site
   * that needs it, next to the `lineW={STROKE / PORTRAIT_SCALE}` that compensates for the same thing
   * in the linework.
   */
  idleGain?: number;
  /**
   * THIS FIGURE'S STABLE IDENTITY, and the one thing a MOVING figure must pass (WO-33).
   *
   * Every idle layer draws its phase and its rate from a seed, and the seed defaults to the figure's
   * staged position — which is correct for the ~350 figures that stand still and catastrophically
   * wrong for the handful that walk. `hash()` is a chaotic sin-fract: two seeds a fraction apart
   * give unrelated outputs. So a `Passerby` translating 11 units a frame re-drew a NEW random breath
   * phase, breath rate, sway seed and gesture phase on EVERY FRAME, and the idle — designed as three
   * slow continuous layers — degenerated into white noise added to the pose. Measured on
   * `exchangeFloor`'s runner: a steady -11.2 units/frame of travel rendered as head displacements
   * swinging between -26.1 and +5.8 units, reversing direction two frames in three. That is the
   * "characters spazz" the owner reported, and it is the only mechanism in the frame that alternates
   * at the frame rate.
   *
   * Pass anything CONSTANT that is unique to the figure — its call-site seed, its index, its start x.
   * Never pass its live position. It also seeds the blink and the gaze, for the same reason.
   */
  seed?: number;
  /**
   * WHICH PERSON this is (QA_WATCH item 8). 0 = the episode's lead, 1..CAST_SLOTS-1 = the other
   * named people. Omitted, it falls back to the enclosing `CastProvider`, and with no provider to 0
   * — so every existing call site is unchanged. See `castCostume`.
   */
  cast?: number;
  /**
   * This figure's emotional register (QA_WATCH item 6). Omitted, it falls back to the enclosing
   * `MoodProvider`, and with no provider to `'neutral'`. See `Mood`.
   */
  mood?: Mood;
  /** Accepted and ignored — the sketch filter is gone (see the header note). Kept so call sites compile. */
  rough?: boolean;
}> = ({
  pose: basePose, x, y, scale = 1, facing = 1, pal = INKPAL, view = 'profile',
  expr: exprProp = {brow: 0, browRaise: 0, lid: 0, mouth: 'neutral', look: 0}, frame = 0,
  showFace = true, briefcase = false, lineW = STROKE, costume = episodeCostume(), idle = 'idle',
  idleGain = 1, seed: idProp, cast: castProp, mood: moodProp,
}) => {
  // Identity and register both resolve prop -> scene -> default, in that order. Both defaults are
  // the no-op, so a template that names neither renders what it rendered before. Both contexts are
  // read UNCONDITIONALLY — `castProp ?? useContext(...)` would short-circuit the hook away on any
  // figure that names its own slot, which is a conditional hook call.
  const sceneCast = React.useContext(CastContext);
  const sceneMood = React.useContext(MoodContext);
  const castSlot = castProp ?? sceneCast;
  const expr = moodExpr(exprProp, moodProp ?? sceneMood);
  const front = view === 'front';
  // Seeded off the figure's own staged position, so two figures in one row are never in phase and
  // the same figure animates identically on every machine and every re-render. A figure that MOVES
  // must pass `seed` instead — see the prop note; a position that changes every frame re-rolls every
  // phase in here every frame, which is vibration, not idle.
  const idleSeed = idProp ?? (x * 0.0173 + y * 0.0071 + scale * 3.1);
  const {pose, dx: idleDX, dy: idleDY} = idleFigure(basePose, frame, idleSeed, idle, idleGain);
  // ALL linework — outlines, limb sticks, face, costume detail, and the solid shoe, which the
  // reference draws in the same black as the limb it terminates. Never desaturated; only fills are.
  const ink = pal.limb;
  const hip: P = {x: 0, y: -pose.bob};
  const shoulder: P = {x: hip.x + Math.sin(pose.spineLean * D) * SEG.spine * facing, y: hip.y - Math.cos(pose.spineLean * D) * SEG.spine};
  const headA = pose.spineLean + pose.headTilt;
  const headC: P = {x: shoulder.x + Math.sin(headA * D) * (SEG.neck + SEG.head) * facing, y: shoulder.y - Math.cos(headA * D) * (SEG.neck + SEG.head)};

  const ffar = front ? -facing : facing;
  const elbowN = down(shoulder, pose.armNearShoulder, SEG.upperArm, facing);
  const handN = down(elbowN, pose.armNearShoulder + pose.armNearElbow, SEG.foreArm, facing);
  const elbowF = down(shoulder, pose.armFarShoulder, SEG.upperArm, ffar);
  const handF = down(elbowF, pose.armFarShoulder + pose.armFarElbow, SEG.foreArm, ffar);
  // hips sit a little apart (real stance width) instead of one point — otherwise a near/far leg
  // pair with matching hip+knee angles (the common standing pose, seen in profile) draws as one
  // exact overlapping line instead of two legs. Scaled with the head (i.e. with the whole figure),
  // because 11 units of stance under a 121-unit-wide torso reads as one leg again.
  const HIP_W = SEG.head * 0.31;
  const hipN: P = {x: hip.x + HIP_W * facing, y: hip.y};
  const hipF: P = {x: hip.x - HIP_W * facing, y: hip.y};
  const kneeN = down(hipN, pose.legNearHip, SEG.thigh, facing);
  const footN = down(kneeN, pose.legNearHip + pose.legNearKnee, SEG.shin, facing);
  const kneeF = down(hipF, pose.legFarHip, SEG.thigh, ffar);
  const footF = down(kneeF, pose.legFarHip + pose.legFarKnee, SEG.shin, ffar);

  // Background people are flat grey with no costume colour; the hero keeps full colour. Driven by the
  // palette's declared `tone`, not by object identity against DIM, so the fill/outline split is one
  // rule rather than a special case at the DIM call sites.
  const crowd = pal.tone === 'grey';
  const skinFill = crowd ? CROWD_FILL : SKIN;
  const detailW = lineW * detailRatio;
  // Limbs are stroked at a weight PROPORTIONAL to the figure (LIMB_W_RATIO of head width), not at the
  // flat outline default — the reference scales its limb weight with the character, so a small
  // background walker and a hero must not share one absolute stroke. `lineW` still governs: passing a
  // heavier outline scales the limbs with it.
  const limbW = HEAD_W * LIMB_W_RATIO * (lineW / STROKE);

  const bone = (a: P, b: P, w: number, c: string, key: string) =>
    <path key={key} d={`M ${a.x} ${a.y} L ${b.x} ${b.y}`} stroke={c} strokeWidth={w} strokeLinecap="round" fill="none" />;
  const hand = (p: P, key: string) => <circle key={key} cx={p.x} cy={p.y} r={limbW * 1.0} fill={skinFill} stroke={ink} strokeWidth={detailW} />;
  // Shoes are solid, not outlined-and-hollow: flat fill, no interior line (bible §5 "flat fills").
  const foot = (k: P, f: P, key: string) => {
    const ang = Math.atan2(f.y - k.y, f.x - k.x) * 180 / Math.PI;
    return <ellipse key={key} cx={f.x} cy={f.y} rx={limbW * 2.0} ry={limbW * 1.0} fill={ink} transform={`rotate(${ang + 90} ${f.x} ${f.y})`} />;
  };
  // Blink and gaze take the SAME stable identity as the idle: `Math.round(x)` on a walker changes
  // every frame, which re-rolls the blink period and the gaze noise seed frame by frame — a
  // stroboscopic eye on any moving figure that shows its face.
  const seed = Math.round(idProp ?? x);
  const lid = Math.min(1, expr.lid + idleBlink(frame, seed));
  const R = SEG.head;
  const HW = R * HEAD_HW, HH = R * HEAD_HH;

  // --- costume geometry: a filled torso wrapped around the EXISTING spine line, so the pose
  //     rig is untouched. Built from the spine vector so it leans/bobs with the body. The shape
  //     is the reference's bell: rounded shoulders, flaring slightly WIDER at the hem. ---
  const dressed = castCostume(costume, castSlot);
  const skin = dressed && crowd ? {...CROWD_SKIN, hairStyle: dressed.hairStyle} : dressed;
  const bodyFill = skin ? skin.body : (crowd ? CROWD_FILL : PAPER_WHITE);
  const torso = (() => {
    const vx = shoulder.x - hip.x, vy = shoulder.y - hip.y;
    const len = Math.hypot(vx, vy) || 1;
    const ux = vx / len, uy = vy / len;          // along spine, hip -> shoulder
    const px = -uy, py = ux;                     // perpendicular
    // The reference torso is about as wide as the head and flares a little to the hem: measured
    // torso-width / head-width 0.85–1.28 across four frames, mean 1.02. These half-widths put the
    // hem at 1.03 × head width and the shoulder line at 0.90 × head width.
    const sw = R * 1.02, hw = R * 1.16;          // half-widths at shoulder / hem
    // Shoulder line sits slightly above the joint and the hem slightly below the hip, so the head
    // meets the collar and the legs emerge from under the garment.
    const sx = shoulder.x + ux * R * 0.06, sy = shoulder.y + uy * R * 0.06;
    const hx = hip.x - ux * R * HEM_DROP, hy = hip.y - uy * R * HEM_DROP;
    const A = [sx + px * sw, sy + py * sw], B = [hx + px * hw, hy + py * hw];
    const C = [hx - px * hw, hy - py * hw], Dp = [sx - px * sw, sy - py * sw];
    // top: a cubic with both controls pushed straight "up" the spine -> flat top, round corners
    const k = R * 0.28;
    const d = `M ${A[0]} ${A[1]} L ${B[0]} ${B[1]} Q ${hx - ux * R * 0.10} ${hy - uy * R * 0.10} ${C[0]} ${C[1]} L ${Dp[0]} ${Dp[1]} ` +
      `C ${Dp[0] + ux * k} ${Dp[1] + uy * k} ${A[0] + ux * k} ${A[1] + uy * k} ${A[0]} ${A[1]} Z`;

    if (!skin) return <path key="torso" d={d} fill={bodyFill} stroke={ink} strokeWidth={lineW} strokeLinejoin="round" />;

    // Shirt panel + tie down the chest centre, in the same spine frame. The reference shows a
    // narrow white strip between the lapels carrying the tie, not a bare V.
    const nx = sx - ux * R * 0.02, ny = sy - uy * R * 0.02;               // collar notch height
    const shTop = sw * 0.26, shBot = hw * 0.20;                           // shirt half-widths
    const bx = hx + ux * R * 0.06, by = hy + uy * R * 0.06;               // shirt hem
    const shirt = `M ${nx + px * shTop} ${ny + py * shTop} L ${bx + px * shBot} ${by + py * shBot} ` +
      `L ${bx - px * shBot} ${by - py * shBot} L ${nx - px * shTop} ${ny - py * shTop} Z`;
    // lapel V: a SHORT notch from either side of the collar down to the knot — the reference's
    // lapel sits in the top third of the chest, not as a slash across the whole torso.
    const vX = nx - ux * R * 0.34, vY = ny - uy * R * 0.34;
    const lapel = `M ${nx + px * sw * 0.60} ${ny + py * sw * 0.60} L ${vX} ${vY} L ${nx - px * sw * 0.60} ${ny - py * sw * 0.60}`;
    // tie: knot at the notch, blade tapering down the shirt
    const tw = R * 0.15, tipX = vX - ux * R * 0.80, tipY = vY - uy * R * 0.80;
    const tie = `M ${vX + px * tw} ${vY + py * tw} L ${tipX + px * tw * 0.45} ${tipY + py * tw * 0.45} ` +
      `L ${tipX} ${tipY} L ${tipX - px * tw * 0.45} ${tipY - py * tw * 0.45} L ${vX - px * tw} ${vY - py * tw} Z`;
    return (
      <g key="torso">
        <path d={d} fill={skin.body} stroke={ink} strokeWidth={lineW} strokeLinejoin="round" />
        <path d={shirt} fill={skin.collar} stroke={ink} strokeWidth={detailW} strokeLinejoin="round" />
        <path d={lapel} fill="none" stroke={ink} strokeWidth={detailW} strokeLinejoin="round" />
        <path d={tie} fill={skin.accent} stroke={ink} strokeWidth={detailW} strokeLinejoin="round" />
      </g>
    );
  })();

  // Hair as ONE solid shape (bible §5), sized to the drawn head box and sitting slightly proud of
  // the skull the way the reference's does. Each style differs only in its bottom (fringe) edge.
  const hair = (() => {
    if (!skin || view === 'back') return null;
    const hx = headC.x, hy = headC.y;
    // Measured on the reference thumbnail: hair occupies the top ~22% of the head box and sits a
    // few px proud of the skull. Anything lower reads as a helmet rather than hair.
    const HWh = HW * 1.04, top = hy - HH * 1.05, rc = HWh * 0.62;
    const cap = (byL: number, byR: number, bottom: string) =>
      `M ${hx + HWh} ${byR} L ${hx + HWh} ${top + rc} Q ${hx + HWh} ${top} ${hx + HWh - rc} ${top} ` +
      `L ${hx - HWh + rc} ${top} Q ${hx - HWh} ${top} ${hx - HWh} ${top + rc} L ${hx - HWh} ${byL} ${bottom} Z`;
    let d: string;
    if (skin.hairStyle === 'crop') {
      // flat, even fringe — military / clinical
      const b = hy - HH * 0.55;
      d = cap(b, b, `L ${hx + HWh} ${b}`);
    } else if (skin.hairStyle === 'mop') {
      // side part: dips low over the left brow, swept up and back on the right
      const bl = hy - HH * 0.36, br = hy - HH * 0.64;
      d = cap(bl, br, `Q ${hx - HWh * 0.28} ${hy - HH * 0.26} ${hx + HWh} ${br}`);
    } else {
      // 'tuft' — the same solid cap with a shaggier, uneven fringe
      const bl = hy - HH * 0.46, br = hy - HH * 0.42;
      d = cap(bl, br, `Q ${hx - HWh * 0.45} ${hy - HH * 0.66} ${hx} ${hy - HH * 0.48} Q ${hx + HWh * 0.5} ${hy - HH * 0.28} ${hx + HWh} ${br}`);
    }
    return <path d={d} fill={skin.hair} stroke={ink} strokeWidth={lineW} strokeLinejoin="round" />;
  })();

  return (
    <g transform={`translate(${x + idleDX * scale} ${y + idleDY * scale}) scale(${scale})`}>
      {/* contact shadow: a flat fill, not a sketched outline */}
      <ellipse cx={(footN.x + footF.x) / 2} cy={Math.max(footN.y, footF.y) + limbW * 1.2} rx={limbW * 4.5} ry={limbW * 1.1} fill={INK} opacity={0.10} />
      {/* far limbs */}
      {bone(hipF, kneeF, limbW, ink, 'fl1')}{bone(kneeF, footF, limbW, ink, 'fl2')}{foot(kneeF, footF, 'ff')}
      {bone(shoulder, elbowF, limbW, ink, 'fa1')}{bone(elbowF, handF, limbW, ink, 'fa2')}{hand(handF, 'fh')}
      {/* spine + neck — the torso is painted OVER the spine so the body reads as one solid mass */}
      {bone(hip, shoulder, limbW, ink, 'sp')}{bone(shoulder, headC, limbW, ink, 'nk')}
      {torso}
      {/* head: a large rounded rect (not an ellipse) in flat skin, then the solid hair shape */}
      <rect x={headC.x - HW} y={headC.y - HH} width={HW * 2} height={HH * 2} rx={HW * 0.62} ry={HW * 0.62}
        fill={view === 'back' && skin ? skin.hair : skinFill} stroke={ink} strokeWidth={lineW} />
      {hair}
      {showFace && view !== 'back' && <Face cx={headC.x} cy={headC.y} hw={HW} hh={HH} lid={lid} ink={ink}
        lookY={idleGaze(frame, seed + 5) * 0.3 + pose.headTilt * 0.02}
        expr={{...expr, look: expr.look + idleGaze(frame, seed) * 0.6}} />}
      {/* near limbs */}
      {bone(hipN, kneeN, limbW, ink, 'nl1')}{bone(kneeN, footN, limbW, ink, 'nl2')}{foot(kneeN, footN, 'nf')}
      {bone(shoulder, elbowN, limbW, ink, 'na1')}{bone(elbowN, handN, limbW, ink, 'na2')}{hand(handN, 'nh')}
      {briefcase && <rect x={handN.x - 26} y={handN.y + 4} width={52} height={38} rx={3} fill={skin ? skin.body : PAPER_WHITE} stroke={ink} strokeWidth={lineW} />}
    </g>
  );
};

// ---------------------------------------------------------------------------
// THE OVER-THE-SHOULDER NEAR PLANE (QA_WATCH item 5, 2026-08-17).
//
// WHAT WAS WRONG. `setdressing.OverShoulder` — the shape `foreground.tsx` used to paint — is a
// single `fill="#0a0a0a"` group with no stroke and no interior line: a black circle on a black mass.
// It has no rim, no hairline, no collar, no ear, so at t026/t058/t096/t100b/t115/t148 it reads as an
// unidentifiable blob rather than as the back of somebody's head. And it was BIG: 560 units of
// extent (29% of frame width) rising ~490 units (45% of frame height), which at t058 f9647 put its
// head straight over Madoff's face and left a sliver of cheek showing past it.
//
// TWO FIXES, and the second is the one that matters.
//
// 1. DETAIL. A light keyline round the silhouette, a hair edge and an ear on the side facing the
//    subject, and a collar notch with a shoulder seam. The head is the SAME rounded-rect skull the
//    `StickFigure` draws, not a circle, so the near plane is recognisably a person from this show
//    rather than a shape. Still flat vector, still one flat tone, no gradients — the separation is
//    all stroke, which is how every other shape in this codebase separates from its neighbour.
//
// 2. IT CANNOT REACH A FACE. The mass is bounded by construction, not by the caller's judgement:
//    it rises at most 32% of frame height and never crosses 0.68 of frame height. That ceiling is
//    the real fix. `foreground.tsx` takes the SIDE from a content field, and content picked `right`
//    for t058 — whose hero stands at the right — so no amount of good taste at the call site was
//    going to keep it off him. Measured on f9647: the hero's head box runs y 565–715 and the
//    ceiling is 734, so the near plane now passes in front of his SUIT — which is what a near plane
//    is for — and cannot touch a staged face on any template, on either side.
//
//    The head is capped with it: 2×hr = 0.60×rise = 208 units, 10.8% of frame width. The shoulder
//    base is wider (28%) because a shoulder narrower than its own head reads as a post, and a
//    shoulder cannot occlude a face when it lives entirely under the ceiling. Total inked area
//    drops from ~13% of frame to ~6%.
//
// It stays out of `director.FramedScene`'s crop for the reason `foreground.tsx` documents: it is
// painted at native frame scale over the cut, so a 2.2x closeup does not blow it up.
const OTS_FRAME_W = 1920;
const OTS_FRAME_H = 1080;
/** How far the shoulder reaches in from its frame edge. `scale` may shrink it, never grow it. */
const OTS_SHOULDER_MAX = OTS_FRAME_W * 0.28;
const OTS_RISE_MAX = OTS_FRAME_H * 0.32;
/** The line the near plane may never cross. Every staged hero's chin sits above it. */
const OTS_CEILING = OTS_FRAME_H * 0.68;
/** Below this the mass is a smudge in the corner rather than a near plane. */
const OTS_RISE_MIN = 150;
/** Near-black, and the SAME value the old silhouette used — the mass itself is not the defect. */
const OTS_MASS = '#0a0a0a';
/** The keyline. Paper, not white: it is the light the room is lit by, not a highlight. */
const OTS_RIM = PAPER;

export const OverShoulderFigure: React.FC<{side: 'left' | 'right'; y?: number; scale?: number}> =
({side, y = OTS_FRAME_H, scale = 1}) => {
  if (side !== 'left' && side !== 'right') {
    throw new Error(`OverShoulderFigure: side must be 'left' or 'right', got ${JSON.stringify(side)}`);
  }
  const dir = side === 'right' ? -1 : 1;
  const x0 = side === 'right' ? OTS_FRAME_W : 0;
  const E = OTS_SHOULDER_MAX * Math.min(scale, 1);
  const rise = Math.min(OTS_RISE_MAX * scale, OTS_RISE_MAX, y - OTS_CEILING);
  if (!(rise >= OTS_RISE_MIN)) {
    throw new Error(
      `OverShoulderFigure: baseline y=${y} at scale ${scale} leaves only ${Math.round(rise)} units ` +
        `of mass under the ${OTS_CEILING}-unit face ceiling (minimum ${OTS_RISE_MIN}) — the near ` +
        `plane must stand on the bottom edge of the frame`
    );
  }

  // The head is sized off the VERTICAL budget, so the ceiling governs it directly.
  const hr = rise * 0.30;
  const top = y - rise;                     // the highest the mass reaches — at or below OTS_CEILING
  const hx = x0 + dir * hr * 1.45;          // head centre, tucked into the corner
  const hy = top + hr * 1.14;
  const nk = hy + hr * 0.95;                // the shoulder crosses the lower skull, hiding the neck
  const out = x0 + dir * E;                 // where the shoulder line reaches the floor

  // shoulder + upper arm, sloping from the frame edge out past the head
  const shoulder = `M ${x0} ${y}
    L ${x0} ${nk + hr * 0.62}
    Q ${x0 + dir * hr * 0.35} ${nk + hr * 0.06} ${hx - dir * hr * 0.68} ${nk}
    L ${hx + dir * hr * 0.68} ${nk}
    Q ${x0 + dir * E * 0.62} ${nk + hr * 0.50} ${out} ${y} Z`;
  // hair edge — the line in front of the ear on a head turned away. This is the "hint of hair".
  const hairEdge = `M ${hx + dir * hr * 0.08} ${hy - hr * 1.06}
    Q ${hx + dir * hr * 0.52} ${hy - hr * 0.24} ${hx + dir * hr * 0.36} ${hy + hr * 0.72}`;
  // ear, between the hair edge and the inner rim
  const earX = hx + dir * hr * 0.68, earY = hy + hr * 0.02;
  // collar notch off the neck, and the shoulder seam running out from it
  const collar = `M ${hx - dir * hr * 0.56} ${nk + hr * 0.26}
    L ${hx - dir * hr * 0.06} ${nk + hr * 0.74} L ${hx + dir * hr * 0.46} ${nk + hr * 0.24}`;
  const seam = `M ${hx + dir * hr * 0.46} ${nk + hr * 0.24}
    Q ${x0 + dir * E * 0.60} ${nk + hr * 0.92} ${x0 + dir * E * 0.82} ${y}`;

  const rim = {fill: 'none', stroke: OTS_RIM, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const};
  const head = {x: hx - hr, y: hy - hr * 1.14, width: hr * 2, height: hr * 2.28, rx: hr * 0.62, ry: hr * 0.62};
  return (
    <g>
      {/* head first, then the shoulder painted over its lower half, so the two read as one mass */}
      <rect {...head} fill={OTS_MASS} />
      <rect {...head} {...rim} strokeWidth={STROKE * 0.9} opacity={0.45} />
      <path d={shoulder} fill={OTS_MASS} />
      {/* the keyline — the silhouette's own edge, so it stops being a hole in the picture */}
      <path d={shoulder} {...rim} strokeWidth={STROKE * 0.9} opacity={0.45} />
      {/* interior: hair edge, ear, collar, shoulder seam */}
      <g {...rim} strokeWidth={STROKE_THIN * 0.9} opacity={0.34}>
        <path d={hairEdge} />
        <ellipse cx={earX} cy={earY} rx={hr * 0.17} ry={hr * 0.27} />
        <path d={collar} />
        <path d={seam} />
      </g>
    </g>
  );
};
