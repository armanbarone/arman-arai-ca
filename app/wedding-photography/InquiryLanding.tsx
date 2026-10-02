import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { ARMAN } from "@/lib/images";
import type { WeddingCity } from "@/lib/ads/city-wedding-pages";
import { CTA_LABEL, FORM_ID, funnelCollections, pricingTiers, tierItems, type PricingMarket } from "@/lib/ads/pricing-request";
import { SITE } from "@/lib/site";
import { autoReplyEnabled } from "@/lib/auto-reply";
import { proofByN, proofSrc } from "@/lib/reviews";
import { BookingNavigation } from "./wedding-calendar";
import AlbumBrowser from "./AlbumBrowser";
import HeroConveyor from "./HeroConveyor";
import { money, POSING_QUESTION, stylesOfWork, TIER_STRAP, weddingAlbumsFor } from "./landing-content";
import InquiryFunnel, { InquiryForm, MessageLinks, type FunnelCollection } from "./InquiryFunnel";
import styles from "./vancouver.module.css";
import funnel from "./inquiry.module.css";

/* The pricing-request ads page, one per market: /wedding-photography/<city>-pricing.
 *
 * Same photographs, albums and reviews as the city's other ads pages. ONE
 * action: the form under the headline. The header button, the sticky phone
 * bar and the closing button are that same action with the same label, and
 * nothing else on the page is a button. The collection cards carry no links
 * of their own: three equal buttons side by side is what the brief ruled out.
 * The calendar only appears once the form is sent (see InquiryFunnel). */

