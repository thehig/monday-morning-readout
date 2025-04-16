import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  // Ensure basePath is set to your repository name in production
  basePath:
    process.env.NODE_ENV === "production" ? "/monday-morning-readout" : "",
  // Configure static asset handling
  images: {
    unoptimized: true,
    domains: ["localhost"],
  },
  // Force static rendering
  reactStrictMode: true,
  trailingSlash: true,
  // Ensure all assets are included in the export
  assetPrefix: "",
  // Configure static file serving
  experimental: {
    optimizeCss: true,
    optimizePackageImports: [
      "@heroicons/react",
      "@radix-ui/react-dialog",
      "@radix-ui/react-slot",
      "@radix-ui/react-tabs",
    ],
  },
  // Ensure fonts are properly handled
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(woff|woff2|eot|ttf|otf)$/,
      type: "asset/resource",
      generator: {
        filename: "static/media/[name][ext]",
      },
    });
    return config;
  },
};

export default nextConfig;
