import { createClient } from "@supabase/supabase-js";
import type { Database } from "../types/supabase";

let supabase: ReturnType<typeof createClient<Database>> | null = null;

export function initializeSupabase(url: string, anonKey: string) {
  try {
    if (!url || !anonKey) {
      throw new Error("Supabase URL and anon key are required");
    }
    supabase = createClient<Database>(url, anonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: {
          "X-Client-Info": "monday-morning-readout",
        },
      },
    });
    return supabase;
  } catch (error) {
    console.error("Failed to initialize Supabase client:", error);
    throw error;
  }
}

export function getSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase client not initialized. Call initializeSupabase first."
    );
  }
  return supabase;
}

export async function testConnection() {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from("po_feedback")
      .select("created_at")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error: error.message };
    }

    const timestamp = data?.[0]?.created_at || new Date().toISOString();
    return { success: true, timestamp };
  } catch (error) {
    console.error("Supabase connection test failed:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
