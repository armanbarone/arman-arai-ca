import { albertaLandingPhotos, CALGARY_LANDING } from "@/lib/ads/city-landing-album";
import { MONTREAL_SIMPLE_GALLERY } from "../montreal-simple/gallery";

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

const albertaPortraits = filenames.map((filename) => {
  const photo = CALGARY_LANDING.find((item) => item.src.endsWith(`/${filename}`));
  if (!photo) throw new Error(`Missing Edmonton gallery portrait: ${filename}`);
  return photo;
});

// Montréal-simple photos 1, 2, 3, 4, 8, 9. Pin the files so reordering Montréal
// later does not change this selection.
const montrealFilenames = [
  "vancouver-new-15.webp",
  "vancouver-new-01.webp",
  "vancouver-hub-12.webp",
  "vancouver-hub-33.webp",
  "montreal-landing-10.webp",
  "montreal-landing-02.webp",
];

const montrealSelection = montrealFilenames.map((filename) => {
  const photo = MONTREAL_SIMPLE_GALLERY.find((item) => item.src.endsWith(`/${filename}`));
  if (!photo) throw new Error(`Missing Montréal gallery portrait: ${filename}`);
  return photo;
});

export const EDMONTON_SIMPLE_GALLERY = albertaLandingPhotos([...albertaPortraits, ...montrealSelection]);
