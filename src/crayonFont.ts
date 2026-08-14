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
// A missing or corrupt file still fails the render LOUDLY via cancelRender() — never a silent
// fallback to a system sans, which would ship an episode in the wrong typeface.
//
// ---------------------------------------------------------------------------------------------
// WHY THIS DOES NOT USE @remotion/fonts' loadFont()
//
// loadFont() opens its own delayRender() handle synchronously. Calling it at module scope (as this
// file originally did) leaks that handle's 28s cancelRender() timer, which kills any render whose
// page lives longer than ~28s. Measured mechanism, in evaluation order:
//
//   1. this module's side effect runs during webpack's synchronous require chain and calls
//      delayRender() -> the handle is pushed onto window.remotion_delayRenderHandles AND a
//      28 000ms (30 000 default - 2 000) cancelRender() timer is armed;
//   2. webpack then evaluates remotion's own delay-render module, whose top-level side effect does
//      `window.remotion_delayRenderHandles = []` — wiping the pending handle. It deliberately does
//      NOT reset window.remotion_delayRenderTimeouts, so the armed timer survives;
//   3. ~15ms later the font resolves and loadFont() calls continueRender(handle). continueRender
//      scans the handles array for the handle, no longer finds it, and therefore never reaches its
//      clearTimeout(timeout) branch;
//   4. the orphaned timer fires 28s into the render and calls cancelRender(), killing the job at
//      whatever frame is in flight.
//
// This is deterministic, not flaky — it only LOOKS intermittent because anything that finishes
// inside 28s (every `npx remotion still`, every short smoke render) beats the fuse.
//
// The fix: fetch the faces at module scope (so the bytes are already in flight as early as before),
// but arm the delayRender() handle in a microtask — i.e. after the synchronous module-evaluation
// pass that does the wipe — so continueRender() can find it and clear its timer. Verified by the
// presence of `"Loading font Caveat" handle was cleared after Nms` in a --log=verbose render.
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

import {CRAYON_FONT} from './crayonStyle';

const FACES = [
  {file: 'fonts/caveat-latin-400-normal.woff2', weight: '400'},
  {file: 'fonts/caveat-latin-700-normal.woff2', weight: '700'},
];

// Kick the fetches off immediately at module scope; no delayRender() is involved yet.
const facesReady = Promise.all(
  FACES.map(async ({file, weight}) => {
    const url = staticFile(file);
    try {
      const face = new FontFace(CRAYON_FONT, `url('${url}') format('woff2')`, {
        weight,
        style: 'normal',
      });
      await face.load();
      // tsconfig `lib` is ["ES2020","DOM"]; FontFaceSet.add() is only declared in DOM.Iterable.
      (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
    } catch (err) {
      // Re-thrown with the path so the cancelRender() message names the missing file.
      throw new Error(
        `Could not load the ${CRAYON_FONT} ${weight} face from ${url} — the vendored woff2 is ` +
          `missing or corrupt. CRAYON_BIBLE §7 requires this face; refusing to render in a ` +
          `fallback typeface. Original error: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }),
);

// Block the render until the faces are in document.fonts. Armed one microtask late so the handle
// cannot be wiped by remotion's delay-render module init (see the note above).
queueMicrotask(() => {
  const handle = delayRender(`Loading font ${CRAYON_FONT}`);
  facesReady.then(
    () => continueRender(handle),
    (err) => cancelRender(err),
  );
});
