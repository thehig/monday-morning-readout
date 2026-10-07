import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../../lib/date-utils";
import { toEngagements, summarise } from "../../../lib/engagements";
import {
  Segmented,
  TopBarActions,
  type SegmentedOption,
} from "../chrome";
import { ByOwner } from "./ByOwner";
import { CommitmentList } from "./CommitmentList";

type PlanView = "owner" | "list";

/** The two views of the same commitments: grouped by person, or flattened by risk. */
const PLAN_VIEWS: SegmentedOption<PlanView>[] = [
  { value: "owner", label: "By owner" },
  { value: "list", label: "Commitment list" },
];

/**
 * The Plan: what the week ahead has been committed to.
 *
 * The app has never had this screen - goals_next_week has only ever been
 * visible one engagement at a time, inside a detail page.
 */
export function Plan() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<PlanView>("owner");

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(new Date().getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);
  const totals = summarise(engagements);
  const silent = engagements.filter((e) => e.commitments.length === 0).length;

  // One operator drives this while talking, so the toggle has a key.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "t" || event.key === "T") {
        setView((current) => (current === "owner" ? "list" : "owner"));
      }
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
    <div className="flex h-full flex-col bg-sheet">
      <div className="flex shrink-0 items-center gap-7 border-b-2 border-sheet-rule bg-sheet-card px-6 py-2.5">
        <h2 className="text-xl font-bold tracking-tight">
          Week {currentWeek + 1} plan
        </h2>

        <div className="flex gap-7">
          <Stat value={totals.commitments} label="commitments" />
          <Stat value={totals.engagements} label="engagements" />
          <Stat value={totals.owners} label="product owners" />
          <Stat
            value={totals.needingDecision}
            label="past or overrunning their deadline"
            alarm={totals.needingDecision > 0}
          />
          {silent > 0 && (
            <Stat value={silent} label="committed nothing" alarm />
          )}
        </div>

        <TopBarActions>
          <span className="text-[17px] text-white/70">
            <kbd className="mr-1.5 rounded border border-navy-line px-1.5 font-bold text-white">
              T
            </kbd>
            toggle
          </span>
          <Segmented
            label="Plan view"
            options={PLAN_VIEWS}
            value={view}
            onChange={setView}
          />
        </TopBarActions>
      </div>

      {engagements.length === 0 ? (
        <p className="p-8 text-xl text-ink-3">
          No submissions for week {currentWeek}.
        </p>
      ) : view === "owner" ? (
        <ByOwner engagements={engagements} currentWeek={currentWeek} />
      ) : (
        <CommitmentList engagements={engagements} currentWeek={currentWeek} />
      )}
    </div>
  );
}

function Stat({
  value,
  label,
  alarm,
}: {
  value: number;
  label: string;
  alarm?: boolean;
}) {
  return (
    <div className="grid gap-0.5">
      <span
        className={`text-xl font-extrabold leading-none tabular-nums ${
          alarm ? "text-late-ink" : ""
        }`}
      >
        {value}
      </span>
      <span className="text-[17px] text-ink-3">{label}</span>
    </div>
  );
}
