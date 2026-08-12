// CRAYON foundation tokens — the single source of truth for ink, stroke weight, typography and the
// per-scene flat-colour keys. Measured spec: docs/CRAYON_BIBLE.md §5 (Art) + §7 (Typography),
// numbers in docs/research/crayon/MEASUREMENTS.md.
//
// This module is pure data + pure functions. The font FILE is registered by ./crayonFont (side
// effect), which Root.tsx imports.

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * The handwritten face, by family name. Caveat (SIL OFL 1.1), vendored at public/fonts/.
 *
 * Deliberately NO fallback stack: if the vendored file ever fails to load, loadFont() cancels the
 * render, and a bare family name makes a missed registration obvious instead of quietly rendering
 * the old Helvetica look.
 */
export const CRAYON_FONT = 'Caveat';

/**
 * Caveat ships upright-only (no italic file). The reference script leans forward, so on-screen text
 * is obliqued by this many degrees via `transform: skewX(-Ndeg)` / SVG `skewX`. Synthetic oblique on
 * a handwriting face reads as handwriting, not as faux-italic on a sans.
 */
export const CRAYON_TEXT_SLANT_DEG = 6;

/**
 * Subtitles measure ~75% of their title on the reference (bible §7). The original 0.5 was an eyeball
 * estimate; measuring the 4:05 chapter card two ways — cell-pixel height (23 px title vs 17 px
 * subtitle) and width-per-character (0.565 frame / 20 chars vs 0.766 frame / 36 chars) — both land at
 * 0.72–0.77.
 */
export const CRAYON_SUBTITLE_RATIO = 0.75;

// ---------------------------------------------------------------------------
// Ink + linework
// ---------------------------------------------------------------------------

/** Outlines are uniform-weight PURE black — not the old warm #2a2620 (bible §5). */
export const INK = '#000000';

/** Text/fills that sit on ink. */
export const PAPER_WHITE = '#ffffff';

/**
 * Outline weight in px at 1920 wide. Measured median 6px @1280 → ~9px @1920, p25 4px → ~6px @1920;
 * the bible states the usable band as ≈6–10px. 8 sits mid-band.
 * Uniform: no taper, no wobble, no displacement.
 */
export const STROKE = 8;

/** Stroke weight for small props/detail lines, kept proportional to STROKE. */
export const STROKE_THIN = 5;

/** Scale STROKE for artwork authored on a viewBox narrower/wider than 1920. */
export const strokeAt = (viewBoxWidth: number): number => (STROKE * viewBoxWidth) / 1920;

// ---------------------------------------------------------------------------
// Colour space — flat hex in, flat hex out
// ---------------------------------------------------------------------------
//
// Everything below generates and derives SOLID hex fills. Nothing in this module may ever emit a
// gradient string: Chromium dithers every gradient it paints, and the dither destroys the flat-fill
// metric the whole restyle is measured on (bible §5, stage.tsx's WO-8a note).

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(hex.trim());
  if (!m) {
    throw new Error(`shade() takes a #rgb or #rrggbb colour, got ${JSON.stringify(hex)}`);
  }
  const h = m[1].length === 3 ? m[1].split('').map((ch) => ch + ch).join('') : m[1];
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const to = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
    : max === g ? ((b - r) / d + 2) / 6
    : ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const ch = (t: number): number => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)];
};

/** A flat hex from HSL with hue in DEGREES (wrapped), saturation and lightness in 0..1. */
const hsl = (hDeg: number, s: number, l: number): string =>
  rgbToHex(...hslToRgb((((hDeg % 360) + 360) % 360) / 360, s, l));

// ---------------------------------------------------------------------------
// Per-scene colour keys
// ---------------------------------------------------------------------------

/**
 * The reference does NOT run one global palette under a drifting grade. Each scene commits to a
 * dominant hue and the whole palette swaps at the cut (bible §5, "Per-scene colour keying").
 * Measured exemplars: bright cyan/tan beach, saturated orange panel, brown warehouse, near-mono grey.
 *
 * A `SceneKey` is the scene's MOOD, not its colour. It fixes the things that carry the mood — how
 * dark the frame is, how much chroma it holds, where the one saturated note sits — and leaves the
 * actual hue to `sceneHueRung()`. See `MOODS` below for why that split exists.
 */
export type SceneKey = 'daylight' | 'gold' | 'interior' | 'alarm' | 'grey';

export type SceneColors = {
  /** Dominant hue: sky, back wall, the colour the scene is "about". */
  bg: string;
  /** Midground mass: ground plane, buildings, furniture blocks. */
  mid: string;
  /** The ONE saturated note the scene is allowed (bible §9: "a single saturated accent"). */
  accent: string;
  /** Featureless background people — the grey anonymous crowd behind the colour hero (bible §6.5). */
  crowd: string;
};

