import { POFeedback } from "./feedback";
import { HappinessType, VelocityType } from "./indicators";

export interface HeaderProps {
  title: string;
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
}

export interface WeekPickerProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export interface ThermometerProps {
  value: number;
  min?: number;
  max?: number;
  width?: number;
  height?: number;
}

export interface VelocityIndicatorProps {
  velocity: VelocityType;
  showLabel?: boolean;
}

export interface HappinessIndicatorProps {
  type: HappinessType;
  value: number;
}

export interface TechnicalDetailsProps {
  id: string;
  week: number;
  submissionDate: Date;
  createdAt: string;
  submittedBy: string;
  relativeTime: string;
}

export interface FeedbackContentProps {
  feedback: POFeedback;
  week: number;
}

export interface FeedbackCardProps {
  feedback: POFeedback;
  currentWeek: number;
}
