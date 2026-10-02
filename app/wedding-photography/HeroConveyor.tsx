"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroPhoto } from "@/lib/ads/city-wedding-pages";
import funnel from "./inquiry.module.css";

/* The hero's two frames, driven as one conveyor, like the homepage's
   HeroCycler (owner, 2026-10-01: the photo in the small frame moves into the
   large frame and a new photo takes the small frame). The large frame shows
   photo n, the small frame photo n+1; on each beat both move up one.

   Loading: only the two starting photos are in the page's HTML, so the first
   screen costs exactly what it did with two still photos. The next photo for
   each frame is added only once the page has loaded and the browser is idle,
   and a beat waits until both incoming photos have finished loading, so a
   frame never fades to an empty box. At most two extra photos download at a
   time. It runs for reduced motion too (opacity only, nothing moves: see
   HeroCycler) and holds while the tab is hidden. */

const HOLD_MS = 5000;

type Frame = { className: string; sizes: string; caption?: string; offset: number };

export default function HeroConveyor({ photos, large, small }: {
  photos: HeroPhoto[];
  large: { className: string; sizes: string; caption: string };
  small: { className: string; sizes: string };
}) {
  const n = photos.length;
  // The large frame shows photos[step % n]; the small frame the one after it.
  const [step, setStep] = useState(0);
  const [ready, setReady] = useState(false);
  const [visible, setVisible] = useState(true);
  // Keys "<offset>:<photo>" of the images that have finished loading. The two
  // server-rendered starting photos count as loaded: they are on screen.
  const [loaded, setLoaded] = useState<Set<string>>(() => new Set(["0:0", `1:${1 % n}`]));

  // Start only after the page itself has loaded, then wait for an idle moment.
  useEffect(() => {
    if (n < 3) return;
    // Safari has no requestIdleCallback; a short timeout stands in for it.
    const hasIdle = typeof window.requestIdleCallback === "function";
    let handle: number | undefined;
    const start = () => {
      handle = hasIdle ? window.requestIdleCallback(() => setReady(true), { timeout: 2500 }) : window.setTimeout(() => setReady(true), 1200);
    };
    if (document.readyState === "complete") start();
    else window.addEventListener("load", start, { once: true });
    return () => {
      window.removeEventListener("load", start);
      if (handle === undefined) return;
      if (hasIdle) window.cancelIdleCallback(handle);
      else window.clearTimeout(handle);
    };
  }, [n]);

  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // The next beat waits for both incoming photos.
  const incoming = [`0:${(step + 1) % n}`, `1:${(step + 2) % n}`];
  const incomingLoaded = incoming.every((key) => loaded.has(key));
  useEffect(() => {
    if (!ready || !visible || !incomingLoaded) return;
    const timer = window.setTimeout(() => setStep((current) => current + 1), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [ready, visible, incomingLoaded, step]);

  const frame = ({ className, sizes, caption, offset }: Frame) => {
    const shown = (step + offset) % n;
    // The photo leaving stays mounted so the two cross-fade; the next one is
    // mounted a whole beat early so it has loaded before it is needed.
    const mounted = [...new Set([step > 0 ? (shown - 1 + n) % n : -1, shown, ready ? (shown + 1) % n : -1])].filter((i) => i >= 0);
    return (
      <figure className={className}>
        {mounted.map((i) => {
          const key = `${offset}:${i}`;
          const first = step === 0 && i === shown;
          return (
            <Image
              key={key}
              src={photos[i].src}
              alt={photos[i].alt}
              aria-hidden={i === shown ? undefined : true}
              className={`${funnel.slide} ${i === shown ? funnel.slideActive : ""}`}
              // Each photo's own crop belongs to the large frame's wide phone crop.
              style={offset === 0 && photos[i].position ? { objectPosition: photos[i].position } : undefined}
              fill
              quality={68}
              sizes={sizes}
              {...(first && offset === 0 ? { priority: true, fetchPriority: "high" as const } : first ? {} : { loading: "eager" as const, fetchPriority: "low" as const })}
              onLoad={first ? undefined : () => setLoaded((set) => (set.has(key) ? set : new Set(set).add(key)))}
            />
          );
        })}
        {caption ? <figcaption>{caption}</figcaption> : null}
      </figure>
    );
  };

  return (
    <>
      {frame({ ...large, offset: 0 })}
      {frame({ ...small, offset: 1 })}
    </>
  );
}
