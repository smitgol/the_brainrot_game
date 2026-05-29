"use client";

interface EchoInstructionsProps {
  onStart: () => void;
}

const steps = [
  {
    icon: "🌀",
    title: "WATCH THE STREAM",
    body: "Symbols flash by one at a time. Keep the recent ones in your head.",
  },
  {
    icon: "🔁",
    title: "TAP ON A REPEAT",
    body: "Hit MATCH when the current symbol is the SAME as the one N steps back. Starts at 2-back.",
  },
  {
    icon: "🪤",
    title: "BEWARE THE LURES",
    body: "Near-misses repeat one step off (N-1, N+1) to bait you. Tapping those costs a life.",
  },
  {
    icon: "🧠",
    title: "N CLIMBS EACH LEVEL",
    body: "Survive a round and N grows: 2-back → 3-back → 4-back. The stream speeds up too.",
  },
  {
    icon: "💔",
    title: "MISS OR MISFIRE = LIFE",
    body: "Skip a real match or tap a fake one and you lose a life. You get 3.",
  },
];

export function EchoInstructions({ onStart }: EchoInstructionsProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/85 px-4 backdrop-blur-sm">
      <div className="w-full rounded-[14px] border border-border bg-card p-5">
        <h2 className="font-display text-[32px] leading-none tracking-display text-teal neon-teal">
          HOW TO PLAY
        </h2>
        <p className="mt-1 font-label text-[10px] tracking-label text-muted">
          ECHO RECALL · N-BACK
        </p>

        <ul className="mt-5 flex flex-col gap-4">
          {steps.map((step) => (
            <li key={step.title} className="flex gap-3">
              <span className="text-xl leading-none">{step.icon}</span>
              <div>
                <p className="font-label text-[12px] tracking-label text-white">
                  {step.title}
                </p>
                <p className="mt-1 font-mono text-[11px] leading-snug text-muted">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ul>

        <button
          type="button"
          onClick={onStart}
          className="btn-press mt-6 min-h-[48px] w-full rounded-[12px] bg-teal font-label text-[13px] tracking-label text-bg transition-transform"
        >
          START RECALL
        </button>
      </div>
    </div>
  );
}
