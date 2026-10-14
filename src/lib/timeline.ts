import { formatDate } from "./date-utils";

/**
 * Geometry for the small calendar on the Stop screen.
 *
 * Positions are percentages across one axis that always contains every date
 * worth seeing - the committed release, the estimate, and today - so the gap
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
  releasePct: number | null;
  estimatePct: number | null;
  todayPct: number;
  /** The slip, drawn from the committed date to the estimate. */
  slipBar: { leftPct: number; widthPct: number } | null;
  /** True when release and estimate coincide, so one mark says both. */
  singlePoint: boolean;
}

function clampPct(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

/**
 * One tick per month start inside the range, thinned to at most `maxTicks`.
 * Halving once leaves a multi-year axis still crowded, so the step scales.
 */
export function monthTicks(
  rangeStart: Date,
  rangeEnd: Date,
  pct: (date: Date) => number,
  maxTicks = MAX_TICKS
): TimelineTick[] {
  const months: TimelineTick[] = [];
  const cursor = new Date(rangeStart.getFullYear(), rangeStart.getMonth(), 1);
  if (cursor.getTime() < rangeStart.getTime()) {
    cursor.setMonth(cursor.getMonth() + 1);
  }
  while (cursor.getTime() <= rangeEnd.getTime()) {
    months.push({ label: formatDate(cursor, "monthOnly"), pct: pct(cursor) });
    cursor.setMonth(cursor.getMonth() + 1);
  }

  const step = Math.ceil(months.length / maxTicks);
  return step > 1 ? months.filter((_, i) => i % step === 0) : months;
}

/**
 * @param release committed date, or null
 * @param estimate estimated completion, or null
 * @param today    the day the readout is being given
 */
export function buildTimeline(
  release: Date | null,
  estimate: Date | null,
  today: Date
): TimelineGeometry | null {
  const points = [release, estimate, today].filter(
    (d): d is Date => d instanceof Date && !Number.isNaN(d.getTime())
  );
  if (!release && !estimate) return null;

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

  const thinned = monthTicks(rangeStart, rangeEnd, pct);

  const todayPct = pct(today);
  const spaced = thinned.filter(
    (tick) => Math.abs(tick.pct - todayPct) >= TICK_CLEARANCE_PCT
  );

  const releasePct = release ? pct(release) : null;
  const estimatePct = estimate ? pct(estimate) : null;
  const singlePoint =
    releasePct !== null && estimatePct !== null && releasePct === estimatePct;

  const slipBar =
    releasePct !== null && estimatePct !== null && estimatePct > releasePct
      ? { leftPct: releasePct, widthPct: estimatePct - releasePct }
      : null;

  return {
    rangeStart,
    rangeEnd,
    months: spaced,
    releasePct,
    estimatePct,
    todayPct,
    slipBar,
    singlePoint,
  };
}
