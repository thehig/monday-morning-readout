import { Link, useLocation } from "react-router-dom";
import { WeekPicker } from "../inputs/WeekPicker";
import { Toggle } from "../ui/inputs/Toggle";
import { HeaderProps } from "../../types/components";
import { useState } from "react";

interface HeaderProps {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  shouldAggregate: boolean;
  setShouldAggregate: (value: boolean) => void;
  title: string;
}

export function Header({
  currentWeek,
  setCurrentWeek,
  shouldAggregate,
  setShouldAggregate,
  title,
}: HeaderProps) {
  const location = useLocation();
  const [selectedWeek, setSelectedWeek] = useState(new Date());
  const [darkMode, setDarkMode] = useState(false);

  return (
    <header className="border-b bg-[#1a1a4b]">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link
            to={`/?week=${currentWeek}`}
            className="text-[#ff7f00] text-2xl font-bold hover:opacity-90"
          >
            {title}
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Toggle
            checked={shouldAggregate}
            onChange={setShouldAggregate}
            label="Aggregate by Email"
          />
          {location.pathname === "/" && (
            <WeekPicker
              selectedWeek={currentWeek}
              onWeekChange={setCurrentWeek}
            />
          )}
        </div>
      </div>
    </header>
  );
}
