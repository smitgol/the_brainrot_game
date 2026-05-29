export type GameMode = "train" | "memory" | "reaction" | "echo";

export interface ScoreEntry {
  id: string;
  player_name: string;
  game_mode: GameMode;
  score: number;
  level_reached: number;
  created_at: string;
}

export interface SubmitScorePayload {
  playerName: string;
  gameMode: GameMode;
  score: number;
  levelReached: number;
}

export interface SubmitScoreResponse {
  rank: number | null;
  offline?: boolean;
  error?: string;
}

export const GAME_MODES: GameMode[] = ["train", "memory", "reaction", "echo"];

export const GAME_MODE_LABELS: Record<GameMode, string> = {
  train: "Train Dispatch",
  memory: "Memory Sequence",
  reaction: "Reaction Rush",
  echo: "Echo Recall",
};

export const STORAGE_KEYS = {
  bestScore: "ff_best_score",
  gamesPlayed: "ff_games_played",
  winStreak: "ff_win_streak",
  playerName: "ff_player_name",
  pwaDismissed: "ff_pwa_dismissed",
} as const;

export function isGameMode(value: string): value is GameMode {
  return GAME_MODES.includes(value as GameMode);
}
