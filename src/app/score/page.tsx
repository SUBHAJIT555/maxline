"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { GameTitle } from "@/components/branding/GameTitle";
import { ScreenBackground } from "@/components/branding/ScreenBackground";
import { GlowButton } from "@/components/ui/GlowButton";
import { KioskFrame } from "@/components/ui/KioskFrame";
import { CrackerBurst } from "@/components/fx/CrackerBurst";
import { ASSETS } from "@/lib/assets";
import { playApplause, stopApplause, unlockSfx } from "@/lib/sfx";
import { useGameStore } from "@/store/game-store";

/** Wait this long with no tap, then open the leaderboard. */
const AUTO_LEADERBOARD_MS = 12_000;

export default function ScorePage() {
  const router = useRouter();
  const participant = useGameStore((s) => s.participant);
  const lastScore = useGameStore((s) => s.lastScore);
  const clearSession = useGameStore((s) => s.clearSession);
  const leftRef = useRef(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const mark = () => setHydrated(true);
    if (useGameStore.persist.hasHydrated()) {
      mark();
      return;
    }
    return useGameStore.persist.onFinishHydration(mark);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!participant || lastScore === null) router.replace("/register");
  }, [hydrated, participant, lastScore, router]);

  useEffect(() => {
    if (!participant || lastScore === null) return;
    unlockSfx();
    playApplause();
    return () => stopApplause();
  }, [participant, lastScore]);

  useEffect(() => {
    if (!participant || lastScore === null) return;
    const id = window.setTimeout(() => {
      if (leftRef.current) return;
      leftRef.current = true;
      router.push("/leaderboard?me=1");
    }, AUTO_LEADERBOARD_MS);
    return () => window.clearTimeout(id);
  }, [participant, lastScore, router]);

  function goRegister() {
    leftRef.current = true;
    clearSession();
    router.push("/register");
  }

  function goLeaderboard() {
    leftRef.current = true;
    router.push("/leaderboard?me=1");
  }

  if (!hydrated || !participant || lastScore === null) return null;

  return (
    <KioskFrame>
      <ScreenBackground>
        <div className="relative flex h-full min-h-0 flex-col items-center overflow-hidden px-[8%] pb-[6%] pt-[4%]">
          <GameTitle size="compact" />

          <div className="mt-3 flex w-full flex-col items-center">
            <motion.div
              className="relative aspect-square w-[42%] max-w-[240px]"
              initial={{ scale: 0.85, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: "spring", stiffness: 180, damping: 16 }}
            >
              <Image
                src={ASSETS.trophy}
                alt="Delivery trophy"
                fill
                className="object-contain"
                sizes="240px"
                priority
              />
            </motion.div>

            <motion.p
              className="-mt-1 text-[clamp(3.25rem,12vw,5.5rem)] font-black leading-none text-white"
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
            >
              {lastScore}
            </motion.p>
            <p className="mt-1 text-base font-semibold tracking-wide text-white/90">
              your delivery score
            </p>
          </div>

          <div className="mt-auto flex w-full flex-col items-center gap-4 pb-1">
            <GlowButton variant="blue" onClick={goRegister}>
              Start New Shipment
            </GlowButton>
            <button
              type="button"
              onClick={goLeaderboard}
              className="text-base font-semibold text-[var(--color-max-cyan)] underline-offset-4 hover:underline"
            >
              View Leaderboard
            </button>
          </div>
        </div>
      </ScreenBackground>
      <CrackerBurst />
    </KioskFrame>
  );
}
