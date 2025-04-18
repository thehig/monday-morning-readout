import { VelocityIndicatorProps } from "../../../types/components";
import { VELOCITY_COLORS, VELOCITY_LABELS } from "./velocity.constants";

/**
 * Displays a traffic light style indicator for velocity prediction
 * @example
 * ```tsx
 * <VelocityIndicator velocity="Grün" showLabel={true} />
 * <VelocityIndicator velocity="Rot" />
 * ```
 */
export function VelocityIndicator({
  velocity,
  showLabel = false,
}: VelocityIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-3 h-3 rounded-full ${VELOCITY_COLORS[velocity]} animate-pulse`}
        title={VELOCITY_LABELS[velocity]}
      />
      {showLabel && (
        <span className="text-sm text-gray-600">
          {VELOCITY_LABELS[velocity]}
        </span>
      )}
    </div>
  );
}
