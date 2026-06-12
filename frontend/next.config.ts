import type { NextConfig } from "next";

// In Docker the backend is reachable via the service name "backend" on port 8081.
// Locally it's still localhost:8081. Use the env var to switch.
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL ?? "http://localhost:8081";

const nextConfig: NextConfig = {
  // Required for the slim Docker "standalone" runner (node server.js)
  output: process.env.DOCKER_BUILD === "true" ? "standalone" : undefined,

  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'logos-world.net' },
      { protocol: 'http',  hostname: 'localhost',  port: '8081' },
      { protocol: 'http',  hostname: 'backend' },   // Docker service name
      // Allow any private-network IP for same-WiFi mobile testing
      { protocol: 'http',  hostname: '192.168.*' },
      { protocol: 'http',  hostname: '10.*' },
      { protocol: 'http',  hostname: '172.*' },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${BACKEND_URL}/api/:path*`,
      },
      {
        source: '/oauth2/:path*',
        destination: `${BACKEND_URL}/oauth2/:path*`,
      },
      {
        source: '/login/oauth2/:path*',
        destination: `${BACKEND_URL}/login/oauth2/:path*`,
      },
    ];
  },
};

export default nextConfig;