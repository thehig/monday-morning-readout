import { render, screen } from "../../test-utils";
import { Header } from "./Header";
import { vi } from "vitest";

interface MockLinkProps {
  children: React.ReactNode;
  to: string;
  className?: string;
}

interface MockWeekPickerProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

// Mock react-router-dom
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useLocation: vi.fn(() => ({ pathname: "/" })),
    Link: ({ children, to, className }: MockLinkProps) => (
      <a href={to} className={className}>
        {children}
      </a>
    ),
  };
});

// Mock WeekPicker component
vi.mock("../inputs/WeekPicker", () => ({
  WeekPicker: ({ currentWeek, onWeekChange }: MockWeekPickerProps) => (
    <div data-testid="week-picker">
      Week {currentWeek}
      <button onClick={() => onWeekChange(currentWeek + 1)}>Next Week</button>
    </div>
  ),
}));

describe("Header", () => {
  const defaultProps = {
    currentWeek: 10,
    setCurrentWeek: vi.fn(),
    title: "Test Dashboard",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the title as a link", () => {
    render(<Header {...defaultProps} />);

    const titleLink = screen.getByRole("link", { name: "Test Dashboard" });
    expect(titleLink).toBeInTheDocument();
    expect(titleLink).toHaveAttribute("href", "/?week=10");
  });

  it("applies correct CSS classes to the title", () => {
    render(<Header {...defaultProps} />);

    const titleLink = screen.getByRole("link", { name: "Test Dashboard" });
    expect(titleLink).toHaveClass(
      "text-[#ff7f00]",
      "text-2xl",
      "font-bold",
      "hover:opacity-90"
    );
  });

  it("renders WeekPicker when on home page", () => {
    render(<Header {...defaultProps} />);

    expect(screen.getByTestId("week-picker")).toBeInTheDocument();
    expect(screen.getByText("Week 10")).toBeInTheDocument();
  });

  it("calls setCurrentWeek when week changes", () => {
    const mockSetCurrentWeek = vi.fn();

    render(<Header {...defaultProps} setCurrentWeek={mockSetCurrentWeek} />);

    const nextWeekButton = screen.getByText("Next Week");
    nextWeekButton.click();

    expect(mockSetCurrentWeek).toHaveBeenCalledWith(11);
  });

  it("has correct header structure and classes", () => {
    render(<Header {...defaultProps} />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass("border-b", "bg-[#1a1a4b]");

    const container = header.firstChild;
    expect(container).toHaveClass(
      "flex",
      "h-16",
      "items-center",
      "justify-between",
      "px-4"
    );
  });
});
