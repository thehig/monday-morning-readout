"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { usePOFeedbackByWeek } from "@/hooks/use-po-feedback";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { Database } from "@/types/supabase";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

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
    Math.floor((value / 10) * (emojis.length - 1)),
    emojis.length - 1
  );
  const emoji = emojis[emojiIndex];
  const color = type === "team" ? "text-red-500" : "text-green-500";
  const label = type === "team" ? "Team Happiness" : "Customer Happiness";

  return (
    <div className="flex flex-col items-center" title={`${label}: ${value}/10`}>
      <span className="text-3xl mb-1">{emoji}</span>
      <span className={`text-lg font-semibold ${color}`}>{value}/10</span>
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

export default function FeedbackDetail() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const week = parseInt(searchParams.get("week") || "1", 10);
  const { data: weeklyFeedback } = usePOFeedbackByWeek(week);

  const feedback = weeklyFeedback?.find((f) => f.id.toString() === params.id);

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
    <div className="bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-sm border border-gray-100 p-8"
        >
          {/* Header with back button */}
          <div className="flex items-center gap-4 mb-8">
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

          {/* Submitter Info */}
          <div className="mb-8">
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
          <div className="mb-8">
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

          {/* Happiness Metrics */}
          <div className="mb-8">
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
                /10
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
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Next Week&apos;s Velocity Prediction
            </h2>
            <div className="p-4 bg-gray-50 rounded-lg">
              <VelocityIndicator velocity={feedback.velocity_next_week} />
            </div>
          </div>

          {/* Goals and Milestones */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Goals & Milestones
            </h2>
            <div className="space-y-6">
              {/* Completed Milestones */}
              <div className="p-4 bg-green-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Completed Milestones
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {feedback.milestones_done || "No milestones reported"}
                </p>
              </div>

              {/* Next Week's Goals */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Goals for Next Week
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {feedback.goals_next_week || "No goals specified"}
                </p>
              </div>
            </div>
          </div>

          {/* Risks & Support */}
          <div className="mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Risks & Support Status
            </h2>
            <div className="space-y-6">
              {/* Risks */}
              {feedback.risks && (
                <div className="p-4 bg-red-50 rounded-lg">
                  <h3 className="font-medium text-gray-900 mb-2">
                    Identified Risks
                  </h3>
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {feedback.risks}
                  </p>
                </div>
              )}

              {/* PS Call Status */}
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  Support Call Status
                </h3>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">PS Call Needed:</span>
                    <span
                      className={
                        feedback.ps_call_needed === "NEIN"
                          ? "text-green-600"
                          : "text-red-600"
                      }
                    >
                      {feedback.ps_call_needed}
                    </span>
                  </div>
                  {feedback.ps_call_context && (
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">PS Call Context:</span>
                      <span className="text-gray-700">
                        {feedback.ps_call_context}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Metadata Footer */}
          <div className="mt-8 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-500">
              <div>
                <span className="font-medium">Feedback ID:</span> {feedback.id}
              </div>
              <div>
                <span className="font-medium">Calendar Week:</span> {week}
              </div>
              <div>
                <span className="font-medium">Submission Time:</span>{" "}
                {formattedTime}
              </div>
              <div>
                <span className="font-medium">Relative:</span> {relativeTime}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
