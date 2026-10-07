import type { TimelineGeometry } from "../../../lib/timeline";
import { formatDate } from "../../../lib/date-utils";

/**
 * Keeps a mark's label inside the axis. Centred is right until the mark nears
 * an edge, where the label would run past the container and be clipped.
 */
function labelAlign(pct: number): string {
  if (pct <= 18) return "left-0 translate-x-0 text-left";
  if (pct >= 82) return "right-0 translate-x-0 text-right";
  return "left-1/2 -translate-x-1/2 text-center";
}

interface MiniCalendarProps {
  timeline: TimelineGeometry;
  deadline: Date | null;
  estimate: Date | null;
}

/**
 * The committed date and the estimate on one axis, with the gap between them
 * drawn. A length is read faster than a number of days, and it is the one
 * encoding that survives a compressed video call intact.
 */
export function MiniCalendar({
  timeline,
  deadline,
  estimate,
}: MiniCalendarProps) {
  const { months, deadlinePct, estimatePct, todayPct, slipBar, singlePoint } =
    timeline;

  return (
    <div className="relative h-[92px]" aria-hidden="true">
      <span className="absolute inset-x-0 top-[52px] h-[3px] bg-sheet-rule" />

      {months.map((tick) => (
        <span
          key={`${tick.label}-${tick.pct}`}
          className="absolute top-[44px] h-[19px] w-[3px] bg-ink-3"
          style={{ left: `${tick.pct}%` }}
        >
          <span
            className={`absolute top-6 whitespace-nowrap text-[17px] text-ink-3 ${labelAlign(
              tick.pct
            )}`}
          >
            {tick.label}
          </span>
        </span>
      ))}

      <span
        className="absolute top-[41px] h-[26px] w-[4px] bg-navy"
        style={{ left: `${todayPct}%` }}
      >
        <span
          className={`absolute top-7 whitespace-nowrap text-[17px] font-bold text-navy ${labelAlign(
            todayPct
          )}`}
        >
          today
        </span>
      </span>

      {slipBar && (
        <span
          className="absolute top-[46px] h-[15px] rounded-sm bg-late-mark"
          style={{ left: `${slipBar.leftPct}%`, width: `${slipBar.widthPct}%` }}
        />
      )}

      {singlePoint && estimate ? (
        <span
          className="absolute top-[45px] h-[19px] w-[19px] -translate-x-1/2 rounded-full bg-fine-mark"
          style={{ left: `${estimatePct}%` }}
        >
          <span
            className={`absolute top-[-30px] whitespace-nowrap text-[19px] font-bold text-fine-ink ${labelAlign(
              estimatePct ?? 50
            )}`}
          >
            deadline and estimate &middot; {formatDate(estimate, "dayMonthYear")}
          </span>
        </span>
      ) : (
        <>
          {deadlinePct !== null && deadline && (
            <span
              className="absolute top-[36px] h-[35px] w-[5px] bg-late-mark"
              style={{ left: `${deadlinePct}%` }}
            >
              <span
                className={`absolute top-[-28px] whitespace-nowrap text-[19px] font-bold text-late-ink ${labelAlign(
                  deadlinePct
                )}`}
              >
                deadline {formatDate(deadline, "dayMonthYear")}
              </span>
            </span>
          )}
          {estimatePct !== null && estimate && (
            <span
              className="absolute top-[36px] h-[35px] w-[5px] bg-ink"
              style={{ left: `${estimatePct}%` }}
            >
              <span
                className={`absolute top-[76px] whitespace-nowrap text-[19px] font-bold ${labelAlign(
                  estimatePct
                )}`}
              >
                estimate {formatDate(estimate, "dayMonthYear")}
              </span>
            </span>
          )}
        </>
      )}
    </div>
  );
}
