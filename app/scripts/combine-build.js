#!/usr/bin/env node

import { exec } from "child_process";
import { promisify } from "util";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function combineBuild() {
  try {
    // Step 1: Run next build (export is now configured in next.config.js)
    console.log("Building Next.js app with static export...");
    await execAsync("next build");

    // Step 2: Find the main HTML file in the out directory
    const outDir = path.join(__dirname, "..", "out");
    const indexHtml = path.join(outDir, "index.html");

    // Step 3: Use html-inline to combine everything into one file
    console.log("Combining into single HTML file...");
    await execAsync(
      `npx html-inline -i ${indexHtml} -o ${path.join(outDir, "combined.html")}`
    );

    console.log("Build combined successfully! Check out/combined.html");
  } catch (error) {
    console.error("Error combining build:", error);
    process.exit(1);
  }
}

combineBuild();
