"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";

/* ────────────────────────────────────────────────────────────────────────────
   The homepage hero frames, driven as one conveyor rather than three
   independent slideshows.

   On every tick the queue shifts by one: the photograph in the big frame
   leaves, the second frame's photograph moves into it, the third frame's moves
   into the second, and a new photograph enters the third. Nothing changes at
   random, and all three frames move on the same beat, so a single timer at
   module level drives every frame on the page.

   Performance rule: the page must load exactly as fast as it did when each
   frame held one static photograph. Only the photograph a frame starts with is
   rendered at mount, so the initial load fetches the same three files it always
   did. Everything after that mounts once the conveyor has started.

   The frames are deliberately inert: no click, no touch, no lightbox, no
   pointer cursor. They cannot be swiped or enlarged.
   ──────────────────────────────────────────────────────────────────────────── */

const FIRST_TICK_MS = 3000;
const TICK_MS = 5000;

// ── one shared clock for every frame on the page ──
let offset = 0;
let running = false;
const listeners = new Set<() => void>();

export const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};
export const getSnapshot = () => offset;
export const getServerSnapshot = () => 0;
export { startConveyor };

function startConveyor() {
  if (running || typeof window === "undefined") return;
  // This deliberately runs even under prefers-reduced-motion. The transition is
  // opacity only, with no movement, scaling or parallax, which is the class of
  // animation that setting exists to suppress. Holding the hero still meant
  // anyone with Windows "animation effects" switched off never saw it change.
  running = true;
  const tick = (delay: number) =>
    window.setTimeout(() => {
      offset += 1;
      listeners.forEach((l) => l());
      tick(TICK_MS);
    }, delay);
  tick(FIRST_TICK_MS);
}

interface Props {
  /** The shared queue. Every frame receives the same list. */
  pool: string[];
  /** 0 is the big frame, then 1 and 2 down the right-hand column. */
  position: number;
  alt: string;
  sizes: string;
  /** Only the LCP frame should set this. */
  priority?: boolean;
  objectPosition?: string;
}

export default function HeroCycler({
  pool,
  position,
  alt,
  sizes,
  priority = false,
  objectPosition = "center center",
}: Props) {
  const off = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const current = (off + position) % pool.length;

  const [shown, setShown] = useState(current);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [moved, setMoved] = useState(false);

  useEffect(() => {
    startConveyor();
  }, []);

  // Hold the departing photograph for the length of the fade so the two
  // crossfade, rather than one blinking out before the other arrives.
  useEffect(() => {
    if (shown === current) return;
    setOutgoing(shown);
    setShown(current);
    setMoved(true);
    const t = window.setTimeout(() => setOutgoing(null), 1200);
    return () => window.clearTimeout(t);
  }, [current, shown]);

  // The photograph arriving on the next tick, mounted a whole interval early so
  // it is decoded before it is needed. Held back until the conveyor has moved
  // once, so it costs nothing during the initial page load.
  const upcoming = moved ? (current + 1) % pool.length : null;

  const frames = Array.from(
    new Set([shown, outgoing, upcoming].filter((n): n is number => n !== null)),
  );

  return (
    <>
      {frames.map((i) => (
        <Image
          key={pool[i]}
          src={pool[i]}
          // Only the photograph on screen is described; the one fading out and
          // the one waiting stay out of the accessibility tree.
          alt={i === shown ? alt : ""}
          aria-hidden={i === shown ? undefined : true}
          fill
          sizes={sizes}
          quality={82}
          {...(priority && i === current && !moved
            ? { priority: true }
            : { loading: "lazy" as const })}
          className="object-cover"
          style={{
            objectPosition,
            opacity: i === shown ? 1 : 0,
            // transform is listed too so the frame's hover-scale keeps its
            // easing; an inline transition would otherwise replace the one in
            // globals.css
            transition:
              "opacity 1100ms ease-in-out, transform 700ms cubic-bezier(0.25,0.46,0.45,0.94)",
          }}
        />
      ))}
    </>
  );
}
