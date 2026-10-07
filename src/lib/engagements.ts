import { getWeekNumber, parseDateOnly, formatDate } from "./date-utils";
import { formatAmount, formatEmailDisplayName } from "./utils";
import { describeTargetDiff, type TargetDiffSummary } from "./schedule";
import { VELOCITY_LABELS } from "../components/indicators/metrics/velocity.constants";
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
  /** `goals_next_week` split into the individual things being promised. */
  commitments: string[];

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
  /** Calendar week the estimate falls in, on the app's own week scheme. */
  landingWeek: number | null;
  /** The stored `target_diff`, humanised: how overdue it was when filed. */
  sinceDeadline: TargetDiffSummary | null;

  ownerSaysOnTrack: boolean | null;
  delayReason: string | null;

  state: ScheduleState;
  /** The owner says the deadline will be met while the estimate lands after it. */
  contradicts: boolean;
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
 * Splits a goals field into discrete commitments.
 *
 * Owners write these as newline lists, sometimes bulleted with "-" and
 * sometimes numbered "1." - and sometimes as one sentence, which stays one
 * commitment. A lone "-" means nothing was committed.
 */
export function parseCommitments(goals: string | null | undefined): string[] {
  if (typeof goals !== "string") return [];

  return goals
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim())
    .filter((line) => line.length > 0 && line !== "-" && line !== "--");
}

/**
 * Red once the committed date has passed; amber while it is still ahead but
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
    commitments: parseCommitments(row.goals_next_week),

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
    landingWeek: estimate ? getWeekNumber(estimate) : null,
    sinceDeadline: describeTargetDiff(row.target_diff),

    ownerSaysOnTrack,
    delayReason,

    state: scheduleState(deadline, slipDays, today),
    contradicts: ownerSaysOnTrack === true && (slipDays ?? 0) > 0,
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

      // Within the slipping groups the biggest overrun leads; within the rest
      // the nearest landing does.
      if (a.state === "late" || a.state === "watch") {
        return (b.slipDays ?? 0) - (a.slipDays ?? 0);
      }
      return (a.landsInDays ?? Infinity) - (b.landsInDays ?? Infinity);
    });
}

export interface ReadoutTotals {
  engagements: number;
  needingDecision: number;
  contradicting: number;
  commitments: number;
  owners: number;
  slipDaysTotal: number;
}

export function summarise(engagements: Engagement[]): ReadoutTotals {
  return {
    engagements: engagements.length,
    needingDecision: engagements.filter(
      (e) => e.state === "late" || e.state === "watch"
    ).length,
    contradicting: engagements.filter((e) => e.contradicts).length,
    commitments: engagements.reduce((n, e) => n + e.commitments.length, 0),
    owners: new Set(engagements.map((e) => e.ownerKey)).size,
    slipDaysTotal: engagements.reduce(
      (n, e) => n + Math.max(0, e.slipDays ?? 0),
      0
    ),
  };
}

/** Engagements grouped by product owner, busiest first - used by the Plan. */
export function groupByOwner(
  engagements: Engagement[]
): { owner: string; ownerEmail: string; engagements: Engagement[]; commitments: number }[] {
  const groups = new Map<string, Engagement[]>();

  for (const engagement of engagements) {
    const existing = groups.get(engagement.ownerKey);
    if (existing) existing.push(engagement);
    else groups.set(engagement.ownerKey, [engagement]);
  }

  return [...groups.entries()]
    .map(([ownerEmail, list]) => ({
      owner: list[0].owner,
      ownerEmail,
      engagements: list,
      commitments: list.reduce((n, e) => n + e.commitments.length, 0),
    }))
    .sort((a, b) => b.engagements.length - a.engagements.length);
}

export interface Commitment {
  /** Position in the week's list, 1-based, in schedule-risk order. */
  index: number;
  text: string;
  engagement: Engagement;
}

/**
 * Every commitment the week promises, flattened in the engagements' own order
 * so the worst schedule's promises come first.
 */
export function flattenCommitments(engagements: Engagement[]): Commitment[] {
  return engagements.flatMap((engagement) =>
    engagement.commitments.map((text) => ({ index: 0, text, engagement }))
  ).map((commitment, i) => ({ ...commitment, index: i + 1 }));
}

/** The short schedule phrase used wherever an engagement is named in passing. */
export function scheduleNote(engagement: Engagement): string {
  const { state, slipDays, estimate, deadline } = engagement;

  if (state === "late" && slipDays !== null && slipDays > 0) {
    return `${slipDays} days past deadline`;
  }
  if (state === "late") return "past its deadline";
  if (state === "watch" && slipDays !== null && slipDays > 0) {
    return `estimate overruns by ${slipDays} days`;
  }
  if (estimate || deadline) return `due ${showDate(estimate ?? deadline)}`;
  return "no deadline recorded";
}

/** "Sep 30, 2026", or a dash when the column is empty. */
export function showDate(date: Date | null): string {
  return date ? formatDate(date, "dayMonthYear") : "—";
}
