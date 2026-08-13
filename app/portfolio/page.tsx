import type { Metadata } from "next";
import Link from "next/link";
import AlbumStrips from "@/components/AlbumStrips";
import InquireButton from "@/components/InquireButton";
import PhotoFlipAlbum from "@/components/PhotoFlipAlbum";
import MobileAlbum from "@/components/MobileAlbum";
import WideAlbum from "@/components/WideAlbum";
import { ANALOGUE, DOCUMENTARY, EDITORIAL, FILM, allAt } from "@/lib/images";
import { GALLERIES } from "@/lib/galleries";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfolio — Canadian Wedding Photography",
  description:
    "Four bodies of wedding work — editorial, film, documentary and analogue — plus four complete wedding albums from start to finish. Toronto, Montréal and Vancouver.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio | Arman Arai",
    description: "Four bodies of wedding work, plus four complete albums.",
    url: `${SITE.url}/portfolio`,
  },
};

// The flipbook components render plain <img> inside a 3D transform, so they get
// a single fixed CDN width rather than a responsive srcset.
const EDITORIAL_SRC = allAt(EDITORIAL, 1200);
const FILM_SRC = allAt(FILM, 1200);
const ANALOGUE_SRC = allAt(ANALOGUE, 1200);
const DOCUMENTARY_SRC = allAt(DOCUMENTARY, 1600);

const CREDIT = "Arman Arai · Canada";

function SectionLabel({ label, title, description }: { label: string; title: string; description: string }) {
  return (
    <div className="text-center mb-10">
      <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
        {label}
      </p>
      <h2 className="font-serif font-light text-cream mb-4" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
        {title}
      </h2>
      <p className="text-blush text-sm leading-relaxed max-w-xl mx-auto font-light">{description}</p>
      <div className="divider mt-6">
        <div className="divider-line" />
        <span className="text-rose text-xs">✦</span>
        <div className="divider-line" />
      </div>
    </div>
  );
}

export default function Portfolio() {
  return (
    <>
      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-40 pb-14 bg-ivory">
        <div className="page-w page-px text-center">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5" style={{ fontFamily: "var(--font-jost)" }}>
            The work
          </p>
          <h1 className="font-serif font-light text-cream mb-6" style={{ fontSize: "clamp(2.5rem,4.5vw,4.5rem)" }}>
            Four ways of <em className="italic text-rose">seeing</em>
          </h1>
          <p className="text-blush text-base leading-relaxed max-w-2xl mx-auto font-light">
            Every wedding has its own light and its own register. These four bodies of work are the
            range I bring to a day. Below them sit four complete albums, so you can see whole days
            rather than only the frames that flatter me.
          </p>
        </div>
      </section>

      {/* ── I. EDITORIAL ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="I — Editorial"
            title="Clean lines. Intentional light."
            description="Graphic compositions, precise framing, a directorial eye. These images are built rather than found, for couples who want the day to read like a fashion story."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum albumTitle="Editorial" albumSubtitle="A Wedding Collection" albumDate={CREDIT} images={EDITORIAL_SRC} />
          </div>
          <div className="md:hidden">
            <MobileAlbum albumTitle="Editorial" albumSubtitle="A Wedding Collection" albumDate={CREDIT} images={EDITORIAL_SRC} />
          </div>
        </div>
      </section>

      {/* ── II. FILM ── */}
      <section className="py-16 md:py-24" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="II — Film"
            title="Warm grain. Honest colour."
            description="Processed to hold on to what analogue does well: the softness, the warmth, highlights that roll off instead of clipping. This is the work couples come back to in twenty years."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum albumTitle="Film" albumSubtitle="Analogue Aesthetic" albumDate={CREDIT} images={FILM_SRC} />
          </div>
          <div className="md:hidden">
            <MobileAlbum albumTitle="Film" albumSubtitle="Analogue Aesthetic" albumDate={CREDIT} images={FILM_SRC} />
          </div>
        </div>
      </section>

      {/* ── III. ANALOGUE ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="III — Analogue"
            title="Fade. Grain. Memory."
            description="Expired stock palettes and the nostalgic warmth of Super 8 and Kodachrome. These photographs look like they were found in a shoebox, in the best possible way."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum albumTitle="Analogue" albumSubtitle="Retro Film" albumDate={CREDIT} images={ANALOGUE_SRC} />
          </div>
          <div className="md:hidden">
            <MobileAlbum albumTitle="Analogue" albumSubtitle="Retro Film" albumDate={CREDIT} images={ANALOGUE_SRC} />
          </div>
        </div>
      </section>

      {/* ── IV. DOCUMENTARY ── */}
      <section className="py-16 md:py-24" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="IV — Documentary"
            title="Real moments. Real people."
            description="Unposed and unmanaged. The kind of coverage that gives you back the parts of the day you were too present to notice while they were happening."
          />
          <WideAlbum albumTitle="Documentary" albumSubtitle="Candid Coverage" albumDate={CREDIT} images={DOCUMENTARY_SRC} />
        </div>
      </section>

      {/* ── THE ALBUMS ── */}
      <section className="pt-16 md:pt-24 pb-4" style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }}>
        <div className="page-w page-px text-center">
          <p className="text-[0.58rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
            V — The albums
          </p>
          <h2 className="font-serif font-light text-cream mb-4" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>
            Whole <em className="italic text-rose">days</em>
          </h2>
          <p className="text-blush text-sm leading-relaxed max-w-xl mx-auto font-light mb-14">
            Four weddings shown in full, in the order they happened. Open one and it runs from the
            first frame to the last, including the quiet parts a highlight reel leaves out.
          </p>
        </div>
      </section>

      <AlbumStrips galleries={GALLERIES} basePath="/case-studies" />

      {/* ── CTA ── */}
      <section className="py-16 md:py-20 text-center" style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }}>
        <div className="page-w page-px">
          <p className="font-serif italic text-cream/60 text-lg mb-8 max-w-xl mx-auto">
            &ldquo;If something in these pages felt like it belongs to you, I&rsquo;d like to hear about your day.&rdquo;
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
              Check your date
            </InquireButton>
            <Link
              href="/case-studies"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              All four case studies →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
