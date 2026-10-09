import type { TimelineGeometry } from "../../../lib/timeline";
import { formatDate } from "../../../lib/date-utils";
import { HATCH } from "../state-styles";

/**
 * Keeps a mark's label inside the axis. Centred is right until the mark nears
 * an edge, where the label would run past the container and be clipped.
 */
function labelAlign(pct: number): string {
  if (pct <= 18) return "translate-x-0 text-left";
  if (pct >= 82) return "-translate-x-full text-right";
  return "-translate-x-1/2 text-center";
}

interface MiniCalendarProps {
  timeline: TimelineGeometry;
  deadline: Date | null;
  estimate: Date | null;
  /** Days since the deadline passed, or null while it is still ahead. */
  overdueDays: number | null;
  /** Whether the estimate's overrun reads as late or as a warning. */
  tone: "late" | "watch";
}

/**
 * The agreed deadline and the owner's estimate on one axis.
 *
 * The span from the deadline to today is solid and named - it has already
 * happened. The span from today on to the estimate is hatched: that part is the
 * owner's forecast, not a fact. A length is read faster than a number of days,
 * and it is the one encoding that survives a compressed video call intact.
 */
export function MiniCalendar({
  timeline,
  deadline,
  estimate,
  overdueDays,
  tone,
}: MiniCalendarProps) {
  const { months, deadlinePct, estimatePct, todayPct, singlePoint } = timeline;

  const pair =
    deadlinePct !== null && estimatePct !== null && estimatePct > deadlinePct;
  const solidEnd =
    pair && overdueDays !== null ? Math.min(estimatePct!, todayPct) : null;
  const solidW = solidEnd !== null ? Math.max(0, solidEnd - deadlinePct!) : 0;
  const hatchL = pair ? Math.max(deadlinePct!, solidEnd ?? deadlinePct!) : 0;
  const hatchW = pair ? Math.max(0, estimatePct! - hatchL) : 0;

  // Two labels near each other above the axis would collide, so the estimate's
  // drops to a second line when the dates are close.
  const crowded =
    deadlinePct !== null &&
    estimatePct !== null &&
    Math.abs(estimatePct - deadlinePct) < 35;

  const deadlineInk = overdueDays !== null ? "text-late-ink" : "text-ink-2";

  return (
    <div className="relative h-[124px]" aria-hidden="true">
      <span className="absolute inset-x-0 top-[55px] h-0.5 rounded bg-sheet-rule" />

      {months.map((tick) => (
        <span key={`${tick.label}-${tick.pct}`}>
          <span
            className="absolute top-[50px] h-3 w-0.5 bg-[#C3C7D2]"
            style={{ left: `${tick.pct}%` }}
          />
          <span
            className={`absolute top-[86px] whitespace-nowrap text-[17px] text-ink-3 ${labelAlign(
              tick.pct
            )}`}
            style={{ left: `${tick.pct}%` }}
          >
            {tick.label}
          </span>
        </span>
      ))}

      {solidW > 0 && (
        <span
          className={`absolute top-[45px] flex h-[22px] items-center overflow-hidden whitespace-nowrap bg-late-mark pl-[18px] text-[17px] font-bold text-white ${
            hatchW > 0 ? "rounded-l-full" : "rounded-full"
          }`}
          style={{ left: `${deadlinePct}%`, width: `${solidW}%` }}
        >
          {solidW >= 25 && `${overdueDays} ${overdueDays === 1 ? "day" : "days"} overdue`}
        </span>
      )}
      {hatchW > 0 && (
        <span
          className={`absolute top-[45px] h-[22px] ${
            solidW > 0 ? "rounded-r-full" : "rounded-full"
          }`}
          style={{ left: `${hatchL}%`, width: `${hatchW}%`, background: HATCH[tone] }}
        />
      )}

      {singlePoint && estimate ? (
        <>
          <span
            className="absolute top-[46px] h-5 w-5 -translate-x-1/2 rounded-full bg-fine-mark ring-[3px] ring-white"
            style={{ left: `${estimatePct}%` }}
          />
          <span
            className={`absolute top-0 whitespace-nowrap text-[19px] font-bold text-fine-ink ${labelAlign(
              estimatePct ?? 50
            )}`}
            style={{ left: `${estimatePct}%` }}
          >
            deadline and estimate {formatDate(estimate, "dayMonthYear")}
          </span>
        </>
      ) : (
        <>
          {deadlinePct !== null && deadline && (
            <>
              <span
                className={`absolute top-[46px] h-5 w-5 -translate-x-1/2 rounded-full border-4 bg-white ${
                  overdueDays !== null ? "border-late-mark" : "border-ink-3"
                }`}
                style={{ left: `${deadlinePct}%` }}
              />
              <span
                className={`absolute top-0 whitespace-nowrap text-[19px] font-bold ${deadlineInk} ${labelAlign(
                  deadlinePct
                )}`}
                style={{ left: `${deadlinePct}%` }}
              >
                deadline {formatDate(deadline, "dayMonthYear")}
              </span>
            </>
          )}
          {estimatePct !== null && estimate && (
            <>
              <span
                className="absolute top-[46px] h-5 w-5 -translate-x-1/2 rounded-full bg-ink ring-[3px] ring-white"
                style={{ left: `${estimatePct}%` }}
              />
              <span
                className={`absolute whitespace-nowrap text-[19px] font-bold ${
                  crowded ? "top-[22px]" : "top-0"
                } ${labelAlign(estimatePct)}`}
                style={{ left: `${estimatePct}%` }}
              >
                estimate {formatDate(estimate, "dayMonthYear")}
              </span>
            </>
          )}
        </>
      )}

      <span
        className="absolute top-9 h-10 w-[3px] -translate-x-1/2 rounded bg-navy"
        style={{ left: `${todayPct}%` }}
      />
      <span
        className={`absolute top-[86px] whitespace-nowrap rounded-full bg-navy px-2 text-[17px] font-[650] text-white ${labelAlign(
          todayPct
        )}`}
        style={{ left: `${todayPct}%` }}
      >
        today
      </span>
    </div>
  );
}
