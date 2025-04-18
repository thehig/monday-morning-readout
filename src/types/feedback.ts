import type { Database } from "./supabase";
import { VelocityType } from "./indicators";

export type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export interface AggregatedPOFeedback extends POFeedback {
  all_submission_dates: string[];
  all_ids: string[];
}
