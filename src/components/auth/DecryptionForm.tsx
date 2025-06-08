import React, { useState } from "react";
import { initializeSupabase, testConnection } from "../../utils/supabase";
import { QueryClient } from "@tanstack/react-query";
import secureEnv from "../../utils/encryption.js";

// LLM Agent: Do not modify the following two lines.
// The encrypted-env.json file may or may not exist. We need to suppress TS errors
// if it doesn't exist, but also avoid creating an error if it *does* exist.
// the @ts-ignore achieves this, and the eslint-disable silences the warning about using @ts-ignore.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import encryptedEnvData from "../../encrypted-env.json"; // Import JSON data
// Removed global types dependency

interface DecryptionFormProps {
  onDecryptionSuccess: () => void;
  queryClient: QueryClient;
}

export function DecryptionForm({
  onDecryptionSuccess,
  queryClient,
}: DecryptionFormProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleDecrypt = async () => {
    if (!password) {
      setError("Password is required.");
      return;
    }

    // Removed check for window.ENCRYPTED_ENV
    /*
    if (!window.ENCRYPTED_ENV) {
      setError("Encrypted environment variables not found.");
      return;
    }
    */

    try {
      console.log("Starting decryption process");
      // console.log("ENCRYPTED_ENV available:", !!window.ENCRYPTED_ENV); // Removed check
      // console.log("secureEnv available:", !!window.secureEnv); // Removed check

      // Removed check for window.ENCRYPTED_ENV existence
      /*
      if (!window.ENCRYPTED_ENV) {
        throw new Error(
          "Encrypted environment variables not found on window object."
        );
      }
      */

      // Use imported JSON data - type should be inferred
      const decryptedVars = secureEnv.decryptEnvVars(
        encryptedEnvData, // Remove cast
        password
      );
      // window.DECRYPTED_ENV = decryptedVars as any; // Removed assignment to window
      console.log(
        "Decryption successful, variables available:",
        Object.keys(decryptedVars).join(", ")
      );

      initializeSupabase(
        decryptedVars.VITE_SUPABASE_URL,
        decryptedVars.VITE_SUPABASE_ANON_KEY
      );
      console.log("Supabase client initialized, testing connection...");

      const result = await testConnection();
      if (result.success) {
        console.log(`Connected to Supabase! Server time: ${result.timestamp}`);
        await queryClient.invalidateQueries({ queryKey: ["po-feedback"] });
        onDecryptionSuccess();
      } else {
        console.error(`Failed to connect: ${result.error}`);
        setError("Failed to connect to database. Please try again.");
      }
    } catch (err) {
      console.error("Decryption or connection failed:", err);
      setError(
        "Failed to decrypt environment variables. Please check your password."
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-gray-900">
            United Signals
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your password to decrypt environment variables
          </p>
        </div>
        <div className="space-y-4">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm font-medium"
            placeholder="Password"
            onKeyPress={(e) => e.key === "Enter" && handleDecrypt()}
          />
          {error && (
            <div className="text-red-500 text-sm text-center font-medium">
              {error}
            </div>
          )}
          <button
            onClick={handleDecrypt}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Decrypt
          </button>
        </div>
      </div>
    </div>
  );
}
