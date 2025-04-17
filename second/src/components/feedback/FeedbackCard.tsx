import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatEmailDisplayName } from "../../lib/utils";
import {
  Thermometer,
  HappinessIndicator,
  VelocityIndicator,
} from "../indicators";
import type { POFeedback } from "../../types/feedback";

export interface FeedbackCardProps {
  feedback: POFeedback;
  currentWeek: number;
  allFeedback: POFeedback[];
  shouldAggregate: boolean;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export function FeedbackCard({
  feedback,
  currentWeek,
  allFeedback,
  shouldAggregate,
}: FeedbackCardProps) {
  const displayName = formatEmailDisplayName(feedback.submitted_by);

  // Get all feedback entries for this email
  const relatedFeedback = allFeedback.filter(
    (f) => f.submitted_by === feedback.submitted_by
  );
  const relatedIds = relatedFeedback.map((f) => f.id.toString()).join(",");
  const aggregatedCount = relatedFeedback.length;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer hover:shadow-lg transition-all duration-200 feedback-card"
    >
      <Link
        to={`/feedback/${relatedIds}?week=${currentWeek}`}
        className="block h-full"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h3
              className="font-medium text-gray-900 user-name"
              title={feedback.submitted_by}
            >
              {displayName}
            </h3>
            {shouldAggregate && aggregatedCount > 1 && (
              <span
                className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full relative z-1"
                style={{ transform: "translateY(-6px)" }}
              >
                {aggregatedCount} updates
              </span>
            )}
          </div>
          <div
            className="flex items-center"
            style={{ transform: "translateY(-6px)" }}
          >
            <VelocityIndicator velocity={feedback.velocity_next_week} />
          </div>
        </div>

        <div className="space-y-6">
          <Thermometer value={feedback.progress_percent} />

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <HappinessIndicator value={feedback.team_happiness} type="team" />
              <span className="text-sm text-gray-500 mt-1">Team</span>
            </div>
            <div className="flex flex-col items-center">
              <HappinessIndicator
                value={feedback.customer_happiness}
                type="customer"
              />
              <span className="text-sm text-gray-500 mt-1">Customer</span>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
