"use client";

import { useEffect, useRef } from "react";
import styles from "./page.module.css";

export default function HeroHeadline() {
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const text = heading.current;
    if (!text) return;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      // Movement starts with the first scroll, including while the header is
      // still visible. Reduced motion keeps a shorter, directly linked drift.
      const shift = Math.min(reducedMotion.matches ? 60 : 160, Math.max(0, window.scrollY) * (reducedMotion.matches ? 0.12 : 0.32));
      text.style.setProperty("--headline-shift", `${shift.toFixed(1)}px`);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    reducedMotion.addEventListener("change", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      reducedMotion.removeEventListener("change", update);
    };
  }, []);

  return <figcaption className={styles.heroCaption}>
    <h1 ref={heading} className={styles.heroHeadline}><span>Live</span><span>Your Dream</span><em>Wedding</em></h1>
  </figcaption>;
}
