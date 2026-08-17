/* Imported here rather than in layout.tsx on purpose. `experimental.inlineCss`
   inlines every imported stylesheet into every page's HTML, and this is the
   only route that uses the dr- language: in the layout it cost 26KB of dead
   CSS on /pricing, /faq, /blog and every journal post. */
import "./darkroom-rite.css";

import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import FilmStrip from "@/components/FilmStrip";
import InquireButton from "@/components/InquireButton";
import Sigil from "@/components/Sigil";
import ExperienceCarousel from "@/components/home/ExperienceCarousel";
import HeroCycler from "@/components/home/HeroCycler";
import HeroWord from "@/components/home/HeroWord";
import LightboxProvider from "@/components/home/LightboxProvider";
import LightboxTrigger from "@/components/home/LightboxTrigger";
import {
  CITY_PHOTOS,
  HOME_COLLAGE,
  HOME_GRID,
  HOME_HERO_POOL,
  HOME_MANIFESTO,
  HOME_SEQUENCE,
  at,
} from "@/lib/images";
import { CORE, MARKETS, PRIMARY_REGIONS, SITE, TIERS, quoteFor } from "@/lib/site";

/* ────────────────────────────────────────────────────────────────────────────
   Home, in the Darkroom Rite language ported from armanarai.com so the two
   sites read as one hand. Same sections in the same order, same components,
   same dr- classes. The words are the only thing that differs, because this
   site sells Canadian weddings and that one sells elopement curation.

   Where the .com says "I take you where the road ends", this says the opposite
   on purpose: a wedding happens in a room, in front of everyone. Do not let
   elopement register leak back in here.
   ──────────────────────────────────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: "Canadian Wedding Photographer — Toronto, Montréal, Vancouver",
  description:
    "Documentary and editorial wedding photography, based in Montréal and working across Canada. Three collections from C$4,000, each region one whole number with the travel already inside it.",
  alternates: { canonical: "/" },
};

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

/* The four claims, answering the .com's four rites. */
const manifesto = [
  {
    sigil: "tree" as const,
    lead: "I photograph the room, not just the two of you",
    rest: "the people who came, the ones who cried, the table that would not sit down. A wedding is witnessed, and the witnesses belong in the record.",
  },
  {
    sigil: "river" as const,
    lead: "I stay out of the way until staying out of the way stops helping",
    rest: "no repositioned blessings, no walking back up the aisle. Then twenty minutes of real direction, where direction is the kindness.",
  },
  {
    sigil: "sun" as const,
    lead: "The day is built backwards from the light",
    rest: "sunset is the only fixed point in a Canadian wedding and it moves by six hours across the year. Everything else is arranged around it.",
  },
  {
    sigil: "crescent" as const,
    lead: "And it comes back whole",
    rest: "the day in order, start to finish, including the quiet parts a highlight reel leaves out. On a date written into the contract.",
  },
];

/* How the day runs. HOME_SEQUENCE is already the four beats of a wedding day. */
const steps = [
  {
    n: "01",
    t: "The morning, while it is still quiet",
    d: "Two rooms if you are in two rooms, which is the moment a second photographer stops being optional. Details first, while the room is still tidy and the light is still coming through the window.",
  },
  {
    n: "02",
    t: "The ceremony, uninterrupted",
    d: "Whatever the tradition, I have asked in advance which twenty minutes you would be heartbroken to lose, and I am standing where those happen. A ceremony stopped for a better angle is a worse ceremony.",
  },
  {
    n: "03",
    t: "Family, then the twenty minutes that are yours",
    d: "Twelve groups, capped, from a written list, with one loud relative per side calling names. That takes twenty-five minutes instead of fifty, and the fifty comes out of your portraits.",
  },
  {
    n: "04",
    t: "The room, once it goes dark",
    d: "Speeches, the dances that matter, the people who stayed. Coverage that ends before the dancing is the most expensive economy in this business, and I will tell you so before you book it.",
  },
];

