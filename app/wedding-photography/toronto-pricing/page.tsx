import InquiryLanding from "../InquiryLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";
import { pricingMarket, pricingTiers } from "@/lib/ads/pricing-request";

/* The toronto pricing-request ads page. noindex like every ads page, and out of
   the sitemap. The layout and the one-action rule live in InquiryLanding. */
const route = weddingCityRoute("toronto")!;
const market = pricingMarket("toronto")!;

export const metadata = cityWeddingMetadata(route.city, "/wedding-photography/toronto-pricing", {
  entryPrice: Math.min(...pricingTiers().map((tier) => tier.price)),
});

export default function PricingPage() {
  return <InquiryLanding city={route.city} market={market} />;
}
