"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import InquireButton from "@/components/InquireButton";
import type { Chapter, Gallery, GalleryImage } from "@/lib/galleries";

/* ────────────────────────────────────────────────────────────────────────────
   One wedding's full album: a full-bleed opening frame, the story, then the day
   in three chapters.

   Chapters are justified rows rather than a fixed mosaic. Images are grouped
   until their aspect ratios sum to a target, then each figure takes flex-grow
   equal to its own aspect and an aspect-ratio to match, so every frame in a row
   lands on the same height, the row fills the width exactly, and nothing is ever
   cropped. The asymmetry survives because the mix of portrait and landscape is
   what sets each row's rhythm.
   ──────────────────────────────────────────────────────────────────────────── */

const EASE = "cubic-bezier(.25,.46,.45,.94)";

const ar = (i: GalleryImage) => i.w / i.h;

// Row targets differ per chapter so the three chapters read as three rhythms
// rather than one repeated pattern.
const ROW_TARGET = [3.4, 4.2, 3.8];

function justify(images: GalleryImage[], target: number): GalleryImage[][] {
  const rows: GalleryImage[][] = [];
  let row: GalleryImage[] = [];
  let sum = 0;
  for (const im of images) {
    row.push(im);
    sum += ar(im);
    if (sum >= target) {
      rows.push(row);
      row = [];
      sum = 0;
    }
  }
  if (row.length) {
    // A short final row would render enormously tall. Fold it into the previous.
    const short = row.reduce((a, i) => a + ar(i), 0) < target * 0.6;
    if (short && rows.length) rows[rows.length - 1].push(...row);
    else rows.push(row);
  }
  return rows;
}

export default function AlbumView({ gallery: g }: { gallery: Gallery }) {
  /* Develop-in: frames come up like a print in developer, staggered. The hidden
     state is applied imperatively after mount, so if JS never runs the frames
     are simply visible. It must not move into CSS. */
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const frames = Array.from(document.querySelectorAll<HTMLElement>("[data-develop]"));
    frames.forEach((f) => {
      f.style.opacity = "0";
      f.style.filter = "brightness(.25) contrast(.6)";
      f.style.transform = "scale(1.03)";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (!e.isIntersecting) return;
          const el = e.target as HTMLElement;
          window.setTimeout(() => {
            el.style.transition = `opacity 1.5s ${EASE}, filter 1.7s ${EASE}, transform 1.5s ${EASE}`;
            el.style.opacity = "1";
            el.style.filter = "none";
            el.style.transform = "scale(1)";
          }, Number(el.dataset.develop || 0) * 90);
          io.unobserve(el);
        });
      },
      { rootMargin: "-6% 0px -12% 0px", threshold: 0.04 },
    );
    frames.forEach((f) => io.observe(f));
    return () => io.disconnect();
  }, [g.slug]);

  const [first, ...rest] = g.names.split(" & ");

  return (
    <div style={{ background: "#080704" }}>
      <style>{CSS}</style>

      {/* ── OPENING FRAME ── */}
      <section className="ga-hero">
        <Image
          src={g.hero.url}
          alt={g.hero.alt}
          fill
          sizes="100vw"
          quality={82}
          priority
          fetchPriority="high"
          style={{ objectFit: "cover" }}
        />
        <span className="ga-hero-scrim" aria-hidden />
        <div className="ga-hero-text">
          <p className="ga-eyebrow ga-eyebrow--warm">
            {g.location} · {g.date}
          </p>
          <h1 className="ga-hero-names">
            {first} <em className="ga-amp">&amp;</em> {rest.join(" & ")}
          </h1>
          <p className="ga-hero-meta">
            {g.stock} · {g.frameCount} frames · One day
          </p>
        </div>
      </section>

      {/* ── STORY ── */}
      <section className="ga-story">
        <p className="ga-story-copy">{g.story}</p>
        <div className="ga-divider">
          <span className="ga-rule" />
          <span className="ga-diamond" />
          <span className="ga-rule" />
        </div>
      </section>

      {/* ── CHAPTERS ── */}
      {g.chapters.map((ch, ci) => (
        <ChapterBlock key={ch.numeral} ch={ch} ci={ci} />
      ))}

      {/* ── CLOSING ── */}
      <section className="ga-closing">
        <p className="ga-eyebrow">End of roll</p>
        <h2 className="ga-closing-h">
          Your day, <em className="ga-script">the same way</em>
        </h2>
        <div className="ga-actions">
          <InquireButton className="ga-cta">Check your date</InquireButton>
          <Link href="/pricing" className="ga-back">
            See what a full day costs →
          </Link>
          <Link href="/galleries" className="ga-back">
            ← All galleries
          </Link>
        </div>
      </section>
    </div>
  );
}

