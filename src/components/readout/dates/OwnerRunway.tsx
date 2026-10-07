import { buildRunway } from "../../../lib/dates-view";
import type { Runway } from "../../../lib/dates-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";

interface OwnerRunwayProps {
  engagements: Engagement[];
  today?: Date;
}

const MARK_FILL: Record<string, string> = {
  late: "bg-late-mark",
  watch: "bg-watch-mark",
  fine: "bg-fine-mark",
  unknown: "bg-ink-3",
};

/** Keeps a mark's label inside the lane rather than running past its edge. */
function labelAlign(pct: number): string {
  if (pct <= 16) return "left-0 translate-x-0 text-left";
  if (pct >= 84) return "right-0 translate-x-0 text-right";
  return "left-1/2 -translate-x-1/2 text-center";
}

function Lane({
  lane,
  todayPct,
}: {
  lane: Runway["lanes"][number];
  todayPct: number;
}) {
  const engagements = lane.marks.length;
  const worst = lane.collisions.reduce(
    (min, c) => Math.min(min, c.days),
    Number.POSITIVE_INFINITY
  );

  return (
    <div className="grid flex-1 grid-cols-[260px_1fr] items-center gap-x-5 border-b-2 border-sheet-rule">
      <div>
        <b className="block text-[21px] font-bold leading-tight tracking-tight">
          {lane.owner}
        </b>
        <span className="text-[17px] text-ink-3">
          {engagements === 1 ? "1 engagement" : `${engagements} engagements`}
          {lane.collisions.length > 0 && (
            <>
              {" · "}
              <span className="font-bold text-late-ink">
                {worst} days apart
              </span>
            </>
          )}
        </span>
      </div>

      <div className="relative h-full">
        <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-sheet-rule" />
        {/* Drawn per lane so the percentage is of the plot area, not the row. */}
        <span
          className="absolute bottom-0 top-0 w-[4px] bg-navy"
          style={{ left: `${todayPct}%` }}
          aria-hidden="true"
        />

        {lane.collisions.map((collision) => (
          <span
            key={`${collision.fromPct}-${collision.toPct}`}
            className="absolute top-1/2 h-[5px] -translate-y-1/2 border-y-2 border-late-mark bg-late-wash"
            style={{
              left: `${collision.fromPct}%`,
              width: `${collision.toPct - collision.fromPct}%`,
            }}
          >
            <span className="absolute left-1/2 top-2.5 -translate-x-1/2 whitespace-nowrap text-[17px] font-bold text-late-ink">
              {collision.days} days
            </span>
          </span>
        ))}

        {lane.marks.map(({ engagement, pct }, i) => (
          <span
            key={engagement.id}
            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${pct}%` }}
          >
            <span
              className={`block h-[22px] w-[22px] rounded-full border-[3px] border-sheet-card ${
                MARK_FILL[engagement.state]
              }`}
            />
            <span
              className={`absolute whitespace-nowrap ${labelAlign(pct)} ${
                i % 2 === 0 ? "bottom-[30px]" : "top-[30px]"
              }`}
            >
              <b className="block text-[17px] font-bold leading-tight">
                {engagement.customer}
              </b>
              <span className="block text-[17px] tabular-nums text-ink-3">
                {showDate(engagement.estimate)}
              </span>
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * One lane per product owner on a shared axis.
 *
 * The bracketed span marks two landings close enough together to be a problem
 * for one person - the only view that ties delivery dates to who has to deliver
 * them.
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

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-3 pt-2">
      <div className="grid grid-cols-[260px_1fr] gap-x-5">
        <span />
        <div className="relative h-7">
          <span
            className={`absolute top-1 whitespace-nowrap text-[17px] font-bold text-navy ${labelAlign(
              runway.todayPct
            )}`}
            style={{ left: `${runway.todayPct}%` }}
          >
            today
          </span>
          {runway.months.map((tick) => (
            <span
              key={`${tick.label}-${tick.pct}`}
              className={`absolute top-1 whitespace-nowrap text-[17px] text-ink-3 ${labelAlign(
                tick.pct
              )}`}
              style={{ left: `${tick.pct}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {runway.lanes.map((lane) => (
          <Lane key={lane.ownerKey} lane={lane} todayPct={runway.todayPct} />
        ))}
      </div>
    </div>
  );
}
