import CityWeddingLanding from "../CityWeddingLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";
import { SHORT_STORY, VANCOUVER_COVERAGE_SUMMARY, VANCOUVER_TIER_OVERRIDES, VANCOUVER_TIER_SLUGS } from "@/lib/ads/short-story";

const route = weddingCityRoute("vancouver-dark")!;
const pagePath = "/wedding-photography/vancouver-1500";

export const metadata = cityWeddingMetadata(route.city, pagePath, {
  entryPrice: SHORT_STORY.price,
  canonicalPath: route.path,
});

export default function Vancouver1500Page() {
  return <CityWeddingLanding
    city={route.city}
    theme="dark"
    pageSlug="vancouver-1500"
    introOffer={SHORT_STORY}
    visibleTierSlugs={VANCOUVER_TIER_SLUGS}
    coverageSummary={VANCOUVER_COVERAGE_SUMMARY}
    tierOverrides={VANCOUVER_TIER_OVERRIDES}
  />;
}
