import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { DOCUMENTARY } from "@/lib/images";
import { ENTRY, MARKETS, SCOPE, SITE, TIERS } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Booking, Coverage, Travel and Delivery",
  description:
    "What a wedding costs in Canada or abroad, where the travel reaches, what arrives and when, and every other question couples ask before they get in touch.",
  alternates: { canonical: "/faq" },
  openGraph: {
    title: "FAQ | Arman Arai",
    description: "The questions couples ask before they get in touch, answered.",
    url: `${SITE.url}/faq`,
  },
};

const money = (n: number | null) =>
  n === null ? "On request" : `C$${n.toLocaleString("en-CA")}`;

const GROUPS = [
  {
    title: "Money",
    faqs: [
      {
        q: "What does a wedding actually cost?",
        a: `Four collections, at the same figure anywhere in Canada: ${TIERS.map((t) => `${t.name} ${money(t.price)}` + ` for ${t.hours} hours`).join(", ")}. The city does not change the number. Sales tax goes on top, and travel stays separate only when the wedding requires its own trip.`,
      },
      {
        q: "Is anything added afterwards?",
        a: "Only what you choose, plus travel if your wedding needs it. Add-ons are listed with their prices. Travel uses the lowest practical early-booked route, and a permit, helicopter or other venue-specific requirement remains its own line.",
      },
      {
        q: "What is the retainer?",
        a: "Thirty per cent to hold the date, with the balance due 30 days before the wedding. The balance can be split across instalments if that helps; say so and I will set it up that way from the start.",
      },
      {
        q: "Is six hours enough?",
        a: "For a ceremony and a dinner in one place, yes, and that is what Essential is. It stops being enough the moment there is a getting-ready across town or a reception that runs late, and then you are buying hours back at C$400 each. If your day has two locations, take Signature.",
      },
    ],
  },
  {
    title: "Coverage",
    faqs: [
      {
        q: "What are the social reels?",
        a: "Short vertical videos cut from the day, included in every collection and sent in the first week. They exist to fill the gap between the wedding and the gallery, when everyone is still asking to see something. They are not the feature film and they do not replace video.",
      },
      {
        q: "Do you photograph multi-day and cultural weddings?",
        a: "Regularly, and they are scoped by event rather than sold as one flat package. Tell me how many days, how many venues, how far apart, and which twenty minutes you would be heartbroken to lose. A rehearsal dinner or welcome event of up to three hours is C$1,000.",
      },
      {
        q: "Is there a second photographer?",
        a: "Not inside any collection. It is an add-on on all three, C$1,000 for six hours and C$1,500 for ten, because a second photographer is a real person being paid a real day rate and folding that into a package quietly is how it gets done badly. If the two of you are getting ready in different places, one photographer cannot be in both and I will say so rather than let you find out.",
      },
      {
        q: "Do you shoot video?",
        a: "A colour-graded feature film cut from your day: one minute on Signature, three minutes on Complete. Essential has no feature film, only the social reels. It is shot alongside the photographs rather than by a separate operator, which is what makes it includable at all. A dedicated filmmaker is a different product: it is what Photo + Film carries at C$5,900, and it can be added to any other collection for C$2,900.",
      },
    ],
  },
  {
    title: "Travel",
    faqs: [
      {
        q: "How do you keep travel affordable?",
        a: "I book practical routes early, including low-cost carriers when they make sense, and group regional dates whenever possible. If I am already scheduled in your region, the travel fee is reduced or waived.",
      },
      {
        q: "How far will you actually travel?",
        a: "Anywhere in Canada, and anywhere in the world outside the United States. Inside Canada the collection price does not move: Whistler, Vancouver Island, Québec City, the Eastern Townships, Niagara, Muskoka and the Rockies all buy Signature for C$3,000, and travel uses the leanest practical route for the venue and date, dropping when another regional booking already covers part of the trip. A wedding outside Canada is quoted rather than priced off that ladder.",
      },
      {
        q: "Do you photograph destination weddings?",
        a: `Yes, anywhere in the world except the United States, and they are booked on this site rather than on armanarai.com. ${SCOPE.destinationPricing} ${SCOPE.destinationExamples.slice(0, 8).join(", ")} and elsewhere. There is a full page on it at ${SITE.url}/destination-wedding-photographer.`,
      },
      {
        q: "Will you photograph a wedding in the United States?",
        a: "No. I do not work in the USA, at any price, so if your wedding is there the useful answer is to book someone else rather than ask me for a quote. If you live in the United States and are marrying outside it, that is a wedding I can photograph on the normal collections.",
      },
      {
        q: "Do you speak French?",
        a: "No, I work in English. I would rather say so here than have you discover it on the day. In practice your planner, venue and officiant carry the French side of a Québec wedding, and photography direction is mostly gesture and a few words. If a French-speaking photographer genuinely matters to you, tell me and I will point you at one.",
      },
    ],
  },
  {
    title: "The day, and after",
    faqs: [
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "What is your backup if a camera fails?",
        a: "Two bodies on the day, both writing to two cards at once, and files held in at least two places plus one off-site afterwards. A corrupted card should be an inconvenience, not a catastrophe.",
      },
      {
        q: "When do the photographs arrive?",
        a: "Social reels in the first week. A preview inside 48 hours on Essential, next day on Signature and Photo + Film, 24 hours on Complete. The full gallery within two weeks on Essential and three weeks on everything above it, because those carry a graded film and real rolls to develop. A dedicated filmmaker's film on Photo + Film takes ten weeks. The date is in the contract, not in an email.",
      },
      {
        q: "How far in advance should we book?",
        a: "Peak-season Saturdays usually go nine to eighteen months ahead. Off-season and weekday dates open up much later. If your date is close, ask anyway: cancellations and gaps happen more often than the planning advice implies.",
      },
    ],
  },
];

