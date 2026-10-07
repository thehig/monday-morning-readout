import type { VelocityType } from "../../types/indicators";
import { VELOCITY_LABELS } from "../indicators/metrics/velocity.constants";
import { VELOCITY_DOT } from "./state-styles";

/**
 * The marks every readout screen is built from.
 *
 * Two rules drive these. Values are encoded by length and position rather than
 * by facial expression, because a bar's length survives video compression and a
 * mouth's curvature does not. And no value appears without its own label, so a
 * figure never has to be decoded against a legend elsewhere on screen.
 */

interface LabelledProps {
  label: string;
  children: React.ReactNode;
  /** Fixed label column, so the marks line up down a card. */
  labelWidth?: string;
}

/** A label-and-value row. The label is quiet, the value is not. */
export function Labelled({
  label,
  children,
  labelWidth = "w-[92px]",
}: LabelledProps) {
  return (
    <div className="flex items-center gap-2 text-[17px]">
      <span className={`${labelWidth} shrink-0 text-ink-3`}>{label}</span>
      {children}
    </div>
  );
}

/**
 * Progress as a bar with the number beside it.
 *
 * The percentage sits outside the fill: printed inside, it is white on grey
 * below about 20% and invisible at zero.
 */
export function ProgressBar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <>
      <span className="h-[13px] flex-1 overflow-hidden rounded-full bg-meter-track">
        {pct > 0 && (
          <span
            className="block h-full min-w-[7px] rounded-full bg-meter"
            style={{ width: `${pct}%` }}
          />
        )}
      </span>
      <span className="w-[52px] shrink-0 text-right font-bold tabular-nums">
        {pct}%
      </span>
    </>
  );
}

/** Sentiment as five segments plus the score. Replaces the emoji scale. */
export function Meter({ value, max = 5 }: { value: number; max?: number }) {
  const filled = Math.max(0, Math.min(max, Math.round(value)));

  return (
    <>
      <span className="flex gap-[3px]" role="img" aria-label={`${filled} out of ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`h-[13px] w-[17px] rounded-sm ${
              i < filled ? "bg-meter" : "bg-meter-track"
            }`}
          />
        ))}
      </span>
      <span className="w-[52px] shrink-0 text-right font-bold tabular-nums">
        {filled}/{max}
      </span>
    </>
  );
}

/** The traffic light alone, for when the label is already in the sentence. */
export function VelocityDot({ velocity }: { velocity: VelocityType | null }) {
  if (!velocity) return null;

  return (
    <span
      className={`h-[15px] w-[15px] shrink-0 rounded-full ${VELOCITY_DOT[velocity]}`}
      title={VELOCITY_LABELS[velocity]}
    />
  );
}

/** Traffic light for next week's velocity, with the English label beside it. */
export function VelocityLight({ velocity }: { velocity: VelocityType | null }) {
  if (!velocity) {
    return <span className="text-ink-3">Not reported</span>;
  }

  return (
    <span className="flex items-center gap-2">
      <span
        className={`h-[15px] w-[15px] shrink-0 rounded-full ${VELOCITY_DOT[velocity]}`}
      />
      <span className="font-semibold">{VELOCITY_LABELS[velocity]}</span>
    </span>
  );
}
