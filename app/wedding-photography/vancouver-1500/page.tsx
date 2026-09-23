import CityWeddingLanding, { type IntroWeddingOffer } from "../CityWeddingLanding";
import { weddingCityRoute } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";

const route = weddingCityRoute("vancouver-dark")!;
const pagePath = "/wedding-photography/vancouver-1500";

const shortStory: IntroWeddingOffer = {
  slug: "short-story",
  name: "Short Story",
  price: 1500,
  hours: 6,
  strap: "Six hours. From the ceremony into the celebration.",
  items: [
    "6 continuous hours photographed by Arman",
    "60-minute engagement photoshoot",
    "One planning call, timeline guidance and a family-photo plan",
    "400+ edited high-resolution photographs with print permission",
    "30-image preview within 48 hours",
    "Full private online gallery within 2 weeks",
    "Local travel within Vancouver and the Lower Mainland",
    "Sunday to Thursday availability",
    "Friday or Saturday dates within 60 days, subject to availability",
    "Not offered on peak Saturdays from May through October",
  ],
  availability: "Short Story is available Sunday through Thursday. Friday and Saturday dates can be booked within 60 days when the date remains open. It is not available on peak Saturdays from May through October. It is best suited to one-location weddings. For eight hours, choose Signature; for 10 to 12 hours with a dedicated filmmaker, choose Photo + Film.",
};

export const metadata = cityWeddingMetadata(route.city, pagePath, {
  entryPrice: shortStory.price,
  canonicalPath: route.path,
});

export default function Vancouver1500Page() {
  return <CityWeddingLanding
    city={route.city}
    theme="dark"
    pageSlug="vancouver-1500"
    introOffer={shortStory}
    visibleTierSlugs={["signature", "photo-film"]}
    coverageSummary="6, 8 or 10 to 12 hours"
    tierOverrides={{
      "photo-film": {
        hoursLabel: "10 to 12 hours of photography and film",
        images: "800+ edited images",
      },
    }}
  />;
}
