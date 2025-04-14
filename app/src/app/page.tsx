"use client";

import { POFeedbackTest } from "@/components/POFeedbackTest";
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
      className="min-h-screen bg-gray-50"
    >
      <div className="container mx-auto px-4 py-6">
        <POFeedbackTest initialWeek={week} />
      </div>
    </motion.main>
  );
}
