import { useState } from "react";
import "./styles/components/App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import { FeedbackDetail } from "./components/feedback/details/FeedbackDetail";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./components/data-display/Dashboard";
import { DecryptionForm } from "./components/auth/DecryptionForm";

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

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

function App() {
  const [isDecrypted, setIsDecrypted] = useState(false);

  if (!isDecrypted) {
    return (
      <QueryClientProvider client={queryClient}>
        <DecryptionForm
          onDecryptionSuccess={() => setIsDecrypted(true)}
          queryClient={queryClient}
        />
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="feedback/:id" element={<FeedbackDetail />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
