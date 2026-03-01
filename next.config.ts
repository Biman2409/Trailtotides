import type { NextConfig } from "next";
import path from "node:path";

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        "https://*.orchids.cloud",
        "https://*.orchids.app",
        "https://*.proxy.daytona.works",
        "https://*.daytona.works",
        "3000-152fab09-2064-469b-8116-45c45bdb67a6.orchids.cloud",
        "3000-152fab09-2064-469b-8116-45c45bdb67a6.proxy.daytona.works",
        "*.orchids.cloud",
        "*.orchids.app",
        "*.proxy.daytona.works",
        "*.daytona.works",
        "localhost:3000"
      ]
    }
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  outputFileTracingRoot: path.resolve(__dirname, '../../'),
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
    rules: {
      "*.{jsx,tsx}": {
        loaders: [loaderPath]
      }
    }
  }
} as NextConfig;

export default nextConfig;
// Orchids restart: 1772359664564
