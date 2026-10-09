import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { ReadoutTopBar } from "./ReadoutTopBar";

function renderBar(onWeekChange = vi.fn(), path = "/grid?week=39") {
  const queryClient = new QueryClient();
  const invalidate = vi.spyOn(queryClient, "invalidateQueries");

  render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={[path]}>
        <ReadoutTopBar currentWeek={39} onWeekChange={onWeekChange} />
      </MemoryRouter>
    </QueryClientProvider>
  );

  return { invalidate, onWeekChange };
}

describe("the top bar", () => {
  it("carries the page links", () => {
    renderBar();

    expect(screen.getByRole("navigation", { name: "Pages" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Ranked grid/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  it("reloads every feedback query from the API", async () => {
    const { invalidate } = renderBar();

    await userEvent.click(screen.getByRole("button", { name: "Reload from the API" }));

    expect(invalidate).toHaveBeenCalledWith({ queryKey: ["po-feedback"] });
  });

  it("steps the week", async () => {
    const { onWeekChange } = renderBar();

    await userEvent.click(screen.getByRole("button", { name: "Next week" }));
    expect(onWeekChange).toHaveBeenCalledWith(40);

    await userEvent.click(screen.getByRole("button", { name: "Previous week" }));
    expect(onWeekChange).toHaveBeenCalledWith(38);
  });

  it("holds the week while an engagement is open", async () => {
    const { onWeekChange } = renderBar(vi.fn(), "/feedback/338?week=39");

    const previous = screen.getByRole("button", { name: "Previous week" });
    const next = screen.getByRole("button", { name: "Next week" });
    expect(previous).toBeDisabled();
    expect(next).toBeDisabled();

    await userEvent.click(next);
    expect(onWeekChange).not.toHaveBeenCalled();
  });
});
