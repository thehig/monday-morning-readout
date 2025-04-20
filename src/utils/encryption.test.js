import { describe, it, expect, vi } from "vitest";
import secureEnv from "./encryption";

// Mock the crypto-js library
vi.mock("crypto-js", () => {
  const mockWordArray = (value) => ({
    toString: (encoding) => {
      if (encoding === CryptoJS.enc.Hex) return value + "_hex";
      if (encoding === CryptoJS.enc.Utf8) return value + "_utf8";
      return value;
    },
  });

  const CryptoJS = {
    lib: {
      WordArray: {
        random: (size) => mockWordArray(`random_${size}`),
      },
    },
    enc: {
      Hex: {
        parse: (hexString) => mockWordArray(hexString.replace("_hex", "")),
      },
      Utf8: {}, // Mocked, actual toString handled in mockWordArray
    },
    PBKDF2: (password, salt, config) =>
      mockWordArray(
        `key_${password}_${salt.toString()}_${config.keySize}_${
          config.iterations
        }`
      ),
    AES: {
      encrypt: (data, key, config) => ({
        toString: () =>
          `encrypted_${data}_${key.toString()}_${config.iv.toString()}`,
      }),
      decrypt: (encryptedData, _key, _config) => {
        // Simulate decryption based on predictable mock encryption
        const parts = encryptedData.toString().split("_"); // Ensure it's a string
        // Check for prefix and extract data part, ignoring other mock details
        if (parts.length >= 2 && parts[0] === "encrypted") {
          const originalData = parts[1];
          return mockWordArray(originalData); // Return the original data as a mock WordArray
        }
        // Simulate failure if format doesn't match expected mock structure
        console.error(
          "Mock decryption failed: Input did not match expected mock format",
          encryptedData
        );
        throw new Error("Mock Decryption Failed - Input Format Error");
      },
    },
    pad: {
      Pkcs7: {}, // Mocked, no real padding needed
    },
    mode: {
      CBC: {}, // Mocked, no real mode logic needed
    },
  };
  // Assign the mock object globally within the mock's scope if needed by toString
  global.CryptoJS = CryptoJS;
  return { default: CryptoJS };
});

describe("Encryption Utilities (with Mocks)", () => {
  const { encryptData, decryptData } = secureEnv;
  const testData = "mySecretData";
  const testPassword = "myStrongPassword";

  it("encryptData should return predictable mocked values", () => {
    const result = encryptData(testData, testPassword);

    // Assertions based on the predictable mock implementation
    expect(result.salt).toBe("random_16_hex"); // from WordArray.random(128/8)
    expect(result.iv).toBe("random_16_hex"); // from WordArray.random(128/8)
    expect(result.encrypted).toBe(
      "encrypted_mySecretData_key_myStrongPassword_random_16_8_100000_random_16"
    ); // from AES.encrypt and PBKDF2 mock logic
  });

  it("decryptData should return original data based on mocked encryption", () => {
    const encryptedMockData = {
      iv: "random_16_hex",
      salt: "random_16_hex",
      encrypted:
        "encrypted_mySecretData_key_myStrongPassword_random_16_8_100000_random_16",
    };

    const decrypted = decryptData(encryptedMockData, testPassword);

    // Based on the mock AES.decrypt logic returning the original data part
    expect(decrypted).toBe("mySecretData_utf8"); // The mock returns original data + _utf8 suffix
  });

  it("decryptData should throw for invalid mock data", () => {
    const badEncryptedData = {
      iv: "random_16_hex",
      salt: "random_16_hex",
      encrypted: "invalid_encrypted_string",
    };

    // Silence console.error just for this throwing test
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => decryptData(badEncryptedData, testPassword)).toThrow(
      /Decryption failed/
    );

    // Restore console.error after the test
    errorSpy.mockRestore();
  });

  // Add more tests for encryptEnvVars and decryptEnvVars later
});
