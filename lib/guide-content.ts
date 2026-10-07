import { stylesOfWork } from "@/app/wedding-photography/landing-content";
import type { LandingAlbum } from "@/app/wedding-photography/AlbumBrowser";
import { GALLERIES } from "@/lib/galleries";
import type { Photo } from "@/lib/images";

// The complete image sequences shown on /portfolio, in that page's order.
// These are approaches to a wedding day, not choices required before a conversation.
const ways = [
  { id: "editorial", title: "Editorial", subtitle: "Clean lines. Intentional light.", description: "I’ll give you simple direction for portraits, with attention to the light, the setting and the space around you." },
  { id: "film", title: "Film Inspired", subtitle: "Warm grain. Honest colour.", description: "Soft highlights, warm colour and the gentler finish you can see throughout this album." },
  { id: "analogue", title: "1980s Film", subtitle: "Fade. Grain. Memory.", description: "Texture, faded colour and the nostalgia of an old family photograph." },
  { id: "fine-art", title: "Dreamy Fine Art", subtitle: "Soft light. Flowers. Air.", description: "Portraits made with soft light, flowers and a little room to slow down." },
  { id: "documentary", title: "Documentary", subtitle: "Real moments. Real people.", description: "The reactions, conversations and moments in between, photographed without interrupting them." },
];

export const GUIDE_PORTFOLIO_ALBUMS: LandingAlbum[] = ways.map((way) => {
  const source = stylesOfWork.find((album) => album.id === way.id);
  if (!source) throw new Error(`Missing portfolio collection: ${way.id}`);
  return { ...source, ...way };
});

export const GUIDE_HELP = [
  { title: "A timeline that leaves room", text: "We’ll leave time for portraits, family photographs and getting between venues." },
  { title: "Direction when you need it", text: "Simple direction for portraits. Space to be yourselves for the rest." },
  { title: "Your people, thoughtfully covered", text: "A family-photo list planned together. The reactions and conversations as they happen." },
];

const galleryPhoto = (slug: string, teaser?: number): Photo => {
  const gallery = GALLERIES.find((item) => item.slug === slug);
  const image = teaser === undefined ? gallery?.hero : gallery?.teasers[teaser];
  if (!image) throw new Error(`Missing guide photograph: ${slug}/${teaser ?? "hero"}`);
  return { src: image.url, alt: image.alt };
};

// Photographs already published in the website's complete wedding library.
export const GUIDE_IMAGES = {
  help: galleryPhoto("elisha-michael"),
  collections: {
    signature: { ...galleryPhoto("nicole-js"), alt: "A couple holding hands on a wet stone terrace, the bride’s veil lifting in the wind" },
    complete: galleryPhoto("luca-lauren", 3),
    "photo-film": galleryPhoto("eathon-jessica"),
  } as Record<string, Photo>,
  coverage: { ...galleryPhoto("elisha-michael", 1), alt: "Flowers and candles on a reception table, with vineyard rows beyond the tent" },
  contact: galleryPhoto("eathon-jessica", 3),
};

export const GUIDE_TIER_NOTES: Record<string, string> = {
  signature: "Preparations, vows, portraits and the main reception moments.",
  complete: "More time, a second photographer and a printed album.",
  "photo-film": "A longer day, with a dedicated filmmaker beside me.",
};
