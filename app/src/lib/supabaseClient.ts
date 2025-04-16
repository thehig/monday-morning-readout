import { createClient } from "@supabase/supabase-js";
import { encryptedEnvVars } from "./encrypted-env";
import { decryptEnvVars } from "./encryption";

let supabase: ReturnType<typeof createClient>;

export function initializeSupabase(password: string) {
  try {
    const { supabaseUrl, supabaseKey } = decryptEnvVars(
      password,
      encryptedEnvVars.url,
      encryptedEnvVars.key
    );
    supabase = createClient(supabaseUrl, supabaseKey);
    return true;
  } catch (error) {
    return false;
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
