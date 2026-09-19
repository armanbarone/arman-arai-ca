import Image from "next/image";
import { Analytics } from "@vercel/analytics/next";
import { ANALOGUE, ARMAN, DOCUMENTARY, DREAMY_FINE_ART, EDITORIAL, FILM, HOME_GRID, HOME_HERO_POOL, type Photo } from "@/lib/images";
import { GALLERIES } from "@/lib/galleries";
import { ALBUM_SPECS, CORE, SITE, TIERS } from "@/lib/site";
import { proofByN, proofSrc } from "@/lib/reviews";
import WeddingCalendar, { BookingLink, BookingNavigation } from "../2728-cc-weddings/wedding-calendar";
import AlbumBrowser, { type LandingAlbum } from "./AlbumBrowser";
import DateCheck from "./DateCheck";
import styles from "./vancouver.module.css";

const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
export const VANCOUVER_HERO = HOME_HERO_POOL[4];
export const VANCOUVER_DESCRIPTION = `Vancouver wedding photography by Arman Arai. Browse full wedding albums, see collections from ${money(CORE.price)}, and book a free 30-minute consultation.`;

const styleAlbum = (id: string, title: string, subtitle: string, photos: Photo[], cover: number): LandingAlbum => ({
  id, title, subtitle, cover: photos[cover], chapters: [{ title: `${title} · The complete collection`, photos }],
});
const stylesOfWork = [
  styleAlbum("editorial", "Editorial", "Intentional light. Beautiful portraits.", EDITORIAL, 2),
  styleAlbum("documentary", "Documentary", "The day, as it happens.", DOCUMENTARY, 7),
  styleAlbum("film", "Film inspired", "Warm colour. A softer feeling.", FILM, 19),
  styleAlbum("analogue", "1980s film", "Grain, texture and nostalgia.", ANALOGUE, 4),
  styleAlbum("fine-art", "Fine art", "Soft light. A little romance.", DREAMY_FINE_ART, 17),
];
// These are portfolio stories from different locations, labelled as such. The
// page serves Vancouver; it does not relabel other cities' weddings as local.
const weddingAlbums: LandingAlbum[] = ["luca-lauren", "elisha-michael", "nicole-js"].map((slug) => {
  const gallery = GALLERIES.find((item) => item.slug === slug)!;
  return { id: slug, title: gallery.names, subtitle: gallery.location, cover: { src: gallery.cover.url, alt: gallery.cover.alt }, chapters: gallery.chapters.map((chapter) => ({ title: chapter.title, photos: chapter.images.map((photo) => ({ src: photo.url, alt: photo.alt, width: photo.w, height: photo.h })) })) };
});

const questions = [
  ["How do we check whether our date is available?", "Book a free 30-minute call below and bring your wedding date. We’ll check availability and talk through your plans. If you prefer email, use the date inquiry near the top of this page. A consultation does not reserve the wedding date."],
  ["Do you cover the Lower Mainland and the Sea-to-Sky?", "Yes. Vancouver, Burnaby, Richmond, the North Shore, the Fraser Valley, Squamish and Whistler. Tell me your venue or the area you’re considering, and we’ll discuss the timeline and any travel before you book."],
  ["What if it rains on our wedding day?", "We’ll plan a covered or indoor option for portraits alongside the outdoor locations. You can keep enjoying your day without having to make a new photography plan that morning."],
  ["We’re not comfortable posing. Will you help?", "Yes. I’ll give you clear, simple direction for portraits, including where to stand and what to do with your hands. During the ceremony and celebrations, you can focus on your guests while I photograph what happens."],
  ["What is included, and what costs extra?", "Every collection includes photography by me, planning, a full edited online gallery with print permission, vertical social reels and film prints for your guests. Signature and Heirloom also include a feature film and printed album. Prices are in Canadian dollars before tax. Travel, where needed, is quoted separately and agreed before you book."],
  ["How do we secure our wedding date?", "Once we’ve confirmed availability, your collection and the full quote, a signed contract and 30% retainer secure the date. The balance is due 30 days before the wedding. There’s no obligation to book after our consultation."],
];

