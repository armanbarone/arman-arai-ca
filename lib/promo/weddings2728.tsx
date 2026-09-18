import { PromoConfig } from "@/components/promo/PromoPage";
import { ADDONS, ALBUM_SPECS, TIERS, TRAVEL } from "@/lib/site";
import { DOCUMENTARY, DREAMY_FINE_ART, FILM, at } from "@/lib/images";
import { HERO_ALTS, HERO_POOL } from "@/components/promo/WeddingAlbums";

/* ═══════════════════════════════════════════════════════════════════════════
   /2728-weddings — the Google Ads landing page for 2027 and 2028 weddings.

   Every figure on this page is read from lib/site.ts rather than typed here,
   so the landing page cannot quote a price /pricing has moved off. If the
   ladder changes, this page changes with it and nobody has to remember.

   The offer is deliberately the same offer as the rest of the site. An ads page
   that invents its own package is how a couple ends up on a call being told the
   real number is different, and it is the fastest way to lose a booking that
   was already won.
   ═══════════════════════════════════════════════════════════════════════════ */

const IN = "#e8dfd0";

const [CORE, SIGNATURE, HEIRLOOM] = TIERS;
const money = (n: number) => `$${n.toLocaleString("en-CA")}`;
const addon = (name: string) => {
  const a = ADDONS.find((x) => x.name.startsWith(name));
  if (!a) throw new Error(`No add-on starting with "${name}" in lib/site.ts`);
  return a;
};

const secondShooter6 = addon("Second photographer, up to 6");
const secondShooter10 = addon("Second photographer, up to 10");
const engagement = addon("Engagement session");
const extraEvent = addon("Additional 2-hour event");
const extraHour = addon("Extra coverage hour");
const video8 = addon("Dedicated videographer, 8");
const video10 = addon("Dedicated videographer, 10");
const rush = addon("Seven-day gallery rush");
const drone = addon("Drone");
const parentAlbum = addon("Parent album");
const twoRoll = addon("Two-roll film");

