import { useState } from "react";
import "./App.css";

interface EncryptedEnv {
  ENCRYPTED_ENV: {
    iv: string;
    salt: string;
    encrypted: string;
  };
}

interface DecryptedEnv {
  DECRYPTED_ENV: Record<string, string>;
  secureEnv: {
    decryptEnvVars: (
      encryptedEnv: EncryptedEnv["ENCRYPTED_ENV"],
      password: string
    ) => Record<string, string>;
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

  const handleDecrypt = () => {
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

      setIsDecrypted(true);
      setError(null);
    } catch {
      console.error("Decryption failed in handleDecrypt");
      setError(
        "Failed to decrypt environment variables. Please check your password."
      );
      setIsDecrypted(false);
    }
  };

  const testConnection = async () => {
    try {
      const response = await fetch("/api/test-connection");
      if (!response.ok) {
        throw new Error("Connection test failed");
      }
      const data = await response.json();
      setConnectionStatus(data.message);
    } catch (err) {
      console.error("Connection test error:", err);
      setConnectionStatus("Connection test failed");
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

        {isDecrypted && (
          <>
            <button onClick={testConnection} className="decrypt-button">
              Test Connection
            </button>
            {connectionStatus && (
              <div className="connection-status">{connectionStatus}</div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default App;
