import { PORTFOLIO_STYLE_ALBUMS } from "@/lib/ads/portfolio-selection";
import { CTA_LABEL, FORM_ID } from "@/lib/ads/pricing-request";
import AlbumBrowser from "./AlbumBrowser";
import styles from "./vancouver-weddings/landing.module.css";

export default function PortfolioHighlights() {
  return <div className={`${styles.albumBlock} ${styles.portfolioStyles}`}>
    <h3>Five ways of seeing.</h3>
    <p>From carefully composed portraits to unposed moments, these five albums show the range of my work. Open a style to explore a shorter selection from the portfolio.</p>
    <AlbumBrowser albums={PORTFOLIO_STYLE_ALBUMS} label="Five photography style albums" compact viewer="book" badgeLabel="Open album" inquiryAction={{ id: FORM_ID, label: CTA_LABEL }} />
  </div>;
}
