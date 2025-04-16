import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "../utils/supabase";
import type { Database } from "../types/supabase";
import { getCurrentWeek as getWeek, getWeekDates } from "../lib/date-utils";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

export { getWeek as getCurrentWeek };

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

      const { data, error } = await getSupabase()
        .from("po_feedback")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .lte("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching PO feedback: ${error.message}`);
      }

      console.log("Retrieved data:", data);
      return data as POFeedback[];
    },
  });
}

export function usePOFeedbackById(id: string) {
  return useQuery({
    queryKey: ["po-feedback", id],
    queryFn: async () => {
      const { data, error } = await getSupabase()
        .from("po_feedback")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as POFeedback;
    },
  });
}
