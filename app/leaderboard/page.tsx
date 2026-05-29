"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/PageTransition";
import { RankBadge } from "@/components/ui/RankBadge";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { fetchLeaderboard, getOrCreatePlayerName } from "@/lib/scores";
import { formatTimeAgo } from "@/lib/gameLogic";
import {
  GAME_MODE_LABELS,
  GAME_MODES,
  type GameMode,
  type ScoreEntry,
} from "@/lib/types";

export default function LeaderboardPage() {
  const [mode, setMode] = useState<GameMode>("train");
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [playerName, setPlayerName] = useState("");
  const youRowRef = useRef<HTMLTableRowElement>(null);

  const isYou = (name: string) =>
    Boolean(playerName) &&
    name.trim().toLowerCase() === playerName.trim().toLowerCase();

  const load = useCallback(async () => {
    setLoading(true);
    const data = await fetchLeaderboard(mode);
    setScores(data);
    setLoading(false);
  }, [mode]);

  useEffect(() => {
    setPlayerName(getOrCreatePlayerName());
  }, []);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), 30000);
    return () => clearInterval(interval);
  }, [load]);

  const playerIndex = scores.findIndex((s) => isYou(s.player_name));

  useEffect(() => {
    if (!loading && playerIndex >= 0) {
      youRowRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }
  }, [loading, playerIndex, mode]);

  return (
    <PageTransition>
      <main className="min-h-screen px-4 py-6">
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/"
            className="btn-press font-label text-[11px] tracking-label text-muted"
          >
            ← Home
          </Link>
          <h1 className="font-display text-[32px] tracking-display gradient-logo">
            LEADERBOARD
          </h1>
          <div className="w-12" />
        </div>

        <div className="mb-4 flex gap-2 overflow-x-auto">
          {GAME_MODES.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              className={`btn-press shrink-0 rounded-[10px] px-3 py-2 font-label text-[10px] tracking-label ${
                mode === m
                  ? "bg-accent text-white"
                  : "bg-surface text-muted"
              }`}
            >
              {GAME_MODE_LABELS[m]}
            </button>
          ))}
        </div>

        {playerIndex >= 0 && (
          <RankBadge rank={playerIndex + 1} className="mb-4" />
        )}

        {loading ? (
          <LoadingScreen />
        ) : scores.length === 0 ? (
          <p className="text-center font-mono text-[12px] text-muted">
            No scores yet. Be the first!
          </p>
        ) : (
          <div className="overflow-hidden rounded-[12px] border border-border">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-surface font-label text-[10px] tracking-label text-muted">
                  <th className="px-3 py-2">#</th>
                  <th className="px-3 py-2">Player</th>
                  <th className="px-3 py-2">Score</th>
                  <th className="px-3 py-2">Time</th>
                </tr>
              </thead>
              <tbody>
                {scores.map((entry, i) => {
                  const you = isYou(entry.player_name);
                  return (
                    <tr
                      key={entry.id}
                      ref={you && i === playerIndex ? youRowRef : undefined}
                      className={`border-b border-border font-mono text-[11px] ${
                        you
                          ? "bg-accent/20 ring-1 ring-inset ring-accent/50"
                          : "bg-card"
                      }`}
                    >
                      <td
                        className={`px-3 py-2 ${
                          you ? "font-label text-accent" : "text-muted"
                        }`}
                      >
                        {you ? "▸" : i + 1}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={
                            you ? "font-label tracking-label text-white" : ""
                          }
                        >
                          {entry.player_name}
                        </span>
                        {you && (
                          <span className="ml-2 rounded-[4px] bg-accent px-1.5 py-0.5 font-label text-[9px] tracking-label text-white">
                            YOU
                          </span>
                        )}
                      </td>
                      <td
                        className={`px-3 py-2 font-display text-[18px] ${
                          you ? "text-teal neon-teal" : "text-teal"
                        }`}
                      >
                        {entry.score}
                      </td>
                      <td className="px-3 py-2 text-muted">
                        {formatTimeAgo(entry.created_at)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </PageTransition>
  );
}
