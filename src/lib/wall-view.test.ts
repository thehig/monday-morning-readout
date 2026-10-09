import {
  buildLadder,
  fitColumns,
  CARD_MIN_WIDTH,
  GRID_GAP,
  GRID_PADDING,
  tickStride,
} from "./wall-view";
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

describe("tickStride", () => {
  // Seven months across the axis, about 14% apart.
  const months = [5, 19, 33, 47, 61, 75, 89];

  it("shows every month where the column is wide enough", () => {
    expect(tickStride(months, 700)).toBe(1);
  });

  it("skips months rather than let their labels collide", () => {
    // 14% of 260px is about 36px - too tight for a 52px label.
    expect(tickStride(months, 260)).toBe(2);
    expect(tickStride(months, 160)).toBe(3);
  });

  it("shows every month before the column is measured", () => {
    expect(tickStride(months, 0)).toBe(1);
    expect(tickStride([50], 100)).toBe(1);
  });
});
