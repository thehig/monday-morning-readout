import { Link } from "react-router-dom";
import { buildLadder, tickStride } from "../../../lib/wall-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { Meter, ProgressBar, VelocityDot } from "../primitives";
import { HATCH } from "../state-styles";
import { useWidth } from "../useWidth";

interface LadderProps {
  engagements: Engagement[];
  currentWeek: number;
  today?: Date;
}

// Drawn at the width after each comma; the width before it is how far the
// column will give. Rather than scroll sideways, a narrower window drops
// columns, least needed first - the Stop still shows every one of them:
//
//   2xl  all eight
//   xl   without Team and Customer
//   md   without Progress and Next week either
//   below md, without the calendar: rank, engagement and the release
const GRID = [
  "grid-cols-[28px_minmax(0,1fr)_minmax(84px,104px)]",
  "md:grid-cols-[40px_minmax(160px,260px)_minmax(220px,1fr)_minmax(92px,112px)]",
  "xl:grid-cols-[48px_minmax(180px,280px)_minmax(260px,1fr)_minmax(92px,112px)_minmax(150px,190px)_minmax(110px,140px)]",
  "2xl:grid-cols-[48px_minmax(200px,300px)_minmax(240px,1fr)_minmax(92px,112px)_minmax(150px,190px)_minmax(118px,134px)_minmax(118px,134px)_minmax(120px,150px)]",
].join(" ");

const CALENDAR = "hidden md:block";
const XL = "hidden xl:flex";
const XXL = "hidden 2xl:flex";

/**
 * One row per engagement on a shared calendar.
 *
 * The only Wall layout where slip is comparable down a column, because every
 * engagement sits on the same scale. The span from the agreed release to
 * today is solid - it has happened - and the span from today to the estimate
 * is hatched, because it is the owner's forecast. Exact dates stay hidden until
 * a row is hovered, so the resting state is calm.
 */
export function Ladder({ engagements, currentWeek, today = new Date() }: LadderProps) {
  const ladder = buildLadder(engagements, today);
  const [axisRef, axisWidth] = useWidth<HTMLDivElement>();

  if (!ladder) {
    return (
      <p className="p-8 text-xl text-ink-3">
        No engagement has a release date or estimate recorded.
      </p>
    );
  }

  const todayPct = ladder.todayPct;
  const stride = tickStride(
    ladder.months.map((m) => m.pct),
    axisWidth
  );
  // The hint shares its line with the "today" pill, which covers it once the
  // column is narrow; it stays in the heading's tooltip.
  const roomForHint = axisWidth === 0 || axisWidth >= 460;

  return (
    <div className="mx-4 mb-5 flex min-h-0 flex-1 flex-col rounded-card border border-navy/[0.06] bg-sheet-card px-4 pb-1 pt-1.5 shadow-card sm:mx-6 sm:px-6">
      <div className={`hidden ${GRID} h-[30px] shrink-0 gap-x-3 md:grid xl:gap-x-5`}>
        <span className="col-span-2" />
        <div ref={axisRef} className="relative">
          {ladder.months.filter((_, i) => i % stride === 0).map((tick) => (
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
        className={`grid ${GRID} min-h-[58px] shrink-0 items-end gap-x-3 border-b border-sheet-rule pb-2 xl:gap-x-5`}
      >
        <span />
        <Head label="Engagement" unit="and product owner" />
        <span className={`relative min-w-0 ${CALENDAR}`}>
          <Head
            label="Release date → estimate"
            unit={roomForHint ? "hover a row for exact dates" : "\u00a0"}
            title="Release date → estimate, hover a row for exact dates"
          />
          <span
            className="absolute bottom-0 -translate-x-1/2 rounded-full bg-navy px-2 text-[17px] font-[650] text-white"
            style={{ left: `${todayPct}%` }}
          >
            today
          </span>
        </span>
        <Head label="Release" unit="as of today" align="right" />
        <Head label="Progress" unit="% of cycle done" className={XL} />
        <Head label="Team" unit="out of 5" className={XXL} />
        <Head label="Customer" unit="out of 5" className={XXL} />
        <Head label="Next week" unit="expected velocity" className={XL} />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {ladder.rows.map((row, i) => {
          const { engagement: e } = row;
          const late = e.state === "late";
          const last = i === ladder.rows.length - 1;

          // The bar, split at today: what has happened, then what is forecast.
          const d = row.releasePct;
          const est = row.estimatePct;
          const pair = d !== null && est !== null && est > d;
          const solidW = pair ? Math.max(0, Math.min(est, todayPct) - d) : 0;
          const hatchL = pair ? Math.max(d, todayPct) : 0;
          const hatchW = pair ? Math.max(0, est - hatchL) : 0;

          return (
            <Link
              key={e.id}
              to={`/feedback/${e.id}?week=${currentWeek}`}
              className={`group -mx-3 grid ${GRID} min-h-0 flex-1 items-center gap-x-3 rounded-xl px-3 xl:gap-x-5 transition-colors hover:bg-sheet focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand ${
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
                <b
                  title={e.customer}
                  className="block truncate text-[21px] font-bold leading-[26px] tracking-[-0.01em]"
                >
                  {e.customer}
                </b>
                <span
                  title={e.owner}
                  className="block truncate text-[17px] leading-[22px] text-ink-3"
                >
                  {e.owner}
                </span>
              </span>

              <span className={`relative h-[54px] ${CALENDAR}`}>
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
                    release {showDate(e.release)}
                  </HoverLabel>
                )}
                {est !== null && (
                  <HoverLabel pct={est} top="top-[38px]" tone="text-ink">
                    {row.singlePoint ? "release and estimate" : "est."}{" "}
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
                ) : e.daysToRelease !== null ? (
                  <>
                    <b className="block text-[19px] font-semibold leading-[26px] tabular-nums text-ink-2">
                      {e.daysToRelease}
                    </b>
                    <span className="text-[17px] text-ink-3">days left</span>
                  </>
                ) : (
                  <span className="text-[17px] text-ink-3">not recorded</span>
                )}
              </span>

              <span className={`min-w-0 items-center gap-2.5 ${XL}`}>
                <ProgressBar value={e.progress} />
              </span>
              <span className={`min-w-0 items-center gap-2.5 ${XXL}`}>
                <Meter value={e.teamHappiness} />
              </span>
              <span className={`min-w-0 items-center gap-2.5 ${XXL}`}>
                <Meter value={e.customerHappiness} />
              </span>
              <span className={`min-w-0 items-center gap-2 text-[17px] font-semibold ${XL}`}>
                <VelocityDot velocity={e.velocity} />
                <span className="truncate" title={e.velocityLabel ?? undefined}>
                  {e.velocityLabel?.replace(" velocity expected", "") ?? "—"}
                </span>
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
  className = "flex",
  title = `${label}, ${unit}`,
}: {
  label: string;
  unit: string;
  align?: "right";
  title?: string;
  /** Its display, which is how a column is dropped at narrower widths. */
  className?: string;
}) {
  // One line each, cut rather than wrapped, so a narrow column keeps the
  // header row the height of the others. The full text is in the tooltip.
  return (
    <span
      title={title}
      className={`min-w-0 flex-col ${className} ${align === "right" ? "text-right" : ""}`}
    >
      <b className="truncate text-[18px] font-bold text-ink-2">{label}</b>
      <span className="truncate text-[17px] font-normal text-ink-3">{unit}</span>
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
