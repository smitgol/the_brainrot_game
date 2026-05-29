import { PLAYER_NAME_PATTERN } from "./leaderboardLimits";
import { generateCoolPlayerName } from "./playerName";
import type { GameMode, ScoreEntry, SubmitScoreResponse } from "./types";
import { STORAGE_KEYS } from "./types";

export function getLocalStats() {
  if (typeof window === "undefined") {
    return { bestScore: 0, gamesPlayed: 0, winStreak: 0 };
  }

  return {
    bestScore: Number(localStorage.getItem(STORAGE_KEYS.bestScore) ?? 0),
    gamesPlayed: Number(localStorage.getItem(STORAGE_KEYS.gamesPlayed) ?? 0),
    winStreak: Number(localStorage.getItem(STORAGE_KEYS.winStreak) ?? 0),
  };
}

export function updateLocalStats(score: number, won: boolean) {
  if (typeof window === "undefined") return;

  const stats = getLocalStats();
  const bestScore = Math.max(stats.bestScore, score);
  const gamesPlayed = stats.gamesPlayed + 1;
  const winStreak = won ? stats.winStreak + 1 : 0;

  localStorage.setItem(STORAGE_KEYS.bestScore, String(bestScore));
  localStorage.setItem(STORAGE_KEYS.gamesPlayed, String(gamesPlayed));
  localStorage.setItem(STORAGE_KEYS.winStreak, String(winStreak));
}

export function getStoredPlayerName(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(STORAGE_KEYS.playerName) ?? "";
}

export function setStoredPlayerName(name: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.playerName, name.trim());
}

/** Returns a stored alias or creates a new cool one (persisted). */
export function getOrCreatePlayerName(): string {
  if (typeof window === "undefined") return "Player";

  const stored = getStoredPlayerName().trim();
  if (stored && PLAYER_NAME_PATTERN.test(stored)) return stored;

  const name = generateCoolPlayerName();
  setStoredPlayerName(name);
  return name;
}

export function rerollPlayerName(): string {
  const name = generateCoolPlayerName();
  setStoredPlayerName(name);
  return name;
}

function submitSessionKey(mode: GameMode, score: number, level: number): string {
  return `ff_submitted_${mode}_${score}_${level}`;
}

export function wasScoreSubmittedThisSession(
  mode: GameMode,
  score: number,
  level: number
): boolean {
  if (typeof window === "undefined") return false;
  return sessionStorage.getItem(submitSessionKey(mode, score, level)) === "1";
}

export function markScoreSubmitted(
  mode: GameMode,
  score: number,
  level: number
): void {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(submitSessionKey(mode, score, level), "1");
}

export function isPwaDismissed(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(STORAGE_KEYS.pwaDismissed) === "1";
}

export function setPwaDismissed() {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.pwaDismissed, "1");
}

export function shouldShowPwaNudge(): boolean {
  if (typeof window === "undefined") return false;
  const stats = getLocalStats();
  return stats.gamesPlayed >= 2 && !isPwaDismissed();
}

export async function submitScore(payload: {
  playerName: string;
  gameMode: GameMode;
  score: number;
  levelReached: number;
}): Promise<SubmitScoreResponse> {
  try {
    const res = await fetch("/api/score", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = (await res.json()) as SubmitScoreResponse & { error?: string };

    if (!res.ok) {
      if (res.status === 429 || res.status === 400) {
        return { rank: null, offline: true, error: data.error };
      }
      return { rank: null, offline: true };
    }

    return data;
  } catch {
    return { rank: null, offline: true };
  }
}

export async function fetchLeaderboard(
  mode: GameMode
): Promise<ScoreEntry[]> {
  try {
    const res = await fetch(`/api/leaderboard?mode=${mode}`, {
      cache: "no-store",
    });

    if (!res.ok) return [];

    const data = (await res.json()) as { scores: ScoreEntry[] };
    return data.scores ?? [];
  } catch {
    return [];
  }
}

export async function fetchPlayerRank(
  mode: GameMode,
  playerName: string,
  score: number
): Promise<number | null> {
  try {
    const res = await fetch(
      `/api/leaderboard?mode=${mode}&player=${encodeURIComponent(playerName)}&score=${score}`,
      { cache: "no-store" }
    );

    if (!res.ok) return null;

    const data = (await res.json()) as { rank: number | null };
    return data.rank;
  } catch {
    return null;
  }
}
