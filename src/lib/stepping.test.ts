import { stepPosition, describeStep } from "./stepping";
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

/** Two needing a decision, then two on schedule - the Wall's own order. */
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

  it("reports where the call has got to", () => {
    const step = stepPosition(WEEK, 11)!;

    expect(step.position).toBe(1);
    expect(step.total).toBe(4);
    expect(step.exceptions).toBe(2);
    expect(step.isException).toBe(true);
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

  it("knows when the next step leaves the exceptions", () => {
    expect(stepPosition(WEEK, 13)!.nextStartsFastPass).toBe(true);
    expect(stepPosition(WEEK, 11)!.nextStartsFastPass).toBe(false);
    // already in the fast pass, so there is nothing to leave
    expect(stepPosition(WEEK, 10)!.nextStartsFastPass).toBe(false);
  });

  it("returns nothing for an engagement outside this week", () => {
    expect(stepPosition(WEEK, 999)).toBeNull();
    expect(stepPosition([], 11)).toBeNull();
  });
});

describe("describeStep", () => {
  const describe_ = (id: number) => describeStep(stepPosition(WEEK, id)!);

  it("counts down the remaining decisions", () => {
    expect(describe_(11)).toBe("1 more needs a decision, then 2 on schedule");
  });

  it("announces the fast pass once the exceptions are done", () => {
    expect(describe_(13)).toBe("exceptions done · 2 on schedule to run through");
  });

  it("counts down the fast pass", () => {
    expect(describe_(10)).toBe("fast pass · 1 to go");
  });

  it("says when there is nowhere further to go", () => {
    expect(describe_(12)).toBe("last of the week");
  });

  it("does not talk about a pass through one engagement", () => {
    const single = toEngagements([row({ id: 1, customer: "Only" })], TODAY);

    expect(describeStep(stepPosition(single, 1)!)).toBe(
      "the only engagement this week"
    );
  });
});
