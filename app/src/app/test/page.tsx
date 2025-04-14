"use client";

import { POFeedbackTest } from "@/components/POFeedbackTest";

export default function FeedbackPage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Monday Morning Readout
        </h1>
        <POFeedbackTest />
      </div>
    </main>
  );
}
