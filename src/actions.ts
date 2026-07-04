import {Pose} from './figure';
import {idleBreath} from './anim';

const TAU = Math.PI * 2;
const sin = Math.sin;

const STAND: Pose = {
  spineLean: 2, headTilt: 0,
  armNearShoulder: 14, armNearElbow: 6, armFarShoulder: 14, armFarElbow: 6,
  legNearHip: 9, legNearKnee: 2, legFarHip: 9, legFarKnee: 2, bob: 0,
};

// breathing / idle sway applied on top of any base pose. The head LAGS the chest by ~4 frames
// (secondary motion — the single biggest 'alive' cue for a rigid figure).
const breathe = (p: Pose, f: number, amt = 1): Pose => {
  const br = idleBreath(f, 30, 15);          // chest, ~15 breaths/min
  const brLag = idleBreath(f - 4, 30, 15);   // head follows the body, delayed
  return {
    ...p,
    spineLean: p.spineLean + br * 0.9 * amt,
    headTilt: p.headTilt + brLag * 0.7 * amt,
    bob: p.bob + br * 1.5 * amt,
  };
};

export const stand = (f: number): Pose => breathe(STAND, f);

export const walk = (f: number, fps: number, speed = 1.6): Pose => {
  const ph = (f / fps) * TAU * speed;
  const kneeN = 26 * Math.max(0, 0.5 - 0.5 * Math.cos(ph - 0.6));
  const kneeF = 26 * Math.max(0, 0.5 - 0.5 * Math.cos(ph + Math.PI - 0.6));
  return {
    spineLean: 9, headTilt: -2,
    armNearShoulder: -22 * sin(ph), armNearElbow: 18,
    armFarShoulder: -22 * sin(ph + Math.PI), armFarElbow: 18,
    legNearHip: 28 * sin(ph), legNearKnee: kneeN,
    legFarHip: 28 * sin(ph + Math.PI), legFarKnee: kneeF,
    bob: 5 * Math.abs(sin(ph)),
  };
};

export const climb = (f: number, fps: number, speed = 1.2): Pose => {
  const ph = (f / fps) * TAU * speed;
  return {
    spineLean: 16, headTilt: -8,
    armNearShoulder: -18 * sin(ph), armNearElbow: 24,
    armFarShoulder: -18 * sin(ph + Math.PI), armFarElbow: 24,
    legNearHip: 18 + 26 * Math.max(0, sin(ph)), legNearKnee: 30 + 30 * Math.max(0, sin(ph)),
    legFarHip: 18 + 26 * Math.max(0, sin(ph + Math.PI)), legFarKnee: 30 + 30 * Math.max(0, sin(ph + Math.PI)),
    bob: 4 * Math.abs(sin(ph * 2)),
  };
};

// seated base: thighs forward (~horizontal), shins down
const SEAT = {legNearHip: 86, legNearKnee: -84, legFarHip: 82, legFarKnee: -84};

export const type_ = (f: number, fps: number): Pose => {
  const t = f / fps;
  return {
    spineLean: 13, headTilt: 10,
    armNearShoulder: 68, armNearElbow: -52 + 5 * sin(t * 7),
    armFarShoulder: 64, armFarElbow: -52 + 5 * sin(t * 7 + Math.PI),
    ...SEAT, bob: sin(f * 0.05) * 0.8,
  };
};

export const sign = (f: number, fps: number): Pose => {
  const t = f / fps;
  return {
    spineLean: 16, headTilt: 14,
    armNearShoulder: 72 + 3 * sin(t * 3.2), armNearElbow: -50 + 6 * sin(t * 5.0),
    armFarShoulder: 60, armFarElbow: -48,
    ...SEAT, bob: sin(f * 0.05) * 0.7,
  };
};

export const sit = (f: number): Pose => ({
  spineLean: 8, headTilt: 6,
  armNearShoulder: 34, armNearElbow: -34, armFarShoulder: 30, armFarElbow: -34,
  ...SEAT, bob: sin(f * 0.05) * 1.0,
});

export const armsCrossed = (f: number): Pose =>
  breathe({
    spineLean: 3, headTilt: 0,
    armNearShoulder: 58, armNearElbow: 44, armFarShoulder: 52, armFarElbow: 46,
    legNearHip: 6, legNearKnee: 2, legFarHip: -6, legFarKnee: 2, bob: 0,
  }, f, 0.7);

export const lookUp = (f: number): Pose =>
  breathe({
    spineLean: -4, headTilt: -30,
    armNearShoulder: 15, armNearElbow: 8, armFarShoulder: 15, armFarElbow: 8,
    legNearHip: 10, legNearKnee: 2, legFarHip: 10, legFarKnee: 2, bob: 0,
  }, f, 0.8);

// hands in pockets, viewed from behind (no eye)
export const standBack = (f: number): Pose =>
  breathe({
    spineLean: 1, headTilt: 0,
    armNearShoulder: 20, armNearElbow: 26, armFarShoulder: 17, armFarElbow: 26,
    legNearHip: 5, legNearKnee: 2, legFarHip: -5, legFarKnee: 2, bob: 0,
  }, f, 0.9);
