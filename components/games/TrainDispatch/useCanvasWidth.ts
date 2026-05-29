"use client";

import { useEffect, useRef, useState } from "react";

export function useCanvasWidth(maxWidth = 480) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(maxWidth);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setWidth(Math.min(maxWidth, Math.floor(entry.contentRect.width)));
      }
    });

    observer.observe(el);
    setWidth(Math.min(maxWidth, el.clientWidth || maxWidth));

    return () => observer.disconnect();
  }, [maxWidth]);

  return { ref, width };
}
