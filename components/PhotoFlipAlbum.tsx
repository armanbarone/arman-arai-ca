"use client";

import { useState, useRef, useCallback, useEffect, useMemo } from "react";

interface Props {
  albumTitle: string;
  albumSubtitle: string;
  albumDate: string;
  images: string[];
}

const BK = "#191410";
const CR = "#e8dfd0";
const BR = "rgba(184,149,106,";
const MU = "rgba(110,82,58,";

const VG = `
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse 85% 85% at 50% 50%,transparent 28%,rgba(0,0,0,.42) 100%);pointer-events:none"></div>
  <div style="position:absolute;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(0,0,0,.02) 3px,rgba(0,0,0,.02) 4px);pointer-events:none"></div>
`;

function imagePage(src: string, caption?: string): string {
  return `<div style="width:100%;height:100%;background:#0a0806;position:relative;overflow:hidden">
    <img src="${src}" alt="" draggable="false" style="width:100%;height:100%;object-fit:cover;display:block;pointer-events:none;user-select:none" />
    ${VG}
    ${caption ? `<div style="position:absolute;bottom:12px;left:14px;right:14px;font-size:10px;letter-spacing:.16em;color:rgba(232,212,172,.32);font-style:italic;font-family:var(--font-serif)">${caption}</div>` : ""}
  </div>`;
}

function coverLeft(title: string, sub: string, date: string): string {
  return `<div style="width:100%;height:100%;background:${BK};position:relative">
    <div style="position:absolute;right:24px;bottom:24px;width:1px;height:54px;background:${BR}.18)"></div>
    <div style="position:absolute;top:24px;left:24px;width:1px;height:40px;background:${BR}.1)"></div>
    <div style="position:absolute;bottom:28px;left:30px;font-size:10px;letter-spacing:.3em;color:${BR}.22);text-transform:uppercase;font-family:var(--font-sans)">Arman Arai</div>
  </div>`;
}

function coverRight(title: string, sub: string, date: string): string {
  return `<div style="width:100%;height:100%;background:${BK};position:relative">
    <div style="position:absolute;inset:14px;border:0.5px solid ${BR}.1)"></div>
    <div style="position:absolute;top:50%;left:36px;right:36px;transform:translateY(-50%)">
      <div style="font-size:10px;letter-spacing:.38em;color:${BR}.35);text-transform:uppercase;margin-bottom:14px;font-family:var(--font-sans)">${sub}</div>
      <div style="font-family:var(--font-serif);font-size:38px;font-weight:300;color:${CR};line-height:1.05;font-style:italic;margin-bottom:12px">${title}</div>
      <div style="width:32px;height:0.5px;background:${BR}.25);margin-bottom:12px"></div>
      <div style="font-size:10px;letter-spacing:.24em;color:${BR}.28);text-transform:uppercase;font-family:var(--font-sans)">${date}</div>
    </div>
  </div>`;
}

function closingLeft(): string {
  return `<div style="width:100%;height:100%;background:${CR};position:relative">
    <div style="position:absolute;inset:0;display:flex;flex-direction:column;justify-content:center;padding:40px 28px;box-sizing:border-box">
      <div style="height:0.5px;background:${MU}.12);margin-bottom:18px"></div>
      <div style="font-family:var(--font-serif);font-size:14px;font-weight:300;font-style:italic;color:#5a4636;line-height:2.1;margin-bottom:18px">Thank you for letting me<br>disappear into your day.</div>
      <div style="height:0.5px;background:${MU}.1)"></div>
      <div style="font-size:10px;letter-spacing:.22em;color:${MU}.22);text-transform:uppercase;margin-top:16px;font-family:var(--font-sans)">armanarai.com</div>
    </div>
  </div>`;
}

function closingRight(): string {
  return `<div style="width:100%;height:100%;background:${BK};position:relative">
    <div style="position:absolute;inset:14px;border:0.5px solid ${BR}.07)"></div>
    <div style="position:absolute;bottom:30px;left:32px;font-family:var(--font-serif);font-size:26px;font-weight:300;font-style:italic;color:rgba(232,218,204,.13)">fin.</div>
  </div>`;
}

