import { formatDate, parseDateOnly } from "./date-utils";
import type { TargetDiff } from "../types/supabase";

/**
 * Schedule fields were added to `po_feedback` after most rows existed, so every
 * reader here treats "missing" as the normal case and returns null rather than
 * throwing. Values also come from a jsonb column, so nothing is trusted to have
 * the declared shape.
 */

export type ScheduleDirection = "overdue" | "remaining" | "due";

export interface TargetDiffSummary {
  direction: ScheduleDirection;
  /** "Overdue by", "Time left", or "Due" - safe to use as a field label. */
  label: string;
  /** Humanised magnitude, e.g. "1 month 23 days". Empty when the diff is zero. */
  text: string;
}

const UNITS: ReadonlyArray<{ key: keyof TargetDiff; singular: string }> = [
  { key: "years", singular: "year" },
  { key: "months", singular: "month" },
  { key: "days", singular: "day" },
];

/**
 * Reads the `target_diff` column, accepting the object the database returns or
 * a JSON string, and ignoring anything else.
 */
export function parseTargetDiff(value: unknown): TargetDiff | null {
  let raw: unknown = value;

  if (typeof raw === "string") {
    try {
      raw = JSON.parse(raw);
    } catch {
      return null;
    }
  }

  if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
    return null;
  }

  const source = raw as Record<string, unknown>;
  const diff: TargetDiff = { years: 0, months: 0, days: 0 };
  let sawUnit = false;

  for (const { key } of UNITS) {
    const part = source[key];
    if (part === undefined || part === null) continue;

    const amount = Number(part);
    if (!Number.isFinite(amount)) continue;

    diff[key] = Math.trunc(amount);
    sawUnit = true;
  }

  return sawUnit ? diff : null;
}

function pluralise(amount: number, singular: string): string {
  return `${amount} ${singular}${amount === 1 ? "" : "s"}`;
}

/**
 * Turns `target_diff` into a label and a readable duration.
 *
 * The column holds the submission date minus the deadline, so a positive value
 * means the deadline has already passed and a negative value means there is
 * time left. Components are read in descending order, so a mixed-sign object
 * takes its direction from the largest unit.
 */
export function describeTargetDiff(value: unknown): TargetDiffSummary | null {
  const diff = parseTargetDiff(value);
  if (!diff) return null;

  const leading = UNITS.map(({ key }) => diff[key]).find((part) => part !== 0);

  if (leading === undefined) {
    return { direction: "due", label: "Due", text: "today" };
  }

  const direction: ScheduleDirection = leading > 0 ? "overdue" : "remaining";
  const text = UNITS.map(({ key, singular }) => {
    const amount = Math.abs(diff[key]);
    return amount === 0 ? null : pluralise(amount, singular);
  })
    .filter(Boolean)
    .join(" ");

  return {
    direction,
    label: direction === "overdue" ? "Overdue by" : "Time left",
    text,
  };
}

/** Formats a `yyyy-MM-dd` column for display, e.g. "Sep 30, 2026". */
export function formatScheduleDate(value: unknown): string | null {
  const date = parseDateOnly(value);
  return date ? formatDate(date, "dayMonthYear") : null;
}

/**
 * `project_on_track` is self-reported and may contradict the dates, so it is
 * rendered as its own statement rather than derived from `target_diff`.
 */
export function describeOnTrack(value: unknown): string | null {
  if (typeof value !== "boolean") return null;
  return value
    ? "Project is on track to meet the deadline"
    : "Project is not on track to meet the deadline";
}

export interface ScheduleSummary {
  deadline: string | null;
  estimatedCompletion: string | null;
  diff: TargetDiffSummary | null;
  onTrack: boolean | null;
  onTrackText: string | null;
  delayReason: string | null;
  /** False when the row predates these columns, so the UI can skip the section. */
  hasAny: boolean;
}

export interface ScheduleFields {
  target_date?: string | null;
  estimated_completion_date?: string | null;
  target_diff?: unknown;
  project_on_track?: boolean | null;
  delay_reason?: string | null;
}

/** Single entry point for the UI: everything already safe to render. */
export function getScheduleSummary(feedback: ScheduleFields): ScheduleSummary {
  const deadline = formatScheduleDate(feedback?.target_date);
  const estimatedCompletion = formatScheduleDate(
    feedback?.estimated_completion_date
  );
  const diff = describeTargetDiff(feedback?.target_diff);
  const onTrack =
    typeof feedback?.project_on_track === "boolean"
      ? feedback.project_on_track
      : null;
  const delayReason =
    typeof feedback?.delay_reason === "string" && feedback.delay_reason.trim()
      ? feedback.delay_reason.trim()
      : null;

  return {
    deadline,
    estimatedCompletion,
    diff,
    onTrack,
    onTrackText: describeOnTrack(feedback?.project_on_track),
    delayReason,
    hasAny: Boolean(
      deadline || estimatedCompletion || diff || onTrack !== null || delayReason
    ),
  };
}
