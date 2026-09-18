import type { Metadata } from "next";
import Image from "next/image";
import ReviewScreenshots from "@/components/weddings/ReviewScreenshots";
import { Analytics } from "@vercel/analytics/next";
import { ABOUT_STORY, LANDING_PAGE, at } from "@/lib/images";
import { ALBUM_SPECS, CORE, SITE, TIERS } from "@/lib/site";
import WeddingCalendar, { BookingLink, BookingNavigation } from "./wedding-calendar";
import styles from "./weddings.module.css";

const money = (n: number) => `C$${n.toLocaleString("en-CA")}`;
const hero = LANDING_PAGE[4];
export const metadata: Metadata = {
  title: { absolute: "2027 & 2028 Wedding Photography in Canada | Arman Arai" },
  description: `Enjoy your wedding. Love your photographs. Documentary and editorial wedding photography across Canada from ${money(CORE.price)}. Book a free call with Arman.`,
  alternates: { canonical: `${SITE.url}/2728-cc-weddings` },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: {
    title: "Enjoy your wedding. Love your photographs.",
    description: `Canadian wedding photography for 2027 & 2028. Collections from ${money(CORE.price)}. Meet Arman and talk through your day.`,
    url: `${SITE.url}/2728-cc-weddings`,
    images: [{ url: at(hero.src, 1200), alt: "A bride and groom together in the evening sunlight" }],
  },
};

const collectionDescriptions: Record<string, string> = {
  core: "For the ceremony, portraits and time with your guests.",
  signature: "More time for getting ready and the celebrations that follow.",
  heirloom: "For a longer day, from the preparations to the dance floor.",
};

const questions = [
  ["We’re awkward in front of a camera. Can you help?", "Absolutely. I’ll guide you through the portraits, including where to stand and what to do with your hands. For the rest of the day, you can focus on each other and your guests while I photograph what happens."],
  ["Do you photograph weddings anywhere in Canada?", "Yes. Collection prices are the same across Canada. Travel stays separate, uses the leanest practical route, and is reduced or waived when I am already scheduled in your region."],
  ["Do we need to choose a collection before the call?", "No. Tell me what you’re planning and which parts of the day matter most to you. We’ll work out how much coverage fits, along with any travel or extras, before you decide."],
  ["Is video included?", "Every collection includes vertical social reels. Signature also includes a 1-minute feature film, and Heirloom includes a 3-minute feature film. If you want a dedicated videographer, we can discuss that as an add-on."],
  ["What happens after our call?", "If you’d like to go ahead and your date is available, we’ll confirm your collection, the full quote and the contract. A signed contract and 30% retainer secure your date. The balance is due 30 days before the wedding. Booking a call doesn’t commit you to anything."],
];

