import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { OwnerRunway } from "./OwnerRunway";
import { toEngagements } from "../../../lib/engagements";
import type { POFeedback } from "../../../types/feedback";

const TODAY = new Date(2026, 9, 7); // 7 Oct 2026

function row(over: Partial<POFeedback>): POFeedback {
  return {
    id: 1,
    created_at: "2026-10-02T14:42:39Z",
    submitted_by: "raunaq.inam@u.com",
    progress_percent: 50,
    team_happiness: 4,
    customer_happiness: 4,
    velocity_next_week: "Grün",
    customer: "FIDUS Finanz AG",
    target_date: "2026-05-31",
    estimated_completion_date: "2026-10-23",
    ...over,
  } as POFeedback;
}

const ENGAGEMENTS = toEngagements([
  row({ id: 338 }),
  row({ id: 339, customer: "FIVV AG", estimated_completion_date: "2026-10-31" }),
]);

function Where() {
  const { pathname, search } = useLocation();
  return <div data-testid="where">{pathname + search}</div>;
}

function renderRunway() {
  return render(
    <MemoryRouter initialEntries={["/owner-runway?week=39"]}>
      <Routes>
        <Route
          path="*"
          element={
            <>
              <OwnerRunway engagements={ENGAGEMENTS} currentWeek={39} today={TODAY} />
              <Where />
            </>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("the owner runway", () => {
  it("links each engagement to its Stop, keeping the week", () => {
    renderRunway();

    expect(
      screen.getByRole("link", { name: /^FIDUS Finanz AG, estimated completion/ })
    ).toHaveAttribute("href", "/feedback/338?week=39");
    expect(
      screen.getByRole("link", { name: /^FIVV AG, estimated completion/ })
    ).toHaveAttribute("href", "/feedback/339?week=39");
  });

  it("opens the Stop when an engagement is clicked", async () => {
    renderRunway();

    await userEvent.click(screen.getByText("FIVV AG"));
    expect(screen.getByTestId("where")).toHaveTextContent("/feedback/339?week=39");
  });
});
