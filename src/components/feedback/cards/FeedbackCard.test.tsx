import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FeedbackCard } from "./FeedbackCard";
import type { POFeedback } from "../../../types/feedback";

// Mock the indicator components
vi.mock("../../indicators", () => ({
  Thermometer: ({ value }: { value: number }) => (
    <div data-testid="thermometer">Progress: {value}%</div>
  ),
  HappinessIndicator: ({ value, type }: { value: number; type: string }) => (
    <div data-testid={`happiness-${type}`}>
      {type === "team" ? "Team" : "Customer"} Happiness: {value}
    </div>
  ),
  VelocityIndicator: ({ velocity }: { velocity: string }) => (
    <div data-testid="velocity">Velocity: {velocity}</div>
  ),
}));

// Mock framer-motion
vi.mock("framer-motion", () => ({
  motion: {
    div: ({
      children,
      className,
      ...props
    }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
}));

const mockFeedback: POFeedback = {
  id: "test-123",
  customer: "Acme Corp",
  submitted_by: "john.doe@example.com",
  created_at: "2024-01-15T10:00:00Z",
  week_number: 10,
  velocity_next_week: "Grün",
  progress_percent: 75,
  team_happiness: 4.5,
  customer_happiness: 3.8,
  milestones_done: "Completed user authentication",
  risks: "Database migration pending",
  goals_next_week: "Deploy to staging",
  ps_call_status: "Scheduled for Friday",
};

const defaultProps = {
  feedback: mockFeedback,
  currentWeek: 10,
};

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("FeedbackCard", () => {
  describe("Basic Rendering", () => {
    it("renders customer name and email correctly", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      expect(screen.getByText("Customer: Acme Corp")).toBeInTheDocument();
      expect(screen.getByText("John Doe")).toBeInTheDocument(); // Formatted email
    });

    it("renders creation date", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      // Date should be formatted as locale string
      expect(screen.getByText("1/15/2024")).toBeInTheDocument();
    });

    it("renders all indicator components", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      expect(screen.getByTestId("thermometer")).toBeInTheDocument();
      expect(screen.getByTestId("happiness-team")).toBeInTheDocument();
      expect(screen.getByTestId("happiness-customer")).toBeInTheDocument();
      expect(screen.getByTestId("velocity")).toBeInTheDocument();
    });

    it("passes correct values to indicator components", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      expect(screen.getByText("Progress: 75%")).toBeInTheDocument();
      expect(screen.getByText("Team Happiness: 4.5")).toBeInTheDocument();
      expect(screen.getByText("Customer Happiness: 3.8")).toBeInTheDocument();
      expect(screen.getByText("Velocity: Grün")).toBeInTheDocument();
    });
  });

  describe("Customer Name Handling", () => {
    it("displays 'Unknown Customer' when customer is null", () => {
      const feedbackWithoutCustomer = {
        ...mockFeedback,
        customer: null as POFeedback["customer"],
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithoutCustomer} currentWeek={10} />
      );

      expect(
        screen.getByText("Customer: Unknown Customer")
      ).toBeInTheDocument();
    });

    it("displays 'Unknown Customer' when customer is undefined", () => {
      const feedbackWithoutCustomer = {
        ...mockFeedback,
        customer: undefined,
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithoutCustomer} currentWeek={10} />
      );

      expect(
        screen.getByText("Customer: Unknown Customer")
      ).toBeInTheDocument();
    });

    it("displays 'Unknown Customer' when customer is empty string", () => {
      const feedbackWithEmptyCustomer = {
        ...mockFeedback,
        customer: "",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithEmptyCustomer} currentWeek={10} />
      );

      expect(
        screen.getByText("Customer: Unknown Customer")
      ).toBeInTheDocument();
    });

    it("displays actual customer name when provided", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      expect(screen.getByText("Customer: Acme Corp")).toBeInTheDocument();
    });
  });

  describe("Email Formatting", () => {
    it("formats simple email correctly", () => {
      const feedbackWithSimpleEmail = {
        ...mockFeedback,
        submitted_by: "jane.smith@company.com",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithSimpleEmail} currentWeek={10} />
      );

      expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    });

    it("formats email with underscores correctly", () => {
      const feedbackWithUnderscoreEmail = {
        ...mockFeedback,
        submitted_by: "first_last@example.com",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithUnderscoreEmail} currentWeek={10} />
      );

      expect(screen.getByText("First Last")).toBeInTheDocument();
    });

    it("formats email with hyphens correctly", () => {
      const feedbackWithHyphenEmail = {
        ...mockFeedback,
        submitted_by: "mary-jane@test.com",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithHyphenEmail} currentWeek={10} />
      );

      expect(screen.getByText("Mary Jane")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("creates correct link to feedback detail page", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/feedback/test-123?week=10");
    });

    it("updates link with different week parameter", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} currentWeek={15} />);

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/feedback/test-123?week=15");
    });

    it("updates link with different feedback ID", () => {
      const differentFeedback = {
        ...mockFeedback,
        id: "different-456",
      };

      renderWithRouter(
        <FeedbackCard feedback={differentFeedback} currentWeek={10} />
      );

      const link = screen.getByRole("link");
      expect(link).toHaveAttribute("href", "/feedback/different-456?week=10");
    });
  });

  describe("Visual Structure", () => {
    it("applies correct CSS classes for card structure", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const cardElement = screen.getByRole("link").closest(".feedback-card");
      expect(cardElement).toHaveClass(
        "bg-white",
        "rounded-xl",
        "shadow-sm",
        "border",
        "border-gray-100"
      );
    });

    it("applies header styling correctly", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const header = screen.getByText("Customer: Acme Corp").closest("div");
      expect(header?.parentElement).toHaveClass("bg-[#1a1a4b]", "p-4");
    });

    it("applies customer title styling", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const customerTitle = screen.getByText("Customer: Acme Corp");
      expect(customerTitle).toHaveClass(
        "font-medium",
        "text-[#ff7f00]",
        "m-0",
        "truncate"
      );
    });

    it("applies email styling", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const emailText = screen.getByText("John Doe");
      expect(emailText).toHaveClass(
        "text-sm",
        "text-gray-300",
        "m-0",
        "truncate"
      );
    });
  });

  describe("Accessibility", () => {
    it("provides title attribute for customer name", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const customerTitle = screen.getByText("Customer: Acme Corp");
      expect(customerTitle).toHaveAttribute("title", "Customer: Acme Corp");
    });

    it("provides title attribute for email", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const emailElement = screen.getByText("John Doe");
      expect(emailElement).toHaveAttribute("title", "john.doe@example.com");
    });

    it("has proper link structure for screen readers", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
      expect(link).toHaveClass("block", "h-full");
    });

    it("maintains semantic heading structure", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const heading = screen.getByText("Customer: Acme Corp");
      expect(heading.tagName).toBe("H3");
    });
  });

  describe("Layout Structure", () => {
    it("renders grid layout for happiness indicators", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const container = screen.getByTestId("happiness-team").closest(".grid");
      expect(container).toHaveClass("grid", "grid-cols-2", "gap-8");
    });

    it("centers happiness indicators", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const teamContainer = screen.getByTestId("happiness-team").parentElement;
      const customerContainer =
        screen.getByTestId("happiness-customer").parentElement;

      expect(teamContainer).toHaveClass("flex", "flex-col", "items-center");
      expect(customerContainer).toHaveClass("flex", "flex-col", "items-center");
    });

    it("positions velocity indicator correctly", () => {
      renderWithRouter(<FeedbackCard {...defaultProps} />);

      const velocityIndicator = screen.getByTestId("velocity");
      const headerContainer = velocityIndicator.closest(".bg-\\[\\#1a1a4b\\]");
      expect(headerContainer).toHaveClass(
        "flex",
        "items-center",
        "justify-between"
      );
    });
  });

  describe("Date Handling", () => {
    it("formats different date formats correctly", () => {
      const feedbackWithDifferentDate = {
        ...mockFeedback,
        created_at: "2024-12-25T15:30:00Z",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithDifferentDate} currentWeek={10} />
      );

      expect(screen.getByText("12/25/2024")).toBeInTheDocument();
    });

    it("handles invalid date gracefully", () => {
      const feedbackWithInvalidDate = {
        ...mockFeedback,
        created_at: "invalid-date",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithInvalidDate} currentWeek={10} />
      );

      // Should not crash, but might show "Invalid Date"
      const dateElement = screen.getByText("Invalid Date");
      expect(dateElement).toBeInTheDocument();
    });
  });

  describe("Content Truncation", () => {
    it("applies truncation to long customer names", () => {
      const feedbackWithLongCustomer = {
        ...mockFeedback,
        customer: "This is a very long customer name that should be truncated",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithLongCustomer} currentWeek={10} />
      );

      const customerTitle = screen.getByText(
        "Customer: This is a very long customer name that should be truncated"
      );
      expect(customerTitle).toHaveClass("truncate");
    });

    it("applies truncation to long email addresses", () => {
      const feedbackWithLongEmail = {
        ...mockFeedback,
        submitted_by:
          "very.long.email.address.that.should.truncate@company.com",
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackWithLongEmail} currentWeek={10} />
      );

      const emailElement = screen.getByText(
        "Very Long Email Address That Should Truncate"
      );
      expect(emailElement).toHaveClass("truncate");
    });
  });

  describe("Component Integration", () => {
    it("renders multiple feedback cards with different data", () => {
      const feedback1 = { ...mockFeedback, id: "1", customer: "Customer 1" };
      const feedback2 = { ...mockFeedback, id: "2", customer: "Customer 2" };

      renderWithRouter(
        <div>
          <FeedbackCard feedback={feedback1} currentWeek={10} />
          <FeedbackCard feedback={feedback2} currentWeek={10} />
        </div>
      );

      expect(screen.getByText("Customer: Customer 1")).toBeInTheDocument();
      expect(screen.getByText("Customer: Customer 2")).toBeInTheDocument();
    });

    it("handles different velocity states", () => {
      const feedbackRed = {
        ...mockFeedback,
        velocity_next_week: "Rot" as const,
      };
      const feedbackYellow = {
        ...mockFeedback,
        velocity_next_week: "Gelb" as const,
      };

      const { rerender } = renderWithRouter(
        <FeedbackCard feedback={feedbackRed} currentWeek={10} />
      );

      expect(screen.getByText("Velocity: Rot")).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <FeedbackCard feedback={feedbackYellow} currentWeek={10} />
        </BrowserRouter>
      );

      expect(screen.getByText("Velocity: Gelb")).toBeInTheDocument();
    });

    it("handles different happiness values", () => {
      const feedbackLowHappiness = {
        ...mockFeedback,
        team_happiness: 1.5,
        customer_happiness: 2.0,
      };

      renderWithRouter(
        <FeedbackCard feedback={feedbackLowHappiness} currentWeek={10} />
      );

      expect(screen.getByText("Team Happiness: 1.5")).toBeInTheDocument();
      expect(screen.getByText("Customer Happiness: 2")).toBeInTheDocument();
    });
  });
});
