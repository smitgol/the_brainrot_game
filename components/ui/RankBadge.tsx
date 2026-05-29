interface RankBadgeProps {
  rank: number;
  className?: string;
}

export function RankBadge({ rank, className = "" }: RankBadgeProps) {
  return (
    <p
      className={`text-center font-label text-[12px] tracking-label text-yellow ${className}`}
    >
      You are ranked #{rank} globally
    </p>
  );
}
