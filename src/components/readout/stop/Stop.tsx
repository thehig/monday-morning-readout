import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeftIcon } from "@heroicons/react/24/outline";
import type { Engagement } from "../../../lib/engagements";
import { buildStatement } from "../../../lib/statement";
import { buildTimeline } from "../../../lib/timeline";
import { formatDateTime } from "../../../lib/date-utils";
import { describeStep, type StepPosition } from "../../../lib/stepping";
import { Meter, ProgressBar, VelocityDot } from "../primitives";
import { STATE_TEXT } from "../state-styles";
import { isTypingTarget } from "../useReadoutKeys";
import { MiniCalendar } from "./MiniCalendar";

interface StopProps {
  engagement: Engagement;
  currentWeek: number;
  /** Where this sits in the week's running order; null when linked in alone. */
  step?: StepPosition | null;
  today?: Date;
}

/** A keycap in the footer hints. */
function Key({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="mr-1.5 rounded border-2 border-sheet-rule bg-sheet px-2 font-bold text-ink-2">
      {children}
    </kbd>
  );
}

/** A labelled figure in the header, e.g. "Progress / 75%". */
function HeaderMetric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid justify-items-end gap-0.5">
      <span className="text-[17px] text-ink-3">{label}</span>
      <span className="flex items-center gap-2 text-[19px]">{children}</span>
    </div>
  );
}

/** One of the three facts under the statement. */
function Chip({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: string;
}) {
  return (
    <div className="grid gap-0.5 border-r-2 border-sheet-rule pr-7 last:border-r-0 last:pr-0">
      <span className="whitespace-nowrap text-[17px] text-ink-3">{label}</span>
      <span
        className={`whitespace-nowrap text-xl font-bold tabular-nums ${tone ?? ""}`}
      >
        {value}
      </span>
    </div>
  );
}

/** A block of what the owner wrote, or a plain line saying they wrote nothing. */
function Wrote({
  heading,
  sub,
  text,
  flag,
}: {
  heading: string;
  sub: string;
  text: string | null;
  /** Worth remarking on that this is empty. */
  flag?: string;
}) {
  return (
    <section className="grid gap-2">
      <h3 className="text-xl font-bold leading-tight text-ink-2">
        {heading}
        <span className="block text-[17px] font-normal text-ink-3">{sub}</span>
      </h3>
      {text ? (
        <p className="whitespace-pre-line font-serif text-[22px] leading-snug">
          {text}
        </p>
      ) : (
        <p className={`text-[19px] ${flag ? "font-semibold text-late-ink" : "text-ink-3"}`}>
          {flag ?? "Nothing recorded for this week."}
        </p>
      )}
    </section>
  );
}

/**
 * The Stop: one engagement, full screen, while someone talks about it.
 *
 * Opens with a generated statement of where the engagement stands, so the room
 * reads the conclusion before the detail. Every one of the table's columns
 * appears somewhere on this screen.
 */
