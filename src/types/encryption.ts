export interface EncryptedData {
  iv: string;
  content: string;
}

export interface EncryptedEnv {
  VITE_ENCRYPTED_SUPABASE_URL?: string;
  VITE_ENCRYPTED_SUPABASE_ANON_KEY?: string;
}

export interface DecryptedEnv {
  VITE_SUPABASE_URL?: string;
  VITE_SUPABASE_ANON_KEY?: string;
}

export interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}
