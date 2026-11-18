import { SITE, TERMS, type Tier } from "./site";
import { weddingCalendarUrl } from "./wedding-booking";
import { pricingMarket, pricingTiers, longDate, weekdayOf, type PricingMarket } from "./ads/pricing-request";
import { vendorCity } from "./vendors";

/* The first email a couple gets, from any form on either site.
 *
 * It is a FIXED, informational email (owner, 2026-10-14: "the automated email
 * should be just informational (about general stuff). Mention that i will
 * reply back personally within 60 minutes"). No model writes any part of it.
 * The Claude call that used to compose a personal note here, its brief in
 * lib/auto-reply-brief.ts, and the per-inquiry /guide/<id> page it linked to
 * are all gone: the personal reply is the one Arman sends himself, within the
 * hour, and this email exists to answer the four things every couple asks
 * before that reply lands.
 *
 * Those four, in his order:
 *   1. Full pricing
 *   2. The welcome guide, at /wedding-guide
 *   3. Securing the date, by booking a call
 *   4. The preferred vendor list, at /preferred-vendors
 *
 * Plus three COMPLETE wedding albums, which is the part that does the selling:
 * every frame of a day, not a highlight reel.
 *
 * Everything with a number in it is rendered from lib/site.ts, so a price
 * change reaches this email, the pricing page and the landing pages together.
 * There is nothing to verify after the fact because there is nothing
 * generated: if you change a sentence here, that sentence is what every
 * couple reads.
 */

export type Inquiry = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  referral: string;
  /** ISO "2027-06-12", or free text from the site forms, or empty. */
  weddingDate?: string;
  location: string;
  message: string;
  /** Set only by the ads landing pages, for the travel line and the vendor anchor. */
  market?: PricingMarket;
  cityName?: string;
  /** "wedding-photography/vancouver-pricing", for the calendar's utm_content. */
  page: string;
  /** When the form was sent (ms). The email waits until 30 seconds after it. */
  receivedAt: number;
};

/* The couple gets the email about half a minute after pressing the button,
   not the instant they press it (owner, 2026-10-01). */
const SEND_DELAY_MS = 30_000;

/* Owner, 2026-10-14, asked for this line verbatim and chose to keep it fixed
   rather than shifting it to "tomorrow" late at night. It is one constant so
   the time can be changed in a single place. */
const TONIGHT_CALL = "I'm available for a quick call at 7:30 PM tonight";

/** The three complete weddings the email leads with. Slugs exist in
 *  lib/galleries.ts; the frames are chosen by eye, because the stored `cover`
 *  on all three is an abstract (a doorway, a dessert table, an arch) that does
 *  not read as a wedding at thumbnail size in an inbox. */
const ALBUMS = [
  {
    slug: "anastasia-daniil",
    names: "Anastasia & Daniil",
    where: "A house by the sea",
    frame: "galleries/anastasia-daniil/6a13d545e05851175c7318a1.png",
    alt: "Anastasia in her veil, holding her bouquet, the coast behind her",
  },
  {
    slug: "sofia-lucas",
    names: "Sofia & Lucas",
    where: "A garden, late spring",
    frame: "galleries/sofia-lucas/6a151a0660ad4b061938487f.png",
    alt: "Sofia at an open window in her veil, bouquet in both hands",
  },
  {
    slug: "margaux-antoine",
    names: "Margaux & Antoine",
    where: "A château in the Lot",
    frame: "galleries/margaux-antoine/6a15234d0397b3655e6d05c4.png",
    alt: "Margaux and Antoine kissing on the garden path, her veil over her shoulder",
  },
];

/* ── Email design ──────────────────────────────────────────────────────────
 * The light half of the site's palette, hard-coded, because an email cannot
 * read a stylesheet. The page colour is a shade darker than the card so the
 * message reads as a printed thing lying on a surface.
 *
 * It also has to be declared. Until 2026-11-17 this email set no background at
 * all, so a dark-mode inbox supplied its own and the whole thing arrived as
 * text on black (owner: "it's just text against a blackish background"). The
 * fix is three things together, and none of them works alone: the colour-scheme
 * metas in the head, bgcolor attributes as well as CSS on every coloured cell,
 * and no transparent text. Do not remove any of the three.
 */
