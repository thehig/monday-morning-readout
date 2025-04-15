"use client";

import { useSearchParams } from "next/navigation";
import { FeedbackContent } from "./feedback-content";

export default function FeedbackPage() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  if (!id) {
    return <div>Missing feedback ID</div>;
  }

  return <FeedbackContent />;
}
