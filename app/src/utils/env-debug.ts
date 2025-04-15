export function debugEnvironmentVariables() {
  // Only run in development or when explicitly enabled
  if (
    process.env.NODE_ENV === "development" ||
    process.env.DEBUG_ENV === "true"
  ) {
    console.group("🔍 Environment Variables Debug");
    console.log("NODE_ENV:", process.env.NODE_ENV);

    // List all NEXT_PUBLIC_ environment variables
    Object.keys(process.env).forEach((key) => {
      if (key.startsWith("NEXT_PUBLIC_")) {
        console.log(`${key}:`, process.env[key]);
      }
    });

    // List expected environment variables (add your required env vars here)
    const expectedVars = [
      "NEXT_PUBLIC_SUPABASE_URL",
      "NEXT_PUBLIC_SUPABASE_ANON_KEY",
    ];

    console.log("\n📋 Environment Variables Check:");
    expectedVars.forEach((key) => {
      const value = process.env[key];
      console.log(
        `${key}: ${value ? "✅ Set" : "❌ Missing"} ${
          value ? `(${value.substring(0, 10)}...)` : ""
        }`
      );
    });

    console.groupEnd();
  }
}
