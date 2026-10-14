import type { Engagement } from "./engagements";
import { showDate } from "./engagements";

/**
 * The sentence the Stop screen opens with.
 *
 * The call stops on an engagement for a reason, and this states it before any
 * detail. The headline is the hard fact: the release was agreed with the
 * customer and does not move, so how far past it (or how far ahead of it) the
 * engagement is today is not anyone's opinion. The estimate is the owner's own
 * forecast, and "on track" is the owner's view of that estimate - so neither
 * can contradict the release, and the detail reports them as what they are.
 */

export type StatementTone = "late" | "watch" | "fine" | "unknown";

export interface Statement {
  /** The headline, e.g. "117 days past the agreed release date". */
  headline: string;
  /** The estimate, the owner's view of it, and next week's velocity. */
  detail: string;
  tone: StatementTone;
}

function days(n: number): string {
  return `${n} ${n === 1 ? "day" : "days"}`;
}

function estimateSentence(engagement: Engagement): string {
  const { estimate, slipDays } = engagement;

  if (!estimate || slipDays === null) {
    return "No completion estimate recorded.";
  }
  if (slipDays === 0) {
    return `Estimated completion is ${showDate(estimate)}, on the release date.`;
  }
  return `Estimated completion is ${showDate(estimate)}, ${days(
    Math.abs(slipDays)
  )} ${slipDays > 0 ? "after" : "before"} the release date.`;
}

function onTrackSentence(engagement: Engagement): string {
  const { ownerSaysOnTrack, estimate } = engagement;
  const target = estimate ? "that estimate" : "its estimate";

  if (ownerSaysOnTrack === null) {
    return "The owner did not say whether it is on track.";
  }
  return ownerSaysOnTrack
    ? `The owner reports it on track for ${target}.`
    : `The owner reports it not on track for ${target}.`;
}

export function buildStatement(engagement: Engagement): Statement {
  const { state, release, daysToRelease, overdueDays, velocityLabel } =
    engagement;

  const outlook = velocityLabel
    ? ` ${velocityLabel} next week.`
    : " No velocity recorded for next week.";

  if (!release || daysToRelease === null) {
    return {
      headline: "No release date recorded",
      detail:
        "Nothing to measure this against." +
        (velocityLabel ? ` ${velocityLabel} next week.` : ""),
      tone: "unknown",
    };
  }

  const detail = `${estimateSentence(engagement)} ${onTrackSentence(
    engagement
  )}${outlook}`;

  if (overdueDays !== null) {
    return {
      headline: `${days(overdueDays)} past the agreed release date`,
      detail,
      tone: "late",
    };
  }

  return {
    headline:
      daysToRelease === 0
        ? "Due today"
        : `${days(daysToRelease)} to the agreed release date`,
    detail,
    tone: state === "watch" ? "watch" : "fine",
  };
}
