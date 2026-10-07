import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ARMAN, CITY_PHOTOS } from "@/lib/images";
import { SITE } from "@/lib/site";
import type { WeddingCity } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";
import { CTA_LABEL, FORM_ID, funnelCollections, pricingTiers, type PricingMarket } from "@/lib/ads/pricing-request";
import { proofByN, proofSrc } from "@/lib/reviews";
import AlbumBrowser from "./AlbumBrowser";
import HeroConveyor from "./HeroConveyor";
import InquiryFunnel, { InquiryForm, MessageLinks } from "./InquiryFunnel";
import { BookingNavigation } from "./wedding-calendar";
import { stylesOfWork, weddingAlbumsFor } from "./landing-content";
import CityWorkAlbum from "./CityWorkAlbum";
import original from "./vancouver.module.css";
import funnel from "./inquiry.module.css";
import styles from "./vancouver-weddings/landing.module.css";

/* The pricing-request pages, /wedding-photography/<city>-pricing, copied from
 * /wedding-photography/vancouver-weddings (owner, 2026-10-03: "copy paste the
 * style/design and wording of this new landing page into your own landing
 * pages ... I am not interested in your own work"). Same markup, classes and
 * words; only the city changes: its name, the hero caption (its coverage
 * line), one line under "See how your day could feel", the album photos and
 * the footer. The stylesheet is the vancouver-weddings one itself, so the
 * pages cannot drift apart. The form is the shared two-step InquiryForm, so
 * every send fires the auto-reply and lands on the city's thank-you URL. */

export function weddingsMetadata(city: WeddingCity, path: string): Metadata {
  const from = Math.min(...pricingTiers().map((tier) => tier.price));
  return {
    ...cityWeddingMetadata(city, path, { entryPrice: from }),
    description: `${city.name} wedding photography by Arman Arai. Prices start from $${from.toLocaleString("en-CA")} CAD before tax. Explore the photographs and tell me about your day for a personal wedding guide.`,
  };
}

const reviews = [
  { n: 2, who: "Jennifer", quote: "We just went through the preview gallery and we are OBSESSED!" },
  { n: 3, who: "Megan", quote: "I did not expect to get emotional over the album but here we are." },
  { n: 5, who: "Brianna", quote: "It’s everything I ever wanted and more." },
];

/** The scene-setting "places" frames from every city: not wedding work, and
 *  several are generated, so they never go in the album. */
const PLACES = new Set(Object.values(CITY_PHOTOS).flatMap((photos) => photos.places.map((photo) => photo.src)));

function SectionLabel({ number, children }: { number: string; children: React.ReactNode }) {
  return <p className={styles.sectionLabel}><span>{number}</span>{children}</p>;
}

