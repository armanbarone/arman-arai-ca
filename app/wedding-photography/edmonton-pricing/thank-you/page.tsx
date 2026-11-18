import PricingThankYou, { pricingThankYouMetadata } from "../../PricingThankYou";
import { pricingMarket } from "@/lib/ads/pricing-request";
import { after } from "next/server";
import { cookies, headers } from "next/headers";
import { edmontonConfirmationEvent, EDMONTON_LEAD_COOKIE } from "@/lib/edmonton-lead-receipt";
import { reportWeddingLeadEvent } from "@/lib/meta-conversions";

const city = { slug: "edmonton", name: "Edmonton" };
export const metadata = pricingThankYouMetadata(city);
export const dynamic = "force-dynamic";

export default async function ThankYouPage() {
  const [cookieStore, requestHeaders] = await Promise.all([cookies(), headers()]);
  const event = edmontonConfirmationEvent(cookieStore.get(EDMONTON_LEAD_COOKIE)?.value, requestHeaders);
  if (event) after(() => reportWeddingLeadEvent(event, requestHeaders));
  return <PricingThankYou city={city} market={pricingMarket("edmonton")!} page="wedding-photography/edmonton-simple" />;
}
