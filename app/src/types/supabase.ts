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
        };
        Insert: {
          id?: number;
          created_at?: string;
          submitted_by: string;
          progress_percent: number;
          velocity_next_week: "Rot" | "Gelb" | "Grün";
          team_happiness: number;
          customer_happiness: number;
        };
        Update: {
          id?: number;
          created_at?: string;
          submitted_by?: string;
          progress_percent?: number;
          velocity_next_week?: "Rot" | "Gelb" | "Grün";
          team_happiness?: number;
          customer_happiness?: number;
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
