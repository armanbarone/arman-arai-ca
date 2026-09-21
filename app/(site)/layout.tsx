import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";
import ImageProtect from "@/components/ImageProtect";
import { MARKETS, SITE, TIERS } from "@/lib/site";
import "./site.css";

// One organisation graph for the whole site. Individual pages add their own
// Service / FAQPage / Article nodes rather than repeating this.
const ORG_LD = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${SITE.url}/#business`,
  name: SITE.name,
  alternateName: "Arman Arai Photography",
  url: SITE.url,
  email: SITE.email,
  image: "https://cdn.armanarai.ca/about/arman-portrait-camera-window.webp",
  description: SITE.blurb,
  priceRange: "CA$3,000–CA$6,000",
  currenciesAccepted: "CAD",
  address: { "@type": "PostalAddress", addressCountry: "CA" },
  areaServed: [
    { "@type": "Country", name: "Canada" },
    ...MARKETS.map((m) => ({ "@type": "City", name: m.city })),
  ],
  sameAs: [SITE.instagram, SITE.pinterest],
  // One offer per collection, for the whole country. The price no longer
  // varies by city, so emitting a region-by-region matrix would repeat the
  // same figure seven times and imply a distinction that does not exist.
  // Travel is quoted per booking and is deliberately not in this markup.
  makesOffer: TIERS.map((t) => ({
    "@type": "Offer",
    name: `${t.name} wedding photography — ${t.coverage}`,
    price: t.price,
    priceCurrency: "CAD",
    areaServed: { "@type": "Country", name: "Canada" },
  })),
};

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
      />
      <InquiryProvider>
        <ImageProtect />
        {/* Off-screen until focused. The nav carries a places menu and a
            portfolio menu, so a keyboard user otherwise tabs through every
            city on the site before reaching the page. */}
        <a className="skip-link" href="#main">Skip to content</a>
        <Nav />
        <main id="main">{children}</main>
        <Footer />
        <InquiryModal />
      </InquiryProvider>
      <Analytics />
    </>
  );
}
