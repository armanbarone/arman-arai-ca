import type { Metadata } from "next";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import {
  ADDONS,
  ADDON_GROUPS,
  CORE,
  MARKETS,
  REGIONS,
  SITE,
  TIERS,
  feeFor,
  quoteFor,
} from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Photography Pricing — Three Tiers, One Published Travel Fee",
  description:
    "Core C$4,200, Signature C$5,900 and Story Weekend C$8,200, priced for Montréal. Everywhere else in Canada adds a destination fee that is published rather than quoted after you commit.",
  alternates: { canonical: "/pricing" },
  openGraph: {
    title: "Wedding Photography Pricing — Arman Arai",
    description: "Three tiers from C$4,200, plus a published destination fee for anywhere in Canada.",
    url: `${SITE.url}/pricing`,
  },
};

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

const PROCESS = [
  { n: "01", t: "You send the date", b: "Date, region, venue if you have one, and roughly how many hours you think you need. Two minutes." },
  { n: "02", t: "I reply within two business hours", b: "With whether the date is open and which tier I would actually recommend, which is not always the middle one." },
  { n: "03", t: "A twenty minute call", b: "Not a sales call. I need to hear the shape of the day before I can quote it properly." },
  { n: "04", t: "One recommended tier", b: "With the tier either side of it, and the destination fee already in the number rather than added later." },
  { n: "05", t: "A 48-hour hold on the date", b: "Free, and I will tell you if someone else asks about it in the meantime." },
  { n: "06", t: "Contract and retainer", b: "Thirty per cent to book. The balance is due before the wedding and it can be split." },
];

