import type { Metadata } from "next";
import InquireButton from "@/components/InquireButton";
import PhotoFlipAlbum from "@/components/PhotoFlipAlbum";
import MobileAlbum from "@/components/MobileAlbum";
import WideAlbum from "@/components/WideAlbum";

export const metadata: Metadata = {
  title: "Portfolio — StillVows",
  description: "Three distinct bodies of work: editorial, film, and 1980s analogue. Turn the pages.",
};

// ── EDITORIAL ──
const EDITORIAL = [
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172cbc1f77cc354f114b.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172c0f3ad81fbdedc18c.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00434ca3dd25aa2af24f5c.png", // 3rd
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a0043a40f3ad81fbdf1b582.png", // 4th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172c0f3ad81fbdedc18b.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172cbc1f77cc354f114c.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172c939c0e5f200a5a7c.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a004396f8231fbf0b1a717a.png", // 8th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a004425f8231fbf0b1a7cde.png", // 9th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172c939c0e5f200a5a7e.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172ca3dd25aa2aee6779.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172c939c0e5f200a5a7a.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172c939c0e5f200a5a7d.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172ca3dd25aa2aee6778.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00172ca3dd25aa2aee6777.png",
];

const FILM_INSPIRED = [
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26f8231fbf0b199d41.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26f8231fbf0b199d3f.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a260f3ad81fbdf0def3.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26939c0e5f200d71d1.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26a3dd25aa2af17c36.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26a3dd25aa2af17c38.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a004487f8231fbf0b1a85ed.png", // 7th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a004487f8231fbf0b1a85ee.png", // 8th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26f8231fbf0b199d40.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a0044cff8231fbf0b1a8c7a.png", // 10th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003a26a3dd25aa2af17c37.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa2bc1f77cc35523c5d.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa2a3dd25aa2af18998.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa2f8231fbf0b19aa59.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa20f3ad81fbdf0ec61.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa2f8231fbf0b19aa58.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa2bc1f77cc35523c59.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa20f3ad81fbdf0ec62.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa2bc1f77cc35523c58.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa20f3ad81fbdf0ec6a.png",
];

// ── DOCUMENTARY ──
const DOCUMENTARY = [
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebad939c0e5f20248209.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebad0f3ad81fbd07f40c.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebada3dd25aa2a089e7c.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebad939c0e5f2024820f.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebad0f3ad81fbd07f40b.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebadbc1f77cc35695e78.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebadbc1f77cc35695e77.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebad939c0e5f20248202.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebae939c0e5f20248227.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebae43d11507db679a78.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebadbc1f77cc35695e82.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebad939c0e5f20248207.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebadbc1f77cc35695e87.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebae0f3ad81fbd07f42b.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00ebadbc1f77cc35695e79.png",
];

// ── 1980s FILM ──
const RETRO_FILM = [
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00456fbc1f77cc35533348.png", // 1st
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa20f3ad81fbdf0ec64.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa20f3ad81fbdf0ec68.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003aa20f3ad81fbdf0ec63.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf7bc1f77cc35525ec9.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00454c939c0e5f200e70f4.png", // 6th
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf7f8231fbf0b19ccbc.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf7bc1f77cc35525ec7.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf70f3ad81fbdf10f15.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf7bc1f77cc35525ec8.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf7f8231fbf0b19ccbd.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a003bf70f3ad81fbdf10f14.png",
  "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/6a00df15939c0e5f2022998f.png",
];

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
            The Work
          </p>
          <h1 className="font-serif font-light text-cream mb-6" style={{ fontSize: "clamp(2.5rem,4.5vw,4.5rem)" }}>
            Three ways of <em className="italic text-rose">seeing</em>
          </h1>
          <p className="text-blush text-base leading-relaxed max-w-2xl mx-auto font-light">
            Every couple is different. Every day has its own light, its own rhythm, its own emotional register.
            These three bodies of work reflect the range of approaches I bring — turn the pages and find the one that feels like yours.
          </p>
        </div>
      </section>

      {/* ── I. EDITORIAL ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="I — Editorial"
            title="Clean lines. Intentional light."
            description="Graphic compositions, precise framing, and a directorial eye. These images are built — not found. Suited to couples who want their wedding to feel like a fashion story."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum
              albumTitle="Editorial"
              albumSubtitle="A Wedding Collection"
              albumDate="StillVows · 2024–2025"
              images={EDITORIAL}
            />
          </div>
          <div className="md:hidden">
            <MobileAlbum
              albumTitle="Editorial"
              albumSubtitle="A Wedding Collection"
              albumDate="StillVows · 2024–2025"
              images={EDITORIAL}
            />
          </div>
        </div>
      </section>

      {/* ── II. FILM INSPIRED ── */}
      <section className="py-16 md:py-24" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="II — Film Inspired"
            title="Warm grain. Honest colour."
            description="Shot on and processed to emulate analogue film — the softness, the warmth, the way highlights roll off without clipping. This is the work that couples come back to in twenty years."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum
              albumTitle="Film Inspired"
              albumSubtitle="Analogue Aesthetic"
              albumDate="StillVows · 2024–2025"
              images={FILM_INSPIRED}
            />
          </div>
          <div className="md:hidden">
            <MobileAlbum
              albumTitle="Film Inspired"
              albumSubtitle="Analogue Aesthetic"
              albumDate="StillVows · 2024–2025"
              images={FILM_INSPIRED}
            />
          </div>
        </div>
      </section>

      {/* ── III. 1980s FILM ── */}
      <section className="py-16 md:py-24" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="III — 1980s Film"
            title="Fade. Grain. Memory."
            description="Expired stock aesthetics, shifted palettes, the nostalgic warmth of Super 8 and Kodachrome. These photographs feel like they were found in a shoebox — in the best possible way."
          />
          <div className="hidden md:flex justify-center">
            <PhotoFlipAlbum
              albumTitle="1980s Film"
              albumSubtitle="Retro Analogue"
              albumDate="StillVows · 2024–2025"
              images={RETRO_FILM}
            />
          </div>
          <div className="md:hidden">
            <MobileAlbum
              albumTitle="1980s Film"
              albumSubtitle="Retro Analogue"
              albumDate="StillVows · 2024–2025"
              images={RETRO_FILM}
            />
          </div>
        </div>
      </section>

      {/* ── IV. DOCUMENTARY ── */}
      <section className="py-16 md:py-24" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <SectionLabel
            label="IV — Documentary"
            title="Real moments. Real people."
            description="Unposed, unmanaged, and entirely honest. These images were found, not built — the kind of coverage that gives you back the moments you were too present to notice while they were happening."
          />
          <WideAlbum
            albumTitle="Documentary"
            albumSubtitle="Candid Coverage"
            albumDate="StillVows · 2025–2026"
            images={DOCUMENTARY}
          />
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-16 md:py-20 text-center" style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }}>
        <div className="page-w page-px">
          <p className="font-serif italic text-cream/60 text-lg mb-8 max-w-xl mx-auto">
            &ldquo;If something in these pages felt like it belongs to you, I&rsquo;d love to hear about your day.&rdquo;
          </p>
          <InquireButton className="inline-block text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 cursor-pointer border-none transition-colors duration-300" style={{ background: "#B8956A", color: "#080704" } as React.CSSProperties}>
            Begin the Conversation
          </InquireButton>
        </div>
      </section>
    </>
  );
}
