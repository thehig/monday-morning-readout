import { useState, useEffect } from "react";
import { useSearchParams, Outlet } from "react-router-dom";
import { getCurrentWeek } from "../../hooks/use-po-feedback";
import { Header } from "./Header";

export function Layout() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [shouldAggregate, setShouldAggregate] = useState(true);

  const weekParam = searchParams.get("week");
  const [currentWeek, setCurrentWeek] = useState(
    weekParam ? parseInt(weekParam) : getCurrentWeek(new Date().getFullYear())
  );

  useEffect(() => {
    setSearchParams({ week: currentWeek.toString() });
  }, [currentWeek, setSearchParams]);

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      <Header
        currentWeek={currentWeek}
        setCurrentWeek={setCurrentWeek}
        shouldAggregate={shouldAggregate}
        setShouldAggregate={setShouldAggregate}
      />
      <main className="flex-1 overflow-auto">
        <Outlet
          context={{ isDecrypted: true, shouldAggregate, setShouldAggregate }}
        />
      </main>
    </div>
  );
}
