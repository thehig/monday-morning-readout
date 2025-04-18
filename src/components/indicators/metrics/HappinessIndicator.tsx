import { HappinessIndicatorProps } from "../../../types/components";
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

function getHappinessDetails(value: number) {
  const emojiIndex = Math.min(
    Math.floor(((value - 1) / 4) * (HAPPINESS_EMOJIS.length - 1)),
    HAPPINESS_EMOJIS.length - 1
  );
  return {
    emoji: HAPPINESS_EMOJIS[emojiIndex],
  };
}

/**
 * Displays a happiness score with an appropriate emoji and color-coded value
 * @example
 * ```tsx
 * <HappinessIndicator value={4.5} type="team" />
 * <HappinessIndicator value={3.8} type="customer" />
 * ```
 */
export function HappinessIndicator({ value, type }: HappinessIndicatorProps) {
  const scoreText = `${value}/5`;
  const isGood = value >= 4;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-gray-600">
        {type === "team" ? "Team" : "Customer"}
      </div>
      <div className="text-2xl">{getHappinessDetails(value).emoji}</div>
      <div
        className={`text-lg font-bold ${
          isGood ? "text-green-500" : "text-red-500"
        }`}
      >
        {scoreText}
      </div>
    </div>
  );
}
