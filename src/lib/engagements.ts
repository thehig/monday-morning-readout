import { getWeekNumber, parseDateOnly, formatDate } from "./date-utils";
import { formatAmount, formatEmailDisplayName } from "./utils";
import { describeTargetDiff, type TargetDiffSummary } from "./schedule";
import { VELOCITY_LABELS } from "./velocity";
import type { POFeedback } from "../types/feedback";
import type { VelocityType } from "../types/indicators";

/**
 * The readout's view model.
 *
 * Every screen reads engagements rather than raw rows, so the derived values
 * that drive sort order - above all `slipDays` - are computed in exactly one
 * place. Nothing here is stored in the database.
 */

/** Rows the product owners file to exercise the submission form. */
const TEST_CUSTOMER = /^\s*(test\b.*ignore|sb test|test,?\s*please ignore)/i;

export type ScheduleState = "late" | "watch" | "fine" | "unknown";

export interface Engagement {
  id: number;
  customer: string;
  owner: string;
  ownerEmail: string;
  /** The submitter with plus-addressing removed, so one person groups as one. */
  ownerKey: string;
  filedAt: Date;

  progress: number;
  teamHappiness: number;
  customerHappiness: number;

  velocity: VelocityType | null;
  /** English, from VELOCITY_LABELS. The stored German value is never changed. */
  velocityLabel: string | null;

  milestones: string | null;
  risks: string | null;
  goals: string | null;

  psCallRequested: boolean | null;
  psCallAnswer: string;
  psCallContext: string | null;

  amountCharged: string;

  deadline: Date | null;
  estimate: Date | null;
  /**
   * Estimated completion minus the committed deadline, in whole days. Positive
   * means it will land after the date it committed to.
   *
   * Not to be confused with the stored `target_diff`, which is the submission
   * date minus the deadline - see `sinceDeadline`.
   */
  slipDays: number | null;
  /** Estimated completion minus today, in whole days. */
  landsInDays: number | null;
  /**
   * Calendar week the estimate falls in, counted from the readout year's first
   * Monday. Runs past 52 for dates in the following year, so it stays ordered.
   */
  landingWeek: number | null;
  /** The stored `target_diff`, humanised: how overdue it was when filed. */
  sinceDeadline: TargetDiffSummary | null;

  /**
   * The agreed deadline minus today, in whole days: negative once it has
   * passed. This is the hard fact - the deadline was agreed with the customer
   * and does not move - where `slipDays` is only the owner's forecast.
   */
  daysToDeadline: number | null;
  /** Days since the deadline passed, or null while it is still ahead. */
  overdueDays: number | null;

  /**
   * The owner's answer to "is the project on track?" - on track to meet their
   * own estimated completion date, not the deadline. An estimate past the
   * deadline flagged on track is therefore consistent, not a contradiction.
   */
  ownerSaysOnTrack: boolean | null;
  delayReason: string | null;

  state: ScheduleState;
}

const DAY = 24 * 60 * 60 * 1000;

/** Whole days between two calendar dates, ignoring any time component. */
function daysBetween(from: Date, to: Date): number {
  const a = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const b = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  return Math.round((b.getTime() - a.getTime()) / DAY);
}

/**
 * Free-text fields as the owners actually fill them.
 *
 * A lone dash is how they write "nothing this week", so it is emptiness rather
 * than content - rendering it leaves a bare "-" sitting under a heading.
 */
export function cleanText(value: string | null | undefined): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed && !/^[-–—]{1,3}$/.test(trimmed) ? trimmed : null;
}

/**
 * One person, however they addressed the submission.
 *
 * Owners use plus-addressing as a per-engagement tag - david.siegel+vbk,
 * david.siegel+pa, david.siegel+redesign are all David. Unlike the customer
 * names, this is a deterministic email convention rather than free text, so
 * collapsing it is safe. It identifies the person, not the engagement.
 */
export function personKey(email: string): string {
  const [local, domain = ""] = email.trim().toLowerCase().split("@");
  return `${local.split("+")[0]}@${domain}`;
}

export function isTestRow(customer: string | null | undefined): boolean {
  return !customer || TEST_CUSTOMER.test(customer);
}

/**
 * How badly, not just whether.
 *
 * Two late engagements drew the same colour, leaving the room to compare two
 * numbers to find the worse one. The thresholds are calendar meaning rather
 * than a split of this week's figures: inside a fortnight is a slip, up to two
 * months is a problem, past two months is a different kind of conversation.
 */
export type SlipSeverity = 1 | 2 | 3;

const SEVERE_DAYS = 60;
const MODERATE_DAYS = 14;

export function slipSeverity(days: number | null): SlipSeverity {
  if (days === null || days < MODERATE_DAYS) return 1;
  return days >= SEVERE_DAYS ? 3 : 2;
}

/**
 * The tier an engagement is drawn at. A late one is measured by how long its
 * deadline has been gone - the hard fact; one still ahead of its deadline can
 * only be measured by how far its estimate overruns.
 */
