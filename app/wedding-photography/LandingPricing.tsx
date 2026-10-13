import { CTA_LABEL, FORM_ID, pricingTiers, type PricingMarket } from "@/lib/ads/pricing-request";
import styles from "./vancouver-weddings/landing.module.css";

export default function LandingPricing({ market }: { market: PricingMarket }) {
  return <section id="collections" className={`${styles.section} ${styles.ink}`} aria-labelledby="collections-title">
    <p className={styles.sectionLabel}><span>04</span>The collections</p>
    <h2 id="collections-title">Choose your<br /><em>coverage.</em></h2>
    <p className={styles.includedLine}>Three collections, at the same price across Canada. All prices are in Canadian dollars, before sales tax. Optional add-ons are extra.</p>
    <div className={styles.priceGrid}>
      {pricingTiers().map((tier) => <article key={tier.slug} className={styles.priceCard} aria-labelledby={`collection-${tier.slug}`}>
        <div className={styles.priceTop}>
          <p>{tier.strap}</p>
          <h3 id={`collection-${tier.slug}`}>{tier.name}</h3>
          <p className={styles.price}>C${tier.price.toLocaleString("en-CA")}<span>{tier.hours} continuous hours</span></p>
        </div>
        <ul className={styles.priceHighlights} aria-label={`${tier.name} includes`}>
          {tier.includes.map((item) => <li key={item}>{item}</li>)}
        </ul>
      </article>)}
    </div>
    <p className={styles.travel}>{market.travelNote}</p>
    <p className={styles.paymentNote}><a className={styles.pricingLink} href="/pricing">Full pricing, travel details and optional add-ons ↗</a></p>
    <div className={styles.collectionCta}>
      <a className={styles.primaryCta} href={`#${FORM_ID}`}>{CTA_LABEL}<span aria-hidden="true">↗</span></a>
      <p>Not sure how much coverage you need? Tell me what you know so far.</p>
    </div>
  </section>;
}
