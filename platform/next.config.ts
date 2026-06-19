import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: '/lab/dashboard',
        destination: '/lab',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
