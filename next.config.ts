import type { NextConfig } from "next";

const isMobileBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  ...(isMobileBuild && {
    output: 'export',
    images: {
      unoptimized: true,
    },
  }),
};

export default nextConfig;
