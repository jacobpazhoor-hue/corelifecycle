import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {StickFigure, LIGHT, PAPER} from './figure';
import {FACES} from './faces';
import * as A from './actions';

export const FaceTest: React.FC = () => {
  const f = useCurrentFrame();
  const names = Object.keys(FACES);
  return (
    <AbsoluteFill style={{backgroundColor: PAPER}}>
      <svg viewBox="0 0 1920 1080" width="100%" height="100%">
        {names.map((nm, i) => {
          const col = i % 4, row = Math.floor(i / 4);
          const x = 270 + col * 470, y = 300 + row * 470;
          return (
            <g key={nm}>
              <StickFigure pose={A.stand(f)} x={x} y={y} scale={1.7} facing={1} view="front" expr={FACES[nm]} frame={f + i * 17} pal={LIGHT} />
              <text x={x} y={y + 250} fill="#2a2620" fontSize={30} fontFamily="Helvetica" textAnchor="middle" letterSpacing={4}>{nm.toUpperCase()}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};
