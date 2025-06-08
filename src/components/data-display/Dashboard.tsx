import { useSearchParams } from "react-router-dom";
import {
  usePOFeedbackByWeek,
  getCurrentWeek,
} from "../../hooks/use-po-feedback";
import { FeedbackCard } from "../feedback/cards/FeedbackCard";

export function Dashboard() {
  const [searchParams] = useSearchParams();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getCurrentWeek(new Date().getFullYear());

  const { data: weeklyFeedback, isLoading } = usePOFeedbackByWeek(
    currentWeek,
    true
  );

  return (
    <div className="p-4">
      {isLoading ? (
        <div className="text-center text-gray-600">
          Loading feedback data...
        </div>
      ) : weeklyFeedback && weeklyFeedback.length > 0 ? (
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
          {weeklyFeedback.map((feedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              currentWeek={currentWeek}
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
