import { useState } from "react";
import { initializeSupabase, testConnection } from "../../utils/supabase";
import { QueryClient } from "@tanstack/react-query";

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
    try {
      console.log("Starting decryption process");
      console.log("ENCRYPTED_ENV available:", !!window.ENCRYPTED_ENV);
      console.log("secureEnv available:", !!window.secureEnv);

      const decryptedVars = window.secureEnv.decryptEnvVars(
        window.ENCRYPTED_ENV,
        password
      );
      window.DECRYPTED_ENV = decryptedVars;
      console.log(
        "Decryption successful, variables available:",
        Object.keys(decryptedVars)
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
            className="appearance-none rounded relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="Password"
            onKeyPress={(e) => e.key === "Enter" && handleDecrypt()}
          />
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
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
