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

/** Subtitles measure ~50% of their title on the reference (bible §7). */
export const CRAYON_SUBTITLE_RATIO = 0.5;

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
// Per-scene colour keys
// ---------------------------------------------------------------------------

/**
 * The reference does NOT run one global palette under a drifting grade. Each scene commits to a
 * dominant hue and the whole palette swaps at the cut (bible §5, "Per-scene colour keying").
 * Measured exemplars: bright cyan/tan beach, saturated orange panel, brown warehouse, near-mono grey.
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

export const SCENE_COLORS: Record<SceneKey, SceneColors> = {
  // bright cyan sky over warm tan ground — the measured beach frame (#88ccee 26.9%, #ddaa88 6.9%)
  daylight: {bg: '#88ccee', mid: '#ddaa88', accent: '#e04b28', crowd: '#9aa9b0'},
  // warm gold — money, applause, the good years
  gold: {bg: '#e8b54b', mid: '#c98b2e', accent: '#8a2a1f', crowd: '#a2916b'},
  // brown warehouse / lamp-lit interior — the dark key
  interior: {bg: '#5a4230', mid: '#3b2a1d', accent: '#e0a13c', crowd: '#6d6257'},
  // saturated orange/red alarm panel — crash, panic, the reveal
  alarm: {bg: '#e8541f', mid: '#b8300f', accent: '#ffd23f', crowd: '#a86b52'},
  // near-monochrome grey — bureaucracy, loss, the crowd scene (#cccccc / #888888 / #777777 measured)
  grey: {bg: '#cccccc', mid: '#888888', accent: '#c0392b', crowd: '#777777'},
};

export const sceneColors = (key: SceneKey): SceneColors => SCENE_COLORS[key];

/**
 * Explicit key per stage template. Anything absent falls to a deterministic rotation so a new
 * template still gets a committed hue rather than an accidental global palette.
 */
export const SCENE_KEY_BY_TEMPLATE: Record<string, SceneKey> = {
  rafterRetirement: 'gold',
  fileWall: 'interior',
  drivewayHoop: 'daylight',
  dinner: 'interior',
  highSchoolGym: 'gold',
  boardroomNotes: 'grey',
  lectureHallScene: 'grey',
  arenaCourt: 'gold',
  window: 'daylight',
  signing: 'gold',
  gLeagueBus: 'grey',
  iceBathRoom: 'interior',
  tower: 'daylight',
  erTrauma: 'alarm',
  layoffs: 'grey',
  podiumScene: 'alarm',
  jet: 'daylight',
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
