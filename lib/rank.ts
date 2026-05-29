import type { SupabaseClient } from "@supabase/supabase-js";
import type { GameMode } from "./types";

export async function computeRank(
  supabase: SupabaseClient,
  mode: GameMode,
  score: number
): Promise<number> {
  const { count } = await supabase
    .from("scores")
    .select("*", { count: "exact", head: true })
    .eq("game_mode", mode)
    .gt("score", score);

  return (count ?? 0) + 1;
}
