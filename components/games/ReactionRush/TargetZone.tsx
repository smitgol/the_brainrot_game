"use client";

interface TargetZoneProps {
  state: "wait" | "ready" | "result" | "too-early";
  reactionMs: number | null;
  onTap: () => void;
}

const labels = {
  wait: "wait for it...",
  ready: "TAP NOW!!!",
  result: "",
  "too-early": "too early!",
};

const bgColors = {
  wait: "bg-surface",
  ready: "bg-yellow",
  result: "bg-card",
  "too-early": "bg-danger",
};

export function TargetZone({ state, reactionMs, onTap }: TargetZoneProps) {
  return (
    <button
      type="button"
      onClick={onTap}
      className={`btn-press flex min-h-[320px] w-full flex-col items-center justify-center rounded-[14px] border border-border transition-colors ${bgColors[state]}`}
      style={{ touchAction: "manipulation" }}
    >
      {state === "result" && reactionMs !== null ? (
        <>
          <span className="font-display text-[48px] text-teal neon-teal">
            {reactionMs}ms
          </span>
          <span className="mt-2 font-label text-[12px] tracking-label text-muted">
            reaction time
          </span>
        </>
      ) : (
        <span
          className={`font-label text-[14px] tracking-label ${
            state === "ready" ? "text-bg" : state === "too-early" ? "text-white" : "text-muted"
          }`}
        >
          {labels[state]}
        </span>
      )}
    </button>
  );
}
