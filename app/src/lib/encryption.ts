import CryptoJS from "crypto-js";

// Number of iterations for key derivation
const PBKDF2_ITERATIONS = 10000;
// Salt for key derivation (this can be public)
const SALT = "monday-morning-readout-salt";

// Derive a key from the password
export function deriveKey(password: string): string {
  return CryptoJS.PBKDF2(password, SALT, {
    keySize: 256 / 32, // 256 bits
    iterations: PBKDF2_ITERATIONS,
  }).toString();
}

// Encrypt data with a key
export function encrypt(data: string, key: string): string {
  return CryptoJS.AES.encrypt(data, key).toString();
}

// Decrypt data with a key
export function decrypt(encryptedData: string, key: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, key);
  return bytes.toString(CryptoJS.enc.Utf8);
}

// Encrypt the environment variables during build time
export function encryptEnvVars(password: string): {
  encryptedUrl: string;
  encryptedKey: string;
} {
  const key = deriveKey(password);
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables");
  }

  return {
    encryptedUrl: encrypt(supabaseUrl, key),
    encryptedKey: encrypt(supabaseKey, key),
  };
}

// Decrypt the environment variables at runtime
export function decryptEnvVars(
  password: string,
  encryptedUrl: string,
  encryptedKey: string
): { supabaseUrl: string; supabaseKey: string } {
  const key = deriveKey(password);

  try {
    const supabaseUrl = decrypt(encryptedUrl, key);
    const supabaseKey = decrypt(encryptedKey, key);

    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Failed to decrypt environment variables");
    }

    return { supabaseUrl, supabaseKey };
  } catch (error) {
    throw new Error(
      `Failed to decrypt environment variables - invalid password: ${
        error instanceof Error ? error.message : String(error)
      }`
    );
  }
}
