/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    // The team's weeks are German calendar weeks, and the week-range bug this
    // guards against cannot reproduce at UTC. CI runners default to UTC, so
    // pin the suite to the business timezone.
    env: { TZ: "Europe/Berlin" },
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/node_modules/**",
        "**/dist/**",
        // Type definition files
        "**/*.d.ts",
        // Main entry points and configuration
        "src/main.tsx",
        "src/App.tsx",
        "src/vite-env.d.ts",
        // Simple index files that only export other modules
        "src/components/indicators/index.ts",
        // Type definition files that don't need coverage
        "src/types/**/*",
        // Test utilities
        "src/test-utils.tsx",
      ],
      thresholds: {
        // Set higher threshold for utility functions
        "src/lib/**/*": {
          statements: 90,
          branches: 90,
          functions: 90,
          lines: 90,
        },
        // Set threshold for components
        "src/components/**/*": {
          statements: 85,
          branches: 85,
          functions: 85,
          lines: 85,
        },
      },
    },
    include: ["src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