export default function FAQ() {
  const all = GROUPS.flatMap((g) => g.faqs);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: all.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <section className="relative" style={{ height: "min(52vh, 460px)", minHeight: 320 }}>
        <Image
          src={DOCUMENTARY[5].src}
          alt={DOCUMENTARY[5].alt}
          fill
          sizes="100vw"
          quality={82}
          priority
          fetchPriority="high"
          style={{ objectFit: "cover" }}
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
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-4">Questions</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.4rem,5vw,4.4rem)" }}>
            Asked and <em className="italic text-rose">answered</em>
          </h1>
        </div>
      </section>

      {GROUPS.map((g, i) => (
        <section key={g.title} className={`py-14 md:py-20 ${i % 2 === 0 ? "bg-ivory" : "bg-parchment"}`}>
          <div className="page-w page-px max-w-3xl">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-8">{g.title}</p>
            <div className="divide-y divide-dust/50 border-y border-dust/50">
              {g.faqs.map(({ q, a }) => (
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
      ))}

      {/* City-specific questions live on the city pages; point at them rather
          than repeating them here. */}
      <section className="py-14 md:py-20 bg-ivory border-t border-dust/40 text-center">
        <div className="page-w page-px">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-blush mb-6">
            Questions about a particular city
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {MARKETS.map((m) => (
              <Link
                key={m.slug}
                href={`/${m.slug}-wedding-photographer`}
                className="text-[0.68rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                {m.city}
              </Link>
            ))}
          </div>
          <p className="text-slate text-[0.9rem] mb-8">
            Still not answered? Ask me directly, and you will have a reply inside two business hours.
          </p>
          <InquireButton className="inline-block bg-rose text-ivory text-[0.68rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Ask a question
          </InquireButton>
          <p className="text-slate text-[0.82rem] mt-8">
            {TIERS.map((t) => `${t.name} ${money(t.price)}`).join(" · ")} · the same figure in every city
          </p>
        </div>
      </section>
    </>
  );
}
