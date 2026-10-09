import { useState } from "react";
import { useSearchParams, Outlet } from "react-router-dom";
import { getPreviousWeek } from "../../lib/date-utils";
import { ReadoutTopBar } from "../readout/ReadoutTopBar";
import { ReadoutFooter } from "../readout/ReadoutFooter";
import { FooterSlotContext } from "../readout/footer-slot";
import { useReadoutKeys } from "../readout/useReadoutKeys";

export function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();
  // Held in state rather than a ref so the pages re-render once it exists.
  const [footerSlot, setFooterSlot] = useState<HTMLDivElement | null>(null);

  // The address is the one source of the week. Every page has its own URL, so a
  // bookmarked or shared link has to open on the week it names, and editing the
  // week in the address has to change what is shown - a copy held in state
  // would drift from it.
  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(new Date().getFullYear());

  const setCurrentWeek = (week: number) =>
    setSearchParams({ week: week.toString() });

  useReadoutKeys(currentWeek);

  // The frame is the window, floored at the height the states were drawn for
  // and free to grow past it when a state needs the room. Nothing clips: what
  // does not fit scrolls the page.
  return (
    <div className="flex min-h-frame flex-col bg-sheet">
      <ReadoutTopBar
        currentWeek={currentWeek}
        onWeekChange={setCurrentWeek}
      />
      <main className="flex flex-1 flex-col">
        <FooterSlotContext.Provider value={footerSlot}>
          <Outlet context={{ isDecrypted: true }} />
        </FooterSlotContext.Provider>
      </main>
      <ReadoutFooter onActionsSlot={setFooterSlot} />
    </div>
  );
}
