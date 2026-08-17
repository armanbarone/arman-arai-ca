"use client";

import Image from "next/image";
import { useState, useEffect, CSSProperties } from "react";
import { useLightbox } from "./LightboxProvider";

/**
 * The Experience-section carousel. Below the fold, so it hydrates as its own
 * island without touching the hero's paint. Opens the shared lightbox on click.
 */
export default function ExperienceCarousel({ images, alts }: { images: string[]; alts: string[] }) {
  const { open } = useLightbox();
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setI(p => (p + 1) % images.length), 4500);
    return () => clearInterval(id);
  }, [paused, images.length]);

  const go = (n: number) => setI((n + images.length) % images.length);

  const arrowStyle: CSSProperties = {
    position: "absolute", top: "50%", transform: "translateY(-50%)", zIndex: 10,
    width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center",
    background: "color-mix(in srgb, var(--bg) 40%, transparent)", color: "var(--text)", border: "0.5px solid color-mix(in srgb, var(--text) 25%, transparent)",
    fontSize: "1.4rem", lineHeight: 1, cursor: "pointer", backdropFilter: "blur(2px)",
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ aspectRatio: "2 / 3", maxHeight: "clamp(420px, 60vw, 720px)", border: "0.5px solid var(--hairline)", background: "var(--surface)" }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {images.map((src, idx) => (
        <Image
          key={src}
          src={src}
          alt={alts[idx] ?? "A designed elopement scene by Arman Arai"}
          fill
          className="object-contain cursor-pointer transition-opacity duration-[900ms]"
          style={{ opacity: idx === i ? 1 : 0 }}
          sizes="(max-width:1024px) 100vw, 45vw"
          onClick={() => open(images, i)}
          loading="lazy"
        />
      ))}
      <button style={{ ...arrowStyle, left: 12 }} aria-label="Previous image"
        onClick={() => go(i - 1)}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.background = "color-mix(in srgb, var(--bg) 40%, transparent)")}>‹</button>
      <button style={{ ...arrowStyle, right: 12 }} aria-label="Next image"
        onClick={() => go(i + 1)}
        onMouseEnter={e => (e.currentTarget.style.background = "var(--accent)")}
        onMouseLeave={e => (e.currentTarget.style.background = "color-mix(in srgb, var(--bg) 40%, transparent)")}>›</button>
      <div className="absolute left-0 right-0 flex justify-center gap-0 z-10" style={{ bottom: 10 }}>
        {images.map((_, idx) => (
          <button key={idx} aria-label={`Show image ${idx + 1}`} onClick={() => setI(idx)}
            style={{ width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center", border: "none", cursor: "pointer", padding: 0, background: "transparent" }}>
            <span style={{ width: 7, height: 7, borderRadius: 999, background: idx === i ? "var(--accent)" : "color-mix(in srgb, var(--text) 55%, transparent)", transition: "background 0.3s" }} />
          </button>
        ))}
      </div>
    </div>
  );
}
