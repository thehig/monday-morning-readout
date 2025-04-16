export type VelocityIndicator = "Rot" | "Gelb" | "Grün";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      po_feedback: {
        Row: {
          id: number;
          created_at: string;
          submitted_by: string;
          progress_percent: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          team_happiness: number;
          customer_happiness: number;
          goals_next_week: string;
          milestones_done: string;
          ps_call_context: string;
          ps_call_needed: "NEIN" | "JA";
          risks: string;
        };
        Insert: {
          id?: number;
          created_at?: string;
          submitted_by: string;
          progress_percent: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          team_happiness: number;
          customer_happiness: number;
          goals_next_week: string;
          milestones_done: string;
          ps_call_context: string;
          ps_call_needed: "NEIN" | "JA";
          risks: string;
        };
        Update: {
          id?: number;
          created_at?: string;
          submitted_by?: string;
          progress_percent?: number;
          velocity_next_week?: "Rot" | "Gelb" | "Grün";
          team_happiness?: number;
          customer_happiness?: number;
          goals_next_week?: string;
          milestones_done?: string;
          ps_call_context?: string;
          ps_call_needed?: "NEIN" | "JA";
          risks?: string;
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
