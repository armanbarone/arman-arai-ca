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
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;"><tr><td align="center" bgcolor="${background}" style="background:${background};border-radius:8px;"><a href="${escapeHtml(href)}" style="display:block;padding:20px;font-family:Arial,Helvetica,sans-serif;font-size:18px;font-weight:bold;line-height:1.2;color:${color};text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a></td></tr></table>`;
}

function sectionHeading(number: string, title: string) {
  return `<p style="margin:34px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9A7A54;">${number}</p>
  <p style="margin:0 0 12px;font-size:25px;line-height:1.15;">${escapeHtml(title)}</p>`;
}

/** The three complete weddings, side by side. A three-cell table rather than
 *  stacked images: it survives Outlook, and three full-width photographs
 *  would push everything below them off the first two screens. */
function albumsBlock() {
  const cells = ALBUMS.map((album) => `<td width="33.3%" valign="top" style="padding:0 5px;">
      <a href="${SITE.url}/galleries/${album.slug}" style="text-decoration:none;color:#2C2420;">
        <img src="${cdn(album.frame, 360, 480)}" width="176" alt="${escapeHtml(album.alt)}" style="display:block;width:100%;height:auto;border:0;border-radius:6px;">
        <p style="margin:9px 0 2px;font-size:15px;line-height:1.3;">${escapeHtml(album.names)}</p>
        <p style="margin:0;font-family:Arial,Helvetica,sans-serif;font-size:11px;line-height:1.5;color:#6B6258;">${escapeHtml(album.where)}</p>
      </a>
    </td>`).join("");
  return `<p style="margin:30px 0 10px;font-size:25px;line-height:1.15;">Three complete weddings</p>
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">Not a highlight reel. These are three whole days, every frame I delivered, from the quiet hour before anyone is dressed to the last of the dancing. It is the only honest way to judge a photographer, because it shows you the ordinary parts of a day as well as the best thirty seconds of it.</p>
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
  return `<p style="margin:34px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9A7A54;">How I approach wedding photography</p>
  <p style="margin:0 0 12px;font-size:25px;line-height:1.15;">Art, made while you are fully present and never rushed.</p>
  <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">Your day should feel genuine and unhurried. Laughter, happy tears, good food, music, dancing, everyone you love under one roof, and the two of you spending those hours with each other and your families instead of worrying about whether the perfect shot is being taken. I am there the whole time and almost none of it should feel like a photoshoot you have to perform in.</p>
  <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">What I am doing while that happens is making art. Candid and documentary through the day, with romantic, editorial portraits where the light and the location earn them. The frames come back effortless, a little nostalgic, full of emotion: the vows and the first dance, and equally the quiet glances, the spontaneous laughter, the way your families are with each other, the details nobody else is looking at. That is cinematic work. It is a different craft from covering a wedding competently, and a handful of photographers in North America shoot this way. I am one of them.</p>
  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">The rest is effort. On every wedding I photograph I go further than the collection obliges me to, because there is only one thing I am really being hired for: that you open these pictures years from now and feel like you are living the day all over again.</p>`;
}

const APPROACH_TEXT = [
  "HOW I APPROACH WEDDING PHOTOGRAPHY: ART, MADE WHILE YOU ARE FULLY PRESENT AND NEVER RUSHED",
  "Your day should feel genuine and unhurried. Laughter, happy tears, good food, music, dancing, everyone you love under one roof, and the two of you spending those hours with each other and your families instead of worrying about whether the perfect shot is being taken. I am there the whole time and almost none of it should feel like a photoshoot you have to perform in.",
  "What I am doing while that happens is making art. Candid and documentary through the day, with romantic, editorial portraits where the light and the location earn them. The frames come back effortless, a little nostalgic, full of emotion: the vows and the first dance, and equally the quiet glances, the spontaneous laughter, the way your families are with each other, the details nobody else is looking at. That is cinematic work. It is a different craft from covering a wedding competently, and a handful of photographers in North America shoot this way. I am one of them.",
  "The rest is effort. On every wedding I photograph I go further than the collection obliges me to, because there is only one thing I am really being hired for: that you open these pictures years from now and feel like you are living the day all over again.",
].join("\n");

