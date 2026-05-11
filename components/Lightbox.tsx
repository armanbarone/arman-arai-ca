"use client";

import { useEffect } from "react";
import Image from "next/image";

interface Props {
  images: string[];
  current: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}

export default function Lightbox({ images, current, onClose, onPrev, onNext }: Props) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", handler);
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, onPrev, onNext]);

  return (
    <div
      className="lightbox-backdrop"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <button className="lightbox-close" onClick={onClose} aria-label="Close">✕</button>

      {images.length > 1 && (
        <>
          <button className="lightbox-nav lightbox-prev" onClick={onPrev} aria-label="Previous">‹</button>
          <button className="lightbox-nav lightbox-next" onClick={onNext} aria-label="Next">›</button>
        </>
      )}

      <div className="relative" style={{ maxWidth: "90vw", maxHeight: "90vh" }}>
        <Image
          src={images[current]}
          alt={`Photo ${current + 1}`}
          width={1200}
          height={900}
          className="lightbox-img"
          style={{ maxWidth: "90vw", maxHeight: "90vh", objectFit: "contain" }}
          priority
        />
      </div>

      {images.length > 1 && (
        <div
          className="fixed bottom-6 left-1/2 -translate-x-1/2 text-[0.62rem] tracking-[0.2em] uppercase"
          style={{ color: "rgba(247,243,236,0.4)" }}
        >
          {current + 1} / {images.length}
        </div>
      )}
    </div>
  );
}
