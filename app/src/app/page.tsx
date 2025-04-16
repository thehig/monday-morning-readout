"use client";

import { POFeedback } from "@/components/POFeedback";
import { motion } from "framer-motion";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { getCurrentWeek } from "@/hooks/use-po-feedback";

function HomeContent() {
  const searchParams = useSearchParams();
  const week = Number(searchParams.get("week")) || getCurrentWeek();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="h-full"
    >
      <POFeedback initialWeek={week} />
    </motion.div>
  );
}

export default function HomePage() {
  return (
    <main className="h-full bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    </main>
  );
}
