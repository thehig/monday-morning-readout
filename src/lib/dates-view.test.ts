import { buildRunway } from "./dates-view";
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

  it("places each dot by its estimated completion date, not its release", () => {
    // FIDUS: release May 31, estimate Oct 23. Its dot sits after today,
    // where the estimate is, not months back at the release.
    const raunaq = runway.lanes.find((l) => l.owner === "Raunaq Inam")!;
    const fidus = raunaq.marks.find((m) => m.engagement.customer === "FIDUS Finanz AG")!;

    expect(fidus.pct).toBeGreaterThan(runway.todayPct);
    expect(runway.rangeStart.getTime()).toBeGreaterThan(new Date(2026, 4, 31).getTime());
  });

  it("draws nothing between an owner's engagements: they are separate work", () => {
    for (const lane of runway.lanes) {
      expect(Object.keys(lane).sort()).toEqual(["marks", "owner", "ownerKey"]);
    }
  });

  it("leads with the busiest owner", () => {
    expect(runway.lanes[0].owner).toBe("David Siegel");
    expect(runway.lanes[runway.lanes.length - 1].marks).toHaveLength(1);
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

  it("returns nothing when no engagement has an estimate", () => {
    const none = toEngagements(
      [row({ id: 1, customer: "X", target_date: undefined, estimated_completion_date: undefined })],
      TODAY
    );

    expect(buildRunway(none, TODAY)).toBeNull();
  });
});
