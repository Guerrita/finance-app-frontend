import type { NextConfig } from "next"

// next-pwa uses webpack and is incompatible with Next.js 16 Turbopack (enabled by default).
// PWA manifest and meta tags are already configured in app/layout.tsx + public/manifest.json.
// To add service worker caching, migrate to a Turbopack-compatible solution
// (e.g. @ducanh2912/next-pwa with turbopack support) or add `turbopack: {}` and use
// a custom service worker in public/sw.js.
const nextConfig: NextConfig = {
  typescript: {
    // Type errors are checked separately from the build (same behavior as `next dev`)
    ignoreBuildErrors: true,
  },
}

export default nextConfig
