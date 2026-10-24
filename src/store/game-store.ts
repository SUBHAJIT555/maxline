"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { STORAGE_KEYS } from "@/lib/constants";
import { submitScoreAction } from "@/lib/leaderboard-server";
import type { Participant, ScoreEntry } from "@/lib/types";

type GameStore = {
  participant: Participant | null;
  lastScore: number | null;
  leaderboard: ScoreEntry[];

  setParticipant: (data: Omit<Participant, "id" | "createdAt">) => Participant;
  setLastScore: (score: number) => void;
  submitScore: (score: number) => ScoreEntry | null;
  setLeaderboard: (entries: ScoreEntry[]) => void;
  clearSession: () => void;
  topFive: () => ScoreEntry[];
};

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Local-first store. Supabase will replace persist + submitScore later
 * without changing screen components much.
 */
export const useGameStore = create<GameStore>()(
  persist(
    (set, get) => ({
      participant: null,
      lastScore: null,
      leaderboard: [],

      setParticipant: (data) => {
        const participant: Participant = {
          id: uid(),
          ...data,
          createdAt: new Date().toISOString(),
        };
        set({ participant, lastScore: null });
        return participant;
      },

      setLastScore: (score) => set({ lastScore: score }),

      submitScore: (score) => {
        const { participant, leaderboard } = get();
        if (!participant) return null;

        const entry: ScoreEntry = {
          id: uid(),
          participantId: participant.id,
          name: participant.name,
          score,
          playedAt: new Date().toISOString(),
        };

        const next = [...leaderboard, entry].sort((a, b) => b.score - a.score);
        set({ lastScore: score, leaderboard: next });
        void submitScoreAction({
          name: participant.name,
          email: participant.email,
          phone: participant.phone,
          score,
          runId: entry.id,
        });
        return entry;
      },

      setLeaderboard: (entries) => set({ leaderboard: entries }),

      clearSession: () => set({ participant: null, lastScore: null }),

      topFive: () => get().leaderboard.slice(0, 5),
    }),
    {
      name: STORAGE_KEYS.leaderboard,
      partialize: (s) => ({
        participant: s.participant,
        lastScore: s.lastScore,
        leaderboard: s.leaderboard,
      }),
    },
  ),
);
