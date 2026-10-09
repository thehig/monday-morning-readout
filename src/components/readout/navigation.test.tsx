import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { ReadoutFooter } from "./ReadoutFooter";
import { useReadoutKeys } from "./useReadoutKeys";
import { PAGES } from "./pages";

/** Shows where the router is, so a test can assert on the address. */
function Where() {
  const { pathname, search } = useLocation();
  return <div data-testid="where">{pathname + search}</div>;
}

function Keys({ week }: { week: number }) {
  useReadoutKeys(week);
  return null;
}

function renderAt(path: string, week = 39) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <Keys week={week} />
              <ReadoutFooter currentWeek={week} onActionsSlot={() => {}} />
              <Where />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("the footer", () => {
  it("links every page with its number, keeping the week", () => {
    renderAt("/grid?week=39");

    for (const page of PAGES) {
      const link = screen.getByRole("link", { name: new RegExp(page.label) });
      expect(link).toHaveAttribute("href", `${page.path}?week=39`);
      expect(link).toHaveTextContent(page.key);
    }
  });

  it("marks the page you are on, and keeps it in the row", () => {
    renderAt("/landing-weeks?week=39");

    expect(screen.getByRole("link", { name: /Landing weeks/ })).toHaveAttribute(
      "aria-current",
      "page"
    );
    expect(screen.getByRole("link", { name: /Ranked grid/ })).not.toHaveAttribute(
      "aria-current"
    );
    expect(screen.getAllByRole("link")).toHaveLength(PAGES.length);
  });

  it("marks no page on an engagement's Stop", () => {
    renderAt("/feedback/338?week=39");

    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });
});

describe("the number keys", () => {
  it("open each page at the current week", async () => {
    renderAt("/grid?week=39");

    await userEvent.keyboard("2");
    expect(screen.getByTestId("where")).toHaveTextContent("/ladder?week=39");

    await userEvent.keyboard("4");
    expect(screen.getByTestId("where")).toHaveTextContent("/owner-runway?week=39");

    await userEvent.keyboard("3");
    expect(screen.getByTestId("where")).toHaveTextContent("/landing-weeks?week=39");

    await userEvent.keyboard("1");
    expect(screen.getByTestId("where")).toHaveTextContent("/grid?week=39");
  });

  it("work from an engagement's Stop too", async () => {
    renderAt("/feedback/338?week=39");

    await userEvent.keyboard("3");
    expect(screen.getByTestId("where")).toHaveTextContent("/landing-weeks?week=39");
  });

  it("leave the retired letter keys alone", async () => {
    renderAt("/grid?week=39");

    await userEvent.keyboard("dpt{Escape}");
    expect(screen.getByTestId("where")).toHaveTextContent("/grid?week=39");
  });
});
