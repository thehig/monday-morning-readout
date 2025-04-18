import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "../utils/supabase";
import type { Database } from "../types/supabase";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export function getCurrentWeek(
  year: number = new Date().getFullYear()
): number {
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

function getWeekDates(weekNumber: number, year: number) {
  // Start from January 1st
  const yearStart = new Date(year, 0, 1);
  // Get the day of the week (0 = Sunday, 1 = Monday, etc.)
  const startDayOfWeek = yearStart.getDay();
  // Calculate offset to first Monday
  const daysToFirstMonday =
    startDayOfWeek <= 1 ? 1 - startDayOfWeek : 8 - startDayOfWeek;

  // Start date calculation (Monday)
  const start = new Date(yearStart);
  start.setDate(yearStart.getDate() + daysToFirstMonday + (weekNumber - 1) * 7);

  // End date is set to the start of Saturday (which means it includes all of Friday)
  const end = new Date(start);
  end.setDate(end.getDate() + 5);

  return { start, end };
}

export function usePOFeedbackByWeek(
  weekNumber: number,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: ["po-feedback", "week", weekNumber],
    queryFn: async () => {
      const now = new Date();
      const year = now.getFullYear();

      const { start: weekStart, end: weekEnd } = getWeekDates(weekNumber, year);

      weekStart.setUTCHours(0, 0, 0, 0);
      weekEnd.setUTCHours(23, 59, 59, 999);

      console.log("Fetching PO feedback for date range:", {
        weekNumber,
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      });

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("po_feedback")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) {
        console.error("Error fetching PO feedback:", error);
        throw error;
      }

      return data as POFeedback[];
    },
    enabled: enabled,
  });
}

export function usePOFeedbackById(
  id: string | string[] | undefined,
  enabled: boolean = false
) {
  return useQuery({
    queryKey: ["po-feedback", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");

      const supabase = getSupabase();
      const { data, error } = await supabase
        .from("po_feedback")
        .select("*")
        .in("id", Array.isArray(id) ? id : [id]);

      if (error) throw error;

      console.log("Fetched feedback data:", data);

      return Array.isArray(id)
        ? (data as POFeedback[])
        : (data[0] as POFeedback);
    },
    enabled: enabled && !!id,
  });
}
