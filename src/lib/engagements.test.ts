import {
  cleanText,
  isTestRow,
  scheduleState,
  toEngagement,
  toEngagements,
  summarise,
  severity,
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

  describe("scheduleState", () => {
    it("is late once the committed date has passed", () => {
      expect(scheduleState(new Date(2026, 8, 30), 31, TODAY)).toBe("late");
      // past its release even though the estimate holds
      expect(scheduleState(new Date(2026, 8, 30), 0, TODAY)).toBe("late");
    });

    it("is watch while the release is ahead but the estimate overruns", () => {
      expect(scheduleState(new Date(2026, 10, 30), 15, TODAY)).toBe("watch");
    });

    it("is fine when the estimate lands on or before the release", () => {
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
      expect(e.state).toBe("late");
    });

    it("does not confuse slip with the stored target_diff", () => {
      // identical dates, so no slip, but filed a month before the release
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
      expect(e.sinceRelease).toEqual({
        direction: "remaining",
        label: "Time left",
        text: "1 month 3 days",
      });
    });

    it("counts the days since the agreed release as of today, apart from the estimate", () => {
      const e = toEngagement(
        row({
          target_date: "2026-05-31",
          estimated_completion_date: "2026-10-23",
          project_on_track: true,
        }),
        TODAY
      );

      // 129 days have passed since the release; the estimate lands 145 after
      // it. The first is a fact, the second is the owner's forecast.
      expect(e.overdueDays).toBe(129);
      expect(e.daysToRelease).toBe(-129);
      expect(e.slipDays).toBe(145);
    });

    it("reads on track as a view of the estimate, not of the release", () => {
      // Past the release and flagged on track: the owner expects to hit their
      // own revised date. That is consistent, so it carries no warning.
      const onTrack = toEngagement(
        row({
          target_date: "2026-05-31",
          estimated_completion_date: "2026-10-23",
          project_on_track: true,
        }),
        TODAY
      );
      const offTrack = toEngagement(
        row({
          target_date: "2026-09-08",
          estimated_completion_date: "2026-10-13",
          project_on_track: false,
        }),
        TODAY
      );

      expect(onTrack.ownerSaysOnTrack).toBe(true);
      expect(offTrack.ownerSaysOnTrack).toBe(false);
      expect(summarise([onTrack, offTrack]).offTrack).toBe(1);
    });

    it("counts down to a release still ahead", () => {
      const e = toEngagement(
        row({ target_date: "2026-11-30", estimated_completion_date: "2026-12-15" }),
        TODAY
      );

      expect(e.daysToRelease).toBe(54);
      expect(e.overdueDays).toBeNull();
    });

    it("treats a placeholder risks field as nothing recorded", () => {
      const e = toEngagement(row({ risks: "-", goals_next_week: "--" }), TODAY);

      expect(e.risks).toBeNull();
      expect(e.goals).toBeNull();
    });

    it("carries no schedule at all for rows filed before the columns existed", () => {
      const e = toEngagement(row(), TODAY);

      expect(e.release).toBeNull();
      expect(e.estimate).toBeNull();
      expect(e.slipDays).toBeNull();
      expect(e.state).toBe("unknown");
      expect(e.daysToRelease).toBeNull();
      expect(e.overdueDays).toBeNull();
      expect(showDate(e.release)).toBe("—");
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

    it("puts the longest overdue first, then overruns still ahead of their release", () => {
      expect(toEngagements(week39, TODAY).map((e) => e.customer)).toEqual([
        "FIDUS Finanz AG", // 129 days past its release
        "Test API", // 29 days past its release
        "Volksbank Kraichgau", // release ahead, estimate 15 days after it
        "UBS", // on schedule
      ]);
    });

    it("orders late engagements by days overdue, not by the estimate", () => {
      // B passed its release longer ago but expects to finish sooner after it.
      const ordered = toEngagements(
        [
          row({ id: 1, customer: "A", target_date: "2026-10-02", estimated_completion_date: "2026-10-27" }),
          row({ id: 2, customer: "B", target_date: "2026-09-29", estimated_completion_date: "2026-10-22" }),
        ],
        TODAY
      );

      expect(ordered.map((e) => e.customer)).toEqual(["B", "A"]);
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
        scheduled: 2,
        behindSchedule: 1,
        offTrack: 0,
      });
    });
  });

  describe("severity", () => {
    it("measures a late engagement by days overdue", () => {
      const e = toEngagement(
        row({ target_date: "2026-09-29", estimated_completion_date: "2026-12-30" }),
        TODAY
      );

      expect(e.overdueDays).toBe(8);
      expect(severity(e)).toBe(1);
    });

    it("measures one still ahead of its release by the estimate's overrun", () => {
      const e = toEngagement(
        row({ target_date: "2026-11-30", estimated_completion_date: "2026-12-15" }),
        TODAY
      );

      expect(severity(e)).toBe(2);
    });
  });
});

describe("summarise counts what can be compared", () => {
  it("counts only engagements that recorded a schedule", () => {
    // Week 38's rows predate the schedule columns entirely: nothing is late
    // because nothing was recorded, which is not the same as being on time.
    const engagements = toEngagements(
      [
        row({ id: 1, customer: "No dates" }),
        row({
          id: 2,
          customer: "FIDUS",
          target_date: "2026-05-31",
          estimated_completion_date: "2026-10-23",
        }),
      ],
      new Date(2026, 9, 7)
    );

    const totals = summarise(engagements);

    expect(totals.engagements).toBe(2);
    expect(totals.scheduled).toBe(1);
    expect(totals.behindSchedule).toBe(1);
  });

  it("reports no schedules at all for a week that recorded none", () => {
    const engagements = toEngagements(
      [row({ id: 1, customer: "A" }), row({ id: 2, customer: "B" })],
      new Date(2026, 9, 7)
    );

    expect(summarise(engagements).scheduled).toBe(0);
  });
});
