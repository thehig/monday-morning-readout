"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePOFeedbackByWeek } from "@/hooks/use-po-feedback";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";
import { formatEmailDisplayName } from "@/lib/utils";
import { getDateTimeProps } from "@/lib/date-utils";
import {
  Thermometer,
  HappinessIndicator,
  VelocityIndicator,
} from "@/components/indicators";
import { TechnicalDetails } from "@/components/feedback/TechnicalDetails";

function FeedbackContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const week = parseInt(searchParams.get("week") || "1", 10);
  const id = searchParams.get("id");
  const { data: weeklyFeedback } = usePOFeedbackByWeek(week);

  const feedback = weeklyFeedback?.find((f) => f.id.toString() === id);

  if (!feedback) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-gray-500">Feedback not found</div>
      </div>
    );
  }

  const displayName = formatEmailDisplayName(feedback.submitted_by);
  const submissionDate = new Date(feedback.created_at);
  const { dateTime, title, relativeTime } = getDateTimeProps(submissionDate);

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto p-4 lg:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:p-8"
        >
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={() => router.back()}
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
                <span className="text-sm text-gray-500">ID: {feedback.id}</span>
              </div>
              <p className="text-sm text-gray-500">Calendar Week {week}</p>
            </div>
          </div>

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
                    <div className="font-medium text-gray-900">
                      {displayName}
                    </div>
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
                  <div className="text-sm text-amber-600">
                    Current challenges
                  </div>
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
                <div
                  className={`p-4 rounded-lg border ${
                    feedback.ps_call_needed === "JA"
                      ? "bg-yellow-50/50 border-yellow-100 border-l-4 border-l-yellow-400"
                      : "bg-emerald-50/50 border-emerald-100"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-4 h-4 rounded-full ${
                        feedback.ps_call_needed === "JA"
                          ? "bg-yellow-400 animate-pulse"
                          : "bg-emerald-500"
                      }`}
                    />
                    <span
                      className={`font-medium ${
                        feedback.ps_call_needed === "JA"
                          ? "text-yellow-700"
                          : "text-emerald-700"
                      }`}
                    >
                      PS Call{" "}
                      {feedback.ps_call_needed === "JA"
                        ? "Needed"
                        : "Not Needed"}
                    </span>
                  </div>
                  {feedback.ps_call_context && (
                    <div className="mt-4 pl-7 prose prose-sm max-w-none text-gray-600 whitespace-pre-wrap">
                      {feedback.ps_call_context}
                    </div>
                  )}
                  {!feedback.ps_call_context &&
                    feedback.ps_call_needed === "JA" && (
                      <div className="mt-4 pl-7 text-gray-400">
                        No additional context provided
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
          />

          {/* End of content */}
        </motion.div>
      </div>
    </div>
  );
}

export function FeedbackContent() {
  return (
    <Suspense fallback={<div>Loading feedback...</div>}>
      <FeedbackContentInner />
    </Suspense>
  );
}
