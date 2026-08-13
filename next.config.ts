import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "https://4hpb44dx-3000.inc1.devtunnels.ms",
  ],
  reactStrictMode: false,
};

export default nextConfig;
