import { encryptEnvVars } from "../src/lib/encryption";
import fs from "fs";
import path from "path";

// Get the password from environment variable
const password = process.env.NEXT_PUBLIC_AUTH_PASSWORD;

if (!password) {
  throw new Error("NEXT_PUBLIC_AUTH_PASSWORD environment variable is not set");
}

try {
  // Encrypt the environment variables
  const encrypted = encryptEnvVars(password);

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

  console.log("✅ Successfully encrypted environment variables");
} catch (error) {
  console.error("❌ Failed to encrypt environment variables:", error);
  process.exit(1);
}
