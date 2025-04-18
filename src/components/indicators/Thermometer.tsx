import { motion } from "framer-motion";

interface ThermometerProps {
  /** Progress value from 0-100 */
  value: number;
}

/**
 * Displays a progress bar with an animated fill and percentage label
 * @example
 * ```tsx
 * <Thermometer value={75} />
 * ```
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
