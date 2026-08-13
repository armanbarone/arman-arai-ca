"use client";

import Image from "next/image";
import { useState } from "react";
import Lightbox from "./Lightbox";
import { at, type Photo } from "@/lib/images";

/* The two interactive photo blocks on the homepage, kept as small client
 * islands so the rest of the page stays a server component. Everything that
 * does not need state (the copy, the film strip, the price block) is rendered
 * on the server and ships no JavaScript at all. */

export function HeroGallery({ photos }: { photos: [Photo, Photo, Photo] }) {
  const [lb, setLb] = useState(-1);
  const [main, tr, br] = photos;
  const full = photos.map((p) => at(p.src, 2400));

  const captions = [
    "The quiet before everything",
    "A moment becoming a memory",
    "The light, when it happened",
  ];

  return (
    <>
      {lb >= 0 && (
        <Lightbox
          images={full}
          current={lb}
          onClose={() => setLb(-1)}
          onPrev={() => setLb((i) => Math.max(0, i - 1))}
          onNext={() => setLb((i) => Math.min(full.length - 1, i + 1))}
        />
      )}

      {/* Desktop: 3-photo grid */}
      <div
        className="hidden lg:grid order-2"
        style={{ gridTemplateColumns: "1.15fr 0.85fr", gridTemplateRows: "1fr 1fr", gap: "2px" }}
      >
        <div className="hero-grid-photo relative" style={{ gridRow: "1/3" }} onClick={() => setLb(0)}>
          <Image src={main.src} alt={main.alt} fill className="object-cover" sizes="35vw" quality={82} priority fetchPriority="high" />
          <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-sm">{captions[0]}</span></div>
        </div>
        <div className="hero-grid-photo relative" onClick={() => setLb(1)}>
          <Image src={tr.src} alt={tr.alt} fill className="object-cover" sizes="20vw" quality={80} />
          <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-xs">{captions[1]}</span></div>
        </div>
        <div className="hero-grid-photo relative" onClick={() => setLb(2)}>
          <Image src={br.src} alt={br.alt} fill className="object-cover" sizes="20vw" quality={80} loading="lazy" />
          <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-xs">{captions[2]}</span></div>
        </div>
      </div>

      {/* Mobile: one large frame, then two. Only the first is eager, because it
          is the only one above the fold on a phone. */}
      <div className="lg:hidden order-2 flex flex-col gap-0.5">
        <div className="relative w-full" style={{ height: "60vw", maxHeight: 340 }} onClick={() => setLb(0)}>
          <Image src={main.src} alt={main.alt} fill className="object-cover cursor-pointer" sizes="100vw" quality={80} priority fetchPriority="high" />
        </div>
        <div className="grid grid-cols-2 gap-0.5" style={{ height: "35vw", maxHeight: 200 }}>
          <div className="relative overflow-hidden" onClick={() => setLb(1)}>
            <Image src={tr.src} alt={tr.alt} fill className="object-cover cursor-pointer" sizes="50vw" quality={78} loading="lazy" />
          </div>
          <div className="relative overflow-hidden" onClick={() => setLb(2)}>
            <Image src={br.src} alt={br.alt} fill className="object-cover cursor-pointer" sizes="50vw" quality={78} loading="lazy" />
          </div>
        </div>
      </div>
    </>
  );
}

export function WorkGrid({ photos }: { photos: Photo[] }) {
  const [lb, setLb] = useState(-1);
  const full = photos.map((p) => at(p.src, 2400));

  return (
    <>
      {lb >= 0 && (
        <Lightbox
          images={full}
          current={lb}
          onClose={() => setLb(-1)}
          onPrev={() => setLb((i) => Math.max(0, i - 1))}
          onNext={() => setLb((i) => Math.min(full.length - 1, i + 1))}
        />
      )}
      <div className="portfolio-grid" style={{ gridTemplateRows: "repeat(6, 80px)" }}>
        {photos.map((ph, idx) => (
          <div key={ph.src} className={`grid-cell pg-${idx + 1}`} onClick={() => setLb(idx)}>
            <Image
              src={ph.src}
              alt={ph.alt}
              fill
              className="object-cover"
              sizes="(max-width:768px) 50vw, 25vw"
              quality={78}
              loading="lazy"
            />
            <div className="caption-overlay">
              <span className="font-serif italic text-cream/80 text-xs tracking-wide">Click to enlarge</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