function priceTable(fit?: string) {
  const tiers = pricingTiers();
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:4px 0 10px;border-top:1px solid #D9CEBC;">
    ${tiers.map((tier) => `<tr>
      <td style="padding:13px 0;border-bottom:1px solid #EDE7DA;font-size:18px;">${escapeHtml(tier.name)} <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B6258;">${tier.hours} hours${tier.slug === "photo-film" ? ", photo and film" : ""}</span>${fit && tier.slug === fit ? ` <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">Most booked</span>` : ""}</td>
      <td style="padding:13px 0 13px 16px;border-bottom:1px solid #EDE7DA;text-align:right;white-space:nowrap;font-size:18px;">${money(tier.price)}</td>
    </tr>`).join("")}
  </table>`;
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
  const line = "margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#6B6258;";
  return `<p style="margin:22px 0 8px;font-size:21px;line-height:1.2;">Travel is included, and I arrive two days early.</p>
  <p style="${line}">The collection price is the whole price wherever in Canada you are marrying. Flights, the ground travel and the nights are already inside the figures above. There is no mileage line, no out-of-town surcharge, and nothing that turns up on an invoice later.</p>
  <p style="${line}">I get there two days before the wedding. That gives me a full day at your venue in the real light, walking your ceremony spot and your portrait locations and building the timeline around what is actually there rather than around photographs of it. It also means the travel risk is mine and never yours: a cancelled flight or a day of weather is absorbed two days out, long before anyone is getting dressed.</p>`;
}

const TRAVEL_TEXT = [
  "TRAVEL IS INCLUDED, AND I ARRIVE TWO DAYS EARLY",
  "The collection price is the whole price wherever in Canada you are marrying. Flights, the ground travel and the nights are already inside the figures above. There is no mileage line, no out-of-town surcharge, and nothing that turns up on an invoice later.",
  "I get there two days before the wedding. That gives me a full day at your venue in the real light, walking your ceremony spot and your portrait locations and building the timeline around what is actually there rather than around photographs of it. It also means the travel risk is mine and never yours: a cancelled flight or a day of weather is absorbed two days out, long before anyone is getting dressed.",
].join("\n");

function comparisonTable() {
  const tier = pricingTiers()[0];
  const cell = "padding:11px 10px;border-bottom:1px solid #EDE7DA;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.5;vertical-align:top;";
  const rows = MARKET_ROWS.map(([label, mine, theirs]) => `<tr>
      <td style="${cell}color:#6B6258;width:27%;">${escapeHtml(label)}</td>
      <td style="${cell}color:#2C2420;width:36%;background:#F7F3EC;">${escapeHtml(mine(tier))}</td>
      <td style="${cell}color:#6B6258;width:37%;">${escapeHtml(theirs)}</td>
    </tr>`).join("");
  return `<p style="margin:26px 0 8px;font-size:21px;line-height:1.2;">The same money, a different list.</p>
  <p style="margin:0 0 12px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#6B6258;">What ${money(tier.price)} usually buys from a wedding photographer in Canada, against what it buys here. The right-hand column is drawn from the published Canadian pricing guides for 2026, not from one studio.</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:0 0 10px;">
    <tr>
      <td style="padding:0 10px 8px;border-bottom:1px solid #D9CEBC;"></td>
      <td style="padding:0 10px 8px;border-bottom:1px solid #D9CEBC;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">${escapeHtml(tier.name)} · ${money(tier.price)}</td>
      <td style="padding:0 10px 8px;border-bottom:1px solid #D9CEBC;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">Typical at this price</td>
    </tr>
    ${rows}
  </table>
  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6B6258;">Legacy and Photo + Film widen the same gap: a second photographer, a printed album, and in Photo + Film a filmmaker beside me for all twelve hours rather than a second vendor you book and brief yourself.</p>
  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6B6258;">Prices in CAD, before tax.</p>`;
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
  return `<div style="margin:30px 0 8px;padding:16px 18px;background:#F7F3EC;border-radius:8px;font-family:Arial,Helvetica,sans-serif;font-size:14px;line-height:1.6;color:#2C2420;">
    <p style="margin:0 0 8px;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">Your inquiry</p>
    ${rows.map(([label, value]) => `<p style="margin:0 0 3px;"><span style="color:#6B6258;">${label}:</span> ${escapeHtml(value)}</p>`).join("")}
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
  <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">Three collections, and only three. Every one includes an engagement session, a next-day preview and the full gallery in three weeks.</p>
  ${priceTable("signature")}
  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6B6258;">Payment is in two parts: ${escapeHtml(TERMS.schedule.replace(/^Two payments: /, ""))}</p>
  ${travelBlock()}
  ${comparisonTable()}

  ${sectionHeading("Two", "Your welcome guide")}
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">How I actually work a wedding day: where I am during the getting-ready, how family photographs get done in twenty minutes instead of an hour, what happens if it rains, and what you get back and when. It takes about ten minutes to read and it will save you a dozen questions.</p>
  ${bigButton(links.guide, "Open the wedding guide", "#A95C31", "#FFFFFF")}

  ${sectionHeading("Three", "Securing your date")}
  <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">${escapeHtml(TERMS.retainer)}, once the contract is signed, and not before. I photograph one wedding at a time and the summer and early autumn dates are the first to go, so the sooner we speak, the more of the calendar is still open to you. The fastest way there is a short call, where you can ask me the things people don't put in an email.</p>
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2C2420;"><strong>${escapeHtml(TONIGHT_CALL)}</strong>, or pick any time that suits you both.</p>
  ${bigButton(links.calendar, "Book your free 30-minute call", "#B8956A", "#1A1612")}

  ${sectionHeading("Four", "My preferred vendors")}
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">The planners, florists, hair and makeup artists, DJs, bands and officiants I'd be glad to see on your day, by city. Nobody on it paid to be there and there are no referral fees in either direction. If you want, I'll make the introductions myself with your date in the subject line.</p>
  ${bigButton(links.vendors, "See the vendor list", "#2C2420", "#FFFFFF")}`;
}

/* The 48-hour date hold that lived here was removed on 2026-11-17 at the
   owner's instruction, and replaced by approachBlock(). Do not reintroduce it
   anywhere in this email: the deposit is what secures a date now, and a hold
   window that is promised in writing and not actually operated is worse than
   no hold at all. */

const NEXT_STEPS = [
  "I read your inquiry properly and reply myself, within 60 minutes.",
  "We talk for twenty or thirty minutes, by video or phone, whichever you prefer. No pitch, and no obligation.",
  "If it feels right, I send the contract and the invoice for the 50% deposit. Signed and paid, the date is yours.",
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

  const html = `<div style="font-family:Georgia,serif;max-width:560px;margin:0 auto;color:#2C2420;font-size:17px;line-height:1.65;">
  ${opening(inquiry).map((p) => `<p style="margin:0 0 16px;">${escapeHtml(p)}</p>`).join("")}
  ${albumsBlock()}
  ${approachBlock()}
  ${sections(inquiry, links)}
  <p style="margin:34px 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:#9A7A54;">What happens next</p>
  <ol style="margin:0 0 22px;padding-left:20px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.7;color:#6B6258;">
    ${NEXT_STEPS.map((step) => `<li style="margin:0 0 7px;">${escapeHtml(step)}</li>`).join("")}
  </ol>
  <p style="margin:0 0 14px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">If you'd rather not wait for my email, message me. I answer WhatsApp faster than anything else.</p>
  ${bigButton(whatsapp, "Message me on WhatsApp", "#25D366", "#FFFFFF")}
  ${detailsBlock(inquiry)}
  <p style="margin:22px 0 0;">Arman</p>
  <p style="margin:16px 0 0;padding-top:16px;border-top:1px solid #EDE7DA;font-family:Arial,Helvetica,sans-serif;font-size:12px;color:#6B6258;">Arman Arai · Wedding photography · <a href="${SITE.url}" style="color:#6B6258;">${SITE.domain}</a> · ${escapeHtml(SITE.phone)}</p>
</div>`;

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
