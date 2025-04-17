export type VelocityType = "Rot" | "Gelb" | "Grün";

export interface POFeedback {
  id: string;
  submitted_by: string;
  created_at: string;
  progress_percent: number;
  team_happiness: number;
  customer_happiness: number;
  velocity_next_week: VelocityType;
  week_number: number;
  milestones_done?: string;
  risks?: string;
  goals_next_week?: string;
  ps_call_status?: string;
  ps_call_notes?: string;
}
