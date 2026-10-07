import { monthTicks, type TimelineTick } from "./timeline";
import type { Engagement } from "./engagements";

/**
 * Geometry for the Wall's two chart layouts.
 *
 * The Ladder puts every engagement on one shared calendar, so slip is
 * comparable down a column rather than computed per card. The Field places them
 * by deadline against progress, so the week reads as a shape before any name is
 * read. Both are pure functions of the week's engagements.
 */

const DAY = 24 * 60 * 60 * 1000;

/* ------------------------------------------------------------------ ladder */

export interface LadderRow {
  engagement: Engagement;
  deadlinePct: number | null;
  estimatePct: number | null;
  /** The overrun, drawn from the committed date to the estimate. */
  slipBar: { leftPct: number; widthPct: number } | null;
  /** Deadline and estimate coincide, so one mark says both. */
  singlePoint: boolean;
}

export interface LadderGeometry {
  rangeStart: Date;
  rangeEnd: Date;
  months: TimelineTick[];
  todayPct: number;
  rows: LadderRow[];
}

/**
 * One shared axis spanning every date in the week, so two rows' bars can be
 * compared directly. Outliers stretch the scale rather than being hidden: an
 * engagement five months past its deadline is the thing most worth seeing.
 */
export function buildLadder(
  engagements: Engagement[],
  today: Date
): LadderGeometry | null {
  const dates = engagements.flatMap((e) =>
    [e.deadline, e.estimate].filter((d): d is Date => d instanceof Date)
  );
  if (!dates.length) return null;

  const times = [...dates.map((d) => d.getTime()), today.getTime()];
  const min = Math.min(...times);
  const max = Math.max(...times);
  const span = Math.max(max - min, 21 * DAY);
  const pad = Math.max(span * 0.04, 3 * DAY);

  const rangeStart = new Date(min - pad);
  const rangeEnd = new Date(max + pad);
  const total = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (date: Date) =>
    Math.round(((date.getTime() - rangeStart.getTime()) / total) * 10000) / 100;

  const rows: LadderRow[] = engagements.map((engagement) => {
    const deadlinePct = engagement.deadline ? pct(engagement.deadline) : null;
    const estimatePct = engagement.estimate ? pct(engagement.estimate) : null;

    return {
      engagement,
      deadlinePct,
      estimatePct,
      slipBar:
        deadlinePct !== null && estimatePct !== null && estimatePct > deadlinePct
          ? { leftPct: deadlinePct, widthPct: estimatePct - deadlinePct }
          : null,
      singlePoint:
        deadlinePct !== null &&
        estimatePct !== null &&
        deadlinePct === estimatePct,
    };
  });

  return {
    rangeStart,
    rangeEnd,
    months: monthTicks(rangeStart, rangeEnd, pct),
    todayPct: pct(today),
    rows,
  };
}

/* ------------------------------------------------------------------- field */

/** Deadlines further past than this pin to the left edge and are marked. */
export const FIELD_FLOOR_DAYS = -45;
/** Vertical step when two labels would land on each other. */
/**
 * How far apart stacked labels sit.
 *
 * A label is a name over a line of detail, which renders 49px tall, so this
 * has to clear that or consecutive labels in a stack overlap by the
 * difference. Measured, not guessed: at 44 the Suissebank and UBS labels on
 * week 39 ran into each other.
 */
const LABEL_STACK_PX = 56;

/**
 * Below this, a label centred on its point would hang off the bottom of the
 * plot and land in the date axis. Those go above the point instead - the same
 * placement a crowded point already gets.
 */
const LOW_POINT_PCT = 8;

export type LabelSide = "left" | "right" | "above";

export interface FieldPoint {
  engagement: Engagement;
  /** Across: days until the committed deadline. */
  xPct: number;
  /** Up: cycle progress. */
  yPct: number;
  /** The deadline is further past than the axis shows. */
  clamped: boolean;
  labelSide: LabelSide;
  /** Pixels to lift a stacked label by, when points sit on top of each other. */
  labelOffset: number;
}

export interface FieldGeometry {
  points: FieldPoint[];
  todayXPct: number;
  xTicks: TimelineTick[];
  /** Deadline gone and little done: the corner worth looking at. */
  danger: { widthPct: number; heightPct: number };
}

