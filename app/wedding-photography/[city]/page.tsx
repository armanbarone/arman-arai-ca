import type { Metadata } from "next";
import { notFound } from "next/navigation";
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

// Legacy markets have their own static routes so their CSS is not sent here.
// Vancouver's dark edition also retains its existing static route.
export function generateStaticParams() {
  return WEDDING_CITIES.flatMap((city) => [city.slug, `${city.slug}-dark`])
    .filter((city) => city !== "vancouver-dark")
    .map((city) => ({ city }));
}

export const dynamicParams = false;

export async function generateMetadata(
  { params }: { params: Promise<{ city: string }> },
): Promise<Metadata> {
  const { city } = await params;
  const designed = weddingCityRoute(city);
  return designed ? cityWeddingMetadata(designed.city, designed.path) : {};
}

export default async function CityLanding({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const designed = weddingCityRoute(city);
  if (!designed) notFound();
  return <CityWeddingLanding city={designed.city} theme={designed.theme} />;
}
