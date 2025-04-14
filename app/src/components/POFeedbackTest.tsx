"use client";

import { usePOFeedbackByWeek, getCurrentWeek } from "@/hooks/use-po-feedback";
import type { Database } from "@/types/supabase";
import {
  ArrowTrendingUpIcon,
  ChartBarIcon,
  FaceSmileIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";
import { WeekPicker } from "./WeekPicker";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

function VelocityIndicator({
  velocity,
}: {
  velocity: "Rot" | "Gelb" | "Grün";
}) {
  const colors = {
    Rot: "bg-red-500",
    Gelb: "bg-yellow-500",
    Grün: "bg-green-500",
  };

  return (
    <div className="flex items-center gap-2">
      <div className={`w-3 h-3 rounded-full ${colors[velocity]}`} />
      <span>{velocity}</span>
    </div>
  );
}

function FeedbackCard({ feedback }: { feedback: POFeedback }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="font-medium text-gray-900">{feedback.submitted_by}</h3>
          <p className="text-sm text-gray-500">
            {new Date(feedback.created_at).toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <VelocityIndicator velocity={feedback.velocity_next_week} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-5 h-5 text-blue-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Progress</p>
            <p className="text-2xl font-bold text-blue-600">
              {feedback.progress_percent}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ArrowTrendingUpIcon className="w-5 h-5 text-purple-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Next Week</p>
            <p className="text-lg font-medium text-gray-900">
              {feedback.velocity_next_week}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <HeartIcon className="w-5 h-5 text-red-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">Team Happiness</p>
            <p className="text-2xl font-bold text-red-600">
              {feedback.team_happiness}/10
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <FaceSmileIcon className="w-5 h-5 text-green-500" />
          <div>
            <p className="text-sm font-medium text-gray-700">
              Customer Happiness
            </p>
            <p className="text-2xl font-bold text-green-600">
              {feedback.customer_happiness}/10
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function POFeedbackTest() {
  const [selectedWeek, setSelectedWeek] = useState(getCurrentWeek());
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
            onWeekChange={setSelectedWeek}
          />
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {weeklyFeedback?.map((feedback: POFeedback) => (
            <FeedbackCard key={feedback.id} feedback={feedback} />
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
