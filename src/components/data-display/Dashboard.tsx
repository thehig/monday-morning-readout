import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { usePOFeedbackByWeek } from "../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../lib/date-utils";
import { toEngagements, summarise } from "../../lib/engagements";
import {
  usePreviousWeekTotals,
  scheduleBaseline,
} from "../../hooks/use-week-comparison";
import { Delta } from "../readout/primitives";
import { RankedGrid } from "../readout/wall/RankedGrid";
import { Ladder } from "../readout/wall/Ladder";
import {
  FooterActions,
  Key,
  Segmented,
  TopBarActions,
} from "../readout/chrome";
import { isTypingTarget } from "../readout/useReadoutKeys";

type WallLayout = "grid" | "ladder";

const LAYOUTS: { value: WallLayout; label: string; digit: string }[] = [
  { value: "grid", label: "Ranked grid", digit: "1" },
  { value: "ladder", label: "Ladder", digit: "2" },
];

/**
 * The Wall: the state the Monday call opens on.
 *
 * Two layouts over identical data, each directing the eye differently - by
 * rank, or along a shared calendar. The operator picks one; they are not
 * different information.
 */
export function Dashboard() {
  const [searchParams] = useSearchParams();
  const [layout, setLayout] = useState<WallLayout>("grid");
  const today = new Date();

  const navigate = useNavigate();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(today.getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);
  const totals = summarise(engagements);
  const lastWeek = usePreviousWeekTotals(currentWeek);

  const firstId = engagements[0]?.id;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;

      const picked = LAYOUTS.find((l) => l.digit === event.key);
      if (picked) {
        setLayout(picked.value);
        return;
      }

      // The call opens by stepping into whatever needs a decision first.
      if (event.key === "ArrowRight" && firstId !== undefined) {
        event.preventDefault();
        navigate(`/feedback/${firstId}?week=${currentWeek}`);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, currentWeek, firstId]);

  if (isLoading) {
    return (
      <div className="p-8 text-xl text-ink-3">Loading week {currentWeek}…</div>
    );
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="flex h-16 shrink-0 items-center gap-4 px-8">
        {/*
          The grid's cards each carry their own state, so a count over them
          only restated the board. The Ladder's rows do not, so it keeps one.
        */}
        {layout === "ladder" && (
          <>
            <h2 className="text-2xl font-[750] tracking-[-0.015em]">
              {totals.needingDecision > 0 ? "Needs a decision first" : "All on the date"}
            </h2>
            <span className="flex items-center text-xl tabular-nums text-ink-3">
              {totals.needingDecision} of {totals.engagements}
              <Delta
                now={totals.needingDecision}
                before={scheduleBaseline(lastWeek, (t) => t.needingDecision)}
              />
            </span>
          </>
        )}

        {/*
          The owner doubting even the date they set themselves - the loudest
          thing the readout can say, drawn as something rather than set at the
          weight of a caption. "On track" is about the owner's own estimate, so
          this is the warning, not an owner whose estimate passes the deadline.
        */}
        {totals.offTrack > 0 && (
          <span
            className={`flex items-center gap-2.5 rounded-full bg-late-block2 py-[5px] pl-3 pr-4 text-white ${
              layout === "ladder" ? "ml-2.5" : ""
            }`}
          >
            <ExclamationTriangleIcon className="h-5 w-5 stroke-2" aria-hidden="true" />
            <b className="text-xl font-extrabold tabular-nums">{totals.offTrack}</b>
            {/*
              One line: the Wall's grid uses the whole frame, so a second line
              here comes straight off the tiles below it.
            */}
            <span className="whitespace-nowrap text-[17px] font-semibold">
              not on track for their own estimate
            </span>
          </span>
        )}

        <TopBarActions>
          <Segmented
            label="Wall layout"
            options={LAYOUTS}
            value={layout}
            onChange={setLayout}
          />
        </TopBarActions>

        <FooterActions>
          <span>
            <Key>1</Key>
            <Key>2</Key>
            layout
          </span>
          {firstId !== undefined && (
            <span>
              <Key>&rarr;</Key>step into the first that needs a decision
            </span>
          )}
        </FooterActions>
      </div>

      {engagements.length === 0 ? (
        <p className="p-8 text-xl text-ink-3">
          No submissions for week {currentWeek}.
        </p>
      ) : layout === "grid" ? (
        <RankedGrid engagements={engagements} currentWeek={currentWeek} />
      ) : (
        <Ladder
          engagements={engagements}
          currentWeek={currentWeek}
          today={today}
        />
      )}
    </div>
  );
}
