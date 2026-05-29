"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { GameShell } from "@/components/ui/GameShell";
import { GameHint } from "@/components/ui/GameHint";
import {
  calculateEchoScore,
  getEchoN,
  getEchoStimulusDuration,
} from "@/lib/gameLogic";
import { gameFeedback } from "@/lib/feedback";
import {
  useGameEnd,
  useGameToast,
  useLevelFlash,
  useReducedMotion,
} from "@/lib/hooks";
import { initAudio } from "@/lib/audio";
import { EchoInstructions } from "./EchoInstructions";

const SYMBOLS = ["🧠", "👾", "🔥", "💎", "🎲", "🍕", "🛸", "👻"];
const TRIALS_PER_ROUND = 8;
const ISI_MS = 400;
const MATCH_RATE = 0.3;
const LURE_RATE = 0.45;

type Flash = "correct" | "wrong" | null;

export default function EchoRecallGame() {
  const endGame = useGameEnd();
  const { toast, showToast, dismissToast } = useGameToast();
  const { active: levelFlash, triggerLevelFlash } = useLevelFlash();
  const reduced = useReducedMotion();

  const [started, setStarted] = useState(false);
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [symbol, setSymbol] = useState<string | null>(null);
  const [flash, setFlash] = useState<Flash>(null);
  const [tapLocked, setTapLocked] = useState(true);
  const [trialKey, setTrialKey] = useState(0);
  const [roundProgress, setRoundProgress] = useState(0);

  const historyRef = useRef<string[]>([]);
  const isMatchRef = useRef(false);
  const resolvedRef = useRef(false);
  const levelRef = useRef(1);
  const scoreRef = useRef(0);
  const livesRef = useRef(3);
  const roundCountRef = useRef(0);
  const gameOverRef = useRef(false);
  const stimDurRef = useRef(getEchoStimulusDuration(1));
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const endTrialRef = useRef<() => void>(() => {});

  const n = getEchoN(level);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const push = useCallback((t: ReturnType<typeof setTimeout>) => {
    timersRef.current.push(t);
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const flashFx = useCallback(
    (type: Flash) => {
      setFlash(type);
      push(setTimeout(() => setFlash(null), 260));
    },
    [push]
  );

  const finish = useCallback(() => {
    gameOverRef.current = true;
    clearTimers();
    endGame({ score: scoreRef.current, mode: "echo", level: levelRef.current });
  }, [clearTimers, endGame]);

  const loseLife = useCallback(
    (reason: string) => {
      gameFeedback("wrong");
      flashFx("wrong");
      livesRef.current -= 1;
      setLives(livesRef.current);
      showToast(reason, "danger");
      if (livesRef.current <= 0) {
        finish();
        return true;
      }
      return false;
    },
    [finish, flashFx, showToast]
  );

  const startStimulus = useCallback(() => {
    if (gameOverRef.current) return;

    const nBack = getEchoN(levelRef.current);
    const hist = historyRef.current;
    const i = hist.length;
    const back = i >= nBack ? hist[i - nBack] : null;

    let sym: string;
    if (back && Math.random() < MATCH_RATE) {
      // True N-back match.
      sym = back;
    } else {
      // Lures: a repeat at N-1 or N+1 back. Looks tempting, but tapping = miss.
      const lures = [nBack - 1, nBack + 1]
        .filter((o) => o >= 1 && i - o >= 0)
        .map((o) => hist[i - o])
        .filter((s) => s && s !== back);

      if (lures.length && Math.random() < LURE_RATE) {
        sym = lures[Math.floor(Math.random() * lures.length)];
      } else {
        do {
          sym = SYMBOLS[Math.floor(Math.random() * SYMBOLS.length)];
        } while (sym === back);
      }
    }

    historyRef.current.push(sym);
    isMatchRef.current = back !== null && sym === back;
    resolvedRef.current = false;

    setSymbol(sym);
    setTapLocked(false);
    setTrialKey((k) => k + 1);

    push(setTimeout(() => endTrialRef.current(), stimDurRef.current));
  }, [push]);

  const endStimulus = useCallback(() => {
    if (gameOverRef.current) return;

    // A match that was never tapped is a miss.
    if (isMatchRef.current && !resolvedRef.current) {
      if (loseLife("Missed a match!")) return;
    }

    setSymbol(null);
    setTapLocked(true);

    roundCountRef.current += 1;
    setRoundProgress(roundCountRef.current);

    const levelUp = roundCountRef.current >= TRIALS_PER_ROUND;
    if (levelUp) {
      levelRef.current += 1;
      setLevel(levelRef.current);
      stimDurRef.current = getEchoStimulusDuration(levelRef.current);
      roundCountRef.current = 0;
      setRoundProgress(0);
      historyRef.current = []; // fresh window so the new N starts clean
      gameFeedback("levelUp");
      triggerLevelFlash();
      showToast(`${getEchoN(levelRef.current)}-BACK unlocked`, "success");
    }

    push(setTimeout(startStimulus, levelUp ? 1200 : ISI_MS));
  }, [loseLife, push, showToast, startStimulus, triggerLevelFlash]);

  useEffect(() => {
    endTrialRef.current = endStimulus;
  }, [endStimulus]);

  const handleMatch = () => {
    if (!started || gameOverRef.current || symbol === null || resolvedRef.current)
      return;

    resolvedRef.current = true;
    setTapLocked(true);

    if (isMatchRef.current) {
      const pts = calculateEchoScore(getEchoN(levelRef.current));
      scoreRef.current += pts;
      setScore(scoreRef.current);
      gameFeedback("correct");
      flashFx("correct");
      showToast(`Match! +${pts}`, "success");
    } else {
      loseLife("Not a match");
    }
  };

  const begin = () => {
    initAudio();
    historyRef.current = [];
    levelRef.current = 1;
    scoreRef.current = 0;
    livesRef.current = 3;
    roundCountRef.current = 0;
    gameOverRef.current = false;
    stimDurRef.current = getEchoStimulusDuration(1);
    setLevel(1);
    setScore(0);
    setLives(3);
    setRoundProgress(0);
    setStarted(true);
    push(setTimeout(startStimulus, 700));
  };

  const borderClass =
    flash === "correct"
      ? "border-success"
      : flash === "wrong"
        ? "border-danger"
        : symbol
          ? "border-teal/60"
          : "border-border";

  return (
    <GameShell
      score={score}
      lives={lives}
      level={level}
      toast={toast}
      onDismissToast={dismissToast}
      levelFlash={levelFlash}
    >
      <div className="relative flex flex-1 flex-col gap-5 px-4 py-6">
        <div className="text-center">
          <p className="font-label text-[11px] tracking-label text-muted">
            TAP IF IT MATCHES
          </p>
          <p className="font-display text-[40px] leading-none tracking-display text-teal neon-teal">
            {n}-BACK
          </p>
          <p className="mt-1 font-mono text-[11px] text-muted">
            the symbol from {n} {n === 1 ? "step" : "steps"} ago
          </p>
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <div
            className={`flex h-44 w-44 items-center justify-center rounded-[16px] border-2 bg-card transition-colors duration-150 ${borderClass}`}
          >
            <span className="text-[88px] leading-none">
              {symbol ?? <span className="text-muted opacity-30">•••</span>}
            </span>
          </div>

          <div className="h-1.5 w-44 overflow-hidden rounded-full bg-surface">
            {symbol && !reduced ? (
              <motion.div
                key={trialKey}
                className="h-full origin-left bg-teal"
                initial={{ scaleX: 1 }}
                animate={{ scaleX: 0 }}
                transition={{ duration: stimDurRef.current / 1000, ease: "linear" }}
              />
            ) : (
              <div className="h-full w-full bg-transparent" />
            )}
          </div>

          <p className="font-mono text-[10px] tracking-label text-muted">
            ROUND {Math.min(roundProgress + (symbol ? 1 : 0), TRIALS_PER_ROUND)} /{" "}
            {TRIALS_PER_ROUND}
          </p>
        </div>

        <button
          type="button"
          onClick={handleMatch}
          disabled={tapLocked}
          className="btn-press min-h-[68px] w-full rounded-[14px] bg-teal font-label text-[16px] tracking-label text-bg transition-transform disabled:opacity-30"
        >
          MATCH
        </button>

        <GameHint>
          Symbols stream by. Hit MATCH only when the current one repeats from{" "}
          {n}-back.
        </GameHint>

        {!started && <EchoInstructions onStart={begin} />}
      </div>
    </GameShell>
  );
}
