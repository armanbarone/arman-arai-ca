import PricingThankYou, { pricingThankYouMetadata } from "../../PricingThankYou";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { pricingMarket } from "@/lib/ads/pricing-request";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { montrealConfirmationEvent, MONTREAL_LEAD_COOKIE } from "@/lib/montreal-lead-receipt";
import { reportWeddingLeadEvent } from "@/lib/meta-conversions";

const route = weddingCityRoute("montreal")!;
export const metadata = pricingThankYouMetadata(route.city);
export const dynamic = "force-dynamic";

export default async function ThankYouPage() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const event = montrealConfirmationEvent(cookieStore.get(MONTREAL_LEAD_COOKIE)?.value, requestHeaders);
  if (event) after(() => reportWeddingLeadEvent(event, requestHeaders));
  return <PricingThankYou city={route.city} market={pricingMarket("montreal")!} />;
}
