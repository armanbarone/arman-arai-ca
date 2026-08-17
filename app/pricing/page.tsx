import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { CITY_PHOTOS, EDITORIAL, DREAMY_FINE_ART, FILM, DOCUMENTARY } from "@/lib/images";
import {
  ADDONS,
  ADDON_GROUPS,
  CORE,
  OUTER_REGIONS_NOTE,
  PRIMARY_REGIONS,
  SITE,
  TIERS,
  quoteFor,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Photography Pricing — Montréal, Toronto, Vancouver",
  description:
    "Three collections, and the whole price for each region. Montréal from C$4,000, Toronto from C$4,000, Vancouver from C$4,500. A feature film and film prints included in every collection.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wedding Photography Pricing — Arman Arai",
    description: "Three collections. One number per city, everything in it.",
    url: `${SITE.url}/pricing`,
    images: [{ url: CITY_PHOTOS.montreal.hero.src, alt: CITY_PHOTOS.montreal.hero.alt }],
  },
};

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

// One photograph per collection, so the page is not three columns of text.
const TIER_PHOTO = [DREAMY_FINE_ART[6], EDITORIAL[5], FILM[5]];

const PROCESS = [
  { n: "01", t: "You send the date", b: "Date, city, venue if you have one, and roughly how many hours you think you need. Two minutes." },
  { n: "02", t: "I reply within two business hours", b: "With whether the date is open and which collection I would actually recommend, which is not always the middle one." },
  { n: "03", t: "A twenty minute call", b: "Not a sales call. I need to hear the shape of the day before I can quote it properly." },
  { n: "04", t: "One recommended collection", b: "With the one either side of it, and the whole price rather than a starting figure." },
  { n: "05", t: "A 48-hour hold on the date", b: "Free, and I will tell you if someone else asks about it in the meantime." },
  { n: "06", t: "Contract and retainer", b: "Thirty per cent to book. The balance is due 30 days before the wedding and it can be split." },
];

const FAQS = [
  {
    q: "Is the price on this page the whole price?",
    a: "Yes. The number beside your city is what the collection costs there, travel included. The only things that go on top are sales tax and any add-on you choose from the list below.",
  },
  {
    q: "Why does Vancouver cost more than Montréal?",
    a: "Because I am based in Montréal and a Vancouver wedding is a flight, three nights and ground transport before I have taken a single frame. Rather than charging Montréal couples a national average that quietly subsidises that, each city carries its own real cost. The photography is identical.",
  },
  {
    q: "What is the feature film, exactly?",
    a: "Short vertical videos cut from the day, in every collection. You get them in the first week, long before the gallery is finished, so there is something to post while people are still asking. They are not a highlight film and they are not a substitute for video, they are the thing that fills the gap between the wedding and the album.",
  },
  {
    q: "Why did the six-hour collection disappear?",
    a: "It still exists for genuinely short weekday weddings; ask and I will quote it. It is off the public list because too many couples chose six hours for a day that clearly needed eight and then bought the hours back at the overtime rate. Core is the honest default.",
  },
  {
    q: "We are getting married somewhere not on this page.",
    a: "Then it goes in the second table, or I quote it from the same arithmetic. Nothing gets a number I invented on the spot.",
  },
  {
    q: "How far in advance do couples book?",
    a: "Usually nine to eighteen months out for a peak-season Saturday. Off-season and weekday dates open up much later. If your date is close, ask anyway.",
  },
  {
    q: "Do you offer photo and video?",
    a: "A short colour-graded film cut from the day: one minute on Core, two minutes on Signature and Story Weekend. I shoot it alongside the photographs rather than bringing a second operator, which is why it is included rather than sold. Full videography is a different product and an add-on, priced from what a dedicated operator and the edit actually cost: C$3,500 for eight hours, C$4,500 for ten. I will not quietly bundle a videographer into a collection at a number that guarantees one of us does bad work.",
  },
];

