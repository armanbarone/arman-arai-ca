import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { COVERAGE_GUIDANCE, DAY_PLAN, PRIORITY_PLAN_PARTS, PRIORITY_PROMISE, readGuide, reviewsFor } from "@/lib/guide";
import { WEDDING_CITIES } from "@/lib/ads/city-wedding-pages";
import { BUDGET_OPTIONS, COVERAGE_OPTIONS, GUEST_OPTIONS, SETUP_OPTIONS, labelOf, longDate, pricingMarket, pricingTiers, recommendCollection } from "@/lib/ads/pricing-request";
import { SITE, TERMS, tierBySlug } from "@/lib/site";
import { proofSrc } from "@/lib/reviews";
import { weddingAlbumsFor } from "@/app/wedding-photography/landing-content";
import WeddingCalendar from "@/app/wedding-photography/wedding-calendar";
import { MessageLinks } from "@/app/wedding-photography/InquiryFunnel";
import guide from "./guide.module.css";

// A private guide rendered from the inquiry and the current collection facts.
// Do not imply personal review, date availability, or a confirmed day schedule.
// Keep the email confined to the existing calendar prefill.
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

  const when = record.weddingDate ? longDate(record.weddingDate)
    : record.weddingSeason && record.weddingSeason !== "Later than that" ? record.weddingSeason : "Still deciding";
  const coverage = labelOf(COVERAGE_OPTIONS, record.coverage) ?? "Not sure yet";
  const budget = labelOf(BUDGET_OPTIONS, record.budget) ?? "Not sure yet";
  const fit = recommendCollection(record.coverage, record.budget, record);
  const fitTier = tierBySlug(fit.slug)!;
  const reason = record.budget === "under-3000"
    ? "The suggested collection is above the budget range you selected. We can talk through coverage and budget on our call."
    : fit.basis === "coverage"
      ? `Based on the ${coverage.toLowerCase()} you selected. We’ll confirm the coverage together once your timeline is clearer.`
      : fit.basis === "budget"
        ? "A starting point based on your budget. We’ll talk through how much of the day you’d like covered."
        : "A starting point while your plans take shape. We’ll work out the right amount of coverage together.";
  const priorities = [...new Set(record.priorities ?? [])].filter((p) => PRIORITY_PROMISE[p]);
  const marked = new Set(priorities.flatMap((p) => PRIORITY_PLAN_PARTS[p] ?? []));
  const plan = DAY_PLAN[fit.slug];
  const albums = weddingAlbumsFor(city.albums);
  const reviews = reviewsFor(priorities);
  const hero = city.heroes[0];
  const phone = SITE.phone.replace(/^\+1\s*/, "");
  const details: [string, string][] = [
    ["Wedding date", when],
    ["Venue / location", record.location || "Still deciding"],
    ...(record.coverage !== "unsure" ? [["Coverage", coverage] as [string, string]] : []),
    ...(record.budget !== "unsure" ? [["Photography budget", budget] as [string, string]] : []),
    ...(labelOf(GUEST_OPTIONS, record.guests) ? [["Guests", labelOf(GUEST_OPTIONS, record.guests)!] as [string, string]] : []),
    ...(labelOf(SETUP_OPTIONS, record.setup) ? [["Ceremony & reception", labelOf(SETUP_OPTIONS, record.setup)!] as [string, string]] : []),
  ];
  const highlights = [fitTier.crew, fitTier.engagement, fitTier.film, ...(fitTier.album.includes("included") ? [fitTier.album] : [])];

  return <div className={guide.page} data-landing-theme="dark" data-landing-city={city.slug}>
    <a className={guide.skipLink} href="#guide-content">Skip to your guide</a>
    <header className={guide.header}>
      <span className={guide.wordmark}>Arman Arai<span>Wedding photography</span></span>
      <nav aria-label="Guide navigation">
        <a className={guide.navLink} href="#your-collection">Collections</a>
        <a className={guide.navLink} href="#wedding-galleries">Galleries</a>
        <a className={guide.headerCta} href="#book-a-call">Book a call <span aria-hidden="true">↗</span></a>
      </nav>
    </header>

    <main id="guide-content" className={guide.main}>
      <section className={guide.hero} aria-labelledby="hero-title">
        <div className={guide.heroCopy}>
          <p className={guide.eyebrow}>Your wedding guide · {city.name}</p>
          <h1 id="hero-title">{record.names}</h1>
          <p className={guide.heroLead}>Wedding photography,<br /><em>built around your day.</em></p>
          <p className={guide.intro}>Here are your collection options, prices and a starting point for your coverage. You don’t need to choose yet; we’ll work it out together.</p>
          <div className={guide.heroActions}>
            <a className={guide.button} href="#book-a-call">Book a free call <span aria-hidden="true">↗</span></a>
            <a className={guide.textLink} href="#your-collection">Explore your collection <span aria-hidden="true">↓</span></a>
          </div>
        </div>
        <figure className={guide.heroPhoto}>
          <Image src={hero.src} alt={hero.alt} fill priority quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 45vw, 552px" style={{ objectPosition: hero.position ?? "50% 50%" }} />
          <figcaption>Arman Arai · Wedding photography</figcaption>
        </figure>
      </section>

      <section className={guide.detailsPanel} aria-labelledby="details-title">
        <div className={guide.detailsHeading}>
          <h2 id="details-title">Your plans so far</h2>
          <a href={`mailto:${SITE.email}?subject=${encodeURIComponent("An update to our wedding inquiry")}`}>Update a detail <span aria-hidden="true">↗</span></a>
        </div>
        <dl className={guide.weddingDetails}>{details.map(([label, value]) => <div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
        {record.note ? <details className={guide.inquiryNote}><summary>Your note</summary><p>{record.note}</p></details> : null}
      </section>

      <section id="your-collection" className={guide.section} aria-labelledby="collection-title">
        <div className={guide.sectionHeading}>
          <div><p className={guide.eyebrow}>01 / Coverage & collections</p><h2 id="collection-title">A good place to start.</h2></div>
          <p>{reason}</p>
        </div>
        <article className={guide.featured} aria-labelledby="recommended-title">
          <div className={guide.collectionIntro}>
            <p className={guide.badge}>{fit.basis === "default" ? "A starting point" : "Suggested for your day"}</p>
            <h3 id="recommended-title">{fitTier.name}</h3>
            <p className={guide.coverage}>{fitTier.coverage}</p>
            <p className={guide.price}>{money(fitTier.price)}<span>Canadian dollars · before tax</span></p>
            <a className={guide.cardLink} href="#book-a-call">Talk through this collection <span aria-hidden="true">↗</span></a>
          </div>
          <div className={guide.collectionContents}>
            <p className={guide.coverageGuidance}>{COVERAGE_GUIDANCE[fit.slug]}</p>
            <dl className={guide.deliverables}>
              <div><dt>Photographs</dt><dd>{fitTier.images}</dd></div>
              <div><dt>Preview</dt><dd>{fitTier.preview}</dd></div>
              <div><dt>Delivery</dt><dd>{fitTier.delivery}</dd></div>
            </dl>
            <ul className={guide.highlights}>{highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            <details className={guide.includedDetails}>
              <summary>Everything included in {fitTier.name}</summary>
              <ul className={guide.fullIncludes}>{fitTier.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          </div>
        </article>
        <div className={guide.alternatives}>
          {pricingTiers().filter((tier) => tier.slug !== fit.slug).map((tier) => <article key={tier.slug} className={guide.alternative}>
            <p className={guide.alternativeLabel}>{tier.slug === fit.stepUp ? "Also worth considering" : "Another option"}</p>
            <details>
              <summary>
                <span className={guide.alternativeName}>{tier.name}<small>{tier.coverage}</small></span>
                <span className={guide.alternativePrice}>{money(tier.price)}</span>
              </summary>
              <p className={guide.alternativeCrew}>{COVERAGE_GUIDANCE[tier.slug]}</p>
              <p className={guide.alternativeCrew}>{tier.crew}</p>
              <ul className={guide.fullIncludes}>{tier.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            </details>
          </article>)}
        </div>
        <p className={guide.smallPrint}>All collection prices are in Canadian dollars, before tax. {market.travelNote} Open a collection to see the full inclusions.</p>
      </section>

      <section className={guide.section} aria-labelledby="approach-title">
        <div className={`${guide.sectionHeading} ${guide.simpleHeading}`}>
          <div><p className={guide.eyebrow}>02 / Photographing your day</p><h2 id="approach-title">{priorities.length ? "Your priorities." : "Your day’s coverage."}</h2></div>
        </div>
        {priorities.length ? <div className={guide.priorities}>{priorities.map((p) => {
          const item = PRIORITY_PROMISE[p];
          return <article key={p}><p className={guide.priorityLabel}>Your priority</p><h3>{item.title}</h3><p>{item.promise}</p></article>;
        })}</div> : null}
        <details className={guide.dayPlan}>
          <summary><span>A sample {fitTier.hours}-hour day<small>An outline to discuss, with timings still to be agreed.</small></span></summary>
          {plan.note ? <p className={guide.planNote}>{plan.note}</p> : null}
          <ol className={guide.plan}>{plan.rows.map((row) => <li key={row.part}>
            <div><h3>{row.part}</h3>{marked.has(row.part) ? <span className={guide.markTag}>Your priority</span> : null}</div>
            <p>{row.what}</p>
          </li>)}</ol>
        </details>
      </section>

      <section id="wedding-galleries" className={guide.section} aria-labelledby="albums-title">
        <div className={guide.sectionHeading}>
          <div><p className={guide.eyebrow}>03 / The photographs</p><h2 id="albums-title">See the whole story.</h2></div>
          <p>Explore three full wedding galleries to see the portraits, the people, and the moments in between.</p>
        </div>
        <div className={guide.albums}>
          {albums.map((album) => <a key={album.id} href={`/galleries/${album.id}`} target="_blank" rel="noopener noreferrer" className={guide.album}>
            <span className={guide.albumImage}><Image src={album.cover.src} alt={album.cover.alt} fill quality={85} sizes="(max-width: 760px) 90vw, (max-width: 1280px) 30vw, 368px" /></span>
            <span className={guide.albumTitle}>{album.title}<span aria-hidden="true">↗</span></span>
            <span className={guide.albumSubtitle}>{album.subtitle}</span>
            <span className={guide.albumLink}>View full gallery</span>
          </a>)}
        </div>
        <div className={guide.reviews} role="group" aria-label="Words from past couples">
          <p className={guide.eyebrow}>Words from past couples</p>
          <div className={guide.reviewsGrid}>{reviews.map(({ n, who, quote }) => <figure key={n}>
            <blockquote>“{quote}”</blockquote>
            <figcaption>{who}<a href={proofSrc(n)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${who}’s original message`}>Read their message <span aria-hidden="true">↗</span></a></figcaption>
          </figure>)}</div>
        </div>
      </section>

      <section id="book-a-call" className={`${guide.section} ${guide.booking}`} aria-labelledby="call-title">
        <div className={guide.bookingCopy}>
          <p className={guide.eyebrow}>04 / The next step</p>
          <h2 id="call-title">Let’s talk<br /><em>through your day.</em></h2>
          <p className={guide.callMeta}>Free · 30 minutes · Video call</p>
          <p>We’ll go over your plans, answer your questions, and work out which collection makes sense for you. There’s no obligation to book.</p>
          <ol className={guide.steps} aria-label="How booking works">
            <li><strong>Meet on a video call</strong><p>Choose a time in the calendar. You don’t need a finished timeline.</p></li>
            <li><strong>Make it official</strong><p>{TERMS.retainer}, with the signed contract.</p></li>
            <li><strong>Split the remaining balance</strong><p>{TERMS.balance.charAt(0).toUpperCase() + TERMS.balance.slice(1)}.</p></li>
          </ol>
          <p className={guide.messageOption}><strong>Prefer to write?</strong> Reply to my email, or message me on <MessageLinks phone={phone} phoneE164={SITE.phoneE164} city={city.name} />.</p>
        </div>
        <div className={guide.calendar}><WeddingCalendar page={`guide/${market.slug}`} theme="dark" classes={guide} prefill={{ name: record.names, email: record.email }} /></div>
      </section>
    </main>

    <footer className={guide.footer}>
      <span className={guide.footerBrand}>Arman Arai<span>Wedding photography</span></span>
      <div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div>
    </footer>
  </div>;
}
