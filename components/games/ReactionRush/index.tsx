"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/ui/GameShell";
import { GameHint } from "@/components/ui/GameHint";
import { StatCell, StatGrid } from "@/components/ui/StatCell";
import { TargetZone } from "./TargetZone";
import { calculateReactionScore } from "@/lib/gameLogic";
import { gameFeedback } from "@/lib/feedback";
import { useGameEnd } from "@/lib/hooks";

type RoundState = "wait" | "ready" | "result" | "too-early";

const TOTAL_ROUNDS = 5;

export default function ReactionRushGame() {
  const endGame = useGameEnd();
  const [round, setRound] = useState(1);
  const [score, setScore] = useState(0);
  const [state, setState] = useState<RoundState>("wait");
  const [reactionMs, setReactionMs] = useState<number | null>(null);
  const [lastMs, setLastMs] = useState<number | null>(null);
  const [bestMs, setBestMs] = useState<number | null>(null);
  const [avgMs, setAvgMs] = useState<number | null>(null);
  const readyAtRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const timesRef = useRef<number[]>([]);
  const bestMsRef = useRef<number | null>(null);

  const startRound = useCallback(() => {
    setState("wait");
    setReactionMs(null);

    const delay = 1500 + Math.random() * 3500;
    timeoutRef.current = setTimeout(() => {
      readyAtRef.current = performance.now();
      setState("ready");
    }, delay);
  }, []);

  useEffect(() => {
    startRound();
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [startRound]);

  const finishGame = useCallback(
    (finalScore: number, times: number[]) => {
      const avg = times.length
        ? Math.round(times.reduce((a, b) => a + b, 0) / times.length)
        : 0;
      endGame({
        score: finalScore,
        mode: "reaction",
        avg,
        best: bestMsRef.current ?? avg,
      });
    },
    [endGame]
  );

  const handleTap = () => {
    if (state === "wait") {
      gameFeedback("wrong");
      setScore((s) => Math.max(0, s - 5));
      setState("too-early");
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      setTimeout(() => startRound(), 1200);
      return;
    }

    if (state === "ready") {
      const ms = Math.round(performance.now() - readyAtRef.current);
      if (ms > 2000) {
        setState("result");
        setReactionMs(ms);
        setLastMs(ms);
        return;
      }

      const pts = calculateReactionScore(ms);
      setScore((s) => s + pts);
      setReactionMs(ms);
      setLastMs(ms);
      setBestMs((b) => {
        const next = b === null ? ms : Math.min(b, ms);
        bestMsRef.current = next;
        return next;
      });
      timesRef.current = [...timesRef.current, ms];
      const avg = Math.round(
        timesRef.current.reduce((a, b) => a + b, 0) / timesRef.current.length
      );
      setAvgMs(avg);
      gameFeedback("correct");
      setState("result");

      setTimeout(() => {
        if (round >= TOTAL_ROUNDS) {
          setScore((current) => {
            finishGame(current, timesRef.current);
            return current;
          });
        } else {
          setRound((r) => r + 1);
          startRound();
        }
      }, 1500);
    }
  };

  return (
    <GameShell score={score} level={round} showLives={false}>
      <div className="flex flex-1 flex-col gap-4 px-4 py-4">
        <StatGrid columns={3}>
          <StatCell
            variant="inline"
            label="Last"
            value={lastMs !== null ? `${lastMs}ms` : "—"}
          />
          <StatCell
            variant="inline"
            label="Best"
            value={bestMs !== null ? `${bestMs}ms` : "—"}
          />
          <StatCell
            variant="inline"
            label="Avg"
            value={avgMs !== null ? `${avgMs}ms` : "—"}
          />
        </StatGrid>

        <GameHint>
          Round {round} / {TOTAL_ROUNDS}
        </GameHint>

        <TargetZone state={state} reactionMs={reactionMs} onTap={handleTap} />
      </div>
    </GameShell>
  );
}
