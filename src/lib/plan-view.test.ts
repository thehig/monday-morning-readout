import { planExceptions } from "./plan-view";
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
    goals_next_week: "Keep going",
    ...over,
  } as POFeedback;
}

const build = (rows: POFeedback[]) => toEngagements(rows, TODAY);

describe("planExceptions", () => {
  describe("who committed nothing", () => {
    it("names them rather than only counting them", () => {
      const { silent } = planExceptions(
        build([
          row({ id: 1, customer: "FLOWNIQ", goals_next_week: "Bugfixes" }),
          row({ id: 2, customer: "Test API", goals_next_week: null }),
        ])
      );

      expect(silent.map((e) => e.customer)).toEqual(["Test API"]);
    });

    it("treats a lone dash as nothing written, the way the rest of the app does", () => {
      const { silent } = planExceptions(
        build([row({ id: 1, customer: "Plutos", goals_next_week: " - " })])
      );

      expect(silent.map((e) => e.customer)).toEqual(["Plutos"]);
    });

    it("puts the worst schedule first, so the call starts with the real one", () => {
      const { silent } = planExceptions(
        build([
          row({
            id: 1,
            customer: "Mild",
            goals_next_week: null,
            target_date: "2026-11-01",
            estimated_completion_date: "2026-11-10",
          }),
          row({
            id: 2,
            customer: "Severe",
            goals_next_week: null,
            target_date: "2026-05-31",
            estimated_completion_date: "2026-10-23",
          }),
        ])
      );

      expect(silent.map((e) => e.customer)).toEqual(["Severe", "Mild"]);
    });
  });

  describe("who is carrying the week", () => {
    it("names the owner with the most commitments", () => {
      const { heaviest } = planExceptions(
        build([
          row({
            id: 1,
            submitted_by: "adwait.sompura@united-signals.com",
            customer: "Suissebank",
            goals_next_week: "1. Wallet fix\n2. Account details\n3. Close SB items",
          }),
          row({
            id: 2,
            submitted_by: "david.siegel@united-signals.com",
            customer: "PROAKTIVA",
            goals_next_week: "Feedback einarbeiten",
          }),
        ])
      );

      expect(heaviest?.owner).toBe("Adwait Sompura");
      expect(heaviest?.commitments).toBe(3);
    });

    it("says nothing when the load is tied, rather than picking one", () => {
      const { heaviest } = planExceptions(
        build([
          row({
            id: 1,
            submitted_by: "a.one@united-signals.com",
            customer: "A",
            goals_next_week: "1. x\n2. y",
          }),
          row({
            id: 2,
            submitted_by: "b.two@united-signals.com",
            customer: "B",
            goals_next_week: "1. x\n2. y",
          }),
        ])
      );

      expect(heaviest).toBeNull();
    });

    it("says nothing when nobody carries more than one", () => {
      const { heaviest } = planExceptions(
        build([
          row({ id: 1, submitted_by: "a.one@united-signals.com", customer: "A" }),
          row({ id: 2, submitted_by: "b.two@united-signals.com", customer: "B" }),
        ])
      );

      expect(heaviest).toBeNull();
    });

    it("counts a person's plus-addressed submissions as one person", () => {
      const { heaviest } = planExceptions(
        build([
          row({
            id: 1,
            submitted_by: "david.siegel@united-signals.com",
            customer: "PROAKTIVA",
            goals_next_week: "1. a\n2. b",
          }),
          row({
            id: 2,
            submitted_by: "david.siegel+vbk@united-signals.com",
            customer: "Volksbank Kraichgau",
            goals_next_week: "1. c\n2. d",
          }),
          row({
            id: 3,
            submitted_by: "other.person@united-signals.com",
            customer: "FLOWNIQ",
            goals_next_week: "1. e\n2. f",
          }),
        ])
      );

      expect(heaviest?.owner).toBe("David Siegel");
      expect(heaviest?.commitments).toBe(4);
      expect(heaviest?.engagements).toBe(2);
    });
  });

  describe("who is furthest behind", () => {
    it("names the owner holding the most engagements that will miss", () => {
      const { mostBehind } = planExceptions(
        build([
          row({
            id: 1,
            submitted_by: "raunaq.inam@united-signals.com",
            customer: "FIDUS",
            target_date: "2026-05-31",
            estimated_completion_date: "2026-10-23",
          }),
          row({
            id: 2,
            submitted_by: "raunaq.inam@united-signals.com",
            customer: "FIVV",
            target_date: "2026-09-30",
            estimated_completion_date: "2026-10-31",
          }),
          row({
            id: 3,
            submitted_by: "david.siegel@united-signals.com",
            customer: "PROAKTIVA",
            target_date: "2026-10-16",
            estimated_completion_date: "2026-10-16",
          }),
        ])
      );

      expect(mostBehind?.owner).toBe("Raunaq Inam");
      expect(mostBehind?.commitments).toBe(2);
    });
  });

  it("has nothing to say about a clean week", () => {
    const result = planExceptions(
      build([
        row({
          id: 1,
          submitted_by: "a.one@united-signals.com",
          customer: "A",
          target_date: "2026-11-01",
          estimated_completion_date: "2026-11-01",
        }),
      ])
    );

    expect(result.silent).toEqual([]);
    expect(result.heaviest).toBeNull();
    expect(result.mostBehind).toBeNull();
    expect(result.any).toBe(false);
  });
});
