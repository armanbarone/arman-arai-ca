import type { Metadata } from "next";
import { variantBySlug } from "./wedding-landing";
import { at, FILM_STRIP } from "../images";
import { SITE } from "../site";

export function legacyWeddingMetadata(slug: string): Metadata {
  const variant = variantBySlug(slug)!;
  const title = variant.metaTitle;
  const description = variant.metaDescription;
  const photo = FILM_STRIP[5];
  return {
    title: { absolute: title }, description,
    robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
    alternates: { canonical: `${SITE.url}${variant.path}` },
    openGraph: { title, description, url: `${SITE.url}${variant.path}`, images: [{ url: at(photo.src, 1200), alt: photo.alt }] },
  };
}
