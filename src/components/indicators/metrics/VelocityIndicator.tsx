import { VelocityIndicatorProps } from "../../../types/components";
import { VelocityType } from "../../../types/indicators";

export const VELOCITY_COLORS: Record<VelocityType, string> = {
  Rot: "bg-red-500",
  Gelb: "bg-yellow-400",
  Grün: "bg-green-500",
} as const;

export const VELOCITY_LABELS: Record<VelocityType, string> = {
  Rot: "Low velocity expected",
  Gelb: "Medium velocity expected",
  Grün: "High velocity expected",
} as const;

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
