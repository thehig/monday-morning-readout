import type { Engagement } from "./engagements";

/**
 * The sentence the Stop screen opens with.
 *
 * The call stops on an engagement for a reason, and this states it before any
 * detail. Where the owner's own verdict disagrees with their dates, both are
 * reported and neither is resolved - that disagreement is usually why the call
 * stopped here at all.
 */

export type StatementTone = "late" | "watch" | "fine" | "unknown";

export interface Statement {
  /** The headline, e.g. "145 days past the date it committed to". */
  headline: string;
  /** The owner's own position, and what they expect next week. */
  detail: string;
  tone: StatementTone;
}

function days(n: number): string {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

function ownersPosition(engagement: Engagement): string {
  const { ownerSaysOnTrack, contradicts, slipDays } = engagement;

  if (ownerSaysOnTrack === null) return "The owner did not record a view.";
  if (contradicts) {
    return `The owner disagrees: records the deadline as on track, ${days(
      slipDays ?? 0
    )} after their own estimate.`;
  }
  return ownerSaysOnTrack
    ? "The owner agrees: says the deadline will be met."
    : "The owner agrees: says the deadline will be missed.";
}

export function buildStatement(engagement: Engagement): Statement {
  const { state, slipDays, deadline, velocityLabel } = engagement;

  const outlook = velocityLabel
    ? ` ${velocityLabel} next week.`
    : " No velocity recorded for next week.";

  if (!deadline) {
    return {
      headline: "No deadline recorded",
      detail:
        "Nothing to measure this against." +
        (velocityLabel ? ` ${velocityLabel} next week.` : ""),
      tone: "unknown",
    };
  }

  if (state === "late" && slipDays !== null && slipDays > 0) {
    return {
      headline: `${days(slipDays)} past the date it committed to`,
      detail: ownersPosition(engagement) + outlook,
      tone: "late",
    };
  }

  if (state === "late") {
    return {
      headline: "Past the date it committed to",
      detail: ownersPosition(engagement) + outlook,
      tone: "late",
    };
  }

  if (state === "watch" && slipDays !== null && slipDays > 0) {
    return {
      headline: `Finishing ${days(slipDays)} after the date it committed to`,
      detail: ownersPosition(engagement) + outlook,
      tone: "watch",
    };
  }

  return {
    headline: "Finishing on the date it committed to",
    detail: ownersPosition(engagement) + outlook,
    tone: "fine",
  };
}
