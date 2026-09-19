import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANDING_CITY_SLUGS, variantBySlug } from "@/lib/ads/wedding-landing";
import { at, FILM_STRIP } from "@/lib/images";
import { SITE } from "@/lib/site";
import LandingPage from "../LandingPage";

/* One landing page per market, so the headline can repeat the search term.
 *
 * Someone typing "wedding photographer Montreal" is comparing photographers and
 * wants to know whether you are free on their date. A page that opens with
 * "Wedding Photography Across Canada" makes them do a translation step first,
 * and Google charges more for the click because the page is less relevant to
 * the query. So: one ad group per city, one final URL per city.
 *
 * These are noindex/follow. /montreal-wedding-photographer is the indexed page
 * for that query and it stays the one Google ranks; this is only the page the
 * ad points at. Do not add either of them to sitemap.ts.
 *
 * Careful with the URL shape: next.config.ts already 301s /wedding-photographer/<city>
 * to the hub. This lives at /wedding-photography/<city>, which is a different
 * path. Changing either one to match the other creates a redirect loop.
 */

// All seven markets get a page. Ad spend lives on the three big cities, but a
// variant costs nothing and a campaign for Whistler or Banff needs somewhere
// to land.
export function generateStaticParams() {
  return LANDING_CITY_SLUGS.map((city) => ({ city }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> },
): Promise<Metadata> {
  const { city } = await params;
  const variant = variantBySlug(city);
  if (!variant) return {};
  return {
    title: { absolute: variant.metaTitle },
    description: variant.metaDescription,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: { canonical: `${SITE.url}${variant.path}` },
    openGraph: {
      title: variant.h1,
      description: variant.metaDescription,
      url: `${SITE.url}${variant.path}`,
      images: [{ url: at(FILM_STRIP[5].src, 1200), alt: FILM_STRIP[5].alt }],
    },
  };
}

export default async function CityLanding({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const variant = variantBySlug(city);
  if (!variant) notFound();
  return <LandingPage variant={variant} />;
}
