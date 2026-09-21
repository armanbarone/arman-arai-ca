import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import ReviewScreenshots from "@/components/weddings/ReviewScreenshots";
import { GALLERIES } from "@/lib/galleries";
import {
  ANALOGUE, ARMAN, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, FILM_STRIP, type Photo,
} from "@/lib/images";
import { ALBUM_SPECS, CORE, SITE, TIERS } from "@/lib/site";
import { COMMON_FAQS, galleryOrderFor, type LandingVariant } from "@/lib/ads/wedding-landing";
import WeddingCalendar, { BookingLink, BookingNavigation } from "../2728-cc-weddings/wedding-calendar";
import DateCheck from "./DateCheck";
import styles from "./landing.module.css";

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;

/* The hero does not rotate, on purpose.
 *
 * Every rotation paints a full-bleed image and registers a new LCP candidate,
 * and on this site that turned a 1.5s hero into a reported 8.9s (the long
 * comment in 2728-cc-weddings-dark/hero-gallery.tsx is the whole story). On a
 * page paid for by the click, LCP is not a vanity metric: it is Ad Rank. One
 * photograph, priority, no JavaScript.
 *
 * The frame is the homepage film strip's grand-staircase portrait, rendered at
 * this exact crop and looked at before it was chosen. */
const HERO_PHOTO: Photo & { position: string } = {
  ...FILM_STRIP[5],
  position: "center 32%",
};

/** Eight frames across the five bodies of work on /portfolio. Each one was
 *  rendered at this crop and looked at before it was placed here. */
const LOOK: { photo: Photo; album: string }[] = [
  { photo: DOCUMENTARY[7], album: "Documentary" },
  { photo: EDITORIAL[5], album: "Editorial" },
  { photo: FILM[19], album: "Film Inspired" },
  { photo: DREAMY_FINE_ART[17], album: "Dreamy Fine Art" },
  { photo: DOCUMENTARY[10], album: "Documentary" },
  { photo: EDITORIAL[2], album: "Editorial" },
  { photo: ANALOGUE[4], album: "1980s Film" },
  { photo: FILM[7], album: "Film Inspired" },
];

/** Real client messages, transcribed from the screenshots in lib/reviews.ts.
 *  Nothing here is written by me; the originals are shown underneath. */
const QUOTES = [
  { text: "Only one person understood our vision the way we were imagining it.", who: "Samantha", note: "Five-star Google review" },
  { text: "My mom keeps texting about the photos. She said she never saw wedding photos this good all her life.", who: "Rachel", note: "The week after the wedding" },
  { text: "I did not expect to get emotional over the album but here we are.", who: "Megan", note: "When the album arrived" },
];

const collectionFor: Record<string, string> = {
  core: "A ceremony, the portraits and dinner in one place.",
  signature: "A getting-ready, a ceremony and the party that follows.",
  heirloom: "A long day, from the first coffee to the last dance.",
};

