import { createClient } from "@supabase/supabase-js";
import type { Database } from "../../types/supabase";

let supabaseClient: ReturnType<typeof createClient<Database>> | null = null;

export function initializeSupabase(url: string, key: string) {
  supabaseClient = createClient<Database>(url, key);
  return supabaseClient;
}

export function getSupabase() {
  if (!supabaseClient) {
    throw new Error(
      "Supabase client not initialized. Call initializeSupabase first."
    );
  }
  return supabaseClient;
}
