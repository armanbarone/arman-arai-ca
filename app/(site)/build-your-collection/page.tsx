import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CollectionBuilder from "@/components/CollectionBuilder";
import { DOCUMENTARY } from "@/lib/images";
import { ENTRY, SITE, TERMS } from "@/lib/site";

/* The custom collection builder (owner, 2026-11-18): "build your own custom
 * collection and send it to me", linked from the welcome email and from
 * /pricing. The arithmetic and every figure live in lib/custom-collection.ts,
 * which reads lib/site.ts, so this page invents nothing.
 *
 * Submitting opens a modal and does not navigate. There is no confirmation
 * URL on purpose: a thank-you page is what the Meta pixel converts on, and
 * this form is not wired to any ad platform. See components/CollectionBuilder.
 */

export const metadata: Metadata = {
  title: "Build Your Own Wedding Photography Collection — Arman Arai",
  description:
    "Start from Signature, Legacy or Photo + Film, add the hours, the album, the film and the second photographer you actually want, and send the build to me. Every price is the published one, travel included anywhere in Canada.",
  alternates: { canonical: "/build-your-collection" },
  openGraph: {
    title: "Build your own wedding collection — Arman Arai",
    description:
      "The three collections are a starting point. Build the one you want from the published prices and send it to me.",
    url: `${SITE.url}/build-your-collection`,
    images: [{ url: DOCUMENTARY[9].src, alt: DOCUMENTARY[9].alt }],
  },
};

const HOW = [
  {
    n: "01",
    t: "Start from a collection",
    b: `All three are real and all three are national prices. Signature at C$${ENTRY.price.toLocaleString("en-CA")} is where most couples start.`,
  },
  {
    n: "02",
    t: "Add only what you want",
    b: "Every option is the price it is on the pricing page. What your collection already carries is marked as yours and cannot be charged for twice.",
  },
  {
    n: "03",
    t: "Send it with your name on it",
    b: "I read the build, then reply myself with what I would recommend and what I would take out. Nothing is booked and nothing is charged.",
  },
];

export default function BuildYourCollection() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Build your own wedding photography collection",
    url: `${SITE.url}/build-your-collection`,
    description:
      "A builder for a custom wedding photography collection, starting from one of three published Canadian collections and priced from the published add-on list.",
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@id": `${SITE.url}/#business` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── MASTHEAD ── */}
      <section className="relative" style={{ height: "min(52vh, 460px)", minHeight: 320 }}>
        <Image
          src={DOCUMENTARY[9].src}
          alt={DOCUMENTARY[9].alt}
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
          className="absolute inset-x-0 bottom-0 page-w page-px pb-10 md:pb-14 text-center"
          style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 28px rgba(8,7,4,0.9)" }}
        >
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-5">Your own collection</p>
          <h1 className="font-serif font-light text-cream leading-[1.04]" style={{ fontSize: "clamp(2.3rem,4.6vw,4.2rem)" }}>
            Build it <em className="italic text-rose">yourself</em>, then send it to me
          </h1>
          <p className="text-blush text-[0.98rem] leading-relaxed max-w-2xl mx-auto mt-6 font-light">
            The three collections are a starting point, not a menu you have to pick from. Start
            from whichever one is closest, add the hours, the album, the film and the second
            photographer you actually want, and I will come back to you on it myself.
          </p>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-12 md:py-16 bg-parchment border-b border-dust/40">
        <div className="page-w page-px grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-14">
          {HOW.map((step) => (
            <div key={step.n}>
              <p className="font-serif text-rose text-[0.95rem] mb-3">{step.n}</p>
              <h2 className="text-[0.78rem] tracking-[0.16em] uppercase text-cream mb-3">{step.t}</h2>
              <p className="text-slate text-[0.86rem] leading-relaxed">{step.b}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── THE BUILDER ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <CollectionBuilder />
        </div>
      </section>

      {/* ── THE SMALL PRINT, SAID PLAINLY ── */}
      <section className="py-14 md:py-20 bg-parchment border-t border-dust/40">
        <div className="page-w page-px grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4">Worth knowing</p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(1.7rem,2.6vw,2.4rem)" }}>
              What the number <em className="italic text-rose">is and is not</em>
            </h2>
          </div>
          <div className="lg:col-span-7 space-y-5 text-slate text-[0.9rem] leading-relaxed">
            <p>
              <span className="text-cream">Travel is already in it.</span> Flights, the ground
              travel and the nights the schedule needs are inside every collection price, anywhere
              in Canada, and I arrive two days before the wedding to scout your venue. There is no
              mileage line to add. A wedding outside Canada is the one exception and is quoted per
              wedding.
            </p>
            <p>
              <span className="text-cream">Tax is on top.</span> The figure the builder shows is
              before sales tax, which is set by the province you are marrying in.
            </p>
            <p>
              <span className="text-cream">Payment.</span> {TERMS.schedule} An extra hour added
              after the contract is signed is C${TERMS.extraHour}.
            </p>
            <p>
              <span className="text-cream">It is a build, not a quote.</span> I price the real day
              rather than the form, so I may tell you that an option you ticked is a waste of your
              money on a wedding of your shape. That conversation is the point of sending it.
            </p>
            <p className="pt-2">
              <Link href="/pricing" className="text-rose hover:text-rose-dark transition-colors border-b border-rose/30 pb-0.5">
                The three collections in full
              </Link>
              <span className="text-dust px-3">·</span>
              <Link href="/faq" className="text-rose hover:text-rose-dark transition-colors border-b border-rose/30 pb-0.5">
                Questions couples ask
              </Link>
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
