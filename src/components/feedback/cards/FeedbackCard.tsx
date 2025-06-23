import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { formatEmailDisplayName } from "../../../lib/utils";
import {
  Thermometer,
  HappinessIndicator,
  VelocityIndicator,
} from "../../indicators";
import { FeedbackCardProps } from "../../../types/components";

const cardVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

export function FeedbackCard({ feedback, currentWeek }: FeedbackCardProps) {
  const customerName = feedback.customer || "Unknown Customer";
  const emailDisplayName = formatEmailDisplayName(feedback.submitted_by);

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover="hover"
      whileTap="tap"
      className="bg-white rounded-xl shadow-sm border border-gray-100 p-0 cursor-pointer hover:shadow-lg transition-all duration-200 feedback-card"
    >
      <Link
        to={`/feedback/${feedback.id}?week=${currentWeek}`}
        className="block h-full p-0"
      >
        <div className="flex items-center justify-between gap-4 bg-[#1a1a4b] p-4 relative">
          <div className="flex flex-col items-start min-w-0 flex-1">
            <h3
              className="font-medium text-[#ff7f00] m-0 truncate w-full text-left"
              title={`Customer: ${customerName}`}
            >
              Customer: {customerName}
            </h3>
            <p
              className="text-sm text-white m-0 truncate w-full text-left"
              title={feedback.submitted_by}
            >
              {emailDisplayName}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <div className="text-sm text-white">
              {new Date(feedback.created_at).toLocaleDateString()}
            </div>
            <VelocityIndicator velocity={feedback.velocity_next_week} />
          </div>
        </div>

        <div className="p-6">
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
