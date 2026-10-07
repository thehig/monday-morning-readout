import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../lib/date-utils";
import { toEngagements, summarise } from "../../lib/engagements";
import { RankedGrid } from "../readout/wall/RankedGrid";
import { Ladder } from "../readout/wall/Ladder";
import { Field } from "../readout/wall/Field";

type WallLayout = "grid" | "ladder" | "field";

const LAYOUTS: { key: WallLayout; label: string; digit: string }[] = [
  { key: "grid", label: "Ranked grid", digit: "1" },
  { key: "ladder", label: "Ladder", digit: "2" },
  { key: "field", label: "Field", digit: "3" },
];

/**
 * The Wall: the state the Monday call opens on.
 *
 * Three layouts over identical data, each directing the eye differently - by
 * rank, by a shared scale, or by position. The operator picks one; they are not
 * different information.
 */
export function Dashboard() {
  const [searchParams] = useSearchParams();
  const [layout, setLayout] = useState<WallLayout>("grid");
  const today = new Date();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(today.getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);
  const totals = summarise(engagements);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const picked = LAYOUTS.find((l) => l.digit === event.key);
      if (picked) setLayout(picked.key);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  if (isLoading) {
    return (
      <div className="p-8 text-xl text-ink-3">Loading week {currentWeek}…</div>
    );
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex shrink-0 items-center gap-4 border-b-2 border-sheet-rule bg-sheet-card px-6 py-2.5">
        <h2 className="text-xl font-bold tracking-tight">
          {totals.needingDecision > 0 ? "Needs a decision first" : "All on the date"}
        </h2>
        <span className="text-lg tabular-nums text-ink-3">
          {totals.needingDecision} of {totals.engagements}
        </span>
        {totals.contradicting > 0 && (
          <span className="text-lg text-late-ink">
            &middot; {totals.contradicting} report themselves on track with an
            estimate past the deadline
          </span>
        )}

        <div className="ml-auto flex overflow-hidden rounded border-2 border-navy">
          {LAYOUTS.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setLayout(option.key)}
              aria-pressed={layout === option.key}
              className={`px-3.5 py-1.5 text-[17px] font-semibold transition-colors ${
                layout === option.key
                  ? "bg-navy text-white"
                  : "bg-sheet-card text-ink-2 hover:bg-sheet"
              }`}
            >
              <span
                className={`mr-1.5 text-[17px] ${
                  layout === option.key ? "text-white/60" : "text-ink-3"
                }`}
              >
                {option.digit}
              </span>
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {engagements.length === 0 ? (
        <p className="p-8 text-xl text-ink-3">
          No submissions for week {currentWeek}.
        </p>
      ) : layout === "grid" ? (
        <RankedGrid engagements={engagements} currentWeek={currentWeek} />
      ) : layout === "ladder" ? (
        <Ladder
          engagements={engagements}
          currentWeek={currentWeek}
          today={today}
        />
      ) : (
        <Field
          engagements={engagements}
          currentWeek={currentWeek}
          today={today}
        />
      )}
    </div>
  );
}
