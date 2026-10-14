"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function HeroHeadline() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const text = heading.current;
    const hero = text?.closest("figure");
    if (!text || !hero) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    const update = () => {
      frame = 0;
      const bounds = hero.getBoundingClientRect();
      const shift = reducedMotion.matches ? 0 : Math.min(100, Math.max(0, -bounds.top) * 0.18);
      text.style.setProperty("--headline-shift", `${shift.toFixed(1)}px`);
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    reducedMotion.addEventListener("change", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      reducedMotion.removeEventListener("change", schedule);
    };
  }, []);

  return <figcaption className={styles.heroCaption}>
    <h1 ref={heading} className={styles.heroHeadline}><span>Live</span><span>Your Dream</span><em>Wedding</em></h1>
  </figcaption>;
}
