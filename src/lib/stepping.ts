import type { Engagement } from "./engagements";

/**
 * Where the call has got to while stepping through the week.
 *
 * The order is the Wall's own order - everything behind schedule first,
 * then the rest - so the arrow keys walk the running order the meeting
 * actually follows.
 */
export interface StepPosition {
  previousId: number | null;
  nextId: number | null;
}

export function stepPosition(
  engagements: Engagement[],
  currentId: number
): StepPosition | null {
  const index = engagements.findIndex((e) => e.id === currentId);
  if (index === -1) return null;

  const next = engagements[index + 1];

  return {
    previousId: index > 0 ? engagements[index - 1].id : null,
    nextId: next ? next.id : null,
  };
}
