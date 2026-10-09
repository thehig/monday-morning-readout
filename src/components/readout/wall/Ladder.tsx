import { Link } from "react-router-dom";
import { buildLadder } from "../../../lib/wall-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { Meter, ProgressBar, VelocityDot } from "../primitives";
import { HATCH } from "../state-styles";

interface LadderProps {
  engagements: Engagement[];
  currentWeek: number;
  today?: Date;
}

// Drawn at the width after each comma; the width before it is how far the
// column will give before the page would have to scroll sideways instead.
const GRID =
  "grid-cols-[48px_minmax(200px,300px)_minmax(160px,1fr)_minmax(92px,112px)_minmax(150px,190px)_minmax(118px,134px)_minmax(118px,134px)_minmax(120px,150px)]";

/**
 * One row per engagement on a shared calendar.
 *
 * The only Wall layout where slip is comparable down a column, because every
 * engagement sits on the same scale. The span from the agreed deadline to
 * today is solid - it has happened - and the span from today to the estimate
 * is hatched, because it is the owner's forecast. Exact dates stay hidden until
 * a row is hovered, so the resting state is calm.
 */
export function Ladder({ engagements, currentWeek, today = new Date() }: LadderProps) {
  const ladder = buildLadder(engagements, today);

  if (!ladder) {
    return (
      <p className="p-8 text-xl text-ink-3">
        No engagement has a deadline or estimate recorded.
      </p>
    );
  }

  const todayPct = ladder.todayPct;

  return (
    <div className="mx-6 mb-5 flex min-h-0 flex-1 flex-col rounded-card border border-navy/[0.06] bg-sheet-card px-6 pb-1 pt-1.5 shadow-card">
      <div className={`grid ${GRID} h-[30px] shrink-0 gap-x-5`}>
        <span className="col-span-2" />
        <div className="relative">
          {ladder.months.map((tick) => (
            <span
              key={`${tick.label}-${tick.pct}`}
              className="absolute top-1.5 -translate-x-1/2 whitespace-nowrap text-[17px] text-ink-3"
              style={{ left: `${tick.pct}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div
        className={`grid ${GRID} min-h-[58px] shrink-0 items-end gap-x-5 border-b border-sheet-rule pb-2`}
      >
        <span />
        <Head label="Engagement" unit="and product owner" />
        <span className="relative">
          <Head label="Agreed deadline → estimate" unit="hover a row for exact dates" />
          <span
            className="absolute bottom-0 -translate-x-1/2 rounded-full bg-navy px-2 text-[17px] font-[650] text-white"
            style={{ left: `${todayPct}%` }}
          >
            today
          </span>
        </span>
        <Head label="Deadline" unit="as of today" align="right" />
        <Head label="Progress" unit="% of cycle done" />
        <Head label="Team" unit="out of 5" />
        <Head label="Customer" unit="out of 5" />
        <Head label="Next week" unit="expected velocity" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {ladder.rows.map((row, i) => {
          const { engagement: e } = row;
          const late = e.state === "late";
          const last = i === ladder.rows.length - 1;

          // The bar, split at today: what has happened, then what is forecast.
          const d = row.deadlinePct;
          const est = row.estimatePct;
          const pair = d !== null && est !== null && est > d;
          const solidW = pair ? Math.max(0, Math.min(est, todayPct) - d) : 0;
          const hatchL = pair ? Math.max(d, todayPct) : 0;
          const hatchW = pair ? Math.max(0, est - hatchL) : 0;

          return (
            <Link
              key={e.id}
              to={`/feedback/${e.id}?week=${currentWeek}`}
              className={`group -mx-3 grid ${GRID} min-h-0 flex-1 items-center gap-x-5 rounded-xl px-3 transition-colors hover:bg-sheet focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
                last ? "" : "border-b border-[#EDEEF2]"
              }`}
            >
              <span
                className={`text-center text-[19px] font-[750] tabular-nums ${
                  late ? "text-late-ink" : "text-ink-3"
                }`}
              >
                {i + 1}
              </span>

              <span className="min-w-0">
                <b className="block truncate text-[21px] font-bold leading-[26px] tracking-[-0.01em]">
                  {e.customer}
                </b>
                <span className="text-[17px] leading-[22px] text-ink-3">{e.owner}</span>
              </span>

              <span className="relative h-[54px]">
                <span className="absolute inset-x-0 top-[26px] h-0.5 rounded bg-sheet-rule" />

                {pair && (
                  <>
                    {solidW > 0 && (
                      <span
                        className={`absolute top-[22px] h-2.5 ${
                          late ? "bg-late-mark" : "bg-watch-mark"
                        } ${hatchW > 0 ? "rounded-l-full" : "rounded-full"}`}
                        style={{ left: `${d}%`, width: `${solidW}%` }}
                      />
                    )}
                    {hatchW > 0 && (
                      <span
                        className={`absolute top-[22px] h-2.5 ${
                          solidW > 0 ? "rounded-r-full" : "rounded-full"
                        }`}
                        style={{
                          left: `${hatchL}%`,
                          width: `${hatchW}%`,
                          background: HATCH[late ? "late" : "watch"],
                        }}
                      />
                    )}
                  </>
                )}

                {row.singlePoint ? (
                  <span
                    className="absolute top-[18px] h-[18px] w-[18px] -translate-x-1/2 rounded-full bg-fine-mark ring-[3px] ring-white"
                    style={{ left: `${est}%` }}
                  />
                ) : (
                  <>
                    {d !== null && (
                      <span
                        className={`absolute top-[19px] h-4 w-4 -translate-x-1/2 rounded-full border-[3px] bg-white ${
                          late ? "border-late-mark" : e.state === "watch" ? "border-watch-mark" : "border-ink-3"
                        }`}
                        style={{ left: `${d}%` }}
                      />
                    )}
                    {est !== null && (
                      <span
                        className="absolute top-[19px] h-4 w-4 -translate-x-1/2 rounded-full bg-ink ring-[3px] ring-white"
                        style={{ left: `${est}%` }}
                      />
                    )}
                  </>
                )}

                <span
                  className="absolute inset-y-1.5 w-0.5 rounded bg-navy"
                  style={{ left: `${todayPct}%` }}
                />

                {d !== null && !row.singlePoint && (
                  <HoverLabel pct={d} top="-top-1.5" tone={late ? "text-late-ink" : "text-ink-2"}>
                    deadline {showDate(e.deadline)}
                  </HoverLabel>
                )}
                {est !== null && (
                  <HoverLabel pct={est} top="top-[38px]" tone="text-ink">
                    {row.singlePoint ? "deadline and estimate" : "est."}{" "}
                    {showDate(e.estimate)}
                    {e.slipDays !== null && e.slipDays > 0 && `, +${e.slipDays} days`}
                  </HoverLabel>
                )}
              </span>

              <span className="text-right">
                {e.overdueDays !== null ? (
                  <>
                    <b className="block text-2xl font-extrabold leading-[26px] tabular-nums text-late-ink">
                      +{e.overdueDays}
                    </b>
                    <span className="text-[17px] text-late-ink">days over</span>
                  </>
                ) : e.daysToDeadline !== null ? (
                  <>
                    <b className="block text-[19px] font-semibold leading-[26px] tabular-nums text-ink-2">
                      {e.daysToDeadline}
                    </b>
                    <span className="text-[17px] text-ink-3">days left</span>
                  </>
                ) : (
                  <span className="text-[17px] text-ink-3">not recorded</span>
                )}
              </span>

              <span className="flex items-center gap-2.5">
                <ProgressBar value={e.progress} />
              </span>
              <span className="flex items-center gap-2.5">
                <Meter value={e.teamHappiness} />
              </span>
              <span className="flex items-center gap-2.5">
                <Meter value={e.customerHappiness} />
              </span>
              <span className="flex items-center gap-2 text-[17px] font-semibold">
                <VelocityDot velocity={e.velocity} />
                {e.velocityLabel?.replace(" velocity expected", "") ?? "—"}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

function Head({
  label,
  unit,
  align,
}: {
  label: string;
  unit: string;
  align?: "right";
}) {
  return (
    <span className={`flex flex-col ${align === "right" ? "text-right" : ""}`}>
      <b className="text-[18px] font-bold text-ink-2">{label}</b>
      <span className="text-[17px] font-normal text-ink-3">{unit}</span>
    </span>
  );
}

/** A date on the shared calendar, shown while its row is hovered. */
function HoverLabel({
  pct,
  top,
  tone,
  children,
}: {
  pct: number;
  top: string;
  tone: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={`pointer-events-none absolute ${top} whitespace-nowrap rounded-md bg-white px-1.5 text-[17px] font-semibold tabular-nums opacity-0 transition-opacity group-hover:opacity-100 ${tone} ${
        pct > 80 ? "-translate-x-full" : pct < 20 ? "" : "-translate-x-1/2"
      }`}
      style={{ left: `${pct}%` }}
    >
      {children}
    </span>
  );
}
