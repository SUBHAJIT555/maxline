"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef } from "react";
import { GameTitle } from "@/components/branding/GameTitle";
import { ScreenBackground } from "@/components/branding/ScreenBackground";
import { GlowButton } from "@/components/ui/GlowButton";
import { KioskFrame } from "@/components/ui/KioskFrame";
import { ASSETS } from "@/lib/assets";
import { useGameStore } from "@/store/game-store";

const MEDALS = [ASSETS.medal1st, ASSETS.medal2nd, ASSETS.medal3rd] as const;

function RankBadge({ rank }: { rank: number }) {
  const medal = MEDALS[rank - 1];
  if (medal) {
    return (
      <span className="relative inline-flex h-9 w-9 shrink-0 items-center justify-center">
        <Image
          src={medal}
          alt={`Rank ${rank}`}
          width={72}
          height={72}
          className="h-9 w-9 object-contain drop-shadow-[0_0_8px_rgba(255,200,80,0.35)]"
        />
      </span>
    );
  }

  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-cyan-500/35 text-sm font-black text-white">
      {rank}
    </span>
  );
}

function PlayerIcon({ accent }: { accent?: boolean }) {
  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
        accent ? "bg-[var(--color-max-orange)]/90" : "bg-cyan-400/80"
      }`}
      aria-hidden
    >
      <svg
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        className="text-white"
      >
        <circle cx="12" cy="8" r="4" fill="currentColor" />
        <path
          d="M4 20c0-3.5 3.6-6 8-6s8 2.5 8 6"
          fill="currentColor"
        />
      </svg>
    </span>
  );
}

function LeaderboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const highlightMe = searchParams.get("me") === "1";

  const participant = useGameStore((s) => s.participant);
  const lastScore = useGameStore((s) => s.lastScore);
  const clearSession = useGameStore((s) => s.clearSession);
  const leaderboard = useGameStore((s) => s.leaderboard);
  const listRef = useRef<HTMLUListElement>(null);
  const youRowRef = useRef<HTMLLIElement>(null);

  const youEntryId = useMemo(() => {
    if (!highlightMe || !participant) return null;
    const mine = leaderboard.filter(
      (entry) => entry.participantId === participant.id,
    );
    if (mine.length === 0) return null;
    if (lastScore !== null) {
      const match = mine
        .filter((entry) => entry.score === lastScore)
        .sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0];
      if (match) return match.id;
    }
    return [...mine].sort((a, b) => b.playedAt.localeCompare(a.playedAt))[0]!
      .id;
  }, [highlightMe, participant, lastScore, leaderboard]);

  useEffect(() => {
    if (!youEntryId || !youRowRef.current) return;
    youRowRef.current.scrollIntoView({ block: "center", behavior: "smooth" });
  }, [youEntryId, leaderboard.length]);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    let dragging = false;
    let startY = 0;
    let startScroll = 0;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startY = e.clientY;
      startScroll = el.scrollTop;
      el.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      el.scrollTop = startScroll - (e.clientY - startY);
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      if (el.hasPointerCapture(e.pointerId)) {
        el.releasePointerCapture(e.pointerId);
      }
    };

    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerup", onUp);
    el.addEventListener("pointercancel", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointercancel", onUp);
    };
  }, []);

  function goRegister() {
    clearSession();
    router.replace("/register");
  }

  return (
    <KioskFrame>
      <ScreenBackground>
        <div className="flex h-full min-h-0 flex-col items-center overflow-hidden px-[7%] pb-[5%] pt-[3.5%]">
          <GameTitle size="compact" />

          <div className="relative mt-1 h-[16%] w-full max-w-md shrink-0">
            <Image
              src={ASSETS.leaderboardHero}
              alt=""
              fill
              priority
              className="object-contain mix-blend-screen drop-shadow-[0_0_24px_rgba(59,167,255,0.35)]"
              sizes="520px"
            />
          </div>

          <h2 className="mt-0.5 shrink-0 text-2xl font-black italic text-white">
            Leaderboard
          </h2>
          <p className="shrink-0 text-sm font-semibold text-white/80">
            Top Delivery Scores
          </p>

          <div className="mt-2 flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-hidden rounded-2xl border border-[var(--color-max-cyan)]/50 bg-[#00264d]/80 shadow-[0_0_24px_rgba(59,167,255,0.12)] backdrop-blur-sm">
            <div className="grid shrink-0 grid-cols-[3rem_1fr_4.5rem] gap-2 border-b border-white/15 px-4 py-3 text-sm font-bold uppercase tracking-wider text-[var(--color-max-cyan)]">
              <span>#</span>
              <span>Player</span>
              <span className="text-right">Score</span>
            </div>
            <div className="scroll-clip">
              <ul
                ref={listRef}
                className="scroll-clip-inner cursor-grab active:cursor-grabbing"
              >
                {leaderboard.length === 0 ? (
                  <li className="px-4 py-8 text-center text-white/60">
                    No scores yet — play a round!
                  </li>
                ) : (
                  leaderboard.map((entry, index) => {
                    const isYou = highlightMe && entry.id === youEntryId;
                    return (
                      <li
                        key={entry.id}
                        ref={isYou ? youRowRef : undefined}
                        className={`mx-2 my-1 grid grid-cols-[3rem_1fr_4.5rem] items-center gap-2 rounded-xl px-2 py-2.5 ${
                          isYou
                            ? "border-2 border-[var(--color-max-orange)] bg-orange-500/15 shadow-[0_0_18px_rgba(255,107,0,0.4)]"
                            : "border border-transparent bg-white/5"
                        }`}
                      >
                        <RankBadge rank={index + 1} />
                        <span className="flex min-w-0 items-center gap-2">
                          <PlayerIcon accent={isYou} />
                          <span
                            className={`truncate text-lg font-bold ${
                              isYou
                                ? "text-[var(--color-max-orange)]"
                                : "text-white"
                            }`}
                          >
                            {isYou ? "You" : entry.name}
                          </span>
                        </span>
                        <span
                          className={`text-right text-lg font-bold ${
                            isYou
                              ? "text-[var(--color-max-orange)]"
                              : "text-white"
                          }`}
                        >
                          {entry.score}
                        </span>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>

          <div className="mt-4 w-full max-w-md shrink-0">
            <GlowButton variant="blue" onClick={goRegister}>
              Start New Shipment
            </GlowButton>
          </div>
        </div>
      </ScreenBackground>
    </KioskFrame>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <KioskFrame>
          <ScreenBackground>
            <div className="flex h-full items-center justify-center text-white/70">
              Loading…
            </div>
          </ScreenBackground>
        </KioskFrame>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
