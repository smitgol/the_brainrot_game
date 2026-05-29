"use client";

interface LivesDisplayProps {
  lives: number;
  max?: number;
}

export function LivesDisplay({ lives, max = 3 }: LivesDisplayProps) {
  return (
    <div
      className="flex items-center justify-center gap-1"
      aria-label={`${lives} lives remaining`}
    >
      {Array.from({ length: max }).map((_, i) => (
        <span
          key={i}
          className={`text-base ${i < lives ? "opacity-100" : "opacity-25"}`}
          aria-hidden
        >
          ❤️
        </span>
      ))}
    </div>
  );
}
