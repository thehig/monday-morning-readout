import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "../utils/supabase";
import type { Database } from "../types/supabase";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export function getCurrentWeek(
  year: number = new Date().getFullYear()
): number {
  const now = new Date();
  const start = new Date(year, 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

function getWeekDates(weekNumber: number, year: number) {
  const start = new Date(year, 0, 1);
  start.setDate(start.getDate() + (weekNumber - 1) * 7);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return { start, end };
}

export function usePOFeedbackByWeek(weekNumber: number) {
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
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching PO feedback:", error);
        throw error;
      }

      console.log("Retrieved data:", data);
      return data as POFeedback[];
    },
  });
}

export function usePOFeedbackById(id: string | undefined) {
  const supabase = getSupabase();

  return useQuery({
    queryKey: ["po-feedback", id],
    queryFn: async () => {
      if (!id) throw new Error("ID is required");

      const { data, error } = await supabase
        .from("po_feedback")
        .select("*")
        .eq("id", parseInt(id))
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}
