"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePOFeedbackByWeek } from "@/hooks/use-po-feedback";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import { Suspense } from "react";

function Thermometer({ value }: { value: number }) {
  return (
    <div
      className="relative h-6 w-full bg-gray-200 rounded-full overflow-hidden"
      title={`Progress: ${value}% complete`}
    >
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="absolute left-0 h-full bg-blue-500 rounded-full"
      />
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-sm font-bold text-white drop-shadow">
          {value}%
        </span>
      </div>
    </div>
  );
}

function HappinessIndicator({
  value,
  type,
}: {
  value: number;
  type: "team" | "customer";
}) {
  const emojis = ["😢", "😕", "😐", "🙂", "😊"];
  const emojiIndex = Math.min(
    Math.floor(((value - 1) / 4) * (emojis.length - 1)),
    emojis.length - 1
  );
  const emoji = emojis[emojiIndex];
  const color = type === "team" ? "text-red-500" : "text-green-500";
  const label = type === "team" ? "Team Happiness" : "Customer Happiness";

  return (
    <div className="flex flex-col items-center" title={`${label}: ${value}/5`}>
      <span className="text-3xl mb-1">{emoji}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}/5</span>
    </div>
  );
}

function VelocityIndicator({
  velocity,
}: {
  velocity: "Rot" | "Gelb" | "Grün";
}) {
  const colors = {
    Rot: "bg-red-500",
    Gelb: "bg-yellow-400",
    Grün: "bg-green-500",
  };

  const labels = {
    Rot: "Low velocity expected",
    Gelb: "Medium velocity expected",
    Grün: "High velocity expected",
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`w-4 h-4 rounded-full ${colors[velocity]} animate-pulse`}
        title={labels[velocity]}
      />
      <span className="text-sm text-gray-600">{labels[velocity]}</span>
    </div>
  );
}

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

  // Extract name from email
  const displayName = feedback.submitted_by
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");

  // Format date with time
  const submissionDate = new Date(feedback.created_at);
  const formattedDate = submissionDate.toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const formattedTime = submissionDate.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });

  // Calculate relative time
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const daysAgo = Math.floor(
    (Date.now() - submissionDate.getTime()) / (1000 * 60 * 60 * 24)
  );
  const relativeTime = rtf.format(-daysAgo, "day");

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
                      <time
                        dateTime={feedback.created_at}
                        title={`${formattedDate} at ${formattedTime}`}
                      >
                        {formattedDate} at {formattedTime}
                      </time>
                      <span className="text-gray-400"> · </span>
                      <span title={formattedDate}>{relativeTime}</span>
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
          <div className="mt-8 pt-6 border-t border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-medium text-gray-500">
                Technical Details
              </h2>
              <div className="text-xs text-gray-400">System Information</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Feedback ID</div>
                <div className="font-mono text-gray-600">{feedback.id}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Calendar Week</div>
                <div className="font-mono text-gray-600">{week}</div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Submission Time</div>
                <div className="font-mono text-gray-600">
                  {submissionDate.toLocaleTimeString(undefined, {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Submission Date</div>
                <div className="font-mono text-gray-600">
                  {submissionDate.toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Raw Timestamp</div>
                <div className="font-mono text-gray-600">
                  {feedback.created_at}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-xs text-gray-400">Submitter Email</div>
                <div
                  className="font-mono text-gray-600 truncate"
                  title={feedback.submitted_by}
                >
                  {feedback.submitted_by}
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center gap-2 text-xs text-gray-400">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>Last updated: {relativeTime}</span>
            </div>
          </div>

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