export function Stop({
  engagement,
  currentWeek,
  step = null,
  today = new Date(),
}: StopProps) {
  const navigate = useNavigate();
  const statement = buildStatement(engagement);

  // The operator steps through the week one-handed while talking, so the arrows
  // walk the Wall's own order: the exceptions first, then a pass of the rest.
  useEffect(() => {
    if (!step) return;

    const onKey = (event: KeyboardEvent) => {
      if (isTypingTarget(event)) return;

      const target =
        event.key === "ArrowRight"
          ? step.nextId
          : event.key === "ArrowLeft"
          ? step.previousId
          : null;

      if (target !== null) {
        event.preventDefault();
        navigate(`/feedback/${target}?week=${currentWeek}`);
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navigate, currentWeek, step]);

  const timeline = buildTimeline(engagement.deadline, engagement.estimate, today);

  const sinceDeadline = engagement.sinceDeadline;

  return (
    <div className="flex h-full flex-col bg-sheet">
      <header className="flex shrink-0 items-start gap-7 border-b-2 border-sheet-rule bg-sheet-card px-8 py-4">
        <button
          type="button"
          onClick={() => navigate(`/?week=${currentWeek}`)}
          aria-label="Back to the wall"
          className="mt-1 rounded border-2 border-sheet-rule p-1.5 text-ink-2 transition-colors hover:bg-sheet"
        >
          <ChevronLeftIcon className="h-6 w-6" aria-hidden="true" />
        </button>

        <div className="min-w-0">
          <h2 className="text-[42px] font-extrabold leading-tight tracking-tighter">
            {engagement.customer}
          </h2>
          <p className="text-[19px] text-ink-2">
            {engagement.owner} &middot;{" "}
            <span className="text-ink-3">{engagement.ownerEmail}</span> &middot;
            filed {formatDateTime(engagement.filedAt, "short")}
          </p>
        </div>

        <div className="ml-auto flex shrink-0 gap-7">
          <HeaderMetric label="Progress">
            <ProgressBar value={engagement.progress} />
          </HeaderMetric>
          <HeaderMetric label="Team">
            <Meter value={engagement.teamHappiness} />
          </HeaderMetric>
          <HeaderMetric label="Customer">
            <Meter value={engagement.customerHappiness} />
          </HeaderMetric>
        </div>
      </header>

      <section className="grid shrink-0 grid-cols-[1fr_720px] items-start gap-10 border-b-2 border-sheet-rule bg-sheet-card px-8 py-4">
        <div>
          <h3
            className={`max-w-[21ch] text-[37px] font-extrabold leading-tight tracking-tight ${
              STATE_TEXT[engagement.state]
            }`}
          >
            {statement.headline}
          </h3>
          <p className="mt-1.5 flex items-center gap-2 text-xl font-medium text-ink-2">
            <VelocityDot velocity={engagement.velocity} />
            {statement.detail}
          </p>

          <div className="mt-3 flex border-t-2 border-sheet-rule pt-2.5 [&>*]:mr-7">
            <Chip
              label={sinceDeadline ? sinceDeadline.label : "Against the deadline"}
              value={sinceDeadline ? sinceDeadline.text : "Not recorded"}
              tone={
                sinceDeadline?.direction === "overdue" ? "text-late-ink" : undefined
              }
            />
            <Chip label="Invoiced this week" value={engagement.amountCharged} />
            <Chip
              label="Owner&rsquo;s own call"
              value={
                engagement.ownerSaysOnTrack === null
                  ? "Not reported"
                  : engagement.ownerSaysOnTrack
                  ? "Deadline will be met"
                  : "Deadline will be missed"
              }
              tone={
                engagement.contradicts || engagement.ownerSaysOnTrack === false
                  ? "text-late-ink"
                  : engagement.ownerSaysOnTrack
                  ? "text-fine-ink"
                  : undefined
              }
            />
          </div>
        </div>

        {timeline ? (
          <MiniCalendar
            timeline={timeline}
            deadline={engagement.deadline}
            estimate={engagement.estimate}
          />
        ) : (
          <p className="pt-8 text-[19px] text-ink-3">
            No deadline or estimate was recorded for this engagement.
          </p>
        )}
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-3">
        <div className="overflow-y-auto border-r-2 border-sheet-rule px-7 py-4">
          <Wrote
            heading="Completed milestones"
            sub="what got done this week"
            text={engagement.milestones}
          />
        </div>

        <div className="grid content-start gap-4 overflow-y-auto border-r-2 border-sheet-rule bg-sheet-card px-7 py-4">
          <Wrote
            heading="Identified risks"
            sub="what is in the way"
            text={engagement.risks}
            flag={
              engagement.state === "late"
                ? "Nothing recorded — on an engagement past its deadline, worth asking about."
                : undefined
            }
          />
          <div className="border-t-2 border-sheet-rule pt-3">
            <Wrote
              heading="Reason for the delay"
              sub="recorded by the owner"
              text={engagement.delayReason}
            />
          </div>
          <div className="border-t-2 border-sheet-rule pt-3">
            <section className="grid gap-2">
              <h3 className="text-xl font-bold leading-tight text-ink-2">
                Problem-solving call
                <span className="block text-[17px] font-normal text-ink-3">
                  requested by the owner
                </span>
              </h3>
              <p className="text-[19px]">{engagement.psCallAnswer}</p>
              {engagement.psCallContext && (
                <p className="whitespace-pre-line font-serif text-[22px] leading-snug">
                  {engagement.psCallContext}
                </p>
              )}
            </section>
          </div>
        </div>

        <div className="overflow-y-auto px-7 py-4">
          <Wrote
            heading={`Goals for week ${currentWeek + 1}`}
            sub="what happens next week"
            text={engagement.goals}
          />
        </div>
      </div>

      {/*
        Pinned like the banner: the step counter and the keys that move between
        engagements are what the operator is working from, so they stay on
        screen in a window too short to show the whole frame.
      */}
      <footer className="sticky bottom-0 z-20 flex h-[56px] shrink-0 items-center gap-7 border-t-2 border-sheet-rule bg-sheet-card px-8 text-[18px] text-ink-3">
        <span className="flex items-center gap-5">
          {step?.previousId !== null && step !== null && (
            <span>
              <Key>&larr;</Key>previous
            </span>
          )}
          {step?.nextId != null && (
            <span>
              <Key>&rarr;</Key>
              {step.nextStartsFastPass ? "start the fast pass" : "next"}
            </span>
          )}
          <span>
            <Key>Esc</Key>back to the wall
          </span>
        </span>

        {step && (
          <span className="font-semibold text-ink-2">
            {step.position} of {step.total}
            <span className="ml-2 font-normal text-ink-3">
              &middot; {describeStep(step)}
            </span>
          </span>
        )}

        <span className="ml-auto">
          Feedback {engagement.id} &middot; filed{" "}
          {formatDateTime(engagement.filedAt, "long")} &middot; stored velocity{" "}
          {engagement.velocity ?? "none"}
        </span>
      </footer>
    </div>
  );
}

