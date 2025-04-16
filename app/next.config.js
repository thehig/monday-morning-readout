/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export", // Enable static HTML export
  images: {
    unoptimized: true, // Required for static export
  },
};

export default nextConfig;
