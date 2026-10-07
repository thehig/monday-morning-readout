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
  it("leads with the overrun once the deadline has passed", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
        velocity_next_week: "Gelb",
      })
    );

    expect(s.headline).toBe("145 days past the date it committed to");
    expect(s.tone).toBe("late");
  });

  it("reports the owner's disagreement without resolving it", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
      })
    );

    expect(s.detail).toContain("The owner disagrees");
    expect(s.detail).toContain("145 days after their own estimate");
  });

  it("says the owner agrees when they expect to miss it", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-09-08",
        estimated_completion_date: "2026-10-13",
        project_on_track: false,
      })
    );

    expect(s.detail).toContain("The owner agrees: says the deadline will be missed.");
  });

  it("distinguishes an overrun still ahead of its deadline", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-11-30",
        estimated_completion_date: "2026-12-15",
        project_on_track: false,
      })
    );

    expect(s.headline).toBe("Finishing 15 days after the date it committed to");
    expect(s.tone).toBe("watch");
  });

  it("is plain when the estimate lands on the committed date", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-11-06",
        estimated_completion_date: "2026-11-06",
        project_on_track: true,
      })
    );

    expect(s.headline).toBe("Finishing on the date it committed to");
    expect(s.tone).toBe("fine");
    expect(s.detail).toContain("High velocity expected next week.");
  });

  it("says so when there is no deadline to measure against", () => {
    const s = buildStatement(engagement());

    expect(s.headline).toBe("No deadline recorded");
    expect(s.tone).toBe("unknown");
  });

  it("singularises a one-day overrun", () => {
    const s = buildStatement(
      engagement({
        target_date: "2026-11-30",
        estimated_completion_date: "2026-12-01",
      })
    );

    expect(s.headline).toBe("Finishing 1 day after the date it committed to");
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

    expect(t.deadlinePct).toBeLessThan(t.estimatePct!);
    expect(t.slipBar).not.toBeNull();
    expect(t.slipBar!.leftPct).toBe(t.deadlinePct);
    expect(t.slipBar!.widthPct).toBeCloseTo(t.estimatePct! - t.deadlinePct!, 5);
    expect(t.singlePoint).toBe(false);
  });

  it("keeps every mark inside the axis", () => {
    const t = buildTimeline(new Date(2026, 4, 31), new Date(2026, 9, 23), TODAY)!;

    for (const pct of [t.deadlinePct!, t.estimatePct!, t.todayPct]) {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
    expect(t.months.every((m) => m.pct >= 0 && m.pct <= 100)).toBe(true);
  });

  it("collapses to one mark when the estimate lands on the deadline", () => {
    const t = buildTimeline(new Date(2026, 10, 6), new Date(2026, 10, 6), TODAY)!;

    expect(t.singlePoint).toBe(true);
    expect(t.slipBar).toBeNull();
  });

  it("still gives a single date an axis to sit on", () => {
    const t = buildTimeline(new Date(2026, 10, 6), new Date(2026, 10, 6), TODAY)!;

    expect(t.rangeEnd.getTime()).toBeGreaterThan(t.rangeStart.getTime());
    expect(t.months.length).toBeGreaterThan(0);
  });

  it("draws no slip when the estimate beats the deadline", () => {
    const t = buildTimeline(new Date(2026, 10, 30), new Date(2026, 10, 20), TODAY)!;

    expect(t.slipBar).toBeNull();
    expect(t.estimatePct).toBeLessThan(t.deadlinePct!);
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

    expect(t.deadlinePct).not.toBeNull();
    expect(t.estimatePct).toBeNull();
    expect(t.slipBar).toBeNull();
  });
});
