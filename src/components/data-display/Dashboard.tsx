import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { Field } from "../readout/wall/Field";
import {
  FooterActions,
  Key,
  Segmented,
  TopBarActions,
} from "../readout/chrome";
import { isTypingTarget } from "../readout/useReadoutKeys";

type WallLayout = "grid" | "ladder" | "field";

const LAYOUTS: { value: WallLayout; label: string; digit: string }[] = [
  { value: "grid", label: "Ranked grid", digit: "1" },
  { value: "ladder", label: "Ladder", digit: "2" },
  { value: "field", label: "Field", digit: "3" },
];

/**
 * The Wall: the state the Monday call opens on.
 *
 * Three layouts over identical data, each directing the eye differently - by
 * rank, by a shared scale, or by position. The operator picks one; they are not
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
      <div className="flex shrink-0 items-center gap-4 border-b-2 border-sheet-rule bg-sheet-card px-6 py-2">
        <h2 className="text-xl font-bold tracking-tight">
          {totals.needingDecision > 0 ? "Needs a decision first" : "All on the date"}
        </h2>
        <span className="text-lg tabular-nums text-ink-3">
          {totals.needingDecision} of {totals.engagements}
          <Delta
            now={totals.needingDecision}
            before={scheduleBaseline(lastWeek, (t) => t.needingDecision)}
          />
        </span>

        {/*
          The loudest thing the readout can say, drawn as something rather
          than set at the weight of a caption.
        */}
        {totals.contradicting > 0 && (
          <span className="flex items-center gap-2 rounded bg-late-mark px-3 py-0.5 text-white">
            <b className="text-xl font-extrabold leading-none tabular-nums">
              {totals.contradicting}
            </b>
            {/*
              One line: the Wall's grid uses the whole frame, so a second line
              here comes straight off the tiles below it.
            */}
            <span className="whitespace-nowrap text-[17px] font-semibold">
              say on track, own estimate says otherwise
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
            <Key>3</Key>
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
      ) : layout === "ladder" ? (
        <Ladder
          engagements={engagements}
          currentWeek={currentWeek}
          today={today}
        />
      ) : (
        <Field
          engagements={engagements}
          currentWeek={currentWeek}
          today={today}
        />
      )}
    </div>
  );
}
