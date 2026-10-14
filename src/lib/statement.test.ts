import { buildStatement } from "./statement";
import { toEngagement } from "./engagements";
import { buildTimeline } from "./timeline";
import type { POFeedback } from "../types/feedback";

const TODAY = new Date(2026, 9, 7);

function engagement(over: Partial<POFeedback> = {}) {
  return toEngagement(
    {
      id: 1,
      created_at: "2026-10-02T11:21:02Z",
      submitted_by: "raunaq.inam@united-signals.com",
      progress_percent: 75,
      team_happiness: 4,
      customer_happiness: 4,
      velocity_next_week: "Grün",
      customer: "FIDUS Finanz AG",
      ...over,
    } as POFeedback,
    TODAY
  );
}

describe("buildStatement", () => {
  it("leads with the days since the agreed release, counted from today", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
        velocity_next_week: "Gelb",
      })
    );

    // 129 days since May 31 - not the 145 by which the estimate overruns.
    expect(s.headline).toBe("129 days past the agreed release date");
    expect(s.tone).toBe("late");
  });

  it("reports the estimate as the owner's forecast, apart from the release", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
      })
    );

    expect(s.detail).toContain(
      "Estimated completion is Oct 23, 2026, 145 days after the release date."
    );
  });

  it("reads on track as a view of the estimate, never as a disagreement", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
      })
    );

    expect(s.detail).toContain("The owner reports it on track for that estimate.");
    expect(s.detail).not.toMatch(/disagree/i);
  });

  it("says when the owner doubts even their own estimate", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-09-08",
        estimated_completion_date: "2026-10-13",
        project_on_track: false,
      })
    );

    expect(s.detail).toContain("The owner reports it not on track for that estimate.");
  });

  it("counts down to a release still ahead whose estimate overruns it", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-11-30",
        estimated_completion_date: "2026-12-15",
        project_on_track: false,
      })
    );

    expect(s.headline).toBe("54 days to the agreed release date");
    expect(s.detail).toContain("15 days after the release date.");
    expect(s.tone).toBe("watch");
  });

  it("is plain when the estimate lands on the release date", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-11-06",
        estimated_completion_date: "2026-11-06",
        project_on_track: true,
      })
    );

    expect(s.headline).toBe("30 days to the agreed release date");
    expect(s.tone).toBe("fine");
    expect(s.detail).toContain("Nov 6, 2026, on the release date.");
    expect(s.detail).toContain("High velocity expected next week.");
  });

  it("says so when there is no release to measure against", () => {
    const s = buildStatement(engagement());

    expect(s.headline).toBe("No release date recorded");
    expect(s.tone).toBe("unknown");
  });

  it("singularises a single day", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-10-06",
        estimated_completion_date: "2026-10-07",
      })
    );

    expect(s.headline).toBe("1 day past the agreed release date");
    expect(s.detail).toContain("1 day after the release date.");
  });

  it("says when no estimate or on-track view was recorded", () => {
    const s = buildStatement(engagement({ target_date: "2026-11-06" }));

    expect(s.detail).toContain("No completion estimate recorded.");
    expect(s.detail).toContain("The owner did not say whether it is on track.");
  });

  it("notes a missing velocity rather than leaving a gap", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-11-06",
        estimated_completion_date: "2026-11-06",
        velocity_next_week: undefined,
      })
    );

    expect(s.detail).toContain("No velocity recorded for next week.");
  });
});

describe("buildTimeline", () => {
  it("places the committed date before the estimate and draws the gap", () => {
    const t = buildTimeline(new Date(2026, 4, 31), new Date(2026, 9, 23), TODAY)!;

    expect(t.releasePct).toBeLessThan(t.estimatePct!);
    expect(t.slipBar).not.toBeNull();
    expect(t.slipBar!.leftPct).toBe(t.releasePct);
    expect(t.slipBar!.widthPct).toBeCloseTo(t.estimatePct! - t.releasePct!, 5);
    expect(t.singlePoint).toBe(false);
  });

  it("keeps every mark inside the axis", () => {
    const t = buildTimeline(new Date(2026, 4, 31), new Date(2026, 9, 23), TODAY)!;

    for (const pct of [t.releasePct!, t.estimatePct!, t.todayPct]) {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
    expect(t.months.every((m) => m.pct >= 0 && m.pct <= 100)).toBe(true);
  });

  it("collapses to one mark when the estimate lands on the release date", () => {
    const t = buildTimeline(new Date(2026, 10, 6), new Date(2026, 10, 6), TODAY)!;

    expect(t.singlePoint).toBe(true);
    expect(t.slipBar).toBeNull();
  });

  it("still gives a single date an axis to sit on", () => {
    const t = buildTimeline(new Date(2026, 10, 6), new Date(2026, 10, 6), TODAY)!;

    expect(t.rangeEnd.getTime()).toBeGreaterThan(t.rangeStart.getTime());
    expect(t.months.length).toBeGreaterThan(0);
  });

  it("draws no slip when the estimate beats the release", () => {
    const t = buildTimeline(new Date(2026, 10, 30), new Date(2026, 10, 20), TODAY)!;

    expect(t.slipBar).toBeNull();
    expect(t.estimatePct).toBeLessThan(t.releasePct!);
  });

  it("thins the month ticks over a long span", () => {
    const t = buildTimeline(new Date(2025, 0, 1), new Date(2026, 9, 23), TODAY)!;

    expect(t.months.length).toBeLessThanOrEqual(7);
    expect(t.months.length).toBeGreaterThan(2);
  });

  it("keeps the today marker clear of a month tick", () => {
    const t = buildTimeline(new Date(2026, 4, 31), new Date(2026, 9, 23), TODAY)!;

    for (const tick of t.months) {
      expect(Math.abs(tick.pct - t.todayPct)).toBeGreaterThanOrEqual(5);
    }
  });

  it("returns nothing when neither date was recorded", () => {
    expect(buildTimeline(null, null, TODAY)).toBeNull();
  });

  it("works from one date alone", () => {
    const t = buildTimeline(new Date(2026, 10, 6), null, TODAY)!;

    expect(t.releasePct).not.toBeNull();
    expect(t.estimatePct).toBeNull();
    expect(t.slipBar).toBeNull();
  });
});
