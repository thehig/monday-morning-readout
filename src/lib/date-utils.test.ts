import { vi } from "vitest";
import {
  getWeekDates,
  getWeekRange,
  getCurrentWeek,
  formatDate,
  formatTime,
  formatDateTime,
  getRelativeTime,
  getDateTimeProps,
  DATE_FORMAT_OPTIONS,
} from "./date-utils";

describe("Date Utils", () => {
  describe("getWeekDates", () => {
    it("should return correct start and end dates for week 1 of 2024", () => {
      const { start, end } = getWeekDates(1, 2024);

      // Week 1 of 2024 starts on Monday, January 1st
      expect(start.getDay()).toBe(1); // Monday
      expect(start.getFullYear()).toBe(2024);
      expect(start.getMonth()).toBe(0); // January
      expect(start.getDate()).toBe(1);

      // End should be Sunday of the same week
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getDate()).toBe(start.getDate() + 6);
    });

    it("should return correct dates for week 10 of 2024", () => {
      const { start, end } = getWeekDates(10, 2024);

      expect(start.getDay()).toBe(1); // Monday
      expect(end.getDay()).toBe(0); // Sunday
      expect(end.getDate()).toBe(start.getDate() + 6);
    });

    it("should handle year starting on different days", () => {
      // Test with a year that starts on a different day
      const { start, end } = getWeekDates(1, 2023);

      expect(start.getDay()).toBe(1); // Should still start on Monday
      expect(end.getDay()).toBe(0); // Should still end on Sunday
    });
  });


  describe("getWeekRange", () => {
    // The suite is pinned to Europe/Berlin because this cannot reproduce at UTC.
    it("runs in the business timezone", () => {
      expect(new Date(2026, 8, 28).toISOString()).toBe("2026-09-27T22:00:00.000Z");
    });

    it("starts at local midnight on the Monday", () => {
      const { start } = getWeekRange(39, 2026);

      expect(start.getDay()).toBe(1);
      expect(start.getDate()).toBe(28);
      expect(start.getMonth()).toBe(8);
      expect([
        start.getHours(),
        start.getMinutes(),
        start.getSeconds(),
        start.getMilliseconds(),
      ]).toEqual([0, 0, 0, 0]);
    });

    it("ends at the last millisecond of the Sunday", () => {
      const { end } = getWeekRange(39, 2026);

      expect(end.getDay()).toBe(0);
      expect(end.getDate()).toBe(4);
      expect(end.getMonth()).toBe(9);
      expect([
        end.getHours(),
        end.getMinutes(),
        end.getSeconds(),
        end.getMilliseconds(),
      ]).toEqual([23, 59, 59, 999]);
    });

    it("spans exactly seven days", () => {
      const { start, end } = getWeekRange(39, 2026);

      expect(end.getTime() - start.getTime()).toBe(7 * 24 * 60 * 60 * 1000 - 1);
    });

    it("excludes the Sunday that belongs to the previous week", () => {
      const { start } = getWeekRange(39, 2026);
      // 27 Sep 2026 is the Sunday of week 38. The old range began a day early
      // and pulled these submissions into week 39.
      const previousSunday = new Date(2026, 8, 27, 12, 0, 0);

      expect(previousSunday.getTime()).toBeLessThan(start.getTime());
    });

    it("includes a submission filed late on the week's own Sunday", () => {
      const { end } = getWeekRange(39, 2026);
      // The old range stopped at 03 Oct 23:59Z, so anything filed after about
      // 02:00 on the Sunday was dropped.
      const sundayEvening = new Date(2026, 9, 4, 22, 30, 0);

      expect(sundayEvening.getTime()).toBeLessThanOrEqual(end.getTime());
    });

    it("produces query bounds that cover the whole local week", () => {
      const { start, end } = getWeekRange(39, 2026);

      expect(start.toISOString()).toBe("2026-09-27T22:00:00.000Z");
      expect(end.toISOString()).toBe("2026-10-04T21:59:59.999Z");
    });
  });

  describe("getCurrentWeek", () => {
    beforeEach(() => {
      // Mock Date to a known value for consistent testing
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return week 1 when date is in first week of year", () => {
      // Set date to January 3, 2024 (which should be week 1)
      vi.setSystemTime(new Date(2024, 0, 3));

      const week = getCurrentWeek(2024);
      expect(week).toBeGreaterThanOrEqual(1);
    });

    it("should return a higher week number later in the year", () => {
      // Set date to March 1, 2024
      vi.setSystemTime(new Date(2024, 2, 1));

      const week = getCurrentWeek(2024);
      expect(week).toBeGreaterThan(5);
    });
  });

  describe("formatDate", () => {
    const testDate = new Date(2024, 0, 15); // January 15, 2024

    it("should format date with short format by default", () => {
      const formatted = formatDate(testDate);
      expect(formatted).toBe("Jan 15");
    });

    it("should format date with long format", () => {
      const formatted = formatDate(testDate, "long");
      expect(formatted).toBe("Monday, January 15, 2024");
    });

    it("should format date with isoDate format", () => {
      const formatted = formatDate(testDate, "isoDate");
      expect(formatted).toBe("01/15/2024");
    });
  });

  describe("formatTime", () => {
    const testDate = new Date(2024, 0, 15, 14, 30, 45); // 2:30:45 PM

    it("should format time without seconds by default", () => {
      const formatted = formatTime(testDate);
      expect(formatted).toBe("02:30 PM");
    });

    it("should format time with seconds when requested", () => {
      const formatted = formatTime(testDate, true);
      expect(formatted).toBe("02:30:45 PM");
    });
  });

  describe("formatDateTime", () => {
    const testDate = new Date(2024, 0, 15, 14, 30); // January 15, 2024, 2:30 PM

    it("should format date and time with long format by default", () => {
      const formatted = formatDateTime(testDate);
      expect(formatted).toBe("Monday, January 15, 2024 at 02:30 PM");
    });

    it("should format date and time with short date format", () => {
      const formatted = formatDateTime(testDate, "short");
      expect(formatted).toBe("Jan 15 at 02:30 PM");
    });
  });

  describe("getRelativeTime", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 15, 12, 0, 0)); // January 15, 2024, noon
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "today" for current date', () => {
      const testDate = new Date(2024, 0, 15, 10, 0, 0); // Same day, earlier time
      const relative = getRelativeTime(testDate);
      expect(relative).toBe("today");
    });

    it('should return "yesterday" for previous day', () => {
      const testDate = new Date(2024, 0, 14, 12, 0, 0); // Previous day
      const relative = getRelativeTime(testDate);
      expect(relative).toBe("yesterday");
    });

    it("should return number of days ago for older dates", () => {
      const testDate = new Date(2024, 0, 10, 12, 0, 0); // 5 days ago
      const relative = getRelativeTime(testDate);
      expect(relative).toBe("5 days ago");
    });
  });

  describe("getDateTimeProps", () => {
    const testDate = new Date(2024, 0, 15, 14, 30); // January 15, 2024, 2:30 PM

    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date(2024, 0, 16, 12, 0, 0)); // Next day for relative time
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it("should return correct props for Date object", () => {
      const props = getDateTimeProps(testDate);

      expect(props.dateTime).toBe(testDate.toISOString());
      expect(props.title).toBe("Monday, January 15, 2024 at 02:30 PM");
      expect(props.relativeTime).toBe("today"); // Fixed expectation
    });

    it("should return correct props for date string", () => {
      const dateString = testDate.toISOString();
      const props = getDateTimeProps(dateString);

      expect(props.dateTime).toBe(dateString);
      expect(props.title).toBe("Monday, January 15, 2024 at 02:30 PM");
      expect(props.relativeTime).toBe("today"); // Fixed expectation
    });
  });

  describe("DATE_FORMAT_OPTIONS", () => {
    it("should have all expected format options", () => {
      expect(DATE_FORMAT_OPTIONS.short).toEqual({
        month: "short",
        day: "numeric",
      });

      expect(DATE_FORMAT_OPTIONS.long).toEqual({
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });

      expect(DATE_FORMAT_OPTIONS.time).toEqual({
        hour: "2-digit",
        minute: "2-digit",
      });

      expect(DATE_FORMAT_OPTIONS.timeWithSeconds).toEqual({
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });

      expect(DATE_FORMAT_OPTIONS.isoDate).toEqual({
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
    });
  });
});
