"use server";

import { createSupabase } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import type { ScoreEntry } from "@/lib/types";

export type ScoreSubmission = {
  name: string;
  email: string;
  phone: string;
  score: number;
  runId: string;
};

export async function submitScoreAction(
  input: ScoreSubmission,
): Promise<boolean> {
  if (!isSupabaseConfigured()) return false;
  const name = input.name.trim();
  const phone = input.phone.trim();
  if (!name || !phone || !Number.isFinite(input.score) || input.score < 0) {
    return false;
  }
  try {
    const supabase = createSupabase();
    const { error } = await supabase.rpc("submit_score", {
      player_name: name,
      player_email: input.email.trim(),
      player_phone: phone,
      player_score: Math.round(input.score),
      run_id: input.runId,
    });
    if (error) {
      console.error("Supabase submit_score failed:", error.message, error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Supabase submit_score threw:", err);
    return false;
  }
}

export async function fetchLeaderboardAction(): Promise<ScoreEntry[] | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const supabase = createSupabase();
    const { data, error } = await supabase
      .from("leaderboard")
      .select("name, score, played_at");
    if (error || !data) {
      console.error("Supabase leaderboard failed:", error?.message, error);
      return null;
    }
    return data.flatMap((row, index) => {
      const name = typeof row.name === "string" ? row.name.trim() : "";
      const score = Number(row.score);
      const playedAt =
        typeof row.played_at === "string"
          ? row.played_at
          : new Date().toISOString();
      if (!name || !Number.isFinite(score)) return [];
      return [
        {
          id: `${name}-${score}-${playedAt}-${index}`,
          participantId: "",
          name,
          score,
          playedAt,
        },
      ];
    });
  } catch {
    return null;
  }
}
