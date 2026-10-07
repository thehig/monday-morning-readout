import { useState, useEffect } from "react";
import { useSearchParams, Outlet } from "react-router-dom";
import { getPreviousWeek } from "../../lib/date-utils";
import { ReadoutTopBar } from "../readout/ReadoutTopBar";
import { useReadoutKeys } from "../readout/useReadoutKeys";

export function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();

  const weekParam = searchParams.get("week");
  const [currentWeek, setCurrentWeek] = useState(
    weekParam ? parseInt(weekParam) : getPreviousWeek(new Date().getFullYear())
  );

  useReadoutKeys(currentWeek);

  useEffect(() => {
    setSearchParams({ week: currentWeek.toString() });
  }, [currentWeek, setSearchParams]);

  // The frame is the viewport, but never smaller than the size the states were
  // drawn at. A bigger window stretches it; a smaller one scrolls the page
  // rather than squeezing the layout inside it.
  return (
    <div className="flex h-dvh min-h-frame min-w-frame flex-col bg-sheet">
      <ReadoutTopBar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
      />
      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet context={{ isDecrypted: true }} />
      </main>
    </div>
  );
}