/* What is in every collection. The .com's "eight things you will never touch". */
const carried = [
  { t: "Eight continuous hours", d: "The floor of every collection. Ten on Signature, twelve across two days on Story Weekend." },
  { t: "A feature film", d: "Colour graded, one minute on Core and two above it. In every collection, not an add-on." },
  { t: "Film prints on the night", d: "Real prints handed to your guests before they go home, while the gallery is still weeks away." },
  { t: "An engagement session", d: "Included. Not for the photographs, for the hour where you stop performing and I learn how you actually stand." },
  { t: "A timeline that survives", d: "Built backwards from sunset, with one deliberate block of slack that absorbs the whole morning's drift." },
  { t: "A written family-photo plan", d: "Twelve groups and two callers, agreed before the day. This is the single largest block of time a big wedding gets back." },
  { t: "A preview in 48 hours", d: "Forty frames while the day is still in your head. Next day on Signature, 24 hours on Story Weekend." },
  { t: "The full gallery, dated", d: "Five to seven weeks on Core, four on Signature, three on Story Weekend. The date is in the contract, not in an email." },
  { t: "Travel, already inside the price", d: "Every region has one whole number. No mileage, no destination charge, nothing added at the end." },
];

const INCANTATION =
  "A promise made out loud · A room that came to hear it · A hand let go of · " +
  "A table that would not sit down · A parent turning away to cry · " +
  "A song everybody knew · A door held open · The last hour of light · " +
  "A promise made in front of ";

function Incantation() {
  const line = (
    <span className="dr-marquee-line">
      {INCANTATION}
      <b>everyone</b>
      {" · "}
    </span>
  );
  return (
    <section className="dr-marquee dr-ruled" aria-hidden>
      <div className="dr-marquee-track">
        <div style={{ display: "flex" }}>
          {line}
          {line}
        </div>
        <div style={{ display: "flex" }}>
          {line}
          {line}
        </div>
      </div>
    </section>
  );
}

const HERO_POOL = HOME_HERO_POOL.map((ph) => at(ph.src, 1400));
const WORK_IMGS = HOME_GRID.map((ph) => ph.src);
const COLLAGE_IMGS = HOME_COLLAGE.map((ph) => at(ph.src, 1400));
const COLLAGE_ALTS = HOME_COLLAGE.map((ph) => ph.alt);

