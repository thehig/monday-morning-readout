import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for better development experience
  reactStrictMode: true,

  // Enable static HTML export
  output: "export",

  // Repository base path for GitHub Pages deployment
  basePath:
    process.env.GITHUB_PAGES === "true" ? "/monday-morning-readout" : "",

  // Optimize imports from heavy libraries
  experimental: {
    optimizePackageImports: ["@heroicons/react"],
  },
};

export default nextConfig;
