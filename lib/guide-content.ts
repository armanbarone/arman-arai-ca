import { stylesOfWork } from "@/app/wedding-photography/landing-content";
import type { LandingAlbum } from "@/app/wedding-photography/AlbumBrowser";

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
  { title: "A timeline that leaves room", text: "We’ll work out when photography should start and finish, leave time for portraits and family photographs, and account for travel between venues." },
  { title: "Direction when you need it", text: "You don’t need posing experience. I’ll give you clear, simple direction for portraits, then leave you space to be with your people." },
  { title: "Your people, thoughtfully covered", text: "We’ll prepare the family-photo list together. During the ceremony and celebrations, I’ll watch for the reactions and moments you might miss." },
];

export const GUIDE_COVERAGE_STEPS = [
  { title: "Start with the moments", text: "Think about the first and last moments you want photographed: preparations, the ceremony, speeches, a first dance or time on the dance floor." },
  { title: "Leave room between them", text: "Portraits, family groups and travel between venues take time. We’ll build those into the plan so the day can move at a comfortable pace." },
  { title: "Work out the hours together", text: "Send the timings you have, even if they’re rough. I’ll help you choose the start, finish and collection once we can see how the day fits together." },
];
