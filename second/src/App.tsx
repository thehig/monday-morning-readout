import { useEffect } from "react";
import "./App.css";
import { supabase, checkSupabaseConnection } from "./lib/supabase";

function App() {
  useEffect(() => {
    // Test Supabase connection
    async function testConnection() {
      console.log("Testing Supabase connection...");
      const isConnected = await checkSupabaseConnection();
      console.log("Supabase connection status:", isConnected);

      // Try to fetch some data
      const { data, error } = await supabase
        .from("po_feedback")
        .select("*")
        .limit(1);

      console.log("Supabase test query result:", { data, error });
    }

    testConnection();
  }, []);

  return (
    <div>
      <h1>Monday Morning Readout</h1>
      <p>Check console for Supabase connection status</p>
    </div>
  );
}

export default App;
