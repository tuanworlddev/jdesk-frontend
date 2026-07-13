import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: { unoptimized: true },
  poweredByHeader: false,
  experimental: {
    sri: { algorithm: "sha384" },
  },
};

export default nextConfig;
