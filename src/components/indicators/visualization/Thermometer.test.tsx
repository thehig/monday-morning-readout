import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Thermometer } from "./Thermometer";

describe("Thermometer", () => {
  describe("Basic Rendering", () => {
    it("renders with progress value", () => {
      render(<Thermometer value={75} />);

      expect(screen.getByText("75%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 75% complete")).toBeInTheDocument();
    });

    it("renders with zero progress", () => {
      render(<Thermometer value={0} />);

      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 0% complete")).toBeInTheDocument();
    });

    it("renders with complete progress", () => {
      render(<Thermometer value={100} />);

      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 100% complete")).toBeInTheDocument();
    });

    it("renders with decimal values", () => {
      render(<Thermometer value={33.3} />);

      expect(screen.getByText("33.3%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 33.3% complete")).toBeInTheDocument();
    });

    it("applies correct container structure", () => {
      render(<Thermometer value={50} />);

      const container = screen.getByTitle("Progress: 50% complete");
      expect(container).toHaveClass(
        "relative",
        "h-6",
        "w-full",
        "bg-gray-200",
        "rounded-full",
        "overflow-hidden"
      );
    });
  });

  describe("Visual Styling", () => {
    it("applies correct background styling", () => {
      render(<Thermometer value={25} />);

      const container = screen.getByTitle("Progress: 25% complete");
      expect(container).toHaveClass(
        "bg-gray-200",
        "rounded-full",
        "overflow-hidden"
      );
    });

    it("renders progress fill with correct styling", () => {
      render(<Thermometer value={60} />);

      const container = screen.getByTitle("Progress: 60% complete");
      const fillBar = container.querySelector('[class*="bg-blue-500"]');

      expect(fillBar).toBeInTheDocument();
      expect(fillBar).toHaveClass(
        "absolute",
        "left-0",
        "h-full",
        "bg-blue-500",
        "rounded-full"
      );
    });

    it("renders percentage text with correct styling", () => {
      render(<Thermometer value={80} />);

      const percentageText = screen.getByText("80%");
      expect(percentageText).toHaveClass(
        "text-sm",
        "font-bold",
        "text-white",
        "drop-shadow"
      );
    });

    it("centers text in the container", () => {
      render(<Thermometer value={45} />);

      const textContainer = screen.getByText("45%").parentElement;
      expect(textContainer).toHaveClass(
        "absolute",
        "inset-0",
        "flex",
        "items-center",
        "justify-center"
      );
    });
  });

  describe("Progress Values", () => {
    it("handles minimum value correctly", () => {
      render(<Thermometer value={0} />);

      expect(screen.getByText("0%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 0% complete")).toBeInTheDocument();
    });

    it("handles maximum value correctly", () => {
      render(<Thermometer value={100} />);

      expect(screen.getByText("100%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 100% complete")).toBeInTheDocument();
    });

    it("handles mid-range values", () => {
      render(<Thermometer value={50} />);

      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 50% complete")).toBeInTheDocument();
    });

    it("handles low values", () => {
      render(<Thermometer value={5} />);

      expect(screen.getByText("5%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 5% complete")).toBeInTheDocument();
    });

    it("handles high values", () => {
      render(<Thermometer value={95} />);

      expect(screen.getByText("95%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 95% complete")).toBeInTheDocument();
    });

    it("handles negative values gracefully", () => {
      render(<Thermometer value={-10} />);

      expect(screen.getByText("-10%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: -10% complete")).toBeInTheDocument();
    });

    it("handles values over 100 gracefully", () => {
      render(<Thermometer value={110} />);

      expect(screen.getByText("110%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 110% complete")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("provides meaningful title attribute for screen readers", () => {
      render(<Thermometer value={65} />);

      const container = screen.getByTitle("Progress: 65% complete");
      expect(container).toBeInTheDocument();
    });

    it("displays percentage visually for users", () => {
      render(<Thermometer value={40} />);

      const percentageText = screen.getByText("40%");
      expect(percentageText).toBeVisible();
    });

    it("uses semantic structure for progress information", () => {
      render(<Thermometer value={85} />);

      // The title provides context for screen readers
      expect(screen.getByTitle("Progress: 85% complete")).toBeInTheDocument();
      // The visible text provides the actual value
      expect(screen.getByText("85%")).toBeInTheDocument();
    });

    it("maintains readable text contrast", () => {
      render(<Thermometer value={30} />);

      const text = screen.getByText("30%");
      expect(text).toHaveClass("text-white", "drop-shadow");
    });
  });

  describe("Animation Behavior", () => {
    it("includes framer-motion animation on the fill bar", () => {
      render(<Thermometer value={70} />);

      const container = screen.getByTitle("Progress: 70% complete");
      const fillBar = container.querySelector('[class*="bg-blue-500"]');

      // The motion.div should be present with animation properties
      expect(fillBar).toBeInTheDocument();
    });

    it("maintains static text during animation", () => {
      render(<Thermometer value={90} />);

      // Text should be immediately visible and not animated
      expect(screen.getByText("90%")).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("renders multiple thermometers with different values", () => {
      render(
        <div>
          <Thermometer value={25} />
          <Thermometer value={50} />
          <Thermometer value={75} />
        </div>
      );

      expect(screen.getByText("25%")).toBeInTheDocument();
      expect(screen.getByText("50%")).toBeInTheDocument();
      expect(screen.getByText("75%")).toBeInTheDocument();

      expect(screen.getByTitle("Progress: 25% complete")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 50% complete")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 75% complete")).toBeInTheDocument();
    });

    it("maintains consistent styling across different values", () => {
      const { rerender } = render(<Thermometer value={10} />);

      let container = screen.getByTitle("Progress: 10% complete");
      expect(container).toHaveClass("h-6", "w-full", "bg-gray-200");

      rerender(<Thermometer value={90} />);
      container = screen.getByTitle("Progress: 90% complete");
      expect(container).toHaveClass("h-6", "w-full", "bg-gray-200");
    });

    it("updates value dynamically", () => {
      const { rerender } = render(<Thermometer value={20} />);

      expect(screen.getByText("20%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 20% complete")).toBeInTheDocument();

      rerender(<Thermometer value={80} />);
      expect(screen.getByText("80%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 80% complete")).toBeInTheDocument();
      expect(screen.queryByText("20%")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles fractional values properly", () => {
      render(<Thermometer value={33.33} />);

      expect(screen.getByText("33.33%")).toBeInTheDocument();
      expect(
        screen.getByTitle("Progress: 33.33% complete")
      ).toBeInTheDocument();
    });

    it("handles very small values", () => {
      render(<Thermometer value={0.1} />);

      expect(screen.getByText("0.1%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 0.1% complete")).toBeInTheDocument();
    });

    it("handles very large values", () => {
      render(<Thermometer value={999} />);

      expect(screen.getByText("999%")).toBeInTheDocument();
      expect(screen.getByTitle("Progress: 999% complete")).toBeInTheDocument();
    });
  });
});
