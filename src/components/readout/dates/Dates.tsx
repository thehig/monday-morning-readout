import { useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../../lib/date-utils";
import { toEngagements } from "../../../lib/engagements";
import { landingWeeks, buildRunway } from "../../../lib/dates-view";
import { LandingWeeks } from "./LandingWeeks";
import { OwnerRunway } from "./OwnerRunway";

/** Two axes on one dataset: load per week, or collisions per person. */
export type DatesView = "weeks" | "runway";

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
    <span className="flex items-baseline gap-2 text-[17px] text-ink-3">
      <b
        className={`text-2xl font-extrabold tabular-nums ${
          alarm ? "text-late-ink" : "text-ink"
        }`}
      >
        {value}
      </b>
      {label}
    </span>
  );
}

/**
 * The Dates: what is coming, and what collides.
 *
 * Deliberately not a second Ladder. The Ladder looks back at the week just
 * filed; this places everything by estimated completion, because the estimate
 * is what will actually happen. Each view is its own page.
 */
export function Dates({ view }: { view: DatesView }) {
  const [searchParams] = useSearchParams();
  const today = new Date();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(today.getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);

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
    <div className="flex flex-1 flex-col">
      <div className="flex h-[72px] shrink-0 items-center gap-10 px-8">
        <h2 className="text-2xl font-[750] tracking-[-0.015em]">What lands when</h2>

        <div className="flex items-baseline gap-9">
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
