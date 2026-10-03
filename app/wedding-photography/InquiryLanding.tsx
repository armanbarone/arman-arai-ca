import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { ARMAN, allAt } from "@/lib/images";
import type { WeddingCity } from "@/lib/ads/city-wedding-pages";
import { CTA_LABEL, FORM_ID, funnelCollections, pricingTiers, tierItems, type PricingMarket } from "@/lib/ads/pricing-request";
import { SITE } from "@/lib/site";
import { autoReplyEnabled } from "@/lib/auto-reply";
import { proofByN, proofSrc } from "@/lib/reviews";
import { BookingNavigation } from "./wedding-calendar";
import AlbumBrowser from "./AlbumBrowser";
import HeroConveyor from "./HeroConveyor";
import PhotoFlipAlbum from "@/components/PhotoFlipAlbum";
import MobileAlbum from "@/components/MobileAlbum";
import { money, stylesOfWork, TIER_STRAP, weddingAlbumsFor } from "./landing-content";
import InquiryFunnel, { InquiryForm, MessageLinks, type FunnelCollection } from "./InquiryFunnel";
import styles from "./vancouver.module.css";
import funnel from "./inquiry.module.css";

/* The page tells one story, in the order a couple decides (owner, 2026-10-02:
 * "who this is for, who am I and how I can fulfill it ... why am I qualified
 * for this job, samples of similar jobs"): who it is for, who Arman is and why
 * he can be trusted with the day, complete weddings, the collections, what
 * couples say, and exactly how it works. The five style collections sit in
 * "Who this is for"; the local-knowledge section and the FAQ were removed
 * (owner, 2026-10-02: "irrelevant", "unnecessary"). Every claim is one the
 * site already makes: the about page and lib/site.ts. */
