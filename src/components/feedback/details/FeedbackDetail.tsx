import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  usePOFeedbackById,
  usePOFeedbackByWeek,
} from "../../../hooks/use-po-feedback";
import { toEngagement, toEngagements } from "../../../lib/engagements";
import { stepPosition } from "../../../lib/stepping";
import { Stop } from "../../readout/stop/Stop";
import { HOME, pageUrl } from "../../readout/pages";

/**
 * Route wrapper for the Stop.
 *
 * Loads the whole week rather than the single submission, so the arrow keys
 * step in exactly the order the Wall shows. React Query has already cached that
 * query from the Wall, so it costs nothing and guarantees the two screens
 * agree. A link to an engagement outside the week still works: it falls back to
 * fetching that one row, without stepping.
 */
export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = parseInt(searchParams.get("week") || "1", 10);
  const wanted = Number(id);

  const { data: weekRows, isLoading: weekLoading } = usePOFeedbackByWeek(
    week,
    true
  );
  const engagements = toEngagements(weekRows);
  const fromWeek = engagements.find((e) => e.id === wanted);

  const { data: single, isLoading: singleLoading } = usePOFeedbackById(
    id,
    !weekLoading && !fromWeek
  );

  if (weekLoading || (!fromWeek && singleLoading)) {
    return (
      <div className="flex flex-1 items-center justify-center text-xl text-ink-3">
        Loading…
      </div>
    );
  }

  const engagement = fromWeek ?? (single ? toEngagement(single) : null);

  if (!engagement) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-xl text-late-ink">
          That submission could not be loaded.
        </p>
        <button
          type="button"
          onClick={() => navigate(pageUrl(HOME, week))}
          className="flex items-center gap-2 rounded border-2 border-sheet-rule bg-sheet-card px-4 py-2 text-lg font-medium text-ink-2"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          Back to the ranked grid
        </button>
      </div>
    );
  }

  return (
    <Stop
      engagement={engagement}
      currentWeek={week}
      step={fromWeek ? stepPosition(engagements, wanted) : null}
    />
  );
}
