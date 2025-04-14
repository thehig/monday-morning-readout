import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";
import type { Database } from "@/types/supabase";

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

// Utility function to get current ISO week number
export function getCurrentWeek(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 1);
  const diff = now.getTime() - start.getTime();
  const oneWeek = 1000 * 60 * 60 * 24 * 7;
  return Math.ceil(diff / oneWeek);
}

export function usePOFeedbackByWeek(weekNumber: number) {
  return useQuery({
    queryKey: ["po-feedback", "week", weekNumber],
    queryFn: async () => {
      const now = new Date();
      const year = now.getFullYear();

      // Calculate the start of the year
      const yearStart = new Date(year, 0, 1);

      // Calculate the start of the target week (Monday)
      const weekStart = new Date(yearStart);
      weekStart.setDate(yearStart.getDate() + (weekNumber - 1) * 7);
      weekStart.setUTCHours(0, 0, 0, 0);

      // Calculate the end of the target week (Friday)
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 4);
      weekEnd.setUTCHours(23, 59, 59, 999);

      console.log("Fetching PO feedback for date range:", {
        weekNumber,
        start: weekStart.toISOString(),
        end: weekEnd.toISOString(),
      });

      const { data, error } = await supabase
        .from("po_feedback")
        .select("*")
        .gte("created_at", weekStart.toISOString())
        .lt("created_at", weekEnd.toISOString())
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching PO feedback: ${error.message}`);
      }

      console.log("Retrieved data:", data);
      return data as POFeedback[];
    },
  });
}
