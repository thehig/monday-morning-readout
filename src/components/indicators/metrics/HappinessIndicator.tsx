import { HappinessIndicatorProps } from "../../../types/components";
import {
  getHappinessDetails,
  HAPPINESS_COLORS,
  HAPPINESS_LABELS,
} from "./happiness.constants";

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

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-sm text-gray-600">{HAPPINESS_LABELS[type]}</div>
      <div className="text-2xl">{getHappinessDetails(value).emoji}</div>
      <div className={`text-lg font-bold ${HAPPINESS_COLORS[type]}`}>
        {scoreText}
      </div>
    </div>
  );
}
