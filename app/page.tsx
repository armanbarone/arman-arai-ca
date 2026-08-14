import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FilmStrip from "@/components/FilmStrip";
import InquireButton from "@/components/InquireButton";
import { HeroGallery, WorkGrid } from "@/components/PhotoGrid";
import { CITY_PHOTOS, HERO, HOME_GRID, HOME_SEQUENCE } from "@/lib/images";
import { MARKETS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Canadian Wedding Photographer — Toronto, Montréal, Vancouver",
  description:
    "Bilingual documentary and editorial wedding photography, based in Montréal and working across Canada. Three tiers from C$4,200, with travel priced openly rather than hidden in a package.",
  alternates: { canonical: "/" },
};

const WHY = [
  {
    t: "The room is half the picture",
    b: "A wedding happens in front of people, in a place chosen on purpose. I photograph the room and the people in it, not only the two of you against a good wall.",
  },
  {
    t: "Direction only where it helps",
    b: "Twenty minutes of real direction for the portraits. The rest of the day I stay out of the way, because a ceremony interrupted for a better angle is a worse ceremony.",
  },
  {
    t: "Bilingual, and it matters",
    b: "Half the room francophone and half anglophone is a normal Quebec wedding. Nobody gets spoken to in their second language on the day that counts.",
  },
];

