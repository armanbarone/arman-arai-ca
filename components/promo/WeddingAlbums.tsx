"use client";

import dynamic from "next/dynamic";
import WhenVisible from "@/components/promo/WhenVisible";
import { ANALOGUE, allAt } from "@/lib/images";

/* The flipbook is the heaviest thing below the fold on a landing page: a
 * page-turn component's worth of JS plus the first photographs of a book nobody
 * has scrolled to. Loading it on demand keeps it out of the initial bundle, and
 * WhenVisible holds the mount until it is nearly on screen, so a visitor who
 * never scrolls that far pays nothing for it at all. `ssr: false` because the
 * flip album paints through refs and has nothing useful to render on a server.
 */
const PhotoFlipAlbum = dynamic(() => import("@/components/PhotoFlipAlbum"), { ssr: false });
const MobileAlbum = dynamic(() => import("@/components/MobileAlbum"), { ssr: false });

/* Album III from the portfolio, "1980s Film". The flip album renders plain
 * <img> inside a 3D transform, where next/image cannot be used, so the frames
 * are requested at one fixed width rather than letting a full-size original
 * land in a 500px page. 1000px is the honest number for how large these are
 * ever drawn, and it is what /portfolio asks for too. */
const ALBUM = allAt(ANALOGUE, 1000);

const TITLE = "1980s Film";
const SUBTITLE = "Expired Stock";
const CREDIT = "Arman Arai";

export function WeddingWorkAlbum() {
  return (
    <WhenVisible minHeight={700}>
      <div className="hidden md:flex justify-center">
        <PhotoFlipAlbum albumTitle={TITLE} albumSubtitle={SUBTITLE} albumDate={CREDIT} images={ALBUM} />
      </div>
      <div className="md:hidden">
        <MobileAlbum albumTitle={TITLE} albumSubtitle={SUBTITLE} albumDate={CREDIT} images={ALBUM} />
      </div>
    </WhenVisible>
  );
}
