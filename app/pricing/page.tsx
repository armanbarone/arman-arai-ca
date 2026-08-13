import type { Metadata } from "next";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { ADDONS, MARKETS, SITE, STARTING_FROM } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Photography Pricing — Toronto, Montréal, Vancouver",
  description:
    "Published wedding photography prices for Toronto, Montréal and Vancouver. Six, eight and ten hour collections from $3,200 to $6,500 CAD, with add-ons and travel costed separately.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wedding Photography Pricing — Arman Arai",
    description:
      "Six, eight and ten hour collections for Toronto, Montréal and Vancouver, from $3,200 CAD.",
    url: `${SITE.url}/pricing`,
  },
};

const money = (n: number) => `$${n.toLocaleString("en-CA")}`;

const PROCESS = [
  { n: "01", t: "You send the date", b: "Date, city, venue if you have one, and roughly how many hours you think you need. Two minutes." },
  { n: "02", t: "I reply within two business hours", b: "With whether the date is open and what I would actually recommend, which is not always the middle option." },
  { n: "03", t: "A twenty minute call", b: "Not a sales call. I need to hear the shape of the day before I can quote it properly." },
  { n: "04", t: "One recommended collection", b: "Plus the tier below and above it, so you can see what changes and decide against something real." },
  { n: "05", t: "A 48-hour hold on the date", b: "Free, and I will tell you if someone else asks about it in the meantime." },
  { n: "06", t: "Contract and retainer", b: "Thirty per cent to book. The balance is due before the wedding, and it can be split." },
];

