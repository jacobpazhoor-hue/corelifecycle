import React from 'react';
import {Internals, useCurrentFrame, useVideoConfig} from 'remotion';
import timeline from './timeline.json';
import meta from './episode_meta.json';
import {StickFigure, LIGHT, DIM, CastContext, CAST_SLOTS} from './figure';
import {FACES} from './faces';
import * as A from './actions';
import {blinkOn, pulse, stepIndex} from './anim';
import {keyedTemplates, useSceneColors} from './stage';
import {INK, MATERIAL, PAPER_WHITE, STROKE, STROKE_THIN, TONE_MAX_STEP, shade} from './crayonStyle';
import {
  SlabFloor, UnitWall, RibbedPanel, BuildingBand, BoxStack, CaseStack, Cone,
  CrowdRow, CrowdHeads, Fence, useSceneTones,
  // the interior kit — authored here by WO-8f, promoted into the shared library by WO-8g
  Ceiling, Glazing, Desk, Monitor, Keyboard, Chair, Papers, DeskPhone, Portrait, WallFrame,
  SerifWords, TextLines, SeatedRow, Plant,
  // the civic / industrial / presentation tier (WO-8h)
  Colonnade, Steps, TrussRig, PipeRun, ChartPlot, Placard, CrowdColumn, RopeLine, Trolley,
  // WO-24's crossing figure — the motionless-share fix, see setdressing.tsx
  Passerby,
  // WO-27 PERIOD MODE — see the block comment below and setdressing.tsx's own
  usePeriod,
  // QA_WATCH item 3 — real lettering for anything the narration names; item 7 — chart direction
  InkWords, ChartDir,
} from './setdressing';

// ============================================================================
// EXPLAINER TEMPLATES — the environment set for the new format (WO-8f).
//
// WHY THIS FILE EXISTS. The channel is becoming a third-person explainer about real companies,
// people and financial scandals. docs/research/crayon/TEMPLATE_STRATEGY.md measured what that does
// to the template library: the legacy 358-template sprawl is a consequence of the OLD format's
// topic-locked packs (ROMAN, CARTEL, SAMURAI…), where "for any given episode, the long tail IS the
// episode" — rebuilding even the top 100 still leaves some episode 57% un-restyled. The explainer
// format instead runs on a narrow, repeating environment set of ~20-30 archetypes reused by every
// episode, which is exactly why the reference channel's frames can be dense: a small set gets the
// investment.
//
// This file is the first six of that set. The legacy templates in stage.tsx/scenes.tsx are NOT
// touched — they stay in the registry, unrestyled, for anyone who still wants the old format.
//
// RULES, all of them load-bearing and all inherited from CRAYON_BIBLE + WO-8d/8e:
//
//   - **Flat vector only. No gradients, anywhere, for any reason.** Chromium dithers every gradient
//     it paints — adjacent pixels alternate by ±1 even inside a purely vertical ramp — which is what
//     collapsed flat fill from ~99% to 29% in WO-8a. Solid `fill` or nothing.
//   - **Locked camera (§3), moving picture (WO-14).** Nothing here takes `frame` for WHOLE-FRAME
//     motion — no template may translate, scale or rotate its ground, its backdrop or anything
//     spanning most of the frame, which is what §3 actually forbids. What §3 does NOT ask for is a
//     frozen picture: the reference holds the camera still while its characters and props keep
//     moving, and WO-4 measured the cost of having removed the camera motion and put nothing back —
//     80-90% of our frames completely motionless against the reference's ~40%. So each template now
//     also animates a SMALL number of its own elements (a colleague crossing, a clock, a passing
//     car, a quote board reprinting), every one of them seeded off its own identity so nothing
//     shares a clock, and each chosen to stay inside a couple of motion-locality cells.
//   - **Density is the metric.** Flat fill is a DENSITY reading, not only a texture one: too HIGH
//     means the frame is empty. The reference band is 74-92% measured on native 1280×720, and the
//     same artwork reads ~6.5 points higher at 1920. Every template below was rendered natively at
//     both resolutions and measured, not downscaled.
//   - **Reuse before inventing.** Anything not specific to one archetype belongs in setdressing.tsx.
//     WO-8f authored an interior-furniture tier here (ceilings, desks, screens, chairs, seated
//     crowds, paperwork, wall art) because the library was built for exteriors and yards; WO-8g
//     promoted that whole tier into setdressing.tsx, where templates 7-25 can reach it. What is left
//     in this file is only what one template needs: a quote board, a shopfront, a car, a sofa.
//   - **Grey anonymous crowd + colour hero (§6.5).** Background people are `DIM` (grey fills, pure
//     black outlines); the subject is the only figure in full colour.
// ============================================================================

/** Deterministic hash-noise in [0,1). Same generator scenes.tsx/stage.tsx/setdressing.tsx use, so a
 *  seeded layout renders identically on every machine and every frame (including cloud renders). */
const rnd = (i: number): number => {
  const x = Math.sin(i * 127.1 + 31.7) * 43758.5453;
  return x - Math.floor(x);
};

// ===========================================================================
// THE TAKE — one scene's own version of a room (QA_WATCH 2026-08-17 item 2, CRITICAL).
//
// THE DEFECT. "A template renders one image regardless of which scene uses it." Measured on the
// madoff episode: 49 of 2,346 sampled frame pairs were near-identical (mean |Δluma| < 3/255 at
// 160×90) — the pink living room six times, the boardroom six, the opening and closing shot the same
// frame, two shots 2m50s apart at Δ0.19. Twenty-five boardroom scenes were one picture seen 25 times.
//
// WHY THE OLD METRIC PASSED IT. "8/8 distinct set-ups in 8 samples" counted TEMPLATE NAMES. A
// template name is not a picture: `closeUpPortrait` is used 28 times in this episode and rendered the
// same 28 frames. Nothing below is verified by counting templates; it is verified by diffing the
// rendered frames of the same template at different scene ids.
//
// WHAT A TAKE IS. Every template resolves a `Take` — a small deterministic bundle derived from the
// SCENE ID — and dresses itself from it: which seeds its crowds, papers, wall art and chart series
// run on, where the prop groups sit laterally, how many people are in the room, which of two or
// three prop sets is present, and one rung of tone on the large planes (the "time of day" inside the
// scene's own colour key). Same scene id -> same picture, always. Different scene id on the same
// template -> the same ROOM from a different angle, with different people in it.
//
// THE FOUR RULES A VARIATION OBEYS, all inherited from the constraints this file already lives under:
//   1. DETERMINISTIC, AND NOT A FUNCTION OF THE FRAME. Every value below is derived from the scene id
//      alone. Nothing reads `useCurrentFrame()`. This is what keeps the camera locked and what keeps
//      892d409 fixed (a walking figure re-rolled its idle every frame because its seed came from its
//      live `x`; a take seed is a constant for the whole scene).
//   2. SUBSTITUTE, DO NOT DELETE — the same rule PERIOD MODE obeys below. Flat fill is two-sided
//      (74–92% at native 1280), so a variation that empties the room falls out of the band at the top.
//      Prop-set A/B/C swaps keep the footprint; counts move by ±1–2, never to zero.
//   3. NO GRADIENTS, EVER. Tone variation is an integer rung of the existing `shade()` ladder, which
//      is a flat fill. `shade()` throws past ±3, so every rung below goes through `rung()`, which
//      clamps into range instead of letting a variation raise at render time.
//   4. STAY OFF THE HERO'S MARK. Lateral offsets apply to set dressing, not to the subject's staging:
//      the caption-safe box, the balloon anchors and the close-up's head placement are composition,
//      not decoration.
//
// WHERE THE SCENE ID COMES FROM. A template takes NO PROPS — director.tsx picks a component out of
// TEMPLATES and calls it with nothing, and Video2.tsx/director.tsx are owned by other work in flight.
// What IS in scope at render time is the Remotion sequence stack: Video2 mounts every scene as
// `<Sequence from={scene.startFrame}>`, so `cumulatedFrom + relativeFrom` on the innermost sequence
// is that scene's absolute start frame, which is a primary key into `timeline.json` — the same file
// Video2 renders from. That gives the scene RECORD, and with it the id (which seeds everything),
// plus the optional `chart` and `labels` fields item 7 and item 3 need.
//
// The lookup is by START FRAME but the SEED is the scene ID string, deliberately: re-timing an
// episode (a re-recorded VO, a changed gap) moves every start frame, and a picture that reshuffles
// because a line got 40ms longer is not deterministic in any sense a reviewer cares about.
//
// Outside the episode timeline — the `Thumbnail` composition, `StageTest`, a panel cell rendered
// from a composition with no sequence — there is no record. That is take 0: `DEFAULT_TAKE`, which
// reproduces the original look. It is a documented default, not a swallowed error; a template that
// cannot find its scene still has a scene-independent picture to draw, which is exactly right for a
// still that is not part of an episode.
// ===========================================================================

/**
 * The cast slot for the OTHER person in a two-hander, given whose scene it is (QA_WATCH item 8).
 *
 * A template that stages two people needs a second slot that is never the first one. Taking the next
 * slot round the ring is the whole rule: it is a different person for every value of `sceneCast`, it
 * is deterministic, and on a scene with no `cast=` at all it is slot 1 — which is what "two visibly
 * different men on the sofa" means for the five scenes that shipped with twins on it.
 */
const companionCast = (sceneCast: number): number => (sceneCast + 1) % CAST_SLOTS;

const CHART_DIRS: ChartDir[] = ['up', 'down', 'flat'];

type TimelineScene = {
  id: string;
  startFrame: number;
  template: string;
  overlay?: {big?: string; sub?: string} | null;
  card?: {title?: string; subtitle?: string; word?: string; text?: string} | null;
  bubbles?: {text?: string}[] | null;
  /** OPT-IN scene fields, `docs/BIBLE.md` §8 */
  chart?: string;
  labels?: string[];
  placards?: string[];
};

const SCENE_BY_START = new Map<number, TimelineScene>();
for (const s of (timeline as {scenes: TimelineScene[]}).scenes) {
  SCENE_BY_START.set(s.startFrame, s);
}

/**
 * FNV-1a over the scene id, folded into [0, 997).
 *
 * Folded SMALL on purpose. `rnd()` above is `sin`-based, and `Math.sin` of a 32-bit-sized argument is
 * not bit-identical across JS engines — a cloud render and a local render would disagree about the
 * picture. Every seed the templates already pass is a small integer; a take seed stays in the same
 * range so it composes with them without leaving the regime the generator was tuned in.
 */
const hashId = (s: string): number => {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h % 997;
};

/** Words a template is allowed to LETTER (item 3) — pulled off the scene's own devices. */
const STOPWORDS = new Set([
  'THE', 'AND', 'FOR', 'WAS', 'WERE', 'HAS', 'HAD', 'HAVE', 'THAT', 'THIS', 'WITH', 'FROM',
  'INTO', 'ONE', 'TWO', 'OUT', 'NOT', 'BUT', 'ITS', 'HIS', 'HER', 'THEY', 'THEM', 'WHEN',
  'WHAT', 'WHO', 'ALL', 'ANY', 'YOU', 'YOUR', 'OF', 'IN', 'ON', 'AT', 'TO', 'IS', 'IT', 'A', 'AN',
]);

/**
 * FIELD ORDER IS THE PRIORITY ORDER, and only the first few survive. A card TITLE is the beat's own
 * headline — "The Warning", "The Crash" — so it is the best word on the scene; an overlay subtitle
 * ("FUNNELED IN BY ONE FEEDER FUND") is next. Everything after that is there so a scene with only a
 * balloon still has something true to letter. `label()` picks from the first three only, which is
 * what keeps a chart title reading "THE WARNING" instead of "WOULDN'T" — the fourth word of the same
 * scene's subtitle, and the kind of fragment that made the first pass at this look automated.
 */
