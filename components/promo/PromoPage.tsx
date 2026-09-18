import Image from "next/image";
import InquireButton from "@/components/InquireButton";
import FilmStrip from "@/components/FilmStrip";
import { ARMAN_PORTRAIT } from "@/lib/images";
import LeadForm, { LeadFormProps } from "./LeadForm";
import PopupProvider from "./PopupProvider";
import CalendlyEmbed from "@/components/CalendlyEmbed";
import PromoStickyBar from "./PromoStickyBar";
import PromoHeroFrames from "./PromoHeroFrames";

/* ═══════════════════════════════════════════════════════════════════════════
   PROMO PAGE TEMPLATE: the shared skeleton behind every ads landing page on
   armanarai.ca. Ported from armanarai.com, where it drives the elopement
   package pages, so the two businesses keep one visual language.

   All copy and every number arrive through PromoConfig, so a page never hard-
   codes a price: edit the config, not this file. The prices themselves come
   from lib/site.ts, which is the single source of truth for what a collection
   costs, so a landing page can never drift from /pricing.

   Landing pages sit OUTSIDE the (site) route group deliberately: no nav, no
   footer, no way off the page except the form, the calendar or the phone. They
   are noindex, because an ads page competing with /pricing in organic search
   helps nobody.
   ═══════════════════════════════════════════════════════════════════════════ */

export interface PromoConfig {
  /** Currency label printed after every price. Defaults to "CAD", which is what
   *  the Canadian city pages sell in; the European pages sell in "USD". */
  currency?: string;
  /** The tax line under the hero price and in the footer. Defaults to the
   *  Canadian "before GST"; pass "" on a page with no sales tax to add. */
  taxNote?: string;
  /** Scarcity counter. Omit on pages that sell at a standing rate. */
  spotsRemaining?: number;
  priceFounding: number;
  /** The strikethrough anchor. Omit where there is no discount to anchor. */
  priceStandard?: number;
  anchorNote?: string;            // one line under the price block explaining the anchor
  /** Overrides the "N of 5 founding dates left" pill. "" removes it entirely. */
  badge?: string;
  /** Sits in front of the headline price, e.g. "From". For laddered offers
   *  where the hero number is the entry point rather than the whole story. */
  pricePrefix?: string;
  /** Overrides the "What $X covers, and what it doesn't" heading, which reads
   *  badly once the hero price carries a "From". */
  coversTitle?: string;
  /** Kicker over the timeline. Defaults to the six-hour founding wording. */
  timelineKicker?: string;
  /** Kicker over the final CTA. Defaults to the dates-left countdown. */
  finalKicker?: string;
  /**
   * The 35mm film strip under the hero. It is 22 lazy frames of pure
   * decoration: on a page that exists to book calls, that is 22 requests
   * competing with the hero on a phone, and an animation that keeps Speed
   * Index climbing. Pass false to drop it.
   */
  filmStrip?: boolean;
  /** The receipt artifact in section 3. */
  receiptTitle?: string;
  receiptStamp?: string;
  receiptPriceLabel?: string;
  /** The price ladder, rendered as cards. Omit to hide the section. */
  tiers?: {
    kicker: string;
    title: string;
    intro?: string;
    items: { name: string; price: string; meta: string; blurb: string; points: string[]; highlight?: boolean }[];
    /** Label on the highlighted card. Defaults to the featured-offer wording. */
    featuredLabel?: string;
    footnote?: string;
  };
  /** The scheduler, embedded on the page rather than behind a button. */
  booking?: { kicker: string; title: string; blurb: string };
  /**
   * Swap the single full-bleed hero photograph for the homepage's rotating
   * three-frame conveyor. The copy moves beside the frames rather than on top
   * of them, which sidesteps the contrast problem a full-bleed hero has: no
   * scrim is needed, because no type sits on a photograph.
   */
  heroPool?: { images: string[]; alts: string[]; mobileFrames?: 1 | 3 };
  heroImg: string;
  heroAlt: string;
  heroObjectPosition?: string;
  heroKickDark?: boolean;         // dark espresso kicker for bright hero skies
  kicker: string;                 // "Founding Couples · <city> · 2026 dates"
  h1Plain: string;                // "Elope in Revelstoke. Everything handled, "
  h1Accent: string;               // "photographed, and filmed."
  heroSub: string;
  /** What the hero says on a phone. The desktop line is written to be read
   *  beside a photograph; on a 412px screen the same sentence is six lines of
   *  body copy above the fold. Falls back to heroSub. */
  heroSubShort?: string;
  timeline: { n: string; t: string; d: string }[];
  timelineIntro: string;
  /** Section artwork, per city, pulled from existing sets. Breaks up the text-heavy blocks. */
  images: {
    activitiesBanner: string;    // wide banner inside the activities section
    activitiesBannerAlt?: string;
    alternativeImg?: string;     // portrait/landscape frame beside the alternative pitch
    alternativeImgAlt?: string;
  };
  included: string[];
  directPay?: { title: string; items: string[]; note: string };  // curated, paid directly (lean offers)
  excluded: string[];
  excludedNote: string;
  compare: { intro: string; colA: string; colB: string; colMine: string; rows: { row: string; a: string; b: string; mine: string }[]; footnote: string };
  workNote: string;               // line under "What I've shot"
  alternative?: { kicker: string; title: string; paras: string[] };
  activities: {
    /** Section headings. Default to the activity-menu wording; a page that uses
     *  this block for something else (choosing a region, say) renames them. */
    kicker?: string;
    title?: string;
    albumKicker?: string;
    intro: React.ReactNode;
    columns: { title: string; items: string[] }[];
    /** Kicker over the premium list. Defaults to the allowance wording, which
     *  only makes sense on pages that sell a capped activity budget. */
    premiumKicker?: string;
    /** The chip list under the columns. Omit `premium` to drop the block: a
     *  second price list on a landing page is noise, not persuasion. */
    premiumTitle?: string;
    premiumIntro?: string;
    premium?: { a: string; s?: string }[];
    albumNote: string;
  };
  /** The signed-letter block explaining the price. Omit to drop the section:
   *  on a page whose only job is booking a call it is a wall of text between
   *  the reader and the calendar. */
  whyPrice?: { kicker: string; title: string; paras: React.ReactNode[] };
  /** The "who I am" block. Omit `aboutParas` to drop the section entirely. */
  aboutParas?: string[];
  aboutKicker?: string;
  aboutTitle?: string;
  /** Overrides the portrait. Defaults to the site's about-page portrait. */
  aboutPortrait?: { src: string; alt: string; caption?: string };
  /** Screenshots of what couples actually wrote. Nothing persuades like these,
   *  so on a landing page they sit between the work and the calendar. */
  reviews?: {
    kicker?: string;
    title?: string;
    intro?: string;
    /** Intrinsic dimensions are required: these come off a dozen platforms at
     *  wildly different aspect ratios, and without them the page reflows as
     *  each one lands. */
    items: { src: string; w: number; h: number; alt?: string }[];
  };
  faq: { q: string; a: string }[];
  form: Omit<LeadFormProps, "endpoint">;
}

const FORM_ENDPOINT = "/api/contact";

