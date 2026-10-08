import { ANALOGUE, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, type Photo } from "@/lib/images";
import type { LandingAlbum } from "@/app/wedding-photography/AlbumBrowser";

// Shorter versions of the five /portfolio style albums, retaining their names,
// covers and original photograph order. Full wedding galleries stay separate.
function album(id: string, title: string, subtitle: string, description: string, bookSubtitle: string, source: Photo[], filenames: string[], cover: number, bookFormat: "portrait" | "wide" = "portrait"): LandingAlbum {
  const photos = source.filter((photo) => filenames.some((filename) => photo.src.endsWith(`/${filename}`)));
  if (photos.length !== filenames.length || !photos.some((photo) => photo.src === source[cover].src)) throw new Error(`Invalid shortened portfolio album: ${id}`);
  return { id, title, subtitle, description, bookSubtitle, bookFormat, cover: source[cover], chapters: [{ title, photos }] };
}

export const PORTFOLIO_STYLE_ALBUMS: LandingAlbum[] = [
  album("editorial", "Editorial", "Clean lines. Intentional light.", "Composed portraits, graphic framing and deliberate light.", "A Wedding Collection", EDITORIAL,
    ["lace-sleeve-close-bw.webp", "backlit-tender-close.webp", "panelled-library-gold-chair.webp", "night-courtyard-train-bw.webp", "candlelit-head-table.webp", "graphic-marble-floor-bw.webp"], 2),
  album("film", "Film Inspired", "Warm grain. Honest colour.", "Warm colour, soft highlights and a film-inspired finish.", "Analogue Aesthetic", FILM,
    ["doorway-veil-portrait.webp", "golden-hour-bouquets-detail.webp", "candlelit-banquet-table.webp", "tall-drapes-silhouette.webp", "under-the-veil-bw.webp", "garden-stone-villa-ceremony.webp"], 19),
  album("analogue", "1980s Film", "Fade. Grain. Memory.", "Grain, faded colour and the warmth of an old photograph.", "Expired Stock", ANALOGUE,
    ["spin-blur-overhead-bw.webp", "veiled-bride-arches-bw.webp", "veil-abstraction-bw.webp", "rain-umbrella-night-cobbles.webp", "eighties-orange-sofa.webp", "retro-window-florals.webp"], 4),
  album("fine-art", "Dreamy Fine Art", "Soft light. Flowers. Air.", "Romantic portraits, glowing veils and soft floral detail.", "A Floral Editorial", DREAMY_FINE_ART,
    ["01.webp", "05.webp", "07.webp", "09.webp", "15.webp", "18.webp"], 17),
  album("documentary", "Documentary", "Real moments. Real people.", "Unposed moments and the people who make your day.", "Candid Coverage", DOCUMENTARY,
    ["morning-window-vows-read.webp", "bridesmaids-hotel-bed.webp", "hanging-dress-window-guests.webp", "guests-hands-over-shoulder.webp", "guests-laughing-champagne.webp", "car-back-seat-teal.webp"], 7, "wide"),
];
