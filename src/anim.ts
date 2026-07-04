// Animation core (NEXT_LEVEL_PLAN Phase 1 / Anim 2.0). PURE math — no Remotion import — so it
// works in pose-space (actions.ts) AND component-space. Everything here is transform/opacity only;
// NOTHING per-frame-filter, so it is cheap on the CPU render shards. Params come straight from the
// research (spring damping ratios, sine-cycle math, seeded value-noise for organic shake/boil).

const TAU = Math.PI * 2;

// ---------- deterministic value noise (smooth, seedable — never Math.random) ----------
export const hash = (n: number): number => {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return s - Math.floor(s);                              // [0,1)
};
export const noise1 = (x: number, seed = 0): number => {  // smooth 1-D value noise, ~[-1,1]
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);                          // smoothstep
  const a = hash(i + seed * 57.3), b = hash(i + 1 + seed * 57.3);
  return (a + (b - a) * u) * 2 - 1;
};

// ---------- easings ----------
export const expoOut = (t: number): number => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
export const backOut = (t: number, s = 1.70158): number => {
  const p = t - 1; return 1 + (s + 1) * p * p * p + s * p * p;
};
export const clamp01 = (t: number): number => (t < 0 ? 0 : t > 1 ? 1 : t);

// ---------- spring presets (mass=1). ζ = damping / (2·√(stiffness·mass)) ----------
export const SPRINGS = {
  SNAP: {stiffness: 210, damping: 26},     // no bounce, quick settle
  GESTURE: {stiffness: 170, damping: 15},  // one visible overshoot (lively)
  CARTOON: {stiffness: 300, damping: 12},  // 2-3 bounces (comic)
  HEAVY: {stiffness: 80, damping: 14, mass: 3},
} as const;

// Closed-form step response of an under-damped spring at elapsed time t (seconds), 0 -> 1 with
// overshoot. Great for entrances/settles in pure pose-space (no stateful integrator needed).
export const springStep = (t: number, cfg: {stiffness: number; damping: number; mass?: number} = SPRINGS.GESTURE): number => {
  if (t <= 0) return 0;
  const m = cfg.mass ?? 1, k = cfg.stiffness, c = cfg.damping;
  const w0 = Math.sqrt(k / m);                            // natural freq
  const zeta = c / (2 * Math.sqrt(k * m));                // damping ratio
  if (zeta < 1) {                                         // under-damped (has overshoot)
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - Math.exp(-zeta * w0 * t) * (Math.cos(wd * t) + (zeta * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);            // critically damped
};

// A quick overshoot curve without physics: t01 in [0,1] -> value that shoots past 1 then settles.
export const overshoot = (t: number, amount = 0.12): number => {
  const b = backOut(clamp01(t));
  return 1 + (b - 1) * (1 + amount * 3);
};

// ---------- motion helpers ----------
// Arc-route a point A->B (route through a quadratic bezier whose control point is offset
// perpendicular to the chord) so hands/heads never travel in robot-straight lines.
export const arcLerp = (ax: number, ay: number, bx: number, by: number, t: number, bend = 0.22) => {
  const mx = (ax + bx) / 2, my = (ay + by) / 2;
  const dx = bx - ax, dy = by - ay, len = Math.hypot(dx, dy) || 1;
  const cx = mx - (dy / len) * len * bend, cy = my + (dx / len) * len * bend;
  const u = 1 - t;
  return {x: u * u * ax + 2 * u * t * cx + t * t * bx, y: u * u * ay + 2 * u * t * cy + t * t * by};
};

// Volume-preserving squash & stretch. s>0 stretches (tall/thin), s<0 squashes (short/wide).
export const squashStretch = (s: number) => ({sx: 1 / (1 + s), sy: 1 + s});

// Anticipation: dip OPPOSITE by `back` for the first `antiFrac` of the move, then spring to target.
export const anticipate = (t: number, back = 0.18, antiFrac = 0.22): number => {
  if (t < antiFrac) return -back * Math.sin((t / antiFrac) * Math.PI);
  const u = (t - antiFrac) / (1 - antiFrac);
  return springStep(u * 0.5, SPRINGS.GESTURE);           // 0.5s-ish scaled settle
};

// ---------- idle system (so nothing on screen is ever frozen) ----------
export const idleBreath = (f: number, fps = 30, bpm = 15) =>
  Math.sin((f / fps) * TAU * (bpm / 60));                 // -1..1, ~15 breaths/min

// Blink with occasional DOUBLE-blink; returns lid-closed amount 0..1. Seed per character.
export const blink = (f: number, seed = 0, fps = 30): number => {
  const period = Math.round(fps * (3.2 + hash(seed) * 2.6));   // 3.2-5.8s, per character
  const p = (f + Math.round(seed * 13)) % period;
  const close = (k: number) => (k >= 0 && k < 7 ? Math.sin((k / 7) * Math.PI) : 0);
  let v = close(p);
  if (hash(seed + 9) > 0.6) v = Math.max(v, close(p - 10));    // ~40% of chars double-blink
  return v;
};

// Gaze saccade: noise-driven look target that holds then flicks (reads as thinking, not a metronome).
export const gaze = (f: number, seed = 0, fps = 30): number => {
  const slow = noise1((f / fps) * 0.6, seed);            // slow wander
  const flick = noise1((f / fps) * 0.9 + 50, seed + 3);  // occasional dart
  return slow * 0.7 + (Math.abs(flick) > 0.85 ? Math.sign(flick) * 0.5 : 0);
};

// ---------- impact language (transform-only) ----------
// Organic camera/impact shake: exponential-decay simplex-ish noise. Returns px + degrees.
export const shake = (f: number, amp = 10, decayFrames = 10, seed = 0) => {
  const a = amp * Math.exp(-f / decayFrames);
  return {x: a * noise1(f * 0.7, seed), y: a * noise1(f * 0.7, seed + 11), rot: a * 0.12 * noise1(f * 0.7, seed + 22)};
};

// Hand-drawn BOIL, render-cheap: whole-drawing wobble on a ~5fps "shot on threes" clock. Returns a
// tiny seeded transform. This gives the animated hand-drawn feel WITHOUT per-frame SVG filters.
export const boil = (f: number, seed = 0, fps = 30, amp = 1) => {
  const step = Math.floor(f / (fps / 5));                // change 5x/sec
  return {
    x: (hash(step + seed) * 2 - 1) * 0.35 * amp,
    y: (hash(step + seed + 7) * 2 - 1) * 0.35 * amp,
    rot: (hash(step + seed + 13) * 2 - 1) * 0.22 * amp,
  };
};

// Hit-stop: freeze motion for 2-3 frames on an impact by snapping `frame` back to the stop's start.
// stops = [{at, len}]. Returns the (possibly held) frame to feed downstream animation.
export const hitStop = (frame: number, stops: {at: number; len: number}[]): number => {
  let shift = 0;
  for (const s of stops) {
    if (frame >= s.at + s.len) shift += s.len;           // after the stop, time resumes (shifted)
    else if (frame >= s.at) return s.at - shift;         // during the stop, hold
  }
  return frame - shift;
};
