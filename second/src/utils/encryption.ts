import {
  pbkdf2Sync,
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "crypto";

const ITERATIONS = 100000;
const KEY_LENGTH = 32;
const ALGORITHM = "aes-256-gcm";

export interface EncryptedData {
  iv: string;
  tag: string;
  encrypted: string;
}

export function encryptData(data: string, password: string): EncryptedData {
  // Generate a salt and derive key using PBKDF2
  const salt = randomBytes(16);
  const key = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");

  // Create cipher
  const iv = randomBytes(12);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  // Encrypt the data
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");

  // Get the auth tag
  const tag = cipher.getAuthTag();

  return {
    iv: iv.toString("hex"),
    tag: tag.toString("hex"),
    encrypted: salt.toString("hex") + ":" + encrypted,
  };
}

export function decryptData(
  encryptedData: EncryptedData,
  password: string
): string {
  try {
    // Split salt from encrypted data
    const [saltHex, encryptedText] = encryptedData.encrypted.split(":");
    const salt = Buffer.from(saltHex, "hex");

    // Derive key using PBKDF2
    const key = pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, "sha256");

    // Create decipher
    const iv = Buffer.from(encryptedData.iv, "hex");
    const decipher = createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(Buffer.from(encryptedData.tag, "hex"));

    // Decrypt the data
    let decrypted = decipher.update(encryptedText, "hex", "utf8");
    decrypted += decipher.final("utf8");

    return decrypted;
  } catch (error) {
    throw new Error("Decryption failed. Invalid password or corrupted data.");
  }
}
