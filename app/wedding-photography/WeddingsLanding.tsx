import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import type { Metadata } from "next";
import { ARMAN, CITY_PHOTOS } from "@/lib/images";
import { SITE } from "@/lib/site";
import type { WeddingCity } from "@/lib/ads/city-wedding-pages";
import { cityWeddingMetadata } from "@/lib/ads/city-wedding-metadata";
import { CTA_LABEL, FORM_ID, funnelCollections, pricingTiers, tierItems, type PricingMarket } from "@/lib/ads/pricing-request";
import { proofByN, proofSrc } from "@/lib/reviews";
import AlbumBrowser from "./AlbumBrowser";
import HeroConveyor from "./HeroConveyor";
import InquiryFunnel, { InquiryForm, MessageLinks } from "./InquiryFunnel";
import { BookingNavigation } from "./wedding-calendar";
import { money, stylesOfWork, weddingAlbumsFor } from "./landing-content";
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
    description: `${city.name} wedding photography by Arman Arai. Explore the photographs, compare three collections from C$3,000, and get a pricing guide for your day.`,
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
        <nav aria-label="Page navigation"><a className={styles.navLink} href="#photographs">Photographs</a><a className={styles.navLink} href="#collections">Collections</a><a className={styles.headerCta} href={`#${FORM_ID}`}>{CTA_LABEL}<span aria-hidden="true">↗</span></a></nav>
      </header>
      <main id="main">
        <section className={styles.hero} aria-labelledby="hero-title">
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{city.name} wedding photography</p>
            <h1 id="hero-title">Your day.<br /><em>Beautifully kept.</em></h1>
            <p className={styles.heroLead}>Honest moments. A little direction.<br />Photographs that feel like the two of you.</p>
            <p className={styles.heroPrice}>Collections from <strong>{money(from)}</strong><span>8, 10 or 12 hours · CAD before tax</span></p>
            <a className={styles.primaryCta} href={`#${FORM_ID}`}>{CTA_LABEL}<span aria-hidden="true">↗</span></a>
            <p className={styles.heroMicro}>An engagement session in every collection.</p>
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

        <section id="collections" className={`${styles.section} ${styles.paper}`} aria-labelledby="collections-title">
          <SectionLabel number="03">The collections</SectionLabel>
          <div className={styles.headingRow}><h2 id="collections-title">Your coverage.<br /><em>Your collection.</em></h2><p>Three clear options. The same care in every one.</p></div>
          <p className={styles.includedLine}>Every collection includes a 60-minute engagement session, real film, next-day previews and vertical reels in your first week.</p>
          <div className={styles.priceGrid}>{tiers.map((tier) => <article key={tier.slug} className={styles.priceCard}>
            <div className={styles.priceTop}><p>{tier.hours} hours of coverage</p><h3>{tier.name}</h3><p className={styles.price}>{money(tier.price)}<span>CAD before tax</span></p></div>
            <ul className={styles.priceHighlights}><li>{tier.images}</li><li>{tier.film.split(",")[0].replace(" shot by a dedicated filmmaker", "")}</li><li>{tier.crew}</li></ul>
            <details className={styles.inclusions}><summary>Everything included <span aria-hidden="true">+</span></summary><ul>{tierItems(tier).map((item) => <li key={item}>{item}</li>)}</ul></details>
          </article>)}</div>
          <details className={styles.sharedExtras}><summary>Also included in every collection <span aria-hidden="true">+</span></summary><p>Film prints for your guests on the night, timeline and family-photo planning, and a full edited gallery with print permission.</p></details>
          <p className={styles.travel}>{market.travelNote}</p>
          <div className={styles.collectionCta}><a className={styles.primaryCta} href={`#${FORM_ID}`}>{CTA_LABEL}<span aria-hidden="true">↗</span></a><p>Tell me about your day. I’ll help you choose.</p></div>
        </section>

        <section className={`${styles.section} ${styles.ink}`} aria-labelledby="reviews-title">
          <SectionLabel number="04">From the couples</SectionLabel><h2 id="reviews-title">The words<br /><em>that stay with me.</em></h2>
          <div className={styles.reviews}>{reviews.map(({ n, who, quote }) => { const proof = proofByN(n); return <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption><a className={styles.reviewProof} href={proofSrc(n)} target="_blank" rel="noopener noreferrer"><Image src={proofSrc(n)} alt={proof.alt} width={proof.w} height={proof.h} sizes="160px" quality={72} /><span>Read the original message ↗</span></a></figure>; })}</div>
        </section>

        <section className={`${styles.section} ${styles.paper}`} aria-labelledby="process-title">
          <SectionLabel number="05">How it works</SectionLabel><h2 id="process-title">A simple start.</h2>
          <ol className={styles.steps}><li><span>01</span><div><h3>Tell me about your day.</h3><p>Send the two-step form. Your personal pricing guide is ready when you submit.</p></div></li><li><span>02</span><div><h3>Choose what fits.</h3><p>Talk it through over email, WhatsApp or a free 30-minute call. The call is optional.</p></div></li><li><span>03</span><div><h3>Make it yours.</h3><p>A signed contract and a 30% non-refundable deposit secure your booking. Then we plan together.</p></div></li></ol>
          <p className={styles.paymentNote}>The remaining payments: 35% at 60 days before your wedding, and 35% at 30 days before.</p>
        </section>

        <section id={FORM_ID} className={`${styles.section} ${styles.ink} ${styles.inquiry}`} aria-labelledby="inquiry-title">
          <div className={styles.inquiryCopy}><SectionLabel number="06">Your wedding starts here</SectionLabel><h2 id="inquiry-title">Tell me about<br /><em>your day.</em></h2><p>Two quick steps. A pricing guide made for your wedding.</p><p className={styles.inquiryNote}>You can decide how we talk next.<br />Email, WhatsApp or a call.</p></div>
          <div className={styles.formPanel}><InquiryForm city={city.name} market={market.slug} page={path} /><p className={styles.messageLinks}>Rather message? <MessageLinks phone={phone} phoneE164={SITE.phoneE164} city={city.name} /></p></div>
        </section>
      </main>
      <BookingNavigation classes={styles} startingPrice={from} note="CAD before tax" form={action} />
    </InquiryFunnel>
    <footer className={styles.footer}><a href="#main" className={styles.brand}>Arman Arai<span>Wedding photography · {city.name}</span></a><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
    <Analytics />
  </div>;
}
