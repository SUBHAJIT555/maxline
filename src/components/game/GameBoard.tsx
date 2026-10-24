"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  createInitialState,
  expireCargo,
  moveForklift,
  pauseGame,
  resumeGame,
  spawnCargo,
  startGame,
  tickTimer,
} from "@/game/engine";
import { ASSETS } from "@/lib/assets";
import { GAME } from "@/lib/constants";
import { pointsFor } from "@/lib/scoring";
import { playCorrectTap, playWrongTap, unlockSfx } from "@/lib/sfx";
import type { CargoType, GameSnapshot, GridPosition } from "@/lib/types";

const CARGO_SRC: Record<CargoType, string> = {
  cargoBox: ASSETS.cargoBox,
  shippingContainer: ASSETS.container,
  airFreight: ASSETS.cargoAir,
  damagedCargo: ASSETS.cargoDamaged,
  restrictedCargo: ASSETS.cargoRestricted,
};

type Popup = { id: string; points: number; col: number; row: number };

type Props = {
  onFinished: (score: number) => void;
};

function preload(src: string) {
  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = () => resolve();
    img.onerror = () => resolve();
    img.src = src;
  });
}

function usePlayReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const urls = [
      ASSETS.bgPort,
      ASSETS.brandLogo,
      ASSETS.logoCargoRush,
      ...Object.values(CARGO_SRC),
    ];
    const fonts = document.fonts?.ready ?? Promise.resolve();
    const pageLoaded =
      document.readyState === "complete"
        ? Promise.resolve()
        : new Promise<void>((resolve) => {
            window.addEventListener("load", () => resolve(), { once: true });
          });

    Promise.all([fonts, pageLoaded, ...urls.map(preload)]).then(() => {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (!cancelled) setReady(true);
        });
      });
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}

function useTabVisible() {
  const [visible, setVisible] = useState(
    () =>
      typeof document === "undefined" ||
      document.visibilityState === "visible",
  );

  useEffect(() => {
    const sync = () => setVisible(document.visibilityState === "visible");
    const hide = () => setVisible(false);
    sync();
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("pageshow", sync);
    window.addEventListener("pagehide", hide);
    return () => {
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("pageshow", sync);
      window.removeEventListener("pagehide", hide);
    };
  }, []);

  return visible;
}

