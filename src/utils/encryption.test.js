import { describe, it, expect, vi } from "vitest";
import secureEnv from "./encryption";

// Mock the crypto-js library
vi.mock("crypto-js", () => {
  const mockWordArray = (value) => ({
    toString: (encoding) => {
      if (encoding === CryptoJS.enc.Hex) return value + "_hex";
      if (encoding === CryptoJS.enc.Utf8) return value;
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
      decrypt: (encryptedData, key, config) => {
        // Construct the string our mock encrypt *would* have created
        // for *some* data, using the provided key and iv from the *real* decrypt call.
        // The real decryptData regenerates the key and gets iv from encryptedData object.
        // Our mock needs to simulate this based on the incoming args.
        const ivString = config.iv.toString(); // Get the IV the real function provides
        const keyString = key.toString(); // Get the key the real function provides

        // Check if the input string LOOKS like our mock encrypted format
        const prefix = `encrypted_`;
        const suffix = `_${keyString}_${ivString}`;

        if (
          encryptedData.toString().startsWith(prefix) &&
          encryptedData.toString().endsWith(suffix)
        ) {
          // If it matches, extract the middle part, which is our original data
          const originalData = encryptedData
            .toString()
            .slice(prefix.length, -suffix.length);
          return mockWordArray(originalData); // Return the original data as a mock WordArray
        }

        // If the format doesn't match, it's likely invalid input or wrong password (key)
        console.error(
          "Mock decryption failed: Input did not match expected mock structure for key/iv",
          { encryptedData: encryptedData.toString(), keyString, ivString }
        );
        throw new Error("Mock Decryption Failed - Input Format/Key Mismatch");
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
    // AND the updated mock toString(Utf8) behavior (no suffix)
    expect(decrypted).toBe("mySecretData");
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

  // --- Tests for encryptEnvVars and decryptEnvVars ---
  const { encryptEnvVars, decryptEnvVars } = secureEnv;
  const mockEnv = {
    VITE_SUPABASE_URL: "https://test.supabase.co",
    VITE_SUPABASE_ANON_KEY: "anon_key_12345",
    OTHER_VAR: "should_be_ignored", // This shouldn't be encrypted
  };
  const buildPassword = "superSecretBuildPassword";

  it("encryptEnvVars should encrypt only specified env vars and return mocked structure", () => {
    const result = encryptEnvVars(mockEnv, buildPassword);

    // Expected input to the mocked encryptData
    const expectedJsonString = JSON.stringify({
      VITE_SUPABASE_URL: "https://test.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon_key_12345",
    });

    // Assertions based on the predictable mock implementation of encryptData
    expect(result.salt).toBe("random_16_hex");
    expect(result.iv).toBe("random_16_hex");
    expect(result.encrypted).toBe(
      `encrypted_${expectedJsonString}_key_${buildPassword}_random_16_8_100000_random_16`
    );
  });

  it("decryptEnvVars should decrypt and parse the env vars using mocked decryption", () => {
    // Construct the input based on the mock encryptEnvVars output
    const expectedJsonString = JSON.stringify({
      VITE_SUPABASE_URL: "https://test.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon_key_12345",
    });
    const encryptedEnvMock = {
      iv: "random_16_hex",
      salt: "random_16_hex",
      encrypted: `encrypted_${expectedJsonString}_key_${buildPassword}_random_16_8_100000_random_16`,
    };

    const decryptedEnv = decryptEnvVars(encryptedEnvMock, buildPassword);

    // Assert the final parsed object matches the expected part of mockEnv
    expect(decryptedEnv).toEqual({
      VITE_SUPABASE_URL: "https://test.supabase.co",
      VITE_SUPABASE_ANON_KEY: "anon_key_12345",
    });
  });

  it("decryptEnvVars should throw if decryption fails (mock throws)", () => {
    const badEncryptedEnv = {
      iv: "random_16_hex",
      salt: "random_16_hex",
      encrypted: "invalid_encrypted_string", // This will cause mock decryptData to throw
    };

    // Silence console.error for this expected failure
    const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => decryptEnvVars(badEncryptedEnv, buildPassword)).toThrow(
      /Failed to decrypt environment variables. Invalid password./
    );

    errorSpy.mockRestore();
  });

  it("decryptEnvVars should throw if decrypted data is not valid JSON", () => {
    // Mock decryptData to return a non-JSON string for this specific test
    const decryptDataSpy = vi
      .spyOn(secureEnv, "decryptData")
      .mockReturnValue("this_is_not_json");

    const anyEncryptedData = { iv: "a", salt: "b", encrypted: "c" }; // Content doesn't matter due to spy

    expect(() => decryptEnvVars(anyEncryptedData, buildPassword)).toThrow(
      /Failed to decrypt environment variables. Invalid password./ // The function catches JSON.parse error
    );

    decryptDataSpy.mockRestore(); // Clean up the spy
  });
});