export default function VancouverLanding() {
  return <div className={styles.page}>
    <a className={styles.skip} href="#main">Skip to content</a>
    <header className={styles.header}>
      <a className={styles.wordmark} href="#main" aria-label="Arman Arai, top of page">Arman Arai<span>WEDDING PHOTOGRAPHY</span></a>
      <nav aria-label="Page navigation"><a className={styles.navLink} href="#albums">The photographs</a><a className={styles.navLink} href="#collections">Collections</a><BookingLink className={styles.headerCta} placement="vancouver_header">Let’s meet <span aria-hidden="true">↗</span></BookingLink></nav>
    </header>
    <main id="main">
      <section className={styles.hero} aria-labelledby="hero-title">
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Your people. Your day. Your kind of photographs.</p>
          <h1 id="hero-title">Vancouver <br />wedding <br /><em>photography.</em></h1>
          <p className={styles.heroIntro}>Beautiful portraits. All the feeling in between.<br />And time to actually enjoy your wedding.</p>
          <p className={styles.starting}>Collections from <strong>{money(CORE.price)}</strong><span>6, 8 or 10 hours · CAD before tax · travel extra</span></p>
          <BookingLink className={styles.button} placement="vancouver_hero">Book a free consultation <span aria-hidden="true">↗</span></BookingLink>
          <p className={styles.micro}>30 minutes with Arman · Check your date · No obligation</p>
          <details className={styles.dateInquiry}><summary>Prefer to check your date by email? <span aria-hidden="true">+</span></summary><DateCheck city="Vancouver" wherePlaceholder="Your venue, or Vancouver area" page="/wedding-photography/vancouver" classes={styles} replyTiming="I’ll reply personally with availability." confirmation="Your inquiry is on its way. I’ll be in touch about your date." /></details>
        </div>
        <div className={styles.heroArt}>
          <figure className={styles.heroImage}><Image src={VANCOUVER_HERO.src} alt={VANCOUVER_HERO.alt} fill priority fetchPriority="high" quality={78} sizes="(max-width: 760px) 84vw, 42vw" /><figcaption>A day you felt. Photographs you keep.</figcaption></figure>
          <figure className={styles.heroInset}><Image src={HOME_HERO_POOL[14].src} alt={HOME_HERO_POOL[14].alt} fill quality={72} sizes="(max-width: 760px) 33vw, 16vw" /></figure>
          <span className={styles.heroSideNote}>Documentary feeling / Editorial eye</span>
        </div>
      </section>
      <div className={styles.factBar}><span>Vancouver & the Lower Mainland</span><span>North Shore & Sea-to-Sky</span><span>Photographed by Arman</span></div>

      <section className={styles.firstQuote} aria-label="A client’s words"><span className={styles.quoteMark} aria-hidden="true">“</span><blockquote>Only one person understood our vision<br className={styles.desktopBreak} /> the way we were imagining it.</blockquote><a href={proofSrc(8)} target="_blank" rel="noopener noreferrer">Samantha · Google review <span aria-hidden="true">↗</span></a></section>

      <section id="albums" className={styles.workSection} aria-labelledby="work-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The portfolio / 01</p><h2 id="work-title">Find the feeling<br /><em>you came for.</em></h2></div><p>From the quiet moments to the dance floor. Explore the full collections and see what feels like you.</p></div>
        <AlbumBrowser albums={stylesOfWork} label="Five complete portfolio collections" compact />
        <p className={styles.albumHint}>Open an album to see every photograph. <span>Swipe to explore the collections →</span></p>
        <div className={styles.weddingHeading}><div><p className={styles.eyebrow}>Wedding stories / 02</p><h2>The whole day.<br /><em>All the way through.</em></h2></div><p>Three complete wedding stories from the portfolio, with the preparations, the ceremony and everything that followed.</p></div>
        <AlbumBrowser albums={weddingAlbums} label="Complete wedding stories" />
        <div className={styles.workBottom}><a href="/portfolio" target="_blank" rel="noopener noreferrer">Explore the entire portfolio <span aria-hidden="true">↗</span></a><BookingLink placement="vancouver_after_albums">Like what you see? Let’s meet <span aria-hidden="true">↗</span></BookingLink></div>
      </section>

      <section className={styles.about} aria-labelledby="about-title">
        <div className={styles.portraitWrap}><figure className={styles.portrait}><Image src={ARMAN.src} alt={ARMAN.alt} fill quality={78} sizes="(max-width: 760px) 85vw, 38vw" /></figure><span className={styles.signature}>See you on the other side of the camera.</span></div>
        <div className={styles.aboutCopy}><p className={styles.eyebrow}>Your photographer</p><h2 id="about-title">Hi, I’m Arman.<br /><em>Let’s make this easy.</em></h2><p>You don’t need to arrive knowing how to pose. I’ll help with that.</p><p>I’ll give you direction when it helps, make time for the family photographs, and let you get back to your favourite people. In between, I’m watching for the laughter, the glances and the moments you couldn’t have planned.</p><p>From a celebration downtown to a day on the North Shore or up the Sea-to-Sky, we’ll make a photography plan that fits your wedding.</p><BookingLink className={styles.textLink} placement="vancouver_about">Meet me on a free call <span aria-hidden="true">↗</span></BookingLink></div>
      </section>

      <section id="collections" className={styles.collections} aria-labelledby="collections-title">
        <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>The collections / 03</p><h2 id="collections-title">Your day, with room<br /><em>for what matters.</em></h2></div><p>Start with the time you need. We’ll talk through your plans and find the right coverage together.</p></div>
        <div className={styles.priceGrid}>{TIERS.map((tier) => <article key={tier.slug} className={tier.slug === "signature" ? styles.featuredPrice : styles.priceCard}>
          <div className={styles.tierHeader}><p>{tier.hours} hours of coverage</p><span>{tier.slug === "signature" ? "Photography + film + album" : tier.slug === "heirloom" ? "The fullest collection" : "The essentials"}</span></div>
          <h3>{tier.name}</h3><p className={styles.price}>{money(tier.price)}<span>CAD before tax</span></p>
          <ul><li>{tier.images}</li><li>{tier.preview}</li><li>{tier.delivery}</li>{tier.film && <li>{tier.film}</li>}{tier.rolls && <li>{tier.rolls}</li>}{tier.slug === "signature" && <li>{ALBUM_SPECS.signature.size} album · {ALBUM_SPECS.signature.pages}</li>}{tier.slug === "heirloom" && <li>{ALBUM_SPECS.heirloom.size} leather album · {ALBUM_SPECS.heirloom.pages}</li>}</ul>
          <BookingLink className={styles.collectionLink} placement={`vancouver_collection_${tier.slug}`}>Talk about {tier.name} <span aria-hidden="true">↗</span></BookingLink>
        </article>)}</div>
        <div className={styles.included}><h3>Always included.</h3><p>Photography by Arman. Timeline and family-photo planning. A full edited gallery with print permission. Social reels in the first week. Film prints for your guests on the night.</p></div>
        <p className={styles.travel}>Travel kept lean. Any travel is quoted separately and agreed before you book. All prices are in Canadian dollars before tax.</p>
      </section>

      <section className={styles.reviews} aria-labelledby="reviews-title"><div className={styles.sectionHeading}><div><p className={styles.eyebrow}>When the photographs arrive</p><h2 id="reviews-title">I’ll let them<br /><em>tell you.</em></h2></div><p>A few words from the people on the other side of the camera. Tap a message to read the original.</p></div><div className={styles.reviewsGrid}>
        {[{ n: 2, who: "Jennifer", quote: "We just went through the preview gallery and we are OBSESSED!" }, { n: 3, who: "Megan", quote: "I did not expect to get emotional over the album but here we are." }, { n: 5, who: "Brianna", quote: "It’s everything I ever wanted and more." }].map(({ n, who, quote }) => { const proof = proofByN(n); return <figure key={n}><blockquote>“{quote}”</blockquote><figcaption>{who}</figcaption><a href={proofSrc(n)} target="_blank" rel="noopener noreferrer" aria-label={`Read ${who}’s original message`}><Image src={proofSrc(n)} alt={proof.alt} width={proof.w} height={proof.h} quality={80} sizes="(max-width: 760px) 78vw, 25vw" /><span>Read the original message ↗</span></a></figure>; })}
      </div></section>

      <section className={styles.interlude} aria-label="Wedding photographs from the homepage">{[HOME_GRID[0], HOME_GRID[3], HOME_GRID[5]].map((photo) => <figure key={photo.src}><Image src={photo.src} alt={photo.alt} fill quality={72} sizes="(max-width: 760px) 50vw, 33vw" /></figure>)}</section>

      <section className={styles.faq} aria-labelledby="faq-title"><div><p className={styles.eyebrow}>A few things before we meet</p><h2 id="faq-title">You might<br /><em>be wondering.</em></h2></div><div className={styles.questions}>{questions.map(([q, a]) => <details key={q}><summary>{q}<span aria-hidden="true">+</span></summary><p>{a}</p></details>)}</div></section>

      <section id="book-a-call" className={styles.booking} aria-labelledby="booking-title"><div className={styles.bookingCopy}><p className={styles.eyebrow}>Your Vancouver wedding starts here</p><h2 id="booking-title" tabIndex={-1}>Bring your date.<br /><em>Tell me your plans.</em></h2><p>Choose a time for a free 30-minute video call with me. We’ll check your wedding date, talk about the photographs you love, and go through coverage and pricing.</p><ol><li><span>01</span> Choose a time that works for you.</li><li><span>02</span> Meet Arman and talk through your day.</li><li><span>03</span> Decide in your own time.</li></ol><p className={styles.bookingNote}>No obligation. No need to have it all figured out.<br />This calendar books our consultation, not your wedding date.</p></div><div className={styles.bookingCalendar}><WeddingCalendar page="wedding-photography/vancouver" classes={styles} /></div></section>
    </main>
    <footer className={styles.footer}><a href="#main" className={styles.footerBrand}>Arman Arai<span>Wedding photography · Vancouver</span></a><div><a href={`mailto:${SITE.email}`}>{SITE.email}</a><a href="/privacy-policy" target="_blank" rel="noopener noreferrer">Privacy policy</a><span>© {new Date().getFullYear()} Arman Arai</span></div></footer>
    <BookingNavigation classes={styles} /><Analytics />
  </div>;
}
