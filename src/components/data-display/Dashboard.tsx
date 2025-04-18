import { useSearchParams, useOutletContext } from "react-router-dom";
import {
  usePOFeedbackByWeek,
  getCurrentWeek,
} from "../../hooks/use-po-feedback";
import { FeedbackCard } from "../feedback/FeedbackCard";
import { aggregateFeedbackByEmail } from "../../lib/utils";
import type { Database } from "../../types/supabase";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export function Dashboard() {
  const [searchParams] = useSearchParams();
  const { shouldAggregate } = useOutletContext<{
    isDecrypted: boolean;
    shouldAggregate: boolean;
    setShouldAggregate: (value: boolean) => void;
  }>();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getCurrentWeek(new Date().getFullYear());

  const { data: weeklyFeedback, isLoading } = usePOFeedbackByWeek(
    currentWeek,
    true
  );

  const displayFeedback: POFeedback[] =
    shouldAggregate && weeklyFeedback
      ? aggregateFeedbackByEmail(weeklyFeedback)
      : weeklyFeedback || [];

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-center text-gray-600">
          Loading feedback data...
        </div>
      ) : weeklyFeedback && weeklyFeedback.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
          {displayFeedback.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              currentWeek={currentWeek}
              allFeedback={weeklyFeedback}
              shouldAggregate={shouldAggregate}
            />
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-600">
          No feedback found for week {currentWeek}
        </div>
      )}
    </div>
  );
}
