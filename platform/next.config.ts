import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  // Enable fast compilation & minification
  swcMinify: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
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
