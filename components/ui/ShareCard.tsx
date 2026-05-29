"use client";

import { getShareText, getShareUrl } from "@/lib/gameLogic";
import type { GameMode } from "@/lib/types";
import { initAudio } from "@/lib/audio";

interface ShareCardProps {
  score: number;
  mode: GameMode;
  name: string;
}

export function ShareCard({ score, mode, name }: ShareCardProps) {
  const handleShare = async () => {
    initAudio();
    const url = getShareUrl(score, mode, name);
    const text = getShareText(score, mode, name);

    if (navigator.share) {
      try {
        await navigator.share({ title: "The Brain Rot Game", text, url });
        return;
      } catch {
        // fall through to clipboard
      }
    }

    await navigator.clipboard.writeText(`${text}\n${url}`);
  };

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className="btn-press min-h-[44px] w-full rounded-[12px] bg-teal px-4 py-3 font-label text-[12px] tracking-label text-bg transition-transform"
    >
      Share Score
    </button>
  );
}
