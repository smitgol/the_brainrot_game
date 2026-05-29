"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect } from "react";
import { useReducedMotion } from "@/lib/hooks";

interface ToastProps {
  message: string;
  type: "success" | "danger" | "warn";
  onDismiss?: () => void;
}

const styles = {
  success: "bg-success text-bg",
  danger: "bg-danger text-white",
  warn: "bg-yellow text-bg",
};

export function Toast({ message, type, onDismiss }: ToastProps) {
  const reduced = useReducedMotion();

  useEffect(() => {
    const timer = setTimeout(() => onDismiss?.(), 1400);
    return () => clearTimeout(timer);
  }, [message, onDismiss]);

  if (reduced) {
    return (
      <div
        className={`fixed left-1/2 top-4 z-[10000] -translate-x-1/2 rounded-[10px] px-4 py-2 font-label text-[11px] tracking-label ${styles[type]}`}
      >
        {message}
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className={`fixed left-1/2 top-4 z-[10000] -translate-x-1/2 rounded-[10px] px-4 py-2 font-label text-[11px] tracking-label ${styles[type]}`}
      >
        {message}
      </motion.div>
    </AnimatePresence>
  );
}
