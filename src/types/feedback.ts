import type { Database } from "./supabase";

export type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export interface AggregatedPOFeedback extends POFeedback {
  all_submission_dates: string[];
  all_ids: string[];
}
