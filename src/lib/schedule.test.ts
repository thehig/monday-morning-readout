import {
  parseTargetDiff,
  describeTargetDiff,
  formatScheduleDate,
  describeOnTrack,
  getScheduleSummary,
} from "./schedule";

describe("schedule", () => {
  describe("parseTargetDiff", () => {
    it("reads the object the database returns", () => {
      expect(parseTargetDiff({ years: 0, months: -1, days: -23 })).toEqual({
        years: 0,
        months: -1,
        days: -23,
      });
    });

    it("reads a JSON string", () => {
      expect(parseTargetDiff('{"years":0,"months":1,"days":6}')).toEqual({
        years: 0,
        months: 1,
        days: 6,
      });
    });

    it("returns null when the column is empty", () => {
      expect(parseTargetDiff(null)).toBeNull();
      expect(parseTargetDiff(undefined)).toBeNull();
    });

    it("returns null for values that are not a diff", () => {
      expect(parseTargetDiff("not json")).toBeNull();
      expect(parseTargetDiff("[1,2,3]")).toBeNull();
      expect(parseTargetDiff([])).toBeNull();
      expect(parseTargetDiff(42)).toBeNull();
      expect(parseTargetDiff({})).toBeNull();
      expect(parseTargetDiff({ weeks: 2 })).toBeNull();
    });

    it("fills in missing units and ignores unusable ones", () => {
      expect(parseTargetDiff({ days: 5 })).toEqual({
        years: 0,
        months: 0,
        days: 5,
      });
      expect(parseTargetDiff({ months: "3", days: null })).toEqual({
        years: 0,
        months: 3,
        days: 0,
      });
      expect(parseTargetDiff({ months: "abc", days: 2 })).toEqual({
        years: 0,
        months: 0,
        days: 2,
      });
    });
  });

  describe("describeTargetDiff", () => {
    it("reads a negative diff as time left", () => {
      expect(describeTargetDiff({ years: 0, months: -1, days: -23 })).toEqual({
        direction: "remaining",
        label: "Time left",
        text: "1 month 23 days",
      });
    });

    it("reads a positive diff as overdue", () => {
      expect(describeTargetDiff({ years: 0, months: 1, days: 6 })).toEqual({
        direction: "overdue",
        label: "Overdue by",
        text: "1 month 6 days",
      });
    });

    it("singularises a single unit", () => {
      expect(describeTargetDiff({ years: 0, months: 0, days: 1 })?.text).toBe(
        "1 day"
      );
      expect(describeTargetDiff({ years: 1, months: 0, days: 0 })?.text).toBe(
        "1 year"
      );
    });

    it("omits zero units", () => {
      expect(describeTargetDiff({ years: 0, months: 0, days: 23 })?.text).toBe(
        "23 days"
      );
      expect(describeTargetDiff({ years: 1, months: 0, days: 2 })?.text).toBe(
        "1 year 2 days"
      );
    });

    it("treats an all-zero diff as due today", () => {
      expect(describeTargetDiff({ years: 0, months: 0, days: 0 })).toEqual({
        direction: "due",
        label: "Due",
        text: "today",
      });
    });

    it("takes direction from the largest non-zero unit when signs disagree", () => {
      const summary = describeTargetDiff({ years: 0, months: 2, days: -3 });
      expect(summary?.direction).toBe("overdue");
      expect(summary?.text).toBe("2 months 3 days");
    });

    it("returns null when there is nothing to describe", () => {
      expect(describeTargetDiff(null)).toBeNull();
      expect(describeTargetDiff(undefined)).toBeNull();
      expect(describeTargetDiff("broken")).toBeNull();
    });
  });

  describe("formatScheduleDate", () => {
    it("formats a yyyy-MM-dd column", () => {
      expect(formatScheduleDate("2026-09-30")).toBe("Sep 30, 2026");
    });

    it("does not shift the day across the timezone boundary", () => {
      expect(formatScheduleDate("2026-01-01")).toBe("Jan 1, 2026");
    });

    it("returns null for empty or malformed values", () => {
      expect(formatScheduleDate(null)).toBeNull();
      expect(formatScheduleDate(undefined)).toBeNull();
      expect(formatScheduleDate("")).toBeNull();
      expect(formatScheduleDate("30-09-2026")).toBeNull();
      expect(formatScheduleDate("2026-02-31")).toBeNull();
      expect(formatScheduleDate(20260930)).toBeNull();
    });
  });

  describe("describeOnTrack", () => {
    it("states both outcomes", () => {
      expect(describeOnTrack(true)).toBe(
        "Project is on track to meet the deadline"
      );
      expect(describeOnTrack(false)).toBe(
        "Project is not on track to meet the deadline"
      );
    });

    it("returns null when the column is empty", () => {
      expect(describeOnTrack(null)).toBeNull();
      expect(describeOnTrack(undefined)).toBeNull();
      expect(describeOnTrack("true")).toBeNull();
    });
  });

  describe("getScheduleSummary", () => {
    it("reports nothing for feedback submitted before these fields existed", () => {
      const summary = getScheduleSummary({});

      expect(summary.hasAny).toBe(false);
      expect(summary.deadline).toBeNull();
      expect(summary.estimatedCompletion).toBeNull();
      expect(summary.diff).toBeNull();
      expect(summary.onTrack).toBeNull();
      expect(summary.onTrackText).toBeNull();
      expect(summary.delayReason).toBeNull();
    });

    it("reports nothing when every column is null", () => {
      expect(
        getScheduleSummary({
          target_date: null,
          estimated_completion_date: null,
          target_diff: null,
          project_on_track: null,
          delay_reason: null,
        }).hasAny
      ).toBe(false);
    });

    it("summarises a fully populated row", () => {
      const summary = getScheduleSummary({
        target_date: "2026-09-08",
        estimated_completion_date: "2026-10-13",
        target_diff: { years: 0, months: 0, days: 23 },
        project_on_track: false,
        delay_reason: "Testumgebung instabil",
      });

      expect(summary.hasAny).toBe(true);
      expect(summary.deadline).toBe("Sep 8, 2026");
      expect(summary.estimatedCompletion).toBe("Oct 13, 2026");
      expect(summary.diff).toEqual({
        direction: "overdue",
        label: "Overdue by",
        text: "23 days",
      });
      expect(summary.onTrack).toBe(false);
      expect(summary.onTrackText).toBe(
        "Project is not on track to meet the deadline"
      );
      expect(summary.delayReason).toBe("Testumgebung instabil");
    });

    it("reports a partially populated row", () => {
      const summary = getScheduleSummary({ target_date: "2026-11-05" });

      expect(summary.hasAny).toBe(true);
      expect(summary.deadline).toBe("Nov 5, 2026");
      expect(summary.diff).toBeNull();
      expect(summary.onTrackText).toBeNull();
    });

    it("treats a blank delay reason as absent", () => {
      expect(getScheduleSummary({ delay_reason: "   " }).delayReason).toBeNull();
      expect(getScheduleSummary({ delay_reason: "   " }).hasAny).toBe(false);
    });

    it("counts on_track false as present", () => {
      expect(getScheduleSummary({ project_on_track: false }).hasAny).toBe(true);
    });
  });
});
