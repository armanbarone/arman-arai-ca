"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import Lightbox from "./Lightbox";

interface Props { images: string[]; }

type AnimState = "idle" | "flip-next" | "flip-prev-reset" | "flip-prev-enter";

export default function PageFlipAlbum({ images }: Props) {
  const spreads: [string, string | null][] = [];
  for (let i = 0; i < images.length; i += 2) {
    spreads.push([images[i], images[i + 1] ?? null]);
  }

  const [spread, setSpread] = useState(0);
  const [nextSpreadIdx, setNextSpreadIdx] = useState(1);
  const [anim, setAnim] = useState<AnimState>("idle");
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({ open: false, index: 0 });
  const [mobileIdx, setMobileIdx] = useState(0);

  const touchStartX = useRef(0);
  const touchStartY = useRef(0);
  const didSwipe = useRef(false);
  const isAnimating = anim !== "idle";

  const goNext = useCallback(() => {
    if (isAnimating || spread >= spreads.length - 1) return;
    const next = spread + 1;
    setNextSpreadIdx(next);
    setAnim("flip-next");
    setTimeout(() => { setSpread(next); setAnim("idle"); }, 920);
  }, [isAnimating, spread, spreads.length]);

  const goPrev = useCallback(() => {
    if (isAnimating || spread <= 0) return;
    const prev = spread - 1;
    setNextSpreadIdx(prev);
    setAnim("flip-prev-reset");
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setAnim("flip-prev-enter");
      setTimeout(() => { setSpread(prev); setAnim("idle"); }, 920);
    }));
  }, [isAnimating, spread]);

  const goToSpread = useCallback((idx: number) => {
    if (isAnimating || idx === spread) return;
    if (idx > spread) {
      setNextSpreadIdx(idx);
      setAnim("flip-next");
      setTimeout(() => { setSpread(idx); setAnim("idle"); }, 920);
    } else {
      setNextSpreadIdx(idx);
      setAnim("flip-prev-reset");
      requestAnimationFrame(() => requestAnimationFrame(() => {
        setAnim("flip-prev-enter");
        setTimeout(() => { setSpread(idx); setAnim("idle"); }, 920);
      }));
    }
  }, [isAnimating, spread]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goPrev]);

  const [leftImg, rightImg] = spreads[spread];
  const ns = spreads[nextSpreadIdx] ?? spreads[spread];

  // What shows through underneath during the flip
  const underneathLeft = ns[0];
  const underneathRight = ns[1];

  // The back face of the flipping page
  // For "next": back shows next spread's left image
  // For "prev": back shows current spread's right image (we're flipping it back)
  const backFaceImg = (anim === "flip-prev-reset" || anim === "flip-prev-enter")
    ? (spreads[nextSpreadIdx]?.[1] ?? spreads[nextSpreadIdx]?.[0] ?? "")
    : (ns[0] ?? "");

  const flipperClass =
    anim === "flip-next" ? "album-flipper flip-next"
    : anim === "flip-prev-reset" ? "album-flipper flip-prev-reset"
    : anim === "flip-prev-enter" ? "album-flipper flip-prev-enter"
    : "album-flipper";

  // Mobile swipe
  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
    didSwipe.current = false;
  }
  function onTouchMove(e: React.TouchEvent) {
    const dx = Math.abs(e.touches[0].clientX - touchStartX.current);
    const dy = Math.abs(e.touches[0].clientY - touchStartY.current);
    if (dx > dy && dx > 12) didSwipe.current = true;
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (!didSwipe.current) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45 && mobileIdx < images.length - 1) setMobileIdx(i => i + 1);
    else if (diff < -45 && mobileIdx > 0) setMobileIdx(i => i - 1);
  }

  const BlankPage = () => (
    <div style={{ width:"100%", height:"100%", background:"linear-gradient(145deg,#EDE8DF,#DDD5C5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <div style={{ textAlign:"center" }}>
        <span className="font-script text-blush/35" style={{ fontSize:"2.2rem", display:"block" }}>StillVows</span>
        <p className="text-[0.58rem] tracking-[0.2em] uppercase text-parchment mt-2">Wedding Photography</p>
      </div>
    </div>
  );

  return (
    <>
      {lightbox.open && (
        <Lightbox
          images={images}
          current={lightbox.index}
          onClose={() => setLightbox({ open: false, index: 0 })}
          onPrev={() => setLightbox(l => ({ ...l, index: Math.max(0, l.index - 1) }))}
          onNext={() => setLightbox(l => ({ ...l, index: Math.min(images.length - 1, l.index + 1) }))}
        />
      )}

      {/* ── DESKTOP ALBUM ── */}
      <div className="album-outer hidden lg:block">
        <div className="album-spine-cover" />

        <div className="album-book">
          {/* Underneath layer — shows during flip animation */}
          {anim !== "idle" && (
            <div style={{ position:"absolute", inset:0, display:"grid", gridTemplateColumns:"1fr 1fr", zIndex:0, pointerEvents:"none" }}>
              <div style={{ position:"relative", overflow:"hidden", background:"#1C1510" }}>
                {underneathLeft && <Image src={underneathLeft} alt="" fill style={{ objectFit:"cover" }} sizes="40vw" />}
              </div>
              <div style={{ position:"relative", overflow:"hidden", background:"#1C1510" }}>
                {underneathRight ? <Image src={underneathRight} alt="" fill style={{ objectFit:"cover" }} sizes="40vw" /> : <BlankPage />}
              </div>
            </div>
          )}

          {/* Left page — static */}
          <div className="album-left-page" style={{ zIndex:1, cursor:"pointer" }}
            onClick={() => !isAnimating && setLightbox({ open:true, index:spread*2 })}>
            <Image src={leftImg} alt={`Photo ${spread*2+1}`} fill style={{ objectFit:"cover" }} sizes="40vw" priority={spread===0} />
            <div className="caption-overlay"><span className="font-serif italic text-cream/70 text-xs">Click to enlarge</span></div>
          </div>

          {/* Right page — 3D flipper */}
          <div className="album-right-wrapper" style={{ zIndex: isAnimating ? 10 : 1 }}>
            <div className="album-flip-scene">
              <div className={flipperClass}>
                {/* Front face: current right page */}
                <div className="flip-face" style={{ cursor:"pointer" }}
                  onClick={() => !isAnimating && rightImg && setLightbox({ open:true, index:spread*2+1 })}>
                  {rightImg
                    ? <Image src={rightImg} alt={`Photo ${spread*2+2}`} fill style={{ objectFit:"cover" }} sizes="40vw" />
                    : <BlankPage />
                  }
                  {rightImg && <div className="caption-overlay"><span className="font-serif italic text-cream/70 text-xs">Click to enlarge</span></div>}
                </div>
                {/* Back face: next left page */}
                <div className="flip-face flip-face-back">
                  {backFaceImg
                    ? <Image src={backFaceImg} alt="Next page" fill style={{ objectFit:"cover" }} sizes="40vw" />
                    : <BlankPage />
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Gutter decoration */}
          <div className="album-gutter" />
          <div className="album-gutter-shadow-l" />
          <div className="album-gutter-shadow-r" />
        </div>

        {/* Nav */}
        <div className="album-nav">
          <button className="album-nav-btn" onClick={goPrev} disabled={spread===0||isAnimating}
            style={{ color: spread===0||isAnimating ? "#D9CEBC" : "#6B7280" }}>
            <span style={{ fontSize:"1.2rem" }}>‹</span> Previous
          </button>
          <div className="album-dots">
            {spreads.map((_,i) => (
              <button key={i} className={`album-dot ${i===spread?"active":""}`}
                onClick={() => goToSpread(i)} aria-label={`Spread ${i+1}`} />
            ))}
          </div>
          <button className="album-nav-btn" onClick={goNext} disabled={spread>=spreads.length-1||isAnimating}
            style={{ color: spread>=spreads.length-1||isAnimating ? "#D9CEBC" : "#6B7280" }}>
            Next <span style={{ fontSize:"1.2rem" }}>›</span>
          </button>
        </div>
        <p className="album-counter">{spread+1} of {spreads.length} &nbsp;·&nbsp; {images.length} photographs</p>
      </div>

      {/* ── MOBILE SWIPER ── */}
      <div className="lg:hidden">
        <div className="album-outer">
          <div className="album-spine-cover" />
          <div className="album-mobile-page"
            onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}
            onClick={() => setLightbox({ open:true, index:mobileIdx })}>
            <Image src={images[mobileIdx]} alt={`Photo ${mobileIdx+1}`} fill style={{ objectFit:"cover" }} sizes="100vw" priority />
            <div style={{ position:"absolute", inset:0, background:"linear-gradient(to top,rgba(44,36,32,0.4) 0%,transparent 40%)", display:"flex", alignItems:"flex-end", padding:"1rem 1.25rem" }}>
              <span className="font-serif italic text-cream/60 text-xs">Swipe to browse · Tap to enlarge</span>
            </div>
          </div>
        </div>
        <div className="album-nav mt-4">
          <button className="album-nav-btn" onClick={() => setMobileIdx(i=>Math.max(0,i-1))} disabled={mobileIdx===0}
            style={{ color:mobileIdx===0?"#D9CEBC":"#6B7280" }}>
            <span style={{ fontSize:"1.2rem" }}>‹</span>
          </button>
          <div className="album-dots" style={{ flexWrap:"wrap", justifyContent:"center", maxWidth:"200px" }}>
            {images.map((_,i) => (
              <button key={i} className={`album-dot ${i===mobileIdx?"active":""}`}
                onClick={() => setMobileIdx(i)} aria-label={`Photo ${i+1}`} />
            ))}
          </div>
          <button className="album-nav-btn" onClick={() => setMobileIdx(i=>Math.min(images.length-1,i+1))} disabled={mobileIdx>=images.length-1}
            style={{ color:mobileIdx>=images.length-1?"#D9CEBC":"#6B7280" }}>
            <span style={{ fontSize:"1.2rem" }}>›</span>
          </button>
        </div>
        <p className="album-counter">{mobileIdx+1} of {images.length}</p>
      </div>
    </>
  );
}
