import type { MetadataRoute } from "next";
import { posts } from "@/lib/blog";
import { GALLERIES } from "@/lib/galleries";
import { MARKETS, SITE } from "@/lib/site";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // Priorities are relative to each other, not absolute claims: the city pages
  // and pricing are what a couple is looking for, so they rank above the essays.
  const core: MetadataRoute.Sitemap = [
    { url: `${SITE.url}/`, changeFrequency: "monthly", priority: 1.0 },
    { url: `${SITE.url}/pricing`, changeFrequency: "monthly", priority: 0.95 },
    { url: `${SITE.url}/portfolio`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE.url}/case-studies`, changeFrequency: "monthly", priority: 0.85 },
    { url: `${SITE.url}/about`, changeFrequency: "yearly", priority: 0.7 },
    { url: `${SITE.url}/reviews`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE.url}/contact`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE.url}/blog`, changeFrequency: "weekly", priority: 0.7 },
  ];

  const cities: MetadataRoute.Sitemap = MARKETS.map((m) => ({
    url: `${SITE.url}/${m.slug}-wedding-photographer`,
    changeFrequency: "monthly",
    priority: 0.95,
  }));

  const albums: MetadataRoute.Sitemap = GALLERIES.map((g) => ({
    url: `${SITE.url}/case-studies/${g.slug}`,
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  const journal: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${SITE.url}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: "yearly",
    priority: 0.6,
  }));

  return [...core, ...cities, ...albums, ...journal].map((e) => ({
    lastModified: e.lastModified ?? now,
    ...e,
  }));
}
