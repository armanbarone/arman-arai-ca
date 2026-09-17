import type { Metadata } from "next";
import Link from "next/link";
import AlbumStrips from "@/components/AlbumStrips";
import Clip from "@/components/Clip";
import InquireButton from "@/components/InquireButton";
import { CLIPS, hasClips } from "@/lib/clips";
import { GALLERIES } from "@/lib/galleries";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Galleries — Full Wedding Days, First Frame to Last",
  description:
    "Complete wedding albums rather than highlight reels. Open a day and it runs in order, from the getting ready to the last dance, including the quiet parts.",
  alternates: { canonical: "/galleries" },
  openGraph: {
    title: "Galleries | Arman Arai",
    description: "Complete wedding days, shown in full.",
    url: `${SITE.url}/galleries`,
  },
};

export default function Galleries() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Wedding galleries",
    url: `${SITE.url}/galleries`,
    description:
      "Complete wedding albums from Arman Arai, each shown in full from the first frame to the last.",
    hasPart: GALLERIES.map((g) => ({
      "@type": "ImageGallery",
      name: `${g.names} — ${g.location}`,
      url: `${SITE.url}/galleries/${g.slug}`,
      numberOfItems: g.frameCount,
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── MASTHEAD ── the same one the .com galleries hub uses ── */}
      <section className="gx-masthead">
        <p className="gx-eyebrow">Sample galleries</p>
        <h1 className="gx-h1">
          Full days, <em className="gx-script">from first frame to last</em>
        </h1>
        <p className="gx-lede">
          Every wedding I photograph comes back as one continuous roll. These are the opening
          frames. Choose a day and the whole album opens.
        </p>
        <div className="gx-divider">
          <span className="gx-rule" />
          <span className="gx-diamond" />
          <span className="gx-rule" />
        </div>
      </section>

      <AlbumStrips galleries={GALLERIES} basePath="/galleries" />

      {/* Moving frames. Rendered from the server page rather than from inside
          AlbumStrips, which is a client component: keeping it out here means the
          clips add no JavaScript to the bundle. The whole block disappears when
          no clip has been uploaded yet, so the feature costs nothing until it
          is used. */}
      {hasClips && (
        <section className="gx-clips">
          <div className="gx-sec-head">
            <div className="gx-divider gx-divider--wide">
              <span className="gx-rule" />
              <span className="gx-kick">In motion</span>
              <span className="gx-rule" />
            </div>
            <h2 className="gx-h2">
              A few seconds of <em className="gx-script">the day moving</em>
            </h2>
            <p className="gx-lede gx-lede--tight">
              Silent, and they loop. Nothing loads until the clip is on screen.
            </p>
          </div>
          <div className="gx-clip-grid">
            {GALLERIES.filter((g) => CLIPS[g.slug]).map((g) => (
              <Clip key={g.slug} {...CLIPS[g.slug]} />
            ))}
          </div>
        </section>
      )}

      <div className="gx-closing">
        <Link href="/portfolio" className="gx-closing-link">
          View the full portfolio →
        </Link>
      </div>

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
