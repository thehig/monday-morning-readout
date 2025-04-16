import { createClient } from "@supabase/supabase-js";

let supabase: ReturnType<typeof createClient> | null = null;

export function initializeSupabase(url: string, anonKey: string) {
  supabase = createClient(url, anonKey);
  return supabase;
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
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }

  try {
    // Simple query to test connection - just fetch the current timestamp from Postgres
    const { data, error } = await supabase
      .from("po_feedback") // This is a system table that always exists
      .select("*")
      .limit(1);

    if (error) {
      console.error("Supabase connection test failed:", error);
      return { success: false, error: error.message };
    }

    console.log("Supabase connection test successful:", data);
    return { success: true, timestamp: new Date().toISOString() };
  } catch (err) {
    console.error("Supabase connection test error:", err);
    return {
      success: false,
      error: err instanceof Error ? err.message : "Unknown error",
    };
  }
}
