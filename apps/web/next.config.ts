import type { NextConfig } from "next";

// Port is configurable via PORT in apps/web/.env.local (default 7089).
// allowedDevOrigins is derived from it so `pnpm dev` works after a port change.
const webPort = process.env.PORT ?? "7089";
const extraOrigins = (process.env.ALLOWED_DEV_ORIGINS ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    `http://localhost:${webPort}`,
    `http://127.0.0.1:${webPort}`,
    `https://localhost:${webPort}`,
    'http://localhost:3011', // legacy dev port, kept for backward compat
    'http://192.168.1.67:7089',
    'http://192.168.1.67',
    ...extraOrigins,
  ],
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
