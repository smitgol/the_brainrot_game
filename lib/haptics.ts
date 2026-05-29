type HapticType = "correct" | "wrong" | "levelUp";

export function vibrate(type: HapticType) {
  if (typeof navigator === "undefined" || !navigator.vibrate) return;

  switch (type) {
    case "correct":
      navigator.vibrate(40);
      break;
    case "wrong":
      navigator.vibrate([80, 30, 80]);
      break;
    case "levelUp":
      navigator.vibrate([40, 20, 40, 20, 100]);
      break;
  }
}
