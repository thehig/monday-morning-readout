## Summary Checklist

- [ ] Set up `msw` handlers in `src/mocks/handlers.js`.
- [ ] Define handlers for required Supabase REST/RPC endpoints.
- [ ] Handle success and error responses in handlers.
- [ ] Set up `msw` server in `src/mocks/server.js`.
- [ ] Integrate `msw` server with Vitest in `src/setupTests.js` (or equivalent).
- [ ] Configure `onUnhandledRequest: 'error'` in `server.listen`.
- [ ] Write integration tests for components/functions using Supabase.
- [ ] Use `server.use()` for test-specific mock overrides.
- [ ] Use testing library async utilities (`waitFor`, `findBy*`).

---

## Detailed Instructions: Testing Supabase Interactions with `msw`

**Objective:** Implement integration tests for components or utility functions that interact with the Supabase database. These tests should use Mock Service Worker (`msw`) to intercept HTTP requests made by the `@supabase/supabase-js` client and return predefined mock responses, thus avoiding actual database calls during testing.

**Core Tooling:**

- **Vitest:** Test runner (already configured).
- **`msw`:** API mocking library (already in `devDependencies`).
- **`@supabase/supabase-js`:** The client library whose requests we need to intercept.

**Steps:**

1.  **Set up `msw` Handlers:**

    - Create a directory for mocks, e.g., `src/mocks`.
    - Inside `src/mocks`, create a file for request handlers, e.g., `handlers.js`.
    - In `handlers.js`, import `http` and `HttpResponse` (or `res`, `ctx` from older `msw` versions if applicable) from `msw`.
    - Define handler functions for Supabase endpoints you need to mock. Remember that `@supabase/supabase-js` interacts with Supabase via its REST API (for tables/views) and RPC endpoints.

      - **Identify Supabase URLs:** Determine the exact URL patterns used by the Supabase client for the operations you want to test (e.g., `select`, `insert`, `update`, `rpc`). You can find these using browser dev tools when running your app or checking Supabase documentation. They typically look like:
        - `/rest/v1/your_table_name` (for table operations)
        - `/rest/v1/rpc/your_function_name` (for RPC calls)
        - `/auth/v1/...` (for auth operations, if needed)
      - **Intercept Base URL:** Your handlers should intercept requests matching your Supabase project URL (from `VITE_SUPABASE_URL`). Store this base URL securely or retrieve it from config for the handlers.
      - **Example Handler (Select from 'profiles'):**

        ```javascript
        import { http, HttpResponse } from "msw";

        const SUPABASE_URL = "https://your-project-ref.supabase.co"; // Replace or import securely

        export const handlers = [
          // Mock GET /rest/v1/profiles?select=*
          http.get(`${SUPABASE_URL}/rest/v1/profiles`, ({ request }) => {
            const url = new URL(request.url);
            // Check for specific query params if needed (e.g., select, eq)
            if (url.searchParams.get("select") === "*") {
              // Return mock data
              const mockProfiles = [
                {
                  id: "uuid-1",
                  username: "mockuser1",
                  updated_at: new Date().toISOString(),
                },
                {
                  id: "uuid-2",
                  username: "mockuser2",
                  updated_at: new Date().toISOString(),
                },
              ];
              return HttpResponse.json(mockProfiles);
            }
            // If query params don't match, potentially let request pass or return error
            // For strict mocking, you might want to return an error if unhandled
            return new HttpResponse("Unhandled Supabase profiles query", {
              status: 500,
            });
          }),

          // Mock POST /rest/v1/rpc/update_status
          http.post(
            `${SUPABASE_URL}/rest/v1/rpc/update_status`,
            async ({ request }) => {
              const body = await request.json();
              console.log("Mock RPC update_status called with:", body);
              // Simulate successful RPC call with no return value needed
              return new HttpResponse(null, { status: 204 });
            }
          ),

          // Add more handlers for other tables, RPCs, inserts, updates, auth etc.
        ];
        ```

      - **Handle Errors:** Create handlers that return error responses (e.g., `HttpResponse.json({ message: 'Not found' }, { status: 404 })`) to test how your components handle Supabase errors.