export default function Pricing() {
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const offerLd = {
    "@context": "https://schema.org",
    "@type": "OfferCatalog",
    name: "Canadian wedding photography",
    url: `${SITE.url}/pricing`,
    provider: { "@id": `${SITE.url}/#business` },
    itemListElement: PRIMARY_REGIONS.flatMap((r) =>
      TIERS.map((t) => ({
        "@type": "Offer",
        name: `${t.name} — ${t.coverage} — ${r.short}`,
        description: t.includes.join(". "),
        price: quoteFor(r, t),
        priceCurrency: "CAD",
        url: `${SITE.url}/pricing#${t.slug}`,
        areaServed: { "@type": "City", name: r.short },
      })),
    ),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(offerLd) }} />

      {/* ── MASTHEAD ── */}
      <section className="relative" style={{ height: "min(62vh, 560px)", minHeight: 380 }}>
        <Image
          src={DOCUMENTARY[7].src}
          alt={DOCUMENTARY[7].alt}
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
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,7,4,0.6) 0%, rgba(8,7,4,0.25) 26%), " +
              "linear-gradient(to top, rgba(8,7,4,0.97) 0%, rgba(8,7,4,0.8) 34%, rgba(8,7,4,0.3) 70%, rgba(8,7,4,0.1) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 page-w page-px pb-12 md:pb-16 text-center"
          style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 28px rgba(8,7,4,0.9)" }}
        >
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-5">Investment</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.6rem,5.5vw,5rem)" }}>
            Three collections, <em className="italic text-rose">one number each</em>
          </h1>
          <p className="text-blush text-[1rem] leading-relaxed max-w-2xl mx-auto mt-6 font-light">
            No starting-from figures and nothing added later. The price beside your city is the
            price, travel included. Sales tax is the only thing on top.
          </p>
        </div>
      </section>

      {/* ── THE THREE COLLECTIONS ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <div className="text-center mb-12">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">The collections</p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              What you <em className="italic text-rose">get</em>
            </h2>
            <div className="divider mt-6">
              <div className="divider-line" />
              <span className="text-rose text-xs">✦</span>
              <div className="divider-line" />
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-dust/25">
            {TIERS.map((t, i) => (
              <div key={t.slug} id={t.slug} className="bg-ivory flex flex-col relative scroll-mt-24">
                {i === 0 && <span className="absolute top-0 left-0 right-0 h-px bg-rose z-10" aria-hidden />}
                <div className="relative w-full" style={{ aspectRatio: "4 / 3" }}>
                  <Image
                    src={TIER_PHOTO[i].src}
                    alt={TIER_PHOTO[i].alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 33vw"
                    quality={80}
                    loading={i === 0 ? undefined : "lazy"}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div className="px-7 py-9 md:px-8 md:py-10 flex flex-col flex-1">
                  <p className="text-[0.62rem] tracking-[0.28em] uppercase text-rose mb-4">
                    {t.name}
                    <span className="text-slate normal-case tracking-normal"> · {t.strap.toLowerCase()}</span>
                  </p>
                  <p className="text-[0.78rem] tracking-[0.14em] uppercase text-slate mb-5">
                    {t.coverage} · {t.images}
                  </p>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {t.includes.map((inc) => (
                      <li key={inc} className="text-slate text-[0.88rem] leading-relaxed flex gap-3">
                        <span className="text-rose text-[0.62rem] mt-1.5 shrink-0" aria-hidden>✦</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[0.8rem] text-blush leading-relaxed border-t border-dust pt-5">
                    <span className="text-slate">Best for </span>
                    {t.bestFor}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE THREE CITIES ── */}
      <section className="py-16 md:py-24 bg-parchment">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-12">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">The price</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              Three cities, <em className="italic text-rose">all in</em>
            </h2>
            <p className="text-blush text-[0.95rem] leading-relaxed font-light">
              I live in Montréal and I work in all three. Toronto and Vancouver cost more because
              they are a flight and hotel nights before I take a frame, not because the photography
              changes. Every number below is complete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {PRIMARY_REGIONS.map((r) => {
              const photo = CITY_PHOTOS[r.slug];
              return (
                <div key={r.slug} className="border border-dust bg-ivory flex flex-col">
                  <div className="relative w-full" style={{ aspectRatio: "3 / 2" }}>
                    <Image
                      src={photo.hero.src}
                      alt={photo.hero.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      quality={80}
                      loading="lazy"
                      style={{ objectFit: "cover" }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, rgba(8,7,4,0.85), transparent 60%)" }}
                    />
                    <h3
                      className="absolute left-0 bottom-0 p-5 font-serif font-light text-cream"
                      style={{ fontSize: "1.7rem" }}
                    >
                      {r.short}
                    </h3>
                  </div>
                  <ul className="p-6 space-y-4 flex-1">
                    {TIERS.map((t) => (
                      <li key={t.slug} className="flex items-baseline justify-between gap-4 border-b border-dust/40 pb-3 last:border-0">
                        <span className="text-slate text-[0.88rem]">{t.name}</span>
                        <span className="font-serif text-cream" style={{ fontSize: "1.35rem" }}>
                          {money(quoteFor(r, t))}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <div className="px-6 pb-6">
                    <Link
                      href={`/${r.slug}-wedding-photographer`}
                      className="text-[0.68rem] tracking-[0.2em] uppercase text-rose border-b border-dust hover:border-rose transition-colors pb-1.5"
                    >
                      How I work in {r.short} →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <InquireButton className="bg-rose text-ivory text-[0.68rem] tracking-[0.2em] uppercase px-9 py-3.5 hover:bg-rose-dark transition-colors cursor-pointer border-none">
              Check your date
            </InquireButton>
            <a
              href="#elsewhere"
              className="text-[0.68rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              Getting married somewhere else? →
            </a>
          </div>
        </div>
      </section>

      {/* ── ADD-ONS ── */}
      <section className="py-16 md:py-24 bg-ivory border-t border-dust/40">
        <div className="page-w page-px grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">Add-ons</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              Priced, not <em className="italic text-rose">bundled</em>
            </h2>
            <p className="text-blush text-[0.95rem] leading-relaxed font-light mb-8">
              The same everywhere. Each one is a real cost with a real number, which is why none of
              them are quietly folded into a collection.
            </p>
            <div className="relative w-full hidden lg:block" style={{ aspectRatio: "4 / 5" }}>
              <Image
                src={FILM[10].src}
                alt={FILM[10].alt}
                fill
                sizes="33vw"
                quality={78}
                loading="lazy"
                style={{ objectFit: "cover" }}
              />
            </div>
          </div>

          <div className="lg:col-span-8">
            {ADDON_GROUPS.map((group) => (
              <div key={group} className="mb-9 last:mb-0">
                <p className="text-[0.6rem] tracking-[0.28em] uppercase text-slate mb-3">{group}</p>
                <ul className="divide-y divide-dust/50 border-y border-dust/50">
                  {ADDONS.filter((a) => a.group === group).map((a) => (
                    <li key={a.name} className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-6">
                      <span className="font-serif text-cream text-[1.1rem] sm:w-64 shrink-0">{a.name}</span>
                      <span className="text-rose text-[0.92rem] tracking-wide sm:w-24 shrink-0">{money(a.price)}</span>
                      <span className="text-slate text-[0.88rem] leading-relaxed">{a.note}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
            <p className="text-slate text-[0.85rem] leading-relaxed mt-7">
              Multi-day and cultural weddings are scoped by event, crew, travel and editing volume
              rather than sold as one flat package. Sales tax sits on top of every number here.
            </p>
          </div>
        </div>
      </section>

      {/* ── WHAT EACH PRICE COVERS ── */}
      <section id="elsewhere" className="py-16 md:py-24 bg-parchment scroll-mt-16">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-11">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">What each price covers</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              One number, <em className="italic text-rose">a whole region</em>
            </h2>
            <p className="text-blush text-[0.95rem] leading-relaxed font-light">
              Each figure above buys the same collection anywhere in that region. Québec City costs
              what Montréal costs. Whistler costs what Vancouver costs. Niagara costs what Toronto
              costs. Travel and accommodation are already inside the number.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-dust/25">
            {PRIMARY_REGIONS.map((r) => (
              <div key={r.slug} className="px-7 py-9 bg-parchment">
                <p className="text-[0.6rem] tracking-[0.28em] uppercase text-rose mb-3">
                  {r.short} &middot; from {money(quoteFor(r, CORE))}
                </p>
                <h3 className="font-serif font-light text-cream text-[1.35rem] mb-4 leading-snug">{r.name}</h3>
                <ul className="flex flex-wrap gap-x-2 gap-y-1.5 mb-5">
                  {r.covers.map((c) => (
                    <li key={c} className="text-blush text-[0.82rem] leading-snug after:content-['·'] after:ml-2 after:text-dust last:after:content-['']">
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="text-slate text-[0.82rem] leading-relaxed">{r.tax} on top.</p>
              </div>
            ))}
          </div>

          <p className="text-slate text-[0.88rem] leading-relaxed mt-8 max-w-2xl">
            {OUTER_REGIONS_NOTE}
          </p>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-12">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">Booking</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              From email to <em className="italic text-rose">held date</em>
            </h2>
            <p className="text-blush text-[0.95rem] leading-relaxed font-light">
              Most couples go from first message to signed contract inside a week.
            </p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dust/25">
            {PROCESS.map(({ n, t, b }) => (
              <li key={n} className="bg-ivory px-7 py-9">
                <div className="font-serif font-light text-rose mb-4" style={{ fontSize: "2.2rem", lineHeight: 1 }}>{n}</div>
                <h3 className="font-serif font-light text-cream text-xl mb-3">{t}</h3>
                <p className="text-slate text-[0.88rem] leading-relaxed">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-24 bg-parchment">
        <div className="page-w page-px max-w-3xl">
          <h2 className="font-serif font-light text-cream mb-11 text-center" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
            Straight <em className="italic text-rose">answers</em>
          </h2>
          <div className="divide-y divide-dust/50 border-y border-dust/50">
            {FAQS.map(({ q, a }) => (
              <details key={q} className="py-6 group">
                <summary className="font-serif text-cream text-xl cursor-pointer list-none flex justify-between items-start gap-6">
                  {q}
                  <span className="text-rose text-sm mt-1.5 shrink-0 transition-transform group-open:rotate-45" aria-hidden>+</span>
                </summary>
                <p className="text-slate text-[0.92rem] leading-relaxed mt-4 pr-10">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ivory py-16 md:py-24 text-center border-t border-dust/40">
        <div className="page-w page-px">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-blush mb-5">Availability</p>
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize: "clamp(1.9rem,3vw,3rem)" }}>
            Tell me the <em className="italic text-rose">date</em>
          </h2>
          <InquireButton className="inline-block bg-rose text-ivory text-[0.68rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Check your date
          </InquireButton>
          <p className="text-slate text-[0.85rem] mt-8">
            Core in Montréal is {money(CORE.price)}. Everything is on this page.
          </p>
        </div>
      </section>
    </>
  );
}
