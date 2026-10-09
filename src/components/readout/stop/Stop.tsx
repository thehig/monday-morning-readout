import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import type { Engagement } from "../../../lib/engagements";
import { showDate } from "../../../lib/engagements";
import { buildStatement } from "../../../lib/statement";
import { buildTimeline } from "../../../lib/timeline";
import { formatDateTime } from "../../../lib/date-utils";
import type { StepPosition } from "../../../lib/stepping";
import { Meter, ProgressBar, VelocityBadge, VelocityDot } from "../primitives";
import { FooterActions, Key } from "../chrome";
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

/** A labelled figure in the header, e.g. "Progress / 75%". */
function HeaderMetric({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[17px] text-ink-3">{label}</span>
      <span className="flex items-center gap-2.5 text-[19px]">{children}</span>
    </div>
  );
}

/** One of the facts under the statement. */
function Fact({
  label,
  children,
  first,
}: {
  label: string;
  children: React.ReactNode;
  first?: boolean;
}) {
  return (
    <div
      className={`flex min-w-0 flex-col gap-0.5 lg:pr-7 ${
        first ? "" : "lg:border-l lg:border-sheet-rule lg:pl-7"
      }`}
    >
      <span title={label} className="truncate text-[17px] text-ink-3">
        {label}
      </span>
      {/* Inline rather than flex, so a narrow column cuts it with an ellipsis. */}
      <span className="truncate text-xl font-bold tabular-nums">
        {children}
      </span>
    </div>
  );
}

/** The heading over a block of what the owner wrote. */
function Heading({ title, sub }: { title: string; sub: string }) {
  return (
    <h3 className="flex flex-col text-xl font-bold leading-[26px] text-ink-2">
      {title}
      <span className="text-[17px] font-normal leading-[22px] text-ink-3">{sub}</span>
    </h3>
  );
}

/** What the owner wrote, or a plain line saying they wrote nothing. */
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
    <section className="flex flex-col gap-3">
      <Heading title={heading} sub={sub} />
      {text ? (
        <p className="whitespace-pre-line text-[21px] leading-[31px]">{text}</p>
      ) : flag ? (
        <p className="flex items-start gap-2.5 rounded-xl bg-late-tint px-3.5 py-3 text-[19px] font-semibold leading-[27px] text-late-ink">
          <ExclamationTriangleIcon className="mt-1 h-5 w-5 shrink-0 stroke-2" aria-hidden="true" />
          {flag}
        </p>
      ) : (
        <p className="text-[19px] text-ink-3">Nothing recorded for this week.</p>
      )}
    </section>
  );
}

const CARD =
  "rounded-card border border-navy/[0.06] bg-sheet-card shadow-card";

