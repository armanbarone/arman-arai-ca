import type { Metadata } from "next";
import PromoPage from "@/components/promo/PromoPage";
import { WeddingWorkAlbum } from "@/components/promo/WeddingAlbums";
import { weddings2728Config, LANDING_OG_IMAGE } from "@/lib/promo/weddings2728";
import { SITE } from "@/lib/site";

/* The Google Ads landing page for 2027 and 2028 wedding dates.
 *
 * It lives outside the (site) route group on purpose, so it renders without the
 * nav and the footer: an ads page should have one way forward (the form, the
 * calendar) rather than twelve ways to wander off into the journal.
 *
 * noindex, follow: this page sells the same collections as /pricing, and two
 * pages competing for the same query helps nobody. The ad is the only door.
 */
export const metadata: Metadata = {
  // absolute, or the root layout's "%s | Arman Arai" template appends the
  // brand a second time.
  title: {
    absolute: "2027 & 2028 Canadian Wedding Photography | From C$3,000 | Arman Arai",
  },
  description:
    "Documentary and editorial wedding photography across Canada. Three collections from C$3,000, the same price in every city, with travel kept separate and lean.",
  robots: { index: false, follow: true },
  alternates: { canonical: `${SITE.url}/2728-weddings` },
  openGraph: {
    title: "Your whole wedding day, photographed by one person",
    description:
      "Three collections from C$3,000, the same price wherever in Canada you marry. Social reels in the first week, film prints on the night.",
    url: `${SITE.url}/2728-weddings`,
    images: [{ url: LANDING_OG_IMAGE }],
  },
};

export default function Weddings2728() {
  return <PromoPage cfg={weddings2728Config()} experiencesAlbum={<WeddingWorkAlbum />} />;
}
