import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Improve build stability and vendor chunk handling
  experimental: {
    optimizePackageImports: ["@radix-ui/react-icons", "@radix-ui/react-slot"]
  },
  
  // Better handling of external libraries
  transpilePackages: [
    "@radix-ui/react-icons", 
    "@radix-ui/react-slot",
    "@radix-ui/react-separator",
    "@radix-ui/react-tabs",
    "@radix-ui/react-progress"
  ],

  // Add empty turbopack config to use turbopack
  turbopack: {},
}

export default nextConfig;
