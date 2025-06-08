import { render, screen } from "../../test-utils";
import { Layout } from "./Layout";
import { vi } from "vitest";

interface MockOutletProps {
  context: { isDecrypted: boolean };
}

interface MockHeaderProps {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  title: string;
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

// Mock the Header component
vi.mock("./Header", () => ({
  Header: ({ currentWeek, setCurrentWeek, title }: MockHeaderProps) => (
    <header data-testid="header">
      <span data-testid="header-title">{title}</span>
      <span data-testid="header-week">{currentWeek}</span>
      <button onClick={() => setCurrentWeek(currentWeek + 1)}>
        Change Week
      </button>
    </header>
  ),
}));

// Mock the hook
vi.mock("../../hooks/use-po-feedback", () => ({
  getCurrentWeek: vi.fn(() => 5),
}));

describe("Layout", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main layout structure", () => {
    render(<Layout />);

    const container = screen.getByRole("main");
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass("flex-1", "overflow-auto");
  });

  it("renders Header with correct props", () => {
    render(<Layout />);

    const header = screen.getByTestId("header");
    expect(header).toBeInTheDocument();

    const title = screen.getByTestId("header-title");
    expect(title).toHaveTextContent("United Signals");

    const week = screen.getByTestId("header-week");
    expect(week).toHaveTextContent("10"); // From mocked search params
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

    expect(container).toHaveClass("h-screen", "bg-gray-50", "flex", "flex-col");
    expect(main).toHaveClass("flex-1", "overflow-auto");
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
    changeWeekButton.click();

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
    expect(week).toHaveTextContent("5"); // From mocked getCurrentWeek
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
