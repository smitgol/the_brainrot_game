type SoundType = "correct" | "wrong" | "levelUp";

let audioContext: AudioContext | null = null;

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioContext) {
    audioContext = new AudioContext();
  }
  return audioContext;
}

function playTone(
  frequency: number,
  durationMs: number,
  type: OscillatorType,
  endFrequency?: number
) {
  const ctx = getContext();
  if (!ctx) return;

  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();

  oscillator.type = type;
  oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
  if (endFrequency !== undefined) {
    oscillator.frequency.exponentialRampToValueAtTime(
      endFrequency,
      ctx.currentTime + durationMs / 1000
    );
  }

  gain.gain.setValueAtTime(0.08, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + durationMs / 1000);

  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
}

export function initAudio() {
  const ctx = getContext();
  if (ctx?.state === "suspended") {
    void ctx.resume();
  }
}

export function playSound(type: SoundType) {
  initAudio();

  switch (type) {
    case "correct":
      playTone(440, 80, "sine", 880);
      break;
    case "wrong":
      playTone(220, 150, "sawtooth", 110);
      break;
    case "levelUp": {
      const notes = [440, 554, 659, 880];
      notes.forEach((freq, i) => {
        setTimeout(() => playTone(freq, 60, "sine"), i * 60);
      });
      break;
    }
  }
}
