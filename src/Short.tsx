import React from 'react';
import {AbsoluteFill, Audio, Sequence, interpolate, staticFile, useCurrentFrame} from 'remotion';
import short from './short.json';
import {TEMPLATES} from './scenes';

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";
const INK = '#2a2620';
const PAPER = '#f6f2e9';
const GOLD = '#e8b54b';

type Overlay = {big: string; sub: string | null} | null;
type Beat = {id: string; template: string; level: string | null; overlay: Overlay;
  audio: string; audioStartFrame?: number; startFrame: number; durationInFrames: number};

// One vertical beat-card: brand header, scene art, big number, CTA — all on paper.
const BeatCard: React.FC<{beat: Beat}> = ({beat}) => {
  const f = useCurrentFrame();
  const d = beat.durationInFrames;
  const fade = 12;
  const op = interpolate(f, [0, fade, d - fade, d], [0, 1, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const tIn = 10;
  const textOp = interpolate(f, [tIn, tIn + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const numScale = interpolate(f, [tIn, tIn + 8, tIn + 16], [0.7, 1.08, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const barW = interpolate(f, [tIn + 2, tIn + 20], [0, 520], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const z = interpolate(f, [0, d], [1.05, 1.16]);
  const b = short.brand;
  const big = beat.overlay?.big ?? '';
  const bigSize = big.length > 12 ? 96 : big.length > 8 ? 118 : 140;
  const Art = TEMPLATES[beat.template];
  return (
    <AbsoluteFill style={{opacity: op, backgroundColor: PAPER}}>
      {/* brand header */}
      <div style={{position: 'absolute', top: 70, left: 0, width: 1080, textAlign: 'center', fontFamily: FONT}}>
        <div style={{color: INK, fontSize: 34, fontWeight: 700, letterSpacing: 8, opacity: 0.8}}>{b.kicker}</div>
        <div style={{color: INK, fontSize: 92, fontWeight: 800, lineHeight: 1.02, marginTop: 6}}>{b.line1}</div>
        {b.line2 ? <div style={{color: INK, fontSize: 92, fontWeight: 800, lineHeight: 1.02}}>{b.line2}</div> : null}
      </div>

      {/* scene art (16:9) framed in the middle */}
      <div style={{position: 'absolute', top: 360, left: 0, width: 1080, height: 608, overflow: 'hidden'}}>
        <div style={{width: '100%', height: '100%', transform: `scale(${z})`}}>{Art ? <Art /> : null}</div>
      </div>
      <div style={{position: 'absolute', top: 360, left: 0, width: 1080, height: 608, border: `5px solid ${INK}`, boxSizing: 'border-box', pointerEvents: 'none'}} />

      {/* big number */}
      <div style={{position: 'absolute', top: 1080, left: 0, width: 1080, textAlign: 'center', opacity: textOp, fontFamily: FONT}}>
        {beat.level && <div style={{color: '#9a7322', fontSize: 38, fontWeight: 800, letterSpacing: 5, textTransform: 'uppercase', marginBottom: 24}}>{beat.level}</div>}
        <div style={{height: 9, width: barW, background: GOLD, borderRadius: 5, margin: '0 auto 26px'}} />
        <div style={{display: 'inline-block', transform: `scale(${numScale})`, color: INK, fontSize: bigSize, fontWeight: 800, letterSpacing: -2, lineHeight: 1.04, background: 'linear-gradient(transparent 56%, rgba(232,181,75,0.6) 56%)', padding: '0 14px'}}>{big}</div>
        {beat.overlay?.sub && <div style={{color: '#9a7322', fontSize: 40, fontWeight: 800, letterSpacing: 6, marginTop: 22, textTransform: 'uppercase'}}>{beat.overlay.sub}</div>}
      </div>

      {/* CTA */}
      <div style={{position: 'absolute', bottom: 96, left: 0, width: 1080, textAlign: 'center', fontFamily: FONT}}>
        <div style={{display: 'inline-block', color: PAPER, background: INK, fontSize: 40, fontWeight: 800, letterSpacing: 2, padding: '16px 40px', borderRadius: 10}}>▶  WATCH THE FULL CLIMB</div>
        {b.tag ? <div style={{color: INK, fontSize: 40, fontWeight: 800, marginTop: 22}}>{b.tag}</div> : null}
      </div>

      <Sequence from={beat.audioStartFrame ?? 0}><Audio src={staticFile(beat.audio)} /></Sequence>
    </AbsoluteFill>
  );
};

export const Short: React.FC = () => {
  const beats = short.scenes as Beat[];
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      {beats.map((b) => (
        <Sequence key={b.id} from={b.startFrame} durationInFrames={b.durationInFrames}>
          <BeatCard beat={b} />
        </Sequence>
      ))}
      <Audio src={staticFile('music/ambient.wav')} volume={0.14} />
    </AbsoluteFill>
  );
};
