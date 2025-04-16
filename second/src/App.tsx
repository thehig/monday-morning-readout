import { useState } from "react";
import "./App.css";
import { initializeSupabase, testConnection } from "./utils/supabase";

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

declare global {
  interface Window extends EncryptedEnv, DecryptedEnv {}
}

function App() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);

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

      // Initialize Supabase with decrypted credentials
      initializeSupabase(
        decryptedVars.VITE_SUPABASE_URL,
        decryptedVars.VITE_SUPABASE_ANON_KEY
      );
      console.log("Supabase client initialized, testing connection...");

      const result = await testConnection();
      if (result.success) {
        setConnectionStatus(
          `Connected to Supabase! Server time: ${result.timestamp}`
        );
      } else {
        setConnectionStatus(`Failed to connect: ${result.error}`);
      }

      setIsDecrypted(true);
      setError(null);
    } catch (err) {
      console.error("Decryption or connection failed:", err);
      setError(
        "Failed to decrypt environment variables. Please check your password."
      );
      setIsDecrypted(false);
      setConnectionStatus(null);
    }
  };

  return (
    <div className="container">
      <h1>Environment Variable Decryption</h1>

      <div className="decrypt-form">
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter decryption password"
          className="password-input"
        />
        <button onClick={handleDecrypt} className="decrypt-button">
          Decrypt Environment Variables
        </button>
        {error && <div className="error-message">{error}</div>}
      </div>

      <div className="status-container">
        {isDecrypted && (
          <div className="success-message">
            Environment variables have been successfully decrypted!
          </div>
        )}

        {connectionStatus && (
          <div
            className={`connection-status ${
              connectionStatus.includes("Failed") ? "error" : "success"
            }`}
          >
            {connectionStatus}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
