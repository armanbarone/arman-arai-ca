import { SITE, TERMS, type Tier } from "./site";
import { weddingCalendarUrl } from "./wedding-booking";
import { pricingMarket, pricingTiers, longDate, weekdayOf, type PricingMarket } from "./ads/pricing-request";

/* The first email a couple gets, from any form on either site.
 *
 * It is a FIXED, informational email (owner, 2026-10-14: "the automated email
 * should be just informational (about general stuff). Mention that i will
 * reply back personally within 60 minutes"). No model writes any part of it.
 * The Claude call that used to compose a personal note here, its brief in
 * lib/auto-reply-brief.ts, and the per-inquiry /guide/<id> page it linked to
 * are all gone: the personal reply is the one Arman sends himself, within the
 * hour, and this email exists to answer the things every couple asks
 * before that reply lands.
 *
 * Those three, in his order (it was four until 2026-11-23, when he took the
 * preferred vendor list out of this email):
 *   1. Full pricing, Legacy and Photo + Film only
 *   2. The welcome guide, at /wedding-guide
 *   3. A call, booked from the calendar link
 *
 * Plus three complete wedding albums, which is the part that does the selling:
 * a highlight reel of the albums he is permitted to publish, three whole days
 * rather than three best frames.
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

/* A "build your own custom collection" line with a button beside it ran here
   from 2026-11-18 to 2026-11-19, pointing at /build-your-collection. The owner
   deleted the page and the invitation with it. Do not reinstate either: there
   is no builder, and a button in this email pointing at one would 404. */

/** Vertical space, as a table cell with a real height rather than a margin.
 *  Margins on block elements are ignored or collapsed by enough clients that
 *  a heading set with one ends up touching the paragraph above it, which is
 *  exactly what happened to TWO and THREE (owner, 2026-11-17). */
function spacer(height: number) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td height="${height}" style="height:${height}px;line-height:${height}px;font-size:0;">&nbsp;</td></tr></table>`;
}

function sectionHeading(number: string, title: string) {
  return `${spacer(40)}
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 14px;">
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
/* Owner, 2026-11-18: these are "a highlight reel of the albums that I am
   permitted to publish", not every frame of every day. The earlier claim
   ("not a highlight reel... every frame I delivered") was both the opposite
   and not true of a published gallery, and it is not to come back. */
const ALBUMS_EYEBROW = "A highlight reel of the albums I am permitted to publish";
const ALBUMS_INTRO =
  "Three whole days rather than three best frames, from the quiet hour before anyone is dressed to the last of the dancing. It is the only honest way to judge a photographer, because it shows you the ordinary parts of a wedding as well as the best thirty seconds of it.";

function albumsBlock() {
  const cells = ALBUMS.map((album) => `<td class="stack" width="33.3%" valign="top" style="padding:0 5px;">
      <a href="${SITE.url}/galleries/${album.slug}" style="text-decoration:none;color:${C.ink};">
        <img src="${cdn(album.frame, 360, 480)}" width="176" alt="${escapeHtml(album.alt)}" style="display:block;width:100%;height:auto;border:1px solid ${C.rule};border-radius:8px;">
        <p style="margin:10px 0 2px;font-family:${SERIF};font-size:15px;line-height:1.3;color:${C.ink};">${escapeHtml(album.names)}</p>
        <p style="margin:0;font-family:${SANS};font-size:11px;line-height:1.5;color:${C.body};">${escapeHtml(album.where)}</p>
      </a>
    </td>`).join("");
  return `${eyebrow(ALBUMS_EYEBROW)}
  <p class="h2" style="margin:0 0 14px;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.18;color:${C.ink};">Three complete weddings</p>
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">${escapeHtml(ALBUMS_INTRO)}</p>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 6px;"><tr>${cells}</tr></table>`;
}

/* How I approach wedding photography, which is also the answer to why couples
   book me. The two were separate sections until 2026-11-17, when the owner
   asked for them combined: the approach IS the argument, and splitting them
   made the email say the same thing twice.
 *
 * Every word of it is the owner's own, pasted on 2026-11-25 to replace the
 * four paragraphs he wrote on 2026-11-18. Two spellings were corrected
 * ("cliche" and "essense") and the apostrophes and the quotes around
 * "timeless" were curled; nothing else was touched, and nothing may be added.
 * What went out with those paragraphs is gone and is not to be reinstated:
 * "Showcase the love between you two", the unhurried day, "making art", and
 * "a handful of photographers in North America shoot this way", which
 * overstated the market. The argument now runs the other way round: the
 * timeless look is slop anyone can repeat, and what he sells instead is the
 * bond, through colour, contrast and a film look.
 *
 * It sits between the three albums and the price, because it is what makes
 * the price make sense.
 */
function approachBlock() {
  return `${eyebrow("How I approach wedding photography")}
  <p class="h2" style="margin:0 0 16px;font-family:${SERIF};font-weight:normal;font-size:28px;line-height:1.18;color:${C.ink};">${escapeHtml(APPROACH_TITLE)}</p>
  ${APPROACH_PARAS.map((text) => para(text)).join("")}`;
}

const APPROACH_TITLE = "How I portray couples as lovers";
const APPROACH_PARAS = [
  "My philosophy in photography is simple: Don\u2019t be clich\u00e9. Wedding photographs are mostly about looking pretty. This comes at a cost and that is the pictures don\u2019t have any feel to them. You can scroll past 1000 wedding images on people\u2019s profiles and don\u2019t feel any emotions. This \u201ctimeless\u201d look everybody is chasing is the same slop that can be repeated by anyone regardless of their experience. Why bother with an expensive photographer when you can get your cousin with a smartphone to replicate those images?",
  "How is my work so different then? Because I approach weddings as a spiritual quest rather than an event photography. Capturing the intimacy between two souls requires a thoughtful balance of candid documentary storytelling and romantic, editorial artistry.",
  "In essence, I capture the bond, the energy, the love and tension, and the spirit, through colour, contrast and a film look.",
];
/* One blank line between paragraphs in the plain-text twin, not one newline
   (owner, 2026-11-25: "make sure to put space in between sentences/
   paragraphs"). The HTML twin gets its spacing from para()'s margin. */
