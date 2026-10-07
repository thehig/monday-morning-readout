import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../../lib/date-utils";
import { toEngagements } from "../../../lib/engagements";
import { landingWeeks, buildRunway } from "../../../lib/dates-view";
import {
  Segmented,
  TopBarActions,
  type SegmentedOption,
} from "../chrome";
import { LandingWeeks } from "./LandingWeeks";
import { OwnerRunway } from "./OwnerRunway";

type DatesView = "weeks" | "runway";

/** Two axes on one dataset: load per week, or collisions per person. */
const DATES_VIEWS: SegmentedOption<DatesView>[] = [
  { value: "weeks", label: "Landing weeks" },
  { value: "runway", label: "Owner runway" },
];

function Stat({
  value,
  label,
  alarm,
}: {
  value: number | string;
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

/**
 * The Dates: what is coming, and what collides.
 *
 * Deliberately not a second Ladder. The Ladder looks back at the week just
 * filed; this places everything by estimated completion, because the estimate
 * is what will actually happen.
 */
export function Dates() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<DatesView>("weeks");
  const today = new Date();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(today.getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "t" || event.key === "T") {
        setView((current) => (current === "weeks" ? "runway" : "weeks"));
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

  const { peak, undated } = landingWeeks(
    engagements,
    currentWeek,
    today.getFullYear()
  );
  const runway = buildRunway(engagements, today);
  const landing = engagements.filter((e) => e.estimate).length;
  const slipping = engagements.filter((e) => (e.slipDays ?? 0) > 0).length;

  return (
    <div className="flex h-full flex-col bg-sheet">
      <div className="flex shrink-0 items-center gap-7 border-b-2 border-sheet-rule bg-sheet-card px-6 py-2.5">
        <h2 className="text-xl font-bold tracking-tight">What lands when</h2>

        <div className="flex gap-7">
          <Stat value={landing} label="with a completion estimate" />
          <Stat value={peak} label="in the busiest single week" alarm={peak >= 3} />
          <Stat
            value={slipping}
            label="will land after their deadline"
            alarm={slipping > 0}
          />
          <Stat
            value={runway?.collidingOwners ?? 0}
            label="owners landing twice in a fortnight"
            alarm={(runway?.collidingOwners ?? 0) > 0}
          />
          {undated.length > 0 && (
            <Stat value={undated.length} label="with no estimate" />
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
            label="Dates view"
            options={DATES_VIEWS}
            value={view}
            onChange={setView}
          />
        </TopBarActions>
      </div>

      {engagements.length === 0 ? (
        <p className="p-8 text-xl text-ink-3">
          No submissions for week {currentWeek}.
        </p>
      ) : view === "weeks" ? (
        <LandingWeeks
          engagements={engagements}
          currentWeek={currentWeek}
          year={today.getFullYear()}
        />
      ) : (
        <OwnerRunway engagements={engagements} today={today} />
      )}
    </div>
  );
}
