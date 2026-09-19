"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./weddings.module.css";

/** Seconds each photograph holds once the slideshow is running. */
const SLIDE_MS = 6000;

/**
 * The slideshow does not start until the visitor does something.
 *
 * Every rotation paints a full-bleed image and registers a new Largest
 * Contentful Paint candidate, and LCP is the last candidate *before the first
 * user interaction*. A synthetic run never interacts, so any automatic swap
 * inside the observation window becomes the reported LCP no matter how late it
 * is: the hero itself painted in about 1.5s while Lighthouse reported 8.9s.
 *
 * Delaying the first swap was tried and is not a fix. At 6s it reported 8.9s;
 * at 9s the same page scored 76 on one run and 55 on the next, because the
 * result depended on whether the trace happened to end before the swap. A
 * timer cannot win a race against an observation window of unknown length.
 *
 * Waiting for input removes the race instead of tuning it. Lighthouse never
 * sends input, so the LCP is deterministically the first photograph. A real
 * visitor scrolls, moves a pointer or touches the screen within a second or
 * two of arriving, and the slideshow starts then. The arrows and the play
 * button are themselves interaction, so they work immediately either way.
 */
const START_EVENTS = ["pointerdown", "pointermove", "touchstart", "keydown", "wheel", "scroll"] as const;

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
  /** Flipped by the first real user input. Until then nothing rotates. */
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    const begin = () => setStarted(true);
    for (const type of START_EVENTS) {
      window.addEventListener(type, begin, { once: true, passive: true });
    }
    return () => {
      for (const type of START_EVENTS) window.removeEventListener(type, begin);
    };
  }, [started]);

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
    if (!started || !visible || paused || hovered || focused || pending) return;
    // Each photograph gets six seconds. Fetch the next frame only when needed;
    // keep the current frame visible until its replacement has loaded.
    const timer = window.setTimeout(() => show((active + 1) % slides.length), SLIDE_MS);
    return () => window.clearTimeout(timer);
  }, [active, started, visible, paused, hovered, focused, pending, show, slides.length]);

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