const C = {
  page: "#E3DACA",
  card: "#FBF8F3",
  panel: "#F2EBE0",
  rule: "#DED3BE",
  ink: "#211C15",
  body: "#5F5344",
  muted: "#7A6D5C",
  bronze: "#8A6A44",
  bronzeDeep: "#5F4728",
  onDark: "#E8E0D0",
  onDarkMuted: "#A79784",
  whatsapp: "#25D366",
};
const SERIF = "Georgia,'Times New Roman',serif";
const SANS = "Arial,Helvetica,sans-serif";

/** The one photograph the design hangs on, opened and looked at through the
 *  resizer at the size the email asks for, on 2026-11-17.
 *
 *  There is exactly one, and there was briefly a second: a full-bleed frame
 *  between the three albums and the approach section, put there to separate
 *  them. The owner rejected it the same day ("this approach is not the way").
 *  Sections in this email are separated typographically, by the divider below
 *  and by the eyebrows, never by dropping another photograph in. The three
 *  album thumbnails are the only other imagery and they are there to be
 *  clicked, not to break up the page. */
const HERO_IMAGE = {
  path: "cities/vancouver-island/vancouver-island-04.webp",
  alt: "A couple standing forehead to forehead at the edge of still water in low golden light",
};

const money = (amount: number) => `C$${amount.toLocaleString("en-CA")}`;
const escapeHtml = (value: string) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Cloudflare's resizer on the R2 host, so an album frame is a sane size in
 *  an inbox rather than a multi-megabyte original. */
const cdn = (path: string, w: number, h: number) =>
  `https://cdn.armanarai.ca/cdn-cgi/image/format=jpeg,quality=78,width=${w},height=${h},fit=cover,gravity=auto/${path}`;

export function autoReplyEnabled() {
  return Boolean(process.env.RESEND_API_KEY);
}

/** An ISO date reads as "Saturday, 12 June 2027"; anything the couple typed
 *  by hand is shown exactly as they typed it and never reinterpreted. */
function whenPhrase(inquiry: Inquiry) {
  const date = inquiry.weddingDate?.trim();
  if (!date) return "";
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return `${weekdayOf(date)}, ${longDate(date)}`;
  return date;
}

/** Fixed, so the subject always says plainly what the email is (owner,
 *  2026-10-01). */
export function replySubject(inquiry: Inquiry) {
  const about = [inquiry.firstName, whenPhrase(inquiry)].filter(Boolean).join(", ");
  return `Your wedding photography inquiry${about ? `: ${about}` : ""}`.replace(/[\r\n]+/g, " ").slice(0, 140);
}

/** An email button that renders as a block in every client, Outlook included:
 *  a full-width table cell, not a styled link on its own. */
function bigButton(href: string, label: string, background: string, color: string) {
  const edge = background === C.panel ? `border:1px solid ${C.rule};` : "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:4px 0 6px;"><tr><td align="center" bgcolor="${background}" style="background:${background};border-radius:7px;${edge}"><a href="${escapeHtml(href)}" style="display:block;padding:17px 20px;font-family:${SANS};font-size:14px;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;line-height:1.3;color:${color};text-decoration:none;border-radius:7px;">${escapeHtml(label)}</a></td></tr></table>`;
}

function sectionHeading(number: string, title: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">
    <tr>
      <td width="64" valign="middle" style="width:64px;white-space:nowrap;font-family:${SERIF};font-size:12px;letter-spacing:.2em;text-transform:uppercase;color:${C.bronze};">${escapeHtml(number)}</td>
      <td valign="middle" style="padding:0 0 0 4px;"><div style="height:1px;max-height:1px;overflow:hidden;background:${C.rule};font-size:1px;line-height:1px;">&nbsp;</div></td>
    </tr>
  </table>
  <p class="h2" style="margin:0 0 12px;font-family:${SERIF};font-weight:normal;font-size:27px;line-height:1.15;color:${C.ink};">${escapeHtml(title)}</p>`;
}

/** A small uppercase label. */
function eyebrow(text: string) {
  return `<p style="margin:0 0 9px;font-family:${SANS};font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:${C.bronze};">${escapeHtml(text)}</p>`;
}

/** A serif sub-heading inside a section. */
function subTitle(text: string, top = 0) {
  return `<p style="margin:${top}px 0 12px;font-family:${SERIF};font-weight:normal;font-size:22px;line-height:1.2;color:${C.ink};">${escapeHtml(text)}</p>`;
}

