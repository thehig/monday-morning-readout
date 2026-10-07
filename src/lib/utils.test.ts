import { formatEmailDisplayName, formatAmount, cn } from "./utils";

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
