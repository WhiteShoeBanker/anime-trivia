import type { NextConfig } from "next";

const isMobileBuild = process.env.CAPACITOR_BUILD === 'true';

const nextConfig: NextConfig = {
  ...(isMobileBuild
    ? { output: 'export' as const, images: { unoptimized: true } }
    : { images: {
        formats: ['image/webp', 'image/avif'],
        deviceSizes: [640, 750, 828, 1080, 1200],
        imageSizes: [16, 32, 48, 64, 96],
      } }),
};

export default nextConfig;
