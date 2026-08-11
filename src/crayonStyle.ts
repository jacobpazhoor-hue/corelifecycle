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

/**
 * Explicit key per template — EVERY template in scenes.tsx (S00-S19) and every pack template in
 * stage.tsx. Anything absent falls to a deterministic rotation so a new template still gets a
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
