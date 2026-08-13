import type { Metadata } from "next";
import Link from "next/link";
import AlbumStrips from "@/components/AlbumStrips";
import InquireButton from "@/components/InquireButton";
import { GALLERIES } from "@/lib/galleries";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Wedding Case Studies — Full Albums, Start to Finish",
  description:
    "Four complete wedding albums, every one shown in full rather than as a highlight reel. Open a day and see how it was covered from the first frame to the last.",
  alternates: { canonical: "/case-studies" },
  openGraph: {
    title: "Wedding Case Studies | Arman Arai",
    description: "Four complete wedding days, shown in full.",
    url: `${SITE.url}/case-studies`,
  },
};

export default function CaseStudies() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Wedding case studies",
    url: `${SITE.url}/case-studies`,
    description:
      "Complete wedding albums from Arman Arai, each shown in full from the first frame to the last.",
    hasPart: GALLERIES.map((g) => ({
      "@type": "ImageGallery",
      name: `${g.names} — ${g.location}`,
      url: `${SITE.url}/case-studies/${g.slug}`,
      numberOfItems: g.frameCount,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <section className="pt-36 md:pt-44 pb-14 text-center">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5">Case studies</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.4rem,5.5vw,5rem)" }}>
            Whole days, <em className="italic text-rose">first frame to last</em>
          </h1>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-2xl mx-auto mt-7 font-light">
            Most photographers show you twelve photographs and call it a portfolio. These are four
            complete albums, in the order the day happened, including the quiet parts. It is the
            only honest way to judge whether someone can carry a whole wedding rather than land
            twelve lucky frames.
          </p>
          <div className="divider mt-9">
            <div className="divider-line" />
            <span className="text-rose text-xs">✦</span>
            <div className="divider-line" />
          </div>
        </div>
      </section>

      <AlbumStrips galleries={GALLERIES} basePath="/case-studies" />

      <section className="bg-parchment py-16 md:py-24 text-center border-t border-dust/40">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-5">Your day next</p>
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
            Covered the <em className="italic text-rose">same way</em>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
              Check your date
            </InquireButton>
            <Link
              href="/pricing"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              What a full day costs →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
