interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

type EncryptedEnv = {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
};

type EncryptionConfig = {
  keySize: number;
  iterations: number;
};

type EncryptionResult = {
  salt: string;
  iv: string;
  encrypted: string;
};

type DecryptionResult = {
  decrypted: string;
  error?: string;
};

type EncryptionUtils = {
  encrypt: (data: string, key: string) => EncryptionResult;
  decrypt: (data: EncryptionResult, key: string) => DecryptionResult;
  generateKey: (
    password: string,
    salt: string,
    config: EncryptionConfig
  ) => string;
  encryptEnvFile: (envData: Record<string, string>, key: string) => string;
  decryptEnvFile: (
    encryptedData: string,
    key: string
  ) => Record<string, string>;
  encryptEnvVars: (envVars: Record<string, string>, key: string) => string;
  decryptEnvVars: (
    encryptedData: string,
    key: string
  ) => Record<string, string>;
};

interface EncryptedEnv {
  ENCRYPTED_ENV: {
    iv: string;
    salt: string;
    encrypted: string;
  };
}

interface DecryptedEnv {
  DECRYPTED_ENV: {
    VITE_SUPABASE_URL: string;
    VITE_SUPABASE_ANON_KEY: string;
  };
  secureEnv: {
    decryptEnvVars: (
      encryptedEnv: EncryptedEnv["ENCRYPTED_ENV"],
      password: string
    ) => DecryptedEnv["DECRYPTED_ENV"];
  };
}

interface Window extends EncryptedEnv, DecryptedEnv {
  CryptoJS: {
    lib: {
      WordArray: {
        random: (bytes: number) => CryptoJS.lib.WordArray;
      };
    };
    enc: {
      Hex: {
        parse: (hexString: string) => CryptoJS.lib.WordArray;
      };
      Utf8: {
        stringify: (wordArray: CryptoJS.lib.WordArray) => string;
      };
    };
    PBKDF2: (
      password: string,
      salt: CryptoJS.lib.WordArray,
      options: { keySize: number; iterations: number }
    ) => CryptoJS.lib.WordArray;
    AES: {
      encrypt: (
        data: string,
        key: CryptoJS.lib.WordArray,
        options: {
          iv: CryptoJS.lib.WordArray;
          padding: CryptoJS.pad.Pkcs7;
          mode: CryptoJS.mode.CBC;
        }
      ) => CryptoJS.lib.WordArray;
      decrypt: (
        data: string,
        key: CryptoJS.lib.WordArray,
        options: {
          iv: CryptoJS.lib.WordArray;
          padding: CryptoJS.pad.Pkcs7;
          mode: CryptoJS.mode.CBC;
        }
      ) => CryptoJS.lib.WordArray;
    };
    pad: {
      Pkcs7: CryptoJS.pad.Pkcs7;
    };
    mode: {
      CBC: CryptoJS.mode.CBC;
    };
  };
}

declare namespace CryptoJS {
  namespace lib {
    class WordArray {
      words: number[];
      sigBytes: number;
      toString(encoder?: enc.Encoder): string;
      concat(wordArray: WordArray): WordArray;
      clamp(): void;
      clone(): WordArray;
      static random(nBytes: number): WordArray;
    }
  }
  namespace enc {
    interface Encoder {
      stringify(wordArray: lib.WordArray): string;
      parse(str: string): lib.WordArray;
    }
    const Hex: Encoder;
    const Utf8: Encoder;
  }
  namespace pad {
    class Pkcs7 {}
  }
  namespace mode {
    class CBC {}
  }
}

export {};
