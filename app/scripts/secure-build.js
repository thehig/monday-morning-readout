#!/usr/bin/env node

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";
import { encryptEnvVars } from "../src/lib/encryption.ts";
import dotenv from "dotenv";
import fs from "fs/promises";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function secureBuild() {
  try {
    // Load environment variables from .env.local
    dotenv.config({ path: path.join(__dirname, "../.env.local") });

    const authPassword = process.env.NEXT_PUBLIC_AUTH_PASSWORD;
    if (!authPassword) {
      throw new Error(
        "NEXT_PUBLIC_AUTH_PASSWORD environment variable is required"
      );
    }

    // Step 1: Encrypt environment variables
    console.log("Encrypting environment variables...");
    const { encryptedUrl, encryptedKey } = encryptEnvVars(authPassword);

    // Step 2: Write encrypted values to file
    const encryptedEnvContent = `export const encryptedEnvVars = {
  url: "${encryptedUrl}",
  key: "${encryptedKey}",
};`;

    const encryptedEnvPath = path.join(
      __dirname,
      "../src/lib/encrypted-env.ts"
    );
    await fs.writeFile(encryptedEnvPath, encryptedEnvContent);

    // Step 3: Run next build with static export
    console.log("Building Next.js app with static export...");
    await execAsync("next build", { cwd: path.join(__dirname, "..") });

    // Step 4: Find the main HTML file in the out directory
    const outDir = path.join(__dirname, "..", "out");
    const indexHtml = path.join(outDir, "index.html");

    // Step 5: Use html-inline to combine everything into one file
    console.log("Combining into single HTML file...");
    const combinedHtmlPath = path.join(outDir, "combined.html");
    await execAsync(`npx html-inline -i ${indexHtml} -o ${combinedHtmlPath}`, {
      cwd: path.join(__dirname, ".."),
    });

    // Step 7: Verify the combined file exists and has content
    console.log("Verifying combined file...");
    const combinedStats = await fs.stat(combinedHtmlPath);
    console.log(`Combined file size: ${combinedStats.size} bytes`);

    // Step 8: Basic content verification
    const combinedContent = await fs.readFile(combinedHtmlPath, "utf-8");
    const hasAuth = combinedContent.includes("AuthProvider");
    const hasRoute = combinedContent.includes("RouteGuard");
    console.log("Content verification:", { hasAuth, hasRoute });

    if (!hasAuth || !hasRoute) {
      console.warn(
        "Warning: Some expected content might be missing from the build"
      );
    }

    console.log("Secure build completed successfully! Check out/combined.html");
  } catch (error) {
    console.error("Error during secure build:", error);
    process.exit(1);
  }
}

secureBuild();
