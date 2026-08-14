"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Gallery, GalleryImage } from "@/lib/galleries";

/* ────────────────────────────────────────────────────────────────────────────
   One 35mm film strip per wedding, running off both edges of the screen.

   Three independent motion layers, all load-bearing:
     a) film advance — scroll-linked parallax, one shared rAF loop for the page
     b) continuous drift — a sine oscillation so the roll keeps moving at rest
     c) develop-in — frames come up like a print in developer, staggered
        left-to-right along the film

   Nothing here animates the page. Every transform is on a strip or a frame.
   ──────────────────────────────────────────────────────────────────────────── */

const MOBILE_BP = 860;

// Frame geometry. The strip mixes wide and tall frames because width comes from
// each photograph's own orientation.
const D = { frameH: 340, gap: 5, padX: 22, padY: 24, runOut: 260, drift: 16 };
const M = { frameH: 270, gap: 4, padX: 18, padY: 20, runOut: 120, drift: 8 };
const COVER_W = { l: 530, p: 252 };
const TEASER_W = { l: 460, p: 228 };
const M_TEASER_W = { l: 300, p: 196 };
const M_COVER_W = 196; // a landscape cover cannot fit between the fades on a phone

const EASE = "cubic-bezier(.25,.46,.45,.94)";

function coverWidth(img: GalleryImage, mobile: boolean) {
  return mobile ? M_COVER_W : COVER_W[img.orientation];
}

/* The run-in spacer centres the cover frame in the viewport at rest, which is
   what stops the parallax swing from ever carrying the cover (and its label)
   under either fade mask. All three terms have to stay viewport-relative or the
   geometry breaks at some width. */
function runIn(img: GalleryImage, mobile: boolean) {
  return mobile
    ? `max(40px, calc(50vw - ${M_COVER_W / 2 + M.padX}px))`
    : `max(96px, calc(50vw - ${coverWidth(img, false) / 2 + D.padX}px))`;
}

type Frame = { img: GalleryImage; cover: boolean; label: string; aria?: string };

function buildFrames(g: Gallery, mobile: boolean): Frame[] {
  const teasers = mobile ? g.teasers.slice(0, 1) : g.teasers.slice(0, 3);
  return [
    {
      img: g.cover,
      cover: true,
      label: "★ 01A",
      aria: `Open the album: ${g.names}, ${g.location}, ${g.date}`,
    },
    ...teasers.map((img, i) => ({ img, cover: false, label: `0${i + 2}A` })),
  ];
}

