"use client";

import { useState, useRef, useCallback } from "react";

interface Props {
  albumTitle: string;
  albumSubtitle: string;
  albumDate: string;
  images: string[];
}

// Single-page 16:9 album for landscape/widescreen images
// Each image occupies the full spread; no left/right split
export default function WideAlbum({ albumTitle, albumSubtitle, albumDate, images }: Props) {
  const total = images.length + 2; // cover + images + closing
  const [cur, setCur] = useState(0);
  const [busy, setBusy] = useState(false);
  const [dir, setDir] = useState<1 | -1>(1);

  const touchX = useRef<number | null>(null);
  const BK = "#191410";
  const BR = "rgba(184,149,106,";

  const go = useCallback((next: number, direction: 1 | -1 = 1) => {
    if (busy || next < 0 || next >= total) return;
    setBusy(true);
    setDir(direction);
    setTimeout(() => {
      setCur(next);
      setBusy(false);
    }, 480);
  }, [busy, total]);

  const onTouchStart = (e: React.TouchEvent) => { touchX.current = e.touches[0].clientX; };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) go(dx < 0 ? cur + 1 : cur - 1, dx < 0 ? 1 : -1);
    touchX.current = null;
  };

  const btnStyle: React.CSSProperties = {
    background: "transparent",
    border: "0.5px solid rgba(150,120,90,.3)",
    color: "#9a7f60", width: 36, height: 36,
    fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .22s", cursor: "pointer", fontFamily: "inherit",
    flexShrink: 0,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16, width: "100%" }}>
      {/* Book — 16:9 wide format */}
      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: 960,
          aspectRatio: "16/9",
          boxShadow: "0 24px 56px rgba(0,0,0,.65), 0 0 0 1px rgba(0,0,0,.3)",
          overflow: "hidden",
          background: BK,
        }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {/* Current page */}
        <div style={{
          position: "absolute", inset: 0,
          transition: busy ? `transform 0.48s cubic-bezier(.645,.045,.355,1), opacity 0.48s` : "none",
          transform: busy ? `translateX(${dir === 1 ? "-60px" : "60px"}) scale(0.97)` : "translateX(0) scale(1)",
          opacity: busy ? 0 : 1,
        }}>
          {/* COVER */}
          {cur === 0 && (
            <div style={{ width: "100%", height: "100%", background: BK, position: "relative", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(2rem,5vw,4rem)" }}>
              <div style={{ position: "absolute", inset: 16, border: `0.5px solid ${BR}.08)` }} />
              <div style={{ fontSize: "clamp(8px,1vw,11px)", letterSpacing: ".38em", color: `${BR}.32)`, textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-jost)" }}>{albumSubtitle}</div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(2rem,5vw,4.5rem)", fontWeight: 300, color: "#e8dfd0", lineHeight: 1.05, fontStyle: "italic", marginBottom: 16 }}>{albumTitle}</div>
              <div style={{ width: 36, height: 0.5, background: `${BR}.22)`, marginBottom: 14 }} />
              <div style={{ fontSize: "clamp(8px,1vw,11px)", letterSpacing: ".24em", color: `${BR}.28)`, textTransform: "uppercase", fontFamily: "var(--font-jost)" }}>{albumDate}</div>
            </div>
          )}

          {/* IMAGE PAGE */}
          {cur > 0 && cur < total - 1 && (
            <div style={{ width: "100%", height: "100%", position: "relative", overflow: "hidden", background: "#0a0806" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={images[cur - 1]}
                alt=""
                draggable={false}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", userSelect: "none", pointerEvents: "none" }}
              />
              {/* vignette */}
              <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 90% 90% at 50% 50%, transparent 40%, rgba(0,0,0,.4) 100%)", pointerEvents: "none" }} />
              {/* scanlines */}
              <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.015) 3px,rgba(0,0,0,.015) 4px)", pointerEvents: "none" }} />
              {/* counter */}
              <div style={{ position: "absolute", top: 14, right: 16, fontFamily: "var(--font-jost)", fontSize: 9, letterSpacing: ".2em", textTransform: "uppercase", color: `${BR}.4)` }}>
                {String(cur).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
              </div>
            </div>
          )}

          {/* CLOSING */}
          {cur === total - 1 && (
            <div style={{ width: "100%", height: "100%", background: "#e8dfd0", display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(2rem,5vw,5rem)" }}>
              <div style={{ height: 0.5, background: "rgba(110,82,58,.12)", marginBottom: 20 }} />
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(0.9rem,2vw,1.1rem)", fontWeight: 300, fontStyle: "italic", color: "#5a4636", lineHeight: 2.1, marginBottom: 20 }}>
                Thank you for letting me<br />disappear into your day.
              </div>
              <div style={{ height: 0.5, background: "rgba(110,82,58,.1)" }} />
              <div style={{ fontSize: "clamp(7px,.9vw,10px)", letterSpacing: ".22em", color: "rgba(110,82,58,.22)", textTransform: "uppercase", marginTop: 18, fontFamily: "var(--font-jost)" }}>armanarai.com</div>
            </div>
          )}
        </div>

        {/* Horizontal center seam — subtle book spine feel */}
        <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 2, transform: "translateX(-50%)", background: "linear-gradient(90deg, transparent, rgba(0,0,0,.12), transparent)", pointerEvents: "none", zIndex: 5 }} />
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <button
          style={{ ...btnStyle, opacity: cur === 0 ? 0.18 : 1, cursor: cur === 0 ? "default" : "pointer" }}
          onClick={() => go(cur - 1, -1)} disabled={cur === 0} aria-label="Previous"
        >←</button>
        <div style={{ fontSize: 11, letterSpacing: ".24em", color: "rgba(140,110,80,.45)", textTransform: "uppercase", minWidth: 160, textAlign: "center" }}>
          {cur === 0 ? "Cover" : cur === total - 1 ? "Fin" : `${cur} of ${images.length}`}
        </div>
        <button
          style={{ ...btnStyle, opacity: cur === total - 1 ? 0.18 : 1, cursor: cur === total - 1 ? "default" : "pointer" }}
          onClick={() => go(cur + 1, 1)} disabled={cur === total - 1} aria-label="Next"
        >→</button>
      </div>
      <div style={{ fontSize: 10, letterSpacing: ".2em", color: "rgba(140,110,80,.25)", textTransform: "uppercase" }}>
        Click arrows to turn pages
      </div>
    </div>
  );
}
