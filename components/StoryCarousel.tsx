"use client";

import { useState, useEffect, useCallback } from "react";

interface Props {
  images: { src: string; alt: string }[];
}

export default function StoryCarousel({ images }: Props) {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((next: number) => {
    if (animating) return;
    setAnimating(true);
    setTimeout(() => {
      setCurrent(next);
      setAnimating(false);
    }, 400);
  }, [animating]);

  const prev = () => go((current - 1 + images.length) % images.length);
  const next = () => go((current + 1) % images.length);

  // Auto-advance
  useEffect(() => {
    const id = setInterval(() => {
      go((current + 1) % images.length);
    }, 5000);
    return () => clearInterval(id);
  }, [current, go, images.length]);

  return (
    <div className="relative overflow-hidden" style={{ height: "clamp(400px,55vw,650px)" }}>
      {/* Images */}
      {images.map((img, i) => (
        <div
          key={i}
          style={{
            position: "absolute", inset: 0,
            opacity: i === current ? (animating ? 0 : 1) : 0,
            transition: "opacity 0.6s ease",
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.src}
            alt={img.alt}
            draggable={false}
            style={{
              width: "100%", height: "100%",
              objectFit: "cover", display: "block",
              userSelect: "none",
            }}
          />
          {/* warm vignette */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(8,7,4,0.35) 0%, transparent 50%)",
            pointerEvents: "none",
          }} />
        </div>
      ))}

      {/* Prev / Next */}
      <button
        onClick={prev}
        aria-label="Previous image"
        style={{
          position: "absolute", left: "1rem", top: "50%", transform: "translateY(-50%)",
          background: "rgba(8,7,4,0.5)", border: "0.5px solid rgba(184,149,106,0.2)",
          color: "rgba(232,224,208,0.7)", width: "36px", height: "36px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 10, backdropFilter: "blur(4px)",
          transition: "color 0.2s, border-color 0.2s",
          fontSize: "0.9rem",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#B8956A"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#B8956A"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,224,208,0.7)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(184,149,106,0.2)"; }}
      >
        ‹
      </button>
      <button
        onClick={next}
        aria-label="Next image"
        style={{
          position: "absolute", right: "1rem", top: "50%", transform: "translateY(-50%)",
          background: "rgba(8,7,4,0.5)", border: "0.5px solid rgba(184,149,106,0.2)",
          color: "rgba(232,224,208,0.7)", width: "36px", height: "36px",
          display: "flex", alignItems: "center", justifyContent: "center",
          cursor: "pointer", zIndex: 10, backdropFilter: "blur(4px)",
          transition: "color 0.2s, border-color 0.2s",
          fontSize: "0.9rem",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#B8956A"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#B8956A"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "rgba(232,224,208,0.7)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(184,149,106,0.2)"; }}
      >
        ›
      </button>

      {/* Dot indicators */}
      <div style={{
        position: "absolute", bottom: "1rem", left: 0, right: 0,
        display: "flex", justifyContent: "center", gap: "6px", zIndex: 10,
      }}>
        {images.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Go to image ${i + 1}`}
            style={{
              width: i === current ? "20px" : "5px",
              height: "5px",
              background: i === current ? "#B8956A" : "rgba(232,224,208,0.3)",
              border: "none", cursor: "pointer", padding: 0,
              transition: "all 0.35s ease",
            }}
          />
        ))}
      </div>

      {/* Frame counter — editorial touch */}
      <div style={{
        position: "absolute", top: "1rem", right: "1rem", zIndex: 10,
        fontFamily: "var(--font-jost)", fontSize: "7px",
        letterSpacing: "0.18em", textTransform: "uppercase",
        color: "rgba(184,149,106,0.5)",
      }}>
        {String(current + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
      </div>
    </div>
  );
}