export default function Home() {
  return (
    <LightboxProvider>
      <div className="dr">
        {/* ── HERO ─────────────────────────────────────────────────────── */}
        <section className="min-h-screen flex flex-col lg:grid lg:grid-cols-2" style={{ background: "var(--dr-ivory)" }}>
          <div className="flex flex-col justify-center page-px pt-24 lg:pt-28 pb-10 relative order-1">
            <div className="page-w w-full">
              <p className="dr-eyebrow" style={{ marginBottom: "1.4rem" }}>
                Weddings · Canada · Photography
              </p>

              <h1 className="dr-h1" style={{ marginBottom: "1.5rem" }}>
                A promise made
                <br />
                in front of <HeroWord />
              </h1>

              {/* Mobile: the frames sit under the title, lead frame a true
                  portrait so a vertical photograph is not letterboxed. */}
              <div className="lg:hidden flex flex-col gap-0.5 mb-9">
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "3 / 4", maxHeight: "68vh" }}>
                  <HeroCycler pool={HERO_POOL} position={0} alt="A Canadian wedding photographed by Arman Arai" sizes="100vw" priority objectPosition="center 45%" />
                </div>
                <div className="grid grid-cols-2 gap-0.5" style={{ aspectRatio: "2 / 1" }}>
                  <div className="relative overflow-hidden">
                    <HeroCycler pool={HERO_POOL} position={1} alt="A moment from a wedding day photographed by Arman Arai" sizes="50vw" />
                  </div>
                  <div className="relative overflow-hidden">
                    <HeroCycler pool={HERO_POOL} position={2} alt="A wedding reception photographed by Arman Arai" sizes="50vw" objectPosition="center 60%" />
                  </div>
                </div>
              </div>

              <p className="dr-lede" style={{ marginBottom: "2.2rem", maxWidth: "30rem" }}>
                <strong>Documentary and editorial wedding photography, across Canada.</strong>{" "}
                Three collections, each region one whole number with the travel already
                inside it, a colour-graded feature film in every one, and film prints
                handed to your guests on the night.
              </p>

              <div className="dr-cta-row">
                <InquireButton className="dr-cta" style={{ cursor: "pointer" }}>
                  Check your date
                </InquireButton>
                <Link href="/experience" className="dr-cta-ghost">
                  Walk the whole day <span aria-hidden>&rarr;</span>
                </Link>
              </div>

              <span className="font-script text-blush text-lg mt-10 block lg:absolute lg:bottom-8 lg:left-0 lg:pl-[4rem]">
                Toronto · Montréal · Vancouver
              </span>
            </div>
          </div>

          {/* Desktop: the three-frame grid */}
          <div className="hidden lg:grid order-2" style={{ gridTemplateColumns: "1.15fr 0.85fr", gridTemplateRows: "1fr 1fr", gap: "2px" }}>
            <div className="hero-grid-photo hero-grid-photo--static relative" style={{ gridRow: "1/3" }}>
              <HeroCycler pool={HERO_POOL} position={0} alt="A Canadian wedding photographed by Arman Arai" sizes="35vw" priority />
              <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-sm">The quiet before everything</span></div>
            </div>
            <div className="hero-grid-photo hero-grid-photo--static relative">
              <HeroCycler pool={HERO_POOL} position={1} alt="A moment from a wedding day photographed by Arman Arai" sizes="20vw" />
              <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-xs">A moment becoming a memory</span></div>
            </div>
            <div className="hero-grid-photo hero-grid-photo--static relative">
              <HeroCycler pool={HERO_POOL} position={2} alt="A wedding reception photographed by Arman Arai" sizes="20vw" objectPosition="center 60%" />
              <div className="caption-overlay"><span className="font-serif italic text-cream/90 text-xs">The room, once it goes dark</span></div>
            </div>
          </div>
        </section>

        <Incantation />

        {/* ── WHY IT IS PHOTOGRAPHED THIS WAY ──────────────────────────── */}
        <section className="dr-section dr-wrap">
          <div className="dr-split">
            <figure className="dr-split-figure" style={{ margin: 0 }}>
              <Image src={HOME_MANIFESTO.src} alt={HOME_MANIFESTO.alt} width={1200} height={1500} />
            </figure>
            <div className="dr-stack">
              <p className="dr-eyebrow">Why this way</p>
              <h2 className="dr-h2">
                A wedding is the last ceremony most people take part in, so I photograph it{" "}
                <span className="dr-flourish">as one</span>
              </h2>
              <p className="dr-p">
                The vows are a vow. The walk down the aisle is a crossing. The moment a
                parent lets go of a hand is a transfer of something with no other name. I
                work for that layer, and the beautiful frames come out of it rather than
                the other way around.
              </p>
              <div className="dr-rites" style={{ marginTop: "8px" }}>
                {manifesto.map((r) => (
                  <div className="dr-rite" key={r.lead}>
                    <Sigil name={r.sigil} size={22} className="dr-rite-mark" />
                    <p className="dr-p dr-rite-body">
                      <em>{r.lead}</em>, {r.rest}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW THE DAY RUNS ─────────────────────────────────────────── */}
        <section className="dr-section dr-ruled" style={{ background: "var(--dr-linen)" }}>
          <div className="dr-wrap">
            <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,56px)" }}>
              <p className="dr-eyebrow" style={{ marginBottom: "16px" }}>How the day runs</p>
              <h2 className="dr-h2">
                Four movements, built backwards from{" "}
                <span className="dr-flourish">the light</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "3px" }}>
              {steps.map((s, i) => (
                <div key={s.n}>
                  <div style={{ position: "relative", aspectRatio: "4 / 5", overflow: "hidden" }}>
                    <Image
                      src={HOME_SEQUENCE[i].src}
                      alt={HOME_SEQUENCE[i].alt}
                      fill
                      sizes="(max-width:900px) 100vw, 25vw"
                      quality={78}
                      loading="lazy"
                      style={{ objectFit: "cover" }}
                    />
                  </div>
                  <div style={{ padding: "22px 4px 0" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
                      <span className="dr-rite-num" style={{ margin: 0 }}>{s.n}</span>
                      <Sigil name="crescent" size={16} className="dr-rite-mark" />
                    </div>
                    <h3 className="dr-rite-title">{s.t}</h3>
                    <p className="dr-p">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: "clamp(30px,4vw,46px)" }}>
              <Link href="/blog/wedding-day-timeline-that-survives-the-day" className="dr-cta-ghost">
                The timeline, hour by hour <span aria-hidden>&rarr;</span>
              </Link>
            </div>
          </div>
        </section>

        {/* ── WHAT IS IN EVERY COLLECTION ──────────────────────────────── */}
        <section className="dr-section">
          <div className="dr-wrap">
            <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,56px)" }}>
              <p className="dr-eyebrow" style={{ marginBottom: "16px" }}>What is included</p>
              <h2 className="dr-h2">
                Eight things that are in{" "}
                <span className="dr-flourish">every collection</span>
              </h2>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "clamp(24px,4vw,44px)" }}>
              {carried.map((d, i) => (
                <div key={d.t} style={{ borderTop: "0.5px solid var(--dr-dust)", paddingTop: "18px" }}>
                  <span className="dr-rite-num" style={{ display: "block", width: "auto", margin: "0 0 10px" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <h3 className="dr-rite-title">{d.t}</h3>
                  <p className="dr-p">{d.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <FilmStrip />

        {/* ── THE CRAFT ────────────────────────────────────────────────── */}
        <section className="dr-section dr-ruled">
          <div className="dr-wrap dr-duo">
            <div className="dr-stack">
              <p className="dr-eyebrow dr-eyebrow--accent">In stillness</p>
              <h3 className="dr-h3">Photographs</h3>
              <p className="dr-p">
                Edited to what the room felt like, not to a preset that will date in three
                years. Grain, low light, and the space between people who have known each
                other a long time. Printed to be held in thirty years rather than scrolled
                past in thirty seconds.
              </p>
            </div>
            <div className="dr-duo-rule" />
            <div className="dr-stack">
              <p className="dr-eyebrow dr-eyebrow--accent">In motion</p>
              <h3 className="dr-h3">Film</h3>
              <p className="dr-p">
                A colour-graded feature film in every collection: one minute on Core, two
                minutes above it. Real film too, a roll on Signature and two on Story
                Weekend, processed and scanned. And prints handed to your guests on the
                night, so people leave holding something from the day.
              </p>
            </div>
          </div>
        </section>

        {/* ── SELECTED WORK ────────────────────────────────────────────── */}
        <section className="dr-section dr-wrap">
          <div style={{ textAlign: "center", marginBottom: "clamp(30px,4vw,48px)" }}>
            <p className="dr-eyebrow" style={{ marginBottom: "16px" }}>Selected work</p>
            <h2 className="dr-h2">
              A few pages from{" "}
              <span className="dr-flourish">the album</span>
            </h2>
          </div>
          <div className="portfolio-grid" style={{ gridTemplateRows: "repeat(6, 80px)" }}>
            {HOME_GRID.map((ph, idx) => (
              <LightboxTrigger key={ph.src} images={WORK_IMGS} index={idx} className={`grid-cell pg-${idx + 1}`}>
                <Image src={ph.src} alt={ph.alt} fill className="object-cover" sizes="(max-width:768px) 50vw, 25vw" />
                <div className="caption-overlay"><span className="font-serif italic text-cream/80 text-xs tracking-wide">Click to enlarge</span></div>
              </LightboxTrigger>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: "clamp(28px,4vw,44px)" }}>
            <Link href="/galleries" className="dr-cta">
              Sit with a whole wedding
            </Link>
          </div>
        </section>

        {/* ── THE EXPERIENCE ───────────────────────────────────────────── */}
        <section className="dr-section dr-ruled" style={{ background: "var(--dr-linen)" }}>
          <div className="dr-wrap">
            <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,56px)" }}>
              <p className="dr-eyebrow" style={{ marginBottom: "16px" }}>The experience</p>
              <h2 className="dr-h2">
                One photographer, from the first call to{" "}
                <span className="dr-flourish">the finished album</span>
              </h2>
            </div>
            <div className="dr-split dr-split--flip">
              <div className="dr-stack">
                <p className="dr-p">
                  There is no studio behind this and no assigned shooter. The person who
                  answers your first email is the person standing in the aisle, the person
                  who edits every frame, and the person who sends the gallery. A portfolio
                  built from three people&rsquo;s work tells you nothing about who turns up.
                </p>
                <p className="dr-p">
                  <strong>The planning is the part nobody advertises and it is where the day is won.</strong>{" "}
                  A timeline built backwards from sunset, a family-photo list capped at
                  twelve groups, a named covered location if it rains, and a venue I have
                  walked in daylight because I arrive the day before.
                </p>
                <p className="dr-p">
                  <strong>Then I stay out of the way.</strong> I will not interrupt a blessing
                  to reposition someone and I will not ask you to walk back up the aisle. The
                  only part of the day I direct is the twenty minutes of portraits, in a place
                  I have already looked at, in the light we planned around.
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(12px,2vw,28px)" }}>
                  {[
                    { n: "I", label: "Before", sub: "A call, a timeline, a session, a plan" },
                    { n: "II", label: "The day", sub: "Documentary, with twenty directed minutes" },
                    { n: "III", label: "After", sub: "Clips in week one, the gallery on a date" },
                  ].map(({ n, label, sub }) => (
                    <div key={label} style={{ borderTop: "0.5px solid var(--dr-dust)", paddingTop: "14px" }}>
                      <div className="dr-rite-num" style={{ margin: "0 0 8px", width: "auto" }}>{n}</div>
                      <div className="dr-rite-title" style={{ marginBottom: "6px" }}>{label}</div>
                      <p className="dr-p">{sub}</p>
                    </div>
                  ))}
                </div>
                <div className="dr-cta-row">
                  <Link href="/experience" className="dr-cta">
                    Walk the whole day
                  </Link>
                  <InquireButton className="dr-cta-ghost" style={{ cursor: "pointer" }}>
                    Check your date <span aria-hidden>→</span>
                  </InquireButton>
                </div>
              </div>
              <ExperienceCarousel images={COLLAGE_IMGS} alts={COLLAGE_ALTS} />
            </div>
          </div>
        </section>

        {/* ── THE QUIET DOUBT ──────────────────────────────────────────── */}
        <section className="dr-section">
          <div className="dr-wrap" style={{ textAlign: "center" }}>
            <p className="dr-eyebrow" style={{ marginBottom: "16px" }}>The quiet doubt</p>
            <h2 className="dr-h2" style={{ marginBottom: "26px" }}>
              You can have the documentary day{" "}
              <span className="dr-flourish">and the photograph your mother wants</span>
            </h2>
            <p className="dr-lede" style={{ margin: "0 auto 44px" }}>
              The worry about a documentary photographer is that the formal frames get
              lost: the grandparents, the two families together, the one portrait that
              ends up on a wall. They do not, because those are planned rather than
              improvised. Twelve groups from a written list, twenty-five minutes, one
              loud relative per side calling names. Getting that part organised is
              exactly what buys back the hour where nobody is being organised at all.
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(210px,1fr))", gap: "clamp(22px,4vw,40px)", maxWidth: "56rem", margin: "0 auto" }}>
              {[
                { s: "tree" as const, line: "The family frames are planned, not hoped for" },
                { s: "sun" as const, line: "The portraits take twenty minutes, not ninety" },
                { s: "river" as const, line: "The rest of the day nobody is arranged at all" },
              ].map((c) => (
                <div key={c.line} style={{ borderTop: "0.5px solid var(--dr-dust)", paddingTop: "18px", display: "flex", flexDirection: "column", alignItems: "center", gap: "12px" }}>
                  <Sigil name={c.s} size={26} className="dr-rite-mark" />
                  <p className="dr-p" style={{ textAlign: "center" }}>{c.line}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── WHAT IT COSTS ────────────────────────────────────────────── */}
        <section className="dr-section dr-ruled" style={{ background: "var(--dr-linen)" }}>
          <div className="dr-wrap">
            <div className="dr-split">
              <figure className="dr-split-figure" style={{ margin: 0 }}>
                <Image
                  src={CITY_PHOTOS.montreal.places[1].src}
                  alt={CITY_PHOTOS.montreal.places[1].alt}
                  width={1200}
                  height={1500}
                />
              </figure>
              <div className="dr-stack">
                <p className="dr-eyebrow">What it costs</p>
                <h2 className="dr-h2">
                  Three collections, and every city has{" "}
                  <span className="dr-flourish">one whole number</span>
                </h2>
                <p className="dr-p">
                  {TIERS.map((t) => `${t.name} ${t.coverage}`).join(" · ")}. Core in Montréal
                  is {money(CORE.price)}. Travel is already inside every figure, so nothing
                  arrives at the end of the invoice: sales tax and the add-ons you choose are
                  the only things that can raise it.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
                  {PRIMARY_REGIONS.map((r) => (
                    <span
                      key={r.slug}
                      style={{
                        fontFamily: "var(--font-jost)", fontSize: "0.68rem", letterSpacing: "0.2em",
                        textTransform: "uppercase", color: "var(--dr-bone)",
                        border: "0.5px solid var(--dr-dust)", padding: "10px 18px",
                      }}
                    >
                      {r.short} from {money(quoteFor(r, CORE))}
                    </span>
                  ))}
                </div>
                <div className="dr-cta-row">
                  <Link href="/pricing" className="dr-cta">
                    The full pricing page
                  </Link>
                  <Link href="/faq" className="dr-cta-ghost">
                    Questions, answered plainly <span aria-hidden>→</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── IN THEIR WORDS ───────────────────────────────────────────── */}
        <section className="dr-section">
          <div className="dr-wrap" style={{ textAlign: "center" }}>
            <p className="dr-eyebrow" style={{ marginBottom: "clamp(24px,3vw,34px)" }}>In their words</p>
            {/* No invented pull quotes on this site. The reviews page is
                screenshots of what couples actually sent. */}
            <blockquote
              className="dr-lede"
              style={{ fontStyle: "italic", maxWidth: "46rem", margin: "0 auto 30px", color: "var(--dr-cream)", fontSize: "clamp(19px,2.6vw,28px)", lineHeight: 1.55 }}
            >
              I do not publish invented pull quotes. The reviews page is screenshots of
              what couples actually sent, in the app they sent it in.
            </blockquote>
            <Link href="/reviews" className="dr-cta-ghost">
              Read them <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        {/* ── WHERE THE VOWS ARE SPOKEN ────────────────────────────────── */}
        <section className="dr-section dr-ruled" style={{ background: "var(--dr-linen)" }}>
          <div className="dr-wrap">
            <div style={{ textAlign: "center", marginBottom: "clamp(36px,5vw,56px)" }}>
              <p className="dr-eyebrow" style={{ marginBottom: "16px" }}>Where the vows are spoken</p>
              <h2 className="dr-h2">
                Three cities,{" "}
                <span className="dr-flourish">one photographer</span>
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
            <p className="dr-p" style={{ textAlign: "center", maxWidth: "36rem", margin: "clamp(30px,4vw,46px) auto 0" }}>
              And anywhere else in Canada, from the Eastern Townships to Whistler and
              Vancouver Island, with each region&rsquo;s number published rather than quoted
              after you commit.
            </p>
          </div>
        </section>

        {/* ── CLOSING ──────────────────────────────────────────────────── */}
        <section className="dr-closing dr-ruled-top">
          <div className="dr-wrap">
            <Sigil name="crescent" size={34} className="dr-seal" />
            <h2 className="dr-h2" style={{ marginBottom: "16px", fontSize: "clamp(24px,4.6vw,50px)" }}>
              Is your date{" "}
              <span className="dr-flourish">still open?</span>
            </h2>
            <p className="dr-lede" style={{ marginBottom: "38px" }}>
              Peak Saturdays usually go nine to eighteen months out, and off-season and
              weekday dates open up much later. Send the date, the city and a rough guest
              count and you will have a real answer inside two business hours.
            </p>
            <div className="dr-cta-row" style={{ justifyContent: "center" }}>
              <InquireButton className="dr-cta" style={{ cursor: "pointer" }}>
                Check your date
              </InquireButton>
              <Link href="/pricing" className="dr-cta-ghost">
                See what it costs <span aria-hidden>→</span>
              </Link>
            </div>
            <p className="dr-p" style={{ marginTop: "26px", opacity: 0.75 }}>
              {SITE.email}
            </p>
          </div>
        </section>
      </div>
    </LightboxProvider>
  );
}
