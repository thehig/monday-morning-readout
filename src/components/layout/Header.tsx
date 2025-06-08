import { Link, useLocation } from "react-router-dom";
import { WeekPicker } from "../inputs/WeekPicker";
import { HeaderProps } from "../../types/components";

export function Header({ currentWeek, setCurrentWeek, title }: HeaderProps) {
  const location = useLocation();

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
