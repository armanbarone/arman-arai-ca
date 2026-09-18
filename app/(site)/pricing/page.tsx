import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { CITY_PHOTOS, EDITORIAL, DREAMY_FINE_ART, FILM, DOCUMENTARY } from "@/lib/images";
import {
  ADDONS,
  ADDON_GROUPS,
  ALBUM_SPECS,
  CORE,
  OUTER_REGIONS_NOTE,
  PRIMARY_REGIONS,
  SITE,
  TIERS,
  TRAVEL,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Photography Pricing — One Price, Anywhere in Canada",
  description:
    "Three collections at one price wherever the wedding happens: Core C$3,000 for 6 hours, Signature C$4,500 for 8, Heirloom C$5,000 for 10. Social reels in every collection. Travel quoted openly on top.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wedding Photography Pricing — Arman Arai",
    description: "Three collections, one price anywhere in Canada, travel quoted openly on top.",
    url: `${SITE.url}/pricing`,
    images: [{ url: CITY_PHOTOS.montreal.hero.src, alt: CITY_PHOTOS.montreal.hero.alt }],
  },
};

const money = (n: number | null) =>
  n === null ? "On request" : `C$${n.toLocaleString("en-CA")}`;

// One photograph per collection, so the page is not three columns of text.
const TIER_PHOTO = [DREAMY_FINE_ART[6], EDITORIAL[5], FILM[5]];

const PROCESS = [
  { n: "01", t: "You send the date", b: "Date, city, venue if you have one, and roughly how many hours you think you need. Two minutes." },
  { n: "02", t: "I reply within two business hours", b: "With whether the date is open and which collection I would actually recommend, which is not always the middle one." },
  { n: "03", t: "A twenty minute call", b: "Not a sales call. I need to hear the shape of the day before I can quote it properly." },
  { n: "04", t: "One recommended collection", b: "With the one either side of it, the travel figure if your day needs one, and the tax, so you see the whole invoice before you decide." },
  { n: "05", t: "A 48-hour hold on the date", b: "Free, and I will tell you if someone else asks about it in the meantime." },
  { n: "06", t: "Contract and retainer", b: "Thirty per cent to book. The balance is due 30 days before the wedding and it can be split." },
];

