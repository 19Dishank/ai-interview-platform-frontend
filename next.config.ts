import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    "http://localhost:3000",
    "10.94.0.87",
    "192.168.100.99",
    "http://192.168.100.99:3000",
  ],
  reactStrictMode: false,
  async redirects() {
    return [
      {
        source: "/candidate/profile",
        destination: "/candidate/profile/build",
        permanent: false,
      },
      {
        source: "/candidate/onboarding",
        destination: "/candidate/profile/build",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
