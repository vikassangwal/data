import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
