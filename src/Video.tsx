import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import timeline from './timeline.json';
import {TEMPLATES} from './scenes';

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

const Grain: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{opacity: 0.05, mixBlendMode: 'overlay', pointerEvents: 'none'}}>
      <svg width="100%" height="100%" viewBox="0 0 1920 1080" preserveAspectRatio="none">
        <filter id="grainf"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed={f % 60} stitchTiles="stitch" /></filter>
        <rect width="1920" height="1080" filter="url(#grainf)" />
      </svg>
    </AbsoluteFill>
  );
};

type Overlay = {big: string; sub: string | null} | null;
type SceneT = {
  id: string; level: string | null; overlay: Overlay; template?: string;
  audio: string; audioStartFrame?: number; startFrame: number; durationInFrames: number;
};

const Scene: React.FC<{scene: SceneT}> = ({scene}) => {
  const frame = useCurrentFrame();
  const d = scene.durationInFrames;
  const fade = 16;
  const opacity = interpolate(frame, [0, fade, d - fade, d], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const tIn = 20, tOut = d - 26;
  const textOp = interpolate(frame, [tIn, tIn + 16, tOut, tOut + 18], [0, 1, 1, 0], {
    extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
  });
  const rise = interpolate(frame, [tIn, tIn + 22], [22, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const big = scene.overlay?.big ?? '';
  const bigSize = big.length > 12 ? 78 : big.length > 8 ? 104 : 128;
  const SceneArt = TEMPLATES[scene.template as string];
  // dynamic camera: push-in + quick settle-punch at scene start + slight parallax drift
  const z = interpolate(frame, [0, d], [1.06, 1.18]);
  const punch = interpolate(frame, [0, 11], [1.05, 1], {extrapolateRight: 'clamp'});
  const camX = interpolate(frame, [0, d], [0, d % 2 ? 1.4 : -1.4]);
  // overlay punch-in
  const numScale = interpolate(frame, [tIn, tIn + 9, tIn + 17], [0.72, 1.07, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const barW = interpolate(frame, [tIn + 3, tIn + 22], [0, 340], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const lvlX = interpolate(frame, [tIn, tIn + 18], [-28, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  return (
    <AbsoluteFill style={{opacity, backgroundColor: '#f6f2e9'}}>
      <AbsoluteFill style={{transform: `scale(${z * punch}) translateX(${camX}%)`}}>{SceneArt ? <SceneArt /> : null}</AbsoluteFill>

      {scene.level && (
        <div style={{position: 'absolute', top: 74, left: 96, opacity: textOp, transform: `translateX(${lvlX}px)`, fontFamily: FONT}}>
          <span style={{color: '#2a2620', fontSize: 33, fontWeight: 800, letterSpacing: 6, textTransform: 'uppercase', borderLeft: '5px solid #e8b54b', paddingLeft: 18}}>{scene.level}</span>
        </div>
      )}

      {scene.overlay && (
        <div style={{position: 'absolute', bottom: 110, left: 96, opacity: textOp, transformOrigin: 'left bottom', transform: `scale(${numScale})`, fontFamily: FONT}}>
          <div style={{width: barW, height: 7, background: '#e8b54b', marginBottom: 14, borderRadius: 4}} />
          <div style={{display: 'inline-block', color: '#2a2620', fontSize: bigSize, fontWeight: 800, letterSpacing: -2, lineHeight: 1.05, background: 'linear-gradient(transparent 58%, rgba(232,181,75,0.55) 58%)', padding: '0 8px'}}>{scene.overlay.big}</div>
          {scene.overlay.sub && (
            <div style={{color: '#9a7322', fontSize: 27, fontWeight: 800, letterSpacing: 5, marginTop: 14, textTransform: 'uppercase'}}>{scene.overlay.sub}</div>
          )}
        </div>
      )}

      {scene.id === 's00_hook' && (
        <AbsoluteFill style={{justifyContent: 'center', alignItems: 'center', paddingBottom: 120, opacity: interpolate(frame, [12, 42, 150, 185], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
          <div style={{fontFamily: FONT, color: '#fff', fontSize: 40, fontWeight: 600, letterSpacing: 14, marginBottom: 18, opacity: 0.8}}>EVERY LEVEL OF A</div>
          <div style={{fontFamily: FONT, color: '#fff', fontSize: 132, fontWeight: 800, letterSpacing: 4, textShadow: '0 8px 50px rgba(0,0,0,0.85)'}}>LAWYER</div>
        </AbsoluteFill>
      )}
      <Sequence from={scene.audioStartFrame ?? 0}>
        <Audio src={staticFile(scene.audio)} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const scenes = timeline.scenes as SceneT[];
  return (
    <AbsoluteFill style={{backgroundColor: '#f6f2e9'}}>
      {scenes.map((s) => (
        <Sequence key={s.id} from={s.startFrame} durationInFrames={s.durationInFrames}>
          <Scene scene={s} />
        </Sequence>
      ))}
      <Audio src={staticFile('music/ambient.wav')} volume={0.16} />
    </AbsoluteFill>
  );
};
