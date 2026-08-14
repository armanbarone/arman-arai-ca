import Image from "next/image";
import Link from "next/link";
import InquireButton from "./InquireButton";
import { CITY_PHOTOS } from "@/lib/images";
import { hubBySlug } from "@/lib/hubs";
import {
  CORE,
  MARKETS,
  SITE,
  TIERS,
  quoteFor,
  regionBySlug,
  type Market,
} from "@/lib/site";

/* The city hub, built on the hub- section vocabulary ported from
   armanarai.com's service-place pages: a stat hero, a sticky section index,
   the differentiators, the venues, the season table, the shape of the day,
   the prices and the FAQ. Content lives in lib/hubs.ts, prices in lib/site.ts. */

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;
const regionOf = (m: Market) => regionBySlug(m.regionSlug)!;

const SECTIONS = [
  { id: "different", label: "The difference" },
  { id: "venues", label: "Where" },
  { id: "season", label: "When" },
  { id: "day", label: "The day" },
  { id: "prices", label: "Prices" },
  { id: "faq", label: "Questions" },
];

export function cityMetadata(m: Market) {
  const title = `${m.city} Wedding Photographer — ${m.region}`;
  const from = quoteFor(regionOf(m), CORE);
  return {
    title,
    description: `${m.angle}. Wedding photography in ${m.region}, from ${money(from)} all in. Coverage and travel are both published up front.`,
    alternates: { canonical: `/${m.slug}-wedding-photographer` },
    openGraph: {
      title: `${title} | Arman Arai`,
      description: m.lede,
      url: `${SITE.url}/${m.slug}-wedding-photographer`,
      images: [{ url: CITY_PHOTOS[m.slug].hero.src, alt: CITY_PHOTOS[m.slug].hero.alt }],
    },
  };
}

