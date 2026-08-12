// CRAYON foundation tokens — the single source of truth for ink, stroke weight, typography and the
// per-scene flat-colour keys. Measured spec: docs/CRAYON_BIBLE.md §5 (Art) + §7 (Typography),
// numbers in docs/research/crayon/MEASUREMENTS.md.
//
// This module is pure data + pure functions. The font FILE is registered by ./crayonFont (side
// effect), which Root.tsx imports.

// ---------------------------------------------------------------------------
// Typography
// ---------------------------------------------------------------------------

/**
 * The handwritten face, by family name. Caveat (SIL OFL 1.1), vendored at public/fonts/.
 *
 * Deliberately NO fallback stack: if the vendored file ever fails to load, loadFont() cancels the
 * render, and a bare family name makes a missed registration obvious instead of quietly rendering
 * the old Helvetica look.
 */
export const CRAYON_FONT = 'Caveat';

/**
 * Caveat ships upright-only (no italic file). The reference script leans forward, so on-screen text
 * is obliqued by this many degrees via `transform: skewX(-Ndeg)` / SVG `skewX`. Synthetic oblique on
 * a handwriting face reads as handwriting, not as faux-italic on a sans.
 */
export const CRAYON_TEXT_SLANT_DEG = 6;

/**
 * Subtitles measure ~75% of their title on the reference (bible §7). The original 0.5 was an eyeball
 * estimate; measuring the 4:05 chapter card two ways — cell-pixel height (23 px title vs 17 px
 * subtitle) and width-per-character (0.565 frame / 20 chars vs 0.766 frame / 36 chars) — both land at
 * 0.72–0.77.
 */
export const CRAYON_SUBTITLE_RATIO = 0.75;

// ---------------------------------------------------------------------------
// Ink + linework
// ---------------------------------------------------------------------------

/** Outlines are uniform-weight PURE black — not the old warm #2a2620 (bible §5). */
export const INK = '#000000';

/** Text/fills that sit on ink. */
export const PAPER_WHITE = '#ffffff';

/**
 * Outline weight in px at 1920 wide. Measured median 6px @1280 → ~9px @1920, p25 4px → ~6px @1920;
 * the bible states the usable band as ≈6–10px. 8 sits mid-band.
 * Uniform: no taper, no wobble, no displacement.
 */
export const STROKE = 8;

/** Stroke weight for small props/detail lines, kept proportional to STROKE. */
export const STROKE_THIN = 5;

/** Scale STROKE for artwork authored on a viewBox narrower/wider than 1920. */
export const strokeAt = (viewBoxWidth: number): number => (STROKE * viewBoxWidth) / 1920;

// ---------------------------------------------------------------------------
// Per-scene colour keys
// ---------------------------------------------------------------------------

/**
 * The reference does NOT run one global palette under a drifting grade. Each scene commits to a
 * dominant hue and the whole palette swaps at the cut (bible §5, "Per-scene colour keying").
 * Measured exemplars: bright cyan/tan beach, saturated orange panel, brown warehouse, near-mono grey.
 */
export type SceneKey = 'daylight' | 'gold' | 'interior' | 'alarm' | 'grey';

export type SceneColors = {
  /** Dominant hue: sky, back wall, the colour the scene is "about". */
  bg: string;
  /** Midground mass: ground plane, buildings, furniture blocks. */
  mid: string;
  /** The ONE saturated note the scene is allowed (bible §9: "a single saturated accent"). */
  accent: string;
  /** Featureless background people — the grey anonymous crowd behind the colour hero (bible §6.5). */
  crowd: string;
};

export const SCENE_COLORS: Record<SceneKey, SceneColors> = {
  // bright cyan sky over warm tan ground — the measured beach frame (#88ccee 26.9%, #ddaa88 6.9%)
  daylight: {bg: '#88ccee', mid: '#ddaa88', accent: '#e04b28', crowd: '#9aa9b0'},
  // warm gold — money, applause, the good years
  gold: {bg: '#e8b54b', mid: '#c98b2e', accent: '#8a2a1f', crowd: '#a2916b'},
  // brown warehouse / lamp-lit interior — the dark key
  interior: {bg: '#5a4230', mid: '#3b2a1d', accent: '#e0a13c', crowd: '#6d6257'},
  // saturated orange/red alarm panel — crash, panic, the reveal
  alarm: {bg: '#e8541f', mid: '#b8300f', accent: '#ffd23f', crowd: '#a86b52'},
  // near-monochrome grey — bureaucracy, loss, the crowd scene (#cccccc / #888888 / #777777 measured)
  grey: {bg: '#cccccc', mid: '#888888', accent: '#c0392b', crowd: '#777777'},
};

