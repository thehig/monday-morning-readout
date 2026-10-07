import { buildLadder, buildField, FIELD_FLOOR_DAYS } from "./wall-view";
import { toEngagements } from "./engagements";
import type { POFeedback } from "../types/feedback";

const TODAY = new Date(2026, 9, 7); // 7 Oct 2026

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

const WEEK_39 = toEngagements(
  [
    row({ id: 338, customer: "FIDUS Finanz AG", progress_percent: 75,
          target_date: "2026-05-31", estimated_completion_date: "2026-10-23" }),
    row({ id: 337, customer: "Test API", progress_percent: 0,
          target_date: "2026-09-08", estimated_completion_date: "2026-10-13" }),
    row({ id: 339, customer: "FIVV AG", progress_percent: 70,
          target_date: "2026-09-30", estimated_completion_date: "2026-10-31" }),
    row({ id: 344, customer: "UBS", progress_percent: 5,
          target_date: "2026-11-05", estimated_completion_date: "2026-11-05" }),
    row({ id: 343, customer: "Volksbank Kraichgau", progress_percent: 15,
          target_date: "2026-11-30", estimated_completion_date: "2026-12-15" }),
    row({ id: 340, customer: "FLOWNIQ", progress_percent: 25,
          target_date: "2026-11-05", estimated_completion_date: "2026-11-05" }),
    row({ id: 341, customer: "Suissebank OLB & Crypto", progress_percent: 5,
          target_date: "2026-11-06", estimated_completion_date: "2026-11-06" }),
  ],
  TODAY
);

describe("buildLadder", () => {
  const ladder = buildLadder(WEEK_39, TODAY)!;

  it("puts every engagement on one shared axis", () => {
    expect(ladder.rows).toHaveLength(7);

    for (const row of ladder.rows) {
      for (const pct of [row.deadlinePct, row.estimatePct]) {
        if (pct !== null) {
          expect(pct).toBeGreaterThanOrEqual(0);
          expect(pct).toBeLessThanOrEqual(100);
        }
      }
    }
    expect(ladder.todayPct).toBeGreaterThanOrEqual(0);
    expect(ladder.todayPct).toBeLessThanOrEqual(100);
  });

  it("makes slip comparable: a longer overrun draws a longer bar", () => {
    const fidus = ladder.rows.find((r) => r.engagement.customer === "FIDUS Finanz AG")!;
    const vbk = ladder.rows.find((r) => r.engagement.customer === "Volksbank Kraichgau")!;

    expect(fidus.engagement.slipDays).toBe(145);
    expect(vbk.engagement.slipDays).toBe(15);
    expect(fidus.slipBar!.widthPct).toBeGreaterThan(vbk.slipBar!.widthPct);
  });

  it("draws no bar when the estimate holds the committed date", () => {
    const ubs = ladder.rows.find((r) => r.engagement.customer === "UBS")!;

    expect(ubs.slipBar).toBeNull();
    expect(ubs.singlePoint).toBe(true);
  });

  it("stretches the axis to include an outlier rather than hiding it", () => {
    // FIDUS committed in May; the axis has to reach back that far
    expect(ladder.rangeStart.getTime()).toBeLessThan(
      new Date(2026, 4, 31).getTime()
    );
    expect(ladder.rangeEnd.getTime()).toBeGreaterThan(
      new Date(2026, 11, 15).getTime()
    );
  });

  it("keeps the month ticks readable over a long span", () => {
    expect(ladder.months.length).toBeGreaterThan(1);
    expect(ladder.months.length).toBeLessThanOrEqual(7);
  });

  it("returns nothing when no engagement has a date", () => {
    expect(buildLadder(toEngagements([row({ id: 1 })], TODAY), TODAY)).toBeNull();
  });
});

describe("buildField", () => {
  const field = buildField(WEEK_39, TODAY)!;
  const at = (customer: string) =>
    field.points.find((p) => p.engagement.customer === customer)!;

  it("puts a passed deadline left of today and a future one right", () => {
    expect(at("Test API").xPct).toBeLessThan(field.todayXPct);
    expect(at("FIVV AG").xPct).toBeLessThan(field.todayXPct);
    expect(at("UBS").xPct).toBeGreaterThan(field.todayXPct);
    expect(at("Volksbank Kraichgau").xPct).toBeGreaterThan(field.todayXPct);
  });

  it("places progress up the other axis", () => {
    expect(at("FIDUS Finanz AG").yPct).toBe(75);
    expect(at("Test API").yPct).toBe(0);
  });

  it("pins a long-passed deadline to the edge and says so", () => {
    const fidus = at("FIDUS Finanz AG");

    expect(fidus.clamped).toBe(true);
    expect(fidus.xPct).toBe(0);
    expect(FIELD_FLOOR_DAYS).toBe(-45);
  });

  it("does not clamp a deadline inside the floor", () => {
    expect(at("Test API").clamped).toBe(false);
  });

  it("keeps every point inside the plot", () => {
    for (const point of field.points) {
      expect(point.xPct).toBeGreaterThanOrEqual(0);
      expect(point.xPct).toBeLessThanOrEqual(100);
      expect(point.yPct).toBeGreaterThanOrEqual(0);
      expect(point.yPct).toBeLessThanOrEqual(100);
    }
  });

  it("turns a label inward near the right edge", () => {
    const rightmost = field.points[field.points.length - 1];

    expect(rightmost.xPct).toBeGreaterThan(72);
    expect(rightmost.labelSide).toBe("left");
  });

  it("stacks a crowded run so two labels cannot overlap", () => {
    const crowded = buildField(
      toEngagements(
        [
          row({ id: 1, customer: "UBS", progress_percent: 5, target_date: "2026-11-05" }),
          row({ id: 2, customer: "Suissebank", progress_percent: 5, target_date: "2026-11-06" }),
        ],
        TODAY
      ),
      TODAY
    )!;

    expect(crowded.points.map((p) => p.labelOffset)).toEqual([0, 44]);
    expect(crowded.points[1].labelSide).toBe("above");
  });

  it("separates two points that sort apart but overlap on the plot", () => {
    // ordering by x puts FLOWNIQ between UBS and Suissebank, so comparing only
    // against the previous point missed that those two land on each other
    const clash = field.points.filter((p) =>
      ["UBS", "Suissebank OLB & Crypto"].includes(p.engagement.customer)
    );

    expect(field.points.find((p) => p.engagement.customer === "FLOWNIQ")!.labelOffset).toBe(0);
    expect(clash.some((p) => p.labelOffset > 0)).toBe(true);
  });

  it("lifts a label above when the point before it crowds", () => {
    const crowded = buildField(
      toEngagements(
        [
          row({ id: 1, customer: "A", progress_percent: 20, target_date: "2026-11-05" }),
          row({ id: 2, customer: "B", progress_percent: 24, target_date: "2026-11-06" }),
        ],
        TODAY
      ),
      TODAY
    )!;

    expect(crowded.points[1].labelSide).toBe("above");
  });

  it("sizes the danger corner to everything left of today", () => {
    expect(field.danger.widthPct).toBe(field.todayXPct);
    expect(field.danger.heightPct).toBe(45);
  });

  it("only labels ticks that fall on the axis", () => {
    for (const tick of field.xTicks) {
      expect(tick.pct).toBeGreaterThanOrEqual(0);
      expect(tick.pct).toBeLessThanOrEqual(100);
    }
    expect(field.xTicks.some((t) => t.label === "today")).toBe(true);
  });

  it("returns nothing when no engagement has a deadline", () => {
    expect(buildField(toEngagements([row({ id: 1 })], TODAY), TODAY)).toBeNull();
  });
});
