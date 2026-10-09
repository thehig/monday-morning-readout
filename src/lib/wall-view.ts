import { monthTicks, type TimelineTick } from "./timeline";
import type { Engagement } from "./engagements";

/**
 * Geometry for the Wall: the Ladder's shared calendar, and how many tiles the
 * ranked grid fits across.
 *
 * The Ladder puts every engagement on one shared calendar, so slip is
 * comparable down a column rather than computed per card. Pure functions of
 * the week's engagements.
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

/**
 * What one tile needs to hold its text on the lines it was drawn for.
 *
 * Inline styles never reach the Tailwind compiler, so the grid cannot read the
 * `minWidth.card` token and this repeats its value. Change both together.
 */
export const CARD_MIN_WIDTH = 360;

/**
 * The widest a tile grows. Past this a week with few engagements would stretch
 * each card across half the screen, its facts lost in the space between them.
 */
export const CARD_MAX_WIDTH = 440;

/** `gap-4` and `px-6` on the grid, in the numbers the arithmetic needs. */
export const GRID_GAP = 16;
export const GRID_PADDING = 48;

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
