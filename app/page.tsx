import type { Metadata } from "next";
import Link from "next/link";
import FilmStrip from "@/components/FilmStrip";
import InquireButton from "@/components/InquireButton";
import { HeroGallery, WorkGrid } from "@/components/PhotoGrid";
import { HERO, HOME_GRID } from "@/lib/images";
import { MARKETS, SITE, STARTING_FROM } from "@/lib/site";

export const metadata: Metadata = {
  title: "Canadian Wedding Photographer — Toronto, Montréal, Vancouver",
  description:
    "Documentary and editorial wedding photography across Canada, coast to coast. Home markets in Toronto, Montréal and Vancouver. Collections from $3,200 CAD, published up front.",
  alternates: { canonical: "/" },
};

const money = (n: number) => `$${n.toLocaleString("en-CA")}`;

export default function Home() {
  return (
    <>
      {/* ── HERO ── */}
      <section className="min-h-screen flex flex-col lg:grid lg:grid-cols-2" style={{ background: "#080704" }}>
        <div className="flex flex-col justify-center page-px pt-24 lg:pt-28 pb-10 relative order-1">
          <div className="page-w w-full">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-6" style={{ fontFamily: "var(--font-jost)" }}>
              Canadian wedding photography
            </p>
            <h1 className="font-serif font-light leading-[1.05] text-cream mb-5" style={{ fontSize: "clamp(3rem,5vw,5.5rem)" }}>
              Where vows
              <br />
              <em className="italic text-rose">become</em>
              <br />
              photographs
            </h1>
            <p
              className="font-serif italic font-light text-blush leading-relaxed mb-10 max-w-md"
              style={{ fontSize: "clamp(0.95rem,1.4vw,1.15rem)" }}
            >
              A wedding is the last ceremony most people take part in. I photograph it as one:
              documentary through the parts that matter, directed only where direction is the
              kindness, and handed back as a record rather than a highlight reel.
            </p>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-8">
              <Link
                href="/portfolio"
                className="text-[0.62rem] tracking-[0.2em] uppercase px-8 py-3.5 transition-colors duration-300 bg-rose text-ivory hover:bg-rose-dark"
              >
                View the work
              </Link>
              <InquireButton className="text-slate text-[0.62rem] tracking-[0.2em] uppercase hover:text-rose transition-colors duration-300 flex items-center gap-2 cursor-pointer bg-transparent border-none">
                Check your date <span>→</span>
              </InquireButton>
            </div>
            <span className="font-script text-blush/60 text-lg mt-10 block lg:absolute lg:bottom-8 lg:left-0 lg:pl-[4rem]">
              Toronto · Montréal · Vancouver
            </span>
          </div>
        </div>

        <HeroGallery photos={[HERO.main, HERO.topRight, HERO.bottomRight]} />
      </section>

      {/* ── PHILOSOPHY ── */}
      <section className="py-20 md:py-28 relative overflow-hidden" style={{ background: "#0E0C0A" }}>
        <div
          className="absolute left-2 top-4 font-serif pointer-events-none select-none"
          style={{ fontSize: "clamp(8rem,20vw,26rem)", opacity: 0.06, lineHeight: 1, color: "#E8E0D0" }}
          aria-hidden
        >
          &ldquo;
        </div>
        <div className="page-w page-px relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center">
            <div>
              <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-5" style={{ fontFamily: "var(--font-jost)" }}>
                The philosophy
              </p>
              <blockquote
                className="font-serif italic font-light text-cream leading-relaxed mb-6"
                style={{ fontSize: "clamp(1.25rem,2vw,1.7rem)" }}
              >
                &ldquo;I do not photograph how a wedding looked. I photograph what happened to the
                people in it.&rdquo;
              </blockquote>
              <p className="text-blush text-sm leading-relaxed mb-8 max-w-lg font-light">
                The vows are a vow. The walk down the aisle is a crossing. The moment a parent lets
                go of a hand is a transfer of something with no other name. I work for that layer,
                which means I will not interrupt a blessing to reposition someone and I will not
                ask you to walk back up the aisle for a better angle. The pretty pictures come out
                of that, rather than the other way around.
              </p>
              <Link
                href="/about"
                className="text-[0.62rem] tracking-[0.2em] uppercase text-rose hover:text-rose-dark transition-colors duration-300 flex items-center gap-2 w-fit pb-1"
                style={{ borderBottom: "0.5px solid rgba(184,149,106,0.3)" }}
              >
                Read my story →
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-6 md:gap-10">
              {[
                { n: "3", label: "Home markets" },
                { n: "2", label: "Languages" },
                { n: "48h", label: "To your preview" },
              ].map(({ n, label }) => (
                <div key={label} className="text-center">
                  <div className="font-serif font-light text-rose" style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>{n}</div>
                  <div className="text-[0.58rem] tracking-[0.22em] uppercase text-blush mt-1" style={{ fontFamily: "var(--font-jost)" }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FilmStrip />

      {/* ── SELECTED WORK ── */}
      <section className="py-20 md:py-28" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <div className="text-center mb-10 md:mb-14">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
              Selected work
            </p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>
              A few pages from <em className="italic text-rose">the album</em>
            </h2>
            <div className="divider">
              <div className="divider-line" />
              <span className="text-rose text-xs">✦</span>
              <div className="divider-line" />
            </div>
          </div>

          <WorkGrid photos={HOME_GRID} />

          <div className="text-center mt-8 md:mt-10 flex flex-wrap items-center justify-center gap-8">
            <Link href="/portfolio" className="text-[0.62rem] tracking-[0.2em] uppercase text-blush hover:text-rose transition-colors duration-300">
              View full portfolio →
            </Link>
            <Link href="/case-studies" className="text-[0.62rem] tracking-[0.2em] uppercase text-blush hover:text-rose transition-colors duration-300">
              Or a whole day, start to finish →
            </Link>
          </div>
        </div>
      </section>

      {/* ── INVESTMENT ── */}
      <section className="py-20 md:py-28" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px text-center">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
            Investment
          </p>
          <h2 className="font-serif font-light text-cream mb-4" style={{ fontSize: "clamp(2rem,3.5vw,3.5rem)" }}>
            The price is
            <br />
            <em className="italic text-rose">on the website</em>
          </h2>
          <div className="divider mb-12 md:mb-16">
            <div className="divider-line" />
            <span className="text-rose text-xs">✦</span>
            <div className="divider-line" />
          </div>

          <p className="font-serif italic text-cream/70 text-lg md:text-xl leading-relaxed mb-12 max-w-2xl mx-auto">
            &ldquo;Most couples say price is the first thing they want to know and the last thing
            photographers publish. Here it is, before you have to ask.&rdquo;
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px max-w-3xl mx-auto mb-14 bg-dust/30">
            {MARKETS.map((m) => (
              <Link
                key={m.slug}
                href={`/pricing#${m.slug}`}
                className="px-7 py-9 text-left block transition-colors"
                style={{ background: "#141210" }}
              >
                <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-3" style={{ fontFamily: "var(--font-jost)" }}>
                  {m.city}
                </p>
                <p className="font-serif font-light text-cream mb-2" style={{ fontSize: "1.9rem" }}>
                  from {money(m.tiers[0].price)}
                </p>
                <p className="text-blush text-xs leading-relaxed font-light">
                  Six, eight and ten hour collections to {money(m.tiers[2].price)}.
                </p>
              </Link>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8">
            <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-12 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
              Check your date
            </InquireButton>
            <Link href="/pricing" className="text-[0.62rem] tracking-[0.2em] uppercase text-blush hover:text-rose transition-colors duration-300">
              Full pricing and add-ons →
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHERE ── */}
      <section className="py-14 md:py-20" style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }}>
        <div className="page-w page-px text-center">
          <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-6" style={{ fontFamily: "var(--font-jost)" }}>
            Where I work
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
            {MARKETS.map((m) => (
              <Link
                key={m.slug}
                href={`/${m.slug}-wedding-photographer`}
                className="text-[0.68rem] tracking-[0.15em] uppercase text-blush border border-dust px-5 py-2.5 hover:border-rose hover:text-rose transition-colors"
              >
                {m.region}
              </Link>
            ))}
          </div>
          <p className="text-slate text-[0.78rem] leading-relaxed max-w-xl mx-auto">
            And anywhere else in Canada, coast to coast. Collections start at{" "}
            {money(STARTING_FROM)} CAD. Write to {SITE.email} or use the form and you will have an
            answer inside two business hours.
          </p>
        </div>
      </section>
    </>
  );
}
