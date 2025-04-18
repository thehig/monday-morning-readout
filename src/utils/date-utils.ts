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

  // End date is set to the start of Saturday (which means it includes all of Friday)
  const end = new Date(start);
  end.setDate(end.getDate() + 5);

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
} as const;

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
