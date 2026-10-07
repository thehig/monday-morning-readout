import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { TechnicalDetails } from "./TechnicalDetails";

// Mock the date-utils functions
vi.mock("../../../lib/date-utils", () => ({
  formatTime: vi.fn((_date: Date, includeSeconds?: boolean) => {
    return includeSeconds ? "10:30:45" : "10:30";
  }),
  formatDate: vi.fn((_date: Date, format: string) => {
    if (format === "isoDate") return "2024-01-15";
    return "January 15, 2024";
  }),
}));

// Mock the Heroicons component
vi.mock("@heroicons/react/24/outline", () => ({
  InformationCircleIcon: ({ className }: { className: string }) => (
    <div data-testid="info-icon" className={className}>
      ℹ️
    </div>
  ),
}));

const baseProps = {
  id: "feedback-123",
  week: 10,
  submissionDate: new Date("2024-01-15T10:30:45Z"),
  createdAt: "2024-01-15T10:30:45.123Z",
  submittedBy: "user@example.com",
  relativeTime: "2 hours ago",
};

describe("TechnicalDetails", () => {
  describe("Single Feedback Rendering", () => {
    it("renders basic technical details for single feedback", () => {
      render(<TechnicalDetails {...baseProps} />);

      expect(screen.getByText("Technical Details")).toBeInTheDocument();
      expect(screen.getByText("System Information")).toBeInTheDocument();
      expect(screen.getByText("feedback-123")).toBeInTheDocument();
      expect(screen.getByText("10")).toBeInTheDocument();
      expect(screen.getByText("user@example.com")).toBeInTheDocument();
      expect(screen.getByText("Last updated: 2 hours ago")).toBeInTheDocument();
    });

    it("displays correct field labels for single feedback", () => {
      render(<TechnicalDetails {...baseProps} />);

      expect(screen.getByText("Feedback ID")).toBeInTheDocument();
      expect(screen.getByText("Calendar Week")).toBeInTheDocument();
      expect(screen.getByText("Submission Time")).toBeInTheDocument();
      expect(screen.getByText("Submission Date")).toBeInTheDocument();
      expect(screen.getByText("Raw Timestamp")).toBeInTheDocument();
      expect(screen.getByText("Submitter Email")).toBeInTheDocument();
    });

    it("displays formatted time and date correctly", () => {
      render(<TechnicalDetails {...baseProps} />);

      expect(screen.getByText("10:30:45")).toBeInTheDocument(); // formatTime with seconds
      expect(screen.getByText("2024-01-15")).toBeInTheDocument(); // formatDate
      expect(screen.getByText("2024-01-15T10:30:45.123Z")).toBeInTheDocument(); // raw timestamp
    });

    it("applies correct styling classes", () => {
      render(<TechnicalDetails {...baseProps} />);

      const container = screen
        .getByText("Technical Details")
        .closest("div")?.parentElement;
      expect(container).toHaveClass(
        "mt-8",
        "pt-6",
        "border-t",
        "border-gray-100"
      );

      const grid = screen.getByText("Feedback ID").closest(".grid");
      expect(grid).toHaveClass(
        "grid",
        "grid-cols-2",
        "md:grid-cols-3",
        "gap-4",
        "text-sm"
      );
    });

    it("truncates long email addresses with title attribute", () => {
      const longEmailProps = {
        ...baseProps,
        submittedBy:
          "very.long.email.address.that.should.be.truncated@company.example.com",
      };

      render(<TechnicalDetails {...longEmailProps} />);

      const emailElement = screen.getByText(
        "very.long.email.address.that.should.be.truncated@company.example.com"
      );
      expect(emailElement).toHaveClass("truncate");
      expect(emailElement).toHaveAttribute(
        "title",
        "very.long.email.address.that.should.be.truncated@company.example.com"
      );
    });
  });

  describe("Edge Cases", () => {
    it("handles week number 0", () => {
      const weekZeroProps = { ...baseProps, week: 0 };
      render(<TechnicalDetails {...weekZeroProps} />);

      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("handles negative week number", () => {
      const negativeWeekProps = { ...baseProps, week: -1 };
      render(<TechnicalDetails {...negativeWeekProps} />);

      expect(screen.getByText("-1")).toBeInTheDocument();
    });

    it("handles very large week number", () => {
      const largeWeekProps = { ...baseProps, week: 999 };
      render(<TechnicalDetails {...largeWeekProps} />);

      expect(screen.getByText("999")).toBeInTheDocument();
    });
  });

  describe("Visual Structure", () => {
    it("applies correct header styling", () => {
      render(<TechnicalDetails {...baseProps} />);

      const header = screen.getByText("Technical Details").parentElement;
      expect(header).toHaveClass(
        "flex",
        "items-center",
        "justify-between",
        "mb-4"
      );

      const title = screen.getByText("Technical Details");
      expect(title).toHaveClass("text-sm", "font-medium", "text-gray-500");

      const subtitle = screen.getByText("System Information");
      expect(subtitle).toHaveClass("text-xs", "text-gray-400");
    });

    it("applies correct field styling", () => {
      render(<TechnicalDetails {...baseProps} />);

      const label = screen.getByText("Feedback ID");
      expect(label).toHaveClass("text-xs", "text-gray-400");

      const value = screen.getByText(/feedback-123/);
      expect(value).toHaveClass("font-mono", "text-gray-600");

      const container = label.closest(".space-y-1");
      expect(container).toHaveClass("space-y-1");
    });

    it("applies correct footer styling", () => {
      render(<TechnicalDetails {...baseProps} />);

      const footer = screen.getByText(
        "Last updated: 2 hours ago"
      ).parentElement;
      expect(footer).toHaveClass(
        "mt-6",
        "flex",
        "items-center",
        "gap-2",
        "text-xs",
        "text-gray-400"
      );

      const icon = screen.getByText(
        "Last updated: 2 hours ago"
      ).previousSibling;
      expect(icon).toHaveClass("w-4", "h-4");
    });
  });

  describe("Accessibility", () => {
    it("provides semantic structure with proper headings", () => {
      render(<TechnicalDetails {...baseProps} />);

      const heading = screen.getByText("Technical Details");
      expect(heading.tagName).toBe("H2");
    });

    it("provides title attributes for truncated content", () => {
      render(<TechnicalDetails {...baseProps} />);

      const emailElement = screen.getByText("user@example.com");
      expect(emailElement).toHaveAttribute("title", "user@example.com");
    });

    it("uses proper semantic roles for information", () => {
      render(<TechnicalDetails {...baseProps} />);

      // Information icon should be present for context
      const icon = screen.getByText(
        "Last updated: 2 hours ago"
      ).previousSibling;
      expect(icon).toBeInTheDocument();
    });

    it("maintains readable contrast with color choices", () => {
      render(<TechnicalDetails {...baseProps} />);

      const labels = screen.getByText("Feedback ID");
      expect(labels).toHaveClass("text-gray-400");

      const values = screen.getByText(/feedback-123/);
      expect(values).toHaveClass("text-gray-600");
    });
  });

  describe("Content Validation", () => {
    it("displays all required fields", () => {
      render(<TechnicalDetails {...baseProps} />);

      const requiredFields = [
        "Technical Details",
        "Feedback ID",
        "Calendar Week",
        "Submission Time",
        "Submission Date",
        "Raw Timestamp",
        "Submitter Email",
      ];

      requiredFields.forEach((field) => {
        expect(screen.getByText(field)).toBeInTheDocument();
      });
    });

    it("shows font-mono styling for technical values", () => {
      render(<TechnicalDetails {...baseProps} />);

      const technicalValues = [
        screen.getByText(/feedback-123/),
        screen.getByText("10"),
        screen.getByText("10:30:45"),
        screen.getByText("2024-01-15"),
        screen.getByText("2024-01-15T10:30:45.123Z"),
        screen.getByText("user@example.com"),
      ];

      technicalValues.forEach((value) => {
        expect(value).toHaveClass("font-mono");
      });
    });
  });

  describe("Responsive Design", () => {
    it("applies responsive grid classes", () => {
      render(<TechnicalDetails {...baseProps} />);

      const grid = screen.getByText("Feedback ID").closest(".grid");
      expect(grid).toHaveClass("grid-cols-2", "md:grid-cols-3");
    });

    it("maintains proper spacing across breakpoints", () => {
      render(<TechnicalDetails {...baseProps} />);

      const grid = screen.getByText("Feedback ID").closest(".grid");
      expect(grid).toHaveClass("gap-4");
    });
  });

  describe("Date and Time Formatting", () => {
    it("displays formatted time correctly", () => {
      render(<TechnicalDetails {...baseProps} />);

      // The mock returns "10:30:45" for formatTime
      expect(screen.getByText("10:30:45")).toBeInTheDocument();
    });

    it("displays formatted date correctly", () => {
      render(<TechnicalDetails {...baseProps} />);

      // The mock returns "2024-01-15" for formatDate
      expect(screen.getByText("2024-01-15")).toBeInTheDocument();
    });

    it("displays raw timestamp correctly", () => {
      render(<TechnicalDetails {...baseProps} />);

      expect(screen.getByText("2024-01-15T10:30:45.123Z")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("integrates properly with parent components", () => {
      render(
        <div data-testid="parent-container">
          <TechnicalDetails {...baseProps} />
        </div>
      );

      const parentContainer = screen.getByTestId("parent-container");
      const technicalDetails = screen
        .getByText("Technical Details")
        .closest("div");

      expect(parentContainer).toContainElement(technicalDetails);
    });

    it("handles props updates correctly", () => {
      const { rerender } = render(<TechnicalDetails {...baseProps} />);

      expect(screen.getByText("feedback-123")).toBeInTheDocument();

      rerender(<TechnicalDetails {...baseProps} id="feedback-456" week={20} />);

      expect(screen.getByText("feedback-456")).toBeInTheDocument();
      expect(screen.getByText("20")).toBeInTheDocument();
      expect(screen.queryByText("feedback-123")).not.toBeInTheDocument();
    });
  });
});