export default function WeddingsLanding({ city, market, path }: { city: WeddingCity; market: PricingMarket; path: string }) {
  const page = path.slice(1);
  const tiers = pricingTiers();
  const from = Math.min(...tiers.map((tier) => tier.price));
  const action = { id: FORM_ID, label: CTA_LABEL };
  const phone = SITE.phone.replace(/^\+1\s*/, "");
  // The hub album where the city has one (lib/ads/hub-work.ts); otherwise its
  // own photographs, leaving out the scene-setting "places" frames.
  const albumPhotos = city.work?.photos ?? [...city.heroes, ...city.interlude.filter((photo) => !PLACES.has(photo.src))];
  return <div className={`${original.page} ${original.dark} ${styles.clean}`} data-landing-theme="dark" data-landing-city={city.slug}>
    <a className={original.skip} href="#main">Skip to content</a>
    <InquiryFunnel city={city.name} page={page} collections={funnelCollections()} phone={phone} phoneE164={SITE.phoneE164} travelNote={market.travelNote}>
      <header className={styles.header}>
        <a className={styles.brand} href="#main" aria-label="Arman Arai, top of page">Arman Arai<span>Wedding photography</span></a>
        <nav aria-label="Page navigation"><a className={styles.navLink} href="#photographs">Photographs</a><a className={styles.navLink} href="#process-title">How it works</a><a className={styles.headerCta} href={`#${FORM_ID}`}>{CTA_LABEL}<span aria-hidden="true">↗</span></a></nav>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{city.name} wedding photography</p>
            <h1 id="hero-title">Your day.<br /><em>Beautifully kept.</em></h1>
            <p className={styles.heroLead}>Honest moments. A little direction.<br />Photographs that feel like the two of you.</p>
            <p className={styles.heroPrice}>Prices start from <strong>${from.toLocaleString("en-CA")}</strong><span>Canadian dollars · before tax</span></p>
            <a className={styles.primaryCta} href={`#${FORM_ID}`}>{CTA_LABEL}<span aria-hidden="true">↗</span></a>
            <p className={styles.heroMicro}>You don’t need a finished timeline. I’ll help you choose.</p>
          </div>
          <div className={`${original.heroArt} ${funnel.heroArt} ${styles.heroFrames}`}>
            <HeroConveyor photos={city.heroes}
              large={{ className: styles.heroPhoto, sizes: "(max-width: 760px) 88vw, (max-width: 1440px) 48vw, 680px", caption: city.coverage[0] }}
              small={{ className: styles.heroInset, sizes: "(max-width: 760px) 26vw, 16vw" }} />
          </div>
        </section>

        <section id="photographs" className={`${styles.section} ${styles.paper}`} aria-labelledby="photographs-title">
          <SectionLabel number="01">The photographs</SectionLabel>
          <div className={styles.workIntro}>
            <div><h2 id="photographs-title">See how your day<br /><em>could feel.</em></h2><p>{city.workLine} Explore the photographs at your own pace.</p><div className={styles.shortNotes}><p><strong>Real moments.</strong> Space to be with your people.</p><p><strong>Relaxed portraits.</strong> Clear direction when you need it.</p></div></div>
            <CityWorkAlbum photos={albumPhotos} place={city.name} />
          </div>
          <div className={styles.albumBlock}><h3>Explore complete wedding stories.</h3><p>Open an album to see the whole day.</p><AlbumBrowser albums={weddingAlbumsFor(city.albums)} label="Complete wedding stories" inquiryAction={action} /></div>
          <details className={styles.styleDetails}><summary>Explore five photography styles <span aria-hidden="true">+</span></summary><div className={styles.styleContent}><AlbumBrowser albums={stylesOfWork} label="Five complete portfolio collections" compact inquiryAction={action} /></div></details>
        </section>

        <section className={`${styles.section} ${styles.ink}`} aria-labelledby="about-title">
          <div className={styles.about}>
            <figure className={styles.portrait}><Image src={ARMAN.src} alt={ARMAN.alt} fill sizes="(max-width: 760px) 40vw, 32vw" quality={78} /></figure>
            <div className={styles.aboutHeading}><SectionLabel number="02">Your photographer</SectionLabel><h2 id="about-title">Hi, I’m Arman.<br /><em>I’m with you.</em></h2></div>
            <div className={styles.aboutBody}><p>I photograph your wedding from start to finish. I’ll guide the portraits, plan the family photographs, and leave room for the moments you couldn’t plan.</p><ul className={styles.promiseList}><li>A timeline built around your day.</li><li>Simple direction, so you can relax.</li><li>A preview of your photographs the next day.</li></ul><blockquote>“Only one person understood our vision the way we were imagining it.”<a href={proofSrc(8)} target="_blank" rel="noopener noreferrer">Samantha · Read the Google review ↗</a></blockquote></div>
          </div>
        </section>

        <section className={`${styles.section} ${styles.ink}`} aria-labelledby="reviews-title">
          <SectionLabel number="03">From the couples</SectionLabel><h2 id="reviews-title">The words<br /><em>that stay with me.</em></h2>
          <div className={styles.reviews}>{reviews.map(({ n, who, quote }) => { const proof = proofByN(n); return <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption><a className={styles.reviewProof} href={proofSrc(n)} target="_blank" rel="noopener noreferrer"><Image src={proofSrc(n)} alt={proof.alt} width={proof.w} height={proof.h} sizes="160px" quality={72} /><span>Read the original message ↗</span></a></figure>; })}</div>
        </section>

        <section className={`${styles.section} ${styles.paper}`} aria-labelledby="process-title">
          <SectionLabel number="04">How it works</SectionLabel><h2 id="process-title">A simple start.</h2>
          <ol className={styles.steps}><li><span>01</span><div><h3>Tell me about your day.</h3><p>Share your plans so far. I’ll email your personal guide with collection prices and coverage explained.</p></div></li><li><span>02</span><div><h3>We’ll work it out together.</h3><p>Ask questions by email, WhatsApp or a free 30-minute call. You don’t need to choose a collection first.</p></div></li><li><span>03</span><div><h3>Make it yours.</h3><p>Once you’re ready, we’ll confirm the details, secure your date and plan together.</p></div></li></ol>
        </section>

        <section id={FORM_ID} className={`${styles.section} ${styles.ink} ${styles.inquiry}`} aria-labelledby="inquiry-title">
          <div className={styles.inquiryCopy}><SectionLabel number="05">Your wedding starts here</SectionLabel><h2 id="inquiry-title">Tell me about<br /><em>your day.</em></h2><p>Share what you know so far. I’ll email your personal guide and help you choose the coverage that fits.</p><p className={styles.inquiryNote}>No finished timeline needed.<br />Ask questions by email, WhatsApp or a call.</p></div>
          <div className={styles.formPanel}><InquiryForm city={city.name} market={market.slug} page={path} /><p className={styles.messageLinks}>Rather message? <MessageLinks phone={phone} phoneE164={SITE.phoneE164} city={city.name} /></p></div>
        </section>
      </main>
      <BookingNavigation classes={styles} startingPrice={from} note="CAD before tax" form={action} />
    </InquiryFunnel>
    <footer className={styles.footer}><a href="#main" className={styles.brand}>Arman Arai<span>Wedding photography · {city.name}</span></a><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
    <Analytics />
  </div>;
}
