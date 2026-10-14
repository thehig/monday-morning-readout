export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Shape of the `target_diff` jsonb column: the submission date minus the
 * release, broken into calendar parts. Positive values mean the release has
 * passed, negative values mean there is time left.
 *
 * Typed optimistically here because that is what the column holds today, but
 * jsonb can hold anything - always read it through `parseTargetDiff`.
 */
export interface TargetDiff {
  years: number;
  months: number;
  days: number;
}

export interface Database {
  public: {
    Tables: {
      po_feedback: {
        Row: {
          id: number;
          created_at: string;
          submitted_by: string;
          progress_percent: number;
          team_happiness: number;
          customer_happiness: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          milestones_done?: string | null;
          risks?: string | null;
          goals_next_week?: string | null;
          ps_call_needed?: string | null;
          ps_call_context?: string | null;
          customer?: string | null;
          amount_charged?: string | null;
          // Added later - null on every row created before the change.
          target_date?: string | null;
          estimated_completion_date?: string | null;
          target_diff?: TargetDiff | null;
          project_on_track?: boolean | null;
          delay_reason?: string | null;
        };
        Insert: {
          id?: number;
          created_at?: string;
          submitted_by: string;
          progress_percent: number;
          team_happiness: number;
          customer_happiness: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          milestones_done?: string | null;
          risks?: string | null;
          goals_next_week?: string | null;
          ps_call_needed?: string | null;
          ps_call_context?: string | null;
          customer?: string | null;
          amount_charged?: string | null;
          target_date?: string | null;
          estimated_completion_date?: string | null;
          target_diff?: TargetDiff | null;
          project_on_track?: boolean | null;
          delay_reason?: string | null;
        };
        Update: {
          id?: number;
          created_at?: string;
          submitted_by?: string;
          progress_percent?: number;
          team_happiness?: number;
          customer_happiness?: number;
          velocity_next_week?: "Rot" | "Gelb" | "Grün";
          milestones_done?: string | null;
          risks?: string | null;
          goals_next_week?: string | null;
          ps_call_needed?: string | null;
          ps_call_context?: string | null;
          customer?: string | null;
          amount_charged?: string | null;
          target_date?: string | null;
          estimated_completion_date?: string | null;
          target_diff?: TargetDiff | null;
          project_on_track?: boolean | null;
          delay_reason?: string | null;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
}
