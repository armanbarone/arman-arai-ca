import Image from "next/image";
import Link from "next/link";
import InquireButton from "./InquireButton";
import { CITY_PHOTOS, CITY_WORK, WHISTLER_WORK } from "@/lib/images";
import { GALLERIES } from "@/lib/galleries";
import { posts } from "@/lib/blog";
import { hubBySlug } from "@/lib/hubs";
import {
  CORE,
  MARKETS,
  SITE,
  TIERS,
  hasPrices,
  quoteFor,
  regionBySlug,
  type Market,
} from "@/lib/site";

/* The city hub, built on the hub- section vocabulary ported from
   armanarai.com's service-place pages: a stat hero, a sticky section index,
   the differentiators, the venues, the season table, the shape of the day,
   the prices and the FAQ. Content lives in lib/hubs.ts, prices in lib/site.ts. */

const money = (n: number | null) =>
  n === null ? "On request" : `C$${n.toLocaleString("en-CA")}`;
const regionOf = (m: Market) => regionBySlug(m.regionSlug)!;

const SECTIONS = [
  { id: "different", label: "The difference" },
  { id: "venues", label: "Where" },
  { id: "work", label: "The work" },
  { id: "season", label: "When" },
  { id: "day", label: "The day" },
  { id: "albums", label: "Albums" },
  { id: "prices", label: "Prices" },
  { id: "journal", label: "Reading" },
  { id: "faq", label: "Questions" },
];

/* Real coverage from the region, as a masonry wall rather than four thumbnails.
   Montréal has no CITY_WORK entry because its three complete albums carry it. */
function WorkWall({ photos }: { photos: { src: string; alt: string }[] }) {
  return (
    <div className="hub-work-grid">
      {photos.map((ph, i) => (
        <figure key={ph.src} className={`hub-work-cell${i % 5 === 0 ? " hub-work-cell--wide" : ""}`}>
          <Image
            src={ph.src}
            alt={ph.alt}
            fill
            sizes="(max-width: 767px) 50vw, (max-width: 1279px) 33vw, 25vw"
            quality={76}
            loading="lazy"
            className="object-cover"
          />
        </figure>
      ))}
    </div>
  );
}