/**
 * WHY THE PALETTE IS GENERATED (WO-20). Five fixed palettes cannot produce "a new hue per scene"
 * across a 39-scene episode, and the WO-13 build measured exactly what that costs:
 *
 *   - mean saturation **0.209** against the reference's 0.308-0.646, i.e. below its entire range;
 *   - `boardroom` **0.012** and `crowdQueue` **0.015** — effectively monochrome, because the `grey`
 *     key's four tokens were four NEUTRAL greys and a neutral has no saturation to measure;
 *   - distinct quantised colours **179** against 216-444, for the same reason: a neutral ramp
 *     collapses onto the diagonal of the colour cube and occupies a handful of buckets;
 *   - and, measured on the thirteen explainer templates, five of them (`officeFloor`,
 *     `domesticInterior`, `newsMontage`, `courtHearing`, `factoryFloor`) rendered the SAME brown,
 *     two the same grey, two the same gold and two the same orange. Nine of thirteen were one of
 *     four pictures in different furniture.
 *
 * So a scene's palette is now (mood × hue): the `SceneKey` fixes the mood — lightness, chroma level,
 * where the accent sits, how neutral the crowd stays — and a hue RUNG picks the scene's own committed
 * hue from an arc of hues that are all legitimate readings of that mood. `interior` is not "brown";
 * it is "enclosed, lamp-lit, dark, warm accent", and a deep teal machine shop, a navy courtroom and a
 * tobacco-brown office are all of those. The reference's own interiors do exactly this — a dark teal
 * room at 12:22 and a dark blue-violet room at 4:56 of `frames/wolf_montage_verified.jpg`, plus the
 * brown warehouse at 2:08.
 *
 * Three properties this is built to keep:
 *
 *  1. **The frame's palette stays restricted.** A scene still gets FOUR tokens and the `shade()`
 *     ladder off them, exactly as before. What changed is which hue those four sit on, not how many
 *     there are. Variety is BETWEEN scenes, never inside one.
 *  2. **Flat colour only.** Every token is a solid hex; the hue arc is sampled at a scene boundary,
 *     never across a frame. There is no gradient anywhere in this mechanism.
 *  3. **Linework still reads.** No mood token may sit below `MOOD_L_FLOOR` lightness — asserted at
 *     module load, not reviewed — so a pure black `INK` outline keeps its contrast on every hue of
 *     every arc. Measured across all five moods × twelve rungs × four tokens × every `shade()` rung,
 *     the darkest fill the system can produce is 1.53:1 against black — exactly the level the fixed
 *     five-palette design already held, which `TONE_LUM_FLOOR` exists to hold on every hue.
 */

/** One token of a mood, in HSL. */
type MoodTok = {
  /** Hue in degrees — an OFFSET from the scene's committed hue unless `absolute`. */
  h: number;
  /**
   * `h` is an absolute hue rather than an offset. Used for notes that must NOT swing with the room:
   * a lamp-lit interior's accent is lamp amber whether the room is teal, wine or brown, and the
   * `grey` mood's accent is the reference's own crash red on every institutional hue.
   */
  absolute?: boolean;
  s: number;
  l: number;
};

type MoodSpec = {
  /** Start of the mood's hue arc, degrees. */
  hue0: number;
  /** Length of the arc, degrees. Every hue in it must be a legitimate reading of the mood. */
  span: number;
  bg: MoodTok;
  mid: MoodTok;
  accent: MoodTok;
  crowd: MoodTok;
};

/**
 * No mood may put a mass token darker than this, or pure-black linework stops separating from it.
 * It is also `TONE_FLOOR`, the floor `shade()` clamps derived tones to — a mood token AT the floor
 * collapses its own tone ladder (see `interior` below), so this is a hard floor, not a target.
 */
const MOOD_L_FLOOR = 0.2;

/**
 * The five moods. Saturations are authored in HSL but TUNED against the metric the bible quotes,
 * which is mean **HSV** saturation over the frame — so a dark tinted fill scores HIGH (`interior`'s
 * mid at L 0.17 / S 0.38 measures 0.55 in HSV) while a neutral of any lightness scores ZERO. That is
 * the whole reason the old `grey` key measured 0.012: it was not dark, it was neutral.
 *
 * Arcs, and why every hue in each is legitimate:
 *   daylight 168-228° — turquoise, cyan, sky, azure, periwinkle. All skies.
 *   gold      32-52°  — amber, gold, brass. All "money, ceremony, the good years", and no wider,
 *                       because a 40° gold arc is an orange scene and a yellow scene.
 *   interior 195-395° — teal, navy, indigo, plum, wine, brick, tobacco: 200° of arc, because the
 *                       mood is "enclosed and lamp-lit", not "brown", and five explainer templates
 *                       share it. Held together by being uniformly dark-mid with the same amber lamp.
 *   alarm    348-398° — crimson through vermilion to orange. The reference's saturated panel.
 *   grey     190-250° — steel-cyan, slate, indigo. The drained institutional mood, but TINTED: the
 *                       reference's own drained frames (3:34 office, 12:22 ops room) are blue-greys
 *                       and teals, not neutrals, and its LEAST saturated measured frame reads 0.308.
 */