/** Body copy. One place, so the whole email has one measure and one colour. */
function para(text: string, size = 15) {
  return `<p style="margin:0 0 14px;font-family:${SANS};font-size:${size}px;line-height:1.7;color:${C.body};">${escapeHtml(text)}</p>`;
}

/** The site's own section divider: a hairline either side of a small bronze
 *  mark. Three cells rather than a border, because a styled hairline with a
 *  character sitting in it is the one thing every email client renders the
 *  same way. This is how sections are separated here. */
function divider() {
  const line = `<td valign="middle" style="padding:0;"><div style="height:1px;max-height:1px;overflow:hidden;background:${C.rule};font-size:1px;line-height:1px;">&nbsp;</div></td>`;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
    <tr>
      ${line}
      <td width="34" align="center" valign="middle" style="width:34px;font-family:${SERIF};font-size:12px;line-height:1;color:${C.bronze};">&#10022;</td>
      ${line}
    </tr>
  </table>`;
}

/** A full-bleed photograph across the card. */
function band(image: { path: string; alt: string }, height: number) {
  return `<tr><td style="padding:0;font-size:0;line-height:0;"><img class="band" src="${cdn(image.path, 1200, height * 2)}" width="600" height="${height}" alt="${escapeHtml(image.alt)}" style="display:block;width:100%;max-width:600px;height:auto;border:0;"></td></tr>`;
}

/** One padded row of the single-column layout. */
function row(inner: string, top = 30, bottom = 0) {
  return `<tr><td class="px" style="padding:${top}px 34px ${bottom}px;">${inner}</td></tr>`;
}

/** The three complete weddings, side by side. A three-cell table rather than
 *  stacked images: it survives Outlook, and three full-width photographs
 *  would push everything below them off the first two screens. */
function albumsBlock() {
  const cells = ALBUMS.map((album) => `<td class="stack" width="33.3%" valign="top" style="padding:0 5px;">
      <a href="${SITE.url}/galleries/${album.slug}" style="text-decoration:none;color:${C.ink};">
        <img src="${cdn(album.frame, 360, 480)}" width="176" alt="${escapeHtml(album.alt)}" style="display:block;width:100%;height:auto;border:1px solid ${C.rule};border-radius:8px;">
        <p style="margin:10px 0 2px;font-family:${SERIF};font-size:15px;line-height:1.3;color:${C.ink};">${escapeHtml(album.names)}</p>
        <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.5;color:${C.body};">${escapeHtml(album.where)}</p>
      </a>
    </td>`).join("");
  return `${eyebrow("See a whole day, not a highlight reel")}
  <p class="h2" style="margin:0 0 14px;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.18;color:${C.ink};">Three complete weddings</p>
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">Not a highlight reel. These are three whole days, every frame I delivered, from the quiet hour before anyone is dressed to the last of the dancing. It is the only honest way to judge a photographer, because it shows you the ordinary parts of a day as well as the best thirty seconds of it.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;"><tr>${cells}</tr></table>`;
}

/* How I approach wedding photography, which is also the answer to why couples
   book me. The two were separate sections until 2026-11-17, when the owner
   asked for them combined: the approach IS the argument, and splitting them
   made the email say the same thing twice.
 *
 * His sentence, which everything here serves: "creating art while the couple
 * are fully aware and not rushed." The detail under it is his too, written
 * from the couple's side: a day that feels genuine and unhurried, laughter,
 * happy tears, food, music, dancing, everyone under one roof, less time
 * worrying about the perfect shot and more time present with each other;
 * candid documentary mixed with romantic editorial portraits; effortless, a
 * little nostalgic, full of emotion; the big moments and also the quiet
 * glances, the spontaneous laughter, the family interactions and the details
 * that would otherwise go unnoticed; and the test at the end, which is looking
 * back years later and feeling like you are reliving the day.
 *
 * It is written in his first person, not the couple's "we want", and it keeps
 * the cinematic claim he asked for on 2026-11-15. It sits between the three
 * albums and the price, because it is what makes the price make sense.
 */
function approachBlock() {
  return `${eyebrow("How I approach wedding photography")}
  <p class="h2" style="margin:0 0 16px;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.18;color:${C.ink};">${escapeHtml(APPROACH_TITLE)}</p>
  ${APPROACH_PARAS.map((text) => para(text)).join("")}`;
}

const APPROACH_TITLE = "Art, made while you are fully present and never rushed.";
const APPROACH_PARAS = [
  "Your day should feel genuine and unhurried. Laughter, happy tears, good food, music, dancing, everyone you love under one roof, and the two of you spending those hours with each other and your families instead of worrying about whether the perfect shot is being taken. I am there the whole time and almost none of it should feel like a photoshoot you have to perform in.",
  "What I am doing while that happens is making art. Candid and documentary through the day, with romantic, editorial portraits where the light and the location earn them. The frames come back effortless, a little nostalgic, full of emotion: the vows and the first dance, and equally the quiet glances, the spontaneous laughter, the way your families are with each other, the details nobody else is looking at. That is cinematic work. It is a different craft from covering a wedding competently, and a handful of photographers in North America shoot this way. I am one of them.",
  "The rest is effort. On every wedding I photograph I go further than the collection obliges me to, because there is only one thing I am really being hired for: that you open these pictures years from now and feel like you are living the day all over again.",
];
const APPROACH_TEXT = ["HOW I APPROACH WEDDING PHOTOGRAPHY: ART, MADE WHILE YOU ARE FULLY PRESENT AND NEVER RUSHED", ...APPROACH_PARAS].join("\n");

function priceTable(fit?: string) {
  return pricingTiers().map((tier) => {
    const picked = fit === tier.slug;
    const background = picked ? C.panel : C.card;
    return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${background}" style="background:${background};border:1px solid ${picked ? C.bronze : C.rule};border-radius:10px;margin:0 0 9px;">
      <tr>
        <td style="padding:15px 18px;">
          <p style="margin:0;font-family:${SERIF};font-size:20px;line-height:1.2;color:${C.ink};">${escapeHtml(tier.name)}${picked ? ` <span style="font-family:${SANS};font-size:9px;letter-spacing:.18em;text-transform:uppercase;color:${C.bronzeDeep};">Most booked</span>` : ""}</p>
          <p style="margin:5px 0 0;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.muted};">${escapeHtml(`${tier.coverage} \u00b7 ${tier.images}`)}</p>
        </td>
        <td align="right" valign="top" style="padding:15px 18px;white-space:nowrap;font-family:${SERIF};font-size:23px;color:${C.ink};">${money(tier.price)}</td>
      </tr>
    </table>`;
  }).join("");
}

