import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { Database } from "../types/supabase";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatEmailDisplayName(email: string): string {
  return email
    .split("@")[0] // Get part before @
    .split(/[._-]/) // Split on . _ or -
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()) // Capitalize each part
    .join(" "); // Join with spaces
}

export type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export function aggregateFeedbackByEmail(
  feedbackList: POFeedback[]
): POFeedback[] {
  // Group feedback by email
  const groupedByEmail = feedbackList.reduce((acc, feedback) => {
    if (!acc[feedback.submitted_by]) {
      acc[feedback.submitted_by] = [];
    }
    acc[feedback.submitted_by].push(feedback);
    return acc;
  }, {} as Record<string, POFeedback[]>);

  // For each email, calculate averages and combine data
  return Object.entries(groupedByEmail).map(([email, feedbacks]) => {
    // Sort feedbacks by date, most recent first
    const sortedFeedbacks = [...feedbacks].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    const mostRecent = sortedFeedbacks[0];

    // Calculate averages with 2 decimal places
    const avgProgress = Number(
      (
        feedbacks.reduce((sum, f) => sum + f.progress_percent, 0) /
        feedbacks.length
      ).toFixed(2)
    );

    const avgTeamHappiness = Number(
      (
        feedbacks.reduce((sum, f) => sum + f.team_happiness, 0) /
        feedbacks.length
      ).toFixed(2)
    );

    const avgCustomerHappiness = Number(
      (
        feedbacks.reduce((sum, f) => sum + f.customer_happiness, 0) /
        feedbacks.length
      ).toFixed(2)
    );

    // For velocity, use the most common value
    const velocityCounts = feedbacks.reduce((acc, f) => {
      acc[f.velocity_next_week] = (acc[f.velocity_next_week] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const mostCommonVelocity = Object.entries(velocityCounts).reduce((a, b) =>
      velocityCounts[a[0]] > velocityCounts[b[0]] ? a : b
    )[0] as "Rot" | "Gelb" | "Grün";

    // Combine text fields with bullet points and dates
    const combineMilestones = sortedFeedbacks
      .map(
        (f) =>
          f.milestones_done &&
          `[${new Date(f.created_at).toLocaleDateString()}] ${
            f.milestones_done
          }`
      )
      .filter(Boolean)
      .join("\n\n");

    const combineRisks = sortedFeedbacks
      .map(
        (f) =>
          f.risks &&
          `[${new Date(f.created_at).toLocaleDateString()}] ${f.risks}`
      )
      .filter(Boolean)
      .join("\n\n");

    const combineGoals = sortedFeedbacks
      .map(
        (f) =>
          f.goals_next_week &&
          `[${new Date(f.created_at).toLocaleDateString()}] ${
            f.goals_next_week
          }`
      )
      .filter(Boolean)
      .join("\n\n");

    const combineCallStatus = sortedFeedbacks
      .map(
        (f) =>
          f.ps_call_status &&
          `[${new Date(f.created_at).toLocaleDateString()}] ${f.ps_call_status}`
      )
      .filter(Boolean)
      .join("\n\n");

    // Return aggregated feedback with all submission dates
    return {
      ...mostRecent,
      progress_percent: avgProgress,
      team_happiness: avgTeamHappiness,
      customer_happiness: avgCustomerHappiness,
      velocity_next_week: mostCommonVelocity,
      milestones_done: combineMilestones || undefined,
      risks: combineRisks || undefined,
      goals_next_week: combineGoals || undefined,
      ps_call_status: combineCallStatus || undefined,
      // Store all submission dates for display
      all_submission_dates: sortedFeedbacks.map((f) => f.created_at),
    };
  });
}