const MOODS: Record<SceneKey, MoodSpec> = {
  daylight: {
    hue0: 168, span: 60,
    bg: {h: 0, s: 0.75, l: 0.70},        // the sky itself — bright, high-chroma, high-lightness
    // Ground: the sky's opposite, which is how sand and paving read warm under a cyan sky. Held
    // LIGHT (0.64) as well as warm — dropped to 0.60 it stopped being tan and became a brick-red
    // road, which is a different scene, not a richer one.
    mid: {h: 178, s: 0.555, l: 0.65},
    accent: {h: 174, s: 0.80, l: 0.51},  // the one vermilion note (a car, a hydrant, a jacket)
    crowd: {h: 6, s: 0.10, l: 0.66},     // §6.5's featureless grey crowd, barely keyed to the scene
  },
  gold: {
    // The narrowest arc in the set, and deliberately so: two golds 40° apart are an orange scene and
    // a yellow scene, not two golds. 20° buys visible separation between the two gold templates while
    // both stay the measured #e8b54b family; the arc centre (42°) is 1.5° off that measured hue.
    hue0: 32, span: 20,
    bg: {h: 0, s: 0.774, l: 0.602},
    mid: {h: -6, s: 0.62, l: 0.48},
    accent: {h: -34, s: 0.64, l: 0.33},  // the deep red note gold has always carried
    crowd: {h: 0, s: 0.16, l: 0.53},
  },
  interior: {
    hue0: 195, span: 200,
    // LIFTED off the old #5a4230 / #3b2a1d by WO-20, and the reason is the tone ladder, not taste.
    // `shade()` clamps at `TONE_FLOOR` (0.2), so a `mid` sitting at L 0.17 made `body`, `floor` and
    // `deep` — three of the ten roles in `sceneTones()` — the SAME colour, and the five interior
    // templates duly measured the lowest distinct-colour counts in the set (41-59 rich buckets
    // against 80-142 for every other mood). At L 0.30 the ladder has six separated rungs under and
    // over it. It also fixes COMPARISON's other §5 miss in passing: `officeFloor` ran 71-79% ink
    // against the reference's 10-70%, because at L 0.17 most of the room counted as ink.
    bg: {h: 0, s: 0.40, l: 0.33},
    mid: {h: 2, s: 0.46, l: 0.30},
    accent: {h: 38, absolute: true, s: 0.72, l: 0.55},  // lamp amber, on every room hue
    crowd: {h: 0, s: 0.10, l: 0.44},
  },
  alarm: {
    hue0: 348, span: 50,
    bg: {h: 0, s: 0.70, l: 0.53},        // pulled down from the old #e8541f: broadcastDesk measured
    mid: {h: -10, s: 0.72, l: 0.40},     // 0.688, ABOVE the reference's 0.646 ceiling
    accent: {h: 45, absolute: true, s: 0.85, l: 0.60},  // the warning yellow
    crowd: {h: 0, s: 0.15, l: 0.50},
  },
  grey: {
    // Arc held to 195-240° — steel-cyan, slate, cold blue. Both ends are load-bearing and both were
    // found by LOOKING, not by measuring: opened out to 175° the frame at that end rendered a bright
    // TURQUOISE, which is a sunny day and not a bread line, and taken past 245° the frame at the
    // other end went periwinkle-violet, which is nothing at all. 45° is enough for three separated
    // hues because the mood's own chroma is low.
    hue0: 195, span: 45,
    // The drained mood is the one that has to be argued for, because "drained" invited NEUTRAL and a
    // neutral scores 0.012. These land the three grey-keyed explainer templates at 0.33-0.40 mean
    // saturation — the BOTTOM of the reference band, whose own least saturated frame is 0.308 — so
    // the mood still reads as the coldest, least colourful thing in the episode without being a
    // measurement hole. Anything lower than this measured under the reference's entire range.
    // `bg` is kept DARK for its chroma (L 0.58, not 0.64): the same saturation carried at a high
    // lightness reads as bright weather rather than as overcast.
    bg: {h: 0, s: 0.44, l: 0.58},
    mid: {h: 10, s: 0.38, l: 0.46},
    accent: {h: 5.6, absolute: true, s: 0.542, l: 0.461},  // = #c0392b, director.tsx's LOSS
    crowd: {h: 0, s: 0.07, l: 0.50},
  },
};

// A mood token under the floor would be a fill pure-black linework cannot separate from, AND would
// collapse its own tone ladder against `TONE_FLOOR`. Checked at module load rather than reviewed,
// because both failures are invisible until something is rendered and measured.
for (const [key, m] of Object.entries(MOODS)) {
  for (const [role, t] of Object.entries({bg: m.bg, mid: m.mid, accent: m.accent, crowd: m.crowd})) {
    if (t.l < MOOD_L_FLOOR) {
      throw new Error(
        `MOODS.${key}.${role} sits at lightness ${t.l}, under MOOD_L_FLOOR ${MOOD_L_FLOOR}: pure-black ` +
        `INK outlines stop separating from it and shade() clamps its whole tone ladder onto one colour.`
      );
    }
  }
}

/**
 * Rungs along a mood's hue arc. Twelve is enough that two scenes on the same mood are visibly
 * different hues (the narrowest arc, `gold`, still steps 2.7° per rung and the widest, `interior`,
 * steps 18°) while keeping a rung a countable, quotable thing rather than an arbitrary float.
 */
export const HUE_RUNGS = 12;

const paletteAt = (key: SceneKey, rung: number): SceneColors => {
  const m = MOODS[key];
  const h = m.hue0 + (m.span * rung) / (HUE_RUNGS - 1);
  const tok = (t: MoodTok) => hsl(t.absolute ? t.h : h + t.h, t.s, t.l);
  return {bg: tok(m.bg), mid: tok(m.mid), accent: tok(m.accent), crowd: tok(m.crowd)};
};

const PALETTE_CACHE = new Map<string, SceneColors>();

/**
 * The four flat tokens a scene paints with: its mood's `key`, on the hue `template` commits to.
 *
 * Called with no `template` it returns the mood's ARC-CENTRE palette — the mood's own exemplar, and
 * what a caller wanting "the gold" or "the loss red" as a constant means (director.tsx's GAIN/LOSS).
 */
export const sceneColors = (key: SceneKey, template?: string): SceneColors => {
  const rung = sceneHueRung(template);
  const ck = `${key}|${rung}`;
  const hit = PALETTE_CACHE.get(ck);
  if (hit) return hit;
  const p = paletteAt(key, rung);
  PALETTE_CACHE.set(ck, p);
  return p;
};

// ---------------------------------------------------------------------------
// Tones — flat siblings of a scene's four keys
// ---------------------------------------------------------------------------

