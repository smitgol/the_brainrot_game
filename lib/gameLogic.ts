import type { GameMode } from "./types";
import { GAME_MODE_LABELS } from "./types";

export interface PerformanceTier {
  emoji: string;
  message: string;
}

export const WIN_SCORE_THRESHOLD = 50;

export function isWinningScore(score: number): boolean {
  return score >= WIN_SCORE_THRESHOLD;
}

export interface ResultUrlParams {
  score: number;
  mode: GameMode;
  level?: number;
  avg?: number;
  best?: number;
  name?: string;
}

export function buildResultUrl(
  params: ResultUrlParams,
  origin?: string
): string {
  const search = new URLSearchParams({
    score: String(params.score),
    mode: params.mode,
  });
  if (params.level !== undefined) search.set("level", String(params.level));
  if (params.avg !== undefined) search.set("avg", String(params.avg));
  if (params.best !== undefined) search.set("best", String(params.best));
  if (params.name) search.set("name", params.name);

  const base =
    origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/result?${search.toString()}`;
}

export function getPerformanceTier(score: number): PerformanceTier {
  if (score >= 200) return { emoji: "🧠", message: "Big brain energy" };
  if (score >= 100) return { emoji: "🔥", message: "Certified focus god" };
  if (score >= 50) return { emoji: "⚡", message: "Getting focused" };
  if (score >= 20) return { emoji: "🌱", message: "You're warming up" };
  return { emoji: "💀", message: "Brain rot detected" };
}

export function getFocusBarPercent(score: number): number {
  return Math.min(100, Math.round((score / 300) * 100));
}

export function calculateMemoryScore(
  sequenceLength: number,
  level: number
): number {
  return sequenceLength * 10 + level * 5;
}

export function calculateReactionScore(ms: number): number {
  if (ms < 200) return 50;
  if (ms < 300) return 35;
  if (ms < 400) return 25;
  if (ms < 600) return 15;
  return 5;
}

export function calculateTrainDeliveryScore(timeBonus: number): number {
  return 20 + Math.max(0, Math.round(timeBonus));
}

export function getMemoryFlashDuration(level: number): number {
  return Math.max(400, 900 - (level - 1) * 50);
}

export function getMemoryGridSize(_level: number): number {
  // Always a 4x4 board; difficulty comes from the growing sequence length.
  return 4;
}

export function getMemorySequenceLength(level: number): number {
  // Start at 3 squares, add one per level, capped to the grid's cell count.
  const cells = getMemoryGridSize(level) ** 2;
  return Math.min(cells, 2 + level);
}

export function getEchoStimulusDuration(level: number): number {
  // Fast stream that keeps tightening; floored so it stays readable.
  return Math.max(1100, 2200 - (level - 1) * 180);
}

export function getEchoN(level: number): number {
  // Starts at 2-back and climbs one per level, capped so it stays humanly hard.
  return Math.min(level + 1, 7);
}

export function calculateEchoScore(n: number): number {
  return 10 + n * 5;
}

export function formatTimeAgo(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export function getShareUrl(score: number, mode: GameMode, name: string) {
  if (typeof window === "undefined") return "";
  return buildResultUrl({ score, mode, name: name || "Player" });
}

export function getShareText(score: number, mode: GameMode, name: string) {
  const label = GAME_MODE_LABELS[mode];
  return `${name} scored ${score} in ${label} on The Brain Rot Game. Can you beat me?`;
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function distance(
  x1: number,
  y1: number,
  x2: number,
  y2: number
): number {
  const dx = x2 - x1;
  const dy = y2 - y1;
  return Math.sqrt(dx * dx + dy * dy);
}
