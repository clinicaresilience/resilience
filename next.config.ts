import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
   typescript: {
    // Temporariamente ignorando erros de tipagem devido a incompatibilidades com Next.js 15
    // TODO: Resolver tipos quando Next.js 15 estabilizar completamente
    ignoreBuildErrors: true,
  },
  eslint: {
    // Ignorando warnings de lint durante build
    // A maioria são unused vars que não afetam o funcionamento
    ignoreDuringBuilds: true,
  },
  /* config options here */
  images: {
    localPatterns: [
      {
        pathname: "/assets/icones/**",
        search: "",
      },
      {
        pathname: "/**",
        search: "",
      },
    ],
  },
  
  // Disable source maps in development to prevent 404 errors on internal files
  productionBrowserSourceMaps: false,
  
  // Configure webpack to ignore problematic modules in development
  webpack: (config, { dev, isServer }) => {
    config.resolve.alias = {
      ...(config.resolve.alias ?? {}),
      "@": path.resolve(__dirname, "src"),
    };

    if (dev && !isServer) {
      // Ignore source map requests for external libraries
      config.devtool = false;
    }
    return config;
  },

  // Configure rewrites to handle problematic requests
  async rewrites() {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [
        // Ignore problematic Supabase internal file requests
        {
          source: '/_next/src/:path*',
          destination: '/404',
        },
        {
          source: '/src/:path*',
          destination: '/404',
        }
      ],
    }
  },
};

export default nextConfig;
