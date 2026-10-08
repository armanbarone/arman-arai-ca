import { PORTFOLIO_SELECTION } from "@/lib/ads/portfolio-selection";
import CityWorkAlbum from "./CityWorkAlbum";
import styles from "./vancouver-weddings/landing.module.css";

export default function PortfolioHighlights() {
  return <div className={styles.albumBlock}>
    <h3>A few favourites.</h3>
    <p>Editorial, film inspired, 1980s film, dreamy fine art and documentary.</p>
    <div className={styles.portfolioAlbum}><CityWorkAlbum photos={PORTFOLIO_SELECTION} place="Portfolio" /></div>
  </div>;
}
