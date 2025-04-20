## Summary Checklist

- [x] Set up `msw` handlers in `src/mocks/handlers.ts`.
- [x] Define handlers for required Supabase REST/RPC endpoints. (Handler for `testConnection` GET added)
- [x] Handle success and error responses in handlers. (Done for `testConnection` handler)
- [x] Set up `msw` server integration. (Consolidated into `vitest.setup.ts`)
- [x] Integrate `msw` server with Vitest in `vitest.setup.ts`.
- [x] Configure `onUnhandledRequest: 'error'` in `server.listen`.
- [x] Write integration tests for **utility functions** using Supabase. (`supabase.ts` tested)
- [x] Use `server.use()` for test-specific mock overrides. (Done in `testConnection` error test)
- [ ] Use testing library async utilities (`waitFor`, `findBy*`). (Needed for **component** tests)

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
    - Import `setupServer` from `msw`.
    - Create a server instance and use the handlers defined in `handlers.js`.

      ```javascript
      import { setupServer } from "msw/node";

      const server = setupServer(...handlers);

      beforeAll(() => {
        server.listen();
      });

      afterAll(() => {
        server.close();
      });
      ```

3.  **Write Integration Tests:**

    - Use `msw` to intercept requests and return predefined responses.
    - Write tests for utility functions using Supabase.
    - Use `server.use()` to override responses for test-specific scenarios.
    - Use testing library async utilities (`waitFor`, `findBy*`) for component tests.

      ```javascript
      import { waitFor } from "msw";

      test("Test utility function", async () => {
        // Arrange
        const expectedResponse = { data: "expected data" };

        // Act
        const response = await fetch("/api/utility-function");
        const actualResponse = await response.json();

        // Assert
        expect(actualResponse).toEqual(expectedResponse);
      });

      test("Test component", async () => {
        // Arrange
        const expectedResponse = { data: "expected data" };

        // Act
        const component = render(<ComponentToTest />);
        const actualResponse = await waitFor(() =>
          component.getByText("expected data")
        );

        // Assert
        expect(actualResponse).toBeInTheDocument();
      });
      ```
