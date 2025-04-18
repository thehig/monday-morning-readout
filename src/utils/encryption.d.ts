export interface EncryptedData {
  iv: string;
  salt: string;
  encrypted: string;
}

export interface EnvironmentVariables {
  VITE_SUPABASE_URL: string;
  VITE_SUPABASE_ANON_KEY: string;
}

export function encryptData(data: string, password: string): EncryptedData;
export function decryptData(
  encryptedData: EncryptedData,
  password: string
): string;
export function encryptEnvVars(
  env: EnvironmentVariables,
  buildPassword: string
): EncryptedData;
export function decryptEnvVars(
  encryptedEnv: EncryptedData,
  password: string
): EnvironmentVariables;