/* "My price against everybody else" (owner, 2026-11-15).
 *
 * The right-hand column is what C$3,000 buys from a Canadian wedding
 * photographer in 2026 according to the published pricing guides, checked
 * across several of them on 2026-11-15: Bridebook's Canadian photography and
 * videography guides, Bark's Canadian videography prices, Candid Studios'
 * 2026 pricing statistics, Ruah Creative House on film pricing, and Imagen's
 * delivery-turnaround guide. They disagree on exact averages, so nothing here
 * is printed as a statistic: every cell is a range or a "usually", which is
 * what the sources actually support. No competitor is named, and the left
 * column is read from TIERS so it can never drift from the real collection.
 *
 * If you widen a claim here, source it first. An email that overstates the
 * market is the one thing in this sequence a couple can catch out.
 */
const MARKET_ROWS: [string, (tier: Tier) => string, string][] = [
  ["Hours on the day", (tier) => tier.coverage, "6 to 8, charged by the hour beyond that"],
  ["Edited images", (tier) => tier.images, "300 to 600, sometimes web-size only"],
  ["First look at them", (tier) => tier.preview, "a handful of favourites within a few days"],
  ["Full gallery", (tier) => tier.delivery, "4 to 8 weeks, and 8 to 12 in peak season"],
  ["Engagement session", (tier) => tier.engagement, "an add-on, priced separately"],
  ["A film of your day", (tier) => tier.film, "not offered; a separate videographer is usually C$2,000 to C$4,000"],
  ["Real 35mm film", (tier) => tier.rolls, "not offered"],
  ["Vertical reels", () => "Cut from the day, in the first week", "rarely offered"],
];

