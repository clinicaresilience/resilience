import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
