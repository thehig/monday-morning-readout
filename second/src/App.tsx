import { useState } from "react";
import "./App.css";
import { initializeSupabase, testConnection } from "./utils/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePOFeedbackByWeek, getCurrentWeek } from "./hooks/use-po-feedback";
import type { Database } from "./types/supabase";

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

type POFeedback = Database["public"]["Tables"]["po_feedback"]["Row"];

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function AppContent() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<string | null>(null);
  const [currentWeek, setCurrentWeek] = useState(getCurrentWeek());

  const { data: weeklyFeedback, isLoading } = usePOFeedbackByWeek(currentWeek);

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

  if (!isDecrypted) {
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

  return (
    <div className="container">
      <h1>PO Feedback - Week {currentWeek}</h1>
      <div className="week-navigation">
        <button
          onClick={() => setCurrentWeek((prev) => Math.max(1, prev - 1))}
          disabled={currentWeek <= 1}
        >
          Previous Week
        </button>
        <span>Week {currentWeek}</span>
        <button
          onClick={() => setCurrentWeek((prev) => prev + 1)}
          disabled={currentWeek >= 52}
        >
          Next Week
        </button>
      </div>

      {isLoading ? (
        <div>Loading feedback data...</div>
      ) : weeklyFeedback && weeklyFeedback.length > 0 ? (
        <div className="feedback-grid">
          {weeklyFeedback.map((feedback: POFeedback) => (
            <div key={feedback.id} className="feedback-card">
              <h3>{feedback.submitted_by}</h3>
              <p>Progress: {feedback.progress_percent}%</p>
              <p>Team Happiness: {feedback.team_happiness}/10</p>
              <p>Customer Happiness: {feedback.customer_happiness}/10</p>
              <p>Velocity Next Week: {feedback.velocity_next_week}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>No feedback found for week {currentWeek}</div>
      )}
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}

export default App;