export default function AlbumStrips({
  galleries,
  basePath = "/galleries",
}: {
  galleries: Gallery[];
  basePath?: string;
}) {
  // SSR-safe desktop default; the mobile tree only renders after mount so there
  // is no hydration mismatch.
  const [mobile, setMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const strips = useRef<HTMLDivElement[]>([]);
  const reduced = useRef(false);

  useEffect(() => {
    setMounted(true);
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const mq = window.matchMedia(`(max-width: ${MOBILE_BP - 1}px)`);
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Registry is rebuilt whenever the layout switches, otherwise it holds
  // unmounted nodes from the tree that was just torn down.
  const register = useCallback((el: HTMLDivElement | null, i: number) => {
    if (el) strips.current[i] = el;
  }, []);

  useEffect(() => {
    strips.current = [];
  }, [mobile]);

  /* ── a) film advance + b) drift: one rAF loop for the whole page ── */
  useEffect(() => {
    if (!mounted || reduced.current) return;
    let raf = 0;
    const tick = (t: number) => {
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const isM = vw < MOBILE_BP;
      const travel = isM ? Math.min(90, vw * 0.1) : Math.min(260, vw * 0.12);
      const driftAmt = isM ? M.drift : D.drift;
      for (let i = 0; i < strips.current.length; i++) {
        const el = strips.current[i];
        if (!el) continue;
        const rect = el.getBoundingClientRect();
        // Only strips within roughly 1.5 viewports of the fold are worth a write.
        if (rect.bottom < -vh * 0.5 || rect.top > vh * 1.5) continue;
        const dir = i % 2 === 0 ? 1 : -1;
        const p = 1 - (rect.top + rect.height / 2) / (vh + rect.height / 2);
        const parallax = (p - 0.5) * travel * dir;
        const drift = Math.sin(t / 9000 + i * 1.7) * driftAmt * dir;
        // Right-moving strips are pre-offset so they never reveal a leading edge.
        const base = dir > 0 ? -travel * 0.5 : 0;
        el.style.transform = `translate3d(${base + parallax + drift}px, 0, 0)`;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [mounted, mobile]);

  /* ── c) develop-in. Hidden state is applied imperatively AFTER mount, so if JS
        never runs the frames are simply visible. It must not move into CSS. ── */
  useEffect(() => {
    if (!mounted || reduced.current) return;
    const frames = Array.from(document.querySelectorAll<HTMLElement>("[data-develop]"));
    frames.forEach((f) => {
      if (f.dataset.developed === "1") return;
      f.style.opacity = "0";
      f.style.filter = "brightness(.25) contrast(.6)";
      f.style.transform = "translateY(14px)";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          const i = Number(el.dataset.develop || 0);
          window.setTimeout(() => {
            el.style.transition = `opacity 1.5s ${EASE}, filter 1.7s ${EASE}, transform 1.5s ${EASE}`;
            el.style.opacity = "1";
            el.style.filter = "none";
            el.style.transform = "translateY(0)";
            el.dataset.developed = "1";
          }, i * 110);
          io.unobserve(el); // one-shot
        });
      },
      { rootMargin: "-6% 0px -12% 0px", threshold: 0.04 },
    );
    frames.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, [mounted, mobile]);

  const isM = mounted && mobile;

  return (
    <>
      <style>{CSS}</style>
      {galleries.map((g, i) => (
        <Day key={g.slug} g={g} i={i} mobile={isM} register={register} basePath={basePath} />
      ))}
    </>
  );
}

function Day({
  g,
  i,
  mobile,
  register,
  basePath,
}: {
  g: Gallery;
  i: number;
  mobile: boolean;
  register: (el: HTMLDivElement | null, i: number) => void;
  basePath: string;
}) {
  const frames = buildFrames(g, mobile);
  const geo = mobile ? M : D;
  const idx = String(i + 1).padStart(2, "0");
  const href = `${basePath}/${g.slug}`;

  return (
    <article className="gx-day">
      {mobile ? (
        <div className="gx-cap gx-cap--m">
          <p className="gx-eyebrow">
            {idx} · {g.stock}
          </p>
          <h3 className="gx-names gx-names--m">{g.names}</h3>
          <p className="gx-meta-line">
            {g.location} · {g.date} · {g.frameCount} frames
          </p>
        </div>
      ) : (
        <div className="gx-cap">
          <div>
            <p className="gx-eyebrow">
              {idx} · {g.stock}
            </p>
            <h3 className="gx-names">{g.names}</h3>
          </div>
          <div className="gx-meta">
            <span className="gx-meta-loc">{g.location}</span>
            <span className="gx-meta-dim">{g.date}</span>
            <span className="gx-meta-dim">{g.frameCount} frames</span>
          </div>
        </div>
      )}

      <div className="gx-strip-wrap">
        <span className={`gx-fade gx-fade--l${mobile ? " gx-fade--m" : ""}`} aria-hidden />
        <span className={`gx-fade gx-fade--r${mobile ? " gx-fade--m" : ""}`} aria-hidden />
        <div
          ref={(el) => register(el, i)}
          className={`gx-strip${mobile ? " gx-strip--m" : ""}`}
          style={{ gap: geo.gap, padding: `${geo.padY}px ${geo.padX}px` }}
        >
          {/* run-in: keeps the cover clear of the left fade at maximum swing */}
          <span aria-hidden style={{ flex: "none", width: runIn(g.cover, mobile) }} />

          {frames.map((f, n) => {
            const w = f.cover
              ? coverWidth(f.img, mobile)
              : (mobile ? M_TEASER_W : TEASER_W)[f.img.orientation];
            return (
              <a
                key={`${f.img.url}-${n}`}
                href={href}
                data-develop={n}
                className={`gx-frame${f.cover ? " gx-frame--cover" : ""}`}
                style={{ width: w, height: geo.frameH }}
                aria-label={f.aria}
                aria-hidden={f.cover ? undefined : true}
                tabIndex={f.cover ? undefined : -1}
              >
                <Image
                  src={f.img.url}
                  alt={f.cover ? f.img.alt : ""}
                  fill
                  sizes={`${w}px`}
                  quality={80}
                  priority={i === 0 && f.cover}
                  loading={i === 0 && f.cover ? undefined : "lazy"}
                  style={{ objectFit: "cover" }}
                />
                {f.cover && (
                  <>
                    <span className="gx-cover-scrim" aria-hidden />
                    <span className="gx-cover-cta">Open the album →</span>
                  </>
                )}
                {/* edge markings sit inside the sprocket bands — this is what
                    sells the film */}
                <span className="gx-mark gx-mark--tl" aria-hidden>
                  {f.label}
                </span>
                {!mobile && (
                  <span className="gx-mark gx-mark--br" aria-hidden>
                    {g.stock}
                  </span>
                )}
              </a>
            );
          })}

          {/* run-out: the roll ends on film, not on a frame */}
          <span aria-hidden style={{ flex: "none", width: geo.runOut }} />
        </div>
      </div>
    </article>
  );
}

const CSS = `
/* Masthead + closing, lifted from the armanarai.com galleries hub so the two
   sites' album pages read as the same publication. */
.gx-masthead { padding: 6rem 1.5rem 5rem; text-align: center; }
.gx-h1 {
  font-family: var(--font-cormorant), Georgia, serif; font-weight: 300;
  font-size: clamp(38px, 6.4vw, 84px); line-height: 0.96; letter-spacing: -0.02em;
  color: #E8E0D0; margin: 1.4rem 0 0;
}
.gx-h2 {
  font-family: var(--font-cormorant), Georgia, serif; font-weight: 300;
  font-size: clamp(30px, 4.4vw, 58px); line-height: 1; letter-spacing: -0.02em;
  color: #E8E0D0; margin: 1.6rem 0 0;
}
.gx-script {
  font-family: var(--font-great-vibes), cursive; font-size: 0.92em; font-style: normal;
  color: #B8956A; letter-spacing: 0;
}
.gx-lede {
  font-family: var(--font-cormorant), Georgia, serif; font-size: 1.06rem; line-height: 1.7;
  color: #A08D7B; max-width: 44ch; margin: 2rem auto 0;
}
.gx-lede--tight { margin-top: 1.2rem; font-size: 1rem; }
.gx-divider {
  display: flex; align-items: center; justify-content: center; gap: 0.9rem;
  max-width: 280px; margin: 3.2rem auto 0;
}
.gx-divider--wide { max-width: 560px; }
.gx-rule { flex: 1; height: 0.5px; background: #2A2520; }
.gx-diamond { width: 3px; height: 3px; background: #B8956A; transform: rotate(45deg); }
.gx-kick {
  font-family: var(--font-jost), sans-serif; font-size: 9px; text-transform: uppercase;
  letter-spacing: 0.34em; color: #B8956A; white-space: nowrap;
}
.gx-sec-head { padding: 3rem 1.5rem 1rem; text-align: center; }
.gx-closing { text-align: center; padding: 1rem 1.5rem 7rem; }
.gx-closing-link {
  font-family: var(--font-jost), sans-serif; font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.26em; color: #8E7A6A; text-decoration: none;
  border-bottom: 0.5px solid #2A2520; padding-bottom: 6px;
  transition: color 0.4s ${EASE}, border-color 0.4s ${EASE};
}
.gx-closing-link:hover { color: #B8956A; border-color: #B8956A; }
@media (min-width: 768px)  { .gx-masthead, .gx-sec-head { padding-left: 2.5rem; padding-right: 2.5rem; } }
@media (min-width: 1024px) { .gx-masthead, .gx-sec-head { padding-left: 4rem; padding-right: 4rem; } }
@media (max-width: 859px)  { .gx-masthead { padding: 4.5rem 1.5rem 3.5rem; } }

.gx-day { margin-bottom: 7.5rem; content-visibility: auto; contain-intrinsic-size: 1px 560px; }
.gx-eyebrow {
  font-family: var(--font-jost), sans-serif; font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.28em; color: #5A5148; margin: 0;
}
.gx-cap {
  max-width: 1280px; margin: 0 auto; padding: 0 4rem 1.6rem;
  display: flex; align-items: flex-end; justify-content: space-between; gap: 2rem;
}
.gx-names {
  font-family: var(--font-cormorant), Georgia, serif; font-weight: 300;
  font-size: clamp(30px, 3.4vw, 50px); line-height: 1; letter-spacing: -0.015em;
  color: #E8E0D0; margin: 0.7rem 0 0;
}
.gx-meta {
  display: flex; flex-direction: column; text-align: right;
  font-family: var(--font-jost), sans-serif; font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.22em; line-height: 2.1; white-space: nowrap;
}
.gx-meta-loc, .gx-meta-dim { color: #857060; }
.gx-cap--m { display: block; padding: 0 1.5rem 1.1rem; }
.gx-names--m { font-size: 34px; }
.gx-meta-line {
  font-family: var(--font-jost), sans-serif; font-size: 9px; text-transform: uppercase;
  letter-spacing: 0.22em; color: #857060; margin: 0.6rem 0 0;
}

.gx-strip-wrap { position: relative; overflow: hidden; }
.gx-fade {
  position: absolute; top: 0; bottom: 0; width: min(9rem, 10vw); z-index: 6; pointer-events: none;
}
.gx-fade--m { width: min(2rem, 8vw); }
.gx-fade--l { left: 0; background: linear-gradient(to right, #080704, transparent); }
.gx-fade--r { right: 0; background: linear-gradient(to left, #080704, transparent); }

.gx-strip {
  display: flex; align-items: stretch; width: max-content;
  background: #14110d; border-top: 0.5px solid #221d17; border-bottom: 0.5px solid #221d17;
  box-shadow: 0 34px 80px -40px rgba(0,0,0,0.95);
  will-change: transform; position: relative;
}
/* Sprocket holes: pure CSS, pinned to each edge. No SVG, no image asset. */
.gx-strip::before, .gx-strip::after {
  content: ""; position: absolute; left: 0; right: 0; height: 24px; pointer-events: none;
  background-image: repeating-linear-gradient(to right, #050403 0 11px, rgba(0,0,0,0) 11px 30px);
  background-position: 8px center; background-size: auto 9px; background-repeat: repeat-x;
}
.gx-strip::before { top: 0; }
.gx-strip::after { bottom: 0; }
.gx-strip--m::before, .gx-strip--m::after {
  height: 20px;
  background-image: repeating-linear-gradient(to right, #050403 0 9px, rgba(0,0,0,0) 9px 25px);
  background-position: 6px center; background-size: auto 7px;
}

/* No overflow:hidden here. The edge markings are positioned outside the frame
   box on purpose, so they land inside the sprocket bands, which is what sells
   the film; clipping the frame hides them. next/image fill + object-fit already
   crops the photograph to the box, so nothing else needs the clip. */
.gx-frame {
  flex: none; position: relative; display: block; background: #050403;
  border: 0.5px solid #221d17;
  transition: transform 0.7s ${EASE}, border-color 0.7s ${EASE};
  pointer-events: auto;
}
.gx-frame--cover { border-color: #6A5030; }
.gx-frame:hover { transform: scale(1.035); border-color: #B8956A; z-index: 5; }
.gx-frame:focus-visible { outline: 0.5px solid #B8956A; outline-offset: 2px; }
.gx-cover-scrim {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(8,7,4,0.62), transparent 52%);
}
.gx-cover-cta {
  position: absolute; left: 0; bottom: 0; padding: 1.1rem;
  font-family: var(--font-jost), sans-serif; font-size: 9px; text-transform: uppercase;
  letter-spacing: 0.26em; color: #E8E0D0; pointer-events: none;
}
.gx-mark {
  position: absolute; font-family: var(--font-jost), sans-serif; font-size: 8px;
  letter-spacing: 0.14em; color: #6A5030; text-transform: uppercase; pointer-events: none;
}
.gx-mark--tl { top: -17px; left: 1px; }
.gx-mark--br { bottom: -16px; right: 1px; }
.gx-strip--m .gx-mark { font-size: 7px; }
.gx-strip--m .gx-mark--tl { top: -14px; }

.gx-clips { padding: 1rem 1.5rem 5rem; max-width: 1280px; margin: 0 auto; }
.gx-clip-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.4rem; margin-top: 2.4rem; }
@media (max-width: 859px) { .gx-clip-grid { grid-template-columns: 1fr; } }

@media (max-width: 859px) { .gx-day { margin-bottom: 4.5rem; } }
`;
