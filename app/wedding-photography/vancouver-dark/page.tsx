import CityWeddingLanding from "../CityWeddingLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";

const route = weddingCityRoute("vancouver-dark")!;
export const metadata = cityWeddingMetadata(route.city, route.path);

export default function VancouverDarkPage() {
  return <CityWeddingLanding city={route.city} theme={route.theme} />;
}
