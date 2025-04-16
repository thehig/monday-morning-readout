#!/usr/bin/env node

const path = await import("path");
const fs = await import("fs/promises");
const { fileURLToPath } = await import("url");
const { execSync } = await import("child_process");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const APP_ROOT = path.resolve(__dirname, "..");
const BUILD_DIR = path.join(APP_ROOT, "out");
const TEMP_DIR = path.join(APP_ROOT, ".temp-build");
const FINAL_OUTPUT = path.join(APP_ROOT, "..", "dist", "index.html");

async function exists(path) {
  try {
    await fs.access(path);
    return true;
  } catch {
    return false;
  }
}

async function listDir(dir, prefix = "") {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = await Promise.all(
    entries.map(async (entry) => {
      const res = path.resolve(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      return entry.isDirectory() ? listDir(res, relativePath) : relativePath;
    })
  );
  return files.flat();
}

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const srcPath = path.join(src, entry.name);
      const destPath = path.join(dest, entry.name);
      if (entry.isDirectory()) {
        await copyDir(srcPath, destPath);
      } else {
        await fs.copyFile(srcPath, destPath);
      }
    })
  );
}

async function findFonts(dir) {
  const files = await listDir(dir);
  return files.filter((file) => /\.(woff2?|ttf|eot)$/i.test(file));
}

async function fileToBase64(filePath) {
  const data = await fs.readFile(filePath);
  return data.toString("base64");
}

async function combineBuild() {
  console.log("Starting build combination process...");

  // Check if build exists
  if (!(await exists(BUILD_DIR))) {
    throw new Error(
      "Build directory not found. Please run `npm run build` first."
    );
  }

  const indexPath = path.join(BUILD_DIR, "index.html");
  if (!(await exists(indexPath))) {
    throw new Error("index.html not found in build directory");
  }

  // Create temp directory
  if (await exists(TEMP_DIR)) {
    await fs.rm(TEMP_DIR, { recursive: true });
  }
  await fs.mkdir(TEMP_DIR, { recursive: true });

  // Copy build to temp
  await copyDir(BUILD_DIR, TEMP_DIR);

  // Process fonts
  const fonts = await findFonts(TEMP_DIR);
  for (const font of fonts) {
    const fontPath = path.join(TEMP_DIR, font);
    const base64 = await fileToBase64(fontPath);
    const cssFiles = await listDir(TEMP_DIR);

    for (const cssFile of cssFiles.filter((f) => f.endsWith(".css"))) {
      const cssPath = path.join(TEMP_DIR, cssFile);
      let cssContent = await fs.readFile(cssPath, "utf8");
      cssContent = cssContent.replace(
        new RegExp(font, "g"),
        `data:font/${path.extname(font).slice(1)};base64,${base64}`
      );
      await fs.writeFile(cssPath, cssContent);
    }
  }

  // Create output directory if it doesn't exist
  const outDir = path.dirname(FINAL_OUTPUT);
  await fs.mkdir(outDir, { recursive: true });

  // Combine everything into a single HTML file
  console.log("Inlining all resources...");
  execSync(
    `npx html-inline -i "${path.join(
      TEMP_DIR,
      "index.html"
    )}" -o "${FINAL_OUTPUT}"`,
    { stdio: "inherit" }
  );

  // Cleanup
  await fs.rm(TEMP_DIR, { recursive: true });
  console.log(`Build combined successfully! Output: ${FINAL_OUTPUT}`);
}

combineBuild().catch(console.error);
