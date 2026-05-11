import type { Metadata } from "next";
import { Cormorant_Garamond, Jost, Great_Vibes } from "next/font/google";
import "./globals.css";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import { InquiryProvider } from "@/components/InquiryContext";
import InquiryModal from "@/components/InquiryModal";
import ImageProtect from "@/components/ImageProtect";

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

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-great-vibes",
  display: "swap",
});

export const metadata: Metadata = {
  title: "StillVows — Wedding Photography",
  description:
    "Editorial and film-inspired wedding photography for couples who see their day as something sacred. Based in Medellín, available worldwide.",
  openGraph: {
    title: "StillVows — Wedding Photography",
    description:
      "Editorial and film-inspired wedding photography. Medellín, Vancouver, and destination worldwide.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${jost.variable} ${greatVibes.variable}`}
    >
      <body className="bg-ivory font-sans font-light text-cream antialiased overflow-x-hidden">
        <InquiryProvider>
          <ImageProtect />
          <Nav />
          <main>{children}</main>
          <Footer />
          <InquiryModal />
        </InquiryProvider>
      </body>
    </html>
  );
}
