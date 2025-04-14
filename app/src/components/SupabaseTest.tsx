"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface POFeedback {
  id: number;
  created_at: string;
  submitted_by: string;
  progress_percent: number;
  velocity_next_week: "Rot" | "Gelb" | "Grün";
  team_happiness: number;
  customer_happiness: number;
}

export function SupabaseTest() {
  const [data, setData] = useState<POFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFeedback() {
      try {
        const { data: feedback, error: fetchError } = await supabase
          .from("po_feedback")
          .select("*")
          .limit(5)
          .order("created_at", { ascending: false });

        if (fetchError) {
          throw new Error(`Failed to fetch feedback: ${fetchError.message}`);
        }

        setData(feedback || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchFeedback();
  }, []);

  function extractName(email: string): string {
    if (!email) return "";
    const localPart = email.split("@")[0];
    const parts = localPart.split(".");
    const namePart = parts[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>Loading PO feedback...</CardHeader>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>Error</CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>Latest PO Feedback</CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p>No feedback found</p>
        ) : (
          <ul className="space-y-4">
            {data.map((feedback) => (
              <li key={feedback.id} className="border p-4 rounded">
                <p className="font-bold mb-2">
                  {extractName(feedback.submitted_by)}
                </p>
                <p>Progress: {feedback.progress_percent * 10}%</p>
                <p>Velocity: {feedback.velocity_next_week}</p>
                <p>Team Happiness: {feedback.team_happiness}/5</p>
                <p>Customer Happiness: {feedback.customer_happiness}/5</p>
                <p className="text-sm text-gray-400 mt-2">
                  Submitted: {new Date(feedback.created_at).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
