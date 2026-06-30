import React from 'react';
import {AbsoluteFill, Sequence, interpolate, useCurrentFrame, useVideoConfig, spring, Easing} from 'remotion';
import {TEMPLATES} from './scenes';
import slice from './slice.json';

// ============================================================================
// DIRECTION / ANIMATION ENGINE (vertical slice of the Quality Plan).
// A beat = several SHOTS (wide / medium / closeup / insert) cut together, so the
// video has real editing rhythm instead of one static framing per scene. Plus a
// motion-graphics money count-up (the channel's signature reveal). Self-contained
// composition ("Slice") — does NOT touch the nightly Video/timeline path.
// ============================================================================
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = '#2a2620';
const PAPER = '#f6f2e9';
const GOLD = '#e8b54b';

// Per-template FACE focus points (nx,ny in 0-1) for auto close-ups. Only templates with a clearly
// front-facing, locatable face are listed; others fall back to 'medium' (always safe).
export const FOCUS: Record<string, [number, number]> = {
  hospitalRounds: [0.30, 0.66], consult: [0.39, 0.62], training: [0.33, 0.62],
  decoration: [0.50, 0.60], serverScale: [0.50, 0.60], victory: [0.50, 0.56],
  startupGrow: [0.30, 0.64], lectureHallScene: [0.51, 0.16],
  supervisor: [0.17, 0.66], atrium: [0.50, 0.78], warRoom: [0.51, 0.78], layoffs: [0.19, 0.78],
  boardroomHead: [0.50, 0.56], emptyChair: [0.29, 0.78], fileWall: [0.22, 0.74], podiumScene: [0.58, 0.78],
};

export const fmt = (v: number) => '$' + Math.round(v).toLocaleString('en-US');
// parse "$475,000" / "$5,300,000,000,000" -> number; non-numeric (e.g. "1 IN 3") -> null
export const parseNum = (s?: string | null): number | null => {
  if (!s) return null;
  const m = s.replace(/,/g, '').match(/-?\$?\s*(-?\d+(?:\.\d+)?)/);
  if (!m || !/\d/.test(s)) return null;
  const v = parseFloat(m[1]);
  return Number.isFinite(v) ? v : null;
};

