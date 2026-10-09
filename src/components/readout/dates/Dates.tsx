import { useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../../lib/date-utils";
import { toEngagements } from "../../../lib/engagements";
import { OwnerRunway } from "./OwnerRunway";

/**
 * The owner runway page: what is coming, and who has to deliver it.
 *
 * Deliberately not a second Ladder. The Ladder looks back at the week just
 * filed against the agreed deadlines; this looks forward, placing each
 * engagement by its estimated completion date in its owner's lane.
 */
export function Dates() {
  const [searchParams] = useSearchParams();
  const today = new Date();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(today.getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);

  if (isLoading) {
    return (
      <div className="p-8 text-xl text-ink-3">Loading week {currentWeek}…</div>
    );
  }

  return (
    <div className="flex flex-1 flex-col pt-5">
      {engagements.length === 0 ? (
        <p className="p-8 text-xl text-ink-3">
          No submissions for week {currentWeek}.
        </p>
      ) : (
        <OwnerRunway engagements={engagements} today={today} />
      )}
    </div>
  );
}
