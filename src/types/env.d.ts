interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

interface Window {
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
