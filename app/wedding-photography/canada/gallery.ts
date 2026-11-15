import { MONTREAL_LANDING } from "@/lib/ads/city-landing-album";
import { VANCOUVER_SIMPLE_GALLERY } from "../vancouver-simple/gallery";

// The final two photographs on Montréal-simple at the time this Canada
// campaign was requested. Pin the files so later Montréal edits stay separate.
const ending = ["montreal-landing-10.webp", "montreal-landing-02.webp"].map((filename) => {
  const photo = MONTREAL_LANDING.find((item) => item.src.endsWith(`/${filename}`));
  if (!photo) throw new Error(`Missing Canada gallery photograph: ${filename}`);
  return photo;
});

export const CANADA_GALLERY = [...VANCOUVER_SIMPLE_GALLERY, ...ending];
