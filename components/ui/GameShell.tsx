"use client";

import { useRouter } from "next/navigation";
import { PageTransition } from "@/components/PageTransition";
import { GameHeader } from "@/components/ui/GameHeader";
import { Toast } from "@/components/ui/Toast";
import { LevelFlash } from "@/components/ui/LevelFlash";
import { useGameAudio, type GameToast } from "@/lib/hooks";

interface GameShellProps {
  score: number;
  lives?: number;
  level: number;
  streak?: number;
  showLives?: boolean;
  children: React.ReactNode;
  footer?: React.ReactNode;
  toast?: GameToast | null;
  onDismissToast?: () => void;
  levelFlash?: boolean;
}

export function GameShell({
  score,
  lives = 3,
  level,
  streak,
  showLives = true,
  children,
  footer,
  toast,
  onDismissToast,
  levelFlash = false,
}: GameShellProps) {
  const router = useRouter();
  useGameAudio();

  return (
    <PageTransition>
      <div className="flex min-h-screen flex-col">
        <GameHeader
          onBack={() => router.push("/")}
          score={score}
          lives={lives}
          level={level}
          streak={streak}
          showLives={showLives}
        />
        {children}
        {footer && <div className="px-4 pb-6">{footer}</div>}
        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onDismiss={onDismissToast}
          />
        )}
        <LevelFlash active={levelFlash} />
      </div>
    </PageTransition>
  );
}
