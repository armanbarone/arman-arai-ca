import type { Metadata } from "next";
import Image from "next/image";
import InquireButton from "@/components/InquireButton";
import StoryCarousel from "@/components/StoryCarousel";

export const metadata: Metadata = {
  title: "About — StillVows",
  description: "Wedding photographer based in Medellín. Cinematic, intimate, and deeply honest wedding photography.",
};

const ARMAN_PHOTO = "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fa3cd9ecdc5eb699c5a8e5.png";
const STORY_IMAGES = [
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69faad2e12def9aebe87a64f.png", alt: "Wedding moment" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb7dba9594baa062ed9fef.png", alt: "Wedding photography" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb7efb019ea471ed14c8c5.png", alt: "Wedding photography" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb7efbf7ed92b61991ab7a.png", alt: "Wedding photography" },
  { src: "https://assets.cdn.filesafe.space/BdTJ01Xs0apORbIrBlPB/media/69fb7efba6982c1655874d43.png", alt: "Wedding photography" },
];

export default function About() {
  return (
    <>
      {/* ── PAGE HEADER — Arman's photo to the right of the heading ── */}
      <section className="pt-36 md:pt-40 pb-0 bg-parchment relative overflow-hidden">
        <div className="page-w page-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 items-end">
            {/* Left — heading */}
            <div className="pb-16 md:pb-20 relative z-10">
              <div
                className="absolute left-0 top-[-2rem] font-serif text-blush pointer-events-none select-none"
                style={{ fontSize:"clamp(8rem,18vw,22rem)", opacity:0.35, lineHeight:1 }}
                aria-hidden
              >&ldquo;</div>
              <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4 relative z-10">The photographer</p>
              <h1
                className="font-serif font-light text-cream leading-tight relative z-10"
                style={{ fontSize:"clamp(2.8rem,5vw,5rem)" }}
              >
                I witness.<br />
                I <em className="italic text-rose">photograph.</em><br />
                I deliver.
              </h1>
              <p className="text-blush text-sm leading-relaxed mt-5 max-w-sm relative z-10 font-light">
                I&rsquo;ve been photographing since the age of 10, ever since I received a film camera from my late grandmother.
              </p>
            </div>

            {/* Right — Arman's photo */}
            <div className="relative hidden lg:block" style={{ height:"680px" }}>
              <Image
                src={ARMAN_PHOTO}
                alt="StillVows, wedding photographer"
                fill
                className="object-cover object-top"
                sizes="45vw"
                priority
              />
            </div>

            {/* Mobile: Arman's photo below heading */}
            <div className="lg:hidden relative w-full mb-0" style={{ height:"100vw", maxHeight:"560px" }}>
              <Image
                src={ARMAN_PHOTO}
                alt="StillVows, wedding photographer"
                fill
                className="object-cover object-top"
                sizes="100vw"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── STORY — photo replaced with STORY_PHOTO ── */}
      <section className="py-16 md:py-24 bg-ivory">
        <div className="page-w page-px">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
            {/* Copy */}
            <div>
              <blockquote
                className="font-serif italic font-light text-cream leading-relaxed mb-8"
                style={{ fontSize:"clamp(1.2rem,2vw,1.65rem)" }}
              >
                &ldquo;I photograph the way you hold each other when no one is watching. Those moments happen to be in a wedding.&rdquo;
              </blockquote>

              <p className="text-slate text-sm leading-relaxed mb-5">
                There is a sacred kind of beauty that reveals itself between the planned moments: a father holding back emotion before the aisle, two best friends dissolving into laughter during speeches, a hand quietly reaching for another across the table. These are the images that become more than photographs. They become memory, inheritance, and proof that something holy happened here.
              </p>
              <p className="text-slate text-sm leading-relaxed mb-5">
                With roots in documentary storytelling, editorial direction, and a deep obsession with natural light, I approach every wedding as a short film in stills: intimate, cinematic, and emotionally honest. I blend quiet guidance with unobtrusive observation, creating space for real moments to unfold while shaping them with the eye of cinema.
              </p>
              <p className="text-slate text-sm leading-relaxed mb-10">
                Based between Medellín and Vancouver, I photograph destination weddings for couples drawn to beauty, meaning, and place. From Bogotá, Toronto, and Montréal to Mexico, Brazil, Argentina, Dubai, Italy, and beyond. I seek the kind of landscapes, architecture, and light that do more than frame your story. They become part of it.
              </p>

              {/* Stats */}
              <div className="flex gap-8 md:gap-12 mb-10 border-t border-dust pt-8">
                {[{ n:"240+", label:"Weddings" }, { n:"6", label:"Countries" }, { n:"12", label:"Years" }, { n:"∞", label:"Destination" }].map(({ n, label }) => (
                  <div key={label}>
                    <div className="font-serif font-light text-rose" style={{ fontSize:"clamp(1.8rem,3vw,2.8rem)" }}>{n}</div>
                    <div className="text-[0.55rem] tracking-[0.2em] uppercase text-slate mt-0.5">{label}</div>
                  </div>
                ))}
              </div>

              <p className="text-[0.62rem] tracking-[0.2em] uppercase text-blush mb-2">Destination Wedding Photographer</p>
              <span className="font-script text-rose" style={{ fontSize:"2.5rem" }}>Arman</span>
            </div>

            {/* Story carousel */}
            <StoryCarousel images={STORY_IMAGES} />
          </div>
        </div>
      </section>

      {/* ── APPROACH ── */}
      <section className="bg-parchment py-16 md:py-24">
        <div className="page-w page-px">
          <div className="text-center mb-12 md:mb-16">
            <p className="text-[0.6rem] tracking-[0.32em] uppercase text-blush mb-4">How I work</p>
            <h2 className="font-serif font-light text-cream" style={{ fontSize:"clamp(1.8rem,3vw,3rem)" }}>
              The <em className="italic text-rose">experience</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-dust/20">
            {[
              { n:"I", title:"Connection First", body:"I only work with couples I genuinely connect with. A call before anything is signed." },
              { n:"II", title:"Engagement Session", body:"Included in most collections: a chance to feel ease in front of the lens before your day." },
              { n:"III", title:"Your Wedding Day", body:"I arrive. I blend in. I watch. The day is entirely yours. I am the quiet witness who holds its memory." },
              { n:"IV", title:"The Delivery", body:"Within 6 to 8 weeks: a private gallery designed to make you feel it all over again." },
            ].map(({ n, title, body }) => (
              <div key={n} className="bg-ivory px-6 md:px-8 py-8 md:py-10">
                <div className="font-serif font-light text-rose mb-5" style={{ fontSize:"3rem", lineHeight:1 }}>{n}</div>
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
          <h2 className="font-serif font-light text-cream mb-8" style={{ fontSize:"clamp(1.8rem,3vw,3rem)" }}>
            Let&rsquo;s write <em className="italic text-rose">your story</em>
          </h2>
          <InquireButton className="inline-block bg-rose text-ivory text-[0.62rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
            Inquire for Availability
          </InquireButton>
        </div>
      </section>
    </>
  );
}
