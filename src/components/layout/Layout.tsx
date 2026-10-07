import { useState, useEffect } from "react";
import { useSearchParams, Outlet } from "react-router-dom";
import { getPreviousWeek } from "../../lib/date-utils";
import { ReadoutTopBar } from "../readout/ReadoutTopBar";

export function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();

  const weekParam = searchParams.get("week");
  const [currentWeek, setCurrentWeek] = useState(
    weekParam ? parseInt(weekParam) : getPreviousWeek(new Date().getFullYear())
  );

  useEffect(() => {
    setSearchParams({ week: currentWeek.toString() });
  }, [currentWeek, setSearchParams]);

  return (
    <div className="h-screen bg-sheet flex flex-col">
      <ReadoutTopBar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
      />
      <main className="flex-1 overflow-hidden">
        <Outlet context={{ isDecrypted: true }} />
      </main>
    </div>
  );
}