// ---- framed shot of a scene template (wide/medium/closeup focus on a point) ----
const SCALE: Record<string, number> = {wide: 1.0, medium: 1.5, closeup: 2.2};
// EXPO-OUT — the modern motion-graphics standard: fast start, slow cinematic settle (reads as a real
// camera move, not a linear PowerPoint creep). Per-shot push amount: wides breathe more, closeups less.
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);
const PUSH_TO: Record<string, number> = {wide: 1.075, medium: 1.05, closeup: 1.03};
export const FramedScene: React.FC<{template: string; type: string; focus: [number, number]; dur: number}> =
({template, type, focus, dur}) => {
  const f = useCurrentFrame();
  const Art = TEMPLATES[template];
  const base = SCALE[type] ?? 1.0;
  // decelerating dolly push (ease-out) toward the focus point + a sub-pixel settle for life
  const s = base * interpolate(f, [0, dur], [1.0, PUSH_TO[type] ?? 1.05],
    {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const driftY = interpolate(f, [0, dur], [0.5, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const [fx, fy] = focus;
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, overflow: 'hidden'}}>
      <AbsoluteFill style={{transform: `scale(${s}) translateY(${driftY}%)`, transformOrigin: `${fx * 100}% ${fy * 100}%`}}>
        {Art ? <Art /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ---- positioned count-up overlay (sits on the scene shots, lower-left, while framing cuts) ----
export const CountUp: React.FC<{from: number; to: number; sub?: string | null; dur: number}> =
({from, to, sub, dur}) => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const p = interpolate(f, [16, Math.min(dur - 12, 84)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const val = from + (to - from) * p;
  const op = interpolate(f, [10, 24, dur - 18, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // spring-driven pop on the reveal (overshoots then settles -> reads "earned", not scripted)
  const sp = spring({frame: Math.max(0, f - 8), fps, config: {damping: 11, mass: 0.6, stiffness: 170}});
  const pop = interpolate(sp, [0, 1], [0.8, 1]);
  const barW = interpolate(f, [18, 40], [0, 340], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  return (
    <div style={{position: 'absolute', bottom: 96, left: 72, opacity: op, transformOrigin: 'left bottom', transform: `scale(${pop})`, fontFamily: FONT,
      background: 'rgba(246,242,233,0.80)', padding: '20px 26px 22px', borderRadius: 16, boxShadow: '0 6px 30px rgba(20,15,8,0.18)'}}>
      <div style={{width: barW, height: 7, background: GOLD, marginBottom: 14, borderRadius: 4}} />
      <div style={{display: 'inline-block', color: INK, fontSize: 128, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05,
        background: 'linear-gradient(transparent 58%, rgba(232,181,75,0.55) 58%)', padding: '0 8px'}}>{fmt(val)}</div>
      {sub && <div style={{color: '#9a7322', fontSize: 27, fontWeight: 800, letterSpacing: 5, marginTop: 14, textTransform: 'uppercase'}}>{sub}</div>}
    </div>
  );
};

// ---- motion-graphics money reveal: count-up + climbing gold bar + label (full-screen insert) ----
export const NumberReveal: React.FC<{from: number; to: number; label: string; dur: number}> =
({from, to, label, dur}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [10, Math.min(dur - 14, 78)], [0, 1], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
  const val = from + (to - from) * p;
  const pop = interpolate(f, [6, 16, 24], [0.8, 1.06, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const labelOp = interpolate(f, [Math.min(dur - 10, 70), Math.min(dur - 2, 80)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{backgroundColor: PAPER, justifyContent: 'center', alignItems: 'center', fontFamily: FONT}}>
      <div style={{height: 16, width: `${interpolate(p, [0, 1], [60, 760])}px`, background: GOLD, borderRadius: 8, marginBottom: 40}} />
      <div style={{transform: `scale(${pop})`, color: INK, fontSize: 188, fontWeight: 800, letterSpacing: -4,
        background: 'linear-gradient(transparent 60%, rgba(232,181,75,0.55) 60%)', padding: '0 18px'}}>{fmt(val)}</div>
      <div style={{opacity: labelOp, color: '#9a7322', fontSize: 40, fontWeight: 800, letterSpacing: 6, marginTop: 34, textTransform: 'uppercase'}}>{label}</div>
    </AbsoluteFill>
  );
};

type Shot = {type: string; dur: number; numberFx?: {from: number; to: number; label: string}};
type Beat = {id: string; template: string; focus?: [number, number]; shots: Shot[]};

const ShotView: React.FC<{beat: Beat; shot: Shot}> = ({beat, shot}) => {
  const f = useCurrentFrame();
  // quick crossfade in/out for a clean cut
  const op = interpolate(f, [0, 5, shot.dur - 5, shot.dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return (
    <AbsoluteFill style={{opacity: op}}>
      {shot.type === 'insert' && shot.numberFx
        ? <NumberReveal {...shot.numberFx} dur={shot.dur} />
        : <FramedScene template={beat.template} type={shot.type} focus={beat.focus ?? [0.5, 0.5]} dur={shot.dur} />}
    </AbsoluteFill>
  );
};

export const Slice: React.FC = () => {
  const beats = slice.beats as Beat[];
  let t = 0;
  const seqs: React.ReactNode[] = [];
  for (const beat of beats) {
    for (let i = 0; i < beat.shots.length; i++) {
      const shot = beat.shots[i];
      seqs.push(
        <Sequence key={`${beat.id}-${i}`} from={t} durationInFrames={shot.dur}>
          <ShotView beat={beat} shot={shot} />
        </Sequence>);
      t += shot.dur;
    }
  }
  return <AbsoluteFill style={{backgroundColor: PAPER}}>{seqs}</AbsoluteFill>;
};

export const SLICE_FRAMES = (slice.beats as Beat[]).reduce(
  (a, b) => a + b.shots.reduce((x, s) => x + s.dur, 0), 0);
