"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GameShell } from "@/components/ui/GameShell";
import { GameHint } from "@/components/ui/GameHint";
import { TimerBar } from "@/components/ui/TimerBar";
import { MemoryGrid } from "./MemoryGrid";
import {
  calculateMemoryScore,
  getMemoryFlashDuration,
  getMemoryGridSize,
  getMemorySequenceLength,
} from "@/lib/gameLogic";
import { gameFeedback } from "@/lib/feedback";
import { useGameEnd, useGameToast, useLevelFlash } from "@/lib/hooks";

type Phase = "showing" | "input";
type CellFeedback = { index: number; type: "correct" | "wrong" } | null;

function generateSequence(length: number, cells: number): number[] {
  // Each square appears at most once: shuffle all cells and take the first N.
  const pool = Array.from({ length: cells }, (_, i) => i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, Math.min(length, cells));
}

export default function MemorySequenceGame() {
  const endGame = useGameEnd();
  const { toast, showToast, dismissToast } = useGameToast();
  const { active: levelFlash, triggerLevelFlash } = useLevelFlash();

  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [roundId, setRoundId] = useState(0);
  const [phase, setPhase] = useState<Phase>("showing");
  const [litIndex, setLitIndex] = useState<number | null>(null);
  const [feedback, setFeedback] = useState<CellFeedback>(null);
  const [timerActive, setTimerActive] = useState(false);

  const sequenceRef = useRef<number[]>([]);
  const inputCountRef = useRef(0);
  const streakRef = useRef(0);
  const livesRef = useRef(3);
  const scoreRef = useRef(0);
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

  const gridSize = getMemoryGridSize(level);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const push = useCallback((t: ReturnType<typeof setTimeout>) => {
    timersRef.current.push(t);
  }, []);

  // Drive each round: regenerate + replay the pattern whenever the round or
  // level changes. Reading `level` here keeps grid size / length up to date.
  useEffect(() => {
    clearTimers();
    const size = getMemoryGridSize(level);
    const length = getMemorySequenceLength(level);
    const seq = generateSequence(length, size * size);
    sequenceRef.current = seq;
    inputCountRef.current = 0;

    setPhase("showing");
    setLitIndex(null);
    setFeedback(null);
    setTimerActive(false);

    const flash = getMemoryFlashDuration(level);
    let idx = 0;

    const step = () => {
      if (idx >= seq.length) {
        setPhase("input");
        setTimerActive(true);
        return;
      }
      setLitIndex(seq[idx]);
      push(
        setTimeout(() => {
          setLitIndex(null);
          idx += 1;
          push(setTimeout(step, 240));
        }, flash)
      );
    };

    push(setTimeout(step, 450));

    return clearTimers;
  }, [roundId, level, clearTimers, push]);

  const loseLife = useCallback(() => {
    gameFeedback("wrong");
    setTimerActive(false);
    livesRef.current -= 1;
    setLives(livesRef.current);
    streakRef.current = 0;

    if (livesRef.current <= 0) {
      endGame({ score: scoreRef.current, mode: "memory", level, won: false });
      return;
    }

    showToast("Wrong! Watch the next pattern.", "danger");
    push(setTimeout(() => setRoundId((r) => r + 1), 1300));
  }, [endGame, level, push, showToast]);

  const handleTap = (index: number) => {
    if (phase !== "input") return;

    const seq = sequenceRef.current;
    const expected = seq[inputCountRef.current];

    if (index !== expected) {
      setFeedback({ index, type: "wrong" });
      loseLife();
      return;
    }

    setFeedback({ index, type: "correct" });
    inputCountRef.current += 1;
    push(setTimeout(() => setFeedback(null), 180));

    if (inputCountRef.current < seq.length) {
      gameFeedback("correct");
      return;
    }

    // Whole sequence reproduced.
    setTimerActive(false);
    const roundScore = calculateMemoryScore(seq.length, level);
    scoreRef.current += roundScore;
    setScore(scoreRef.current);
    gameFeedback("correct");
    streakRef.current += 1;
    showToast(`Nice! +${roundScore}`, "success");

    if (streakRef.current >= 2) {
      streakRef.current = 0;
      gameFeedback("levelUp");
      triggerLevelFlash();
      push(setTimeout(() => setLevel((l) => l + 1), 1100));
    } else {
      push(setTimeout(() => setRoundId((r) => r + 1), 1100));
    }
  };

  const handleTimerEnd = () => {
    if (phase === "input") {
      setFeedback(null);
      loseLife();
    }
  };

  const hint =
    phase === "showing"
      ? "Watch which squares light up"
      : "Tap the squares in the same order";

  return (
    <GameShell
      score={score}
      lives={lives}
      level={level}
      toast={toast}
      onDismissToast={dismissToast}
      levelFlash={levelFlash}
    >
      <div className="flex flex-1 flex-col gap-6 px-4 py-6">
        <GameHint>{hint}</GameHint>

        {phase === "input" ? (
          <TimerBar duration={8000} active={timerActive} onEnd={handleTimerEnd} />
        ) : (
          <div className="h-2 w-full" aria-hidden />
        )}

        <MemoryGrid
          size={gridSize}
          litIndex={litIndex}
          feedback={feedback}
          onTap={handleTap}
          disabled={phase !== "input"}
        />
      </div>
    </GameShell>
  );
}
