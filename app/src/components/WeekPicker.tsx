"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";
import { getWeekDates, getCurrentWeek } from "@/lib/date-utils";

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

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        disabled={currentWeek <= 1}
      >
        <ChevronLeftIcon className="w-4 h-4 text-gray-600" />
      </button>

      <div className="text-center">
        <div className="text-sm font-medium text-gray-600">
          Week {currentWeek}
          {isCurrentWeek && (
            <span className="ml-1 text-xs text-blue-600">(Current)</span>
          )}
        </div>
        <div className="text-xs text-gray-500">
          {start.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          })}{" "}
          -{" "}
          {end.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </div>
      </div>

      <button
        onClick={() => onWeekChange(Math.min(totalWeeks, currentWeek + 1))}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
        disabled={currentWeek >= totalWeeks}
      >
        <ChevronRightIcon className="w-4 h-4 text-gray-600" />
      </button>
    </div>
  );
}
