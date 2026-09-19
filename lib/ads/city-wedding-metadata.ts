import type { Metadata } from "next";
import imageLoader from "../../cloudflareLoader";
import { CORE, SITE } from "../site";
import type { WeddingCity } from "./city-wedding-pages";

export function cityWeddingMetadata(city: WeddingCity, path: string): Metadata {
  const title = `${city.name} Wedding Photography | From C$${CORE.price.toLocaleString("en-CA")} | Arman Arai`;
  const description = `${city.name} wedding photography by Arman Arai. Browse full wedding albums, see collections from C$${CORE.price.toLocaleString("en-CA")}, and book a free 30-minute consultation.`;
  const image = imageLoader({ src: city.hero.src, width: 1200 });
  return {
    title: { absolute: title }, description,
    alternates: { canonical: `${SITE.url}${path}` },
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    openGraph: { title, description, url: `${SITE.url}${path}`, images: [{ url: image, alt: city.hero.alt }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}
