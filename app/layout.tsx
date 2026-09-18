import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Cormorant,
  Jost,
  Great_Vibes,
  UnifrakturMaguntia,
} from "next/font/google";
import "./globals.css";
import { SITE } from "@/lib/site";

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
  variable: "--font-great-vibes", display: "swap", preload: false,
});
// The Gazette blog-post design: plain Cormorant for the body, blackletter for
// the nameplate. The ported gz- CSS asks for both by variable name.
const cormorantGz = Cormorant({
  subsets: ["latin"], weight: ["300", "400", "500", "600"], style: ["normal", "italic"],
  variable: "--font-cormorant-gz", display: "swap", preload: false,
});
const unifraktur = UnifrakturMaguntia({
  subsets: ["latin"], weight: ["400"],
  variable: "--font-unifraktur", display: "swap", preload: false,
});
// Decorative and journal fonts load when used. Preloading them in the root
// otherwise competes with the landing page's hero, even when none are visible.
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
    "Documentary and editorial wedding photography across Canada. Three collections from C$3,000, the same price wherever you marry.",
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
      </head>
      <body className="bg-ivory font-sans font-light text-cream antialiased overflow-x-hidden">
        {/* The public site's chrome (nav, footer, inquiry modal, analytics) lives
            in app/(site)/layout.tsx so the private client portal carries none of it. */}
        {children}
      </body>
    </html>
  );
}
