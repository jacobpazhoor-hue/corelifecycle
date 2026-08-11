// CRAYON typography registration — see docs/CRAYON_BIBLE.md §7.
//
// The reference channel sets ALL on-screen text in a handwritten italic script. That typography IS
// the channel's entire "hand-drawn" signature (the linework itself is clean flat vector), so the face
// is non-negotiable for a style match.
//
// Face: Caveat — SIL Open Font License 1.1 (licence text vendored at public/fonts/Caveat-OFL.txt).
// The two .woff2 files in public/fonts/ were copied verbatim out of the npm package
// `@fontsource/caveat@5.3.0` (files/caveat-latin-400-normal.woff2, files/caveat-latin-700-normal.woff2),
// latin subset only. They are vendored rather than pulled from a package or a CDN so that renders
// need NO network: `@remotion/google-fonts` builds its @font-face rules against fonts.gstatic.com
// URLs, which would break offline and cloud renders.
//
// loadFont() wraps delayRender/continueRender and calls cancelRender() if the file is missing or
// corrupt — a failed font fails the render loudly instead of silently falling back to a sans face.
import {loadFont} from '@remotion/fonts';
import {staticFile} from 'remotion';

import {CRAYON_FONT} from './crayonStyle';

// Registered at module scope so the delayRender() handle is opened before the first frame is drawn.
// Root.tsx imports this module for its side effect.
loadFont({
  family: CRAYON_FONT,
  url: staticFile('fonts/caveat-latin-400-normal.woff2'),
  weight: '400',
  style: 'normal',
});

loadFont({
  family: CRAYON_FONT,
  url: staticFile('fonts/caveat-latin-700-normal.woff2'),
  weight: '700',
  style: 'normal',
});
