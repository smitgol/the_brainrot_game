"use client";

import { LivesDisplay } from "@/components/ui/LivesDisplay";

interface GameHeaderProps {
  onBack: () => void;
  score: number;
  lives: number;
  level: number;
  streak?: number;
  showLives?: boolean;
}

export function GameHeader({
  onBack,
  score,
  lives,
  level,
  streak = 0,
  showLives = true,
}: GameHeaderProps) {
  return (
    <header className="flex items-center justify-between gap-2 border-b border-border px-4 py-3">
      <button
        type="button"
        onClick={onBack}
        className="btn-press min-h-[44px] min-w-[44px] rounded-[10px] bg-surface px-3 font-label text-[11px] tracking-label text-muted transition-transform"
        aria-label="Go back"
      >
        ←
      </button>

      <div className="flex flex-1 items-center justify-center">
        {showLives && <LivesDisplay lives={lives} />}
      </div>

      <div className="flex items-center gap-2">
        {streak >= 3 && (
          <span className="rounded-[8px] bg-accent/20 px-2 py-1 font-label text-[10px] tracking-label text-accent">
            🔥 {streak}x STREAK
          </span>
        )}
        <span className="font-display text-[28px] leading-none tracking-display text-teal neon-teal">
          {score}
        </span>
        <span className="rounded-[8px] border border-border bg-card px-2 py-1 font-label text-[10px] tracking-label text-yellow">
          L{level}
        </span>
      </div>
    </header>
  );
}
