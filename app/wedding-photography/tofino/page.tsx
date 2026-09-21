import LandingPage from "../LandingPage";
import { variantBySlug } from "@/lib/ads/wedding-landing";
import { legacyWeddingMetadata } from "@/lib/ads/legacy-wedding-metadata";

export const metadata = legacyWeddingMetadata("tofino");
export default function TofinoLanding() {
  return <LandingPage variant={variantBySlug("tofino")!} />;
}