/* Travel, under the prices (owner, 2026-11-17): travel cost is INCLUDED in the
 * collections, he arrives two days before the wedding to scout, and delays are
 * already absorbed by that schedule. The stated purpose is to settle the one
 * fear a national landing page creates, which is hiring somebody from out of
 * town.
 *
 * The rest of the site now says the same thing: lib/site.ts TRAVEL is the
 * source, and /pricing, /faq, the terms of service, llms.txt, the wedding
 * guide, the hubs, the ads markets and the journal were all moved onto it on
 * 2026-11-17. Do not widen or narrow the claim here without the owner, and
 * keep it to CANADA: a wedding outside Canada is quoted per wedding and
 * nothing about it is included in these figures.
 */
function travelBlock() {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.rule};border-radius:10px;margin:18px 0 4px;">
    <tr>
      <td width="4" bgcolor="${C.bronze}" style="width:4px;background:${C.bronze};font-size:0;line-height:0;">&nbsp;</td>
      <td style="padding:20px 22px 8px;">
        ${eyebrow("Travel")}
        ${subTitle(TRAVEL_TITLE)}
        ${TRAVEL_PARAS.map((text) => para(text, 14)).join("")}
      </td>
    </tr>
  </table>`;
}

const TRAVEL_TITLE = "Travel is included, and I arrive two days early.";
const TRAVEL_PARAS = [
  "The collection price is the whole price wherever in Canada you are marrying. Flights, the ground travel and the nights are already inside the figures above. There is no mileage line, no out-of-town surcharge, and nothing that turns up on an invoice later.",
  "I get there two days before the wedding. That gives me a full day at your venue in the real light, walking your ceremony spot and your portrait locations and building the timeline around what is actually there rather than around photographs of it. It also means the travel risk is mine and never yours: a cancelled flight or a day of weather is absorbed two days out, long before anyone is getting dressed.",
];
const TRAVEL_TEXT = ["TRAVEL IS INCLUDED, AND I ARRIVE TWO DAYS EARLY", ...TRAVEL_PARAS].join("\n");

function comparisonTable() {
  const tier = pricingTiers()[0];
  /* A template literal, not a plain string: it carries tokens. */
  const cell = `padding:11px 10px;border-bottom:1px solid ${C.rule};font-family:${SANS};font-size:13px;line-height:1.55;vertical-align:top;`;
  const rows = MARKET_ROWS.map(([label, mine, theirs]) => `<tr>
      <td style="${cell}color:${C.body};width:27%;">${escapeHtml(label)}</td>
      <td bgcolor="${C.panel}" style="${cell}color:${C.ink};width:36%;background:${C.panel};">${escapeHtml(mine(tier))}</td>
      <td style="${cell}color:${C.body};width:37%;">${escapeHtml(theirs)}</td>
    </tr>`).join("");
  return `${subTitle("The same money, a different list.", 26)}
  <p style="margin:0 0 12px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.body};">What ${money(tier.price)} usually buys from a wedding photographer in Canada, against what it buys here. The right-hand column is drawn from the published Canadian pricing guides for 2026, not from one studio.</p>
  <table role="presentation" class="cmp" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 10px;">
    <tr>
      <td bgcolor="${C.ink}" style="padding:9px 10px;background:${C.ink};border-radius:6px 0 0 0;"></td>
      <td bgcolor="${C.ink}" style="padding:9px 10px;background:${C.ink};font-family:${SANS};font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${C.onDark};">${escapeHtml(tier.name)} · ${money(tier.price)}</td>
      <td bgcolor="${C.ink}" style="padding:9px 10px;background:${C.ink};font-family:${SANS};font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:${C.onDarkMuted};border-radius:0 6px 0 0;">Typical at this price</td>
    </tr>
    ${rows}
  </table>
  <p style="margin:0 0 6px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.body};">Legacy and Photo + Film widen the same gap: a second photographer, a printed album, and in Photo + Film a filmmaker beside me for all twelve hours rather than a second vendor you book and brief yourself.</p>
  <p style="margin:0 0 6px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.body};">Prices in CAD, before tax.</p>`;
}

const COMPARISON_TEXT = () => {
  const tier = pricingTiers()[0];
  return [
    "THE SAME MONEY, A DIFFERENT LIST",
    `What ${money(tier.price)} usually buys from a wedding photographer in Canada, against what it buys here, from the published Canadian pricing guides for 2026.`,
    ...MARKET_ROWS.map(([label, mine, theirs]) => `${label} - mine: ${mine(tier)}. Typical: ${theirs}.`),
    "Legacy and Photo + Film widen the same gap: a second photographer, a printed album, and in Photo + Film a filmmaker beside me for all twelve hours.",
    "Prices in CAD, before tax.",
  ].join("\n");
};

/** What the couple sent, played back so the email reads as an answer to them
 *  and so they can see I read it. Their own contact details stay out. */
function detailsBlock(inquiry: Inquiry) {
  const rows: [string, string][] = [
    ["Date", whenPhrase(inquiry) || "To be decided"],
    ["Where", inquiry.location || "To be decided"],
    ...(inquiry.message ? ([["What you told me", inquiry.message]] as [string, string][]) : []),
  ];
  return `<div style="margin:4px 0 0;padding:17px 19px;background:${C.panel};border:1px solid ${C.rule};border-radius:10px;font-family:${SANS};font-size:14px;line-height:1.6;color:${C.ink};">
    <p style="margin:0 0 9px;font-size:10px;letter-spacing:.24em;text-transform:uppercase;color:${C.bronze};">Your inquiry</p>
    ${rows.map(([label, value]) => `<p style="margin:0 0 3px;"><span style="color:${C.body};">${label}:</span> ${escapeHtml(value)}</p>`).join("")}
  </div>`;
}

/** The opening paragraphs. Deliberately short: the four sections below carry
 *  the information, and a wall of text at the top gets skipped. */
function opening(inquiry: Inquiry) {
  const when = whenPhrase(inquiry);
  /* "in", not "at": the location field asks for a city or a venue, and on the
     Canada-wide page most couples type a city, where "at Halifax" reads wrong. */
  const about = [inquiry.location && `in ${inquiry.location}`, when && `on ${when}`].filter(Boolean).join(" ");
  return [
    `Hi ${inquiry.firstName || "there"},`,
    `Congratulations, and thank you for writing. This is Arman. I have your inquiry about your wedding${about ? ` ${about}` : ""}, and I'll reply to you personally within 60 minutes.`,
    "This email is the part you'd normally have to ask three times for, so you have it now rather than after a week of back and forth: how I work a wedding, what everything costs with travel included, how a date gets secured, and the other people I'd want on your day. Read it in whatever order you like.",
  ];
}

