"use client";

import { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { GameShell } from "@/components/ui/GameShell";
import { GameHint } from "@/components/ui/GameHint";
import { ScorePopup } from "@/components/ui/ScorePopup";
import { useGameEnd } from "@/lib/hooks";
import { initAudio } from "@/lib/audio";
import { useTrainEngine } from "./useTrainEngine";
import { useCanvasWidth } from "./useCanvasWidth";
import { useTrainFeedback } from "./useTrainFeedback";
import { TrainInstructions } from "./TrainInstructions";

const TrainCanvas = dynamic(
  () => import("./TrainCanvas").then((m) => m.TrainCanvas),
  { ssr: false }
);

export default function TrainDispatchGame() {
  const engine = useTrainEngine();
  const endGame = useGameEnd();
  const { ref, width } = useCanvasWidth();
  const [popup, setPopup] = useState<{ points: number; x: number; y: number } | null>(null);

  const onDeliveryPopup = useCallback(
    (points: number) => {
      setPopup({ points, x: width / 2 - 20, y: 120 });
    },
    [width]
  );

  const { toast, dismissToast, levelFlash } = useTrainFeedback(
    engine,
    onDeliveryPopup
  );

  useEffect(() => {
    if (engine.gameOver) {
      endGame({ score: engine.score, mode: "train", level: engine.level });
    }
  }, [engine.gameOver, engine.score, engine.level, endGame]);

  return (
    <GameShell
      score={engine.score}
      lives={engine.lives}
      level={engine.level}
      streak={engine.streak}
      toast={toast}
      onDismissToast={dismissToast}
      levelFlash={levelFlash}
      footer={
        <GameHint>
          Tap the yellow switches to send each train to its matching letter
        </GameHint>
      }
    >
      <div ref={ref} className="relative flex-1 px-4 py-4">
        <TrainCanvas
          width={width}
          trains={engine.trains}
          switches={engine.switches}
          platforms={engine.platforms}
          segments={engine.segments}
          onToggleSwitch={engine.toggleSwitch}
          shake={toast?.type === "danger"}
        />
        {popup && (
          <ScorePopup
            points={popup.points}
            x={popup.x}
            y={popup.y}
            onDone={() => setPopup(null)}
          />
        )}
        {!engine.started && (
          <TrainInstructions
            onStart={() => {
              initAudio();
              engine.start();
            }}
          />
        )}
      </div>
    </GameShell>
  );
}
