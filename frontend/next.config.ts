import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async redirects() {
    return [
      {
        source: "/proposal/create",
        destination: "/proposal-create",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
