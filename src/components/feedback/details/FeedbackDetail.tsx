import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { usePOFeedbackById } from "../../../hooks/use-po-feedback";
import { toEngagement } from "../../../lib/engagements";
import { Stop } from "../../readout/stop/Stop";

/** Route wrapper: loads one submission and hands it to the Stop screen. */
export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = parseInt(searchParams.get("week") || "1", 10);

  const { data, isLoading, isError } = usePOFeedbackById(id, true);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-xl text-ink-3">
        Loading…
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <p className="text-xl text-late-ink">That submission could not be loaded.</p>
        <button
          type="button"
          onClick={() => navigate(`/?week=${week}`)}
          className="flex items-center gap-2 rounded border-2 border-sheet-rule bg-sheet-card px-4 py-2 text-lg font-medium text-ink-2"
        >
          <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
          Back to the wall
        </button>
      </div>
    );
  }

  return <Stop engagement={toEngagement(data)} currentWeek={week} />;
}
