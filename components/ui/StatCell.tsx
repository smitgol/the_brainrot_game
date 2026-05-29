type StatCellVariant = "hero" | "inline" | "card";

interface StatCellProps {
  label: string;
  value: string | number;
  variant?: StatCellVariant;
}

const valueStyles: Record<StatCellVariant, string> = {
  hero: "font-display text-[28px] leading-none text-teal neon-teal",
  inline: "font-display text-[22px] text-teal",
  card: "font-display text-[24px] text-white",
};

const wrapperStyles: Record<StatCellVariant, string> = {
  hero: "text-center",
  inline: "text-center",
  card: "rounded-[10px] border border-border bg-card p-3 text-center",
};

export function StatCell({
  label,
  value,
  variant = "hero",
}: StatCellProps) {
  return (
    <div className={wrapperStyles[variant]}>
      <p className={valueStyles[variant]}>{value}</p>
      <p className="mt-1 font-label text-[10px] tracking-label text-muted">
        {label}
      </p>
    </div>
  );
}

interface StatGridProps {
  children: React.ReactNode;
  columns?: 2 | 3;
  className?: string;
}

export function StatGrid({
  children,
  columns = 3,
  className = "",
}: StatGridProps) {
  const cols = columns === 2 ? "grid-cols-2" : "grid-cols-3";
  return (
    <div
      className={`grid ${cols} gap-3 rounded-[12px] border border-border bg-card p-3 ${className}`}
    >
      {children}
    </div>
  );
}