/**
 * WHY (WO-8e). Four tokens per scene meant every set-dressing component in a frame landed on the
 * SAME hue: the WO-8d `jet` frame is dense but monochrome — hangars, boxes, carts, trolleys and the
 * apron are all one gold. The reference is not monochrome per scene: it commits to a dominant hue and
 * then carries several distinct FLAT tones inside it (the office frame runs dark-brown cabinets, a tan
 * box, a navy suit and white paper at once), measuring 216–444 distinct quantised colours per frame.
 *
 * `shade()` is the whole mechanism: one base token, a small integer ladder of derived flat tones.
 *
 * Three constraints it exists to respect, all of them load-bearing:
 *
 *  1. **Flat solid colour, never a gradient.** Chromium dithers every gradient it paints, and the
 *     dither pattern destroys the flat-fill metric (bible §5, stage.tsx's WO-8a note). A tone ladder
 *     is how you get depth and material separation with zero gradients.
 *  2. **Restricted palette.** Steps are integer rungs bounded by `TONE_MAX_STEP`, derived from the
 *     scene's own key. A scene can therefore reach at most 4 tokens × 7 rungs of flat colour, not
 *     arbitrary colour. Out-of-range or non-integer steps throw rather than silently clamping, so a
 *     caller cannot quietly widen the palette.
 *  3. **Linework still reads.** Outlines are pure black (`INK`), so a derived tone is clamped to
 *     `TONE_FLOOR` lightness and to `TONE_CEIL` (so a light tone never collides with `PAPER_WHITE`).
 *     `MOOD_L_FLOOR` = `TONE_FLOOR`, asserted at module load, so no mood token starts below the
 *     clamp either, and `TONE_LUM_FLOOR` holds the dark end at a PERCEPTUAL level rather than an HSL
 *     one. Measured across all five moods × twelve hue rungs × four tokens × every ladder rung
 *     (WO-20), the darkest fill the whole system can produce is 1.53:1 against black — the level the
 *     fixed palette already contained.
 */

/** One rung of the ladder, in HSL lightness. */
export const TONE_STEP = 0.075;

/** Rungs available in each direction. Bounds the derived palette; exceeding it throws. */
export const TONE_MAX_STEP = 3;

/**
 * Lightening a flat tone also drains it, or the light end reads as neon rather than as sunlit.
 *
 * Cut 0.13 -> 0.08 by WO-20. The light rungs are the LARGE-AREA tones — `card` (=`shade(mid, 3)`) is
 * the paper, plaster, cardboard and newsprint that covers half of some frames — and at 0.13 a rung
 * they arrived 34% drained on top of the +0.225 lightness, which is why `newsMontage` measured 0.219
 * mean saturation while sitting on a fully-keyed brown. At 0.08 the same card keeps 78% of its
 * chroma and still reads as a pale material, not as neon: the ladder's whole light end was checked
 * on every mood at every rung before this was changed.
 */
const TONE_DESAT = 0.08;
/** Darkening enriches slightly — flat-vector shadow tones read as material, not as added black. */
const TONE_ENRICH = 0.06;
/** Lightness clamps: keep derived tones off pure black (INK outlines must read) and off PAPER_WHITE. */
const TONE_FLOOR = 0.2;
const TONE_CEIL = 0.93;

/**
 * The dark end also has a PERCEPTUAL floor, because `TONE_FLOOR` alone stopped being enough once the
 * palette went generative (WO-20). HSL lightness is not luminance: hsl(35°, .55, .2) — a brown — is
 * relative luminance 0.027, while hsl(250°, .55, .2) — the same lightness, blue — is 0.015, half as
 * much. With five fixed brown/grey/orange keys the difference never surfaced; with a 200° `interior`
 * arc the same ladder rung lands on both, and a pure-black `INK` outline on the blue one measured
 * 1.30:1 against the 1.53:1 the fixed palette had held.
 *
 * 0.0265 IS that 1.53:1 — the level the palette already contained — so the ladder still never
 * produces a fill darker than the design did before, on any hue.
 */
const TONE_LUM_FLOOR = 0.0265;

/** WCAG relative luminance of a linear-space-corrected sRGB triple in 0..1. */
const relLuminance = (r: number, g: number, b: number): number => {
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
};

/**
 * A flat sibling of `color`, `step` rungs lighter (+) or darker (−). Hue is never changed.
 *
 * `shade(c, 0)` is the identity — it returns `color` itself, so a component's default and its
 * explicitly-shaded variants stay in the same family.
 *
 * The `TONE_FLOOR` clamp is asymmetric on purpose: a colour that ALREADY sits at or below the floor
 * keeps its own lightness as the floor, so a negative step on an already-dark colour holds that
 * lightness (only the saturation nudge lands) rather than returning something *lighter* than its base.
 * Dark keys differentiate upward — which is exactly what the reference's brown office does, separating
 * near-black cabinets from a tan box, not from a blacker box. Where a dark scene genuinely needs a
 * shadow, use an INK overlay, not a tone.
 *
 * `MOODS` no longer relies on that clamp: WO-20 asserts every mood token at or above `TONE_FLOOR`,
 * because a token sitting ON the floor makes `body`, `floor` and `deep` one colour — which is what
 * the old `interior` key did, and it cost the five interior templates half their distinct colours.
 * The clamp remains for callers passing their own hex.
 *
 * @throws if `step` is not an integer, or exceeds ±`TONE_MAX_STEP`.
 */
