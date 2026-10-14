import Image from "next/image";
import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import { ANALOGUE, ARMAN, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM } from "@/lib/images";
import { FORM_ID, funnelCollections, pricingMarket } from "@/lib/ads/pricing-request";
import { SITE } from "@/lib/site";
import InquiryFunnel, { InquiryForm } from "../InquiryFunnel";
import styles from "./page.module.css";

const path = "/wedding-photography/vancouver-simple";
const topImage = "https://cdn.armanarai.ca/Landing%20Page%20Pics/TOP%20IMAGE.png";
const market = pricingMarket("vancouver")!;

export const metadata: Metadata = {
  title: { absolute: "Vancouver Wedding Photography | Arman Arai" },
  description: "For couples who desire to be themselves, and a bit more. Vancouver wedding photography in five styles, with Arman Arai.",
  alternates: { canonical: path },
  robots: { index: false, follow: true },
  openGraph: {
    title: "Vancouver Wedding Photography | Arman Arai",
    description: "Be yourselves, fully present. I’ll take it from there.",
    url: path,
    images: [{ url: topImage, width: 2016, height: 1344, alt: "A bride and groom close together in warm light, seen through reflections" }],
  },
  twitter: { card: "summary_large_image", title: "Vancouver Wedding Photography | Arman Arai", images: [topImage] },
};

// One original from each portfolio collection; this page has no album controls.
const examples = [
  { label: "Editorial", photo: EDITORIAL[1] },
  { label: "Film Inspired", photo: FILM[9] },
  { label: "1980s Film", photo: ANALOGUE[8] },
  { label: "Dreamy Fine Art", photo: DREAMY_FINE_ART[6] },
  { label: "Documentary", photo: DOCUMENTARY[7] },
];

// These excerpts are transcribed in lib/reviews.ts from the published originals.
const reviews = [
  { who: "Jennifer", quote: "We just went through the preview gallery and we are OBSESSED!" },
  { who: "Megan", quote: "I did not expect to get emotional over the album but here we are." },
  { who: "Brianna", quote: "It’s everything I ever wanted and more." },
];

export default function VancouverSimplePage() {
  return <div className={styles.page} data-landing-city="vancouver" data-landing-variant="minimal">
    <InquiryFunnel collections={funnelCollections()} city="Vancouver" page={path.slice(1)} phone={SITE.phone.replace(/^\+1\s*/, "")} phoneE164={SITE.phoneE164} travelNote={market.travelNote}>
      <header className={styles.header}>
        <p className={styles.brand}>Arman Arai<span>Wedding photography</span></p>
      </header>
      <main>
        <figure className={styles.hero}>
          <Image src={topImage} alt="A bride and groom close together in warm light, seen through reflections" width={2016} height={1344} priority sizes="(max-width: 1440px) 100vw, 1440px" quality={85} />
        </figure>

        <section className={styles.forYou} aria-labelledby="for-you-title">
          <div className={styles.intro}>
            <p className={styles.eyebrow}>Who is this for?</p>
            <h1 id="for-you-title">For couples who desire to be themselves,<br className={styles.desktopBreak} /> <em>and a bit more.</em></h1>
            <p className={styles.lead}>I capture your day in five different ways, from honest moments to artful portraits.</p>
          </div>
          <div className={styles.examples}>
            {examples.map(({ label, photo }, index) => <figure key={label} className={index === 4 ? styles.documentary : undefined}>
              <div className={styles.exampleImage}><Image src={photo.src} alt={photo.alt} fill sizes={index === 4 ? "(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) 60vw, 44vw" : "(max-width: 700px) calc((100vw - 54px) / 2), (max-width: 1000px) 28vw, 22vw"} quality={80} /></div>
              <figcaption>{label}</figcaption>
            </figure>)}
          </div>
        </section>

        <section className={styles.about} aria-labelledby="about-title">
          <div className={styles.aboutInner}>
            <figure className={styles.portrait}><Image src={ARMAN.src} alt={ARMAN.alt} width={800} height={1000} sizes="(max-width: 700px) 70vw, 360px" quality={80} /></figure>
            <div className={styles.aboutCopy}>
              <h2 id="about-title">I’m Arman.</h2>
              <p className={styles.welcome}>Genuinely stoked you’re here.</p>
              <p>Whatever your day looks like, you deserve to actually enjoy it. Not spend it worrying about where to look or what to do with your hands. Just be yourselves, fully present. I’ll take it from there.</p>
              <p>That’s what working together looks like.</p>
              <p>I’ve been photographing weddings for 12 years and can guide you swiftly throughout the day.</p>
            </div>
          </div>
        </section>

        <section className={styles.reviews} aria-labelledby="reviews-title">
          <div className={styles.sectionInner}>
            <p className={styles.eyebrow}>From the couples</p>
            <h2 id="reviews-title">In their words.</h2>
            <div className={styles.quotes}>{reviews.map(({ who, quote }) => <figure key={who}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption></figure>)}</div>
          </div>
        </section>

        <section id={FORM_ID} className={styles.inquiry} aria-labelledby="inquiry-title">
          <div className={styles.inquiryInner}>
            <h2 id="inquiry-title">Tell me about <em>your day.</em></h2>
            <InquiryForm city="Vancouver" market="vancouver" page={path} variant="minimal" className={styles.form} />
          </div>
        </section>
      </main>
    </InquiryFunnel>
    <footer className={styles.footer}>© {new Date().getFullYear()} Arman Arai</footer>
    <Analytics />
  </div>;
}
