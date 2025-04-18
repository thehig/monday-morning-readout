import {
  useParams,
  useNavigate,
  useSearchParams,
  useOutletContext,
} from "react-router-dom";
import { motion } from "framer-motion";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import {
  VelocityIndicator,
  Thermometer,
  HappinessIndicator,
} from "../indicators";
import { usePOFeedbackById } from "../../hooks/use-po-feedback";
import { formatEmailDisplayName } from "../../lib/utils";
import { getDateTimeProps } from "../../lib/date-utils";
import { TechnicalDetails } from "./TechnicalDetails";
import { aggregateFeedbackByEmail } from "../../lib/utils";
import type { POFeedback } from "../../types/feedback";

function FeedbackContent({
  feedback,
  week,
  allFeedbackIds,
}: {
  feedback: POFeedback;
  week: number;
  allFeedbackIds?: string[];
}) {
  const displayName = formatEmailDisplayName(feedback.submitted_by);
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
          {/* Submitter Info */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Submitted by
            </h2>
            <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-lg">
              <div
                className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0"
                title={feedback.submitted_by}
              >
                <span className="text-blue-600 font-medium">
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

          {/* Progress Section */}
          <div>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Sprint Progress
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
                <div className="text-sm text-gray-500 text-center mb-2">
                  Team Satisfaction
                </div>
                <HappinessIndicator
                  value={feedback.team_happiness}
                  type="team"
                />
              </div>
              <div>
                <div className="text-sm text-gray-500 text-center mb-2">
                  Customer Satisfaction
                </div>
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
                PS Call Status
              </h2>
              <div className="text-sm text-purple-600">
                Professional Services Support
              </div>
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
        allSubmissionDates={feedback.all_submission_dates}
        isAggregated={Boolean(
          feedback.all_submission_dates &&
            feedback.all_submission_dates.length > 1
        )}
        allIds={allFeedbackIds}
      />
    </motion.div>
  );
}

export function FeedbackDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const week = parseInt(searchParams.get("week") || "1", 10);
  const { shouldAggregate } = useOutletContext<{
    isDecrypted: boolean;
    shouldAggregate: boolean;
    setShouldAggregate: (value: boolean) => void;
  }>();

  // Split the ID parameter into an array if it contains commas
  const ids = id?.includes(",") ? id.split(",") : id;

  const {
    data: feedbackData,
    isLoading,
    isError,
  } = usePOFeedbackById(ids, true);

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

  const feedbackArray = Array.isArray(feedbackData)
    ? feedbackData
    : [feedbackData];
  const aggregatedFeedback = shouldAggregate
    ? aggregateFeedbackByEmail(feedbackArray)[0]
    : null;

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
        {shouldAggregate && aggregatedFeedback ? (
          <FeedbackContent
            feedback={aggregatedFeedback}
            week={week}
            allFeedbackIds={feedbackArray.map((f) => f.id)}
          />
        ) : (
          feedbackArray.map((feedback) => (
            <FeedbackContent
              key={feedback.id}
              feedback={feedback}
              week={week}
              allFeedbackIds={undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
