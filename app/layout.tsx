import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Cormorant,
  Jost,
  Great_Vibes,
  UnifrakturMaguntia,
} from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";
import ImageProtect from "@/components/ImageProtect";
import { MARKETS, REGIONS, SITE, TIERS, quoteFor } from "@/lib/site";

/* The whole type system from armanarai.com, weights and settings identical, so
   a component moved between the two sites renders the same on both. */

const cormorant = Cormorant_Garamond({
  subsets: ["latin"], weight: ["300", "400", "500", "600", "700"], style: ["normal", "italic"],
  variable: "--font-cormorant", display: "swap",
});
const jost = Jost({
  subsets: ["latin"], weight: ["200", "300", "400"],
  variable: "--font-jost", display: "swap",
});
const greatVibes = Great_Vibes({
  subsets: ["latin"], weight: ["400"],
  variable: "--font-great-vibes", display: "swap",
});
// The Gazette blog-post design: plain Cormorant for the body, blackletter for
// the nameplate. The ported gz- CSS asks for both by variable name.
const cormorantGz = Cormorant({
  subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"],
  variable: "--font-cormorant-gz", display: "swap",
});
const unifraktur = UnifrakturMaguntia({
  subsets: ["latin"], weight: ["400"],
  variable: "--font-unifraktur", display: "swap",
});
// Archivo and IBM Plex Mono were carried over from the .com and dropped again:
// over there they are used only by the promo/ landing components, which do not
// exist on this site. They were two font families downloaded on every page for
// nothing. If a promo page is ever ported here, add them back with it.

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Arman Arai — Canadian Wedding Photographer | Toronto, Montréal, Vancouver",
    template: "%s | Arman Arai",
  },
  description:
    "Documentary and editorial wedding photography, based in Montréal and working across Canada. Three collections from C$4,000, each region one whole number with travel already inside it.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE.name,
    locale: "en_CA",
    url: SITE.url,
    title: "Arman Arai — Canadian Wedding Photographer",
    description:
      "Documentary and editorial wedding photography in Toronto, Montréal and Vancouver, and across Canada coast to coast.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Arman Arai — Canadian Wedding Photographer",
    description:
      "Documentary and editorial wedding photography in Toronto, Montréal and Vancouver.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

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
  makesOffer: REGIONS.flatMap((r) =>
    TIERS.map((t) => ({
      "@type": "Offer",
      name: `${t.name} wedding photography — ${r.short}`,
      price: quoteFor(r, t),
      priceCurrency: "CAD",
      areaServed: { "@type": "Place", name: r.name },
    })),
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-CA"
      className={`${cormorant.variable} ${jost.variable} ${greatVibes.variable} ${cormorantGz.variable} ${unifraktur.variable}`}
    >
      <head>
        {/* Photographs come from the CDN on every page; warming the connection
            during HTML parse takes a full round trip off the LCP image. */}
        <link rel="preconnect" href="https://cdn.armanarai.ca" />
        <link rel="dns-prefetch" href="https://cdn.armanarai.ca" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ORG_LD) }}
        />
      </head>
      <body className="bg-ivory font-sans font-light text-cream antialiased overflow-x-hidden">
        <InquiryProvider>
          <ImageProtect />
          <Nav />
          <main>{children}</main>
          <Footer />
          <InquiryModal />
        </InquiryProvider>
        <Analytics />
      </body>
    </html>
  );
}
