import { CALGARY_LANDING } from "@/lib/ads/city-landing-album";

// Alberta portraits already used on the Calgary page. Keep Calgary's Peace
// Bridge, city skyline and mountain backdrops out of the Edmonton variation.
const filenames = [
  "calgary-landing-02.webp",
  "calgary-landing-06.webp",
  "calgary-landing-07.webp",
  "calgary-landing-05.webp",
  "calgary-landing-09.webp",
  "calgary-landing-04.webp",
];

export const EDMONTON_SIMPLE_GALLERY = filenames.map((filename) => {
  const photo = CALGARY_LANDING.find((item) => item.src.endsWith(`/${filename}`));
  if (!photo) throw new Error(`Missing Edmonton gallery portrait: ${filename}`);
  return photo;
});
