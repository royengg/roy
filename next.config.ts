import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Keep the higher-fidelity variant used by the project previews available
    // in Next 16 (which otherwise coerces every request back to quality 75).
    qualities: [75, 92, 100],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.scdn.co",
        pathname: "/image/**",
      },
    ],
  },
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "100.112.188.54",
    "ai-agent-vps.tail366850.ts.net",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
