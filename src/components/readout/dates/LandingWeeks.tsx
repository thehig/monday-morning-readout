import { Link } from "react-router-dom";
import { landingWeeks } from "../../../lib/dates-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { STATE_TEXT } from "../state-styles";

interface LandingWeeksProps {
  engagements: Engagement[];
  currentWeek: number;
  year?: number;
}

const TOP_EDGE: Record<string, string> = {
  late: "border-t-late-mark",
  watch: "border-t-watch-mark",
  fine: "border-t-fine-mark",
  unknown: "border-t-sheet-rule",
};

function Tile({
  engagement,
  currentWeek,
}: {
  engagement: Engagement;
  currentWeek: number;
}) {
  const slipped = (engagement.slipDays ?? 0) > 0;

  return (
    <Link
      to={`/feedback/${engagement.id}?week=${currentWeek}`}
      className={`grid gap-1 rounded border-2 border-t-[7px] border-sheet-rule bg-sheet-card px-2.5 py-2.5 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        TOP_EDGE[engagement.state]
      }`}
    >
      <b className="text-[17px] font-bold leading-tight">{engagement.customer}</b>
      <span className="text-[17px] leading-tight text-ink-3">
        {engagement.owner}
      </span>
      <span className="text-[17px] font-bold tabular-nums">
        {showDate(engagement.estimate)}
      </span>
      {slipped && (
        <span className={`text-[17px] font-semibold ${STATE_TEXT[engagement.state]}`}>
          committed {showDate(engagement.deadline)}
        </span>
      )}
    </Link>
  );
}

/**
 * Engagements stacked into the week their estimate falls in.
 *
 * A column's height is that week's workload, so a pile-up is a shape rather
 * than something to notice. The empty columns are information too.
 */
export function LandingWeeks({
  engagements,
  currentWeek,
  year = new Date().getFullYear(),
}: LandingWeeksProps) {
  const { columns, undated, peak } = landingWeeks(engagements, currentWeek, year);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-3 pt-3">
      <div
        className="grid min-h-0 flex-1 gap-2.5"
        style={{
          gridTemplateColumns: `repeat(${Math.max(1, columns.length)}, minmax(0, 1fr))`,
        }}
      >
        {columns.map((column) => {
          const busiest = peak > 1 && column.engagements.length === peak;

          return (
            <div key={column.week} className="flex min-h-0 flex-col gap-2.5">
              <div
                className={`grid gap-0.5 border-b-[3px] pb-2 ${
                  busiest
                    ? "border-late-mark"
                    : column.isCurrent
                    ? "border-navy"
                    : "border-sheet-rule"
                }`}
              >
                <b
                  className={`text-[19px] font-bold leading-tight ${
                    busiest ? "text-late-ink" : column.isCurrent ? "text-navy" : ""
                  }`}
                >
                  {column.weekLabel}
                </b>
                <span className="text-[17px] tabular-nums text-ink-3">
                  {column.label}
                </span>
                {busiest && (
                  <span className="text-[17px] font-bold text-late-ink">
                    {column.engagements.length} landing
                  </span>
                )}
              </div>

              {column.engagements.length ? (
                column.engagements.map((engagement) => (
                  <Tile
                    key={engagement.id}
                    engagement={engagement}
                    currentWeek={currentWeek}
                  />
                ))
              ) : (
                <span className="text-[17px] text-ink-3">&mdash;</span>
              )}
            </div>
          );
        })}
      </div>

      {undated.length > 0 && (
        <p className="shrink-0 border-t-2 border-sheet-rule pt-2.5 text-[17px] text-ink-3">
          <span className="font-semibold text-ink-2">
            No completion date recorded:
          </span>{" "}
          {undated.map((e) => e.customer).join(", ")}
        </p>
      )}
    </div>
  );
}
