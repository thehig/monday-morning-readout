import { motion } from "framer-motion";
import { FeedbackCard } from "../cards/FeedbackCard";
import type { POFeedback } from "../../../types/feedback";

export interface FeedbackListProps {
  feedback: POFeedback[];
  currentWeek: number;
  shouldAggregate: boolean;
}

export function FeedbackList({
  feedback,
  currentWeek,
  shouldAggregate,
}: FeedbackListProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
    >
      {feedback.map((item) => (
        <FeedbackCard
          key={item.id}
          feedback={item}
          currentWeek={currentWeek}
          allFeedback={feedback}
          shouldAggregate={shouldAggregate}
        />
      ))}
    </motion.div>
  );
}
