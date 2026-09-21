import LandingPage from "../LandingPage";
import { variantBySlug } from "@/lib/ads/wedding-landing";
import { legacyWeddingMetadata } from "@/lib/ads/legacy-wedding-metadata";

export const metadata = legacyWeddingMetadata("jasper");
export default function JasperLanding() {
  return <LandingPage variant={variantBySlug("jasper")!} />;
}
