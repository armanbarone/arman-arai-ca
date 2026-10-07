import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { COVERAGE_GUIDANCE, DAY_PLAN, PRIORITY_PROMISE, readGuide, reviewsFor } from "@/lib/guide";
import { GUIDE_HELP, GUIDE_IMAGES, GUIDE_PORTFOLIO_ALBUMS, GUIDE_TIER_NOTES } from "@/lib/guide-content";
import { WEDDING_CITIES } from "@/lib/ads/city-wedding-pages";
import { BUDGET_OPTIONS, COVERAGE_OPTIONS, GUEST_OPTIONS, SETUP_OPTIONS, labelOf, longDate, pricingMarket, pricingTiers, recommendCollection } from "@/lib/ads/pricing-request";
import { SITE, TERMS, tierBySlug } from "@/lib/site";
import { proofSrc } from "@/lib/reviews";
import { weddingAlbumsFor } from "@/app/wedding-photography/landing-content";
import AlbumBrowser from "@/app/wedding-photography/AlbumBrowser";
import WeddingCalendar from "@/app/wedding-photography/wedding-calendar";
import guide from "./guide.module.css";

// Private, factual and useful even when first contact supplied only names and email.
// The email is used only for calendar prefill, never printed or sent to analytics.
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: { absolute: "Your wedding guide | Arman Arai" },
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};
const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;

