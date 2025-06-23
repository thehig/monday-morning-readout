import { HAPPINESS_EMOJIS } from "./happiness.constants";

export function getHappinessDetails(value: number) {
  const emojiIndex = Math.min(
    Math.floor(((value - 1) / 4) * (HAPPINESS_EMOJIS.length - 1)),
    HAPPINESS_EMOJIS.length - 1
  );
  return {
    emoji: HAPPINESS_EMOJIS[emojiIndex],
  };
}

export function getHappinessColor(value: number): string {
  if (value === 1) {
    return "text-red-500";
  } else if (value >= 2 && value <= 4) {
    return "text-yellow-500";
  } else if (value === 5) {
    return "text-green-500";
  }
  // Default fallback for edge cases
  return "text-gray-500";
}
