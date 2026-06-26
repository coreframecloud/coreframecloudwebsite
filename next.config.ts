import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/d5-render",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
