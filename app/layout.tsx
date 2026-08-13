import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Great_Vibes } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";
import ImageProtect from "@/components/ImageProtect";
import { MARKETS, SITE } from "@/lib/site";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const jost = Jost({
  subsets: ["latin"],
  weight: ["200", "300", "400"],
  variable: "--font-jost",
  display: "swap",
});

// Only used for the wordmark and a handful of display accents, so it is loaded
// at a single weight and left to swap.
const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Arman Arai — Canadian Wedding Photographer | Toronto, Montréal, Vancouver",
    template: "%s | Arman Arai",
  },
  description:
    "Wedding photography in Toronto, Montréal and Vancouver, and across Canada coast to coast. Documentary and editorial coverage with prices published up front, from $3,200.",
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
  image: "https://cdn.armanarai.com/ca/about/arman-portrait-camera-window.webp",
  description: SITE.blurb,
  priceRange: "CA$3,200–CA$6,500",
  currenciesAccepted: "CAD",
  address: { "@type": "PostalAddress", addressCountry: "CA" },
  areaServed: [
    { "@type": "Country", name: "Canada" },
    ...MARKETS.map((m) => ({ "@type": "City", name: m.city })),
  ],
  knowsLanguage: ["en-CA", "fr-CA"],
  sameAs: [SITE.instagram, SITE.pinterest],
  makesOffer: MARKETS.flatMap((m) =>
    m.tiers.map((t) => ({
      "@type": "Offer",
      name: `${m.city} wedding photography — ${t.name} (${t.hours} hours)`,
      price: t.price,
      priceCurrency: "CAD",
      areaServed: { "@type": "City", name: m.city },
    })),
  ),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-CA"
      className={`${cormorant.variable} ${jost.variable} ${greatVibes.variable}`}
    >
      <head>
        {/* Photographs come from the CDN on every page; warming the connection
            during HTML parse takes a full round trip off the LCP image. */}
        <link rel="preconnect" href="https://cdn.armanarai.com" />
        <link rel="dns-prefetch" href="https://cdn.armanarai.com" />
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
