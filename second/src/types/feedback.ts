export type VelocityType = "Rot" | "Gelb" | "Grün";

export interface POFeedback {
  id: string;
  email: string;
  submission_date: string;
  all_submission_dates?: string[];
  sprint_progress: number;
  team_happiness: number;
  customer_happiness: number;
  milestones: string;
  risks: string;
  goals: string;
  ps_call_status: string;
  formatted_text?: string;
}
