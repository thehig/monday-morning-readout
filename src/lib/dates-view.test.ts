import {
  landingWeeks,
  buildRunway,
  collapseQuiet,
  weekWeight,
  CLOSE_LANDING_DAYS,
  type LandingWeek,
} from "./dates-view";
import { toEngagements, type Engagement } from "./engagements";
import type { POFeedback } from "../types/feedback";

const TODAY = new Date(2026, 9, 7); // 7 Oct 2026
const WEEK = 39;
const YEAR = 2026;

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
    target_date: "2026-11-06",
    estimated_completion_date: "2026-11-06",
    ...over,
  } as POFeedback;
}

/** The ten real week 39 engagements, reduced to what these views need. */
const WEEK_39 = [
  row({ id: 337, customer: "Test API", submitted_by: "finnegan.fischer@u.com",
        target_date: "2026-09-08", estimated_completion_date: "2026-10-13" }),
  row({ id: 346, customer: "PROAKTIVA VV", submitted_by: "david.siegel+pa@u.com",
        target_date: "2026-10-16", estimated_completion_date: "2026-10-16" }),
  row({ id: 338, customer: "FIDUS Finanz AG", submitted_by: "raunaq.inam@u.com",
        target_date: "2026-05-31", estimated_completion_date: "2026-10-23" }),
  row({ id: 345, customer: "Plutos", submitted_by: "gautam.katakkar@u.com",
        target_date: "2026-09-30", estimated_completion_date: "2026-10-30" }),
  row({ id: 339, customer: "FIVV AG", submitted_by: "raunaq.inam+fivv@u.com",
        target_date: "2026-09-30", estimated_completion_date: "2026-10-31" }),
  row({ id: 344, customer: "UBS", submitted_by: "gautam.katakkar@u.com",
        target_date: "2026-11-05", estimated_completion_date: "2026-11-05" }),
  row({ id: 340, customer: "FLOWNIQ", submitted_by: "finnegan.fischer@u.com",
        target_date: "2026-11-05", estimated_completion_date: "2026-11-05" }),
  row({ id: 341, customer: "Suissebank OLB & Crypto", submitted_by: "adwait.sompura@u.com",
        target_date: "2026-11-06", estimated_completion_date: "2026-11-06" }),
  row({ id: 342, customer: "Generic Ruby VV", submitted_by: "david.siegel+redesign@u.com",
        target_date: "2026-11-08", estimated_completion_date: "2026-11-08" }),
  row({ id: 343, customer: "Volksbank Kraichgau", submitted_by: "david.siegel+vbk@u.com",
        target_date: "2026-11-30", estimated_completion_date: "2026-12-15" }),
];

const engagements = toEngagements(WEEK_39, TODAY);

describe("landingWeeks", () => {
  it("buckets engagements into the week their estimate falls in", () => {
    const { columns } = landingWeeks(engagements, WEEK, YEAR);
    const byWeek = Object.fromEntries(
      columns.map((c) => [c.week, c.engagements.map((e) => e.customer)])
    );

    expect(byWeek[41]).toEqual(
      expect.arrayContaining(["Test API", "PROAKTIVA VV"])
    );
    expect(byWeek[42]).toEqual(["FIDUS Finanz AG"]);
    expect(byWeek[43]).toEqual(expect.arrayContaining(["Plutos", "FIVV AG"]));
    expect(byWeek[44]).toHaveLength(4);
  });

  it("finds the pile-up", () => {
    // four engagements land in week 44, across four different owners
    expect(landingWeeks(engagements, WEEK, YEAR).peak).toBe(4);
  });

  it("starts the week after the readout", () => {
    expect(landingWeeks(engagements, WEEK, YEAR).columns[0].week).toBe(40);
    expect(landingWeeks(engagements, WEEK, YEAR).columns[0].isCurrent).toBe(true);
  });

  it("leaves empty weeks in place, because a gap is information", () => {
    const columns = landingWeeks(engagements, WEEK, YEAR).columns;
    const empty = columns.filter((c) => c.engagements.length === 0);

    expect(empty.length).toBeGreaterThan(0);
    expect(empty.map((c) => c.week)).toContain(45);
  });

  it("collapses anything past the visible span into a final column", () => {
    const far = toEngagements(
      [
        ...WEEK_39,
        row({ id: 999, customer: "Far future", estimated_completion_date: "2027-06-01" }),
      ],
      TODAY
    );
    const { columns } = landingWeeks(far, WEEK, YEAR);
    const last = columns[columns.length - 1];

    expect(columns.length).toBeLessThanOrEqual(11);
    expect(last.isOverflow).toBe(true);
    expect(last.engagements.map((e) => e.customer)).toContain("Far future");
  });

  it("keeps counting past the year end rather than wrapping to week 1", () => {
    const next = toEngagements(
      [row({ id: 999, customer: "Next year", estimated_completion_date: "2027-01-20" })],
      TODAY
    );
    const { columns } = landingWeeks(next, WEEK, YEAR);

    expect(next[0].landingWeek).toBeGreaterThan(52);
    expect(columns.some((c) => c.engagements.length > 0)).toBe(true);
    expect(columns[columns.length - 1].weekLabel).toMatch(/^Week \d+/);
  });

  it("keeps engagements with no estimate out of the columns", () => {
    const mixed = toEngagements(
      [...WEEK_39, row({ id: 998, customer: "No dates", target_date: undefined, estimated_completion_date: undefined })],
      TODAY
    );
    const { columns, undated } = landingWeeks(mixed, WEEK, YEAR);

    expect(undated.map((e) => e.customer)).toEqual(["No dates"]);
    expect(columns.flatMap((c) => c.engagements).map((e) => e.customer)).not.toContain(
      "No dates"
    );
  });
});

