import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import CryptoJS from "crypto-js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Check for build password
const buildPassword = process.env.BUILD_PASSWORD;
if (!buildPassword) {
  console.error("Error: BUILD_PASSWORD variable is required in .env file");
  process.exit(1);
}

// Configuration
const KEY_SIZE = 256;
const ITERATIONS = 100000;

function encryptData(data, password) {
  const salt = CryptoJS.lib.WordArray.random(128 / 8);
  const key = CryptoJS.PBKDF2(password, salt, {
    keySize: KEY_SIZE / 32,
    iterations: ITERATIONS,
  });
  const iv = CryptoJS.lib.WordArray.random(128 / 8);

  const encrypted = CryptoJS.AES.encrypt(data, key, {
    iv: iv,
    padding: CryptoJS.pad.Pkcs7,
    mode: CryptoJS.mode.CBC,
  });

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

const encryptedEnv = encryptData(JSON.stringify(envToEncrypt), buildPassword);

// Write encrypted environment variables to a JavaScript file
const outputPath = path.resolve(__dirname, "../src/encrypted-env.js");
const outputContent = `// This file is auto-generated. Do not edit manually.
window.ENCRYPTED_ENV = ${JSON.stringify(encryptedEnv, null, 2)};
`;

fs.writeFileSync(outputPath, outputContent);
console.log("Environment variables encrypted successfully!");
