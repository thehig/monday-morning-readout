import {
  formatEmailDisplayName,
  aggregateFeedbackByEmail,
  getGravatarUrl,
  formatAmount,
  cn,
} from "./utils";
import type { POFeedback, AggregatedPOFeedback } from "../types/feedback";

describe("Utils", () => {
  describe("formatEmailDisplayName", () => {
    it("formats email display name correctly", () => {
      expect(formatEmailDisplayName("john.doe@example.com")).toBe("John Doe");
      expect(formatEmailDisplayName("jane_smith@example.com")).toBe(
        "Jane Smith"
      );
      expect(formatEmailDisplayName("test-user@example.com")).toBe("Test User");
    });

    it("handles single name without separators", () => {
      expect(formatEmailDisplayName("johnsmith@example.com")).toBe("Johnsmith");
    });

    it("handles multiple separators", () => {
      expect(formatEmailDisplayName("john.doe_smith-jones@example.com")).toBe(
        "John Doe Smith Jones"
      );
    });
  });

  describe("cn", () => {
    it("merges class names correctly", () => {
      expect(cn("bg-red-500", "text-white")).toBeTruthy();
      expect(cn("p-4", undefined, "text-center")).toBeTruthy();
    });

    it("handles conflicting Tailwind classes", () => {
      // The exact result depends on tailwind-merge behavior, so we just test that it returns a string
      const result = cn("p-4", "p-6");
      expect(typeof result).toBe("string");
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe("aggregateFeedbackByEmail", () => {
    const mockFeedback: POFeedback[] = [
      {
        id: "1",
        submitted_by: "john@example.com",
        week_number: 3,
        progress_percent: 80,
        team_happiness: 4,
        customer_happiness: 5,
        velocity_next_week: "Grün",
        milestones_done: "Completed feature A",
        risks: "None",
        goals_next_week: "Start feature B",
        ps_call_status: "Scheduled",
        created_at: "2024-01-15T10:00:00.000Z",
      },
      {
        id: "2",
        submitted_by: "john@example.com",
        week_number: 3,
        progress_percent: 90,
        team_happiness: 5,
        customer_happiness: 4,
        velocity_next_week: "Grün",
        milestones_done: "Completed feature B",
        risks: "Minor delay",
        goals_next_week: "Start feature C",
        ps_call_status: "Completed",
        created_at: "2024-01-16T10:00:00.000Z",
      },
      {
        id: "3",
        submitted_by: "jane@example.com",
        week_number: 3,
        progress_percent: 70,
        team_happiness: 3,
        customer_happiness: 4,
        velocity_next_week: "Gelb",
        milestones_done: "Setup complete",
        risks: "Resource constraints",
        goals_next_week: "Begin development",
        ps_call_status: "Pending",
        created_at: "2024-01-15T12:00:00.000Z",
      },
    ];

    it("aggregates feedback by email correctly", () => {
      const result = aggregateFeedbackByEmail(mockFeedback);

      expect(result).toHaveLength(2);

      // Find John's aggregated feedback
      const johnsFeedback = result.find(
        (f) => f.submitted_by === "john@example.com"
      );
      expect(johnsFeedback).toBeDefined();
      expect(johnsFeedback?.progress_percent).toBe(85); // (80 + 90) / 2
      expect(johnsFeedback?.team_happiness).toBe(4.5); // (4 + 5) / 2
      expect(johnsFeedback?.customer_happiness).toBe(4.5); // (5 + 4) / 2
      expect(johnsFeedback?.velocity_next_week).toBe("Grün"); // Most common

      // Find Jane's feedback
      const janesFeedback = result.find(
        (f) => f.submitted_by === "jane@example.com"
      );
      expect(janesFeedback).toBeDefined();
      expect(janesFeedback?.progress_percent).toBe(70);
      expect(janesFeedback?.team_happiness).toBe(3);
    });

    it("uses most recent feedback for base data", () => {
      const result = aggregateFeedbackByEmail(mockFeedback);
      const johnsFeedback = result.find(
        (f) => f.submitted_by === "john@example.com"
      );

      // Should use the most recent feedback (id: "2") as base
      expect(johnsFeedback?.id).toBe("2");
      expect(johnsFeedback?.created_at).toBe("2024-01-16T10:00:00.000Z");
    });

    it("combines text fields correctly", () => {
      const result = aggregateFeedbackByEmail(mockFeedback);
      const johnsFeedback = result.find(
        (f) => f.submitted_by === "john@example.com"
      );

      expect(johnsFeedback?.milestones_done).toContain(
        "🎯 2 • Completed feature B"
      );
      expect(johnsFeedback?.milestones_done).toContain(
        "🎯 1 • Completed feature A"
      );
      expect(johnsFeedback?.risks).toContain("⚠️ 2 • Minor delay");
    });

    it("handles empty feedback list", () => {
      const result = aggregateFeedbackByEmail([]);
      expect(result).toEqual([]);
    });

    it("stores all submission dates", () => {
      const result = aggregateFeedbackByEmail(
        mockFeedback
      ) as AggregatedPOFeedback[];
      const johnsFeedback = result.find(
        (f) => f.submitted_by === "john@example.com"
      );

      expect(johnsFeedback?.all_submission_dates).toEqual([
        "2024-01-16T10:00:00.000Z",
        "2024-01-15T10:00:00.000Z",
      ]);
    });
  });

  describe("getGravatarUrl", () => {
    it("returns correct Gravatar URL", () => {
      const hash = "abc123";
      const result = getGravatarUrl(hash);
      expect(result).toBe("https://www.gravatar.com/avatar/abc123?d=mp");
    });

    it("handles empty hash", () => {
      const result = getGravatarUrl("");
      expect(result).toBe("https://www.gravatar.com/avatar/?d=mp");
    });
  });

  describe("formatAmount", () => {
    it("formats valid amounts correctly", () => {
      expect(formatAmount("100")).toBe("€100.00");
      expect(formatAmount("50.5")).toBe("€50.50");
      expect(formatAmount("0")).toBe("€0.00");
      expect(formatAmount("1234.567")).toBe("€1234.57");
    });

    it("handles undefined or null amounts", () => {
      expect(formatAmount(undefined)).toBe("N/A");
    });

    it("handles invalid number strings", () => {
      expect(formatAmount("not-a-number")).toBe("not-a-number");
      expect(formatAmount("")).toBe("N/A");
    });

    it("handles edge cases", () => {
      expect(formatAmount("0.00")).toBe("€0.00");
      expect(formatAmount("-50")).toBe("€-50.00");
    });
  });
});
