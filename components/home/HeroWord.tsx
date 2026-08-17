"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { subscribe, getSnapshot, getServerSnapshot, startConveyor } from "./HeroCycler";

/**
 * The rotating word in "A sacred union with ____".
 *
 * It reads the SAME clock the photographs run on rather than keeping a timer of
 * its own, so the word and the frame always change together. Two independent
 * intervals drift apart within a minute no matter how closely the durations are
 * matched, which is what made the word land on the wrong picture.
 *
 * The cross-fade is a CSS transition driven by state, not a keyframe animation:
 * a keyframe restarts from frame zero on every re-render.
 */

/* The .com's list is elopement register: mountains, the wild, something older.
   A wedding happens in a room, in front of people, so this one is the register
   of witness rather than of wilderness. */
const WORDS = [
  "each other",
  "everyone you love",
  "the whole room",
  "your families",
  "the people who raised you",
  "the ones who came",
  "the day itself",
  "the light in that room",
  "the noise of it",
  "the years ahead",
  "the moment",
  "the promise",
  "the witnesses",
  "the long table",
  "the last song",
  "what you said out loud",
] as const;

const LONGEST = WORDS.reduce((a, b) => (b.length > a.length ? b : a));

export default function HeroWord() {
  const off = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const target = off % WORDS.length;

  const [i, setI] = useState(target);
  const [shown, setShown] = useState(true);

  useEffect(() => {
    startConveyor();
  }, []);

  // Fade out, swap, fade back in, so the word does not hard-cut on the tick.
  useEffect(() => {
    if (i === target) return;
    setShown(false);
    const t = window.setTimeout(() => {
      setI(target);
      setShown(true);
    }, 420);
    return () => window.clearTimeout(t);
  }, [target, i]);

  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      {/* Reserves the longest word's width so the headline never reflows. */}
      <span className="dr-flourish" aria-hidden style={{ visibility: "hidden" }}>
        {LONGEST}
      </span>
      <span
        className="dr-flourish"
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          whiteSpace: "nowrap",
          opacity: shown ? 1 : 0,
          transform: shown ? "translateY(0)" : "translateY(7px)",
          transition: "opacity 0.42s ease, transform 0.42s ease",
        }}
      >
        {WORDS[i]}
      </span>
    </span>
  );
}
