import type { Engagement } from "./engagements";

/**
 * Where the call has got to while stepping through the week.
 *
 * The order is the Wall's own order - everything needing a decision first,
 * then the rest - so the arrow keys walk the running order the meeting
 * actually follows: stop on the exceptions, then a fast pass of what is on
 * track.
 */
export interface StepPosition {
  /** 1-based, for display. */
  position: number;
  total: number;
  previousId: number | null;
  nextId: number | null;
  /** How many engagements lead the order because they need a decision. */
  exceptions: number;
  /** This engagement is one of them. */
  isException: boolean;
  /** The next step leaves the exceptions and starts the fast pass. */
  nextStartsFastPass: boolean;
}

export function stepPosition(
  engagements: Engagement[],
  currentId: number
): StepPosition | null {
  const index = engagements.findIndex((e) => e.id === currentId);
  if (index === -1) return null;

  const needsDecision = (e: Engagement) =>
    e.state === "late" || e.state === "watch";
  const exceptions = engagements.filter(needsDecision).length;
  const next = engagements[index + 1];

  return {
    position: index + 1,
    total: engagements.length,
    previousId: index > 0 ? engagements[index - 1].id : null,
    nextId: next ? next.id : null,
    exceptions,
    isException: needsDecision(engagements[index]),
    nextStartsFastPass:
      needsDecision(engagements[index]) && next !== undefined && !needsDecision(next),
  };
}

/** How the footer describes where the call has got to. */
export function describeStep(step: StepPosition): string {
  if (step.total === 1) return "the only engagement this week";

  if (step.isException) {
    const left = step.exceptions - step.position;
    if (left > 0) {
      return `${left} more ${left === 1 ? "needs" : "need"} a decision, then ${
        step.total - step.exceptions
      } on track`;
    }
    return `exceptions done · ${step.total - step.exceptions} on track to run through`;
  }

  const left = step.total - step.position;
  return left > 0
    ? `fast pass · ${left} to go`
    : "last of the week";
}
