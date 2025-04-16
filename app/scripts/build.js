import { createInterface } from "readline";
import { spawn } from "child_process";

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Prompt for password
rl.question(
  "Enter the password for encrypting environment variables: ",
  (password) => {
    // Set the password as an environment variable
    process.env.NEXT_PUBLIC_AUTH_PASSWORD = password;

    // Run the build command
    const build = spawn("npm", ["run", "build"], {
      stdio: "inherit",
      env: process.env,
    });

    build.on("close", (code) => {
      if (code !== 0) {
        console.error("❌ Build failed");
        process.exit(1);
      }
      console.log("✅ Build completed successfully");
      rl.close();
    });
  }
);
