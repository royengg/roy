import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: [
    "127.0.0.1",
    "localhost",
    "100.112.188.54",
    "ai-agent-vps.tail366850.ts.net",
    "*.trycloudflare.com",
  ],
};

export default nextConfig;
