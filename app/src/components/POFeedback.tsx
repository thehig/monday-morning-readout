"use client";

import { usePOFeedbackByWeek } from "@/hooks/use-po-feedback";
import type { Database } from "@/types/supabase";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { formatEmailDisplayName } from "@/lib/utils";
import {
  HAPPINESS_EMOJIS,
  HAPPINESS_COLORS,
  VELOCITY_COLORS,
  VELOCITY_LABELS,
} from "@/lib/constants";
import { Skeleton } from "@/components/ui/skeleton";

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
  const emojiIndex = Math.min(
    Math.floor(((value - 1) / 4) * (HAPPINESS_EMOJIS.length - 1)),
    HAPPINESS_EMOJIS.length - 1
  );
  const emoji = HAPPINESS_EMOJIS[emojiIndex];
  const color = HAPPINESS_COLORS[type];
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
  return (
    <div
      className={`w-4 h-4 rounded-full ${VELOCITY_COLORS[velocity]} animate-pulse`}
      title={VELOCITY_LABELS[velocity]}
    />
  );
}

function FeedbackCardSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <Skeleton className="h-5 w-32 mb-1" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="space-y-6">
        <Skeleton className="h-6 w-full rounded-full" />
        <div className="grid grid-cols-2 gap-8">
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
          <div className="flex flex-col items-center">
            <Skeleton className="h-8 w-8 rounded-full mb-1" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}

function FeedbackGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 auto-rows-min">
      {children}
    </div>
  );
}

function FeedbackCard({
  feedback,
  currentWeek,
}: {
  feedback: POFeedback;
  currentWeek: number;
}) {
  const router = useRouter();
  const displayName = formatEmailDisplayName(feedback.submitted_by);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() =>
        router.push(`/feedback/view?id=${feedback.id}&week=${currentWeek}`)
      }
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer"
    >
      <div className="flex justify-between items-start mb-6">
        <div>
          <h3
            className="font-medium text-gray-900"
            title={feedback.submitted_by}
          >
            {displayName}
          </h3>
          <p className="text-sm text-gray-500">
            {new Date(feedback.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
            })}
          </p>
        </div>
        <VelocityIndicator velocity={feedback.velocity_next_week} />
      </div>

      <div className="space-y-6">
        <Thermometer value={feedback.progress_percent} />

        <div className="grid grid-cols-2 gap-8">
          <HappinessIndicator value={feedback.team_happiness} type="team" />
          <HappinessIndicator
            value={feedback.customer_happiness}
            type="customer"
          />
        </div>
      </div>
    </motion.div>
  );
}

interface POFeedbackProps {
  initialWeek: number;
}

export function POFeedback({ initialWeek }: POFeedbackProps) {
  const {
    data: weeklyFeedback,
    isLoading,
    error,
  } = usePOFeedbackByWeek(initialWeek);

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-red-500">
          Error loading feedback: {error.message}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-auto p-4 scrollbar-hide">
          <FeedbackGrid>
            {Array.from({ length: 4 }).map((_, i) => (
              <FeedbackCardSkeleton key={i} />
            ))}
          </FeedbackGrid>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-auto p-4 scrollbar-hide">
        <FeedbackGrid>
          {weeklyFeedback?.map((feedback: POFeedback) => (
            <FeedbackCard
              key={feedback.id}
              feedback={feedback}
              currentWeek={initialWeek}
            />
          ))}
          {weeklyFeedback?.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500">
              No feedback found for week {initialWeek}
            </div>
          )}
        </FeedbackGrid>
      </div>
    </div>
  );
}
