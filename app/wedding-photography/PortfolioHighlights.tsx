import { PORTFOLIO_STYLE_ALBUMS } from "@/lib/ads/portfolio-selection";
import { CTA_LABEL, FORM_ID } from "@/lib/ads/pricing-request";
import AlbumBrowser from "./AlbumBrowser";
import styles from "./vancouver-weddings/landing.module.css";

export default function PortfolioHighlights() {
  return <section id="portfolio-styles" className={`${styles.section} ${styles.ink} ${styles.portfolioStyles}`} aria-labelledby="portfolio-styles-title">
    <p className={styles.sectionLabel}><span>02</span>Photography styles</p>
    <h2 id="portfolio-styles-title">Five ways<br /><em>of seeing.</em></h2>
    <p className={styles.portfolioLead}>From carefully composed portraits to unposed moments, these five albums show the range of my work. Open a style to explore a shorter selection from the portfolio.</p>
    <AlbumBrowser albums={PORTFOLIO_STYLE_ALBUMS} label="Five photography style albums" compact viewer="book" badgeLabel="Open album" inquiryAction={{ id: FORM_ID, label: CTA_LABEL }} />
  </section>;
}
