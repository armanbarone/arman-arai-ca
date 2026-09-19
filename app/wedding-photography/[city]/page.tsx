import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { LANDING_CITY_SLUGS, variantBySlug } from "@/lib/ads/wedding-landing";
import { at, FILM_STRIP } from "@/lib/images";
import { SITE } from "@/lib/site";
import LandingPage from "../LandingPage";
import CityWeddingLanding from "../CityWeddingLanding";
import { WEDDING_CITIES, weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";

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

// Preserve the existing markets and publish both editions of the new design.
// Vancouver's dark edition retains its existing static route.
export function generateStaticParams() {
  const routes = new Set([...LANDING_CITY_SLUGS, ...WEDDING_CITIES.flatMap((city) => [city.slug, `${city.slug}-dark`])]);
  routes.delete("vancouver-dark");
  return [...routes].map((city) => ({ city }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> },
): Promise<Metadata> {
  const { city } = await params;
  const designed = weddingCityRoute(city);
  if (designed) return cityWeddingMetadata(designed.city, designed.path);
  const variant = variantBySlug(city);
  if (!variant) return {};
  const title = variant.metaTitle;
  const description = variant.metaDescription;
  const photo = FILM_STRIP[5];
  return {
    title: { absolute: title },
    description,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: { canonical: `${SITE.url}${variant.path}` },
    openGraph: {
      title,
      description,
      url: `${SITE.url}${variant.path}`,
      images: [{ url: at(photo.src, 1200), alt: photo.alt }],
    },
  };
}

export default async function CityLanding({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const designed = weddingCityRoute(city);
  if (designed) return <CityWeddingLanding city={designed.city} theme={designed.theme} />;
  const variant = variantBySlug(city);
  if (!variant) notFound();
  return <LandingPage variant={variant} />;
}
