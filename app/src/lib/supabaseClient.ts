import { createClient } from "@supabase/supabase-js";
import { encryptedEnvVars } from "./encrypted-env";
import { decryptEnvVars } from "./encryption";

let supabase: ReturnType<typeof createClient>;

export function initializeSupabase(password: string) {
  try {
    console.log("Attempting to initialize Supabase with encrypted values:", {
      encryptedUrl: encryptedEnvVars.url.substring(0, 20) + "...",
      encryptedKey: encryptedEnvVars.key.substring(0, 20) + "...",
    });

    const { supabaseUrl, supabaseKey } = decryptEnvVars(
      password,
      encryptedEnvVars.url,
      encryptedEnvVars.key
    );

    console.log("Successfully decrypted values:", {
      supabaseUrl: supabaseUrl.substring(0, 20) + "...",
      supabaseKey: supabaseKey.substring(0, 20) + "...",
    });

    supabase = createClient(supabaseUrl, supabaseKey);
    return true;
  } catch (error) {
    console.error(
      "Failed to initialize Supabase:",
      error instanceof Error ? error.message : String(error)
    );
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
