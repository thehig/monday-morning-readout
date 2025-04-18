import React from "react";
import { POFeedback } from "../types/feedback";
import { aggregateFeedbackByEmail } from "../lib/utils";
import { MetricCard } from "./MetricCard";
import { VelocityIndicator } from "./VelocityIndicator";

interface FeedbackContentProps {
  feedback: POFeedback;
  isAggregated?: boolean;
}

const FeedbackContent: React.FC<FeedbackContentProps> = ({
  feedback,
  isAggregated,
}) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">
            Submitted by {feedback.submitted_by}
          </h3>
          {isAggregated && feedback.all_submission_dates ? (
            <p className="text-sm text-gray-500">
              Submissions:{" "}
              {feedback.all_submission_dates.map(formatDate).join(", ")}
            </p>
          ) : (
            <p className="text-sm text-gray-500">
              Date: {formatDate(feedback.created_at)}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <MetricCard
          title="Sprint Progress"
          value={`${feedback.progress_percent}%`}
          description={isAggregated ? "Average progress" : undefined}
        />
        <MetricCard
          title="Team Happiness"
          value={feedback.team_happiness.toString()}
          description={isAggregated ? "Average happiness" : undefined}
        />
        <MetricCard
          title="Customer Happiness"
          value={feedback.customer_happiness.toString()}
          description={isAggregated ? "Average happiness" : undefined}
        />
      </div>

      <div className="space-y-4">
        {feedback.milestones_done && (
          <TextSection
            title="Milestones Done"
            content={feedback.milestones_done}
          />
        )}
        {feedback.risks && (
          <TextSection title="Risks" content={feedback.risks} />
        )}
        {feedback.goals_next_week && (
          <TextSection
            title="Goals Next Week"
            content={feedback.goals_next_week}
          />
        )}
        {feedback.ps_call_status && (
          <TextSection
            title="PS Call Status"
            content={feedback.ps_call_status}
          />
        )}
      </div>

      <div className="mt-4">
        <VelocityIndicator velocity={feedback.velocity_next_week} />
      </div>
    </div>
  );
};

const TextSection: React.FC<{ title: string; content: string }> = ({
  title,
  content,
}) => (
  <div>
    <h4 className="font-medium mb-2">{title}</h4>
    <div className="whitespace-pre-wrap text-gray-700">{content}</div>
  </div>
);

interface FeedbackDetailProps {
  feedbackList: POFeedback[];
  shouldAggregate?: boolean;
}

export const FeedbackDetail: React.FC<FeedbackDetailProps> = ({
  feedbackList,
  shouldAggregate,
}) => {
  if (!feedbackList?.length) {
    return <div>No feedback available</div>;
  }

  if (shouldAggregate) {
    const aggregatedFeedback = aggregateFeedbackByEmail(feedbackList);
    return (
      <div className="space-y-8">
        {aggregatedFeedback.map((feedback) => (
          <div
            key={feedback.submitted_by}
            className="bg-white p-6 rounded-lg shadow"
          >
            <FeedbackContent feedback={feedback} isAggregated={true} />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {feedbackList.map((feedback) => (
        <div
          key={`${feedback.submitted_by}-${feedback.created_at}`}
          className="bg-white p-6 rounded-lg shadow"
        >
          <FeedbackContent feedback={feedback} isAggregated={false} />
        </div>
      ))}
    </div>
  );
};