export const sceneColors = (key: SceneKey): SceneColors => SCENE_COLORS[key];

// ---------------------------------------------------------------------------
// Tones — flat siblings of a scene's four keys
// ---------------------------------------------------------------------------

/**
 * WHY (WO-8e). Four tokens per scene meant every set-dressing component in a frame landed on the
 * SAME hue: the WO-8d `jet` frame is dense but monochrome — hangars, boxes, carts, trolleys and the
 * apron are all one gold. The reference is not monochrome per scene: it commits to a dominant hue and
 * then carries several distinct FLAT tones inside it (the office frame runs dark-brown cabinets, a tan
 * box, a navy suit and white paper at once), measuring 216–444 distinct quantised colours per frame.
 *
 * `shade()` is the whole mechanism: one base token, a small integer ladder of derived flat tones.
 *
 * Three constraints it exists to respect, all of them load-bearing:
 *
 *  1. **Flat solid colour, never a gradient.** Chromium dithers every gradient it paints, and the
 *     dither pattern destroys the flat-fill metric (bible §5, stage.tsx's WO-8a note). A tone ladder
 *     is how you get depth and material separation with zero gradients.
 *  2. **Restricted palette.** Steps are integer rungs bounded by `TONE_MAX_STEP`, derived from the
 *     scene's own key. A scene can therefore reach at most 4 tokens × 7 rungs of flat colour, not
 *     arbitrary colour. Out-of-range or non-integer steps throw rather than silently clamping, so a
 *     caller cannot quietly widen the palette.
 *  3. **Linework still reads.** Outlines are pure black (`INK`), so a derived tone is clamped to
 *     `TONE_FLOOR` lightness and to `TONE_CEIL` (so a light tone never collides with `PAPER_WHITE`).
 *     Measured across all five keys × four tokens × every rung, the darkest tone `shade()` can return
 *     is 1.53:1 against black — which is the `interior` key's OWN pre-existing level, i.e. the ladder
 *     never produces a fill darker than the palette already contains.
 */

/** One rung of the ladder, in HSL lightness. */
export const TONE_STEP = 0.075;

/** Rungs available in each direction. Bounds the derived palette; exceeding it throws. */
export const TONE_MAX_STEP = 3;

/** Lightening a flat tone also drains it, or the light end reads as neon rather than as sunlit. */
const TONE_DESAT = 0.13;
/** Darkening enriches slightly — flat-vector shadow tones read as material, not as added black. */
const TONE_ENRICH = 0.06;
/** Lightness clamps: keep derived tones off pure black (INK outlines must read) and off PAPER_WHITE. */
const TONE_FLOOR = 0.2;
const TONE_CEIL = 0.93;

const hexToRgb = (hex: string): [number, number, number] => {
  const m = /^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})$/.exec(hex.trim());
  if (!m) {
    throw new Error(`shade() takes a #rgb or #rrggbb colour, got ${JSON.stringify(hex)}`);
  }
  const h = m[1].length === 3 ? m[1].split('').map((ch) => ch + ch).join('') : m[1];
  return [
    parseInt(h.slice(0, 2), 16) / 255,
    parseInt(h.slice(2, 4), 16) / 255,
    parseInt(h.slice(4, 6), 16) / 255,
  ];
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const to = (v: number) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, '0');
  return `#${to(r)}${to(g)}${to(b)}`;
};

const rgbToHsl = (r: number, g: number, b: number): [number, number, number] => {
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max === min) return [0, 0, l];
  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
  const h = max === r ? ((g - b) / d + (g < b ? 6 : 0)) / 6
    : max === g ? ((b - r) / d + 2) / 6
    : ((r - g) / d + 4) / 6;
  return [h, s, l];
};

