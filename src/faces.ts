import {Expr} from './figure';

// Expression library — the emotional arc of the career, from earnest to hollow.
export const FACES: Record<string, Expr> = {
  neutral: {brow: 0, browRaise: 0, lid: 0.06, mouth: 'neutral', look: 0},
  earnest: {brow: 0.18, browRaise: 0.3, lid: 0.04, mouth: 'neutral', look: 0},     // hopeful, wide-eyed
  exhausted: {brow: 0.3, browRaise: 0.05, lid: 0.55, mouth: 'flat', look: 0},      // heavy lids, drained
  tired: {brow: 0.25, browRaise: 0.08, lid: 0.46, mouth: 'flat', look: 0},
  focused: {brow: -0.55, browRaise: 0, lid: 0.12, mouth: 'tight', look: -0.2},
  worried: {brow: 0.72, browRaise: 0.5, lid: 0.04, mouth: 'frown', look: 0.28},
  conflicted: {brow: 0.5, browRaise: 0.32, lid: 0.16, mouth: 'tight', look: -0.45}, // uneasy, looking away
  cold: {brow: -0.28, browRaise: 0, lid: 0.2, mouth: 'flat', look: 0},
  hardened: {brow: -0.5, browRaise: 0, lid: 0.22, mouth: 'flat', look: 0},          // stern, settled
  hollow: {brow: 0, browRaise: 0, lid: 0.42, mouth: 'flat', look: 0},               // empty, blank
  awe: {brow: 0.4, browRaise: 0.85, lid: 0, mouth: 'open', look: 0},
  smug: {brow: -0.12, browRaise: 0, lid: 0.24, mouth: 'smirk', look: 0},
};

// Blend two expressions (t: 0..1). Mouth snaps at the midpoint.
export function blendExpr(a: Expr, b: Expr, t: number): Expr {
  const L = (x: number, y: number) => x + (y - x) * t;
  return {
    brow: L(a.brow, b.brow), browRaise: L(a.browRaise, b.browRaise),
    lid: L(a.lid, b.lid), look: L(a.look, b.look),
    mouth: t < 0.5 ? a.mouth : b.mouth,
  };
}
