import { render, screen } from "../../test-utils";
import { WeekPicker } from "./WeekPicker";
import { vi } from "vitest";

interface MockIconProps {
  className?: string;
  "aria-hidden"?: boolean;
}

// Mock the date-utils functions
vi.mock("../../lib/date-utils", () => ({
  getWeekDates: vi.fn(() => ({
    start: new Date(2024, 2, 4), // March 4, 2024 (Monday)
    end: new Date(2024, 2, 9), // March 9, 2024 (Saturday)
  })),
  getCurrentWeek: vi.fn(() => 5),
  formatDate: vi.fn((date: Date) => {
    if (date.getDate() === 4 && date.getMonth() === 2) return "Mar 4";
    if (date.getDate() === 9 && date.getMonth() === 2) return "Mar 9";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }),
}));

// Mock Heroicons
vi.mock("@heroicons/react/24/outline", () => ({
  ChevronLeftIcon: ({
    className,
    "aria-hidden": ariaHidden,
  }: MockIconProps) => (
    <svg
      className={className}
      aria-hidden={ariaHidden}
      data-testid="chevron-left"
    >
      <path d="left-chevron" />
    </svg>
  ),
  ChevronRightIcon: ({
    className,
    "aria-hidden": ariaHidden,
  }: MockIconProps) => (
    <svg
      className={className}
      aria-hidden={ariaHidden}
      data-testid="chevron-right"
    >
      <path d="right-chevron" />
    </svg>
  ),
}));

describe("WeekPicker", () => {
  const defaultProps = {
    currentWeek: 10,
    onWeekChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders week navigation group", () => {
    render(<WeekPicker {...defaultProps} />);

    const navigation = screen.getByRole("group", { name: "Week navigation" });
    expect(navigation).toBeInTheDocument();
  });

  it("displays current week number", () => {
    render(<WeekPicker {...defaultProps} />);

    const weekText = screen.getByText(/Week 10/);
    expect(weekText).toBeInTheDocument();
  });

  it("displays week date range", () => {
    render(<WeekPicker {...defaultProps} />);

    const dateRange = screen.getByText("Mar 4 - Mar 9");
    expect(dateRange).toBeInTheDocument();
  });

  it("shows current week indicator when it is the current week", async () => {
    const { getCurrentWeek } = await import("../../lib/date-utils");
    vi.mocked(getCurrentWeek).mockReturnValue(10); // Same as currentWeek prop

    render(<WeekPicker {...defaultProps} />);

    const currentIndicator = screen.getByText("(Current)");
    expect(currentIndicator).toBeInTheDocument();
    expect(currentIndicator).toHaveClass("text-[#ff7f00]");
  });

  it("does not show current week indicator when not current week", async () => {
    const { getCurrentWeek } = await import("../../lib/date-utils");
    vi.mocked(getCurrentWeek).mockReturnValue(5); // Different from currentWeek prop

    render(<WeekPicker {...defaultProps} />);

    const currentIndicator = screen.queryByText("(Current)");
    expect(currentIndicator).not.toBeInTheDocument();
  });

  it("renders previous week button", () => {
    render(<WeekPicker {...defaultProps} />);

    const prevButton = screen.getByRole("button", { name: "Previous week" });
    expect(prevButton).toBeInTheDocument();
    expect(prevButton).not.toBeDisabled();

    const chevronLeft = screen.getByTestId("chevron-left");
    expect(chevronLeft).toBeInTheDocument();
  });

  it("renders next week button", () => {
    render(<WeekPicker {...defaultProps} />);

    const nextButton = screen.getByRole("button", { name: "Next week" });
    expect(nextButton).toBeInTheDocument();
    expect(nextButton).not.toBeDisabled();

    const chevronRight = screen.getByTestId("chevron-right");
    expect(chevronRight).toBeInTheDocument();
  });

  it("disables previous button when at week 1", () => {
    render(<WeekPicker {...defaultProps} currentWeek={1} />);

    const prevButton = screen.getByRole("button", { name: "Previous week" });
    expect(prevButton).toBeDisabled();
    expect(prevButton).toHaveClass(
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
  });

  it("disables next button when at week 52", () => {
    render(<WeekPicker {...defaultProps} currentWeek={52} />);

    const nextButton = screen.getByRole("button", { name: "Next week" });
    expect(nextButton).toBeDisabled();
    expect(nextButton).toHaveClass(
      "disabled:opacity-50",
      "disabled:cursor-not-allowed"
    );
  });

  it("calls onWeekChange when previous button is clicked", () => {
    const mockOnWeekChange = vi.fn();
    render(
      <WeekPicker
        {...defaultProps}
        currentWeek={10}
        onWeekChange={mockOnWeekChange}
      />
    );

    const prevButton = screen.getByRole("button", { name: "Previous week" });
    prevButton.click();

    expect(mockOnWeekChange).toHaveBeenCalledWith(9);
  });

  it("calls onWeekChange when next button is clicked", () => {
    const mockOnWeekChange = vi.fn();
    render(
      <WeekPicker
        {...defaultProps}
        currentWeek={10}
        onWeekChange={mockOnWeekChange}
      />
    );

    const nextButton = screen.getByRole("button", { name: "Next week" });
    nextButton.click();

    expect(mockOnWeekChange).toHaveBeenCalledWith(11);
  });

  it("does not go below week 1 when clicking previous", () => {
    const mockOnWeekChange = vi.fn();
    render(
      <WeekPicker
        {...defaultProps}
        currentWeek={2}
        onWeekChange={mockOnWeekChange}
      />
    );

    const prevButton = screen.getByRole("button", { name: "Previous week" });
    prevButton.click();

    expect(mockOnWeekChange).toHaveBeenCalledWith(1); // Should be Math.max(1, 2-1)
  });

  it("does not go above week 52 when clicking next", () => {
    const mockOnWeekChange = vi.fn();
    render(
      <WeekPicker
        {...defaultProps}
        currentWeek={51}
        onWeekChange={mockOnWeekChange}
      />
    );

    const nextButton = screen.getByRole("button", { name: "Next week" });
    nextButton.click();

    expect(mockOnWeekChange).toHaveBeenCalledWith(52); // Should be Math.min(52, 51+1)
  });

  it("has proper accessibility attributes", () => {
    render(<WeekPicker {...defaultProps} />);

    const navigation = screen.getByRole("group", { name: "Week navigation" });
    expect(navigation).toBeInTheDocument();

    // Find the live region by its content since it contains "Week 10"
    const liveRegion = screen.getByText("Week 10").parentElement;
    expect(liveRegion).toHaveAttribute("aria-live", "polite");

    const currentIndicator = screen.queryByLabelText("Current week indicator");
    if (currentIndicator) {
      expect(currentIndicator).toBeInTheDocument();
    }
  });

  it("applies correct CSS classes", () => {
    render(<WeekPicker {...defaultProps} />);

    const container = screen.getByRole("group");
    expect(container).toHaveClass("flex", "items-center", "gap-2");

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button) => {
      expect(button).toHaveClass(
        "p-1",
        "hover:bg-white/10",
        "rounded-full",
        "transition-colors"
      );
    });
  });
});
