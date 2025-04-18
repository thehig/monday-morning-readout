import { HappinessType } from "../../../types/indicators";

export const HAPPINESS_EMOJIS = ["😢", "😕", "😐", "🙂", "😊"] as const;

export const HAPPINESS_COLORS: Record<HappinessType, string> = {
  team: "text-red-500",
  customer: "text-green-500",
} as const;

export const HAPPINESS_LABELS: Record<HappinessType, string> = {
  team: "Team Happiness",
  customer: "Customer Happiness",
} as const;

export function getHappinessDetails(value: number) {
  const emojiIndex = Math.min(
    Math.floor(((value - 1) / 4) * (HAPPINESS_EMOJIS.length - 1)),
    HAPPINESS_EMOJIS.length - 1
  );
  return {
    emoji: HAPPINESS_EMOJIS[emojiIndex],
  };
}
