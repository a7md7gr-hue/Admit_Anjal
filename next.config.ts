import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // Force static generation for all pages
  output: 'standalone',
};

export default nextConfig;