export default function InquiryLanding({ city, market }: { city: WeddingCity; market: PricingMarket }) {
  const page = `wedding-photography/${market.slug}-pricing`;
  const phone = SITE.phone.replace(/^\+1\s*/, "");
  const tiers = pricingTiers();
  const from = Math.min(...tiers.map((tier) => tier.price));
  const hourList = [...new Set(tiers.map((tier) => tier.hours))].sort((a, b) => a - b);
  const hours = `${hourList.slice(0, -1).join(", ")} or ${hourList.at(-1)}`;
  const collections: FunnelCollection[] = funnelCollections();
  const questions: string[][] = [
    // Read at build time, like every env var on a static page: adding the key
    // in Vercel needs a redeploy, which also switches this answer over.
    ["What happens after we send the form?", autoReplyEnabled()
      ? `Your pricing guide is ready the moment you send it: your collection, how your day could run and how I’ll photograph what matters most to you, on one page made for you. A note from me follows by email about 30 seconds later. From there, pick a time for a free 30-minute video call, reply to that email, or message me on WhatsApp or by text at ${phone}.`
      : `Your pricing guide is ready the moment you send it, on one page made for your day, and I reply personally the same day. From there, pick a time for a free 30-minute video call, or message me on WhatsApp or by text at ${phone}.`],
    [city.coverageQuestion, market.coverageAnswer],
    [city.planningQuestion, city.planningAnswer], POSING_QUESTION,
    ["Do we have to book a video call?", "No. The call is there if you’d like to meet before you decide. If you’d rather keep it to email, WhatsApp or text, that works too."],
    ["What is included, and what costs extra?", `Every collection includes photography by me, a 60-minute engagement session, planning, a full edited gallery with print permission, vertical social reels and film prints for your guests. Legacy adds a second photographer for four hours, a longer film and a printed album; Photo + Film runs 12 hours with a dedicated filmmaker and adds a printed album. Prices are in Canadian dollars before tax. ${market.travelNote}`],
    // These pages confirm nothing about a date, so this answer never says
    // "once we've confirmed availability".
    ["How do we secure our wedding date?", "Once you’ve chosen your collection and we’ve agreed the details, a signed contract and a non-refundable 30% deposit secure the date. Then 35% is due 60 days before the wedding, and the final 35% 30 days before. There’s no obligation to book after our call."],
  ];
  const weddingAlbums = weddingAlbumsFor(city.albums);
  const cta = <>{CTA_LABEL} <span aria-hidden="true">↗</span></>;

  return <div className={`${styles.page} ${styles.dark}`} data-landing-theme="dark" data-landing-city={city.slug}>
    <a className={styles.skip} href="#main">Skip to content</a>
    <InquiryFunnel collections={collections} city={city.name} page={page} phone={phone} phoneE164={SITE.phoneE164} travelNote={market.travelNote}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#main" aria-label="Arman Arai, top of page">Arman Arai<span>WEDDING PHOTOGRAPHY</span></a>
        <nav aria-label="Page navigation"><a className={styles.navLink} href="#albums">The photographs</a><a className={styles.navLink} href="#collections">Collections</a><a className={styles.headerCta} href={`#${FORM_ID}`}>{cta}</a></nav>
      </header>
      <main id="main">
        <section className={funnel.hero} aria-labelledby="hero-title">
          <div className={funnel.heroTop}>
            <p className={`${styles.eyebrow} ${funnel.heroEyebrow}`}>Photographed by Arman, start to finish.</p>
            <h1 id="hero-title" className={funnel.heroTitle}>{city.name} <br />wedding <br /><em>photography.</em></h1>
            <p className={styles.heroIntro}>You’ll get the photographs you’ve been picturing, and a few you didn’t know to ask for.</p>
            <p className={styles.starting}>Collections from <strong>{money(from)}</strong><span>{hours} hours · CAD before tax · {market.travelShort}</span></p>
          </div>
          <div className={`${styles.heroArt} ${funnel.heroArt}`}>
            <HeroConveyor
              photos={city.heroes}
              large={{ className: `${styles.heroImage} ${funnel.heroImage}`, sizes: "(max-width: 760px) 80vw, (max-width: 1600px) 38vw, 608px", caption: "A day you felt. Photographs you keep." }}
              small={{ className: styles.heroInset, sizes: "(max-width: 760px) 28vw, (max-width: 1600px) 14vw, 224px" }}
            />
            <span className={styles.heroSideNote}>Documentary feeling / Editorial eye</span>
          </div>
          <div id={FORM_ID} className={`${styles.dateCheckPanel} ${funnel.formPanel}`}>
            <InquiryForm city={city.name} market={market.slug} page={`/${page}`} />
            <p className={styles.directCall}>Rather message? <MessageLinks phone={phone} phoneE164={SITE.phoneE164} city={city.name} /></p>
          </div>
        </section>
        <div className={styles.factBar}><span>{city.coverage[0]}</span><span>{city.coverage[1]}</span><span>Photographed by Arman</span></div>

        <section className={styles.firstQuote} aria-label="A client’s words"><span className={styles.quoteMark} aria-hidden="true">“</span><blockquote>Only one person understood our vision<br className={styles.desktopBreak} /> the way we were imagining it.</blockquote><a href={proofSrc(8)} target="_blank" rel="noopener noreferrer">Samantha · Google review <span aria-hidden="true">↗</span></a></section>

        <section id="albums" className={styles.workSection} aria-labelledby="work-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The portfolio / 01</p><h2 id="work-title">See exactly<br /><em>what you’ll get.</em></h2></div><p>Five complete collections, from the quiet moments to the dance floor. Open any of them and look closely. Every gallery I deliver is held to this.</p></div>
          <AlbumBrowser albums={stylesOfWork} label="Five complete portfolio collections" compact />
          <p className={styles.albumHint}>Open an album to see every photograph. <span>Swipe to explore the collections →</span></p>
          <div className={styles.weddingHeading}><div><p className={styles.eyebrow}>Wedding stories / 02</p><h2>The whole day.<br /><em>All the way through.</em></h2></div><p>Three complete weddings, every photograph, from the first look to the last dance. The way you’ll receive yours.</p></div>
          <AlbumBrowser albums={weddingAlbums} label="Complete wedding stories" />
        </section>

        <section className={styles.about} aria-labelledby="about-title">
          <div className={styles.portraitWrap}><figure className={styles.portrait}><Image src={ARMAN.src} alt={ARMAN.alt} fill quality={78} sizes="(max-width: 760px) 85vw, 38vw" /></figure><span className={styles.signature}>See you on the other side of the camera.</span></div>
          <div className={styles.aboutCopy}><p className={styles.eyebrow}>Your photographer</p><h2 id="about-title">Hi, I’m Arman.<br /><em>You’re in good hands.</em></h2><p>You don’t need to arrive knowing how to pose. I’ll guide you, simply and clearly, and you’ll still look like yourselves.</p><p>I know where the good moments happen, and I’m already standing there when they do: the glance before the vows, your dad’s face at the first dance, the friend who cries first. I make time for the family photographs, then give you back to your people.</p><p>{city.about}</p></div>
        </section>

        <section id="collections" className={styles.collections} aria-labelledby="collections-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The collections / 03</p><h2 id="collections-title">Three collections.<br /><em>No surprises.</em></h2></div><p>One price each, with everything listed. Tell me about your day and I’ll tell you which one fits.</p></div>
          <div className={`${styles.priceGrid} ${styles.priceGridExpanded}`}>
            {tiers.map((tier) => <article key={tier.slug} className={tier.slug === "signature" ? styles.featuredPrice : styles.priceCard}>
              <div className={styles.tierHeader}><p>{tier.hours} hours of coverage</p><span>{TIER_STRAP[tier.slug] ?? tier.strap}</span></div>
              <h3>{tier.name}</h3><p className={styles.price}>{money(tier.price)}<span>CAD before tax</span></p>
              <ul>{tierItems(tier).map((item) => <li key={item}>{item}</li>)}</ul>
            </article>)}
          </div>
          <div className={styles.included}><h3>Always included.</h3><p>Photographed by me, start to finish. A preview of your photographs the next day. Film prints in your guests’ hands before the night is over. Vertical reels in your first week. A 60-minute engagement session, timeline and family-photo planning, a full edited gallery with print permission, and real film. Because waiting a month to see your own wedding is too long.</p></div>
          <p className={styles.travel}>{market.travelNote} All prices are in Canadian dollars before tax.</p>
        </section>

        <section className={styles.reviews} aria-labelledby="reviews-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>When the photographs arrive</p><h2 id="reviews-title">I’ll let them<br /><em>tell you.</em></h2></div><p>A few words from the people on the other side of the camera. Tap a message to read the original.</p></div><div className={styles.reviewsGrid}>
          {[{ n: 2, who: "Jennifer", quote: "We just went through the preview gallery and we are OBSESSED!" }, { n: 3, who: "Megan", quote: "I did not expect to get emotional over the album but here we are." }, { n: 5, who: "Brianna", quote: "It’s everything I ever wanted and more." }].map(({ n, who, quote }) => { const proof = proofByN(n); return <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption><a href={proofSrc(n)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${who}’s original message`}><Image src={proofSrc(n)} alt={proof.alt} width={proof.w} height={proof.h} quality={80} sizes="(max-width: 760px) 78vw, 25vw" /><span>Read the original message ↗</span></a></figure>; })}
        </div></section>

        <section className={styles.interlude} aria-label="Wedding photographs">{city.interlude.map((photo) => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} fill quality={72} sizes="(max-width: 760px) 50vw, 33vw" /></figure>)}</section>

        <section className={styles.faq} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>A few things before we meet</p><h2 id="faq-title">You might<br /><em>be wondering.</em></h2></div><div className={styles.questions}>{questions.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

        <section className={funnel.finalCta} aria-labelledby="final-title">
          <div className={styles.bookingCopy}><p className={styles.eyebrow}>Your {city.name} wedding starts here</p><h2 id="final-title">Tell me about your day.<br /><em>Get your pricing.</em></h2><p>Two quick steps, and your pricing guide is ready, made for your day.</p></div>
          <div className={styles.bookingCopy}><ol><li><span>01</span> Tell me your date and what matters most to you.</li><li><span>02</span> Get your pricing guide, built around your answers.</li><li><span>03</span> Pick a time for a free video call, or just reply by email, WhatsApp or text.</li></ol><a className={`${styles.button} ${funnel.finalButton}`} href={`#${FORM_ID}`}>{cta}</a></div>
        </section>
      </main>
      <BookingNavigation classes={styles} startingPrice={from} note={`Before tax · ${market.travelShort}`} form={{ id: FORM_ID, label: CTA_LABEL }} />
    </InquiryFunnel>
    <footer className={styles.footer}><a href="#main" className={styles.footerBrand}>Arman Arai<span>Wedding photography · {city.name}</span></a><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
    <Analytics />
  </div>;
}
