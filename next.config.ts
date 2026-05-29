import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  output: 'standalone',
  // Fix workspace root issue and module resolution
  turbopack: {
    root: path.dirname(__filename),
  },
  // Ensure proper module resolution
  transpilePackages: [],
  // Fix workspace issues
  experimental: {
    // Add any experimental features if needed
  },
  // OAuth proxy configuration
  async rewrites() {
    const API_URL =
      process.env.NEXT_PUBLIC_SERVER_LOCAL_URL || "http://localhost:3001";

    return [
      {
        source: "/api/auth/google",
        destination: `${API_URL}/auth/google`,
      },
      {
        source: "/api/auth/google/callback",
        destination: `${API_URL}/auth/google/callback`,
      },
      {
        source: "/api/auth/linkedin",
        destination: `${API_URL}/auth/linkedin`,
      },
      {
        source: "/api/auth/linkedin/callback",
        destination: `${API_URL}/auth/linkedin/callback`,
      },
    ];
  },
  // Ensure proper working directory
  webpack: (config, { dev, isServer }) => {
    // Fix module resolution
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, "src"),
    };
    return config;
  },
};

export default nextConfig;
