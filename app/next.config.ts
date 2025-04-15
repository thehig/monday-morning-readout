import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Ensure basePath is set to your repository name in production
  basePath:
    process.env.NODE_ENV === "production" ? "/monday-morning-readout" : "",
  // Disable image optimization since it's not supported in static exports
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
