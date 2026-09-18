import { PromoConfig } from "@/components/promo/PromoPage";
import { ALBUM_SPECS, TIERS } from "@/lib/site";
import { HOME_GRID, LANDING_PAGE, at } from "@/lib/images";

/* ═══════════════════════════════════════════════════════════════════════════
   /2728-weddings — the Google Ads landing page for 2027 and 2028 dates.

   The page has one job: book the call. Everything on it either builds enough
   trust to pick up the calendar, or it is cut. That is why there is no letter
   about the money, no second price list and no third paragraph about me: the
   reviews do that work, and screenshots of what couples actually wrote persuade
   better than anything I can write about myself.

   Prices are read from lib/site.ts rather than typed here, so the page can
   never quote a figure /pricing has moved off.

   NOTHING ON THIS PAGE NAMES A HOME CITY. It runs as a national campaign, so a
   line like "within 100 km of Montréal" makes it wrong for most of the country
   the moment it is served there. Travel is extra, quoted per wedding, and that
   is the whole story a landing page needs to tell.
   ═══════════════════════════════════════════════════════════════════════════ */

const IN = "#e8dfd0";

const [CORE, SIGNATURE, HEIRLOOM] = TIERS;
const money = (n: number) => `$${n.toLocaleString("en-CA")}`;

/** The review screenshots, from the same set /reviews publishes. Intrinsic
 *  dimensions come from that page, where they were measured. */
const REVIEW_SRC = (n: number) =>
  `https://cdn.armanarai.ca/reviews/proof-${String(n).padStart(2, "0")}.png`;

const REVIEWS = [
  { n: 1, w: 1896, h: 2485 },
  { n: 5, w: 1896, h: 1555 },
  { n: 3, w: 750, h: 851 },
  { n: 9, w: 750, h: 1623 },
  { n: 4, w: 750, h: 657 },
  { n: 7, w: 375, h: 797 },
  { n: 6, w: 422, h: 474 },
  { n: 2, w: 1082, h: 451 },
  { n: 8, w: 428, h: 301 },
].map(({ n, w, h }) => ({ src: REVIEW_SRC(n), w, h }));

