import { formatDate } from "./date-utils";

/**
 * Geometry for the small calendar on the Stop screen.
 *
 * Positions are percentages across one axis that always contains every date
 * worth seeing - the committed deadline, the estimate, and today - so the gap
 * between committed and estimated has a length rather than being a number to
 * work out. FIDUS runs from May to October, Suissebank is a single point: the
 * same scale has to carry both.
 */

const DAY = 24 * 60 * 60 * 1000;
const MAX_TICKS = 7;
/** Month ticks nearer than this to today collide with its label. */
const TICK_CLEARANCE_PCT = 5;

export interface TimelineTick {
  label: string;
  pct: number;
}

export interface TimelineGeometry {
  rangeStart: Date;
  rangeEnd: Date;
  months: TimelineTick[];
  deadlinePct: number | null;
  estimatePct: number | null;
  todayPct: number;
  /** The slip, drawn from the committed date to the estimate. */
  slipBar: { leftPct: number; widthPct: number } | null;
  /** True when deadline and estimate coincide, so one mark says both. */
  singlePoint: boolean;
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

/**
 * @param deadline committed date, or null
 * @param estimate estimated completion, or null
 * @param today    the day the readout is being given
 */
export function buildTimeline(
  deadline: Date | null,
  estimate: Date | null,
  today: Date
): TimelineGeometry | null {
  const points = [deadline, estimate, today].filter(
    (d): d is Date => d instanceof Date && !Number.isNaN(d.getTime())
  );
  if (!deadline && !estimate) return null;

  const times = points.map((d) => d.getTime());
  const min = Math.min(...times);
  const max = Math.max(...times);

  // A single-day span still needs an axis to sit on.
  const span = Math.max(max - min, 14 * DAY);
  const pad = Math.max(span * 0.12, 5 * DAY);

  const rangeStart = new Date(min - pad);
  const rangeEnd = new Date(max + pad);
  const total = rangeEnd.getTime() - rangeStart.getTime();

  const pct = (date: Date) =>
    clampPct(((date.getTime() - rangeStart.getTime()) / total) * 100);

  // One tick per month start inside the range, thinned out when the span is
  // long enough that every month would crowd.
  const months: TimelineTick[] = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  if (cursor.getTime() < rangeStart.getTime()) cursor.setMonth(cursor.getMonth() + 1);
  while (cursor.getTime() <= rangeEnd.getTime()) {
    months.push({ label: formatDate(cursor, "monthOnly"), pct: pct(cursor) });
    cursor.setMonth(cursor.getMonth() + 1);
  }
  // Thin to at most MAX_TICKS however long the span is; halving once leaves a
  // multi-year axis still crowded.
  const step = Math.ceil(months.length / MAX_TICKS);
  const thinned = step > 1 ? months.filter((_, i) => i % step === 0) : months;

  const todayPct = pct(today);
  const spaced = thinned.filter(
    (tick) => Math.abs(tick.pct - todayPct) >= TICK_CLEARANCE_PCT
  );

  const deadlinePct = deadline ? pct(deadline) : null;
  const estimatePct = estimate ? pct(estimate) : null;
  const singlePoint =
    deadlinePct !== null && estimatePct !== null && deadlinePct === estimatePct;

  const slipBar =
    deadlinePct !== null && estimatePct !== null && estimatePct > deadlinePct
      ? { leftPct: deadlinePct, widthPct: estimatePct - deadlinePct }
      : null;

  return {
    rangeStart,
    rangeEnd,
    months: spaced,
    deadlinePct,
    estimatePct,
    todayPct,
    slipBar,
    singlePoint,
  };
}
