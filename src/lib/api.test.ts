import { http, HttpResponse } from "msw";
import { server } from "../../vitest.setup";

describe("API Mocking", () => {
  it("successfully mocks an API request", async () => {
    const response = await fetch("/api/example");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual({ message: "Hello from MSW!" });
  });

  it("can override handlers for specific tests", async () => {
    // Override the handler just for this test
    server.use(
      http.get("/api/example", () => {
        return HttpResponse.json({ message: "Custom Response" });
      })
    );

    const response = await fetch("/api/example");
    const data = await response.json();

    expect(response.ok).toBe(true);
    expect(data).toEqual({ message: "Custom Response" });
  });
});
