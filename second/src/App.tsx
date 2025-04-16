import { useState, useEffect } from "react";
import "./App.css";
import { initializeSupabase, testConnection } from "./utils/supabase";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePOFeedbackByWeek, getCurrentWeek } from "./hooks/use-po-feedback";
import type { Database } from "./types/supabase";
import { WeekPicker } from "./components/WeekPicker";
import {
  HashRouter,
  Routes,
  Route,
  Link,
  useSearchParams,
} from "react-router-dom";
import { FeedbackDetail } from "./components/feedback/FeedbackDetail";

// Extend Window interface to include our custom properties
declare global {
  interface Window {
    ENCRYPTED_ENV: string;
    DECRYPTED_ENV: Record<string, string>;
    secureEnv: {
      decryptEnvVars: (
        encrypted: string,
        password: string
      ) => Record<string, string>;
    };
  }
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
  const [searchParams, setSearchParams] = useSearchParams();

  // Get week from URL or default to current week
  const weekParam = searchParams.get("week");
  const [currentWeek, setCurrentWeek] = useState(
    weekParam ? parseInt(weekParam) : getCurrentWeek(new Date().getFullYear())
  );

  // Update URL when week changes
  useEffect(() => {
    setSearchParams({ week: currentWeek.toString() });
  }, [currentWeek, setSearchParams]);

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
        console.log(`Connected to Supabase! Server time: ${result.timestamp}`);
      } else {
        console.error(`Failed to connect: ${result.error}`);
      }

      setIsDecrypted(true);
      setError(null);
    } catch (err) {
      console.error("Decryption or connection failed:", err);
      setError(
        "Failed to decrypt environment variables. Please check your password."
      );
      setIsDecrypted(false);
    }
  };

  if (!isDecrypted) {
    return (
      <div className="container">
        <h1>Monday Morning Readout</h1>
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
      </div>
    );
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            to={`/?week=${currentWeek}`}
            className="text-2xl font-bold hover:text-primary"
          >
            Monday Morning Readout
          </Link>
          <WeekPicker currentWeek={currentWeek} onWeekChange={setCurrentWeek} />
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <Routes>
          <Route
            path="/"
            element={
              <div className="container mx-auto p-4">
                {isLoading ? (
                  <div className="text-center text-gray-600">
                    Loading feedback data...
                  </div>
                ) : weeklyFeedback && weeklyFeedback.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {weeklyFeedback.map((feedback: POFeedback) => (
                      <Link
                        key={feedback.id}
                        to={`/feedback/${feedback.id}?week=${currentWeek}`}
                        className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
                      >
                        <h3 className="font-medium mb-2">
                          {feedback.submitted_by}
                        </h3>
                        <p className="text-sm text-gray-600">
                          Progress: {feedback.progress_percent}%
                        </p>
                        <p className="text-sm text-gray-600">
                          Team Happiness: {feedback.team_happiness}/10
                        </p>
                        <p className="text-sm text-gray-600">
                          Customer Happiness: {feedback.customer_happiness}/10
                        </p>
                        <p className="text-sm text-gray-600">
                          Velocity Next Week: {feedback.velocity_next_week}
                        </p>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center text-gray-600">
                    No feedback found for week {currentWeek}
                  </div>
                )}
              </div>
            }
          />
          <Route path="/feedback/:id" element={<FeedbackDetail />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <AppContent />
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
