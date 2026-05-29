"use client";

interface MemoryGridProps {
  size: number;
  litIndex: number | null;
  feedback: { index: number; type: "correct" | "wrong" } | null;
  onTap: (index: number) => void;
  disabled: boolean;
}

export function MemoryGrid({
  size,
  litIndex,
  feedback,
  onTap,
  disabled,
}: MemoryGridProps) {
  const cells = size * size;

  return (
    <div
      className="mx-auto grid w-full max-w-[340px] gap-2.5"
      style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))` }}
    >
      {Array.from({ length: cells }).map((_, i) => {
        const lit = litIndex === i;
        const fb = feedback?.index === i ? feedback.type : null;

        let cls = "bg-card border-border";
        if (lit) cls = "bg-purple border-purple scale-[1.03]";
        else if (fb === "correct") cls = "bg-success border-success scale-[1.03]";
        else if (fb === "wrong") cls = "bg-danger border-danger scale-[1.03]";

        return (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => onTap(i)}
            aria-label={`Cell ${i + 1}`}
            className={`btn-press aspect-square rounded-[12px] border transition-all duration-150 disabled:cursor-default ${cls}`}
          />
        );
      })}
    </div>
  );
}
