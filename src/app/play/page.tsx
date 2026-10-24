"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect } from "react";
import { GameTitle } from "@/components/branding/GameTitle";
import { ScreenBackground } from "@/components/branding/ScreenBackground";
import { GameBoard } from "@/components/game/GameBoard";
import { KioskFrame } from "@/components/ui/KioskFrame";
import { useGameStore } from "@/store/game-store";

export default function PlayPage() {
  const router = useRouter();
  const participant = useGameStore((s) => s.participant);
  const submitScore = useGameStore((s) => s.submitScore);

  useEffect(() => {
    if (!participant) router.replace("/register");
  }, [participant, router]);

  const onFinished = useCallback(
    (score: number) => {
      submitScore(score);
      router.push("/score");
    },
    [router, submitScore],
  );

  if (!participant) return null;

  return (
    <KioskFrame>
      <ScreenBackground dim={0.55}>
        <div className="flex h-full min-h-0 flex-col overflow-hidden px-[4%] pb-[3%] pt-[3%]">
          <GameTitle size="compact" />
          <div className="mt-2 flex min-h-0 flex-1 flex-col">
            <GameBoard onFinished={onFinished} />
          </div>
        </div>
      </ScreenBackground>
    </KioskFrame>
  );
}