const FOR_WHO: [string, string][] = [
  ["You want it to look like it felt.", "Real moments, true colour, and portraits that still look like the two of you in twenty years."],
  ["You’d rather be with your people.", "Simple direction for the portraits, then I step back and photograph what happens."],
  ["Your family is part of the story.", "The family photographs are planned with you, name by name, so they take minutes and everyone gets back to the party."],
  ["You want it handled.", "A plan, a timeline, and a photographer who already knows where to stand."],
];
const QUALS: [string, string][] = [
  ["One lead photographer.", "Me, at every wedding, from the first call to the last photograph."],
  ["Planned before the day.", "A planning call, a family-photo plan and a timeline built around your venue."],
  ["Ready for the weather.", "A backup plan that was scouted rather than improvised."],
  ["Back fast.", "A preview the next day, reels in your first week and the full gallery in three weeks."],
];

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
  const weddingAlbums = weddingAlbumsFor(city.albums);
  const how: [string, string][] = [
    ["Tell me about your day", autoReplyEnabled()
      ? "Two quick steps on this page. Your pricing guide is ready the moment you send it, and a note from me follows about 30 seconds later, including whether I’m available on your date."
      : "Two quick steps on this page. Your pricing guide is ready the moment you send it, and I reply personally the same day."],
    ["A free 30-minute call", "We talk through your day, the photographs you love and the collection that fits. No obligation."],
    ["Secure your date", "A signed contract and a non-refundable 30% deposit. Then 35% is due 60 days before the wedding, and the final 35% 30 days before."],
    ["Plan it together", "Your engagement session, a planning call, the family-photo plan and a timeline built around your venue."],
    ["Your wedding day", "I arrive early, guide you when it helps, and photograph what happens."],
    ["Your photographs", "A preview the next day, reels in your first week and the full gallery in three weeks."],
  ];
  const cta = <>{CTA_LABEL} <span aria-hidden="true">↗</span></>;

  return <div className={`${styles.page} ${styles.dark}`} data-landing-theme="dark" data-landing-city={city.slug}>
    <a className={styles.skip} href="#main">Skip to content</a>
    <InquiryFunnel collections={collections} city={city.name} page={page} phone={phone} phoneE164={SITE.phoneE164} travelNote={market.travelNote}>
      <header className={styles.header}>
        <a className={styles.wordmark} href="#main" aria-label="Arman Arai, top of page">Arman Arai<span>WEDDING PHOTOGRAPHY</span></a>
        <nav aria-label="Page navigation"><a className={styles.navLink} href="#albums">The photographs</a><a className={styles.navLink} href="#collections">Collections</a><a className={styles.headerCta} href={`#${FORM_ID}`}>{cta}</a></nav>
      </header>
      {/* funnel.story alternates the section backgrounds (owner, 2026-10-02:
          no two sections in a row on the same background). */}
      <main id="main" className={funnel.story}>
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

        <section className={funnel.forWho} aria-labelledby="for-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Who this is for</p><h2 id="for-title">Couples who want<br /><em>to be in their wedding.</em></h2></div><p>You’re planning a {city.name} wedding, and you want the day to feel like yours from the first look to the last dance.</p></div>
          <div className={funnel.forGrid}>{FOR_WHO.map(([title, body]) => <article key={title}><h3>{title}</h3><p>{body}</p></article>)}</div>
          <div className={`${styles.weddingHeading} ${funnel.styleHeading}`}><div><p className={styles.eyebrow}>Find your style</p><h2>Five ways<br /><em>to tell it.</em></h2></div><p>Pick the one that feels like the two of you. Open any collection and look closely. Every gallery I deliver is held to this.</p></div>
          <AlbumBrowser albums={stylesOfWork} label="Five complete portfolio collections" compact />
          <p className={styles.albumHint}>Open an album to see every photograph. <span>Swipe to explore the collections →</span></p>
          <p className={funnel.forClose}>If that sounds like the two of you, you’re in the right place.</p>
        </section>

        <section className={styles.about} aria-labelledby="about-title">
          <div className={styles.portraitWrap}><figure className={styles.portrait}><Image src={ARMAN.src} alt={ARMAN.alt} fill quality={78} sizes="(max-width: 760px) 85vw, 38vw" /></figure><span className={styles.signature}>See you on the other side of the camera.</span></div>
          <div className={styles.aboutCopy}>
            <p className={styles.eyebrow}>Who I am</p>
            <h2 id="about-title">Hi, I’m Arman.<br /><em>You’re in good hands.</em></h2>
            <p>A wedding is the last ceremony most people will ever take part in, and I photograph it as one. I arrive early, I stay quiet, and I stand where the light and the meaning meet.</p>
            <p>You don’t need to know how to pose. I’ll give you clear, simple direction for the twenty minutes where it helps, then give you back to your people. {city.about}</p>
            <ul className={funnel.quals}>{QUALS.map(([title, body]) => <li key={title}><strong>{title}</strong> {body}</li>)}</ul>
            <blockquote className={funnel.aboutQuote}>“Only one person understood our vision the way we were imagining it.”<a href={proofSrc(8)} target="_blank" rel="noopener noreferrer">Samantha · Google review <span aria-hidden="true">↗</span></a></blockquote>
          </div>
        </section>

        {city.work ? <section className={funnel.work} aria-labelledby="samples-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>{city.work.eyebrow}</p><h2 id="samples-title">{city.work.title[0]}<br /><em>{city.work.title[1]}</em></h2></div><p>{city.work.lead}</p></div>
          {/* The same album the armanarai.com hubs and /portfolio use: a book
              that turns on desktop, one photo at a time with swipe on phones.
              Each paints only the page or pages open, so the album costs a
              couple of images at a time, not all of them. */}
          <div className={funnel.albumDesk}><PhotoFlipAlbum albumTitle={city.work.album} albumSubtitle="A Wedding Collection" albumDate={`Arman Arai · ${city.name}`} images={allAt(city.work.photos, 1200)} /></div>
          <div className={funnel.albumPhone}><MobileAlbum albumTitle={city.work.album} albumSubtitle="A Wedding Collection" albumDate={`Arman Arai · ${city.name}`} images={allAt(city.work.photos, 1000)} /></div>
        </section> : null}

        <section id="albums" className={styles.workSection} aria-labelledby="work-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>Weddings like yours</p><h2 id="work-title">Complete weddings.<br /><em>Every photograph.</em></h2></div><p>Three whole wedding days, from the first look to the last dance, the way the couples received them. Yours arrives the same way.</p></div>
          <AlbumBrowser albums={weddingAlbums} label="Complete wedding stories" />
        </section>

        {city.work ? null : <section className={styles.interlude} aria-label={`Wedding photographs from ${city.name}`}>{city.interlude.map((photo) => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} fill quality={72} sizes="(max-width: 760px) 50vw, 33vw" /></figure>)}</section>}

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


        <section className={funnel.how} aria-labelledby="how-title">
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>How it works</p><h2 id="how-title">From hello<br /><em>to your gallery.</em></h2></div><p>No guesswork at any step. Here’s exactly what happens.</p></div>
          <ol className={funnel.howSteps}>{how.map(([title, body], i) => <li key={title}><span>{String(i + 1).padStart(2, "0")}</span><strong>{title}</strong><p>{body}</p></li>)}</ol>
        </section>


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
