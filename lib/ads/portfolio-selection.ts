import { ANALOGUE, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, type Photo } from "@/lib/images";
import { GALLERIES } from "@/lib/galleries";

export type PortfolioPhoto = Photo & { collection: string };

// Hand-picked from every album on /portfolio. Use filenames so reordering a
// source album cannot silently change the selection. Captions describe the
// collection, rather than implying these weddings happened in the page's city.
function select(photos: Photo[], collection: string, frames: (string | [string, string])[]): PortfolioPhoto[] {
  return frames.map((frame) => {
    const [filename, alt] = typeof frame === "string" ? [frame] : frame;
    const photo = photos.find((item) => item.src.endsWith(`/${filename}`));
    if (!photo) throw new Error(`Missing portfolio selection: ${collection}/${filename}`);
    return { ...photo, alt: alt ?? photo.alt, collection };
  });
}

function wedding(slug: string, frames: [string, string][]): PortfolioPhoto[] {
  const gallery = GALLERIES.find((item) => item.slug === slug);
  if (!gallery) throw new Error(`Missing portfolio album: ${slug}`);
  return select(gallery.chapters.flatMap((chapter) => chapter.images.map((photo) => ({ src: photo.url, alt: photo.alt }))), gallery.names, frames);
}

const collections = [
  select(EDITORIAL, "Editorial", ["backlit-tender-close.webp", "graphic-marble-floor-bw.webp", "panelled-library-gold-chair.webp", "lace-sleeve-close-bw.webp"]),
  wedding("elisha-michael", [
    ["034.webp", "Elisha and Michael laughing together on the stone chapel steps"],
    ["035.webp", "Elisha and Michael leaving the flower-framed chapel doorway under falling petals"],
    ["029.webp", "Elisha and Michael dancing beneath warm string lights"],
  ]),
  select(FILM, "Film inspired", ["under-the-veil-bw.webp", "golden-hour-bouquets-detail.webp", "tall-drapes-silhouette.webp", "frescoed-hall-banquet.webp"]),
  wedding("eathon-jessica", [
    ["013.webp", "Eathon and Jessica seated together with a white dog and a bouquet"],
    ["021.webp", "Eathon dipping Jessica for a kiss as their guests celebrate"],
    ["026.webp", "Eathon and Jessica laughing as they pour a champagne tower"],
  ]),
  select(ANALOGUE, "1980s film", ["spin-blur-overhead-bw.webp", "rain-umbrella-night-cobbles.webp", "veiled-bride-arches-bw.webp", "retro-window-florals.webp"]),
  wedding("luca-lauren", [
    ["011.webp", "Luca and Lauren on a spiral staircase, her train spread down the steps, black and white"],
    ["034.webp", "Luca and Lauren embracing beneath pink blossom"],
    ["039.webp", "Lauren's long train in the blue and gold basilica interior"],
  ]),
  select(DREAMY_FINE_ART, "Dreamy fine art", ["07.webp", "09.webp", "01.webp", "18.webp"]),
  wedding("nicole-js", [
    ["053.webp", "Nicole and JS on a stone terrace, her veil lifting against the misty hills"],
    ["015.webp", "Nicole laughing with a bridesmaid, both holding colourful bouquets"],
    ["049.webp", "The stone reception hall set with flowers and lit by candles"],
  ]),
  select(DOCUMENTARY, "Documentary", ["guests-laughing-champagne.webp", "morning-window-vows-read.webp", "guests-hands-over-shoulder.webp", "car-back-seat-teal.webp"]),
  wedding("parsa-marjan", [
    ["004.webp", "Parsa and Marjan together in sunset light, her veil glowing behind them"],
    ["014.webp", "Parsa standing beside Marjan in a red-curtained room, her train spread over a chair"],
    ["039.webp", "Parsa and Marjan dancing surrounded by cheering guests"],
  ]),
  wedding("anastasia-daniil", [
    ["6a13d545e05851175c7318a1.png", "Anastasia holding her bouquet in warm daylight beneath her veil"],
    ["6a13d5453c3aed7c63b46b7c.png", "Anastasia and Daniil facing each other beneath a sunlit ceremony arch"],
    ["6a13d53fe05851175c7317f7.png", "A guest singing and raising her arm on the dance floor, black and white"],
  ]),
  wedding("sofia-lucas", [
    ["6a151a0660ad4b061938487f.png", "Sofia standing outside a window in her veil"],
    ["6a151a0154d7dff212d2a20d.png", "Sofia and Lucas kissing beside a tiered cake beneath purple draping"],
    ["6a151a0260ad4b0619384807.png", "Sofia singing on stage in her wedding dress under blue lights"],
  ]),
  wedding("margaux-antoine", [
    ["6a15234c54d7dff212d343ce.png", "Margaux and Antoine standing close together during their ceremony, black and white"],
    ["6a15234d0397b3655e6d05e6.png", "A guest covering his face with his hands during an emotional moment, black and white"],
    ["6a15234854d7dff212d34348.png", "Fireworks above the château gardens as wedding guests watch"],
  ]),
  wedding("eleanor-james", [
    ["6a1678b9449f78709ee35773.png", "Eleanor in a halter gown dancing close to James in warm evening light"],
    ["6a1678baecd67a415b999f88.png", "A guest raising a glass to the couple during the wedding speeches"],
    ["6a1678b9ebdb915d9a7188ab.png", "Wedding guests laughing and sharing dinner around the reception table"],
  ]),
];

// Alternate collections to keep the book varied from its opening pages.
export const PORTFOLIO_SELECTION: PortfolioPhoto[] = Array.from({ length: 4 }, (_, index) =>
  collections.flatMap((photos) => photos[index] ? [photos[index]] : []),
).flat();
