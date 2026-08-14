import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import InquireButton from "@/components/InquireButton";
import { ARMAN_PORTRAIT, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM } from "@/lib/images";
import { CORE, PRIMARY_REGIONS, SITE, TIERS, quoteFor } from "@/lib/site";

/* The hero has to survive being cropped to a wide band. An earlier version used
   a tight two-face close-up, which at 1920x640 came out as half a face. This one
   is a whole room with the couple small in it: it reads at any crop, and the
   foreground is dark enough to carry the headline. */
const HERO = FILM[12]; // dim-ballroom-candle-foreground

export const metadata: Metadata = {
  title: "The Experience: First Call to Finished Album",
  description:
    "What working together actually looks like, in six chapters: the first call, the timeline, the session, the day itself, the clips in week one, and the gallery.",
  alternates: { canonical: "/experience" },
  openGraph: {
    title: "The Experience | Arman Arai",
    description: "How a Canadian wedding day is planned, photographed and handed back.",
    url: `${SITE.url}/experience`,
    images: [{ url: HERO.src, alt: HERO.alt }],
  },
};

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

// The arc of the work, in the order a couple actually lives it.
const CHAPTERS = [
  {
    numeral: "I",
    short: "The first call",
    caption: "The person on the other end of that call.",
    kicker: "Before anything",
    title: "A call, not a pitch",
    body: [
      "I want to know what the day is for before I know what it looks like. Whose blessing matters. Which room holds the weight. Whether the ceremony is the centre of it or the part everyone endures before dinner.",
      "Twenty minutes, and by the end of it I can tell you which collection is honest for your day rather than which one I would prefer to sell. Sometimes that answer is that I am wrong for you, and I would rather say it on a call than in a gallery.",
    ],
    photo: ARMAN_PORTRAIT,
  },
  {
    numeral: "II",
    short: "Building the timeline",
    caption: "The portrait window gets set first. Everything else moves around it.",
    kicker: "Months out",
    title: "The timeline gets built backwards",
    body: [
      "Sunset is the only fixed point in a wedding day; in Canada it moves by nearly six hours between June and December. We set the portrait window first and build everything else around it.",
      "Then the parts that always run late get planned for rather than hoped about: hair and makeup, the family-photo list capped and given to one loud relative from each side, and a single deliberate block of slack before the ceremony that absorbs the whole morning's drift.",
    ],
    photo: DREAMY_FINE_ART[11],
  },
  {
    numeral: "III",
    short: "The session",
    caption: "Included in every collection, and not really about the photographs.",
    kicker: "The session",
    title: "An hour to stop performing",
    body: [
      "An engagement session in Montréal, or a welcome session on location, is included in every collection. It is not really for the photographs.",
      "It is for the hour where you stop performing for the camera and I learn how the two of you actually stand next to each other. Couples who have done it are noticeably different at 4pm on the wedding day, and it shows in the frames.",
    ],
    photo: FILM[4],
  },
  {
    numeral: "IV",
    short: "The day itself",
    caption: "Out of the way, then twenty deliberate minutes, then out of the way again.",
    kicker: "The day",
    title: "Quiet, then deliberate, then quiet again",
    body: [
      "I arrive early and I stay out of the way. I will not interrupt a blessing to reposition someone, and I will not ask you to walk back up the aisle for a better angle. A ceremony interrupted for a better photograph is a worse ceremony and usually a worse photograph.",
      "Then there are twenty minutes of real direction for the portraits, in a place I have already looked at, in the light we planned for. And then I disappear again for the rest of the night.",
    ],
    photo: DOCUMENTARY[10],
  },
  {
    numeral: "V",
    short: "Week one",
    caption: "Vertical clips while everyone is still asking to see something.",
    kicker: "The first week",
    title: "Something to post while you wait",
    body: [
      "Every collection includes a set of vertical social clips cut from the day, delivered in the first week. They exist because there is a real gap between the wedding and the gallery, and it is the exact window in which everyone you know is asking to see something.",
      "A preview of stills follows inside 48 hours on Core, next day on Signature, 24 hours on Story Weekend, while the day is still in your head.",
    ],
    photo: EDITORIAL[10],
  },
  {
    numeral: "VI",
    short: "The gallery",
    caption: "The whole day in order, on a date that is in the contract.",
    kicker: "The return",
    title: "The whole day, in order",
    body: [
      "The full gallery arrives in five to seven weeks on Core, four on Signature and three on Story Weekend, and the date is in the contract rather than in an email. It comes back as the day happened, start to finish, including the quiet parts a highlight reel leaves out.",
      "The top two collections carry an album credit, because a hard drive is not an heirloom and nobody has ever taken a folder of JPEGs off a shelf to show someone.",
    ],
    photo: DREAMY_FINE_ART[1],
  },
];

