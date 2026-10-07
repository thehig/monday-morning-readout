import {
  buildLadder,
  buildField,
  fitColumns,
  CARD_MIN_WIDTH,
  GRID_GAP,
  GRID_PADDING,
  FIELD_FLOOR_DAYS,
} from "./wall-view";
import { toEngagements } from "./engagements";
import type { POFeedback } from "../types/feedback";

/** What one label measures on screen; see LABEL_STACK_PX in wall-view.ts. */
const RENDERED_LABEL_PX = 49;

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

    // The gap has to clear a rendered label - a name over a line of detail,
    // 49px - or the two run into each other. Asserting the invariant rather
    // than the number, because the number existed at 44 and was too small.
    const [first, second] = crowded.points;

    expect(first.labelOffset).toBe(0);
    expect(second.labelOffset).toBeGreaterThanOrEqual(RENDERED_LABEL_PX);
    expect(second.labelSide).toBe("above");
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

describe("fitColumns", () => {
  it("draws ten engagements as five across, which is two rows", () => {
    expect(fitColumns(1920, 10)).toBe(5);
  });

  it("drops a column rather than narrowing the tiles", () => {
    // Four columns need 4*360 + 3*14 + 32 = 1514, so 1600 holds them and
    // 1500 does not.
    expect(fitColumns(1600, 10)).toBe(4);
    expect(fitColumns(1500, 10)).toBe(3);
    expect(fitColumns(1280, 10)).toBe(3);
  });

  it("never drops below one, however narrow the window", () => {
    expect(fitColumns(320, 10)).toBe(1);
    expect(fitColumns(0, 10)).toBe(1);
  });

  it("keeps two rows for a short week rather than one wide row", () => {
    expect(fitColumns(1920, 4)).toBe(2);
    expect(fitColumns(1920, 1)).toBe(1);
  });

  it("caps at five even when the week is long", () => {
    expect(fitColumns(1920, 20)).toBe(5);
  });

  it("never returns more columns than the width can hold", () => {
    for (const width of [600, 900, 1100, 1400, 1700, 1920, 2560]) {
      const columns = fitColumns(width, 10);
      const needed =
        columns * CARD_MIN_WIDTH + (columns - 1) * GRID_GAP + GRID_PADDING;
      if (columns > 1) expect(needed).toBeLessThanOrEqual(width);
    }
  });
});

describe("buildField label placement", () => {
  const row = (over: Partial<POFeedback> = {}): POFeedback =>
    ({
      id: 1,
      created_at: "2026-10-02T09:00:00Z",
      submitted_by: "a@united-signals.com",
      customer: "A",
      progress_percent: 50,
      target_date: "2026-10-10",
      ...over,
    }) as POFeedback;

  const build = (rows: POFeedback[]) =>
    buildField(toEngagements(rows), new Date("2026-10-05T09:00:00Z"));

  it("puts a label above its point when the point sits on the date axis", () => {
    // 0% done lands the dot on the axis; centred, its label would hang into
    // the dates underneath it.
    const field = build([row({ progress_percent: 0 })]);

    expect(field?.points[0].labelSide).toBe("above");
  });

  it("still places a mid-height point to the side", () => {
    // Two points so the x-scale has a real range: the earlier deadline sits
    // left of centre and takes its label on the right, and vice versa.
    const field = build([
      row({ id: 1, customer: "Early", target_date: "2026-09-01" }),
      row({ id: 2, customer: "Late", target_date: "2026-11-28" }),
    ]);

    const byName = Object.fromEntries(
      (field?.points ?? []).map((p) => [p.engagement.customer, p.labelSide])
    );

    expect(byName.Early).toBe("right");
    expect(byName.Late).toBe("left");
  });
});
