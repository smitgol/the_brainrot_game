"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { PageTransition } from "@/components/PageTransition";
import { useLocalStorageStats, useReducedMotion } from "@/lib/hooks";

const modes = [
  {
    href: "/game/train",
    index: "01",
    title: "TRAIN DISPATCH",
    description: "Route trains to their platforms. One wrong switch and they crash.",
    bar: "bg-accent",
    text: "text-accent",
    hover: "hover:border-accent/60 active:border-accent",
  },
  {
    href: "/game/memory",
    index: "02",
    title: "MEMORY SEQUENCE",
    description: "Squares light up in order. Tap them back before the timer dies.",
    bar: "bg-purple",
    text: "text-purple",
    hover: "hover:border-purple/60 active:border-purple",
  },
  {
    href: "/game/reaction",
    index: "03",
    title: "REACTION RUSH",
    description: "Wait. Watch. Tap the instant it flips. Jump early and you bleed points.",
    bar: "bg-yellow",
    text: "text-yellow",
    hover: "hover:border-yellow/60 active:border-yellow",
  },
  {
    href: "/game/echo",
    index: "04",
    title: "ECHO RECALL",
    description: "Symbols stream by. Tap when one repeats from N steps back. Pure memory.",
    bar: "bg-teal",
    text: "text-teal",
    hover: "hover:border-teal/60 active:border-teal",
  },
];

const marquee = "ATTENTION SPAN: SHRINKING — FIGHT BACK — TOUCH GRASS — ";

export default function HomePage() {
  const stats = useLocalStorageStats();
  const reduced = useReducedMotion();

  return (
    <PageTransition>
      <main className="flex min-h-screen flex-col">
        <header className="flex items-center justify-between border-b border-border px-4 py-3">
          <span className="font-label text-[11px] tracking-label text-white">
            BRAIN ROT GAME
          </span>
          <span className="flex items-center gap-2 font-mono text-[10px] text-muted">
            <span className="blink inline-block h-2 w-2 rounded-full bg-danger" />
            LIVE / v1.0
          </span>
        </header>

        <div className="overflow-hidden border-b border-border py-2">
          <div
            className={`flex whitespace-nowrap font-label text-[11px] tracking-label text-muted ${
              reduced ? "" : "marquee-track"
            }`}
          >
            <span>{marquee.repeat(4)}</span>
            <span aria-hidden>{marquee.repeat(4)}</span>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-8 pt-6">
          <h1 className="font-display leading-[0.82] tracking-display">
            <span className="block font-label text-[12px] tracking-label text-muted">
              THE
            </span>
            <span className="block text-[72px] text-white">BRAIN</span>
            <span className="block text-[72px] text-accent neon-accent">ROT</span>
            <span className="block text-stroke text-[72px]">GAME</span>
          </h1>

          <p className="mt-5 border-l-2 border-accent pl-4 font-mono text-[13px] leading-relaxed text-white/80">
            Four games. One goal: drag your fried, doom-scrolled attention span
            back from the dead.
          </p>

          <div className="mt-7 flex items-stretch justify-between border-y border-border py-4">
            <HomeStat label="BEST" value={stats.bestScore} />
            <span className="w-px bg-border" />
            <HomeStat label="GAMES" value={stats.gamesPlayed} />
            <span className="w-px bg-border" />
            <HomeStat label="STREAK" value={stats.winStreak} />
          </div>

          <nav className="mt-7 flex flex-col gap-3">
            {modes.map((mode) => (
              <ModeRow key={mode.href} mode={mode} reduced={reduced} />
            ))}
          </nav>

          <div className="mt-auto flex items-center justify-between pt-10">
            <p className="font-mono text-[11px] text-muted">
              built to fight brain rot
            </p>
            <Link
              href="/leaderboard"
              className="btn-press font-label text-[11px] tracking-label text-teal"
            >
              LEADERBOARD →
            </Link>
          </div>
        </div>
      </main>
    </PageTransition>
  );
}

function HomeStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-1 flex-col items-center">
      <span className="font-display text-[34px] leading-none text-teal neon-teal">
        {value}
      </span>
      <span className="mt-1 font-label text-[10px] tracking-label text-muted">
        {label}
      </span>
    </div>
  );
}

function ModeRow({
  mode,
  reduced,
}: {
  mode: (typeof modes)[0];
  reduced: boolean;
}) {
  const Row = reduced ? "div" : motion.div;

  return (
    <Link href={mode.href} className="block">
      <Row
        {...(!reduced ? { whileTap: { scale: 0.97 } } : {})}
        className={`flex items-stretch overflow-hidden rounded-[12px] border border-border bg-card transition-colors ${mode.hover}`}
      >
        <span className={`w-1.5 shrink-0 ${mode.bar}`} aria-hidden />
        <div className="flex-1 p-4">
          <div className="flex items-baseline justify-between">
            <span
              className={`font-display text-[40px] leading-none ${mode.text}`}
            >
              {mode.index}
            </span>
            <span className="font-display text-[22px] text-muted">↗</span>
          </div>
          <h2 className="mt-2 font-label text-[13px] tracking-label text-white">
            {mode.title}
          </h2>
          <p className="mt-1 font-mono text-[11px] leading-snug text-muted">
            {mode.description}
          </p>
        </div>
      </Row>
    </Link>
  );
}