export default function Experience() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: "How a wedding is planned, photographed and delivered",
    url: `${SITE.url}/experience`,
    step: CHAPTERS.map((c, i) => ({
      "@type": "HowToStep",
      position: i + 1,
      name: c.title,
      text: c.body.join(" "),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      {/* ── HERO ── */}
      <section className="relative" style={{ height: "min(86vh, 780px)", minHeight: 520 }}>
        <Image
          src={HERO.src}
          alt={HERO.alt}
          fill
          sizes="100vw"
          quality={84}
          priority
          fetchPriority="high"
          /* The couple stands large and dead centre in this frame, so no vertical
             crop puts them clear of a centred headline: at 38% the text sat on
             them, at 62% their heads went off the top. 45% keeps them whole and
             the headline moves left instead, onto the empty floor. */
          style={{ objectFit: "cover", objectPosition: "center 45%" }}
        />
        <span
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, rgba(8,7,4,0.55) 0%, rgba(8,7,4,0) 26%), " +
              "linear-gradient(to top, rgba(8,7,4,0.96) 0%, rgba(8,7,4,0.72) 26%, rgba(8,7,4,0.12) 55%, rgba(8,7,4,0) 100%)",
          }}
        />
        <div
          className="absolute inset-x-0 bottom-0 page-w page-px pb-14 md:pb-20"
          style={{ textShadow: "0 1px 2px rgba(8,7,4,0.95), 0 2px 28px rgba(8,7,4,0.9)" }}
        >
          <div className="max-w-2xl">
            <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-5">The experience</p>
            <h1
              className="font-serif font-light text-cream leading-[1.04]"
              style={{ fontSize: "clamp(2.2rem,4.2vw,3.8rem)", textWrap: "balance" }}
            >
              From the first call to the <em className="italic text-rose">finished album</em>
            </h1>
            <p className="text-blush text-[1rem] leading-relaxed mt-7 font-light max-w-xl">
              Six chapters, in the order you will live them. Everything below is decided before your
              date rather than on it, which is the entire point of writing it down.
            </p>
          </div>
        </div>
      </section>

      {/* ── CHAPTER INDEX ──
          Without this the first chapter's tall photograph opened the page beside
          an empty half-screen of nothing. This puts the whole arc on one screen
          before the reading starts. */}
      <nav aria-label="Chapters" className="bg-ivory border-b border-dust/40">
        <ol className="page-w page-px grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-px list-none m-0 p-0">
          {CHAPTERS.map((c) => (
            <li key={c.numeral} className="py-7 lg:py-9 lg:px-4 first:lg:pl-0 last:lg:pr-0">
              <a href={`#chapter-${c.numeral}`} className="group block">
                <span className="block font-serif text-rose/70 text-[1.4rem] leading-none mb-3 transition-colors group-hover:text-rose">
                  {c.numeral}
                </span>
                <span className="block text-[0.56rem] tracking-[0.24em] uppercase text-slate mb-2">
                  {c.kicker}
                </span>
                <span className="block font-serif font-light text-cream text-[1.02rem] leading-snug">
                  {c.short}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ── THE CHAPTERS ── */}
      {CHAPTERS.map((c, i) => {
        const imageRight = i % 2 === 1;
        return (
          <section
            key={c.numeral}
            id={`chapter-${c.numeral}`}
            className={`py-16 md:py-24 scroll-mt-24 ${i % 2 === 0 ? "bg-ivory" : "bg-parchment"}`}
          >
            {/* items-start, not items-center: the photographs are 4/5 and the
                prose is short, so centring left an empty half-screen above the
                text at the top of every section. */}
            <div className="page-w page-px grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">
              <div className={imageRight ? "lg:order-1" : "lg:order-2"}>
                <div className="flex items-baseline gap-5 mb-4">
                  <span
                    aria-hidden
                    className="font-serif font-light text-rose/45 leading-none"
                    style={{ fontSize: "clamp(2.6rem,4.5vw,4rem)" }}
                  >
                    {c.numeral}
                  </span>
                  <span className="flex-1 h-px bg-dust/50" />
                  <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose">{c.kicker}</p>
                </div>
                <h2
                  className="font-serif font-light text-cream mb-6 leading-tight"
                  style={{ fontSize: "clamp(1.9rem,3.2vw,3rem)" }}
                >
                  {c.title}
                </h2>
                {c.body.map((para) => (
                  <p key={para.slice(0, 40)} className="text-blush text-[0.95rem] leading-[1.85] mb-5 last:mb-0">
                    {para}
                  </p>
                ))}
              </div>
              <figure className={`m-0 ${imageRight ? "lg:order-2" : "lg:order-1"}`}>
                <div className="relative w-full" style={{ aspectRatio: "4 / 5" }}>
                  <Image
                    src={c.photo.src}
                    alt={c.photo.alt}
                    fill
                    sizes="(max-width: 1023px) 100vw, 45vw"
                    quality={80}
                    loading={i === 0 ? undefined : "lazy"}
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <figcaption className="text-[0.58rem] tracking-[0.22em] uppercase text-slate mt-4 leading-relaxed">
                  {c.caption}
                </figcaption>
              </figure>
            </div>
          </section>
        );
      })}

      {/* ── WHAT IT COSTS ── */}
      <section className="py-16 md:py-24 bg-ivory border-t border-dust/40 text-center">
        <div className="page-w page-px">
          <p className="text-[0.62rem] tracking-[0.32em] uppercase text-rose mb-5">And what it costs</p>
          <h2 className="font-serif font-light text-cream mb-6" style={{ fontSize: "clamp(1.9rem,3vw,3rem)" }}>
            Three collections, <em className="italic text-rose">one number each</em>
          </h2>
          <p className="text-blush text-[0.95rem] leading-relaxed max-w-2xl mx-auto mb-10 font-light">
            {TIERS.map((t) => `${t.name} ${t.coverage}`).join(" · ")}. Core in Montréal is{" "}
            {money(CORE.price)}, and every city carries its whole number with travel already in it.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            {PRIMARY_REGIONS.map((r) => (
              <span
                key={r.slug}
                className="text-[0.68rem] tracking-[0.2em] uppercase text-blush border border-dust px-5 py-2.5"
              >
                {r.short} from {money(quoteFor(r, CORE))}
              </span>
            ))}
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8">
            <InquireButton className="inline-block bg-rose text-ivory text-[0.68rem] tracking-[0.2em] uppercase px-10 py-4 hover:bg-rose-dark transition-colors duration-300 cursor-pointer border-none">
              Check your date
            </InquireButton>
            <Link
              href="/pricing"
              className="text-[0.68rem] tracking-[0.2em] uppercase text-slate hover:text-rose transition-colors border-b border-dust hover:border-rose pb-1.5"
            >
              The full pricing page →
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
