import { ANALOGUE, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, type Photo } from "@/lib/images";
import { GALLERIES } from "@/lib/galleries";
import type { LandingAlbum } from "./AlbumBrowser";

/* Content the pricing-request pages share. It lived in CityWeddingLanding,
   the old ads template, until those pages were removed on 2026-09-30. */

export const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;

const styleAlbum = (id: string, title: string, subtitle: string, photos: Photo[], cover: number): LandingAlbum => ({
  id, title, subtitle, cover: photos[cover], chapters: [{ title: `${title} · The complete collection`, photos }],
});
export const stylesOfWork = [
  styleAlbum("editorial", "Editorial", "Intentional light. Beautiful portraits.", EDITORIAL, 2),
  styleAlbum("documentary", "Documentary", "The day, as it happens.", DOCUMENTARY, 7),
  styleAlbum("film", "Film inspired", "Warm colour. A softer feeling.", FILM, 19),
  styleAlbum("analogue", "1980s film", "Grain, texture and nostalgia.", ANALOGUE, 4),
  styleAlbum("fine-art", "Fine art", "Soft light. A little romance.", DREAMY_FINE_ART, 17),
];

// Keep the albums' actual locations when ordering them for each market.
export const weddingAlbumsFor = (slugs: string[]): LandingAlbum[] => slugs.map((slug) => {
  const gallery = GALLERIES.find((item) => item.slug === slug)!;
  return { id: slug, title: gallery.names, subtitle: gallery.location, cover: { src: gallery.cover.url, alt: gallery.cover.alt }, chapters: gallery.chapters.map((chapter) => ({ title: chapter.title, photos: chapter.images.map((photo) => ({ src: photo.url, alt: photo.alt, width: photo.w, height: photo.h })) })) };
});

/* The one-line promise under the hours, per collection. Keyed by slug so a
   renamed or added tier fails visibly here rather than silently rendering the
   wrong label. */
export const TIER_STRAP: Record<string, string> = {
  signature: "Photography + film + an engagement session",
  complete: "Two photographers, a film and an album",
  "photo-film": "A dedicated filmmaker on the day",
};

export const POSING_QUESTION = [
  "We’re not comfortable posing. Will you help?",
  "Yes. I’ll give you clear, simple direction for portraits, including where to stand and what to do with your hands. During the ceremony and celebrations, you can focus on your guests while I photograph what happens.",
];
