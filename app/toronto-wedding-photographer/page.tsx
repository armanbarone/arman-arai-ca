import type { Metadata } from "next";
import CityHub, { cityMetadata } from "@/components/CityHub";
import { marketBySlug } from "@/lib/site";

const market = marketBySlug("toronto")!;

export const metadata: Metadata = cityMetadata(market);

export default function Page() {
  return <CityHub market={market} />;
}
