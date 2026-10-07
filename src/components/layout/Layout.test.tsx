import { render, screen, act } from "../../test-utils";
import { Layout } from "./Layout";
import { vi } from "vitest";

interface MockOutletProps {
  context: { isDecrypted: boolean };
}

interface MockTopBarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useSearchParams: vi.fn(() => [new URLSearchParams("week=10"), vi.fn()]),
    Outlet: ({ context }: MockOutletProps) => (
      <div data-testid="outlet" data-context={JSON.stringify(context)}>
        Outlet Content
      </div>
    ),
  };
});

// Mock the readout top bar
vi.mock("../readout/ReadoutTopBar", () => ({
  ReadoutTopBar: ({ currentWeek, onWeekChange }: MockTopBarProps) => (
    <header data-testid="header">
      <span data-testid="header-week">{currentWeek}</span>
      <button onClick={() => onWeekChange(currentWeek + 1)}>Change Week</button>
    </header>
  ),
}));

// Mock the hook
vi.mock("../../hooks/use-po-feedback", () => ({
  getCurrentWeek: vi.fn(() => 5),
}));

// Mock the date utils
vi.mock("../../lib/date-utils", () => ({
  getPreviousWeek: vi.fn(() => 24),
}));

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main layout structure", () => {
    render(<Layout />);

    const container = screen.getByRole("main");
    expect(container).toBeInTheDocument();
    // The readout never scrolls: each state fits one screen.
    expect(container).toHaveClass("flex-1", "overflow-hidden");
  });

  it("renders the top bar with the current week", () => {
    render(<Layout />);

    expect(screen.getByTestId("header")).toBeInTheDocument();
    expect(screen.getByTestId("header-week")).toHaveTextContent("10");
  });

  it("renders Outlet with correct context", () => {
    render(<Layout />);

    const outlet = screen.getByTestId("outlet");
    expect(outlet).toBeInTheDocument();
    expect(outlet).toHaveTextContent("Outlet Content");

    const context = JSON.parse(outlet.getAttribute("data-context") || "{}");
    expect(context.isDecrypted).toBe(true);
  });

  it("has correct CSS classes for layout structure", () => {
    render(<Layout />);

    // Find the main container div (parent of header and main)
    const header = screen.getByTestId("header");
    const main = screen.getByRole("main");
    const container = header.parentElement;

    expect(container).toHaveClass("h-screen", "bg-sheet", "flex", "flex-col");
    expect(main).toHaveClass("flex-1", "overflow-hidden");
  });

  it("handles week change correctly", async () => {
    const { useSearchParams } = await import("react-router-dom");
    const mockSetSearchParams = vi.fn();
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("week=10"),
      mockSetSearchParams,
    ]);

    render(<Layout />);

    const changeWeekButton = screen.getByText("Change Week");

    await act(async () => {
      changeWeekButton.click();
    });

    // Should update search params when week changes
    expect(mockSetSearchParams).toHaveBeenCalled();
  });

  it("uses current week when no week param is provided", async () => {
    const { useSearchParams } = await import("react-router-dom");
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams(), // No week param
      vi.fn(),
    ]);

    render(<Layout />);

    const week = screen.getByTestId("header-week");
    expect(week).toHaveTextContent("24"); // From mocked getPreviousWeek
  });

  it("parses week param correctly when provided", async () => {
    const { useSearchParams } = await import("react-router-dom");
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams("week=25"),
      vi.fn(),
    ]);

    render(<Layout />);

    const week = screen.getByTestId("header-week");
    expect(week).toHaveTextContent("25");
  });
});
