import PricingThankYou, { pricingThankYouMetadata } from "../../PricingThankYou";
import { pricingMarket } from "@/lib/ads/pricing-request";

const city = { slug: "canada", name: "Canada", adjective: "Canadian" };
export const metadata = pricingThankYouMetadata(city);

export default function ThankYouPage() {
  return <PricingThankYou city={city} market={pricingMarket("canada")!} page="wedding-photography/canada" />;
}
