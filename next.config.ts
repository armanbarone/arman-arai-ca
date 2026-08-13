import type { NextConfig } from "next";

// The three markets this business actually serves. Each has a real page at
// /<city>-wedding-photographer; the aliases below catch the other shapes people
// and old links use.
const CITIES = ["toronto", "montreal", "vancouver"] as const;

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  // Inline the stylesheet into the HTML so the render-blocking CSS request is
  // off the critical path. This is the single biggest FCP/LCP win on mobile and
  // it is what armanarai.com does.
  experimental: {
    inlineCss: true,
  },
  images: {
    // Photographs come off R2 through Cloudflare Image Transformations.
    loader: "custom",
    loaderFile: "./cloudflareLoader.ts",
    // Fixed responsive widths cap the number of unique transforms (billing
    // guardrail) and maximise CDN cache hits.
    deviceSizes: [400, 800, 1200, 1600, 2400],
    imageSizes: [256, 400],
    // Ignored while a custom loader is set; kept for reference and any fallback.
    remotePatterns: [
      { protocol: "https", hostname: "cdn.armanarai.com", pathname: "/**" },
    ],
  },
  async redirects() {
    return [
      // Destination weddings are not part of this business. The page is gone and
      // everything that pointed at it now lands on pricing, which is what a
      // couple arriving from those links is actually looking for.
      { source: "/destination", destination: "/pricing", permanent: true },
      { source: "/collections", destination: "/pricing", permanent: true },
      // Common alternate spellings of the city pages, so a mistyped or
      // externally-linked shape never 404s.
      ...CITIES.flatMap((city) => [
        { source: `/${city}`, destination: `/${city}-wedding-photographer`, permanent: true },
        { source: `/wedding-photographer/${city}`, destination: `/${city}-wedding-photographer`, permanent: true },
        { source: `/${city}-wedding-photography`, destination: `/${city}-wedding-photographer`, permanent: true },
      ]),
      // The journal has always lived at /blog; /journal is the label in the nav,
      // so claim it rather than leave it dead.
      { source: "/journal", destination: "/blog", permanent: true },
      { source: "/journal/:slug", destination: "/blog/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
