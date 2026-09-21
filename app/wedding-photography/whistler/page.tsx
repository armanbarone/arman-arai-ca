import LandingPage from "../LandingPage";
import { variantBySlug } from "@/lib/ads/wedding-landing";
import { legacyWeddingMetadata } from "@/lib/ads/legacy-wedding-metadata";

export const metadata = legacyWeddingMetadata("whistler");
export default function WhistlerLanding() {
  return <LandingPage variant={variantBySlug("whistler")!} />;
}
