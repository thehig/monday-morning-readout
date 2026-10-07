import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getWeekRange, formatDate, getCurrentWeek } from "../../lib/date-utils";

interface ReadoutTopBarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
  /** Receives the node the current state renders its view switcher into. */
  onActionsSlot: (slot: HTMLDivElement | null) => void;
}

const TOTAL_WEEKS = 52;

/**
 * The navy bar every state shares. Large enough to read in a shared video
 * call: the smallest thing here is 19px.
 */
export function ReadoutTopBar({
  currentWeek,
  onWeekChange,
  onActionsSlot,
}: ReadoutTopBarProps) {
  const year = new Date().getFullYear();
  const { start, end } = getWeekRange(currentWeek, year);
  const isCurrent = currentWeek === getCurrentWeek(year);

  return (
    // Sticky because in a window short enough to scroll, the week being read
    // out is the one piece of context the room needs kept on screen.
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center justify-between gap-6 bg-navy px-8 text-white">
      <span className="text-2xl font-extrabold tracking-tight text-brand">
        United Signals
      </span>

      <div className="flex items-center gap-4" role="group" aria-label="Week navigation">
        <button
          type="button"
          onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
          disabled={currentWeek <= 1}
          aria-label="Previous week"
          className="rounded border border-navy-line p-1.5 text-white transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
        </button>

        <div className="text-center" aria-live="polite">
          <div className="text-xl font-semibold leading-tight">
            Week {currentWeek}
            {isCurrent && (
              <span className="ml-2 text-[18px] font-normal text-brand">current</span>
            )}
          </div>
          <div className="text-[18px] tabular-nums text-white/70">
            {formatDate(start)} &ndash; {formatDate(end)}
          </div>
        </div>

        <button
          type="button"
          onClick={() => onWeekChange(Math.min(TOTAL_WEEKS, currentWeek + 1))}
          disabled={currentWeek >= TOTAL_WEEKS}
          aria-label="Next week"
          className="rounded border border-navy-line p-1.5 text-white transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* The current state fills this with its own view switcher. */}
      <div
        ref={onActionsSlot}
        className="flex min-w-[280px] items-center justify-end gap-4"
      />
    </header>
  );
}