const hslToRgb = (h: number, s: number, l: number): [number, number, number] => {
  if (s === 0) return [l, l, l];
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  const ch = (t: number): number => {
    const tt = t < 0 ? t + 1 : t > 1 ? t - 1 : t;
    if (tt < 1 / 6) return p + (q - p) * 6 * tt;
    if (tt < 1 / 2) return q;
    if (tt < 2 / 3) return p + (q - p) * (2 / 3 - tt) * 6;
    return p;
  };
  return [ch(h + 1 / 3), ch(h), ch(h - 1 / 3)];
};

/**
 * A flat sibling of `color`, `step` rungs lighter (+) or darker (−). Hue is never changed.
 *
 * `shade(c, 0)` is the identity — it returns `color` itself, so a component's default and its
 * explicitly-shaded variants stay in the same family.
 *
 * The `TONE_FLOOR` clamp is asymmetric on purpose: a token that ALREADY sits at or below the floor
 * (the `interior` key's `mid` is #3b2a1d) keeps its own lightness as the floor, so a negative step on
 * an already-dark token holds that lightness (`shade('#3b2a1d', -1)` → `#3c2a1c`, the same value with
 * only the saturation nudge) rather than returning something *lighter* than its base.
 * Dark keys differentiate upward — which is exactly what the reference's brown office does, separating
 * near-black cabinets from a tan box, not from a blacker box. Where a dark scene genuinely needs a
 * shadow, use an INK overlay, not a tone.
 *
 * @throws if `step` is not an integer, or exceeds ±`TONE_MAX_STEP`.
 */
export const shade = (color: string, step: number): string => {
  if (!Number.isInteger(step)) {
    throw new Error(`shade() step must be a whole rung, got ${step}`);
  }
  if (Math.abs(step) > TONE_MAX_STEP) {
    throw new Error(
      `shade() step ${step} exceeds ±${TONE_MAX_STEP}: the tone ladder is deliberately short so a ` +
      `scene stays on a restricted palette. Key another SceneKey instead of shading further.`
    );
  }
  if (step === 0) return color;
  const [r, g, b] = hexToRgb(color);
  const [h, s, l] = rgbToHsl(r, g, b);
  const floor = Math.min(l, TONE_FLOOR);
  const l2 = Math.min(TONE_CEIL, Math.max(floor, l + step * TONE_STEP));
  const s2 = Math.min(1, s * (step > 0 ? (1 - TONE_DESAT) ** step : (1 + TONE_ENRICH) ** -step));
  return rgbToHex(...hslToRgb(h, s2, l2));
};

/**
 * The named flat materials a scene gets for free, all derived from its own four keys.
 *
 * Set dressing keys its DEFAULTS to these, so composing a template with zero colour arguments still
 * produces a frame with several materials in it instead of one hue everywhere.
 */
export type SceneTones = {
  /** Distant structures — lifted toward the sky, which is how flat art does aerial perspective. */
  far: string;
  /** Second plane: back walls, the band behind the main mass. */
  back: string;
  /** The mid-ground mass itself. Identical to `SceneColors.mid`. */
  body: string;
  /** The ground plane — one rung under the things standing on it, so they separate from it. */
  floor: string;
  /** Recesses, window blocks, shutter shadow, the dark face of a solid. */
  deep: string;
  /**
   * The light material: cardboard, paper, plaster, luggage — the tan box against a dark wall in the
   * reference office. Derived from `mid`, not `bg`: cardboard belongs to the scene's MATERIAL family,
   * and keying it to the dominant hue put pale-blue boxes in every `daylight` scene.
   */
  card: string;
  /** A wall/panel keyed to the dominant hue but readable against a `bg` field of it. */
  panel: string;
  /** Deep crowd rows — paler, so a mass of people recedes behind the row in front of it. */
  crowdFar: string;
  /** Near crowd rows, held off the wall behind them. */
  crowdNear: string;
  /** The accent's shadow side. The accent itself stays the scene's ONE saturated note. */
  accentDeep: string;
};

const TONE_CACHE = new Map<string, SceneTones>();

/** Derive (and cache) a scene's flat tone set from its four colour keys. */
export const sceneTones = (c: SceneColors): SceneTones => {
  const k = `${c.bg}|${c.mid}|${c.accent}|${c.crowd}`;
  const hit = TONE_CACHE.get(k);
  if (hit) return hit;
  const t: SceneTones = {
    far: shade(c.mid, 2),
    back: shade(c.mid, 1),
    body: c.mid,
    floor: shade(c.mid, -1),
    deep: shade(c.mid, -2),
    card: shade(c.mid, TONE_MAX_STEP),
    panel: shade(c.bg, -1),
    crowdFar: shade(c.crowd, 1),
    crowdNear: shade(c.crowd, -1),
    accentDeep: shade(c.accent, -1),
  };
  TONE_CACHE.set(k, t);
  return t;
};

