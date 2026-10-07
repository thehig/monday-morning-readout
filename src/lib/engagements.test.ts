import {
  cleanText,
  isTestRow,
  parseCommitments,
  scheduleState,
  toEngagement,
  toEngagements,
  summarise,
  groupByOwner,
  showDate,
} from "./engagements";
import type { POFeedback } from "../types/feedback";

const TODAY = new Date(2026, 9, 7); // 7 Oct 2026, the week 39 readout

function row(over: Partial<POFeedback> = {}): POFeedback {
  return {
    id: 1,
    created_at: "2026-10-02T14:42:39.211804+00:00",
    submitted_by: "adwait.sompura@united-signals.com",
    progress_percent: 5,
    team_happiness: 4,
    customer_happiness: 4,
    velocity_next_week: "Grün",
    customer: "Suissebank OLB & Crypto",
    ...over,
  } as POFeedback;
}

describe("engagements", () => {
  describe("isTestRow", () => {
    it("drops the submissions used to exercise the form", () => {
      expect(isTestRow("Test 1 Ignore")).toBe(true);
      expect(isTestRow("Test 4 Ignore")).toBe(true);
      expect(isTestRow("  test 2 ignore ")).toBe(true);
      expect(isTestRow("SB Test Dummy Data")).toBe(true);
      expect(isTestRow("test, please ignore")).toBe(true);
    });

    it("keeps real customers whose name merely contains the word", () => {
      expect(isTestRow("Test API")).toBe(false);
      expect(isTestRow("Contest Bank")).toBe(false);
    });

    it("treats a missing customer as unusable", () => {
      expect(isTestRow(null)).toBe(true);
      expect(isTestRow("")).toBe(true);
    });
  });

  describe("cleanText", () => {
    it("reads a lone dash as nothing written", () => {
      expect(cleanText("-")).toBeNull();
      expect(cleanText("--")).toBeNull();
      expect(cleanText(" — ")).toBeNull();
      expect(cleanText("   ")).toBeNull();
      expect(cleanText(null)).toBeNull();
    });

    it("keeps real text, including text that merely starts with a dash", () => {
      expect(cleanText("keine")).toBe("keine");
      expect(cleanText("- Cycle 5 started on Tuesday")).toBe(
        "- Cycle 5 started on Tuesday"
      );
    });
  });

  describe("parseCommitments", () => {
    it("splits a bulleted list", () => {
      expect(
        parseCommitments(
          "- Start the shared wallet address fix\n- Hand over the specs\n- Close open SB items"
        )
      ).toEqual([
        "Start the shared wallet address fix",
        "Hand over the specs",
        "Close open SB items",
      ]);
    });

    it("splits a numbered list", () => {
      expect(
        parseCommitments("1. Implementation of joint account feedback\n2. Clarify open points")
      ).toEqual([
        "Implementation of joint account feedback",
        "Clarify open points",
      ]);
    });

    it("keeps a single sentence as one commitment", () => {
      expect(parseCommitments("Waiting for client feedback")).toEqual([
        "Waiting for client feedback",
      ]);
    });

    it("reads a placeholder as nothing committed", () => {
      expect(parseCommitments("-")).toEqual([]);
      expect(parseCommitments("--")).toEqual([]);
      expect(parseCommitments("")).toEqual([]);
      expect(parseCommitments(null)).toEqual([]);
      expect(parseCommitments(undefined)).toEqual([]);
    });
  });

  describe("scheduleState", () => {
    it("is late once the committed date has passed", () => {
      expect(scheduleState(new Date(2026, 8, 30), 31, TODAY)).toBe("late");
      // past its deadline even though the estimate holds
      expect(scheduleState(new Date(2026, 8, 30), 0, TODAY)).toBe("late");
    });

    it("is watch while the deadline is ahead but the estimate overruns", () => {
      expect(scheduleState(new Date(2026, 10, 30), 15, TODAY)).toBe("watch");
    });

    it("is fine when the estimate lands on or before the deadline", () => {
      expect(scheduleState(new Date(2026, 10, 5), 0, TODAY)).toBe("fine");
      expect(scheduleState(new Date(2026, 10, 5), -3, TODAY)).toBe("fine");
    });

    it("is unknown without dates", () => {
      expect(scheduleState(null, null, TODAY)).toBe("unknown");
      expect(scheduleState(new Date(2026, 10, 5), null, TODAY)).toBe("unknown");
    });
  });

  describe("toEngagement", () => {
    it("derives slip from the two date columns", () => {
      const e = toEngagement(
        row({ target_date: "2026-09-30", estimated_completion_date: "2026-10-31" }),
        TODAY
      );

      expect(e.slipDays).toBe(31);
      expect(e.landsInDays).toBe(24);
      expect(e.landingWeek).toBe(43);
      expect(e.state).toBe("late");
    });

    it("does not confuse slip with the stored target_diff", () => {
      // identical dates, so no slip, but filed a month before the deadline
      const e = toEngagement(
        row({
          target_date: "2026-11-05",
          estimated_completion_date: "2026-11-05",
          target_diff: { years: 0, months: -1, days: -3 },
        }),
        TODAY
      );

      expect(e.slipDays).toBe(0);
      expect(e.state).toBe("fine");
      expect(e.sinceDeadline).toEqual({
        direction: "remaining",
        label: "Time left",
        text: "1 month 3 days",
      });
    });

    it("flags an owner who claims a deadline their estimate has passed", () => {
      const e = toEngagement(
        row({
          target_date: "2026-05-31",
          estimated_completion_date: "2026-10-23",
          project_on_track: true,
        }),
        TODAY
      );

      expect(e.slipDays).toBe(145);
      expect(e.contradicts).toBe(true);
    });

    it("does not flag an owner who agrees the deadline will be missed", () => {
      const e = toEngagement(
        row({
          target_date: "2026-09-08",
          estimated_completion_date: "2026-10-13",
          project_on_track: false,
        }),
        TODAY
      );

      expect(e.slipDays).toBe(35);
      expect(e.contradicts).toBe(false);
    });

    it("treats a placeholder risks field as nothing recorded", () => {
      const e = toEngagement(row({ risks: "-", goals_next_week: "--" }), TODAY);

      expect(e.risks).toBeNull();
      expect(e.goals).toBeNull();
    });

    it("carries no schedule at all for rows filed before the columns existed", () => {
      const e = toEngagement(row(), TODAY);

      expect(e.deadline).toBeNull();
      expect(e.estimate).toBeNull();
      expect(e.slipDays).toBeNull();
      expect(e.landingWeek).toBeNull();
      expect(e.state).toBe("unknown");
      expect(e.contradicts).toBe(false);
      expect(showDate(e.deadline)).toBe("—");
    });

    it("shows the stored velocity in English without changing it", () => {
      expect(toEngagement(row({ velocity_next_week: "Grün" }), TODAY).velocityLabel)
        .toBe("High velocity expected");
      expect(toEngagement(row({ velocity_next_week: "Gelb" }), TODAY).velocityLabel)
        .toBe("Medium velocity expected");
      expect(toEngagement(row({ velocity_next_week: "Rot" }), TODAY).velocityLabel)
        .toBe("Low velocity expected");
      expect(toEngagement(row({ velocity_next_week: "Rot" }), TODAY).velocity)
        .toBe("Rot");
    });

    it("reads the German PS call answer", () => {
      expect(toEngagement(row({ ps_call_needed: "NEIN" }), TODAY).psCallRequested).toBe(false);
      expect(toEngagement(row({ ps_call_needed: "NEIN" }), TODAY).psCallAnswer).toBe("Not requested");
      expect(toEngagement(row({ ps_call_needed: "JA" }), TODAY).psCallRequested).toBe(true);
      expect(toEngagement(row({ ps_call_needed: "JA" }), TODAY).psCallAnswer).toBe("Requested");
      expect(toEngagement(row(), TODAY).psCallAnswer).toBe("Not reported");
    });

    it("formats the owner and the amount for display", () => {
      const e = toEngagement(row({ amount_charged: "0" }), TODAY);

      expect(e.owner).toBe("Adwait Sompura");
      expect(e.ownerEmail).toBe("adwait.sompura@united-signals.com");
      expect(e.amountCharged).toBe("€0.00");
    });
  });

  describe("toEngagements", () => {
    const week39 = [
      row({ id: 337, customer: "Test API", submitted_by: "finnegan.fischer@united-signals.com",
            target_date: "2026-09-08", estimated_completion_date: "2026-10-13", project_on_track: false }),
      row({ id: 338, customer: "FIDUS Finanz AG", submitted_by: "raunaq.inam@united-signals.com",
            target_date: "2026-05-31", estimated_completion_date: "2026-10-23", project_on_track: true }),
      row({ id: 344, customer: "UBS", submitted_by: "gautam.katakkar@united-signals.com",
            target_date: "2026-11-05", estimated_completion_date: "2026-11-05" }),
      row({ id: 343, customer: "Volksbank Kraichgau", submitted_by: "david.siegel+vbk@united-signals.com",
            target_date: "2026-11-30", estimated_completion_date: "2026-12-15", project_on_track: false }),
      row({ id: 350, customer: "Test 4 Ignore", submitted_by: "finnegan.fischer+4@united-signals.com" }),
    ];

    it("drops test submissions", () => {
      const result = toEngagements(week39, TODAY);

      expect(result).toHaveLength(4);
      expect(result.map((e) => e.customer)).not.toContain("Test 4 Ignore");
    });

    it("puts the worst schedule first and the biggest overrun ahead of it", () => {
      expect(toEngagements(week39, TODAY).map((e) => e.customer)).toEqual([
        "FIDUS Finanz AG", // late, 145 days
        "Test API", // late, 35 days
        "Volksbank Kraichgau", // watch, deadline still ahead
        "UBS", // fine
      ]);
    });

    it("survives an empty or missing week", () => {
      expect(toEngagements([], TODAY)).toEqual([]);
      expect(toEngagements(undefined, TODAY)).toEqual([]);
    });
  });

  describe("summarise", () => {
    it("counts what the readout opens with", () => {
      const engagements = toEngagements(
        [
          row({ id: 1, customer: "A", target_date: "2026-05-31", estimated_completion_date: "2026-10-23",
                project_on_track: true, goals_next_week: "- one\n- two" }),
          row({ id: 2, customer: "B", submitted_by: "x@united-signals.com",
                target_date: "2026-11-05", estimated_completion_date: "2026-11-05",
                goals_next_week: "just the one" }),
        ],
        TODAY
      );

      expect(summarise(engagements)).toEqual({
        engagements: 2,
        needingDecision: 1,
        contradicting: 1,
        commitments: 3,
        owners: 2,
        slipDaysTotal: 145,
      });
    });
  });

  describe("groupByOwner", () => {
    it("groups by address and leads with the busiest owner", () => {
      const groups = groupByOwner(
        toEngagements(
          [
            row({ id: 1, customer: "A", submitted_by: "david.siegel@x.com", goals_next_week: "- one" }),
            row({ id: 2, customer: "B", submitted_by: "david.siegel@x.com", goals_next_week: "- two\n- three" }),
            row({ id: 3, customer: "C", submitted_by: "adwait.sompura@x.com", goals_next_week: "- four" }),
          ],
          TODAY
        )
      );

      expect(groups).toHaveLength(2);
      expect(groups[0].owner).toBe("David Siegel");
      expect(groups[0].engagements).toHaveLength(2);
      expect(groups[0].commitments).toBe(3);
      expect(groups[1].owner).toBe("Adwait Sompura");
    });
  });
});
