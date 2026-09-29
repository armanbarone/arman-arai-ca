import InquiryLanding from "../InquiryLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";
import { SHORT_STORY, VANCOUVER_COVERAGE_SUMMARY, VANCOUVER_TIER_OVERRIDES, VANCOUVER_TIER_SLUGS } from "@/lib/ads/short-story";

/* The pricing-request version of /wedding-photography/vancouver-1500: the same
   offer and photographs, one form, and the calendar after it. noindex like
   every ads page, and out of the sitemap. */
const route = weddingCityRoute("vancouver")!;
const pagePath = "/wedding-photography/vancouver-pricing";

export const metadata = cityWeddingMetadata(route.city, pagePath, { entryPrice: SHORT_STORY.price });

export default function VancouverPricingPage() {
  return <InquiryLanding
    city={route.city}
    pageSlug="vancouver-pricing"
    offer={SHORT_STORY}
    tierSlugs={VANCOUVER_TIER_SLUGS}
    tierOverrides={VANCOUVER_TIER_OVERRIDES}
    coverageSummary={VANCOUVER_COVERAGE_SUMMARY}
  />;
}
