import type { Metadata } from "next";
import Link from "next/link";
import AlbumStrips from "@/components/AlbumStrips";
import InquireButton from "@/components/InquireButton";
import PhotoFlipAlbum from "@/components/PhotoFlipAlbum";
import MobileAlbum from "@/components/MobileAlbum";
import WideAlbum from "@/components/WideAlbum";
import { ANALOGUE, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, allAt } from "@/lib/images";
import { GALLERIES } from "@/lib/galleries";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Portfolio — Canadian Wedding Photography",
  description:
    "Five albums of wedding work — editorial, film inspired, 1980s film, dreamy fine art and documentary — plus four complete wedding days shown from the first frame to the last.",
  alternates: { canonical: "/portfolio" },
  openGraph: {
    title: "Portfolio | Arman Arai",
    description: "Five albums of wedding work, plus four complete wedding days.",
    url: `${SITE.url}/portfolio`,
  },
};

// The flipbook components render plain <img> inside a 3D transform, so they get
// a single fixed CDN width rather than a responsive srcset.
const EDITORIAL_SRC = allAt(EDITORIAL, 1200);
const FILM_SRC = allAt(FILM, 1200);
const ANALOGUE_SRC = allAt(ANALOGUE, 1200);
const DREAMY_SRC = allAt(DREAMY_FINE_ART, 1200);
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
            Five ways of <em className="italic text-rose">seeing</em>
          </h1>
          <p className="text-blush text-base leading-relaxed max-w-2xl mx-auto font-light">
            Every wedding has its own light and its own register. These five albums are the range I
            bring to a day. Below them sit four complete weddings, so you can see whole days rather
            than only the frames that flatter me.
          </p>
        </div>
      </section>

      {/* ── I. EDITORIAL ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="I, Editorial"
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
            label="II, Film Inspired"
            title="Warm grain. Honest colour."
            description="Processed to hold on to what analogue does well: the softness, the warmth, highlights that roll off instead of clipping. This is the work couples come back to in twenty years."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum albumTitle="Film Inspired" albumSubtitle="Analogue Aesthetic" albumDate={CREDIT} images={FILM_SRC} />
          </div>
          <div className="md:hidden">
            <MobileAlbum albumTitle="Film Inspired" albumSubtitle="Analogue Aesthetic" albumDate={CREDIT} images={FILM_SRC} />
          </div>
        </div>
      </section>

      {/* ── III. ANALOGUE ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="III, 1980s Film"
            title="Fade. Grain. Memory."
            description="Expired stock palettes and the nostalgic warmth of Super 8 and Kodachrome. These photographs look like they were found in a shoebox, in the best possible way."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum albumTitle="1980s Film" albumSubtitle="Expired Stock" albumDate={CREDIT} images={ANALOGUE_SRC} />
          </div>
          <div className="md:hidden">
            <MobileAlbum albumTitle="1980s Film" albumSubtitle="Expired Stock" albumDate={CREDIT} images={ANALOGUE_SRC} />
          </div>
        </div>
      </section>

      {/* ── IV. DREAMY FINE ART ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="IV, Dreamy Fine Art"
            title="Soft light. Flowers. Air."
            description="Veils held into the sun, blossom thrown out of focus across the lens, and portraits made slowly. The most deliberately composed work I do, and the album couples choose when they want the day to look like a painting rather than a report."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum albumTitle="Dreamy Fine Art" albumSubtitle="A Floral Editorial" albumDate={CREDIT} images={DREAMY_SRC} />
          </div>
          <div className="md:hidden">
            <MobileAlbum albumTitle="Dreamy Fine Art" albumSubtitle="A Floral Editorial" albumDate={CREDIT} images={DREAMY_SRC} />
          </div>
        </div>
      </section>

      {/* ── V. DOCUMENTARY ── */}
      <section className="py-16 md:py-24" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="V, Documentary"
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
            The albums
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

      <AlbumStrips galleries={GALLERIES} basePath="/galleries" />

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
              href="/galleries"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              All four galleries →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
