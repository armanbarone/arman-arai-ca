"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./weddings.module.css";

export default function HeroGallery({ slides }: { slides: { src: string; alt: string; position: string }[] }) {
  const region = useRef<HTMLElement>(null);
  const requested = useRef(0);
  const ready = useRef(new Set<number>());
  const [active, setActive] = useState(0);
  const [mounted, setMounted] = useState([0]);
  const [pending, setPending] = useState(false);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  useEffect(() => {
    let inView = false;
    const updateVisibility = () => setVisible(inView && !document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      updateVisibility();
    }, { threshold: 0.15 });
    if (region.current) observer.observe(region.current);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const show = useCallback((index: number, manual = false) => {
    requested.current = index;
    if (manual) setPaused(true);
    setAnnouncement(manual ? `Photograph ${index + 1} of ${slides.length}` : "");
    if (ready.current.has(index)) { setActive(index); setPending(false); }
    else {
      setPending(true);
      setMounted((items) => items.includes(index) ? items : [...items, index]);
    }
  }, [slides.length]);

  useEffect(() => {
    if (!visible || paused || hovered || focused || pending) return;
    // Each photograph gets six seconds. Fetch the next frame only when needed;
    // keep the current frame visible until its replacement has loaded.
    const timer = window.setTimeout(() => show((active + 1) % slides.length), 6000);
    return () => window.clearTimeout(timer);
  }, [active, visible, paused, hovered, focused, pending, show, slides.length]);

  return (
    <figure ref={region} className={styles.heroPhoto} role="region" aria-roledescription="carousel" aria-label="Wedding photographs"
      onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onFocusCapture={() => setFocused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false); }}>
      {mounted.map((index) => (
        <Image key={slides[index].src} src={slides[index].src}
          alt={index === active ? slides[index].alt : ""} aria-hidden={index !== active}
          fill quality={75} sizes="(max-width: 760px) 88vw, (max-width: 1600px) 50vw, 800px"
          {...(index === 0 ? { priority: true, fetchPriority: "high" as const } : { loading: "eager" as const, fetchPriority: "low" as const })}
          className={styles.heroSlide} style={{ opacity: index === active ? 1 : 0, objectPosition: slides[index].position }}
          onLoad={() => {
            ready.current.add(index);
            if (requested.current === index) { setActive(index); setPending(false); }
          }}
          onError={() => { if (requested.current === index) { setPending(false); setPaused(true); } }} />
      ))}
      <figcaption className={styles.heroCaption}>
        <span>For the day you’ll always come back to.</span>
        <div className={styles.heroControls}>
          <span className={styles.slideCount} aria-hidden="true">{String(active + 1).padStart(2, "0")} / 05</span>
          <button type="button" aria-label="Previous photograph" onClick={() => show((active + slides.length - 1) % slides.length, true)}>←</button>
          <button type="button" aria-label={paused ? "Play slideshow" : "Pause slideshow"} onClick={() => {
            if (paused) { setFocused(false); setHovered(false); setPaused(false); }
            else setPaused(true);
          }}>{paused ? "▷" : "Ⅱ"}</button>
          <button type="button" aria-label="Next photograph" onClick={() => show((active + 1) % slides.length, true)}>→</button>
        </div>
      </figcaption>
      <span className={styles.visuallyHidden} role="status">{announcement}</span>
    </figure>
  );
}
