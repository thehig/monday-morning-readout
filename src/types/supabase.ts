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
          id: string;
          created_at: string;
          submitted_by: string;
          week_number: number;
          progress_percent: number;
          team_happiness: number;
          customer_happiness: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          milestones_done?: string;
          risks?: string;
          goals_next_week?: string;
          ps_call_status?: string;
        };
        Insert: {
          id?: string;
          created_at?: string;
          submitted_by: string;
          week_number: number;
          progress_percent: number;
          team_happiness: number;
          customer_happiness: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          milestones_done?: string;
          risks?: string;
          goals_next_week?: string;
          ps_call_status?: string;
        };
        Update: {
          id?: string;
          created_at?: string;
          submitted_by?: string;
          week_number?: number;
          progress_percent?: number;
          team_happiness?: number;
          customer_happiness?: number;
          velocity_next_week?: "Rot" | "Gelb" | "Grün";
          milestones_done?: string;
          risks?: string;
          goals_next_week?: string;
          ps_call_status?: string;
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
