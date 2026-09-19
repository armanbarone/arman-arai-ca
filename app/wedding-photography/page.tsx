import type { Metadata } from "next";
import { NATIONAL } from "@/lib/ads/wedding-landing";
import { at, FILM_STRIP } from "@/lib/images";
import { SITE } from "@/lib/site";
import LandingPage from "./LandingPage";

/* The national Google Ads landing page.
 *
 * Outside the (site) route group on purpose, so it renders with no nav and no
 * footer links: a paid page has one way forward.
 *
 * noindex, follow. It sells the same collections as /pricing and covers the
 * same ground as the city hubs, and two pages of mine competing for "wedding
 * photographer Montreal" helps nobody. The ad is the only door. Follow is left
 * on so the links out to /galleries and /portfolio still pass.
 */

const OG = at(FILM_STRIP[5].src, 1200);

export const metadata: Metadata = {
  // Absolute, or the root layout's "%s | Arman Arai" appends the brand twice.
  title: { absolute: NATIONAL.metaTitle },
  description: NATIONAL.metaDescription,
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  alternates: { canonical: `${SITE.url}${NATIONAL.path}` },
  openGraph: {
    title: NATIONAL.h1,
    description: NATIONAL.metaDescription,
    url: `${SITE.url}${NATIONAL.path}`,
    images: [{ url: OG, alt: FILM_STRIP[5].alt }],
  },
};

export default function WeddingPhotographyLanding() {
  return <LandingPage variant={NATIONAL} />;
}