export default function LandingPage({ variant }: { variant: LandingVariant }) {
  const city = variant.slug ? variant.h1.replace("Wedding Photographer in ", "") : "Canada";
  const dateFirst = Boolean(variant.slug);
  const order = galleryOrderFor(variant.slug);
  const albums = order
    .map((slug) => GALLERIES.find((g) => g.slug === slug))
    .filter((g): g is (typeof GALLERIES)[number] => Boolean(g));
  const frames = albums.reduce((sum, g) => sum + g.frameCount, 0);
  const faqs = [...variant.faqs, ...COMMON_FAQS].map((faq) => dateFirst && faq.q === "How do we find out if you have our date?" ? { ...faq, a: "Use the date check at the top of this page to see current availability, then book a free 30-minute video call with Arman. Your wedding date is secured by a signed contract and retainer." } : faq);

  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">Skip to content</a>

      <header className={styles.header}>
        <a className={styles.wordmark} href="#main" aria-label="Arman Arai, top of page">
          Arman Arai<span>Wedding Photography</span>
        </a>
        {dateFirst ? <a className={styles.headerCta} href="#check-date">Check your date <span aria-hidden="true">↗</span></a> : <BookingLink className={styles.headerCta} placement="header">
          Book a free call <span aria-hidden="true">↗</span>
        </BookingLink>}
      </header>

      <main id="main">
        {/* ── Hero. Headline matches the search; the form is the next thing. ── */}
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{variant.eyebrow}</p>
            <h1 id="hero-title">{variant.h1}</h1>
            <p className={styles.intro}>{variant.intro}</p>
            <p className={styles.price}>
              Collections from <strong>{money(CORE.price)}</strong>
              <span>CAD before tax. The same price in every Canadian city, travel quoted separately.</span>
            </p>
            <div id={dateFirst ? "check-date" : undefined} className={styles.dateCheckPanel}><DateCheck city={city} wherePlaceholder={variant.wherePlaceholder} page={variant.path} classes={styles} instantAvailability={dateFirst} replyTiming={dateFirst ? "See availability, then choose a time for a free video call." : undefined} /></div>
            <p className={styles.orBook}>
              Or <BookingLink className={styles.textLink} placement="hero_secondary">book a free 30-minute call</BookingLink> and I will check the date while we talk.
            </p>
          </div>
          <figure className={styles.heroPhoto}>
            <Image
              src={HERO_PHOTO.src}
              alt={HERO_PHOTO.alt}
              fill
              priority
              fetchPriority="high"
              quality={72}
              sizes="(max-width: 860px) 100vw, 46vw"
              style={{ objectPosition: HERO_PHOTO.position }}
            />
          </figure>
        </section>

        <div className={styles.factBar} aria-label="At a glance">
          <span>6, 8 or 10 hours of coverage</span>
          <span>400 to 800+ edited images</span>
          <span>Preview in 24 to 48 hours</span>
          <span>Photographed by Arman, every time</span>
        </div>

        {/* ── The proof. Whole galleries, not a reel of the best nine frames. ── */}
        <section id="weddings" className={styles.weddings} aria-labelledby="weddings-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>Real weddings, start to finish</p>
              <h2 id="weddings-title">Every frame, not<br /><em>the best nine.</em></h2>
            </div>
            <p>
              Anyone can show you nine good photographs. These are complete
              galleries, {frames} frames across {albums.length} weddings, in the
              order the days actually happened. Open one and scroll to the end.
            </p>
          </div>

          <div className={styles.albumGrid}>
            {albums.map((album, index) => (
              <a key={album.slug} className={styles.album} href={`/galleries/${album.slug}`}>
                <div className={styles.albumPhoto}>
                  <Image
                    src={album.cover.url}
                    alt={album.cover.alt}
                    fill
                    quality={72}
                    loading={index < 2 ? "eager" : "lazy"}
                    fetchPriority="low"
                    sizes="(max-width: 700px) 84vw, (max-width: 1200px) 44vw, 30vw"
                  />
                </div>
                <p className={styles.albumNames}>{album.names}</p>
                <p className={styles.albumWhere}>{album.location}</p>
                <p className={styles.albumMeta}>
                  <span>{album.date}</span>
                  <span>{album.frameCount} frames ↗</span>
                </p>
              </a>
            ))}
          </div>
        </section>

        {/* ── The look. The five bodies of work on /portfolio. ── */}
        <section className={styles.look} aria-labelledby="look-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>How it looks</p>
              <h2 id="look-title">Documentary all day.<br /><em>Directed for twenty minutes.</em></h2>
            </div>
            <p>
              I photograph what happens rather than staging a version of it, then
              I direct properly for the portraits, which is the one part of the
              day where direction is what you actually want.
            </p>
          </div>
          <div className={styles.lookStrip}>
            {LOOK.map(({ photo, album }) => (
              <figure key={photo.src}>
                <div>
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    quality={70}
                    loading="lazy"
                    fetchPriority="low"
                    sizes="(max-width: 700px) 62vw, 23vw"
                  />
                </div>
                <figcaption>{album}</figcaption>
              </figure>
            ))}
          </div>
          <p className={styles.stripHint}>
            <span className={styles.swipeOnly} aria-hidden="true">→ Swipe. </span>
            All five collections are on the <a href="/portfolio">portfolio</a>.
          </p>
        </section>

        {/* ── The numbers, on the page rather than behind a form. ── */}
        <section id="prices" className={styles.prices} aria-labelledby="prices-title">
          <div className={styles.sectionHead}>
            <div>
              <p className={styles.eyebrow}>What it costs</p>
              <h2 id="prices-title">Three collections.<br /><em>Three whole numbers.</em></h2>
            </div>
            <p>
              No tiers behind a form and no quote you have to earn. Pick the one
              that matches the length of your day, or tell me the plan on the
              call and I will tell you which one fits.
            </p>
          </div>

          <div className={styles.priceGrid}>
            {TIERS.map((tier) => (
              <article key={tier.slug} className={tier.slug === "signature" ? styles.priceCardFeatured : styles.priceCard}>
                <p className={styles.flag} aria-hidden={tier.slug !== "signature"}>
                  {tier.slug === "signature" ? tier.strap : " "}
                </p>
                <p className={styles.tierHours}>{tier.coverage}</p>
                <h3>{tier.name}</h3>
                <p className={styles.tierPrice}>
                  {money(tier.price)}<span>CAD before tax</span>
                </p>
                <p className={styles.tierFor}>{collectionFor[tier.slug]}</p>
                <ul>
                  <li>{tier.images}</li>
                  <li>{tier.preview}</li>
                  <li>{tier.delivery}</li>
                  {tier.film && <li>{tier.film}</li>}
                  {tier.rolls && <li>{tier.rolls}</li>}
                  {tier.slug === "signature" && <li>{ALBUM_SPECS.signature.name}, {ALBUM_SPECS.signature.size}, {ALBUM_SPECS.signature.pages}</li>}
                  {tier.slug === "heirloom" && <li>{ALBUM_SPECS.heirloom.name}, {ALBUM_SPECS.heirloom.size}, {ALBUM_SPECS.heirloom.pages}</li>}
                </ul>
                <BookingLink className={styles.tierLink} placement={`collection_${tier.slug}`}>
                  Talk about {tier.name} <span aria-hidden="true">↗</span>
                </BookingLink>
              </article>
            ))}
          </div>

          <div className={styles.included}>
            <h3>In all three</h3>
            <p>
              Vertical social reels in the first week so you have something to
              post long before the album arrives, film prints handed to your
              guests on the night, a timeline review and a family-photo plan, and
              a shareable gallery at full resolution with permission to print.
            </p>
          </div>
          <p className={styles.note}>
            The collection costs the same figure wherever in Canada the day
            happens. Travel, where the date requires it, is booked on the leanest
            practical route, quoted separately and agreed before you book.
            {variant.tax ? ` Sales tax here is ${variant.tax}.` : ""}
          </p>
        </section>

        {/* ── Proof of a different kind. ── */}
        <section id="reviews" className={styles.reviews} aria-labelledby="reviews-title">
          <p className={styles.eyebrow} id="reviews-title">When the photographs arrive</p>
          <div className={styles.quotes}>
            {QUOTES.map((quote) => (
              <figure key={quote.who}>
                <blockquote>&ldquo;{quote.text}&rdquo;</blockquote>
                <figcaption>{quote.who} <span>· {quote.note}</span></figcaption>
              </figure>
            ))}
          </div>
          <ReviewScreenshots />
        </section>

        {/* ── Him. The face is the reason a call gets booked. ── */}
        <section className={styles.about} aria-labelledby="about-title">
          <figure className={styles.aboutPhoto}>
            <Image
              src={ARMAN.src}
              alt={ARMAN.alt}
              fill
              quality={76}
              loading="lazy"
              fetchPriority="low"
              sizes="(max-width: 860px) 100vw, 42vw"
              style={{ objectPosition: "center 22%" }}
            />
          </figure>
          <div className={styles.aboutCopy}>
            <p className={styles.eyebrow}>Hello, I&rsquo;m Arman</p>
            <h2 id="about-title">You will not be<br /><em>handed to someone else.</em></h2>
            <p>
              I photograph the wedding myself. Not an associate, not whoever the
              studio had free that Saturday. The person you talk to on the call
              is the person standing at the back of your ceremony.
            </p>
            <p>{variant.lede}</p>
            <p>
              {variant.venues.length > 0
                ? `Around ${city} that has meant ${variant.venues.slice(0, 4).join(", ")} and a long list of rooms that never made a website. `
                : "That has meant chapels, ballrooms, backyards, vineyards and a long list of rooms that never made a website. "}
              {variant.season ? `The season here runs ${variant.season}, and the good dates go first.` : "The good dates go eighteen months out, so early is not too early."}
            </p>
            <p>
              On the call, tell me what you are planning and what you are looking
              forward to. If I am not the right fit I will say so and point you
              at someone who is.
            </p>
            <BookingLink className={styles.aboutLink} placement="about">
              Book a free 30-minute call <span aria-hidden="true">↗</span>
            </BookingLink>
          </div>
        </section>

        {/* ── Objections, in the order they get raised. ── */}
        <section className={styles.faq} aria-labelledby="faq-title">
          <div>
            <p className={styles.eyebrow}>Before we talk</p>
            <h2 id="faq-title">The questions<br /><em>everyone asks.</em></h2>
            <p className={styles.faqAside}>
              If yours is not here, it is the kind of thing a call answers in
              two minutes. Ask it there rather than typing it out.
            </p>
            <BookingLink className={styles.faqLink} placement="faq">
              Book the call <span aria-hidden="true">↗</span>
            </BookingLink>
          </div>
          <div className={styles.questions}>
            {faqs.map((item) => (
              <details key={item.q}>
                <summary>{item.q}<span aria-hidden="true">+</span></summary>
                <p>{item.a}</p>
              </details>
            ))}
          </div>
        </section>

        {/* ── The conversion. ── */}
        <section id="book-a-call" className={styles.booking} aria-labelledby="booking-title">
          <div className={styles.bookingCopy}>
            <p className={styles.eyebrow}>Free, 30 minutes, no obligation</p>
            <h2 id="booking-title" tabIndex={-1}>Pick a time<br /><em>and bring your date.</em></h2>
            <ol>
              <li>I check your date live while we talk.</li>
              <li>We go through the day, the coverage and the real number.</li>
              <li>You decide afterwards, in your own time.</li>
            </ol>
            <p className={styles.bookingNote}>
              Nothing to prepare. If the date is already gone I will tell you in
              the first minute rather than the last.
            </p>
          </div>
          <div className={styles.bookingCalendar}>
            <WeddingCalendar page={variant.path.replace(/^\//, "")} theme="dark" classes={styles} />
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span className={styles.footerName}>Arman Arai</span>
        <span>Wedding photography across Canada · {SITE.email}</span>
        <a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a>
        <span>© {new Date().getFullYear()}</span>
      </footer>

      <BookingNavigation classes={styles} dateFirst={dateFirst} />
      <Analytics />
    </div>
  );
}
