import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
