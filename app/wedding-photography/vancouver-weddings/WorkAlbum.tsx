"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import type { WorkPhoto } from "@/lib/ads/hub-work";
import styles from "./landing.module.css";

/** The existing Vancouver album, one photograph at a time. No autoplay,
 *  blank cover or off-screen image downloads. Swipe, keys and buttons agree. */
export default function WorkAlbum({ photos }: { photos: WorkPhoto[] }) {
  const [index, setIndex] = useState(0);
  const touch = useRef<{ x: number; y: number } | null>(null);
  const go = (delta: number) => setIndex((current) => Math.max(0, Math.min(photos.length - 1, current + delta)));
  const photo = photos[index];

  return <div className={styles.workAlbum} role="region" aria-label="Vancouver and Sea-to-Sky photo album" aria-roledescription="carousel" tabIndex={0}
    onKeyDown={(event) => {
      if (event.target !== event.currentTarget) return;
      if (event.key === "ArrowRight" || event.key === "ArrowLeft") { event.preventDefault(); go(event.key === "ArrowRight" ? 1 : -1); }
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
      <Image key={photo.src} src={photo.src} alt={photo.alt} fill sizes="(max-width: 760px) 88vw, (max-width: 1440px) 52vw, 680px" quality={78} />
    </figure>
    <div className={styles.workControls}>
      <p aria-live="polite" aria-atomic="true">{String(index + 1).padStart(2, "0")} <span>/ {photos.length} photographs</span></p>
      <div><button type="button" aria-label="Previous Vancouver photograph" disabled={index === 0} onClick={() => go(-1)}>←</button><button type="button" aria-label="Next Vancouver photograph" disabled={index === photos.length - 1} onClick={() => go(1)}>→</button></div>
    </div>
    <p className={styles.swipeHint}>Swipe or use the arrows to turn the page.</p>
  </div>;
}
