import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone 모드로 빌드 (Docker에 최적화)
  output: 'standalone',

  eslint: {
    ignoreDuringBuilds: true,
  },


  typescript: {
    ignoreBuildErrors: true,
  },
  
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
      // {
    //    source: '/oauth2/:path*',
    //    destination: 'http://localhost:8080/oauth2/:path*',
    //  },
    //  {
    //    source: '/login/oauth2/:path*',
    //    destination: 'http://localhost:8080/login/oauth2/:path*',
    //  }, 
    ];
  },
};

export default nextConfig;
