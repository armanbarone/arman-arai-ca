"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import InquireButton from "@/components/InquireButton";
import Lightbox from "@/components/Lightbox";

const HERO_MAIN = "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000e2a72855627210fd71a.png";
const HERO_TR   = "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000ea1bc1f77cc354e3d88.png";
const HERO_BR   = "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000ebba3dd25aa2aed93af.png";

const PORTFOLIO_IMGS = [
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003eab939c0e5f200de2d9.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000fcba7b9e0385a4b0c39.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00129da3dd25aa2aeded6c.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a0013a00aa9f7d87e0d4e8b.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000fcba7b9e0385a4b0c38.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000f5154bc6e60ff1f6876.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000f3154bc6e60ff1f6599.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a000efba3dd25aa2aed98bb.png",
];

const heroImages = [HERO_MAIN, HERO_TR, HERO_BR];

// Film frames — real wedding images with film labels on select frames
const FILM_FRAMES = [
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c7167fd9a35d468ae.png", label: "KODAK 400 · EXP. 2024" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785ca6982c165585905d.png", label: null },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c9594baa062ec3dc0.png", label: "PORTRA 800 · EXP. 2024" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c9594baa062ec3dc2.png", label: null },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c9594baa062ec3dc1.png", label: "HP5 · EXP. 2024" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c7167fd9a35d468af.png", label: null },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c533d641a8929d2ee.png", label: "EKTAR 100 · EXP. 2024" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785c019ea471ed130b6a.png", label: null },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb785ca6982c165585905c.png", label: "PORTRA 400 · EXP. 2024" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69faac49ecdc5eb699dbc741.png", label: null },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fa42aba7386fa308a55538.png", label: "GOLD 200 · EXP. 2024" },
];

