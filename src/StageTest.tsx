import React from 'react';
import {AbsoluteFill} from 'remotion';
import {PACK_TEMPLATES as MED_TEMPLATES} from './stage';

// Throwaway contact sheet to eyeball the composable topic-pack templates.
export const StageTest: React.FC = () => {
  const names = Object.keys(MED_TEMPLATES);
  return (
    <AbsoluteFill style={{backgroundColor: '#ddd', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gridAutoRows: '1fr', gap: 4}}>
      {names.map((n) => {
        const C = MED_TEMPLATES[n];
        return (
          <div key={n} style={{position: 'relative', overflow: 'hidden', border: '2px solid #333'}}>
            <C />
            <div style={{position: 'absolute', left: 6, top: 4, fontFamily: 'monospace', fontSize: 22, fontWeight: 700, color: '#2a2620', background: 'rgba(255,255,255,0.7)', padding: '2px 6px'}}>{n}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
