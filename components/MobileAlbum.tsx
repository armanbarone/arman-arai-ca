"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  albumTitle: string;
  albumSubtitle: string;
  albumDate: string;
  images: string[];
}

export default function MobileAlbum({ albumTitle, albumSubtitle, albumDate, images }: Props) {
  // pages: cover (0), images (1..n), closing (n+1)
  const total = images.length + 2;
  const [cur, setCur] = useState(0);
  const [anim, setAnim] = useState<"in" | "out" | null>(null);

  const touchX = useRef<number | null>(null);

  const go = useCallback((next: number) => {
    if (next < 0 || next >= total) return;
    setAnim("out");
    setTimeout(() => {
      setCur(next);
      setAnim("in");
      setTimeout(() => setAnim(null), 300);
    }, 200);
  }, [total]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1);
    touchX.current = null;
  };

  const opacity = anim === "out" ? 0 : 1;

  const BK = "#191410";
  const BR = "rgba(184,149,106,";

  return (
    <div style={{ width: "100%", maxWidth: 480, margin: "0 auto" }}>
      {/* Book card */}
      <div
        style={{
          width: "100%", aspectRatio: "4/3", position: "relative", overflow: "hidden",
          background: BK,
          boxShadow: "0 16px 48px rgba(0,0,0,.7), 0 0 0 1px rgba(0,0,0,.3)",
          transition: "opacity 0.2s ease", opacity,
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Cover */}
        {cur === 0 && (
          <div style={{ position: "absolute", inset: 0, background: BK, display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem" }}>
            <div style={{ position: "absolute", inset: 12, border: `0.5px solid ${BR}.1)` }} />
            <div style={{ fontSize: 9, letterSpacing: ".38em", color: `${BR}.32)`, textTransform: "uppercase", marginBottom: 14, fontFamily: "var(--font-jost)" }}>{albumSubtitle}</div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 32, fontWeight: 300, color: "#e8dfd0", lineHeight: 1.08, fontStyle: "italic", marginBottom: 12 }}>{albumTitle}</div>
            <div style={{ width: 28, height: 0.5, background: `${BR}.25)`, marginBottom: 12 }} />
            <div style={{ fontSize: 9, letterSpacing: ".24em", color: `${BR}.28)`, textTransform: "uppercase", fontFamily: "var(--font-jost)" }}>{albumDate}</div>
          </div>
        )}

        {/* Images */}
        {cur > 0 && cur < total - 1 && (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[cur - 1]}
              alt=""
              draggable={false}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", pointerEvents: "none" }}
            />
            {/* vignette */}
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 85% 85% at 50% 50%, transparent 30%, rgba(0,0,0,.45) 100%)", pointerEvents: "none" }} />
            {/* scanlines */}
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px)", pointerEvents: "none" }} />
            {/* page counter */}
            <div style={{ position: "absolute", top: 10, right: 12, fontFamily: "var(--font-jost)", fontSize: 7, letterSpacing: ".18em", textTransform: "uppercase", color: `${BR}.38)` }}>
              {String(cur).padStart(2,"0")} / {String(images.length).padStart(2,"0")}
            </div>
          </>
        )}

        {/* Closing */}
        {cur === total - 1 && (
          <div style={{ position: "absolute", inset: 0, background: "#e8dfd0", display: "flex", flexDirection: "column", justifyContent: "center", padding: "2rem" }}>
            <div style={{ height: 0.5, background: "rgba(110,82,58,.12)", marginBottom: 18 }} />
            <div style={{ fontFamily: "var(--font-serif)", fontSize: 13, fontWeight: 300, fontStyle: "italic", color: "#5a4636", lineHeight: 2.1, marginBottom: 18 }}>
              Thank you for letting me<br />disappear into your day.
            </div>
            <div style={{ height: 0.5, background: "rgba(110,82,58,.1)" }} />
            <div style={{ fontSize: 9, letterSpacing: ".22em", color: "rgba(110,82,58,.22)", textTransform: "uppercase", marginTop: 16, fontFamily: "var(--font-jost)" }}>armanarai.com</div>
          </div>
        )}

        {/* Tap zones */}
        <div style={{ position: "absolute", inset: 0, display: "flex", pointerEvents: "none" }}>
          <div style={{ flex: 1, pointerEvents: "auto", cursor: cur > 0 ? "pointer" : "default" }} onClick={() => go(cur - 1)} />
          <div style={{ flex: 1, pointerEvents: "auto", cursor: cur < total - 1 ? "pointer" : "default" }} onClick={() => go(cur + 1)} />
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20, marginTop: 14 }}>
        <button
          onClick={() => go(cur - 1)} disabled={cur === 0}
          style={{ background: "transparent", border: "0.5px solid rgba(150,120,90,.28)", color: "#9a7f60", width: 34, height: 34, cursor: cur === 0 ? "default" : "pointer", fontSize: 14, opacity: cur === 0 ? 0.18 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Previous"
        >←</button>
        <div style={{ display: "flex", gap: 5, alignItems: "center" }}>
          {Array.from({ length: total }).map((_, i) => (
            <div key={i} onClick={() => go(i)} style={{ width: i === cur ? 16 : 5, height: 5, background: i === cur ? "#B8956A" : "rgba(184,149,106,.25)", transition: "all 0.3s", cursor: "pointer" }} />
          ))}
        </div>
        <button
          onClick={() => go(cur + 1)} disabled={cur === total - 1}
          style={{ background: "transparent", border: "0.5px solid rgba(150,120,90,.28)", color: "#9a7f60", width: 34, height: 34, cursor: cur === total - 1 ? "default" : "pointer", fontSize: 14, opacity: cur === total - 1 ? 0.18 : 1, display: "flex", alignItems: "center", justifyContent: "center" }}
          aria-label="Next"
        >→</button>
      </div>
      <div style={{ textAlign: "center", marginTop: 8, fontSize: 9, letterSpacing: ".2em", color: "rgba(140,110,80,.25)", textTransform: "uppercase" }}>
        Tap sides to turn · swipe to navigate
      </div>
    </div>
  );
}
