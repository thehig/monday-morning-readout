import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import CryptoJS from "crypto-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.group("🔐 Environment Variable Encryption");
console.log("Starting encryption process...");

// Load environment variables with default behavior
dotenv.config();

// Verify required environment variables
const requiredVars = [
  "BUILD_PASSWORD",
  "VITE_SUPABASE_URL",
  "VITE_SUPABASE_ANON_KEY",
];
const missingVars = requiredVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.error(
    "❌ Error: Missing required environment variables:",
    missingVars.join(", ")
  );
  console.error(
    "Please ensure these variables are set either in .env file or in your environment"
  );
  console.groupEnd();
  process.exit(1);
}

console.log("✅ All required environment variables found");

// Configuration
const KEY_SIZE = 256;
const ITERATIONS = 100000;

console.group("⚙️ Encryption Configuration");
console.log(`Key Size: ${KEY_SIZE} bits`);
console.log(`Iterations: ${ITERATIONS}`);
console.groupEnd();

function encryptData(data, password) {
  console.group("🔒 Encrypting Data");
  console.log("Generating salt and IV...");

  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });
  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  console.log("Performing AES encryption...");
  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

  console.log("✅ Encryption complete");
  console.groupEnd();

  return {
    iv: iv.toString(CryptoJS.enc.Hex),
    salt: salt.toString(CryptoJS.enc.Hex),
    encrypted: encrypted.toString(),
  };
}

// Encrypt environment variables
const envToEncrypt = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
};

console.group("📝 Processing Environment Variables");
console.log("Variables being encrypted:", Object.keys(envToEncrypt).join(", "));

const encryptedEnv = encryptData(
  JSON.stringify(envToEncrypt),
  process.env.BUILD_PASSWORD
);
console.groupEnd();

// Write encrypted environment variables to a JavaScript file
const outputPath = path.resolve(__dirname, "../src/encrypted-env.js");
console.log("📦 Writing encrypted data to:", outputPath);

const outputContent = `// This file is auto-generated. Do not edit manually.
window.ENCRYPTED_ENV = ${JSON.stringify(encryptedEnv, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent);
console.log("✨ Environment variables encrypted successfully!");
console.groupEnd();
