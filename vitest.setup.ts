import { TextEncoder, TextDecoder } from "util";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import "@testing-library/jest-dom";
import { setupServer } from "msw/node";
import { handlers } from "./src/mocks/handlers";

export const server = setupServer(...handlers);

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

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));

afterEach(() => server.resetHandlers());

afterAll(() => server.close());