function FilmStrip() {
  const allFrames = [...FILM_FRAMES, ...FILM_FRAMES]; // duplicate for seamless loop

  return (
    <div
      style={{
        background: "#141210",
        overflow: "hidden",
        position: "relative",
        userSelect: "none",
      }}
      aria-hidden
    >
      {/* Top sprocket bar */}
      <div style={{
        height: "22px",
        background: "#141210",
        backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, #080704 10px, #080704 22px, transparent 22px, transparent 32px)",
        backgroundSize: "32px 100%",
        position: "relative",
        zIndex: 2,
      }} />

      {/* Scrolling frame track */}
      <div className="film-strip-track">
        {allFrames.map((frame, i) => (
          <div key={i} className="film-frame" style={{ background: "#0A0806", position: "relative" }}>
            {/* Real image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={frame.src}
              alt=""
              aria-hidden
              draggable={false}
              style={{
                position: "absolute", inset: 0,
                width: "100%", height: "100%",
                objectFit: "cover",
                pointerEvents: "none",
                userSelect: "none",
                filter: "sepia(0.18) contrast(0.9) brightness(0.88)",
              }}
            />
            {/* Scanline overlay */}
            <div className="film-frame-scanline" />
            {/* Warm vignette */}
            <div style={{
              position: "absolute", inset: 0,
              background: "radial-gradient(ellipse at center, transparent 40%, rgba(8,7,4,0.55) 100%)",
              pointerEvents: "none", zIndex: 2,
            }} />
            {/* Film label */}
            {frame.label && (
              <div className="film-frame-label">{frame.label}</div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom sprocket bar */}
      <div style={{
        height: "22px",
        background: "#141210",
        backgroundImage: "repeating-linear-gradient(90deg, transparent 0px, transparent 10px, #080704 10px, #080704 22px, transparent 22px, transparent 32px)",
        backgroundSize: "32px 100%",
        position: "relative",
        zIndex: 2,
      }} />

      {/* Left/right vignette fade */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: "linear-gradient(to right, #141210 0%, transparent 8%, transparent 92%, #141210 100%)",
        zIndex: 3,
      }} />
    </div>
  );
}

export default function Home() {
  const [lightbox, setLightbox] = useState<{ open: boolean; images: string[]; index: number }>({ open: false, images: [], index: 0 });
  const openLB = (images: string[], index: number) => setLightbox({ open: true, images, index });

  return (
    <>
      {lightbox.open && (
        <Lightbox
          images={lightbox.images}
          current={lightbox.index}
          onClose={() => setLightbox({ open: false, images: [], index: 0 })}
          onPrev={() => setLightbox(l => ({ ...l, index: Math.max(0, l.index - 1) }))}
          onNext={() => setLightbox(l => ({ ...l, index: Math.min(l.images.length - 1, l.index + 1) }))}
        />
      )}

      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col lg:grid lg:grid-cols-2" style={{ background: "#080704" }}>
        {/* Left — text */}
        <div className="flex flex-col justify-center page-px pt-24 lg:pt-28 pb-10 relative order-1">
          <div className="page-w w-full">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-6" style={{ fontFamily: "var(--font-jost)" }}>
              Wedding Photography
            </p>
            <h1
              className="font-serif font-light leading-[1.05] text-cream mb-5"
              style={{ fontSize: "clamp(3rem,5vw,5.5rem)" }}
            >
              Where vows<br />
              <em className="italic text-rose">become</em><br />
              photographs
            </h1>
            <p
              className="font-serif italic font-light text-blush leading-relaxed mb-10 max-w-md"
              style={{ fontSize: "clamp(0.95rem,1.4vw,1.15rem)" }}
            >
              Editorial and film-inspired wedding imagery for couples who see their day as something sacred. A blend of gentle direction and honest documentary, crafted to feel cinematic, intimate, and deeply true.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
              <Link
                href="/portfolio"
                className="text-[0.62rem] tracking-[0.2em] uppercase px-8 py-3.5 transition-colors duration-300"
                style={{ background: "#B8956A", color: "#080704" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#9A7A54")}
                onMouseLeave={e => (e.currentTarget.style.background = "#B8956A")}
              >
                View the Work
              </Link>
              <InquireButton className="text-slate text-[0.62rem] tracking-[0.2em] uppercase hover:text-rose transition-colors duration-300 flex items-center gap-2 cursor-pointer bg-transparent border-none">
                Begin your story <span>→</span>
              </InquireButton>
            </div>
            <span className="font-script text-blush/60 text-lg mt-10 block lg:absolute lg:bottom-8 lg:left-0 lg:pl-[4rem]">
              Medellín · Vancouver · Destination
            </span>
          </div>
        </div>

        {/* Right — Desktop: 3-photo grid */}
        <div className="hidden lg:grid order-2" style={{ gridTemplateColumns: "1.15fr 0.85fr", gridTemplateRows: "1fr 1fr", gap: "2px" }}>
          <div className="hero-grid-photo relative" style={{ gridRow: "1/3" }} onClick={() => openLB(heroImages, 0)}>
            <Image src={HERO_MAIN} alt="Wedding photography" fill className="object-cover" sizes="35vw" priority />
            <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-sm">The quiet before everything</span></div>
          </div>
          <div className="hero-grid-photo relative" onClick={() => openLB(heroImages, 1)}>
            <Image src={HERO_TR} alt="Wedding photography" fill className="object-cover" sizes="20vw" priority />
            <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-xs">A moment becoming a memory</span></div>
          </div>
          <div className="hero-grid-photo relative" onClick={() => openLB(heroImages, 2)}>
            <Image src={HERO_BR} alt="Wedding photography" fill className="object-cover" sizes="20vw" />
            <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-xs">The light, when it happened</span></div>
          </div>
        </div>

        {/* Mobile: stacked images */}
        <div className="lg:hidden order-2 flex flex-col gap-0.5">
          <div className="relative w-full" style={{ height: "60vw", maxHeight: "340px" }} onClick={() => openLB(heroImages, 0)}>
            <Image src={HERO_MAIN} alt="Wedding photography" fill className="object-cover cursor-pointer" sizes="100vw" priority />
          </div>
          <div className="grid grid-cols-2 gap-0.5" style={{ height: "35vw", maxHeight: "200px" }}>
            <div className="relative overflow-hidden" onClick={() => openLB(heroImages, 1)}>
              <Image src={HERO_TR} alt="Wedding photography" fill className="object-cover cursor-pointer" sizes="50vw" />
            </div>
            <div className="relative overflow-hidden" onClick={() => openLB(heroImages, 2)}>
              <Image src={HERO_BR} alt="Wedding photography" fill className="object-cover cursor-pointer" sizes="50vw" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: "#0E0C0A" }}>
        {/* Decorative large quote mark */}
        <div
          className="absolute left-2 top-4 font-serif pointer-events-none select-none"
          style={{ fontSize: "clamp(8rem,20vw,26rem)", opacity: 0.06, lineHeight: 1, color: "#E8E0D0" }}
          aria-hidden
        >
          &ldquo;
        </div>
        <div className="page-w page-px relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div>
              <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5" style={{ fontFamily: "var(--font-jost)" }}>
                The philosophy
              </p>
              <blockquote
                className="font-serif italic font-light text-cream leading-relaxed mb-6"
                style={{ fontSize: "clamp(1.25rem,2vw,1.7rem)" }}
              >
                &ldquo;I don&rsquo;t simply photograph how a wedding looked. I photograph how it felt: cinematic, intimate, and quietly sacred.&rdquo;
              </blockquote>
              <p className="text-blush text-sm leading-relaxed mb-8 max-w-lg font-light">
                There is a sacred kind of beauty that reveals itself between the planned moments: a father holding back tears before the aisle, two best friends breaking into laughter during speeches, a hand reaching quietly for another. These are the images that become more than photographs. They become memory, inheritance, and proof that something holy happened here.
              </p>
              <Link
                href="/about"
                className="text-[0.62rem] tracking-[0.2em] uppercase text-rose hover:text-rose-dark transition-colors duration-300 flex items-center gap-2 w-fit pb-1"
                style={{ borderBottom: "0.5px solid rgba(184,149,106,0.3)" }}
              >
                Read my story →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 md:gap-10">
              {[{ n: "240+", label: "Weddings" }, { n: "6", label: "Countries" }, { n: "12", label: "Years" }].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <div className="font-serif font-light text-rose" style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>{n}</div>
                  <div className="text-[0.58rem] tracking-[0.22em] uppercase text-blush mt-1" style={{ fontFamily: "var(--font-jost)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── 35mm FILM STRIP DIVIDER ── */}
      <FilmStrip />

      {/* ── SELECTED WORK ── */}
      <section className="py-20 md:py-28" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
              Selected Work
            </p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>
              A few pages from <em className="italic text-rose">the album</em>
            </h2>
            <div className="divider">
              <div className="divider-line" />
              <span className="text-rose text-xs">✦</span>
              <div className="divider-line" />
            </div>
          </div>

          <div className="portfolio-grid" style={{ gridTemplateRows: "repeat(6, 80px)" }}>
            {[0, 1, 2, 3, 4, 5, 6, 7].map(idx => (
              <div key={idx} className={`grid-cell pg-${idx + 1}`} onClick={() => openLB(PORTFOLIO_IMGS, idx)}>
                <Image
                  src={PORTFOLIO_IMGS[idx]}
                  alt={`Wedding photo ${idx + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width:768px) 50vw, 25vw"
                />
                <div className="caption-overlay">
                  <span className="font-serif italic text-cream/80 text-xs tracking-wide">Click to enlarge</span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-8 md:mt-10">
            <Link
              href="/portfolio"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-blush hover:text-rose transition-colors duration-300 inline-flex items-center gap-2"
            >
              View full portfolio →
            </Link>
          </div>
        </div>
      </section>

      {/* ── INVESTMENT — borderless triptych ── */}
      <section className="py-20 md:py-28" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px text-center">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
            Investment
          </p>
          <h2 className="font-serif font-light text-cream mb-4" style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>
            A limited number of<br /><em className="italic text-rose">commissions each year</em>
          </h2>
          <div className="divider mb-12 md:mb-16">
            <div className="divider-line" />
            <span className="text-rose text-xs">✦</span>
            <div className="divider-line" />
          </div>

          <p className="font-serif italic text-cream/70 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
            &ldquo;I accept a limited number of weddings each year so every commission receives the attention, preparation, and artistic presence it deserves.&rdquo;
          </p>

          {/* Borderless triptych — 2 containers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-0 max-w-2xl mx-auto mb-14" style={{ border: "0.5px solid #2A2520" }}>
            <div className="px-8 py-10 text-left relative" style={{ borderRight: "0.5px solid #2A2520", background: "#141210" }}>
              {/* Bronze top accent line on featured card */}
              <div style={{ position: "absolute", top: 0, left: "10%", right: "10%", height: "1px", background: "linear-gradient(to right, transparent, #B8956A, transparent)" }} />
              <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-3" style={{ fontFamily: "var(--font-jost)" }}>Most Couples Invest</p>
              <p className="font-serif font-light text-cream mb-2" style={{ fontSize: "2rem" }}>$10–18k</p>
              <p className="text-blush text-xs leading-relaxed font-light">Full weekend coverage, editorial portraiture, film, and a complete visual story.</p>
            </div>
            <div className="px-8 py-10 text-left">
              <p className="text-[0.58rem] tracking-[0.28em] uppercase text-blush mb-3" style={{ fontFamily: "var(--font-jost)" }}>Every Proposal</p>
              <p className="font-serif font-light text-cream mb-3" style={{ fontSize: "1.35rem", paddingTop: "0.35rem" }}>Custom Built</p>
              <p className="text-slate text-xs leading-relaxed font-light">Created after learning the scale, location, and rhythm of your wedding.</p>
            </div>
          </div>

          <InquireButton
            className="inline-block text-[0.62rem] tracking-[0.2em] uppercase px-12 py-4 transition-colors duration-300 cursor-pointer border-none"
            style={{ background: "#B8956A", color: "#080704" } as React.CSSProperties}
          >
            Inquire for Availability
          </InquireButton>
        </div>
      </section>

      {/* ── CITIES ── */}
      <section className="py-14 md:py-18" style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }}>
        <div className="page-w page-px">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 md:gap-x-10">
            <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose w-full text-center md:w-auto md:text-left mb-1 md:mb-0" style={{ fontFamily: "var(--font-jost)" }}>
              Where I work
            </p>
            {["Medellín", "Bogotá", "Vancouver", "Toronto", "Montréal", "Los Cabos", "Destination Wedding"].map((city, i, arr) => (
              <span key={city} className="flex items-center gap-6 md:gap-8">
                <span className="text-[0.68rem] tracking-[0.15em] uppercase text-blush">{city}</span>
                {i < arr.length - 1 && <span className="text-dust hidden sm:inline">·</span>}
              </span>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
