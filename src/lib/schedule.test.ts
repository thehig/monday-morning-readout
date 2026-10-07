import {
  parseTargetDiff,
  describeTargetDiff,
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

});
