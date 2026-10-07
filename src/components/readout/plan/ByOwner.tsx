import { Link } from "react-router-dom";
import { groupByOwner, scheduleNote } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { STATE_EDGE, STATE_TEXT } from "../state-styles";

interface ByOwnerProps {
  engagements: Engagement[];
  currentWeek: number;
}

function Card({
  engagement,
  currentWeek,
}: {
  engagement: Engagement;
  currentWeek: number;
}) {
  const count = engagement.commitments.length;

  return (
    <Link
      to={`/feedback/${engagement.id}?week=${currentWeek}`}
      className={`grid gap-1.5 rounded border-2 border-l-8 border-sheet-rule bg-sheet-card px-3.5 py-3 transition-shadow hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand ${
        STATE_EDGE[engagement.state]
      }`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <b className="text-[19px] font-bold leading-tight">
          {engagement.customer}
        </b>
        <span className="shrink-0 text-[17px] font-medium text-ink-3">
          {count === 1 ? "1 item" : `${count} items`}
        </span>
      </div>

      <span className={`text-[17px] font-semibold ${STATE_TEXT[engagement.state]}`}>
        {scheduleNote(engagement)}
      </span>

      {count > 0 ? (
        <ul className="ml-4 list-disc font-serif text-[17px] leading-snug">
          {engagement.commitments.map((text) => (
            <li key={text} className="mb-0.5">
              {text}
            </li>
          ))}
        </ul>
      ) : (
        <span className="text-[17px] font-semibold text-late-ink">
          Nothing committed for next week
        </span>
      )}
    </Link>
  );
}

/**
 * The Plan grouped by product owner.
 *
 * Answers the capacity question the call actually asks: who is carrying what,
 * and whose column is entirely red.
 */
export function ByOwner({ engagements, currentWeek }: ByOwnerProps) {
  const groups = groupByOwner(engagements);

  return (
    <div
      className="grid min-h-0 flex-1 gap-3.5 px-6 pb-4 pt-3"
      style={{
        gridTemplateColumns: `repeat(${Math.max(1, groups.length)}, minmax(0, 1fr))`,
      }}
    >
      {groups.map((group) => (
        <div key={group.ownerEmail} className="flex min-h-0 flex-col gap-2.5">
          <div className="flex items-baseline gap-2 border-b-[3px] border-navy pb-2">
            <b className="text-[21px] font-bold leading-tight tracking-tight">
              {group.owner}
            </b>
            <span className="ml-auto shrink-0 whitespace-nowrap text-[17px] tabular-nums text-ink-3">
              {group.engagements.length} &middot; {group.commitments} items
            </span>
          </div>

          {group.engagements.map((engagement) => (
            <Card
              key={engagement.id}
              engagement={engagement}
              currentWeek={currentWeek}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
