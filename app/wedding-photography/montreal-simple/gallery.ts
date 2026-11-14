import { MONTREAL_LANDING } from "@/lib/ads/city-landing-album";
import { VANCOUVER_WORK, type WorkPhoto } from "@/lib/ads/hub-work";

// Vancouver-simple's displayed photos 7, 8, 9, 10 and 17, in that order.
// Pin filenames so later changes to Vancouver's order cannot change this edit.
const opening = [
  "vancouver-new-15.webp",
  "vancouver-new-01.webp",
  "vancouver-hub-12.webp",
  "vancouver-hub-33.webp",
  "vancouver-new-13.webp",
].map((filename) => {
  const photo = VANCOUVER_WORK.find((item) => item.src.endsWith(`/${filename}`));
  if (!photo) throw new Error(`Missing Montréal gallery opening: ${filename}`);
  return photo;
});

// Keep Montréal's original displayed photos 1, 3, 5 and 7.
// Its original photos 2, 4, 6, 8 and 9 are omitted only from this variation.
export const MONTREAL_SIMPLE_GALLERY: WorkPhoto[] = [
  ...opening,
  ...[0, 2, 4, 6].map((index) => MONTREAL_LANDING[index]),
];
