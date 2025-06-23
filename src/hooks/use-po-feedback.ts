import { useQuery } from "@tanstack/react-query";
import { getSupabase } from "../utils/supabase";
import { getWeekDates } from "../lib/date-utils";
import type { Database } from "../types/supabase";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

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
