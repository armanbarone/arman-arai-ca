import { PromoConfig } from "@/components/promo/PromoPage";
import { ALBUM_SPECS, TIERS } from "@/lib/site";
import { HOME_GRID, LANDING_PAGE, at } from "@/lib/images";

/* ═══════════════════════════════════════════════════════════════════════════
   /2728-weddings — the Google Ads landing page for 2027 and 2028 dates.

   ONE JOB: get the call booked. Every block earns its place by moving somebody
   toward the calendar, or it is cut. The order is deliberate:

     hero            the offer in one line, with the call as the only action
     the day         proof I know how a wedding actually runs
     what you get    the offer as an object, with the price on it
     the collections three ways in, so "how much?" is answered before the call
     the comparison  reframes the price against what the day really costs
     travel          the one honest caveat, handled early so it is not a shock
     what's included the two things nobody else gives them
     the album       proof the work is good
     the reviews     proof other people thought so
     about           two lines, because nobody books a call over a biography
     faq             the objections that actually stop people booking
     the calendar    the point of the page

   COPY RULES, learned the hard way on this page:
     - Never describe a collection by what it lacks. "No album at this tier" is
       a reason not to buy; the same fact framed as what you DO get is a reason
       to ask.
     - Never name a home city, and never include anything location-specific.
       This runs nationally, so any of it is wrong for most of the country the
       moment the ad serves there.
     - Prices come from lib/site.ts, never typed here, so this page cannot
       quote a figure /pricing has moved off.
   ═══════════════════════════════════════════════════════════════════════════ */

const IN = "#e8dfd0";

const [ENTRY, SIGNATURE, COMPLETE] = TIERS;
const money = (n: number) => `$${n.toLocaleString("en-CA")}`;

