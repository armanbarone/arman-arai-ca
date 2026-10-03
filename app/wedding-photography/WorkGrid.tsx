"use client";

import Image from "next/image";
import { useState } from "react";
import type { WorkPhoto } from "@/lib/ads/hub-work";
import funnel from "./inquiry.module.css";

/* Samples of similar work from the city hubs (lib/ads/hub-work.ts). Twelve
   show at first and the rest wait behind one button, so a 36-photo album
   does not turn the page into a scroll of thumbnails. Every image is lazy:
   none of them is on the first screen. */

const FIRST = 12;

export default function WorkGrid({ photos, place }: { photos: WorkPhoto[]; place: string }) {
  const [all, setAll] = useState(false);
  const shown = all ? photos : photos.slice(0, FIRST);
  return <>
    <div className={funnel.workGrid}>
      {shown.map((photo) => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} quality={70} loading="lazy" sizes="(max-width: 760px) 48vw, (max-width: 1440px) 30vw, 440px" /></figure>)}
    </div>
    {photos.length > FIRST && !all
      ? <button type="button" className={funnel.workMore} onClick={() => setAll(true)}>See all {photos.length} photographs from {place} <span aria-hidden="true">↓</span></button>
      : null}
  </>;
}
