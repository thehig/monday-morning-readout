import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Engagement } from "../../../lib/engagements";
import { showDate } from "../../../lib/engagements";
import { Labelled, Meter, ProgressBar, VelocityLight } from "../primitives";
import { fitColumns, GRID_PADDING } from "../../../lib/wall-view";
import {
  STATE_FILL,
  STATE_LABEL,
  STATE_RULE,
  STATE_TEXT,
} from "../state-styles";

interface RankedGridProps {
  engagements: Engagement[];
  currentWeek: number;
}

/** "Behind deadline by +145 days", or "Due in 9 days" when nothing has slipped. */
function Hero({ engagement }: { engagement: Engagement }) {
  const { state, slipDays, landsInDays } = engagement;
  const tone = STATE_TEXT[state];
  const quiet = STATE_LABEL[state];

  if ((state === "late" || state === "watch") && slipDays !== null && slipDays > 0) {
    return (
      <>
        <div className={`text-[17px] font-semibold leading-none ${tone}`}>
          {state === "late" ? "Behind deadline by" : "Estimate overruns by"}
        </div>
        <div className={`flex items-baseline gap-1.5 ${tone}`}>
          <b className="text-[37px] font-extrabold leading-none tracking-tighter tabular-nums">
            +{slipDays}
          </b>
          <span className="text-lg font-semibold">days</span>
        </div>
      </>
    );
  }

  if (state === "late") {
    return (
      <>
        <div className={`text-[17px] font-semibold leading-none ${tone}`}>
          Deadline passed
        </div>
        <div className={`text-[27px] font-bold leading-none ${tone}`}>
          {showDate(engagement.deadline)}
        </div>
      </>
    );
  }

  if (landsInDays === null) {
    return (
      <>
        <div className={`text-[17px] leading-none ${quiet}`}>Schedule</div>
        <div className={`text-[27px] font-bold leading-none ${quiet}`}>
          Not recorded
        </div>
      </>
    );
  }

  return (
    <>
      <div className={`text-[17px] leading-none ${quiet}`}>Due in</div>
      <div className={`flex items-baseline gap-1.5 ${tone}`}>
        <b className="text-[37px] font-extrabold leading-none tracking-tighter tabular-nums">
          {landsInDays}
        </b>
        <span className="text-lg font-semibold">days</span>
      </div>
    </>
  );
}

function OwnersCall({ engagement }: { engagement: Engagement }) {
  const { ownerSaysOnTrack, contradicts, slipDays, state } = engagement;

  if (ownerSaysOnTrack === null) {
    return <span className={STATE_LABEL[state]}>Not reported</span>;
  }

  if (contradicts) {
    return (
      <span className="font-bold text-late-ink">
        Says it will be met &mdash; {slipDays} days after its own estimate
      </span>
    );
  }

  return (
    <span
      className={`font-bold ${ownerSaysOnTrack ? "text-fine-ink" : "text-late-ink"}`}
    >
      {ownerSaysOnTrack ? "Says it will be met" : "Says it will be missed"}
    </span>
  );
}

function Card({
  engagement,
  currentWeek,
}: {
  engagement: Engagement;
  currentWeek: number;
}) {
  const sameDate =
    engagement.deadline &&
    engagement.estimate &&
    engagement.slipDays === 0;

  const quiet = STATE_LABEL[engagement.state];

  return (
    <Link
      to={`/feedback/${engagement.id}?week=${currentWeek}`}
      className={`flex flex-col overflow-hidden rounded-md border-2 transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        STATE_FILL[engagement.state]
      }`}
    >
      {/*
        One line each, cut if they have to be, which keeps the header the same
        height on every tile so the owner and every row under it line up across
        the grid. A cut name is shown in full on the Stop and on hover.
      */}
      <div className="bg-navy px-4 py-2.5 text-white">
        <b
          title={engagement.customer}
          className="block truncate text-[22px] font-bold leading-tight tracking-tight"
        >
          {engagement.customer}
        </b>
        <span className="block truncate text-[17px] text-white/70">
          {engagement.owner}
        </span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-3 pt-2.5">
        <Hero engagement={engagement} />

        {sameDate ? (
          <div className="flex items-baseline justify-between gap-2 text-[17px]">
            <span className={quiet}>Deadline and estimate</span>
            <span className="font-semibold tabular-nums">
              {showDate(engagement.deadline)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2 text-[17px]">
              <span className={quiet}>Deadline</span>
              <span className="font-semibold tabular-nums">
                {showDate(engagement.deadline)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2 text-[17px]">
              <span className={quiet}>Estimate</span>
              <span className="font-semibold tabular-nums">
                {showDate(engagement.estimate)}
              </span>
            </div>
          </>
        )}

        <Labelled label="Progress" tone={quiet}>
          <ProgressBar value={engagement.progress} />
        </Labelled>
        <Labelled label="Team" tone={quiet}>
          <Meter value={engagement.teamHappiness} />
        </Labelled>
        <Labelled label="Customer" tone={quiet}>
          <Meter value={engagement.customerHappiness} />
        </Labelled>
        <Labelled label="Next week" tone={quiet}>
          <VelocityLight velocity={engagement.velocity} tone={quiet} />
        </Labelled>

        <div
          className={`mt-auto border-t-2 pt-1.5 text-[17px] leading-snug ${
            STATE_RULE[engagement.state]
          }`}
        >
          <span className={`block ${quiet}`}>
            Owner&rsquo;s own call on the deadline
          </span>
          <OwnersCall engagement={engagement} />
        </div>
      </div>
    </Link>
  );
}

/**
 * The Wall's default layout: one tile per engagement, ordered by schedule,
 * every value labelled in place so the board needs no key.
 */
export function RankedGrid({ engagements, currentWeek }: RankedGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new ResizeObserver(([entry]) =>
      setWidth(entry.contentRect.width + GRID_PADDING)
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // Before the first measurement, assume the drawn width rather than one
  // column, so the grid does not land wrong and then jump.
  const columns = fitColumns(width || 1920, engagements.length);

  if (!engagements.length) {
    return (
      <p className="p-8 text-xl text-ink-3">
        No submissions for week {currentWeek}.
      </p>
    );
  }

  return (
    <div
      ref={ref}
      className="grid flex-1 gap-3.5 p-4"
      style={{
        gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
        // Rows take their content's height and share anything left over, so
        // reflowing to a third row grows the page rather than squashing two.
        gridAutoRows: "minmax(min-content, 1fr)",
      }}
    >
      {engagements.map((engagement) => (
        <Card
          key={engagement.id}
          engagement={engagement}
          currentWeek={currentWeek}
        />
      ))}
    </div>
  );
}
