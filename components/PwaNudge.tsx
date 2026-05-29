"use client";

import { useEffect, useState } from "react";
import { setPwaDismissed, shouldShowPwaNudge } from "@/lib/scores";

export function PwaNudge() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(shouldShowPwaNudge());
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[10000] w-[calc(100%-2rem)] max-w-app -translate-x-1/2 rounded-[12px] border border-border bg-card p-4">
      <p className="font-label text-[11px] tracking-label text-white">
        Add The Brain Rot Game to your home screen for quick access.
      </p>
      <div className="mt-3 flex gap-2">
        <button
          type="button"
          className="btn-press flex-1 rounded-[10px] bg-accent px-3 py-2 font-label text-[11px] tracking-label"
          onClick={() => setVisible(false)}
        >
          Got it
        </button>
        <button
          type="button"
          className="btn-press flex-1 rounded-[10px] bg-surface px-3 py-2 font-label text-[11px] tracking-label text-muted"
          onClick={() => {
            setPwaDismissed();
            setVisible(false);
          }}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
