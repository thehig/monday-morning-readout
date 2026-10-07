import { useState, useEffect } from "react";
import { useSearchParams, Outlet } from "react-router-dom";
import { getPreviousWeek } from "../../lib/date-utils";
import { ReadoutTopBar } from "../readout/ReadoutTopBar";
import { TopBarSlotContext } from "../readout/top-bar-slot";
import { useReadoutKeys } from "../readout/useReadoutKeys";

export function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Held in state rather than a ref so the states re-render once it exists.
  const [actionsSlot, setActionsSlot] = useState<HTMLDivElement | null>(null);

  const weekParam = searchParams.get("week");
  const [currentWeek, setCurrentWeek] = useState(
    weekParam ? parseInt(weekParam) : getPreviousWeek(new Date().getFullYear())
  );

  useReadoutKeys(currentWeek);

  useEffect(() => {
    setSearchParams({ week: currentWeek.toString() });
  }, [currentWeek, setSearchParams]);

  // The frame is the window, floored at the height the states were drawn for
  // and free to grow past it when a state needs the room. Nothing clips: what
  // does not fit scrolls the page.
  return (
    <div className="flex min-h-frame flex-col bg-sheet">
      <ReadoutTopBar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
        onActionsSlot={setActionsSlot}
      />
      <main className="flex flex-1 flex-col">
        <TopBarSlotContext.Provider value={actionsSlot}>
          <Outlet context={{ isDecrypted: true }} />
        </TopBarSlotContext.Provider>
      </main>
    </div>
  );
}
