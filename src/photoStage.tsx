import React from 'react';
import {AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame} from 'remotion';

export type Move = 'pushIn' | 'parallaxPan' | 'orbitLite' | 'rackFocus';

export function cameraTransform(move: Move, p: number) {
  switch (move) {
    case 'pushIn':      return {scale: 1.06 + 0.10 * p, tx: 0, ty: 0, blur: 0};
    case 'parallaxPan': return {scale: 1.14, tx: (0.5 - p) * 140, ty: 0, blur: 0};
    case 'orbitLite':   return {scale: 1.16, tx: Math.sin(p * Math.PI) * 90, ty: Math.cos(p * Math.PI) * 26, blur: 0};
    case 'rackFocus':   return {scale: 1.08, tx: 0, ty: 0, blur: (1 - p) * 6};
    default:            return {scale: 1.08, tx: 0, ty: 0, blur: 0};
  }
}

export const PhotoStage: React.FC<{img: string; depth: string; move: Move; dur: number}> = ({img, depth, move, dur}) => {
  const f = useCurrentFrame();
  const p = interpolate(f, [0, Math.max(1, dur)], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const c = cameraTransform(move, p);
  const base: React.CSSProperties = {
    width: '100%', height: '100%', objectFit: 'cover',
    transform: `scale(${c.scale}) translate(${c.tx}px, ${c.ty}px)`,
    filter: c.blur ? `blur(${c.blur}px)` : undefined,
  };
  // near layer: same image, masked to the BRIGHT (near) regions of the depth map, pushed further -> 2.5D parallax
  const near: React.CSSProperties = {
    ...base,
    transform: `scale(${c.scale + 0.05}) translate(${c.tx * 1.6}px, ${c.ty * 1.6}px)`,
    WebkitMaskImage: `url(${staticFile(depth)})`, maskImage: `url(${staticFile(depth)})`,
    WebkitMaskSize: 'cover', maskSize: 'cover',
  };
  return (
    <AbsoluteFill style={{backgroundColor: '#0b0b0d', overflow: 'hidden'}}>
      <Img src={staticFile(img)} style={base} />
      <Img src={staticFile(img)} style={near} />
    </AbsoluteFill>
  );
};
