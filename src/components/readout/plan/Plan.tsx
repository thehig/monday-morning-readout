import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { usePOFeedbackByWeek } from "../../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../../lib/date-utils";
import {
  toEngagements,
  summarise,
  scheduleNote,
  type Engagement,
} from "../../../lib/engagements";
import { planExceptions } from "../../../lib/plan-view";
import {
  usePreviousWeekTotals,
  scheduleBaseline,
} from "../../../hooks/use-week-comparison";
import { Delta } from "../primitives";
import { STATE_TEXT } from "../state-styles";
import {
  FooterActions,
  Key,
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
  const lastWeek = usePreviousWeekTotals(currentWeek);

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
    <div className="flex flex-1 flex-col bg-sheet">
      <div className="flex shrink-0 items-center gap-7 border-b-2 border-sheet-rule bg-sheet-card px-6 py-2.5">
        <h2 className="text-xl font-bold tracking-tight">
          Week {currentWeek + 1} plan
        </h2>

        <div className="flex gap-7">
          <Stat
            value={totals.commitments}
            label="commitments"
            delta={<Delta now={totals.commitments} before={lastWeek?.commitments} worseWhen="down" />}
          />
          <Stat value={totals.engagements} label="engagements" />
          <Stat value={totals.owners} label="product owners" />
          <Stat
            value={totals.needingDecision}
            label="past or overrunning their deadline"
            alarm={totals.needingDecision > 0}
            delta={
              <Delta
                now={totals.needingDecision}
                before={scheduleBaseline(lastWeek, (t) => t.needingDecision)}
              />
            }
          />
          {silent > 0 && (
            <Stat value={silent} label="committed nothing" alarm />
          )}
        </div>

        <TopBarActions>
          <Segmented
            label="Plan view"
            options={PLAN_VIEWS}
            value={view}
            onChange={setView}
          />
        </TopBarActions>

        <FooterActions>
          <span>
            <Key>T</Key>switch the view
          </span>
        </FooterActions>
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

      <Exceptions
        engagements={engagements}
        currentWeek={currentWeek}
        totalCommitments={totals.commitments}
        totalBehind={totals.needingDecision}
      />
    </div>
  );
}

/**
 * The band under the Plan: what the week still has to answer for.
 *
 * The counts above say "1 committed nothing" and "5 past or overrunning", but
 * a count is read once and the engagement behind it is somewhere in a column
 * of fifteen. These are named, so the call closes on them. The band is only
 * drawn when there is something in it.
 */
function Exceptions({
  engagements,
  currentWeek,
  totalCommitments,
  totalBehind,
}: {
  engagements: Engagement[];
  currentWeek: number;
  totalCommitments: number;
  totalBehind: number;
}) {
  const { silent, heaviest, mostBehind, any } = planExceptions(engagements);

  if (!any) return null;

  return (
    <div className="shrink-0 border-t-2 border-sheet-rule bg-sheet-card px-6 py-3">
      <div className="flex flex-wrap items-stretch gap-3">
        {silent.length > 0 && (
          <section className="flex min-w-0 flex-1 items-baseline gap-4 rounded border-2 border-late-mark bg-late-wash px-4 py-2.5">
            <b className="shrink-0 text-xl font-extrabold text-late-ink">
              Committed nothing
            </b>
            <p className="min-w-0 text-[19px] leading-snug text-late-ink">
              {silent.map((engagement, i) => (
                <span key={engagement.id}>
                  {i > 0 && <span className="text-late-ink/60"> &middot; </span>}
                  <Link
                    to={`/feedback/${engagement.id}?week=${currentWeek}`}
                    className="font-bold underline decoration-late-mark/40 underline-offset-2 hover:decoration-late-mark"
                  >
                    {engagement.customer}
                  </Link>{" "}
                  <span className="text-late-ink/80">
                    {engagement.owner}
                    {scheduleNote(engagement) && `, ${scheduleNote(engagement)}`}
                  </span>
                </span>
              ))}
            </p>
          </section>
        )}

        {(heaviest || mostBehind) && (
          <section className="flex shrink-0 items-baseline gap-5 rounded border-2 border-sheet-rule px-4 py-2.5">
            {heaviest && (
              <span className="text-[19px] leading-snug">
                <b className="font-bold">{heaviest.owner}</b>
                <span className="text-ink-2">
                  {" "}
                  carries {heaviest.commitments} of the {totalCommitments}, on{" "}
                  {heaviest.engagements}{" "}
                  {heaviest.engagements === 1 ? "engagement" : "engagements"}
                </span>
              </span>
            )}
            {mostBehind && (
              <span className={`text-[19px] leading-snug ${STATE_TEXT.late}`}>
                <b className="font-bold">{mostBehind.owner}</b> owns{" "}
                {mostBehind.commitments} of the {totalBehind} that will miss
              </span>
            )}
          </section>
        )}
      </div>
    </div>
  );
}

function Stat({
  value,
  label,
  alarm,
  delta,
}: {
  value: number;
  label: string;
  alarm?: boolean;
  delta?: React.ReactNode;
}) {
  return (
    <div className="grid gap-0.5">
      <span
        className={`text-xl font-extrabold leading-none tabular-nums ${
          alarm ? "text-late-ink" : ""
        }`}
      >
        {value}
        {delta}
      </span>
      <span className="text-[17px] text-ink-3">{label}</span>
    </div>
  );
}
