import type { GameMode } from "./types";

/** Max score per mode — generous ceilings above realistic play, blocks spam payloads. */
export const SCORE_CAPS: Record<GameMode, number> = {
  reaction: 250, // 5 rounds × 50 pts max
  memory: 25_000,
  train: 50_000,
  echo: 15_000,
};

/** Max level_reached per mode. */
export const LEVEL_CAPS: Record<GameMode, number> = {
  reaction: 5,
  memory: 200,
  train: 200,
  echo: 50,
};

export const PLAYER_NAME_MIN = 1;
export const PLAYER_NAME_MAX = 24;

/** Matches DB policy (POSIX alnum + space . _ -). */
export const PLAYER_NAME_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9 _.'-]{0,23}$/;

export const RATE_LIMITS = {
  /** Submissions per player (all modes) per hour. */
  perPlayerPerHour: 15,
  /** Submissions per player per mode per hour. */
  perPlayerModePerHour: 6,
} as const;

export type ScoreValidationError =
  | "invalid_payload"
  | "invalid_name"
  | "invalid_mode"
  | "score_too_high"
  | "level_too_high";

export interface ValidatedScorePayload {
  playerName: string;
  gameMode: GameMode;
  score: number;
  levelReached: number;
}

export function validateScorePayload(
  body: unknown,
  isGameMode: (v: string) => v is GameMode
): { ok: true; data: ValidatedScorePayload } | { ok: false; error: ScoreValidationError } {
  if (!body || typeof body !== "object") {
    return { ok: false, error: "invalid_payload" };
  }

  const { playerName, gameMode, score, levelReached } = body as Record<
    string,
    unknown
  >;

  if (typeof playerName !== "string") {
    return { ok: false, error: "invalid_name" };
  }

  const trimmed = playerName.trim();
  if (
    trimmed.length < PLAYER_NAME_MIN ||
    trimmed.length > PLAYER_NAME_MAX ||
    !PLAYER_NAME_PATTERN.test(trimmed)
  ) {
    return { ok: false, error: "invalid_name" };
  }

  if (typeof gameMode !== "string" || !isGameMode(gameMode)) {
    return { ok: false, error: "invalid_mode" };
  }

  if (typeof score !== "number" || !Number.isInteger(score) || score < 0) {
    return { ok: false, error: "invalid_payload" };
  }

  if (score > SCORE_CAPS[gameMode]) {
    return { ok: false, error: "score_too_high" };
  }

  const level =
    levelReached === undefined
      ? 1
      : typeof levelReached === "number" &&
          Number.isInteger(levelReached) &&
          levelReached >= 1
        ? levelReached
        : NaN;

  if (!Number.isFinite(level) || level > LEVEL_CAPS[gameMode]) {
    return { ok: false, error: "level_too_high" };
  }

  return {
    ok: true,
    data: {
      playerName: trimmed,
      gameMode,
      score,
      levelReached: level,
    },
  };
}

export function validationErrorMessage(error: ScoreValidationError): string {
  switch (error) {
    case "invalid_name":
      return "Name must be 1–24 characters (letters, numbers, spaces, . _ -).";
    case "invalid_mode":
      return "Invalid game mode.";
    case "score_too_high":
      return "Score exceeds the allowed maximum for this mode.";
    case "level_too_high":
      return "Level exceeds the allowed maximum for this mode.";
    default:
      return "Invalid score payload.";
  }
}
