import { render, screen } from "../../../test-utils";
import { Toggle } from "./Toggle";
import { vi } from "vitest";

describe("Toggle", () => {
  const defaultProps = {
    checked: false,
    onChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without label", () => {
    render(<Toggle {...defaultProps} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
    expect(toggle).not.toBeChecked();
  });

  it("renders with label", () => {
    render(<Toggle {...defaultProps} label="Test Toggle" />);

    const label = screen.getByText("Test Toggle");
    expect(label).toBeInTheDocument();
    expect(label).toHaveClass("text-sm", "text-white");

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeInTheDocument();
  });

  it("renders in checked state", () => {
    render(<Toggle {...defaultProps} checked={true} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toBeChecked();
  });

  it("calls onChange when clicked", () => {
    const mockOnChange = vi.fn();
    render(<Toggle {...defaultProps} onChange={mockOnChange} />);

    const toggle = screen.getByRole("switch");
    toggle.click();

    expect(mockOnChange).toHaveBeenCalledWith(true);
  });

  it("applies correct CSS classes when unchecked", () => {
    render(<Toggle {...defaultProps} checked={false} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveClass("bg-gray-200");
  });

  it("applies correct CSS classes when checked", () => {
    render(<Toggle {...defaultProps} checked={true} />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveClass("bg-blue-600");
  });

  it("has proper accessibility attributes", () => {
    render(<Toggle {...defaultProps} label="Accessibility Test" />);

    const toggle = screen.getByRole("switch");
    expect(toggle).toHaveAttribute("aria-checked", "false");

    const label = screen.getByText("Accessibility Test");
    expect(label).toBeInTheDocument();
  });

  it("toggles state correctly", () => {
    const mockOnChange = vi.fn();
    const { rerender } = render(
      <Toggle checked={false} onChange={mockOnChange} />
    );

    const toggle = screen.getByRole("switch");

    // First click should call onChange with true
    toggle.click();
    expect(mockOnChange).toHaveBeenCalledWith(true);

    // Re-render with checked=true to simulate state change
    mockOnChange.mockClear();
    rerender(<Toggle checked={true} onChange={mockOnChange} />);

    const checkedToggle = screen.getByRole("switch");
    checkedToggle.click();
    expect(mockOnChange).toHaveBeenCalledWith(false);
  });
});
