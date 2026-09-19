import type { Metadata } from "next";
import { at } from "@/lib/images";
import { CORE, SITE } from "@/lib/site";
import VancouverLanding, { VANCOUVER_DESCRIPTION, VANCOUVER_HERO } from "../VancouverLanding";

const title = `Vancouver Wedding Photography | From C$${CORE.price.toLocaleString("en-CA")} | Arman Arai`;
const path = "/wedding-photography/vancouver-dark";

export const metadata: Metadata = {
  title: { absolute: title },
  description: VANCOUVER_DESCRIPTION,
  alternates: { canonical: `${SITE.url}${path}` },
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  openGraph: {
    title,
    description: VANCOUVER_DESCRIPTION,
    url: `${SITE.url}${path}`,
    images: [{ url: at(VANCOUVER_HERO.src, 1200), alt: VANCOUVER_HERO.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: VANCOUVER_DESCRIPTION,
    images: [at(VANCOUVER_HERO.src, 1200)],
  },
};

export default function VancouverDarkPage() {
  return <VancouverLanding theme="dark" />;
}
