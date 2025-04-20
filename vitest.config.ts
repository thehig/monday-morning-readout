/// <reference types="vitest" />
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*.{js,jsx,ts,tsx}"],
      exclude: [
        "**/*.{test,spec}.{js,jsx,ts,tsx}",
        "**/node_modules/**",
        "**/dist/**",
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
