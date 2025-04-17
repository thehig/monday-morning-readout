import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatEmailDisplayName } from "../../lib/utils";
import {
  Thermometer,
  HappinessIndicator,
  VelocityIndicator,
} from "../indicators";

export type VelocityType = "Rot" | "Gelb" | "Grün";

export interface POFeedback {
  id: string;
  submitted_by: string;
  created_at: string;
  progress_percent: number;
  team_happiness: number;
  customer_happiness: number;
  velocity_next_week: VelocityType;
  week_number: number;
  milestones_done?: string;
  risks?: string;
  goals_next_week?: string;
  ps_call_status?: string;
  ps_call_notes?: string;
}

export interface FeedbackCardProps {
  feedback: POFeedback;
  currentWeek: number;
  allFeedback: POFeedback[];
  shouldAggregate: boolean;
}

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: {
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.2 },
  },
  tap: {
    scale: 0.98,
    boxShadow: "0 5px 15px -5px rgba(0, 0, 0, 0.1)",
    transition: { duration: 0.1 },
  },
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
  const relatedIds = relatedFeedback.map((f) => f.id).join(",");
  const aggregatedCount = relatedFeedback.length;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className="bg-white rounded-xl shadow-md border border-gray-100 p-6 cursor-pointer min-h-[200px] hover:shadow-lg transition-shadow"
    >
      <Link
        to={`/feedback/${relatedIds}?week=${currentWeek}`}
        className="block h-full"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-start gap-2">
            <h3
              className="font-medium text-lg text-gray-900"
              title={feedback.submitted_by}
            >
              {displayName}
            </h3>
            {shouldAggregate && aggregatedCount > 1 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {aggregatedCount} updates
              </span>
            )}
          </div>
          <VelocityIndicator velocity={feedback.velocity_next_week} />
        </div>

        <div className="space-y-6">
          <Thermometer value={feedback.progress_percent} />

          <div className="grid grid-cols-2 gap-4">
            <HappinessIndicator value={feedback.team_happiness} type="team" />
            <HappinessIndicator
              value={feedback.customer_happiness}
              type="customer"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
