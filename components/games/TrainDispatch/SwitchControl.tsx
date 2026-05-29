"use client";

interface SwitchControlProps {
  x: number;
  y: number;
  active: boolean;
  onToggle: () => void;
}

/** Standalone switch UI reference — rendering lives in TrainCanvas Konva layer. */
export function SwitchControl({ x, y, active, onToggle }: SwitchControlProps) {
  return (
    <button
      type="button"
      aria-label="Toggle track switch"
      onTouchStart={onToggle}
      onClick={onToggle}
      className="absolute min-h-[44px] min-w-[44px] -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-card transition-transform btn-press"
      style={{
        left: x,
        top: y,
        borderColor: active ? "#ffd60a" : "rgba(255,255,255,0.3)",
      }}
    />
  );
}