export default function PhotoFlipAlbum({ albumTitle, albumSubtitle, albumDate, images }: Props) {
  // Memoised so `paint` keeps a stable identity and the effect below does not
  // re-run on every render.
  const spreads = useMemo(() => {
    const out: { L: string; R: string; lbl: string }[] = [
      {
        L: coverLeft(albumTitle, albumSubtitle, albumDate),
        R: coverRight(albumTitle, albumSubtitle, albumDate),
        lbl: "Cover",
      },
    ];
    // Image spreads, two per spread
    for (let i = 0; i < images.length; i += 2) {
      const n = Math.floor(i / 2) + 1;
      const hasRight = i + 1 < images.length;
      out.push({
        L: imagePage(images[i]),
        R: hasRight ? imagePage(images[i + 1]) : closingRight(),
        lbl: `${n} of ${Math.ceil(images.length / 2)}`,
      });
    }
    out.push({ L: closingLeft(), R: closingRight(), lbl: "Fin" });
    return out;
  }, [albumTitle, albumSubtitle, albumDate, images]);

  const [cur, setCur] = useState(0);
  const [busy, setBusy] = useState(false);

  const pLRef = useRef<HTMLDivElement>(null);
  const pRRef = useRef<HTMLDivElement>(null);
  const flRef = useRef<HTMLDivElement>(null);
  const fFRef = useRef<HTMLDivElement>(null);
  const fBRef = useRef<HTMLDivElement>(null);

  const paint = useCallback((n: number) => {
    if (pLRef.current) pLRef.current.innerHTML = spreads[n].L;
    if (pRRef.current) pRRef.current.innerHTML = spreads[n].R;
  }, [spreads]);

  const goFwd = useCallback(() => {
    if (busy || cur >= spreads.length - 1 || !flRef.current || !fFRef.current || !fBRef.current || !pRRef.current) return;
    setBusy(true);

    fFRef.current.innerHTML = spreads[cur].R;
    fBRef.current.innerHTML = spreads[cur + 1].L;
    flRef.current.style.transition = "none";
    flRef.current.style.transform = "rotateY(0deg)";
    flRef.current.style.display = "block";
    pRRef.current.style.visibility = "hidden";

    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!flRef.current) return;
      flRef.current.style.transition = "transform .72s cubic-bezier(.645,.045,.355,1)";
      flRef.current.style.transform = "rotateY(-180deg)";
    }));

    setTimeout(() => {
      const next = cur + 1;
      setCur(next);
      if (pLRef.current) pLRef.current.innerHTML = spreads[next].L;
      if (pRRef.current) {
        pRRef.current.innerHTML = spreads[next].R;
        pRRef.current.style.visibility = "visible";
      }
      if (flRef.current) {
        flRef.current.style.display = "none";
        flRef.current.style.transition = "none";
      }
      setBusy(false);
    }, 760);
  }, [busy, cur, spreads]);

  const goBack = useCallback(() => {
    if (busy || cur <= 0) return;
    setBusy(true);
    const prev = cur - 1;
    setCur(prev);
    if (pLRef.current) {
      pLRef.current.style.opacity = "0";
      pLRef.current.innerHTML = spreads[prev].L;
      requestAnimationFrame(() => { if (pLRef.current) pLRef.current.style.opacity = "1"; });
    }
    if (pRRef.current) {
      pRRef.current.style.opacity = "0";
      pRRef.current.innerHTML = spreads[prev].R;
      requestAnimationFrame(() => { if (pRRef.current) pRRef.current.style.opacity = "1"; });
    }
    setTimeout(() => setBusy(false), 460);
  }, [busy, cur, spreads]);

  /* Paint the current spread AFTER commit.
   *
   * This used to be a setTimeout scheduled during render, guarded by a ref. Both
   * pages are filled imperatively through innerHTML, so the server sends two
   * empty divs; if that timer fired before hydration attached the refs, paint()
   * wrote to null and the album stayed blank until goFwd repainted it. That is
   * exactly the bug: the book was empty on /portfolio until you clicked next.
   *
   * An effect cannot run before the refs exist, so this is correct by
   * construction. It also repaints if the album's images ever change. */
  useEffect(() => {
    paint(cur);
  }, [paint, cur]);

  const btnStyle: React.CSSProperties = {
    background: "transparent", border: "0.5px solid rgba(150,120,90,.3)",
    color: "#9a7f60", width: 36, height: 36, cursor: "pointer",
    fontSize: 15, display: "flex", alignItems: "center", justifyContent: "center",
    transition: "all .22s", flexShrink: 0, fontFamily: "inherit",
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
      {/* Book */}
      <div style={{ perspective: "2200px", overflowX: "auto", maxWidth: "100%" }}>
        <div style={{
          position: "relative", width: 960, height: 627, display: "flex",
          boxShadow: "0 24px 56px rgba(0,0,0,.65), 0 0 0 1px rgba(0,0,0,.3)",
          transformStyle: "preserve-3d",
        }}>
          <div ref={pLRef} style={{ width: 480, height: 627, overflow: "hidden", position: "relative", flexShrink: 0 }} />
          <div ref={pRRef} style={{ width: 480, height: 627, overflow: "hidden", position: "relative", flexShrink: 0, transition: "opacity .4s" }} />
          {/* Gutter */}
          <div style={{ position: "absolute", left: "50%", top: 0, bottom: 0, width: 4, transform: "translateX(-50%)", background: "linear-gradient(90deg,rgba(0,0,0,.24),rgba(0,0,0,.04),rgba(0,0,0,.2))", zIndex: 5, pointerEvents: "none" }} />
          {/* Flip element */}
          <div ref={flRef} style={{ position: "absolute", left: 480, top: 0, width: 480, height: 627, transformStyle: "preserve-3d", transformOrigin: "left center", transform: "rotateY(0deg)", display: "none", zIndex: 10 }}>
            <div ref={fFRef} style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", overflow: "hidden" }} />
            <div ref={fBRef} style={{ position: "absolute", inset: 0, backfaceVisibility: "hidden", transform: "rotateY(180deg)", overflow: "hidden" }} />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
        <button style={{ ...btnStyle, opacity: cur === 0 ? 0.18 : 1, cursor: cur === 0 ? "default" : "pointer" }}
          onClick={goBack} disabled={cur === 0} aria-label="Previous spread">←</button>
        <div style={{ fontSize: 11, letterSpacing: ".24em", color: "rgba(140,110,80,.45)", textTransform: "uppercase", minWidth: 170, textAlign: "center" }}>
          {spreads[cur]?.lbl}
        </div>
        <button style={{ ...btnStyle, opacity: cur === spreads.length - 1 ? 0.18 : 1, cursor: cur === spreads.length - 1 ? "default" : "pointer" }}
          onClick={goFwd} disabled={cur === spreads.length - 1} aria-label="Next spread">→</button>
      </div>
      <div style={{ fontSize: 10, letterSpacing: ".2em", color: "rgba(140,110,80,.25)", textTransform: "uppercase" }}>
        Click arrows to turn pages
      </div>
    </div>
  );
}
