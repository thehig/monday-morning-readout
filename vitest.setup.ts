import { TextEncoder, TextDecoder } from "util";
import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom";

declare global {
  var TextEncoder: typeof TextEncoder;
  var TextDecoder: typeof TextDecoder;
}

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Mock CryptoJS methods
vi.mock("crypto-js", () => ({
  AES: {
    encrypt: vi.fn(),
    decrypt: vi.fn(),
  },
  enc: {
    Utf8: {},
  },
}));

// Create MSW server with initial handlers
export const server = setupServer(
  // Add your handlers here
  http.get("/api/example", () => {
    return HttpResponse.json({ message: "Hello from MSW!" });
  })
);

// Start server before all tests
beforeAll(() => server.listen());

// Reset handlers after each test
afterEach(() => server.resetHandlers());

// Clean up after all tests are done
afterAll(() => server.close());
