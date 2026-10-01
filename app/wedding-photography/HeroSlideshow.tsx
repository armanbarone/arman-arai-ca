"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { HeroPhoto } from "@/lib/ads/city-wedding-pages";
import funnel from "./inquiry.module.css";

/* The hero photograph rolls through the city's photos, one into the next
   (owner, 2026-10-01). Only the first is in the page's HTML, at full priority,
   so the first screen loads exactly as fast as a single photo. The next photo
   is added to the page only once the page has finished loading and the
   browser is idle, and each photo after that only once the one before it is
   showing, so at most one extra photo is ever downloading. A photo is never
   shown before it has loaded, so the hero never flashes empty. Holds still for
   anyone who asks their system for reduced motion, and while the tab is
   hidden. */

const HOLD_MS = 5200;

export default function HeroSlideshow({ photos, sizes }: { photos: HeroPhoto[]; sizes: string }) {
  const [active, setActive] = useState(0);
  // How many photos are in the page. The first is always; the rest arrive one at a time.
  const [mounted, setMounted] = useState(1);
  const [loaded, setLoaded] = useState<Set<number>>(() => new Set([0]));
  const [ready, setReady] = useState(false);

  // Start only after the page itself has loaded, then wait for an idle moment.
  useEffect(() => {
    if (photos.length < 2) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
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
  }, [photos.length]);

  // Fetch the photo after the one showing.
  const next = (active + 1) % photos.length;
  useEffect(() => {
    if (ready) setMounted((count) => Math.max(count, Math.min(next + 1, photos.length)));
  }, [ready, next, photos.length]);

  // Hold while the tab is in the background; start the hold again on return.
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const update = () => setVisible(!document.hidden);
    update();
    document.addEventListener("visibilitychange", update);
    return () => document.removeEventListener("visibilitychange", update);
  }, []);

  // Move on after the hold, but only to a photo that has finished loading.
  const nextLoaded = loaded.has(next);
  useEffect(() => {
    if (!ready || !visible || !nextLoaded) return;
    const timer = window.setTimeout(() => setActive(next), HOLD_MS);
    return () => window.clearTimeout(timer);
  }, [ready, visible, nextLoaded, next]);

  return (
    <>
      {photos.slice(0, mounted).map((photo, index) => (
        <Image
          key={photo.src}
          src={photo.src}
          alt={photo.alt}
          aria-hidden={index === active ? undefined : true}
          className={`${funnel.slide} ${index === active ? funnel.slideActive : ""}`}
          style={photo.position ? { objectPosition: photo.position } : undefined}
          fill
          quality={68}
          sizes={sizes}
          {...(index === 0 ? { priority: true, fetchPriority: "high" as const } : { loading: "eager" as const, fetchPriority: "low" as const })}
          onLoad={index === 0 ? undefined : () => setLoaded((set) => new Set(set).add(index))}
        />
      ))}
    </>
  );
}