const APPROACH_TEXT = [`HOW I APPROACH WEDDING PHOTOGRAPHY: ${APPROACH_TITLE.toUpperCase()}`, ...APPROACH_PARAS].join("\n\n");

/* The collections the EMAIL shows, which is all three again. Signature came
   out on 2026-11-23 ("for full-pricing, take out signature package
   entirely") and went back in on 2026-11-25 ("put back the signature 3000
   dollar into packages"), so the filter is now a no-op and is kept only
   because he has moved this twice. Photo + Film carries the most-booked pill
   either way: it is what he says he books most, and the cheapest card is not
   the one to flag. */
const EMAIL_TIERS = ["signature", "complete", "photo-film"];
const MOST_BOOKED = "photo-film";

function priceTable(fit?: string) {
  return pricingTiers().filter((tier) => EMAIL_TIERS.includes(tier.slug)).map((tier) => {
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

/* Travel, under the prices (owner, 2026-11-17): travel cost is INCLUDED in the
 * collections. The stated purpose is to settle the one fear a national landing
 * page creates, which is hiring somebody from out of town. The scouting trip
 * two days before the wedding is a real part of that, but it is no longer said
 * here; see TRAVEL_TITLE below.
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
      <td style="padding:18px 22px 14px;">
        ${eyebrow("Travel")}
        ${subTitle(TRAVEL_TITLE)}
      </td>
    </tr>
  </table>`;
}

/* The headline alone, since 2026-11-24: the owner cut the two paragraphs
   that used to sit under it ("the travel part only needs a headline not a
   gigantic explanation"), and on 2026-11-25 he cut the scouting trip out of
   the headline too ("take out 'I arrive two days early' in the travel
   segment"). Both facts are still true and both are still stated, in the
   travel section of the wedding guide, which this email links to. Neither
   belongs here. */
const TRAVEL_TITLE = "Travel is included.";
const TRAVEL_TEXT = "TRAVEL IS INCLUDED";

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

/** The opening paragraphs, written by the owner by hand on 2026-11-18 and
 *  used as he wrote them. Deliberately short: the four sections below carry
 *  the information, and a wall of text at the top gets skipped. The only
 *  thing computed here is the date, which is omitted rather than guessed at
 *  when the couple did not give one. Do not reinstate the longer version. */
function opening(inquiry: Inquiry) {
  const when = whenPhrase(inquiry);
  return [
    `Hi ${inquiry.firstName || "there"},`,
    `Congratulations, and thank you for the interest in my photography service. I have your inquiry about your wedding${when ? ` on ${when}` : ""} and I will personally reply to you within an hour.`,
    "This email is an overview of my services and how I work, so that you have a general idea of how I operate.",
  ];
}

/** The three numbered sections, as HTML. */
function sections(inquiry: Inquiry, links: { guide: string; calendar: string }) {
  return `
  ${sectionHeading("One", "Full pricing")}
  <p style="margin:0 0 10px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">Every collection includes an engagement session, a next-day preview and the full gallery in three weeks.</p>
  ${priceTable(MOST_BOOKED)}
  ${travelBlock()}

  ${sectionHeading("Two", "Your welcome guide")}
  <p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.7;color:${C.body};">How I actually work a wedding day: where I am during the getting-ready, how family photographs get done in twenty minutes instead of an hour, what happens if it rains, and what you get back and when. It takes about ten minutes to read and it will save you a dozen questions.</p>
  ${bigButton(links.guide, "Open the wedding guide", C.bronze, C.card)}

  ${sectionHeading("Three", THIRD_TITLE)}
  ${bigButton(links.calendar, "Book your free 30-minute call", C.ink, C.onDark)}`;
}

/* Section three's heading, as the owner wrote it on 2026-11-23, replacing
   "Securing your date". The paragraphs under it went with the old heading:
   the deposit terms, the one-wedding-at-a-time scarcity line and the 7:30 PM
   call offer are all out, and the button is the whole section now. */
const THIRD_TITLE = "Let's hop on a call and talk face to face";

/* The 48-hour date hold that lived here was removed on 2026-11-17 at the
   owner's instruction, and replaced by approachBlock(). Do not reintroduce it
   anywhere in this email: the deposit is what secures a date now, and a hold
   window that is promised in writing and not actually operated is worse than
   no hold at all.

   The preferred vendor list was section four until 2026-11-23, when the owner
   took it out of this email. /preferred-vendors is still a live page; it is
   simply not sold here. */

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
  const links = {
    guide: `${SITE.url}/wedding-guide`,
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
        ${row(sections(inquiry, links), 0)}
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
    `${ALBUMS_EYEBROW}. ${ALBUMS_INTRO}`,
    ...ALBUMS.map((album) => `${album.names}, ${album.where}: ${SITE.url}/galleries/${album.slug}`),
    APPROACH_TEXT,
    "ONE. FULL PRICING",
    pricingTiers().filter((tier) => EMAIL_TIERS.includes(tier.slug)).map((tier) => `${tier.name}, ${tier.hours} hours: ${money(tier.price)}`).join("\n"),
    TRAVEL_TEXT,
    `TWO. YOUR WELCOME GUIDE\nHow I work a wedding day, start to finish: ${links.guide}`,
    `THREE. ${THIRD_TITLE.toUpperCase()}\n${links.calendar}`,
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
