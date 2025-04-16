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

interface FeedbackCardProps {
  feedback: POFeedback;
  currentWeek: number;
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

const contentVariants = {
  hover: {
    y: -2,
    transition: { duration: 0.2 },
  },
};

export function FeedbackCard({ feedback, currentWeek }: FeedbackCardProps) {
  const displayName = formatEmailDisplayName(feedback.submitted_by);

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 cursor-pointer transition-colors hover:border-gray-200"
    >
      <Link
        to={`/feedback/${feedback.id}?week=${currentWeek}`}
        className="block"
      >
        <motion.div variants={contentVariants} className="space-y-6">
          <div className="flex justify-between items-start">
            <div>
              <h3
                className="font-medium text-gray-900 mb-1"
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
      </Link>
    </motion.div>
  );
}
