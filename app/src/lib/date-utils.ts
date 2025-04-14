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
