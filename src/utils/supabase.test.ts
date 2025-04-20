import { describe, it, expect, beforeEach, vi } from "vitest";
import { http, HttpResponse } from "msw";
import { initializeSupabase, testConnection } from "./supabase";
// Import server from the setup file (adjust path relative to this file)
import { server } from "../../vitest.setup";

// Constants for testing
// Use the actual URL for initialization in tests so MSW can intercept
const SUPABASE_URL = "https://kkkshnlgyqodxnclrnon.supabase.co";
const MOCK_KEY = "mock-key"; // Key doesn't matter for MSW

describe("Supabase Utility", () => {
  // Initialize Supabase with the REAL URL before tests that need it
  beforeEach(() => {
    initializeSupabase(SUPABASE_URL, MOCK_KEY);
  });

  describe("testConnection", () => {
    it("should return success true and a timestamp on successful connection", async () => {
      // No need to server.use() here as the default handler should work

      const result = await testConnection();

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.timestamp).toBeDefined();
      // Check if the timestamp is a valid ISO string (basic check)
      expect(() => new Date(result.timestamp!)).not.toThrow();
    });

    it("should return success false and an error message on connection failure", async () => {
      // Override the default handler to simulate an error
      server.use(
        http.get(`${SUPABASE_URL}/rest/v1/po_feedback`, ({ request }) => {
          const url = new URL(request.url);
          if (
            url.searchParams.get("select") === "created_at" &&
            url.searchParams.get("limit") === "1"
          ) {
            return new HttpResponse(
              JSON.stringify({ message: "Simulated DB Error" }),
              {
                status: 500,
                headers: { "Content-Type": "application/json" },
              }
            );
          }
        })
      );

      const result = await testConnection();

      expect(result.success).toBe(false);
      expect(result.timestamp).toBeUndefined();
      expect(result.error).toBeDefined();
      // Check for the specific message returned by the mock or Supabase client error wrapping
      // In this case, the Supabase client likely includes the mocked message in its error
      expect(result.error).toContain("Simulated DB Error");
    });

    it("should throw error if Supabase is not initialized", async () => {
      // Reset Supabase instance for this specific test
      // This is a bit tricky, might need to adjust how Supabase is initialized/reset for testing
      // For now, we assume it can be reset or use a different context
      vi.resetModules(); // Vitest specific: re-evaluate modules
      const { testConnection: testConnectionUninitialized } = await import(
        "./supabase"
      );

      // Expect the promise to RESOLVE with success: false and the specific error message
      await expect(testConnectionUninitialized()).resolves.toEqual({
        success: false,
        error:
          "Supabase client not initialized. Call initializeSupabase first.",
      });
    });
  });

  // Add tests for initializeSupabase and getSupabase if needed
});
