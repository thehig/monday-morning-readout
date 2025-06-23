import { motion } from "framer-motion";
import {
  VelocityIndicator,
  HappinessIndicator,
  Thermometer,
} from "../../indicators";
import { formatEmailDisplayName, formatAmount } from "../../../lib/utils";
import { getDateTimeProps } from "../../../lib/date-utils";
import { TechnicalDetails } from "./TechnicalDetails";
import type { POFeedback, AggregatedPOFeedback } from "../../../types/feedback";
import { FeedbackContentProps } from "../../../types/components";

function isAggregatedFeedback(
  feedback: POFeedback | AggregatedPOFeedback
): feedback is AggregatedPOFeedback {
  return "all_submission_dates" in feedback;
}

export function FeedbackContent({
  feedback,
  week,
  allFeedbackIds,
}: FeedbackContentProps) {
  const displayName = formatEmailDisplayName(feedback.submitted_by);
  const customerName = feedback.customer || "Unknown Customer";
  const submissionDate = new Date(feedback.created_at);
  const { dateTime, title, relativeTime } = getDateTimeProps(submissionDate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8 mb-6"
    >
      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
        {/* Left Column - Status & Progress */}
        <div className="space-y-6">
          {/* Customer & Submitter Info */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Customer & Submission Details
            </h2>
            <div className="space-y-3">
              {/* Customer Info */}
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-medium text-sm">
                      {customerName
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900">
                      Customer: {customerName}
                    </div>
                  </div>
                </div>
              </div>

              {/* Submitter Info */}
              <div className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                <div
                  className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center shrink-0"
                  title={feedback.submitted_by}
                >
                  <span className="text-gray-600 font-medium">
                    {displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                </div>
                <div className="min-w-0">
                  <div className="font-medium text-gray-900">{displayName}</div>
                  <div className="text-sm text-gray-500 break-all">
                    {feedback.submitted_by}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    <time dateTime={dateTime} title={title}>
                      {title}
                    </time>
                    <span className="text-gray-400"> · </span>
                    <span title={title}>{relativeTime}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Amount Charged */}
          {feedback.amount_charged && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-2">
                Amount Charged This Week
              </h2>
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {formatAmount(feedback.amount_charged)}
                  </span>
                  <span className="text-sm text-gray-500">
                    Invoiced for week {feedback.week_number}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Progress Section */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Cycle Progress
              </h2>
              <div
                className="text-sm text-gray-500"
                title="Current progress percentage"
              >
                {feedback.progress_percent}% Complete
              </div>
            </div>
            <Thermometer value={feedback.progress_percent} />
          </div>

          {/* Milestones Done */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Completed Milestones
              </h2>
              <div className="text-sm text-emerald-600">
                Week {week} achievements
              </div>
            </div>
            <div className="p-4 bg-emerald-50/50 rounded-lg border border-emerald-100">
              {feedback.milestones_done ? (
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {feedback.milestones_done}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No milestones reported for this week
                </div>
              )}
            </div>
          </div>

          {/* Risks */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Identified Risks
              </h2>
              <div className="text-sm text-amber-600">Current challenges</div>
            </div>
            <div className="p-4 bg-amber-50/50 rounded-lg border border-amber-100 border-l-4 border-l-amber-400">
              {feedback.risks ? (
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {feedback.risks}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No risks identified for this period
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Metrics & Planning */}
        <div className="space-y-6">
          {/* Happiness Metrics */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Team & Customer Satisfaction
              </h2>
              <div className="text-sm text-gray-500">
                Average:{" "}
                {(
                  (feedback.team_happiness + feedback.customer_happiness) /
                  2
                ).toFixed(1)}
                /5
              </div>
            </div>
            <div className="grid grid-cols-2 gap-8 p-4 bg-gray-50 rounded-lg">
              <div>
                <HappinessIndicator
                  value={feedback.team_happiness}
                  type="team"
                />
              </div>
              <div>
                <HappinessIndicator
                  value={feedback.customer_happiness}
                  type="customer"
                />
              </div>
            </div>
          </div>

          {/* Velocity Prediction */}
          {feedback.velocity_next_week && (
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">
                Next Week&apos;s Velocity Prediction
              </h2>
              <div className="p-4 bg-gray-50 rounded-lg">
                <VelocityIndicator velocity={feedback.velocity_next_week} />
              </div>
            </div>
          )}

          {/* Next Week's Goals */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Goals for Next Week
              </h2>
              <div className="text-sm text-blue-600">
                Week {week + 1} planning
              </div>
            </div>
            <div className="p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              {feedback.goals_next_week ? (
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {feedback.goals_next_week}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No goals set for next week
                </div>
              )}
            </div>
          </div>

          {/* PS Call Status */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                PS Call Requirement
              </h2>
              <div className="text-sm text-purple-600">Problem Solving</div>
            </div>
            <div className="p-4 bg-purple-50/50 rounded-lg border border-purple-100">
              {feedback.ps_call_status ? (
                <div className="prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                  {feedback.ps_call_status}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-400">
                  No PS call status reported
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Technical Details Panel */}
      <TechnicalDetails
        id={feedback.id}
        week={week}
        submissionDate={submissionDate}
        createdAt={feedback.created_at}
        submittedBy={feedback.submitted_by}
        relativeTime={relativeTime}
        allSubmissionDates={
          isAggregatedFeedback(feedback)
            ? feedback.all_submission_dates
            : undefined
        }
        isAggregated={isAggregatedFeedback(feedback)}
        allIds={allFeedbackIds}
      />
    </motion.div>
  );
}
