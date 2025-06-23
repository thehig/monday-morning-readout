import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { http, HttpResponse } from "msw";
// Import server from the setup file (adjust path relative to this file)
import { server } from "../../vitest.setup";
import { SupabaseClient } from "@supabase/supabase-js";

// Constants for testing
// Use the actual URL for initialization in tests so MSW can intercept
const SUPABASE_URL = "https://kkkshnlgyqodxnclrnon.supabase.co";
const MOCK_KEY = "mock-key"; // Key doesn't matter for MSW

describe("Supabase Utility", () => {
  // Reset modules before each test to ensure clean state for initializeSupabase/getSupabase
  beforeEach(() => {
    vi.resetModules();
  });

  // Cleanup potentially initialized client after each test
  afterEach(() => {
    vi.resetModules();
  });

  describe("initializeSupabase", () => {
    it("should initialize and return a SupabaseClient instance", async () => {
      const { initializeSupabase: init } = await import("./supabase");
      const client = init(SUPABASE_URL, MOCK_KEY);
      expect(client).toBeDefined();
      expect(client).toBeInstanceOf(SupabaseClient);
    });

    it("should throw error if Supabase URL is missing", async () => {
      const { initializeSupabase: init } = await import("./supabase");

      // Mock console.error since this test expects an error
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => init("", MOCK_KEY)).toThrow(
        "Supabase URL and anon key are required"
      );

      errorSpy.mockRestore();
    });

    it("should throw error if Supabase anon key is missing", async () => {
      const { initializeSupabase: init } = await import("./supabase");

      // Mock console.error since this test expects an error
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => init(SUPABASE_URL, "")).toThrow(
        "Supabase URL and anon key are required"
      );

      errorSpy.mockRestore();
    });
  });

  describe("getSupabase", () => {
    it("should throw error if called before initialization", async () => {
      const { getSupabase: get } = await import("./supabase");

      // Mock console.error since this test expects an error
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      expect(() => get()).toThrow(
        "Supabase client not initialized. Call initializeSupabase first."
      );

      errorSpy.mockRestore();
    });

    it("should return the client instance after initialization", async () => {
      // Need to import both together after resetting modules
      const { initializeSupabase: init, getSupabase: get } = await import(
        "./supabase"
      );
      const initializedClient = init(SUPABASE_URL, MOCK_KEY);
      const retrievedClient = get();
      expect(retrievedClient).toBeDefined();
      expect(retrievedClient).toBe(initializedClient);
      expect(retrievedClient).toBeInstanceOf(SupabaseClient);
    });
  });

  describe("testConnection", () => {
    // Important: Initialize Supabase before each testConnection test
    // This needs to happen AFTER module reset if testing initialization itself
    beforeEach(async () => {
      const { initializeSupabase: init } = await import("./supabase");
      init(SUPABASE_URL, MOCK_KEY);
    });

    it("should return success true and a timestamp on successful connection", async () => {
      const { testConnection: testConn } = await import("./supabase");
      const result = await testConn();
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(result.timestamp).toBeDefined();
      // Check if the timestamp is a valid ISO string (basic check)
      expect(() => new Date(result.timestamp!)).not.toThrow();
    });

    it("should return success false and an error message on connection failure", async () => {
      const { testConnection: testConn } = await import("./supabase");

      // Mock console.error since this test expects an error
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

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
      const result = await testConn();
      expect(result.success).toBe(false);
      expect(result.timestamp).toBeUndefined();
      expect(result.error).toBeDefined();
      // Check for the specific message returned by the mock or Supabase client error wrapping
      // In this case, the Supabase client likely includes the mocked message in its error
      expect(result.error).toContain("Simulated DB Error");

      errorSpy.mockRestore();
    });

    // This test needs careful handling due to module state
    it("should return error object if Supabase is not initialized (within testConnection's catch)", async () => {
      // Mock console.error since this test expects an error
      const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

      // Ensure modules are reset to simulate uninitialized state
      vi.resetModules();
      const { testConnection: testConnUninitialized } = await import(
        "./supabase"
      );
      // testConnection catches the error from getSupabase and returns an object
      await expect(testConnUninitialized()).resolves.toEqual({
        success: false,
        error:
          "Supabase client not initialized. Call initializeSupabase first.",
      });

      errorSpy.mockRestore();
    });
  });

  // Add tests for initializeSupabase and getSupabase if needed
});