export default function WeddingLandingPage() {
  return (
    <div className={styles.page}>
      <a className={styles.skip} href="#main">Skip to content</a>
      <header className={styles.header}>
        <a href="#main" aria-label="Arman Arai, top of page" className={styles.wordmark}>Arman Arai<span>WEDDING PHOTOGRAPHY</span></a>
        <nav aria-label="Page navigation">
          <a className={styles.workLink} href="#photographs">The photographs</a>
          <BookingLink className={styles.headerCta} placement="header">Let’s talk <span aria-hidden="true">↗</span></BookingLink>
        </nav>
      </header>

      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Across Canada · 2027 & 2028 weddings</p>
            <h1 id="hero-title">Enjoy your wedding.<br /><em>Love your photographs.</em></h1>
            <p className={styles.intro}>Beautiful portraits. The laughter you remember. The moments you missed. Wedding photography that gives you all three.</p>
            <p className={styles.starting}>Collections from <strong>{money(CORE.price)}</strong><span>CAD before tax · travel quoted separately</span></p>
            <BookingLink className={styles.button} placement="hero">Book a free discovery call <span aria-hidden="true">↗</span></BookingLink>
            <p className={styles.micro}>30 minutes with me, Arman. No obligation.</p>
          </div>
          <figure className={styles.heroPhoto}>
            <Image src={hero.src} alt="A bride and groom looking at each other in warm evening light, her veil catching the sun" fill priority fetchPriority="high" quality={75} sizes="(max-width: 760px) 88vw, (max-width: 1600px) 50vw, 800px" />
            <figcaption>For the day you’ll always come back to.</figcaption>
          </figure>
        </section>

        <div className={styles.factBar} aria-label="At a glance"><span>Photographed by Arman</span><span>6, 8 or 10 hours of coverage</span><span>Weddings across Canada</span></div>

        <section id="photographs" className={styles.work} aria-labelledby="work-title">
          <div className={styles.sectionHeading}>
            <div><p className={styles.eyebrow}>A little of what I see</p><h2 id="work-title">The portraits. The people.<br /><em>The party.</em></h2></div>
            <p>There’s room for a beautiful portrait and a very good time. I’ll help you with the first and be ready to photograph the second.</p>
          </div>
          <div className={styles.gallery}>
            <figure><div><Image src={LANDING_PAGE[2].src} alt="Black and white bridal portrait beneath a veil, beside a window" fill quality={75} fetchPriority="low" sizes="(max-width: 760px) 76vw, (max-width: 1600px) 27vw, 430px" /></div><figcaption><span>01</span> A moment for you</figcaption></figure>
            <figure><div><Image src={LANDING_PAGE[1].src} alt="A bride laughing on the dance floor beneath colourful party lights" fill quality={75} fetchPriority="low" sizes="(max-width: 760px) 76vw, (max-width: 1600px) 36vw, 580px" /></div><figcaption><span>02</span> Everyone you love, all in</figcaption></figure>
            <figure><div><Image src={LANDING_PAGE[7].src} alt="A couple dancing on a patterned marble floor, photographed from above in black and white" fill quality={75} fetchPriority="low" sizes="(max-width: 760px) 76vw, (max-width: 1600px) 27vw, 430px" /></div><figcaption><span>03</span> Just the two of you</figcaption></figure>
          </div>
          <p className={styles.swipeHint}>Swipe through the photographs <span aria-hidden="true">→</span></p>
        </section>

        <section className={styles.about} aria-labelledby="about-title">
          <figure><Image src={ABOUT_STORY[4].src} alt="Arman with a bride and groom at their wedding reception" fill quality={75} fetchPriority="low" sizes="(max-width: 760px) 100vw, (max-width: 1600px) 50vw, 800px" /></figure>
          <div className={styles.aboutCopy}>
            <p className={styles.eyebrow}>Hi, I’m Arman.</p>
            <h2 id="about-title">You don’t need to know<br /><em>how to pose.</em></h2>
            <p>You just need to be there, with your favourite person and the people you love.</p>
            <p>I’ll give you direction when it helps, make time for the family photographs, and let you get back to your guests. In between, I’m watching for the hugs, the glances and the things you couldn’t have planned.</p>
            <p>On our call, tell me what you’re looking forward to. We’ll talk about how you want the day to feel and the photographs you want to take away from it.</p>
            <BookingLink className={styles.textLink} placement="about">Let’s meet <span aria-hidden="true">↗</span></BookingLink>
          </div>
        </section>

        <section id="reviews" className={styles.reviews} aria-labelledby="reviews-title">
          <p className={styles.eyebrow} id="reviews-title">When the photographs arrive</p>
          <div className={styles.quoteGrid}>
            <figure><blockquote>“We just went through the preview gallery and we are OBSESSED!”</blockquote><figcaption>Jennifer <span>· After the preview gallery</span></figcaption></figure>
            <figure><blockquote>“My mom keeps texting about the photos. She said she never saw wedding photos this good all her life.”</blockquote><figcaption>Rachel <span>· A message after the wedding</span></figcaption></figure>
          </div>
          <ReviewScreenshots />
        </section>

        <section className={styles.collections} aria-labelledby="collections-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The collections</p><h2 id="collections-title">Make room for<br /><em>what matters to you.</em></h2></div><p>You don’t have to choose today. Start with your plans; we’ll find the coverage that fits on our call.</p></div>
          <div className={styles.priceGrid}>
            {TIERS.map((tier) => (
              <article key={tier.slug} className={tier.slug === "signature" ? styles.featuredPrice : styles.priceCard}>
                <p className={styles.tierHours}>{tier.hours} hours of coverage</p>
                <h3>{tier.name}</h3><p className={styles.price}>{money(tier.price)}<span>CAD before tax</span></p>
                <p className={styles.tierDescription}>{collectionDescriptions[tier.slug]}</p>
                <ul>
                  <li>{tier.images}</li><li>Preview: {tier.preview}</li><li>{tier.delivery}</li>
                  {tier.film && <li>{tier.film.replace("A ", "")}</li>}
                  {tier.rolls && <li>{tier.rolls}</li>}
                  {tier.slug === "signature" && <li>{ALBUM_SPECS.signature.size} album · {ALBUM_SPECS.signature.pages}</li>}
                  {tier.slug === "heirloom" && <li>{ALBUM_SPECS.heirloom.size} leather album · {ALBUM_SPECS.heirloom.pages}</li>}
                </ul>
                <BookingLink className={styles.collectionLink} placement={`collection_${tier.slug}`}>Talk about {tier.name} <span aria-hidden="true">↗</span></BookingLink>
              </article>
            ))}
          </div>
          <div className={styles.included}><h3>In every collection</h3><p>Photography by me, timeline and family-photo planning, a shareable online gallery with print permission, social reels in the first week, and film prints for your guests on the night.</p></div>
          <p className={styles.travelNote}>Collection prices are the same across Canada. Travel, where required, is quoted separately and agreed before you book.</p>
        </section>

        <section className={styles.faq} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>A few things you may be wondering</p><h2 id="faq-title">Before we<br /><em>say hello.</em></h2></div><div className={styles.questions}>{questions.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

        <section id="book-a-call" className={styles.booking} aria-labelledby="booking-title">
          <div className={styles.bookingIntro}><p className={styles.eyebrow}>Let’s talk about your wedding</p><h2 id="booking-title">Tell me what<br /><em>you’re planning.</em></h2><p>Pick a time below for a free 30-minute video call. We’ll talk about your date, your venue and what you’d love from your photographs.</p><ol><li>Check availability for your wedding date.</li><li>Talk through coverage, pricing and travel.</li><li>See if we’re a good fit.</li></ol><p className={styles.bookingNote}>No need to have it all figured out.<br />And no obligation to book.</p></div>
          <div className={styles.calendar}><WeddingCalendar /></div>
        </section>
      </main>
      <footer className={styles.footer}><span className={styles.footerName}>Arman Arai - Wedding Photographer</span><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></footer>
      <BookingNavigation />
      <Analytics />
    </div>
  );
}
