"use client";

import { useEffect } from "react";

// The Elopement Gazette: "marauder" reveal (slow blur+sepia ink-in), headline
// letter-by-letter ink-in, and pointer tilt on the framed moving picture.
// Content is server-rendered fully visible; this only animates on hydration and
// is skipped entirely under prefers-reduced-motion (CSS also forces visible).
export default function GazetteMotion() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;

    const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";
    const DUR = 2600;
    const STAGGER = 340;

    const els = Array.from(document.querySelectorAll<HTMLElement>(".gz-root [data-gz-reveal]"));

    // hide
    for (const el of els) {
      if (el.dataset.gzState) continue;
      el.style.transition = "none";
      if (el.dataset.gzFx === "line") {
        el.style.transform = "scaleX(0)";
        el.style.transformOrigin = "left";
        el.style.opacity = "1";
        el.style.filter = "none";
      } else {
        el.style.opacity = "0";
        el.style.transform = "none";
        el.style.filter = "blur(14px) sepia(0.9)";
      }
      el.dataset.gzState = "hidden";
    }

    const inView = (el: HTMLElement) => {
      const r = el.getBoundingClientRect();
      return (r.width || r.height) && r.top < window.innerHeight * 0.94;
    };

    const scan = () => {
      for (const el of els) {
        if (el.dataset.gzState === "shown") continue;
        if (!inView(el)) continue;
        el.dataset.gzState = "shown";
        void el.offsetHeight; // commit hidden state before transition
        const order = parseFloat(el.dataset.gzOrder || "0");
        const delay = Math.round(order * STAGGER) + 150;
        const dur = el.dataset.gzFx === "line" ? Math.max(DUR, 1400) : DUR;
        el.style.transition =
          `opacity ${dur}ms ${EASE} ${delay}ms, transform ${dur}ms ${EASE} ${delay}ms, filter ${dur}ms ${EASE} ${delay}ms`;
        el.style.opacity = "1";
        el.style.transform = el.dataset.gzFx === "line" ? "scaleX(1)" : "none";
        el.style.filter = "none";
      }
    };
    scan();

    // headline letters: ink-in per character
    const chars = Array.from(document.querySelectorAll<HTMLElement>(".gz-root .gz-ch"));
    chars.forEach((c, i) => {
      c.style.animation = `gzInkIn 2600ms ease ${500 + i * 55}ms both`;
    });

    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => { raf = 0; scan(); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    const sweep = window.setInterval(onScroll, 600);

    // pointer tilt on the framed moving picture (desktop, non-touch)
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    let onMove: ((e: MouseEvent) => void) | null = null;
    if (!isTouch) {
      const depth = Array.from(document.querySelectorAll<HTMLElement>(".gz-root [data-gz-depth]"));
      onMove = (e: MouseEvent) => {
        const mx = e.clientX / window.innerWidth - 0.5;
        const my = e.clientY / window.innerHeight - 0.5;
        for (const el of depth) {
          el.style.transform = `perspective(1400px) rotateY(${(mx * 3.2).toFixed(2)}deg) rotateX(${(-my * 2.2).toFixed(2)}deg)`;
        }
      };
      window.addEventListener("mousemove", onMove);
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.clearInterval(sweep);
      if (raf) cancelAnimationFrame(raf);
      if (onMove) window.removeEventListener("mousemove", onMove);
    };
  }, []);

  return null;
}
