"use client";

import PhotoFlipAlbum from "@/components/PhotoFlipAlbum";
import MobileAlbum from "@/components/MobileAlbum";
import WideAlbum from "@/components/WideAlbum";
import { allAt } from "@/lib/images";
import type { LandingAlbum } from "./AlbumBrowser";
import styles from "./vancouver-weddings/landing.module.css";

export default function PortfolioBook({ album }: { album: LandingAlbum }) {
  const props = { albumTitle: album.title, albumSubtitle: album.bookSubtitle ?? album.subtitle, albumDate: "Arman Arai · Canada", images: allAt(album.chapters.flatMap((chapter) => chapter.photos), 1200), siteLabel: "armanarai.ca", touchTargetSize: 44, controlColor: "#bcb09f" };
  return <div className={styles.portfolioBook} role="region" aria-label={`${album.title} shortened portfolio album`}>
    {album.bookFormat === "wide" ? <WideAlbum {...props} counterWidth={96} /> : <>
      <div className={styles.desktopBook}><PhotoFlipAlbum {...props} width={800} /></div>
      <div className={styles.mobileBook}><MobileAlbum {...props} /></div>
    </>}
  </div>;
}
