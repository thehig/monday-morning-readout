import { Link } from "react-router-dom";
import { flattenCommitments, scheduleNote } from "../../../lib/engagements";
import type { Engagement } from "../../../lib/engagements";
import { STATE_TEXT } from "../state-styles";

interface CommitmentListProps {
  engagements: Engagement[];
  currentWeek: number;
}

/**
 * The Plan as a flat numbered list, worst schedule first.
 *
 * This is the view that reads back as minutes: what did we just agree to, in
 * the order it matters.
 */
export function CommitmentList({
  engagements,
  currentWeek,
}: CommitmentListProps) {
  const commitments = flattenCommitments(engagements);
  const silent = engagements.filter((e) => e.commitments.length === 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-4 pt-3">
      <ol className="grid min-h-0 flex-1 grid-cols-3 content-start gap-x-7">
        {commitments.map(({ index, text, engagement }) => (
          <li
            key={`${engagement.id}-${index}`}
            className="grid grid-cols-[38px_1fr] items-start gap-x-3 border-b-2 border-sheet-rule py-2"
          >
            <span
              className={`text-right text-[19px] font-extrabold tabular-nums ${
                engagement.state === "late" ? "text-late-mark" : "text-ink-3"
              }`}
            >
              {index}
            </span>
            <div>
              <p className="font-serif text-[19px] leading-snug">{text}</p>
              <p className="mt-0.5 text-[17px] text-ink-3">
                <Link
                  to={`/feedback/${engagement.id}?week=${currentWeek}`}
                  className="font-semibold text-ink-2 underline-offset-2 hover:underline"
                >
                  {engagement.customer}
                </Link>{" "}
                &middot; {engagement.owner} &middot;{" "}
                <span className={`font-semibold ${STATE_TEXT[engagement.state]}`}>
                  {scheduleNote(engagement)}
                </span>
              </p>
            </div>
          </li>
        ))}
      </ol>

      {silent.length > 0 && (
        <p className="shrink-0 border-t-2 border-sheet-rule pt-2.5 text-[17px] text-ink-3">
          <span className="font-semibold text-late-ink">
            {silent.length === 1
              ? "1 engagement committed nothing"
              : `${silent.length} engagements committed nothing`}
            :
          </span>{" "}
          {silent
            .map((e) => `${e.customer} (${scheduleNote(e)})`)
            .join(", ")}
        </p>
      )}
    </div>
  );
}
