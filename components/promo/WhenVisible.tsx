"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Render children only once the block is close to the viewport.
 *
 * The albums are the heaviest thing on a promo page: a few hundred KB of JS and
 * the first photographs of two books nobody has scrolled to yet. Holding them
 * back keeps them out of the initial paint and out of Lighthouse's main-thread
 * budget, and `minHeight` reserves the space so nothing jumps when they arrive.
 */
export default function WhenVisible({
  minHeight,
  rootMargin = "400px",
  children,
}: {
  minHeight: number | string;
  rootMargin?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (show) return;
    const el = ref.current;
    // No IntersectionObserver (very old browser, or a crawler): render it.
    if (!el || typeof IntersectionObserver === "undefined") { setShow(true); return; }
    const io = new IntersectionObserver(
      (entries) => { if (entries.some((e) => e.isIntersecting)) { setShow(true); io.disconnect(); } },
      { rootMargin },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [show, rootMargin]);

  return (
    <div ref={ref} style={show ? undefined : { minHeight }}>
      {show ? children : null}
    </div>
  );
}
