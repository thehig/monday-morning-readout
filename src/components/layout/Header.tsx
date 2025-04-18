import { Link, useLocation } from "react-router-dom";
import { WeekPicker } from "../inputs/WeekPicker";
import { Toggle } from "../ui/toggle";

interface HeaderProps {
  currentWeek: number;
  setCurrentWeek: (week: number) => void;
  shouldAggregate: boolean;
  setShouldAggregate: (value: boolean) => void;
}

export function Header({
  currentWeek,
  setCurrentWeek,
  shouldAggregate,
  setShouldAggregate,
}: HeaderProps) {
  const location = useLocation();

  return (
    <header className="border-b bg-[#1a1a4b]">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center space-x-8">
          <Link
            to={`/?week=${currentWeek}`}
            className="text-[#ff7f00] text-2xl font-bold hover:opacity-90"
          >
            United Signals
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <Toggle
            enabled={shouldAggregate}
            onChange={setShouldAggregate}
            label="Aggregate by Email"
            className="text-white"
          />
          {location.pathname === "/" && (
            <WeekPicker
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
            />
          )}
        </div>
      </div>
    </header>
  );
}
