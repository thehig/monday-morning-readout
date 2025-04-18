import "@testing-library/jest-dom";
import { TextEncoder, TextDecoder } from "util";

// Mock global objects that might be missing in jsdom
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock CryptoJS for encryption utilities
global.CryptoJS = {
  lib: {
    WordArray: {
      random: jest.fn().mockReturnValue({
        toString: jest.fn().mockReturnValue("mockedRandomValue"),
      }),
    },
  },
  PBKDF2: jest.fn().mockReturnValue("mockedKey"),
  AES: {
    encrypt: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue("mockedEncryptedData"),
    }),
    decrypt: jest.fn().mockReturnValue({
      toString: jest.fn().mockReturnValue("mockedDecryptedData"),
    }),
  },
  enc: {
    Hex: {
      parse: jest.fn().mockReturnValue("mockedParsedHex"),
    },
    Utf8: {
      parse: jest.fn().mockReturnValue("mockedParsedUtf8"),
    },
  },
  mode: {
    CBC: "CBC",
  },
  pad: {
    Pkcs7: "Pkcs7",
  },
};
