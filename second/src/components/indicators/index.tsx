import { motion } from "framer-motion";

export type VelocityType = "Rot" | "Gelb" | "Grün";
export type HappinessType = "team" | "customer";

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

export const HAPPINESS_EMOJIS = ["😢", "😕", "😐", "🙂", "😊"] as const;

export const HAPPINESS_COLORS: Record<HappinessType, string> = {
  team: "text-red-500",
  customer: "text-green-500",
} as const;

export const HAPPINESS_LABELS: Record<HappinessType, string> = {
  team: "Team Happiness",
  customer: "Customer Happiness",
} as const;

interface ThermometerProps {
  /** Progress value from 0-100 */
  value: number;
}

/**
 * Displays a progress bar with an animated fill and percentage label
 */
export function Thermometer({ value }: ThermometerProps) {
  return (
    <div
      className="relative h-6 w-full bg-gray-200 rounded-full overflow-hidden"
      title={`Progress: ${value}% complete`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-0 h-full bg-blue-500 rounded-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white drop-shadow">
          {value}%
        </span>
      </div>
    </div>
  );
}

interface HappinessIndicatorProps {
  /** Happiness value from 1-5 */
  value: number;
  /** Type of happiness being measured */
  type: HappinessType;
}

/**
 * Displays a happiness score with an appropriate emoji and color-coded value
 */
export function HappinessIndicator({ value, type }: HappinessIndicatorProps) {
  const emojiIndex = Math.min(
    Math.floor(((value - 1) / 4) * (HAPPINESS_EMOJIS.length - 1)),
    HAPPINESS_EMOJIS.length - 1
  );
  const emoji = HAPPINESS_EMOJIS[emojiIndex];
  const color = HAPPINESS_COLORS[type];
  const label = HAPPINESS_LABELS[type];

  return (
    <div className="flex flex-col items-center" title={`${label}: ${value}/5`}>
      <span className="text-3xl mb-1">{emoji}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}/5</span>
    </div>
  );
}

interface VelocityIndicatorProps {
  /** Expected velocity for next week */
  velocity: VelocityType;
}

/**
 * Displays a traffic light style indicator for velocity prediction
 */
export function VelocityIndicator({ velocity }: VelocityIndicatorProps) {
  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full ${VELOCITY_COLORS[velocity]} animate-pulse`}
        title={VELOCITY_LABELS[velocity]}
      />
      <span className="text-sm text-gray-600">{VELOCITY_LABELS[velocity]}</span>
    </div>
  );
}