const IN = "#e8dfd0";
const AC = "#B8956A";
// Cream at 62% and 42% over near-black lands under the 4.5:1 contrast floor and
// reads as thin grey on a phone in daylight. These carry the body copy and the
// captions on every promo page, so they are raised everywhere rather than
// patched per breakpoint.
const MUT = "rgba(232,223,208,.80)";
const DIM = "rgba(232,223,208,.60)";

const kick: React.CSSProperties = {
  fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase",
  color: AC, fontFamily: "var(--font-jost)",
};
const h2: React.CSSProperties = {
  fontFamily: "var(--font-cormorant)", fontWeight: 300, color: IN,
  fontSize: "clamp(1.9rem,3.4vw,2.9rem)", lineHeight: 1.08, margin: "0.9rem 0 0",
};
const ctaStyle: React.CSSProperties = {
  display: "inline-block", textAlign: "center", background: AC, color: "#080704",
  padding: "1.05rem 2.6rem", fontSize: "0.66rem", letterSpacing: "0.22em",
  textTransform: "uppercase", fontFamily: "var(--font-jost)", border: "none", cursor: "pointer",
};
const colTitle: React.CSSProperties = {
  fontSize: "0.62rem", letterSpacing: "0.26em", textTransform: "uppercase",
  color: AC, fontFamily: "var(--font-jost)", marginBottom: "1.4rem",
};

function money(n: number) {
  return `$${n.toLocaleString()}`;
}

function Li({ children, color = AC }: { children: React.ReactNode; color?: string }) {
  return (
    <li style={{ display: "flex", gap: "0.8rem", padding: "0.55rem 0", color: MUT, lineHeight: 1.6, fontSize: "0.95rem" }}>
      <span style={{ color, flexShrink: 0 }}>·</span>{children}
    </li>
  );
}

