import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { FeedbackList } from "./FeedbackList";
import type { POFeedback } from "../../../types/feedback";

// Mock the FeedbackCard component
vi.mock("../cards/FeedbackCard", () => ({
  FeedbackCard: ({
    feedback,
    currentWeek,
  }: {
    feedback: POFeedback;
    currentWeek: number;
  }) => (
    <div data-testid={`feedback-card-${feedback.id}`}>
      FeedbackCard - {feedback.customer} - Week {currentWeek}
    </div>
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

const mockFeedback: POFeedback[] = [
  {
    id: "feedback-1",
    customer: "Customer A",
    submitted_by: "user1@test.com",
    created_at: "2024-01-15T10:00:00Z",
    week_number: 10,
    velocity_next_week: "Grün",
    progress_percent: 75,
    team_happiness: 4.5,
    customer_happiness: 3.8,
    milestones_done: "Milestone 1",
    risks: "Risk 1",
    goals_next_week: "Goal 1",
    ps_call_status: "Status 1",
  },
  {
    id: "feedback-2",
    customer: "Customer B",
    submitted_by: "user2@test.com",
    created_at: "2024-01-16T11:00:00Z",
    week_number: 10,
    velocity_next_week: "Gelb",
    progress_percent: 60,
    team_happiness: 3.5,
    customer_happiness: 4.2,
    milestones_done: "Milestone 2",
    risks: "Risk 2",
    goals_next_week: "Goal 2",
    ps_call_status: "Status 2",
  },
  {
    id: "feedback-3",
    customer: "Customer C",
    submitted_by: "user3@test.com",
    created_at: "2024-01-17T12:00:00Z",
    week_number: 10,
    velocity_next_week: "Rot",
    progress_percent: 40,
    team_happiness: 2.5,
    customer_happiness: 3.0,
    milestones_done: "Milestone 3",
    risks: "Risk 3",
    goals_next_week: "Goal 3",
    ps_call_status: "Status 3",
  },
];

function renderWithRouter(ui: React.ReactElement) {
  return render(<BrowserRouter>{ui}</BrowserRouter>);
}

describe("FeedbackList", () => {
  describe("Basic Rendering", () => {
    it("renders all feedback items", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      expect(
        screen.getByTestId("feedback-card-feedback-1")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("feedback-card-feedback-2")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("feedback-card-feedback-3")
      ).toBeInTheDocument();
    });

    it("passes correct props to FeedbackCard components", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={15} />
      );

      expect(
        screen.getByText("FeedbackCard - Customer A - Week 15")
      ).toBeInTheDocument();
      expect(
        screen.getByText("FeedbackCard - Customer B - Week 15")
      ).toBeInTheDocument();
      expect(
        screen.getByText("FeedbackCard - Customer C - Week 15")
      ).toBeInTheDocument();
    });

    it("renders with empty feedback array", () => {
      renderWithRouter(<FeedbackList feedback={[]} currentWeek={10} />);

      // Should render the container but no feedback cards
      const container = document.querySelector(".grid");
      expect(container).toBeInTheDocument();
      expect(screen.queryByTestId(/feedback-card-/)).not.toBeInTheDocument();
    });

    it("applies correct grid layout classes", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      const container = screen.getByTestId(
        "feedback-card-feedback-1"
      ).parentElement;
      expect(container).toHaveClass(
        "grid",
        "grid-cols-1",
        "gap-4",
        "md:grid-cols-2",
        "lg:grid-cols-3"
      );
    });
  });

  describe("Single Item Rendering", () => {
    it("renders single feedback item correctly", () => {
      const singleFeedback = [mockFeedback[0]];
      renderWithRouter(
        <FeedbackList feedback={singleFeedback} currentWeek={10} />
      );

      expect(
        screen.getByTestId("feedback-card-feedback-1")
      ).toBeInTheDocument();
      expect(
        screen.getByText("FeedbackCard - Customer A - Week 10")
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("feedback-card-feedback-2")
      ).not.toBeInTheDocument();
    });

    it("handles feedback with minimal data", () => {
      const minimalFeedback: POFeedback[] = [
        {
          id: "minimal-1",
          customer: "",
          submitted_by: "minimal@test.com",
          created_at: "2024-01-15T10:00:00Z",
          week_number: 5,
          velocity_next_week: "Grün",
          progress_percent: 0,
          team_happiness: 1,
          customer_happiness: 1,
        },
      ];

      renderWithRouter(
        <FeedbackList feedback={minimalFeedback} currentWeek={5} />
      );

      expect(screen.getByTestId("feedback-card-minimal-1")).toBeInTheDocument();
      expect(screen.getByText(/FeedbackCard -\s*- Week 5/)).toBeInTheDocument();
    });
  });

  describe("Multiple Items Rendering", () => {
    it("renders all items with correct keys", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      // Check that all unique feedback items are rendered
      mockFeedback.forEach((feedback) => {
        expect(
          screen.getByTestId(`feedback-card-${feedback.id}`)
        ).toBeInTheDocument();
      });
    });

    it("maintains order of feedback items", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      const cards = screen.getAllByTestId(/feedback-card-/);
      expect(cards).toHaveLength(3);
      expect(cards[0]).toHaveAttribute(
        "data-testid",
        "feedback-card-feedback-1"
      );
      expect(cards[1]).toHaveAttribute(
        "data-testid",
        "feedback-card-feedback-2"
      );
      expect(cards[2]).toHaveAttribute(
        "data-testid",
        "feedback-card-feedback-3"
      );
    });

    it("handles large number of feedback items", () => {
      const largeFeedbackList: POFeedback[] = Array.from(
        { length: 20 },
        (_, index) => ({
          id: `feedback-${index + 1}`,
          customer: `Customer ${index + 1}`,
          submitted_by: `user${index + 1}@test.com`,
          created_at: "2024-01-15T10:00:00Z",
          week_number: 10,
          velocity_next_week: "Grün",
          progress_percent: 50,
          team_happiness: 3,
          customer_happiness: 3,
        })
      );

      renderWithRouter(
        <FeedbackList feedback={largeFeedbackList} currentWeek={10} />
      );

      // Check that all 20 items are rendered
      largeFeedbackList.forEach((feedback) => {
        expect(
          screen.getByTestId(`feedback-card-${feedback.id}`)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Week Parameter Handling", () => {
    it("passes different week values correctly", () => {
      const { rerender } = renderWithRouter(
        <FeedbackList feedback={[mockFeedback[0]]} currentWeek={1} />
      );

      expect(
        screen.getByText("FeedbackCard - Customer A - Week 1")
      ).toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <FeedbackList feedback={[mockFeedback[0]]} currentWeek={52} />
        </BrowserRouter>
      );

      expect(
        screen.getByText("FeedbackCard - Customer A - Week 52")
      ).toBeInTheDocument();
      expect(
        screen.queryByText("FeedbackCard - Customer A - Week 1")
      ).not.toBeInTheDocument();
    });

    it("handles edge case week values", () => {
      renderWithRouter(
        <FeedbackList feedback={[mockFeedback[0]]} currentWeek={0} />
      );

      expect(
        screen.getByText("FeedbackCard - Customer A - Week 0")
      ).toBeInTheDocument();
    });

    it("handles negative week values", () => {
      renderWithRouter(
        <FeedbackList feedback={[mockFeedback[0]]} currentWeek={-1} />
      );

      expect(
        screen.getByText("FeedbackCard - Customer A - Week -1")
      ).toBeInTheDocument();
    });
  });

  describe("Layout and Styling", () => {
    it("applies responsive grid classes correctly", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      const container = screen.getByTestId(
        "feedback-card-feedback-1"
      ).parentElement;
      expect(container).toHaveClass("grid");
      expect(container).toHaveClass("grid-cols-1"); // Mobile
      expect(container).toHaveClass("md:grid-cols-2"); // Tablet
      expect(container).toHaveClass("lg:grid-cols-3"); // Desktop
      expect(container).toHaveClass("gap-4");
    });

    it("maintains consistent gap spacing", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      const container = screen.getByTestId(
        "feedback-card-feedback-1"
      ).parentElement;
      expect(container).toHaveClass("gap-4");
    });
  });

  describe("Accessibility", () => {
    it("renders semantic structure for screen readers", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      // The grid container should be properly structured
      const container = screen.getByTestId(
        "feedback-card-feedback-1"
      ).parentElement;
      expect(container).toBeInTheDocument();
    });

    it("provides meaningful content for each feedback item", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      // Each mocked FeedbackCard should have meaningful content
      expect(
        screen.getByText("FeedbackCard - Customer A - Week 10")
      ).toBeInTheDocument();
      expect(
        screen.getByText("FeedbackCard - Customer B - Week 10")
      ).toBeInTheDocument();
      expect(
        screen.getByText("FeedbackCard - Customer C - Week 10")
      ).toBeInTheDocument();
    });
  });

  describe("Performance Considerations", () => {
    it("uses correct key prop for efficient rendering", () => {
      renderWithRouter(
        <FeedbackList feedback={mockFeedback} currentWeek={10} />
      );

      // The component should render each item with a unique key (feedback.id)
      // This is implicitly tested by checking that all items render correctly
      mockFeedback.forEach((feedback) => {
        expect(
          screen.getByTestId(`feedback-card-${feedback.id}`)
        ).toBeInTheDocument();
      });
    });

    it("rerenders correctly when feedback list changes", () => {
      const initialFeedback = [mockFeedback[0]];
      const updatedFeedback = [mockFeedback[0], mockFeedback[1]];

      const { rerender } = renderWithRouter(
        <FeedbackList feedback={initialFeedback} currentWeek={10} />
      );

      expect(
        screen.getByTestId("feedback-card-feedback-1")
      ).toBeInTheDocument();
      expect(
        screen.queryByTestId("feedback-card-feedback-2")
      ).not.toBeInTheDocument();

      rerender(
        <BrowserRouter>
          <FeedbackList feedback={updatedFeedback} currentWeek={10} />
        </BrowserRouter>
      );

      expect(
        screen.getByTestId("feedback-card-feedback-1")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("feedback-card-feedback-2")
      ).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles feedback with duplicate IDs gracefully", () => {
      const duplicateFeedback: POFeedback[] = [
        { ...mockFeedback[0] },
        { ...mockFeedback[0] }, // Same ID
      ];

      // Mock console.warn since React will warn about duplicate keys
      const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

      renderWithRouter(
        <FeedbackList feedback={duplicateFeedback} currentWeek={10} />
      );

      // Should still render both items (React will show a warning about duplicate keys)
      const cards = screen.getAllByTestId("feedback-card-feedback-1");
      expect(cards).toHaveLength(2);

      warnSpy.mockRestore();
    });

    it("handles feedback with special characters in customer names", () => {
      const specialCharFeedback: POFeedback[] = [
        {
          ...mockFeedback[0],
          id: "special-1",
          customer: "Cømpäny & Co. Ltd. (Ñew York)",
        },
      ];

      renderWithRouter(
        <FeedbackList feedback={specialCharFeedback} currentWeek={10} />
      );

      expect(screen.getByTestId("feedback-card-special-1")).toBeInTheDocument();
      expect(
        screen.getByText(
          "FeedbackCard - Cømpäny & Co. Ltd. (Ñew York) - Week 10"
        )
      ).toBeInTheDocument();
    });

    it("handles very long customer names", () => {
      const longNameFeedback: POFeedback[] = [
        {
          ...mockFeedback[0],
          id: "long-1",
          customer:
            "This is a very long customer name that might cause layout issues if not handled properly in the UI components",
        },
      ];

      renderWithRouter(
        <FeedbackList feedback={longNameFeedback} currentWeek={10} />
      );

      expect(screen.getByTestId("feedback-card-long-1")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("integrates properly with parent components", () => {
      renderWithRouter(
        <div data-testid="parent-container">
          <FeedbackList feedback={mockFeedback} currentWeek={10} />
        </div>
      );

      const parentContainer = screen.getByTestId("parent-container");
      const feedbackList = screen.getByTestId(
        "feedback-card-feedback-1"
      ).parentElement;

      expect(parentContainer).toContainElement(feedbackList);
    });

    it("works correctly when feedback prop is updated", () => {
      const initialFeedback = mockFeedback.slice(0, 2);
      const updatedFeedback = mockFeedback;

      const { rerender } = renderWithRouter(
        <FeedbackList feedback={initialFeedback} currentWeek={10} />
      );

      expect(screen.getAllByTestId(/feedback-card-/)).toHaveLength(2);

      rerender(
        <BrowserRouter>
          <FeedbackList feedback={updatedFeedback} currentWeek={10} />
        </BrowserRouter>
      );

      expect(screen.getAllByTestId(/feedback-card-/)).toHaveLength(3);
    });
  });
});
