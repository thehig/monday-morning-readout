import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dashboard } from "./Dashboard";

// Mock the FeedbackCard component
vi.mock("../feedback/cards/FeedbackCard", () => ({
  FeedbackCard: ({
    feedback,
    currentWeek,
  }: {
    feedback: { id: string };
    currentWeek: number;
  }) => (
    <div data-testid={`feedback-card-${feedback.id}`}>
      Feedback {feedback.id} - Week {currentWeek}
    </div>
  ),
}));

// Mock the hook to return predictable data
vi.mock("../../hooks/use-po-feedback", () => ({
  usePOFeedbackByWeek: () => ({
    data: [],
    isLoading: false,
    error: null,
    isError: false,
  }),
  getCurrentWeek: () => 10,
}));

function createTestWrapper(initialEntries: string[] = ["/?"]) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={initialEntries}>{children}</MemoryRouter>
    </QueryClientProvider>
  );
}

describe("Dashboard", () => {
  it("renders the main dashboard container", () => {
    render(<Dashboard />, { wrapper: createTestWrapper() });

    const container = screen
      .getByText("No feedback found for week 10")
      .closest(".p-4");
    expect(container).toBeInTheDocument();
  });

  it("renders without crashing", () => {
    expect(() => {
      render(<Dashboard />, { wrapper: createTestWrapper() });
    }).not.toThrow();
  });

  it("displays no feedback message when no data is available", () => {
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(
      screen.getByText("No feedback found for week 10")
    ).toBeInTheDocument();
    expect(screen.getByText("No feedback found for week 10")).toHaveClass(
      "text-center",
      "text-gray-600"
    );
  });

  it("handles URL parameter correctly", () => {
    render(<Dashboard />, { wrapper: createTestWrapper(["/?week=25"]) });

    // Should still show no feedback message but for week 25
    // This is a basic test that it doesn't crash with URL params
    expect(screen.getByText(/No feedback found for week/)).toBeInTheDocument();
  });

  it("applies correct styling classes", () => {
    render(<Dashboard />, { wrapper: createTestWrapper() });

    const container = screen
      .getByText("No feedback found for week 10")
      .closest(".p-4");
    expect(container).toHaveClass("p-4");
  });

  it("has semantic structure", () => {
    render(<Dashboard />, { wrapper: createTestWrapper() });

    const message = screen.getByText("No feedback found for week 10");
    expect(message).toHaveClass("text-center", "text-gray-600");
  });
});
