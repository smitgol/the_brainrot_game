"use client";

import { motion } from "framer-motion";
import { useReducedMotion } from "@/lib/hooks";

interface ScorePopupProps {
  points: number;
  x: number;
  y: number;
  onDone?: () => void;
}

export function ScorePopup({ points, x, y, onDone }: ScorePopupProps) {
  const reduced = useReducedMotion();

  if (reduced) {
    return (
      <div
        className="pointer-events-none absolute font-display text-2xl text-teal neon-teal"
        style={{ left: x, top: y }}
      >
        +{points}
      </div>
    );
  }

  return (
    <motion.div
      className="pointer-events-none absolute font-display text-2xl text-teal neon-teal"
      style={{ left: x, top: y }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 0, y: -60 }}
      transition={{ duration: 0.8 }}
      onAnimationComplete={onDone}
    >
      +{points}
    </motion.div>
  );
}
