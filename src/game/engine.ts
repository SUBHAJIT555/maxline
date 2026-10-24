import { GAME } from "@/lib/constants";
import { pointsFor } from "@/lib/scoring";
import type {
  CargoItem,
  CargoType,
  GameSnapshot,
  GridPosition,
} from "@/lib/types";

const CARGO_POOL: CargoType[] = [
  "cargoBox",
  "shippingContainer",
  "airFreight",
  "damagedCargo",
  "restrictedCargo",
];

function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}

function randomType(): CargoType {
  return CARGO_POOL[Math.floor(Math.random() * CARGO_POOL.length)]!;
}

function occupiedKey(p: GridPosition): string {
  return `${p.col},${p.row}`;
}

function shuffle<T>(list: T[]): T[] {
  const next = [...list];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const current = next[i]!;
    next[i] = next[j]!;
    next[j] = current;
  }
  return next;
}

function liveItems(items: CargoItem[], now: number): CargoItem[] {
  return items.filter((item) => item.expiresAt > now);
}

export function createInitialState(): GameSnapshot {
  return {
    status: "idle",
    score: 0,
    timeLeft: GAME.durationSeconds,
    forklift: {
      col: Math.floor(GAME.cols / 2),
      row: Math.floor(GAME.rows / 2),
    },
    items: [],
    cellSkips: {},
  };
}

function skipsOf(state: GameSnapshot): Record<string, number> {
  return state.cellSkips ?? {};
}

function lockCell(
  skips: Record<string, number>,
  key: string,
): Record<string, number> {
  return {
    ...skips,
    [key]: Math.max(skips[key] ?? 0, GAME.reservedSpawns),
  };
}

/** Drop one skip wave. Cells still above zero cannot receive cargo. */
function advanceSkips(skips: Record<string, number>): {
  blocked: Set<string>;
  next: Record<string, number>;
} {
  const blocked = new Set<string>();
  const next: Record<string, number> = {};
  for (const [key, waves] of Object.entries(skips)) {
    if (waves <= 0) continue;
    blocked.add(key);
    if (waves > 1) next[key] = waves - 1;
  }
  return { blocked, next };
}

export function startGame(state: GameSnapshot): GameSnapshot {
  return {
    ...createInitialState(),
    status: "playing",
    forklift: state.forklift,
  };
}

export function pauseGame(
  state: GameSnapshot,
  now = Date.now(),
): GameSnapshot {
  if (state.status !== "playing") return state;
  return { ...state, status: "paused", pausedAt: now };
}

/** Keep remaining time and cargo lifetimes; do not skip ahead for wall-clock. */
export function resumeGame(
  state: GameSnapshot,
  now = Date.now(),
): GameSnapshot {
  if (state.status !== "paused") return state;
  const drift = Math.max(0, now - (state.pausedAt ?? now));
  return {
    ...state,
    status: "playing",
    pausedAt: undefined,
    items: state.items.map((item) => ({
      ...item,
      expiresAt: item.expiresAt + drift,
    })),
  };
}

export function tickTimer(state: GameSnapshot): GameSnapshot {
  if (state.status !== "playing") return state;
  const timeLeft = Math.max(0, state.timeLeft - 1);
  if (timeLeft === 0) {
    return { ...state, timeLeft, status: "finished" };
  }
  return { ...state, timeLeft };
}

export function expireCargo(
  state: GameSnapshot,
  now = Date.now(),
): GameSnapshot {
  if (state.status !== "playing") return state;
  const items = liveItems(state.items, now);
  if (items.length === state.items.length) return state;
  return { ...state, items };
}

export function moveForklift(
  state: GameSnapshot,
  next: GridPosition,
  now = Date.now(),
): GameSnapshot {
  if (state.status !== "playing") return state;
  if (
    next.col < 0 ||
    next.row < 0 ||
    next.col >= GAME.cols ||
    next.row >= GAME.rows
  ) {
    return state;
  }

  const items = liveItems(state.items, now);
  const key = occupiedKey(next);
  const hit = items.find(
    (item) => item.position.col === next.col && item.position.row === next.row,
  );
  const tappedSomething = state.items.some(
    (item) => item.position.col === next.col && item.position.row === next.row,
  );
  const cellSkips = tappedSomething
    ? lockCell(skipsOf(state), key)
    : skipsOf(state);
  const cleared = items.filter(
    (item) => item.position.col !== next.col || item.position.row !== next.row,
  );

  if (!hit) {
    return { ...state, items: cleared, cellSkips };
  }

  const delta = pointsFor(hit.type);
  return {
    ...state,
    score: Math.max(0, state.score + delta),
    items: cleared,
    cellSkips,
  };
}

export function spawnCargo(
  state: GameSnapshot,
  now = Date.now(),
): GameSnapshot {
  if (state.status !== "playing") return state;

  const { blocked, next: cellSkips } = advanceSkips(skipsOf(state));
  const items = liveItems(state.items, now).filter(
    (item) => !blocked.has(occupiedKey(item.position)),
  );
  const room = GAME.maxItemsOnGrid - items.length;
  const vacated = new Set(
    state.items
      .filter((item) => item.expiresAt <= now)
      .map((item) => occupiedKey(item.position)),
  );

  if (room <= 0) {
    return { ...state, items, cellSkips };
  }

  const taken = new Set<string>([
    ...items.map((i) => occupiedKey(i.position)),
    ...blocked,
    ...vacated,
  ]);

  const free: GridPosition[] = [];
  for (let row = 0; row < GAME.rows; row++) {
    for (let col = 0; col < GAME.cols; col++) {
      const pos = { col, row };
      if (taken.has(occupiedKey(pos))) continue;
      free.push(pos);
    }
  }

  const span = GAME.spawnCountMax - GAME.spawnCountMin + 1;
  const wanted =
    GAME.spawnCountMin + Math.floor(Math.random() * span);
  const count = Math.min(wanted, room, free.length);
  const spots = shuffle(free).slice(0, count);
  const spawned: CargoItem[] = spots.map((position) => ({
    id: uid(),
    type: randomType(),
    position,
    expiresAt: now + GAME.itemLifetimeMs,
  }));

  return {
    ...state,
    items: [...items, ...spawned],
    cellSkips,
  };
}
