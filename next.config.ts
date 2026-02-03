import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable standalone mode for Docker deployment
  output: "standalone",

  // Environment variables available on client
  env: {
    APP_VERSION: "0.1.0",
  },
};

export default nextConfig;
