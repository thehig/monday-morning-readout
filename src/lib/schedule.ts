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


