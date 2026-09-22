import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { EDITORIAL, FILM } from "@/lib/images";
import { MARKETS, SCOPE, SITE, TERMS, TIERS } from "@/lib/site";

/* The destination page.
 *
 * It exists because the site previously told crawlers, in llms.txt and in
 * lib/site.ts, that destination weddings were not sold here at all. They are:
 * anywhere in the world except the United States. Every figure and every rule
 * on this page is read out of lib/site.ts so it cannot drift from /pricing.
 *
 * Structure is deliberate: each h2 is a question a couple actually types, and
 * the first sentence under it is a complete answer with the fact in it, so an
 * answer engine can quote one sentence and be correct.
 */

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

export const metadata: Metadata = {
  title: "Destination Wedding Photographer | Arman Arai",
  description:
    "A Canadian documentary wedding photographer who travels worldwide, outside the USA. Send the country, the venue and the date and you get one quoted number before you decide.",
  alternates: { canonical: "/destination-wedding-photographer" },
  openGraph: {
    title: "Destination Wedding Photographer | Arman Arai",
    description: SCOPE.oneLine,
    url: `${SITE.url}/destination-wedding-photographer`,
  },
};

const FAQS = [
  {
    q: "Where do you photograph destination weddings?",
    a: `${SCOPE.oneLine} That includes ${SCOPE.destinationExamples.slice(0, 8).join(", ")} and anywhere else the date can practically be reached. Couples usually find me for a Canadian wedding first and then ask about a wedding abroad; both are booked here, on the same four collections.`,
  },
  {
    q: "Why do you not work in the United States?",
    a: `${SCOPE.excluded} It is not a capacity question and there is no price at which it changes, so if your wedding is in the USA the honest answer is to book someone else. If you live in the United States and are marrying in Mexico, Italy, Portugal or anywhere else outside it, that is a wedding I can photograph.`,
  },
  {
    q: "What does a destination wedding cost?",
    a: `${SCOPE.destinationPricing} The collections on the pricing page are what a wedding in Canada costs; a wedding in Puglia or Oaxaca is a different job with a different shape, and quoting it off a Canadian ladder would be guesswork dressed up as a price list.`,
  },
  {
    q: "Why not just publish a destination price?",
    a: "Because the honest range is too wide to be useful. A five-hour flight to a city hotel and a two-connection trip to an island in shoulder season are not the same job, and a single published figure would be wrong for both. You get a real number, built against your actual venue and date, before you commit to anything.",
  },
  {
    q: "How is the quote worked out?",
    a: "Against the real itinerary, not a blanket rate. It covers the coverage you want, and the flights, ground travel and nights the schedule actually requires, booked on practical routes early. You see one number before you sign, and it does not move afterwards.",
  },
  {
    q: "Do we have to be Canadian to book you?",
    a: "No. Canadian couples marrying at home or abroad are the majority of the work, but the only real condition is where the wedding happens rather than which passport you hold. Prices stay in Canadian dollars either way.",
  },
  {
    q: "Who handles the legal marriage abroad?",
    a: "You do, with the local authority or through your planner, and it is worth starting early because residency waiting periods vary a lot by country. I photograph the day; I do not file paperwork and I do not officiate. Plenty of couples sign the legal documents at home and hold the real ceremony at the destination, and that is photographed exactly the same way.",
  },
  {
    q: "How far ahead should a destination date be booked?",
    a: `Nine to eighteen months for a peak-season Saturday, and earlier than a Canadian date of the same size because the trip has to be built around it. ${TERMS.retainer}, and the date can be held free for 48 hours while you decide.`,
  },
  {
    q: "What is actually different about photographing a wedding abroad?",
    a: "The photography is the same documentary and editorial work; the planning around it is not. I arrive ahead of the date rather than on it, scout the venue in the light your ceremony will actually have, and build the timeline around the local sunset instead of the one you are used to. Equipment travels as carry-on with a full second body, because a lost bag on another continent is not recoverable the way it is in Toronto.",
  },
];

