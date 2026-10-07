import { Link } from "react-router-dom";
import { buildLadder } from "../../../lib/wall-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { Meter, ProgressBar, VelocityDot } from "../primitives";
import { STATE_TEXT } from "../state-styles";

interface LadderProps {
  engagements: Engagement[];
  currentWeek: number;
  today?: Date;
}

const GRID = "grid-cols-[44px_340px_1fr_124px_166px_148px_148px_160px]";

/**
 * One row per engagement on a shared calendar.
 *
 * The only Wall layout where slip is comparable down a column, because every
 * engagement sits on the same scale. Exact dates stay hidden until a row is
 * hovered, so the resting state is calm.
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

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-3 pt-2">
      <div className={`grid ${GRID} gap-x-4`}>
        <span className="col-span-2" />
        <div className="relative h-6">
          {ladder.months.map((tick) => (
            <span
              key={`${tick.label}-${tick.pct}`}
              className="absolute top-0 -translate-x-1/2 whitespace-nowrap text-[17px] text-ink-3"
              style={{ left: `${tick.pct}%` }}
            >
              {tick.label}
            </span>
          ))}
        </div>
      </div>

      <div className={`grid ${GRID} items-end gap-x-4 border-b-[3px] border-ink-2 pb-1.5`}>
        <span />
        <Head label="Engagement" unit="and product owner" />
        <Head label="Committed deadline → estimate" unit="hover a row for exact dates" />
        <Head label="Slip" unit="days late" align="right" />
        <Head label="Progress" unit="% of cycle done" />
        <Head label="Team" unit="out of 5" />
        <Head label="Customer" unit="out of 5" />
        <Head label="Next week" unit="expected velocity" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        {ladder.rows.map((row, i) => {
          const { engagement: e } = row;

          return (
            <Link
              key={e.id}
              to={`/feedback/${e.id}?week=${currentWeek}`}
              className={`group grid ${GRID} flex-1 items-center gap-x-4 border-b-2 border-sheet-rule transition-colors hover:bg-sheet-card focus-visible:outline focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand`}
            >
              <span
                className={`text-center text-[19px] font-extrabold tabular-nums ${
                  e.state === "late" ? "text-late-mark" : "text-ink-3"
                }`}
              >
                {i + 1}
              </span>

              <span className="pr-2">
                <b className="block text-[21px] font-bold leading-tight tracking-tight">
                  {e.customer}
                </b>
                <span className="text-[17px] text-ink-3">{e.owner}</span>
              </span>

              <span className="relative h-[46px]">
                <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-sheet-rule" />
                <span
                  className="absolute inset-y-2 w-0.5 bg-navy/40"
                  style={{ left: `${ladder.todayPct}%` }}
                />

                {row.slipBar && (
                  <span
                    className={`absolute top-1/2 h-[15px] -translate-y-1/2 rounded-sm ${
                      e.state === "late" ? "bg-late-mark" : "bg-watch-mark"
                    }`}
                    style={{
                      left: `${row.slipBar.leftPct}%`,
                      width: `${row.slipBar.widthPct}%`,
                    }}
                  />
                )}

                {row.singlePoint ? (
                  <Mark pct={row.estimatePct!} kind="dot" label={`due & est. ${showDate(e.estimate)}`} below />
                ) : (
                  <>
                    {row.deadlinePct !== null && (
                      <Mark pct={row.deadlinePct} kind="ghost" label={`due ${showDate(e.deadline)}`} />
                    )}
                    {row.estimatePct !== null && (
                      <Mark pct={row.estimatePct} kind="pin" label={`est. ${showDate(e.estimate)}`} below />
                    )}
                  </>
                )}
              </span>

              <span className="text-right">
                {e.slipDays !== null && e.slipDays > 0 ? (
                  <>
                    <b className={`block text-[23px] font-extrabold leading-tight tabular-nums ${STATE_TEXT[e.state]}`}>
                      +{e.slipDays}
                    </b>
                    <span className={`text-[17px] ${STATE_TEXT[e.state]}`}>days</span>
                  </>
                ) : (
                  <>
                    <b className="block text-[19px] font-semibold leading-tight text-ink-2">
                      none
                    </b>
                    <span className="text-[17px] text-ink-3">on the date</span>
                  </>
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
              <span className="flex items-center gap-2 text-[17px]">
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
    <span className={align === "right" ? "text-right" : undefined}>
      <b className="block text-[18px] font-bold text-ink-2">{label}</b>
      <span className="text-[17px] font-normal text-ink-3">{unit}</span>
    </span>
  );
}

/** A dated mark on the shared calendar; the date appears on row hover. */
function Mark({
  pct,
  kind,
  label,
  below,
}: {
  pct: number;
  kind: "pin" | "ghost" | "dot";
  label: string;
  below?: boolean;
}) {
  const body =
    kind === "dot" ? (
      <span className="block h-[17px] w-[17px] -translate-x-1/2 rounded-full bg-fine-mark" />
    ) : (
      <span
        className={`block -translate-x-1/2 ${
          kind === "pin" ? "h-[28px] w-[4px] bg-ink" : "h-[21px] w-[3px] bg-ink-3"
        }`}
      />
    );

  return (
    <span
      className="absolute top-1/2 -translate-y-1/2"
      style={{ left: `${pct}%` }}
    >
      {body}
      <span
        className={`pointer-events-none absolute whitespace-nowrap text-[17px] tabular-nums text-ink-2 opacity-0 transition-opacity group-hover:opacity-100 ${
          below ? "top-4" : "bottom-4"
        } ${pct > 80 ? "right-0" : "left-0 -translate-x-1/2"}`}
      >
        {label}
      </span>
    </span>
  );
}
