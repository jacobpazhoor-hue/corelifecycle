import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import timeline from './timeline.json';
import {FramedScene, FOCUS, CountUp, splitMoney} from './director';

// expo-out: fast in, slow settle — the entrance easing the count-up + camera already use, applied to text
const EXPO = Easing.bezier(0.16, 1, 0.3, 1);

// ---- per-level COLOR DRAMATURGY (Phase 4): the palette escalates with the climb. One levelProgress
// (0 = recruit/home -> 1 = apex) drives a CSS-ONLY grade (no SVG filters => render-safe): a mood TINT
// that moves warm -> cool -> ember -> rich gold, a DARKENING that deepens as you rise, and a slight
// saturation/contrast lift. Text sits on paper scrims so it stays legible through the grade.
const GRADE_STOPS: Array<[number, [number, number, number]]> = [
  [0.0, [232, 181, 75]],   // warm gold — recruit / home / naive
  [0.4, [42, 91, 97]],     // cool teal — competent; the world turns colder
  [0.75, [138, 42, 31]],   // ember red — danger / the cost
  [1.0, [202, 162, 58]],   // rich gold — the apex / power
];
function gradeTint(p: number): string {
  let a = GRADE_STOPS[0], b = GRADE_STOPS[GRADE_STOPS.length - 1];
  for (let i = 0; i < GRADE_STOPS.length - 1; i++) {
    if (p >= GRADE_STOPS[i][0] && p <= GRADE_STOPS[i + 1][0]) {a = GRADE_STOPS[i]; b = GRADE_STOPS[i + 1]; break;}
  }
  const span = b[0] - a[0]; const t = span > 0 ? (p - a[0]) / span : 0;
  const c = a[1].map((v, k) => Math.round(v + (b[1][k] - v) * t));
  return `rgb(${c[0]}, ${c[1]}, ${c[2]})`;
}

// ============================================================================
// VIDEO v2 — director-based renderer. Each scene/beat becomes 2-3 SHOTS
// (wide -> medium -> short closeup) cut together, with the money number COUNTING
// UP over the cuts. Shot durations sum to the scene's VO duration, so audio stays
// perfectly synced. Reads the SAME timeline.json as the old Video (drop-in).
// ============================================================================
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = '#2a2620';
const PAPER = '#f6f2e9';
const GOLD = '#e8b54b';

type Overlay = {big: string; sub: string | null} | null;
type SceneT = {id: string; level: string | null; overlay: Overlay; template: string;
  audio: string; audioStartFrame?: number; startFrame: number; durationInFrames: number};
type Shot = {type: string; dur: number};

// RETENTION pacing: something must visibly change every 5–8s, never hold a static frame past ~10s.
const MAX_SHOT = 240; // 8s @30fps — any planned shot longer than this gets re-cut

// split any over-long shot into equal sub-cuts (each restarts the camera push -> a visible change)
function capShots(shots: Shot[]): Shot[] {
  const out: Shot[] = [];
  for (const sh of shots) {
    if (sh.dur <= MAX_SHOT) {out.push(sh); continue;}
    const n = Math.ceil(sh.dur / MAX_SHOT);
    const base = Math.floor(sh.dur / n);
    for (let i = 0; i < n; i++) out.push({type: sh.type, dur: i === n - 1 ? sh.dur - base * (n - 1) : base});
  }
  return out;
}

// distribute a scene's duration across shots (always sums to D) for editing rhythm
function planShots(s: SceneT): Shot[] {
  const D = s.durationInFrames;
  const hasFace = !!FOCUS[s.template];
  if (D < 95) return [{type: hasFace ? 'closeup' : 'medium', dur: D}];
  if (D < 200) {const a = Math.round(D * 0.55); return capShots([{type: 'wide', dur: a}, {type: hasFace ? 'closeup' : 'medium', dur: D - a}]);}
  // long scene: wide -> medium -> short closeup (closeup only if the face is locatable)
  const cu = hasFace ? Math.min(64, Math.round(D * 0.22)) : 0;
  const wide = Math.round((D - cu) * 0.55);
  const med = D - cu - wide;
  return capShots(cu > 0 ? [{type: 'wide', dur: wide}, {type: 'medium', dur: med}, {type: 'closeup', dur: cu}]
                : [{type: 'wide', dur: wide}, {type: 'medium', dur: D - wide}]);
}