export function cityMetadata(m: Market) {
  const title = `${m.city} Wedding Photographer — ${m.region}`;
  const from = quoteFor(regionOf(m), CORE);
  const priceLine =
    from === null
      ? "Priced against your venue and date, before you commit to anything."
      : `From ${money(from)} all in, with travel already inside the figure.`;
  return {
    title,
    description: `${m.angle}. Wedding photography in ${m.region}. ${priceLine}`,
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
      // Only regions with a published figure get Offer markup. A quoted region
      // would otherwise emit price: null, which is worse than no offer at all.
      offers: TIERS.flatMap((t) => {
        const price = quoteFor(regionOf(m), t);
        return price === null
          ? []
          : [{
              "@type": "Offer",
              name: `${t.name} — ${t.coverage}`,
              price,
              priceCurrency: "CAD",
              url: `${SITE.url}/pricing#${t.slug}`,
            }];
      }),
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
  const priced = hasPrices(region);
  const vanCore = quoteFor(regionBySlug("vancouver")!, CORE);
  const others = MARKETS.filter((x) => x.slug !== m.slug);
  // This city's writing first, topped up with the guides that apply anywhere.
  const cityPosts = [
    ...posts.filter((post) => post.city === m.slug),
    ...posts.filter((post) => post.city === null),
  ].slice(0, 4);

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
        {/* Prose alone across a full-width section leaves half the page empty,
            so this runs as a two-column read against a frame of the work. */}
        <div className="hub-body-split">
          <div className="hub-body-copy">
            {m.body.map((para) => (
              <p key={para.slice(0, 30)}>{para}</p>
            ))}
          </div>
          <figure className="hub-body-fig">
            <Image
              src={photos.working.src}
              alt={photos.working.alt}
              fill
              sizes="(max-width: 899px) 100vw, 38vw"
              quality={78}
              loading="lazy"
              className="object-cover"
            />
            <figcaption className="hub-body-cap">On the day, in {m.city}</figcaption>
          </figure>
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

      {/* ── THE WORK ── */}
      <section id="work" className="hub-section">
        <p className="hub-section-kicker">The work</p>
        <h2 className="hub-section-h">
          {m.slug === "montreal" ? "Three complete Montréal weddings" : `Recent ${m.city} coverage`}
        </h2>
        <p className="hub-section-intro">
          {m.slug === "montreal"
            ? "Not a selection of the best frames. Three whole days, opening on the first photograph and running to the last, including the quiet parts a portfolio leaves out."
            : `Frames from real ${m.region} weddings rather than location scouting. Every one of these was a day with guests in it.`}
        </p>

        {m.slug === "montreal" ? (
          <div className="hub-album-grid">
            {GALLERIES.slice(0, 3).map((g) => (
              <Link key={g.slug} href={`/galleries/${g.slug}`} className="hub-album-card">
                <span className="hub-album-photo">
                  <Image
                    src={g.hero.url}
                    alt={g.hero.alt}
                    fill
                    sizes="(max-width: 767px) 100vw, 33vw"
                    quality={78}
                    loading="lazy"
                    className="object-cover"
                  />
                </span>
                <span className="hub-album-meta">
                  <span className="hub-album-names">{g.names}</span>
                  <span className="hub-album-where">{g.location}</span>
                  <span className="hub-album-frames">{g.frameCount} frames &rarr;</span>
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <WorkWall photos={CITY_WORK[m.slug] ?? []} />
        )}

        {m.slug === "vancouver" && (
          <>
            <h3 className="hub-section-h" style={{ fontSize: "clamp(1.4rem,2.2vw,2rem)", marginTop: "3.2rem" }}>
              And up the Sea-to-Sky
            </h3>
            <p className="hub-section-intro">
              Whistler and Squamish are inside the same price as a Kitsilano Saturday, because they
              are the same trip.
            </p>
            <WorkWall photos={WHISTLER_WORK} />
          </>
        )}
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
          {hub.day.map((s, i) => (
            <li key={s.time} className="hub-tl-item">
              <span className="hub-tl-when">{s.time}</span>
              <span className="hub-tl-num" aria-hidden>{String(i + 1).padStart(2, "0")}</span>
              <h3 className="hub-tl-title">{s.title}</h3>
              <p className="hub-tl-body">{s.body}</p>
            </li>
          ))}
        </ol>
      </section>


      {/* -- ALBUMS -- */}
      <section id="albums" className="hub-section">
        <p className="hub-section-kicker">Whole days</p>
        <h2 className="hub-section-h">Complete albums, not highlight reels</h2>
        <p className="hub-section-intro">
          Every wedding comes back as one continuous roll. These open on the first frame and run to
          the last, including the quiet parts a portfolio leaves out. It is the only honest way to
          judge whether someone can carry a whole day.
        </p>
        <div className="hub-album-grid">
          {GALLERIES.slice(0, 3).map((g) => (
            <Link key={g.slug} href={`/galleries/${g.slug}`} className="hub-album-card">
              <span className="hub-album-photo">
                <Image
                  src={g.cover.url}
                  alt={g.cover.alt}
                  fill
                  sizes="(max-width: 767px) 100vw, 33vw"
                  quality={78}
                  loading="lazy"
                  className="object-cover"
                />
              </span>
              <span className="hub-album-meta">
                <span className="hub-album-names">{g.names}</span>
                <span className="hub-album-where">{g.location} &middot; {g.date}</span>
                <span className="hub-album-frames">{g.frameCount} frames &rarr;</span>
              </span>
            </Link>
          ))}
        </div>
        <p className="hub-faq-more">
          <Link href="/galleries">All the albums</Link>, or the{" "}
          <Link href="/portfolio">five style albums</Link> in the portfolio.
        </p>
      </section>

      {/* ── PRICES ── */}
      <section id="prices" className="hub-section">
        <p className="hub-section-kicker">The whole number</p>
        <h2 className="hub-section-h">What a {m.city} wedding costs</h2>
        <p className="hub-section-intro">
          {priced
            ? "Travel is already inside every figure below. Sales tax is the only thing on top, and add-ons are the only thing that can raise it."
            : `${m.city} sits outside the three regions I publish figures for, so the price is quoted against your venue and your date rather than averaged. You get the real number before you commit to anything, and the collections themselves are identical to everywhere else.`}
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
        {!priced && (
          <p className="hub-section-intro" style={{ marginTop: "1.6rem" }}>
            For scale, the published Vancouver region runs {money(vanCore)} for Core. Send the
            venue and the date and you will have the real figure in the first reply.
          </p>
        )}
        <div className="hub-price-actions">
          <InquireButton className="hub-cta">Check a {m.city} date</InquireButton>
          <Link href="/pricing" className="hub-cta-alt">
            Add-ons and everywhere else →
          </Link>
        </div>
      </section>


      {/* -- JOURNAL -- */}
      <section id="journal" className="hub-section">
        <p className="hub-section-kicker">Reading</p>
        <h2 className="hub-section-h">Written for {m.city} couples</h2>
        <p className="hub-section-intro">
          What it costs, when to book, and how the day is built. Written to be useful before you
          have decided anything, including whether to hire me.
        </p>
        <div className="hub-post-grid">
          {cityPosts.map((post) => (
            <Link key={post.slug} href={`/blog/${post.slug}`} className="hub-post-card">
              <span className="hub-post-photo">
                <Image
                  src={post.coverImage}
                  alt={post.coverAlt}
                  fill
                  sizes="(max-width: 767px) 100vw, 25vw"
                  quality={76}
                  loading="lazy"
                  className="object-cover"
                />
              </span>
              <span className="hub-post-topic">{post.topic}</span>
              <span className="hub-post-title">{post.title}</span>
              <span className="hub-post-read">{post.readTime} &rarr;</span>
            </Link>
          ))}
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
