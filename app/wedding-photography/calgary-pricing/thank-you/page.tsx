import PricingThankYou, { pricingThankYouMetadata } from "../../PricingThankYou";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { pricingMarket } from "@/lib/ads/pricing-request";

const route = weddingCityRoute("calgary")!;
export const metadata = pricingThankYouMetadata(route.city);

export default function ThankYouPage() {
  return <PricingThankYou city={route.city} market={pricingMarket("calgary")!} />;
}
