import type { Database } from "./supabase";

export type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];
