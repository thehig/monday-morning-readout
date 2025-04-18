import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getWeekDates, getCurrentWeek, formatDate } from "../lib/date-utils";

interface WeekPickerProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export function WeekPicker({ currentWeek, onWeekChange }: WeekPickerProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const totalWeeks = 52;

  const { start, end: endSaturday } = getWeekDates(currentWeek, currentYear);
  // Create a new date for Friday by subtracting one day from Saturday
  const end = new Date(endSaturday);
  end.setDate(end.getDate() - 1);

  const isCurrentWeek = currentWeek === getCurrentWeek(currentYear);
  const isPreviousWeekDisabled = currentWeek <= 1;
  const isNextWeekDisabled = currentWeek >= totalWeeks;

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Week navigation"
    >
      <button
        onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
        className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isPreviousWeekDisabled}
        aria-label="Previous week"
      >
        <ChevronLeftIcon className="w-4 h-4 text-white" aria-hidden="true" />
      </button>

      <div className="text-center" aria-live="polite">
        <div className="text-sm font-medium text-white">
          Week {currentWeek}
          {isCurrentWeek && (
            <span
              className="ml-1 text-xs text-[#ff7f00]"
              aria-label="Current week indicator"
            >
              (Current)
            </span>
          )}
        </div>
        <div className="text-xs text-gray-300">
          {formatDate(start)} - {formatDate(end)}
        </div>
      </div>

      <button
        onClick={() => onWeekChange(Math.min(totalWeeks, currentWeek + 1))}
        className="p-1 hover:bg-white/10 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        disabled={isNextWeekDisabled}
        aria-label="Next week"
      >
        <ChevronRightIcon className="w-4 h-4 text-white" aria-hidden="true" />
      </button>
    </div>
  );
}
