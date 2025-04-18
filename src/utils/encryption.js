// Encryption configuration
const KEY_SIZE = 256;
const ITERATIONS = 100000;

/**
 * Encrypts sensitive data using a password
 * @param {string} data - The data to encrypt
 * @param {string} password - The password to use for encryption
 * @returns {Object} - Object containing the encrypted data and salt
 */
function encryptData(data, password) {
  // Generate a random salt
  const salt = CryptoJS.lib.WordArray.random(128 / 8);

  // Generate key from password and salt
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });

  // Generate random IV
  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  // Encrypt the data
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  // Combine everything into a single object
  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    salt: salt.toString(CryptoJS.enc.Hex),
    encrypted: encrypted.toString(),
  };
}

/**
 * Decrypts data using a password
 * @param {Object} encryptedData - Object containing the encrypted data, IV, and salt
 * @param {string} password - The password to use for decryption
 * @returns {string} - The decrypted data
 */
function decryptData(encryptedData, password) {
  try {
    console.log("Decryption attempt with data:", {
      iv: encryptedData.iv,
      salt: encryptedData.salt,
      encryptedLength: encryptedData.encrypted.length,
    });

    // Convert hex strings back to WordArrays
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const salt = CryptoJS.enc.Hex.parse(encryptedData.salt);
    console.log("Parsed IV and salt:", {
      iv: iv.toString(),
      salt: salt.toString(),
    });

    // Regenerate the key
    const key = CryptoJS.PBKDF2(password, salt, {
      keySize: KEY_SIZE / 32,
      iterations: ITERATIONS,
    });
    console.log("Generated key from password");

    // Decrypt the data
    const decrypted = CryptoJS.AES.decrypt(encryptedData.encrypted, key, {
      iv: iv,
      padding: CryptoJS.pad.Pkcs7,
      mode: CryptoJS.mode.CBC,
    });
    console.log("Decryption complete, attempting UTF-8 conversion");

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    console.log("Decrypted result:", result.substring(0, 50) + "...");
    return result;
  } catch (e) {
    console.error("Decryption failed:", e);
    console.error("CryptoJS availability:", {
      CryptoJS: !!window.CryptoJS,
      AES: !!window.CryptoJS?.AES,
      PBKDF2: !!window.CryptoJS?.PBKDF2,
    });
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
}

/**
 * Pre-build script to encrypt environment variables
 * @param {Object} env - Environment variables to encrypt
 * @param {string} buildPassword - Password to use for encryption
 * @returns {Object} - Object containing encrypted environment variables
 */
function encryptEnvVars(env, buildPassword) {
  const envToEncrypt = {
    VITE_SUPABASE_URL: env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: env.VITE_SUPABASE_ANON_KEY,
  };

  return encryptData(JSON.stringify(envToEncrypt), buildPassword);
}

/**
 * Runtime function to decrypt environment variables
 * @param {Object} encryptedEnv - Encrypted environment variables
 * @param {string} password - Password to decrypt the variables
 * @returns {Object} - Decrypted environment variables
 */
function decryptEnvVars(encryptedEnv, password) {
  try {
    console.log(
      "Attempting to decrypt env vars with password length:",
      password.length
    );
    console.log("Encrypted env structure:", {
      hasIV: !!encryptedEnv.iv,
      hasSalt: !!encryptedEnv.salt,
      hasEncrypted: !!encryptedEnv.encrypted,
    });

    const decrypted = decryptData(encryptedEnv, password);
    console.log("Successfully decrypted env vars, parsing JSON");

    const parsed = JSON.parse(decrypted);
    console.log(
      "Environment variables parsed successfully:",
      Object.keys(parsed)
    );
    return parsed;
  } catch (e) {
    console.error("Failed to decrypt env vars:", e);
    throw new Error(
      "Failed to decrypt environment variables. Invalid password."
    );
  }
}

// Export functions for use in build scripts and runtime
window.secureEnv = {
  encryptData,
  decryptData,
  encryptEnvVars,
  decryptEnvVars,
};
