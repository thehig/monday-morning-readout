"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { usePOFeedbackById } from "@/hooks/use-po-feedback";
import {
  ChartBarIcon,
  FaceSmileIcon,
  HeartIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { motion } from "framer-motion";

function DetailRow({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  color: string;
}) {
  return (
    <div className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm">
      <Icon className={`w-6 h-6 ${color}`} />
      <div>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        <p className={`text-2xl font-bold ${color}`}>{value}</p>
      </div>
    </div>
  );
}

export default function FeedbackDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const week = searchParams.get("week");
  const { data: feedback, isLoading } = usePOFeedbackById(params.id as string);

  const handleBack = () => {
    const baseUrl = "/";
    const url = week ? `${baseUrl}?week=${week}` : baseUrl;
    router.push(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-500">Loading feedback...</div>
      </div>
    );
  }

  if (!feedback) {
    return (
      <div className="text-center py-8 text-gray-500">Feedback not found</div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-2xl mx-auto py-8"
    >
      <button
        onClick={handleBack}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Back to Overview
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {feedback.submitted_by}
            </h1>
            <p className="text-gray-500">
              {new Date(feedback.created_at).toLocaleDateString(undefined, {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <DetailRow
            icon={ChartBarIcon}
            label="Progress This Week"
            value={`${feedback.progress_percent}%`}
            color="text-blue-600"
          />
          <DetailRow
            icon={HeartIcon}
            label="Team Happiness"
            value={`${feedback.team_happiness}/10`}
            color="text-red-600"
          />
          <DetailRow
            icon={FaceSmileIcon}
            label="Customer Happiness"
            value={`${feedback.customer_happiness}/10`}
            color="text-green-600"
          />
        </div>

        <div className="mt-8 pt-8 border-t">
          <h2 className="font-medium text-gray-900 mb-4">Next Week</h2>
          <div className="flex items-center gap-3">
            <div
              className={`px-3 py-1.5 rounded-full ${
                feedback.velocity_next_week === "Grün"
                  ? "bg-green-100 text-green-700"
                  : feedback.velocity_next_week === "Gelb"
                  ? "bg-yellow-100 text-yellow-700"
                  : "bg-red-100 text-red-700"
              }`}
            >
              {feedback.velocity_next_week}
            </div>
            <span className="text-gray-600">Expected Velocity</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
