import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame, Easing} from 'remotion';
import timeline from './timeline.json';
import {FramedScene, FOCUS, CountUp, splitMoney, isNegativeOverlay} from './director';
import {Move} from './photoStage';
import PHOTO_RAW from './photo_manifest.json';

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
const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = '#2a2620';
// 2026-07-20: cream -> white. Owner direction is the bright reference look; the cream base plus
// the heavy grade below is what read as dull/sepia. Figure fills keep their own cream (figure.tsx).
const PAPER = '#ffffff';
const GOLD = '#e8b54b';
const NEG = '#c0392b';
const NEG_SUB = '#a33a26';

type Overlay = {big: string; sub: string | null} | null;
type SceneT = {id: string; level: string | null; overlay: Overlay; template: string;
  audio: string; audioStartFrame?: number; startFrame: number; durationInFrames: number};
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

const Beat: React.FC<{scene: SceneT; from: number | null; shots: Shot[]}> = ({scene, from, shots}) => {
  const f = useCurrentFrame();
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
  const lvlX = interpolate(f, [20, 42], [-36, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: EXPO});
  const lvlOp = interpolate(f, [20, 36, D - 18, D], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

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
  let t = 0;
  return (
    <AbsoluteFill style={{opacity: beatOp, backgroundColor: PAPER}}>
      {/* shots cut together underneath — ungraded, and with no transform of their own: the frame is
          locked, so the only thing that ever moves is what the scene template animates internally. */}
      <AbsoluteFill>
        {shots.map((sh, i) => {
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

      {/* No global overlays sit between the shots and the text any more: the mood grade, the warm
          bloom, the inset vignette and the top/bottom darkening gradient were all whole-frame washes
          over a flat-vector look that is supposed to read bright and per-scene keyed. The bible allows
          a soft radial spotlight, but as part of a BACKGROUND, not as a composite layer over everything. */}

      {/* level label (persists across the cuts). Background was rgba(...,0.82) — translucent enough
          that a dark backdrop element (or the foreground occluder/vignette) drifting underneath it
          could bleed through and wash out the text, especially on templates whose auto-zoom pushes
          scenery toward this corner (reviewer t23/t24 defect: "DAY 460" read low-contrast under a
          gray smudge). Solid fill guarantees the card's own contrast regardless of what's behind it. */}
      {scene.level && (
        <div style={{position: 'absolute', top: 70, left: 72, opacity: lvlOp, transform: `translateX(${lvlX}px)`, fontFamily: FONT}}>
          <span style={{color: INK, fontSize: 33, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase', borderLeft: `5px solid ${GOLD}`, padding: '8px 16px 8px 18px', background: '#f6f2e9', borderRadius: 8, boxShadow: '0 4px 18px rgba(20,15,8,0.14)'}}>{scene.level}</span>
        </div>
      )}

      {/* money: animated count-up if numeric, else static styled text. COST/loss beats (debt, KIA,
          burned, sold, murdered...) get a red/amber accent instead of gain-gold so the moral-erosion
          beats read as losses, not more income. */}
      {scene.overlay && (money !== null
        ? <CountUp from={from ?? 0} to={money.num} suffix={money.suffix} sub={scene.overlay.sub} dur={D} negative={negOverlay} />
        : (
          // reviewer fix (t15 "4,000 BALISH"): the warCouncil mapTable prop's edge sat under this
          // card's default left:72 corner -- nudged left so the card clears the table.
          <div style={{position: 'absolute', bottom: 96, left: scene.id === 't15' ? 34 : 72, opacity: staticOp, fontFamily: FONT, transform: `translateY(${staticRise}px)`,
            background: '#f6f2e9', padding: '18px 24px 20px', borderRadius: 16, boxShadow: '0 6px 30px rgba(20,15,8,0.18)'}}>
            <div style={{display: 'inline-block', color: INK, fontSize: big.length > 12 ? 78 : 112, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05,
              background: `linear-gradient(transparent 58%, ${negOverlay ? 'rgba(192,57,43,0.42)' : 'rgba(232,181,75,0.55)'} 58%)`, padding: '0 8px'}}>{big}</div>
            {scene.overlay.sub && <div style={{color: negOverlay ? NEG_SUB : '#9a7322', fontSize: 27, fontWeight: 800, letterSpacing: 5, marginTop: 14, textTransform: 'uppercase'}}>{scene.overlay.sub}</div>}
          </div>
        ))}

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
