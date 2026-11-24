import type { NextConfig } from "next";

// Where the site loads things from: Supabase (data, auth, photos), Google sign-in, the map's
// tiles and place search, the weather panel, and Leaflet's stylesheet. Images may come from any
// https host (operator logos, Unsplash, map tiles).
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' https://accounts.google.com https://va.vercel-scripts.com https://unpkg.com",
  "style-src 'self' 'unsafe-inline' https://unpkg.com https://accounts.google.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://accounts.google.com https://nominatim.openstreetmap.org https://api.open-meteo.com https://archive-api.open-meteo.com https://tiles.openfreemap.org https://server.arcgisonline.com https://s3.amazonaws.com https://vitals.vercel-insights.com",
  "frame-src https://accounts.google.com",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
  "report-uri /api/csp-report",
].join("; ");

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response
  poweredByHeader: false,
  async headers() {
    return [
      {
        // Apply security headers to pages only — NOT to _next/image or API routes
        source: "/((?!_next/image|_next/static|api/).*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options",        value: "SAMEORIGIN" },
          { key: "X-XSS-Protection",       value: "1; mode=block" },
          { key: "Referrer-Policy",        value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy",     value: "camera=(), microphone=(), geolocation=(self)" },
          // Report-only for now: browsers report what would be blocked to /api/csp-report and block
          // nothing. Switch the key to Content-Security-Policy once the logs stay quiet.
          { key: "Content-Security-Policy-Report-Only", value: CSP },
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
  images: {
    // Resizing goes to Supabase / Unsplash instead of Vercel's optimizer, whose
    // Hobby quota ran out (uncached sizes returned 402). See src/lib/imageLoader.ts.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
    // Serve WebP (with AVIF fallback) for all Next.js Image components
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [60, 75, 90, 100],
    // Minimize revalidation overhead for static adventure images
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  // Turbopack (npm run dev) doesn't always apply images.loaderFile on its own, and every
  // <Image> then failed with "missing loader prop"; point it at the loader explicitly
  turbopack: {
    resolveAlias: {
      "next/dist/shared/lib/image-loader": "./src/lib/imageLoader.ts",
    },
  },
  // Compress responses
  compress: true,
} as NextConfig;

export default nextConfig;
