import { Link } from "react-router-dom";
import { buildField } from "../../../lib/wall-view";
import { showDate } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import type { LabelSide } from "../../../lib/wall-view";

interface FieldProps {
  engagements: Engagement[];
  currentWeek: number;
  today?: Date;
}

const DOT_FILL: Record<string, string> = {
  late: "bg-late-mark",
  watch: "bg-watch-mark",
  fine: "bg-fine-mark",
  unknown: "bg-ink-3",
};

const LABEL_POSITION: Record<LabelSide, string> = {
  right: "left-8 top-1/2 -translate-y-1/2 text-left",
  left: "right-8 top-1/2 -translate-y-1/2 text-right",
  above: "left-1/2 -translate-x-1/2 bottom-8 text-center",
};

/**
 * Engagements placed by how long until their deadline, against how much is
 * done.
 *
 * Everything left of the today line has a deadline that has already passed; the
 * shaded corner is where trouble lives. The week reads as a shape before any
 * name is read, which is the point - and crowding is its known weakness.
 */
export function Field({ engagements, currentWeek, today = new Date() }: FieldProps) {
  const field = buildField(engagements, today);
  const undated = engagements.filter((e) => !e.deadline);

  if (!field) {
    return (
      <p className="p-8 text-xl text-ink-3">
        No engagement has a committed deadline recorded.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-2 pt-3">
      <div className="flex min-h-0 flex-1 gap-12">
        <div className="flex w-[26px] shrink-0 items-center justify-center">
          <span className="whitespace-nowrap text-[18px] font-semibold text-ink-3 [writing-mode:vertical-rl] [transform:rotate(180deg)]">
            Cycle progress
          </span>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <div className="relative min-h-0 flex-1 border-b-[3px] border-l-[3px] border-ink-3 bg-sheet-card">
            {/*
              The caption sits at the top of its own zone, not the bottom.
              The bottom-left is where the engagements this zone is about
              actually land, and the caption was being written over them.
            */}
            <span
              className="absolute bottom-0 left-0 bg-late-wash"
              style={{
                width: `${field.danger.widthPct}%`,
                height: `${field.danger.heightPct}%`,
              }}
            >
              <span className="absolute left-4 top-2 text-[18px] font-bold text-late-ink">
                Deadline gone, little done
              </span>
            </span>

            {[25, 50, 75].map((y) => (
              <span
                key={y}
                className="absolute inset-x-0 h-0.5 bg-sheet-rule"
                style={{ bottom: `${y}%` }}
              >
                <span className="absolute right-full mr-2 -translate-y-1/2 text-[17px] tabular-nums text-ink-3">
                  {y}%
                </span>
              </span>
            ))}

            <span
              className="absolute inset-y-0 w-[4px] bg-navy"
              style={{ left: `${field.todayXPct}%` }}
            >
              <span className="absolute left-2.5 top-1.5 whitespace-nowrap text-[18px] font-bold text-navy">
                today
              </span>
            </span>

            {field.points.map((point) => (
              <Link
                key={point.engagement.id}
                to={`/feedback/${point.engagement.id}?week=${currentWeek}`}
                className="absolute -translate-x-1/2 translate-y-1/2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand"
                style={{ left: `${point.xPct}%`, bottom: `${point.yPct}%` }}
              >
                <span
                  className={`block h-[24px] w-[24px] rounded-full border-[3px] border-sheet-card ${
                    DOT_FILL[point.engagement.state]
                  }`}
                />
                <span
                  className={`absolute whitespace-nowrap ${
                    LABEL_POSITION[point.labelSide]
                  }`}
                  style={
                    point.labelOffset
                      ? { marginBottom: `${point.labelOffset}px` }
                      : undefined
                  }
                >
                  <b className="block text-[19px] font-bold leading-tight">
                    {point.engagement.customer}
                  </b>
                  <span className="block text-[17px] text-ink-3">
                    {point.clamped ? "◀ " : ""}
                    due {showDate(point.engagement.deadline)} &middot;{" "}
                    {point.engagement.progress}% done
                  </span>
                </span>
              </Link>
            ))}
          </div>

          <div className="relative h-[52px] shrink-0">
            {field.xTicks.map((tick) => (
              <span
                key={tick.label}
                className={`absolute top-1.5 -translate-x-1/2 whitespace-nowrap text-[17px] ${
                  tick.label === "today"
                    ? "font-bold text-navy"
                    : "tabular-nums text-ink-3"
                }`}
                style={{ left: `${tick.pct}%` }}
              >
                {tick.label}
              </span>
            ))}
            <span className="absolute left-1/2 top-8 -translate-x-1/2 text-[18px] font-semibold text-ink-3">
              Committed deadline
            </span>
          </div>
        </div>
      </div>

      {undated.length > 0 && (
        <p className="shrink-0 text-[17px] text-ink-3">
          <span className="font-semibold text-ink-2">No deadline recorded:</span>{" "}
          {undated.map((e) => e.customer).join(", ")}
        </p>
      )}
    </div>
  );
}
