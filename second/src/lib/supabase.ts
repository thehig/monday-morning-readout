import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing environment variable: VITE_SUPABASE_URL");
}

if (!supabaseAnonKey) {
  throw new Error("Missing environment variable: VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if Supabase is configured
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase
      .from("po_feedback")
      .select("count")
      .limit(1);
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Supabase connection check failed:", error);
    return false;
  }
}
