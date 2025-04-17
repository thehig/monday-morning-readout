import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "../ui/button";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { VelocityIndicator } from "../indicators";
import { usePOFeedbackById } from "../../hooks/use-po-feedback";
import type { Database } from "../../types/supabase";
import { useState } from "react";
import { Toggle } from "../ui/toggle";
import { aggregateFeedbackByEmail } from "../../lib/utils";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = searchParams.get("week");
  const [shouldAggregate, setShouldAggregate] = useState(true);

  // Split the ID parameter into an array if it contains commas
  const ids = id?.includes(",") ? id.split(",") : id;

  const {
    data: feedbackData,
    isLoading,
    isError,
  } = usePOFeedbackById(ids, true);

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

  if (isError || !feedbackData) {
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

  // If we have multiple feedback items and aggregation is enabled, aggregate them
  const feedback =
    Array.isArray(feedbackData) && shouldAggregate
      ? aggregateFeedbackByEmail(feedbackData)[0]
      : Array.isArray(feedbackData)
      ? feedbackData[0]
      : feedbackData;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="mb-6 flex justify-between items-center">
        <Button onClick={handleBack} variant="outline" className="mb-4">
          <ChevronLeftIcon className="w-4 h-4 mr-2" />
          Back to Overview
        </Button>
        {Array.isArray(feedbackData) && feedbackData.length > 1 && (
          <Toggle
            enabled={shouldAggregate}
            onChange={setShouldAggregate}
            label="Aggregate Feedback"
          />
        )}
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
            {Array.isArray(feedbackData) &&
              feedbackData.length > 1 &&
              !shouldAggregate && (
                <p className="text-sm text-blue-600 mt-1">
                  Showing 1 of {feedbackData.length} updates
                </p>
              )}
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