export function weddings2728Config(): PromoConfig {
  return {
    /* ── Price ────────────────────────────────────────────────────────────── */
    priceFounding: CORE.price,
    pricePrefix: "From",
    badge: "2027 and 2028 dates",
    coversTitle: "What you get",
    anchorNote: "The same price in every city. Travel is extra.",
    taxNote: "before tax",

    /* ── Hero ─────────────────────────────────────────────────────────────── */
    /* One frame on a phone, not three. Three hero photographs on a slow mobile
       pipe measured at 4.2s LCP and 5.2s Speed Index; the other two are pure
       decoration above the fold and cost more than they are worth. All three
       still show on desktop, where there is bandwidth for them. */
    heroPool: {
      images: LANDING_PAGE.map((ph) => ph.src),
      alts: LANDING_PAGE.map((ph) => ph.alt),
      mobileFrames: 1,
    },
    // 22 decorative frames between the hero and the first real section.
    filmStrip: false,
    heroImg: LANDING_PAGE[0].src,
    heroAlt: LANDING_PAGE[0].alt,
    kicker: "Canadian weddings · 2027 and 2028 dates",
    /* "Photographed by one person" was elopement copy: on an elopement page the
       single curator IS the product, on a wedding page it reads like you are
       being sold a smaller crew. The differentiator that actually matters to a
       couple comparing quotes is that the postcode does not move the number. */
    h1Plain: "Canadian wedding photography, ",
    h1Accent: "the same price in every city.",
    heroSub:
      "Documentary and editorial coverage of the whole day, from $3,000. Book a 30-minute call and " +
      "I will tell you whether your date is open and exactly what your wedding costs.",
    heroSubShort:
      "Documentary and editorial wedding coverage from $3,000, the same price anywhere in Canada. " +
      "Book a 30-minute call.",

    /* ── The day ──────────────────────────────────────────────────────────── */
    timelineKicker: "Six hours, eight, or ten",
    timelineIntro: "How much of the day you hold is the only real decision.",
    timeline: [
      { n: "01", t: "The quiet room", d: "The dress on the door, the rings on a windowsill. The frames people are surprised by a year later." },
      { n: "02", t: "The ceremony", d: "Shot from the edges with long lenses and no flash. Nobody should remember the photographer being there." },
      { n: "03", t: "The family photographs", d: "Twelve groups, two callers, agreed in writing. Twenty minutes instead of an hour of shouting names." },
      { n: "04", t: "Golden hour", d: "I build the timeline backwards from the last light and keep ten minutes of it for the two of you." },
      { n: "05", t: "The room, and the floor", d: "Documentary through dinner and the dancing, with film prints handed round while it is still happening." },
    ],

    images: {
      activitiesBanner: at(HOME_GRID[5].src, 1600),
      activitiesBannerAlt: HOME_GRID[5].alt,
      alternativeImg: at(HOME_GRID[2].src, 1000),
      alternativeImgAlt: HOME_GRID[2].alt,
    },

    /* ── In every collection ──────────────────────────────────────────────── */
    included: [
      "Vertical social reels, sent in the first week",
      "Film prints handed to your guests on the night",
      "High-resolution edited images with print permission",
      "An online gallery you can share, with prints orderable from it",
      "Timeline planning and a written family-photograph plan",
      "A delivery date written into the contract, not promised in an email",
    ],
    excluded: ["Travel", "Sales tax", "Any add-on you choose"],
    excludedNote:
      "Travel is quoted as one agreed figure before you sign, and nothing is added to it afterwards.",

    /* ── The ladder ───────────────────────────────────────────────────────── */
    tiers: {
      kicker: "Three lengths of day",
      title: "Pick how much day you want",
      featuredLabel: "Most booked",
      items: [
        {
          name: CORE.name,
          price: money(CORE.price),
          meta: `${CORE.hours} hours · ${CORE.images}`,
          blurb: "A ceremony and a dinner in one place.",
          points: [
            "Six hours, one lead photographer",
            "Social reels and film prints",
            "Full gallery within 2 weeks",
            "No feature film or album at this tier",
          ],
        },
        {
          name: SIGNATURE.name,
          price: money(SIGNATURE.price),
          meta: `${SIGNATURE.hours} hours · ${SIGNATURE.images}`,
          blurb: "A getting-ready in one place and a reception in another. The honest default.",
          points: [
            "Eight hours, one lead photographer",
            "A 1-minute feature film, colour graded",
            "2 rolls of real film",
            `A ${ALBUM_SPECS.signature.size} album, ${ALBUM_SPECS.signature.pages}`,
            "Full gallery in 3 weeks",
          ],
          highlight: true,
        },
        {
          name: HEIRLOOM.name,
          price: money(HEIRLOOM.price),
          meta: `${HEIRLOOM.hours} hours · ${HEIRLOOM.images}`,
          blurb: "The whole thing, from the empty room to the floor at the end.",
          points: [
            "Ten hours, one lead photographer",
            "A 3-minute feature film, colour graded",
            "4 rolls of real film",
            `A ${ALBUM_SPECS.heirloom.size} album in ${ALBUM_SPECS.heirloom.cover}`,
            "Full gallery in 3 weeks",
          ],
        },
      ],
      footnote: "CAD before tax, the same in every city. Travel is quoted separately.",
    },

    /* ── The comparison ───────────────────────────────────────────────────── */
    compare: {
      intro: "The comparison worth making is against what the same day costs once you have hired everyone it takes.",
      colA: "A photographer alone",
      colB: "Photographer plus a videographer",
      colMine: `${SIGNATURE.name}, ${money(SIGNATURE.price)}`,
      rows: [
        { row: "Coverage", a: "Photography only", b: "Two vendors, two contracts", mine: "Photography and film, one contract" },
        { row: "Social reels", a: "Usually an add-on", b: "Quoted separately again", mine: "In every collection" },
        { row: "Something on the night", a: "Nothing until the gallery", b: "Nothing until the gallery", mine: "Film prints for your guests" },
        { row: "Gallery date", a: "“Six to eight weeks”", b: "Two timelines to chase", mine: "A date in the contract" },
        { row: "Price by city", a: "Rises with the postcode", b: "Rises with the postcode, twice", mine: "The same everywhere" },
      ],
      footnote: "All figures CAD before tax.",
    },

    /* ── Travel ───────────────────────────────────────────────────────────── */
    alternative: {
      kicker: "Before you ask",
      title: "Travel is extra, and you see it before you sign",
      paras: [
        "I work anywhere in Canada, and the collection costs the same wherever your wedding is. What changes is getting me there.",
        "Travel is quoted against your actual venue and date, agreed in writing, and nothing is added to it afterwards. Tell me where you are marrying and you will have the figure in the first reply.",
      ],
    },

    workNote: "Turn the pages.",

    /* ── What is included ─────────────────────────────────────────────────── */
    activities: {
      kicker: "Inside every collection",
      title: "Two things most photographers sell separately",
      albumKicker: "The work",
      intro: (
        <>
          <strong style={{ color: IN, fontWeight: 400 }}>Vertical social reels</strong> in the first week, while
          everyone is still asking to see something, and{" "}
          <strong style={{ color: IN, fontWeight: 400 }}>film prints handed to your guests on the night</strong>.
          Both are in every collection, including the smallest.
        </>
      ),
      columns: [
        {
          title: "In every collection",
          items: [
            "Vertical social reels, first week",
            "Film prints on the night",
            "A preview inside 48 hours",
            "Timeline and family-photograph planning",
            "A gallery date in your contract",
          ],
        },
        {
          title: "Signature and Heirloom add",
          items: [
            "A colour-graded feature film",
            "Real film, processed and scanned",
            "A designed album, not a credit toward one",
            "A planning call, and a location scout on Heirloom",
          ],
        },
      ],
      albumNote: "1980s film stock, shot on real cameras. One of five albums on the portfolio.",
    },

    /* ── Reviews ──────────────────────────────────────────────────────────── */
    reviews: {
      kicker: "Their words, not mine",
      title: "What couples actually wrote",
      intro: "Screenshots of what couples sent, in the app they sent it in. Typos and all.",
      items: REVIEWS,
    },

    /* ── About ────────────────────────────────────────────────────────────── */
    aboutKicker: "The person behind the camera",
    aboutTitle: "One wedding a day, shot by me",
    aboutParas: [
      "I'm Arman. I photograph weddings across Canada, and I take one a day, so the date you book is the only thing on my calendar.",
      "Documentary first, editorial when it earns it. I stay out of the ceremony and direct properly for the ten minutes of portraits, because standing two people in a field and saying “just be natural” is not direction.",
    ],
    aboutPortrait: {
      src: "https://cdn.armanarai.ca/about/arman-portrait-landing.png",
      alt: "Arman Arai in a white dinner jacket and panama hat on a stone terrace at golden hour",
      caption: "Arman · behind the camera",
    },

    /* ── FAQ, short ───────────────────────────────────────────────────────── */
    faq: [
      {
        q: "Is the price the same in every city?",
        a: `Yes. Core is ${money(CORE.price)} wherever your wedding is. The photography is the same work, so it carries the same number. Travel is quoted separately.`,
      },
      {
        q: "Which collection do we need?",
        a: "If the ceremony and dinner are in one place, six hours is enough and I will say so. The moment there is a getting-ready across town or a late reception, take Signature. We work this out on the call.",
      },
      {
        q: "Do you shoot video?",
        a: "A colour-graded feature film comes with Signature and Heirloom, shot alongside the photographs. Vertical social reels are in all three. A dedicated videographer is a separate add-on.",
      },
      {
        q: "What if it rains?",
        a: "We shoot. Every timeline names a covered location I have already looked at, and I carry the lighting to make an indoor room work.",
      },
      {
        q: "How far ahead do couples book?",
        a: "Nine to eighteen months for a peak-season Saturday. If your date is close, ask anyway.",
      },
      {
        q: "How do we hold a date?",
        a: "Thirty per cent to book, balance due 30 days before the wedding, and it can be split. Nothing is taken on the call.",
      },
    ],

    /* ── The calendar, which is the point of the page ─────────────────────── */
    booking: {
      kicker: "Availability, live",
      title: "Pick a time. The calendar is right here.",
      blurb:
        "Thirty minutes: whether your date is open, which collection fits, and what the travel costs. No deposit taken on the call.",
    },

    finalKicker: "One wedding a day. 2027 and 2028 dates are open.",

    receiptTitle: "The Signature Collection",
    receiptStamp: "Eight hours · photography and film",
    receiptPriceLabel: "The day",

    /* ── The form ─────────────────────────────────────────────────────────── */
    form: {
      leadMethod: "weddings_2728_form",
      inquiryLabel: "2027/2028 Wedding Inquiry",
      monthOptions: [
        "2027 · Spring", "2027 · Summer", "2027 · Autumn", "2027 · Winter",
        "2028 · Spring", "2028 · Summer", "2028 · Autumn", "2028 · Winter",
        "Still deciding",
      ],
      locationLabel: "Where is the wedding?",
      locationOptions: [
        "Ontario", "Québec", "British Columbia", "Alberta",
        "Atlantic Canada", "Prairies", "Not decided yet",
      ],
      guestsLabel: "Roughly how many guests?",
      guestOptions: ["Under 30", "30 to 80", "80 to 150", "More than 150", "Still deciding"],
    },
  };
}

/** The share card. */
export const LANDING_OG_IMAGE = at(LANDING_PAGE[4].src, 1200);