const FAQS = [
  {
    q: "Does the price change depending on the city?",
    a: "No. Core is C$3,000 in Montréal, in Toronto, in Vancouver and in Halifax. The photography is the same work wherever it happens, so it carries the same number. What changes between those places is the travel, and travel is quoted separately and agreed in writing before you sign.",
  },
  {
    q: "So what does travel actually cost?",
    a: "Everything within 100 km of Montréal is free. Beyond that it is billed at what it costs me: the flight or the drive, ground transport, and the nights I need to be there the day before. Recent trips have run roughly C$200 to C$600 for Québec and eastern Ontario, C$600 to C$900 for Toronto, and C$1,200 to C$2,000 anywhere that needs a flight. Those are ranges from real bookings, not a tariff. Send the venue and the date and you get the actual figure in the first reply.",
  },
  {
    q: "Why quote travel instead of publishing a grid?",
    a: "Because a July flight to Tofino and an October drive to Québec City are not the same number, and a grid that averages them is wrong in both directions. Publishing one would mean overcharging the couple two hours away to subsidise the couple I have to fly to. The number you get is the real cost of getting to your wedding, and once it is in the contract nothing is added to it.",
  },
  {
    q: "What are the social reels, and are they the feature film?",
    a: "They are not. The reels are short vertical videos cut from the day and sent in the first week, long before the gallery is finished, so there is something to post while people are still asking. They are in every collection including Core. The feature film is a separate, colour-graded piece with sound: one minute on Signature, three minutes on Heirloom. Core has no feature film, which is part of why it is C$3,000.",
  },
  {
    q: "What exactly is the album that comes with Signature?",
    a: `${ALBUM_SPECS.signature.long}

The Heirloom collection carries the bigger one instead. ${ALBUM_SPECS.heirloom.long}`,
  },
  {
    q: "Why is Core's gallery faster than the others?",
    a: "Because there is less in it. Core is six hours with no feature film and no rolls of film to process and scan, so two weeks is honest. Signature and Heirloom carry a graded film and real film to develop, which is three weeks of actual work. If you need it sooner than that, the seven-day rush is C$500 and it is capacity-limited.",
  },
  {
    q: "Do you offer photo and video?",
    a: "A short colour-graded film cut from the day is included on Signature and Heirloom, shot alongside the photographs rather than by a second operator, which is why it is included rather than sold. Full videography is a different product and an add-on, priced from what a dedicated operator and the edit actually cost: C$2,000 for eight hours, C$3,000 for ten. I will not quietly bundle a videographer into a collection at a number that guarantees one of us does bad work.",
  },
  {
    q: "How far in advance do couples book?",
    a: "Usually nine to eighteen months out for a peak-season Saturday. Off-season and weekday dates open up much later. If your date is close, ask anyway.",
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
    itemListElement: TIERS.map((t) => ({
      "@type": "Offer",
      name: `${t.name} — ${t.coverage}`,
      description: t.includes.join(". "),
      price: t.price,
      priceCurrency: "CAD",
      url: `${SITE.url}/pricing#${t.slug}`,
      areaServed: { "@type": "Country", name: "Canada" },
    })),
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
            Three collections, <em className="italic text-rose">one price anywhere</em>
          </h1>
          <p className="text-blush text-[1rem] leading-relaxed max-w-2xl mx-auto mt-6 font-light">
            A collection costs the same in Montréal, in Toronto, in Vancouver and in a field in
            Saskatchewan. The city does not move the number. Travel beyond 100 km is quoted on
            top, in writing, before you sign.
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
            <p className="text-blush text-[0.95rem] leading-relaxed font-light max-w-2xl mx-auto mt-5">
              Every figure below is the whole price of that collection, in every city I work in.
              Sales tax and anything you choose from the add-ons go on top, and so does travel if
              your wedding is more than 100 km from Montréal.
            </p>
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
                  <p className="font-serif font-light text-cream leading-none mb-3" style={{ fontSize: "2.6rem" }}>
                    {money(t.price)}
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

      {/* ── TRAVEL ── */}
      <section id="travel" className="py-16 md:py-24 bg-parchment scroll-mt-16">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-12">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">Travel</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              Quoted, and quoted <em className="italic text-rose">before you sign</em>
            </h2>
            <p className="text-blush text-[0.95rem] leading-relaxed font-light">{TRAVEL.body}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-dust/25">
            {TRAVEL.scale.map((row) => (
              <div key={row.where} className="bg-parchment px-7 py-9 flex flex-col">
                <p className="font-serif text-rose text-[1.25rem] mb-3">{row.cost}</p>
                <h3 className="text-[0.78rem] tracking-[0.14em] uppercase text-cream mb-3 leading-snug">
                  {row.where}
                </h3>
                <p className="text-slate text-[0.85rem] leading-relaxed">{row.note}</p>
              </div>
            ))}
          </div>

          <p className="text-slate text-[0.88rem] leading-relaxed mt-8 max-w-2xl">{TRAVEL.footnote}</p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <InquireButton className="bg-rose text-ivory text-[0.68rem] tracking-[0.2em] uppercase px-9 py-3.5 hover:bg-rose-dark transition-colors cursor-pointer border-none">
              Get the real number
            </InquireButton>
            <a
              href="#elsewhere"
              className="text-[0.68rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              Where I work →
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
              The same everywhere, like the collections. Each one is a real cost with a real number,
              which is why none of them are quietly folded into a collection. The vertical social
              reels used to be on this list and are now in every collection instead, because
              charging for them was never defensible.
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
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">Where I work</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.9rem,3vw,2.9rem)" }}>
              Three home markets, <em className="italic text-rose">one country</em>
            </h2>
            <p className="text-blush text-[0.95rem] leading-relaxed font-light">
              These three have a page of their own because I shoot in them most. They do not cost
              more or less than anywhere else; nothing on this site does. Only the trip differs,
              and that is the figure I quote you.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-dust/25">
            {PRIMARY_REGIONS.map((r) => (
              <div key={r.slug} className="px-7 py-9 bg-parchment">
                <p className="text-[0.6rem] tracking-[0.28em] uppercase text-rose mb-3">{r.short}</p>
                <h3 className="font-serif font-light text-cream text-[1.35rem] mb-4 leading-snug">{r.name}</h3>
                <ul className="flex flex-wrap gap-x-2 gap-y-1.5 mb-5">
                  {r.covers.map((c) => (
                    <li key={c} className="text-blush text-[0.82rem] leading-snug after:content-['·'] after:ml-2 after:text-dust last:after:content-['']">
                      {c}
                    </li>
                  ))}
                </ul>
                <p className="text-slate text-[0.82rem] leading-relaxed mb-2">{r.travel}</p>
                <p className="text-slate text-[0.82rem] leading-relaxed">{r.tax} on top.</p>
                <Link
                  href={`/${r.slug}-wedding-photographer`}
                  className="inline-block mt-4 text-[0.66rem] tracking-[0.2em] uppercase text-rose border-b border-dust hover:border-rose transition-colors pb-1.5"
                >
                  How I work in {r.short} →
                </Link>
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
                <p className="text-slate text-[0.92rem] leading-relaxed mt-4 pr-10 whitespace-pre-line">{a}</p>
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
            Core is {money(CORE.price)} wherever you are getting married. Everything else is on
            this page.
          </p>
        </div>
      </section>
    </>
  );
}