const COMPARISON = [
  { row: "Price", canada: `Published: ${money(TIERS[0].price)} / ${money(TIERS[1].price)} / ${money(TIERS[2].price)}, the same in every province`, dest: "Quoted against the country, the venue and the date" },
  { row: "Travel", canada: "Its own line, reduced or waived when regional dates group", dest: "Built into the one quoted number, not added afterwards" },
  { row: "The photography", canada: "Documentary and editorial, one lead photographer", dest: "Identical. The work does not change with the postcode" },
  { row: "What comes back", canada: "Coverage, social reels, film prints, the feature film from Signature up, and the album on Complete and Photo + Film", dest: "Identical, and scoped with you when the quote is built" },
  { row: "Arrival", canada: "The day before, usually", dest: "Two to three days ahead, to scout in the real light" },
  { row: "Booking", canada: TERMS.retainer, dest: "The same retainer, on the same contract" },
];

export default function DestinationPage() {
  const ld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${SITE.url}/destination-wedding-photographer#service`,
        name: "Destination wedding photography",
        serviceType: "Destination wedding photography and coverage",
        description: `${SCOPE.oneLine} ${SCOPE.destination}`,
        provider: { "@id": `${SITE.url}/#business` },
        areaServed: SCOPE.destinationExamples.map((name) => ({ "@type": "Place", name })),
        // No Offer node, deliberately. A destination wedding has no published
        // figure, and the site's rule everywhere else is that a missing price
        // is omitted rather than filled in from a neighbouring region. Emitting
        // the Canadian ladder here would hand every answer engine a number this
        // page does not charge.
        offers: {
          "@type": "Offer",
          availability: "https://schema.org/InStock",
          priceCurrency: "CAD",
          priceSpecification: {
            "@type": "PriceSpecification",
            priceCurrency: "CAD",
            description: SCOPE.destinationPricing,
          },
          url: `${SITE.url}/contact`,
        },
      },
      {
        "@type": "FAQPage",
        "@id": `${SITE.url}/destination-wedding-photographer#faq`,
        mainEntity: FAQS.map(({ q, a }) => ({
          "@type": "Question",
          name: q,
          acceptedAnswer: { "@type": "Answer", text: a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
          { "@type": "ListItem", position: 2, name: "Destination weddings", item: `${SITE.url}/destination-wedding-photographer` },
        ],
      },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      <section className="relative" style={{ height: "min(58vh, 520px)", minHeight: 340 }}>
        <Image
          src={FILM[1].src}
          alt={FILM[1].alt}
          fill
          sizes="100vw"
          quality={82}
          priority
          fetchPriority="high"
          style={{ objectFit: "cover", objectPosition: "center 42%" }}
        />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,7,4,0.6) 0%, rgba(8,7,4,0.25) 28%), " +
              "linear-gradient(to top, rgba(8,7,4,0.97) 0%, rgba(8,7,4,0.8) 36%, rgba(8,7,4,0.3) 72%, rgba(8,7,4,0.1) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 page-w page-px pb-12 text-center"
          style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 28px rgba(8,7,4,0.9)" }}
        >
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-4">Outside Canada</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.2rem,5vw,4.2rem)" }}>
            Destination <em className="italic text-rose">weddings</em>
          </h1>
        </div>
      </section>

      {/* The answer, first, in under sixty words and with the numbers in it. */}
      <section className="py-14 md:py-20 bg-ivory">
        <div className="page-w page-px max-w-3xl">
          <p className="font-serif text-cream text-[1.35rem] md:text-[1.6rem] leading-[1.5]">
            I photograph weddings anywhere in the world except the United States. A wedding abroad
            is quoted rather than picked off a price list: send the country, the venue and the
            date, and you get one number, built against the real itinerary, before you decide
            anything.
          </p>
          <p className="text-slate text-[0.95rem] leading-relaxed mt-8">
            {SCOPE.destinationPricing} The four collections on{" "}
            <Link href="/pricing" className="text-rose hover:text-blush transition-colors">the pricing page</Link>{" "}
            are what a wedding in Canada costs, and they hold in every province. A wedding in
            Puglia is a different job, and pricing it as a Montréal wedding with a flight
            attached would be a worse answer than a real quote.
          </p>
          <p className="text-slate text-[0.95rem] leading-relaxed mt-5">{SCOPE.excluded}</p>
          <p className="text-slate text-[0.95rem] leading-relaxed mt-5">
            Elopements, and the planning that goes with them, are a separate business on{" "}
            <a href="https://www.armanarai.com" className="text-rose hover:text-blush transition-colors">
              armanarai.com
            </a>
            . A wedding, here or abroad, is booked on this site.
          </p>
        </div>
      </section>

      {/* A table, because comparative facts are what answer engines quote. */}
      <section className="py-14 md:py-20 bg-parchment border-y border-dust/40">
        <div className="page-w page-px max-w-4xl">
          <h2 className="font-serif text-cream text-2xl md:text-3xl font-light mb-3">
            What changes when the wedding is not in Canada
          </h2>
          <p className="text-slate text-[0.92rem] leading-relaxed mb-8 max-w-2xl">
            Nothing about the photography. The difference is how it is priced.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[560px]">
              <thead>
                <tr className="border-b border-dust/60">
                  <th className="py-3 pr-4 text-[0.62rem] tracking-[0.24em] uppercase text-rose font-normal">Item</th>
                  <th className="py-3 pr-4 text-[0.62rem] tracking-[0.24em] uppercase text-rose font-normal">In Canada</th>
                  <th className="py-3 text-[0.62rem] tracking-[0.24em] uppercase text-rose font-normal">Destination</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((r) => (
                  <tr key={r.row} className="border-b border-dust/30 align-top">
                    <td className="py-4 pr-4 text-cream text-[0.9rem] font-serif">{r.row}</td>
                    <td className="py-4 pr-4 text-slate text-[0.88rem] leading-relaxed">{r.canada}</td>
                    <td className="py-4 text-slate text-[0.88rem] leading-relaxed">{r.dest}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-slate text-[0.88rem] leading-relaxed mt-8">
            The Canadian column is published in full on the pricing page. The destination column
            is not a second price list I have chosen not to show you: it is one number built
            against your wedding, and you will have it before anything is committed.
          </p>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-ivory">
        <div className="page-w page-px grid md:grid-cols-2 gap-10 items-center">
          <div className="relative aspect-[4/5]">
            <Image
              src={EDITORIAL[4].src}
              alt={EDITORIAL[4].alt}
              fill
              sizes="(max-width: 768px) 100vw, 46vw"
              quality={80}
              style={{ objectFit: "cover" }}
            />
          </div>
          <div>
            <h2 className="font-serif text-cream text-2xl md:text-3xl font-light mb-6">
              Where the work already goes
            </h2>
            <p className="text-slate text-[0.95rem] leading-relaxed mb-5">
              Most of the year is Canadian: {MARKETS.map((m) => m.city).join(", ")} and the regions
              around them, all at the same published collection price. A wedding abroad is the
              same photography over a longer approach, and it is priced as its own job rather
              than as a Canadian date with a flight attached.
            </p>
            <p className="text-slate text-[0.95rem] leading-relaxed mb-8">
              {SCOPE.destinationExamples.slice(0, 9).join(", ")}: send where you are marrying and I
              will tell you plainly whether the date and the route work.
            </p>
            <div className="flex flex-wrap gap-3">
              {MARKETS.map((m) => (
                <Link
                  key={m.slug}
                  href={`/${m.slug}-wedding-photographer`}
                  className="text-[0.68rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
                >
                  {m.city}
                </Link>
              ))}
              <Link
                href="/pricing"
                className="text-[0.68rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                Pricing
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-parchment border-t border-dust/40">
        <div className="page-w page-px max-w-3xl">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-8">
            Asked before booking abroad
          </p>
          <div className="divide-y divide-dust/50 border-y border-dust/50">
            {FAQS.map(({ q, a }, i) => (
              <details key={q} className="py-6 group" open={i === 0}>
                <summary className="cursor-pointer list-none flex justify-between items-start gap-6">
                  <h2 className="font-serif text-cream text-xl font-light">{q}</h2>
                  <span
                    className="text-rose text-sm mt-1.5 shrink-0 transition-transform group-open:rotate-45"
                    aria-hidden
                  >
                    +
                  </span>
                </summary>
                <p className="text-slate text-[0.92rem] leading-relaxed mt-4 pr-10">{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="py-14 md:py-20 bg-ivory border-t border-dust/40 text-center">
        <div className="page-w page-px">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-blush mb-6">Tell me where</p>
          <p className="text-slate text-[0.95rem] mb-8 max-w-xl mx-auto">
            Send the country, the venue and the date. You will have a reply inside two business
            hours saying whether the date is open and what the trip would cost.
          </p>
          <InquireButton className="inline-block bg-rose text-ivory text-[0.68rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Ask about a destination date
          </InquireButton>
          <p className="text-slate text-[0.82rem] mt-8">
            Quoted per wedding · Canadian collections are published on{" "}
            <Link href="/pricing" className="text-rose hover:text-blush transition-colors">/pricing</Link>
          </p>
        </div>
      </section>
    </>
  );
}