export const shade = (color: string, step: number): string => {
  if (!Number.isInteger(step)) {
    throw new Error(`shade() step must be a whole rung, got ${step}`);
  }
  if (Math.abs(step) > TONE_MAX_STEP) {
    throw new Error(
      `shade() step ${step} exceeds ±${TONE_MAX_STEP}: the tone ladder is deliberately short so a ` +
      `scene stays on a restricted palette. Key another SceneKey instead of shading further.`
    );
  }
  if (step === 0) return color;
  const [r, g, b] = hexToRgb(color);
  const [h, s, l] = rgbToHsl(r, g, b);
  const floor = Math.min(l, TONE_FLOOR);
  let l2 = Math.min(TONE_CEIL, Math.max(floor, l + step * TONE_STEP));
  const s2 = Math.min(1, s * (step > 0 ? (1 - TONE_DESAT) ** step : (1 + TONE_ENRICH) ** -step));
  if (step < 0) {
    // Perceptual floor, applied only downward — see TONE_LUM_FLOOR. Asymmetric in the same way the
    // lightness floor is: a colour that is ALREADY darker than the floor keeps its own luminance as
    // the floor, so shading never returns something lighter than its own base. Steps of 0.005 in
    // lightness, bounded by `l` itself, so it always terminates and always lands on a rung a second
    // call reproduces exactly.
    const lumFloor = Math.min(relLuminance(r, g, b), TONE_LUM_FLOOR);
    while (l2 < l && relLuminance(...hslToRgb(h, s2, l2)) < lumFloor) {
      l2 = Math.min(l, l2 + 0.005);
    }
  }
  return rgbToHex(...hslToRgb(h, s2, l2));
};

/**
 * The named flat materials a scene gets for free, all derived from its own four keys.
 *
 * Set dressing keys its DEFAULTS to these, so composing a template with zero colour arguments still
 * produces a frame with several materials in it instead of one hue everywhere.
 */
export type SceneTones = {
  /** Distant structures — lifted toward the sky, which is how flat art does aerial perspective. */
  far: string;
  /** Second plane: back walls, the band behind the main mass. */
  back: string;
  /** The mid-ground mass itself. Identical to `SceneColors.mid`. */
  body: string;
  /** The ground plane — one rung under the things standing on it, so they separate from it. */
  floor: string;
  /** Recesses, window blocks, shutter shadow, the dark face of a solid. */
  deep: string;
  /**
   * The light material: cardboard, paper, plaster, luggage — the tan box against a dark wall in the
   * reference office. Derived from `mid`, not `bg`: cardboard belongs to the scene's MATERIAL family,
   * and keying it to the dominant hue put pale-blue boxes in every `daylight` scene.
   */
  card: string;
  /** A wall/panel keyed to the dominant hue but readable against a `bg` field of it. */
  panel: string;
  /** Deep crowd rows — paler, so a mass of people recedes behind the row in front of it. */
  crowdFar: string;
  /** Near crowd rows, held off the wall behind them. */
  crowdNear: string;
  /** The accent's shadow side. The accent itself stays the scene's ONE saturated note. */
  accentDeep: string;
};

const TONE_CACHE = new Map<string, SceneTones>();

/** Derive (and cache) a scene's flat tone set from its four colour keys. */
export const sceneTones = (c: SceneColors): SceneTones => {
  const k = `${c.bg}|${c.mid}|${c.accent}|${c.crowd}`;
  const hit = TONE_CACHE.get(k);
  if (hit) return hit;
  const t: SceneTones = {
    far: shade(c.mid, 2),
    back: shade(c.mid, 1),
    body: c.mid,
    floor: shade(c.mid, -1),
    deep: shade(c.mid, -2),
    card: shade(c.mid, TONE_MAX_STEP),
    panel: shade(c.bg, -1),
    crowdFar: shade(c.crowd, 1),
    crowdNear: shade(c.crowd, -1),
    accentDeep: shade(c.accent, -1),
  };
  TONE_CACHE.set(k, t);
  return t;
};

/**
 * Explicit key per template — EVERY template in scenes.tsx (S00-S19), every pack template in
 * stage.tsx and every explainer template in explainer.tsx. Anything absent falls to a deterministic
 * rotation so a new template still gets a
 * committed hue rather than an accidental global palette, but the rotation is a safety net, not the
 * design: an unmapped template lands on an editorially random hue, which is exactly what per-scene
 * colour keying is supposed to replace.
 *
 * The rule applied, uniformly. Each name is a MOOD, not a colour — WO-20 split the hue out into
 * `SCENE_HUE_BY_TEMPLATE`, so `interior` no longer means brown and `grey` no longer means neutral:
 *   daylight — anything under open sky (or sky seen through a curtain wall)
 *   gold     — ceremony, money, applause, the good years, golden hour
 *   interior — enclosed, lamp-lit, dark: the "brown warehouse" key, on any of 200° of room hues
 *   alarm    — crisis, combat, panic, the reveal: the "saturated orange panel" key
 *   grey     — institutional, clinical, bureaucratic, drained, loss; cold and low-chroma, but TINTED
 *
 * NO interior template is keyed `daylight` — a filing room on a bright cyan sky was the defect this
 * mapping exists to fix. Where a template's own backdrop already paints an opaque full-frame ground
 * (the space, night-sea and night-alley packs paint #05060a/#20262e/#181418 themselves) the key is
 * still recorded, but it governs `mid`/`accent`/`crowd` rather than a visible ground.
 */
