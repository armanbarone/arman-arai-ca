import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { DOCUMENTARY } from "@/lib/images";
import { CORE, MARKETS, SITE, TIERS } from "@/lib/site";

export const metadata: Metadata = {
  title: "FAQ — Booking, Coverage, Travel and Delivery",
  description:
    "What a Canadian wedding costs, how far the travel reaches, what arrives and when, and every other question couples ask before they get in touch.",
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
        a: `Three collections, at the same figure anywhere in Canada: ${TIERS.map((t) => `${t.name} ${money(t.price)}` + ` for ${t.hours} hours`).join(", ")}. The city does not change the number. Sales tax goes on top, and so does travel if the wedding is more than 100 km from Montréal.`,
      },
      {
        q: "Is anything added afterwards?",
        a: "Only what you choose, plus travel if your wedding needs it, and travel is agreed in writing before you sign rather than billed afterwards. Add-ons are listed with their prices. If a venue needs a permit or a helicopter, that is its own line in the quote, in advance.",
      },
      {
        q: "What is the retainer?",
        a: "Thirty per cent to hold the date, with the balance due 30 days before the wedding. The balance can be split across instalments if that helps; say so and I will set it up that way from the start.",
      },
      {
        q: "Is six hours enough?",
        a: "For a ceremony and a dinner in one place, yes, and that is what Core is. It stops being enough the moment there is a getting-ready across town or a reception that runs late, and then you are buying hours back at C$450 each. If your day has two locations, take Signature.",
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
        a: "Regularly, and they are scoped by event rather than sold as one flat package. Tell me how many days, how many venues, how far apart, and which twenty minutes you would be heartbroken to lose. An extra two-hour event is C$900.",
      },
      {
        q: "Is there a second photographer?",
        a: "Not inside any collection. It is an add-on on all three, C$1,000 for six hours and C$1,500 for ten, because a second photographer is a real person being paid a real day rate and folding that into a package quietly is how it gets done badly. If the two of you are getting ready in different places, one photographer cannot be in both and I will say so rather than let you find out.",
      },
      {
        q: "Do you shoot video?",
        a: "A colour-graded feature film cut from your day: one minute on Signature, three minutes on Heirloom. Core has no feature film, only the social reels. It is shot alongside the photographs rather than by a separate operator, which is what makes it includable at all. A dedicated videographer is a different product and an add-on at C$2,000 for eight hours or C$3,000 for ten.",
      },
    ],
  },
  {
    title: "Travel",
    faqs: [
      {
        q: "Where are you based?",
        a: "Montréal. Everything within 100 km of it carries no travel charge at all. Beyond that the collection still costs the same, and the trip is quoted separately.",
      },
      {
        q: "How far will you actually travel?",
        a: "Anywhere in Canada, at the same collection price. Whistler, Vancouver Island, Québec City, the Eastern Townships, Niagara, Muskoka and the Rockies all buy Signature for C$4,500, the same as a Saturday on Saint-Paul. What differs is the trip: roughly C$200 to C$600 by car, C$600 to C$900 for Toronto, C$1,200 to C$2,000 anywhere that needs a flight. Those are ranges from real bookings, and yours gets costed against your actual venue rather than read off a grid.",
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
        a: "Social reels in the first week. A preview inside 48 hours on Core, next day on Signature, 24 hours on Heirloom. The full gallery within two weeks on Core, three weeks on Signature and Heirloom, because those two carry a graded film and real rolls to develop. The date is in the contract, not in an email.",
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
