"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface WeekPickerProps {
  currentWeek: number;
  onWeekChange: (week: number) => void;
}

export function WeekPicker({ currentWeek, onWeekChange }: WeekPickerProps) {
  const now = new Date();
  const currentYear = now.getFullYear();
  const totalWeeks = 52;

  function getWeekDates(week: number): { start: Date; end: Date } {
    const start = new Date(currentYear, 0, 1);
    start.setDate(start.getDate() + (week - 1) * 7);
    const end = new Date(start);
    end.setDate(end.getDate() + 4);
    return { start, end };
  }

  const { start, end } = getWeekDates(currentWeek);
  const isCurrentWeek =
    currentWeek ===
    Math.ceil(
      (now.getTime() -
        new Date(currentYear, 0, 1).getTime() +
        24 * 60 * 60 * 1000) /
        (1000 * 60 * 60 * 24 * 7)
    );

  return (
    <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <button
        onClick={() => onWeekChange(Math.max(1, currentWeek - 1))}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        disabled={currentWeek <= 1}
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
      </button>

      <div className="text-center">
        <div className="font-medium text-gray-900">
          Week {currentWeek}
          {isCurrentWeek && (
            <span className="ml-2 text-blue-600">(Current)</span>
          )}
        </div>
        <div className="text-sm text-gray-500">
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
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
        disabled={currentWeek >= totalWeeks}
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
      </button>
    </div>
  );
}
