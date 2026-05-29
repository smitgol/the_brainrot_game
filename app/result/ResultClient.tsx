"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { ShareCard } from "@/components/ui/ShareCard";
import { StatCell } from "@/components/ui/StatCell";
import { RankBadge } from "@/components/ui/RankBadge";
import { getFocusBarPercent, getPerformanceTier } from "@/lib/gameLogic";
import {
  fetchPlayerRank,
  getLocalStats,
  getOrCreatePlayerName,
  markScoreSubmitted,
  rerollPlayerName,
  setStoredPlayerName,
  submitScore,
  wasScoreSubmittedThisSession,
} from "@/lib/scores";
import { GAME_MODE_LABELS, isGameMode, type GameMode } from "@/lib/types";
import { useReducedMotion } from "@/lib/hooks";

interface ResultClientProps {
  score: number;
  mode: string;
  level: number;
  avg?: string;
  best?: string;
  initialName?: string;
}

export default function ResultClient({
  score,
  mode: modeParam,
  level,
  avg,
  best,
  initialName = "",
}: ResultClientProps) {
  const router = useRouter();
  const reduced = useReducedMotion();
  const mode: GameMode = isGameMode(modeParam) ? modeParam : "train";

  const [name, setName] = useState(initialName);
  const [rank, setRank] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);

  const count = useMotionValue(0);
  const rounded = useTransform(count, (v) => Math.round(v));
  const [displayScore, setDisplayScore] = useState(reduced ? score : 0);

  const tier = getPerformanceTier(score);
  const focusPercent = getFocusBarPercent(score);
  const [localStats, setLocalStats] = useState({
    bestScore: 0,
    gamesPlayed: 0,
    winStreak: 0,
  });

  const submitLock = useRef(false);

  const pushToLeaderboard = useCallback(
    async (playerName: string) => {
      setSubmitting(true);
      setSubmitError(null);

      const result = await submitScore({
        playerName,
        gameMode: mode,
        score,
        levelReached: level,
      });

      setSubmitting(false);

      if (result.error) {
        setSubmitError(result.error);
        setSubmitted(false);
        return false;
      }

      markScoreSubmitted(mode, score, level);
      setSubmitted(true);

      if (result.rank) {
        setRank(result.rank);
      } else if (!result.offline) {
        const playerRank = await fetchPlayerRank(mode, playerName, score);
        setRank(playerRank);
      } else {
        setSubmitError("Leaderboard offline — check your connection.");
      }

      return true;
    },
    [mode, score, level]
  );

  useEffect(() => {
    setLocalStats(getLocalStats());

    const fromUrl = initialName.trim();
    const alias =
      fromUrl && /^[a-zA-Z0-9]/.test(fromUrl)
        ? fromUrl.slice(0, 24)
        : getOrCreatePlayerName();
    setName(alias);
    if (fromUrl) setStoredPlayerName(alias);
  }, [initialName]);

  useEffect(() => {
    if (!name.trim() || submitLock.current) return;
    if (wasScoreSubmittedThisSession(mode, score, level)) {
      setSubmitted(true);
      setSubmitting(false);
      void fetchPlayerRank(mode, name.trim(), score).then(setRank);
      return;
    }

    submitLock.current = true;
    void pushToLeaderboard(name.trim());
  }, [name, mode, score, level, pushToLeaderboard]);

  useEffect(() => {
    if (reduced) {
      setDisplayScore(score);
      return;
    }
    const controls = animate(count, score, { duration: 1.2 });
    const unsub = rounded.on("change", (v) => setDisplayScore(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [count, reduced, rounded, score]);

  const handleRerollName = () => {
    const next = rerollPlayerName();
    setName(next);
    setEditingName(false);
  };

  const handleSaveName = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setStoredPlayerName(trimmed);
    setEditingName(false);
    submitLock.current = false;
    await pushToLeaderboard(trimmed);
  };

  const handleRetry = () => {
    submitLock.current = false;
    void pushToLeaderboard(name.trim());
  };

  const modeStat =
    mode === "reaction"
      ? `Best ${best ?? avg ?? "—"}ms`
      : `Level ${level}`;

  return (
    <PageTransition>
      <main className="flex min-h-screen flex-col px-4 py-8">
        <div className="text-center">
          <span className="text-5xl">{tier.emoji}</span>
          <p className="mt-4 font-display text-[64px] leading-none tracking-display text-teal neon-teal">
            {displayScore}
          </p>
          <p className="font-label text-[12px] tracking-label text-muted">
            FOCUS SCORE
          </p>
          <p className="mt-2 font-mono text-[14px]">
            {tier.message} {tier.emoji}
          </p>
        </div>

        <div className="mt-6 rounded-[12px] border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-2">
            <p className="font-label text-[10px] tracking-label text-muted">
              YOUR ALIAS
            </p>
            {submitting && (
              <span className="font-mono text-[10px] text-teal blink">
                saving…
              </span>
            )}
            {submitted && !submitting && (
              <span className="font-mono text-[10px] text-success">
                on leaderboard ✓
              </span>
            )}
          </div>

          {editingName ? (
            <div className="mt-3 space-y-2">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={24}
                className="min-h-[44px] w-full rounded-[10px] border border-border bg-surface px-4 font-mono text-[13px] outline-none focus:border-teal"
              />
              <button
                type="button"
                onClick={() => void handleSaveName()}
                disabled={submitting || !name.trim()}
                className="btn-press min-h-[40px] w-full rounded-[10px] bg-teal font-label text-[11px] tracking-label text-bg disabled:opacity-40"
              >
                Save & update score
              </button>
            </div>
          ) : (
            <div className="mt-2 flex items-center justify-between gap-3">
              <p className="font-display text-[28px] leading-none tracking-display text-white">
                {name || "…"}
              </p>
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  onClick={handleRerollName}
                  className="btn-press rounded-[10px] bg-surface px-3 py-2 font-label text-[10px] tracking-label text-yellow"
                  title="Random new alias"
                >
                  🎲
                </button>
                <button
                  type="button"
                  onClick={() => setEditingName(true)}
                  className="btn-press rounded-[10px] bg-surface px-3 py-2 font-label text-[10px] tracking-label text-muted"
                >
                  EDIT
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 grid grid-cols-2 gap-3">
          <StatCell variant="card" label="Max Level" value={level} />
          <StatCell variant="card" label="Best Streak" value={localStats.winStreak} />
          <StatCell variant="card" label="All-Time Best" value={localStats.bestScore} />
          <StatCell variant="card" label="Mode Stat" value={modeStat} />
        </div>

        <div className="mt-6">
          <div className="mb-2 flex justify-between font-label text-[10px] tracking-label text-muted">
            <span>Focus</span>
            <span>{focusPercent}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-[4px] bg-surface">
            <motion.div
              className="h-full bg-teal"
              initial={{ width: 0 }}
              animate={{ width: `${focusPercent}%` }}
              transition={{ duration: reduced ? 0 : 1, delay: reduced ? 0 : 0.3 }}
            />
          </div>
        </div>

        {rank !== null && <RankBadge rank={rank} className="mt-4" />}

        {submitError && (
          <div className="mt-4 space-y-2 text-center">
            <p className="font-mono text-[11px] text-danger">{submitError}</p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={submitting}
              className="btn-press font-label text-[11px] tracking-label text-teal"
            >
              Retry submit
            </button>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <ShareCard score={score} mode={mode} name={name || "Player"} />
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="btn-press min-h-[44px] rounded-[12px] bg-surface font-label text-[12px] tracking-label"
            >
              Home
            </button>
            <button
              type="button"
              onClick={() => router.push(`/game/${mode}`)}
              className="btn-press min-h-[44px] rounded-[12px] bg-purple font-label text-[12px] tracking-label text-bg"
            >
              Play Again
            </button>
          </div>
        </div>

        <p className="mt-4 text-center font-mono text-[11px] text-muted">
          {GAME_MODE_LABELS[mode]}
        </p>
      </main>
    </PageTransition>
  );
}