/** The review screenshots, from the set /reviews publishes. Intrinsic
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
    priceFounding: ENTRY.price,
    pricePrefix: "From",
    badge: "Booking 2027 and 2028",
    coversTitle: "What you get",
    anchorNote: "The same price wherever you marry. Travel quoted separately.",
    taxNote: "before tax",

    /* ── Hero ─────────────────────────────────────────────────────────────── */
    heroPool: {
      images: LANDING_PAGE.map((ph) => ph.src),
      alts: LANDING_PAGE.map((ph) => ph.alt),
      // One frame on a phone. Three measured at 4.2s LCP; desktop keeps all three.
      mobileFrames: 1,
    },
    filmStrip: false,
    heroImg: LANDING_PAGE[0].src,
    heroAlt: LANDING_PAGE[0].alt,
    kicker: "Weddings across Canada · 2027 and 2028",
    h1Plain: "Creative wedding photography, ",
    h1Accent: "built around your day.",
    heroSub:
      "No two weddings get the same plan, and none of them get a shot list off the internet. " +
      "Tell me what your day looks like on a 30-minute call and I will tell you whether your " +
      "date is open and exactly what it costs.",
    heroSubShort:
      "No two weddings get the same plan. Book a 30-minute call: I will tell you if your date is " +
      "open and exactly what it costs.",

    /* ── The day: proof I know how a wedding runs ─────────────────────────── */
    timelineKicker: "",
    timelineIntro:
      "Built backwards from the last hour of light, with slack where the morning always runs late.",
    timeline: [
      { n: "01", t: "The quiet room", d: "The dress on the door, the rings on a windowsill, your mother trying not to start early. The frames people are surprised by a year later." },
      { n: "02", t: "The ceremony", d: "Shot from the edges with long lenses and no flash. Nobody should remember a photographer being there, and the frames are better when nobody is performing." },
      { n: "03", t: "The family photographs", d: "Twelve groups and two callers, agreed in writing beforehand. Twenty minutes, instead of the hour everybody dreads." },
      { n: "04", t: "Ten minutes that are yours", d: "I hold back part of the golden hour for the two of you. It is usually the only time you get alone all day, and usually the best frames in the gallery." },
      { n: "05", t: "The room, and the floor", d: "Dinner, the speech that goes off script, and the last hour when everyone stops posing. Film prints go round while it is still happening." },
    ],

    images: {
      activitiesBanner: at(HOME_GRID[5].src, 1600),
      activitiesBannerAlt: HOME_GRID[5].alt,
      alternativeImg: at(HOME_GRID[2].src, 1000),
      alternativeImgAlt: HOME_GRID[2].alt,
    },

    /* ── What you get ─────────────────────────────────────────────────────── */
    receiptBrand: "Arman Arai · Wedding Photography",
    footerByline: "Arman Arai · Wedding Photography · Across Canada",
    receiptTitle: "The Signature Collection",
    receiptStamp: "Eight hours · photography and film",
    receiptPriceLabel: "From",
    included: [
      "Vertical social reels, in your hands the first week",
      "Film prints, handed to your guests on the night",
      "An online gallery, yours to share, with prints and albums to order",
      "High-resolution images with full print permission",
      "A timeline and a written family-photograph plan",
      "A delivery date written into the contract",
    ],
    excludedTitle: "Quoted separately, before you sign",
    excluded: ["Travel to your venue", "Sales tax"],
    excludedNote:
      "Agreed in writing before you book, never added to afterwards, and lower when " +
      "your date groups with others in your region.",

    /* ── The collections ──────────────────────────────────────────────────── */
    tiers: {
      kicker: "Three ways in",
      title: "Pick how much of the day you want covered",
      featuredLabel: "Most booked",
      items: [
        {
          name: ENTRY.name,
          price: money(ENTRY.price),
          meta: `${ENTRY.hours} hours · ${ENTRY.images}`,
          blurb: "A ceremony and a dinner in one place, covered properly.",
          points: [
            "Six hours of coverage",
            "Vertical social reels in the first week",
            "Film prints for your guests on the night",
            "Online gallery within 2 weeks, with prints and albums available to order",
          ],
        },
        {
          name: SIGNATURE.name,
          price: money(SIGNATURE.price),
          meta: `${SIGNATURE.hours} hours · ${SIGNATURE.images}`,
          blurb: "Getting ready in one place, a reception in another. What most couples take.",
          points: [
            "Eight hours of coverage",
            "A 1-minute feature film, colour graded",
            "2 rolls of real film, processed and scanned",
            `A ${ALBUM_SPECS.signature.size} album included, ${ALBUM_SPECS.signature.pages}`,
            "Online gallery in 3 weeks",
          ],
          highlight: true,
        },
        {
          name: COMPLETE.name,
          price: money(COMPLETE.price),
          meta: `${COMPLETE.hours} hours · ${COMPLETE.images}`,
          blurb: "The whole thing, from the empty room in the morning to the floor at the end.",
          points: [
            "Ten hours of coverage",
            "A 3-minute feature film, colour graded",
            "4 rolls of real film, processed and scanned",
            `A ${ALBUM_SPECS.heirloom.size} album in ${ALBUM_SPECS.heirloom.cover}`,
            "Online gallery in 3 weeks",
          ],
        },
      ],
      footnote:
        "CAD before tax, and the same wherever you marry. We settle which one fits on the call.",
    },

    /* ── The comparison ───────────────────────────────────────────────────── */
    compare: {
      intro: "Worth comparing against what the same day costs once you have hired everyone it takes.",
      colA: "A photographer alone",
      colB: "Photographer plus a filmmaker",
      colMine: `${SIGNATURE.name}, ${money(SIGNATURE.price)}`,
      rows: [
        { row: "Coverage", a: "Photography only", b: "Two vendors, two contracts", mine: "Photography and film, one contract" },
        { row: "Social reels", a: "Usually an add-on", b: "Quoted separately again", mine: "In every collection" },
        { row: "On the night", a: "Nothing until the gallery", b: "Nothing until the gallery", mine: "Film prints for your guests" },
        { row: "Delivery", a: "“Six to eight weeks”", b: "Two timelines to chase", mine: "A date in the contract" },
        { row: "Price by city", a: "Rises with the postcode", b: "Rises with the postcode, twice", mine: "The same wherever you marry" },
      ],
      footnote: "All figures CAD before tax.",
    },

    /* ── Travel ───────────────────────────────────────────────────────────── */
    alternative: {
      kicker: "Before you ask",
      title: "Travel is separate and kept lean",
      paras: [
        "I work anywhere in Canada and the collection costs the same wherever your wedding is. The only variable is the trip.",
        "It is booked on the leanest practical route, quoted against your actual venue and date, and written into the contract. When your date groups with others already in your region, it comes down or disappears, which is a good reason to talk early.",
      ],
    },

    workNote: "Turn the pages.",

    /* ── The two things nobody else includes ─────────────────────────────── */
    activities: {
      kicker: "In every collection",
      title: "Two things most photographers charge extra for",
      albumKicker: "The work",
      ticketStub: "Every collection",
      intro: (
        <>
          <strong style={{ color: IN, fontWeight: 400 }}>Vertical social reels</strong> in the first
          week, while everyone is still asking to see something, and{" "}
          <strong style={{ color: IN, fontWeight: 400 }}>film prints handed to your guests on the
          night</strong>, so people leave holding a photograph instead of waiting for a link.
        </>
      ),
      columns: [
        {
          title: "Every collection",
          items: [
            "Vertical social reels, first week",
            "Film prints on the night",
            "A preview inside 48 hours",
            "Timeline and family-photograph planning",
            "An online gallery, with prints and albums to order",
            "A delivery date in your contract",
          ],
        },
        {
          title: "Signature and Complete add",
          items: [
            "A colour-graded feature film of your day",
            "Real film, processed and scanned",
            "A designed album on Complete, included rather than a credit toward one",
            "A planning call, and a location scout on Complete",
          ],
        },
      ],
      albumNote: "1980s film stock, shot on real cameras. One of five albums on the portfolio.",
    },

    /* ── Proof ────────────────────────────────────────────────────────────── */
    reviews: {
      kicker: "Their words, not mine",
      title: "What couples actually wrote",
      intro: "Screenshots of what couples sent, in the app they sent it in. Typos and all.",
      items: REVIEWS,
    },

    /* ── About: two lines, because nobody books over a biography ─────────── */
    aboutKicker: "Who you would be working with",
    aboutTitle: "One wedding a day, shot by me",
    aboutParas: [
      "I'm Arman. I photograph weddings across Canada, and I only take one a day, so the date you book is the only thing on my calendar that day.",
      "Documentary through the parts you cannot repeat, and properly directed for the ten minutes of portraits, because standing two people in a field and saying “just be natural” is not direction.",
    ],
    aboutPortrait: {
      src: "https://cdn.armanarai.ca/about/arman-portrait-landing.png",
      alt: "Arman Arai in a white dinner jacket and panama hat on a stone terrace at golden hour",
      caption: "Arman · behind the camera",
    },

    /* ── The objections that actually stop people booking ────────────────── */
    faq: [
      {
        q: "What happens on the call?",
        a: "Thirty minutes. You tell me the date, the venue and roughly how the day runs; I tell you whether I am free, which collection fits and what the travel costs. Nothing is taken on the call, and there is no follow-up sequence afterwards.",
      },
      {
        q: "Does the price change depending on where we marry?",
        a: `No. Essential is ${money(ENTRY.price)} wherever your wedding is. Travel to your venue is quoted on top and agreed in writing before you book.`,
      },
      {
        q: "Which collection do we need?",
        a: "If the ceremony and the dinner are in one place, six hours is genuinely enough and I will say so. Once there is a getting-ready across town or a reception that runs late, eight is the honest answer. We settle it on the call.",
      },
      {
        q: "Do you shoot video too?",
        a: "Vertical social reels come with every collection. Signature and Complete add a colour-graded feature film of the day, shot alongside the photographs. Photo + Film puts a dedicated filmmaker on the day for a longer piece, and that filmmaker can be added to any other collection.",
      },
      {
        q: "What if it rains?",
        a: "We shoot. Every timeline names a covered location I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery.",
      },
      {
        q: "Is our date still open?",
        a: "Peak-season Saturdays usually go nine to eighteen months ahead, and I only take one wedding a day. Pick a time on the calendar below and I will tell you about your date on the call.",
      },
    ],

    /* ── The point of the page ───────────────────────────────────────────── */
    booking: {
      kicker: "Availability, live",
      title: "Pick a time. The calendar is right here.",
      blurb:
        "Thirty minutes: whether your date is open, which collection fits your day, and what the travel costs. No deposit, no pressure, no follow-up sequence.",
    },

    finalKicker: "One wedding a day. 2027 and 2028 dates are open.",

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
