"use client";

import { useEffect, useRef, useState } from "react";

interface TimerBarProps {
  duration: number;
  onEnd?: () => void;
  active?: boolean;
}

export function TimerBar({ duration, onEnd, active = true }: TimerBarProps) {
  const [remaining, setRemaining] = useState(duration);
  const endedRef = useRef(false);

  useEffect(() => {
    setRemaining(duration);
    endedRef.current = false;
  }, [duration, active]);

  useEffect(() => {
    if (!active) return;

    const interval = setInterval(() => {
      setRemaining((prev) => {
        const next = Math.max(0, prev - 100);
        if (next === 0 && !endedRef.current) {
          endedRef.current = true;
          onEnd?.();
        }
        return next;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [active, onEnd]);

  const percent = (remaining / duration) * 100;
  const color =
    percent > 50 ? "bg-teal" : percent > 25 ? "bg-yellow" : "bg-danger";

  return (
    <div className="h-2 w-full overflow-hidden rounded-[4px] bg-surface">
      <div
        className={`h-full transition-[width] duration-100 linear ${color}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