/**
 * Explicit key per template — EVERY template in scenes.tsx (S00-S19), every pack template in
 * stage.tsx and every explainer template in explainer.tsx. Anything absent falls to a deterministic
 * rotation so a new template still gets a
 * committed hue rather than an accidental global palette, but the rotation is a safety net, not the
 * design: an unmapped template lands on an editorially random hue, which is exactly what per-scene
 * colour keying is supposed to replace.
 *
 * The rule applied, uniformly:
 *   daylight — anything under open sky (or sky seen through a curtain wall)
 *   gold     — ceremony, money, applause, the good years, golden hour
 *   interior — enclosed, lamp-lit, wooden, dark: the "brown warehouse" key
 *   alarm    — crisis, combat, panic, the reveal: the "saturated orange panel" key
 *   grey     — institutional, clinical, bureaucratic, drained, loss
 *
 * NO interior template is keyed `daylight` — a filing room on a bright cyan sky was the defect this
 * mapping exists to fix. Where a template's own backdrop already paints an opaque full-frame ground
 * (the space, night-sea and night-alley packs paint #05060a/#20262e/#181418 themselves) the key is
 * still recorded, but it governs `mid`/`accent`/`crowd` rather than a visible ground.
 */
export const SCENE_KEY_BY_TEMPLATE: Record<string, SceneKey> = {
  // --- core scenes (src/scenes.tsx S00-S19) ---
  deskSilhouette: 'interior', desk: 'grey', fileWall: 'interior', tower: 'daylight',
  boardroomNotes: 'grey', deskClose: 'interior', supervisor: 'grey', window: 'grey',
  signing: 'gold', jet: 'gold', dinner: 'interior', boardroomHead: 'grey', atrium: 'gold',
  layoffs: 'grey', revolvingDoor: 'daylight', warRoom: 'alarm', emptyChair: 'grey',
  lobby: 'daylight', raidScene: 'alarm',
  // --- generic pack ---
  lectureHallScene: 'grey', podiumScene: 'gold', foundationScene: 'gold',
  // --- medical: the near-monochrome clinical key, with the ER as its one alarm ---
  scrubIn: 'grey', operatingRoom: 'grey', hospitalRounds: 'grey', scanReview: 'grey',
  erTrauma: 'alarm', consult: 'grey',
  // --- startup ---
  garageStart: 'interior', startupGrow: 'grey', serverScale: 'grey', ipoBell: 'gold',
  // --- military ---
  bootcamp: 'daylight', barracksLife: 'interior', frontline: 'alarm', commandPost: 'grey',
  decoration: 'gold',
  // --- sports ---
  training: 'grey', lockerRoomScene: 'interior', gameDay: 'daylight', victory: 'gold',
  // --- hedge fund ---
  tradingFloor: 'grey', pnlWall: 'alarm',
  // --- real estate ---
  openHouse: 'daylight', rentalUnits: 'daylight', constructionSite: 'daylight',
  modelReview: 'grey', rooftopEmpire: 'gold',
  // --- spy ---
  tradecraft: 'daylight', surveillance: 'grey', deadDrop: 'daylight', safehouse: 'interior',
  station: 'grey', debrief: 'interior',
  // --- roman ---
  triumph: 'gold', romanOath: 'daylight', legionDrill: 'daylight', legionCamp: 'daylight',
  shieldWall: 'alarm', centurionVitis: 'daylight', firstSpear: 'gold', forumScene: 'daylight',
  warCouncil: 'interior', throne: 'gold', senate: 'grey', praetorians: 'grey', banquet: 'gold',
  // --- mafia: the pack commits hardest to the warm dark interior ---
  mobTable: 'interior', streetCorner: 'daylight', socialClub: 'interior', cardGame: 'interior',
  backAlley: 'interior', madeCeremony: 'interior', redSauce: 'interior', redSauceAlone: 'interior',
  waterfront: 'daylight', donOffice: 'interior', commission: 'interior', countRoom: 'gold',
  courtroom: 'grey', prisonCell: 'grey', wiretap: 'grey',
  // --- dynasty ---
  heirGates: 'gold', portraitHall: 'interior', portraitHallFilled: 'interior',
  yachtDeck: 'daylight', galaBallroom: 'gold', familyVault: 'grey',
  // --- samurai ---
  riceField: 'daylight', dojo: 'interior', daisho: 'interior', sengokuField: 'alarm',
  castleGate: 'daylight', teaCeremony: 'interior', lordAudience: 'gold', keepTop: 'daylight',
  seppukuRite: 'grey', shogunCourt: 'gold', merchantHouse: 'interior',
  // --- cartel ---
  lookoutCorner: 'daylight', sierraRoute: 'daylight', narcoShrineRite: 'interior',
  plazaTown: 'daylight', ranchCompound: 'gold',
  // --- ocean survival: open water is daylight, weather is the grey key, landfall pays off gold ---
  boatDeck: 'daylight', oceanCapsize: 'grey', raftDay: 'daylight', raftNight: 'grey',
  glassCalm: 'gold', rainSquall: 'grey', horizonShip: 'daylight', finWater: 'grey',
  driftPanga: 'daylight', openSwell: 'daylight', shipNight: 'grey', makeLandfall: 'gold',
  // --- black market organs ---
  hotelRoom: 'interior', basementOR: 'alarm', coldCase: 'grey', syndicateClinic: 'grey',
  // --- north korea ---
  borderWire: 'grey',
  // --- zombie / outbreak ---
  hordeStreet: 'alarm', suburbSiege: 'daylight', highwayJam: 'daylight', storeRaid: 'grey',
  bunkerSiege: 'interior', checkpointTriage: 'alarm', campWall: 'daylight',
  // --- waste / sanitation ---
  graveside: 'grey', gravesideReturn: 'grey', dawnRoute: 'gold', truckYard: 'daylight',
  landfillView: 'daylight', routeAftermath: 'grey',
  // --- lottery ---
  ticketCounter: 'interior', trailerPorch: 'daylight',
  // --- yakuza ---
  neonAlley: 'interior', shrineOathRite: 'interior', irezumiParlor: 'interior',
  pachinkoFloor: 'alarm', oyabunOffice: 'interior', yubitsumeRite: 'grey',
  teaCeremonySplit: 'interior',
  // --- mongol ---
  steppeCamp: 'daylight', horsebackDrill: 'daylight', steppeRaid: 'alarm', siegeWalls: 'alarm',
  yamRelayStation: 'daylight', khanAudienceTent: 'gold', khaganThrone: 'gold',
  // --- gladiator: arenaSand is shared art, keyed daylight for the fight and gold for the freedom rite ---
  slaveMarket: 'daylight', ludusYard: 'daylight', arenaGate: 'interior', arenaSand: 'daylight',
  rudisCeremony: 'gold', ludusOffice: 'interior', imperialBox: 'gold',
  // --- bratva ---
  courtyardBlock: 'grey', tattooCell: 'interior', banyaSitDown: 'interior', shopKrysha: 'grey',
  koronatsiyaRite: 'interior', brightonPier: 'daylight', pakhanApex: 'gold',
  // --- space ---
  jetTrain: 'daylight', poolTrain: 'grey', launchSeat: 'alarm', cupolaView: 'grey',
  evaWalk: 'grey', evaEmergency: 'alarm', controlRoom: 'grey', stationCommand: 'grey',
  moonSurface: 'grey',
  // --- ottoman: janissaryBarracks is shared art, keyed interior for the corps and alarm for the revolt ---
  balkanVillage: 'daylight', janissaryBarracks: 'interior', cauldronRevolt: 'alarm',
  divanChamber: 'gold', sultanAudience: 'gold',
  // --- pirate ---
  fishingCove: 'daylight', shipDeck: 'daylight', broadsideBattle: 'alarm',
  nassauHarbor: 'daylight', captainsCabin: 'interior', marooned: 'daylight',
  executionDock: 'grey',
  // --- basketball ---
  drivewayHoop: 'daylight', highSchoolGym: 'interior', gLeagueBus: 'grey', arenaCourt: 'gold',
  iceBathRoom: 'grey', rafterRetirement: 'gold',
  // --- explainer environment set (src/explainer.tsx) ---
  // Four of the six are enclosed rooms, so NONE of them may reach the `daylight` key: the hash
  // fallback keyed `officeFloor` and `domesticInterior` as `daylight` (a filing floor and a living
  // room on a bright cyan sky) and `cityStreet` — the one scene actually under open sky — as
  // `interior`. That inversion is exactly what an explicit entry exists to prevent.
  //   officeFloor / domesticInterior — "enclosed, lamp-lit, wooden, dark": the reference's own office
  //     is a brown/near-black key (frames/wolf_office_singleframe.jpg) and its domestic rooms are
  //     lamp-lit interiors.
  //   boardroom / exchangeFloor — institutional, consistent with the existing `boardroomNotes` /
  //     `boardroomHead` and the legacy `tradingFloor` (grey floor, `alarm` pnlWall beside it).
  //   newsMontage — `interior`, NOT `grey`: the reference lays its cuttings on a WARM dark ground
  //     (frames/wolf_montage_verified.jpg, 15:02), and measured, `grey` put the template at 17 rich
  //     colours because all four of that key's tokens are greys. `interior` gives it a brown ground,
  //     a tan newsprint stock and an amber accent, and reads as archive/records.
  //   cityStreet — the only one of the six under open sky, so the only one keyed `daylight`.
  officeFloor: 'interior', boardroom: 'grey', exchangeFloor: 'grey', cityStreet: 'daylight',
  domesticInterior: 'interior', newsMontage: 'interior',
  // WO-8h's seven. The six above reach only THREE of the five keys and never `gold` or `alarm` at
  // all, which is COMPARISON MISS #7 ("the reference commits a NEW hue per scene") and half of
  // MISS #5 (our 0.209 mean saturation against the reference's 0.308-0.646 range). These seven put
  // both unused keys into the explainer set, so the thirteen now cover all five. Three of them are
  // enclosed rooms and NONE of those may reach `daylight` — the same inversion the block above
  // exists to prevent.
  //   bankExterior — `gold`: "ceremony, money, applause, the good years". An institutional stone
  //     frontage at its height; its opposite mood is `crowdQueue`, keyed `grey`, so the two never
  //     read as one set redressed.
  //   courtHearing — `interior`: the key's own gloss is "enclosed, lamp-lit, wooden, dark", which
  //     is a panelled courtroom verbatim, and the amber accent gives the seal and the bench lamp a
  //     saturated note the legacy `grey` courtroom cannot carry. (Registered as `courtHearing`, not
  //     `courtroom`, because stage.tsx's MAFIA pack already owns that name — see explainer.tsx.)
  //   factoryFloor — `interior`: this key's stated exemplar is the "brown warehouse".
  //   broadcastDesk / closeUpPortrait — `alarm`: the reference's own saturated panel
  //     (wolf_montage_verified.jpg, 9:20) is a news/reaction frame with pushed faces on an orange
  //     ground. These are the two templates carrying the top of the saturation range.
  //   crowdQueue — `grey`: "bureaucratic, drained, loss" — the breadline/bank-run mass
  //     (depression_montage_verified.jpg, 15:00 is a grey crowd with one coloured figure in it).
  //   chartBoard — `gold`: the pitch and the growth curve, the beat this frame serves.
  bankExterior: 'gold', courtHearing: 'interior', factoryFloor: 'interior',
  broadcastDesk: 'alarm', crowdQueue: 'grey', closeUpPortrait: 'alarm', chartBoard: 'gold',
};

const KEY_ROTATION: SceneKey[] = ['daylight', 'gold', 'interior', 'alarm', 'grey'];

/**
 * Resolve the colour key for a scene. `template` wins when it is mapped above; otherwise the scene
 * id picks a key deterministically (same id -> same key on every render, including cloud renders).
 */
export const resolveSceneKey = (sceneId: string, template?: string): SceneKey => {
  if (!sceneId) {
    throw new Error('resolveSceneKey() requires a non-empty scene id');
  }
  if (template && template in SCENE_KEY_BY_TEMPLATE) {
    return SCENE_KEY_BY_TEMPLATE[template];
  }
  let h = 0;
  for (const src of [template ?? '', sceneId]) {
    for (let i = 0; i < src.length; i++) h = (h * 31 + src.charCodeAt(i)) >>> 0;
  }
  return KEY_ROTATION[h % KEY_ROTATION.length];
};
