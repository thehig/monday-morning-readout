import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { VelocityIndicator } from "./VelocityIndicator";

describe("VelocityIndicator", () => {
  describe("Basic Rendering", () => {
    it("renders green velocity indicator without label", () => {
      render(<VelocityIndicator velocity="Grün" />);

      const indicator = screen.getByTitle("High velocity expected");
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass("bg-green-500");
    });

    it("renders yellow velocity indicator without label", () => {
      render(<VelocityIndicator velocity="Gelb" />);

      const indicator = screen.getByTitle("Medium velocity expected");
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass("bg-yellow-400");
    });

    it("renders red velocity indicator without label", () => {
      render(<VelocityIndicator velocity="Rot" />);

      const indicator = screen.getByTitle("Low velocity expected");
      expect(indicator).toBeInTheDocument();
      expect(indicator).toHaveClass("bg-red-500");
    });

    it("applies correct container structure", () => {
      render(<VelocityIndicator velocity="Grün" />);

      const container = screen.getByTitle(
        "High velocity expected"
      ).parentElement;
      expect(container).toHaveClass("flex", "items-center", "gap-2");
    });
  });

  describe("Label Display", () => {
    it("shows label when showLabel is true for green velocity", () => {
      render(<VelocityIndicator velocity="Grün" showLabel={true} />);

      expect(screen.getByText("High velocity expected")).toBeInTheDocument();
      expect(screen.getByText("High velocity expected")).toHaveClass(
        "text-sm",
        "text-gray-600"
      );
    });

    it("shows label when showLabel is true for yellow velocity", () => {
      render(<VelocityIndicator velocity="Gelb" showLabel={true} />);

      expect(screen.getByText("Medium velocity expected")).toBeInTheDocument();
      expect(screen.getByText("Medium velocity expected")).toHaveClass(
        "text-sm",
        "text-gray-600"
      );
    });

    it("shows label when showLabel is true for red velocity", () => {
      render(<VelocityIndicator velocity="Rot" showLabel={true} />);

      expect(screen.getByText("Low velocity expected")).toBeInTheDocument();
      expect(screen.getByText("Low velocity expected")).toHaveClass(
        "text-sm",
        "text-gray-600"
      );
    });

    it("does not show label when showLabel is false", () => {
      render(<VelocityIndicator velocity="Grün" showLabel={false} />);

      expect(
        screen.queryByText("High velocity expected")
      ).not.toBeInTheDocument();
      // Only the title attribute should be present
      expect(screen.getByTitle("High velocity expected")).toBeInTheDocument();
    });

    it("does not show label by default (showLabel defaults to false)", () => {
      render(<VelocityIndicator velocity="Grün" />);

      expect(
        screen.queryByText("High velocity expected")
      ).not.toBeInTheDocument();
      expect(screen.getByTitle("High velocity expected")).toBeInTheDocument();
    });
  });

  describe("Visual Styling", () => {
    it("applies correct circle styling for green velocity", () => {
      render(<VelocityIndicator velocity="Grün" />);

      const indicator = screen.getByTitle("High velocity expected");
      expect(indicator).toHaveClass(
        "w-3",
        "h-3",
        "rounded-full",
        "bg-green-500",
        "animate-pulse"
      );
    });

    it("applies correct circle styling for yellow velocity", () => {
      render(<VelocityIndicator velocity="Gelb" />);

      const indicator = screen.getByTitle("Medium velocity expected");
      expect(indicator).toHaveClass(
        "w-3",
        "h-3",
        "rounded-full",
        "bg-yellow-400",
        "animate-pulse"
      );
    });

    it("applies correct circle styling for red velocity", () => {
      render(<VelocityIndicator velocity="Rot" />);

      const indicator = screen.getByTitle("Low velocity expected");
      expect(indicator).toHaveClass(
        "w-3",
        "h-3",
        "rounded-full",
        "bg-red-500",
        "animate-pulse"
      );
    });

    it("includes pulse animation for visual attention", () => {
      render(<VelocityIndicator velocity="Grün" />);

      const indicator = screen.getByTitle("High velocity expected");
      expect(indicator).toHaveClass("animate-pulse");
    });
  });

  describe("Accessibility", () => {
    it("provides meaningful title attributes for screen readers", () => {
      render(<VelocityIndicator velocity="Grün" />);

      const indicator = screen.getByTitle("High velocity expected");
      expect(indicator).toBeInTheDocument();
    });

    it("provides descriptive title for red velocity", () => {
      render(<VelocityIndicator velocity="Rot" />);

      const indicator = screen.getByTitle("Low velocity expected");
      expect(indicator).toBeInTheDocument();
    });

    it("provides descriptive title for yellow velocity", () => {
      render(<VelocityIndicator velocity="Gelb" />);

      const indicator = screen.getByTitle("Medium velocity expected");
      expect(indicator).toBeInTheDocument();
    });

    it("maintains semantic structure with meaningful labels", () => {
      render(<VelocityIndicator velocity="Grün" showLabel={true} />);

      const label = screen.getByText("High velocity expected");
      expect(label.tagName).toBe("SPAN");
      expect(label).toHaveClass("text-sm");
    });

    it("uses appropriate color contrast for all velocity states", () => {
      const { rerender } = render(<VelocityIndicator velocity="Grün" />);
      expect(screen.getByTitle("High velocity expected")).toHaveClass(
        "bg-green-500"
      );

      rerender(<VelocityIndicator velocity="Gelb" />);
      expect(screen.getByTitle("Medium velocity expected")).toHaveClass(
        "bg-yellow-400"
      );

      rerender(<VelocityIndicator velocity="Rot" />);
      expect(screen.getByTitle("Low velocity expected")).toHaveClass(
        "bg-red-500"
      );
    });
  });

  describe("Traffic Light Behavior", () => {
    it("displays green state for high velocity", () => {
      render(<VelocityIndicator velocity="Grün" showLabel={true} />);

      const indicator = screen.getByTitle("High velocity expected");
      const label = screen.getByText("High velocity expected");

      expect(indicator).toHaveClass("bg-green-500");
      expect(label).toBeInTheDocument();
    });

    it("displays yellow state for medium velocity", () => {
      render(<VelocityIndicator velocity="Gelb" showLabel={true} />);

      const indicator = screen.getByTitle("Medium velocity expected");
      const label = screen.getByText("Medium velocity expected");

      expect(indicator).toHaveClass("bg-yellow-400");
      expect(label).toBeInTheDocument();
    });

    it("displays red state for low velocity", () => {
      render(<VelocityIndicator velocity="Rot" showLabel={true} />);

      const indicator = screen.getByTitle("Low velocity expected");
      const label = screen.getByText("Low velocity expected");

      expect(indicator).toHaveClass("bg-red-500");
      expect(label).toBeInTheDocument();
    });
  });

  describe("Component Integration", () => {
    it("works with both label display modes", () => {
      const { rerender } = render(
        <VelocityIndicator velocity="Grün" showLabel={false} />
      );

      // Without label
      expect(
        screen.queryByText("High velocity expected")
      ).not.toBeInTheDocument();
      expect(screen.getByTitle("High velocity expected")).toBeInTheDocument();

      // With label
      rerender(<VelocityIndicator velocity="Grün" showLabel={true} />);
      expect(screen.getByText("High velocity expected")).toBeInTheDocument();
      expect(screen.getByTitle("High velocity expected")).toBeInTheDocument();
    });

    it("maintains consistent styling regardless of label state", () => {
      const { rerender } = render(
        <VelocityIndicator velocity="Grün" showLabel={false} />
      );

      const indicatorWithoutLabel = screen.getByTitle("High velocity expected");
      expect(indicatorWithoutLabel).toHaveClass(
        "w-3",
        "h-3",
        "rounded-full",
        "bg-green-500"
      );

      rerender(<VelocityIndicator velocity="Grün" showLabel={true} />);
      const indicatorWithLabel = screen.getByTitle("High velocity expected");
      expect(indicatorWithLabel).toHaveClass(
        "w-3",
        "h-3",
        "rounded-full",
        "bg-green-500"
      );
    });

    it("renders correctly in different contexts", () => {
      render(
        <div>
          <VelocityIndicator velocity="Grün" />
          <VelocityIndicator velocity="Gelb" showLabel={true} />
          <VelocityIndicator velocity="Rot" />
        </div>
      );

      expect(screen.getByTitle("High velocity expected")).toBeInTheDocument();
      expect(screen.getByTitle("Medium velocity expected")).toBeInTheDocument();
      expect(screen.getByTitle("Low velocity expected")).toBeInTheDocument();
      expect(screen.getByText("Medium velocity expected")).toBeInTheDocument();
    });
  });
});
