import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import StoryCarousel from "@/components/StoryCarousel";
import { ABOUT_STORY, ARMAN_PORTRAIT } from "@/lib/images";
import { MARKETS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About — Arman Arai, Wedding Photographer",
  description:
    "Canadian wedding photographer working coast to coast, with home markets in the GTA, Montréal and Vancouver. Photography as a spiritual record of a day rather than a product delivered after it.",
  alternates: { canonical: "/about" },
  openGraph: {
    title: "About Arman Arai",
    description:
      "Wedding photography as a spiritual record of the day. Canada coast to coast, from the GTA, Montréal and Vancouver.",
    url: `${SITE.url}/about`,
    images: [{ url: ARMAN_PORTRAIT.src, alt: ARMAN_PORTRAIT.alt }],
  },
};

const APPROACH = [
  {
    n: "I",
    title: "A call before anything",
    body: "I want to know what the day is for before I know what it looks like. Whose blessing matters, which room holds the weight, what you would grieve losing.",
  },
  {
    n: "II",
    title: "An engagement session",
    body: "Included in Core and Signature. Not for the photographs. For the hour where you stop performing and I learn how the two of you actually stand.",
  },
  {
    n: "III",
    title: "The day itself",
    body: "I arrive early, I stay quiet, and I stand where the light and the meaning meet. Direction only in the twenty minutes where direction is the kindness.",
  },
  {
    n: "IV",
    title: "The return",
    body: "A preview inside 48 hours, the full gallery in six to eight weeks. Edited to what the room felt like, not to a preset that will date in three years.",
  },
];

