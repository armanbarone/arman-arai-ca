import type { Metadata } from "next";
import type { WeddingCity } from "@/lib/ads/city-wedding-pages";
import { funnelCollections, type PricingMarket } from "@/lib/ads/pricing-request";
import { SITE } from "@/lib/site";
import { ThankYouFromSession } from "./InquiryFunnel";
import styles from "./vancouver.module.css";

/* /wedding-photography/<city>-pricing/thank-you: where a sent pricing form
 * lands, so Google Ads can count the inquiry by URL. noindex, never linked,
 * out of the sitemap. The content comes from the tab that sent the form. */

export const pricingThankYouMetadata = (city: WeddingCity): Metadata => ({
  title: { absolute: `Your pricing | ${city.name} Wedding Photography | Arman Arai` },
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
});

export default function PricingThankYou({ city, market }: { city: WeddingCity; market: PricingMarket }) {
  return <div className={`${styles.page} ${styles.dark}`} data-landing-theme="dark" data-landing-city={city.slug}>
    <ThankYouFromSession
      market={market.slug}
      collections={funnelCollections()}
      city={city.name}
      page={`wedding-photography/${market.slug}-pricing`}
      phone={SITE.phone.replace(/^\+1\s*/, "")}
      phoneE164={SITE.phoneE164}
      travelNote={market.travelNote}
    />
    <footer className={styles.footer}><span className={styles.footerBrand}>Arman Arai<span>Wedding photography · {city.name}</span></span><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
  </div>;
}
