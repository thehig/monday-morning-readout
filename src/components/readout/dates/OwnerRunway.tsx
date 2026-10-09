import { Link } from "react-router-dom";
import { buildRunway } from "../../../lib/dates-view";
import type { Runway } from "../../../lib/dates-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { STATE_MARK } from "../state-styles";

interface OwnerRunwayProps {
  engagements: Engagement[];
  currentWeek: number;
  today?: Date;
}

/**
 * The owner column, then the calendar. The owner column narrows before the
 * calendar does, since a cut name is still on hover and a squeezed calendar is
 * not readable at all.
 */
const COLUMNS =
  "grid-cols-[120px_minmax(0,1fr)] gap-x-4 md:grid-cols-[180px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)] xl:gap-x-6";

/** Keeps a mark's label inside the lane rather than running past its edge. */
function labelAlign(pct: number): string {
  if (pct <= 16) return "translate-x-0 items-start";
  if (pct >= 84) return "-translate-x-full items-end";
  return "-translate-x-1/2 items-center";
}

function Lane({
  lane,
  todayPct,
  monthPcts,
  currentWeek,
}: {
  lane: Runway["lanes"][number];
  todayPct: number;
  monthPcts: number[];
  currentWeek: number;
}) {
  const engagements = lane.marks.length;

  return (
    <section className={`grid min-h-0 flex-1 ${COLUMNS} items-center border-t border-[#EDEEF2]`}>
      <div className="flex min-w-0 flex-col gap-0.5">
        <b title={lane.owner} className="truncate text-[21px] font-[750] tracking-[-0.01em]">
          {lane.owner}
        </b>
        <span className="truncate text-[17px] text-ink-3">
          {engagements === 1 ? "1 engagement" : `${engagements} engagements`}
        </span>
      </div>

      <div className="relative self-stretch">
        {monthPcts.map((pct) => (
          <span
            key={pct}
            className="absolute inset-y-0 w-px bg-[#EEF0F3]"
            style={{ left: `${pct}%` }}
          />
        ))}
        <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-sheet-rule" />
        {/* Drawn per lane so the percentage is of the plot area, not the row. */}
        <span
          className="absolute inset-y-0 w-0.5 rounded bg-navy"
          style={{ left: `${todayPct}%` }}
          aria-hidden="true"
        />

        {/*
          Each dot and its label open that engagement's Stop. The link has no
          box of its own - its parts are placed on the lane - so hover and focus
          show on the dot and the name.
        */}
        {lane.marks.map(({ engagement, pct }, i) => (
          <Link
            key={engagement.id}
            to={`/feedback/${engagement.id}?week=${currentWeek}`}
            aria-label={`${engagement.customer}, estimated completion ${showDate(
              engagement.estimate
            )}`}
            className="group outline-none"
          >
            <span
              className={`absolute top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_3px_#FFFFFF,0_1px_4px_rgba(26,26,75,0.25)] transition-transform group-hover:scale-125 group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-4 group-focus-visible:outline-brand ${
                STATE_MARK[engagement.state]
              }`}
              style={{ left: `${pct}%` }}
            />
            <span
              className={`absolute flex flex-col whitespace-nowrap ${labelAlign(pct)} ${
                i % 2 === 0 ? "top-[calc(50%-74px)]" : "top-[calc(50%+22px)]"
              }`}
              style={{ left: `${pct}%` }}
            >
              <b
                title={engagement.customer}
                className="max-w-[240px] truncate text-[17px] font-bold leading-[21px] group-hover:underline group-focus-visible:underline"
              >
                {engagement.customer}
              </b>
              <span className="text-[17px] leading-[21px] tabular-nums text-ink-3">
                {showDate(engagement.estimate)}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

/**
 * One lane per product owner on a shared axis, one dot per engagement at its
 * estimated completion date. An owner's engagements are separate pieces of
 * work, so nothing is drawn between them.
 */
export function OwnerRunway({
  engagements,
  currentWeek,
  today = new Date(),
}: OwnerRunwayProps) {
  const runway = buildRunway(engagements, today);

  if (!runway) {
    return (
      <p className="p-8 text-xl text-ink-3">
        No engagement has an estimated completion date yet.
      </p>
    );
  }

  const monthPcts = runway.months.map((m) => m.pct);

  return (
    <div className="mx-4 mb-5 flex min-h-0 flex-1 flex-col rounded-card border border-navy/[0.06] bg-sheet-card px-4 py-2 shadow-card sm:mx-6 sm:px-8">
      <div className={`grid h-10 shrink-0 ${COLUMNS}`}>
        <span
          title="Estimated completion"
          className="min-w-0 self-center truncate text-[17px] font-semibold text-ink-2"
        >
          Estimated completion
        </span>
        <div className="relative">
          <span
            className="absolute top-2 rounded-full bg-navy px-[9px] text-[17px] font-[650] text-white"
            style={{ left: `${runway.todayPct}%` }}
          >
            today
          </span>
          {runway.months.map((tick) => (
            <span
              key={`${tick.label}-${tick.pct}`}
              className="absolute top-[9px] -translate-x-1/2 whitespace-nowrap text-[17px] text-ink-3"
              style={{ left: `${tick.pct}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {runway.lanes.map((lane) => (
          <Lane
            key={lane.ownerKey}
            lane={lane}
            todayPct={runway.todayPct}
            monthPcts={monthPcts}
            currentWeek={currentWeek}
          />
        ))}
      </div>
    </div>
  );
}
