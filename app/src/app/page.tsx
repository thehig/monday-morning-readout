"use client";

import { POFeedback } from "@/components/POFeedback";
import { motion } from "framer-motion";
import { useSearchParams } from "next/navigation";
import { getCurrentWeek } from "@/hooks/use-po-feedback";

export default function HomePage() {
  const searchParams = useSearchParams();
  const week = Number(searchParams.get("week")) || getCurrentWeek();

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full bg-gray-50"
    >
      <div className="h-full">
        <POFeedback initialWeek={week} />
      </div>
    </motion.main>
  );
}
