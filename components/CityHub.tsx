import Image from "next/image";
import Link from "next/link";
import InquireButton from "./InquireButton";
import { CITY_PHOTOS } from "@/lib/images";
import {
  CORE,
  MARKETS,
  SITE,
  TIERS,
  feeFor,
  quoteFor,
  regionBySlug,
  type Market,
} from "@/lib/site";

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

// Every market page quotes the Montréal ladder plus its own published
// destination fee, so a couple never sees a base price they cannot actually book.
const regionOf = (m: Market) => regionBySlug(m.regionSlug)!;

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
        // The real number for this region: base plus the published travel fee.
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
  const region = regionOf(m);
  const others = MARKETS.filter((x) => x.slug !== m.slug);

  return (
    <>
      {citySchema(m).map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* ── HERO ── */}
      <section className="relative" style={{ height: "min(86vh, 780px)", minHeight: 480 }}>
        <Image
          src={photos.hero.src}
          alt={photos.hero.alt}
          fill
          sizes="100vw"
          quality={82}
          priority
          fetchPriority="high"
          style={{ objectFit: "cover" }}
        />
        <span
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          /* Two layers. A gentle top-down wash so the fixed nav has something to
             sit on, and a heavy bottom scrim that is still near-opaque where the
             eyebrow sits. A soft gradient was not enough: on the Niagara
             glasshouse hero the eyebrow lands on the bride's white dress, which
             is the brightest part of the frame, and bronze-on-white is
             unreadable at any scrim strength short of this. */
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,7,4,0.55) 0%, rgba(8,7,4,0) 22%), " +
              "linear-gradient(to top, rgba(8,7,4,0.97) 0%, rgba(8,7,4,0.93) 30%, rgba(8,7,4,0.72) 45%, rgba(8,7,4,0.25) 68%, rgba(8,7,4,0) 85%)",
          }}
        />
        {/* A gradient alone cannot make small bronze type readable over an
            unpredictable photograph: on the Niagara hero the eyebrow lands on
            the bride's white dress. The text block carries its own shadow so it
            stays legible over any frame, without putting a visible box on the
            photograph. */}
        <div
          className="absolute inset-x-0 bottom-0 page-w page-px pb-12 md:pb-16"
          style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 28px rgba(8,7,4,0.9)" }}
        >
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">
            {m.province} · from {money(quoteFor(region, CORE))} all in
          </p>
          <h1 className="font-serif font-light text-cream leading-[0.98] max-w-4xl" style={{ fontSize: "clamp(2.4rem,6vw,5.4rem)" }}>
            {m.city} wedding <em className="italic text-rose">photographer</em>
          </h1>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-xl mt-6 font-light">{m.lede}</p>
        </div>
      </section>

      {/* ── THE ANGLE ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
          <div className="lg:col-span-4">
            <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-5">How I work here</p>
            <h2 className="font-serif font-light text-cream leading-tight" style={{ fontSize: "clamp(1.6rem,2.6vw,2.4rem)" }}>
              {m.angle}
            </h2>
          </div>
          <div className="lg:col-span-8 space-y-6">
            {m.body.map((para) => (
              <p key={para.slice(0, 40)} className="text-slate text-[0.9rem] leading-[1.85]">
                {para}
              </p>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICES ── */}
      <section className="py-16 md:py-24 bg-parchment">
        <div className="page-w page-px">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-11">
            <div>
              <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">The {m.city} ladder</p>
              <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
                What a day <em className="italic text-rose">costs</em>
              </h2>
            </div>
            <Link
              href="/pricing#travel"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5 self-start md:self-auto"
            >
              Add-ons and the full breakdown →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-dust/25">
            {TIERS.map((t, i) => (
              <div key={t.slug} className="bg-parchment px-7 py-9 md:px-8 md:py-11 flex flex-col relative">
                {i === 0 && <span className="absolute top-0 left-0 right-0 h-px bg-rose" aria-hidden />}
                <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-4">{t.name}</p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif font-light text-cream" style={{ fontSize: "clamp(2.2rem,3.4vw,3rem)", lineHeight: 1 }}>
                    {money(quoteFor(region, t))}
                  </span>
                </div>
                <p className="text-[0.7rem] tracking-[0.16em] uppercase text-slate mb-2">
                  {t.coverage} · {t.images}
                </p>
                {/* The split is shown rather than hidden: this is the whole point
                    of pricing travel openly instead of inside a bigger base. */}
                <p className="text-[0.68rem] text-slate mb-6">
                  {money(t.price)} base
                  {feeFor(region, t) > 0 ? ` + ${money(feeFor(region, t))} travel` : " · no travel fee"}
                </p>
                <p className="text-blush text-[0.82rem] leading-relaxed mb-5">{t.crew}</p>
                <ul className="space-y-2.5 flex-1">
                  {t.includes.map((inc) => (
                    <li key={inc} className="text-slate text-[0.8rem] leading-relaxed flex gap-3">
                      <span className="text-rose text-[0.6rem] mt-1.5 shrink-0" aria-hidden>✦</span>
                      {inc}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHERE ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-11">
            <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">The radius</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
              Where {m.city} <em className="italic text-rose">reaches</em>
            </h2>
            <p className="text-blush text-[0.9rem] leading-relaxed font-light">
              {m.region}, and the places couples here actually get married. Anything past this is a
              travel line on the quote rather than a surprise on the invoice.
            </p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {photos.places.map((ph) => (
              <figure key={ph.src} className="relative overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
                <Image
                  src={ph.src}
                  alt={ph.alt}
                  fill
                  sizes="(max-width: 1023px) 50vw, 25vw"
                  quality={78}
                  loading="lazy"
                  style={{ objectFit: "cover" }}
                />
                <span
                  aria-hidden
                  className="absolute inset-0 pointer-events-none"
                  style={{ background: "linear-gradient(to top, rgba(8,7,4,0.8), transparent 55%)" }}
                />
                <figcaption className="absolute left-0 bottom-0 p-4 text-[0.6rem] tracking-[0.22em] uppercase text-cream">
                  {ph.caption}
                </figcaption>
              </figure>
            ))}
          </div>
          <p className="text-slate text-[0.8rem] leading-relaxed mt-7">
            Also covered without a travel line: {m.areas.join(", ")}.
          </p>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-24 bg-parchment">
        <div className="page-w page-px max-w-3xl">
          <h2 className="font-serif font-light text-cream mb-11 text-center" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
            {m.city} <em className="italic text-rose">questions</em>
          </h2>
          <div className="divide-y divide-dust/50 border-y border-dust/50">
            {m.faqs.map(({ q, a }) => (
              <details key={q} className="py-6 group">
                <summary className="font-serif text-cream text-lg cursor-pointer list-none flex justify-between items-start gap-6">
                  {q}
                  <span className="text-rose text-sm mt-1 shrink-0 transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="text-slate text-[0.85rem] leading-relaxed mt-4 pr-10">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA + the other two markets ── */}
      <section className="py-16 md:py-24 bg-ivory border-t border-dust/40 text-center">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-5">{m.city} dates</p>
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
            Is yours <em className="italic text-rose">open?</em>
          </h2>
          <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Check your date
          </InquireButton>
          <p className="text-slate text-[0.72rem] tracking-[0.18em] uppercase mt-12 mb-5">Getting married elsewhere?</p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {others.map((o) => (
              <Link
                key={o.slug}
                href={`/${o.slug}-wedding-photographer`}
                className="text-[0.62rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                {o.city} · from {money(quoteFor(regionOf(o), CORE))}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
