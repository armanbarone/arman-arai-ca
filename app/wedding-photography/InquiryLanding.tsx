import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { ARMAN } from "@/lib/images";
import type { WeddingCity } from "@/lib/ads/city-wedding-pages";
import { COVERAGE_OPTIONS, type IntroWeddingOffer } from "@/lib/ads/short-story";
import { ALBUM_SPECS, SITE, TIERS, type Tier } from "@/lib/site";
import { proofByN, proofSrc } from "@/lib/reviews";
import { BookingNavigation } from "../2728-cc-weddings/wedding-calendar";
import AlbumBrowser from "./AlbumBrowser";
import { money, questionsFor, stylesOfWork, TIER_STRAP, weddingAlbumsFor } from "./CityWeddingLanding";
import InquiryFunnel, { CheckDateLink, InquiryForm, type FunnelCollection } from "./InquiryFunnel";
import styles from "./vancouver.module.css";
import funnel from "./inquiry.module.css";

/* The pricing-request ads page. Same photographs, albums, reviews and
 * collections as CityWeddingLanding with an intro offer, but one action
 * instead of three: every link on the page leads to the form under the
 * headline, and the calendar only appears once the form is sent (see
 * InquiryFunnel). There is no "book a call" section to scroll to. */

type InquiryLandingProps = {
  city: WeddingCity;
  pageSlug: string;
  offer: IntroWeddingOffer;
  tierSlugs: string[];
  tierOverrides: Record<string, Partial<Tier> & { hoursLabel?: string }>;
  coverageSummary: string;
};

/** The same lines the collection cards show, in the same order. */
const tierItems = (tier: Tier) => [
  tier.images, tier.preview, tier.delivery, tier.film, tier.rolls, tier.engagement,
  tier.album.includes("included") ? `${ALBUM_SPECS.signature.size} album · ${ALBUM_SPECS.signature.pages}` : "",
].filter(Boolean);
const coverageFor = (slug: string) => COVERAGE_OPTIONS.find((option) => option.slug === slug)?.value;

