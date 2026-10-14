import { monthTicks, type TimelineTick } from "./timeline";
import type { Engagement } from "./engagements";

/**
 * Data for the owner runway: one lane per product owner, one dot per
 * engagement, placed on a shared calendar by its estimated completion date.
 *
 * Placed by the estimate rather than the release because the runway looks
 * forward: the estimate is when the owner expects the work to land. An owner's
 * engagements are separate pieces of work for separate customers, so the lane
 * draws where each one lands and nothing between them.
 */

const DAY = 24 * 60 * 60 * 1000;

export interface RunwayMark {
  engagement: Engagement;
  /** Where the estimated completion date falls across the axis. */
  pct: number;
}

export interface OwnerLane {
  owner: string;
  ownerKey: string;
  /** The owner's engagements, earliest estimate first. */
  marks: RunwayMark[];
}

export interface Runway {
  rangeStart: Date;
  rangeEnd: Date;
  months: TimelineTick[];
  todayPct: number;
  lanes: OwnerLane[];
}

/**
 * One lane per product owner on a shared axis that always holds today and
 * every estimate. Engagements without an estimate have nowhere to sit and are
 * left out.
 */
export function buildRunway(engagements: Engagement[], today: Date): Runway | null {
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
      return {
        owner: sorted[0].owner,
        ownerKey,
        marks: sorted.map((engagement) => ({
          engagement,
          pct: pct(engagement.estimate as Date),
        })),
      };
    })
    // The busiest owners lead; ties keep the week's own order.
    .sort((a, b) => b.marks.length - a.marks.length);

  return {
    rangeStart,
    rangeEnd,
    months: monthTicks(rangeStart, rangeEnd, pct),
    todayPct: pct(today),
    lanes,
  };
}
