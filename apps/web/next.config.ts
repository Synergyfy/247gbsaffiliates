import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    'http://localhost:3011',
    'http://192.168.1.67:3011',
    'http://192.168.1.67',
    'https://localhost:3011',
    'https://192.168.1.67:3011',
    'https://192.168.1.67',
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
