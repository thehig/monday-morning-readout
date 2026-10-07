import { usePOFeedbackByWeek } from "./use-po-feedback";
import { toEngagements, summarise, type ReadoutTotals } from "../lib/engagements";

/**
 * Last week's totals, for the one question the call opens with: is it worse?
 *
 * This is safe where the backward-looking Plan view was not. Comparing an
 * engagement to itself across weeks needs identity the data cannot give - 74
 * customer strings across 27 addresses, with typos and multi-customer rows -
 * but a count of a week needs no matching at all.
 *
 * Returns null rather than zeroes when there is nothing to compare against, so
 * a missing baseline reads as "no comparison" instead of as a collapse to nil.
 */
export function usePreviousWeekTotals(currentWeek: number): ReadoutTotals | null {
  const previous = currentWeek - 1;
  const { data } = usePOFeedbackByWeek(previous, previous >= 1);

  if (previous < 1 || !data) return null;

  const engagements = toEngagements(data);
  if (!engagements.length) return null;

  return summarise(engagements);
}

/**
 * A baseline for a schedule-derived count, or null when there is not one.
 *
 * Week 39 had five engagements behind and week 38 had none - but every week 38
 * row predates the schedule columns and recorded no dates at all, so the
 * honest comparison is no comparison. Without this guard the Wall announced
 * "+5" on the week the data started arriving, which reads as five engagements
 * slipping and is not what happened.
 */
export function scheduleBaseline(
  totals: ReadoutTotals | null,
  pick: (totals: ReadoutTotals) => number
): number | null {
  if (!totals || totals.scheduled === 0) return null;
  return pick(totals);
}
