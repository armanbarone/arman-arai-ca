"use client";

import dynamic from "next/dynamic";
import WhenVisible from "@/components/promo/WhenVisible";
import { DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, allAt } from "@/lib/images";

/* The flipbook is the heaviest thing below the fold on a landing page: a
 * page-turn component's worth of JS plus the first photographs of a book nobody
 * has scrolled to. Loading it on demand keeps it out of the initial bundle, and
 * WhenVisible holds the mount until it is nearly on screen, so a visitor who
 * never scrolls that far pays nothing for it at all. `ssr: false` because the
 * flip album paints through refs and has nothing useful to render on a server.
 */
const PhotoFlipAlbum = dynamic(() => import("@/components/PhotoFlipAlbum"), { ssr: false });
const MobileAlbum = dynamic(() => import("@/components/MobileAlbum"), { ssr: false });

/* ── The hero conveyor ──────────────────────────────────────────────────────
 * Three frames ride one clock, so the order here is the order a visitor sees.
 * The first three are what is on screen at load and are chosen deliberately: a
 * wide room, a close portrait, a reception. Everything after them rotates in.
 *
 * These are rendered through next/image, so they are Photo objects with their
 * own alt text rather than bare URLs.
 */
const HERO_FRAMES = [
  EDITORIAL[2],   // backlit couple, foreheads together
  DOCUMENTARY[7], // guests laughing with champagne
  FILM[5],        // the candlelit banquet table
  DREAMY_FINE_ART[8],
  EDITORIAL[5],   // bride at the candlelit head table
  DOCUMENTARY[10],// dark chapel aisle lined with candles
  FILM[19],       // garden ceremony, guests standing
  DREAMY_FINE_ART[17],
  EDITORIAL[12],
  DOCUMENTARY[8], // the toast
];

export const HERO_POOL = HERO_FRAMES.map((ph) => ph.src);
export const HERO_ALTS = HERO_FRAMES.map((ph) => ph.alt);

/* ── The album ──────────────────────────────────────────────────────────────
 * The flip album renders plain <img> inside a 3D transform, where next/image
 * cannot be used, so the frames are requested at one fixed width rather than
 * letting a 2400px original land in a 500px page.
 */
const ALBUM_FRAMES = [
  DOCUMENTARY[0], EDITORIAL[2], DREAMY_FINE_ART[0], FILM[3],
  DOCUMENTARY[1], EDITORIAL[5], DREAMY_FINE_ART[8], FILM[2],
  DOCUMENTARY[10], EDITORIAL[9], DREAMY_FINE_ART[17], FILM[19],
  DOCUMENTARY[7], EDITORIAL[11], DREAMY_FINE_ART[11], FILM[5],
  DOCUMENTARY[9], EDITORIAL[4], DREAMY_FINE_ART[18], FILM[16],
];

const ALBUM = allAt(ALBUM_FRAMES, 1200);

export function WeddingWorkAlbum() {
  return (
    <WhenVisible minHeight={700}>
      <div className="hidden md:flex justify-center">
        <PhotoFlipAlbum
          albumTitle="A Canadian Wedding"
          albumSubtitle="Montréal · Toronto · Vancouver"
          albumDate="Arman Arai · 2027–2028"
          images={ALBUM}
        />
      </div>
      <div className="md:hidden">
        <MobileAlbum
          albumTitle="A Canadian Wedding"
          albumSubtitle="Montréal · Toronto · Vancouver"
          albumDate="Arman Arai · 2027–2028"
          images={ALBUM}
        />
      </div>
    </WhenVisible>
  );
}
