import { Analytics } from "@vercel/analytics/next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";
import ImageProtect from "@/components/ImageProtect";
import { MARKETS, REGIONS, SCOPE, SITE, TIERS } from "@/lib/site";
import "./site.css";

/* One entity graph for the whole site. Individual pages add their own
 * Service / FAQPage / Article nodes rather than repeating this.
 *
 * Everything marked up here is visible somewhere on the site: the phone and
 * address are in the footer and on /contact, the scope sentence is on the
 * home page, /destination-wedding-photographer and /faq, and the offers are
 * on /pricing. Never mark up a fact the pages do not show.
 */

const PERSON_ID = `${SITE.url}/#arman`;

const ARMAN_LD = {
  "@type": "Person",
  "@id": PERSON_ID,
  name: SITE.name,
  jobTitle: "Wedding photographer",
  url: `${SITE.url}/about`,
  email: SITE.email,
  telephone: SITE.phone,
  image: "https://cdn.armanarai.ca/about/arman-portrait-camera-window.webp",
  // He works in English. Stated because the earlier version of this site
  // claimed fluent French, which is not true of him.
  knowsLanguage: ["en"],
  knowsAbout: [
    "Documentary wedding photography",
    "Editorial wedding photography",
    "Destination wedding photography",
    "Wedding day timelines",
    "35mm film wedding photography",
    "Wedding albums",
  ],
  sameAs: [SITE.instagram, SITE.pinterest, SITE.linkedin],
  worksFor: { "@id": `${SITE.url}/#business` },
};

const ORG_LD = {
  "@context": "https://schema.org",
  "@graph": [
    ARMAN_LD,
    {
      "@type": ["ProfessionalService", "LocalBusiness"],
      "@id": `${SITE.url}/#business`,
      name: SITE.name,
      alternateName: "Arman Arai Photography",
      legalName: SITE.legalName,
      url: SITE.url,
      email: SITE.email,
      telephone: SITE.phone,
      image: "https://cdn.armanarai.ca/about/arman-portrait-camera-window.webp",
      // The description is the sentence an answer engine is most likely to
      // lift, so it states the service, the country and the exclusion.
      description: `${SCOPE.oneLine} ${SCOPE.excludedShort} Documentary and editorial coverage, with one published collection price wherever the wedding happens and travel quoted separately.`,
      priceRange: "CA$3,000–CA$6,000",
      currenciesAccepted: "CAD",
      paymentAccepted: "Credit card, Interac e-Transfer, pre-authorised debit",
      address: {
        "@type": "PostalAddress",
        streetAddress: SITE.address.street,
        addressLocality: SITE.address.city,
        addressRegion: SITE.address.region,
        postalCode: SITE.address.postalCode,
        addressCountry: SITE.address.country,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: SITE.address.lat,
        longitude: SITE.address.lng,
      },
      // Canada in full, the cities and regions with a page of their own, and
      // the world minus the one country he does not work in.
      areaServed: [
        { "@type": "Country", name: "Canada" },
        ...MARKETS.map((m) => ({ "@type": "City", name: m.city })),
        ...REGIONS.filter((r) => !r.primary).map((r) => ({ "@type": "Place", name: r.name })),
        ...SCOPE.destinationExamples.map((name) => ({ "@type": "Place", name })),
      ],
      knowsLanguage: ["en"],
      founder: { "@id": PERSON_ID },
      employee: { "@id": PERSON_ID },
      sameAs: [SITE.instagram, SITE.pinterest, SITE.linkedin],
      // One offer per collection, for every wedding this site takes. The price
      // no longer varies by city, so a region-by-region matrix would repeat the
      // same figure and imply a distinction that does not exist. Travel is
      // quoted per booking and is deliberately not in this markup.
      makesOffer: TIERS.map((t) => ({
        "@type": "Offer",
        name: `${t.name} wedding photography: ${t.coverage}`,
        description: `${t.crew}. ${t.images}. This price is for a wedding anywhere in Canada and does not change with the city; travel is quoted separately. Weddings outside Canada are quoted per wedding, not sold at this figure.`,
        price: t.price,
        priceCurrency: "CAD",
        availability: "https://schema.org/InStock",
        url: `${SITE.url}/pricing`,
        areaServed: { "@type": "Country", name: "Canada" },
      })),
    },
    {
      "@type": "WebSite",
      "@id": `${SITE.url}/#website`,
      url: SITE.url,
      name: `${SITE.name} Wedding Photography`,
      inLanguage: "en-CA",
      publisher: { "@id": `${SITE.url}/#business` },
    },
  ],
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
