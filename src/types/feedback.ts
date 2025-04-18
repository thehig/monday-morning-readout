import type { Database } from "./supabase";

export type VelocityType = "Rot" | "Gelb" | "Grün";

export type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export interface AggregatedPOFeedback extends POFeedback {
  all_submission_dates?: string[];
  formatted_text?: string;
}
