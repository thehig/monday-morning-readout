import {
  ArrowPathIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/outline";
import { useIsFetching, useQueryClient } from "@tanstack/react-query";
import { getWeekRange, formatDate, getCurrentWeek } from "../../lib/date-utils";
import { ReadoutNav } from "./ReadoutNav";
import logo from "../../logo.svg";

interface ReadoutTopBarProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

const TOTAL_WEEKS = 52;

const ROUND_BUTTON =
  "flex h-10 w-10 items-center justify-center rounded-full bg-white/[0.09] text-white transition-colors hover:bg-white/20 disabled:opacity-40";

/**
 * Fetches every loaded week and engagement again. Feedback filed during the
 * call shows up without reloading the page, which would ask for the password
 * again.
 */
function ReloadButton() {
  const queryClient = useQueryClient();
  const fetching = useIsFetching({ queryKey: ["po-feedback"] }) > 0;

  return (
    <button
      type="button"
      onClick={() => queryClient.invalidateQueries({ queryKey: ["po-feedback"] })}
      disabled={fetching}
      aria-label="Reload from the API"
      title="Reload from the API"
      className={ROUND_BUTTON}
    >
      <ArrowPathIcon
        className={`h-5 w-5 ${fetching ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
    </button>
  );
}

/**
 * The navy bar every page shares: the logo and the pages on the left, the
 * week and a reload on the right. Large enough to read in a shared video call.
 */
export function ReadoutTopBar({
  currentWeek,
  onWeekChange,
}: ReadoutTopBarProps) {
  const year = new Date().getFullYear();
  const { start, end } = getWeekRange(currentWeek, year);
  const isCurrent = currentWeek === getCurrentWeek(year);

  return (
    // Sticky because in a window short enough to scroll, the week being read
    // out is the one piece of context the room needs kept on screen.
    <header className="sticky top-0 z-20 flex h-[72px] shrink-0 items-center gap-10 bg-navy px-8 text-white">
      {/*
        Imported rather than referenced by path, so the build inlines it as a
        data URI and the readout stays one self-contained HTML file.
      */}
      <img src={logo} alt="United Signals" className="h-8 w-auto shrink-0" />

      <ReadoutNav currentWeek={currentWeek} />

      <div className="ml-auto flex items-center gap-[18px]">
        <ReloadButton />

        <span className="h-8 w-px bg-white/20" aria-hidden="true" />

        <div className="flex items-center gap-3" role="group" aria-label="Week navigation">
          <button
            type="button"
            onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
            disabled={currentWeek <= 1}
            aria-label="Previous week"
            className={ROUND_BUTTON}
          >
            <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          </button>

          <div
            className="flex min-w-[250px] items-baseline justify-center gap-3"
            aria-live="polite"
          >
            <span className="text-[21px] font-bold">Week {currentWeek}</span>
            <span className="text-[18px] tabular-nums text-white/70">
              {formatDate(start)} &ndash; {formatDate(end)}
            </span>
            {isCurrent && <span className="text-[18px] text-brand">current</span>}
          </div>

          <button
            type="button"
            onClick={() => onWeekChange(Math.min(TOTAL_WEEKS, currentWeek + 1))}
            disabled={currentWeek >= TOTAL_WEEKS}
            aria-label="Next week"
            className={ROUND_BUTTON}
          >
            <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
