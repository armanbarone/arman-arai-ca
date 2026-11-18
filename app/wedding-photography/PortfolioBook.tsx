"use client";

import PhotoFlipAlbum from "@/components/PhotoFlipAlbum";
import MobileAlbum from "@/components/MobileAlbum";
import WideAlbum from "@/components/WideAlbum";
import { LANDING_DESKTOP_WIDTH, LANDING_MOBILE_WIDTH } from "@/components/LandingImage";
import { allAt } from "@/lib/images";
import type { LandingAlbum } from "./AlbumBrowser";
import styles from "./vancouver-weddings/landing.module.css";

export default function PortfolioBook({ album, twoImageSizes }: { album: LandingAlbum; twoImageSizes?: boolean }) {
  const photos = album.chapters.flatMap((chapter) => chapter.photos);
  const desktopImages = allAt(photos, LANDING_DESKTOP_WIDTH);
  const mobileImages = twoImageSizes ? allAt(photos, LANDING_MOBILE_WIDTH) : undefined;
  const props = { albumTitle: album.title, albumSubtitle: album.bookSubtitle ?? album.subtitle, albumDate: "Arman Arai · Canada", images: desktopImages, siteLabel: "armanarai.ca", touchTargetSize: 44, controlColor: "#bcb09f" };
  return <div className={styles.portfolioBook} role="region" aria-label={`${album.title} shortened portfolio album`}>
    {album.bookFormat === "wide" ? <WideAlbum {...props} mobileImages={mobileImages} counterWidth={96} /> : <>
      <div className={styles.desktopBook}><PhotoFlipAlbum {...props} width={800} /></div>
      <div className={styles.mobileBook}><MobileAlbum {...props} images={mobileImages ?? desktopImages} /></div>
    </>}
  </div>;
}
