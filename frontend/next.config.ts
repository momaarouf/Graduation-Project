import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
      { protocol: 'https', hostname: 'logos-world.net' },
      { protocol: 'http',  hostname: 'localhost',  port: '8081' },
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
        destination: 'http://localhost:8081/api/:path*',
      },
      {
        source: '/oauth2/:path*',
        destination: 'http://localhost:8081/oauth2/:path*',
      },
      {
        source: '/login/oauth2/:path*',
        destination: 'http://localhost:8081/login/oauth2/:path*',
      },
    ];
  },
};

export default nextConfig;