const FAQS = [
  {
    q: "Why is there a destination fee instead of one higher price?",
    a: "Because a Montréal wedding does not cost what a Whistler wedding costs, and burying the difference in a single national price means Montréal couples subsidise the travel of couples in British Columbia. The fee is real travel cash, plus the value of the days spent travelling, plus what it costs to be found in that market, less a C$300 allowance already inside the base price. It is rounded to the nearest C$50 and it is the same for everyone.",
  },
  {
    q: "Is the destination fee negotiable if we book flights for you?",
    a: "Partly. If you are covering flights or lodging directly, tell me at the quote stage and I will strip that cash out of the fee rather than charge for it twice. What does not come out is the travel time itself, because those are days I cannot book anything else.",
  },
  {
    q: "Why is Story Weekend's fee higher than the other two?",
    a: "It is twelve hours over two days, so it costs an extra night of lodging and an extra day of meals everywhere outside Montréal. Nothing else about the fee changes.",
  },
  {
    q: "Why did the Essential tier disappear?",
    a: "It still exists for genuinely short weekday weddings; ask and I will quote it. It is off the public ladder because too many couples were choosing six hours for a day that clearly needed eight, then buying the hours back at the overtime rate. Core is the honest default.",
  },
  {
    q: "What is not included?",
    a: "Sales tax, and any add-on below. Everything else that will appear on your invoice is on this page. Travel is the destination fee and nothing beyond it, unless your venue needs a helicopter or a permit, in which case that is quoted as its own line before you sign.",
  },
  {
    q: "How far in advance do couples book?",
    a: "Usually nine to eighteen months out for a peak-season Saturday. Off-season and weekday dates open up much later. If your date is close, ask anyway.",
  },
  {
    q: "Do you offer photo and video?",
    a: "Yes, as an add-on, priced from what a dedicated operator and the edit actually cost: C$3,500 for eight hours, C$4,500 for ten. I will not quietly bundle a videographer into a package at a number that guarantees one of us does bad work.",
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
      <section className="pt-36 md:pt-44 pb-14 md:pb-20 bg-parchment">
        <div className="page-w page-px text-center">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5">Investment</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.6rem,5.5vw,5rem)" }}>
            Three tiers, and a
            <br />
            <em className="italic text-rose">travel fee you can read</em>
          </h1>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-2xl mx-auto mt-7 font-light">
            One ladder, priced for Montréal, from {money(CORE.price)}. Everywhere else in Canada adds
            a destination fee that is published on this page rather than produced after you have
            committed. Prices are before tax.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 mt-9">
            {TIERS.map((t) => (
              <a
                key={t.slug}
                href={`#${t.slug}`}
                className="text-[0.62rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                {t.name} · {money(t.price)}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── THE THREE TIERS ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-dust/25">
            {TIERS.map((t, i) => (
              <div key={t.slug} id={t.slug} className="bg-ivory px-7 py-9 md:px-8 md:py-11 flex flex-col relative scroll-mt-24">
                {i === 0 && <span className="absolute top-0 left-0 right-0 h-px bg-rose" aria-hidden />}
                <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-4">
                  {t.name}
                  <span className="text-slate normal-case tracking-normal"> · {t.strap.toLowerCase()}</span>
                </p>
                <div className="flex items-baseline gap-2 mb-1">
                  <span className="font-serif font-light text-cream" style={{ fontSize: "clamp(2.2rem,3.4vw,3rem)", lineHeight: 1 }}>
                    {money(t.price)}
                  </span>
                </div>
                <p className="text-[0.7rem] tracking-[0.16em] uppercase text-slate mb-6">
                  {t.coverage} · Montréal base
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
              Check your date
            </InquireButton>
            <a
              href="#travel"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              What it costs outside Montréal →
            </a>
          </div>
        </div>
      </section>

      {/* ── DESTINATION FEE ── */}
      <section id="travel" className="py-16 md:py-24 bg-parchment scroll-mt-16">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-11">
            <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">Travel</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
              The whole country, <em className="italic text-rose">itemised</em>
            </h2>
            <p className="text-blush text-[0.9rem] leading-relaxed font-light mb-4">
              I am based in Montréal. Everything within 75 km is included in the base price. Beyond
              that, the destination fee is real travel cash, plus the value of the days spent
              travelling, plus what it costs to reach couples in that market, less the C$300 local
              allowance already inside the base price, rounded to the nearest C$50.
            </p>
            <p className="text-slate text-[0.85rem] leading-relaxed">
              The totals below are what you would actually pay, before tax. Airfare and lodging are
              re-quoted against your real wedding dates before a proposal is issued, so nobody is
              holding a stale number from six months ago.
            </p>
          </div>

          <div className="overflow-x-auto -mx-6 px-6 md:mx-0 md:px-0">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-y border-dust">
                  <th className="py-4 pr-6 text-[0.58rem] tracking-[0.24em] uppercase text-rose font-normal">Region</th>
                  <th className="py-4 px-4 text-[0.58rem] tracking-[0.24em] uppercase text-rose font-normal">Fee</th>
                  {TIERS.map((t) => (
                    <th key={t.slug} className="py-4 px-4 text-[0.58rem] tracking-[0.24em] uppercase text-rose font-normal whitespace-nowrap">
                      {t.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {REGIONS.map((r) => (
                  <tr key={r.slug} className="border-b border-dust/50">
                    <td className="py-4 pr-6">
                      <span className="font-serif text-cream text-[1.02rem] block leading-snug">{r.name}</span>
                      <span className="text-slate text-[0.74rem]">{r.travel}</span>
                    </td>
                    <td className="py-4 px-4 align-top whitespace-nowrap text-blush text-[0.85rem]">
                      {r.fee === 0 ? "Included" : `+${money(r.fee)}`}
                    </td>
                    {TIERS.map((t) => (
                      <td key={t.slug} className="py-4 px-4 align-top whitespace-nowrap">
                        <span className="text-cream text-[0.95rem] font-serif">{money(quoteFor(r, t))}</span>
                        {feeFor(r, t) !== r.fee && (
                          <span className="text-slate text-[0.68rem] block">fee +{money(feeFor(r, t))}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate text-[0.78rem] leading-relaxed mt-6 max-w-2xl">
            Somewhere not on this list? It gets quoted from the same formula rather than a number I
            made up. Ask and I will show you the arithmetic.
          </p>
        </div>
      </section>

      {/* ── ADD-ONS ── */}
      <section className="py-16 md:py-24 bg-ivory border-t border-dust/40">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-11">
            <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">Add-ons</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
              Priced, not <em className="italic text-rose">bundled</em>
            </h2>
            <p className="text-blush text-[0.9rem] leading-relaxed font-light">
              These are the same everywhere. Every one is a real cost with a real number, which is
              why none of them are quietly folded into a tier.
            </p>
          </div>

          {ADDON_GROUPS.map((group) => (
            <div key={group} className="mb-10 last:mb-0">
              <p className="text-[0.56rem] tracking-[0.28em] uppercase text-slate mb-3">{group}</p>
              <ul className="divide-y divide-dust/50 border-y border-dust/50">
                {ADDONS.filter((a) => a.group === group).map((a) => (
                  <li key={a.name} className="py-4 flex flex-col sm:flex-row sm:items-baseline gap-1.5 sm:gap-8">
                    <span className="font-serif text-cream text-[1.05rem] sm:w-72 shrink-0">{a.name}</span>
                    <span className="text-rose text-[0.85rem] tracking-wide sm:w-24 shrink-0">{money(a.price)}</span>
                    <span className="text-slate text-[0.82rem] leading-relaxed">{a.note}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <p className="text-slate text-[0.78rem] leading-relaxed mt-7 max-w-2xl">
            Multi-day and cultural weddings are scoped by event, crew, travel and editing volume
            rather than sold as one flat package. Sales tax sits on top of every number on this page.
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
          <div className="flex flex-wrap items-center justify-center gap-4 mt-12">
            {MARKETS.map((m) => (
              <Link
                key={m.slug}
                href={`/${m.slug}-wedding-photographer`}
                className="text-[0.62rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                {m.city}
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