export function citySchema(m: Market) {
  const url = `${SITE.url}/${m.slug}-wedding-photographer`;
  const hub = hubBySlug(m.slug);
  return [
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: `${m.city} wedding photography`,
      serviceType: "Wedding photography",
      url,
      provider: { "@id": `${SITE.url}/#business` },
      areaServed: m.areas.map((a) => ({ "@type": "Place", name: a })),
      offers: TIERS.map((t) => ({
        "@type": "Offer",
        name: `${t.name} — ${t.coverage}`,
        price: quoteFor(regionOf(m), t),
        priceCurrency: "CAD",
        url: `${SITE.url}/pricing#${t.slug}`,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: m.faqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "ItemList",
      "@id": `${url}#venues`,
      name: `Wedding locations in ${m.region}`,
      itemListElement: hub.venues.map((v, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: v.name,
        description: v.note,
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
        { "@type": "ListItem", position: 2, name: `${m.city} wedding photographer`, item: url },
      ],
    },
  ];
}

export default function CityHub({ market: m }: { market: Market }) {
  const photos = CITY_PHOTOS[m.slug];
  const hub = hubBySlug(m.slug);
  const region = regionOf(m);
  const others = MARKETS.filter((x) => x.slug !== m.slug);

  return (
    <div className="hub-sheet">
      {citySchema(m).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* ── HERO ── */}
      <header className="hub-hero" id="top">
        <p className="hub-hero-kicker">{hub.kicker}</p>
        <h1 className="hub-hero-title">{m.city}</h1>
        <div className="hub-hero-coord">
          <span className="hub-seg" />
          <span>{hub.coord}</span>
          <span className="hub-seg" />
        </div>
        <p className="hub-hero-tag">{hub.tagline}</p>

        <div className="hub-hero-photo">
          <Image
            src={photos.hero.src}
            alt={photos.hero.alt}
            fill
            className="object-cover"
            sizes="100vw"
            quality={82}
            priority
            fetchPriority="high"
          />
        </div>

        <div className="hub-hero-grid">
          <div className="hub-hero-intro">
            {hub.lead.map((para, i) => (
              <p key={para.slice(0, 30)} className={i === 0 ? "hub-lead-cap" : undefined}>
                {para}
              </p>
            ))}
          </div>
          <div className="hub-hero-stats">
            {hub.stats.map((s) => (
              <div className="hub-hero-stat" key={s.k}>
                <span className="hub-stat-k">{s.k}</span>
                <span className="hub-stat-v">{s.v}</span>
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* ── SECTION INDEX ── */}
      <nav className="hub-toc" aria-label="Page sections">
        <div className="hub-toc-inner">
          {SECTIONS.map((s) => (
            <a key={s.id} href={`#${s.id}`} className="hub-toc-link">
              {s.label}
            </a>
          ))}
        </div>
      </nav>

      {/* ── WHAT MAKES IT DIFFERENT HERE ── */}
      <section id="different" className="hub-section">
        <p className="hub-section-kicker">How I work here</p>
        <h2 className="hub-section-h">{m.angle}</h2>
        <p className="hub-section-intro">{m.lede}</p>
        <div className="hub-diff-grid">
          {hub.different.map((d) => (
            <article key={d.title} className="hub-diff-card">
              <h3 className="hub-diff-title">{d.title}</h3>
              <p className="hub-diff-body">{d.body}</p>
            </article>
          ))}
        </div>
        <div className="hub-body-copy">
          {m.body.map((para) => (
            <p key={para.slice(0, 30)}>{para}</p>
          ))}
        </div>
      </section>

      {/* ── VENUES ── */}
      <section id="venues" className="hub-section">
        <p className="hub-section-kicker">The ground</p>
        <h2 className="hub-section-h">Where {m.city} weddings happen</h2>
        <p className="hub-section-intro">{hub.venuesIntro}</p>

        <div className="hub-venue-media">
          {photos.places.map((ph) => (
            <figure key={ph.src} className="hub-venue-fig">
              <Image
                src={ph.src}
                alt={ph.alt}
                fill
                sizes="(max-width: 767px) 50vw, 25vw"
                quality={78}
                loading="lazy"
                className="object-cover"
              />
              <figcaption className="hub-venue-cap">{ph.caption}</figcaption>
            </figure>
          ))}
        </div>

        <ol className="hub-venue-list">
          {hub.venues.map((v, i) => (
            <li key={v.name} className="hub-venue-row">
              <span className="hub-venue-n">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3 className="hub-venue-name">{v.name}</h3>
                <p className="hub-venue-where">{v.where}</p>
              </div>
              <p className="hub-venue-note">{v.note}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* ── SEASON ── */}
      <section id="season" className="hub-section">
        <p className="hub-section-kicker">The calendar</p>
        <h2 className="hub-section-h">When to get married in {m.city}</h2>
        <p className="hub-section-intro">{hub.seasonIntro}</p>
        <div className="hub-season-grid">
          {hub.seasons.map((s) => (
            <article key={s.months} className="hub-season-card">
              <p className="hub-season-months">{s.months}</p>
              <p className="hub-season-light">{s.light}</p>
              <p className="hub-season-note">{s.note}</p>
            </article>
          ))}
        </div>
      </section>

      {/* ── THE DAY ── */}
      <section id="day" className="hub-section">
        <p className="hub-section-kicker">The shape of it</p>
        <h2 className="hub-section-h">How the day runs</h2>
        <p className="hub-section-intro">{hub.dayIntro}</p>
        <ol className="hub-timeline">
          {hub.day.map((s) => (
            <li key={s.time} className="hub-tl-row">
              <span className="hub-tl-time">{s.time}</span>
              <div className="hub-tl-body">
                <h3 className="hub-tl-title">{s.title}</h3>
                <p className="hub-tl-note">{s.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* ── PRICES ── */}
      <section id="prices" className="hub-section">
        <p className="hub-section-kicker">The whole number</p>
        <h2 className="hub-section-h">What a {m.city} wedding costs</h2>
        <p className="hub-section-intro">
          Travel is already inside every figure below. Sales tax is the only thing on top, and
          add-ons are the only thing that can raise it.
        </p>
        <div className="hub-price-grid">
          {TIERS.map((t, i) => (
            <article key={t.slug} className={`hub-price-card${i === 0 ? " hub-price-card--lead" : ""}`}>
              <p className="hub-price-name">{t.name}</p>
              <p className="hub-price-value">{money(quoteFor(region, t))}</p>
              <p className="hub-price-meta">{t.coverage} · {t.images}</p>
              <ul className="hub-price-list">
                {t.includes.slice(0, 5).map((inc) => (
                  <li key={inc}>{inc}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="hub-price-actions">
          <InquireButton className="hub-cta">Check a {m.city} date</InquireButton>
          <Link href="/pricing" className="hub-cta-alt">
            Add-ons and everywhere else →
          </Link>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="hub-section">
        <p className="hub-section-kicker">Questions</p>
        <h2 className="hub-section-h">{m.city}, specifically</h2>
        <div className="hub-faq">
          {m.faqs.map(({ q, a }) => (
            <details key={q} className="hub-faq-item">
              <summary className="hub-faq-q">
                {q}
                <span className="hub-faq-mark" aria-hidden>+</span>
              </summary>
              <p className="hub-faq-a">{a}</p>
            </details>
          ))}
        </div>
        <p className="hub-faq-more">
          More in the <Link href="/faq">general FAQ</Link>, and in the{" "}
          <Link href="/blog">journal</Link>.
        </p>
      </section>

      {/* ── CLOSING ── */}
      <section className="hub-section hub-section--close">
        <p className="hub-section-kicker">{m.city} dates</p>
        <h2 className="hub-section-h">Is yours open?</h2>
        <InquireButton className="hub-cta hub-cta--big">Check your date</InquireButton>
        <p className="hub-colophon">{hub.colophon}</p>
        <div className="hub-other">
          {others.map((o) => (
            <Link key={o.slug} href={`/${o.slug}-wedding-photographer`} className="hub-other-link">
              {o.city} · from {money(quoteFor(regionOf(o), CORE))}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
