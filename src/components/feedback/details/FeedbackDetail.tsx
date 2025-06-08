import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { usePOFeedbackById } from "../../../hooks/use-po-feedback";
import { FeedbackContent } from "./FeedbackContent";

export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = parseInt(searchParams.get("week") || "1", 10);

  const {
    data: feedbackData,
    isLoading,
    isError,
  } = usePOFeedbackById(id, true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  if (isError || !feedbackData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <div className="text-red-500">Error loading feedback</div>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
        >
          <ChevronLeftIcon className="w-4 h-4" />
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(`/?week=${week}`)}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="Return to overview"
          >
            <ChevronLeftIcon className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <div className="flex items-baseline justify-between">
              <h1 className="text-2xl font-semibold text-gray-900">
                Feedback Details
              </h1>
            </div>
            <p className="text-sm text-gray-500">Calendar Week {week}</p>
          </div>
        </div>

        {/* Feedback Content */}
        <FeedbackContent
          feedback={
            Array.isArray(feedbackData) ? feedbackData[0] : feedbackData
          }
          week={week}
          allFeedbackIds={undefined}
        />
      </div>
    </div>
  );
}
