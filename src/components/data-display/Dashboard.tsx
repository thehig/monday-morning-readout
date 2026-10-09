import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { usePOFeedbackByWeek } from "../../hooks/use-po-feedback";
import { getPreviousWeek } from "../../lib/date-utils";
import { toEngagements, summarise } from "../../lib/engagements";
import { RankedGrid } from "../readout/wall/RankedGrid";
import { Ladder } from "../readout/wall/Ladder";
import { FooterActions, Key } from "../readout/chrome";
import { isTypingTarget } from "../readout/useReadoutKeys";

export type WallLayout = "grid" | "ladder";

/**
 * The Wall: the pages the Monday call opens on.
 *
 * Two layouts over identical data, each directing the eye differently - by
 * rank, or along a shared calendar - and each at its own address, so the
 * operator can open, bookmark or share the one they want. They are not
 * different information.
 */
export function Dashboard({ layout }: { layout: WallLayout }) {
  const [searchParams] = useSearchParams();
  const today = new Date();

  const navigate = useNavigate();

  const weekParam = searchParams.get("week");
  const currentWeek = weekParam
    ? parseInt(weekParam)
    : getPreviousWeek(today.getFullYear());

  const { data, isLoading } = usePOFeedbackByWeek(currentWeek, true);
  const engagements = toEngagements(data);
  const totals = summarise(engagements);

  const firstId = engagements[0]?.id;

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;

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
          The owner doubting even the date they set themselves - the loudest
          thing the readout can say, drawn as something rather than set at the
          weight of a caption. "On track" is about the owner's own estimate, so
          this is the warning, not an owner whose estimate passes the deadline.
        */}
        {totals.offTrack > 0 && (
          <span
            className="flex items-center gap-2.5 rounded-full bg-late-block2 py-[5px] pl-3 pr-4 text-white"
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

        <FooterActions>
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