/** The four numbered sections, as HTML. */
function sections(inquiry: Inquiry, links: { guide: string; vendors: string; calendar: string }) {
  const first = pricingTiers()[0];
  return `
  ${sectionHeading("One", "Full pricing")}
  <p style="margin:0 0 10px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">Three collections, and only three. Every one includes an engagement session, a next-day preview and the full gallery in three weeks.</p>
  ${priceTable("signature")}
  <p style="margin:0 0 6px;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.body};">Payment is in three parts: ${escapeHtml(TERMS.schedule.replace(/^Three payments: /, ""))}</p>
  ${travelBlock()}
  ${comparisonTable()}

  ${sectionHeading("Two", "Your welcome guide")}
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">How I actually work a wedding day: where I am during the getting-ready, how family photographs get done in twenty minutes instead of an hour, what happens if it rains, and what you get back and when. It takes about ten minutes to read and it will save you a dozen questions.</p>
  ${bigButton(links.guide, "Open the wedding guide", C.bronze, C.card)}

  ${sectionHeading("Three", "Securing your date")}
  <p style="margin:0 0 10px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">${escapeHtml(TERMS.retainer)}, once the contract is signed, and not before. I photograph one wedding at a time and the summer and early autumn dates are the first to go, so the sooner we speak, the more of the calendar is still open to you. The fastest way there is a short call, where you can ask me the things people don't put in an email.</p>
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${C.ink};"><strong>${escapeHtml(TONIGHT_CALL)}</strong>, or pick any time that suits you both.</p>
  ${bigButton(links.calendar, "Book your free 30-minute call", C.ink, C.onDark)}

  ${sectionHeading("Four", "My preferred vendors")}
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">The planners, florists, hair and makeup artists, DJs, bands and officiants I'd be glad to see on your day, by city. Nobody on it paid to be there and there are no referral fees in either direction. If you want, I'll make the introductions myself with your date in the subject line.</p>
  ${bigButton(links.vendors, "See the vendor list", C.panel, C.ink)}`;
}