function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

/**
 * Places each engagement by how long until its deadline, against how much is
 * done. Everything left of the today line has a deadline that has passed.
 *
 * Labels are placed deterministically rather than by collision search: points
 * near an edge turn inward, and a point crowded by the one before it goes
 * above. That is weaker than true collision avoidance and is the known cost of
 * this layout.
 */
export function buildField(
  engagements: Engagement[],
  today: Date
): FieldGeometry | null {
  const dated = engagements.filter((e) => e.deadline);
  if (!dated.length) return null;

  const offsets = dated.map((e) => daysBetween(today, e.deadline as Date));
  const maxDays = Math.max(...offsets, 14);
  const minDays = FIELD_FLOOR_DAYS;
  const span = maxDays - minDays;

  const xOf = (days: number) =>
    Math.round(((Math.max(days, minDays) - minDays) / span) * 10000) / 100;

  const ordered = dated
    .map((engagement, i) => ({
      engagement,
      days: offsets[i],
      xPct: xOf(offsets[i]),
      yPct: Math.max(0, Math.min(100, engagement.progress)),
      clamped: offsets[i] < minDays,
    }))
    .sort((a, b) => a.xPct - b.xPct || a.yPct - b.yPct);

  // Points sitting on top of each other cannot be separated by choosing a
  // side - UBS and Suissebank are one day and zero percent apart - so a label
  // that would clash is lifted clear of the ones already placed.
  //
  // Each point is checked against every point already placed, not just the one
  // before it in the sort: ordering by x puts FLOWNIQ between UBS and
  // Suissebank even though it sits 20 points above them.
  const placed: { xPct: number; yPct: number; labelOffset: number }[] = [];

  const points: FieldPoint[] = ordered.map((point) => {
    const clashes = placed.filter(
      (other) =>
        Math.abs(point.xPct - other.xPct) < 6 &&
        Math.abs(point.yPct - other.yPct) < 14
    );

    const labelOffset = clashes.length
      ? Math.max(...clashes.map((c) => c.labelOffset)) + LABEL_STACK_PX
      : 0;

    placed.push({ xPct: point.xPct, yPct: point.yPct, labelOffset });

    return {
      ...point,
      labelSide:
        labelOffset || point.yPct < LOW_POINT_PCT
          ? "above"
          : point.xPct >= 72
          ? "left"
          : "right",
      labelOffset,
    };
  });

  return {
    points,
    todayXPct: xOf(0),
    xTicks: [
      { label: "6 weeks ago", pct: xOf(-42) },
      { label: "3 weeks ago", pct: xOf(-21) },
      { label: "today", pct: xOf(0) },
      { label: "in 3 weeks", pct: xOf(21) },
      { label: "in 6 weeks", pct: xOf(42) },
    ].filter((tick) => tick.pct >= 0 && tick.pct <= 100),
    danger: { widthPct: xOf(0), heightPct: 45 },
  };
}

/**
 * What one tile needs to hold its text on the lines it was drawn for.
 *
 * Inline styles never reach the Tailwind compiler, so the grid cannot read the
 * `minWidth.card` token and this repeats its value. Change both together.
 */
export const CARD_MIN_WIDTH = 360;

/** `gap-3.5` and `p-4` on the grid, in the numbers the arithmetic needs. */
export const GRID_GAP = 14;
export const GRID_PADDING = 32;

/**
 * How many tiles fit across, at the drawn width or any narrower one.
 *
 * The drawn shape is two rows, which is what halving the count gives - ten
 * engagements across five columns. A window too narrow for that many tiles at
 * their working width drops a column and takes another row instead, so the
 * tiles keep the size they were drawn at and the page never scrolls sideways.
 */
export function fitColumns(width: number, count: number): number {
  const drawn = Math.min(5, Math.max(1, Math.ceil(count / 2)));
  const fit = Math.floor(
    (width - GRID_PADDING + GRID_GAP) / (CARD_MIN_WIDTH + GRID_GAP)
  );
  return Math.max(1, Math.min(drawn, fit));
}