const DELIVERY = [
  { n: "I", t: "Social clips, first", b: "Vertical videos cut from the day, in every collection, in the first week. Something to post while everyone is still asking." },
  { n: "II", t: "A preview in 48 hours", b: "Forty frames while the day is still in your head. Next-day or 24-hour on the higher collections." },
  { n: "III", t: "The full gallery", b: "Five to seven weeks on Core, four on Signature, three on Story Weekend. The date is in the contract." },
  { n: "IV", t: "Something printed", b: "An album credit on the top two collections, because a hard drive is not an heirloom." },
];

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
            <Link href="/galleries" className="text-[0.62rem] tracking-[0.2em] uppercase text-blush hover:text-rose transition-colors duration-300">
              Or a whole day, start to finish →
            </Link>
          </div>
        </div>
      </section>

      {/* -- WHY IT IS PHOTOGRAPHED THIS WAY -- */}
      <section className="py-20 md:py-28" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
              Why this way
            </p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(2rem,3.5vw,3.4rem)" }}>
              A wedding is <em className="italic text-rose">witnessed</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-dust/25">
            {WHY.map(({ t: h, b }) => (
              <div key={h} className="px-7 py-9 md:px-8 md:py-11" style={{ background: "#0E0C0A" }}>
                <h3 className="font-serif font-light text-cream text-2xl mb-4">{h}</h3>
                <p className="text-slate text-[0.92rem] leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- HOW THE DAY IS SEQUENCED -- */}
      <section className="py-20 md:py-28" style={{ background: "#080704" }}>
        <div className="page-w page-px grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          <div className="lg:col-span-5">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-5" style={{ fontFamily: "var(--font-jost)" }}>
              How the day runs
            </p>
            <h2 className="font-serif font-light text-cream mb-6" style={{ fontSize: "clamp(2rem,3.2vw,3rem)" }}>
              Built backwards from <em className="italic text-rose">the light</em>
            </h2>
            <p className="text-slate text-[0.95rem] leading-[1.85] mb-6">
              Sunset is the only fixed point in a wedding day. Everything else can move, and on most
              weddings something has to. We set the portrait window first and build the schedule
              around it, with one deliberate block of slack before the ceremony that absorbs the
              whole morning&rsquo;s drift.
            </p>
            <Link
              href="/blog/wedding-day-timeline-that-survives-the-day"
              className="text-[0.68rem] tracking-[0.2em] uppercase text-rose border-b border-dust hover:border-rose transition-colors pb-1.5"
            >
              The timeline, in full &rarr;
            </Link>
          </div>
          <div className="lg:col-span-7 grid grid-cols-2 gap-3">
            {HOME_SEQUENCE.map((ph) => (
              <div key={ph.src} className="relative overflow-hidden" style={{ aspectRatio: "1 / 1" }}>
                <Image src={ph.src} alt={ph.alt} fill sizes="(max-width:1023px) 50vw, 30vw" quality={78} loading="lazy" style={{ objectFit: "cover" }} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- WHAT COMES BACK -- */}
      <section className="py-20 md:py-28" style={{ background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
              What comes back
            </p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(2rem,3.5vw,3.4rem)" }}>
              And <em className="italic text-rose">when</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-dust/25">
            {DELIVERY.map(({ n, t: h, b }) => (
              <div key={n} className="px-6 md:px-8 py-9 md:py-11" style={{ background: "#0E0C0A" }}>
                <div className="font-serif font-light text-rose mb-5" style={{ fontSize: "2.6rem", lineHeight: 1 }}>{n}</div>
                <h3 className="font-serif font-light text-cream text-xl mb-3">{h}</h3>
                <p className="text-slate text-[0.88rem] leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -- IN THEIR WORDS -- */}
      <section className="py-20 md:py-28 text-center" style={{ background: "#080704" }}>
        <div className="page-w page-px">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-8" style={{ fontFamily: "var(--font-jost)" }}>
            In their words
          </p>
          <p className="font-serif italic text-cream/80 leading-relaxed max-w-3xl mx-auto mb-8" style={{ fontSize: "clamp(1.3rem,2.2vw,1.9rem)" }}>
            I do not publish invented pull quotes. The reviews page is screenshots of what couples
            actually sent, in the app they sent it in.
          </p>
          <Link href="/reviews" className="text-[0.68rem] tracking-[0.2em] uppercase text-rose border-b border-dust hover:border-rose transition-colors pb-1.5">
            Read them &rarr;
          </Link>
        </div>
      </section>

      {/* -- WHERE I WORK -- three photographs, not three text pills -- */}
      <section className="py-20 md:py-28" style={{ background: "#080704", borderTop: "0.5px solid #2A2520" }}>
        <div className="page-w page-px">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-4" style={{ fontFamily: "var(--font-jost)" }}>
              Where I work
            </p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(2rem,3.5vw,3.4rem)" }}>
              Three cities, <em className="italic text-rose">one photographer</em>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            {MARKETS.map((m, i) => {
              const photo = CITY_PHOTOS[m.slug];
              return (
                <Link key={m.slug} href={`/${m.slug}-wedding-photographer`} className="group block relative overflow-hidden">
                  <div className="relative w-full" style={{ aspectRatio: "3 / 4" }}>
                    <Image
                      src={photo.hero.src}
                      alt={photo.hero.alt}
                      fill
                      sizes="(max-width: 767px) 100vw, 33vw"
                      quality={80}
                      loading="lazy"
                      className="transition-transform duration-[900ms] group-hover:scale-[1.04]"
                      style={{ objectFit: "cover" }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-0 pointer-events-none"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(8,7,4,0.92) 0%, rgba(8,7,4,0.55) 30%, rgba(8,7,4,0.08) 65%, rgba(8,7,4,0.25) 100%)",
                      }}
                    />
                    <div
                      className="absolute inset-x-0 bottom-0 p-6 lg:p-7"
                      style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 24px rgba(8,7,4,0.9)" }}
                    >
                      <p className="text-[0.58rem] tracking-[0.3em] uppercase text-rose mb-2">
                        {["I", "II", "III"][i]} &middot; {m.province}
                      </p>
                      <h3 className="font-serif font-light text-cream leading-none mb-3" style={{ fontSize: "clamp(1.9rem,2.6vw,2.5rem)" }}>
                        {m.city}
                      </h3>
                      <p className="text-blush text-[0.84rem] leading-snug mb-4">{m.region}</p>
                      <span className="text-[0.6rem] tracking-[0.24em] uppercase text-cream border-b border-cream/30 group-hover:border-rose group-hover:text-rose transition-colors pb-1">
                        See {m.city} &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <p className="text-slate text-[0.9rem] leading-relaxed max-w-xl mx-auto mt-12 text-center">
            And anywhere else in Canada, with the price for each place published rather than quoted
            after you commit. Write to {SITE.email} and you will have an answer inside two business
            hours.
          </p>
        </div>
      </section>

    </>
  );
}