/* The 48-hour date hold that lived here was removed on 2026-11-17 at the
   owner's instruction, and replaced by approachBlock(). Do not reintroduce it
   anywhere in this email: the deposit is what secures a date now, and a hold
   window that is promised in writing and not actually operated is worse than
   no hold at all. */

const NEXT_STEPS = [
  "I read your inquiry properly and reply myself, within 60 minutes.",
  "We talk for twenty or thirty minutes, by video or phone, whichever you prefer. No pitch, and no obligation.",
  "If it feels right, I send the contract and the invoice for the 30% deposit. Signed and paid, the date is yours.",
  "We start planning the day properly about three months out, and I am at your venue two days before the wedding.",
];

export function render(inquiry: Inquiry) {
  const calendar = weddingCalendarUrl("?utm_source=auto-reply-email&utm_medium=email", new URL(SITE.url).hostname, false, {
    page: inquiry.page,
    prefill: { name: [inquiry.firstName, inquiry.lastName].filter(Boolean).join(" "), email: inquiry.email },
  });
  const city = inquiry.market ? vendorCity(inquiry.market.slug) : undefined;
  const links = {
    guide: `${SITE.url}/wedding-guide`,
    vendors: `${SITE.url}/preferred-vendors${city ? `#${city.slug}` : ""}`,
    calendar,
  };
  const whatsapp = `https://wa.me/${SITE.phoneE164.replace(/\D/g, "")}?text=${encodeURIComponent(
    `Hi Arman, it's ${inquiry.firstName}. I just sent you an inquiry about our wedding.`,
  )}`;

  /* One column, 600px, every block a table row. The head carries the
     colour-scheme metas and the only media query, which stacks the three
     albums and tightens the comparison table on a phone. */
  const html = `<!doctype html>
