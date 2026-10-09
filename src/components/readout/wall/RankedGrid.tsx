import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import type { Engagement } from "../../../lib/engagements";
import { severity, showDate } from "../../../lib/engagements";
import {
  Labelled,
  Meter,
  OnTrack,
  ProgressBar,
  VelocityLight,
} from "../primitives";
import { CARD_MAX_WIDTH, fitColumns, GRID_PADDING } from "../../../lib/wall-view";
import { stateBlock, STATE_TEXT } from "../state-styles";

interface RankedGridProps {
  engagements: Engagement[];
  currentWeek: number;
}

/**
 * The card's one coloured element: the hard fact about the agreed deadline.
 *
 * Past it, how many days ago; ahead of it, how many days remain - and for an
 * engagement still ahead whose estimate already overruns, that overrun, which
 * is why its block is amber.
 */
function StateBlock({ engagement }: { engagement: Engagement }) {
  const { state, overdueDays, daysToDeadline, slipDays } = engagement;

  let figure: string;
  let lines: [string, string];

  if (overdueDays !== null) {
    figure = String(overdueDays);
    lines = ["days past", "the deadline"];
  } else if (daysToDeadline === null) {
    figure = "–";
    lines = ["schedule", "not recorded"];
  } else if (state === "watch" && slipDays !== null && slipDays > 0) {
    figure = String(daysToDeadline);
    lines = ["days to the deadline,", `estimate +${slipDays} days`];
  } else {
    figure = String(daysToDeadline);
    lines = ["days to", "the deadline"];
  }

  return (
    <div
      className={`mt-3 flex items-center gap-3 rounded-xl px-3.5 py-2 ${stateBlock(
        state,
        severity(engagement)
      )}`}
    >
      <b className="text-[40px] font-extrabold leading-[44px] tracking-[-0.035em] tabular-nums">
        {figure}
      </b>
      <span className="flex flex-col text-[17px] font-semibold leading-5">
        <span>{lines[0]}</span>
        <span>{lines[1]}</span>
      </span>
    </div>
  );
}

/**
 * The agreed deadline, and the owner's estimate against it. The estimate's
 * distance from the deadline is labelled as the estimate's, so it is never read
 * as how late the engagement is today.
 */
function Dates({ engagement }: { engagement: Engagement }) {
  const { deadline, estimate, slipDays, state } = engagement;

  if (deadline && estimate && slipDays === 0) {
    return (
      <div className="mt-3 flex flex-col gap-0.5 text-[17px] leading-[21px]">
        <span className="text-ink-3">Deadline and estimate</span>
        <span className="font-[650] tabular-nums">{showDate(deadline)}</span>
      </div>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-1 text-[17px] leading-[21px]">
      <div className="flex items-baseline gap-2.5">
        <span className="w-[84px] shrink-0 text-ink-3">Deadline</span>
        <span className="font-[650] tabular-nums">{showDate(deadline)}</span>
      </div>
      <div className="flex items-baseline gap-2.5">
        <span className="w-[84px] shrink-0 text-ink-3">Estimate</span>
        <span className="font-[650] tabular-nums">{showDate(estimate)}</span>
        {slipDays !== null && slipDays !== 0 && (
          <span
            className={`ml-auto whitespace-nowrap font-bold tabular-nums ${
              slipDays > 0 ? STATE_TEXT[state] : "text-fine-ink"
            }`}
          >
            {slipDays > 0 ? `+${slipDays}` : `−${-slipDays}`} days
          </span>
        )}
      </div>
    </div>
  );
}

function Card({
  engagement,
  currentWeek,
}: {
  engagement: Engagement;
  currentWeek: number;
}) {
  return (
    <Link
      to={`/feedback/${engagement.id}?week=${currentWeek}`}
      className="flex min-w-0 flex-col rounded-card border border-navy/[0.06] bg-sheet-card px-[18px] py-4 shadow-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
    >
      {/*
        One line each, cut if they have to be, which keeps every card's rows
        level across the grid. A cut name is shown in full on the Stop and on
        hover.
      */}
      <h2
        title={engagement.customer}
        className="truncate text-[22px] font-bold leading-7 tracking-[-0.01em]"
      >
        {engagement.customer}
      </h2>
      <p className="mt-0.5 truncate text-[17px] leading-[22px] text-ink-3">
        {engagement.owner}
      </p>

      <StateBlock engagement={engagement} />
      <Dates engagement={engagement} />

      <div className="my-2.5 h-px bg-ink/[0.08]" />

      <div className="flex flex-col gap-1.5">
        <Labelled label="Progress">
          <ProgressBar value={engagement.progress} />
        </Labelled>
        <Labelled label="Team">
          <Meter value={engagement.teamHappiness} />
        </Labelled>
        <Labelled label="Customer">
          <Meter value={engagement.customerHappiness} />
        </Labelled>
        <Labelled label="Next week">
          <VelocityLight velocity={engagement.velocity} />
        </Labelled>
      </div>

      <div className="mt-auto border-t border-ink/[0.08] pt-2.5">
        <OnTrack value={engagement.ownerSaysOnTrack} />
      </div>
    </Link>
  );
}

/**
 * The Wall's default layout: one card per engagement, ordered by schedule,
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
      className="grid flex-1 content-start justify-center gap-4 px-6 pb-5"
      style={{
        // Tiles share the width up to their maximum, and a week too small to
        // fill the screen sits centred rather than stretched.
        gridTemplateColumns: `repeat(${columns}, minmax(0, ${CARD_MAX_WIDTH}px))`,
        // Rows take their content's height and no more, so a short week does
        // not stretch its cards to fill the screen.
        gridAutoRows: "min-content",
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
