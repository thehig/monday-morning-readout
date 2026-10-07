import type { VelocityType } from "../../types/indicators";
import { VELOCITY_LABELS } from "../../lib/velocity";
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

/**
 * A label-and-value row. The label is quiet, the value is not.
 *
 * The column is as narrow as the longest label allows - "Next week" - because
 * the widest value, "Medium velocity expected", clears a tile by only a few
 * pixels. Widen this and that value starts being cut instead.
 */
export function Labelled({
  label,
  children,
  labelWidth = "w-[84px]",
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
      {/*
        A floor as well as a share. The track fills the row it is given, but in
        a container that is only as wide as its contents - the Stop's header -
        a bare flex-1 has nothing to take a share of and the bar disappears,
        leaving the percentage sitting on its own.
      */}
      <span className="h-[13px] min-w-[132px] flex-1 overflow-hidden rounded-full bg-meter-track">
        {pct > 0 && (
          <span
            className="block h-full min-w-[7px] rounded-full bg-meter"
            style={{ width: `${pct}%` }}
          />
        )}
      </span>
      <span className="w-[52px] shrink-0 text-right text-[17px] font-bold tabular-nums">
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
      <span className="w-[52px] shrink-0 text-right text-[17px] font-bold tabular-nums">
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

  const label = VELOCITY_LABELS[velocity];

  return (
    <span className="flex min-w-0 items-center gap-2">
      <span
        className={`h-[15px] w-[15px] shrink-0 rounded-full ${VELOCITY_DOT[velocity]}`}
      />
      {/*
        One line, cut if it has to be. The dot carries the same reading, so a
        clipped tail costs nothing, where a second line would push the rows
        below it out of step with the neighbouring tiles.
      */}
      <span className="truncate font-semibold" title={label}>
        {label}
      </span>
    </span>
  );
}
