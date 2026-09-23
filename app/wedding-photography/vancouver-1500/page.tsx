import CityWeddingLanding, { type IntroWeddingOffer } from "../CityWeddingLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";

const route = weddingCityRoute("vancouver-dark")!;
const pagePath = "/wedding-photography/vancouver-1500";

const shortStory: IntroWeddingOffer = {
  slug: "short-story",
  name: "Short Story",
  price: 1500,
  hours: 4,
  strap: "A focused ceremony and portrait collection",
  items: [
    "Photography by Arman",
    "Planning call and timeline guidance",
    "Ceremony, family photographs and couple portraits",
    "Full edited high-resolution online gallery",
    "Preview within five days",
    "Personal printing rights",
    "Sunday to Thursday availability",
    "Friday or Saturday dates within 60 days, subject to availability",
    "Not offered on peak Saturdays from May through October",
  ],
  availability: "Short Story is available Sunday through Thursday. Friday and Saturday dates can be booked within 60 days when the date remains open. It is not available on peak Saturdays from May through October. For six hours or more, choose Essential or a larger collection.",
};

export const metadata = cityWeddingMetadata(route.city, pagePath, {
  entryPrice: shortStory.price,
  canonicalPath: route.path,
});

export default function Vancouver1500Page() {
  return <CityWeddingLanding city={route.city} theme="dark" pageSlug="vancouver-1500" introOffer={shortStory} />;
}