export default function InquiryLanding({ city, pageSlug, offer, tierSlugs, tierOverrides, coverageSummary }: InquiryLandingProps) {
  const page = `wedding-photography/${pageSlug}`;
  const phone = SITE.phone.replace(/^\+1\s*/, "");
  const tiers = TIERS.filter((tier) => tierSlugs.includes(tier.slug)).map((tier) => ({ ...tier, ...tierOverrides[tier.slug] }));
  const collections: FunnelCollection[] = [
    { slug: offer.slug, name: offer.name, hoursLabel: `${offer.hours} hours of coverage`, strap: offer.strap, price: offer.price, items: offer.items },
    ...tiers.map((tier) => ({ slug: tier.slug, name: tier.name, hoursLabel: tier.hoursLabel ?? `${tier.hours} hours of coverage`, strap: TIER_STRAP[tier.slug] ?? tier.strap, price: tier.price, items: tierItems(tier) })),
  ];
  const shared = questionsFor(city);
  const questions: string[][] = [
    ["How do we check whether our date is available?", "Fill in the short form at the top of this page. You’ll see straight away whether your date is open and what each collection costs, and you can choose a time for a free video call if you’d like one. Checking a date does not reserve it."],
    shared[1], shared[2], shared[3],
    ["Do we have to book a video call?", `No. The call is there if you’d like to meet before you decide. If you’d rather keep it to email or text, reply to my email or text me at ${phone}.`],
    [`When is the ${offer.name} collection available?`, offer.availability],
    ["What is included, and what costs extra?", offer.includedAnswer],
    shared[5],
  ];
  const weddingAlbums = weddingAlbumsFor(city.albums);

  return <div className={`${styles.page} ${styles.dark}`} data-landing-theme="dark" data-landing-city={city.slug}>
    <a className={styles.skip} href="#main">Skip to content</a>
    <InquiryFunnel collections={collections} city={city.name} page={page} phone={phone} phoneE164={SITE.phoneE164} travelNote={offer.travelNote}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#main" aria-label="Arman Arai, top of page">Arman Arai<span>WEDDING PHOTOGRAPHY</span></a>
        <nav aria-label="Page navigation"><a className={styles.navLink} href="#albums">The photographs</a><a className={styles.navLink} href="#collections">Collections</a><a className={styles.headerCta} href="#check-date">Check your date <span aria-hidden="true">↗</span></a></nav>
      </header>
      <main id="main">
        <section className={funnel.hero} aria-labelledby="hero-title">
          <div className={funnel.heroTop}>
            <p className={`${styles.eyebrow} ${funnel.heroEyebrow}`}>Your people. Your day. Your kind of photographs.</p>
            <h1 id="hero-title" className={funnel.heroTitle}>{city.name} <br />wedding <br /><em>photography.</em></h1>
            <p className={styles.heroIntro}>Beautiful portraits. All the feeling in between.<br />And time to actually enjoy your wedding.</p>
            <p className={styles.starting}>Collections from <strong>{money(offer.price)}</strong><span>{coverageSummary} · CAD before tax · {offer.travelShort}</span></p>
          </div>
          <div className={`${styles.heroArt} ${funnel.heroArt}`}>
            <figure className={`${styles.heroImage} ${funnel.heroImage}`}><Image src={city.hero.src} alt={city.hero.alt} style={city.heroPosition ? { objectPosition: city.heroPosition } : undefined} fill priority fetchPriority="high" quality={68} sizes="(max-width: 760px) 80vw, (max-width: 1600px) 38vw, 608px" /><figcaption>A day you felt. Photographs you keep.</figcaption></figure>
            <figure className={styles.heroInset}><Image src={city.inset.src} alt={city.inset.alt} fill quality={68} sizes="(max-width: 760px) 28vw, (max-width: 1600px) 14vw, 224px" /></figure>
            <span className={styles.heroSideNote}>Documentary feeling / Editorial eye</span>
          </div>
          <div id="check-date" className={`${styles.dateCheckPanel} ${funnel.formPanel}`}>
            <InquiryForm city={city.name} page={`/${page}`} />
            <p className={styles.directCall}>Rather text? <a href={`sms:${SITE.phoneE164}`}>{phone}</a></p>
          </div>
        </section>
        <div className={styles.factBar}><span>{city.coverage[0]}</span><span>{city.coverage[1]}</span><span>Photographed by Arman</span></div>

        <section className={styles.firstQuote} aria-label="A client’s words"><span className={styles.quoteMark} aria-hidden="true">“</span><blockquote>Only one person understood our vision<br className={styles.desktopBreak} /> the way we were imagining it.</blockquote><a href={proofSrc(8)} target="_blank" rel="noopener noreferrer">Samantha · Google review <span aria-hidden="true">↗</span></a></section>

        <section id="albums" className={styles.workSection} aria-labelledby="work-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The portfolio / 01</p><h2 id="work-title">Find the feeling<br /><em>you came for.</em></h2></div><p>From the quiet moments to the dance floor. Explore the full collections and see what feels like you.</p></div>
          <AlbumBrowser albums={stylesOfWork} label="Five complete portfolio collections" compact />
          <p className={styles.albumHint}>Open an album to see every photograph. <span>Swipe to explore the collections →</span></p>
          <div className={styles.weddingHeading}><div><p className={styles.eyebrow}>Wedding stories / 02</p><h2>The whole day.<br /><em>All the way through.</em></h2></div><p>Three complete wedding stories from the portfolio, with the preparations, the ceremony and everything that followed.</p></div>
          <AlbumBrowser albums={weddingAlbums} label="Complete wedding stories" />
          <div className={styles.workBottom}><a href="#check-date">Like what you see? Check your date <span aria-hidden="true">↗</span></a></div>
        </section>

        <section className={styles.about} aria-labelledby="about-title">
          <div className={styles.portraitWrap}><figure className={styles.portrait}><Image src={ARMAN.src} alt={ARMAN.alt} fill quality={78} sizes="(max-width: 760px) 85vw, 38vw" /></figure><span className={styles.signature}>See you on the other side of the camera.</span></div>
          <div className={styles.aboutCopy}><p className={styles.eyebrow}>Your photographer</p><h2 id="about-title">Hi, I’m Arman.<br /><em>Let’s make this easy.</em></h2><p>You don’t need to arrive knowing how to pose. I’ll help with that.</p><p>I’ll give you direction when it helps, make time for the family photographs, and let you get back to your favourite people. In between, I’m watching for the laughter, the glances and the moments you couldn’t have planned.</p><p>{city.about}</p><a className={styles.textLink} href="#check-date">Check your date and pricing <span aria-hidden="true">↗</span></a></div>
        </section>

        <section id="collections" className={styles.collections} aria-labelledby="collections-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The collections / 03</p><h2 id="collections-title">Your day, with room<br /><em>for what matters.</em></h2></div><p>Start with the time you need. Send your date and you’ll see which collection fits, straight away.</p></div>
          <div className={`${styles.priceGrid} ${styles.priceGridExpanded}`}>
            <article className={`${styles.priceCard} ${styles.introPriceCard}`}>
              <div className={styles.tierHeader}><p>{offer.hours} hours of coverage</p><span>{offer.strap}</span></div>
              <h3>{offer.name}</h3><p className={styles.price}>{money(offer.price)}<span>CAD before tax</span></p>
              <ul>{offer.items.map((item) => <li key={item}>{item}</li>)}</ul>
              <CheckDateLink className={styles.collectionLink} coverage={coverageFor(offer.slug)}>Check your date for {offer.name} <span aria-hidden="true">↗</span></CheckDateLink>
            </article>
            {tiers.map((tier) => <article key={tier.slug} className={tier.slug === "signature" ? styles.featuredPrice : styles.priceCard}>
              <div className={styles.tierHeader}><p>{tier.hoursLabel ?? `${tier.hours} hours of coverage`}</p><span>{TIER_STRAP[tier.slug] ?? tier.strap}</span></div>
              <h3>{tier.name}</h3><p className={styles.price}>{money(tier.price)}<span>CAD before tax</span></p>
              <ul>{tierItems(tier).map((item) => <li key={item}>{item}</li>)}</ul>
              <CheckDateLink className={styles.collectionLink} coverage={coverageFor(tier.slug)}>Check your date for {tier.name} <span aria-hidden="true">↗</span></CheckDateLink>
            </article>)}
          </div>
          <div className={styles.included}><h3>Always included.</h3><p>{offer.alwaysIncluded}</p></div>
          <p className={styles.travel}>{offer.travelNote} All prices are in Canadian dollars before tax.</p>
        </section>

        <section className={styles.reviews} aria-labelledby="reviews-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>When the photographs arrive</p><h2 id="reviews-title">I’ll let them<br /><em>tell you.</em></h2></div><p>A few words from the people on the other side of the camera. Tap a message to read the original.</p></div><div className={styles.reviewsGrid}>
          {[{ n: 2, who: "Jennifer", quote: "We just went through the preview gallery and we are OBSESSED!" }, { n: 3, who: "Megan", quote: "I did not expect to get emotional over the album but here we are." }, { n: 5, who: "Brianna", quote: "It’s everything I ever wanted and more." }].map(({ n, who, quote }) => { const proof = proofByN(n); return <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption><a href={proofSrc(n)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${who}’s original message`}><Image src={proofSrc(n)} alt={proof.alt} width={proof.w} height={proof.h} quality={80} sizes="(max-width: 760px) 78vw, 25vw" /><span>Read the original message ↗</span></a></figure>; })}
        </div></section>

        <section className={styles.interlude} aria-label="Wedding photographs">{city.interlude.map((photo) => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} fill quality={72} sizes="(max-width: 760px) 50vw, 33vw" /></figure>)}</section>

        <section className={styles.faq} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>A few things before we meet</p><h2 id="faq-title">You might<br /><em>be wondering.</em></h2></div><div className={styles.questions}>{questions.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

        <section className={funnel.finalCta} aria-labelledby="final-title">
          <div className={styles.bookingCopy}><p className={styles.eyebrow}>Your {city.name} wedding starts here</p><h2 id="final-title">Bring your date.<br /><em>Get your pricing.</em></h2><p>One short form. You’ll see straight away whether your date is open and what each collection costs.</p></div>
          <div className={styles.bookingCopy}><ol><li><span>01</span> Tell me your date and your plans.</li><li><span>02</span> See your availability and pricing on the spot.</li><li><span>03</span> Pick a time for a free video call, or just reply by email or text.</li></ol><a className={`${styles.button} ${funnel.finalButton}`} href="#check-date">Check My Date & Get Pricing <span aria-hidden="true">↗</span></a></div>
        </section>
      </main>
      <BookingNavigation classes={styles} dateFirst startingPrice={offer.price} note={`Before tax · ${offer.travelShort}`} />
    </InquiryFunnel>
    <footer className={styles.footer}><a href="#main" className={styles.footerBrand}>Arman Arai<span>Wedding photography · {city.name}</span></a><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
    <Analytics />
  </div>;
}