export default function PromoPage({ cfg, experiencesAlbum, workAlbum }: {
  cfg: PromoConfig;
  experiencesAlbum: React.ReactNode;
  /** Omit to drop the "What I've shot" section, e.g. when those frames are
   *  already carrying the hero. */
  workAlbum?: React.ReactNode;
}) {
  const currency = cfg.currency ?? "CAD";
  const taxNote = cfg.taxNote ?? "before GST";
  const badgeText =
    cfg.badge ?? (cfg.spotsRemaining != null ? `${cfg.spotsRemaining} of 5 founding dates left` : "");
  const spotsBadge = badgeText ? (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      border: `0.5px solid rgba(184,149,106,.4)`, padding: "0.5rem 0.9rem",
      fontSize: "0.6rem", letterSpacing: "0.22em", textTransform: "uppercase",
      color: AC, fontFamily: "var(--font-jost)",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", background: AC, display: "inline-block" }} />
      {badgeText}
    </span>
  ) : null;

  const finalKicker =
    cfg.finalKicker ?? cfg.booking?.kicker ??
    (cfg.spotsRemaining != null && cfg.priceStandard != null
      ? `${cfg.spotsRemaining} dates left. Then it’s ${money(cfg.priceStandard)}.`
      : "");

  return (
    <PopupProvider>
    <main className="dr-promo" style={{ background: "#080704", color: IN }}>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .fc-grid { grid-template-columns: 1fr 1fr; }
        .fc-cols { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
        .fc-about { display: grid; grid-template-columns: 1fr 380px; gap: 3.5rem; align-items: center; }
        .fc-sticky { display: none; }
        .fc-hero-media { position: absolute; inset: 0; }
        /* ── the rotating hero: copy beside the frames, not on them ── */
        .fc-hero-split { display: grid; grid-template-columns: 1fr 1fr; align-items: center; background: #080704; min-height: 92svh; }
        .fc-hero-frames-stack { display: none; }
        /* Lead, frames and rest are siblings. Desktop puts the two copy blocks
           in one column and the frames beside them; a phone just stacks them in
           source order, which is why the headline comes before the pictures. */
        .fc-hero-split { grid-template-areas: "lead frames" "rest frames"; align-content: center; }
        .fc-hero-lead { grid-area: lead; align-self: end; padding-top: 7rem; }
        .fc-hero-rest { grid-area: rest; align-self: start; padding-bottom: 4rem; }
        .fc-hero-frames-side { grid-area: frames; align-self: center; }
        /* One set of frames, relaid out per breakpoint. Rendering a phone tree
           and a desktop tree and hiding one meant a phone downloaded six hero
           photographs to show three. */
        .fc-hf { display: grid; gap: 2px; grid-template-columns: 1.15fr 0.85fr; grid-template-areas: "a b" "a c"; align-self: center; }
        .fc-hf-a, .fc-hf-b, .fc-hf-c { position: relative; overflow: hidden; }
        .fc-hf-a { grid-area: a; aspect-ratio: 3 / 4; }
        @media (max-width: 1023px) {
          .fc-hero-split { display: block; min-height: 0; }
          /* On a phone the order is kicker, headline, photographs, then the
             rest of the offer. Opening with the pictures meant the page led
             with no idea what it was selling. The frames sit between the two
             copy blocks and run full-bleed, so they skip the page padding. */
          .fc-hero-split { display: flex; flex-direction: column; }
          .fc-hero-lead { padding-top: 4.5rem; }
          .fc-hero-frames-side { margin: 1.4rem 0 1.8rem; }
          .fc-hero-rest { padding-bottom: 2.6rem; }
          /* Landscape lead frame: a 3:2 photograph then covers at the frame's
             own width, so 100vw is honest and the file is the 800px one rather
             than the 1200px one a portrait frame forced. */
          /* One frame on a phone, not three.
             The three-frame grid is a desktop idea. On Slow 4G the two small
             frames were competing with the lead photograph for the pipe, and
             the hero is not complete until all three land, which is most of why
             this page's LCP sat ~2s behind the single-photograph page it is
             testing against. Hidden and lazy means the browser never requests
             them, so a phone now fetches exactly one hero image, the same as
             the control. The rotation, which is the thing being tested, is
             unaffected: the lead frame still cycles the whole pool. */
          .fc-hf { grid-template-columns: 1fr; grid-template-areas: "a"; }
          .fc-hf-a { aspect-ratio: 3 / 2; }
          .fc-hf-b, .fc-hf-c { display: none; }
          /* Three-up: the lead frame stays landscape rather than the homepage's
             portrait one. A portrait frame makes a 3:2 photograph cover by
             height, which is what forced a 1200px file and cost the LCP; these
             albums are mixed orientation and the homepage's pool is not. The
             small pair is 1.6/1 so it renders inside the 400px rung. */
          .fc-hf-3up { grid-template-columns: 1fr 1fr; grid-template-areas: "a a" "b c"; }
          .fc-hf-3up .fc-hf-b, .fc-hf-3up .fc-hf-c { display: block; aspect-ratio: 1.6 / 1; }
        }
        .fc-hero-sub-short { display: none; }
        ${cfg.heroKickDark ? `.fc-hero-kick { color: #3f2f1a !important; }` : ""}
        /* zigzag timeline */
        .fc-zz { position: relative; }
        .fc-zz::before { content: ""; position: absolute; left: 50%; top: 8px; bottom: 8px; width: 1px; background: rgba(184,149,106,.2); transform: translateX(-50%); }
        .fc-zz-item { width: calc(50% - 2.6rem); padding: 1.2rem 0 2rem; position: relative; }
        .fc-zz-item:nth-child(odd) { margin-left: 0; text-align: right; }
        .fc-zz-item:nth-child(even) { margin-left: calc(50% + 2.6rem); text-align: left; }
        .fc-zz-item::after { content: ""; position: absolute; top: 1.9rem; width: 7px; height: 7px; border-radius: 50%; background: ${AC}; }
        .fc-zz-item:nth-child(odd)::after { right: calc(-2.6rem - 3.5px); }
        .fc-zz-item:nth-child(even)::after { left: calc(-2.6rem - 3.5px); }
        /* comparison table */
        .fc-cmp-wrap { overflow-x: auto; position: relative; }
        .fc-cmp-hint { display: none; }
        .fc-cmp { width: 100%; min-width: 720px; border-collapse: collapse; }
        .fc-cmp th, .fc-cmp td { padding: 0.95rem 1.1rem; text-align: left; vertical-align: top; border-top: 0.5px solid rgba(184,149,106,.16); font-size: 0.9rem; line-height: 1.55; }
        .fc-cmp th { font-family: var(--font-jost); font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase; border-top: none; padding-bottom: 1.1rem; }
        .fc-cmp td:last-child { background: rgba(184,149,106,.07); border-left: 0.5px solid rgba(184,149,106,.25); border-right: 0.5px solid rgba(184,149,106,.25); color: ${IN}; }
        .fc-cmp th:last-child { background: rgba(184,149,106,.07); border-left: 0.5px solid rgba(184,149,106,.25); border-right: 0.5px solid rgba(184,149,106,.25); border-top: 0.5px solid rgba(184,149,106,.25); color: ${AC}; }
        /* Review screenshots keep their full contents in bounded columns at
           every breakpoint, rather than inheriting the entire page width. */
        .fc-proof { column-count: 3; column-gap: 18px; max-width: 1000px; margin: 2.8rem auto 0; }
        .fc-proof-item {
          break-inside: avoid; margin-bottom: 18px;
          border: 0.5px solid rgba(184,149,106,.22); background: #141110;
        }
        .fc-proof-item a { display: block; }
        .fc-proof-item a:focus-visible { outline: 2px solid ${AC}; outline-offset: 4px; }
        @media (max-width: 1023px) { .fc-proof { column-count: 2; max-width: 680px; } }
        @media (max-width: 639px) { .fc-proof { column-count: 1; max-width: 340px; } }

        @media (max-width: 767px) {
          .fc-grid { grid-template-columns: 1fr !important; }
          .fc-cols { grid-template-columns: 1fr; gap: 2rem; }
          .fc-about { grid-template-columns: 1fr; gap: 2rem; }
          .fc-sticky { display: flex; }
          main { padding-bottom: 84px; }
          .fc-zz::before { left: 3px; transform: none; }
          .fc-zz-item, .fc-zz-item:nth-child(odd), .fc-zz-item:nth-child(even) { width: auto; margin-left: 0; padding-left: 1.6rem; text-align: left; }
          .fc-zz-item:nth-child(odd)::after, .fc-zz-item:nth-child(even)::after { left: 0; right: auto; }

          /* ── HERO ──────────────────────────────────────────────────────────
             Overlaying type on the photograph does not work at this width. The
             frame is busy, bright at the top and dark at the bottom, so any
             scrim strong enough to carry six lines of body copy erases the
             picture, and any scrim weak enough to keep the picture leaves gold
             kicker text sitting on white cloud.

             So on a phone the hero stops being an overlay and becomes two
             blocks: the photograph, uninterrupted, then the copy on solid
             ground underneath it. The picture is the picture and the type is
             legible, instead of both being half of each. */
          .fc-hero { min-height: 0 !important; display: block !important; }
          .fc-hero-media {
            position: relative !important; inset: auto !important;
            width: 100%; height: 42svh; min-height: 290px; max-height: 420px;
          }
          .fc-hero-flat { background: rgba(8,7,4,.04) !important; }
          .fc-hero-ramp {
            background: linear-gradient(180deg,
              rgba(8,7,4,.34) 0%, rgba(8,7,4,0) 18%, rgba(8,7,4,0) 55%,
              rgba(8,7,4,.55) 82%, #080704 100%) !important;
          }
          .fc-hero-scrim-x { background: none !important; }
          .fc-hero-copy {
            background: #080704;
            padding-top: 1.6rem !important; padding-bottom: 2.6rem !important;
          }

          /* The desktop hero line is written to sit beside a photograph. On a
             phone it is six lines of body copy before anyone reaches a price,
             so the short version runs instead, and the anchor note (which
             restates the price sentence that is directly above it) is dropped
             entirely. Both are still on the page further down. */
          .fc-hero-sub-long { display: none; }
          .fc-hero-sub-short { display: block; }
          .fc-anchor-note { display: none; }

          /* The comparison table is 720px wide at minimum, so on a phone it is a
             horizontal scroller. Nothing said so: the third column just looked
             like it had been cut off. */
          .fc-cmp-hint {
            display: block; margin: 0 0 0.7rem; font-family: var(--font-jost);
            font-size: 0.6rem; letter-spacing: 0.2em; text-transform: uppercase;
            color: rgba(184,149,106,.9);
          }
          .fc-cmp-wrap::after {
            content: ""; position: absolute; top: 0; right: 0; bottom: 0; width: 44px;
            background: linear-gradient(90deg, rgba(14,12,10,0), #0E0C0A 88%);
            pointer-events: none;
          }

          .fc-hero-cta { flex-direction: column; align-items: stretch !important; gap: 0.9rem !important; }
          .fc-hero-cta > button { width: 100%; padding: 1.15rem 1rem !important; font-size: 0.7rem !important; }
          .fc-hero-cta > span { justify-content: center; }

          /* ── READABILITY ───────────────────────────────────────────────────
             Cream at 42-62% opacity over near-black is under 4.5:1 and reads
             as thin and grey on a phone in daylight. Body copy comes up to a
             real weight and a real size, and the serif headings stop being
             hairlines. */
          .dr-promo { font-size: 16px; }
          .dr-promo p, .dr-promo li, .dr-promo td { font-size: 1rem !important; line-height: 1.75 !important; }
          .dr-promo h1 { font-weight: 400 !important; }
          .dr-promo h2, .dr-promo h3 { font-weight: 400 !important; }
          .dr-promo .fc-cmp td { font-size: 0.95rem !important; }

          /* ── SECTION SEPARATION ────────────────────────────────────────────
             The alternating #080704 / #0E0C0A backgrounds are a two-percent
             difference, so on a phone every section ran into the next one.
             A hairline and more air between them gives the page a rhythm. */
          .dr-promo > section { border-top: 1px solid rgba(184,149,106,.20); padding-top: 4rem !important; padding-bottom: 4rem !important; }
          /* The hero is its own thing: it opens with the photograph, so it gets
             neither the hairline nor the top padding the other sections take. */
          .dr-promo > section.fc-hero { border-top: none; padding: 0 !important; }
          .fc-covers { gap: 2.4rem; }
          .fc-receipt { padding: 1.6rem 1.3rem 1.2rem; transform: none; }
          .fc-receipt-tear { transform: none; }
          .fc-stamp { position: static; width: auto; height: auto; border-radius: 0; border: none; box-shadow: none; transform: none; display: block; text-align: left; padding: 0 0 0.6rem; background: none; backdrop-filter: none; font-size: 0.55rem; }
          .fc-letter { transform: none; padding: 1.8rem 1.4rem; }
          .fc-ticket:nth-child(odd), .fc-ticket:nth-child(even) { transform: none; }
          .fc-tier { padding: 1.6rem 1.3rem; }
          .fc-polaroid { transform: none; }
        }

        /* Phones are held in one hand in daylight. Give the copy real contrast
           at every width, not just the small one. */
        @media (max-width: 900px) {
          .fc-cmp th, .fc-cmp td { padding: 0.85rem 0.9rem; }
        }
        .fc-banner { position: relative; aspect-ratio: 21/9; overflow: hidden; margin: 2.4rem 0 2.8rem; }
        @media (max-width: 767px) { .fc-banner { aspect-ratio: 16/10; } }
        .fc-alt { display: grid; grid-template-columns: 1fr 400px; gap: 3.5rem; align-items: center; }
        @media (max-width: 767px) { .fc-alt { grid-template-columns: 1fr; gap: 2rem; } }
        /* ── the paper artifacts: receipt, tickets, letter, polaroid ── */
        .fc-covers { display: grid; grid-template-columns: 440px 1fr; gap: 3.5rem; align-items: start; margin-top: 2.6rem; }
        @media (max-width: 900px) { .fc-covers { grid-template-columns: 1fr; } }
        .fc-receipt { background: #ece3d2; color: #3d2e1f; padding: 2rem 1.9rem 1.5rem; position: relative; box-shadow: 0 24px 48px rgba(0,0,0,.5); transform: rotate(-1deg); }
        .fc-receipt-tear { height: 12px; background: conic-gradient(from 135deg at 50% 0, #ece3d2 90deg, transparent 0) 0 0 / 18px 12px; transform: rotate(-1deg); margin-top: -1px; }
        .fc-rrow { display: flex; justify-content: space-between; align-items: baseline; gap: 1rem; padding: 0.6rem 0; border-bottom: 1px dotted rgba(61,46,31,.28); }
        .fc-stamp { position: absolute; top: -24px; right: -16px; width: 118px; height: 118px; border: 2px solid #B8956A; border-radius: 50%; box-shadow: inset 0 0 0 3px rgba(184,149,106,.35); display: flex; align-items: center; justify-content: center; text-align: center; transform: rotate(12deg); color: #B8956A; font-family: var(--font-jost); font-size: 0.52rem; letter-spacing: 0.18em; text-transform: uppercase; padding: 0.8rem; background: rgba(8,7,4,.55); backdrop-filter: blur(2px); }
        .fc-ticket { position: relative; background: #ece3d2; color: #3d2e1f; display: grid; grid-template-columns: 1fr 66px; box-shadow: 0 18px 40px rgba(0,0,0,.45); }
        .fc-ticket:nth-child(odd) { transform: rotate(-0.6deg); }
        .fc-ticket:nth-child(even) { transform: rotate(0.5deg); }
        .fc-ticket-main { padding: 1.7rem 1.6rem; }
        .fc-ticket-stub { border-left: 2px dashed rgba(61,46,31,.35); display: flex; align-items: center; justify-content: center; writing-mode: vertical-rl; font-family: var(--font-jost); letter-spacing: 0.3em; text-transform: uppercase; font-size: 0.58rem; color: #a8834a; }
        .fc-ticket::before, .fc-ticket::after { content: ""; position: absolute; right: 58px; width: 16px; height: 16px; border-radius: 50%; background: #080704; }
        .fc-ticket::before { top: -8px; } .fc-ticket::after { bottom: -8px; }
        .fc-letter { background: #ece3d2; color: #4a3a28; max-width: 700px; margin: 2.8rem auto 0; padding: clamp(2rem,4vw,3.2rem); box-shadow: 0 24px 56px rgba(0,0,0,.55); transform: rotate(0.4deg); }
        .fc-letter strong { color: #3d2e1f; font-weight: 600; }
        .fc-polaroid { background: #f2ecdf; padding: 14px 14px 58px; box-shadow: 0 20px 44px rgba(0,0,0,.5); transform: rotate(1.6deg); position: relative; }
        .fc-faq summary { cursor: pointer; list-style: none; display: flex; justify-content: space-between; align-items: center; gap: 1rem; padding: 1.15rem 0; }
        .fc-faq summary::-webkit-details-marker { display: none; }
        .fc-faq summary::after { content: "+"; color: ${AC}; font-size: 1.1rem; flex-shrink: 0; transition: transform .25s; font-family: var(--font-jost); }
        .fc-faq details[open] summary::after { transform: rotate(45deg); }
        /* the price ladder */
        .fc-tiers { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.4rem; align-items: start; }
        @media (max-width: 900px) { .fc-tiers { grid-template-columns: 1fr; } }
        .fc-tier { border: 0.5px solid rgba(184,149,106,.2); padding: 2rem 1.8rem; background: rgba(232,223,208,.02); }
        .fc-tier-on { border-color: rgba(184,149,106,.55); background: rgba(184,149,106,.07); }
      `,
        }}
      />

      {/* ══ 1 · HERO ══ */}
      {cfg.heroPool ? (
        /* The rotating hero. The copy sits beside the photographs rather than
           on top of them, so there is no scrim to balance and no headline
           fighting a bright sky: the frames stay exactly as they were shot. */
        <section className="fc-hero fc-hero-split">
            <div className="page-w page-px fc-hero-lead">
            <p className="fc-hero-kick" style={kick}>{cfg.kicker}</p>
            <h1 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(2.3rem,5vw,4.2rem)", lineHeight: 1.05, margin: "1rem 0 1.4rem", maxWidth: "17ch", color: IN }}>
              {cfg.h1Plain}<em style={{ color: AC }}>{cfg.h1Accent}</em>
            </h1>
            </div>
            <div className="fc-hero-frames-side">
              <PromoHeroFrames pool={cfg.heroPool.images} alts={cfg.heroPool.alts} threeUp={cfg.heroPool.mobileFrames === 3} />
            </div>
            <div className="page-w page-px fc-hero-rest">
            <p className="fc-hero-sub-long" style={{ color: MUT, fontSize: "1.02rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "1.8rem" }}>
              {cfg.heroSub}
            </p>
            <p className="fc-hero-sub-short" style={{ color: MUT, fontSize: "1.02rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "1.6rem" }}>
              {cfg.heroSubShort ?? cfg.heroSub}
            </p>
            <div style={{ marginBottom: "1.6rem" }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "1.1rem", flexWrap: "wrap" }}>
                {cfg.priceStandard != null && (
                  <s style={{ color: DIM, fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.2rem,2.2vw,1.6rem)", fontWeight: 300 }} aria-label={`Reference rate ${cfg.priceStandard} dollars`}>
                    {money(cfg.priceStandard)}
                  </s>
                )}
                <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", color: IN, fontSize: "clamp(2.4rem,4.5vw,3.6rem)", fontWeight: 300, lineHeight: 1 }}>
                  {cfg.pricePrefix && (
                    <span style={{ fontSize: "0.42em", fontStyle: "normal", color: MUT, letterSpacing: "0.06em", marginRight: "0.35em" }}>{cfg.pricePrefix}</span>
                  )}
                  {money(cfg.priceFounding)} <span style={{ fontSize: "0.4em", fontStyle: "normal", color: MUT, letterSpacing: "0.06em" }}>{currency}</span>
                </span>
                {taxNote && (
                  <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, fontFamily: "var(--font-jost)" }}>
                    {taxNote}
                  </span>
                )}
              </div>
              {cfg.anchorNote && (
                <p className="fc-anchor-note" style={{ margin: "0.6rem 0 0", fontSize: "0.75rem", color: DIM, maxWidth: "52ch", lineHeight: 1.6 }}>{cfg.anchorNote}</p>
              )}
            </div>
            <div className="fc-hero-cta" style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
              <InquireButton style={ctaStyle}>Start the conversation</InquireButton>
              {spotsBadge}
            </div>
            <p style={{ marginTop: "1.1rem", fontSize: "0.78rem", color: DIM }}>
              30 minutes, no pressure. {cfg.booking
                ? <>Or <a href="#inquire" style={{ color: AC, textDecoration: "underline", textUnderlineOffset: 3 }}>see open times</a>.</>
                : <>Or <a href="#inquire" style={{ color: AC, textDecoration: "underline", textUnderlineOffset: 3 }}>send an inquiry</a> instead.</>}
            </p>
            </div>
        </section>
      ) : (
      <section className="fc-hero" style={{ position: "relative", minHeight: "92svh", display: "flex", alignItems: "flex-end" }}>
        <div className="fc-hero-media">
        <Image
          src={cfg.heroImg}
          alt={cfg.heroAlt}
          fill priority sizes="100vw"
          style={{ objectFit: "cover", objectPosition: cfg.heroObjectPosition ?? "center 40%" }}
        />
        {/* Two layers, because the copy sits on light text at 42-62% opacity and the
            hero frames vary from dark forest to blown-out snow and sky. A flat scrim
            mutes the whole frame just enough to hold any of them, and the ramp below
            carries the dense block of type at the base. The old single gradient fell
            to 10% at the 40% mark, which is exactly where the headline lands. */}
        <div className="fc-hero-flat" style={{ position: "absolute", inset: 0, background: "rgba(8,7,4,.20)" }} />
        <div className="fc-hero-ramp" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(8,7,4,.34) 0%, rgba(8,7,4,.20) 26%, rgba(8,7,4,.62) 58%, rgba(8,7,4,.86) 78%, rgba(8,7,4,.95) 100%)" }} />
        {/* The copy is left-aligned and the couple usually sits right, so darken the
            type side rather than flattening the whole photograph. Fades out by 88%
            so it still covers the text when it goes full-width on mobile. */}
        <div className="fc-hero-scrim-x" style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(8,7,4,.55) 0%, rgba(8,7,4,.40) 38%, rgba(8,7,4,.10) 70%, rgba(8,7,4,0) 88%)" }} />
        </div>
        <div className="page-w page-px fc-hero-copy" style={{ position: "relative", zIndex: 2, width: "100%", paddingBottom: "3.5rem", paddingTop: "7rem" }}>
          <p className="fc-hero-kick" style={kick}>{cfg.kicker}</p>
          <h1 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, fontSize: "clamp(2.3rem,5vw,4.2rem)", lineHeight: 1.05, margin: "1rem 0 1.4rem", maxWidth: "17ch", color: IN }}>
            {cfg.h1Plain}<em style={{ color: AC }}>{cfg.h1Accent}</em>
          </h1>
          <p className="fc-hero-sub-long" style={{ color: MUT, fontSize: "1.02rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "1.8rem" }}>
            {cfg.heroSub}
          </p>
          <p className="fc-hero-sub-short" style={{ color: MUT, fontSize: "1.02rem", lineHeight: 1.7, maxWidth: "52ch", marginBottom: "1.6rem" }}>
            {cfg.heroSubShort ?? cfg.heroSub}
          </p>
          <div style={{ marginBottom: "1.6rem" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: "1.1rem", flexWrap: "wrap" }}>
              {cfg.priceStandard != null && (
                <s style={{ color: DIM, fontFamily: "var(--font-cormorant)", fontSize: "clamp(1.2rem,2.2vw,1.6rem)", fontWeight: 300 }} aria-label={`Reference rate ${cfg.priceStandard} dollars`}>
                  {money(cfg.priceStandard)}
                </s>
              )}
              <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", color: IN, fontSize: "clamp(2.4rem,4.5vw,3.6rem)", fontWeight: 300, lineHeight: 1 }}>
                {cfg.pricePrefix && (
                  <span style={{ fontSize: "0.42em", fontStyle: "normal", color: MUT, letterSpacing: "0.06em", marginRight: "0.35em" }}>{cfg.pricePrefix}</span>
                )}
                {money(cfg.priceFounding)} <span style={{ fontSize: "0.4em", fontStyle: "normal", color: MUT, letterSpacing: "0.06em" }}>{currency}</span>
              </span>
              {taxNote && (
                <span style={{ fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, fontFamily: "var(--font-jost)" }}>
                  {taxNote}
                </span>
              )}
            </div>
            {cfg.anchorNote && (
              <p className="fc-anchor-note" style={{ margin: "0.6rem 0 0", fontSize: "0.75rem", color: DIM, maxWidth: "52ch", lineHeight: 1.6 }}>{cfg.anchorNote}</p>
            )}
          </div>
          <div className="fc-hero-cta" style={{ display: "flex", alignItems: "center", gap: "1.2rem", flexWrap: "wrap" }}>
            <InquireButton style={ctaStyle}>Start the conversation</InquireButton>
            {spotsBadge}
          </div>
          <p style={{ marginTop: "1.1rem", fontSize: "0.78rem", color: DIM }}>
            30 minutes, no pressure. {cfg.booking
              ? <>Or <a href="#inquire" style={{ color: AC, textDecoration: "underline", textUnderlineOffset: 3 }}>see open times</a>.</>
              : <>Or <a href="#inquire" style={{ color: AC, textDecoration: "underline", textUnderlineOffset: 3 }}>send an inquiry</a> instead.</>}
          </p>
        </div>
      </section>
      )}

      {/* ══ FILM ROLL DIVIDER, same frames as the homepage ══ */}
      {cfg.filmStrip !== false && <FilmStrip />}

      {/* ══ 2 · WHAT YOUR DAY LOOKS LIKE, zigzag ══ */}
      <section style={{ padding: "5.5rem 0 5rem", background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <div style={{ textAlign: "center", marginBottom: "3.2rem" }}>
            <p style={kick}>{cfg.timelineKicker ?? "Six hours, made like a film"}</p>
            <h2 style={h2}>What your day looks like</h2>
            <p style={{ color: MUT, maxWidth: "56ch", lineHeight: 1.75, margin: "1.2rem auto 0" }}>
              {cfg.timelineIntro}
            </p>
          </div>
          <div className="fc-zz" style={{ maxWidth: 920, margin: "0 auto" }}>
            {cfg.timeline.map((s) => (
              <div key={s.n} className="fc-zz-item">
                <div style={{ fontSize: "0.58rem", letterSpacing: "0.24em", textTransform: "uppercase", color: AC, fontFamily: "var(--font-jost)", marginBottom: "0.5rem" }}>{s.n}</div>
                <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400, fontStyle: "italic", fontSize: "1.3rem", color: IN, margin: "0 0 0.45rem" }}>{s.t}</h3>
                <p style={{ color: MUT, lineHeight: 1.75, margin: 0, fontSize: "0.95rem" }}>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 3 · INCLUDED / DIRECT-PAY / EXCLUDED ══ */}
      <section style={{ padding: "5.5rem 0" }}>
        <div className="page-w page-px">
          <p style={kick}>Straight answers</p>
          <h2 style={h2}>{cfg.coversTitle ?? `What ${money(cfg.priceFounding)} covers, and what it doesn’t`}</h2>
          <div className="fc-covers">
            {/* The receipt: the whole offer as a physical artifact */}
            <div>
              <div className="fc-receipt">
                <div className="fc-stamp">{cfg.receiptStamp ?? "Founding rate · 2026 · five dates only"}</div>
                <div style={{ fontFamily: "var(--font-jost)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#a8834a" }}>Arman Arai - Wedding Photographer</div>
                <div style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 400, fontSize: "1.65rem", margin: "0.4rem 0 0.2rem" }}>{cfg.receiptTitle ?? "The Founding Couples Day"}</div>
                <div style={{ fontFamily: "var(--font-jost)", fontSize: "0.56rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(61,46,31,.55)", marginBottom: "1.1rem" }}>{cfg.kicker}</div>
                {cfg.included.map((it) => {
                  const m = it.match(/^(.+?)(?::|,)\s(.+)$/);
                  return (
                    <div key={it} className="fc-rrow">
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontFamily: "var(--font-jost)", fontSize: "0.78rem", letterSpacing: "0.06em", textTransform: "uppercase" }}>{m ? m[1] : it}</div>
                        {m && <div style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "0.85rem", color: "#6b5638", lineHeight: 1.45 }}>{m[2]}</div>}
                      </div>
                      <span style={{ color: "#a8834a", flexShrink: 0 }}>✓</span>
                    </div>
                  );
                })}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", paddingTop: "1.2rem" }}>
                  <span style={{ fontFamily: "var(--font-jost)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase" }}>{cfg.receiptPriceLabel ?? "Founding rate"}</span>
                  <span style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "2.1rem", lineHeight: 1 }}>{money(cfg.priceFounding)}</span>
                </div>
                <div style={{ textAlign: "right", fontFamily: "var(--font-jost)", fontSize: "0.62rem", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(61,46,31,.55)", marginTop: "0.3rem" }}>
                  {cfg.priceStandard != null ? <><s>{money(cfg.priceStandard)}</s> standard{taxNote ? " · plus GST" : ""}</> : taxNote ? "All in, plus GST" : `All in, ${currency}`}
                </div>
              </div>
              <div className="fc-receipt-tear" />
            </div>
            {/* The fine print, kept honest */}
            <div>
              {cfg.directPay && (
                <div style={{ borderLeft: "2px solid rgba(184,149,106,.45)", padding: "1.5rem 1.6rem", marginBottom: "1.6rem", background: "rgba(184,149,106,.05)" }}>
                  <h3 style={{ ...colTitle, marginBottom: "1rem" }}>{cfg.directPay.title}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {cfg.directPay.items.map((it) => <Li key={it} color="rgba(232,223,208,.7)">{it}</Li>)}
                  </ul>
                  <p style={{ color: DIM, fontSize: "0.85rem", lineHeight: 1.7, marginTop: "1rem" }}>
                    {cfg.directPay.note}
                  </p>
                </div>
              )}
              <div style={{ borderLeft: "2px solid rgba(201,106,90,.55)", padding: "1.5rem 1.6rem", background: "rgba(201,106,90,.05)" }}>
                <h3 style={{ ...colTitle, color: "rgba(201,106,90,.85)", marginBottom: "1rem" }}>Not included: you book these directly</h3>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {cfg.excluded.map((it) => <Li key={it} color="rgba(201,106,90,.85)">{it}</Li>)}
                </ul>
                <p style={{ color: DIM, fontSize: "0.85rem", lineHeight: 1.7, marginTop: "1rem" }}>
                  {cfg.excludedNote}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ 3b · THE LADDER (optional) ══ */}
      {cfg.tiers && (
        <section style={{ padding: "5.5rem 0", background: "#0E0C0A" }}>
          <div className="page-w page-px">
            <div style={{ textAlign: "center", marginBottom: "3rem" }}>
              <p style={kick}>{cfg.tiers.kicker}</p>
              <h2 style={h2}>{cfg.tiers.title}</h2>
              {cfg.tiers.intro && (
                <p style={{ color: MUT, maxWidth: "58ch", lineHeight: 1.75, margin: "1.2rem auto 0" }}>{cfg.tiers.intro}</p>
              )}
            </div>
            <div className="fc-tiers">
              {cfg.tiers.items.map((t) => (
                <div key={t.name} className={`fc-tier${t.highlight ? " fc-tier-on" : ""}`}>
                  {t.highlight && (
                    <div style={{ display: "inline-block", fontFamily: "var(--font-jost)", fontSize: "0.56rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#080704", background: AC, padding: "0.35rem 0.7rem", marginBottom: "0.9rem" }}>
                      {cfg.tiers?.featuredLabel ?? "Most couples choose this"}
                    </div>
                  )}
                  <div style={{ fontFamily: "var(--font-jost)", fontSize: "0.6rem", letterSpacing: "0.26em", textTransform: "uppercase", color: AC }}>{t.name}</div>
                  <div style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontWeight: 300, color: IN, fontSize: "clamp(2rem,3.2vw,2.6rem)", lineHeight: 1, margin: "0.9rem 0 0.5rem" }}>
                    {t.price} <span style={{ fontSize: "0.32em", fontStyle: "normal", color: MUT, letterSpacing: "0.06em" }}>{currency}</span>
                  </div>
                  <div style={{ fontFamily: "var(--font-jost)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", color: DIM, marginBottom: "1.1rem" }}>{t.meta}</div>
                  <p style={{ color: MUT, lineHeight: 1.7, fontSize: "0.94rem", margin: "0 0 1.2rem" }}>{t.blurb}</p>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {t.points.map((pt) => <Li key={pt}>{pt}</Li>)}
                  </ul>
                </div>
              ))}
            </div>
            {cfg.tiers.footnote && (
              <p style={{ color: DIM, fontSize: "0.75rem", lineHeight: 1.7, marginTop: "1.6rem" }}>{cfg.tiers.footnote}</p>
            )}
          </div>
        </section>
      )}

      {/* ══ 4 · HOW THIS COMPARES ══ */}
      <section style={{ padding: "5.5rem 0", background: "#0E0C0A" }}>
        <div className="page-w page-px">
          <p style={kick}>Do the math before you book anything</p>
          <h2 style={h2}>How this compares to what you&rsquo;ve been quoted</h2>
          <p style={{ color: MUT, maxWidth: "58ch", lineHeight: 1.75, margin: "1.2rem 0 2.6rem" }}>
            {cfg.compare.intro}
          </p>
          <p className="fc-cmp-hint">Swipe the table sideways &rarr;</p>
          <div className="fc-cmp-wrap">
            <table className="fc-cmp">
              <thead>
                <tr>
                  <th style={{ color: DIM }}></th>
                  <th style={{ color: DIM }}>{cfg.compare.colA}</th>
                  <th style={{ color: DIM }}>{cfg.compare.colB}</th>
                  <th>{cfg.compare.colMine}</th>
                </tr>
              </thead>
              <tbody>
                {cfg.compare.rows.map((r) => (
                  <tr key={r.row}>
                    <td style={{ color: AC, fontFamily: "var(--font-jost)", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", whiteSpace: "nowrap" }}>{r.row}</td>
                    <td style={{ color: MUT }}>{r.a}</td>
                    <td style={{ color: MUT }}>{r.b}</td>
                    <td>{r.mine}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p style={{ color: DIM, fontSize: "0.75rem", lineHeight: 1.7, marginTop: "1.2rem" }}>
            {cfg.compare.footnote}
          </p>
        </div>
      </section>

      {/* ══ 4b · THE ALTERNATIVE PITCH (optional) ══ */}
      {cfg.alternative && (
        <section style={{ padding: "5.5rem 0" }}>
          <div className="page-w page-px">
            <div className="fc-alt">
              <div>
                <p style={kick}>{cfg.alternative.kicker}</p>
                <h2 style={h2}>{cfg.alternative.title}</h2>
                <div style={{ color: MUT, lineHeight: 1.85, fontSize: "1rem", marginTop: "1.6rem", display: "grid", gap: "1.1rem" }}>
                  {cfg.alternative.paras.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
                </div>
              </div>
              {cfg.images.alternativeImg && (
                <div style={{ position: "relative", aspectRatio: "4/5", overflow: "hidden" }}>
                  <Image src={cfg.images.alternativeImg} alt={cfg.images.alternativeImgAlt ?? cfg.heroAlt ?? ""} fill loading="lazy" sizes="(max-width: 767px) 100vw, 400px" style={{ objectFit: "cover" }} />
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* ══ 5 · THE WORK: WHAT I'VE SHOT ══ */}
      {workAlbum && (
        <section style={{ padding: "5.5rem 0", background: "#0E0C0A" }}>
          <div className="page-w page-px">
            <div style={{ textAlign: "center", marginBottom: "2.8rem" }}>
              <p style={kick}>The work</p>
              <h2 style={h2}>What I&rsquo;ve shot</h2>
              <p style={{ color: MUT, maxWidth: "52ch", lineHeight: 1.75, margin: "1.2rem auto 0" }}>
                {cfg.workNote}
              </p>
            </div>
            {workAlbum}
          </div>
        </section>
      )}

      {/* ══ 6 · THE ACTIVITIES: allowance included, premium extra ══ */}
      <section style={{ padding: "5.5rem 0" }}>
        <div className="page-w page-px">
          <p style={kick}>{cfg.activities.kicker ?? "Included in the package"}</p>
          <h2 style={h2}>{cfg.activities.title ?? "Activities are part of the deal"}</h2>
          <p style={{ color: MUT, maxWidth: "58ch", lineHeight: 1.75, margin: "1.2rem 0 0" }}>
            {cfg.activities.intro}
          </p>
          <div className="fc-banner">
            <Image src={cfg.images.activitiesBanner} alt={cfg.images.activitiesBannerAlt ?? cfg.heroAlt ?? ""} fill loading="lazy" sizes="(max-width: 767px) 100vw, 80vw" style={{ objectFit: "cover" }} />
          </div>
          <div className="fc-cols">
            {cfg.activities.columns.map((c) => (
              <div key={c.title} className="fc-ticket">
                <div className="fc-ticket-main">
                  <h3 style={{ ...colTitle, color: "#a8834a" }}>{c.title}</h3>
                  <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                    {c.items.map((it) => (
                      <li key={it} style={{ display: "flex", gap: "0.8rem", padding: "0.55rem 0", color: "#5f4c38", lineHeight: 1.6, fontSize: "0.92rem", borderBottom: "1px dotted rgba(61,46,31,.18)" }}>
                        <span style={{ color: "#a8834a", flexShrink: 0 }}>·</span>{it}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="fc-ticket-stub">Admit two · 2026</div>
              </div>
            ))}
          </div>

          {cfg.activities.premium && cfg.activities.premium.length > 0 && (
            <div style={{ marginTop: "3.6rem" }}>
              <p style={kick}>{cfg.activities.premiumKicker ?? "Beyond the allowance"}</p>
              {cfg.activities.premiumTitle && (
                <h3 style={{ fontFamily: "var(--font-cormorant)", fontWeight: 300, color: IN, fontSize: "clamp(1.4rem,2.4vw,1.9rem)", margin: "0.8rem 0 0" }}>{cfg.activities.premiumTitle}</h3>
              )}
              {cfg.activities.premiumIntro && (
                <p style={{ color: MUT, maxWidth: "58ch", lineHeight: 1.75, margin: "1.1rem 0 2rem" }}>
                  {cfg.activities.premiumIntro}
                </p>
              )}
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.7rem" }}>
                {cfg.activities.premium.map((x) => (
                  <span key={x.a} style={{ border: "0.5px solid rgba(184,149,106,.3)", color: MUT, padding: "0.7rem 1.2rem", fontSize: "0.8rem", fontFamily: "var(--font-jost)", letterSpacing: "0.04em" }}>
                    {x.a}{x.s ? <span style={{ color: DIM, fontSize: "0.66rem", marginLeft: "0.6rem", letterSpacing: "0.12em", textTransform: "uppercase" }}>{x.s}</span> : null}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div style={{ textAlign: "center", margin: "3.6rem 0 2.4rem" }}>
            <p style={kick}>{cfg.activities.albumKicker ?? "The experiences, as an album"}</p>
            <p style={{ color: MUT, maxWidth: "56ch", lineHeight: 1.75, margin: "1rem auto 0" }}>
              {cfg.activities.albumNote}
            </p>
          </div>
          {experiencesAlbum}
        </div>
      </section>

      {/* ══ 7 · WHY THIS PRICE EXISTS, as a signed letter (optional) ══ */}
      {cfg.whyPrice && (
        <section style={{ padding: "5.5rem 0", background: "#0E0C0A" }}>
          <div className="page-w page-px">
            <div style={{ textAlign: "center" }}>
              <p style={kick}>{cfg.whyPrice.kicker}</p>
              <h2 style={h2}>{cfg.whyPrice.title}</h2>
            </div>
            <div className="fc-letter">
              <div style={{ fontFamily: "var(--font-jost)", fontSize: "0.6rem", letterSpacing: "0.28em", textTransform: "uppercase", color: "#a8834a", marginBottom: "1.6rem" }}>
                From the desk of Arman Arai
              </div>
              <div style={{ fontFamily: "var(--font-cormorant)", lineHeight: 1.9, fontSize: "1.04rem", display: "grid", gap: "1.1rem" }}>
                {cfg.whyPrice.paras.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
              </div>
              <div style={{ fontFamily: "var(--font-cormorant)", fontStyle: "italic", fontSize: "1.7rem", marginTop: "1.8rem", color: "#3d2e1f" }}>Arman</div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 7b · REVIEWS: what couples actually wrote ══ */}
      {cfg.reviews && cfg.reviews.items.length > 0 && (
        <section id="reviews" style={{ padding: "5.5rem 0", background: "#0E0C0A" }}>
          <div className="page-w page-px">
            <div style={{ textAlign: "center" }}>
              <p style={kick}>{cfg.reviews.kicker ?? "Their words, not mine"}</p>
              <h2 style={h2}>{cfg.reviews.title ?? "What couples actually wrote"}</h2>
              {cfg.reviews.intro && (
                <p style={{ color: MUT, maxWidth: "56ch", lineHeight: 1.75, margin: "1.2rem auto 0" }}>
                  {cfg.reviews.intro}
                </p>
              )}
            </div>
            {/* Masonry columns rather than a grid, so no screenshot is cropped:
                on a review, a crop cuts off the words that do the persuading. */}
            <div className="fc-proof">
              {cfg.reviews.items.map((r, i) => (
                <div key={r.src} className="fc-proof-item">
                  <a href={r.src} target="_blank" rel="noopener noreferrer" aria-label={`Read review ${i + 1} at full size`}>
                  <Image
                    src={r.src}
                    alt={r.alt ?? "A message from a couple after their gallery was delivered"}
                    width={r.w}
                    height={r.h}
                    sizes="(max-width: 390px) calc(100vw - 51px), 340px"
                    quality={80}
                    loading="lazy"
                    style={{ width: "100%", height: "auto", display: "block" }}
                  />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══ 8 · WHO I AM (optional) ══ */}
      {cfg.aboutParas && cfg.aboutParas.length > 0 && (
        <section style={{ padding: "5.5rem 0" }}>
          <div className="page-w page-px">
            <div className="fc-about">
              <div>
                <p style={kick}>{cfg.aboutKicker ?? "The person behind the camera"}</p>
                <h2 style={h2}>{cfg.aboutTitle ?? "Twelve years of weddings taught me what to leave behind"}</h2>
                <div style={{ color: MUT, lineHeight: 1.85, fontSize: "1rem", marginTop: "1.6rem", display: "grid", gap: "1.1rem" }}>
                  {cfg.aboutParas.map((p, i) => <p key={i} style={{ margin: 0 }}>{p}</p>)}
                </div>
              </div>
              <div className="fc-polaroid">
                <div style={{ position: "relative", aspectRatio: "3/4", overflow: "hidden" }}>
                  <Image
                    src={cfg.aboutPortrait?.src ?? ARMAN_PORTRAIT.src}
                    alt={cfg.aboutPortrait?.alt ?? ARMAN_PORTRAIT.alt}
                    fill loading="lazy" sizes="(max-width: 767px) 100vw, 380px"
                    style={{ objectFit: "cover" }}
                  />
                </div>
                <div style={{ position: "absolute", bottom: 18, left: 0, right: 0, textAlign: "center", fontFamily: "var(--font-jost)", fontSize: "0.6rem", letterSpacing: "0.3em", textTransform: "uppercase", color: "#6b5638" }}>
                  {cfg.aboutPortrait?.caption ?? "Arman \u00b7 behind the camera"}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ══ 9 · FAQ ══ */}
      <section style={{ padding: "5.5rem 0", background: "#0E0C0A" }}>
        <div className="page-w page-px" style={{ maxWidth: 820 }}>
          <p style={kick}>Asked and answered</p>
          <h2 style={h2}>Questions couples actually ask</h2>
          <div className="fc-faq" style={{ marginTop: "2.4rem" }}>
            {cfg.faq.map((f) => (
              <details key={f.q} style={{ borderTop: "0.5px solid rgba(184,149,106,.16)" }}>
                <summary>
                  <span style={{ fontFamily: "var(--font-cormorant)", fontSize: "1.12rem", color: IN, fontWeight: 400 }}>{f.q}</span>
                </summary>
                <p style={{ color: MUT, lineHeight: 1.8, fontSize: "0.95rem", margin: "0 0 1.4rem", maxWidth: "68ch" }}>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 10 · FINAL CTA + LEAD FORM ══ */}
      <section id="inquire" style={{ padding: "5.5rem 0 5rem" }}>
        <div className="page-w page-px" style={{ maxWidth: 760 }}>
          <div style={{ textAlign: "center", marginBottom: "2.6rem" }}>
            {finalKicker && <p style={kick}>{finalKicker}</p>}
            <h2 style={h2}>{cfg.booking?.title ?? "Talk first. Decide after."}</h2>
            <p style={{ color: MUT, lineHeight: 1.75, maxWidth: "48ch", margin: "1.2rem auto 1.8rem" }}>
              {cfg.booking?.blurb ??
                "The call is 30 minutes: your date, your city, what the day could look like, and the real total for anything extra. No deposit taken on the call."}
            </p>
            {!cfg.booking && <InquireButton style={ctaStyle}>Start the conversation</InquireButton>}
          </div>

          {/* The calendar itself, not a button that fetches one. A landing page
              that makes someone click before it shows availability loses the
              half of the traffic that only wanted to see a free slot. */}
          {cfg.booking && (
            <div style={{ marginBottom: "3rem" }}>
              <CalendlyEmbed />
            </div>
          )}

          {/* Pages that show the calendar sell one action: a booked call. A
              lead form underneath it competes for the same click and offers a
              cheaper, lower-commitment way out, which is the opposite of what
              these pages are for. The older founding-rate pages, which have no
              calendar, still keep the form. */}
          {!cfg.booking && (
            <>
              <div style={{ textAlign: "center" }}>
                <p style={{ margin: "0 0 2.2rem", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", color: DIM, fontFamily: "var(--font-jost)" }}>
                  · or write to me instead ·
                </p>
              </div>
              <LeadForm endpoint={FORM_ENDPOINT} {...cfg.form} />
            </>
          )}
        </div>
      </section>

      {/* ══ 11 · FOOTER ══ */}
      <footer style={{ padding: "2.5rem 0", borderTop: "0.5px solid rgba(184,149,106,.14)" }}>
        <div className="page-w page-px" style={{ display: "flex", flexWrap: "wrap", gap: "0.9rem 2rem", justifyContent: "space-between", fontSize: "0.72rem", color: DIM, fontFamily: "var(--font-jost)", letterSpacing: "0.05em" }}>
          <span>Arman Arai - Wedding Photographer</span>
          <span>All prices {currency}{taxNote ? `, ${taxNote}` : ""}</span>
          <span>Form details are used only to reply to your inquiry.</span>
        </div>
      </footer>

      {/* Sticky mobile CTA, revealed once the hero is behind you */}
      <PromoStickyBar
        price={`${cfg.pricePrefix ? `${cfg.pricePrefix} ` : ""}${money(cfg.priceFounding)}`}
        strikethrough={cfg.priceStandard != null ? money(cfg.priceStandard) : undefined}
        // Just the hours. The full tier line ("4 hours · one iconic activity")
        // still ran past the width and ellipsed to "one iconic ...", which
        // reads worse than saying less.
        badge={cfg.tiers?.items[0]?.meta.split("·")[0].trim() ?? undefined}
      />
    </main>
    </PopupProvider>
  );
}
