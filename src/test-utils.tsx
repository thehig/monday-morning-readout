import React from "react";
import { render as rtlRender } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter } from "react-router-dom";

// Create a custom render function that includes providers
function render(ui: React.ReactElement, { route = "/" } = {}) {
  window.history.pushState({}, "Test page", route);

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return {
    ...rtlRender(
      <QueryClientProvider client={queryClient}>
        <HashRouter>{ui}</HashRouter>
      </QueryClientProvider>
    ),
    queryClient,
  };
}

// Re-export everything
export * from "@testing-library/react";

// Override render method
export { render };