function ChapterBlock({ ch, ci }: { ch: Chapter; ci: number }) {
  const rows = justify(ch.images, ROW_TARGET[ci % 3]);
  let n = 0;
  return (
    <section className="ga-chapter">
      <div className="ga-chapter-head">
        <span className="ga-numeral">{ch.numeral}</span>
        <span className="ga-chapter-title">{ch.title}</span>
        <span className="ga-rule ga-rule--grow" />
        <span className="ga-chapter-range">{ch.range}</span>
      </div>
      <div className="ga-rows">
        {rows.map((row, ri) => (
          <div className="ga-row" key={ri}>
            {row.map((im) => (
              <figure
                key={im.url}
                data-develop={n++}
                className="ga-cell"
                style={{ flexGrow: ar(im), flexBasis: 0, aspectRatio: `${im.w} / ${im.h}` }}
              >
                <Image
                  src={im.url}
                  alt={im.alt}
                  fill
                  sizes="(max-width: 859px) 100vw, 45vw"
                  quality={80}
                  loading="lazy"
                  style={{ objectFit: "cover" }}
                />
              </figure>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}

const CSS = `
.ga-hero { position: relative; height: 88vh; min-height: 520px; overflow: hidden; }
.ga-hero-scrim {
  position: absolute; inset: 0; pointer-events: none;
  background: linear-gradient(to top, rgba(8,7,4,0.92) 2%, rgba(8,7,4,0.15) 45%, rgba(8,7,4,0.5));
}
.ga-hero-text {
  position: absolute; left: 0; right: 0; bottom: 0; text-align: center; padding: 0 1.5rem 3.4rem;
}
.ga-eyebrow {
  font-family: var(--font-jost), sans-serif; font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.28em; color: #5A5148; margin: 0;
}
.ga-eyebrow--warm { color: #A89480; }
.ga-hero-names {
  font-family: var(--font-cormorant), Georgia, serif; font-weight: 300;
  font-size: clamp(42px, 7.5vw, 104px); line-height: 0.94; letter-spacing: -0.025em;
  color: #E8E0D0; margin: 1rem 0 0;
}
.ga-amp { font-family: var(--font-great-vibes), cursive; font-style: normal; color: #B8956A; }
.ga-hero-meta {
  font-family: var(--font-jost), sans-serif; font-size: 9px; text-transform: uppercase;
  letter-spacing: 0.26em; color: #857060; margin: 1.3rem 0 0;
}

.ga-story { max-width: 760px; margin: 0 auto; padding: 5.5rem 1.5rem 4rem; }
.ga-story-copy {
  font-family: var(--font-cormorant), Georgia, serif; font-size: 1.22rem; line-height: 1.85;
  color: #A89480; text-wrap: pretty; margin: 0; text-align: center;
}
.ga-divider {
  display: flex; align-items: center; justify-content: center; gap: 0.9rem;
  max-width: 280px; margin: 3.2rem auto 0;
}
.ga-rule { flex: 1; height: 0.5px; background: #2A2520; }
.ga-rule--grow { flex: 1; }
.ga-diamond { width: 3px; height: 3px; background: #B8956A; transform: rotate(45deg); }

/* overflow-x: clip because develop-in holds scale(1.03) on every frame that has
   not yet entered view. On a full-bleed grid that 3% is real horizontal page
   scroll, and frames below the fold never come out of it. clip rather than
   hidden so no scroll container is created. */
.ga-chapter { padding-bottom: 5rem; overflow-x: clip; }
.ga-chapter-head {
  max-width: 1280px; margin: 0 auto; padding: 0 1.5rem 1.8rem;
  display: flex; align-items: baseline; gap: 1.2rem;
}
.ga-numeral {
  font-family: var(--font-cormorant), Georgia, serif; font-size: 1rem;
  letter-spacing: 0.2em; color: #6A5030;
}
.ga-chapter-title {
  font-family: var(--font-jost), sans-serif; font-size: 10px; text-transform: uppercase;
  letter-spacing: 0.28em; color: #5A5148; white-space: nowrap;
}
.ga-chapter-range {
  font-family: var(--font-jost), sans-serif; font-size: 9px; text-transform: uppercase;
  letter-spacing: 0.2em; color: #6A5030; white-space: nowrap;
}
.ga-rows { display: flex; flex-direction: column; gap: 3px; }
.ga-row { display: flex; gap: 3px; }
.ga-cell { position: relative; margin: 0; overflow: hidden; background: #050403; }

.ga-closing { text-align: center; padding: 2rem 1.5rem 7rem; }
.ga-closing-h {
  font-family: var(--font-cormorant), Georgia, serif; font-weight: 300;
  font-size: clamp(30px, 4.4vw, 58px); line-height: 1; letter-spacing: -0.02em;
  color: #E8E0D0; margin: 1.4rem 0 0;
}
.ga-script {
  font-family: var(--font-great-vibes), cursive; font-size: 0.92em; font-style: normal;
  color: #B8956A; letter-spacing: 0;
}
.ga-actions {
  display: flex; align-items: center; justify-content: center; gap: 2.5rem; flex-wrap: wrap;
  margin-top: 2.6rem;
}
.ga-cta {
  background: #1A1612; border: 0.5px solid #2A2520; color: #E8E0D0;
  font-family: var(--font-jost), sans-serif; font-size: 0.6rem; text-transform: uppercase;
  letter-spacing: 0.24em; padding: 0.95rem 1.9rem; cursor: pointer;
  transition: border-color 0.4s ${EASE}, color 0.4s ${EASE};
}
.ga-cta:hover { border-color: #B8956A; color: #B8956A; }
.ga-back {
  font-family: var(--font-jost), sans-serif; font-size: 0.6rem; text-transform: uppercase;
  letter-spacing: 0.24em; color: #5A5148; text-decoration: none;
  transition: color 0.4s ${EASE};
}
.ga-back:hover { color: #B8956A; }

/* On a phone a justified row of four would leave slivers, so rows stack and each
   frame runs full width at its own ratio. */
@media (max-width: 859px) {
  .ga-row { flex-direction: column; }
  .ga-row .ga-cell { flex: none !important; width: 100%; }
  .ga-story { padding: 3.5rem 1.5rem 2.5rem; }
}
@media (min-width: 768px) { .ga-chapter-head { padding-left: 2.5rem; padding-right: 2.5rem; } }
@media (min-width: 1024px) { .ga-chapter-head { padding-left: 4rem; padding-right: 4rem; } }
`;
