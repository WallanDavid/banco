import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  async redirects() {
    return [
      {
        source: '/pipeline',
        destination: '/dashboard/pipeline',
        permanent: true,
      },
      {
        source: '/analytics',
        destination: '/dashboard/analytics',
        permanent: true,
      },
      {
        source: '/automations',
        destination: '/dashboard/automations',
        permanent: true,
      },
      {
        source: '/leads',
        destination: '/dashboard/leads',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
