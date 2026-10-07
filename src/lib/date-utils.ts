export function getWeekDates(
  week: number,
  year: number
): { start: Date; end: Date } {
  // Start from January 1st
  const yearStart = new Date(year, 0, 1);
  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = yearStart.getDay();
  // Calculate offset to first Monday
  const daysToFirstMonday =
    startDayOfWeek <= 1 ? 1 - startDayOfWeek : 8 - startDayOfWeek;

  // Start date calculation (Monday)
  const start = new Date(yearStart);
  start.setDate(yearStart.getDate() + daysToFirstMonday + (week - 1) * 7);

  // End date is Sunday (6 days after Monday)
  const end = new Date(start);
  end.setDate(end.getDate() + 6);

  return { start, end };
}

export function getCurrentWeek(year: number): number {
  const now = new Date();
  const yearStart = new Date(year, 0, 1);
  const startDayOfWeek = yearStart.getDay();
  const daysToFirstMonday =
    startDayOfWeek <= 1 ? 1 - startDayOfWeek : 8 - startDayOfWeek;
  const firstMonday = new Date(yearStart);
  firstMonday.setDate(yearStart.getDate() + daysToFirstMonday);

  const diff = now.getTime() - firstMonday.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

export function getPreviousWeek(year: number): number {
  const currentWeek = getCurrentWeek(year);
  return Math.max(1, currentWeek - 1);
}

export const DATE_FORMAT_OPTIONS = {
  short: {
    month: "short",
    day: "numeric",
  } as const,
  long: {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  } as const,
  time: {
    hour: "2-digit",
    minute: "2-digit",
  } as const,
  timeWithSeconds: {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  } as const,
  isoDate: {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  } as const,
  dayMonthYear: {
    year: "numeric",
    month: "short",
    day: "numeric",
  } as const,
} as const;

/**
 * Parses a plain `yyyy-MM-dd` date into a local Date.
 *
 * `new Date("2026-10-06")` is parsed as UTC midnight, which renders as the
 * previous day west of Greenwich. These columns carry a calendar date with no
 * time, so build it in local time instead. Returns null for anything that is
 * not a real date.
 */
export function parseDateOnly(value: unknown): Date | null {
  if (typeof value !== "string") return null;

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;

  const [, year, month, day] = match.map(Number);
  const date = new Date(year, month - 1, day);

  // Rejects dates that rolled over, e.g. 2026-02-31.
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day
  ) {
    return null;
  }

  return date;
}

export function formatDate(
  date: Date,
  format: keyof typeof DATE_FORMAT_OPTIONS = "short"
): string {
  return date.toLocaleDateString("en-US", DATE_FORMAT_OPTIONS[format]);
}

export function formatTime(date: Date, includeSeconds = false): string {
  return date.toLocaleTimeString(
    "en-US",
    includeSeconds
      ? DATE_FORMAT_OPTIONS.timeWithSeconds
      : DATE_FORMAT_OPTIONS.time
  );
}

export function formatDateTime(
  date: Date,
  dateFormat: keyof typeof DATE_FORMAT_OPTIONS = "long"
): string {
  const formattedDate = formatDate(date, dateFormat);
  const formattedTime = formatTime(date);
  return `${formattedDate} at ${formattedTime}`;
}

export function getRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const daysAgo = Math.floor(
    (Date.now() - date.getTime()) / (1000 * 60 * 60 * 24)
  );
  return rtf.format(-daysAgo, "day");
}

export function getDateTimeProps(date: Date | string): {
  dateTime: string;
  title: string;
  relativeTime: string;
} {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return {
    dateTime: dateObj.toISOString(),
    title: formatDateTime(dateObj),
    relativeTime: getRelativeTime(dateObj),
  };
}
