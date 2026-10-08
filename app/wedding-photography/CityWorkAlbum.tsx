"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { Photo } from "@/lib/images";
import styles from "./vancouver-weddings/landing.module.css";

/** vancouver-weddings/WorkAlbum.tsx, for every city: the same album, one
 *  photograph at a time, with the city in its labels. `sizes` is capped
 *  (owner, 2026-10-03: "optimized version for mobile/desktop and not the full
 *  original image"): a phone asks for about 1080px, a retina desktop for
 *  1200px, instead of the 1920px variant the uncapped 52vw reached. */
export default function CityWorkAlbum({ photos, place }: { photos: (Photo & { collection?: string })[]; place: string }) {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (delta: number) => setIndex((current) => Math.max(0, Math.min(photos.length - 1, current + delta)));
  const photo = photos[index];

  return <div className={styles.workAlbum} role="region" aria-label={`${place} photo album`} aria-roledescription="carousel" tabIndex={0}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(event.key === "ArrowRight" ? 1 : -1); }
      if (event.key === "Home" || event.key === "End") { event.preventDefault(); setIndex(event.key === "Home" ? 0 : photos.length - 1); }
    }}
    onTouchStart={(event) => { const point = event.touches[0]; touch.current = { x: point.clientX, y: point.clientY }; }}
    onTouchEnd={(event) => {
      const point = event.changedTouches[0], start = touch.current;
      touch.current = null;
      if (!start) return;
      const dx = point.clientX - start.x, dy = point.clientY - start.y;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) go(dx < 0 ? 1 : -1);
    }}>
    <figure className={styles.workFrame}>
      <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 88vw, 600px" quality={72} />
    </figure>
    <div className={styles.workControls}>
      <p aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, "0")} <span>/ {photos.length} photographs</span>{photo.collection && <span className={styles.workCollection}>{photo.collection}</span>}</p>
      <div><button type="button" aria-label={`Previous ${place} photograph`} disabled={index === 0} onClick={() => go(-1)}>←</button><button type="button" aria-label={`Next ${place} photograph`} disabled={index === photos.length - 1} onClick={() => go(1)}>→</button></div>
    </div>
    <p className={styles.swipeHint}>Swipe or use the arrows to turn the page.</p>
  </div>;
}
