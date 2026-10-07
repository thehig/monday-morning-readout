import { useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../lib/date-utils";
import { toEngagements, summarise } from "../../lib/engagements";
import { RankedGrid } from "../readout/wall/RankedGrid";

/**
 * The Wall: the state the Monday call opens on.
 *
 * One screen, no scrolling, worst schedule first. The week comes from the URL
 * so a particular week can be linked to.
 */
export function Dashboard() {
  const [searchParams] = useSearchParams();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(new Date().getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);
  const totals = summarise(engagements);

  if (isLoading) {
    return (
      <div className="p-8 text-xl text-ink-3">Loading week {currentWeek}…</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-baseline gap-4 border-b-2 border-sheet-rule bg-sheet-card px-6 py-3">
        <h2 className="text-xl font-bold tracking-tight">
          {totals.needingDecision > 0 ? "Needs a decision first" : "All on the date"}
        </h2>
        <span className="text-lg tabular-nums text-ink-3">
          {totals.needingDecision} of {totals.engagements}
        </span>
        {totals.contradicting > 0 && (
          <span className="ml-auto text-lg text-late-ink">
            {totals.contradicting} report themselves on track with an estimate past the deadline
          </span>
        )}
      </div>

      <RankedGrid engagements={engagements} currentWeek={currentWeek} />
    </div>
  );
}
