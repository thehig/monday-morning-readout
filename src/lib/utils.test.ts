import { formatEmailDisplayName } from "./utils";

describe("formatEmailDisplayName", () => {
  it("formats email display name correctly", () => {
    expect(formatEmailDisplayName("john.doe@example.com")).toBe("John Doe");
    expect(formatEmailDisplayName("jane_smith@example.com")).toBe("Jane Smith");
    expect(formatEmailDisplayName("test-user@example.com")).toBe("Test User");
  });
});