export default function About() {
  const personLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: SITE.name,
    jobTitle: "Wedding photographer",
    url: `${SITE.url}/about`,
    image: ARMAN_PORTRAIT.src,
    email: SITE.email,
    sameAs: [SITE.instagram, SITE.pinterest],
    knowsLanguage: ["en-CA", "fr-CA"],
    worksFor: { "@id": `${SITE.url}/#business` },
    areaServed: { "@type": "Country", name: "Canada" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personLd) }} />

      {/* ── HEADER ── */}
      <section className="pt-36 md:pt-40 pb-0 bg-parchment relative overflow-hidden">
        <div className="page-w page-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-end">
            <div className="pb-16 md:pb-20 relative z-10">
              <div
                className="absolute left-0 top-[-2rem] font-serif text-blush pointer-events-none select-none"
                style={{ fontSize: "clamp(8rem,18vw,22rem)", opacity: 0.35, lineHeight: 1 }}
                aria-hidden
              >
                &ldquo;
              </div>
              <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4 relative z-10">The photographer</p>
              <h1 className="font-serif font-light text-cream leading-tight relative z-10" style={{ fontSize: "clamp(2.8rem,5vw,5rem)" }}>
                I witness.
                <br />
                I <em className="italic text-rose">photograph.</em>
                <br />
                I hand it back.
              </h1>
              <p className="text-blush text-sm leading-relaxed mt-5 max-w-sm relative z-10 font-light">
                I have been photographing since I was ten, when my late grandmother handed me a film
                camera. I have been photographing weddings ever since I understood they were the
                closest thing most of us get to a rite.
              </p>
            </div>

            <div className="relative hidden lg:block" style={{ height: "680px" }}>
              <Image
                src={ARMAN_PORTRAIT.src}
                alt={ARMAN_PORTRAIT.alt}
                fill
                className="object-cover object-top"
                sizes="45vw"
                quality={82}
                priority
                fetchPriority="high"
              />
            </div>

            <div className="lg:hidden relative w-full mb-0" style={{ height: "100vw", maxHeight: "560px" }}>
              <Image
                src={ARMAN_PORTRAIT.src}
                alt={ARMAN_PORTRAIT.alt}
                fill
                className="object-cover object-top"
                sizes="100vw"
                quality={82}
                priority
                fetchPriority="high"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── THE PHILOSOPHY ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            <div>
              <blockquote className="font-serif italic font-light text-cream leading-relaxed mb-8" style={{ fontSize: "clamp(1.2rem,2vw,1.65rem)" }}>
                &ldquo;A wedding is the last ceremony most people will ever take part in. I photograph
                it as one.&rdquo;
              </blockquote>

              <p className="text-slate text-sm leading-relaxed mb-5">
                Something changed in how I see this work. For years I photographed weddings as
                events: a schedule, a set of locations, a list of frames a client would expect to
                receive. That produced good galleries and it produced nothing I would call
                necessary. What I make now is closer to a spiritual record. The vows are a vow. The
                walk down the aisle is a crossing. The moment a parent lets go of a hand is a
                transfer of something that has no other name. I photograph for that layer, and the
                pretty pictures come out of it rather than the other way around.
              </p>
              <p className="text-slate text-sm leading-relaxed mb-5">
                In practice this makes me quieter and slower to raise the camera. I will not
                interrupt a blessing to reposition someone. I will not ask you to walk back up the
                aisle for a better angle. I would rather lose a frame than break the thing the frame
                exists to hold. The cost of working this way is that I return fewer photographs than
                a photographer shooting on volume, and I would rather say that plainly than pretend
                a thousand images is a benefit.
              </p>
              <p className="text-slate text-sm leading-relaxed mb-10">
                The other half of the job is entirely practical. Light, timing, weather, a family
                group list that does not eat your cocktail hour, a backup plan that was scouted
                rather than improvised. Reverence without competence is just a mood. Both, or it is
                not worth booking me.
              </p>

              <div className="flex gap-8 md:gap-12 mb-10 border-t border-dust pt-8">
                {[
                  { n: "3", label: "Home markets" },
                  { n: "10", label: "Provinces served" },
                  { n: "2", label: "Languages" },
                  { n: "48h", label: "To your preview" },
                ].map(({ n, label }) => (
                  <div key={label}>
                    <div className="font-serif font-light text-rose" style={{ fontSize: "clamp(1.8rem,3vw,2.8rem)" }}>{n}</div>
                    <div className="text-[0.55rem] tracking-[0.2em] uppercase text-slate mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <p className="text-[0.62rem] tracking-[0.2em] uppercase text-blush mb-2">Canadian Wedding Photographer</p>
              <span className="font-script text-rose" style={{ fontSize: "2.5rem" }}>Arman</span>
            </div>

            <StoryCarousel images={ABOUT_STORY.map((ph) => ({ src: ph.src, alt: ph.alt }))} />
          </div>
        </div>
      </section>

      {/* ── WHERE I WORK ── */}
      <section className="bg-parchment py-16 md:py-24">
        <div className="page-w page-px">
          <div className="max-w-2xl mb-12">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">Where I work</p>
            <h2 className="font-serif font-light text-cream mb-5" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
              Canada, <em className="italic text-rose">coast to coast</em>
            </h2>
            <p className="text-blush text-[0.9rem] leading-relaxed font-light">
              I will travel anywhere in this country for a wedding, from Newfoundland to Vancouver
              Island to the territories. Three places are home, which means no travel line on the
              quote and a photographer who already knows the light, the traffic and the venues.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-dust/20">
            {MARKETS.map((m) => (
              <Link
                key={m.slug}
                href={`/${m.slug}-wedding-photographer`}
                className="bg-parchment px-7 py-9 block group transition-colors hover:bg-ivory"
              >
                <p className="text-[0.58rem] tracking-[0.28em] uppercase text-rose mb-4">{m.province}</p>
                <h3 className="font-serif font-light text-cream text-2xl mb-3 group-hover:text-rose transition-colors">
                  {m.region}
                </h3>
                <p className="text-slate text-[0.82rem] leading-relaxed">{m.angle}.</p>
              </Link>
            ))}
          </div>
          <p className="text-slate text-[0.8rem] leading-relaxed mt-7 max-w-3xl">
            Everywhere else in Canada is a travel quote, given before you sign rather than added
            after. I work in English and in French.
          </p>
        </div>
      </section>

      {/* ── APPROACH ── */}
      <section className="bg-ivory py-16 md:py-24">
        <div className="page-w page-px">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">How it goes</p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
              The <em className="italic text-rose">experience</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-dust/20">
            {APPROACH.map(({ n, title, body }) => (
              <div key={n} className="bg-ivory px-6 md:px-8 py-8 md:py-10">
                <div className="font-serif font-light text-rose mb-5" style={{ fontSize: "3rem", lineHeight: 1 }}>{n}</div>
                <h3 className="font-serif font-light text-cream text-lg mb-3">{title}</h3>
                <p className="text-slate text-[0.8rem] leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-parchment py-16 md:py-24 text-center">
        <div className="page-w page-px">
          <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-5">Ready to begin?</p>
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize: "clamp(1.8rem,3vw,3rem)" }}>
            Tell me about <em className="italic text-rose">your day</em>
          </h2>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
              Check your date
            </InquireButton>
            <Link
              href="/pricing"
              className="text-[0.62rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              See the prices first →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