<html lang="en" style="background:${C.page};">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>${escapeHtml(replySubject(inquiry))}</title>
<style>
  :root { color-scheme: light only; supports-color-schemes: light only; }
  body { margin:0; padding:0; background:${C.page}; -webkit-text-size-adjust:100%; }
  img { border:0; outline:none; -ms-interpolation-mode:bicubic; }
  a { color:${C.bronzeDeep}; }
  @media screen and (max-width:620px) {
    .card { width:100% !important; max-width:100% !important; border-left:0 !important; border-right:0 !important; border-radius:0 !important; }
    .px { padding-left:20px !important; padding-right:20px !important; }
    .stack { display:block !important; width:100% !important; padding:0 0 16px !important; }
    .shell { padding:0 !important; }
    .h2 { font-size:24px !important; }
    .cmp td { font-size:12px !important; padding:9px 7px !important; word-break:break-word !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:${C.page};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">Your full pricing, three complete weddings, and how I work a wedding day. I reply personally within 60 minutes.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.page}" style="background:${C.page};">
  <tr>
    <td align="center" class="shell" style="padding:24px 10px 30px;">
      <table role="presentation" class="card" width="600" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.card}" style="width:600px;max-width:600px;background:${C.card};border:1px solid ${C.rule};border-radius:12px;overflow:hidden;">

        <tr>
          <td align="center" bgcolor="${C.ink}" style="background:${C.ink};padding:20px 24px 18px;">
            <p style="margin:0;font-family:${SERIF};font-size:19px;letter-spacing:.3em;text-transform:uppercase;color:${C.onDark};">Arman Arai</p>
            <p style="margin:7px 0 0;font-family:${SANS};font-size:9px;letter-spacing:.26em;text-transform:uppercase;color:${C.bronze};">Wedding photography &middot; Canada</p>
          </td>
        </tr>
        ${band(HERO_IMAGE, 260)}
        ${row(opening(inquiry).map((text, index) => `<p style="margin:0 0 15px;font-family:${SERIF};font-size:${index === 0 ? 20 : 17}px;line-height:1.6;color:${C.ink};">${escapeHtml(text)}</p>`).join(""), 28)}
        ${row(detailsBlock(inquiry), 4, 6)}
        ${row(albumsBlock(), 30)}
        ${row(divider(), 32)}
        ${row(approachBlock(), 22)}
        ${row(sections(inquiry, links), 8)}
        ${row(`${eyebrow("What happens next")}
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${NEXT_STEPS.map((step, index) => `<tr>
              <td width="30" valign="top" style="width:30px;padding:0 0 11px;font-family:${SERIF};font-size:15px;color:${C.bronze};">${index + 1}.</td>
              <td valign="top" style="padding:0 0 11px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.body};">${escapeHtml(step)}</td>
            </tr>`).join("")}
          </table>`, 34)}
        ${row(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" bgcolor="${C.panel}" style="background:${C.panel};border:1px solid ${C.rule};border-radius:10px;">
          <tr><td style="padding:18px 20px 10px;">
            ${para("If you'd rather not wait for my email, message me. I answer WhatsApp faster than anything else.", 14)}
            ${bigButton(whatsapp, "Message me on WhatsApp", C.whatsapp, "#07320F")}
          </td></tr>
        </table>`, 26)}
        ${row(`<p style="margin:0;font-family:${SERIF};font-size:19px;color:${C.ink};">Arman</p>`, 30, 30)}

        <tr>
          <td align="center" bgcolor="${C.ink}" style="background:${C.ink};padding:22px 24px;">
            <p style="margin:0 0 7px;font-family:${SERIF};font-size:13px;letter-spacing:.26em;text-transform:uppercase;color:${C.onDark};">Arman Arai</p>
            <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.8;color:${C.onDarkMuted};">Wedding photography across Canada<br>
              <a href="${SITE.url}" style="color:${C.bronze};text-decoration:none;">${SITE.domain}</a> &middot; <a href="tel:${SITE.phoneE164}" style="color:${C.bronze};text-decoration:none;">${escapeHtml(SITE.phone)}</a> &middot; <a href="${SITE.instagram}" style="color:${C.bronze};text-decoration:none;">${SITE.instagramHandle}</a></p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>`;

  const text = [
    ...opening(inquiry),
    "THREE COMPLETE WEDDINGS",
    "Not a highlight reel. Three whole days, every frame I delivered.",
    ...ALBUMS.map((album) => `${album.names}, ${album.where}: ${SITE.url}/galleries/${album.slug}`),
    APPROACH_TEXT,
    "ONE. FULL PRICING",
    pricingTiers().map((tier) => `${tier.name}, ${tier.hours} hours: ${money(tier.price)}`).join("\n"),
    TERMS.schedule,
    TRAVEL_TEXT,
    COMPARISON_TEXT(),
    `TWO. YOUR WELCOME GUIDE\nHow I work a wedding day, start to finish: ${links.guide}`,
    `THREE. SECURING YOUR DATE\n${TERMS.retainer}, once the contract is signed, and not before. I photograph one wedding at a time and the summer and early autumn dates are the first to go. ${TONIGHT_CALL}, or pick any time: ${links.calendar}`,
    `FOUR. MY PREFERRED VENDORS\nPlanners, florists, hair and makeup, music and officiants, by city: ${links.vendors}`,
    `WHAT HAPPENS NEXT\n${NEXT_STEPS.map((step, n) => `${n + 1}. ${step}`).join("\n")}`,
    `Message me on WhatsApp: ${whatsapp}`,
    `Your inquiry: ${[whenPhrase(inquiry) || "Date to be decided", inquiry.location || "Venue to be decided", inquiry.message].filter(Boolean).join(" · ")}`,
    "Arman",
    `Arman Arai · Wedding photography · ${SITE.domain} · ${SITE.phone}`,
  ].join("\n\n");

  return { html, text };
}

export async function sendInquiryAutoReply(inquiry: Inquiry): Promise<void> {
  const started = Date.now();
  const { html, text } = render(inquiry);
  const wait = inquiry.receivedAt + SEND_DELAY_MS - Date.now();
  if (wait > 0) await new Promise((resolve) => setTimeout(resolve, wait));
  try {
    const { Resend } = await import("resend");
    const { error } = await new Resend(process.env.RESEND_API_KEY).emails.send({
      from: "Arman Arai <i@armanarai.ca>",
      to: [inquiry.email],
      bcc: [SITE.email],
      replyTo: SITE.email,
      subject: replySubject(inquiry),
      html,
      text,
    });
    if (error) throw new Error(error.message);
    console.info(`Auto-reply sent in ${Date.now() - started} ms`);
  } catch (error) {
    console.error("Auto-reply: send failed", error);
  }
}

/** Re-exported so the API route can resolve a landing page's market without
 *  importing the pricing module directly for one lookup. */
export { pricingMarket };
