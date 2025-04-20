import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import secureEnv from "../src/utils/encryption.js";

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

// Encrypt environment variables
const envToEncrypt = {
  VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL,
  VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY,
};

console.group("📝 Processing Environment Variables");
console.log("Variables being encrypted:", Object.keys(envToEncrypt).join(", "));

const encryptedEnv = secureEnv.encryptData(
  JSON.stringify(envToEncrypt),
  process.env.BUILD_PASSWORD
);
console.groupEnd();

// Write encrypted environment variables to a JSON file
const outputPath = path.resolve(__dirname, "../src/encrypted-env.json");
console.log("📦 Writing encrypted data to:", outputPath);

const outputContent = JSON.stringify(encryptedEnv, null, 2);

fs.writeFileSync(outputPath, outputContent);
console.log("✨ Environment variables encrypted successfully!");
console.groupEnd();
