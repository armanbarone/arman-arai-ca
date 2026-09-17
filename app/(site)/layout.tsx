import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";
import ImageProtect from "@/components/ImageProtect";
import { MARKETS, REGIONS, SITE, TIERS, quoteFor } from "@/lib/site";

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
  priceRange: "CA$4,000–CA$9,000",
  currenciesAccepted: "CAD",
  address: { "@type": "PostalAddress", addressCountry: "CA" },
  areaServed: [
    { "@type": "Country", name: "Canada" },
    ...MARKETS.map((m) => ({ "@type": "City", name: m.city })),
  ],
  sameAs: [SITE.instagram, SITE.pinterest],
  // One offer per tier per region: the single all-in figure a couple in that
  // region actually pays. Travel is inside it; nothing is added afterwards.
  // Regions without a published figure are deliberately absent rather than
  // emitted with price: null, which is invalid Offer markup and was appearing
  // on every page of the site through this block.
  makesOffer: REGIONS.flatMap((r) =>
    TIERS.flatMap((t) => {
      const price = quoteFor(r, t);
      return price === null
        ? []
        : [{
            "@type": "Offer",
            name: `${t.name} wedding photography — ${r.short}`,
            price,
            priceCurrency: "CAD",
            areaServed: { "@type": "Place", name: r.name },
          }];
    }),
  ),
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
        <Nav />
        <main>{children}</main>
        <Footer />
        <InquiryModal />
      </InquiryProvider>
      <Analytics />
    </>
  );
}
