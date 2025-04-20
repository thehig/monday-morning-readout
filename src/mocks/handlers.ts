import { http, HttpResponse } from "msw";

// Your Supabase project URL
const SUPABASE_URL = "https://kkkshnlgyqodxnclrnon.supabase.co";

export const handlers = [
  // Mocking GET /rest/v1/po_feedback?select=created_at&limit=1
  http.get(`${SUPABASE_URL}/rest/v1/po_feedback`, ({ request }) => {
    const url = new URL(request.url);

    // Check for the specific parameters used in testConnection
    if (
      url.searchParams.get("select") === "created_at" &&
      url.searchParams.get("limit") === "1"
    ) {
      // Return a mock response matching the expected structure
      const mockData = [
        {
          created_at: new Date().toISOString(), // Use a dynamic timestamp
        },
      ];
      return HttpResponse.json(mockData);
    }

    // IMPORTANT: If the request doesn't match the specific parameters,
    // return an error or a different response to avoid unintended matches.
    // Since onUnhandledRequest is 'error', unhandled requests will cause test failure.
    // However, explicitly handling non-matching params can be clearer.
    console.warn(
      `MSW: Unhandled GET ${request.url}. Did you forget to mock this specific query?`
    );
    // Returning a generic error for non-specifically handled requests to this endpoint
    return new HttpResponse(
      JSON.stringify({ message: "MSW: Unhandled query parameters" }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }),

  // Add more handlers for other Supabase operations here
];