export default async function GuidePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await readGuide(id);
  const market = record ? pricingMarket(record.market) : undefined;
  const city = record ? WEDDING_CITIES.find((item) => item.slug === record.market) : undefined;
  if (!record || !market || !city) notFound();

  const tiers = pricingTiers();
  const fit = recommendCollection(record.coverage, record.budget, record);
  const fitTier = tierBySlug(fit.slug)!;
  const coverage = labelOf(COVERAGE_OPTIONS, record.coverage);
  const budget = labelOf(BUDGET_OPTIONS, record.budget);
  const when = record.weddingDate ? longDate(record.weddingDate)
    : record.weddingSeason && record.weddingSeason !== "Later than that" ? record.weddingSeason : undefined;
  const details: [string, string][] = [
    ...(when ? [["Wedding date", when] as [string, string]] : []),
    ...(record.location ? [["Venue / area", record.location] as [string, string]] : []),
    ...(coverage && record.coverage !== "unsure" ? [["Coverage", coverage] as [string, string]] : []),
    ...(budget && record.budget !== "unsure" ? [["Photography budget", budget] as [string, string]] : []),
    ...(labelOf(GUEST_OPTIONS, record.guests) ? [["Guests", labelOf(GUEST_OPTIONS, record.guests)!] as [string, string]] : []),
    ...(labelOf(SETUP_OPTIONS, record.setup) ? [["Ceremony & reception", labelOf(SETUP_OPTIONS, record.setup)!] as [string, string]] : []),
  ];
  const priorities = [...new Set(record.priorities ?? [])].filter((p) => PRIORITY_PROMISE[p]);
  const reviews = reviewsFor(priorities);
  const albums = weddingAlbumsFor(city.albums);
  const hero = city.heroes[0];
  const email = `mailto:${SITE.email}?subject=${encodeURIComponent(`Our wedding photography · ${record.names}`)}`;
  const whatsapp = `https://wa.me/${SITE.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(`Hi Arman, it’s ${record.names}. We’d like to talk through our wedding photography.`)}`;
  const suggestion = fit.basis === "coverage" ? `${fitTier.name} is a starting point based on the coverage you previously selected. We’ll check it against your timings together.`
    : fit.basis === "budget" ? `${fitTier.name} is a starting point based on the budget you previously shared. We’ll work out the coverage together.` : undefined;

  return <div className={guide.page} data-landing-theme="dark" data-landing-city={city.slug}>
    <a className={guide.skipLink} href="#guide-content">Skip to your guide</a>
    <header className={guide.header}>
      <span className={guide.wordmark}>Arman Arai<span>Wedding photography</span></span>
      <nav aria-label="Guide navigation">
        <a className={guide.navLink} href="#how-i-capture">The photographs</a>
        <a className={guide.navLink} href="#your-collection">Collections</a>
        <a className={guide.headerCta} href="#next-step">Let’s talk <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <main id="guide-content" className={guide.main}>
      <section className={guide.hero} aria-labelledby="hero-title">
        <div className={guide.heroCopy}>
          <p className={guide.eyebrow}>Your wedding guide · {city.name}</p>
          <h1 id="hero-title">{record.names}</h1>
          <p className={guide.heroLead}>You don’t need<br /><em>a finished plan.</em></p>
          <p className={guide.intro}>Here’s how I’ll photograph your day, what the collections include, and how we can work out the coverage together. Take a look, then tell me what you have in mind.</p>
          <div className={guide.heroActions}>
            <a className={guide.button} href="#how-i-capture">Explore the photographs <span aria-hidden="true">↓</span></a>
            <a className={guide.textLink} href="#your-collection">Prices & coverage <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <figure className={guide.heroPhoto}>
          <Image src={hero.src} alt={hero.alt} fill priority quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 45vw, 552px" style={{ objectPosition: hero.position ?? "50% 50%" }} />
          <figcaption>Arman Arai · Wedding photography</figcaption>
        </figure>
      </section>

      {details.length || record.note ? <details className={guide.plans}>
        <summary>Your plans so far <span>You can add to these whenever you’re ready.</span></summary>
        {details.length ? <dl className={guide.weddingDetails}>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl> : null}
        {record.note ? <p className={guide.inquiryNote}>{record.note}</p> : null}
      </details> : null}

      <section id="how-i-capture" className={guide.section} aria-labelledby="ways-title">
        <div className={guide.sectionHeading}>
          <div><p className={guide.eyebrow}>01 / How I photograph a wedding</p><h2 id="ways-title">Five ways of<br /><em>seeing your day.</em></h2></div>
          <p>Quiet moments, carefully made portraits, the warmth of film. These are the five complete albums from my portfolio. You don’t need to choose one style; we’ll talk about the photographs you’re drawn to.</p>
        </div>
        <AlbumBrowser albums={GUIDE_PORTFOLIO_ALBUMS} label="Five ways I capture a wedding day" compact classes={guide} imageQuality={85} inquiryAction={{ id: "next-step", label: "Talk through your plans", headingId: "next-title" }} />
      </section>

      <section id="help-with-your-day" className={`${guide.section} ${guide.helpSection}`} aria-labelledby="help-title">
        <figure className={guide.featurePhoto}><Image src={GUIDE_IMAGES.help.src} alt={GUIDE_IMAGES.help.alt} fill quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 45vw, 552px" /></figure>
        <div className={guide.helpCopy}>
          <p className={guide.eyebrow}>02 / The help you can expect</p><h2 id="help-title">Room to enjoy<br /><em>your day.</em></h2>
          <div className={guide.helpGrid}>{GUIDE_HELP.map((item) => <article key={item.title}><h3>{item.title}</h3><p>{item.text}</p></article>)}</div>
          {priorities.length ? <details className={guide.priorityDetails}><summary>The priorities you shared</summary><div className={guide.priorities}>{priorities.map((key) => <article key={key}><h3>{PRIORITY_PROMISE[key].title}</h3><p>{PRIORITY_PROMISE[key].promise}</p></article>)}</div></details> : null}
        </div>
      </section>

      <section id="your-collection" className={guide.section} aria-labelledby="collection-title">
        <div className={guide.sectionHeading}>
          <div><p className={guide.eyebrow}>03 / Collections & prices</p><h2 id="collection-title">Three collections.<br /><em>We’ll find what fits.</em></h2></div>
          <p>Photography, an engagement session and a film in every collection. We’ll choose the hours together.</p>
        </div>
        {suggestion ? <p className={guide.suggestion}>{suggestion}</p> : null}
        {record.budget === "under-3000" ? <p className={guide.suggestion}>The collections start above the budget range you previously shared. We can talk through your plans and the prices before you make a decision.</p> : null}
        <div className={guide.collectionGrid}>{tiers.map((tier) => <article key={tier.slug} className={guide.collectionCard} aria-labelledby={`collection-${tier.slug}`}>
          <figure className={guide.collectionPhoto}><span className={guide.collectionPhotoFrame}><Image src={GUIDE_IMAGES.collections[tier.slug].src} alt={GUIDE_IMAGES.collections[tier.slug].alt} fill quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1000px) 40vw, (max-width: 1280px) 30vw, 368px" /></span></figure>
          <div className={guide.collectionBody}>
          <div className={guide.collectionTop}>
            {fit.basis !== "default" && tier.slug === fit.slug ? <p className={guide.badge}>Starting point from your inquiry</p> : null}
            <h3 id={`collection-${tier.slug}`}>{tier.name}</h3>
            <p className={guide.coverage}>{tier.coverage}</p>
            <p className={guide.price}>{money(tier.price)}</p>
          </div>
          <p className={guide.tierNote}>{GUIDE_TIER_NOTES[tier.slug]}</p>
          <details className={guide.includedDetails}><summary>Everything included in {tier.name}</summary>
            <p className={guide.coverageGuidance}>{COVERAGE_GUIDANCE[tier.slug]}</p>
            <ul className={guide.fullIncludes}>{tier.includes.map((item) => <li key={item}>{item}</li>)}</ul>
          </details>
          </div>
        </article>)}</div>
        <p className={guide.smallPrint}>Canadian dollars, before tax. {market.travelNote}</p>
        <p className={guide.collectionNote}>You don’t need to choose yet. <a href="#next-step">Let’s work it out together <span aria-hidden="true">↗</span></a></p>
      </section>

      <section id="choosing-your-hours" className={guide.section} aria-labelledby="coverage-title">
        <figure className={guide.coveragePhoto}><Image src={GUIDE_IMAGES.coverage.src} alt={GUIDE_IMAGES.coverage.alt} fill quality={85} sizes="(max-width: 1280px) 90vw, 1160px" /></figure>
        <div className={guide.coverageIntro}>
          <div><p className={guide.eyebrow}>04 / Choosing the hours</p><h2 id="coverage-title">Start with the moments.<br /><em>We’ll work out the hours.</em></h2></div>
          <div className={guide.coverageCopy}>
          <p>From preparations to the dance floor, tell me what you want photographed. We’ll leave room for portraits, family and travel between venues.</p>
          <details className={guide.dayPlans}>
          <summary>Explore sample 8, 10 and 12-hour days</summary>
          <p className={guide.planIntro}>Examples, not a fixed timeline. Your plans will shape the day.</p>
          {tiers.map((tier) => <details key={tier.slug} className={guide.dayPlan}>
            <summary><span>{tier.name}<small>A sample {tier.hours}-hour day</small></span></summary>
            {DAY_PLAN[tier.slug].note ? <p className={guide.planNote}>{DAY_PLAN[tier.slug].note}</p> : null}
            <ol className={guide.plan}>{DAY_PLAN[tier.slug].rows.map((row) => <li key={row.part}><h3>{row.part}</h3><p>{row.what}</p></li>)}</ol>
          </details>)}
          </details>
          </div>
        </div>
      </section>

      <section id="wedding-galleries" className={guide.section} aria-labelledby="albums-title">
        <div className={guide.sectionHeading}>
          <div><p className={guide.eyebrow}>05 / Complete wedding stories</p><h2 id="albums-title">See a whole day<br /><em>come together.</em></h2></div>
          <p>Three complete weddings. The portraits, the people and everything in between.</p>
        </div>
        <div className={guide.albums}>{albums.map((album) => <a key={album.id} href={`/galleries/${album.id}`} target="_blank" rel="noopener noreferrer" className={guide.album}>
          <span className={guide.storyImage}><Image src={album.cover.src} alt={album.cover.alt} fill quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 30vw, 368px" /></span>
          <span className={guide.storyTitle}>{album.title}<span aria-hidden="true">↗</span></span>
          <span className={guide.storySubtitle}>{album.subtitle}</span>
          <span className={guide.storyLink}>View full wedding</span>
        </a>)}</div>
        <div className={guide.reviews} role="group" aria-label="Words from past couples">
          <p className={guide.eyebrow}>Words from past couples</p>
          <div className={guide.reviewsGrid}>{reviews.map(({ n, who, quote }) => <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}<a href={proofSrc(n)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${who}’s original message`}>Read their message <span aria-hidden="true">↗</span></a></figcaption></figure>)}</div>
        </div>
      </section>

      <section id="next-step" className={`${guide.section} ${guide.nextStep}`} aria-labelledby="next-title">
        <figure className={guide.contactPhoto}><Image src={GUIDE_IMAGES.contact.src} alt={GUIDE_IMAGES.contact.alt} fill quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 45vw, 552px" /></figure>
        <div className={guide.nextCopy}>
          <p className={guide.eyebrow}>06 / Let’s work it out together</p>
          <h2 id="next-title" tabIndex={-1}>Tell me what’s<br /><em>on your mind.</em></h2>
          <p>A rough plan, a photograph you love, a question. Reply to my email or send me a message and we’ll take it from there.</p>
          <div className={guide.contactActions}><a className={guide.button} href={email}>Email Arman <span aria-hidden="true">↗</span></a><a className={guide.outlineButton} href={whatsapp} target="_blank" rel="noopener noreferrer">Message on WhatsApp <span aria-hidden="true">↗</span></a></div>
          <p className={guide.contactNote}>Prefer to talk? The call is optional.</p>
          <details className={guide.bookingDetails}><summary>How booking works</summary>
          <ol className={guide.bookingSteps} aria-label="How booking works">
            <li><strong>Talk through your plans</strong><p>Email, WhatsApp or a call. We’ll work out the coverage together.</p></li>
            <li><strong>Confirm the details</strong><p>Agree the collection, timings and date.</p></li>
            <li><strong>Make it official</strong><p>{TERMS.retainer}, with the signed contract.</p></li>
          </ol>
          </details>
          <details className={guide.paymentDetails}><summary>How the payments work</summary><p>{TERMS.schedule}</p></details>
        </div>
        <details id="book-a-call" className={guide.callDetails}>
          <summary><span>Prefer a conversation?<small>Book a free 30-minute video call · No obligation</small></span></summary>
          <div className={guide.calendar}><WeddingCalendar page={`guide/${market.slug}`} theme="dark" classes={guide} prefill={{ name: record.names, email: record.email }} /></div>
        </details>
      </section>
    </main>

    <footer className={guide.footer}><span className={guide.footerBrand}>Arman Arai<span>Wedding photography</span></span><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
  </div>;
}