export const SCENE_KEY_BY_TEMPLATE: Record<string, SceneKey> = {
  // --- core scenes (src/scenes.tsx S00-S19) ---
  deskSilhouette: 'interior', desk: 'grey', fileWall: 'interior', tower: 'daylight',
  boardroomNotes: 'grey', deskClose: 'interior', supervisor: 'grey', window: 'grey',
  signing: 'gold', jet: 'gold', dinner: 'interior', boardroomHead: 'grey', atrium: 'gold',
  layoffs: 'grey', revolvingDoor: 'daylight', warRoom: 'alarm', emptyChair: 'grey',
  lobby: 'daylight', raidScene: 'alarm',
  // --- generic pack ---
  lectureHallScene: 'grey', podiumScene: 'gold', foundationScene: 'gold',
  // --- medical: the near-monochrome clinical key, with the ER as its one alarm ---
  scrubIn: 'grey', operatingRoom: 'grey', hospitalRounds: 'grey', scanReview: 'grey',
  erTrauma: 'alarm', consult: 'grey',
  // --- startup ---
  garageStart: 'interior', startupGrow: 'grey', serverScale: 'grey', ipoBell: 'gold',
  // --- military ---
  bootcamp: 'daylight', barracksLife: 'interior', frontline: 'alarm', commandPost: 'grey',
  decoration: 'gold',
  // --- sports ---
  training: 'grey', lockerRoomScene: 'interior', gameDay: 'daylight', victory: 'gold',
  // --- hedge fund ---
  tradingFloor: 'grey', pnlWall: 'alarm',
  // --- real estate ---
  openHouse: 'daylight', rentalUnits: 'daylight', constructionSite: 'daylight',
  modelReview: 'grey', rooftopEmpire: 'gold',
  // --- spy ---
  tradecraft: 'daylight', surveillance: 'grey', deadDrop: 'daylight', safehouse: 'interior',
  station: 'grey', debrief: 'interior',
  // --- roman ---
  triumph: 'gold', romanOath: 'daylight', legionDrill: 'daylight', legionCamp: 'daylight',
  shieldWall: 'alarm', centurionVitis: 'daylight', firstSpear: 'gold', forumScene: 'daylight',
  warCouncil: 'interior', throne: 'gold', senate: 'grey', praetorians: 'grey', banquet: 'gold',
  // --- mafia: the pack commits hardest to the warm dark interior ---
  mobTable: 'interior', streetCorner: 'daylight', socialClub: 'interior', cardGame: 'interior',
  backAlley: 'interior', madeCeremony: 'interior', redSauce: 'interior', redSauceAlone: 'interior',
  waterfront: 'daylight', donOffice: 'interior', commission: 'interior', countRoom: 'gold',
  courtroom: 'grey', prisonCell: 'grey', wiretap: 'grey',
  // --- dynasty ---
  heirGates: 'gold', portraitHall: 'interior', portraitHallFilled: 'interior',
  yachtDeck: 'daylight', galaBallroom: 'gold', familyVault: 'grey',
  // --- samurai ---
  riceField: 'daylight', dojo: 'interior', daisho: 'interior', sengokuField: 'alarm',
  castleGate: 'daylight', teaCeremony: 'interior', lordAudience: 'gold', keepTop: 'daylight',
  seppukuRite: 'grey', shogunCourt: 'gold', merchantHouse: 'interior',
  // --- cartel ---
  lookoutCorner: 'daylight', sierraRoute: 'daylight', narcoShrineRite: 'interior',
  plazaTown: 'daylight', ranchCompound: 'gold',
  // --- ocean survival: open water is daylight, weather is the grey key, landfall pays off gold ---
  boatDeck: 'daylight', oceanCapsize: 'grey', raftDay: 'daylight', raftNight: 'grey',
  glassCalm: 'gold', rainSquall: 'grey', horizonShip: 'daylight', finWater: 'grey',
  driftPanga: 'daylight', openSwell: 'daylight', shipNight: 'grey', makeLandfall: 'gold',
  // --- black market organs ---
  hotelRoom: 'interior', basementOR: 'alarm', coldCase: 'grey', syndicateClinic: 'grey',
  // --- north korea ---
  borderWire: 'grey',
  // --- zombie / outbreak ---
  hordeStreet: 'alarm', suburbSiege: 'daylight', highwayJam: 'daylight', storeRaid: 'grey',
  bunkerSiege: 'interior', checkpointTriage: 'alarm', campWall: 'daylight',
  // --- waste / sanitation ---
  graveside: 'grey', gravesideReturn: 'grey', dawnRoute: 'gold', truckYard: 'daylight',
  landfillView: 'daylight', routeAftermath: 'grey',
  // --- lottery ---
  ticketCounter: 'interior', trailerPorch: 'daylight',
  // --- yakuza ---
  neonAlley: 'interior', shrineOathRite: 'interior', irezumiParlor: 'interior',
  pachinkoFloor: 'alarm', oyabunOffice: 'interior', yubitsumeRite: 'grey',
  teaCeremonySplit: 'interior',
  // --- mongol ---
  steppeCamp: 'daylight', horsebackDrill: 'daylight', steppeRaid: 'alarm', siegeWalls: 'alarm',
  yamRelayStation: 'daylight', khanAudienceTent: 'gold', khaganThrone: 'gold',
  // --- gladiator: arenaSand is shared art, keyed daylight for the fight and gold for the freedom rite ---
  slaveMarket: 'daylight', ludusYard: 'daylight', arenaGate: 'interior', arenaSand: 'daylight',
  rudisCeremony: 'gold', ludusOffice: 'interior', imperialBox: 'gold',
  // --- bratva ---
  courtyardBlock: 'grey', tattooCell: 'interior', banyaSitDown: 'interior', shopKrysha: 'grey',
  koronatsiyaRite: 'interior', brightonPier: 'daylight', pakhanApex: 'gold',
  // --- space ---
  jetTrain: 'daylight', poolTrain: 'grey', launchSeat: 'alarm', cupolaView: 'grey',
  evaWalk: 'grey', evaEmergency: 'alarm', controlRoom: 'grey', stationCommand: 'grey',
  moonSurface: 'grey',
  // --- ottoman: janissaryBarracks is shared art, keyed interior for the corps and alarm for the revolt ---
  balkanVillage: 'daylight', janissaryBarracks: 'interior', cauldronRevolt: 'alarm',
  divanChamber: 'gold', sultanAudience: 'gold',
  // --- pirate ---
  fishingCove: 'daylight', shipDeck: 'daylight', broadsideBattle: 'alarm',
  nassauHarbor: 'daylight', captainsCabin: 'interior', marooned: 'daylight',
  executionDock: 'grey',
  // --- basketball ---
  drivewayHoop: 'daylight', highSchoolGym: 'interior', gLeagueBus: 'grey', arenaCourt: 'gold',
  iceBathRoom: 'grey', rafterRetirement: 'gold',
  // --- explainer environment set (src/explainer.tsx) ---
  // Four of the six are enclosed rooms, so NONE of them may reach the `daylight` key: the hash
  // fallback keyed `officeFloor` and `domesticInterior` as `daylight` (a filing floor and a living
  // room on a bright cyan sky) and `cityStreet` — the one scene actually under open sky — as
  // `interior`. That inversion is exactly what an explicit entry exists to prevent.
  //   officeFloor / domesticInterior — "enclosed, lamp-lit, wooden, dark": the reference's own office
  //     is a brown/near-black key (frames/wolf_office_singleframe.jpg) and its domestic rooms are
  //     lamp-lit interiors.
  //   boardroom / exchangeFloor — institutional, consistent with the existing `boardroomNotes` /
  //     `boardroomHead` and the legacy `tradingFloor` (grey floor, `alarm` pnlWall beside it).
  //   newsMontage — `interior`, NOT `grey`: the reference lays its cuttings on a WARM dark ground
  //     (frames/wolf_montage_verified.jpg, 15:02), and measured, `grey` put the template at 17 rich
  //     colours because all four of that key's tokens were greys AT THE TIME — WO-20 has since given
  //     the mood a hue, so that particular number no longer reproduces, but the warm/cold reading of
  //     the reference frame is why the entry stands. `interior` gives it a brick ground, a cream
  //     newsprint stock and an amber accent, and reads as archive/records.
  //   cityStreet — the only one of the six under open sky, so the only one keyed `daylight`.
  officeFloor: 'interior', boardroom: 'grey', exchangeFloor: 'grey', cityStreet: 'daylight',
  domesticInterior: 'interior', newsMontage: 'interior',
  // WO-8h's seven. The six above reach only THREE of the five keys and never `gold` or `alarm` at
  // all, which is COMPARISON MISS #7 ("the reference commits a NEW hue per scene") and half of
  // MISS #5 (our 0.209 mean saturation against the reference's 0.308-0.646 range). These seven put
  // both unused keys into the explainer set, so the thirteen now cover all five. Three of them are
  // enclosed rooms and NONE of those may reach `daylight` — the same inversion the block above
  // exists to prevent.
  //   bankExterior — `gold`: "ceremony, money, applause, the good years". An institutional stone
  //     frontage at its height; its opposite mood is `crowdQueue`, keyed `grey`, so the two never
  //     read as one set redressed.
  //   courtHearing — `interior`: the key's own gloss is "enclosed, lamp-lit, wooden, dark", which
  //     is a panelled courtroom verbatim, and the amber accent gives the seal and the bench lamp a
  //     saturated note the legacy `grey` courtroom cannot carry. (Registered as `courtHearing`, not
  //     `courtroom`, because stage.tsx's MAFIA pack already owns that name — see explainer.tsx.)
  //   factoryFloor — `interior`: this key's stated exemplar is the "brown warehouse".
  //   broadcastDesk / closeUpPortrait — `alarm`: the reference's own saturated panel
  //     (wolf_montage_verified.jpg, 9:20) is a news/reaction frame with pushed faces on an orange
  //     ground. These are the two templates carrying the top of the saturation range.
  //   crowdQueue — `grey`: "bureaucratic, drained, loss" — the breadline/bank-run mass
  //     (depression_montage_verified.jpg, 15:00 is a grey crowd with one coloured figure in it).
  //   chartBoard — `gold`: the pitch and the growth curve, the beat this frame serves.
  bankExterior: 'gold', courtHearing: 'interior', factoryFloor: 'interior',
  broadcastDesk: 'alarm', crowdQueue: 'grey', closeUpPortrait: 'alarm', chartBoard: 'gold',
};

