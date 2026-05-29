import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase";
import { computeRank } from "@/lib/rank";
import {
  validateScorePayload,
  validationErrorMessage,
} from "@/lib/leaderboardLimits";
import { isGameMode } from "@/lib/types";

const ipBuckets = new Map<string, { count: number; resetAt: number }>();
const IP_LIMIT = 20;
const IP_WINDOW_MS = 60_000;

function checkIpLimit(ip: string): boolean {
  const now = Date.now();
  const bucket = ipBuckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    ipBuckets.set(ip, { count: 1, resetAt: now + IP_WINDOW_MS });
    return true;
  }

  if (bucket.count >= IP_LIMIT) return false;
  bucket.count += 1;
  return true;
}

function clientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function isRateLimitDbError(message: string): boolean {
  return (
    message.includes("row-level security") ||
    message.includes("scores_insert_allowed")
  );
}

export async function POST(request: NextRequest) {
  const ip = clientIp(request);
  if (!checkIpLimit(ip)) {
    return NextResponse.json(
      { error: "Too many requests. Try again in a minute." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const validated = validateScorePayload(body, isGameMode);
  if (!validated.ok) {
    return NextResponse.json(
      { error: validationErrorMessage(validated.error) },
      { status: 400 }
    );
  }

  const payload = validated.data;
  const supabase = createServerSupabaseClient();
  if (!supabase) {
    return NextResponse.json({ rank: null, offline: true });
  }

  const { error } = await supabase.from("scores").insert({
    player_name: payload.playerName,
    game_mode: payload.gameMode,
    score: payload.score,
    level_reached: payload.levelReached,
  });

  if (error) {
    if (isRateLimitDbError(error.message)) {
      return NextResponse.json(
        {
          error:
            "Submission limit reached. Max 6 per mode / 15 total per hour.",
        },
        { status: 429 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  const rank = await computeRank(supabase, payload.gameMode, payload.score);
  return NextResponse.json({ rank });
}
