import { buildRunway } from "../../../lib/dates-view";
import type { Runway } from "../../../lib/dates-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { STATE_MARK } from "../state-styles";

interface OwnerRunwayProps {
  engagements: Engagement[];
  today?: Date;
}

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
}: {
  lane: Runway["lanes"][number];
  todayPct: number;
  monthPcts: number[];
}) {
  const engagements = lane.marks.length;
  const worst = lane.collisions.reduce(
    (min, c) => Math.min(min, c.days),
    Number.POSITIVE_INFINITY
  );

  return (
    <section className="grid min-h-0 flex-1 grid-cols-[280px_minmax(0,1fr)] items-center gap-x-6 border-t border-[#EDEEF2]">
      <div className="flex flex-col gap-0.5">
        <b className="text-[21px] font-[750] tracking-[-0.01em]">{lane.owner}</b>
        <span className="text-[17px] text-ink-3">
          {engagements === 1 ? "1 engagement" : `${engagements} engagements`}
          {lane.collisions.length > 0 && (
            <>
              {", "}
              <span className="font-bold text-late-ink">{worst} days apart</span>
            </>
          )}
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

        {lane.collisions.map((collision) => (
          <span
            key={`${collision.fromPct}-${collision.toPct}`}
            className="absolute top-1/2 flex h-7 -translate-y-1/2 items-center justify-center rounded-full bg-late-capsule text-[17px] font-[750] text-late-ink"
            style={{
              left: `${collision.fromPct}%`,
              width: `${collision.toPct - collision.fromPct}%`,
            }}
          >
            {collision.days} days
          </span>
        ))}

        {lane.marks.map(({ engagement, pct }, i) => (
          <span key={engagement.id}>
            <span
              className={`absolute top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_0_0_3px_#FFFFFF,0_1px_4px_rgba(26,26,75,0.25)] ${
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
              <b className="text-[17px] font-bold leading-[21px]">{engagement.customer}</b>
              <span className="text-[17px] leading-[21px] tabular-nums text-ink-3">
                {showDate(engagement.estimate)}
              </span>
            </span>
          </span>
        ))}
      </div>
    </section>
  );
}

/**
 * One lane per product owner on a shared axis.
 *
 * The capsule marks two landings close enough together to be a problem for one
 * person - the only view that ties delivery dates to who has to deliver them.
 */
export function OwnerRunway({
  engagements,
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
    <div className="mx-6 mb-5 flex min-h-0 flex-1 flex-col rounded-card border border-navy/[0.06] bg-sheet-card px-8 py-2 shadow-card">
      <div className="grid h-10 shrink-0 grid-cols-[280px_minmax(0,1fr)] gap-x-6">
        <span />
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
          />
        ))}
      </div>
    </div>
  );
}