export function severity(engagement: Engagement): SlipSeverity {
  return slipSeverity(
    engagement.state === "late" ? engagement.overdueDays : engagement.slipDays
  );
}

/**
 * Red once the agreed deadline has passed; amber while it is still ahead but
 * the estimate already overruns it.
 */
export function scheduleState(
  deadline: Date | null,
  slipDays: number | null,
  today: Date
): ScheduleState {
  if (!deadline || slipDays === null) return "unknown";
  if (daysBetween(today, deadline) < 0) return "late";
  return slipDays > 0 ? "watch" : "fine";
}

const STATE_ORDER: Record<ScheduleState, number> = {
  late: 0,
  watch: 1,
  fine: 2,
  unknown: 3,
};

export function toEngagement(row: POFeedback, today = new Date()): Engagement {
  const deadline = parseDateOnly(row.target_date);
  const estimate = parseDateOnly(row.estimated_completion_date);
  const slipDays = deadline && estimate ? daysBetween(deadline, estimate) : null;
  const daysToDeadline = deadline ? daysBetween(today, deadline) : null;
  const velocity = (row.velocity_next_week as VelocityType) ?? null;
  const ownerSaysOnTrack =
    typeof row.project_on_track === "boolean" ? row.project_on_track : null;

  const psCallRequested =
    typeof row.ps_call_needed === "string"
      ? /^(ja|yes|y)$/i.test(row.ps_call_needed.trim())
      : null;

  const delayReason = cleanText(row.delay_reason);

  return {
    id: row.id,
    customer: row.customer?.trim() || "Unknown customer",
    owner: formatEmailDisplayName(row.submitted_by),
    ownerEmail: row.submitted_by,
    ownerKey: personKey(row.submitted_by),
    filedAt: new Date(row.created_at),

    progress: row.progress_percent ?? 0,
    teamHappiness: row.team_happiness ?? 0,
    customerHappiness: row.customer_happiness ?? 0,

    velocity,
    velocityLabel: velocity ? VELOCITY_LABELS[velocity] ?? null : null,

    milestones: cleanText(row.milestones_done),
    risks: cleanText(row.risks),
    goals: cleanText(row.goals_next_week),

    psCallRequested,
    psCallAnswer:
      psCallRequested === null
        ? "Not reported"
        : psCallRequested
        ? "Requested"
        : "Not requested",
    psCallContext: cleanText(row.ps_call_context),

    amountCharged: formatAmount(row.amount_charged ?? undefined),

    deadline,
    estimate,
    slipDays,
    landsInDays: estimate ? daysBetween(today, estimate) : null,
    landingWeek: estimate ? getWeekNumber(estimate, today.getFullYear()) : null,
    sinceDeadline: describeTargetDiff(row.target_diff),
    daysToDeadline,
    overdueDays:
      daysToDeadline !== null && daysToDeadline < 0 ? -daysToDeadline : null,

    ownerSaysOnTrack,
    delayReason,

    state: scheduleState(deadline, slipDays, today),
  };
}

/**
 * Turns a week's rows into the readout's engagements: test submissions
 * dropped, worst schedule first.
 */
export function toEngagements(
  rows: POFeedback[] | undefined,
  today = new Date()
): Engagement[] {
  if (!rows?.length) return [];

  return rows
    .filter((row) => !isTestRow(row.customer))
    .map((row) => toEngagement(row, today))
    .sort((a, b) => {
      const byState = STATE_ORDER[a.state] - STATE_ORDER[b.state];
      if (byState !== 0) return byState;

      // Late engagements lead by how long their deadline has been gone - the
      // hard fact - and overruns still ahead of their deadline by how far the
      // estimate passes it. The rest follow in order of their deadline.
      if (a.state === "late") return (b.overdueDays ?? 0) - (a.overdueDays ?? 0);
      if (a.state === "watch") return (b.slipDays ?? 0) - (a.slipDays ?? 0);
      return (a.daysToDeadline ?? Infinity) - (b.daysToDeadline ?? Infinity);
    });
}

export interface ReadoutTotals {
  engagements: number;
  /**
   * How many have a schedule at all.
   *
   * The schedule columns were added to `po_feedback` long after most rows
   * existed, so a week before they were filled in reports nothing late - not
   * because nothing was late, but because nothing was recorded. Any count
   * derived from the schedule is only comparable against a week where this is
   * above zero.
   */
  scheduled: number;
  needingDecision: number;
  /**
   * Owners who say they are not on track for their own estimated completion
   * date - the owner doubting even the date they set, which is the warning.
   */
  offTrack: number;
}

export function summarise(engagements: Engagement[]): ReadoutTotals {
  return {
    engagements: engagements.length,
    scheduled: engagements.filter((e) => e.state !== "unknown").length,
    needingDecision: engagements.filter(
      (e) => e.state === "late" || e.state === "watch"
    ).length,
    offTrack: engagements.filter((e) => e.ownerSaysOnTrack === false).length,
  };
}

/** "Sep 30, 2026", or a dash when the column is empty. */
export function showDate(date: Date | null): string {
  return date ? formatDate(date, "dayMonthYear") : "—";
}
