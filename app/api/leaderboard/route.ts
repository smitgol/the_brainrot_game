import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { computeRank } from "@/lib/rank";
import { isGameMode } from "@/lib/types";

export async function GET(request: NextRequest) {
  const mode = request.nextUrl.searchParams.get("mode") ?? "train";
  const player = request.nextUrl.searchParams.get("player");
  const scoreParam = request.nextUrl.searchParams.get("score");

  if (!isGameMode(mode)) {
    return NextResponse.json({ error: "Invalid mode" }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ scores: [], rank: null, offline: true });
  }

  if (player && scoreParam) {
    const score = Number(scoreParam);
    if (!Number.isInteger(score) || score < 0) {
      return NextResponse.json({ error: "Invalid score" }, { status: 400 });
    }

    const rank = await computeRank(supabase, mode, score);

    return NextResponse.json({ rank });
  }

  const { data, error } = await supabase
    .from("scores")
    .select("id, player_name, game_mode, score, level_reached, created_at")
    .eq("game_mode", mode)
    .order("score", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scores: data ?? [] });
}
