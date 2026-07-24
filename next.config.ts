import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: ["http://localhost:3000", "10.94.0.87", "192.168.100.99"],
  reactStrictMode: false,
};

export default nextConfig;