/**
 * The Stop: one engagement, full screen, while someone talks about it.
 *
 * Opens with a generated statement of where the engagement stands against its
 * agreed deadline, so the room reads the conclusion before the detail. Every
 * one of the table's columns appears somewhere on this screen.
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
  // walk the Wall's own order: the ones behind schedule first, then the rest.
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
  const { overdueDays, slipDays, ownerSaysOnTrack, sinceDeadline } = engagement;

  return (
    <div className="flex flex-1 flex-col gap-4 px-4 py-5 sm:px-6">
      <section className={`shrink-0 px-5 pb-[26px] pt-6 sm:px-8 ${CARD}`}>
        {/*
          The metrics move under the name when both will not fit on one line,
          and the name and its details are cut rather than wrapped - in full on
          hover - so the header never grows a ragged second line.
        */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
          <div className="flex min-w-[min(100%,360px)] flex-1 flex-col gap-0.5">
            <h2
              title={engagement.customer}
              className="truncate text-[34px] font-[750] leading-[44px] tracking-[-0.025em] sm:text-[44px] sm:leading-[52px]"
            >
              {engagement.customer}
            </h2>
            <p className="flex min-w-0 gap-[18px] whitespace-nowrap text-[19px] text-ink-3">
              <span title={engagement.owner} className="shrink-0 font-semibold text-ink-2">
                {engagement.owner}
              </span>
              <span title={engagement.ownerEmail} className="truncate">
                {engagement.ownerEmail}
              </span>
              <span
                title={`filed ${formatDateTime(engagement.filedAt, "short")}`}
                className="truncate"
              >
                filed {formatDateTime(engagement.filedAt, "short")}
              </span>
            </p>
          </div>

          <div className="ml-auto flex flex-wrap gap-x-10 gap-y-3">
            <HeaderMetric label="Progress">
              <ProgressBar value={engagement.progress} width="w-40" />
            </HeaderMetric>
            <HeaderMetric label="Team">
              <Meter value={engagement.teamHappiness} />
            </HeaderMetric>
            <HeaderMetric label="Customer">
              <Meter value={engagement.customerHappiness} />
            </HeaderMetric>
            <HeaderMetric label="Velocity next week">
              <VelocityBadge velocity={engagement.velocity} />
            </HeaderMetric>
          </div>
        </div>

        <div className="mb-5 mt-[22px] h-px bg-[#ECEEF2]" />

        {/*
          The calendar sits beside the statement where there is room for both,
          sharing the width below 2xl, and under it below xl.
        */}
        <div className="grid grid-cols-1 items-start gap-8 xl:grid-cols-2 xl:gap-14 2xl:grid-cols-[minmax(0,1fr)_720px]">
          <div className="flex min-w-0 flex-col">
            <h3
              title={statement.headline}
              className={`truncate text-[30px] font-[750] leading-[40px] tracking-[-0.02em] sm:text-[38px] sm:leading-[46px] ${
                STATE_TEXT[engagement.state]
              }`}
            >
              {statement.headline}
            </h3>
            <p className="mt-2 flex items-start gap-3 text-xl font-medium leading-7 text-ink-2">
              <span className="mt-[7px] flex">
                <VelocityDot velocity={engagement.velocity} />
              </span>
              {statement.detail}
            </p>

            {/* Two by two until all four fit on one line with rules between them. */}
            <div className="mt-[18px] grid grid-cols-2 gap-x-4 gap-y-3 lg:flex lg:gap-x-0">
              <Fact label="Agreed deadline" first>
                <span className={overdueDays !== null ? "text-late-ink" : ""}>
                  {showDate(engagement.deadline)}
                </span>
              </Fact>
              <Fact label="Estimated completion">
                {showDate(engagement.estimate)}
                {slipDays !== null && slipDays > 0 && (
                  <span className={`ml-2 text-[17px] ${STATE_TEXT[engagement.state]}`}>
                    +{slipDays} days
                  </span>
                )}
              </Fact>
              <Fact label="On track for the estimate">
                <span
                  className={
                    ownerSaysOnTrack === null
                      ? "text-ink-3"
                      : ownerSaysOnTrack
                      ? "text-fine-ink"
                      : "text-late-ink"
                  }
                >
                  {ownerSaysOnTrack === null ? "Not reported" : ownerSaysOnTrack ? "Yes" : "No"}
                </span>
              </Fact>
              <Fact label="Invoiced this week">{engagement.amountCharged}</Fact>
            </div>
          </div>

          {timeline ? (
            <MiniCalendar
              timeline={timeline}
              deadline={engagement.deadline}
              estimate={engagement.estimate}
              overdueDays={overdueDays}
              tone={engagement.state === "late" ? "late" : "watch"}
            />
          ) : (
            <p className="pt-8 text-[19px] text-ink-3">
              No deadline or estimate was recorded for this engagement.
            </p>
          )}
        </div>
      </section>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-3">
        <div className={`overflow-y-auto px-7 py-6 ${CARD}`}>
          <Wrote
            heading="Completed milestones"
            sub="what got done this week"
            text={engagement.milestones}
          />
        </div>

        <div className={`flex flex-col gap-[18px] overflow-y-auto px-7 py-6 ${CARD}`}>
          <Wrote
            heading="Identified risks"
            sub="what is in the way"
            text={engagement.risks}
            flag={
              engagement.state === "late"
                ? "Nothing recorded. On an engagement past its deadline, worth asking about."
                : undefined
            }
          />
          <div className="h-px shrink-0 bg-[#ECEEF2]" />
          <Wrote
            heading="Reason for the delay"
            sub="recorded by the owner"
            text={engagement.delayReason}
          />
          <div className="h-px shrink-0 bg-[#ECEEF2]" />
          <section className="flex flex-col gap-3">
            <Heading title="Problem-solving call" sub="requested by the owner" />
            <p className="text-[21px]">{engagement.psCallAnswer}</p>
            {engagement.psCallContext && (
              <p className="whitespace-pre-line text-[21px] leading-[31px]">
                {engagement.psCallContext}
              </p>
            )}
          </section>
        </div>

        <div className={`overflow-y-auto px-7 py-6 ${CARD}`}>
          <Wrote
            heading={`Goals for week ${currentWeek + 1}`}
            sub="what happens next week"
            text={engagement.goals}
          />
        </div>
      </div>

      <FooterActions>
        <span className="flex items-center gap-[30px]">
          {step?.previousId !== null && step !== null && (
            <span>
              <Key>&larr;</Key>previous
            </span>
          )}
          {step?.nextId != null && (
            <span>
              <Key>&rarr;</Key>
              next
            </span>
          )}
        </span>

        <span className="ml-auto flex gap-[18px] truncate text-[17px]">
          <span>Feedback {engagement.id}</span>
          {sinceDeadline && (
            <span>
              {sinceDeadline.direction === "overdue"
                ? `overdue ${sinceDeadline.text} when filed`
                : sinceDeadline.direction === "remaining"
                ? `${sinceDeadline.text} left when filed`
                : "due on the day it was filed"}
            </span>
          )}
        </span>
      </FooterActions>
    </div>
  );
}
