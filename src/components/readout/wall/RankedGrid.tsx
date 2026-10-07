import { Link } from "react-router-dom";
import type { Engagement } from "../../../lib/engagements";
import { showDate } from "../../../lib/engagements";
import { Labelled, Meter, ProgressBar, VelocityLight } from "../primitives";
import { STATE_EDGE, STATE_TEXT } from "../state-styles";

interface RankedGridProps {
  engagements: Engagement[];
  currentWeek: number;
}

/** "Behind deadline by +145 days", or "Due in 9 days" when nothing has slipped. */
function Hero({ engagement }: { engagement: Engagement }) {
  const { state, slipDays, landsInDays } = engagement;
  const tone = STATE_TEXT[state];

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
        <div className="text-[17px] leading-none text-ink-3">Schedule</div>
        <div className="text-[27px] font-bold leading-none text-ink-3">
          Not recorded
        </div>
      </>
    );
  }

  return (
    <>
      <div className="text-[17px] leading-none text-ink-3">Due in</div>
      <div className="flex items-baseline gap-1.5">
        <b className="text-[37px] font-extrabold leading-none tracking-tighter tabular-nums">
          {landsInDays}
        </b>
        <span className="text-lg text-ink-3">days</span>
      </div>
    </>
  );
}

function OwnersCall({ engagement }: { engagement: Engagement }) {
  const { ownerSaysOnTrack, contradicts, slipDays } = engagement;

  if (ownerSaysOnTrack === null) {
    return <span className="text-ink-3">Not reported</span>;
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

  return (
    <Link
      to={`/feedback/${engagement.id}?week=${currentWeek}`}
      className={`flex flex-col overflow-hidden rounded-md border-2 border-l-[10px] border-sheet-rule bg-sheet-card transition-shadow hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        STATE_EDGE[engagement.state]
      }`}
    >
      <div className="min-h-[68px] bg-navy px-4 py-2.5 text-white">
        <b className="block text-[22px] font-bold leading-tight tracking-tight">
          {engagement.customer}
        </b>
        <span className="text-[17px] text-white/70">{engagement.owner}</span>
      </div>

      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-3 pt-2.5">
        <Hero engagement={engagement} />

        {sameDate ? (
          <div className="flex items-baseline justify-between gap-2 text-[17px]">
            <span className="text-ink-3">Deadline and estimate</span>
            <span className="font-semibold tabular-nums">
              {showDate(engagement.deadline)}
            </span>
          </div>
        ) : (
          <>
            <div className="flex items-baseline justify-between gap-2 text-[17px]">
              <span className="text-ink-3">Deadline</span>
              <span className="font-semibold tabular-nums">
                {showDate(engagement.deadline)}
              </span>
            </div>
            <div className="flex items-baseline justify-between gap-2 text-[17px]">
              <span className="text-ink-3">Estimate</span>
              <span className="font-semibold tabular-nums">
                {showDate(engagement.estimate)}
              </span>
            </div>
          </>
        )}

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

        <div className="mt-auto border-t-2 border-sheet-rule pt-1.5 text-[17px] leading-snug">
          <span className="block text-ink-3">
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
  if (!engagements.length) {
    return (
      <p className="p-8 text-xl text-ink-3">
        No submissions for week {currentWeek}.
      </p>
    );
  }

  return (
    <div
      className="grid flex-1 gap-3.5 p-4"
      style={{
        gridTemplateColumns: `repeat(${Math.min(
          5,
          Math.max(1, Math.ceil(engagements.length / 2))
        )}, minmax(0, 1fr))`,
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
