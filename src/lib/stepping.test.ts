import { stepPosition } from "./stepping";
import { toEngagements } from "./engagements";
import type { POFeedback } from "../types/feedback";

const TODAY = new Date(2026, 9, 7);

function row(over: Partial<POFeedback> = {}): POFeedback {
  return {
    id: 1,
    created_at: "2026-10-02T14:42:39Z",
    submitted_by: "adwait.sompura@united-signals.com",
    progress_percent: 5,
    team_happiness: 4,
    customer_happiness: 4,
    velocity_next_week: "Grün",
    customer: "Suissebank",
    ...over,
  } as POFeedback;
}

/** Two behind schedule, then two on schedule - the Wall's own order. */
const WEEK = toEngagements(
  [
    row({ id: 10, customer: "On track A", target_date: "2026-11-05",
          estimated_completion_date: "2026-11-05" }),
    row({ id: 11, customer: "Past deadline", target_date: "2026-05-31",
          estimated_completion_date: "2026-10-23" }),
    row({ id: 12, customer: "On track B", target_date: "2026-11-08",
          estimated_completion_date: "2026-11-08" }),
    row({ id: 13, customer: "Overruns", target_date: "2026-11-30",
          estimated_completion_date: "2026-12-15" }),
  ],
  TODAY
);

describe("stepPosition", () => {
  it("walks the exceptions before anything on schedule", () => {
    expect(WEEK.map((e) => e.customer)).toEqual([
      "Past deadline",
      "Overruns",
      "On track A",
      "On track B",
    ]);
  });

  it("has no previous at the start and no next at the end", () => {
    expect(stepPosition(WEEK, 11)!.previousId).toBeNull();
    expect(stepPosition(WEEK, 11)!.nextId).toBe(13);

    const last = stepPosition(WEEK, WEEK[WEEK.length - 1].id)!;
    expect(last.nextId).toBeNull();
    expect(last.previousId).not.toBeNull();
  });

  it("steps forward and back through the whole week", () => {
    const walked: number[] = [WEEK[0].id];
    let step = stepPosition(WEEK, WEEK[0].id)!;

    while (step.nextId !== null) {
      walked.push(step.nextId);
      step = stepPosition(WEEK, step.nextId)!;
    }

    expect(walked).toEqual(WEEK.map((e) => e.id));
    expect(stepPosition(WEEK, walked[2])!.previousId).toBe(walked[1]);
  });

  it("returns nothing for an engagement outside this week", () => {
    expect(stepPosition(WEEK, 999)).toBeNull();
    expect(stepPosition([], 11)).toBeNull();
  });
});
