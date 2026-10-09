import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { FeedbackDetail } from "./components/feedback/details/FeedbackDetail";
import { Layout } from "./components/layout/Layout";
import { Dashboard } from "./components/data-display/Dashboard";
import { Dates } from "./components/readout/dates/Dates";
import { DecryptionForm } from "./components/auth/DecryptionForm";
import { HOME } from "./components/readout/pages";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      retry: 1,
    },
  },
});

/** Sends an address with no page - or a retired one - on, keeping the week. */
function Redirect({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={{ pathname: to, search }} replace />;
}

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

  // Every page has its own address, so any of them can be opened, bookmarked
  // or shared directly; the footer and the number keys are just links to them.
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Redirect to={HOME} />} />
            <Route path="grid" element={<Dashboard layout="grid" />} />
            <Route path="ladder" element={<Dashboard layout="ladder" />} />
            <Route path="landing-weeks" element={<Dates view="weeks" />} />
            <Route path="owner-runway" element={<Dates view="runway" />} />
            <Route path="feedback/:id" element={<FeedbackDetail />} />
            {/* The Dates used to share one address between both views. */}
            <Route path="dates" element={<Redirect to="/landing-weeks" />} />
            <Route path="*" element={<Redirect to={HOME} />} />
          </Route>
        </Routes>
      </HashRouter>
    </QueryClientProvider>
  );
}

export default App;
