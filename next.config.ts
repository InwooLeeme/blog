import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // simple-icons 사용한 아이콘만 번들되도록 import 최적화
    optimizePackageImports: ["simple-icons"],
  },
  async redirects() {
    return [
      // 헤더 라벨이 "Profile"이라 실제 경로(/about)를 추측해 들어오는 경우를 위한 안전망
      { source: "/profile", destination: "/about", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "inwooleeme.github.io",
        pathname: "/assets/**",
      },
    ],
  },
};

export default nextConfig;