const Beat: React.FC<{scene: SceneT; from: number | null; prog: number}> = ({scene, from, prog}) => {
  const f = useCurrentFrame();
  const D = scene.durationInFrames;
  const fade = 16;
  const beatOp = interpolate(f, [0, fade, D - fade, D], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const focus = FOCUS[scene.template] ?? [0.5, 0.55];
  const shots = planShots(scene);
  // per-level grade derived from levelProgress (CSS only)
  const tint = gradeTint(prog);
  const tintOp = interpolate(prog, [0, 1], [0.05, 0.16]);
  const darkOp = interpolate(prog, [0, 1], [0.0, 0.20]);
  const grade = `saturate(${(1 + 0.18 * prog).toFixed(3)}) contrast(${(1 + 0.06 * prog).toFixed(3)}) brightness(${(1 - 0.045 * prog).toFixed(3)})`;
  // Only animate a money count-up when the overlay is genuinely a dollar figure
  // (string starts with '$'). Otherwise — command counts ("~150 UNDER YOUR
  // COMMAND") and cost beats ("-1 KIA") — render the full string verbatim as
  // static big text instead of mis-formatting it as a dollar amount.
  // splitMoney keeps the unit suffix ("K / YR", "/ WK") so the count-up shows the
  // FULL label, never a truncated "$250".
  const money = splitMoney(scene.overlay?.big);
  const lvlX = interpolate(f, [20, 42], [-36, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const lvlOp = interpolate(f, [20, 36, D - 18, D], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // static (non-numeric) overlay fallback, matches the count-up styling
  const big = scene.overlay?.big ?? '';
  const staticOp = interpolate(f, [20, 36, D - 18, D], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const staticRise = interpolate(f, [20, 44], [18, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});

  let t = 0;
  return (
    <AbsoluteFill style={{opacity: beatOp, backgroundColor: PAPER}}>
      {/* shots cut together underneath — the saturation/contrast/brightness grade lifts with the climb */}
      <AbsoluteFill style={{filter: grade}}>
        {shots.map((sh, i) => {
          const seq = (
            <Sequence key={i} from={t} durationInFrames={sh.dur}>
              <ShotFade dur={sh.dur}>
                <FramedScene template={scene.template} type={sh.type} focus={focus} dur={sh.dur} />
              </ShotFade>
            </Sequence>);
          t += sh.dur;
          return seq;
        })}
      </AbsoluteFill>

      {/* PER-LEVEL MOOD GRADE (CSS only): tint warm->cool->ember->gold + darkening that deepens with
          the climb + a faint warm bloom. Above the shots, below the text (which has paper scrims). */}
      <AbsoluteFill style={{backgroundColor: tint, opacity: tintOp, mixBlendMode: 'soft-light', pointerEvents: 'none'}} />
      <AbsoluteFill style={{backgroundColor: 'rgb(20,14,7)', opacity: darkOp, mixBlendMode: 'multiply', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'radial-gradient(58% 48% at 50% 42%, rgba(255,226,170,0.10), rgba(255,226,170,0) 70%)', mixBlendMode: 'screen', pointerEvents: 'none'}} />

      {/* MOODY CINEMATIC vignette over the scene (MasterPOVs is muted + atmospheric, not flat-bright).
          Sits ABOVE the shots but BELOW the text, so labels/numbers stay crisp. */}
      <AbsoluteFill style={{boxShadow: 'inset 0 0 320px 24px rgba(22,16,9,0.42)', pointerEvents: 'none'}} />
      <AbsoluteFill style={{background: 'linear-gradient(180deg, rgba(20,15,8,0.16) 0%, rgba(20,15,8,0) 22%, rgba(20,15,8,0) 74%, rgba(20,15,8,0.20) 100%)', pointerEvents: 'none'}} />

      {/* level label (persists across the cuts) */}
      {scene.level && (
        <div style={{position: 'absolute', top: 70, left: 72, opacity: lvlOp, transform: `translateX(${lvlX}px)`, fontFamily: FONT}}>
          <span style={{color: INK, fontSize: 33, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase', borderLeft: `5px solid ${GOLD}`, padding: '8px 16px 8px 18px', background: 'rgba(246,242,233,0.82)', borderRadius: 8, boxShadow: '0 4px 18px rgba(20,15,8,0.14)'}}>{scene.level}</span>
        </div>
      )}

      {/* money: animated count-up if numeric, else static styled text */}
      {scene.overlay && (money !== null
        ? <CountUp from={from ?? 0} to={money.num} suffix={money.suffix} sub={scene.overlay.sub} dur={D} />
        : (
          <div style={{position: 'absolute', bottom: 96, left: 72, opacity: staticOp, fontFamily: FONT, transform: `translateY(${staticRise}px)`,
            background: 'rgba(246,242,233,0.80)', padding: '18px 24px 20px', borderRadius: 16, boxShadow: '0 6px 30px rgba(20,15,8,0.18)'}}>
            <div style={{display: 'inline-block', color: INK, fontSize: big.length > 12 ? 78 : 112, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05,
              background: 'linear-gradient(transparent 58%, rgba(232,181,75,0.55) 58%)', padding: '0 8px'}}>{big}</div>
            {scene.overlay.sub && <div style={{color: '#9a7322', fontSize: 27, fontWeight: 800, letterSpacing: 5, marginTop: 14, textTransform: 'uppercase'}}>{scene.overlay.sub}</div>}
          </div>
        ))}

      <Sequence from={scene.audioStartFrame ?? 0}><Audio src={staticFile(scene.audio)} /></Sequence>
    </AbsoluteFill>
  );
};

const ShotFade: React.FC<{dur: number; children: React.ReactNode}> = ({dur, children}) => {
  const f = useCurrentFrame();
  const op = interpolate(f, [0, 5, dur - 5, dur], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  return <AbsoluteFill style={{opacity: op}}>{children}</AbsoluteFill>;
};

const lvlOf = (lab: string | null) => {const m = lab ? /LEVEL\s*0?(\d+)/i.exec(lab) : null; return m ? parseInt(m[1], 10) : null;};

export const Video2: React.FC = () => {
  const scenes = timeline.scenes as SceneT[];
  const maxLv = scenes.reduce((mx, s) => Math.max(mx, lvlOf(s.level) ?? 0), 1);
  // carry the previous figure into the next count-up ONLY when the unit suffix matches
  // ("$5M / YR" -> "$500M / YR" counts 5->500; "$200 / WK" -> "$250K / YR" restarts at 0
  // instead of counting across incompatible units)
  let last: {num: number; suffix: string} | null = null;
  let cur = 0;
  const out: React.ReactNode[] = [];
  for (const s of scenes) {
    const n = lvlOf(s.level); if (n) cur = n;
    const prog = maxLv > 1 ? Math.min(1, Math.max(0, (cur - 1) / (maxLv - 1))) : 0;
    const money = splitMoney(s.overlay?.big);
    const from = money && last && last.suffix === money.suffix ? last.num : null;
    out.push(
      <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames}>
        <Beat scene={s} from={from} prog={prog} />
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
