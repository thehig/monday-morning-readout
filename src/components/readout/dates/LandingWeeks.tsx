import { Link } from "react-router-dom";
import { landingWeeks, weekWeight } from "../../../lib/dates-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { STATE_LABEL, STATE_MARK, STATE_TEXT, STATE_TINT } from "../state-styles";

interface LandingWeeksProps {
  engagements: Engagement[];
  currentWeek: number;
  year?: number;
}

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
      className={`flex flex-col gap-0.5 rounded-tile border border-navy/[0.06] px-3.5 pb-[13px] pt-3 shadow-tile transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        STATE_TINT[engagement.state]
      }`}
    >
      <b className="text-[18px] font-bold leading-[23px]">{engagement.customer}</b>
      <span className={`text-[17px] leading-[22px] ${STATE_LABEL[engagement.state]}`}>
        {engagement.owner}
      </span>
      <span className="mt-1.5 flex items-center gap-2 text-[17px] font-bold leading-[22px] tabular-nums">
        <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${STATE_MARK[engagement.state]}`} />
        {showDate(engagement.estimate)}
      </span>
      {slipped && (
        <span
          className={`text-[17px] font-semibold leading-[22px] tabular-nums ${
            STATE_TEXT[engagement.state]
          }`}
        >
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
  const { track, undated, peak } = landingWeeks(engagements, currentWeek, year);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-5 pt-1">
      {/*
        Width follows what lands, not the calendar. Weeks share the row in
        proportion to their load, so the busiest is the widest thing on the
        screen, and runs of empty weeks are one narrow marker rather than half
        the width spent on nothing.
      */}
      <div className="flex min-h-0 flex-1 gap-3">
        {track.map((entry) => {
          if (entry.kind === "quiet") {
            return (
              <div
                key={`quiet-${entry.from}`}
                className="flex w-[88px] shrink-0 flex-col items-center justify-center gap-1 rounded-tile border-2 border-dashed border-[#D5D8E0] px-1 text-center text-ink-3"
              >
                <b className="text-[22px] font-[750] tabular-nums">{entry.weeks}</b>
                <span className="text-[17px] leading-5">
                  quiet
                  <br />
                  weeks
                </span>
                <span className="text-[17px] tabular-nums">
                  {entry.from}&ndash;{entry.to}
                </span>
              </div>
            );
          }

          const column = entry;
          const busiest = peak > 1 && column.engagements.length === peak;

          return (
            <section
              key={column.week}
              className="flex min-h-0 min-w-0 flex-col gap-2.5"
              style={{
                flex: `${weekWeight(column.engagements.length)} 1 0%`,
                // A week with nothing in it still has to fit its own dates on
                // one line, or the column reads as broken rather than as quiet.
                minWidth: column.engagements.length ? undefined : "118px",
              }}
            >
              <div
                className={`flex flex-col gap-px px-1 pb-2.5 pt-0.5 ${
                  busiest
                    ? "border-b-2 border-late-mark"
                    : column.isCurrent
                    ? "border-b-2 border-navy"
                    : "border-b border-[#DFE2E8]"
                }`}
              >
                <b
                  className={`text-[19px] font-[750] ${
                    busiest ? "text-late-ink" : column.isCurrent ? "text-navy" : ""
                  }`}
                >
                  {column.weekLabel}
                </b>
                <span className="whitespace-nowrap text-[17px] tabular-nums text-ink-3">
                  {column.label}
                </span>
                {busiest && (
                  <span className="mt-0.5 self-start rounded-full bg-late-block2 px-[9px] text-[17px] font-bold text-white">
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
                <span className="px-1 text-[17px] text-ink-3">&mdash;</span>
              )}
            </section>
          );
        })}
      </div>

      {undated.length > 0 && (
        <p className="shrink-0 pt-3 text-[17px] text-ink-3">
          <span className="font-semibold text-ink-2">
            No completion date recorded:
          </span>{" "}
          {undated.map((e) => e.customer).join(", ")}
        </p>
      )}
    </div>
  );
}
