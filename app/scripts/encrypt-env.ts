import { encryptEnvVars } from "../src/lib/encryption";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";

// Load environment variables from .env.local file
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Get the password from environment variable
const password = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

if (!password) {
  throw new Error("NEXT_PUBLIC_AUTH_PASSWORD environment variable is not set");
}

// Debug log input environment variables (masked)
console.log("\n🔑 Input Environment Variables:");
console.log("NEXT_PUBLIC_AUTH_PASSWORD:", "*".repeat(password.length));
console.log(
  "NEXT_PUBLIC_SUPABASE_URL:",
  process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + "..." || "Not set"
);
console.log(
  "NEXT_PUBLIC_SUPABASE_ANON_KEY:",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + "..." ||
    "Not set"
);

try {
  // Encrypt the environment variables
  const encrypted = encryptEnvVars(password);

  // Debug log encrypted output
  console.log("\n🔒 Encrypted Output:");
  console.log(
    "Encrypted URL:",
    encrypted.encryptedUrl.substring(0, 32) + "..."
  );
  console.log(
    "Encrypted Key:",
    encrypted.encryptedKey.substring(0, 32) + "..."
  );

  // Create the encrypted environment data
  const encryptedEnvData = `
// This file is auto-generated. Do not edit manually.
export const encryptedEnvVars = {
  url: '${encrypted.encryptedUrl}',
  key: '${encrypted.encryptedKey}',
};
`;

  // Write to a new file
  const outputPath = path.join(process.cwd(), "src", "lib", "encrypted-env.ts");
  fs.writeFileSync(outputPath, encryptedEnvData.trim());

  console.log(
    "\n✅ Successfully encrypted environment variables and wrote to:",
    outputPath
  );
} catch (error) {
  console.error("\n❌ Failed to encrypt environment variables:", error);
  process.exit(1);
}
