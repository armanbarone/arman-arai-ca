import type { NextConfig } from "next";

// The three markets this business actually serves. Each has a real page at
// /<city>-wedding-photographer; the aliases below catch the other shapes people
// and old links use.
const CITIES = ["toronto", "montreal", "vancouver"] as const;

// The fourteen posts this site inherited were all destination-wedding writing
// set in Medellín, Cartagena, Tuscany and Dubai. That is armanarai.com's
// business, not this one, so they are deleted rather than rewritten. Each URL
// goes to the closest thing that now exists instead of 404ing.
const RETIRED_POSTS: Record<string, string> = {
  "most-beautiful-cities-destination-wedding": "/blog",
  "destination-weddings-better-photography": "/blog",
  "colombia-destination-wedding-guide": "/blog",
  "medellin-wedding-photographer-guide": "/blog",
  "destination-wedding-guide-canadian-couples": "/blog",
  "destination-wedding-guide-american-couples": "/blog",
  "biggest-wedding-photography-trends-2026": "/blog",
  "documentary-wedding-photography-2026": "/portfolio",
  "true-to-life-wedding-photo-editing-2026": "/portfolio",
  "motion-blur-wedding-photography-trend-or-timeless": "/portfolio",
  "editorial-vs-documentary-wedding-photography": "/portfolio",
  "film-vs-digital-wedding-photography": "/portfolio",
  "golden-hour-wedding-photography-guide": "/blog/wedding-day-timeline-that-survives-the-day",
  // Renamed rather than retired: the replacement is Canada-specific.
  "how-to-choose-a-wedding-photographer": "/blog/how-to-choose-a-wedding-photographer-canada",
};

const nextConfig: NextConfig = {
  outputFileTracingRoot: __dirname,
  // inlineCss was on here, to take the render-blocking CSS request off the
  // critical path. Measured against the live site on Slow 4G it was a net loss:
  // Next ships the stylesheet twice under that flag, once as a <style> tag and
  // again inside the RSC payload as a JS string, which took this landing page's
  // HTML to 493KB. At the ~200KB/s Lighthouse models, streaming that document
  // is ~2.5s on its own, and the LCP element could not finish painting until it
  // did. An earlier test that favoured the flag was run against localhost,
  // where bandwidth is free and only the extra round trips show up.
  images: {
    // Photographs come off R2 through Cloudflare Image Transformations.
    loader: "custom",
    loaderFile: "./cloudflareLoader.ts",
    // Fixed responsive widths cap the number of unique transforms (billing
    // guardrail) and maximise CDN cache hits.
    deviceSizes: [400, 640, 800, 1200, 1600, 2400],
    imageSizes: [256],
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
      // The albums lived at /case-studies for one deploy before the route was
      // renamed to /galleries, matching armanarai.com. Both spellings are
      // claimed because people type both.
      { source: "/case-study", destination: "/galleries", permanent: true },
      { source: "/case-studies", destination: "/galleries", permanent: true },
      { source: "/case-studies/:slug", destination: "/galleries/:slug", permanent: true },
      ...Object.entries(RETIRED_POSTS).map(([slug, destination]) => ({
        source: `/blog/${slug}`,
        destination,
        permanent: true,
      })),
    ];
  },
};

export default nextConfig;
