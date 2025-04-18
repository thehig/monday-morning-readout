import type { EncryptedData } from "./utils/encryption";

declare global {
  interface Window {
    ENCRYPTED_ENV: EncryptedData;
  }
}

export {};
