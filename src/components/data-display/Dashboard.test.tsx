import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Dashboard } from "./Dashboard";

// Mock the Wall's grid so these tests stay about the Dashboard's own wiring
vi.mock("../readout/wall/Ladder", () => ({
  Ladder: () => <div data-testid="ladder" />,
}));

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

function createTestWrapper(initialEntries: string[] = ["/grid"]) {
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
      render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });
    }).not.toThrow();
  });

  it("falls back to the previous week when the URL has no week", () => {
    mockRows.current = [row()];
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    expect(screen.getByTestId("ranked-grid")).toHaveAttribute("data-week", "24");
  });

  it("takes the week from the URL when it is given", () => {
    mockRows.current = [row()];
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper(["/grid?week=25"]) });

    expect(screen.getByTestId("ranked-grid")).toHaveAttribute("data-week", "25");
  });

  it("says so rather than showing an empty board", () => {
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    expect(screen.getByText("No submissions for week 24.")).toBeInTheDocument();
    expect(screen.queryByTestId("ranked-grid")).not.toBeInTheDocument();
  });

  it("draws the layout its page asks for", () => {
    mockRows.current = [row()];
    const { unmount } = render(<Dashboard layout="grid" />, {
      wrapper: createTestWrapper(),
    });

    expect(screen.getByTestId("ranked-grid")).toBeInTheDocument();
    expect(screen.queryByTestId("ladder")).not.toBeInTheDocument();
    unmount();

    render(<Dashboard layout="ladder" />, { wrapper: createTestWrapper(["/ladder"]) });

    expect(screen.getByTestId("ladder")).toBeInTheDocument();
    expect(screen.queryByTestId("ranked-grid")).not.toBeInTheDocument();
  });

  it("keeps no layout switcher of its own: the footer links the pages", () => {
    mockRows.current = [row()];
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    expect(screen.queryByRole("group", { name: /layout/i })).not.toBeInTheDocument();
  });

  it("shows a loading line rather than an empty board", () => {
    mockRows.loading = true;
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    expect(screen.getByText(/Loading week 24/)).toBeInTheDocument();
    expect(screen.queryByTestId("ranked-grid")).not.toBeInTheDocument();
  });

  it("drops test submissions before handing rows to the grid", () => {
    mockRows.current = [
      row({ id: 1, customer: "Suissebank" }),
      row({ id: 2, customer: "Test 4 Ignore" }),
      row({ id: 3, customer: "FLOWNIQ" }),
    ];
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    expect(screen.getByTestId("ranked-grid")).toHaveTextContent("2 engagements");
  });

  it("leaves the behind-schedule count off both layouts: each row and card carries its state", () => {
    mockRows.current = [
      row({
        id: 1,
        customer: "FIDUS Finanz AG",
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
      }),
      row({ id: 2, customer: "FLOWNIQ" }),
    ];

    for (const layout of ["grid", "ladder"] as const) {
      const { unmount } = render(<Dashboard layout={layout} />, {
        wrapper: createTestWrapper([`/${layout}`]),
      });

      expect(screen.queryByText("Needs a decision first")).not.toBeInTheDocument();
      expect(screen.queryByText("All on the date")).not.toBeInTheDocument();
      expect(screen.queryByText("1 of 2")).not.toBeInTheDocument();
      unmount();
    }
  });

  it("warns about owners not on track for their own estimate", () => {
    mockRows.current = [
      row({
        id: 1,
        customer: "Test API",
        target_date: "2026-09-08",
        estimated_completion_date: "2026-10-13",
        project_on_track: false,
      }),
    ];
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    // Drawn as a chip rather than a sentence: the count and the words are
    // separate elements inside one object, so assert on the object.
    const chip = screen.getByText("not on track for their own estimate").parentElement;

    expect(chip).toHaveTextContent("1");
  });

  it("does not treat an estimate past the deadline as a warning when on track", () => {
    // "On track" is about the owner's own estimate, so an engagement whose
    // estimate passes the deadline can quite properly be on track for it.
    mockRows.current = [
      row({
        id: 1,
        customer: "FIDUS Finanz AG",
        target_date: "2026-05-31",
        estimated_completion_date: "2026-10-23",
        project_on_track: true,
      }),
    ];
    render(<Dashboard layout="grid" />, { wrapper: createTestWrapper() });

    expect(
      screen.queryByText("not on track for their own estimate")
    ).not.toBeInTheDocument();
  });
});
