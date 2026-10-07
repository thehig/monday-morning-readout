import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dashboard } from "./Dashboard";

// Mock the Wall's grid so these tests stay about the Dashboard's own wiring
vi.mock("../readout/wall/RankedGrid", () => ({
  RankedGrid: ({
    engagements,
    currentWeek,
  }: {
    engagements: { id: number }[];
    currentWeek: number;
  }) => (
    <div data-testid="ranked-grid" data-week={currentWeek}>
      {engagements.length} engagements
    </div>
  ),
}));

const mockRows = vi.hoisted(() => ({ current: [] as unknown[], loading: false }));

vi.mock("../../hooks/use-po-feedback", () => ({
  usePOFeedbackByWeek: () => ({
    data: mockRows.current,
    isLoading: mockRows.loading,
    error: null,
    isError: false,
  }),
}));

vi.mock("../../lib/date-utils", async () => ({
  ...(await vi.importActual<typeof import("../../lib/date-utils")>(
    "../../lib/date-utils"
  )),
  getPreviousWeek: () => 24,
}));

function row(over: Record<string, unknown> = {}) {
  return {
    id: 1,
    created_at: "2026-10-02T14:42:39Z",
    submitted_by: "adwait.sompura@united-signals.com",
    progress_percent: 5,
    team_happiness: 4,
    customer_happiness: 4,
    velocity_next_week: "Grün",
    customer: "Suissebank",
    ...over,
  };
}

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
  beforeEach(() => {
    mockRows.current = [];
    mockRows.loading = false;
  });

  it("renders without crashing", () => {
    expect(() => {
      render(<Dashboard />, { wrapper: createTestWrapper() });
    }).not.toThrow();
  });

  it("falls back to the previous week when the URL has no week", () => {
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(screen.getByTestId("ranked-grid")).toHaveAttribute("data-week", "24");
  });

  it("takes the week from the URL when it is given", () => {
    render(<Dashboard />, { wrapper: createTestWrapper(["/?week=25"]) });

    expect(screen.getByTestId("ranked-grid")).toHaveAttribute("data-week", "25");
  });

  it("shows a loading line rather than an empty board", () => {
    mockRows.loading = true;
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(screen.getByText(/Loading week 24/)).toBeInTheDocument();
    expect(screen.queryByTestId("ranked-grid")).not.toBeInTheDocument();
  });

  it("drops test submissions before handing rows to the grid", () => {
    mockRows.current = [
      row({ id: 1, customer: "Suissebank" }),
      row({ id: 2, customer: "Test 4 Ignore" }),
      row({ id: 3, customer: "FLOWNIQ" }),
    ];
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(screen.getByTestId("ranked-grid")).toHaveTextContent("2 engagements");
  });

  it("leads with how many need a decision", () => {
    mockRows.current = [
      row({
        id: 1,
        customer: "FIDUS Finanz AG",
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
      }),
      row({ id: 2, customer: "FLOWNIQ" }),
    ];
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(screen.getByText("Needs a decision first")).toBeInTheDocument();
    expect(screen.getByText("1 of 2")).toBeInTheDocument();
  });

  it("says so when nothing has slipped", () => {
    mockRows.current = [row({ id: 1, customer: "FLOWNIQ" })];
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(screen.getByText("All on the date")).toBeInTheDocument();
  });

  it("calls out owners claiming a deadline their estimate has passed", () => {
    mockRows.current = [
      row({
        id: 1,
        customer: "FIDUS Finanz AG",
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
      }),
    ];
    render(<Dashboard />, { wrapper: createTestWrapper() });

    expect(
      screen.getByText(/1 report themselves on track with an estimate past the deadline/)
    ).toBeInTheDocument();
  });
});
