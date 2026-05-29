"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { initAudio } from "./audio";
import { endGame, type EndGameParams } from "./gameSession";
import { getLocalStats } from "./scores";

export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);

    const handler = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return reduced;
}

export function useLocalStorageStats() {
  // Start with stable zeros so SSR and first client render match,
  // then hydrate real values from localStorage after mount.
  const [stats, setStats] = useState({
    bestScore: 0,
    gamesPlayed: 0,
    winStreak: 0,
  });

  useEffect(() => {
    const load = () => setStats(getLocalStats());
    load();
    window.addEventListener("focus", load);
    window.addEventListener("storage", load);
    return () => {
      window.removeEventListener("focus", load);
      window.removeEventListener("storage", load);
    };
  }, []);

  return stats;
}

export function useGameAudio() {
  useEffect(() => {
    initAudio();
  }, []);
}

export type GameToast = {
  message: string;
  type: "success" | "danger" | "warn";
};

export function useGameToast() {
  const [toast, setToast] = useState<GameToast | null>(null);

  const showToast = useCallback((message: string, type: GameToast["type"]) => {
    setToast({ message, type });
  }, []);

  const dismissToast = useCallback(() => setToast(null), []);

  return { toast, showToast, dismissToast };
}

export function useLevelFlash() {
  const [active, setActive] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const triggerLevelFlash = useCallback(() => {
    setActive(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setActive(false), 400);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { active, triggerLevelFlash };
}

export function useGameEnd() {
  const router = useRouter();

  return useCallback(
    (params: EndGameParams) => {
      router.push(endGame(params));
    },
    [router]
  );
}