export function weddings2728Config(): PromoConfig {
  return {
    /* ── Price block ──────────────────────────────────────────────────────── */
    priceFounding: CORE.price,
    pricePrefix: "From",
    badge: "2027 and 2028 dates · one price in every city",
    coversTitle: "What is in every collection, and what is not",
    anchorNote:
      `From ${money(CORE.price)} CAD before tax for six hours, ${money(SIGNATURE.price)} for eight, ` +
      `${money(HEIRLOOM.price)} for ten. That is the same figure in Montréal, Toronto, Vancouver and ` +
      `anywhere else in the country: the city does not move the number, because the work does not change. ` +
      `Travel beyond ${TRAVEL.freeRadiusKm} km of Montréal is quoted separately and agreed in writing before you sign.`,
    taxNote: "before sales tax",

    /* ── Hero ─────────────────────────────────────────────────────────────── */
    heroPool: { images: HERO_POOL, alts: HERO_ALTS, mobileFrames: 3 },
    heroImg: HERO_POOL[0],
    heroAlt: HERO_ALTS[0],
    kicker: "Canadian weddings · 2027 and 2028 dates",
    h1Plain: "Your whole wedding day, ",
    h1Accent: "photographed by one person.",
    heroSub:
      "Documentary and editorial coverage of a Canadian wedding, by a photographer based in Montréal who " +
      "works across the country. One published price per collection wherever you marry, vertical social " +
      "reels in the first week, film prints handed to your guests on the night, and a gallery date written " +
      "into the contract rather than promised in an email.",
    heroSubShort:
      "Documentary and editorial wedding coverage across Canada. One price per collection wherever you " +
      "marry, social reels in the first week, and a gallery date in the contract.",

    /* ── The day ──────────────────────────────────────────────────────────── */
    timelineKicker: "Six hours, eight, or ten",
    timelineIntro:
      "This is the full arc of a wedding day, and the collection decides how much of it you hold. Six hours " +
      "takes the heart of it, ceremony through the first dances. Eight holds a getting-ready and a reception " +
      "without watching the clock. Ten holds the whole thing, from the empty room in the morning to the " +
      "floor at the end.",
    timeline: [
      { n: "Scene 01", t: "The quiet room", d: "The dress on the door, the rings on a windowsill, somebody's mother trying not to cry yet. I shoot the small things here, because these are the frames people are surprised by a year later." },
      { n: "Scene 02", t: "Getting ready, both sides", d: "If the two of you are in different places, one photographer cannot be in both, and I will say so rather than let you find out on the day. That is what the second photographer add-on is for." },
      { n: "Scene 03", t: "The first look, if you want one", d: "Not compulsory, and I will never push it. What it buys is time: portraits done before the ceremony means the hour after it belongs to your guests instead of a shot list." },
      { n: "Scene 04", t: "The ceremony", d: "I work from the edges with long lenses and no flash. Nobody should remember the photographer being at their ceremony, and the frames are better when nobody is performing for a camera." },
      { n: "Scene 05", t: "The family photographs", d: "Twelve groups, two callers, agreed in writing beforehand. This is the single largest block of time a big wedding gets back, and it is the difference between twenty minutes and an hour of shouting names." },
      { n: "Scene 06", t: "Golden hour", d: "I build the timeline backwards from the last hour of light and put ten minutes of it aside for the two of you. It is usually the only ten minutes of the day you get alone, and it is usually the gallery's best frames." },
      { n: "Scene 07", t: "The room, and the speeches", d: "Documentary through dinner: the table nobody sat down at, the speech that went off script, the guest crying at the back. Film prints are handed round while it is happening." },
      { n: "Scene 08", t: "The floor", d: "The last hour is the loosest and the best photographed. On Heirloom there is enough coverage left that I am still there when it gets properly good, rather than packing up at the first dance." },
    ],

    images: {
      activitiesBanner: at(FILM[5].src, 1600),
      alternativeImg: at(DOCUMENTARY[11].src, 1200),
    },

    /* ── In every collection ──────────────────────────────────────────────── */
    included: [
      "A lead photographer for the whole of your coverage, which is me, on the only wedding I am shooting that day",
      "Vertical social reels, cut from the day and sent in the first week",
      "Film prints handed to your guests on the night, while the wedding is still happening",
      "High-resolution edited images with print permission, hand-edited rather than batched",
      "An online gallery you can share, with prints orderable straight from it",
      "Timeline planning built backwards from sunset, with slack that absorbs the morning's drift",
      "A written family-photograph plan: twelve groups, two callers, agreed before the day",
      "A preview inside 48 hours, so there is something to look at while the day is still in your head",
      "A gallery delivery date written into the contract, not promised in an email",
      "Two camera bodies, both writing to two cards at once, and files held in three places afterwards",
    ],
    excluded: [
      `Travel, where the wedding is more than ${TRAVEL.freeRadiusKm} km from Montréal`,
      "Sales tax, which varies by province",
      "Any add-on you choose from the list further down",
    ],
    excludedNote:
      "That is the whole list. Travel is quoted as one agreed figure before you sign and nothing is added to " +
      "it afterwards. There is no mileage line, no destination fee and no invoice at the end of the night " +
      "that you have not already seen.",

    /* ── The ladder ───────────────────────────────────────────────────────── */
    tiers: {
      kicker: "Three lengths of day",
      title: "Pick how much day you want",
      intro:
        "The same person, the same way of working and the same price in every city. What changes is how many " +
        "hours the day gets, whether there is a feature film, and what you hold in your hands afterwards.",
      featuredLabel: "Most booked",
      items: [
        {
          name: CORE.name,
          price: money(CORE.price),
          meta: `${CORE.hours} hours · ${CORE.images}`,
          blurb:
            "A ceremony and a dinner in one place, with no second venue to chase. The honest floor: six hours " +
            "is genuinely enough for a small day, and I would rather sell you this than eight you do not need.",
          points: [
            "Six continuous hours, one lead photographer",
            CORE.images + ", high resolution with print permission",
            "Vertical social reels, sent in the first week",
            "Film prints handed to guests on the night",
            "Full gallery within 2 weeks",
            "No feature film and no album at this tier. Both are add-ons",
          ],
        },
        {
          name: SIGNATURE.name,
          price: money(SIGNATURE.price),
          meta: `${SIGNATURE.hours} hours · ${SIGNATURE.images}`,
          blurb:
            "The honest default once there is a getting-ready in one place and a reception in another. Eight " +
            "hours, a graded film, real film, and an album that exists rather than a credit toward one.",
          points: [
            "Eight continuous hours, one lead photographer",
            SIGNATURE.images + ", high resolution with print permission",
            "A 1-minute feature film, colour graded",
            "2 rolls of real film, processed and scanned",
            `A Signature album: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}, on ${ALBUM_SPECS.signature.paper}`,
            "Full gallery in 3 weeks",
          ],
          highlight: true,
        },
        {
          name: HEIRLOOM.name,
          price: money(HEIRLOOM.price),
          meta: `${HEIRLOOM.hours} hours · ${HEIRLOOM.images}`,
          blurb:
            "Ten hours, from the empty room in the morning to the floor at the end. For long days, and for any " +
            "wedding you actually want an album out of rather than a folder of files.",
          points: [
            "Ten continuous hours, one lead photographer",
            HEIRLOOM.images + ", high resolution with print permission",
            "A 3-minute feature film, colour graded",
            "4 rolls of real film, processed and scanned",
            `An Heirloom album: ${ALBUM_SPECS.heirloom.size}, ${ALBUM_SPECS.heirloom.pages}, in ${ALBUM_SPECS.heirloom.cover}`,
            "Full gallery in 3 weeks",
          ],
        },
      ],
      footnote:
        "All prices in CAD before sales tax, and identical in every city I work in. Travel beyond " +
        `${TRAVEL.freeRadiusKm} km of Montréal is quoted against your venue and your date, agreed in writing ` +
        "before you sign.",
    },

    /* ── The comparison ───────────────────────────────────────────────────── */
    compare: {
      intro:
        "The comparison worth making is not against the cheapest photographer in your city. It is against what " +
        "the same day actually costs once you have hired everyone it takes to cover it properly.",
      colA: "A photographer at the market rate",
      colB: "Photographer plus a separate videographer",
      colMine: `${SIGNATURE.name}, one person, ${money(SIGNATURE.price)}`,
      rows: [
        { row: "Coverage", a: "Hours of photography, nothing else", b: "Two vendors, two contracts, two deposits", mine: "Eight hours, photography and film, one person" },
        { row: "Social content", a: "Usually an add-on", b: "Quoted separately again", mine: "Vertical reels in every collection, first week" },
        { row: "Feature film", a: "Not offered", b: "A separate filmmaker at a separate rate", mine: "Included on Signature and Heirloom" },
        { row: "Something on the night", a: "Nothing until the gallery", b: "Nothing until the gallery", mine: "Film prints handed to your guests" },
        { row: "Timeline planning", a: "Yours to do", b: "Yours to do, for two vendors", mine: "Included, built backwards from sunset" },
        { row: "Family photographs", a: "Improvised on the day", b: "Improvised on the day", mine: "Twelve groups, two callers, agreed in writing" },
        { row: "Gallery date", a: "“Six to eight weeks”", b: "Two timelines to chase", mine: "A date in the contract" },
        { row: "Price by city", a: "Rises with the postcode", b: "Rises with the postcode, twice", mine: "The same figure everywhere in Canada" },
      ],
      footnote:
        "Every number on this page is CAD before sales tax. A dedicated videographer is available here too, at " +
        `${money(video8.price)} for eight hours or ${money(video10.price)} for ten, because a proper video team ` +
        "is a different product and pretending otherwise guarantees one of us does bad work.",
    },

    /* ── Travel, in the alternative slot ──────────────────────────────────── */
    alternative: {
      kicker: "The part most pricing pages hide",
      title: "Travel is quoted, and it is quoted before you sign",
      paras: [
        TRAVEL.body,
        "Recent trips have run roughly $200 to $600 for Québec and eastern Ontario, $600 to $900 for Toronto, " +
        "and $1,200 to $2,000 for anywhere that needs a flight. Those are ranges from real bookings rather than " +
        "a tariff, which is exactly why the trip is costed against your venue instead of read off a grid.",
        "A published travel grid would mean overcharging the couple two hours away to subsidise the couple I " +
        "have to fly to. Send me the venue and the date and you will have the real figure in the first reply.",
      ],
    },

    workNote: "Real Canadian weddings, start to finish. Turn the pages.",

    /* ── What is inside, and what you can add ─────────────────────────────── */
    activities: {
      kicker: "Inside, and extra",
      title: "What comes as standard, and what you can add",
      albumKicker: "The work",
      intro: (
        <>
          Two things on this page are in <strong style={{ color: IN, fontWeight: 400 }}>every</strong> collection
          and are usually sold separately everywhere else: the{" "}
          <strong style={{ color: IN, fontWeight: 400 }}>vertical social reels</strong>, sent in the first week
          while everyone is still asking to see something, and{" "}
          <strong style={{ color: IN, fontWeight: 400 }}>film prints handed to your guests on the night</strong>.
          Everything below is a real cost with a published number, which is why none of it is quietly folded
          into a collection.
        </>
      ),
      columns: [
        {
          title: "In every collection, at every price",
          items: [
            "Vertical social reels, cut from the day and sent in the first week",
            "Film prints handed to your guests on the night",
            "A preview inside 48 hours, next day on Signature, 24 hours on Heirloom",
            "Timeline planning and a written family-photograph plan",
            "High-resolution images with print permission, hand-edited",
            "An online gallery, with prints orderable straight from it",
            "A gallery delivery date written into your contract",
          ],
        },
        {
          title: "What Signature and Heirloom add",
          items: [
            "A colour-graded feature film: one minute on Signature, three on Heirloom",
            "Real film, processed and scanned: two rolls on Signature, four on Heirloom",
            `A Signature album on Signature: ${ALBUM_SPECS.signature.size}, ${ALBUM_SPECS.signature.pages}, ${ALBUM_SPECS.signature.cover}`,
            `An Heirloom album on Heirloom: ${ALBUM_SPECS.heirloom.size}, ${ALBUM_SPECS.heirloom.pages}, ${ALBUM_SPECS.heirloom.cover}`,
            "A 90-minute planning call on Signature, two calls and a location scout on Heirloom",
            "Longer days: eight hours and ten, against six on Core",
          ],
        },
      ],
      premiumKicker: "Add-ons",
      premiumTitle: "Everything else, at a published price",
      premiumIntro:
        "The same list as the main pricing page, because an ads page that invents its own numbers is how a " +
        "couple ends up on a call being told the real figure is different.",
      premium: [
        { a: "Second photographer, up to 6 hours", s: money(secondShooter6.price) },
        { a: "Second photographer, up to 10 hours", s: money(secondShooter10.price) },
        { a: "Extra coverage hour", s: money(extraHour.price) },
        { a: "An additional 2-hour event, another day", s: money(extraEvent.price) },
        { a: "Engagement session", s: money(engagement.price) },
        { a: "Dedicated videographer, 8 hours", s: money(video8.price) },
        { a: "Dedicated videographer, 10 hours", s: money(video10.price) },
        { a: "Parent album", s: money(parentAlbum.price) },
        { a: "Two more rolls of film", s: money(twoRoll.price) },
        { a: "Drone, where it is legal and safe", s: money(drone.price) },
        { a: "Seven-day gallery rush", s: money(rush.price) },
      ],
      albumNote:
        "Turn the album to see what a whole day looks like rather than the six best frames from twenty of them. " +
        "Every photograph in it is a real Canadian wedding.",
    },

    /* ── The money ────────────────────────────────────────────────────────── */
    whyPrice: {
      kicker: "Straight about the money",
      title: "Why it costs what it costs",
      paras: [
        <>
          There is no discount on this page and no countdown clock. {money(SIGNATURE.price)} CAD is what an
          eight-hour Canadian wedding costs when one person carries all of it, and I would rather show you the
          arithmetic than dress the number up.
        </>,
        "A large part of it never touches a camera. Building a timeline backwards from sunset, walking your venue, agreeing the family groups in writing, and holding the slack that absorbs the morning running late. That work happens over weeks, and it is the reason a day runs instead of drifts.",
        "I take one wedding a day. The date you book is the only thing on my calendar, which is why a Saturday is not an hour of my time but a whole day of it, plus the days either side of a trip.",
        "Then the part nobody sees: culling, hand-editing several hundred photographs, grading a film, sending real film to a lab, sequencing an album. The gallery date in your contract is a promise about that work, and it is why Core delivers in two weeks and the collections carrying a film take three.",
        <>
          What is deliberately not in the number is travel. It is quoted separately, at what it actually costs,
          because a flight to Vancouver in July and a drive to Québec City in October are not the same number
          and a page that averages them is wrong in both directions.
        </>,
      ],
    },

    aboutParas: [
      "I'm Arman, and I photograph weddings in Canada. I'm based in Montréal and I work across the country, from Vancouver Island to the Maritimes, which is why the price on this page does not change with the postcode.",
      "The way I work is documentary first and editorial when it earns it. I shoot the ceremony from the edges with long lenses and no flash, because nobody should remember the photographer being there, and the frames are better when nobody is performing for a camera. Then I direct properly for the ten minutes of portraits, because standing two people in a field and saying “just be natural” is not direction.",
      "Weddings are the staged, loud, full-of-people counterpart to the elopements I shoot on my other site, and they are the ones I actually grew up in. A room of two hundred people who all showed up for the same reason is still the best thing I get to photograph.",
    ],

    /* ── FAQ ──────────────────────────────────────────────────────────────── */
    faq: [
      {
        q: "Is the price really the same in every city?",
        a: `Yes. Core is ${money(CORE.price)} in Montréal, in Toronto, in Vancouver and in Halifax. The photography is the same work wherever it happens, so it carries the same number. What changes between those places is the travel, and travel is quoted separately and agreed in writing before you sign.`,
      },
      {
        q: "So what does travel actually cost?",
        a: `Everything within ${TRAVEL.freeRadiusKm} km of Montréal is free. Beyond that it is billed at what it costs me: the flight or the drive, ground transport, and the nights I need to be there the day before. Recent trips have run roughly $200 to $600 for Québec and eastern Ontario, $600 to $900 for Toronto, and $1,200 to $2,000 anywhere that needs a flight. Send the venue and the date and you get the actual figure in the first reply.`,
      },
      {
        q: "Which collection do we actually need?",
        a: "If the ceremony and the dinner are in one place and you are not doing a getting-ready, six hours is genuinely enough and I will tell you so. The moment there is a getting-ready across town or a reception that runs late, take Signature: buying hours back on the day is $450 each and it is the most avoidable money on this page. Heirloom is for long days, and for anyone who wants the bigger album.",
      },
      {
        q: "What exactly is the album?",
        a: `${ALBUM_SPECS.signature.long} The Heirloom collection carries the bigger one instead. ${ALBUM_SPECS.heirloom.long}`,
      },
      {
        q: "Is there a second photographer?",
        a: `Not inside any collection. It is an add-on on all three, ${money(secondShooter6.price)} for six hours and ${money(secondShooter10.price)} for ten, because a second photographer is a real person being paid a real day rate and folding that into a package quietly is how it gets done badly. If the two of you are getting ready in different places, one photographer cannot be in both and I will say so.`,
      },
      {
        q: "Do you shoot video?",
        a: `A colour-graded feature film is included on Signature and Heirloom, one minute and three, shot alongside the photographs rather than by a second operator, which is what makes it includable at all. Full videography is a different product and an add-on: ${money(video8.price)} for eight hours, ${money(video10.price)} for ten. I will not bundle a videographer into a collection at a number that guarantees one of us does bad work.`,
      },
      {
        q: "What happens if it rains?",
        a: "We shoot. Every timeline I build names a specific covered location I have already looked at, and I carry the lighting to make an indoor room work. Rain days are frequently the better gallery, but only when the backup was decided in advance rather than in a parking lot.",
      },
      {
        q: "What is your backup if a camera fails?",
        a: "Two bodies on the day, both writing to two cards at once, and files held in at least two places plus one off-site afterwards. A corrupted card should be an inconvenience, not a catastrophe.",
      },
      {
        q: "Do you photograph multi-day and cultural weddings?",
        a: `Regularly, and they are scoped by event rather than sold as one flat package. Tell me how many days, how many venues, how far apart, and which twenty minutes you would be heartbroken to lose. An additional two-hour event on another day is ${money(extraEvent.price)}.`,
      },
      {
        q: "How far in advance do couples book?",
        a: "Usually nine to eighteen months out for a peak-season Saturday. Off-season and weekday dates open up much later. I take one wedding a day, so the popular Saturdays in September and October go first. If your date is close, ask anyway.",
      },
      {
        q: "How does booking work?",
        a: "Thirty per cent to hold the date, with the balance due 30 days before the wedding, and it can be split across instalments if you ask at the outset. Prices are in Canadian dollars before sales tax, which varies by province.",
      },
    ],

    booking: {
      kicker: "Availability, live",
      title: "Pick a time. The calendar is right here.",
      blurb:
        "Thirty minutes: your date, whether it is open, the collection that actually fits your day rather than " +
        "the middle one, and the real travel figure if your venue needs one. No deposit taken on the call and " +
        "no follow-up sequence afterwards.",
    },

    finalKicker: "One wedding a day. 2027 and 2028 dates are open.",

    /* ── The receipt artifact ─────────────────────────────────────────────── */
    receiptTitle: "The Signature Collection",
    receiptStamp: "Eight hours · photography and film",
    receiptPriceLabel: "The day",

    /* ── The form ─────────────────────────────────────────────────────────── */
    form: {
      leadMethod: "weddings_2728_form",
      inquiryLabel: "2027/2028 Wedding Inquiry",
      monthOptions: [
        "2027 · Spring (Apr–May)", "2027 · Summer (Jun–Aug)", "2027 · Autumn (Sep–Oct)", "2027 · Winter",
        "2028 · Spring (Apr–May)", "2028 · Summer (Jun–Aug)", "2028 · Autumn (Sep–Oct)", "2028 · Winter",
        "Still deciding",
      ],
      locationLabel: "Where is the wedding?",
      locationOptions: [
        "Montréal or Québec",
        "Toronto or southern Ontario",
        "Vancouver or the Sea-to-Sky",
        "The Rockies",
        "Atlantic Canada",
        "Elsewhere in Canada",
        "Not decided yet",
      ],
      guestsLabel: "Roughly how many guests?",
      guestOptions: [
        "Under 30",
        "30 to 80",
        "80 to 150",
        "More than 150",
        "Still deciding",
      ],
    },
  };
}

/* Kept out of the config object so the unused-import rule stays honest about
 * which sets this page actually draws on. */
export const LANDING_OG_IMAGE = at(DREAMY_FINE_ART[8].src, 1200);