const wordsFrom = (rec: TimelineScene): string[] => {
  if (rec.labels && rec.labels.length > 0) return rec.labels.map((w) => w.toUpperCase());
  const raw: (string | undefined)[] = [
    rec.card?.title, rec.card?.word, rec.overlay?.sub, rec.card?.subtitle,
    rec.overlay?.big, rec.card?.text,
    ...(rec.bubbles ?? []).map((b) => b?.text),
  ];
  const out: string[] = [];
  for (const s of raw) {
    if (!s) continue;
    for (const raw2 of s.toUpperCase().split(/[^A-Z']+/)) {
      const w = raw2.replace(/^'+|'+$/g, '');
      if (w.length < 3 || w.length > 11 || STOPWORDS.has(w) || out.includes(w)) continue;
      out.push(w);
    }
  }
  return out;
};

export type Take = {
  /** The scene id, or '' outside an episode timeline. */
  id: string;
  /** Everything visual is derived from this. 0 = the original, scene-independent look. */
  seed: number;
  /** Item 7: which way this scene's chart points. */
  chart: ChartDir;
  /** Item 3: short real words this scene has actually said, in narration order. */
  words: string[];
  /**
   * What the crowd in this scene is HOLDING UP, if the writer asked for signs. Empty = no signs, and
   * empty is the default: see `MAX_PLACARDS` for why this is a field of its own and not a lexicon.
   */
  placards: string[];
};

const DEFAULT_TAKE: Take = {id: '', seed: 0, chart: 'up', words: [], placards: []};

/**
 * PLACARDS ARE OPT-IN, AND THEY HAVE NO DEFAULT (2026-08-24).
 *
 * `crowdQueue` used to letter its three signs from `LEXICON.placard` — 'GIVE IT BACK', 'WHERE IS
 * IT', 'PAY US', 'ANSWERS NOW', 'OUR SAVINGS' — whenever the scene's own copy yielded no words. That
 * fallback fired on ELEVEN of the ftx episode's eleven `crowdQueue` scenes, i.e. every one of them,
 * because a scene with no card/overlay/balloon has no words to mine. So the template drew a
 * grievance protest under "new users signed up by the millions", under the $40M of donations, and
 * under Forbes's under-30 ranking — minutes BEFORE the bank run those signs actually depict. Three
 * of those shipped; two were caught by moving the scene to another template, and the third was found
 * in the finished render.
 *
 * THE TEMPLATE IS NOT THE BUG. A queue is legitimately a queue — depositors, sign-ups, a bank run —
 * and only the last of those wants slogans. What was wrong is that the DEFAULT was the most dramatic
 * reading available, so silence from the writer was rendered as an accusation.
 *
 * A placard is not furniture the way a masthead is. A masthead names the building it hangs on
 * whatever the beat; a placard is a sentence a person in the frame is saying, and there is no
 * neutral sentence. Hence: no pool, no inference, no fallback. Signs are drawn from `placards=` on
 * the scene and nowhere else, and a scene without it renders the queue with no signs over it — which
 * is the one picture that is honest under any line.
 *
 * NOT `labels=`: that field feeds `wordsFrom`, which feeds the NAME roles too, so asking for
 * "GIVE IT BACK" through `labels` also letters it across the bank's own frontage (`masthead`, salt
 * 5) and the shopfront fascia (salt 43). The register needs its own field or it vandalises the set.
 */
const MAX_PLACARDS = 3;

/**
 * `chart` is validated HERE, with the scene id in hand, and RAISES on an unknown value — the same
 * contract Video2.tsx's `sceneEra` holds for `period`. A mistyped direction that silently fell back
 * to the default would reproduce exactly the defect the field exists to close: a chart pointing the
 * opposite way to the line being read over it, discovered in the finished 16-minute file.
 */
const takeFor = (rec: TimelineScene): Take => {
  if (rec.chart !== undefined && !(CHART_DIRS as string[]).includes(rec.chart)) {
    throw new Error(
      `${rec.id}: unknown chart ${JSON.stringify(rec.chart)} — chart must be one of ` +
      `${CHART_DIRS.map((d) => `'${d}'`).join(', ')} (docs/BIBLE.md §8 CHART)`
    );
  }
  // `placards` is validated on the same contract as `chart`: with the scene id in hand, and RAISING.
  // A malformed value that fell back to "no signs" would be indistinguishable from not asking, which
  // is precisely the silence this field exists to break.
  const placards = rec.placards ?? [];
  if (!Array.isArray(placards) || placards.some((s) => typeof s !== 'string' || !s.trim())) {
    throw new Error(
      `${rec.id}: placards must be a list of non-empty strings, got ${JSON.stringify(rec.placards)} ` +
      `(docs/BIBLE.md §8 PLACARDS)`
    );
  }
  if (placards.length > MAX_PLACARDS) {
    throw new Error(
      `${rec.id}: ${placards.length} placards, but crowdQueue holds up ${MAX_PLACARDS} — the extra ` +
      `copy would be silently dropped (docs/BIBLE.md §8 PLACARDS)`
    );
  }
  return {
    id: rec.id,
    seed: hashId(rec.id),
    // DEFAULT 'up', not 'down'. The old chart was a hard-coded `crash` down-leg in every scene that
    // used it, which is how "use options to CAP the losses and the gains", "FUNNELED IN $7.2 billion"
    // and two halves of a split whose point was "the statements, still CLIMBING" all ended up under a
    // falling chart. A rising series is the honest default for a format whose charts mostly illustrate
    // money arriving; the crash is the exception and now has to be asked for.
    chart: (rec.chart as ChartDir | undefined) ?? 'up',
    words: wordsFrom(rec),
    placards: placards.map((s) => s.toUpperCase()),
  };
};

const TAKE_CACHE = new Map<number, Take>();

/** This scene's take. See the block comment above for where the identity comes from. */
const useTake = (): Take => {
  const seq = React.useContext(Internals.SequenceContext);
  const start = seq ? seq.cumulatedFrom + seq.relativeFrom : -1;
  const hit = TAKE_CACHE.get(start);
  if (hit) return hit;
  const rec = SCENE_BY_START.get(start);
  const take = rec ? takeFor(rec) : DEFAULT_TAKE;
  TAKE_CACHE.set(start, take);
  return take;
};

/**
 * The dressing dials a template turns. Every one of them is a pure function of the take seed, so a
 * template's whole variation is `const v = useVary()` plus a handful of call-site substitutions.
 */
type Vary = {
  /** `true` on take 0, i.e. outside an episode — templates use it to keep the original staging. */
  plain: boolean;
  /** An integer in [0, n). The A/B/C prop-set chooser. */
  pick: (salt: number, n: number) => number;
  /** An offset in [-amp, +amp] units — lateral camera-equivalent framing of the set dressing. */
  off: (salt: number, amp: number) => number;
  /** A per-take respin of a seeded prop's own seed (crowds, papers, wall art, chart series). */
  seed: (base: number) => number;
  /** `base` shifted by up to ±`amp` rungs, CLAMPED into `shade()`'s ±TONE_MAX_STEP. */
  rung: (base: number, salt: number, amp?: number) => number;
  /** One of `xs`, chosen by the take. */
  one: <T,>(salt: number, xs: readonly T[]) => T;
};

const varyFor = (tk: Take): Vary => {
  const s = tk.seed;
  const r = (salt: number): number => rnd(s * 1.37 + salt * 3.11 + 0.5);
  return {
    plain: s === 0,
    pick: (salt, n) => Math.min(n - 1, Math.floor(r(salt) * n)),
    off: (salt, amp) => (r(salt) - 0.5) * 2 * amp,
    seed: (base) => base + s * 0.61,
    rung: (base, salt, amp = 1) => {
      const step = base + Math.round((r(salt) - 0.5) * 2 * amp);
      return Math.max(-TONE_MAX_STEP, Math.min(TONE_MAX_STEP, step));
    },
    one: <T,>(salt: number, xs: readonly T[]): T => xs[Math.min(xs.length - 1, Math.floor(r(salt) * xs.length))],
  };
};

const useVary = (): Vary => varyFor(useTake());

/**
 * REAL LETTERING (QA_WATCH item 3, HIGH).
 *
 * The rule QA gave: block glyphs are fine as BODY copy at small scale — that is what a paragraph
 * looks like at frame scale — but "anything the narration names should be real lettering". The
 * worst frames in the episode were the ones ABOUT documents: `newsMontage` (19 scenes) was nothing
 * but black rectangles standing in for words across seven documents, and the placards held up as the
 * focal point of `crowdQueue` were three signs of glyphs.
 *
 * Where the words come from, in order:
 *   1. the scene's own `labels` field, if the writer set one (`docs/BIBLE.md` §8);
 *   2. the words the scene ALREADY says on screen — its overlay subtitle, its card title, its
 *      balloon text — which are by construction the episode's own vocabulary at that beat;
 *   3. a small per-ROLE lexicon of the format's own furniture words. Templates are topic-agnostic
 *      archetypes, so this tier cannot be episode-specific; what it can be is REAL. A masthead
 *      reading "THE RECORD" is a newspaper, where seven rectangles are an unfinished render.
 *
 * It is deliberately SHORT copy. A headline is 1–2 words at this size, and `InkWords` sets to the
 * box, so a long string would only shrink to unreadable.
 *
 * TIER 3 NAMES THE OBJECT, NEVER THE STORY (2026-08-24). A scene that says nothing must not make the
 * picture ASSERT something, and tier 3 fires exactly when the scene said nothing — so every word in
 * it has to be true of the PROP regardless of the beat it plays under. "THE TRIBUNE" is what a
 * newspaper is called under any narration; "THE LOSSES" is a claim about the story, and it was in
 * the headline pool. The pools below are furniture words only. The three that were not are gone:
 *   · `placard` — DELETED as a role, see `Take.placards`. A placard is a thing a person in the frame
 *     is SAYING; there is no furniture version of it, so it has no default at all.
 *   · `headline` — 'THE LOSSES' -> 'THE MARKET', 'THE INQUIRY' -> 'THE ACCOUNTS'. A newsstand under
 *     a growth beat was one draw away from headlining the crash that had not happened yet.
 *   · `lowerThird` — 'BREAKING' -> 'THE BULLETIN'. A chyron reading BREAKING over a biography beat
 *     asserts urgency the line does not have. 'LIVE' stays: it is true of a broadcast desk, and it
 *     says nothing about the story.
 * Pool SIZES are unchanged, which matters: `labelRun` steps through the pool, so shrinking `headline`
 * below 6 would print the same word twice across `newsMontage`'s six documents.
 */
type LabelRole = 'masthead' | 'headline' | 'chartTitle' | 'ticker' | 'lowerThird';

const LEXICON: Record<LabelRole, readonly string[]> = {
  masthead: ['THE RECORD', 'THE LEDGER', 'THE TRIBUNE', 'THE HERALD', 'CITY PRESS', 'THE COURIER',
    'THE STANDARD', 'THE GAZETTE'],
  headline: ['THE FUND', 'THE FILING', 'THE AUDIT', 'THE RETURNS', 'THE MARKET', 'THE ACCOUNTS',
    'THE NUMBERS', 'THE BOOKS', 'THE NOTICE'],
  chartTitle: ['RETURNS', 'THE FUND', 'NET FLOWS', 'THE YEARS', 'THE MONEY', 'THE BALANCE',
    'THE TOTAL', 'THE MARGIN'],
  ticker: ['MARKET OPEN', 'LAST TRADE', 'THE TAPE', 'VOLUME'],
  lowerThird: ['THE STORY', 'LIVE', 'THE REPORT', 'THE BULLETIN'],
};

/**
 * One label for a named prop. `salt` distinguishes several props of the same role in one frame, so a
 * fan of documents does not print the same headline seven times.
 */
const label = (tk: Take, role: LabelRole, salt: number): string => {
  const pool = LEXICON[role];
  // Only the best three words on the scene — see `wordsFrom`.
  const words = tk.words.slice(0, 3);
  if (words.length > 0) {
    const i = Math.floor(rnd(tk.seed * 1.37 + salt * 5.7 + 2.5) * words.length) % words.length;
    // Two words where the scene has two to spare and the role is a headline-shaped one.
    if (role === 'headline' && words.length > 1) {
      return `${words[i]} ${words[(i + 1) % words.length]}`;
    }
    return words[i];
  }
  return pool[Math.floor(rnd(tk.seed * 2.11 + salt * 7.3 + 1.5) * pool.length) % pool.length];
};

/**
 * `n` labels for one run of identical props (a ticker, a wall of documents), guaranteed to STEP
 * through the pool rather than draw from it independently. Four independent draws out of a five-word pool
 * printed "VOLUME · VOLUME · VOLUME · MARKET OPEN" across the exchange ticker, which reads as a bug.
 */
const labelRun = (tk: Take, role: LabelRole, n: number, salt: number): string[] => {
  const pool = tk.words.length > 0 ? tk.words.slice(0, 3) : LEXICON[role];
  const base = Math.floor(rnd(tk.seed * 2.11 + salt * 7.3 + 1.5) * pool.length) % pool.length;
  return Array.from({length: n}, (_, i) => pool[(base + i) % pool.length]);
};

/**
 * director.tsx pins the money count-up card bottom-left (left 72, ~620 wide, ~330 tall), so anything
 * near the floor at x < this renders BEHIND it. Measured 2026-07-20; it silently ate the hero in two
 * scenes.tsx templates. Every hero below is staged to the right of it.
 */
const CAPTION_SAFE_X = 760;

/** WHO THIS EPISODE IS ABOUT, in caps, or '' — the same field the thumbnail sets its keyword from. */
const SUBJECT_NAME: string = String((meta as any)?.thumb?.keyword || '').toUpperCase();

/**
 * A ticking second hand (WO-14). One 6° step per second — a tick, never a sweep, because a stepped
 * hand is what a wall clock actually does and because a 26-unit line jumping once a second is the
 * most local motion available: it can only ever touch the one motion-locality cell it sits in.
 */
const ClockHand: React.FC<{cx: number; cy: number; r: number; f: number}> = ({cx, cy, r, f}) => {
  const a = ((Math.floor(f / 30) % 60) * 6 - 90) * (Math.PI / 180);
  return <line x1={cx} y1={cy} x2={cx + Math.cos(a) * r} y2={cy + Math.sin(a) * r}
    stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />;
};

/**
 * A dentil cornice — a moulded band with a run of small blocks under it (WO-8h).
 *
 * Used by three of the WO-8h interiors, all for the same measured reason. Flat fill counts pixels
 * equal to their RIGHT neighbour, so a wall/ceiling junction drawn as horizontal mouldings costs
 * nothing and buys nothing: per-cell maps of `courtHearing`, `chartBoard` and `closeUpPortrait` all
 * put their EMPTIEST band across the top of the frame, at 91-97% flat, because everything up there
 * was horizontal. A row of forty small blocks is forty vertical edge pairs, and it is also just
 * what the top of a panelled room looks like.
 */
const Dentils: React.FC<{x0: number; x1: number; y: number; n: number; h?: number; fill?: string}> =
({x0, x1, y, n, h = 22, fill}) => {
  const tn = useSceneTones();
  const stone = fill ?? tn.card;
  const step = (x1 - x0) / n;
  return (
    <g>
      <rect x={x0} y={y - h * 0.7} width={x1 - x0} height={h * 0.7} fill={shade(stone, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      {Array.from({length: n}, (_, i) => (
        <rect key={i} x={x0 + i * step + step * 0.22} y={y} width={step * 0.56} height={h}
          fill={shade(stone, -2)} stroke={INK} strokeWidth={2.2} />
      ))}
      <rect x={x0} y={y + h} width={x1 - x0} height={h * 0.5} fill={stone} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
    </g>
  );
};

// ===========================================================================
// PERIOD MODE (WO-27) — how the thirteen rooms answer `usePeriod()`.
//
// THE DEFECT IT CLOSES. WO-26 found 1844 narration playing over CRT monitors, a projector, a parked
// car and a glass skyline, and fixed it by BANNING nine of the thirteen rooms from pre-1900
// narration. That left a historical chapter with four rooms where a modern one has thirteen, and
// most of the topic queue is historical (tulip_mania, weimar_hyperinflation, carnegie,
// jp_morgan_1907, ford_five_dollar_day, de_beers). The rooms were never the problem — a counting
// house, an exchange, a mill, a court and a street all existed in 1844. A short list of PROPS was.
//
// WHAT A TEMPLATE DOES ABOUT IT. Most of the work is already done by the library: `Monitor`,
// `Keyboard`, `DeskPhone`, `Ceiling`, `BuildingBand` and `Cone` each carry their own period form
// (setdressing.tsx), so a template that only used those needs no branch at all. What is left here is
// the era-marked art each template drew ITSELF — a quote board of electronic cells, a traffic
// signal, a car, a studio camera, a projector, painted floor hazard chevrons.
//
// THE THREE RULES every branch below obeys:
//   1. SUBSTITUTE, DO NOT DELETE. Flat fill is two-sided (74–92% at native 1280): a room with its
//      screens deleted is EMPTIER than the modern one and falls out of the band at the top. Every
//      swap keeps the footprint and, where it can, adds outlined shapes rather than removing them.
//   2. THE MODERN PATH IS UNTOUCHED. Every branch is `period ? <new> : <exactly what was there>`, so
//      a scene that does not opt in renders a byte-identical element tree (proved: all thirteen
//      templates, before and after, identical SHA-256 at native 1280).
//   3. NO ERA-MARKED PROP MAY REAPPEAR ELSEWHERE. A substitution that quietly re-adds a screen on
//      another wall is cosmetic, not genuine; the point of the flag is that the finished frame
//      contains no dated machine at all.
//
// ...AND A FOURTH, ADDED BY WO-31 BECAUSE THE FIRST THREE WERE NOT ENOUGH:
//   4. JUDGE IT ON THE RENDERED FRAME, NEVER ON THE JSX. WO-27 scored ten rooms PERIOD-CLEAN by
//      reading this file. COMPARISON rendered them and four failed. The three rules above are all
//      about SHAPE, and every one of them was kept — what betrayed the century was COLOUR (a
//      substituted prop inherited the room's tone ladder, so a "timber" frame was blue in a
//      blue-keyed room; `crayonStyle.MATERIAL` is the fix and carries the argument) and, in this
//      template's own case, PROPS THIS FILE DREW THAT NOBODY LOOKED AT. `factoryFloor` had a period
//      branch for its beacon, its chevrons and its cones, and none at all for the three MACHINES
//      that dominate it, the extractor fan, the roller shutter, the lit fascia sign, the service
//      pipework or the four steel drums — the largest objects in the room, in other words. They are
//      all substituted now (line shaft and belts, wall sheave, plank doors, painted name board,
//      coopered casks) and the room was re-rendered and looked at before that sentence was written.
// ===========================================================================

/**
 * A four-wheel dray / hand cart — the period substitute for `cityStreet`'s and `bankExterior`'s
 * `Car`, drawn to the same ~380×114 unit footprint so it can stand or travel in the same lanes.
 *
 * Deliberately HORSELESS and shafted: a dray waiting at a kerb with its shafts down is what a
 * nineteenth-century street actually has most of, and a stick-figure horse at this scale would be
 * the one object in the set nobody could read. The load (barrels and a sack run) is what keeps the
 * silhouette as tall as the car it replaces.
 */
const HandCart: React.FC<{x: number; y: number; s?: number; facing?: number; body?: string}> =
({x, y, s = 1, facing = 1, body}) => {
  const tn = useSceneTones();
  const timber = body ?? shade(tn.card, -1);
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      {/* shafts, down at the near end */}
      <line x1={140} y1={-56} x2={198} y2={-8} stroke={INK} strokeWidth={STROKE} strokeLinecap="round" />
      <line x1={140} y1={-38} x2={192} y2={2} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      {/* bed and sideboards, planked */}
      <rect x={-166} y={-56} width={318} height={26} fill={shade(timber, -1)} stroke={INK} strokeWidth={STROKE} />
      <rect x={-166} y={-108} width={318} height={54} fill={timber} stroke={INK} strokeWidth={STROKE} />
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.55}>
        {Array.from({length: 9}, (_, i) => (
          <line key={i} x1={-150 + i * 34} y1={-106} x2={-150 + i * 34} y2={-56} />
        ))}
      </g>
      {/* the load: two barrel ends and a run of sacks over the boards */}
      {[-96, -18].map((bx, i) => (
        <g key={i}>
          <rect x={bx - 30} y={-160} width={60} height={54} fill={shade(timber, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
          <ellipse cx={bx} cy={-160} rx={30} ry={9} fill={shade(timber, 2)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <line x1={bx - 30} y1={-142} x2={bx + 30} y2={-142} stroke={INK} strokeWidth={2.4} opacity={0.6} />
        </g>
      ))}
      <path d="M 30 -108 q 26 -46 62 -30 q 34 16 32 30 Z" fill={shade(timber, 2)} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
      {/* wheels: iron-tyred and spoked, the near one larger, which is what a cart looks like */}
      {[[-104, 44], [108, 52]].map(([wx, wr], i) => (
        <g key={i}>
          <circle cx={wx} cy={-8} r={wr} fill="none" stroke={INK} strokeWidth={STROKE * 1.1} />
          {Array.from({length: 8}, (_, k) => {
            const a = (k * Math.PI) / 4;
            return <line key={k} x1={wx} y1={-8} x2={wx + Math.cos(a) * wr * 0.86} y2={-8 + Math.sin(a) * wr * 0.86}
              stroke={INK} strokeWidth={2.6} />;
          })}
          <circle cx={wx} cy={-8} r={wr * 0.17} fill={INK} />
        </g>
      ))}
    </g>
  );
};

/** A stack of bound ledgers — the period stand-in wherever a template drew a machine ON a surface
 *  (a printer, a projector, a laptop base). Spines, boards and a marker ribbon: same block of
 *  outlined shapes, no century. */
const LedgerStack: React.FC<{x: number; y: number; w?: number; n?: number; seed?: number}> =
({x, y, w = 170, n = 3, seed = 0}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <g>
      {Array.from({length: n}, (_, i) => {
        const bh = 22 + rnd(seed * 17 + i) * 10;
        const by = y - (i + 1) * (bh + 4);
        const bw = w * (0.82 + rnd(seed * 7 + i) * 0.18);
        const bx = x + (rnd(seed * 3 + i) - 0.5) * 16;
        return (
          <g key={i}>
            <rect x={bx} y={by} width={bw} height={bh} fill={shade(tn.card, -(i % 3))} stroke={INK} strokeWidth={STROKE_THIN} />
            <rect x={bx} y={by + bh * 0.2} width={bw} height={bh * 0.34} fill={PAPER_WHITE} opacity={0.8} />
            <rect x={bx + bw * 0.14} y={by} width={10} height={bh} fill={i === 1 ? c.accent : shade(tn.body, -1)} />
          </g>
        );
      })}
    </g>
  );
};

// ---------------------------------------------------------------------------
// Frame
// ---------------------------------------------------------------------------

/**
 * The scene's flat full-frame ground plus the 1920×1080 authoring viewBox.
 *
 * scenes.tsx has its own private `Frame`; this is a deliberate copy rather than an import, because
 * that one also mounts `<Defs>` — two radial gradients left over from the doodle era. Nothing here
 * may reference a gradient, so the defs block is simply absent, which makes it impossible for a
 * template in this file to acquire one by accident.
 */
const Frame: React.FC<{children: React.ReactNode}> = ({children}) => (
  <svg viewBox="0 0 1920 1080" width="100%" height="100%" style={{display: 'block'}}>
    <rect x={0} y={0} width={1920} height={1080} fill={useSceneColors().bg} />
    {children}
  </svg>
);

// ---------------------------------------------------------------------------
// 1. officeFloor — cubicles/desks, monitors, chairs, filing cabinets, papers, background workers
//
// Keyed `interior`: the reference's own office is a brown/near-black key — dark filing cabinets, a
// tan box, a navy suit, white paper (docs/research/crayon/frames/wolf_office_singleframe.jpg).
//
// Four planes: back wall (cabinets / notice board / door / glazing / shelving), the cubicle bank and
// its heads-over-partitions crowd, the near desk bank with the coloured hero, and an empty swivel
// chair in the near plane for depth — the reference's 3:34 office does exactly this, and a chair
// back is unambiguous where a black silhouette mound is not.
// ---------------------------------------------------------------------------
const OFFICE_WALL = 756;   // where the back wall meets the floor
const OFFICE_DESK = 902;   // near desk top

const OfficeFloor: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // PERIOD (WO-27): a COUNTING HOUSE. The desks, the partitions, the filing wall, the notice board
  // and the ring-binder shelving are all correct for 1844 as drawn; the monitors, keyboards and desk
  // phone substitute themselves in the library. What is left here is the building services — a
  // sprinklered duct, a lit exit sign, a water cooler, an extinguisher — none of which existed.
  const period = usePeriod();
  // The colleague crossing the aisle (WO-14). Amplitude and leg speed are TIED, because a walk cycle
  // whose stride does not match its travel moonwalks: this rig's stride is ~103 units, i.e. ~74px at
  // this figure's 0.72 scale, and a step takes 15/speed frames, so the drift's peak speed AMP·RATE
  // must equal 74·speed/15. 128px · 0.01353 rad/frame · speed 0.35 satisfies it. The phase is chosen
  // so the figure is at its old x, facing its old way, at frame 0.
  // THE TAKE (item 2). 15 scenes on this floor. What varies: the filing wall's stacks, the pinned
  // notice board, the lit block opposite, the ring binders, who is at the cubicle banks, what is on
  // the hero's desk and where the near chair and the plant stand.
  const v = useVary();
  const aisleX = 1000 + Math.sin(f * 0.01353) * 128;
  const aisleFacing = Math.cos(f * 0.01353) >= 0 ? -1 : 1;
  return (
    <Frame>
      <Ceiling y={190} lights={4} />
      {/* boxed service duct with hanger straps and sprinkler heads — a real office ceiling is not a
          plane, and this band is what stops the top sixth of the frame reading as one colour.
          PERIOD: the same band as a TIMBER BEAM on iron brackets, with the sprinkler heads gone and
          the hanger straps become the brackets — a beamed ceiling is the same density and the same
          reason for being there. */}
      <rect x={0} y={190} width={1920} height={period ? 42 : 34} fill={period ? shade(tn.card, -2) : tn.back}
        stroke={INK} strokeWidth={STROKE_THIN} />
      {period
        ? Array.from({length: 16}, (_, i) => (
            <g key={i}>
              <path d={`M ${30 + i * 120} 232 L ${30 + i * 120} 268 L ${66 + i * 120} 232 Z`}
                fill={tn.deep} stroke={INK} strokeWidth={2.4} strokeLinejoin="round" />
              <rect x={24 + i * 120} y={226} width={48} height={10} fill={tn.deep} stroke={INK} strokeWidth={2.2} />
            </g>
          ))
        : Array.from({length: 16}, (_, i) => (
            <rect key={i} x={30 + i * 120} y={184} width={15} height={46} fill={tn.deep} stroke={INK} strokeWidth={2.4} />
          ))}
      {!period && Array.from({length: 8}, (_, i) => (
        <circle key={'s' + i} cx={140 + i * 232} cy={244} r={9} fill={tn.deep} stroke={INK} strokeWidth={2.6} />
      ))}
      {/* --- back wall: a demountable partition system, so it carries panel joints rather than being
          the single largest flat region in the frame --- */}
      {Array.from({length: 20}, (_, i) => (
        <line key={i} x1={i * 98} y1={224} x2={i * 98} y2={OFFICE_WALL} stroke={INK} strokeWidth={2.4} opacity={0.3} />
      ))}
      <line x1={0} y1={470} x2={1920} y2={470} stroke={INK} strokeWidth={2.4} opacity={0.3} />
      <rect x={0} y={OFFICE_WALL - 34} width={1920} height={34} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the filing wall, straight off the reference frame: 3 columns × 4 drawers, dark carcass */}
      <UnitWall x={26} y={372} w={404} h={384} cols={3} rows={4} />
      <BoxStack x={150} baseY={372} n={1 + v.pick(1, 3)} s={0.58} seed={v.seed(3)} />
      <BoxStack x={330} baseY={372} n={1 + v.pick(2, 2)} s={0.5} seed={v.seed(9)} />
      <WallFrame x={54} y={266} w={166} h={92} art={v.one(3, ['line', 'bars', 'scape'] as const)} seed={v.seed(31)} />
      <WallFrame x={250} y={266} w={166} h={92} art={v.one(4, ['bars', 'scape', 'line'] as const)} seed={v.seed(33)} />
      {/* notice board: pinned paper is the cheapest honest density on an office wall */}
      <rect x={470} y={288} width={336} height={270} fill={tn.card} stroke={INK} strokeWidth={STROKE} />
      {Array.from({length: 8 + v.pick(5, 2)}, (_, i) => {
        const px = 498 + (i % 3) * 100, py = 314 + Math.floor(i / 3) * 76;
        return (
          <g key={i} transform={`rotate(${(rnd(v.seed(i * 5)) - 0.5) * 14} ${px + 34} ${py + 26})`}>
            <rect x={px} y={py} width={70} height={56} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
            <TextLines x={px + 8} y={py + 12} w={54} n={3} gap={11} th={3} seed={v.seed(i * 3)} opacity={0.6} />
            <circle cx={px + 35} cy={py + 6} r={5} fill={c.accent} />
          </g>
        );
      })}
      {/* credenza under the board, with files and paperwork landed on it */}
      <UnitWall x={470} y={596} w={336} h={160} cols={3} rows={1} />
      <CaseStack x={548} baseY={596} n={2 + v.pick(6, 3)} s={0.48} seed={v.seed(23)} />
      <Papers x={720} y={584} n={1 + v.pick(7, 3)} s={0.58} seed={v.seed(27)} />
      {/* flush door with a vision panel, under a lit exit sign */}
      <RibbedPanel x={846} y={352} w={182} h={404} ribs={2} dir="v" />
      <rect x={886} y={392} width={102} height={128} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <circle cx={1004} cy={572} r={9} fill={INK} />
      {/* the lit exit sign over the door. PERIOD: a painted timber name board in its place — the
          same 126×44 sign, hand-lettered, with no lamp behind it. */}
      <rect x={874} y={294} width={126} height={44} rx={period ? 0 : 6}
        fill={period ? shade(tn.card, -1) : c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <SerifWords x={892} y={308} w={92} h={17} words={1} seed={2} fill={period ? INK : PAPER_WHITE} serif={period} />
      {/* window onto the block opposite — lit slabs behind the glass, then the mullions over them */}
      <rect x={1086} y={278} width={520} height={296} fill={shade(tn.deep, -1)} />
      {Array.from({length: 33}, (_, i) => (
        <rect key={i} x={1100 + (i % 11) * 46} y={300 + Math.floor(i / 11) * 90} width={26} height={54}
          fill={rnd(v.seed(i * 11)) > 0.45 ? c.accent : shade(tn.deep, 0)} opacity={0.85} />
      ))}
      <Glazing x={1086} y={278} w={520} h={296} bays={4} rows={2} pane={null} />
      {/* radiator under the sill, and a fire extinguisher on the pier beside it */}
      <RibbedPanel x={1124} y={628} w={444} h={128} ribs={13} dir="v" />
      {/* extinguisher on the pier. PERIOD: a leather FIRE BUCKET on its bracket — the same red
          object at the same height, and what actually hung on a wall before the cylinder existed. */}
      {period ? (
        <g>
          <path d="M 1620 626 L 1668 626 L 1660 716 L 1628 716 Z" fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
          <path d="M 1622 634 q 22 -30 44 0" fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.9} />
          <rect x={1612} y={618} width={64} height={12} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ) : (
        <g>
          <rect x={1624} y={624} width={40} height={96} rx={12} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={1636} y={604} width={16} height={24} fill={INK} />
        </g>
      )}
      {/* ring-binder shelving */}
      <UnitWall x={1690} y={344} w={206} h={412} cols={1} rows={4} handle={false} />
      {Array.from({length: 42}, (_, i) => {
        const col = i % 7, row = Math.floor(i / 7);
        return <rect key={i} x={1706 + col * 26} y={366 + row * 102} width={20} height={72 + rnd(v.seed(i * 3)) * 14}
          fill={rnd(v.seed(i * 7)) > 0.7 ? c.accent : shade(tn.card, -(i % 3))}
          stroke={INK} strokeWidth={2.4} />;
      })}
      {/* wall clock. The second hand TICKS — one 6° step a second, never a sweep — which is the
          cheapest honest motion in an office frame and the most local: one 30px line, one cell. */}
      <circle cx={1044} cy={234} r={38} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <line x1={1044} y1={234} x2={1062} y2={244} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <ClockHand cx={1044} cy={234} r={26} f={f} />

      {/* --- floor --- */}
      <SlabFloor y={OFFICE_WALL} cols={26} rows={10} />

      {/* --- cubicle bank: workers behind partitions, heads and shoulders showing over the top.
          Figures first, partitions over them: the partition line crossing their chests is what puts
          them BEHIND it rather than standing loose on the floor. --- */}
      {/* HOW MANY ARE STILL AT THEIR DESKS. Three to five a bank; the partitions in front of them are
          unchanged, so the frame's density does not move with the head count. */}
      <SeatedRow y={766} x0={90} x1={660} n={3 + v.pick(8, 3)} scale={0.56} seed={v.seed(5)} working view="front" alive={0.55} />
      <SeatedRow y={766} x0={1258} x1={1834} n={3 + v.pick(9, 3)} scale={0.56} seed={v.seed(11)} working view="front" alive={0.55} />
      <RibbedPanel x={20} y={706} w={744} h={192} ribs={11} dir="v" fill={tn.back} />
      <RibbedPanel x={1160} y={706} w={744} h={192} ribs={11} dir="v" fill={tn.back} />
      {[20, 1160].map((px, i) => (
        <g key={i}>
          <rect x={px} y={698} width={744} height={18} rx={8} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          {/* returns coming toward the viewer at each end of the run */}
          <rect x={px + (i ? 726 : 0)} y={706} width={18} height={192} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        </g>
      ))}
      {/* surface-run conduit dropping from the duct to the sockets — an office wall is never bare */}
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.8} fill="none" opacity={0.55}>
        <path d="M 452 230 L 452 640 L 470 640" />
        <path d="M 1638 230 L 1638 300" />
        <path d="M 820 230 L 820 296" />
      </g>
      <rect x={440} y={636} width={26} height={120} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the aisle between the banks: cooler, bin, archive boxes, a colleague crossing */}
      {/* the water cooler between the banks. PERIOD: a CAST-IRON STOVE on the same spot — the same
          body, a flue climbing to the beam instead of an inverted bottle, and a fire door with the
          accent showing through it, which is where a counting house got its heat and its one warm
          light at floor level. */}
      {period ? (
        <g>
          <rect x={826} y={556} width={26} height={212} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={814} y={548} width={50} height={16} fill={shade(tn.deep, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <rect x={794} y={764} width={90} height={26} rx={4} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={800} y={790} width={78} height={104} fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={814} y={812} width={50} height={44} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          {Array.from({length: 3}, (_, i) => (
            <line key={i} x1={814} y1={824 + i * 12} x2={864} y2={824 + i * 12} stroke={INK} strokeWidth={2.4} />
          ))}
        </g>
      ) : (
        <g>
          <rect x={800} y={764} width={78} height={26} rx={6} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={806} y={676} width={66} height={92} rx={10} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} opacity={0.85} />
          <rect x={800} y={790} width={78} height={104} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
        </g>
      )}
      <BoxStack x={1076} baseY={880} n={2 + v.pick(10, 3)} s={0.6} seed={v.seed(21)} />
      <RibbedPanel x={912} y={794} w={82} h={100} ribs={6} dir="v" fill={tn.body} />
      {/* the colleague crossing the aisle actually crosses it — see `aisleX` above */}
      <StickFigure pose={A.walk(f, 30, 0.35)} x={aisleX} y={790} scale={0.72}
        facing={aisleFacing} view="profile" pal={DIM} showFace={false} frame={f} idle="subtle"
        seed={41.3} />

      {/* --- near plane: the hero's desk bank ---
          The figures go down BEFORE the desk so the slab occludes their laps; the props go down
          after it. The hero's slot (x 1180-1480) is deliberately kept clear of every monitor —
          in the first render a 196px monitor sat exactly on him and swallowed the only colour
          in the frame. */}
      <Chair x={1330} y={1054} s={1.05} facing={-1} />
      <StickFigure pose={A.type_(f, 30)} x={1330} y={966} scale={1.02} facing={-1} view="front"
        expr={FACES.focused} pal={LIGHT} frame={f} idle="gesture" />
      {/* and the second person at the near bank moves out of the same lane: at x=1062 his head sat
          at y~728, dead centre of the crossing, so the colleague walked out of his skull. He now
          sits against the lane's right edge, clear of the hero's head box (which starts ~1270), and
          a little smaller — 0.80 rather than 0.96 — so the two heads have air between them. The
          colleague passing behind him at the end of his crossing is occluded by him, which is the
          right way round: the seat's ground-y is 968, the crossing's is 790. */}
      <SeatedRow y={968} x0={1146} x1={1146} n={1} scale={0.8} seed={31} working view="front" />
      <Desk x={560} y={OFFICE_DESK} w={1120} legH={146} drawers={0} />
      {/* drawer pedestals under the slab, and the cable run behind them */}
      {[642, 1544].map((px, i) => (
        <g key={i}>
          <rect x={px} y={OFFICE_DESK + 40} width={158} height={140} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
          {[0, 1, 2].map((r) => (
            <g key={r}>
              <rect x={px + 8} y={OFFICE_DESK + 48 + r * 44} width={142} height={38} fill={shade(tn.card, -1)}
                stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
              <rect x={px + 58} y={OFFICE_DESK + 64 + r * 44} width={42} height={7} rx={3} fill={INK} />
            </g>
          ))}
        </g>
      ))}
      <path d={`M 820 ${OFFICE_DESK + 92} q 120 44 250 6 q 130 -38 250 10 q 120 46 200 -8`}
        fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.6} />
      {/* THE DESK PROPS KEEP OUT OF THE AISLE (QA_WATCH item 12: "a grey figure is impaled by the
          desk monitor — head above it, legs below it, body gone. Two figures do this in the same
          shot", t006 f1353 / t040 f6972).
          The z-order was never wrong: a monitor standing on the near desk (ground y 902) IS in front
          of a colleague standing on the floor strip behind it (ground y 790), and it is drawn after
          him for that reason. The trouble is that the floor strip between the back wall (756) and
          the desk (902) is only 146 units deep while a monitor occupies 756-890 of the SAME screen
          band — so ANY figure crossing behind the desk is cut across the middle by anything standing
          on it, and looks bisected rather than occluded. Moving the figure cannot fix that; there is
          nowhere on that strip to stand. The props move instead.
          The colleague's lane is `aisleX` = 1000 +/- 128, i.e. 872-1128 (its amplitude and rate are
          TIED to the walk cycle — see the note where it is defined — so the lane itself must not be
          retuned casually). The second monitor sat at 824-1000, straight through it; it now sits at
          1480, on the clear right end of the slab, and the desk phone takes the vacated spot. Every
          prop is still on the desk and the desk is no less dressed — the only thing that changed is
          that the aisle a person walks down no longer has furniture standing in it. */}
      <Monitor x={598} y={OFFICE_DESK - 152} w={182} h={140} content={v.one(11, ['chart', 'grid', 'text'] as const)} seed={v.seed(8)} />
      <Monitor x={1480} y={OFFICE_DESK - 146} w={176} h={134} content={v.one(12, ['text', 'chart', 'grid'] as const)} seed={v.seed(4)} />
      <Keyboard x={614} y={OFFICE_DESK - 4} w={158} />
      <Keyboard x={1496} y={OFFICE_DESK - 4} w={150} />
      {/* the phone is short enough to sit at desk height (y ~840-900), well under the colleague's
          feet at 790, so unlike a monitor it can stand anywhere along the slab */}
      <DeskPhone x={1000} y={OFFICE_DESK - 2} s={0.9} />
      <Papers x={1214 + v.off(13, 60)} y={OFFICE_DESK - 18} n={2 + v.pick(14, 3)} s={0.74} seed={v.seed(6)} />
      <rect x={1450} y={OFFICE_DESK - 42} width={40} height={40} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <path d={`M 1490 ${OFFICE_DESK - 34} q 20 8 0 18`} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <BoxStack x={1618} baseY={OFFICE_DESK - 2} n={1 + v.pick(15, 2)} s={0.72} seed={v.seed(14)} />
      {/* the near, empty chair — foreground depth without a large black mass */}
      <Chair x={430 + v.off(16, 90)} y={1080} s={1.5} facing={1} fill={shade(tn.body, -2)} />
      {/* Someone carrying a box run across the front of the floor (WO-24). This template measured
          100% motionless at 5 Hz on WO-23 — the aisle walker above drifts at 1.7 units/frame, which
          is a real walk but only ever a mean |Δ| of 0.57 against the bible's 1.0 threshold. A
          near-plane crossing clears it, and it is what an office floor during a move-out looks like. */}
      <Passerby y={1078} x0={-240} x1={2160} scale={1.06} seed={5} at={84} carry="boxes" />
      <Papers x={1636} y={1050} n={1 + v.pick(17, 3)} s={0.9} seed={v.seed(17)} />
      <Plant x={1844} y={1080} s={1.0 + v.pick(18, 3) * 0.05} seed={v.seed(12)} />
      <BoxStack x={132 + v.off(19, 50)} baseY={1074} n={1 + v.pick(20, 3)} s={0.9} seed={v.seed(19)} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 2. boardroom — long table, seated figures, wall screen or chart, window wall
//
// Keyed `grey`: the institutional/bureaucratic key, consistent with the canon's existing
// `boardroomNotes`/`boardroomHead` mapping in SCENE_KEY_BY_TEMPLATE.
//
// The window wall is drawn as GLASS WITH A CITY BEHIND IT — sky tone, then a two-deep BuildingBand,
// then the mullions over the top. That is one reuse of the library doing the work of a bespoke
// backdrop, and it gives the frame a real second depth plane through the glass.
// ---------------------------------------------------------------------------
const BOARD_WALL = 700;
const BOARD_TABLE = 866;

const Boardroom: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2). 25 scenes of this episode are set in this room and QA measured them as one
  // picture seen 25 times. What varies: the skyline through the glass, the art on the left wall, how
  // many directors are at the table and where they sit, what is on the table, where the hero stands,
  // and one rung of daylight on the panelled wall.
  const v = useVary();
  // PERIOD (WO-27): the room is a panelled board room either way — a long table, chairs, a credenza,
  // charts on the wall. Two things date it: the CURTAIN WALL (an unbroken 1364-unit run of glass is
  // a 20th-century building) and the ceiling PROJECTOR.
  const period = usePeriod();
  return (
    <Frame>
      <Ceiling y={172} lights={3} />
      {/* --- the curtain wall, and the city seen through it --- */}
      <rect x={556} y={214} width={1364} height={486} fill={shade(c.bg, 2)} />
      <BuildingBand baseY={700} x0={560} x1={1930} n={8 + v.pick(1, 3)} seed={v.seed(31)} depth={2} minH={120} maxH={300} opacity={0.55} />
      <BuildingBand baseY={700} x0={540} x1={1940} n={5 + v.pick(2, 3)} seed={v.seed(7)} depth={1} minH={90} maxH={230} />
      <Glazing x={556} y={214} w={1364} h={486} bays={6} rows={3} pane={null} sill={false} />
      {/* PERIOD: masonry piers, arched heads and a sill course laid OVER the glazing, which turns the
          curtain wall into three tall round-headed sash windows in a stone wall without moving the
          city behind it. Drawn after the glass so the piers occlude the mullions they replace. */}
      {period && (
        <g>
          {/* the piers, the arches and the sill course are STONE — a structural plane, so they take a
              neutral rung rather than the hue-carrying `card` (WO-24's coverage rule). Between them
              they are ~14% of the frame. */}
          {[[556, 96], [966, 92], [1376, 92], [1786, 134]].map(([px, pw], i) => (
            <g key={i}>
              <rect x={px} y={214} width={pw} height={486} fill={shade(tn.floor, 1)} stroke={INK} strokeWidth={STROKE} />
              <g stroke={INK} strokeWidth={STROKE_THIN * 0.55} opacity={0.4}>
                {Array.from({length: 9}, (_, k) => (
                  <line key={k} x1={px} y1={214 + ((k + 1) * 486) / 10} x2={px + pw} y2={214 + ((k + 1) * 486) / 10} />
                ))}
              </g>
            </g>
          ))}
          {[[652, 314], [1058, 318], [1468, 318]].map(([wx, ww], i) => (
            <g key={'a' + i}>
              <path d={`M ${wx} 330 Q ${wx + ww / 2} 196 ${wx + ww} 330 L ${wx + ww} 214 L ${wx} 214 Z`}
                fill={shade(tn.floor, 1)} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
              <path d={`M ${wx - 10} 330 Q ${wx + ww / 2} 186 ${wx + ww + 10} 330`}
                fill="none" stroke={INK} strokeWidth={STROKE_THIN} />
              <rect x={wx - 14} y={676} width={ww + 28} height={24} fill={shade(tn.floor, 2)} stroke={INK} strokeWidth={STROKE_THIN} />
            </g>
          ))}
          <rect x={540} y={186} width={1392} height={34} fill={shade(tn.floor, 2)} stroke={INK} strokeWidth={STROKE_THIN} />
        </g>
      )}
      {/* --- the left wall: presentation screen, charts, a credenza --- */}
      <rect x={0} y={172} width={560} height={528} fill={shade(tn.panel, v.rung(0, 3))} stroke={INK} strokeWidth={STROKE_THIN} />
      <WallFrame x={40} y={216} w={470} h={272} art={v.one(4, ['line', 'bars', 'scape'] as const)} seed={v.seed(5)} />
      {/* NOT portraits. Three framed heads at exactly seated-head height, on the wall directly
          behind the far side of the table, read as three men standing in lit doorways — the
          composition defect neither metric can see. Charts carry the same density with no
          ambiguity about what is a person and what is on the wall. */}
      <WallFrame x={40} y={506} w={148} h={172} art={v.one(5, ['bars', 'line', 'scape'] as const)} seed={v.seed(2)} />
      <WallFrame x={206} y={506} w={148} h={172} art={v.one(6, ['line', 'scape', 'bars'] as const)} seed={v.seed(9)} />
      <WallFrame x={372} y={506} w={148} h={172} art={v.one(7, ['scape', 'bars', 'line'] as const)} seed={v.seed(14)} />
      <rect x={0} y={670} width={1920} height={30} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* --- floor, with a bordered rug under the table --- */}
      <SlabFloor y={BOARD_WALL} cols={24} rows={10} />
      <path d="M 244 890 L 1700 890 L 1900 1080 L 40 1080 Z" fill={shade(tn.floor, 2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 288 918 L 1656 918 L 1826 1064 L 116 1064 Z" fill="none" stroke={INK} strokeWidth={STROKE_THIN} opacity={0.55} />
      {/* credenza against the window wall, with a water tray and a phone */}
      <UnitWall x={1500} y={606} w={392} h={96} cols={4} rows={1} />
      {Array.from({length: 5}, (_, i) => (
        <rect key={i} x={1534 + i * 74} y={566} width={26} height={42} rx={4} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      ))}
      {/* ceiling-mounted projector over the table. PERIOD: a GASOLIER on the same drop — a stem, a
          ring and three burners with glass shades, which is the fitting that hung over a board table
          before there was anything to project. */}
      {period ? (
        <g>
          <rect x={936} y={140} width={14} height={54} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <rect x={874} y={194} width={138} height={12} rx={5} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          {[886, 943, 1000].map((bx, i) => (
            <g key={i}>
              <path d={`M ${bx - 22} 240 L ${bx + 22} 240 L ${bx + 12} 206 L ${bx - 12} 206 Z`}
                fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
              <rect x={bx - 4} y={198} width={8} height={12} fill={tn.deep} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <rect x={886} y={172} width={112} height={62} rx={10} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={936} y={140} width={14} height={34} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <rect x={996} y={192} width={24} height={24} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      )}

      {/* --- the table and the people around it ---
          Chairs first, then the far-side figures over them, then the table slab over their laps:
          in the first render the chairs were drawn last and every far-side director had a chair
          back floating across his chest. */}
      {/* PERIOD (WO-31): the explicit `fill` is what stopped `Chair`'s own period substitution from
          landing here — a caller naming a colour wins, by design, so six turned wooden chairs were
          being painted the room's structural grey. Dropped in period so the chair takes its oak. */}
      {[430, 640, 850, 1060, 1270, 1480].map((cx, i) => (
        <Chair key={i} x={cx} y={890} s={0.62} facing={1} fill={period ? undefined : tn.deep} />
      ))}
      {/* HOW FULL THE ROOM IS. Four to six directors on the far side — a board meeting and a
          half-attended one are different pictures, and the chairs above still draw either way, so
          the density holds (the SUBSTITUTE-DO-NOT-DELETE rule). */}
      <SeatedRow y={834} x0={470} x1={1520} n={4 + v.pick(8, 3)} scale={0.86} seed={v.seed(13)} view="front" />
      {/* the slab: a long boardroom table, near edge wider than the far edge */}
      {/* PERIOD: the slab and its edge are OAK. A board table is the largest single object in this
          room — ~11% of the frame — so it is also the biggest single carrier of the room's hue, and
          a pale blue table is the thing that makes the rest of the substitutions look like a tinted
          modern room rather than an 1844 one. */}
      <path d={`M 210 ${BOARD_TABLE} L 1712 ${BOARD_TABLE} L 1856 ${BOARD_TABLE + 88} L 66 ${BOARD_TABLE + 88} Z`}
        fill={period ? MATERIAL.timber : tn.card} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d={`M 66 ${BOARD_TABLE + 88} L 1856 ${BOARD_TABLE + 88} L 1856 ${BOARD_TABLE + 122} L 66 ${BOARD_TABLE + 122} Z`}
        fill={period ? MATERIAL.oak : shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <line x1={228} y1={BOARD_TABLE + 40} x2={1700} y2={BOARD_TABLE + 40} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.35} />
      {/* what is ON the table: folders, glasses, a carafe, a laptop, notepads */}
      {[300, 520, 740, 960, 1180, 1400, 1620].map((px, i) => (
        <g key={i}>
          <rect x={px - 54} y={BOARD_TABLE + 22} width={108} height={54} rx={4} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={px - 42} y={BOARD_TABLE + 34} w={84} n={3} gap={11} th={3} seed={v.seed(i * 5)} opacity={0.5} />
          <rect x={px + 62} y={BOARD_TABLE + 26} width={26} height={40} rx={3} fill={shade(c.bg, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ))}
      <rect x={880} y={BOARD_TABLE - 46} width={44} height={70} rx={8} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      <Monitor x={1276 + v.off(9, 90)} y={BOARD_TABLE - 96} w={158} h={110}
        content={v.one(10, ['grid', 'chart', 'text'] as const)} stand={false} seed={v.seed(12)} />
      <Papers x={620 + v.off(11, 110)} y={BOARD_TABLE + 52} n={2 + v.pick(12, 2)} s={0.62} seed={v.seed(19)} />

      {/* --- near plane: the two backs at the near edge, and the hero standing at the head --- */}
      <StickFigure pose={A.stand(f)} x={1770} y={862} scale={1.16} facing={-1}
        view={v.one(13, ['profile', 'profile', 'front'] as const)}
        expr={FACES.hardened} pal={LIGHT} frame={f} idle="gesture" />
      {/* THE NEAR BACKS SIT IN THEIR OWN CHAIRS (QA_WATCH item 12: "seated figures' legs are drawn
          in front of the chair backs that should occlude them, in every chair, in every
          boardroom/chartBoard").
          The z-order was already right — chairs are drawn after the figures — but the two rows were
          computed INDEPENDENTLY: a `SeatedRow` spread over x0=330..1180 with n varying 3..5 by the
          take, against four chairs hard-coded at 300/590/880/1170. At n=4 every figure sat 30 units
          right of its chair and its legs came down beside the back instead of behind it; at n=3 the
          two rows had nothing to do with each other at all. Nobody was in a chair.
          This is the pattern `chartBoard` below already uses and says why: ONE SEAT PER CALL, with
          x0 === x1 and n === 1 so the row's own ±0.18-step jitter is zero, and the chair drawn at
          the SAME x immediately after its occupant. `y` and `scale` are unchanged at 1054 / 1.12,
          which is what keeps director.tsx's `extraHeads` band for this row valid — see
          staging_check.py, and note that x is the only quantity that moved. */}
      {[300, 590, 880, 1170].map((cx, i) => (
        <g key={i}>
          {i !== v.pick(14, 5) && (
            <SeatedRow y={1054} x0={cx} x1={cx} n={1} scale={1.12} seed={v.seed(23 + i * 3)} view="back" />
          )}
          <Chair x={cx} y={1096} s={1.16} facing={1} fill={period ? undefined : shade(tn.body, -2)} />
        </g>
      ))}
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 3. exchangeFloor — banks of desks and screens, a house quote board, a public gallery over the pit
//
// Keyed `grey`: the institutional key the legacy hedge pack already uses for a floor (paired there
// with an `alarm` pnlWall — grey floor, red board).
//
// NOTE ON THE NAME (WO-8g). This was called `tradingFloor` when WO-8f wrote it, which collided with
// stage.tsx's HEDGE `tradingFloor`; because EXPLAINER_TEMPLATES is spread last into TEMPLATES, the
// legacy pack template was silently superseded — a real behaviour change for every legacy hedge-fund
// episode, decided by map ordering rather than by anyone. Renamed: this is a whole exchange floor
// (a pit, a house board, a ticker, a public gallery), the legacy one is a single trader at a desk,
// and both names are now honest about what they draw. `tradingFloor` resolves to the legacy pack
// template again.
// ---------------------------------------------------------------------------
const EXCHANGE_WALL = 640;

/** The house quote board: rows of symbol/price/direction cells. Bespoke to this template, and the
 *  single densest object in the six — ~150 outlined blocks across the back wall. */
const QuoteBoard: React.FC<{x: number; y: number; w: number; h: number; cols: number; rows: number}> =
({x, y, w, h, cols, rows}) => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  const period = usePeriod();
  const cw = w / cols, ch = h / rows;
  const cells: React.ReactNode[] = [];
  // PERIOD (WO-27): the same board, in CHALK. An exchange before the electric board is a wall of
  // slates a clerk writes on, so the electronic cell — a lit symbol block, a lit price block and a
  // filled direction arrow — becomes a chalked symbol, a chalked figure and a chalked tick, ruled
  // into columns. Same 60 cells, same footprint, and no lit surface anywhere in it. It is also
  // STILL: chalk does not reprint itself on an 8-second clock, so the board stops animating.
  if (period) {
    for (let r = 0; r < rows; r++) {
      for (let k = 0; k < cols; k++) {
        const s = r * 37 + k * 11;
        const cx = x + k * cw, cy = y + r * ch;
        const up = rnd(s) > 0.42;
        cells.push(
          <g key={`${r}_${k}`} stroke={PAPER_WHITE} strokeLinecap="round">
            <line x1={cx + 6} y1={cy + ch * 0.24} x2={cx + cw * 0.3} y2={cy + ch * 0.24} strokeWidth={5} opacity={0.85} />
            <line x1={cx + cw * 0.38} y1={cy + ch * 0.24} x2={cx + cw * (0.38 + 0.3 * (0.5 + rnd(s + 5) * 0.5))}
              y2={cy + ch * 0.24} strokeWidth={5} opacity={0.7} />
            <line x1={cx + 6} y1={cy + ch * 0.4} x2={cx + cw * (0.2 + rnd(s + 9) * 0.4)} y2={cy + ch * 0.4}
              strokeWidth={4} opacity={0.55} />
            <path d={up
              ? `M ${cx + cw * 0.84} ${cy + ch * 0.4} L ${cx + cw * 0.92} ${cy + ch * 0.1} L ${cx + cw} ${cy + ch * 0.4}`
              : `M ${cx + cw * 0.84} ${cy + ch * 0.1} L ${cx + cw * 0.92} ${cy + ch * 0.4} L ${cx + cw} ${cy + ch * 0.1}`}
              fill="none" strokeWidth={4} opacity={0.9} />
          </g>
        );
      }
    }
    return (
      <g>
        {/* WO-31. The slate and its frame took `tn.deep` and `tn.card` — the ROOM's darkest structural
            grey and the room's pale material — so in `exchangeFloor`, which is blue-keyed, this drew
            a near-black rectangle with a BLUE band across the top of it. That is a lit electronic
            quote board, drawn exactly, which is what COMPARISON reported: "the chalked slate still
            reads as a dark electronic quote board". Slate is slate and the frame is oak, in every
            room; and the frame is now a full SURROUND with stiles, because a band across the top of a
            dark rectangle is a bezel and a surround is a picture frame. */}
        <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill={MATERIAL.slate} stroke={INK} strokeWidth={STROKE} />
        <rect x={x - 18} y={y - 18} width={w + 36} height={16} fill={MATERIAL.oak} stroke={INK} strokeWidth={STROKE_THIN} />
        <rect x={x - 18} y={y + h + 2} width={w + 36} height={16} fill={MATERIAL.oak} stroke={INK} strokeWidth={STROKE_THIN} />
        <rect x={x - 18} y={y - 18} width={16} height={h + 36} fill={MATERIAL.oak} stroke={INK} strokeWidth={STROKE_THIN} />
        <rect x={x + w + 2} y={y - 18} width={16} height={h + 36} fill={MATERIAL.oak} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* the chalk rail: a projecting oak ledge with sticks of chalk lying on it */}
        <rect x={x - 26} y={y + h + 18} width={w + 52} height={12} fill={shade(MATERIAL.oak, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        {Array.from({length: 6}, (_, i) => (
          <rect key={'ch' + i} x={x + 60 + i * (w / 6)} y={y + h + 12} width={38} height={7} rx={3}
            fill={PAPER_WHITE} stroke={INK} strokeWidth={2} />
        ))}
        {cells}
        {Array.from({length: rows - 1}, (_, i) => (
          <line key={'h' + i} x1={x - 12} y1={y + (i + 1) * ch - 2} x2={x + w + 12} y2={y + (i + 1) * ch - 2}
            stroke={PAPER_WHITE} strokeWidth={1.6} opacity={0.3} />
        ))}
        {Array.from({length: cols - 1}, (_, i) => (
          <line key={'v' + i} x1={x + (i + 1) * cw - 4} y1={y - 6} x2={x + (i + 1) * cw - 4} y2={y + h + 6}
            stroke={PAPER_WHITE} strokeWidth={1.6} opacity={0.3} />
        ))}
      </g>
    );
  }
  for (let r = 0; r < rows; r++) {
    for (let k = 0; k < cols; k++) {
      const s = r * 37 + k * 11;
      const cx = x + k * cw, cy = y + r * ch;
      // Each cell REPRINTS on a clock of its own — a quote board is a grid of numbers that change,
      // and nothing about it slides. The period is long (~8s, jittered per cell off `stepIndex`), so
      // in any two frames ten apart only about one cell of sixty has turned over: the board reads as
      // live without spraying the whole back wall across the motion-locality grid.
      const up = rnd(s + stepIndex(f, s + 3, 240)) > 0.42;
      cells.push(
        <g key={`${r}_${k}`}>
          <rect x={cx + 5} y={cy + 4} width={cw * 0.3} height={ch * 0.42} fill={PAPER_WHITE} opacity={0.9} />
          <rect x={cx + cw * 0.38} y={cy + 4} width={cw * 0.42} height={ch * 0.42}
            fill={up ? c.accent : PAPER_WHITE} opacity={0.9} />
          <path d={up
            ? `M ${cx + cw * 0.86} ${cy + ch * 0.42} L ${cx + cw * 0.94} ${cy + ch * 0.06} L ${cx + cw * 1.02} ${cy + ch * 0.42} Z`
            : `M ${cx + cw * 0.86} ${cy + ch * 0.06} L ${cx + cw * 0.94} ${cy + ch * 0.42} L ${cx + cw * 1.02} ${cy + ch * 0.06} Z`}
            fill={up ? c.accent : PAPER_WHITE} />
        </g>
      );
    }
  }
  return (
    <g>
      <rect x={x - 18} y={y - 18} width={w + 36} height={h + 36} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE} />
      {cells}
      {Array.from({length: rows - 1}, (_, i) => (
        <line key={i} x1={x - 12} y1={y + (i + 1) * ch - 2} x2={x + w + 12} y2={y + (i + 1) * ch - 2}
          stroke={PAPER_WHITE} strokeWidth={1.6} opacity={0.25} />
      ))}
    </g>
  );
};

/** One bank of trading desks: a slab, a wall of screens on it, keyboards, phones and paper.
 *  Repeated at three depths, which is what a trading floor IS. */
const DeskBank: React.FC<{y: number; s: number; seats: number; seed: number}> = ({y, s, seats, seed}) => {
  const w = 1920 * s * 1.06;
  const x0 = 960 - w / 2;
  const seatW = w / seats;
  return (
    <g>
      {Array.from({length: seats * 2 }, (_, i) => (
        <Monitor key={'m' + i}
          x={x0 + (Math.floor(i / 2) + 0.5) * seatW - seatW * 0.42 + (i % 2) * seatW * 0.44}
          y={y - 128 * s}
          w={seatW * 0.4} h={124 * s}
          content={rnd(seed * 13 + i) > 0.5 ? 'chart' : 'grid'} stand={false} seed={seed * 3 + i} />
      ))}
      <Desk x={x0} y={y} w={w} h={30 * s} legH={150 * s} />
      {Array.from({length: seats}, (_, i) => (
        <g key={'k' + i}>
          <Keyboard x={x0 + (i + 0.5) * seatW - seatW * 0.18} y={y - 6} w={seatW * 0.36} />
          <DeskPhone x={x0 + (i + 0.5) * seatW + seatW * 0.22} y={y - 2} s={0.62 * s * 2.4} live={false} />
        </g>
      ))}
    </g>
  );
};

const ExchangeFloor: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2) and THE TICKER (item 3): the strip under the board is the one thing in this
  // room a viewer tries to read, so it carries real words rather than a 13-word glyph run.
  const tk = useTake();
  const v = useVary();
  // PERIOD (WO-27): a nineteenth-century exchange — the pit, the gallery over it, the house clocks
  // and the paper on the floor are all correct as drawn. The board goes to CHALK (see `QuoteBoard`),
  // the desk screens and phones substitute in the library, and the running ticker strip becomes a
  // bill board, which is the two era marks this room actually carries.
  const period = usePeriod();
  return (
    <Frame>
      {/* --- ceiling, service run and the board wall --- */}
      <Ceiling y={150} lights={5} />
      {/* structural piers at the ends of the pit, with a wall screen mounted on each. The first pass
          hung monitors on drop rods over the board and the board covered every one of them — all that
          rendered was four black rods hanging off the ceiling with nothing on them. */}
      <rect x={0} y={150} width={1920} height={26} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      {[10, 1810].map((px, i) => (
        <g key={i}>
          <rect x={px} y={176} width={100} height={EXCHANGE_WALL - 176} fill={tn.back} stroke={INK} strokeWidth={STROKE} />
          <rect x={px - 10} y={176} width={120} height={22} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
          <Monitor x={px + 6} y={236} w={88} h={128} content={i ? 'grid' : 'chart'} stand={false} seed={v.seed(40 + i)} />
          <Monitor x={px + 6} y={392} w={88} h={128} content={i ? 'chart' : 'grid'} stand={false} seed={v.seed(44 + i)} />
        </g>
      ))}
      <QuoteBoard x={168} y={196} w={1584} h={244} cols={12} rows={5} />
      {/* the running ticker strip under the board. PERIOD: a BILL BOARD in the same band — a timber
          ground with the day's notices pasted along it, hand-set, no lit surface. */}
      {period ? (
        <g>
          <rect x={0} y={452} width={1920} height={56} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
          {Array.from({length: 8}, (_, i) => (
            <g key={i} transform={`rotate(${(rnd(i * 7) - 0.5) * 3} ${100 + i * 236} 480)`}>
              <rect x={40 + i * 236} y={458} width={206} height={44} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
              <SerifWords x={52 + i * 236} y={464} w={182} h={14} words={2} seed={5 + i * 3} />
              <TextLines x={52 + i * 236} y={484} w={182} n={1} gap={10} th={3.4} seed={i * 11} opacity={0.6} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <rect x={0} y={452} width={1920} height={56} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
          {/* THE TICKER (item 3). Four real runs across the strip with glyph blocks between them:
              a tape is mostly figures, and the parts a reader locks onto are the words. */}
          {labelRun(tk, 'ticker', 4, 5).map((tx, i) => (
            <g key={i}>
              <InkWords x={44 + i * 476} y={462} w={230} h={30} text={tx} fill={c.accent} />
              <SerifWords x={294 + i * 476} y={466} w={186} h={24} words={2} seed={v.seed(5 + i)} fill={c.accent} serif={false} />
            </g>
          ))}
        </g>
      )}
      {/* the public gallery over the pit: a panelled wall, a row of house clocks, spectators behind a
          rail. This band was the frame's largest empty region until it got a floor of its own — and
          an exchange gallery is what is actually there. */}
      {Array.from({length: 20}, (_, i) => (
        <line key={i} x1={i * 98} y1={508} x2={i * 98} y2={EXCHANGE_WALL} stroke={INK} strokeWidth={2.4} opacity={0.18} />
      ))}
      {[126, 346, 566, 786, 1136, 1356, 1576, 1796].map((cx, i) => (
        <g key={i}>
          <circle cx={cx} cy={546} r={21} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
          <line x1={cx} y1={546} x2={cx + Math.round(Math.cos(i * 1.3) * 12)} y2={546 + Math.round(Math.sin(i * 1.3) * 12)}
            stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
          <line x1={cx} y1={546} x2={cx} y2={531} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      ))}
      <CrowdHeads y={592} x0={120} x1={1800} n={15 + v.pick(1, 5)} rows={2} r={15} seed={v.seed(4)} alive={0.08} />
      <Fence x0={110} x1={1810} y={628} h={54} posts={26} opacity={0.75} />
      <rect x={0} y={EXCHANGE_WALL - 30} width={1920} height={30} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <SlabFloor y={EXCHANGE_WALL} cols={26} rows={11} />

      {/* --- far bank: seated rows, then the desk slab over their laps --- */}
      <SeatedRow y={706} x0={330} x1={1600} n={6 + v.pick(2, 3)} scale={0.6} seed={v.seed(3)} working view="front" alive={0.3} />
      <DeskBank y={742} s={0.62} seats={5} seed={v.seed(2)} />
      {/* standing figures between the banks — the floor's characteristic gesture, arms up. `climb`
          at frame 0 is a raised-arms pose; the crowd stays static so the camera lock is untouched. */}
      {[380, 706, 1268, 1596].map((x, i) => (
        <StickFigure key={i} pose={i % 2 ? A.climb(0, 30) : A.stand(0)} x={x} y={790}
          scale={0.66} facing={i % 2 ? 1 : -1} view="front" pal={DIM} showFace={false} frame={0} />
      ))}

      {/* --- mid bank --- */}
      <SeatedRow y={846} x0={240} x1={1700} n={5 + v.pick(3, 3)} scale={0.82} seed={v.seed(9)} working view="front" alive={0.3} />
      <DeskBank y={898} s={0.84} seats={4} seed={v.seed(6)} />
      <Papers x={300 + v.off(4, 70)} y={1010} n={2 + v.pick(5, 3)} s={0.9} seed={v.seed(12)} />
      <Papers x={1660} y={1002} n={1 + v.pick(6, 3)} s={0.85} seed={v.seed(16)} />
      {/* The near pair are the floor's characteristic gesture, arms up, and they stay POSED. This is
          the one place WO-14 measured a motion it then took back out: an animated trader here reads
          the same as a still one at 0.94 scale, and putting one on each side of the pit lit two more
          motion-locality columns in the template that already had the least budget of the six. The
          hero below carries this frame's character motion; the pit is its background. */}
      {[196, 1748].map((x, i) => (
        <StickFigure key={i} pose={A.climb(0, 30)} x={x} y={946} scale={0.94}
          facing={i ? -1 : 1} view="front" pal={DIM} showFace={false} frame={0} idle="none" />
      ))}

      {/* discarded paper all over the floor between the banks — the format's shorthand for a bad day */}
      {[[120, 1002], [520, 986], [960, 1004], [1420, 992], [1810, 1006]].map(([px, py], i) => (
        <g key={i} transform={`rotate(${(rnd(v.seed(i * 9)) - 0.5) * 50} ${px + v.off(7 + i, 34)} ${py})`}>
          <rect x={px - 44} y={py - 28} width={88} height={56} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={px - 34} y={py - 16} w={68} n={3} gap={12} th={3.4} seed={v.seed(i * 7)} opacity={0.55} />
        </g>
      ))}
      {/* --- near plane: the coloured hero on the phone, over the near desk edge --- */}
      <StickFigure pose={A.stand(f)} x={1180 + v.off(13, 50)} y={962} scale={1.24} facing={-1} view="front"
        expr={FACES.shock} pal={LIGHT} frame={f} idle="gesture" />
      {/* a runner crossing the pit, cut off at the waist by the near desk drawn over him (WO-24) */}
      <Passerby y={1000} x0={2140} x1={-220} scale={0.98} seed={v.seed(11)} at={72} />
      <Desk x={-40} y={1016} w={2000} h={38} legH={70} />
      <Monitor x={230} y={882} w={230} h={166} content={v.one(14, ['chart', 'grid', 'text'] as const)} seed={v.seed(21)} />
      <Monitor x={506} y={888} w={214} h={160} content={v.one(15, ['grid', 'chart'] as const)} seed={v.seed(23)} />
      <Monitor x={1470} y={888} w={214} h={160} content={v.one(16, ['chart', 'text', 'grid'] as const)} seed={v.seed(27)} />
      <Monitor x={1712} y={894} w={196} h={154} content={v.one(17, ['grid', 'chart'] as const)} seed={v.seed(29)} />
      <Keyboard x={280} y={1054} w={190} />
      <Keyboard x={1516} y={1054} w={172} />
      <DeskPhone x={760} y={1056} s={1.15} />
      <Papers x={912 + v.off(18, 80)} y={1046} n={1 + v.pick(19, 3)} s={0.9} seed={v.seed(31)} />
      <Cone x={1880} y={1010} s={0.6} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 4. cityStreet — building fronts at street level, signage, pedestrians, kerb, vehicles
//
// Keyed `daylight`: the only one of the six under open sky, and the reference's own cyan/tan key.
//
// The facade row is the reuse showcase: a shopfront is a `UnitWall` of upper windows + a `Glazing`
// shopfront + a `RibbedPanel` awning + a `SerifWords` fascia sign, which is four library/kit
// components and about ten bespoke lines per building.
// ---------------------------------------------------------------------------
const STREET_KERB = 812;    // pavement front edge / kerb line
const STREET_ROAD = 858;    // road surface starts

/**
 * One street-level building front.
 *
 * `topY` is the parapet, and it is a REQUIRED argument rather than "off the top of the frame": the
 * first render ran every facade to y=-20 and the result had no sky at all in a template keyed
 * `daylight` — a street with no sky reads as an interior corridor. Varying the parapet also gives
 * the row a skyline of its own.
 *
 * Reuse: the upper storeys are a `UnitWall` with the handles turned off, the awning is a
 * `RibbedPanel`, the shopfront is `Glazing` and the fascia is `SerifWords`.
 */
const Facade: React.FC<{x: number; w: number; topY: number; baseY: number; seed: number; sign?: string}> =
({x, w, topY, baseY, seed, sign}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const period = usePeriod();
  const step = rnd(seed * 3) > 0.5 ? 0 : 1;
  const wall = shade(tn.body, step + 1);
  // Glass keys to `crowd`, darkened. A shopfront seen from OUTSIDE reads dark, and `crowd` is the
  // only desaturated neutral the scene's four tokens carry — `bg` darkened gave saturated cyan panes
  // that read as backlit signage, and `mid` darkened gave terracotta panes that read as brick.
  const glass = shade(c.crowd, -2);
  const fasciaY = baseY - 236;
  const winTop = topY + 76;
  const winH = fasciaY - winTop - 30;
  // Small panes, many of them: the first render used ~5×3 storey-high openings and the frontage read
  // as a glass curtain wall on a high street.
  const storeys = Math.max(3, Math.round(winH / 72));
  return (
    <g>
      <rect x={x} y={topY} width={w} height={baseY - topY} fill={wall} stroke={INK} strokeWidth={STROKE} />
      {/* parapet + cornice */}
      <rect x={x - 14} y={topY - 26} width={w + 28} height={30} fill={shade(wall, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 8} y={topY + 44} width={w + 16} height={16} fill={shade(wall, -2)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {/* upper storeys: a grid of sash windows is literally a UnitWall with no handles.
          PERIOD: the same grid, but the openings are drawn SMALL with brickwork between them and a
          stone lintel over each — a `UnitWall`'s cells butt up against each other with a 3-unit
          margin, which at this size reads as a glazed curtain wall rather than as punched windows,
          and that was the loudest thing left in the street. */}
      {period ? (
        <g>
          {(() => {
            const cols = Math.max(3, Math.round(w / 62));
            const cw = (w - 44) / cols, chh = winH / storeys;
            return Array.from({length: cols * storeys}, (_, i) => {
              const col = i % cols, row = Math.floor(i / cols);
              const wx = x + 22 + col * cw + cw * 0.22, wy = winTop + row * chh + chh * 0.2;
              const ww = cw * 0.56, wh = chh * 0.58;
              return (
                <g key={i}>
                  <rect x={wx - 4} y={wy - 9} width={ww + 8} height={9} fill={shade(wall, -2)} stroke={INK} strokeWidth={1.8} />
                  <rect x={wx} y={wy} width={ww} height={wh} fill={glass} stroke={INK} strokeWidth={2.2} />
                  <line x1={wx + ww * 0.5} y1={wy} x2={wx + ww * 0.5} y2={wy + wh} stroke={INK} strokeWidth={1.8} opacity={0.85} />
                  <line x1={wx} y1={wy + wh * 0.46} x2={wx + ww} y2={wy + wh * 0.46} stroke={INK} strokeWidth={1.8} opacity={0.85} />
                  <rect x={wx - 5} y={wy + wh} width={ww + 10} height={7} fill={shade(wall, -1)} stroke={INK} strokeWidth={1.8} />
                </g>
              );
            });
          })()}
        </g>
      ) : (
        <UnitWall x={x + 22} y={winTop} w={w - 44} h={winH} cols={Math.max(3, Math.round(w / 62))} rows={storeys}
          handle={false} fill={glass} carcass={wall} />
      )}
      {/* string course between storeys, and a fire escape on one front in three */}
      {rnd(seed * 11) > 0.62 && (
        <g stroke={INK} strokeWidth={STROKE_THIN * 0.8} fill="none" opacity={0.85}>
          {Array.from({length: storeys}, (_, i) => (
            <rect key={i} x={x + 26} y={winTop + ((i + 1) * winH) / storeys - 16} width={w - 52} height={12}
              fill={shade(wall, -2)} />
          ))}
          <line x1={x + w * 0.5} y1={winTop} x2={x + w * 0.5} y2={winTop + winH} />
        </g>
      )}
      {/* fascia sign */}
      <rect x={x + 8} y={fasciaY} width={w - 16} height={64} fill={shade(wall, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* The fascia is the one thing on a shopfront a viewer reads (item 3). */}
      {sign
        ? <InkWords x={x + 34} y={fasciaY + 14} w={w - 68} h={34} text={sign} fill={PAPER_WHITE} align="center" />
        : <SerifWords x={x + 34} y={fasciaY + 20} w={w - 68} h={24} words={2} seed={seed * 5} fill={PAPER_WHITE} />}
      {/* awning + shopfront */}
      <RibbedPanel x={x + 8} y={fasciaY + 64} w={w - 16} h={40} ribs={Math.max(5, Math.round(w / 46))} dir="v" fill={c.accent} />
      <Glazing x={x + 26} y={fasciaY + 116} w={w - 176} h={baseY - fasciaY - 116} bays={2} rows={2}
        pane={glass} sill={false} />
      <rect x={x + w - 134} y={fasciaY + 116} width={104} height={baseY - fasciaY - 116} fill={shade(wall, -2)}
        stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x + w - 118} y={fasciaY + 136} width={72} height={56} fill={glass} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <circle cx={x + w - 46} cy={baseY - 66} r={8} fill={INK} />
      {/* step up to the door */}
      <rect x={x + w - 146} y={baseY - 22} width={128} height={12} fill={shade(wall, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
    </g>
  );
};

/** A saloon car in profile. The only vehicle bespoke to the six. */
const Car: React.FC<{x: number; y: number; s?: number; facing?: number; body?: string}> =
({x, y, s = 1, facing = 1, body}) => {
  const tn = useSceneTones();
  const paint = body ?? tn.card;
  return (
    <g transform={`translate(${x} ${y}) scale(${s * facing} ${s})`}>
      <path d="M -190 0 L -190 -46 Q -186 -62 -150 -66 L -96 -104 Q -84 -114 -60 -114 L 44 -114
               Q 68 -114 82 -100 L 128 -66 Q 178 -62 186 -46 L 186 0 Z"
        fill={paint} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M -88 -70 L -46 -104 L -8 -104 L -8 -70 Z" fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <path d="M 8 -70 L 8 -104 L 40 -104 L 74 -70 Z" fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <line x1={-8} y1={-70} x2={-8} y2={-46} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <rect x={-186} y={-40} width={34} height={12} rx={5} fill={PAPER_WHITE} stroke={INK} strokeWidth={2.4} />
      <rect x={152} y={-40} width={34} height={12} rx={5} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={2.4} />
      {[-116, 112].map((wx, i) => (
        <g key={i}>
          <circle cx={wx} cy={0} r={40} fill={INK} />
          <circle cx={wx} cy={0} r={15} fill={tn.card} />
        </g>
      ))}
    </g>
  );
};

const CityStreet: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2). QA's clearest single symptom was this template: "t001 f105 ~ t168 f29354 —
  // the opening and the closing shot are the same frame", Δ1.58 across sixteen minutes. The street
  // now varies its skyline, its frontage seeds, how busy the pavement is, and where the hero walks.
  const tk = useTake();
  const v = useVary();
  // PERIOD (WO-27): the frontage survives intact — awnings, fascia signs, sash windows over a
  // shopfront and a gas standard on the kerb are a Victorian high street already. The ROAD is what
  // dates it: lane markings, a zebra crossing, a traffic signal, a news box and three cars.
  const period = usePeriod();
  return (
    <Frame>
      {/* --- far: the block behind, lifted two rungs so it sits back without haze or a gradient.
          Its parapets stay ABOVE the near frontage's, so it reads as taller towers further off. --- */}
      <BuildingBand baseY={560} x0={-60} x1={1990} n={7 + v.pick(1, 3)} seed={v.seed(41)} depth={2} minH={300} maxH={520} opacity={0.6} />
      {/* --- the street-level frontage. Parapets vary so the row has a skyline of its own, and every
          one of them leaves sky above: `daylight` is the only key of the six that gets any. --- */}
      <Facade x={-30} w={430} topY={214 + v.off(2, 30)} baseY={STREET_KERB} seed={v.seed(2)} />
      <Facade x={396} w={380} topY={158 + v.off(3, 26)} baseY={STREET_KERB} seed={v.seed(7)}
        sign={label(tk, 'masthead', 7)} />
      <Facade x={772} w={452} topY={252 + v.off(4, 30)} baseY={STREET_KERB} seed={v.seed(4)} />
      <Facade x={1220} w={396} topY={182 + v.off(5, 26)} baseY={STREET_KERB} seed={v.seed(9)}
        sign={label(tk, 'headline', 9)} />
      <Facade x={1612} w={350} topY={286 + v.off(6, 26)} baseY={STREET_KERB} seed={v.seed(6)} />

      {/* --- pavement, kerb, road --- */}
      <rect x={0} y={STREET_KERB} width={1920} height={STREET_ROAD - STREET_KERB} fill={tn.card}
        stroke={INK} strokeWidth={STROKE_THIN} />
      {Array.from({length: 15}, (_, i) => (
        <line key={i} x1={i * 132} y1={STREET_KERB} x2={i * 132 - 26} y2={STREET_ROAD} stroke={INK} strokeWidth={2} opacity={0.35} />
      ))}
      <SlabFloor y={STREET_ROAD} cols={12} rows={6} fill={tn.deep} opacity={0.18} farBand={false} />
      {/* lane markings, a crossing and two manhole covers — the road was the emptiest region of the
          first render, and a road is not a plain slab */}
      {/* lane markings and a crossing. PERIOD: neither exists, so the road is laid in GRANITE SETTS
          instead — courses of small stones, which is denser than the paint it replaces (flat fill
          counts right-neighbour equality, and a sett course is nothing but vertical joints) and is
          what a nineteenth-century carriageway is actually made of. */}
      {period ? (
        <g stroke={INK} strokeWidth={2} opacity={0.3}>
          {Array.from({length: 6}, (_, r) => {
            const ry = STREET_ROAD + 18 + r * r * 8 + r * 22;
            const step = 46 + r * 12;
            return (
              <g key={r}>
                <line x1={0} y1={ry} x2={1920} y2={ry} />
                {Array.from({length: Math.ceil(1920 / step)}, (_, k) => (
                  <line key={k} x1={k * step + (r % 2 ? step / 2 : 0)} y1={ry}
                    x2={k * step + (r % 2 ? step / 2 : 0)} y2={ry + step * 0.5} />
                ))}
              </g>
            );
          })}
        </g>
      ) : (
        <g fill={PAPER_WHITE} opacity={0.75}>
          {Array.from({length: 8}, (_, i) => <rect key={i} x={40 + i * 250} y={992 + i * 3} width={140} height={14} rx={7} />)}
          {Array.from({length: 7}, (_, i) => (
            <rect key={'z' + i} x={1300 + i * 88} y={STREET_ROAD + 6} width={52} height={74} />
          ))}
        </g>
      )}
      {[[300, 916], [1096, 950]].map(([mx, my], i) => (
        <g key={i}>
          <ellipse cx={mx} cy={my} rx={48} ry={16} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <ellipse cx={mx} cy={my} rx={32} ry={10} fill="none" stroke={INK} strokeWidth={2} opacity={0.6} />
        </g>
      ))}

      {/* --- deep plane: pedestrians on the pavement.
          The first render put a `CrowdHeads` mass here and the heads read as a mound of small people
          sitting on the kerb — heads-only works against a WALL, not on an open pavement. Two full
          `CrowdRow`s at different scales carry the same depth honestly. --- */}
      <CrowdRow y={716} x0={70} x1={1860} n={11 + v.pick(7, 5)} scale={0.42} seed={v.seed(5)} dz={10} alive={0.15} />
      <CrowdRow y={744} x0={160} x1={1500} n={6 + v.pick(8, 3)} scale={0.54} seed={v.seed(23)} dz={12} />
      <Fence x0={1580} x1={1920} y={806} h={62} posts={8} opacity={0.5} />

      {/* --- street furniture --- */}
      {[250, 1040, 1780].map((lx, i) => (
        <g key={i}>
          <rect x={lx - 9} y={STREET_KERB - 372} width={18} height={372} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <path d={`M ${lx} ${STREET_KERB - 372} q 0 -34 42 -34`} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.4} />
          <rect x={lx + 26} y={STREET_KERB - 412} width={54} height={20} rx={8} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <ellipse cx={lx} cy={STREET_KERB} rx={22} ry={7} fill={INK} opacity={0.35} />
        </g>
      ))}
      {/* traffic signal + a litter bin + a news box. The signal CHANGES — one of three 15px lamps
          lit at a time, on a ~4s cycle — which is a colour switch with no moving geometry at all. */}
      {/* PERIOD: an advertising COLUMN where the signal stood — a drum of pasted bills on the same
          kerb spot under a conical cap, which is the Victorian street's own version of a thing that
          stands at head height and tells you something. The signal's colour switch is the one piece
          of motion this swap costs the template; the car/cart and the crowd carry the rest. */}
      {period ? (
        <g>
          <rect x={1440} y={STREET_KERB - 300} width={80} height={300} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} />
          {[0, 1].map((i) => (
            <g key={i}>
              <rect x={1448} y={STREET_KERB - 288 + i * 148} width={64} height={136} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
              <SerifWords x={1456} y={STREET_KERB - 276 + i * 148} w={48} h={16} words={1} seed={7 + i * 5} />
              <TextLines x={1456} y={STREET_KERB - 246 + i * 148} w={48} n={5} gap={13} th={3.4} seed={9 + i * 7} opacity={0.6} />
            </g>
          ))}
          <path d={`M 1428 ${STREET_KERB - 300} L 1532 ${STREET_KERB - 300} L 1480 ${STREET_KERB - 356} Z`}
            fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
          <circle cx={1480} cy={STREET_KERB - 364} r={10} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ) : (
        <g>
          <rect x={1470} y={STREET_KERB - 402} width={18} height={402} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <rect x={1442} y={STREET_KERB - 470} width={74} height={132} rx={12} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
          {[0, 1, 2].map((i) => {
            const lit = [0, 2, 1][Math.floor(f / 118) % 3];
            const off = shade(tn.deep, -1);
            return (
              <circle key={i} cx={1479} cy={STREET_KERB - 440 + i * 40} r={15}
                fill={i !== lit ? off : i === 0 ? c.accent : i === 1 ? shade(c.accent, 2) : PAPER_WHITE} />
            );
          })}
        </g>
      )}
      <RibbedPanel x={634} y={STREET_KERB - 96} w={78} h={96} ribs={5} dir="v" fill={tn.body} />
      <rect x={626} y={STREET_KERB - 106} width={94} height={14} rx={6} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {/* the news box. PERIOD: a NEWSVENDOR'S STAND on the same spot — a painted board on trestle
          legs with the day's sheets weighted on it, and the accent stays on the board so the kerb
          keeps its saturated note. */}
      {period ? (
        <g>
          <rect x={1152} y={STREET_KERB - 96} width={100} height={22} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={1160} y={STREET_KERB - 118} width={84} height={26} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={1168} y={STREET_KERB - 112} w={68} n={2} gap={10} th={3.2} seed={4} opacity={0.6} />
          <g stroke={INK} strokeWidth={STROKE_THIN}>
            <line x1={1160} y1={STREET_KERB - 74} x2={1150} y2={STREET_KERB} />
            <line x1={1244} y1={STREET_KERB - 74} x2={1254} y2={STREET_KERB} />
            <line x1={1156} y1={STREET_KERB - 40} x2={1248} y2={STREET_KERB - 40} />
          </g>
        </g>
      ) : (
        <g>
          <rect x={1156} y={STREET_KERB - 124} width={92} height={124} rx={8} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={1172} y={STREET_KERB - 108} width={60} height={44} fill={PAPER_WHITE} stroke={INK} strokeWidth={2.4} />
          <TextLines x={1178} y={STREET_KERB - 100} w={48} n={3} gap={11} th={3} seed={4} opacity={0.6} />
        </g>
      )}
      <BoxStack x={890 + v.off(9, 70)} baseY={STREET_KERB} n={1 + v.pick(10, 3)} s={0.5} seed={v.seed(11)} />
      <CaseStack x={1330 + v.off(11, 60)} baseY={STREET_KERB} n={2 + v.pick(12, 3)} s={0.6} seed={v.seed(13)} />

      {/* --- road traffic. Drawn far-to-near so a nearer car occludes the one behind it.
          The NEAR car DRIVES (WO-14): it runs the near lane right-to-left and wraps round off frame,
          so the street always has something crossing it. It is a single 380-unit object, so it only
          ever touches two or three motion-locality cells at a time — the opposite of moving the road
          under it. The near lane is the only one it can use: it is drawn last, so passing the two
          parked cars occludes them, which is what a nearer lane should do. Any of the parked lanes
          would have driven one car straight THROUGH another. The wrap constant puts it at exactly
          its old x at frame 0, so the composition is unchanged in a still.

          THE PARKED LANES MOVED UP THE ROAD (QA_WATCH item 12: "two cars stacked on top of each
          other at the kerb", t074 f12576, t168 f29354). The three lanes were 946 / 968 / 1064 with
          the near car at s=1.0, and a car at that scale is ~120 units tall — so the near car's ROOF
          landed at 944 and the near parked car's WHEELS at 946, tangent to within two units. Twice
          a wrap the driving car passed under a parked one and the two read as one stacked on the
          other. Widening the OVERLAP instead was tried first and is worse: at y=1004 the near car
          swallows the parked one whole and leaves a sliver of roof poking out of its roof, which
          reads as a drawing error rather than as depth.
          The lanes now separate in the two quantities that carry distance in a flat frame — ground-y
          and scale — so the far lane is unambiguously FURTHER UP THE ROAD rather than directly
          behind: 910 at s=0.5 and 936 at s=0.60, leaving ~34 units of road between the near car's
          roof and the far car's wheels at the worst phase. Both stay clear of STREET_ROAD (858). --- */}
      {/* PERIOD: the same three lanes, drawn as DRAYS. The near one keeps the identical wrap
          arithmetic, so the travelling object — this template's whole camera-lock argument — is
          unchanged in size, speed and phase; only what it is made of changes. */}
      {period ? (
        <g>
          <HandCart x={430 + v.off(13, 90)} y={910} s={0.5} facing={1} body={shade(tn.body, -1)} />
          <HandCart x={1500 + v.off(14, 90)} y={936} s={0.6} facing={-1} body={tn.card} />
          <HandCart x={2200 - ((f * 13 + 1320) % 2600)} y={1064} s={1.0} facing={-1} body={shade(tn.card, -1)} />
        </g>
      ) : (
        <g>
          <Car x={430 + v.off(13, 90)} y={910} s={0.5} facing={1} body={shade(tn.body, -1)} />
          <Car x={1500 + v.off(14, 90)} y={936} s={0.6} facing={-1} body={tn.card} />
          <Car x={2200 - ((f * 13 + 1320) % 2600)} y={1064} s={1.0} facing={-1} body={c.accent} />
        </g>
      )}
      <Cone x={1698} y={1010} s={0.8} />
      <Cone x={1790} y={1024} s={0.8} />

      {/* --- near plane: the coloured hero walking the pavement, right of the caption card.
          The first render put two `view="back"` crowd figures beside him at scale 0.96; a DIM figure
          from behind has no face and no costume detail, so at hero scale they read as two grey
          boulders. Profile at a smaller scale reads as people. --- */}
      <StickFigure pose={A.walk(f, fps)} x={CAPTION_SAFE_X + 300 + v.off(15, 70)} y={702} scale={1.02} facing={1}
        view="profile" expr={FACES.cold} pal={LIGHT} briefcase frame={f} seed={7.11} />
      <CrowdRow y={730} x0={1390} x1={1660} n={2 + v.pick(16, 2)} scale={0.78} seed={v.seed(17)} dz={8} view="profile" facing={-1} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 5. domesticInterior — a home room: sofa/table, lamp, window, pictures, domestic clutter
//
// Keyed `interior` — the bible's own description of that key is "enclosed, lamp-lit, wooden, dark",
// which is a living room exactly. The reference's domestic frames (depression montage 10:10) are a
// small room seen head-on with a window, a couple, and very little floor: the density lives in the
// wall and the furniture, not in the plane.
// ---------------------------------------------------------------------------
const HOME_WALL = 792;

/**
 * A three-seat sofa, head-on: base, back, arms, cushions, feet.
 *
 * IT DRAWS IN TWO PARTS, AND THE PEOPLE GO BETWEEN THEM (QA_WATCH item 12: "t007 f1523: the seated
 * men's legs pass through the sofa front"). A sitter is in front of the back cushions and BEHIND the
 * seat and the arms; drawn as one object before the figures, the sofa could only ever be entirely
 * behind them, so their thighs and shins were painted straight over its seat slab. This is the same
 * fix the boardroom chairs got, in the form a single drawn object needs:
 *
 *   `part="back"`  — back panel, back cushions. Drawn BEFORE the figures.
 *   `part="front"` — arms, seat slab, accent cushion, feet. Drawn AFTER them, so it occludes laps.
 *   `part="all"`   — both, in the original order. The default, so any other caller is unchanged.
 *
 * The two parts share every coordinate because they are computed from the same props; a caller that
 * draws one must draw the other with identical arguments.
 */
const Sofa: React.FC<{x: number; y: number; w?: number; h?: number; fill?: string;
                      part?: 'all' | 'back' | 'front'}> =
({x, y, w = 720, h = 210, fill, part = 'all'}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const skin = fill ?? shade(tn.body, 2);
  const armW = w * 0.13;
  return (
    <g>
      {part !== 'front' && (
        <g>
          {/* back first, then (in the front part) arms and seat over it */}
          <rect x={x + armW * 0.5} y={y - h} width={w - armW} height={h * 0.86} rx={20} fill={skin}
            stroke={INK} strokeWidth={STROKE} />
          {Array.from({length: 3}, (_, i) => (
            <rect key={i} x={x + armW * 0.7 + i * ((w - armW * 1.4) / 3)} y={y - h + 14}
              width={(w - armW * 1.4) / 3 - 12} height={h * 0.6} rx={14} fill={shade(skin, 1)}
              stroke={INK} strokeWidth={STROKE_THIN} />
          ))}
        </g>
      )}
      {part !== 'back' && (
        <g>
          <rect x={x} y={y - h * 0.62} width={armW} height={h * 0.68} rx={16} fill={shade(skin, -1)} stroke={INK} strokeWidth={STROKE} />
          <rect x={x + w - armW} y={y - h * 0.62} width={armW} height={h * 0.68} rx={16} fill={shade(skin, -1)} stroke={INK} strokeWidth={STROKE} />
          <rect x={x + armW * 0.4} y={y - h * 0.3} width={w - armW * 0.8} height={h * 0.34} rx={12} fill={shade(skin, -2)}
            stroke={INK} strokeWidth={STROKE} />
          {/* one accent cushion — the scene's single saturated note */}
          <rect x={x + w - armW * 2.1} y={y - h * 0.78} width={armW * 0.86} height={armW * 0.86} rx={10}
            fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} transform={`rotate(-12 ${x + w - armW * 1.7} ${y - h * 0.5})`} />
          <rect x={x + 22} y={y + h * 0.04} width={18} height={26} fill={INK} />
          <rect x={x + w - 40} y={y + h * 0.04} width={18} height={26} fill={INK} />
        </g>
      )}
    </g>
  );
};

/** A standard lamp: base, stem, shade, and the flat pool of light it justifies. */
const FloorLamp: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <g>
      <ellipse cx={x} cy={y} rx={44 * s} ry={13 * s} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x - 6 * s} y={y - 330 * s} width={12 * s} height={330 * s} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <path d={`M ${x - 54 * s} ${y - 330 * s} L ${x + 54 * s} ${y - 330 * s} L ${x + 78 * s} ${y - 232 * s} L ${x - 78 * s} ${y - 232 * s} Z`}
        fill={c.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={x - 78 * s} y={y - 240 * s} width={156 * s} height={12 * s} fill={PAPER_WHITE} opacity={0.8} />
    </g>
  );
};

const DomesticInterior: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2). QA: "the pink living room appears essentially unchanged 6 times", and two of
  // those sittings were 2m50s apart at Δ0.19 — the single worst pair in the episode. What varies:
  // the paper's tone rung, the pictures on the wall, the roofline through the window, what is on the
  // shelves and tables, whether the second person is in the room at all, and where the pair sit.
  const v = useVary();
  // PERIOD (WO-27): papered walls over a dado, a curtained sash window, framed pictures, a bookcase,
  // a rug and a sofa are a parlour in any century after about 1830. ONE object dates the room — the
  // television on its low stand — and the standard lamp, which becomes an oil lamp by daylight.
  const period = usePeriod();
  // WHOSE scene this is, if the writer said (`cast=` on the scene record -> Video2's CastProvider).
  // 0 with no provider, which is every scene that existed before item 8.
  const sceneCast = React.useContext(CastContext);
  return (
    <Frame>
      {/* --- wall: papered above a dado rail, panelled below.
          The paper carries a small repeated motif as well as its stripe: a flat wall is the single
          largest region in a head-on domestic frame, and the reference's rooms are papered. --- */}
      <rect x={0} y={0} width={1920} height={470} fill={shade(tn.panel, v.rung(0, 1))} />
      {Array.from({length: 25}, (_, i) => (
        <line key={i} x1={i * 78} y1={0} x2={i * 78} y2={470} stroke={INK} strokeWidth={2} opacity={0.16} />
      ))}
      <g opacity={0.2} fill="none" stroke={INK} strokeWidth={2.4}>
        {Array.from({length: 100}, (_, i) => {
          const col = i % 25, row = Math.floor(i / 25);
          const mx = 39 + col * 78, my = 58 + row * 116;
          return <path key={i} d={`M ${mx} ${my - 15} q 15 15 0 30 q -15 -15 0 -30 Z`} />;
        })}
      </g>
      <rect x={0} y={462} width={1920} height={22} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={0} y={HOME_WALL - 44} width={1920} height={44} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the window, curtained, with the neighbouring roofline through it */}
      <rect x={706} y={168} width={508} height={356} fill={shade(c.bg, 3)} />
      <BuildingBand baseY={524} x0={712} x1={1210} n={3 + v.pick(2, 3)} seed={v.seed(19)} depth={1} minH={110} maxH={190} opacity={0.8} />
      <Glazing x={706} y={168} w={508} h={356} bays={2} rows={2} pane={null} />
      {[660, 1218].map((cx, i) => (
        <path key={i} d={`M ${cx} 140 L ${cx + (i ? 60 : -60)} 140 L ${cx + (i ? 74 : -74)} 560 L ${cx + (i ? -6 : 6)} 560 Z`}
          fill={c.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      ))}
      <rect x={640} y={128} width={640} height={22} rx={9} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* pictures, a clock and a shelf of books */}
      <WallFrame x={168 + v.off(3, 30)} y={192} w={302} h={216} art={v.one(4, ['scape', 'line', 'bars'] as const)} seed={v.seed(3)} />
      <WallFrame x={196} y={444} w={124} h={150} art="head" seed={v.seed(5)} />
      <WallFrame x={344} y={444} w={124} h={150} art={v.one(6, ['head', 'head', 'scape'] as const)} seed={v.seed(8)} />
      <WallFrame x={1436} y={210} w={190} h={150} art={v.one(7, ['scape', 'head', 'line'] as const)} seed={v.seed(11)} />
      <circle cx={1720} cy={256} r={62} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
      <line x1={1720} y1={256} x2={1748} y2={272} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <ClockHand cx={1720} cy={256} r={44} f={f} />
      {/* a bookcase is a UnitWall without handles, plus spines */}
      <UnitWall x={1420} y={412} w={392} h={344} cols={1} rows={4} handle={false} />
      {Array.from({length: 44}, (_, i) => {
        const col = i % 11, row = Math.floor(i / 11);
        return <rect key={i} x={1442 + col * 32} y={432 + row * 86} width={24} height={54 + rnd(v.seed(i * 5)) * 12}
          fill={rnd(v.seed(i * 3)) > 0.78 ? c.accent : shade(tn.card, -(i % 3))}
          stroke={INK} strokeWidth={2.6} />;
      })}
      {/* radiator under the window */}
      <RibbedPanel x={780} y={608} w={352} h={140} ribs={11} dir="v" />

      {/* --- floor: boards, and a bordered rug the furniture stands on --- */}
      <SlabFloor y={HOME_WALL} cols={30} rows={7} />
      <path d="M 250 962 L 1670 962 L 1830 1080 L 90 1080 Z" fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 300 992 L 1620 992 L 1740 1064 L 180 1064 Z" fill="none" stroke={INK} strokeWidth={STROKE_THIN} opacity={0.7} />
      {Array.from({length: 10}, (_, i) => (
        <rect key={i} x={330 + i * 132} y={1006} width={78} height={50} fill={c.accent} opacity={0.5}
          transform={`skewX(${-6})`} />
      ))}

      {/* --- furniture --- */}
      <FloorLamp x={1268 + v.off(8, 60)} y={834} s={0.9 + v.pick(9, 3) * 0.05} />
      <Plant x={106} y={856} s={0.9 + v.pick(10, 3) * 0.05} seed={v.seed(4)} />
      <BoxStack x={1830} baseY={866} n={1 + v.pick(11, 3)} s={0.62} seed={v.seed(7)} />
      {/* a side table with a table lamp and a stack of post, left of the sofa */}
      <Desk x={392} y={806} w={150} h={22} legH={78} fill={shade(tn.card, -1)} />
      <Papers x={452} y={798} n={1 + v.pick(12, 3)} s={0.5} seed={v.seed(29)} />
      <Sofa x={560} y={880} w={720} h={214} part="back" />
      {/* the coffee table and what is on it */}
      <Desk x={700} y={936} w={452} h={26} legH={96} fill={shade(tn.card, -1)} />
      <Papers x={800 + v.off(13, 70)} y={928} n={2 + v.pick(14, 3)} s={0.62} seed={v.seed(13)} />
      <rect x={996} y={906} width={44} height={34} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <path d="M 1040 914 q 22 8 0 18" fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <rect x={1064} y={914} width={78} height={22} rx={5} fill={tn.body} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* an armchair on the right, and the television it faces on its own low stand */}
      <Chair x={1620 + v.off(15, 50)} y={962} s={1.0} facing={-1} fill={shade(tn.body, 1)} />
      <Desk x={168} y={916} w={330} h={24} legH={96} fill={shade(tn.card, -2)} />
      {/* the television. PERIOD: the same low stand carries a framed picture propped against the
          wall with a pair of candlesticks either side of it — a parlour's mantel arrangement, and
          the same block of drawn shapes at the same place in the composition. */}
      {period ? (
        <g>
          <WallFrame x={214} y={716} w={250} h={192} art="scape" seed={17} />
          {[186, 480].map((cx, i) => (
            <g key={i}>
              <rect x={cx - 8} y={800} width={16} height={104} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
              <ellipse cx={cx} cy={904} rx={26} ry={9} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
              <path d={`M ${cx} 800 q -10 -26 0 -40 q 10 14 0 40 Z`} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
            </g>
          ))}
        </g>
      ) : (
        <Monitor x={196} y={712} w={286} h={196} content={v.one(16, ['text', 'chart', 'grid'] as const)} seed={v.seed(17)} />
      )}
      {/* a dropped newspaper on the boards, and the day's post on the floor by the door */}
      <Papers x={1420 + v.off(17, 90)} y={1046} n={1 + v.pick(18, 3)} s={1.0} seed={v.seed(33)} />

      {/* --- the people. BOTH in colour: the reference's domestic frames run a coloured couple
          (depression montage 10:10), which is the one place the grey-crowd rule is relaxed. --- */}
      <StickFigure pose={A.sit(f)} x={CAPTION_SAFE_X + 250 + v.off(19, 46)} y={858} scale={1.06} facing={-1} view="front"
        expr={FACES.worried} pal={LIGHT} frame={f} idle="gesture" />
      {/* the second of the pair used to be frozen at frame 0, which read as a mannequin sitting next
          to a living person. It breathes and shifts on its own seed — one figure, two adjacent cells.
          WHETHER HE IS THERE AT ALL is the take's (item 2): a room with one person in it and a room
          with two are different scenes, and this is a domestic interior where "alone" is a beat the
          format actually plays. The sofa keeps the footprint either way. */}
      {v.pick(20, 4) !== 0 && (
        // ...and WHO he is, is the other half of it (QA_WATCH item 8). Both figures took the episode's
        // single wardrobe, so t007/t043/t117/t133/t143 seated the SAME black-haired man in the same
        // navy suit next to himself — read by QA as a cloning bug, not as two people. He takes the
        // slot AFTER whoever this scene is about rather than a hardcoded 1: with no `cast=` on the
        // scene that is slot 1, exactly as before; on a scene that names its subject (`cast=1`, Peter
        // Madoff) it steps to 2 instead of re-cloning the subject, which is the same defect back.
        <StickFigure pose={A.sit(f + 47)} x={740 + v.off(21, 40)} y={858} scale={1.02} facing={1} view="front"
          cast={companionCast(sceneCast)}
          expr={FACES.tired} pal={LIGHT} frame={f} />
      )}
      {/* THE SOFA'S FRONT, OVER THEIR LAPS (QA_WATCH item 12). Identical arguments to the `back`
          call above — a sitter is in front of the back cushions and behind the seat and the arms,
          and drawing the whole sofa before the figures could only ever put it entirely behind them,
          which is why their legs came through its seat slab at t007 f1523. */}
      <Sofa x={560} y={880} w={720} h={214} part="front" />
      <Plant x={1866} y={1060} s={1.1 + v.pick(22, 3) * 0.05} seed={v.seed(9)} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 6. newsMontage — the §6.7 device: scattered, slightly rotated newspaper/document cutouts with
//    serif headline blocks (docs/research/crayon/frames/wolf_montage_verified.jpg, 15:02).
//
// Keyed `interior`, not `grey`. The reference's own montage cell lays the cuttings on a WARM dark
// ground (wolf_montage_verified.jpg, 15:02), and measured, the `grey` key put this template at 17
// rich colours — a white/black/grey frame has almost no palette at all. `interior` gives it a brown
// ground, a tan newsprint stock and an amber accent for the flashes, and the archive/records reading
// ("enclosed, lamp-lit, wooden, dark") fits a document pile as well as bureaucracy does.
//
// Every sheet is STATIC and rotated by a fixed seeded angle — there is no drift, no flutter and no
// per-frame anything in this template at all, which makes it the strictest camera-lock case of the
// six (all 48 motion cells read exactly 0.0).
//
// WO-14 LEFT IT THAT WAY, deliberately, while animating the other five. There is nothing in a pile
// of cuttings that plausibly moves, and the only elements big enough to register on the
// frame-difference metric are the cuttings themselves — a 600×700 sheet drifting or rocking spans
// four to eight motion-locality cells, which is the "whole element spanning most of the frame"
// failure with a paper texture on it. The bible also wants shots like this: ~40% of the reference's
// frames are completely motionless, and a document montage is exactly the shot type that holds. So
// this template stays at 48/48 and 100% motionless, and the frames that move live elsewhere.
// ---------------------------------------------------------------------------

/** One cutting: masthead, rules, headline, a photo box with a flat portrait or chart, and columns. */
const NewsSheet: React.FC<{
  x: number; y: number; w: number; h: number; rot: number; seed: number;
  photo?: 'head' | 'chart' | 'none'; stock?: string; flash?: boolean;
  /** QA_WATCH item 3 — the two things on a cutting a viewer actually tries to read. */
  masthead?: string; headline?: string;
}> = ({x, y, w, h, rot, seed, photo = 'head', stock, flash = false, masthead, headline}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  // Newsprint is CREAM, not white (WO-20). The default was PAPER_WHITE, and because three of the six
  // cuttings took it, roughly a quarter of the frame was a colour with no saturation at all — which
  // is most of why `newsMontage` measured 0.219 mean saturation on a fully-keyed brown ground while
  // the reference's own cuttings frame (frames/wolf_montage_verified.jpg, 15:02) is cream on dark.
  // The white anchor the bible's office frame calls for is kept, but as ONE hero cutting that asks
  // for it by name rather than as the default every sheet falls into.
  const paper = stock ?? shade(tn.card, TONE_MAX_STEP);
  const pad = w * 0.06;
  const iw = w - pad * 2;
  const photoH = photo === 'none' ? 0 : h * 0.3;
  const colTop = y + h * 0.44 + photoH * 0.1;
  const cols = 3;
  const colW = (iw - 26) / cols;
  return (
    <g transform={`rotate(${rot} ${x + w / 2} ${y + h / 2})`}>
      <rect x={x} y={y} width={w} height={h} fill={paper} stroke={INK} strokeWidth={STROKE} />
      {/* masthead + the two rules that bracket it. A `flash` puts the accent across the top corner,
          which is what a front page does and the one place this template gets saturated colour. */}
      {flash && <rect x={x} y={y} width={w} height={h * 0.038} fill={c.accent} />}
      {/* MASTHEAD — real lettering (item 3). This template is 19 scenes of the madoff episode and QA
          found it "nothing but black rectangles standing in for words across seven documents",
          landing hardest on the beats that are ABOUT documents. */}
      {masthead
        ? <InkWords x={x + pad} y={y + h * 0.045} w={iw} h={h * 0.075} text={masthead} />
        : <SerifWords x={x + pad} y={y + h * 0.06} w={iw} h={h * 0.062} words={2} seed={seed} />}
      <line x1={x + pad} y1={y + h * 0.152} x2={x + w - pad} y2={y + h * 0.152} stroke={INK} strokeWidth={5} />
      <line x1={x + pad} y1={y + h * 0.172} x2={x + w - pad} y2={y + h * 0.172} stroke={INK} strokeWidth={2.5} />
      {/* dateline strip under the rules */}
      <TextLines x={x + pad} y={y + h * 0.186} w={iw * 0.5} n={1} gap={10} th={3.4} seed={seed * 2} opacity={0.5} />
      {/* headline: three ragged lines of set type, at body-copy weight rather than as censor bars —
          at h*0.055 with 3 words per line the first render read as redaction, not as type */}
      {/* HEADLINE — real lettering over one or two lines, with ONE ragged glyph line under it so the
          cutting still reads as a page of type rather than as a title card. Body copy below stays
          glyphs: that is the split QA asked for, and it is what the reference cuttings do. */}
      {headline ? (
        <g>
          {(() => {
            const ws = headline.split(' ');
            const ls = ws.length > 1 ? [ws[0], ws.slice(1).join(' ')] : ws;
            return ls.map((ln, i) => (
              <InkWords key={i} x={x + pad} y={y + h * (0.205 + i * 0.066)} w={iw} h={h * 0.058} text={ln} />
            ));
          })()}
          <SerifWords x={x + pad} y={y + h * 0.341} w={iw * 0.72} h={h * 0.042} words={3} seed={seed * 7} />
        </g>
      ) : (
        <g>
          <SerifWords x={x + pad} y={y + h * 0.215} w={iw} h={h * 0.042} words={4} seed={seed * 3} />
          <SerifWords x={x + pad} y={y + h * 0.278} w={iw} h={h * 0.042} words={4} seed={seed * 5} />
          <SerifWords x={x + pad} y={y + h * 0.341} w={iw * 0.72} h={h * 0.042} words={3} seed={seed * 7} />
        </g>
      )}
      {/* the picture */}
      {photo !== 'none' && (
        <g>
          <rect x={x + pad} y={y + h * 0.4} width={iw * 0.44} height={photoH} fill={tn.card}
            stroke={INK} strokeWidth={STROKE_THIN} />
          {photo === 'head' ? (
            <Portrait cx={x + pad + iw * 0.22} cy={y + h * 0.4 + photoH * 0.44} r={photoH * 0.22} />
          ) : (
            <g>
              {Array.from({length: 5}, (_, i) => {
                const bh = photoH * (0.25 + rnd(seed * 29 + i) * 0.6);
                return <rect key={i} x={x + pad + 12 + i * ((iw * 0.44 - 24) / 5)} y={y + h * 0.4 + photoH - 8 - bh}
                  width={(iw * 0.44 - 24) / 5 - 7} height={bh} fill={i === 4 ? c.accent : tn.body}
                  stroke={INK} strokeWidth={2.2} />;
              })}
            </g>
          )}
          {/* caption under the picture */}
          <TextLines x={x + pad} y={y + h * 0.4 + photoH + 12} w={iw * 0.44} n={2} gap={11} th={3.4} seed={seed * 5} opacity={0.7} />
        </g>
      )}
      {/* body columns, with rules between them */}
      {Array.from({length: cols}, (_, k) => {
        const cx = x + pad + k * (colW + 13);
        const skip = photo !== 'none' && k < 2;
        const top = skip ? colTop + photoH + 34 : colTop;
        const lines = Math.max(3, Math.floor((y + h - pad - top) / 13));
        return (
          <g key={k}>
            <TextLines x={cx} y={top} w={colW} n={lines} gap={13} th={3.6} seed={seed * 11 + k} opacity={0.72} />
            {k < cols - 1 && <line x1={cx + colW + 6} y1={colTop} x2={cx + colW + 6} y2={y + h - pad}
              stroke={INK} strokeWidth={2} opacity={0.4} />}
          </g>
        );
      })}
    </g>
  );
};

/**
 * One cutting being nudged and settling back (WO-24).
 *
 * `newsMontage` was the only explainer template that took no `frame` at all, and it measured a mean
 * |Δ| of EXACTLY 0.00 across every 5 Hz sample — a still photograph inside a 16-minute video. There
 * is no crowd here and no machinery, so the only objects big enough to cross the bible's whole-frame
 * |Δ| 1.0 threshold are the cuttings themselves.
 *
 * `pulse`, not `crossing`: it returns to 0 at BOTH ends, so the sheet drifts and settles back into
 * the staged composition instead of jumping back to a start position when the cycle restarts. The
 * amplitude is a couple of dozen units and a degree and a half — a hand pushing a paper aside, not
 * a sheet flying across the table, and it stays inside the cutting's own motion-locality cells.
 */
const Nudge: React.FC<{seed: number; cx: number; cy: number; children: React.ReactNode}> =
({seed, cx, cy, children}) => {
  const f = useCurrentFrame();
  const t = pulse(f, seed, 96, 34);
  if (t === 0) return <>{children}</>;
  return (
    <g transform={`translate(${t * 30} ${t * -19}) rotate(${t * 1.6} ${cx} ${cy})`}>{children}</g>
  );
};

const NewsMontage: React.FC = () => {
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2) and THE LETTERING (item 3). 19 scenes on one pile of cuttings; every sheet now
  // takes its seed, its stock and its picture from the scene, and the two things a viewer reads on a
  // cutting — the masthead and the headline — are real words.
  const tk = useTake();
  const v = useVary();
  // Stepped rather than drawn independently, so a fan of six cuttings is six different papers.
  const mast = labelRun(tk, 'masthead', 6, 3);
  const head = labelRun(tk, 'headline', 6, 9);
  return (
    <Frame>
      {/* the surface the cuttings lie on — a flat slab, not a vignette */}
      <rect x={0} y={0} width={1920} height={1080} fill={tn.deep} />
      <rect x={0} y={0} width={1920} height={132} fill={shade(tn.deep, -1)} />
      <rect x={0} y={948} width={1920} height={132} fill={shade(tn.deep, -1)} />
      {/* a scatter of loose sheets under the papers, so the pile has a floor of its own */}
      {[[210, 250, -19], [1690, 300, 15], [330, 880, 12], [1610, 900, -14], [960, 210, 6]].map(([sx, sy, r], i) => (
        <g key={i} transform={`rotate(${r} ${sx} ${sy})`}>
          <rect x={sx - 130} y={sy - 90} width={260} height={180} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
          <TextLines x={sx - 108} y={sy - 66} w={216} n={9} gap={15} th={4} seed={v.seed(i * 31)} opacity={0.5} />
        </g>
      ))}

      {/* --- the cuttings, laid back-to-front so the hero cutting sits on top.
          Stocks run across four rungs of newsprint tan plus ONE white hero sheet, because a pile of
          identical rectangles reads as one object however many outlines it carries — and because a
          pile of identical WHITE ones also has no colour in it (WO-20). --- */}
      <NewsSheet x={60} y={150 + v.off(1, 42)} w={512} h={628} rot={-15 + v.off(2, 10)} seed={v.seed(3)}
        photo={v.one(3, ['chart', 'head', 'none'] as const)} stock={shade(tn.card, 2)}
        masthead={mast[0]} />
      <NewsSheet x={1340} y={128 + v.off(4, 42)} w={512} h={628} rot={13 + v.off(5, 10)} seed={v.seed(9)}
        photo={v.one(6, ['head', 'chart', 'none'] as const)}
        masthead={mast[1]} headline={head[1]} />
      <NewsSheet x={706} y={72} w={470} h={556} rot={-4 + v.off(7, 8)} seed={v.seed(17)} photo="none" stock={tn.card}
        masthead={mast[2]} />
      <NewsSheet x={1176} y={330} w={470} h={556} rot={20 + v.off(8, 8)} seed={v.seed(19)} photo="none" stock={shade(tn.card, 1)} />
      <Nudge seed={5} cx={710} cy={732}>
        <NewsSheet x={430} y={402} w={560} h={660} rot={7 + v.off(9, 8)} seed={v.seed(5)}
          photo={v.one(10, ['head', 'chart'] as const)} stock={PAPER_WHITE} flash
          masthead={mast[3]} headline={head[3]} />
      </Nudge>
      <Nudge seed={44} cx={1300} cy={718}>
        <NewsSheet x={1000} y={368} w={600} h={700} rot={-6 + v.off(11, 4)} seed={v.seed(11)}
          photo={v.one(12, ['chart', 'head'] as const)} flash
          masthead={mast[4]} headline={head[4]} />
      </Nudge>
      {/* a torn strip and a clipped document, the two things a montage always has one of */}
      <g transform="rotate(21 1780 660)">
        <rect x={1636} y={556} width={290} height={208} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
        <InkWords x={1660} y={578} w={244} h={36} text={head[5]} />
        <TextLines x={1660} y={636} w={244} n={7} gap={15} th={4} seed={v.seed(29)} opacity={0.72} />
        <rect x={1660} y={556} width={44} height={22} fill={c.accent} />
      </g>
      <g transform="rotate(-16 200 830)">
        <rect x={68} y={716} width={278} height={224} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
        <InkWords x={94} y={738} w={228} h={32} text={mast[5]} />
        <TextLines x={94} y={794} w={228} n={8} gap={15} th={4} seed={v.seed(41)} opacity={0.72} />
        <rect x={276} y={700} width={26} height={58} rx={12} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.2} />
      </g>
    </Frame>
  );
};

// ===========================================================================
// WO-8h — SEVEN MORE ENVIRONMENTS.
//
// WHY. WO-13 built a full sample episode and compared it frame-by-frame against the reference
// (docs/research/crayon/COMPARISON.md). Writing, typography, camera, sound and per-frame art all
// reached reference standard; SCENE VARIETY did not, and it is the one a viewer experiences:
// "at the reference montages' own sampling density we show 4 distinct set-ups in 8 samples; both
// their montages show 8 of 8", and 69% of our 30-second samples repeat a room already seen. Six
// templates over 39 scenes is ~6 reuses each. These seven take the set to thirteen.
//
// COLOUR KEYS ARE PART OF THE FIX. COMPARISON MISS #7 is that the first six share only THREE keys,
// and MISS #5 that the set measures 0.209 mean saturation against the reference's 0.308-0.646. The
// first six never reach `gold` or `alarm` at all. These seven use both, so the thirteen now cover
// all five keys — see the SCENE_KEY_BY_TEMPLATE block in crayonStyle.ts for the per-template reason.
//
// Same rules as the first six, restated because each one has already been broken once in this
// project: flat vector with NO gradient anywhere (Chromium dithers every gradient it paints);
// nothing takes `frame` for whole-frame motion; localised element animation IS wanted, on a seeded
// MINORITY of a crowd and a few props, never a whole row across the frame; reuse setdressing.tsx
// before inventing; grey anonymous crowd + colour hero.
// ===========================================================================

// ---------------------------------------------------------------------------
// 7. bankExterior — institutional facade at street level: columns, stone, steps, signage, passers-by
//
// Keyed `gold`, and it is the first explainer template to reach that key. The reference's own
// institutional frontage (LuEcoqizj0o/thumb.png) is a stone block of regular bays, and the format
// hits this environment in two opposite moods — the institution at its height and the institution
// with a queue outside it. `gold` ("ceremony, money, applause, the good years") is the first; the
// second is what `crowdQueue` below is for, keyed `grey`. Splitting the moods across two templates
// rather than one desaturating template is what the reference does with its own facades.
//
// Composition: a portico between two solid wings, a splayed civic flight down to the plaza, and a
// skyline showing over the parapet. The colonnade is a DARK RECESS with columns in front of it, so
// the doors and the small queue on the steps sit inside a covered space rather than on a flat wall.
// ---------------------------------------------------------------------------
const BANK_STYLO = 762;   // top of the steps / bottom of the columns
const BANK_PLAZA = 902;   // plaza paving line

/** The bank's flag. The one animated thing in the frame's top third: a 150×62 unit cloth whose two
 *  free corners run on a slow sine, which can only ever touch the single motion-locality cell it
 *  sits in. Nothing else up there moves, and the mast does not. */
const Flag: React.FC<{x: number; y: number; f: number}> = ({x, y, f}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  const w1 = Math.sin(f * 0.075) * 9;
  const w2 = Math.sin(f * 0.075 + 1.9) * 9;
  return (
    <g>
      <rect x={x - 5} y={y} width={10} height={190} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <circle cx={x} cy={y - 8} r={9} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <path d={`M ${x + 4} ${y + 6} L ${x + 154} ${y + 10 + w1} L ${x + 154} ${y + 70 + w2} L ${x + 4} ${y + 66} Z`}
        fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
      <path d={`M ${x + 4} ${y + 26} L ${x + 154} ${y + 30 + w1 * 0.8}`} fill="none" stroke={PAPER_WHITE} strokeWidth={7} />
      <path d={`M ${x + 4} ${y + 46} L ${x + 154} ${y + 50 + w2 * 0.8}`} fill="none" stroke={PAPER_WHITE} strokeWidth={7} />
    </g>
  );
};

/** A run of stone balusters under a rail — the parapet of a civic building, and the cheapest honest
 *  density available on a skyline edge: forty small outlined shapes across the top of the frame. */
const Balustrade: React.FC<{x0: number; x1: number; y: number; h: number; n: number}> =
({x0, x1, y, h, n}) => {
  const tn = useSceneTones();
  const step = (x1 - x0) / n;
  return (
    <g>
      <rect x={x0 - 10} y={y + h} width={x1 - x0 + 20} height={16} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      {Array.from({length: n}, (_, i) => (
        <path key={i} d={`M ${x0 + i * step + step * 0.18} ${y}
                          L ${x0 + i * step + step * 0.82} ${y}
                          L ${x0 + i * step + step * 0.66} ${y + h * 0.5}
                          L ${x0 + i * step + step * 0.82} ${y + h}
                          L ${x0 + i * step + step * 0.18} ${y + h}
                          L ${x0 + i * step + step * 0.34} ${y + h * 0.5} Z`}
          fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.6} strokeLinejoin="round" />
      ))}
      <rect x={x0 - 10} y={y - 14} width={x1 - x0 + 20} height={16} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
    </g>
  );
};

/** One solid stone wing beside the portico: rusticated base, a grid of tall windows, a string course. */
const BankWing: React.FC<{x: number; w: number; topY: number; seed: number}> = ({x, w, topY, seed}) => {
  const tn = useSceneTones();
  const stone = shade(tn.card, rnd(seed) > 0.5 ? 0 : -1);
  return (
    <g>
      <rect x={x} y={topY} width={w} height={BANK_STYLO - topY} fill={stone} stroke={INK} strokeWidth={STROKE} />
      {/* rustication: the horizontal joints that stop a stone wall reading as a colour field */}
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.55} opacity={0.35}>
        {Array.from({length: 11}, (_, i) => (
          <line key={i} x1={x} y1={topY + ((i + 1) * (BANK_STYLO - topY)) / 12}
            x2={x + w} y2={topY + ((i + 1) * (BANK_STYLO - topY)) / 12} />
        ))}
      </g>
      {/* Tall windows set into the stone as recesses, each with SASH BARS over it and a sill under
          it. Without the bars each opening is one 130×270 void and a wing reads as three holes
          punched in a wall — the same "too few, too large" failure `cityStreet`'s Facade logged
          against storey-high shopfront panes. */}
      <UnitWall x={x + 34} y={topY + 78} w={w - 68} h={272} cols={3} rows={1}
        handle={false} fill={shade(tn.deep, -1)} carcass={shade(stone, -1)} />
      {Array.from({length: 3}, (_, i) => {
        const ow = (w - 68) / 3;
        const ox = x + 34 + i * ow;
        return (
          <g key={i}>
            <Glazing x={ox + 6} y={topY + 84} w={ow - 12} h={260} bays={2} rows={4} pane={null} sill={false} />
            <rect x={ox + 8} y={topY + 356} width={ow - 16} height={16}
              fill={shade(stone, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          </g>
        );
      })}
      <rect x={x - 6} y={topY + 400} width={w + 12} height={20} fill={shade(stone, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* a bronze plaque on the pier, which is the only signage a bank wing actually carries */}
      <rect x={x + w * 0.5 - 62} y={topY + 470} width={124} height={78} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <TextLines x={x + w * 0.5 - 46} y={topY + 492} w={92} n={4} gap={13} th={4} seed={seed * 3} opacity={0.65} />
    </g>
  );
};

const BankExterior: React.FC = () => {
  const f = useCurrentFrame();
  const {fps} = useVideoConfig();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2). The frieze over the portico is also the one piece of lettering on this
  // building anybody reads, so it carries real words (item 3).
  const tk = useTake();
  const v = useVary();
  // PERIOD (WO-27): a stone portico, a civic flight, balustrades and a newel lantern are the most
  // era-free exterior in the set — this frontage would be built the same way in 1844. Exactly two
  // things dated it: the PARKED CAR on the plaza (WO-26's own finding) and the glazed skyline behind
  // it, which the library's masonry band now handles.
  const period = usePeriod();
  return (
    <Frame>
      {/* --- the street the bank stands in. The frontage deliberately stops short of both frame
              edges: the first render ran the wings out to x=120/1800 and the only thing visible in
              the gutters was a sliver of the band behind, which read as horizontal stripes rather
              than as buildings. Two hundred units of gutter at each edge is enough for the flanking
              blocks to read, and it is what puts the building IN a street. Both near bands stand on
              the plaza line, so nothing floats above the paving. --- */}
      <BuildingBand baseY={846} x0={-80} x1={2000} n={9 + v.pick(1, 3)} seed={v.seed(53)} depth={2} minH={220} maxH={470} opacity={0.55} />
      <BuildingBand baseY={BANK_PLAZA} x0={-190} x1={230} n={2} seed={v.seed(17)} depth={1} minH={400} maxH={620} />
      <BuildingBand baseY={BANK_PLAZA} x0={1690} x1={2110} n={2} seed={v.seed(29)} depth={1} minH={420} maxH={640} />

      {/* --- the wings --- */}
      <BankWing x={196} w={440} topY={286} seed={v.seed(3)} />
      <BankWing x={1284} w={440} topY={286} seed={v.seed(8)} />

      {/* --- the portico. Recess and columns first, then the doors inside it, then the entablature
              and pediment over the top, so the roof always occludes the shafts. --- */}
      <Colonnade x={652} y={300} w={616} h={BANK_STYLO - 300} n={6} flutes={4} />
      {/* the doors, standing in the recess between the middle pair of columns */}
      <rect x={874} y={470} width={176} height={292} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE} />
      <rect x={890} y={496} width={68} height={266} fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={966} y={496} width={68} height={266} fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {[906, 982].map((dx, i) => (
        <g key={i}>
          <rect x={dx} y={516} width={36} height={92} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
          <rect x={dx} y={624} width={36} height={92} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
        </g>
      ))}
      <circle cx={952} cy={636} r={8} fill={c.accent} />
      <circle cx={972} cy={636} r={8} fill={c.accent} />
      {/* a fanlight over the doors */}
      <path d="M 874 470 Q 962 408 1050 470 Z" fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {[-1, 0, 1].map((k, i) => (
        <line key={i} x1={962} y1={470} x2={962 + k * 74} y2={470 - (k === 0 ? 58 : 28)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      ))}

      {/* --- entablature across the whole frontage: architrave, lettered frieze, projecting cornice --- */}
      <rect x={180} y={286} width={1560} height={22} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={180} y={232} width={1560} height={56} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* THE FRIEZE (item 3) — a bank puts its name across the front, in stone, and that is exactly
          the class of lettering QA said must stop being glyph runs. */}
      <InkWords x={244} y={240} w={470} h={40} text={label(tk, 'masthead', 11)} />
      <InkWords x={1210} y={240} w={470} h={40} text={label(tk, 'chartTitle', 13)} align="center" />
      <rect x={164} y={198} width={1592} height={40} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE} />
      {/* dentils under the cornice — small blocks, the classic detail and cheap density */}
      {Array.from({length: 38}, (_, i) => (
        <rect key={i} x={180 + i * 41} y={238} width={22} height={16} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={2.2} />
      ))}

      {/* --- pediment over the portico, with a carved roundel in the tympanum --- */}
      <path d="M 566 198 L 960 62 L 1356 198 Z" fill={tn.card} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 620 190 L 960 74 L 1300 190 Z" fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
      <circle cx={960} cy={152} r={38} fill={shade(tn.body, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {Array.from({length: 12}, (_, i) => {
        const a = (i * Math.PI) / 6;
        return <line key={i} x1={960 + Math.cos(a) * 22} y1={152 + Math.sin(a) * 22}
          x2={960 + Math.cos(a) * 36} y2={152 + Math.sin(a) * 36} stroke={INK} strokeWidth={2.6} />;
      })}
      {/* parapet balustrades over the wings, and the flag standing on the right one. The mast base
          is deliberately BELOW the balustrade rail (it rises from behind the parapet) and the whole
          cloth is inside the frame: the first render put the mast top at y=-46 and the flag rendered
          as a cropped red smear against the top edge. */}
      <Balustrade x0={204} x1={628} y={148} h={44} n={12} />
      <Balustrade x0={1292} x1={1716} y={148} h={44} n={12} />
      <Flag x={1584} y={30} f={f} />

      {/* --- the flight, and the plaza it lands on --- */}
      <Steps x0={498} x1={1424} yTop={BANK_STYLO} yBottom={BANK_PLAZA} n={7} inset={132} />
      <SlabFloor y={BANK_PLAZA} cols={22} rows={7} />
      {/* Cheek walls either side of the flight, each carrying a NEWEL LANTERN rather than a street
          standard. The first render put a 320-unit lamp post on each: the head landed at y≈516,
          which is halfway up the wing's windows, so the frame read as two red lampshades hanging
          inside the banking hall. A squat newel lamp is what a civic flight actually has, and it
          stays entirely against the stonework it stands on. */}
      {[[452, 1], [1470, -1]].map(([px, dir], i) => (
        <g key={i}>
          <path d={`M ${px} ${BANK_PLAZA} L ${px} ${BANK_PLAZA - 44} L ${px + dir * 56} ${BANK_STYLO - 6}
                    L ${px + dir * 56} ${BANK_PLAZA} Z`}
            fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          {/* a BOX lantern — glazed body, astragals, pyramid cap, finial — standing on a plinth on
              the cheek wall. The intermediate version used a conical shade in the scene accent and,
              against a facade that fills the whole frame, it read as a red table lamp hovering in
              the middle of the banking hall. A lit white body with black bars cannot be read as
              anything but a lamp. */}
          <rect x={px + dir * 44 - 34} y={BANK_STYLO - 8} width={68} height={30} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={px + dir * 44 - 11} y={BANK_STYLO - 48} width={22} height={44} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <rect x={px + dir * 44 - 27} y={BANK_STYLO - 110} width={54} height={64} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
          <g stroke={INK} strokeWidth={STROKE_THIN * 0.7}>
            <line x1={px + dir * 44 - 9} y1={BANK_STYLO - 110} x2={px + dir * 44 - 9} y2={BANK_STYLO - 46} />
            <line x1={px + dir * 44 + 9} y1={BANK_STYLO - 110} x2={px + dir * 44 + 9} y2={BANK_STYLO - 46} />
            <line x1={px + dir * 44 - 27} y1={BANK_STYLO - 80} x2={px + dir * 44 + 27} y2={BANK_STYLO - 80} />
          </g>
          <path d={`M ${px + dir * 44 - 36} ${BANK_STYLO - 110} L ${px + dir * 44 + 36} ${BANK_STYLO - 110}
                    L ${px + dir * 44} ${BANK_STYLO - 148} Z`}
            fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
          <circle cx={px + dir * 44} cy={BANK_STYLO - 156} r={8} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ))}

      {/* --- people. A short queue climbing to the doors (far, small), passers-by on the plaza, and
              the coloured hero on the pavement right of the caption card. --- */}
      {/* The hero's walk cycle is the frame's largest moving object, so everything else is dialled
          back: he carries `idle="none"` (the stride is motion enough) and the crowds run well under
          the library default, which is what keeps this template's camera lock in band. */}
      <CrowdColumn xFar={962} yFar={790} xNear={1160} yNear={880} n={4 + v.pick(2, 3)}
        scaleNear={0.5} scaleFar={0.3} seed={v.seed(7)} facing={-1} view="profile" alive={0} />
      <CrowdRow y={958} x0={110} x1={860} n={6 + v.pick(3, 3)} scale={0.62} seed={v.seed(19)} dz={14} alive={0.14} />
      <CrowdRow y={996} x0={1500} x1={1880} n={2 + v.pick(4, 3)} scale={0.74} seed={v.seed(31)} dz={10} view="profile" facing={-1} alive={0} />
      <StickFigure pose={A.walk(f, fps)} x={CAPTION_SAFE_X + 520 + v.off(5, 60)} y={1004} scale={1.06} facing={-1}
        view="profile" expr={FACES.cold} pal={LIGHT} briefcase frame={f} idle="none" seed={5.31} />

      {/* --- plaza furniture: bollards, a news box, cases by the kerb, a parked car --- */}
      {Array.from({length: 9}, (_, i) => (
        <g key={i}>
          <rect x={128 + i * 196} y={1006} width={26} height={62} rx={9} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <rect x={124 + i * 196} y={998} width={34} height={12} rx={5} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
        </g>
      ))}
      {/* the news box on the plaza. PERIOD: a PILLAR BOX — the same red object at the same spot,
          with a domed cap, a posting slot and a plate, which is what stood on a civic pavement from
          the 1850s and keeps the accent exactly where the composition had it. */}
      {period ? (
        <g>
          <rect x={1716} y={926} width={84} height={130} rx={6} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
          <path d="M 1708 926 q 50 -46 100 0 Z" fill={tn.accentDeep} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
          <rect x={1704} y={918} width={108} height={14} rx={5} fill={tn.accentDeep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <rect x={1736} y={952} width={48} height={12} rx={4} fill={INK} />
          <rect x={1734} y={986} width={52} height={34} fill={PAPER_WHITE} stroke={INK} strokeWidth={2.4} />
          <TextLines x={1740} y={994} w={40} n={2} gap={11} th={3} seed={6} opacity={0.6} />
        </g>
      ) : (
        <g>
          <rect x={1712} y={932} width={92} height={124} rx={8} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={1728} y={950} width={60} height={44} fill={PAPER_WHITE} stroke={INK} strokeWidth={2.4} />
          <TextLines x={1734} y={958} w={48} n={3} gap={11} th={3} seed={6} opacity={0.6} />
        </g>
      )}
      <CaseStack x={286 + v.off(6, 60)} baseY={1006} n={2 + v.pick(7, 3)} s={0.62} seed={v.seed(23)} />
      {/* THE KERBSIDE CAR IS NEARER THAN THE CROWD, SO IT HAS TO LOOK IT (QA_WATCH item 12: "a
          pedestrian stands at roof height ON a parked car", t001b f277 / t026 f4726). The car's
          ground-y (1074) is correctly in front of the crowd row's (958) and it is correctly drawn
          after it — but at s=0.86 its ROOF landed at 971, thirteen units BELOW the crowd's feet, so
          it occluded none of them and the pedestrians standing behind it read as standing on it.
          At s=1.15 the roof is at 936 and the car crosses their shins, which is the same z-order
          finally visible as one. It also gives this plaza the near-plane mass bible §6.8 asks for. */}
      {period
        ? <HandCart x={520 + v.off(8, 80)} y={1074} s={1.15} facing={1} body={shade(tn.body, -1)} />
        : <Car x={520 + v.off(8, 80)} y={1074} s={1.15} facing={1} body={shade(tn.body, -1)} />}
      {/* someone crossing the plaza (WO-24) — this frame measured 100% motionless, its only moving
          things being the flag and a 0.14 crowd, neither of which reaches the |Δ| 1.0 threshold */}
      <Passerby y={1068} x0={2160} x1={-240} scale={0.96} seed={v.seed(3)} at={92} />
      <Cone x={1636 + v.off(9, 60)} y={1052} s={0.7} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 8. courtHearing — bench, witness stand, gallery of seated figures, panelling
//
// NAMED `courtHearing`, NOT `courtroom`, and that is not a preference. EXPLAINER_TEMPLATES is spread
// LAST into scenes.tsx's `TEMPLATES`, so a name shared with a legacy template silently supersedes it
// — WO-8f's `tradingFloor` did exactly that to the HEDGE pack and WO-8g had to rename it
// `exchangeFloor`. stage.tsx already owns `courtroom` (the MAFIA pack's RICO trial, keyed `grey` in
// SCENE_KEY_BY_TEMPLATE), so registering another `courtroom` here would quietly change what every
// legacy mafia/pirate/bratva episode renders, decided by map ordering rather than by anyone.
//
// Keyed `interior` — the bible's own gloss on that key is "enclosed, lamp-lit, wooden, dark", which
// is a panelled courtroom verbatim, and it gives the frame an amber accent (the seal, the bench
// lamp) instead of the near-monochrome the legacy `grey` courtroom would produce.
//
// Draw order is the whole composition: gallery figures BEFORE their pew backs, the judge BEFORE the
// bench slab, the witness BEFORE the stand's front panel. Every one of those, drawn the other way
// round, floats a person on top of the furniture they are sitting behind.
// ---------------------------------------------------------------------------
const COURT_WALL = 706;

/** The great seal on the wall behind the bench: two rings, a ring of radial ticks, a starburst.
 *  Deliberately NOT a portrait — WO-8f's boardroom found that framed heads at seated-head height on
 *  the wall behind a table read as people standing in lit doorways. */
const CourtSeal: React.FC<{cx: number; cy: number; r: number}> = ({cx, cy, r}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  return (
    <g>
      <circle cx={cx} cy={cy} r={r} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} />
      <circle cx={cx} cy={cy} r={r * 0.82} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <circle cx={cx} cy={cy} r={r * 0.56} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {Array.from({length: 24}, (_, i) => {
        const a = (i * Math.PI) / 12;
        return <line key={i} x1={cx + Math.cos(a) * r * 0.6} y1={cy + Math.sin(a) * r * 0.6}
          x2={cx + Math.cos(a) * r * 0.78} y2={cy + Math.sin(a) * r * 0.78}
          stroke={INK} strokeWidth={2.8} />;
      })}
      {Array.from({length: 8}, (_, i) => {
        const a = (i * Math.PI) / 4 - Math.PI / 2;
        return <path key={i} d={`M ${cx + Math.cos(a) * r * 0.5} ${cy + Math.sin(a) * r * 0.5}
          L ${cx + Math.cos(a + 0.36) * r * 0.2} ${cy + Math.sin(a + 0.36) * r * 0.2}
          L ${cx + Math.cos(a - 0.36) * r * 0.2} ${cy + Math.sin(a - 0.36) * r * 0.2} Z`}
          fill={tn.deep} stroke={INK} strokeWidth={2.2} />;
      })}
    </g>
  );
};

/** A turned-baluster rail — the bar of the court, and the gallery pew fronts. Forty small outlined
 *  shapes for one line of code at the call site, which is what a courtroom frame is mostly made of. */
const Balusters: React.FC<{x0: number; x1: number; y: number; h: number; n: number; fill?: string}> =
({x0, x1, y, h, n, fill}) => {
  const tn = useSceneTones();
  const wood = fill ?? tn.card;
  const step = (x1 - x0) / n;
  return (
    <g>
      {Array.from({length: n}, (_, i) => (
        <path key={i} d={`M ${x0 + i * step + step * 0.22} ${y}
                          L ${x0 + i * step + step * 0.78} ${y}
                          L ${x0 + i * step + step * 0.6} ${y + h * 0.42}
                          L ${x0 + i * step + step * 0.72} ${y + h}
                          L ${x0 + i * step + step * 0.28} ${y + h}
                          L ${x0 + i * step + step * 0.4} ${y + h * 0.42} Z`}
          fill={shade(wood, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.55} strokeLinejoin="round" />
      ))}
      <rect x={x0 - 12} y={y - 20} width={x1 - x0 + 24} height={24} rx={8} fill={wood} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x0 - 12} y={y + h} width={x1 - x0 + 24} height={18} fill={shade(wood, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
    </g>
  );
};

const CourtHearing: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2). 13 scenes in this room. The gallery's size and composition, the pictures
  // either side of the seal, the paperwork on the bench and at counsel's table, and where the
  // advocate stands in the well all move with the scene.
  const v = useVary();
  return (
    <Frame>
      <Ceiling y={158} lights={3} />
      <Dentils x0={0} x1={1920} y={140} n={44} h={24} />
      {/* --- the panelled back wall. Panelling is a UnitWall with the handles off, which is the
              library doing the work of a bespoke component: an upper run of tall fielded panels
              over a dado run of short ones, with a rail between them. --- */}
      {/* PANELLING KEYS TO A NEUTRAL, NOT TO `card` (WO-27, fixing the defect WO-24 recorded).
          `card` is `shade(mid, 3)`, the LIGHT end of the ladder, and this run is the largest object
          in the template — ~1920×540, a quarter of the frame — so on this template's navy it
          lightened into a bright periwinkle and made `courtHearing` the worst-covered frame in the
          set at 0.529 against the 0.30–0.40 target.

          WO-24's own note proposed `body`. IT WAS TRIED FIRST AND MEASURED WORSE, so it is written
          down here rather than repeated later: `body` is still the hue at full chroma over the same
          quarter of the frame, so coverage does not move at all and the frame gets MORE saturated —
          coverage 0.529 → 0.529, all-pixel saturation 0.263 → 0.300, coloured-pixel 0.497 → 0.567.
          It fixes the brightness and not the defect.

          A wall is STRUCTURAL, and WO-24's own rule for structural planes is that they take the
          neutral `shell` ladder while the MATERIAL — here the bench, the stand, the counsel table,
          the rails — keeps the committed hue. Keyed to `back` the room reads as a plastered and
          panelled hall with navy furniture in it, and it lands almost exactly on the reference:
          coverage 0.529 → 0.248 (reference 0.247), all-pixel saturation 0.263 → 0.120 (reference
          0.137), coloured-pixel 0.497 → 0.483, flat fill 89.13% → 89.14%, camera lock 37/48
          unchanged. */}
      <UnitWall x={0} y={168} w={1920} h={318} cols={14} rows={1} handle={false} fill={tn.back} carcass={tn.deep} />
      <rect x={0} y={476} width={1920} height={26} fill={shade(tn.back, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <UnitWall x={0} y={500} w={1920} h={206} cols={20} rows={1} handle={false} fill={shade(tn.back, -1)} carcass={tn.deep} />
      <rect x={0} y={COURT_WALL - 26} width={1920} height={26} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* the seal, flanked by two draped standards and two wall sconces */}
      <CourtSeal cx={962} cy={320} r={124} />
      {[724, 1200].map((px, i) => (
        <g key={i}>
          <rect x={px - 7} y={196} width={14} height={310} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <path d={`M ${px + (i ? -6 : 6)} 214 L ${px + (i ? -150 : 150)} 232 L ${px + (i ? -150 : 150)} 396 L ${px + (i ? -6 : 6)} 386 Z`}
            fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
          <path d={`M ${px + (i ? -6 : 6)} 268 L ${px + (i ? -150 : 150)} 286`} fill="none" stroke={PAPER_WHITE} strokeWidth={8} />
          <path d={`M ${px + (i ? -6 : 6)} 320 L ${px + (i ? -150 : 150)} 338`} fill="none" stroke={PAPER_WHITE} strokeWidth={8} />
        </g>
      ))}
      {[214, 1706].map((px, i) => (
        <g key={i}>
          <WallFrame x={px} y={216} w={224} h={172} art={i ? 'head' : v.one(1, ['scape', 'line', 'bars'] as const)} seed={v.seed(4 + i * 5)} />
          <rect x={px + 76} y={430} width={72} height={54} rx={10} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
          <rect x={px + 96} y={484} width={32} height={38} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ))}
      {/* the court clock over the door on the right, ticking */}
      <circle cx={1560} cy={300} r={48} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
      <line x1={1560} y1={300} x2={1584} y2={314} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <ClockHand cx={1560} cy={300} r={34} f={f} />
      {/* the door counsel come through, on the left */}
      <RibbedPanel x={296} y={438} w={186} h={268} ribs={2} dir="v" fill={shade(tn.card, -2)} />

      {/* --- floor --- */}
      <SlabFloor y={COURT_WALL} cols={32} rows={13} />

      {/* --- the bench. Judge goes down FIRST; the slab and its front panels occlude him from the
              hip down, which is what puts him behind it instead of on it.
              THE VERTICAL BUDGET IS THE WHOLE PROBLEM in this template. The first build staged the
              gallery as two rows of full seated figures at y=1006 and y=1078; `SeatedRow` takes the
              HIP, and a seated head sits ~320 units above it, so both rows put their heads at
              y≈715 — exactly where the bench is — and the entire lower two-thirds of the frame
              became a wall of grey backs with the bench, the witness stand, the counsel table and
              the bar all invisible behind it. The gallery is now `CrowdHeads`, which is heads and
              shoulders only and occupies the bottom ~150 units, which is also what the reference's
              own packed-gallery frame is made of (depression_montage_verified.jpg, 15:00). --- */}
      <rect x={560} y={636} width={800} height={40} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* THE MAN BEHIND THE BENCH IS THE JUDGE (QA_WATCH item 16). He was `pal={LIGHT}` — the
          episode's hero costume — so on both courtroom scenes the subject stood centred behind the
          raised bench, under the seal, in the one seat in the room that is not his (t113 f19101,
          t127 f21537), while the actual judge was a small grey figure off to the right in the
          witness box. director.tsx even named the anchors that way round: the bench head was
          registered as `defendant` and the witness-box head as `judge`.
          The bench keeps its occupant and its geometry — only the palette changes here — and the
          subject gets his own mark in the well below (the defendant, standing, addressing it). The
          three head anchors in director.tsx are re-labelled to match, and the witness-box head is
          now called `witness`, which is what it has always been. */}
      <StickFigure pose={A.stand(f)} x={962} y={760} scale={1.1} facing={1} view="front"
        expr={FACES.hardened} pal={DIM} frame={f} idle="idle" />
      <path d="M 520 772 L 1400 772 L 1470 818 L 460 818 Z" fill={tn.card} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={460} y={818} width={1010} height={142} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} />
      <UnitWall x={486} y={836} w={958} h={106} cols={7} rows={1} handle={false} fill={shade(tn.card, -2)} carcass={shade(tn.deep, -1)} />
      <rect x={438} y={960} width={1054} height={30} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* what is ON the bench: the gavel and its block, a bench lamp, files, a water glass */}
      <rect x={586} y={736} width={96} height={38} rx={6} fill={shade(tn.body, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={602} y={714} width={64} height={16} rx={7} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <rect x={660} y={702} width={12} height={40} fill={tn.deep} />
      <Papers x={1258 + v.off(2, 60)} y={762} n={2 + v.pick(3, 3)} s={0.68} seed={v.seed(21)} />
      <rect x={1126} y={730} width={30} height={46} rx={4} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <g>
        <rect x={1348} y={698} width={12} height={76} fill={tn.deep} />
        <path d="M 1318 698 L 1390 698 L 1376 654 L 1332 654 Z" fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
      </g>

      {/* --- the witness stand, right of the bench. The occupant takes `idle="none"`: a witness
              holding still is right for the picture and it is one fewer active lock cell. --- */}
      <StickFigure pose={A.sit(0)} x={1666} y={776} scale={0.92} facing={-1} view="front"
        expr={FACES.worried} pal={DIM} frame={0} idle="none" />
      <path d="M 1534 800 L 1842 800 L 1882 842 L 1494 842 Z" fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={1494} y={842} width={388} height={148} fill={tn.card} stroke={INK} strokeWidth={STROKE} />
      <UnitWall x={1516} y={860} w={344} h={112} cols={3} rows={1} handle={false} fill={shade(tn.card, -2)} carcass={shade(tn.deep, -1)} />
      <rect x={1548} y={764} width={64} height={12} rx={5} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />

      {/* --- counsel's table, left of the bench: the clerk typing beside a second seat, papers,
              exhibit boxes; and an advocate on his feet at the bench, addressing it. He stands at
              x=560 rather than tucked in beside the table, where he was drawn straight through the
              two seated figures. --- */}
      <SeatedRow y={856} x0={150} x1={150} n={1} scale={0.86} seed={v.seed(9)} working view="front" alive={1} />
      <SeatedRow y={856} x0={360} x1={360} n={1} scale={0.86} seed={v.seed(12)} view="front" alive={0} />
      <Desk x={56} y={884} w={396} h={30} legH={112} fill={shade(tn.card, -1)} />
      <Papers x={150} y={876} n={2 + v.pick(4, 3)} s={0.7} seed={v.seed(27)} />
      <Papers x={356} y={880} n={1 + v.pick(5, 3)} s={0.64} seed={v.seed(33)} />
      <BoxStack x={72} baseY={1006} n={1 + v.pick(6, 3)} s={0.72} seed={v.seed(15)} />
      <CaseStack x={330} baseY={1006} n={2 + v.pick(7, 3)} s={0.6} seed={v.seed(45)} />
      {/* the lectern in the well, and a runner of carpet up to it */}
      <path d="M 620 1002 L 1300 1002 L 1360 962 L 560 962 Z" fill={shade(tn.floor, 2)} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
      <g>
        <path d="M 1360 1004 L 1470 1004 L 1452 900 L 1378 900 Z" fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <path d="M 1366 900 L 1464 900 L 1470 872 L 1360 872 Z" fill={tn.card} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <TextLines x={1382} y={912} w={64} n={5} gap={15} th={4} seed={v.seed(51)} opacity={0.5} />
      </g>
      {/* held still. The judge's idle, the clerk's typing hands and the wall clock are this
          template's whole motion budget; a fourth animated body at near-hero scale in the well put
          it under the 35/48 camera-lock floor. */}
      <StickFigure pose={A.stand(0)} x={560 + v.off(8, 60)} y={990} scale={0.98} facing={1} view="profile"
        expr={FACES.neutral} pal={DIM} frame={0} idle="none" />
      {/* THE DEFENDANT'S MARK (QA_WATCH item 16) — a fixed x in the well, facing the bench, at the
          right-hand end of the carpet runner beside the lectern. Distinct from the bench by
          position, by height (he stands on the floor at 996 where the bench occupant is raised to
          760) and by which way he faces. He is drawn AFTER the bench, so the bench's own props pass
          behind him, which is what puts him in front of it rather than in it.
          Fixed, deliberately: `v.off` on this figure would move the anchor director.tsx measures
          every take, and this is the one figure in the room the balloon placer has to hit. */}
      <StickFigure pose={A.stand(f)} x={1218} y={996} scale={1.06} facing={-1} view="front"
        expr={FACES.hardened} pal={LIGHT} frame={f} idle="idle" />

      {/* --- the bar of the court, then the public gallery in front of it. Camera-side order is
              bench → bar → gallery, so the heads are drawn last and occlude the rail.
              THE ROW SITS AT 1012, NOT 1074. `CrowdHeads` draws its shoulders from cy + 2.4r, so at
              y=1074 with r=52 the head ellipses ran to 1131 and the shoulders never appeared at
              all: the gallery rendered as a line of brown eggs along the frame edge. At 1012/r=46
              the heads are whole and the shoulders reach the bottom, which is what makes the mass
              read as people in pews. --- */}
      <Balusters x0={20} x1={1900} y={984} h={54} n={36} />
      <CrowdHeads y={1012} x0={-20} x1={1940} n={10 + v.pick(9, 5)} rows={2} r={46} seed={v.seed(5)} alive={0.04} />
      <Plant x={1884} y={980} s={0.75 + v.pick(10, 3) * 0.05} seed={v.seed(7)} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 9. factoryFloor — machines, conveyor, pipes, overhead rig, workers
//
// Keyed `interior`. The bible names that key's exemplar as the "brown warehouse", which is this
// room exactly; and a plant floor lit by clerestory glazing and machine lamps is the same "enclosed,
// lamp-lit, wooden, dark" reading the office and the courtroom take.
//
// The only element that moves is ONE flywheel, turning in place. A conveyor whose load actually
// travelled would slide a line of crates the width of the frame, which is the "whole element
// spanning most of the frame" failure the camera lock exists to catch — a rotating 90-unit wheel
// cannot leave the single cell it sits in.
// ---------------------------------------------------------------------------
const FACT_WALL = 664;
const FACT_BELT = 872;

/** One machine: plinth, body, control panel with dials, hopper, vent stack, and (optionally) a
 *  spoked flywheel on its flank. Bespoke — a machine is the one thing in this frame that is not
 *  furniture, structure or a crowd, so it is the only part the library cannot supply. */
const Machine: React.FC<{
  x: number; y: number; w: number; h: number; seed: number; spin?: boolean; f?: number;
}> = ({x, y, w, h, seed, spin = false, f = 0}) => {
  const c = useSceneColors();
  const tn = useSceneTones();
  // PERIOD (WO-31). COMPARISON's open defect 1: "machines keep circular DIAL GAUGES and LIT
  // PUSH-BUTTON PANELS" under 1844 narration. WO-27's flag never reached this component at all — it
  // is bespoke to this template, so the sweep that gave `Monitor`, `Chair` and `DeskPhone` a period
  // form went straight past the largest object in the room, three times over.
  //
  // The substitution, at the same footprint, is the one QA specified: the control panel becomes a
  // CAST-IRON NAMEPLATE with a single BRASS pressure dial beside it, and the row of lit buttons
  // becomes the plate's bolt heads. A mill engine had exactly one instrument on it. The riveted
  // casing, the hopper, the stack and the flywheel are already correct for 1844 and are untouched —
  // but their COLOUR is not: `tn.body` is the room's committed hue, so a "riveted iron casing" was
  // whatever colour the key said, which is the same tone-inheritance defect `MATERIAL` exists to end.
  const period = usePeriod();
  const body = period
    ? shade(MATERIAL.iron, (seed % 2))
    : shade(tn.body, (seed % 2) - 1);
  const wheelR = Math.min(w, h) * 0.2;
  const wx = x + w * 0.82, wy = y - h * 0.36;
  return (
    <g>
      {/* plinth first, so the body's outline crosses in front of it */}
      <rect x={x - 14} y={y - 34} width={w + 28} height={34} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x} y={y - h} width={w} height={h - 34} fill={body} stroke={INK} strokeWidth={STROKE} />
      {/* vertical panel seams with rivets down each one. Vertical on purpose: a machine casing is
          the largest flat mass in this frame and only vertical edges move the flat-fill metric. */}
      {Array.from({length: 5}, (_, i) => {
        const sx = x + (w * (i + 1)) / 6;
        return (
          <g key={'s' + i}>
            <line x1={sx} y1={y - h + 8} x2={sx} y2={y - 42} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.45} />
            {Array.from({length: 5}, (_, k) => (
              <circle key={k} cx={sx} cy={y - h + 24 + ((k + 0.5) * (h - 74)) / 5} r={4}
                fill={shade(body, 1)} stroke={INK} strokeWidth={1.8} />
            ))}
          </g>
        );
      })}
      {/* hopper on the roof, and the vent stack out of it */}
      <path d={`M ${x + w * 0.16} ${y - h} L ${x + w * 0.62} ${y - h} L ${x + w * 0.52} ${y - h - 78} L ${x + w * 0.26} ${y - h - 78} Z`}
        fill={shade(body, 1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={x + w * 0.72} y={y - h - 120} width={30} height={120} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={x + w * 0.68} y={y - h - 138} width={46} height={22} rx={6} fill={shade(tn.deep, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {/* control panel: a lighter face carrying dials, a readout and a row of buttons — or, in
          period, a bolted maker's plate with ONE brass dial beside it */}
      {period ? (
        <g>
          <rect x={x + w * 0.08} y={y - h * 0.78} width={w * 0.44} height={h * 0.34} fill={shade(MATERIAL.iron, -1)}
            stroke={INK} strokeWidth={STROKE_THIN} />
          {/* the maker's plate: raised timber-framed brass with two ruled lines of engraving on it */}
          <rect x={x + w * 0.12} y={y - h * 0.72} width={w * 0.24} height={h * 0.2} fill={MATERIAL.brass}
            stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={x + w * 0.14} y={y - h * 0.68} w={w * 0.2} n={2} gap={h * 0.06} th={4} seed={seed * 3} opacity={0.75} />
          {/* its bolt heads, where the lit push-buttons were — same count, same rhythm, no light */}
          {Array.from({length: 5}, (_, i) => (
            <circle key={'v' + i} cx={x + w * (0.125 + i * 0.075)} cy={y - h * 0.45} r={h * 0.018}
              fill={shade(MATERIAL.iron, 1)} stroke={INK} strokeWidth={2.2} />
          ))}
          {/* the one instrument: a brass-bezelled pressure gauge, needle at rest */}
          <circle cx={x + w * 0.44} cy={y - h * 0.6} r={h * 0.082} fill={MATERIAL.brass} stroke={INK} strokeWidth={STROKE_THIN} />
          <circle cx={x + w * 0.44} cy={y - h * 0.6} r={h * 0.058} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
          <line x1={x + w * 0.44} y1={y - h * 0.6}
            x2={x + w * 0.44 + Math.cos(seed) * h * 0.042}
            y2={y - h * 0.6 + Math.sin(seed) * h * 0.042} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
        </g>
      ) : (
        <g>
          <rect x={x + w * 0.08} y={y - h * 0.78} width={w * 0.44} height={h * 0.34} fill={shade(tn.card, -1)}
            stroke={INK} strokeWidth={STROKE_THIN} />
          {Array.from({length: 3}, (_, i) => (
            <g key={i}>
              <circle cx={x + w * (0.15 + i * 0.13)} cy={y - h * 0.66} r={h * 0.052} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
              <line x1={x + w * (0.15 + i * 0.13)} y1={y - h * 0.66}
                x2={x + w * (0.15 + i * 0.13) + Math.cos(seed + i * 2) * h * 0.036}
                y2={y - h * 0.66 + Math.sin(seed + i * 2) * h * 0.036} stroke={INK} strokeWidth={2.6} strokeLinecap="round" />
            </g>
          ))}
          <rect x={x + w * 0.11} y={y - h * 0.55} width={w * 0.38} height={h * 0.1} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <TextLines x={x + w * 0.13} y={y - h * 0.52} w={w * 0.32} n={2} gap={h * 0.04} th={4} seed={seed * 3} opacity={0.7} />
          {Array.from({length: 5}, (_, i) => (
            <rect key={'b' + i} x={x + w * (0.11 + i * 0.08)} y={y - h * 0.42} width={w * 0.05} height={h * 0.05}
              rx={4} fill={i === 2 ? c.accent : shade(tn.body, 1)} stroke={INK} strokeWidth={2.2} />
          ))}
        </g>
      )}
      {/* access hatch and its ribs, low on the body */}
      <RibbedPanel x={x + w * 0.1} y={y - h * 0.3} w={w * 0.5} h={h * 0.22} ribs={5} fill={shade(body, -1)} />
      {/* the flywheel. `spin` turns it in place — a rotate about its own centre, so it can never
          leave the cell it sits in, unlike anything that travels. */}
      <g transform={spin ? `rotate(${(f * 1.7) % 360} ${wx} ${wy})` : undefined}>
        <circle cx={wx} cy={wy} r={wheelR} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE} />
        <circle cx={wx} cy={wy} r={wheelR * 0.72} fill={shade(tn.body, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
        {Array.from({length: 6}, (_, i) => {
          const a = (i * Math.PI) / 3;
          return <line key={i} x1={wx} y1={wy} x2={wx + Math.cos(a) * wheelR * 0.7} y2={wy + Math.sin(a) * wheelR * 0.7}
            stroke={INK} strokeWidth={STROKE_THIN * 1.1} />;
        })}
        <circle cx={wx} cy={wy} r={wheelR * 0.16} fill={INK} />
      </g>
    </g>
  );
};

const FactoryFloor: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2). No scene of the madoff episode uses this room, but the defect is a property
  // of the TEMPLATE, not of one episode: the next industrial script would repeat this floor exactly
  // as often as this one repeated the boardroom.
  const tk = useTake();
  const v = useVary();
  // PERIOD (WO-27): riveted machine casings, a flywheel, a belt, pipework, brick coursing and a
  // clerestory are a mill as it was built. WO-26 tiered this room NEAR-NEUTRAL and it nearly is: the
  // painted floor hazard chevrons and the electric beacon are the two things a mill did not have.
  const period = usePeriod();
  return (
    <Frame>
      {/* --- roof: a dark deck, the truss rig under it, pendant lamps on the drop rods --- */}
      <rect x={0} y={0} width={1920} height={104} fill={shade(tn.deep, -1)} />
      {/* purlins across the roof deck. Twenty-five rather than thirteen, and VERTICAL: flat fill
          counts right-neighbour equality, so a horizontal member costs nothing to add and buys
          nothing either — the roof band measured 92-95% flat with the coarser run. */}
      {Array.from({length: 25}, (_, i) => (
        <rect key={i} x={i * 78} y={0} width={18} height={104} fill={tn.deep} stroke={INK} strokeWidth={2.4} />
      ))}
      <TrussRig x0={-20} x1={1940} y={104} h={62} bays={17} drops={5} dropH={44} />
      {Array.from({length: 5}, (_, i) => {
        const lx = 1920 * ((i + 0.5) / 5);
        return (
          <g key={i}>
            <path d={`M ${lx - 58} ${254} L ${lx + 58} ${254} L ${lx + 30} ${210} L ${lx - 30} ${210} Z`}
              fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
            <ellipse cx={lx} cy={254} rx={54} ry={12} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
          </g>
        );
      })}
      {/* --- back wall: clerestory glazing, service pipework, a roller shutter --- */}
      <rect x={0} y={166} width={1920} height={FACT_WALL - 166} fill={tn.back} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* clerestory glazing. The right light is narrower than the left ON PURPOSE: it leaves the
          pier at x 1200-1460 clear for the extract fan and the plant clock, which in the first
          build were drawn straight over the glass. */}
      {[[70, 490], [1490, 360]].map(([px, pw], i) => (
        <g key={i}>
          <rect x={px} y={288} width={pw} height={168} fill={shade(c.bg, 3)} />
          <Glazing x={px} y={288} w={pw} h={168} bays={i ? 4 : 5} rows={2} pane={null} />
        </g>
      ))}
      {/* brick coursing across the whole wall. A plant wall is the single largest flat region in
          this frame and the joints are what stop it reading as a colour field — the same argument
          `SlabFloor` makes for a ground plane. */}
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.5} opacity={0.28}>
        {Array.from({length: 11}, (_, i) => (
          <line key={'c' + i} x1={0} y1={186 + i * 44} x2={1920} y2={186 + i * 44} />
        ))}
        {Array.from({length: 132}, (_, i) => {
          const row = Math.floor(i / 12), col = i % 12;
          return <line key={'p' + i} x1={col * 160 + (row % 2 ? 80 : 0)} y1={186 + row * 44}
            x2={col * 160 + (row % 2 ? 80 : 0)} y2={230 + row * 44} />;
        })}
      </g>
      <PipeRun x0={0} x1={1920} y={190} n={3} gap={34} th={26} flanges={11} />
      <PipeRun x0={196} x1={470} y={1494} n={2} gap={40} th={24} flanges={4} dir="v" />
      {/* THE LOADING BAY (WO-31). Modern: a roller shutter under a lit fascia sign — COMPARISON's
          "a roller shutter with a lit sign strip above it", two of the four things that betrayed the
          century here. PERIOD: the same 470x334 opening becomes a pair of PLANK DOORS on strap
          hinges, and the fascia becomes a painted timber name board, its lettering in ink rather than
          in the accent, because a sign that GLOWS is the whole tell. The opening keeps its width, its
          vertical articulation and its edge count — the plank joints replace the shutter ribs
          one for one, so the panel's flat fill is unchanged. */}
      {period ? (
        <g>
          <rect x={716} y={330} width={470} height={334} fill={MATERIAL.timber} stroke={INK} strokeWidth={STROKE} />
          {Array.from({length: 10}, (_, i) => (
            <line key={'pl' + i} x1={716 + (470 * (i + 1)) / 10} y1={330} x2={716 + (470 * (i + 1)) / 10} y2={664}
              stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.6} />
          ))}
          {/* the meeting stile down the centre, and a ledge-and-brace pair of straps each side */}
          <rect x={944} y={330} width={14} height={334} fill={shade(MATERIAL.timber, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          {[0, 1].map((k) => (
            <g key={'st' + k}>
              {[398, 596].map((sy) => (
                <rect key={sy} x={k ? 958 : 716} y={sy} width={228} height={20}
                  fill={MATERIAL.iron} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
              ))}
            </g>
          ))}
          <rect x={700} y={296} width={502} height={42} fill={MATERIAL.oak} stroke={INK} strokeWidth={STROKE_THIN} />
          <InkWords x={744} y={302} w={410} h={30} text={label(tk, 'masthead', 9)} fill={INK} align="center" />
        </g>
      ) : (
        <g>
          {/* the shutter's ribs run VERTICALLY. Drawn `dir="h"` this panel measured 98.7% flat — the
              emptiest cell in the template — because horizontal ribs never break a row. */}
          <RibbedPanel x={716} y={330} w={470} h={334} ribs={21} dir="v" fill={shade(tn.body, -1)} />
          <rect x={700} y={306} width={502} height={32} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
          <InkWords x={744} y={308} w={410} h={26} text={label(tk, 'masthead', 9)} fill={c.accent} align="center" />
        </g>
      )}
      {/* a wall-mounted control cabinet, a pegboard of tools, an extract fan and the plant clock.
          PERIOD: the cabinet's four slots include one lit in the accent, which is a live indicator on
          a distribution board; it becomes a TIMBER KEY CUPBOARD with four panelled doors and no light
          on any of them. */}
      <rect x={1244} y={520} width={94} height={144} fill={period ? MATERIAL.oak : shade(tn.card, -1)}
        stroke={INK} strokeWidth={STROKE} />
      {Array.from({length: 4}, (_, i) => (
        <rect key={i} x={1258} y={536 + i * 34} width={66} height={22}
          fill={period ? shade(MATERIAL.timber, -1) : i === 1 ? c.accent : tn.deep} stroke={INK} strokeWidth={2.4} />
      ))}
      <rect x={584} y={452} width={110} height={210} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE} />
      {Array.from({length: 12}, (_, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        return <rect key={i} x={598 + col * 30} y={466 + row * 50} width={18} height={30 + rnd(v.seed(i * 7)) * 12}
          fill={shade(tn.body, (i % 3) - 1)} stroke={INK} strokeWidth={2.2} />;
      })}
      {/* THE FAN (WO-31). Modern: a six-blade electric extractor in a circular housing — COMPARISON's
          "an electric extractor fan in a circular housing". PERIOD: the same 62-unit disc on the same
          pier becomes the line shaft's WALL PULLEY — an iron sheave in a bracket, with its flat belt
          running away down the wall. Same silhouette class (a big outlined circle on a plain pier),
          same footprint, and it now belongs to the shaft overhead rather than contradicting it. */}
      {period ? (
        <g>
          <path d="M 1208 372 l -34 -26 l 0 52 Z" fill={MATERIAL.iron} stroke={INK} strokeWidth={STROKE_THIN * 0.7} strokeLinejoin="round" />
          <path d="M 1252 372 L 1236 664 L 1290 664 L 1288 372 Z" fill={shade(MATERIAL.timber, -2)}
            stroke={INK} strokeWidth={STROKE_THIN * 0.6} strokeLinejoin="round" />
          <circle cx={1270} cy={372} r={62} fill={shade(MATERIAL.iron, 1)} stroke={INK} strokeWidth={STROKE} />
          <circle cx={1270} cy={372} r={44} fill={MATERIAL.iron} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          {/* the sheave's six spokes — an outlined wheel, not a bladed rotor */}
          {Array.from({length: 6}, (_, i) => {
            const a = (i * Math.PI) / 3;
            return <line key={i} x1={1270} y1={372} x2={1270 + Math.cos(a) * 42} y2={372 + Math.sin(a) * 42}
              stroke={INK} strokeWidth={STROKE_THIN * 1.1} />;
          })}
          <circle cx={1270} cy={372} r={13} fill={INK} />
        </g>
      ) : (
        <g>
          <circle cx={1270} cy={372} r={62} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE} />
          {Array.from({length: 6}, (_, i) => {
            const a = (i * Math.PI) / 3;
            return <path key={i} d={`M 1270 372 L ${1270 + Math.cos(a) * 54} ${372 + Math.sin(a) * 54}
              L ${1270 + Math.cos(a + 0.5) * 50} ${372 + Math.sin(a + 0.5) * 50} Z`}
              fill={shade(tn.body, 1)} stroke={INK} strokeWidth={2.4} />;
          })}
          <circle cx={1270} cy={372} r={13} fill={INK} />
        </g>
      )}
      <circle cx={1400} cy={372} r={40} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
      <line x1={1400} y1={372} x2={1422} y2={384} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <ClockHand cx={1400} cy={372} r={28} f={f} />
      <rect x={0} y={FACT_WALL - 28} width={1920} height={28} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />

      {/* --- floor, with a painted walkway edge --- */}
      <SlabFloor y={FACT_WALL} cols={34} rows={14} />
      {/* the painted walkway hazard chevrons. PERIOD: floor safety paint is a 20th-century thing, so
          the walkway is edged in SETTS instead — the same band of the same floor, still articulated,
          with the accent dropped from it. */}
      {period
        ? Array.from({length: 26}, (_, i) => (
            <rect key={i} x={i * 78 + 6} y={1010} width={62} height={40}
              fill={shade(tn.floor, 1)} stroke={INK} strokeWidth={2.2} opacity={0.6} />
          ))
        : Array.from({length: 26}, (_, i) => (
            <path key={i} d={`M ${i * 78} 1010 l 44 0 l -30 40 l -44 0 Z`} fill={c.accent} opacity={0.5} />
          ))}
      <line x1={0} y1={1004} x2={1920} y2={1004} stroke={INK} strokeWidth={STROKE_THIN} opacity={0.5} />

      {/* --- the plant. Far machines first, then the workers between them, then the belt over the
              lot: the belt's slab is what puts the standing figures behind it. --- */}
      <Machine x={48} y={FACT_WALL + 168} w={410} h={318} seed={v.seed(3)} spin f={f} />
      <Machine x={1454} y={FACT_WALL + 156} w={396} h={300} seed={v.seed(6)} />
      <Machine x={790 + v.off(1, 50)} y={FACT_WALL + 120} w={300} h={214} seed={v.seed(9)} />
      <CrowdRow y={790} x0={600} x1={1400} n={3 + v.pick(2, 3)} scale={0.56} seed={v.seed(13)} dz={10} alive={0.15} />
      {/* the conveyor: rails on trestles over a run of rollers, carrying crates */}
      <g>
        {Array.from({length: 26}, (_, i) => (
          <circle key={i} cx={34 + i * 76} cy={FACT_BELT + 34} r={17} fill={shade(tn.body, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        ))}
        <rect x={-30} y={FACT_BELT} width={1980} height={30} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE} />
        <rect x={-30} y={FACT_BELT + 48} width={1980} height={20} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
        {Array.from({length: 7}, (_, i) => (
          <path key={'t' + i} d={`M ${140 + i * 276} ${FACT_BELT + 68} l -34 ${1004 - FACT_BELT - 68}
                                  m 34 ${-(1004 - FACT_BELT - 68)} l 34 ${1004 - FACT_BELT - 68}`}
            fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.3} />
        ))}
      </g>
      {[120, 386, 640, 1180, 1470, 1730].map((bx, i) => (
        <BoxStack key={i} x={bx + v.off(3 + i, 26)} baseY={FACT_BELT} n={i % 2 ? 2 : 1} s={0.62} seed={v.seed(i * 7 + 2)} />
      ))}
      {/* A beacon on a post beside the belt, blinking on its own clock. Placed at x=500, in the gap
          between the left machine and the first worker: at its first position (x=930) it landed
          directly over a worker's head, which neither metric can see. */}
      {/* PERIOD: a shift BELL on the same post, with its pull rope — the mill's own signal, and the
          one prop in this template that stops animating (a bell is rung by a hand nobody sees, where
          a beacon flashes on its own). */}
      <rect x={492} y={FACT_BELT - 176} width={16} height={176} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {period ? (
        <g>
          <path d={`M 474 ${FACT_BELT - 178} q 0 -48 26 -48 q 26 0 26 48 Z`}
            fill={c.accent} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <circle cx={500} cy={FACT_BELT - 172} r={7} fill={INK} />
          <line x1={500} y1={FACT_BELT - 226} x2={500} y2={FACT_BELT - 244} stroke={INK} strokeWidth={STROKE_THIN} />
          <path d={`M 526 ${FACT_BELT - 200} q 34 40 20 96`} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        </g>
      ) : (
        <circle cx={500} cy={FACT_BELT - 196} r={26}
          fill={stepIndex(f, 3, 46) % 2 ? c.accent : shade(c.accent, -3)} stroke={INK} strokeWidth={STROKE} />
      )}
      <rect x={470} y={FACT_BELT - 176} width={60} height={14} rx={5} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />

      {/* --- near plane: pallets, a trolley, cones, and the coloured hero at the belt.
              The hero STANDS: the first build gave him `A.type_`, a seated pose (thighs forward,
              shins down), on a figure with nothing under him, so he read as sitting on air with his
              legs cut off by the frame edge. The grey worker beside him is drawn small and WITH A
              FACE — a `DIM` figure at near-hero scale with no face is the headless-pill defect
              COMPARISON logged against the thumbnail, and it was back here at scale 1.06. --- */}
      <StickFigure pose={A.stand(f)} x={CAPTION_SAFE_X + 500 + v.off(10, 50)} y={FACT_BELT + 128} scale={1.12}
        facing={-1} view="front" expr={FACES.focused} pal={LIGHT} frame={f} idle="idle" />
      {/* held still: the spinning flywheel, the beacon, the clock and the hero are this template's
          whole motion budget, and a second animated near-plane body pushed it out of camera lock */}
      <StickFigure pose={A.stand(0)} x={676 + v.off(11, 50)} y={FACT_BELT + 78} scale={0.82} facing={1}
        view="profile" expr={FACES.neutral} pal={DIM} frame={0} idle="none" />
      {/* stock wheeled down the floor (WO-24). The note above still holds — a second animated body
          STANDING in the near plane cost this template its camera lock — but a crossing object does
          not: it touches two or three cells of the 8x6 grid at any one 10-frame gap, wherever it is,
          which is why `cityStreet`'s car still measures 40/48 while moving continuously. */}
      <Passerby y={1062} x0={-260} x1={2180} scale={1.0} seed={v.seed(17)} at={78} carry="trolley" />
      <Trolley x={1560 + v.off(12, 50)} y={FACT_BELT + 96} w={280} s={1.0} />
      <CaseStack x={1700} baseY={FACT_BELT + 96} n={2 + v.pick(13, 3)} s={0.8} seed={v.seed(19)} />
      <BoxStack x={214 + v.off(14, 60)} baseY={1074} n={2 + v.pick(15, 3)} s={0.94} seed={v.seed(23)} />
      {/* A rank of steel drums, in the NEAR plane. They were first staged against the far wall at
          floor level, which is exactly the band the workers stand in: they rendered across four
          torsos at waist height and read as men standing inside barrels. Nothing about either
          metric could see it. Down here they occlude only the floor.
          PERIOD (WO-31): a pressed-steel drum with a rolled bung is 20th-century, and four of them
          stand across the bottom sixth of the frame — the same class of tell as the extractor fan,
          and one COMPARISON did not catch because it was reading JSX rather than the picture. Same
          four cylinders, same footprint, drawn as COOPERED CASKS: timber staves between two iron
          hoops, a bung in the head. `Cone`'s barrel already made this exact substitution elsewhere in
          the library; this is that decision applied where the drums actually are. */}
      {Array.from({length: 4}, (_, i) => {
        const dx = 342 + i * 66;
        return (
          <g key={i}>
            <rect x={dx} y={968} width={62} height={112} rx={7}
              fill={period ? shade(MATERIAL.timber, -(i % 2)) : shade(tn.card, -(i % 3))}
              stroke={INK} strokeWidth={STROKE} />
            <line x1={dx} y1={1002} x2={dx + 62} y2={1002} stroke={INK}
              strokeWidth={period ? 9 : 2.6} opacity={period ? 1 : 0.55} />
            <line x1={dx} y1={1046} x2={dx + 62} y2={1046} stroke={INK}
              strokeWidth={period ? 9 : 2.6} opacity={period ? 1 : 0.55} />
            {period && [0.28, 0.5, 0.72].map((t) => (
              <line key={t} x1={dx + 62 * t} y1={968} x2={dx + 62 * t} y2={1080}
                stroke={INK} strokeWidth={2.2} opacity={0.45} />
            ))}
            <ellipse cx={dx + 31} cy={968} rx={31} ry={10}
              fill={period ? shade(MATERIAL.timber, 1) : shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
            <circle cx={dx + 31} cy={968} r={9}
              fill={period ? MATERIAL.iron : shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          </g>
        );
      })}
      <Cone x={1010} y={1058} s={0.9} />
      <Cone x={1096} y={1070} s={0.9} />
      <Papers x={1330} y={1050} n={2} s={0.8} seed={31} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 10. broadcastDesk — news studio: anchor desk, backdrop screen, lighting rig, foreground camera
//
// Keyed `alarm`, the second key the first six never reached. The reference's own broadcast/panel
// frames are the SATURATED cell of the montage (wolf_montage_verified.jpg, 9:20 — an orange ground
// carrying speech balloons and pushed faces), and COMPARISON MISS #5 is that our set measures 0.209
// mean saturation against the reference's 0.308-0.646 floor. This is one of the two templates that
// exists to carry that range.
//
// The foreground camera is bible §6.8 — the dark near-plane mass the reference uses for depth,
// which COMPARISON scored as a MISS ("not built"). It is a camera rather than `OverShoulder`'s
// head-and-shoulders silhouette because a studio frame with an anonymous head in the corner reads
// as an audience, and because a camera is unambiguously the thing pointing at the desk.
// ---------------------------------------------------------------------------
const STUDIO_FLOOR = 792;

/** A hanging studio lamp: yoke, body, four barn doors, a white lens. */
const StudioLamp: React.FC<{x: number; y: number; s?: number}> = ({x, y, s = 1}) => {
  const tn = useSceneTones();
  const period = usePeriod();
  // PERIOD (WO-27): a barn-doored studio lamp is unmistakably 20th century, so the rig carries
  // HANGING OIL LAMPS instead — a rod, a reservoir, a glass chimney and a reflector — which is how a
  // hall over a rostrum was lit, and the same drawn mass hanging off the same truss.
  if (period) {
    return (
      <g>
        <rect x={x - 5 * s} y={y} width={10 * s} height={30 * s} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
        <path d={`M ${x - 56 * s} ${y + 62 * s} L ${x + 56 * s} ${y + 62 * s} L ${x + 22 * s} ${y + 30 * s}
                  L ${x - 22 * s} ${y + 30 * s} Z`}
          fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <rect x={x - 22 * s} y={y + 62 * s} width={44 * s} height={38 * s} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
        <path d={`M ${x - 22 * s} ${y + 100 * s} q ${22 * s} ${22 * s} ${44 * s} 0 Z`}
          fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
        <line x1={x - 12 * s} y1={y + 66 * s} x2={x - 12 * s} y2={y + 98 * s} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.6} />
        <line x1={x + 12 * s} y1={y + 66 * s} x2={x + 12 * s} y2={y + 98 * s} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.6} />
      </g>
    );
  }
  return (
    <g>
      <rect x={x - 5 * s} y={y} width={10 * s} height={34 * s} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
      <path d={`M ${x - 46 * s} ${y + 34 * s} L ${x + 46 * s} ${y + 34 * s} L ${x + 36 * s} ${y + 96 * s}
                L ${x - 36 * s} ${y + 96 * s} Z`}
        fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      {/* barn doors, splayed */}
      <path d={`M ${x - 46 * s} ${y + 34 * s} L ${x - 78 * s} ${y + 6 * s}`} stroke={INK} strokeWidth={STROKE_THIN * 1.2} fill="none" />
      <path d={`M ${x + 46 * s} ${y + 34 * s} L ${x + 78 * s} ${y + 6 * s}`} stroke={INK} strokeWidth={STROKE_THIN * 1.2} fill="none" />
      <path d={`M ${x - 78 * s} ${y + 6 * s} L ${x - 78 * s} ${y + 52 * s} L ${x - 46 * s} ${y + 62 * s} Z`}
        fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} strokeLinejoin="round" />
      <path d={`M ${x + 78 * s} ${y + 6 * s} L ${x + 78 * s} ${y + 52 * s} L ${x + 46 * s} ${y + 62 * s} Z`}
        fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} strokeLinejoin="round" />
      <rect x={x - 34 * s} y={y + 92 * s} width={68 * s} height={16 * s} rx={6 * s} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
    </g>
  );
};

const BroadcastDesk: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2), THE BANNERS (item 3) and THE CHART (item 7). QA on this room: the masthead
  // band, the lower third and the desk strap were all glyph runs — "the broadcastDesk banners at
  // t120 f20071" — and the backdrop chart collapsed whatever the story was.
  const tk = useTake();
  const v = useVary();
  // PERIOD (WO-27) — the hardest of the thirteen, and the one to be honest about. Broadcasting does
  // not exist before 1920, so period mode does NOT pretend this is a studio: it draws the same
  // composition as a PRESS ROSTRUM — two men at a long table, a great painted chart board behind
  // them, oil lamps on the rig above, and a plate camera on a wooden tripod in the near plane
  // photographing them. Everything lit becomes something painted, printed or burning.
  const period = usePeriod();
  return (
    <Frame>
      {/* --- the studio box: dark panelled walls behind everything. Three rows of twenty rather
              than two of twelve — the coarser grid left the walls as the frame's largest flat
              regions and the template measured 91.7% flat fill, i.e. near the empty end of the
              band. --- */}
      {/* THE STUDIO BOX COMES OFF THE NEUTRAL SHELL (QA_WATCH item 15).
          This wall is 1920 x 644 — 60% of the frame before anything is drawn over it — and it was
          `shade(tn.body, -1)`, i.e. the `alarm` key's own mid mass, a deep crimson. With the accent
          straps, the chart panel and the desk all keyed on top of it QA read the room as "crimson
          walls + hot-pink chart panel + mustard bands", and it measured worst of any frame in the
          episode: 0.268 and 0.304 all-pixel saturation at native 1280 (target 0.15–0.22) on 0.403
          and 0.449 coloured coverage (target 0.30–0.40). This is the one room with chroma to give
          back, so unlike chartBoard's wall it is drained rather than lightened.
          It is also this mood's own written rule: MOODS.alarm says "bg stays keyed; the floor and
          recesses come off the shell, which is what drains broadcastDesk's 19% of frame". The wall
          was simply never included in that. A dark neutral studio box is what a news studio looks
          like, and the frame keeps its `alarm` identity where the identity belongs — the desk, the
          straps, the lower third and the accent leg on the chart. */}
      <UnitWall x={0} y={148} w={1920} h={644} cols={20} rows={3} handle={false}
        fill={shade(c.shell, -1)} carcass={shade(c.shell, -2)} />
      {/* a run of set flats standing proud of the wall, which is what a studio cyclorama is made of.
          These now carry the KEY the wall behind them gave up: four 44-wide strips are a prop-sized
          area, not a plane, so this is the chroma being MOVED rather than deleted — COMPARISON §4
          MISS #1's own instruction — and it puts the room's crimson back on screen as an object
          standing in front of a neutral box. Measured, it returns the coloured coverage the drained
          wall cost (0.286 -> 0.30+, the bottom of the target band) at a third of the saturation. */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={-20 + i * 660} y={148} width={44} height={644} fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      ))}
      {/* --- lighting rig across the top --- */}
      <rect x={0} y={0} width={1920} height={62} fill={shade(tn.deep, -1)} />
      <TrussRig x0={-20} x1={1940} y={62} h={58} bays={26} drops={0} />
      {[210, 560, 960, 1360, 1712].map((lx, i) => <StudioLamp key={i} x={lx} y={120} s={1} />)}
      {/* a cable tray under the rig, which is what a real grid is hung off */}
      <PipeRun x0={-20} x1={1940} y={244} n={2} gap={26} th={18} flanges={13} fill={tn.deep} />

      {/* --- the backdrop screen: a skyline behind a chart behind a masthead band. Drawn INSIDE the
              screen's own rectangle, then the bezel over the top, so nothing bleeds past the glass
              (there is no clip path anywhere in this file — a clip silently swallows art). --- */}
      {/* PERIOD: the glass becomes a painted BOARD — a cream ground carrying the same panorama and
          the same chart, with the lit stats panel replaced by a pinned bill of figures and both
          straps repainted as hand-lettered boards. Same three layers, nothing emitting light. */}
      {/* the board's ground is a NEUTRAL rung, not the hue-carrying `card`: WO-24's coverage budget
          says a plane this size either carries the hue at real chroma or is grey, and 1200×410 of
          keyed board is 24% of the frame — enough on its own to push this template's coloured
          coverage back up, which is the regression this work order must not cause. */}
      <rect x={306} y={296} width={1200} height={410} fill={period ? shade(tn.floor, 1) : shade(tn.deep, -2)} />
      <BuildingBand baseY={706} x0={306} x1={1506} n={7 + v.pick(1, 3)} seed={v.seed(23)} depth={1} minH={90} maxH={230} opacity={0.8} />
      {/* THE SUBJECT GOES ON THE SCREEN BEHIND THE ANCHORS (QA_WATCH item 16). The left half of the
          backdrop was a stats panel of twelve glyph rows — the emptiest region in the frame, filled
          with texture. It now carries what a news studio actually puts up while two anchors talk
          about a man: his picture, on a card, with his name lettered under it. That is the "or on a
          screen behind the anchors" half of item 16's fix, and it is what lets both DESK seats be
          anonymous (see the anchors below) without the room losing its subject. The stats keep
          their job in a column beside him, so the panel is no emptier than it was. */}
      <rect x={344} y={382} width={556} height={214} fill={period ? PAPER_WHITE : shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={360} y={396} width={172} height={186} fill={period ? PAPER_WHITE : shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      <Portrait cx={446} cy={468} r={50} />
      <rect x={360} y={546} width={172} height={36} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {/* The strap under the mugshot is the SUBJECT'S NAME, not a word mined off the scene's own
          copy — `label()` on this slot returned "FIRST" out of "SEC'S FIRST ESTIMATE", which is a
          caption for the chart, not for a face. `episode_meta.thumb.keyword` is the one place the
          episode already writes down who it is about (the thumbnail sets it in 60pt caps), and
          `figure.tsx` reads the same file for the wardrobe, so the man on the screen and the man
          the costume was resolved for cannot disagree. */}
      <InkWords x={370} y={553} w={152} h={22} text={SUBJECT_NAME || label(tk, 'masthead', 41)} fill={INK} />
      {Array.from({length: 6}, (_, i) => {
        const col = i % 2, row = Math.floor(i / 2);
        return (
          <g key={i}>
            <rect x={556 + col * 184} y={396 + row * 52} width={116} height={20}
              fill={rnd(v.seed(i * 17)) > 0.68 ? c.accent : period ? INK : PAPER_WHITE} opacity={period ? 0.62 : 0.88} />
            <rect x={680 + col * 184} y={396 + row * 52} width={42} height={20}
              fill={period ? INK : PAPER_WHITE} opacity={period ? 0.4 : 0.55} />
          </g>
        );
      })}
      <ChartPlot x={950} y={330} w={506} h={330} kind="line" bars={9} seed={v.seed(4)} live crash
        ground={shade(tn.card, 1)} grid={4} dir={tk.chart} label={label(tk, 'chartTitle', 4)} />
      <rect x={306} y={296} width={1200} height={62} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* THE MASTHEAD BAND (item 3) — a news graphic that says nothing is a placeholder. */}
      <InkWords x={344} y={306} w={560} h={42} text={label(tk, 'lowerThird', 7)} fill={period ? INK : PAPER_WHITE} />
      <rect x={306} y={296} width={1200} height={410} fill="none" stroke={INK} strokeWidth={STROKE * 1.4} />
      {/* the lower-third strap, over the bottom of the screen */}
      <rect x={306} y={620} width={780} height={86} fill={period ? shade(tn.floor, -1) : shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={306} y={620} width={22} height={86} fill={c.accent} />
      {/* THE LOWER THIRD (item 3) — the one strap a news frame exists to be read from. */}
      <InkWords x={352} y={628} w={420} h={34} text={label(tk, 'headline', 12)} fill={period ? INK : PAPER_WHITE} />
      <TextLines x={352} y={672} w={380} n={2} gap={13} th={5} seed={v.seed(16)} opacity={0.7} />
      {/* flanking wall monitors, both live */}
      {[46, 1556].map((px, i) => (
        <g key={i}>
          <Monitor x={px} y={352} w={314} h={210} content={i ? 'chart' : 'grid'} stand={false} seed={v.seed(30 + i * 4)} />
          <rect x={px + 20} y={584} width={274} height={30} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <TextLines x={px + 34} y={592} w={244} n={1} gap={12} th={6} seed={v.seed(20 + i)} opacity={0.75} />
        </g>
      ))}

      {/* --- floor, with the floor monitors and cable ramps a studio actually carries --- */}
      <rect x={0} y={STUDIO_FLOOR - 26} width={1920} height={26} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      <SlabFloor y={STUDIO_FLOOR} cols={30} rows={12} />
      {[86, 1774].map((px, i) => (
        <g key={i}>
          <Monitor x={px} y={784} w={146} h={100} content={i ? 'text' : 'chart'} seed={v.seed(50 + i)} />
          <rect x={px - 14} y={906} width={174} height={16} rx={6} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      ))}
      {Array.from({length: 5}, (_, i) => (
        <rect key={i} x={260 + i * 320} y={824} width={124} height={18} rx={8} fill={shade(tn.body, -2)}
          stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      ))}

      {/* --- the desk. Anchors first, then the slab and its front panel over their laps.
              The co-anchor gets a FACE. `DIM` desaturates fills only, so a grey figure at this
              scale with `showFace={false}` is a blank head over a same-width torso — the headless
              pill COMPARISON logged against the thumbnail crowd, and it was back here at 1.12. --- */}
      {/* THE ANCHOR IS NOT THE SUBJECT (QA_WATCH item 16). This seat was `pal={LIGHT}` — the
          episode's own hero costume — so on both broadcastDesk scenes Madoff sat behind the news
          desk reporting his own fraud (t120 f20071, t153 f26653). A news studio is the one room in
          the set where the subject is definitionally NOT in the room; he is the story being read
          out, and he is now on the screen behind them. Only the PALETTE changes here, so every
          staging anchor for this template still describes the same two heads in the same places. */}
      <StickFigure pose={A.sit(f)} x={CAPTION_SAFE_X + 400 + v.off(2, 40)} y={866} scale={1.2} facing={-1} view="front"
        expr={FACES.earnest} pal={DIM} frame={f} idle="gesture" />
      <StickFigure pose={A.sit(f + 53)} x={790 + v.off(3, 40)} y={870} scale={1.12} facing={1} view="front"
        expr={FACES.neutral} pal={DIM} frame={f} idle="subtle" />
      <path d="M 340 908 L 1580 908 L 1700 972 L 224 972 Z" fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <rect x={224} y={972} width={1476} height={108} fill={tn.card} stroke={INK} strokeWidth={STROKE} />
      {/* the desk face is built of jointed panels, not one slab: eleven joints across 1476 units is
          the difference between a lit desk front and the frame's largest flat region */}
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.4}>
        {Array.from({length: 11}, (_, i) => (
          <line key={i} x1={224 + ((i + 1) * 1476) / 12} y1={972} x2={224 + ((i + 1) * 1476) / 12} y2={1080} />
        ))}
      </g>
      {/* the desk's lit front graphic: a flat accent band with a logo panel, not a gradient */}
      <rect x={262} y={996} width={1400} height={58} fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={286} y={1004} width={112} height={42} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      {/* PERIOD: the desk front is a painted board, so its lettering is ink on the paint rather than
          a lit strap */}
      <InkWords x={434} y={1004} w={800} h={38} text={label(tk, 'lowerThird', 19)} fill={period ? INK : PAPER_WHITE} />
      {/* what is on the desk: papers, a mug, a mic on a stand, a confidence monitor */}
      <Papers x={520 + v.off(4, 60)} y={900} n={2 + v.pick(5, 3)} s={0.66} seed={v.seed(9)} />
      <Papers x={1364} y={904} n={1 + v.pick(6, 3)} s={0.6} seed={v.seed(13)} />
      <rect x={1204} y={866} width={44} height={40} rx={6} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <path d="M 1248 874 q 22 8 0 18" fill="none" stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      {/* the mic on its stand. PERIOD: a WATER CARAFE and a tumbler in its place — what stands on a
          rostrum table when there is nothing to speak into. */}
      {period ? (
        <g>
          <path d="M 984 906 L 984 856 Q 984 838 1000 826 L 1000 806 L 1030 806 L 1030 826
                   Q 1046 838 1046 856 L 1046 906 Z"
            fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <line x1={986} y1={868} x2={1044} y2={868} stroke={INK} strokeWidth={STROKE_THIN * 0.7} opacity={0.6} />
          <rect x={1058} y={862} width={38} height={46} rx={4} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
          <line x1={1058} y1={880} x2={1096} y2={880} stroke={INK} strokeWidth={STROKE_THIN * 0.6} opacity={0.5} />
        </g>
      ) : (
        <g>
          <ellipse cx={1010} cy={906} rx={40} ry={11} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <path d="M 1010 902 L 1010 846 L 1074 812" fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.4} />
          <ellipse cx={1082} cy={808} rx={20} ry={13} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN}
            transform="rotate(-28 1082 808)" />
        </g>
      )}
      <Monitor x={356} y={806} w={168} h={104} content="text" stand={false} seed={26} />

      {/* --- near plane: the studio camera, bible §6.8's dark foreground mass. Drawn last so it
              occludes the desk, which is the only way a near plane reads as near.
              PERIOD: a PLATE CAMERA — a bellows box on a wooden tripod with a brass lens barrel and
              the dark cloth over the back — which is the same near-plane mass at the same place, is
              unambiguously the thing pointing at the table, and is the one substitution in this
              work order that makes the frame MORE specific about its century rather than less. --- */}
      {period ? (
        <g>
          {/* tripod: three splayed timber legs with a brace ring */}
          {[-1, 0.1, 1].map((k, i) => (
            <g key={i}>
              <path d={`M ${1726 + k * 16} 900 L ${1726 + k * 176} 1072 l 22 -8 L ${1726 + k * 16 + 20} 900 Z`}
                fill={shade(tn.floor, -2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
            </g>
          ))}
          <path d="M 1610 984 L 1846 984" stroke={INK} strokeWidth={STROKE_THIN * 1.4} fill="none" />
          {/* the bellows box: rear standard, tapered bellows, front standard, lens */}
          <rect x={1690} y={846} width={200} height={62} fill={shade(tn.floor, -2)} stroke={INK} strokeWidth={STROKE} />
          <rect x={1746} y={694} width={150} height={168} fill={shade(tn.floor, -2)} stroke={INK} strokeWidth={STROKE} />
          <path d="M 1746 706 L 1610 748 L 1610 856 L 1746 850 Z" fill={shade(tn.floor, -3)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          <g stroke={INK} strokeWidth={STROKE_THIN * 0.8} opacity={0.75}>
            {Array.from({length: 6}, (_, i) => (
              <line key={i} x1={1746 - i * 22} y1={706 + i * 7} x2={1746 - i * 22} y2={850 - i * 0} />
            ))}
          </g>
          <rect x={1560} y={742} width={54} height={116} fill={shade(tn.floor, -2)} stroke={INK} strokeWidth={STROKE} />
          <circle cx={1560} cy={800} r={44} fill={shade(tn.floor, -3)} stroke={INK} strokeWidth={STROKE} />
          <circle cx={1560} cy={800} r={22} fill={INK} />
          {/* the dark cloth thrown over the rear standard */}
          <path d="M 1738 690 q 90 -34 166 12 q -14 96 -30 132 q -60 -46 -136 -30 Z"
            fill="#1a1a1a" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
          {/* the plate holders leaning against a leg */}
          <rect x={1856} y={968} width={54} height={104} fill={shade(tn.floor, -1)} stroke={INK} strokeWidth={STROKE_THIN}
            transform="rotate(8 1883 1020)" />
        </g>
      ) : (
      <g>
        {/* pedestal: column, splayed legs, castors */}
        <rect x={1704} y={840} width={44} height={190} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE} />
        {[-1, 0.15, 1].map((k, i) => (
          <g key={i}>
            <line x1={1726} y1={1006} x2={1726 + k * 168} y2={1064} stroke={INK} strokeWidth={STROKE * 1.5} strokeLinecap="round" />
            <circle cx={1726 + k * 168} cy={1068} r={19} fill={INK} />
            <circle cx={1726 + k * 168} cy={1068} r={7} fill={shade(tn.body, 1)} />
          </g>
        ))}
        {/* body, hood, lens, viewfinder */}
        <rect x={1580} y={694} width={306} height={158} rx={10} fill="#151515" stroke={INK} strokeWidth={STROKE} />
        <rect x={1608} y={716} width={104} height={62} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
        <TextLines x={1620} y={730} w={80} n={3} gap={13} th={4} seed={5} opacity={0.55} />
        <path d="M 1540 716 L 1580 700 L 1580 846 L 1540 830 Z" fill="#101010" stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        <circle cx={1524} cy={773} r={54} fill="#0d0d0d" stroke={INK} strokeWidth={STROKE} />
        <circle cx={1524} cy={773} r={30} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
        <rect x={1746} y={636} width={130} height={72} rx={8} fill="#151515" stroke={INK} strokeWidth={STROKE} />
        <rect x={1762} y={652} width={98} height={44} fill={shade(tn.deep, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        {/* the tally lamp: one 22px fill switching on its own clock — no geometry moves at all */}
        <circle cx={1552} cy={676} r={17}
          fill={blinkOn(f, 2.5, 96, 54) ? c.accent : shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
        {/* the cable, taped down across the floor */}
        <path d="M 1726 1044 q -190 42 -360 6 q -180 -38 -330 22" fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.6} />
      </g>
      )}
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 11. crowdQueue — the reference's breadline / bank-run device: many figures, depth, a building line
//
// Keyed `grey` — "institutional, clinical, bureaucratic, drained, loss", and the reference's own
// version of this frame (depression_montage_verified.jpg, 15:00) is a packed mass of grey heads with
// exactly one coloured figure in it. It is `bankExterior`'s opposite number: the same institution,
// the other mood, on a different key so the two never read as one set redressed.
//
// The queue is `CrowdColumn`, which is why that component exists: a queue is a scale ramp along a
// diagonal, drawn far-to-near so each nearer body occludes the one behind it. `CrowdRow` would give
// a chorus line at one depth, which is what the first render of `cityStreet` learned the hard way.
// ---------------------------------------------------------------------------
const QUEUE_KERB = 786;

const CrowdQueue: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // THE TAKE (item 2) and THE PLACARDS (item 3). QA: "the protest placards at t001c f370 / t097
  // f15984 (three signs, all glyphs, held up as the focal point)". A placard is a thing somebody
  // wrote; it now says something, and the institution's own name board does too.
  //
  // ONE SIGN PER ENTRY IN `placards=`, AND NO ENTRIES MEANS NO SIGNS (see `MAX_PLACARDS`). The queue
  // is the picture; the slogans are a register the scene has to ask for. Everything else in this
  // frame is unchanged when they are absent, so the queue keeps its own density: three crowd layers,
  // the shut frontage, the barriers, the street furniture.
  const tk = useTake();
  const v = useVary();
  const signs = tk.placards;
  return (
    <Frame>
      {/* --- A SKY, IN FLAT BANDS (QA_WATCH item 15). The `grey` key's `bg` is a pure neutral by
              design ("institutional and drained: ground neutral"), and `Frame` paints it edge to
              edge — so this exterior had "a flat mid-grey sky with no sky feeling at all", one
              #949494 field from the top of the picture to the rooflines. The fix cannot be a
              gradient (Chromium dithers them and the flat-fill metric collapses) and should not be
              chroma (this frame already spends 0.33 coverage), so it is what the reference does:
              two more FLAT bands, darker at the top and hazier toward the horizon. Same neutral
              family, no coloured coverage added, and the banding is what reads as depth. --- */}
      <rect x={0} y={0} width={1920} height={132} fill={shade(c.bg, -2)} />
      <rect x={0} y={132} width={1920} height={124} fill={shade(c.bg, -1)} />
      <rect x={0} y={330} width={1920} height={QUEUE_KERB - 330} fill={shade(c.bg, 1)} />
      {/* --- the building line behind: two bands, the far one lifted two rungs.
              QA also called the buildings violet, and the obvious move — running the FAR band off
              the neutral `tn.back`, as `BuildingBand`'s own period branch does — was tried and
              MEASURED FIRST: it took this frame to 0.240 coloured coverage against a 0.30-0.40
              target and cost 19 rich colour buckets (98 -> 79), which is COMPARISON §4 MISS #1
              reopening on the one exterior that scores best on it. The buildings keep their key.
              What was actually wrong with them is that they stood against nothing; they now stand
              against a banded sky, and the depth reads off the bands instead of off the hue. --- */}
      <BuildingBand baseY={470} x0={-80} x1={2000} n={9 + v.pick(1, 3)} seed={v.seed(61)} depth={2} minH={180} maxH={400} opacity={0.55} />
      <BuildingBand baseY={628} x0={620} x1={2000} n={4 + v.pick(2, 3)} seed={v.seed(37)} depth={1} minH={230} maxH={430} />

      {/* --- the institution the queue is for, at the far end of the line on the left --- */}
      <rect x={-40} y={196} width={700} height={QUEUE_KERB - 196} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} />
      <g stroke={INK} strokeWidth={STROKE_THIN * 0.55} opacity={0.32}>
        {Array.from({length: 13}, (_, i) => (
          <line key={i} x1={-40} y1={196 + ((i + 1) * (QUEUE_KERB - 196)) / 14} x2={660} y2={196 + ((i + 1) * (QUEUE_KERB - 196)) / 14} />
        ))}
      </g>
      <UnitWall x={-20} y={236} w={660} h={210} cols={5} rows={1} handle={false}
        fill={shade(tn.deep, -1)} carcass={shade(tn.card, -2)} />
      <rect x={-40} y={462} width={700} height={26} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* The institution's name across its own frontage (item 3). */}
      <InkWords x={40} y={498} w={560} h={52} text={label(tk, 'masthead', 5)} />
      {/* the door, shut, with a shutter half down and a notice pasted on it */}
      <rect x={214} y={568} width={244} height={198} fill={shade(tn.deep, -2)} stroke={INK} strokeWidth={STROKE} />
      <RibbedPanel x={214} y={568} w={244} h={96} ribs={7} dir="h" fill={shade(tn.body, -1)} />
      <rect x={258} y={674} width={96} height={72} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
      <TextLines x={272} y={690} w={70} n={4} gap={14} th={4} seed={v.seed(11)} opacity={0.7} />
      <Steps x0={158} x1={520} yTop={766} yBottom={QUEUE_KERB + 32} n={3} inset={44} />
      {/* a lamp bracket and a hanging sign on the frontage */}
      <rect x={548} y={520} width={16} height={132} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <rect x={504} y={652} width={104} height={68} fill={shade(tn.body, -1)} stroke={INK} strokeWidth={STROKE} />
      <TextLines x={518} y={668} w={76} n={3} gap={14} th={4} seed={v.seed(17)} opacity={0.75} />

      {/* --- pavement --- */}
      <SlabFloor y={QUEUE_KERB} cols={22} rows={9} />
      <rect x={0} y={QUEUE_KERB - 12} width={1920} height={16} fill={shade(tn.floor, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />

      {/* --- the crowd, in three layers: heads packed against the frontage, a milling row in front
              of them, then the queue itself running out of the door toward the camera. --- */}
      <CrowdHeads y={760} x0={80} x1={1320} n={11 + v.pick(3, 5)} rows={3} r={18} seed={v.seed(9)} alive={0.05} />
      <CrowdRow y={798} x0={140} x1={1120} n={8 + v.pick(4, 3)} scale={0.48} seed={v.seed(21)} dz={12} alive={0.12} />
      {/* `faceScale` is doing real work here: the near end of this queue is drawn at 1.02, and a
          featureless grey head at that size reads as a pill rather than a person. Everything under
          0.82 stays anonymous, which is the §6.5 hierarchy the crowd exists for. */}
      <CrowdColumn xFar={470} yFar={812} xNear={1420} yNear={1026} n={11 + v.pick(5, 5)}
        scaleNear={1.02} scaleFar={0.36} seed={v.seed(4)} facing={-1} view="profile" alive={0.15}
        expr={FACES.tired} />
      {/* placards over the crowd — the reference carries one in BOTH captured thumbnails, and in
          both of them it is LETTERED ("GIVE US WORK, NOT HUNGER", "WE GOT SOLD OUT"). Drawn only for
          the entries `placards=` actually carries: one sign, one board. The third slot stood at
          x=1258 with its board at y 592-732, which is exactly where the coloured hero's head is —
          drawn later, he painted over its bottom line — so it now stands right of him and higher. */}
      {signs[0] ? (
        <Placard x={352 + v.off(6, 40)} y={806} w={158} h={104} tilt={-9 + v.off(7, 4)} poleH={168} seed={v.seed(3)}
          label={signs[0]} />
      ) : null}
      {signs[1] ? (
        <Placard x={846 + v.off(8, 50)} y={862} w={190} h={122} tilt={7 + v.off(9, 4)} poleH={196} seed={v.seed(8)}
          label={signs[1]} />
      ) : null}
      {signs[2] ? (
        <Placard x={1516 + v.off(10, 40)} y={930} w={224} h={140} tilt={-5 + v.off(11, 4)} poleH={250} seed={v.seed(14)}
          label={signs[2]} />
      ) : null}

      {/* --- barriers between the queue and the kerb --- */}
      <Fence x0={40} x1={780} y={840} h={62} posts={11} opacity={0.55} />
      <RopeLine x0={1500} x1={1880} y={1002} posts={3} s={1.0} />

      {/* --- near plane: the coloured hero at the head of the near end of the line --- */}
      <StickFigure pose={A.stand(f)} x={CAPTION_SAFE_X + 460 + v.off(12, 46)} y={1010} scale={1.16} facing={-1}
        view="front" expr={FACES.worried} pal={LIGHT} frame={f} idle="gesture" />
      {/* someone walking past the head of the queue (WO-24) */}
      <Passerby y={1076} x0={-240} x1={2160} scale={1.04} seed={v.seed(23)} at={96} />

      {/* --- street furniture: a lamp standard, a bin, crates, a dropped paper --- */}
      <g>
        <rect x={1616} y={QUEUE_KERB - 402} width={20} height={402} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
        <path d={`M 1626 ${QUEUE_KERB - 402} q 0 -38 46 -38`} fill="none" stroke={INK} strokeWidth={STROKE_THIN * 1.4} />
        <rect x={1650} y={QUEUE_KERB - 458} width={58} height={22} rx={9} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
      </g>
      <RibbedPanel x={1758} y={936} w={92} h={112} ribs={6} dir="v" fill={tn.body} />
      <rect x={1748} y={922} width={112} height={16} rx={6} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      <CaseStack x={92} baseY={1042} n={2 + v.pick(13, 3)} s={0.78} seed={v.seed(27)} />
      <BoxStack x={1560} baseY={1076} n={1 + v.pick(14, 3)} s={0.72} seed={v.seed(33)} />
      {[[300, 1050], [980, 1064]].map(([px, py], i) => (
        <g key={i} transform={`rotate(${(rnd(v.seed(i * 13)) - 0.5) * 44} ${px + v.off(15 + i, 40)} ${py})`}>
          <rect x={px - 52} y={py - 34} width={104} height={68} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <TextLines x={px - 40} y={py - 20} w={80} n={4} gap={13} th={3.6} seed={v.seed(i * 9)} opacity={0.55} />
        </g>
      ))}
      <Cone x={1892} y={1046} s={0.72} />
      {/* One saturated note on a drained key: a shopfront at the right edge under a coloured awning
          (bible §5, and COMPARISON fix #5 — a `grey`-keyed frame must still carry a saturated
          object). It gets a window and a fascia under the awning: the first build hung the awning
          on nothing, so it read as a red banner floating against a building line. */}
      <rect x={1648} y={606} width={286} height={QUEUE_KERB - 606} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE} />
      <rect x={1656} y={622} width={270} height={44} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <InkWords x={1678} y={628} w={226} h={28} text={label(tk, 'masthead', 43)} fill={PAPER_WHITE} />
      <RibbedPanel x={1656} y={666} w={270} h={40} ribs={8} dir="v" fill={c.accent} />
      <Glazing x={1668} y={716} w={246} h={QUEUE_KERB - 716} bays={3} rows={1} pane={shade(tn.deep, -2)} sill={false} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 12. closeUpPortrait — one character large in frame for the emotional beats
//
// Keyed `alarm`. COMPARISON fix #2 is that our detected cut rate is 8.94/min against the reference's
// 12.5 because "wide↔medium on identical artwork is not a visible cut" — none of the six is in
// director.tsx's FOCUS map, so no scene ever gets a closeup framing. This template is the other half
// of that fix: a scene that IS a close-up at wide framing, so the cut into and out of it is a real
// change of picture whatever the shot planner does with it.
//
// THE DENSITY PROBLEM, stated because it is the whole difficulty of this template. A head drawn at
// this size is a single flat skin region covering ~23% of the frame, and flat fill is a DENSITY
// metric — a big flat mass drives it toward the empty end of the band. So the room behind the figure
// is drawn at full density (glazed wall with a skyline through it, panelling, a chart, a bookcase, a
// working desk) rather than as the "simple background" a close-up would normally get. Everything
// back there is at NORMAL scale, which is also what sells the head as close: the depth cue is the
// size ratio, not a blur we are not allowed to paint.
//
// The hero takes `idle="none"`. At scale 5.6 the idle system's few units of hip translation become
// ~40px of a 660px-wide head, which moves the frame's largest mass across a third of the lock grid.
// The motion in this frame is the blink and gaze (which run off `frame` regardless of idle level and
// move two 38px discs), the clock, and one background figure.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// HEADROOM AND THE SCALE READ (QA_WATCH 2026-08-17 item 10, MED-HIGH).
//
// QA, on the most-used environment in the episode (28 scenes): "The head is cut off by the top frame
// edge, and a full-size room sits behind it at normal scale, with background figures roughly
// one-sixth the height of the face — it reads as a head pasted onto a wide shot rather than a
// close-up. Two of those background figures have no visible body (heads floating at desk level)."
//
// Three separate faults, and they need three separate fixes:
//
//   1. NO HEADROOM. `StickFigure` puts the head centre at `y - (spine + neck + head) * scale` =
//      `y - 196s` and the crown half a head above that, so at 5.6× off a hip at y=1720 the crown
//      landed at 264 with a 716-unit head under it — 66% of frame height, with the `subtle` idle
//      swinging it. 4.75× off a hip at 1400 puts the crown at 165 with a 608-unit head: still the
//      largest thing in the frame by a distance, now with room above it and margin for the idle.
//      A portrait with no air over the head reads as a framing error even when nothing is clipped.
//   2. THE ROOM COMPETED WITH THE FACE. We cannot blur (a blur is a gradient by another name and
//      Chromium dithers it) and we cannot empty the room (flat fill is two-sided). So the room is
//      KNOCKED BACK instead: one flat ink scrim across everything behind the head. Every plane under
//      it is still a flat fill — a uniform composite maps equal pixels to equal pixels — so the
//      density is untouched and only the contrast drops, which is the depth cue a close-up needs and
//      the only one the style rules leave available.
//   3. HEADS AT DESK LEVEL. The two-seat row at y=718 sat BEHIND a desk whose top is at 796, so both
//      occupants were a head and shoulders floating over the desk with no body anywhere. They are
//      replaced by case and box stacks on the same marks, which is the substitution rule: the mass
//      stays, the anatomy stops being wrong. The standing figure at the right keeps the room
//      populated and carries WO-24's motion.
// ---------------------------------------------------------------------------
const PORTRAIT_SCALE = 4.75;
const PORTRAIT_CROWN = 150;   // units of headroom over the crown at the default framing
/** `StickFigure` puts the crown `(spine + neck + head + headHalfHeight) * scale` above the hip. */
const PORTRAIT_CROWN_TO_HIP = 259.96;
const PORTRAIT_WALL = 636;
/** How far the room behind a close-up is knocked back. Flat ink, flat result — see note 2 above. */
const PORTRAIT_SCRIM = 0.24;

const CloseUpPortrait: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  const v = useVary();
  // THE TAKE'S FRAMING. This template is used 28 times in one episode and QA measured it as one
  // picture: the head is ~55% of the frame, so nothing that only redresses the room behind it can
  // change the picture much. What does is the framing OF THE HEAD and how far back the room sits —
  // both of which a real close-up varies between takes anyway. The hip is DERIVED from the crown so
  // that every scale keeps its headroom; the headroom itself moves by ±34 units, which is a tighter
  // or looser portrait, never a clipped one.
  const headS = PORTRAIT_SCALE - 0.2 + v.pick(30, 4) * 0.13;
  const crown = PORTRAIT_CROWN + v.off(31, 34);
  const headHip = crown + PORTRAIT_CROWN_TO_HIP * headS;
  const scrim = PORTRAIT_SCRIM - 0.08 + v.pick(32, 4) * 0.055;
  // PERIOD (WO-27): this is the room WO-26 warned about — the template "depicts nowhere" and in fact
  // depicts a modern office behind the head (two monitors, a keyboard, a desk phone, a printer and a
  // skyline in the bay). All of those substitute in the library except the PRINTER, which is here.
  const period = usePeriod();
  return (
    <Frame>
      <Ceiling y={128} lights={3} />
      <Dentils x0={0} x1={1920} y={112} n={46} h={22} />
      {/* --- the room behind: panelled wall over a dado, a glazed bay with the city through it --- */}
      {/* The panel runs are deliberately FINE (24 and 34 bays). A head drawn at 5.6× is one flat
          skin region covering ~23% of the frame, so every visible part of the room has to carry
          more edges than it otherwise would just to hold the template inside the flat-fill band. */}
      <UnitWall x={0} y={140} w={1920} h={300} cols={24} rows={1} handle={false} fill={tn.card} carcass={tn.deep} />
      <rect x={0} y={432} width={1920} height={22} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      <UnitWall x={0} y={452} w={1920} h={184} cols={34} rows={1} handle={false} fill={shade(tn.card, -1)} carcass={tn.deep} />
      <rect x={0} y={PORTRAIT_WALL - 22} width={1920} height={22} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* The window, with a DISTANT skyline behind the glass. The first build put four 110-220 unit
          buildings in a 296-unit opening: at that size `BuildingBand`'s shutters and doors are
          legible, so the view read as a wall of garage doors rather than as somewhere further off.
          Small units, lifted two rungs, read as distance without haze or a gradient. */}
      <rect x={72} y={168} width={560} height={296} fill={shade(c.bg, 3)} />
      <BuildingBand baseY={464} x0={64} x1={640} n={6 + v.pick(3, 3)} seed={v.seed(13)} depth={2} minH={56} maxH={132} opacity={0.75} />
      <Glazing x={72} y={168} w={560} h={296} bays={4} rows={2} pane={null} />
      {/* charts and a clock on the wall, and a bookcase under them */}
      <WallFrame x={700} y={180} w={306} h={216} art={v.one(4, ['line', 'bars', 'scape'] as const)} seed={v.seed(7)} />
      <WallFrame x={1046} y={180} w={220} h={216} art={v.one(5, ['bars', 'scape', 'line'] as const)} seed={v.seed(11)} />
      <circle cx={1420} cy={252} r={56} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE} />
      <line x1={1420} y1={252} x2={1448} y2={266} stroke={INK} strokeWidth={STROKE_THIN} strokeLinecap="round" />
      <ClockHand cx={1420} cy={252} r={40} f={f} />
      <UnitWall x={1546} y={176} w={352} h={300} cols={1} rows={3} handle={false} />
      {Array.from({length: 30}, (_, i) => {
        const col = i % 10, row = Math.floor(i / 10);
        return <rect key={i} x={1566 + col * 32} y={196 + row * 100} width={24} height={56 + rnd(v.seed(i * 5)) * 12}
          fill={rnd(v.seed(i * 3)) > 0.76 ? c.accent : shade(tn.card, -(i % 3))} stroke={INK} strokeWidth={2.6} />;
      })}
      <RibbedPanel x={716} y={456} w={470} h={176} ribs={13} dir="v" />

      {/* --- floor and the working desk across the mid-ground. Both are BEHIND the head, and both
              are what stop the picture reading as a portrait on a plain wall. --- */}
      <SlabFloor y={PORTRAIT_WALL} cols={30} rows={12} />
      {/* WAS a two-seat row at y=718 behind a desk whose top is at 796 — see note 3 above: both
          occupants rendered as heads and shoulders floating at desk level with no bodies. Same
          footprint, no anatomy. */}
      <CaseStack x={244 + v.off(6, 30)} baseY={782} n={2 + v.pick(7, 2)} s={0.72} seed={v.seed(9)} />
      <BoxStack x={462 + v.off(8, 30)} baseY={786} n={2} s={0.66} seed={v.seed(17)} />
      <StickFigure pose={A.stand(f + 41)} x={1660 + v.off(9, 60)} y={772} scale={0.78} facing={-1} view="profile"
        pal={DIM} showFace={false} frame={f} idle="subtle" seed={v.seed(51)} />
      {/* a radiator under the window and a pinned run beside the bookcase — both are on the parts
          of the wall the head does NOT cover, which is the only place added density pays */}
      <RibbedPanel x={96} y={486} w={520} h={140} ribs={15} dir="v" />
      {Array.from({length: 4}, (_, i) => {
        const px = 1512 + (i % 2) * 214, py = 496 + Math.floor(i / 2) * 76;
        return (
          <g key={i} transform={`rotate(${(rnd(v.seed(i * 11)) - 0.5) * 9} ${px + 92} ${py + 30})`}>
            <rect x={px} y={py} width={184} height={60} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
            <TextLines x={px + 14} y={py + 12} w={152} n={3} gap={14} th={4} seed={v.seed(i * 7)} opacity={0.6} />
            <circle cx={px + 92} cy={py + 6} r={6} fill={c.accent} />
          </g>
        );
      })}
      <Desk x={40} y={796} w={720} legH={132} />
      <Monitor x={96} y={648} w={190} h={140} content={v.one(10, ['chart', 'grid', 'text'] as const)} seed={v.seed(3)} />
      <Monitor x={310} y={664} w={162} h={124} content={v.one(11, ['text', 'chart', 'grid'] as const)} seed={v.seed(7)} />
      <Keyboard x={330} y={792} w={160} />
      <DeskPhone x={548} y={794} s={0.9} />
      <Papers x={690} y={784} n={2} s={0.7} seed={v.seed(19)} />
      <CaseStack x={140 + v.off(12, 40)} baseY={1024} n={2 + v.pick(13, 3)} s={0.7} seed={v.seed(37)} />
      <Desk x={1420} y={824} w={480} legH={150} fill={shade(tn.card, -1)} />
      <Papers x={1560 + v.off(14, 40)} n={2 + v.pick(15, 2)} y={814} s={0.78} seed={v.seed(23)} />
      <BoxStack x={1830} baseY={816} n={1 + v.pick(16, 3)} s={0.6} seed={v.seed(29)} />
      {/* a printer on the right desk: paper tray, output shelf, panel.
          PERIOD: a stack of bound LEDGERS with an oil lamp standing on them — the same mass on the
          same desk, and the lamp keeps the small accent the printer's panel light was carrying. */}
      {period ? (
        <g>
          <LedgerStack x={1690} y={816} w={172} n={3} seed={21} />
          <rect x={1848} y={766} width={12} height={50} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <ellipse cx={1854} cy={816} rx={30} ry={10} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8} />
          <path d="M 1830 766 q 24 -46 48 0 Z" fill={c.accent} stroke={INK} strokeWidth={STROKE_THIN} strokeLinejoin="round" />
          <rect x={1836} y={742} width={36} height={12} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.6} />
        </g>
      ) : (
        <g>
          <rect x={1690} y={730} width={172} height={86} rx={8} fill={shade(tn.body, 1)} stroke={INK} strokeWidth={STROKE} />
          <rect x={1706} y={746} width={92} height={22} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
          <rect x={1812} y={746} width={34} height={12} rx={4} fill={c.accent} />
          <rect x={1706} y={784} width={140} height={16} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      )}
      <Plant x={1240 + v.off(17, 50)} y={824} s={0.9 + v.pick(18, 3) * 0.1} seed={v.seed(5)} />
      <Chair x={620 + v.off(19, 70)} y={1060} s={1.35} facing={1} fill={shade(tn.body, -2)} />

      {/* --- the room goes BACK. One flat ink scrim over everything above, nothing under it: a
              uniform composite over flat fills is still flat fills, so the density this template
              works so hard for is untouched and only the contrast drops (note 2 above). --- */}
      <rect x={0} y={0} width={1920} height={1080} fill={INK} opacity={scrim} />

      {/* --- the subject. Drawn last, over the scrim, with the outline weight divided by the same
              factor so the linework stays at the canon's ~8px at 1920 instead of 38px. --- */}
      {/* `subtle`, not `none` (WO-24). At 5.6x a normal idle would swing a head covering 23% of
          the frame; at `subtle` the same rig moves it a few units, which on THIS figure is the only
          motion in the template big enough to cross the bible's |Δ| 1.0 threshold — held at `none`
          it measured 100% motionless with a mean |Δ| of 0.24. A reaction shot that breathes is also
          what the reference's own pushed-face frames do. */}
      {/* The head shifts along its own mark by ±44 units — a close-up recomposed, not a new
          template — and stays right of `CAPTION_SAFE_X`. */}
      {/* QA_WATCH (reviewer note, 2026-09-04, LOW): 28 uses of this template read as one generic
          reaction because the face was pinned to FACES.shock every time. The take is still a
          "shocked reaction" beat by design, but shock has a family of close relatives — picked
          per take off the same deterministic seed everything else here already uses, so the same
          scene id still always draws the same face. */}
      <StickFigure pose={A.stand(0)} x={1180 + v.off(20, 62)} y={headHip} scale={headS} facing={-1} view="front"
        expr={v.one(40, [FACES.shock, FACES.worried, FACES.hardened, FACES.awe] as const)}
        pal={LIGHT} frame={f} idle="subtle" idleGain={0.3}
        lineW={STROKE / headS} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// 13. chartBoard — a large flat chart as the SUBJECT, with a figure presenting to it
//
// Keyed `gold`: the pitch, the growth curve, the good years — the beat this frame serves in a
// finance explainer, and the second use of a key the first six never reached.
//
// The chart is `ChartPlot` from the library rather than a bespoke drawing, because a studio backdrop
// needs the same object (see `broadcastDesk` above) and two hand-built charts would drift apart.
// `crash` puts the reference's red down-leg across it, which is this frame's single saturated note.
// ---------------------------------------------------------------------------
const BOARD_FLOOR = 700;

const ChartBoard: React.FC = () => {
  const f = useCurrentFrame();
  const c = useSceneColors();
  const tn = useSceneTones();
  // PERIOD (WO-27): a chart on an EASEL with a presenter beside it and an audience in front is a
  // nineteenth-century lecture exactly. The only dated objects are the laptop and the projector body
  // on the side table.
  const period = usePeriod();
  // The board's series was a literal `seed={6}`, so every scene that cut to this template held the
  // SAME bars and the SAME line. A first pass at that used `React.useId()` — React's per-mount
  // identity — because a template takes no props and there was no scene id to seed from. It did not
  // hold: QA still measured this room as four near-identical pictures across the episode, because a
  // mount id varies with tree POSITION, not with which scene is playing, and the one shot each scene
  // mounts lands in the same position every time. The take (see the block comment at the top of this
  // file) is the scene's real identity, and it dresses the whole room, not just the series.
  const tk = useTake();
  const v = useVary();
  const chartSeed = v.seed(6);
  // The presenting arm. `A.stand` returns a plain Pose object, so the two joint angles that swing
  // the near arm toward the board are an override on it rather than a new action.
  //
  // 104°, NOT the 130° the first build used. In a front view the head sits directly above the
  // shoulder joint, so an arm raised STEEPLY pivots its elbow inside the head box and the upper arm
  // — drawn after the head, as all near limbs are — is painted straight across the face. 104° puts
  // the elbow outboard of the head's half-width first and only then lifts the forearm, which is the
  // gesture reading as pointing rather than as scratching an ear.
  // STAGING VARIATION (review: 28 chartBoard scenes across the episode read as "the same picture
  // again" in sampled frames, because the presenter held one fixed pose every time regardless of
  // which take was playing. A third of takes now turn him to address the room instead of pointing
  // at the board -- arm dropped to an open, relaxed gesture -- so repeats read as different moments
  // in the same room rather than a frozen photo of the first one.
  const pointingAtBoard = v.pick(23, 3) !== 0;
  const presenting = pointingAtBoard
    ? {...A.stand(f), armNearShoulder: 104, armNearElbow: 34}
    : {...A.stand(f), armNearShoulder: 24, armNearElbow: 98};
  return (
    <Frame>
      <Ceiling y={150} lights={3} />
      <Dentils x0={0} x1={1920} y={134} n={44} h={22} />
      {/* --- the room: a panel band under the ceiling, a picture rail, a papered wall --- */}
      <UnitWall x={0} y={162} w={1920} h={132} cols={18} rows={1} handle={false} fill={tn.card} carcass={tn.deep} />
      <rect x={0} y={290} width={1920} height={18} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN} />
      {/* THE WALL DROPS ITS CHROMA, THE PROPS KEEP THEIRS (QA_WATCH item 15).
          The papered wall is the largest flat plane in the frame — 1920 x 394, better than a third of
          it — and it was `tn.panel`, i.e. `shade(c.bg, -1)`, which on the gold key is HSV S 0.81.
          Against gold chairs and a gold-barred chart on top of it, QA read the room as "saturated
          yellow wall panels + yellow chairs + yellow chart bars, so the data barely separates from
          the wall": the SUBJECT was the same colour as the room it stood in. Measured at native 1280
          the four chartBoard frames ran 0.218–0.236 all-pixel saturation against a 0.15–0.22 target.
          `tn.card` — `shade(c.mid, +3)`, the light material tone — is the SAME gold at HSV S 0.33,
          less than half the chroma and several rungs lighter. So the wall stays papered gold and
          stops competing: the chart's bars, its accent leg, the chairs and the rug are now the
          saturated things in the frame, which is where this key's chroma is supposed to be spent.
          NOT neutralised to `c.shell`, which was tried and measured first: it took coverage to
          0.171–0.193 against a 0.30–0.40 target and cost 7 rich colour buckets a frame — reopening
          COMPARISON §4 MISS #1, which explicitly says not to fix chroma by deleting planes. */}
      <rect x={0} y={306} width={1920} height={BOARD_FLOOR - 306} fill={shade(tn.card, v.rung(0, 51))} />
      <g stroke={INK} strokeWidth={2} opacity={0.14}>
        {Array.from({length: 38}, (_, i) => <line key={i} x1={i * 52} y1={306} x2={i * 52} y2={BOARD_FLOOR} />)}
      </g>
      <rect x={0} y={BOARD_FLOOR - 34} width={1920} height={34} fill={tn.card} stroke={INK} strokeWidth={STROKE_THIN} />

      {/* --- floor first, THEN the board. The first build drew the board before `SlabFloor`, and the
              floor's full-width rect painted straight over the marker tray and both easel legs —
              the board appeared to end at the horizon line with nothing holding it up. --- */}
      <SlabFloor y={BOARD_FLOOR} cols={32} rows={12} />
      <path d="M 300 940 L 1720 940 L 1880 1080 L 140 1080 Z" fill={shade(tn.floor, 2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
      <path d="M 348 968 L 1672 968 L 1802 1064 L 218 1064 Z" fill="none" stroke={INK} strokeWidth={STROKE_THIN} opacity={0.55} />

      {/* --- the board itself: an easel frame, the plot in it, a tray of markers under it --- */}
      <rect x={210} y={196} width={912} height={534} fill={shade(tn.body, -2)} stroke={INK} strokeWidth={STROKE} />
      {/* 16 bars and 9 gridlines. The plot's pale ground is ~20% of the frame, so the SERIES is what
          has to carry its density: at 12 bars / 6 gridlines the template measured 91.1% flat fill,
          i.e. against the empty end of the band with the board doing the emptying. */}
      {/* `dir` and `label` come from the SCENE (items 7 and 3): the chart points where the narration
          points, and the board's heading is real lettering rather than a run of glyph blocks. */}
      {/* KIND STAYS `bars`. A `line` variant was tried and measured: the plot's pale ground is ~20%
          of the frame and the SERIES is what carries its density, so a polyline in place of sixteen
          filled bars took this template from 88.8% flat to 90.2% and its coloured coverage from
          0.264 to 0.218 — toward the empty end of a band this room was already near. The bar COUNT
          varies instead, which changes the picture without changing how much of it is filled. */}
      <ChartPlot x={234} y={220} w={864} h={486} kind="bars"
        bars={15 + v.pick(2, 3)} seed={chartSeed} live crash grid={8 + v.pick(3, 3)}
        dir={tk.chart} label={label(tk, 'chartTitle', 1)} />
      {/* the two easel legs, splaying to the floor, with a stretcher across them */}
      {[[276, -1], [1046, 1]].map(([px, dir], i) => (
        <g key={i}>
          <path d={`M ${px} 730 L ${px + dir * 82} 1012 l 34 0 L ${px + 34} 730 Z`}
            fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE} strokeLinejoin="round" />
        </g>
      ))}
      <rect x={228} y={862} width={880} height={22} fill={shade(tn.card, -2)} stroke={INK} strokeWidth={STROKE_THIN} />
      <rect x={234} y={730} width={864} height={30} fill={shade(tn.card, -1)} stroke={INK} strokeWidth={STROKE} />
      {[300, 380, 460, 540].map((mx, i) => (
        <rect key={i} x={mx} y={736} width={62} height={16} rx={7}
          fill={i === 1 ? c.accent : shade(tn.body, i % 2)} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
      ))}

      {/* --- the wall right of the board: a second chart, a pinned sheet run, a flip pad ---
              The take picks which pictures hang there and where the pinned run starts, so two
              scenes in this room are the same room on a different day rather than one frame. */}
      <WallFrame x={1298 + v.off(11, 26)} y={196} w={288} h={230} art={v.one(12, ['line', 'bars', 'scape'] as const)} seed={v.seed(9)} />
      <WallFrame x={1622 + v.off(13, 22)} y={196} w={244} h={230} art={v.one(14, ['scape', 'line', 'bars'] as const)} seed={v.seed(15)} />
      {Array.from({length: 5 + v.pick(15, 2)}, (_, i) => {
        const px = 1310 + (i % 3) * 190, py = 470 + Math.floor(i / 3) * 118;
        return (
          <g key={i} transform={`rotate(${(rnd(i * 7) - 0.5) * 10} ${px + 74} ${py + 46})`}>
            <rect x={px} y={py} width={148} height={92} fill={PAPER_WHITE} stroke={INK} strokeWidth={STROKE_THIN} />
            <TextLines x={px + 14} y={py + 18} w={120} n={4} gap={16} th={4} seed={v.seed(i * 5)} opacity={0.6} />
            <circle cx={px + 74} cy={py + 8} r={7} fill={c.accent} />
          </g>
        );
      })}

      {/* --- the presenter, right of the board and right of the caption card, arm to the chart.
              He stands at 1490, clear of the audience: the first build put him at 1420, which was
              also an audience chair's x, so the chair back painted straight across his chest. --- */}
      {/* The presenter shifts along his own mark (±34 units, well clear of the 1420 chair back the
          first build collided with) and turns to the board or to the room, which is the difference
          between "presenting" and "being asked about it". */}
      <StickFigure pose={presenting} x={1490 + v.off(21, 34)} y={950} scale={1.14} facing={-1}
        view={v.one(22, ['front', 'front', 'profile'] as const)} expr={FACES.earnest} pal={LIGHT} frame={f} idle="gesture" />
      {/* a side table with a projector and a live laptop beside him */}
      <Desk x={1668} y={904} w={216} h={24} legH={104} fill={shade(tn.card, -1)} />
      {/* PERIOD: the laptop and its projector base become the presenter's own papers — a stack of
          ledgers with rolled sheets leaning against them. */}
      {period ? (
        <g>
          <LedgerStack x={1690} y={904} w={150} n={3} seed={21} />
          {[1848, 1866].map((rx, i) => (
            <g key={i}>
              <rect x={rx} y={806} width={18} height={98} rx={8} fill={shade(tn.card, 1)} stroke={INK} strokeWidth={STROKE_THIN * 0.8}
                transform={`rotate(${9 + i * 5} ${rx + 9} 904)`} />
            </g>
          ))}
        </g>
      ) : (
        <g>
          <Monitor x={1690} y={814} w={172} h={90} content="grid" seed={21} />
          <rect x={1700} y={878} width={148} height={26} rx={6} fill={tn.deep} stroke={INK} strokeWidth={STROKE_THIN * 0.7} />
        </g>
      )}
      <Papers x={1880} y={896} n={2} s={0.6} seed={25} />

      {/* --- the audience: seated backs in the near plane, each with its own chair.
              ONE SEAT PER `SeatedRow` CALL, deliberately. A row of n>1 jitters each figure by up to
              ±0.18 of the step to break the comb, so a chair drawn at the row's own x0/x1 lands
              beside its occupant rather than under him — which is what the first build looked
              like. With x0 === x1 and n === 1 the step is 0 and the jitter with it. --- */}
      {/* someone crossing behind the audience (WO-24). Kept BEHIND the seated backs and at 0.84
          rather than in the near plane: at hero scale in the front lane this walker passed straight
          over the presenter, who is the one thing this template is a shot of. */}
      <Passerby y={1016} x0={2180} x1={-260} scale={0.84} seed={v.seed(29)} at={80} />
      {/* WHO IS IN THE ROOM. Three to four seats, offset along the row by the take: a briefing to a
          half-empty room and a briefing to a full one are different pictures of the same room, and
          the empty seat is the variation that costs the least density (the chair still draws). */}
      {[[250, 1044, 1.06, 31], [560, 1052, 1.1, 34], [900, 1070, 1.18, 37], [1210, 1076, 1.22, 40]]
        .map(([cx, cy, s, seed], i) => (
          <g key={i}>
            {i !== v.pick(31, 5) && (
              <SeatedRow y={cy} x0={cx + v.off(32 + i, 20)} x1={cx + v.off(32 + i, 20)} n={1}
                scale={s} seed={v.seed(seed)} view="back" alive={i % 2} />
            )}
            <Chair x={cx + v.off(32 + i, 20)} y={1080} s={s * 1.04} facing={1} fill={shade(tn.body, i % 2 ? -1 : -2)} />
          </g>
        ))}
      <Plant x={92} y={1058} s={0.9 + v.pick(41, 3) * 0.1} seed={v.seed(3)} />
      <BoxStack x={1892} baseY={1074} n={2 + v.pick(43, 2)} s={0.7} seed={v.seed(41)} />
    </Frame>
  );
};

// ---------------------------------------------------------------------------
// Registration
// ---------------------------------------------------------------------------

/**
 * The explainer environment set. Spread into `TEMPLATES` in scenes.tsx.
 *
 * `keyedTemplates()` binds each name to its colour key here, where the name is still known, exactly
 * as scenes.tsx and stage.tsx do — all six are explicit entries in `SCENE_KEY_BY_TEMPLATE`, so none
 * of them reaches `resolveSceneKey`'s hash fallback. (WO-8f could not edit crayonStyle.ts and had to
 * borrow each key through a PROXY template name that already carried it; WO-8g added the six real
 * entries and deleted that indirection.)
 *
 * NO NAME HERE MAY COLLIDE with a template in scenes.tsx or stage.tsx: this record is spread LAST
 * into `TEMPLATES`, so a shared name silently supersedes the older template and changes what a
 * legacy episode renders. `tradingFloor` did exactly that until WO-8g renamed it `exchangeFloor`.
 * Checked against the whole registry at that point: it was the only one. Re-checked for the WO-8h
 * seven: `courtroom` collides (stage.tsx's MAFIA RICO trial), so this file's courtroom is registered
 * as `courtHearing`; the other six names are free.
 */
export const EXPLAINER_TEMPLATES: Record<string, React.FC> = keyedTemplates({
  officeFloor: OfficeFloor,
  boardroom: Boardroom,
  exchangeFloor: ExchangeFloor,
  cityStreet: CityStreet,
  domesticInterior: DomesticInterior,
  newsMontage: NewsMontage,
  // --- WO-8h ---
  bankExterior: BankExterior,
  courtHearing: CourtHearing,
  factoryFloor: FactoryFloor,
  broadcastDesk: BroadcastDesk,
  crowdQueue: CrowdQueue,
  closeUpPortrait: CloseUpPortrait,
  chartBoard: ChartBoard,
});
