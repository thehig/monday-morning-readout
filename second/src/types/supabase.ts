export type VelocityIndicator = "Rot" | "Gelb" | "Grün";

export type Database = {
  public: {
    Tables: {
      po_feedback: {
        Row: {
          id: string;
          submitted_by: string;
          created_at: string;
          week_number: number;
          progress_percent: number;
          team_happiness: number;
          customer_happiness: number;
          velocity_next_week: VelocityIndicator;
          milestones_done: string | null;
          risks: string | null;
        };
        Insert: Omit<
          Database["public"]["Tables"]["po_feedback"]["Row"],
          "id" | "created_at"
        >;
        Update: Partial<Database["public"]["Tables"]["po_feedback"]["Insert"]>;
      };
    };
  };
};