export function GameBoard({ onFinished }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const [onScreen, setOnScreen] = useState(false);
  const ready = usePlayReady();
  const visible = useTabVisible();
  const live = ready && visible && onScreen;

  const [state, setState] = useState<GameSnapshot>(() => createInitialState());
  const [popups, setPopups] = useState<Popup[]>([]);
  const finishedRef = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;

  useEffect(() => {
    unlockSfx();
    const unlock = () => unlockSfx();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        setOnScreen(Boolean(entry?.isIntersecting && entry.intersectionRatio > 0.4));
      },
      { threshold: [0, 0.4, 1] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!live) {
      setState((s) => pauseGame(s));
      return;
    }
    setState((s) => {
      if (s.status === "idle") return startGame(s);
      if (s.status === "paused") return resumeGame(s);
      return s;
    });
  }, [live]);

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => {
      setState((s) => tickTimer(s));
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => {
      setState((s) => spawnCargo(s));
    }, GAME.spawnIntervalMs);
    return () => window.clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status !== "playing") return;
    const id = window.setInterval(() => {
      setState((s) => expireCargo(s));
    }, 100);
    return () => window.clearInterval(id);
  }, [state.status]);

  useEffect(() => {
    if (state.status === "finished" && !finishedRef.current) {
      finishedRef.current = true;
      onFinished(state.score);
    }
  }, [state.status, state.score, onFinished]);

  const onCellTap = useCallback((pos: GridPosition) => {
    const prev = stateRef.current;
    if (prev.status !== "playing") return;
    const hit = prev.items.find(
      (item) => item.position.col === pos.col && item.position.row === pos.row,
    );
    setState((current) => moveForklift(current, pos));
    if (!hit || hit.expiresAt <= Date.now()) return;
    const points = pointsFor(hit.type);
    if (points >= 0) playCorrectTap();
    else playWrongTap();
    setPopups((existing) => [
      ...existing,
      {
        id: `${hit.id}-${Math.random().toString(36).slice(2, 8)}`,
        points,
        col: pos.col,
        row: pos.row,
      },
    ]);
  }, []);

  const mm = String(Math.floor(state.timeLeft / 60)).padStart(2, "0");
  const ss = String(state.timeLeft % 60).padStart(2, "0");

  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <p className="glow-cyan shrink-0 text-center font-[family-name:var(--font-digital)] text-[clamp(1.1rem,2.8cqh,1.6rem)] font-bold text-[var(--color-max-glow)]">
        Time : {mm}:{ss}
      </p>

      <div
        ref={boardRef}
        className="relative mx-auto mt-2 min-h-0 w-full max-w-[920px] flex-1"
      >
        <div
          className={`absolute inset-0 grid gap-1 rounded-xl border border-[var(--color-max-cyan)]/40 bg-[#001428]/70 p-1.5 shadow-[inset_0_0_40px_rgba(0,180,255,0.15)] ${
            state.status !== "playing" ? "cargo-life-paused" : ""
          }`}
          style={{
            gridTemplateColumns: `repeat(${GAME.cols}, minmax(0, 1fr))`,
            gridTemplateRows: `repeat(${GAME.rows}, minmax(0, 1fr))`,
          }}
        >
          {Array.from({ length: GAME.cols * GAME.rows }).map((_, i) => {
            const col = i % GAME.cols;
            const row = Math.floor(i / GAME.cols);
            const skipped = (state.cellSkips?.[`${col},${row}`] ?? 0) > 0;
            const item = skipped
              ? undefined
              : state.items.find(
                  (c) => c.position.col === col && c.position.row === row,
                );

            return (
              <button
                key={`${col}-${row}`}
                type="button"
                onClick={() => onCellTap({ col, row })}
                className="relative h-full w-full overflow-hidden rounded-md border border-cyan-500/20 bg-cyan-950/30 transition"
              >
                {item ? (
                  <span
                    key={item.id}
                    className="cargo-life absolute inset-0"
                    style={{ animationDuration: `${GAME.itemLifetimeMs}ms` }}
                  >
                    <Image
                      src={CARGO_SRC[item.type]}
                      alt={item.type}
                      fill
                      className="object-contain p-0.5"
                      sizes="80px"
                    />
                  </span>
                ) : null}
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {popups.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, y: 0 }}
              animate={{ opacity: 0, y: -40 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.8 }}
              onAnimationComplete={() =>
                setPopups((all) => all.filter((x) => x.id !== p.id))
              }
              className={`pointer-events-none absolute z-20 text-xl font-black ${
                p.points >= 0 ? "text-emerald-300" : "text-red-400"
              }`}
              style={{
                left: `${((p.col + 0.5) / GAME.cols) * 100}%`,
                top: `${((p.row + 0.35) / GAME.rows) * 100}%`,
                transform: "translate(-50%, -50%)",
              }}
            >
              {p.points >= 0 ? `+${p.points}` : p.points}
            </motion.span>
          ))}
        </AnimatePresence>
      </div>

      <div className="shrink-0 px-[4%] pb-1 pt-2 text-center">
        <p className="glow-cyan font-[family-name:var(--font-digital)] text-[clamp(1rem,2.4cqh,1.35rem)] font-bold text-[var(--color-max-glow)]">
          score: {state.score}
        </p>
        <p className="mt-0.5 text-[clamp(0.85rem,2cqh,1.1rem)] font-bold text-white">
          Deliver Before Time Runs Out
        </p>
      </div>
    </div>
  );
}
