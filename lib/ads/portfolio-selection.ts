import { ANALOGUE, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, type Photo } from "@/lib/images";

export type PortfolioPhoto = Photo & { collection: string };

// Four selections from each of the five portfolio style albums. Complete
// wedding galleries are a separate source and do not belong in this album.
// Filenames keep the selection stable when the source albums are reordered.
function select(photos: Photo[], collection: string, frames: string[]): PortfolioPhoto[] {
  return frames.map((filename) => {
    const photo = photos.find((item) => item.src.endsWith(`/${filename}`));
    if (!photo) throw new Error(`Missing portfolio selection: ${collection}/${filename}`);
    return { ...photo, collection };
  });
}

const collections = [
  select(EDITORIAL, "Editorial", ["backlit-tender-close.webp", "graphic-marble-floor-bw.webp", "panelled-library-gold-chair.webp", "lace-sleeve-close-bw.webp"]),
  select(FILM, "Film inspired", ["under-the-veil-bw.webp", "golden-hour-bouquets-detail.webp", "tall-drapes-silhouette.webp", "frescoed-hall-banquet.webp"]),
  select(ANALOGUE, "1980s film", ["spin-blur-overhead-bw.webp", "rain-umbrella-night-cobbles.webp", "veiled-bride-arches-bw.webp", "retro-window-florals.webp"]),
  select(DREAMY_FINE_ART, "Dreamy fine art", ["07.webp", "09.webp", "01.webp", "18.webp"]),
  select(DOCUMENTARY, "Documentary", ["guests-laughing-champagne.webp", "morning-window-vows-read.webp", "guests-hands-over-shoulder.webp", "car-back-seat-teal.webp"]),
];

// Alternate collections to keep the book varied from its opening pages.
export const PORTFOLIO_SELECTION: PortfolioPhoto[] = Array.from({ length: 4 }, (_, index) =>
  collections.flatMap((photos) => photos[index] ? [photos[index]] : []),
).flat();
