import { playSound } from "./audio";
import { vibrate } from "./haptics";

export type FeedbackType = "correct" | "wrong" | "levelUp";

/** Single entry point for sound + haptics on game events. */
export function gameFeedback(type: FeedbackType) {
  playSound(type);
  vibrate(type);
}
