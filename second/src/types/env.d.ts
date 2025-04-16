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
        random: (bytes: number) => any;
      };
    };
    enc: {
      Hex: {
        parse: (hexString: string) => any;
      };
      Utf8: {
        stringify: (wordArray: any) => string;
      };
    };
    PBKDF2: (
      password: string,
      salt: any,
      options: { keySize: number; iterations: number }
    ) => any;
    AES: {
      encrypt: (
        data: string,
        key: any,
        options: { iv: any; padding: any; mode: any }
      ) => any;
      decrypt: (
        data: string,
        key: any,
        options: { iv: any; padding: any; mode: any }
      ) => any;
    };
    pad: {
      Pkcs7: any;
    };
    mode: {
      CBC: any;
    };
  };
}

export {};
