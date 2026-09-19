import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { SITE } from "@/lib/site";
import { PROOF, proofSrc } from "@/lib/reviews";

export const metadata: Metadata = {
  title: "Reviews — What Couples Actually Wrote",
  description:
    "Unedited messages from couples, screenshotted as they arrived. No curated pull quotes, no stock five-star graphics.",
  alternates: { canonical: "/reviews" },
  openGraph: {
    title: "Reviews | Arman Arai",
    description: "Unedited messages from couples, exactly as they arrived.",
    url: `${SITE.url}/reviews`,
  },
};

/* The screenshots, their dimensions and their alt text live in lib/reviews.ts,
   shared with the 2728 landing pages. They are laid out in masonry columns
   rather than a grid so no screenshot is ever cropped, which on a review would
   cut off the words that matter. */

export default function Reviews() {
  return (
    <>
      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-44 pb-14 md:pb-16 bg-parchment">
        <div className="page-w page-px text-center">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5">Reviews</p>
          <h1 className="font-serif font-light text-cream leading-[1.02]" style={{ fontSize: "clamp(2.5rem,5.5vw,5rem)" }}>
            Their words, <em className="italic text-rose">not mine</em>
          </h1>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-2xl mx-auto mt-7 font-light">
            Every photographer&rsquo;s website has a row of five-star pull quotes that could have been
            written by anybody. These are screenshots of what couples actually sent, in the app they
            sent it in, typos and all. Read them and decide for yourself.
          </p>
          <div className="divider mt-9">
            <div className="divider-line" />
            <span className="text-rose text-xs">✦</span>
            <div className="divider-line" />
          </div>
        </div>
      </section>

      {/* ── THE PROOF ── */}
      <section className="pb-16 md:pb-24 bg-parchment">
        <div className="page-w page-px">
          <style>{`
            .proof-cols { column-count: 1; column-gap: 14px; }
            @media (min-width: 640px)  { .proof-cols { column-count: 2; } }
            @media (min-width: 1024px) { .proof-cols { column-count: 3; } }
            .proof-item { break-inside: avoid; margin-bottom: 14px; }
          `}</style>
          <div className="proof-cols">
            {PROOF.map((p, i) => (
              <div key={p.n} className="proof-item border border-dust/60 bg-ivory">
                <Image
                  src={proofSrc(p.n)}
                  alt={p.alt}
                  width={p.w}
                  height={p.h}
                  sizes="(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw"
                  quality={82}
                  loading={i < 3 ? undefined : "lazy"}
                  priority={i < 3}
                  style={{ width: "100%", height: "auto", display: "block" }}
                />
              </div>
            ))}
          </div>
          <p className="text-slate text-[0.75rem] leading-relaxed mt-9 max-w-2xl">
            These messages span both halves of my work, weddings and the elopement days I photograph
            under armanarai.com. They are the same camera and the same person, so I have not split
            them up to look busier than I am.
          </p>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-ivory py-16 md:py-24 text-center border-t border-dust/40">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-5">Next</p>
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
            See a whole day <em className="italic text-rose">first</em>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <Link
              href="/galleries"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              See complete weddings →
            </Link>
            <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
              Check your date
            </InquireButton>
          </div>
        </div>
      </section>
    </>
  );
}