const FAQS = [
  {
    q: "Why are your prices on the site at all?",
    a: "Because three quarters of couples say price is the thing they most want to know before they get in touch, and most photographers make them ask for it. Publishing the number saves us both the two emails where we find out we are not in the same range.",
  },
  {
    q: "Why does the price change by city?",
    a: "Because the cost of working in each one does. Toronto carries more travel and a more expensive market to be found in; Montréal sits lower because both are lower there. The work is identical. The overhead is not.",
  },
  {
    q: "Is there a cheaper option?",
    a: "Not from me. Below the Essential tier the maths stops working, and what that produces is a photographer who is rushing, under-equipped or shooting three weddings a weekend. I would rather tell you that than sell you a number I cannot deliver against.",
  },
  {
    q: "What is not included?",
    a: "Travel outside the home market, permits where a site requires one, printed albums beyond a credit, and sales tax. All of it is quoted before you sign, never after.",
  },
  {
    q: "How far in advance do couples book?",
    a: "Usually nine to eighteen months out for a peak-season Saturday. Off-season and weekday dates open up much later. If your date is close, ask anyway.",
  },
  {
    q: "Do you offer photo and video?",
    a: "Yes, as an add-on from $2,500, priced from the actual crew and edit cost for your day. I will not quietly bundle a videographer into a package at a number that guarantees one of us does bad work.",
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

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      {/* ── MASTHEAD ── */}
      <section className="pt-36 md:pt-44 pb-14 md:pb-20 bg-parchment">
        <div className="page-w page-px text-center">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5">Investment</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.6rem,5.5vw,5rem)" }}>
            The price is <em className="italic text-rose">on the page</em>
          </h1>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-2xl mx-auto mt-7 font-light">
            Three markets, three ladders, because the cost of working in Toronto is not the cost of
            working in Montréal. Collections run from {money(STARTING_FROM)}. Everything that is not
            in the number below is listed further down rather than discovered later.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
            {MARKETS.map((m) => (
              <a
                key={m.slug}
                href={`#${m.slug}`}
                className="text-[0.62rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                {m.city} · from {money(m.tiers[0].price)}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE LADDERS ── */}
      {MARKETS.map((m, mi) => (
        <section
          key={m.slug}
          id={m.slug}
          className={`py-16 md:py-24 scroll-mt-20 ${mi % 2 === 0 ? "bg-ivory" : "bg-parchment"}`}
        >
          <div className="page-w page-px">
            <div className="max-w-2xl mb-12">
              <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">{m.province}</p>
              <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(2rem,3.6vw,3.2rem)" }}>
                {m.city} <em className="italic text-rose">weddings</em>
              </h2>
              <p className="text-blush text-[0.9rem] leading-relaxed font-light">{m.lede}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-dust/25">
              {m.tiers.map((t, i) => (
                <div
                  key={t.name}
                  className={`px-7 py-9 md:px-8 md:py-11 flex flex-col ${
                    mi % 2 === 0 ? "bg-ivory" : "bg-parchment"
                  } ${i === 1 ? "relative" : ""}`}
                >
                  {i === 1 && (
                    <span className="absolute top-0 left-0 right-0 h-px bg-rose" aria-hidden />
                  )}
                  <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-4">
                    {t.name}
                    {i === 1 && <span className="text-slate normal-case tracking-normal"> · most booked</span>}
                  </p>
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="font-serif font-light text-cream" style={{ fontSize: "clamp(2.2rem,3.4vw,3rem)", lineHeight: 1 }}>
                      {money(t.price)}
                    </span>
                    <span className="text-[0.62rem] tracking-[0.18em] uppercase text-slate">CAD</span>
                  </div>
                  <p className="text-[0.7rem] tracking-[0.16em] uppercase text-slate mb-6">
                    {t.hours} hours · {t.images}
                  </p>
                  <p className="text-blush text-[0.82rem] leading-relaxed mb-5">{t.crew}</p>
                  <ul className="space-y-2.5 mb-7 flex-1">
                    {t.includes.map((inc) => (
                      <li key={inc} className="text-slate text-[0.8rem] leading-relaxed flex gap-3">
                        <span className="text-rose text-[0.6rem] mt-1.5 shrink-0" aria-hidden>✦</span>
                        {inc}
                      </li>
                    ))}
                  </ul>
                  <p className="text-[0.72rem] text-blush leading-relaxed border-t border-dust pt-5">
                    <span className="text-slate">Best for </span>
                    {t.bestFor}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-6">
              <InquireButton className="bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-9 py-3.5 hover:bg-rose-dark transition-colors cursor-pointer border-none">
                Check a {m.city} date
              </InquireButton>
              <Link
                href={`/${m.slug}-wedding-photographer`}
                className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
              >
                How I work in {m.city} →
              </Link>
            </div>
          </div>
        </section>
      ))}

      {/* ── ADD-ONS ── */}
      <section className="py-16 md:py-24 bg-ivory border-t border-dust/40">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-11">
            <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">Add-ons</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
              Priced, not <em className="italic text-rose">bundled</em>
            </h2>
            <p className="text-blush text-[0.9rem] leading-relaxed font-light">
              These are the same in all three markets. Every one of them is a real cost with a real
              number, which is why none of them are quietly folded into a package price.
            </p>
          </div>
          <ul className="divide-y divide-dust/50 border-y border-dust/50">
            {ADDONS.map((a) => (
              <li key={a.name} className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
                <span className="font-serif text-cream text-lg sm:w-64 shrink-0">{a.name}</span>
                <span className="text-rose text-[0.85rem] tracking-wide sm:w-28 shrink-0">
                  {a.name === "Photo and video" ? `from ${money(a.price)}` : money(a.price)}
                </span>
                <span className="text-slate text-[0.82rem] leading-relaxed">{a.note}</span>
              </li>
            ))}
            <li className="py-5 flex flex-col sm:flex-row sm:items-baseline gap-2 sm:gap-8">
              <span className="font-serif text-cream text-lg sm:w-64 shrink-0">Multi-day or cultural events</span>
              <span className="text-rose text-[0.85rem] tracking-wide sm:w-28 shrink-0">Quoted</span>
              <span className="text-slate text-[0.82rem] leading-relaxed">
                Scoped by event, crew, travel and editing volume. Never one flat price for three days.
              </span>
            </li>
          </ul>
          <p className="text-slate text-[0.78rem] leading-relaxed mt-7 max-w-2xl">
            Travel outside the home market, site permits and sales tax sit on top and are quoted before
            you sign. Prices shown are pre-tax.
          </p>
        </div>
      </section>

      {/* ── PROCESS ── */}
      <section className="py-16 md:py-24 bg-parchment">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-12">
            <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">Booking</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
              From email to <em className="italic text-rose">held date</em>
            </h2>
            <p className="text-blush text-[0.9rem] leading-relaxed font-light">
              Most couples go from first message to signed contract inside a week. None of the steps
              below take longer than they look.
            </p>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-dust/25">
            {PROCESS.map(({ n, t, b }) => (
              <li key={n} className="bg-parchment px-7 py-9">
                <div className="font-serif font-light text-rose mb-4" style={{ fontSize: "2.2rem", lineHeight: 1 }}>{n}</div>
                <h3 className="font-serif font-light text-cream text-lg mb-3">{t}</h3>
                <p className="text-slate text-[0.82rem] leading-relaxed">{b}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px max-w-3xl">
          <h2 className="font-serif font-light text-cream mb-11 text-center" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
            Straight <em className="italic text-rose">answers</em>
          </h2>
          <div className="divide-y divide-dust/50 border-y border-dust/50">
            {FAQS.map(({ q, a }) => (
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

      {/* ── CTA ── */}
      <section className="bg-parchment py-16 md:py-24 text-center border-t border-dust/40">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-5">Availability</p>
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
            Tell me the <em className="italic text-rose">date</em>
          </h2>
          <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Check your date
          </InquireButton>
        </div>
      </section>
    </>
  );
}
