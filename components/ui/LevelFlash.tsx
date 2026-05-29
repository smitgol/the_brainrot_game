"use client";

interface LevelFlashProps {
  active: boolean;
}

export function LevelFlash({ active }: LevelFlashProps) {
  if (!active) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[9997] bg-white level-flash"
      aria-hidden
    />
  );
}