describe("buildRunway", () => {
  const runway = buildRunway(engagements, TODAY)!;

  it("gives each person one lane", () => {
    expect(runway.lanes).toHaveLength(5);
    expect(runway.lanes.map((l) => l.owner).sort()).toEqual([
      "Adwait Sompura",
      "David Siegel",
      "Finnegan Fischer",
      "Gautam Katakkar",
      "Raunaq Inam",
    ]);
  });

  it("collapses an owner's plus-addressed submissions into one lane", () => {
    const david = runway.lanes.find((l) => l.owner === "David Siegel")!;

    expect(david.marks).toHaveLength(3);
  });

  it("measures the gap when one person lands twice in a fortnight", () => {
    const raunaq = runway.lanes.find((l) => l.owner === "Raunaq Inam")!;
    const gautam = runway.lanes.find((l) => l.owner === "Gautam Katakkar")!;

    expect(raunaq.collisions.map((c) => c.days)).toEqual([8]);
    expect(gautam.collisions.map((c) => c.days)).toEqual([6]);
    expect(runway.collidingOwners).toBe(2);
  });

  it("leaves well-spaced owners alone", () => {
    const david = runway.lanes.find((l) => l.owner === "David Siegel")!;

    expect(david.collisions).toEqual([]);
  });

  it("leads with the owners whose weeks collide", () => {
    expect(runway.lanes[0].collisions.length).toBeGreaterThan(0);
    expect(runway.lanes[runway.lanes.length - 1].collisions).toEqual([]);
  });

  it("orders each lane's marks by date", () => {
    for (const lane of runway.lanes) {
      const pcts = lane.marks.map((m) => m.pct);
      expect([...pcts].sort((a, b) => a - b)).toEqual(pcts);
    }
  });

  it("keeps every mark and today inside the axis", () => {
    const all = [runway.todayPct, ...runway.lanes.flatMap((l) => l.marks.map((m) => m.pct))];

    for (const pct of all) {
      expect(pct).toBeGreaterThanOrEqual(0);
      expect(pct).toBeLessThanOrEqual(100);
    }
  });

  it("respects a different idea of what counts as close", () => {
    const strict = buildRunway(engagements, TODAY, 5)!;
    const raunaq = strict.lanes.find((l) => l.owner === "Raunaq Inam")!;

    expect(CLOSE_LANDING_DAYS).toBe(10);
    expect(raunaq.collisions).toEqual([]); // 8 days apart is no longer close
  });

  it("returns nothing when no engagement has an estimate", () => {
    const none = toEngagements(
      [row({ id: 1, customer: "X", target_date: undefined, estimated_completion_date: undefined })],
      TODAY
    );

    expect(buildRunway(none, TODAY)).toBeNull();
  });
});

describe("collapseQuiet", () => {
  const week = (n: number, count: number, isOverflow = false): LandingWeek => ({
    week: n,
    weekLabel: `Week ${n}`,
    label: "",
    engagements: Array.from({ length: count }, () => ({}) as Engagement),
    isCurrent: false,
    isOverflow,
  });

  const shape = (columns: LandingWeek[]) =>
    collapseQuiet(columns).map((t) =>
      t.kind === "quiet" ? `quiet ${t.from}-${t.to}` : `week ${t.week}`
    );

  it("folds a run of empty weeks into one marker", () => {
    // Week 39's real shape: the pile-up at 44, then five dead weeks, then 50.
    expect(
      shape([
        week(44, 4),
        week(45, 0),
        week(46, 0),
        week(47, 0),
        week(48, 0),
        week(49, 0),
        week(50, 1),
      ])
    ).toEqual(["week 44", "quiet 45-49", "week 50"]);
  });

  it("leaves a single empty week as its own column", () => {
    // One quiet week between two busy ones is a fact, not padding.
    expect(shape([week(41, 2), week(42, 0), week(43, 1)])).toEqual([
      "week 41",
      "week 42",
      "week 43",
    ]);
  });

  it("folds a run at either end", () => {
    expect(shape([week(40, 0), week(41, 0), week(42, 3)])).toEqual([
      "quiet 40-41",
      "week 42",
    ]);
    expect(shape([week(42, 3), week(43, 0), week(44, 0)])).toEqual([
      "week 42",
      "quiet 43-44",
    ]);
  });

  it("keeps an empty overflow column, which means 'and everything after'", () => {
    expect(shape([week(44, 2), week(45, 0), week(46, 0, true)])).toEqual([
      "week 44",
      "week 45",
      "week 46",
    ]);
  });

  it("leaves a fully loaded span alone", () => {
    expect(shape([week(41, 1), week(42, 2)])).toEqual(["week 41", "week 42"]);
  });
});

describe("weekWeight", () => {
  it("gives the busiest week the most width", () => {
    expect(weekWeight(4)).toBeGreaterThan(weekWeight(2));
    expect(weekWeight(2)).toBeGreaterThan(weekWeight(1));
    expect(weekWeight(1)).toBeGreaterThan(weekWeight(0));
  });

  it("grows slower than the count, so quiet weeks do not vanish", () => {
    // Four landings earn more room than one, but not four times as much.
    expect(weekWeight(4) / weekWeight(1)).toBeLessThan(4);
    expect(weekWeight(4) / weekWeight(1)).toBeGreaterThan(1.5);
  });

  it("still gives an empty week room for its own date", () => {
    expect(weekWeight(0)).toBeGreaterThan(0);
  });
});
