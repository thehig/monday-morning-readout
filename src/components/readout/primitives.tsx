import { CheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
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
  /** How the label reads on the surface behind it. */
  tone?: string;
}

/** A label-and-value row on a card. The label is quiet, the value is not. */
export function Labelled({ label, children, tone = "text-ink-3" }: LabelledProps) {
  return (
    <div className="flex h-6 min-w-0 items-center gap-2.5 text-[17px]">
      <span className={`w-[84px] shrink-0 ${tone}`}>{label}</span>
      {children}
    </div>
  );
}

/**
 * Progress as a rounded bar with the number beside it.
 *
 * The percentage sits outside the fill: printed inside, it is white on grey
 * below about 20% and invisible at zero.
 */
export function ProgressBar({
  value,
  width,
}: {
  value: number;
  /** A fixed track width, for places with no row to fill. */
  width?: string;
}) {
  const pct = Math.max(0, Math.min(100, value));

  return (
    <>
      <span
        className={`h-2.5 overflow-hidden rounded-full bg-ink/[0.10] ${
          width ?? "min-w-[120px] flex-1"
        }`}
      >
        {pct > 0 && (
          <span
            className="block h-full min-w-[6px] rounded-full bg-meter"
            style={{ width: `${pct}%` }}
          />
        )}
      </span>
      <span className="w-[46px] shrink-0 text-right text-[17px] font-bold tabular-nums">
        {pct}%
      </span>
    </>
  );
}

/** Sentiment as five dots plus the score. Replaces the emoji scale. */
export function Meter({ value, max = 5 }: { value: number; max?: number }) {
  const filled = Math.max(0, Math.min(max, Math.round(value)));

  return (
    <>
      <span className="flex gap-[5px]" role="img" aria-label={`${filled} out of ${max}`}>
        {Array.from({ length: max }, (_, i) => (
          <span
            key={i}
            className={`h-[13px] w-[13px] rounded-full ${
              i < filled ? "bg-meter" : "bg-ink/[0.12]"
            }`}
          />
        ))}
      </span>
      <span className="ml-auto shrink-0 text-[17px] font-bold tabular-nums">
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
      className={`h-3 w-3 shrink-0 rounded-full ${VELOCITY_DOT[velocity]}`}
      title={VELOCITY_LABELS[velocity]}
    />
  );
}

/**
 * Next week's velocity as a colour-coded badge: High, Medium or Low.
 *
 * The stored value is the form's German traffic light (Grün, Gelb, Rot) and is
 * never shown; the badge carries it in English and in colour. The three fills
 * differ in lightness as well as hue - pale green, mid amber, dark red - so
 * they stay apart on a compressed shared screen.
 */
const VELOCITY_BADGE: Record<VelocityType, { word: string; className: string }> = {
  "Grün": { word: "High", className: "bg-fine-block text-fine-on" },
  Gelb: { word: "Medium", className: "bg-watch-block1 text-watch-on" },
  Rot: { word: "Low", className: "bg-late-block2 text-white" },
};

export function VelocityBadge({ velocity }: { velocity: VelocityType | null }) {
  if (!velocity) {
    return <span className="text-[17px] text-ink-3">Not reported</span>;
  }

  const { word, className } = VELOCITY_BADGE[velocity];

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full py-0.5 pl-2.5 pr-3 text-[17px] font-bold ${className}`}
      title={VELOCITY_LABELS[velocity]}
    >
      <span className={`h-2.5 w-2.5 rounded-full ${VELOCITY_DOT[velocity]} ring-2 ring-white/70`} aria-hidden="true" />
      {word}
    </span>
  );
}

/** Traffic light for next week's velocity, with the English label beside it. */
export function VelocityLight({
  velocity,
  tone = "text-ink-3",
}: {
  velocity: VelocityType | null;
  tone?: string;
}) {
  if (!velocity) {
    return <span className={tone}>Not reported</span>;
  }

  const label = VELOCITY_LABELS[velocity];

  return (
    <span className="flex min-w-0 items-center gap-2.5">
      <VelocityDot velocity={velocity} />
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

/**
 * The owner's answer to "is it on track?".
 *
 * That question is about the owner's own estimated completion date, not the
 * agreed deadline - so an engagement past its deadline can quite properly be on
 * track for its estimate. "Not on track" is the owner doubting even the date
 * they set, and it is the one that gets the warning.
 */
export function OnTrack({ value }: { value: boolean | null }) {
  if (value === null) {
    return (
      <span className="text-[17px] text-ink-3">On track for its estimate: not reported</span>
    );
  }

  return value ? (
    <span className="flex items-center gap-2 text-[17px] font-[650] text-fine-ink">
      <CheckIcon className="h-[19px] w-[19px] shrink-0 stroke-[2.4]" aria-hidden="true" />
      On track for its estimate
    </span>
  ) : (
    <span className="flex items-center gap-2 text-[17px] font-bold text-late-ink">
      <ExclamationTriangleIcon className="h-[19px] w-[19px] shrink-0 stroke-2" aria-hidden="true" />
      Not on track for its estimate
    </span>
  );
}
