import WeddingsLanding, { weddingsMetadata } from "../WeddingsLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { pricingMarket } from "@/lib/ads/pricing-request";

/* The vancouver pricing-request ads page: the vancouver-weddings design and
   wording (WeddingsLanding), noindex like every ads page and out of the
   sitemap. */
const route = weddingCityRoute("vancouver")!;
const market = pricingMarket("vancouver")!;
const path = "/wedding-photography/vancouver-pricing";

export const metadata = weddingsMetadata(route.city, path);

export default function PricingPage() {
  return <WeddingsLanding city={route.city} market={market} path={path} />;
}
