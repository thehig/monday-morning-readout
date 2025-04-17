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
        <div className="grid grid-cols-[2fr_1fr_2fr] items-center gap-2 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <h3
              className="font-medium text-white user-name truncate m-0"
              title={feedback.submitted_by}
            >
              {displayName}
            </h3>
            {shouldAggregate && aggregatedCount > 1 && (
              <div className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full inline-flex items-center">
                {aggregatedCount}{" "}
                <span className="hidden lg:inline">&nbsp;updates</span>
              </div>
            )}
          </div>

          <div></div>

          <div className="flex items-center justify-end gap-4">
            <div className="text-sm text-white">
              {new Date(feedback.created_at).toLocaleDateString()}
            </div>
            <VelocityIndicator velocity={feedback.velocity_next_week} />
          </div>
        </div>

        <div className="space-y-6">
          <Thermometer value={feedback.progress_percent} />

          <div className="grid grid-cols-2 gap-8">
            <div className="flex flex-col items-center">
              <HappinessIndicator value={feedback.team_happiness} type="team" />
            </div>
            <div className="flex flex-col items-center">
              <HappinessIndicator
                value={feedback.customer_happiness}
                type="customer"
              />
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
