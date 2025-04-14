import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabaseClient";

export interface TestData {
  id: number;
  name: string;
  created_at: string;
}

export const useSupabaseData = () => {
  return useQuery<TestData[], Error>({
    queryKey: ["test-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("test_table")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as TestData[];
    },
  });
};
