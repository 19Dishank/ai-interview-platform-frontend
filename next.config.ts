import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:3000",
    "https://w2r81bm2-5173.inc1.devtunnels.ms",
    "*.inc1.devtunnels.ms",
    "*.devtunnels.ms",
  ],
  async rewrites() {
    return [
      {
        source: "/ws/interview",
        destination: "http://localhost:3000/ws/interview",
      },
      {
        source: "/ws/interview/:path*",
        destination: "http://localhost:3000/ws/interview/:path*",
      },
    ];
  },
  reactStrictMode: false,
};

export default nextConfig;
