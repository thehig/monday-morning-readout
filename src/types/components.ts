import { POFeedback, AggregatedPOFeedback } from "./feedback";
import { HappinessType, VelocityType } from "./indicators";

export interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

export interface HeaderProps {
  title: string;
  shouldAggregate: boolean;
  setShouldAggregate: (value: boolean) => void;
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

export interface FeedbackListProps {
  feedback: POFeedback[];
  currentWeek: number;
  shouldAggregate: boolean;
}

export interface TechnicalDetailsProps {
  id: string;
  week: number;
  submissionDate: Date;
  createdAt: string;
  submittedBy: string;
  relativeTime: string;
  allSubmissionDates?: string[];
  isAggregated?: boolean;
  allIds?: string[];
}

export interface FeedbackContentProps {
  feedback: POFeedback | AggregatedPOFeedback;
  week: number;
  allFeedbackIds?: string[];
}

export interface FeedbackCardProps {
  feedback: POFeedback;
  currentWeek: number;
  allFeedback: POFeedback[];
  shouldAggregate: boolean;
}

export interface DecryptionFormProps {
  onDecrypt: (key: string) => void;
}
