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
