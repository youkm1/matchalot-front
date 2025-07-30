import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone 모드로 빌드 (Docker에 최적화)
  //output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },

  typescript: {
    ignoreBuildErrors: true,
  },
  env: {
    API_BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.match-a-lot.store',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://api.match-a-lot.store/api/:path*',      
      },
     // {
     //   source: '/oauth2/:path*',
     //   destination: 'https://matchalot.duckdns.org/oauth2/:path*',
     // },
     // {
     //   source: '/login/oauth2/:path*',
     //  destination: 'https://matchalot.duckdns.org/login/oauth2/:path*',
     //  }, 
    ];
  },
};

export default nextConfig;
