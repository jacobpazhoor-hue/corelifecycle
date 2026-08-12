// CRAYON thumbnail typography registration — see docs/CRAYON_BIBLE.md §9 (Packaging).
//
// §7 makes the handwritten face (Caveat, src/crayonFont.ts) non-negotiable for everything ON SCREEN.
// Thumbnails are the ONE stated exception: "heavy geometric sans, ALL CAPS". WO-11 rebuilt the
// thumbnails to the measured reference spec but had no geometric face to set them in, so it fell
// back to the system `Arial Black` — a GROTESQUE. Against a geometric face that is a different
// letterform skeleton (tighter apertures, a different R/G/S), which at thumbnail size reads as a
// different brand. This module closes that gap.
//
// FACE: Montserrat ExtraBold (800) — SIL Open Font License 1.1, licence text vendored alongside the
// woff2 at public/fonts/Montserrat-OFL.txt. The .woff2 was copied verbatim out of the npm package
// `@fontsource/montserrat@5.3.0` (files/montserrat-latin-800-normal.woff2), latin subset only —
// exactly how public/fonts/caveat-*.woff2 were obtained, and for the same reason: vendored bytes so
// a render needs NO network. `@remotion/google-fonts` was rejected in WO-1 because it builds its
// @font-face rules against fonts.gstatic.com URLs, which breaks offline and cloud renders.
//
// WHY MONTSERRAT AND NOT POPPINS/NUNITO — measured, not eyeballed, off the reference PNGs:
// `ROCKEFELLER` in docs/research/crayon/sMH8WchxQR8/thumb.png is the largest clean specimen the
// reference set offers (cap height 105px at 1280). Its ink width is 1119px, i.e. width/cap = 10.66,
// and its stems are 26-27px, i.e. stem/cap = 0.252. Rendering the same string in each candidate and
// measuring it the same way:
//
//   face                width/cap   stem/cap
//   REFERENCE             10.66       0.252
//   Montserrat 800        10.38       0.274   <- chosen
//   Montserrat 700        10.44       0.222
//   Poppins ExtraBold      9.21       0.276
//   Nunito 800             9.60       0.221
//   Nunito 1000            9.91       0.308
//
// Poppins and Nunito are 8-14% NARROWER per cap than the reference at the same cap height — a
// proportion error far outside measurement noise, and one that would show up as a different fitted
// font-size on every single line of thumbnail type. Montserrat matches the reference's proportion to
// ~2.5%. On weight, the reference sits between Montserrat Bold and ExtraBold; 800 is the closer of
// the two available statics (0.022 off vs 0.030) AND is the "heavy" §9 asks for, and the reference
// measurement is a floor anyway — white-on-dark antialiasing loses edge pixels at any threshold.
//
// The rounded-terminal outlier: HawmGu7oNrc's amber band ("THE WOLF OF WALL STREET") and the two
// MIXED-CASE titles (LuEcoqizj0o, VSbO8vmZNm0) are set in a rounded-terminal face, Nunito's class,
// not this one. The channel is not internally consistent. Of the four ALL-CAPS reference titles —
// the treatment this repo actually sets — three (ROCKEFELLER, 1950s/TODAY, THE 2008 FINANCIAL
// CRISIS) are sharp-terminal and Montserrat-proportioned, so that is the majority face and the one
// §9's "heavy geometric sans" describes.
//
// ONE WEIGHT IS VENDORED because one weight is used: every string thumbs.tsx sets is this face at
// 800. Caveat's precedent is two files because the video genuinely sets two weights.
//
// ---------------------------------------------------------------------------------------------
// The loading mechanism below is crayonFont.ts's POST-FIX pattern, verbatim in shape, and for the
// reason recorded there and in 3d93acf: @remotion/fonts' loadFont() opens its delayRender() handle
// synchronously, and at module scope that handle is wiped by remotion's own delay-render module init
// (`window.remotion_delayRenderHandles = []`) while its 28s cancelRender() timer survives — killing
// every render longer than ~28s. So: fetch at module scope (bytes in flight as early as possible),
// arm the delayRender() handle one MICROTASK later, after the synchronous module-evaluation pass.
//
// A missing or corrupt woff2 fails the render LOUDLY via cancelRender(), naming the file. It must
// never fall back to a system sans — shipping a thumbnail in the wrong typeface is the exact defect
// this module exists to remove.
import {cancelRender, continueRender, delayRender, staticFile} from 'remotion';

/** The family name thumbnail type is set in. Not exported from crayonStyle — that file owns the
 *  HANDWRITTEN canon (§7), and this face is the deliberate §9 exception to it. */
export const THUMB_FONT = 'Montserrat';
/** The only weight vendored, and therefore the only weight anything may ask for. */
export const THUMB_WEIGHT = 800;

const FILE = 'fonts/montserrat-latin-800-normal.woff2';
const url = staticFile(FILE);

// Kick the fetch off immediately at module scope; no delayRender() is involved yet.
const faceReady = (async () => {
  try {
    const face = new FontFace(THUMB_FONT, `url('${url}') format('woff2')`, {
      weight: String(THUMB_WEIGHT),
      style: 'normal',
    });
    await face.load();
    // tsconfig `lib` is ["ES2020","DOM"]; FontFaceSet.add() is only declared in DOM.Iterable.
    (document.fonts as unknown as {add: (f: FontFace) => void}).add(face);
  } catch (err) {
    // Re-thrown with the path so the cancelRender() message names the missing file.
    throw new Error(
      `Could not load the ${THUMB_FONT} ${THUMB_WEIGHT} face from ${url} — the vendored woff2 is ` +
        `missing or corrupt. CRAYON_BIBLE §9 requires a heavy geometric sans for thumbnail type; ` +
        `refusing to render in a fallback typeface. Original error: ` +
        `${err instanceof Error ? err.message : String(err)}`,
    );
  }
})();

// Block the render until the face is in document.fonts. Armed one microtask late so the handle
// cannot be wiped by remotion's delay-render module init (see the note above).
queueMicrotask(() => {
  const handle = delayRender(`Loading font ${THUMB_FONT}`);
  faceReady.then(
    () => continueRender(handle),
    (err) => cancelRender(err),
  );
});
