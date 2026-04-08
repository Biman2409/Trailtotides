import type { NextConfig } from "next";
import path from "node:path";

// Loader path from orchids-visual-edits - use direct resolve to get the actual file
const loaderPath = require.resolve('orchids-visual-edits/loader.js');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options",    value: "nosniff" },
          { key: "X-Frame-Options",           value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",          value: "1; mode=block" },
          { key: "Referrer-Policy",           value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",        value: "camera=(), microphone=(), geolocation=(self)" },
        ],
      },
      {
        // Cache static adventure images aggressively
        source: "/experiences/:path*",
        headers: [
          { key: "Cache-Control", value: "public, max-age=3600, stale-while-revalidate=86400" },
        ],
      },
      {
        // Sitemap and robots should be cached but refreshed periodically
        source: "/(sitemap.xml|robots.txt|manifest.json)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=86400" },
        ],
      },
    ];
  },
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
    // Serve WebP (with AVIF fallback) for all Next.js Image components
    formats: ["image/webp", "image/avif"],
    // Quality optimized for adventure photos — good balance of size/fidelity
    qualities: [60, 75, 90],
    // Minimize layout shift with well-defined device sizes
    deviceSizes: [390, 768, 1080, 1280, 1920],
    imageSizes: [64, 128, 256, 384, 512],
    // Minimize revalidation overhead for static adventure images
    minimumCacheTTL: 86400,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http',  hostname: '**' },
    ],
  },
  // Compress responses
  compress: true,
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
// Orchids restart: 1772545906254
