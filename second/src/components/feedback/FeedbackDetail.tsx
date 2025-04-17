import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { VelocityIndicator } from "../indicators";
import { aggregateFeedbackByEmail } from "../../lib/utils";
import { useQueries } from "@tanstack/react-query";
import { getSupabase } from "../../lib/supabase/client";
import type { POFeedback } from "../../types/feedback";

interface FeedbackDetailProps {
  feedback: POFeedback[];
  shouldAggregate: boolean;
}

export function FeedbackDetail({
  feedback: feedbackProp,
  shouldAggregate,
}: FeedbackDetailProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = searchParams.get("week");

  // Split IDs and fetch all feedback entries
  const ids = id?.split(",") || [];
  const feedbackQueries = useQueries({
    queries: ids.map((feedbackId) => ({
      queryKey: ["po-feedback", feedbackId],
      queryFn: async () => {
        const { data, error } = await getSupabase()
          .from("po_feedback")
          .select("*")
          .eq("id", parseInt(feedbackId))
          .single();

        if (error) throw error;
        return data as POFeedback;
      },
      enabled: !!feedbackId,
    })),
  });

  const isLoading = feedbackQueries.some((query) => query.isLoading);
  const queryHasError = feedbackQueries.some((query) => query.isError);
  const queryFeedback = feedbackQueries
    .filter((query) => query.data)
    .map((query) => query.data as POFeedback);

  // Use either queried feedback or prop feedback based on context
  const feedback =
    ids.length > 0
      ? shouldAggregate && queryFeedback.length > 0
        ? aggregateFeedbackByEmail(queryFeedback)[0]
        : queryFeedback[0]
      : shouldAggregate && feedbackProp.length > 0
      ? aggregateFeedbackByEmail(feedbackProp)[0]
      : feedbackProp[0];

  const handleBack = () => {
    navigate(week ? `/?week=${week}` : "/");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading feedback...</div>
      </div>
    );
  }

  if (queryHasError || !feedback) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <div className="text-gray-600">Feedback not found</div>
        <Button onClick={handleBack} variant="outline">
          <ChevronLeftIcon className="w-4 h-4" />
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {feedback.submitted_by}
            </h1>
            <p className="text-gray-500">
              {new Date(feedback.created_at).toLocaleDateString()}
            </p>
          </div>
          <VelocityIndicator velocity={feedback.velocity_next_week} />
        </div>

        <div className="grid gap-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Progress</h2>
            <div className="bg-gray-100 rounded-full h-4">
              <div
                className="bg-blue-500 rounded-full h-4"
                style={{ width: `${feedback.progress_percent}%` }}
              />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              {feedback.progress_percent}% Complete
            </p>
          </div>

          <div>
            <h2 className="text-lg font-medium mb-2">Happiness Scores</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Team Happiness</p>
                <p className="text-xl font-medium">
                  {feedback.team_happiness}/5
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Customer Happiness</p>
                <p className="text-xl font-medium">
                  {feedback.customer_happiness}/5
                </p>
              </div>
            </div>
          </div>

          {feedback.milestones_done && (
            <div>
              <h2 className="text-lg font-medium mb-2">Milestones Completed</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {feedback.milestones_done}
              </p>
            </div>
          )}

          {feedback.risks && (
            <div>
              <h2 className="text-lg font-medium mb-2">Risks & Challenges</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {feedback.risks}
              </p>
            </div>
          )}

          {feedback.goals_next_week && (
            <div>
              <h2 className="text-lg font-medium mb-2">Next Week's Goals</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {feedback.goals_next_week}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