2.  **Set up `msw` Server for Tests:**

    - In `src/mocks`, create a file `server.js`.
    - Import `setupServer` from `msw/node` and your handlers from `./handlers.js`.
    - Create and export the server instance:

      ```javascript
      import { setupServer } from "msw/node";
      import { handlers } from "./handlers";

      export const server = setupServer(...handlers);
      ```

3.  **Integrate `msw` Server with Vitest:**

    - Create a test setup file if you don't have one (e.g., `src/setupTests.js`).
    - Configure Vitest (in `vitest.config.js` or similar) to run this setup file using the `setupFiles` option.
    - In the setup file (`src/setupTests.js`), import the `server` from `src/mocks/server.js`.
    - Use Vitest's lifecycle hooks (`beforeAll`, `afterEach`, `afterAll`) to manage the server:

      ```javascript
      // src/setupTests.js
      import { beforeAll, afterEach, afterAll } from "vitest";
      import { server } from "./mocks/server";
      // Optional: If you use @testing-library/react
      // import '@testing-library/jest-dom';

      // Start server before all tests
      beforeAll(() => server.listen({ onUnhandledRequest: "error" })); // Use 'warn' or 'bypass' if needed initially

      // Reset handlers after each test
      afterEach(() => server.resetHandlers());

      // Clean up after tests are finished
      afterAll(() => server.close());
      ```

    - **`onUnhandledRequest: 'error'`:** This is crucial. It makes tests fail if your code makes an HTTP request that you haven't explicitly mocked a handler for, preventing accidental real API calls.

4.  **Write Integration Test Files:**

    - Create test files (e.g., `src/components/ProfileList.test.js`) for components/functions that use the Supabase client.
    - Import `React`, testing utilities (`render`, `screen`, `waitFor` from `@testing-library/react`), Vitest functions (`describe`, `it`, `expect`), the component under test, and the `server` from `src/mocks/server`. You might also need `http`, `HttpResponse` from `msw` if defining test-specific handlers.
    - **Test Structure:**

      ```javascript
      import React from "react";
      import { render, screen, waitFor } from "@testing-library/react";
      import { describe, it, expect } from "vitest";
      import ProfileList from "./ProfileList"; // Component using Supabase
      import { server } from "../mocks/server";
      import { http, HttpResponse } from "msw";

      // Base Supabase URL used in handlers
      const SUPABASE_URL = "https://your-project-ref.supabase.co";

      describe("ProfileList Component", () => {
        it("should fetch and display profiles successfully", async () => {
          // Optional: Define specific mock for this test if needed (overrides setup)
          // server.use(
          //   http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
          //     return HttpResponse.json([{ id: 'test-id', username: 'testuser' }]);
          //   })
          // );

          render(<ProfileList />);

          // Wait for the component to finish loading and display data
          // Check for text content based on the mock data defined in handlers.js
          await waitFor(() => {
            expect(screen.getByText("mockuser1")).toBeInTheDocument();
            expect(screen.getByText("mockuser2")).toBeInTheDocument();
          });

          // Add more assertions as needed
        });

        it("should display an error message if profile fetch fails", async () => {
          // Override the default handler to return an error for this specific test
          server.use(
            http.get(`${SUPABASE_URL}/rest/v1/profiles`, () => {
              return new HttpResponse(null, {
                status: 500,
                statusText: "Server Error",
              });
            })
          );

          render(<ProfileList />);

          // Wait for and assert that an error message is shown
          await waitFor(() => {
            expect(
              screen.getByText(/failed to fetch profiles/i)
            ).toBeInTheDocument();
          });
        });
      });
      ```

    - **Key Points:**
      - Use the _actual_ Supabase client instance within your component/function. `msw` intercepts the underlying `fetch` calls.
      - Use `server.use()` within a specific test if you need a different mock response than the default defined in `handlers.js`. Remember `msw` handlers are reset after each test by the `afterEach` hook in `setupTests.js`.
      - Use testing library utilities (`waitFor`, `findBy*`) to handle asynchronous operations like data fetching.
      - Assert based on the _expected outcome_ given the _mocked_ data or error.