const KEY_ROTATION: SceneKey[] = ['daylight', 'gold', 'interior', 'alarm', 'grey'];

/**
 * Resolve the colour key for a scene. `template` wins when it is mapped above; otherwise the scene
 * id picks a key deterministically (same id -> same key on every render, including cloud renders).
 */
export const resolveSceneKey = (sceneId: string, template?: string): SceneKey => {
  if (!sceneId) {
    throw new Error('resolveSceneKey() requires a non-empty scene id');
  }
  if (template && template in SCENE_KEY_BY_TEMPLATE) {
    return SCENE_KEY_BY_TEMPLATE[template];
  }
  let h = 0;
  for (const src of [template ?? '', sceneId]) {
    for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  }
  return KEY_ROTATION[h % KEY_ROTATION.length];
};

/**
 * Where each template sits on its mood's hue arc — the scene's own committed hue (WO-20).
 *
 * A rung is an integer in `[0, HUE_RUNGS)`; 0 is the start of the arc, `HUE_RUNGS - 1` its end.
 * This is the ART DIRECTION half of the mechanism, and it is written down rather than hashed for the
 * templates that matter: an episode is thirteen environments deep, and which of them is the teal room
 * and which is the wine room is an editorial decision, not a hash bucket. Templates absent here still
 * get a committed hue — `sceneHueRung()` hashes the name onto a rung — so the ~350 legacy templates
 * stop sharing five palettes without anyone hand-placing them, but the hash is the safety net, not
 * the design, exactly as `SCENE_KEY_BY_TEMPLATE` treats its own fallback.
 *
 * The thirteen explainer templates, and why each sits where it does. Before this map, NINE of them
 * were one of four pictures: five browns, two greys, two golds, two oranges (measured, WO-20).
 *
 *   interior (arc 195-395°, 18.2° per rung) — five templates, so the whole arc is used:
 *     factoryFloor 0 (195°, deep teal)   — the machine shop. The reference's own 12:22 ops room is
 *                                          this exact colour; cold, hard, industrial.
 *     courtHearing 2 (231°, deep navy)   — panelled and institutional, but a ROOM, not a grey office;
 *                                          navy is the one dark that reads as dignified rather than
 *                                          drab, and it holds the amber seal and bench lamp well. Sat
 *                                          at rung 1 it landed 5° off `boardroom`, which is a cut
 *                                          between two blue rooms; at rung 3 it went violet.
 *     domesticInterior 8 (341°, wine)    — a plush lamp-lit sitting room. Warm, enclosed, private,
 *                                          and unmistakably not the office it used to be identical to.
 *     newsMontage 10 (377°=17°, brick)   — the warm dark ground the reference lays its cuttings on
 *                                          (15:02), one step off the office so an archive beat cut
 *                                          against an office beat still changes colour.
 *     officeFloor 11 (395°=35°, tobacco) — the end of the arc is the brown the reference's own office
 *                                          measures at, and this template keeps it.
 *   grey (arc 195-240°, 4.1° per rung) — three templates, at the ends and the middle. The ORDER here
 *                                        was set by looking: `crowdQueue` is the only grey template
 *                                        whose `bg` is the open sky, and a sky at the cyan end of the
 *                                        arc reads as a sunny day, which is the opposite of the beat.
 *                                        So the sky takes the cold end and the two rooms take the
 *                                        rest, where cyan is a lit ceiling and reads correctly.
 *     exchangeFloor 0 (195°, steel-cyan) — screens and dark glass. Was 0.039 saturation, and shared
 *                                          its palette with `boardroom` outright.
 *     boardroom 5 (215°, steel blue)     — the corporate cool. Was 0.012 saturation; a tinted steel
 *                                          is the smallest honest move that puts chroma in the frame.
 *     crowdQueue 11 (240°, cold blue)    — outdoors, overcast, a queue that has been there for hours.
 *   gold (arc 32-52°, 1.8° per rung) — the narrowest arc, because gold is a specific idea:
 *     bankExterior 3 (37°, gold)         — stone frontage at golden hour, on the measured #e8b54b.
 *     chartBoard 11 (52°, brass)         — the pitch room; a cooler, greener gold so the two golds do
 *                                          not read as one set redressed.
 *   alarm (arc 348-398°, 4.5° per rung) — two templates at opposite ends:
 *     broadcastDesk 2 (357°, crimson)    — the crash bulletin. Red, not orange.
 *     closeUpPortrait 9 (389°=29°, orange) — the reaction shot, on the reference's own orange panel.
 *   daylight (arc 168-228°, 5.5° per rung):
 *     cityStreet 6 (201°, sky)           — the only template under open sky; sits mid-arc, on the
 *                                          measured beach-frame cyan.
 */
