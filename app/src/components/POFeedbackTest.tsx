"use client";

import { usePOFeedbackByWeek, getCurrentWeek } from "@/hooks/use-po-feedback";
import type { Database } from "@/types/supabase";
import {
  ChartBarIcon,
  FaceSmileIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { WeekPicker } from "./WeekPicker";
import { useRouter } from "next/navigation";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

function VelocityIndicator({
  velocity,
}: {
  velocity: "Rot" | "Gelb" | "Grün";
}) {
  const emoji = {
    Rot: "🔴",
    Gelb: "🟡",
    Grün: "🟢",
  };

  return <span className="text-xl">{emoji[velocity]}</span>;
}

function FeedbackCard({
  feedback,
  currentWeek,
}: {
  feedback: POFeedback;
  currentWeek: number;
}) {
  const router = useRouter();

  return (
    <div
      onClick={() =>
        router.push(`/feedback/${feedback.id}?week=${currentWeek}`)
      }
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3 className="font-medium text-gray-900">{feedback.submitted_by}</h3>
          <p className="text-sm text-gray-500">
            {new Date(feedback.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <VelocityIndicator velocity={feedback.velocity_next_week} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="flex flex-col items-center">
          <ChartBarIcon className="w-6 h-6 text-blue-500 mb-1" />
          <p className="text-2xl font-bold text-blue-600">
            {feedback.progress_percent}%
          </p>
        </div>

        <div className="flex flex-col items-center">
          <HeartIcon className="w-6 h-6 text-red-500 mb-1" />
          <p className="text-2xl font-bold text-red-600">
            {feedback.team_happiness}/10
          </p>
        </div>

        <div className="flex flex-col items-center">
          <FaceSmileIcon className="w-6 h-6 text-green-500 mb-1" />
          <p className="text-2xl font-bold text-green-600">
            {feedback.customer_happiness}/10
          </p>
        </div>
      </div>
    </div>
  );
}

interface POFeedbackTestProps {
  initialWeek?: number;
}

export function POFeedbackTest({
  initialWeek = getCurrentWeek(),
}: POFeedbackTestProps) {
  const router = useRouter();
  const [selectedWeek, setSelectedWeek] = useState(initialWeek);

  const handleWeekChange = (week: number) => {
    setSelectedWeek(week);
    // Update URL without navigation
    const url = new URL(window.location.href);
    url.searchParams.set("week", week.toString());
    router.replace(url.pathname + url.search);
  };

  const { data: weeklyFeedback, isLoading } = usePOFeedbackByWeek(selectedWeek);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Weekly Feedback
          </h2>
          <WeekPicker
            currentWeek={selectedWeek}
            onWeekChange={handleWeekChange}
          />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {weeklyFeedback?.map((feedback: POFeedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              currentWeek={selectedWeek}
            />
          ))}
          {weeklyFeedback?.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No feedback found for week {selectedWeek}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
