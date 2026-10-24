/** Game rules. Stage is the same 9:16 kiosk screen as Talabat Run. */

export const KIOSK = {
  /** Design artboard; the live stage scales with the viewport at 9:16. */
  width: 1080,
  height: 1920,
  aspect: "9 / 16",
} as const;

export const GAME = {
  durationSeconds: 30,
  /** Playable grid size (cols × rows) */
  cols: 6,
  rows: 8,
  /** How often a spawn wave runs (ms) */
  spawnIntervalMs: 500,
  /** Each wave places a random count in this range */
  spawnCountMin: 1,
  spawnCountMax: 3,
  /** After a tap, that cell stays empty for this many spawn waves */
  reservedSpawns: 2,
  /** How long a spawned item stays before it vanishes (ms) */
  itemLifetimeMs: 1400,
  /** Max cargo items on the grid at once */
  maxItemsOnGrid: 8,
} as const;

export const SCORE = {
  cargoBox: 10,
  shippingContainer: 15,
  airFreight: 20,
  damagedCargo: -10,
  restrictedCargo: -15,
} as const;

export const STORAGE_KEYS = {
  participant: "cargo-rush:participant",
  sessionScore: "cargo-rush:session-score",
  leaderboard: "cargo-rush:leaderboard",
} as const;
