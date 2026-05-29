import { buildResultUrl, isWinningScore } from "./gameLogic";
import { getOrCreatePlayerName, updateLocalStats } from "./scores";
import type { GameMode } from "./types";

export interface EndGameParams {
  score: number;
  mode: GameMode;
  level?: number;
  avg?: number;
  best?: number;
  won?: boolean;
}

/** Persist stats and return the result page URL. */
export function endGame(params: EndGameParams): string {
  const won = params.won ?? isWinningScore(params.score);
  updateLocalStats(params.score, won);
  const name =
    typeof window !== "undefined" ? getOrCreatePlayerName() : undefined;
  return buildResultUrl({ ...params, name });
}
