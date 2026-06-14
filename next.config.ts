import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // simple-icons 사용한 아이콘만 번들되도록 import 최적화
    optimizePackageImports: ["simple-icons"],
  },
};

export default nextConfig;
