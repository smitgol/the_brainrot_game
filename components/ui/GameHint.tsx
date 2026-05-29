interface GameHintProps {
  children: React.ReactNode;
}

export function GameHint({ children }: GameHintProps) {
  return (
    <p className="text-center font-label text-[11px] tracking-label text-muted">
      {children}
    </p>
  );
}
