import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  swcMinify: true,
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
