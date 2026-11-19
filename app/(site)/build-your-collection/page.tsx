import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import CollectionBuilder from "@/components/CollectionBuilder";
import { DOCUMENTARY } from "@/lib/images";
import { HOURLY, MIN_HOURS, money } from "@/lib/custom-collection";
import { SITE, TERMS } from "@/lib/site";

/* Build your own collection, from scratch (owner, 2026-11-19). Hours first, then
 * options. There is no collection to start from; the arithmetic and every
 * figure live in lib/custom-collection.ts, which reads lib/site.ts.
 *
 * Submitting opens a modal with a reference and does not navigate: a
 * confirmation URL is what the Meta pixel converts on, and this form is wired
 * to no ad platform. Keep the copy on this page short.
 */

export const metadata: Metadata = {
  title: "Build Your Own Wedding Photography Collection — Arman Arai",
  description:
    "Build a wedding photography collection from scratch: pick the hours, add a second photographer, a filmmaker, albums and film, see the price as you go, and send it to Arman. Travel included anywhere in Canada.",
  alternates: { canonical: "/build-your-collection" },
  openGraph: {
    title: "Build your own wedding collection — Arman Arai",
    description: "Pick the hours, add what you want, send it to me.",
    url: `${SITE.url}/build-your-collection`,
    images: [{ url: DOCUMENTARY[9].src, alt: DOCUMENTARY[9].alt }],
  },
};

export default function BuildYourCollection() {
  const ld = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Build your own wedding photography collection",
    url: `${SITE.url}/build-your-collection`,
    description:
      "A builder for a custom wedding photography collection, priced from scratch by the hour with published add-ons.",
    isPartOf: { "@id": `${SITE.url}/#website` },
    about: { "@id": `${SITE.url}/#business` },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />

      {/* ── MASTHEAD ── */}
      <section className="relative" style={{ height: "min(42vh, 380px)", minHeight: 280 }}>
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
              "linear-gradient(to bottom, rgba(8,7,4,0.62) 0%, rgba(8,7,4,0.3) 30%), " +
              "linear-gradient(to top, rgba(8,7,4,0.97) 0%, rgba(8,7,4,0.78) 38%, rgba(8,7,4,0.25) 78%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 page-w page-px pb-9 md:pb-12"
          style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 28px rgba(8,7,4,0.9)" }}
        >
          <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4">Build your own</p>
          <h1 className="font-serif font-light text-cream leading-[1.04]" style={{ fontSize: "clamp(2.2rem,4.4vw,3.8rem)" }}>
            Start from <em className="italic text-rose">nothing</em>, and build the day
          </h1>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-xl mt-5 font-light">
            Hours first, then only what you want. {money(HOURLY)} an hour, from {MIN_HOURS}, travel
            included. Send it to me and I reply myself.
          </p>
        </div>
      </section>

      {/* ── THE BUILDER ── */}
      <section className="py-14 md:py-20 bg-ivory">
        <div className="page-w page-px">
          <CollectionBuilder />
        </div>
      </section>

      {/* ── THE SMALL PRINT, IN ONE LINE EACH ── */}
      <section className="py-10 bg-parchment border-t border-dust/40">
        <div className="page-w page-px flex flex-wrap gap-x-10 gap-y-3 text-slate text-[0.82rem]">
          <span>Prices in CAD, before tax.</span>
          <span>Travel included anywhere in Canada.</span>
          <span>{TERMS.retainer}.</span>
          <span>Nothing is booked by sending this.</span>
          <Link href="/pricing" className="text-rose hover:text-rose-dark transition-colors">
            The three set collections →
          </Link>
        </div>
      </section>
    </>
  );
}
