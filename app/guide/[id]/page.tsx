import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { DAY_PLAN, readGuide } from "@/lib/guide";
import { WEDDING_CITIES } from "@/lib/ads/city-wedding-pages";
import { BUDGET_OPTIONS, COVERAGE_OPTIONS, STEP_UP_REASON, funnelCollections, longDate, pricingMarket, recommendCollection, weekdayOf } from "@/lib/ads/pricing-request";
import { SITE, TERMS, tierBySlug } from "@/lib/site";
import { proofByN, proofSrc } from "@/lib/reviews";
import { weddingAlbumsFor } from "@/app/wedding-photography/landing-content";
import HeroConveyor from "@/app/wedding-photography/HeroConveyor";
import WeddingCalendar from "@/app/wedding-photography/wedding-calendar";
import { MessageLinks } from "@/app/wedding-photography/InquiryFunnel";
import styles from "@/app/wedding-photography/vancouver.module.css";
import funnel from "@/app/wedding-photography/inquiry.module.css";
import guide from "./guide.module.css";

/* /guide/<id>: one couple's wedding guide, made when they sent the pricing
 * form and linked from the email that follows it (see lib/guide.ts).
 *
 * The newsletter idea the owner brought (2026-10-01): the pricing page gets
 * the inquiry, a guide made for that one couple turns it into a booking. So
 * everything here is theirs: their details as they typed them, the collection
 * that fits and the one above it, how their hours could run, photographs from
 * their city, three complete weddings, and one next step, the call.
 *
 * Private: noindex, never cached, no advertising tags (PublicTracking skips
 * /guide), and the couple's email is used only to prefill the calendar. Same
 * rules as the first email: nothing about a date being open, and no travel or
 * extra costs. */

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Your wedding guide | Arman Arai" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const REVIEWS = [
  { n: 10, who: "Brian", quote: "Every photo felt emotional and natural and full of life." },
  { n: 4, who: "Rachel", quote: "She said she never saw wedding photos this good all her life!" },
  { n: 1, who: "Justine", quote: "We are losing our mind over these previews." },
];

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await readGuide(id);
  const market = record ? pricingMarket(record.market) : undefined;
  const city = record ? WEDDING_CITIES.find((item) => item.slug === record.market) : undefined;
  if (!record || !market || !city) notFound();

  const when = record.weddingDate ? `${weekdayOf(record.weddingDate)}, ${longDate(record.weddingDate)}`
    : record.weddingSeason && record.weddingSeason !== "Later than that" ? record.weddingSeason : "";
  const coverage = COVERAGE_OPTIONS.find((option) => option.value === record.coverage)?.label ?? "Not sure yet";
  const budget = BUDGET_OPTIONS.find((option) => option.value === record.budget)?.label ?? "Not sure yet";
  const fit = recommendCollection(record.coverage, record.budget);
  const fitTier = tierBySlug(fit.slug)!;
  const stepUpTier = fit.stepUp ? tierBySlug(fit.stepUp) : undefined;
  const reason = fit.basis === "coverage" ? `It matches the ${coverage.toLowerCase()} you asked for.`
    : fit.basis === "budget" ? "It is the closest to the budget you gave."
      : "It is the collection most couples book, and the easiest place to start.";
  const plan = DAY_PLAN[fit.slug];
  const collections = funnelCollections();
  const albums = weddingAlbumsFor(city.albums);
  const phone = SITE.phone.replace(/^\+1\s*/, "");
  const page = `guide/${market.slug}`;
  const told: [string, string][] = [["Date", when || "To be decided"], ["Where", record.location], ["Coverage", coverage], ["Budget", budget]];
  const balance = TERMS.balance.charAt(0).toUpperCase() + TERMS.balance.slice(1);

  return <div className={`${styles.page} ${styles.dark} ${guide.page}`} data-landing-theme="dark" data-landing-city={city.slug}>
    <header className={styles.header}>
      <span className={styles.wordmark}>Arman Arai<span>WEDDING PHOTOGRAPHY</span></span>
      <nav aria-label="Page navigation"><a className={styles.headerCta} href="#book-a-call">Book a free call <span aria-hidden="true">↗</span></a></nav>
    </header>
    <main>
      <section className={funnel.hero} aria-labelledby="hero-title">
        <div className={funnel.heroTop}>
          <p className={`${styles.eyebrow} ${funnel.heroEyebrow}`}>Your wedding guide · {city.name}</p>
          <h1 id="hero-title" className={`${funnel.heroTitle} ${guide.title}`}>{record.names},{" "}<br /><em>your wedding day.</em></h1>
          <p className={styles.heroIntro}>Congratulations, and thank you for your inquiry. Everything for {when ? <strong className={guide.plain}>{when}</strong> : "your day"}{record.location ? <> at <strong className={guide.plain}>{record.location}</strong></> : null} is on this page: the collection that fits, how the day could run and photographs from {city.name}.</p>
        </div>
        <div className={`${styles.heroArt} ${funnel.heroArt}`}>
          <HeroConveyor
            photos={city.heroes}
            large={{ className: `${styles.heroImage} ${funnel.heroImage}`, sizes: "(max-width: 760px) 80vw, (max-width: 1600px) 38vw, 608px", caption: "A day you felt. Photographs you keep." }}
            small={{ className: styles.heroInset, sizes: "(max-width: 760px) 28vw, (max-width: 1600px) 14vw, 224px" }}
          />
          <span className={styles.heroSideNote}>Documentary feeling / Editorial eye</span>
        </div>
        <div className={`${funnel.formPanel} ${guide.toldPanel}`}>
          <p className={styles.eyebrow}>What you told me</p>
          <dl className={guide.told}>{told.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
          <p className={guide.changed}>Something changed? Reply to my email, or message me on <MessageLinks phone={phone} phoneE164={SITE.phoneE164} city={city.name} />.</p>
          <a className={`${styles.button} ${guide.cta}`} href="#book-a-call">Book your free video call <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <section className={guide.section} aria-labelledby="collection-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Your collection</p><h2 id="collection-title">{fitTier.name}.<br /><em>{money(fitTier.price)}.</em></h2></div>
          <p>{reason}{stepUpTier ? ` If you want a little more of the day, ${stepUpTier.name} is worth a look.` : ""}</p>
        </div>
        <div className={`${funnel.thanksCopy} ${guide.collections}`}>
          <ol className={funnel.pricing} aria-label="Your collections">
            {collections.map((collection) => {
              const best = collection.slug === fit.slug;
              const stepUp = collection.slug === fit.stepUp;
              return <li key={collection.slug} className={`${funnel.collection}${best ? ` ${funnel.best}` : ""}`}>
                {best && <p className={funnel.bestTag}>Best fit for you</p>}
                {stepUp && <p className={funnel.stepUpTag}>Worth a look · {STEP_UP_REASON[collection.slug]}</p>}
                <details open={best}>
                  <summary>
                    <span className={funnel.collectionName}>{collection.name}<small>{collection.hoursLabel}</small></span>
                    <span className={funnel.collectionPrice}>{money(collection.price)}</span>
                  </summary>
                  <ul>{collection.items.map((item) => <li key={item}>{item}</li>)}</ul>
                </details>
              </li>;
            })}
          </ol>
          <p className={funnel.pricingNote}>Canadian dollars before tax. Tap a collection to see everything in it.</p>
        </div>
      </section>

      <section className={guide.section} aria-labelledby="plan-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>Your {fitTier.hours} hours</p><h2 id="plan-title">How the day<br /><em>could run.</em></h2></div>
          <p>A shape, not a schedule. On our call we build your real timeline around {record.location || "your venue"}, your ceremony time and the people who matter most.</p>
        </div>
        {plan.note ? <p className={guide.planNote}>{plan.note}</p> : null}
        <ol className={guide.plan}>{plan.rows.map((row) => <li key={row.part}><strong>{row.part}</strong><span>{row.what}</span></li>)}</ol>
      </section>

      <section className={styles.interlude} aria-label={`Wedding photographs from ${city.name}`}>
        {city.interlude.map((photo) => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} fill quality={72} sizes="(max-width: 760px) 78vw, 33vw" /></figure>)}
      </section>

      <section className={guide.section} aria-labelledby="albums-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>The whole day</p><h2 id="albums-title">Three complete<br /><em>weddings.</em></h2></div>
          <p>Every photograph from three weddings, from the morning to the last dance, so you can see a whole day the way you would receive yours.</p>
        </div>
        <div className={guide.albums}>
          {albums.map((album) => <a key={album.id} href={`/galleries/${album.id}`} target="_blank" rel="noopener noreferrer" className={guide.album}>
            <span className={guide.albumImage}><Image src={album.cover.src} alt={album.cover.alt} fill quality={70} sizes="(max-width: 760px) 86vw, 30vw" /></span>
            <strong>{album.title}</strong><span>{album.subtitle}</span><span className={guide.albumLink}>See the whole day <span aria-hidden="true">↗</span></span>
          </a>)}
        </div>
      </section>

      <section className={styles.reviews} aria-labelledby="reviews-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>When the photographs arrive</p><h2 id="reviews-title">In their<br /><em>words.</em></h2></div><p>Tap a message to read the original.</p></div>
        <div className={styles.reviewsGrid}>
          {REVIEWS.map(({ n, who, quote }) => { const proof = proofByN(n); return <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption><a href={proofSrc(n)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${who}’s original message`}><Image src={proofSrc(n)} alt={proof.alt} width={proof.w} height={proof.h} quality={80} sizes="(max-width: 760px) 78vw, 25vw" /><span>Read the original message ↗</span></a></figure>; })}
        </div>
      </section>

      <section className={guide.section} aria-labelledby="steps-title">
        <div className={styles.sectionHeading}>
          <div><p className={styles.eyebrow}>How booking works</p><h2 id="steps-title">Three steps.<br /><em>No pressure.</em></h2></div>
          <p>There is no obligation to book after our call.</p>
        </div>
        <ol className={guide.steps}>
          <li><strong>A free 30-minute video call</strong><span>We talk through your day, the photographs you love and the collection that fits.</span></li>
          <li><strong>Your contract and deposit</strong><span>{TERMS.retainer}, with the signed contract.</span></li>
          <li><strong>The balance</strong><span>{balance}.</span></li>
        </ol>
      </section>

      <section id="book-a-call" className={`${guide.section} ${guide.booking}`} aria-labelledby="call-title">
        <div className={`${funnel.nextStep} ${guide.bookingCopy}`}>
          <p className={styles.eyebrow}>The next step</p>
          <h2 id="call-title" className={funnel.nextTitle}>A free 30-minute<br /><em>video call.</em></h2>
          <p>Pick a time that suits you. We’ll talk through your day and the collection that fits. No obligation.</p>
          <div className={funnel.noCall}><p><strong>Rather not do a call?</strong> That’s fine. Reply to my email, or message me on <MessageLinks phone={phone} phoneE164={SITE.phoneE164} city={city.name} />.</p></div>
        </div>
        <div className={guide.calendar}><WeddingCalendar page={page} theme="dark" classes={styles} prefill={{ name: record.names, email: record.email }} /></div>
      </section>
    </main>
    <footer className={styles.footer}><span className={styles.footerBrand}>Arman Arai<span>Wedding photography · {city.name}</span></span><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
  </div>;
}
