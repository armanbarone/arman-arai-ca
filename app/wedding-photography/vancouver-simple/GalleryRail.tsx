"use client";

import Image from "next/image";
import type { CSSProperties, KeyboardEvent } from "react";
import type { WorkPhoto } from "@/lib/ads/hub-work";
import styles from "./page.module.css";

export default function GalleryRail({ photos }: { photos: WorkPhoto[] }) {
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget || !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const rail = event.currentTarget;
    const slides = Array.from(rail.querySelectorAll<HTMLElement>("[data-gallery-photo]"));
    const centre = rail.getBoundingClientRect().left + rail.clientWidth / 2;
    const nearest = slides.reduce((best, slide, index) => {
      const box = slide.getBoundingClientRect(), chosen = slides[best].getBoundingClientRect();
      return Math.abs(box.left + box.width / 2 - centre) < Math.abs(chosen.left + chosen.width / 2 - centre) ? index : best;
    }, 0);
    const index = event.key === "Home" ? 0 : event.key === "End" ? slides.length - 1 : Math.max(0, Math.min(slides.length - 1, nearest + (event.key === "ArrowRight" ? 1 : -1)));
    const destination = slides[index].getBoundingClientRect();
    rail.scrollTo({
      left: rail.scrollLeft + destination.left + destination.width / 2 - centre,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
    });
  }

  return <div className={styles.galleryRail} role="region" aria-label="Vancouver wedding photographs" aria-describedby="gallery-hint" tabIndex={0} onKeyDown={onKeyDown}>
    {photos.map((photo, index) => <figure key={photo.src} data-gallery-photo={photo.src} style={{ "--photo-ratio": photo.width / photo.height } as CSSProperties}>
      <div className={styles.galleryPhoto}><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 700px) 84vw, 560px" quality={78} /></div>
      <figcaption>{String(index + 1).padStart(2, "0")} <span>/ {photos.length}</span></figcaption>
    </figure>)}
  </div>;
}