export const SCENE_HUE_BY_TEMPLATE: Record<string, number> = {
  // --- explainer environment set (src/explainer.tsx) ---
  factoryFloor: 0, courtHearing: 2, domesticInterior: 8, newsMontage: 10, officeFloor: 11,
  exchangeFloor: 0, boardroom: 5, crowdQueue: 11,
  bankExterior: 3, chartBoard: 11,
  broadcastDesk: 2, closeUpPortrait: 9,
  cityStreet: 6,
};

/**
 * The hue rung a template commits to. Mapped templates take their written-down rung; anything else
 * hashes its own name onto one (same name -> same rung on every render, including cloud renders).
 *
 * With no template at all the answer is the ARC CENTRE — the mood's own exemplar hue, which is what
 * a caller asking for "the gold" as a constant means.
 *
 * @throws if a mapped rung is not a whole rung inside `[0, HUE_RUNGS)`. A silently clamped rung would
 *   put two templates on the same hue, which is the entire defect this map exists to fix.
 */
export const sceneHueRung = (template?: string): number => {
  if (template && template in SCENE_HUE_BY_TEMPLATE) {
    const r = SCENE_HUE_BY_TEMPLATE[template];
    if (!Number.isInteger(r) || r < 0 || r >= HUE_RUNGS) {
      throw new Error(
        `SCENE_HUE_BY_TEMPLATE[${JSON.stringify(template)}] = ${r} is not a whole hue rung in ` +
        `[0, ${HUE_RUNGS}) — a scene's committed hue must be one of the arc's own rungs.`
      );
    }
    return r;
  }
  if (!template) return (HUE_RUNGS - 1) / 2;
  // A different multiplier from resolveSceneKey's, so a template's hue is not a function of its key.
  let h = 0;
  for (let i = 0; i < template.length; i++) h = (h * 131 + template.charCodeAt(i)) >>> 0;
  return h % HUE_RUNGS;
};

/** The five moods at their arc centre — the exemplar palette of each, for reference and tests. */
export const SCENE_COLORS: Record<SceneKey, SceneColors> = {
  daylight: sceneColors('daylight'),
  gold: sceneColors('gold'),
  interior: sceneColors('interior'),
  alarm: sceneColors('alarm'),
  grey: sceneColors('grey'),
};
