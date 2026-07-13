import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Server mode (SSR) so docs render live from the CMS database.
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: {
    sri: { algorithm: "sha384" },
  },
};

export default nextConfig;
