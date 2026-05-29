"use client";

interface TrainInstructionsProps {
  onStart: () => void;
}

const steps = [
  {
    icon: "🎯",
    title: "MATCH THE LETTER",
    body: "Every train shows a letter (A–D). Send it to the platform with the same letter.",
  },
  {
    icon: "🟡",
    title: "TAP THE SWITCHES",
    body: "Tap a glowing yellow switch to flip the track. That's how you steer each train.",
  },
  {
    icon: "💥",
    title: "DON'T CRASH",
    body: "Wrong platform or two trains touching = crash. You lose a life. You get 3.",
  },
  {
    icon: "🔥",
    title: "BUILD A STREAK",
    body: "3 correct deliveries in a row levels you up. Faster trains, more points.",
  },
];

export function TrainInstructions({ onStart }: TrainInstructionsProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-bg/85 px-4 backdrop-blur-sm">
      <div className="w-full rounded-[14px] border border-border bg-card p-5">
        <h2 className="font-display text-[32px] leading-none tracking-display text-accent neon-accent">
          HOW TO PLAY
        </h2>
        <p className="mt-1 font-label text-[10px] tracking-label text-muted">
          TRAIN DISPATCH
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
          className="btn-press mt-6 min-h-[48px] w-full rounded-[12px] bg-accent font-label text-[13px] tracking-label text-white transition-transform"
        >
          START DISPATCHING
        </button>
      </div>
    </div>
  );
}
