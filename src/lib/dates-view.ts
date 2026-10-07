import { getWeekDates, formatDate } from "./date-utils";
import { monthTicks, type TimelineTick } from "./timeline";
import type { Engagement } from "./engagements";

/**
 * Data for the Dates state, which looks forward rather than back.
 *
 * Everything is placed by estimated completion rather than by the committed
 * deadline, because the estimate is what will actually happen. The Ladder
 * already answers "what slipped"; this answers "what is coming, and what
 * collides".
 */

const DAY = 24 * 60 * 60 * 1000;
/** Columns past this many weeks are collapsed into one, to keep them readable. */
const MAX_WEEK_COLUMNS = 11;
/** Two landings for one person closer than this are worth remarking on. */
export const CLOSE_LANDING_DAYS = 10;

export interface LandingWeek {
  week: number;
  /** "Week 44", or "Week 3 of 2027" once the count runs past the year end. */
  weekLabel: string;
  /** "5 – 11 Oct" */
  label: string;
  engagements: Engagement[];
  isCurrent: boolean;
  /** The final column, holding everything beyond the visible span. */
  isOverflow: boolean;
}

export interface LandingWeeks {
  columns: LandingWeek[];
  /** Engagements with no estimated completion date at all. */
  undated: Engagement[];
  /** The busiest column's count, so a pile-up can be called out. */
  peak: number;
}

/**
 * Engagements bucketed into the calendar week their estimate falls in,
 * starting the week after the readout.
 */
export function landingWeeks(
  engagements: Engagement[],
  currentWeek: number,
  year: number
): LandingWeeks {
  const dated = engagements.filter((e) => e.landingWeek !== null);
  const undated = engagements.filter((e) => e.landingWeek === null);

  const first = currentWeek + 1;
  const last = dated.length
    ? Math.max(...dated.map((e) => e.landingWeek as number))
    : first;
  const visibleLast = Math.min(last, first + MAX_WEEK_COLUMNS - 1);

  const columns: LandingWeek[] = [];
  for (let week = first; week <= visibleLast; week += 1) {
    const { start, end } = getWeekDates(week, year);
    const isOverflow = week === visibleLast && last > visibleLast;

    columns.push({
      week,
      weekLabel:
        week <= 52 ? `Week ${week}` : `Week ${week - 52} of ${year + 1}`,
      label: isOverflow
        ? `from ${formatDate(start)}`
        : `${formatDate(start)} – ${formatDate(end)}`,
      isCurrent: week === first,
      isOverflow,
      engagements: dated.filter((e) =>
        isOverflow
          ? (e.landingWeek as number) >= week
          : e.landingWeek === week
      ),
    });
  }

  return {
    columns,
    undated,
    peak: columns.reduce((n, c) => Math.max(n, c.engagements.length), 0),
  };
}

export interface RunwayMark {
  engagement: Engagement;
  pct: number;
}

export interface RunwayCollision {
  fromPct: number;
  toPct: number;
  days: number;
}

export interface OwnerLane {
  owner: string;
  ownerKey: string;
  marks: RunwayMark[];
  collisions: RunwayCollision[];
}

export interface Runway {
  rangeStart: Date;
  rangeEnd: Date;
  months: TimelineTick[];
  todayPct: number;
  lanes: OwnerLane[];
  /** Owners carrying two landings inside CLOSE_LANDING_DAYS. */
  collidingOwners: number;
}

/**
 * One lane per product owner on a shared axis, with the gaps between their own
 * landings measured. This is the only view that connects delivery dates to the
 * people who have to deliver them.
 */
export function buildRunway(
  engagements: Engagement[],
  today: Date,
  closeDays = CLOSE_LANDING_DAYS
): Runway | null {
  const dated = engagements.filter((e) => e.estimate);
  if (!dated.length) return null;

  const times = dated.map((e) => (e.estimate as Date).getTime());
  const min = Math.min(...times, today.getTime());
  const max = Math.max(...times, today.getTime());
  const span = Math.max(max - min, 21 * DAY);
  const pad = Math.max(span * 0.08, 4 * DAY);

  const rangeStart = new Date(min - pad);
  const rangeEnd = new Date(max + pad);
  const total = rangeEnd.getTime() - rangeStart.getTime();
  const pct = (date: Date) =>
    Math.round(((date.getTime() - rangeStart.getTime()) / total) * 10000) / 100;

  const byOwner = new Map<string, Engagement[]>();
  for (const engagement of dated) {
    const existing = byOwner.get(engagement.ownerKey);
    if (existing) existing.push(engagement);
    else byOwner.set(engagement.ownerKey, [engagement]);
  }

  const lanes: OwnerLane[] = [...byOwner.entries()]
    .map(([ownerKey, list]) => {
      const sorted = [...list].sort(
        (a, b) => (a.estimate as Date).getTime() - (b.estimate as Date).getTime()
      );
      const marks = sorted.map((engagement) => ({
        engagement,
        pct: pct(engagement.estimate as Date),
      }));

      const collisions: RunwayCollision[] = [];
      for (let i = 1; i < sorted.length; i += 1) {
        const gap = Math.round(
          ((sorted[i].estimate as Date).getTime() -
            (sorted[i - 1].estimate as Date).getTime()) /
            DAY
        );
        if (gap <= closeDays) {
          collisions.push({
            fromPct: marks[i - 1].pct,
            toPct: marks[i].pct,
            days: gap,
          });
        }
      }

      return { owner: sorted[0].owner, ownerKey, marks, collisions };
    })
    .sort((a, b) => {
      // Owners with a crowded fortnight lead, then the busiest.
      const byCollision = b.collisions.length - a.collisions.length;
      if (byCollision !== 0) return byCollision;
      return b.marks.length - a.marks.length;
    });

  return {
    rangeStart,
    rangeEnd,
    months: monthTicks(rangeStart, rangeEnd, pct),
    todayPct: pct(today),
    lanes,
    collidingOwners: lanes.filter((lane) => lane.collisions.length > 0).length,
  };
}
