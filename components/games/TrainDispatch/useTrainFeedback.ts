"use client";

import { useEffect } from "react";
import { gameFeedback } from "@/lib/feedback";
import { useGameToast, useLevelFlash } from "@/lib/hooks";
import type { UseTrainEngineReturn } from "./useTrainEngine";

export function useTrainFeedback(
  engine: UseTrainEngineReturn,
  onDeliveryPopup: (points: number) => void
) {
  const { toast, showToast, dismissToast } = useGameToast();
  const { active: levelFlash, triggerLevelFlash } = useLevelFlash();

  useEffect(() => {
    if (engine.crashed) {
      gameFeedback("wrong");
      showToast("CRASH! Train collision or wrong platform.", "danger");
      engine.resetCrashFlag();
    }
  }, [engine.crashed, engine, showToast]);

  useEffect(() => {
    if (engine.delivered) {
      gameFeedback("correct");
      onDeliveryPopup(engine.deliveryPoints);
      showToast(`Delivered! +${engine.deliveryPoints}`, "success");
      engine.resetDeliveryFlag();
    }
  }, [engine.delivered, engine.deliveryPoints, engine, onDeliveryPopup, showToast]);

  useEffect(() => {
    if (engine.leveledUp) {
      gameFeedback("levelUp");
      triggerLevelFlash();
      engine.resetLevelUpFlag();
    }
  }, [engine.leveledUp, engine, triggerLevelFlash]);

  return { toast, dismissToast, levelFlash };
}
