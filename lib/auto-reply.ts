import { SITE, TERMS } from "./site";
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

/** The travel sentence for this couple: the market's published rule when the
 *  inquiry came from a city landing page, and the site-wide rule otherwise.
 *  Never invent a figure; travel is quoted against the venue. */
function travelLine(inquiry: Inquiry) {
  if (inquiry.market) return inquiry.market.travelNote;
  return "A collection costs the same anywhere in Canada. Travel is quoted separately against your venue and agreed before you book, and it comes down when I already have dates in your region.";
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

function priceTable(fit?: string) {
  const tiers = pricingTiers();
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse;margin:4px 0 10px;border-top:1px solid #D9CEBC;">
    ${tiers.map((tier) => `<tr>
      <td style="padding:13px 0;border-bottom:1px solid #EDE7DA;font-size:18px;">${escapeHtml(tier.name)} <span style="font-family:Arial,Helvetica,sans-serif;font-size:13px;color:#6B6258;">${tier.hours} hours${tier.slug === "photo-film" ? ", photo and film" : ""}</span>${fit && tier.slug === fit ? ` <span style="font-family:Arial,Helvetica,sans-serif;font-size:11px;letter-spacing:.08em;text-transform:uppercase;color:#9A7A54;">Most booked</span>` : ""}</td>
      <td style="padding:13px 0 13px 16px;border-bottom:1px solid #EDE7DA;text-align:right;white-space:nowrap;font-size:18px;">${money(tier.price)}</td>
    </tr>`).join("")}
  </table>`;
}

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
  const about = [inquiry.location && `at ${inquiry.location}`, when && `on ${when}`].filter(Boolean).join(" ");
  return [
    `Hi ${inquiry.firstName || "there"},`,
    `Congratulations, and thank you for writing. This is Arman. I have your inquiry about your wedding${about ? ` ${about}` : ""}, and I'll reply to you personally within 60 minutes.`,
    "This email is the part you'd normally have to ask three times for, so you have it now rather than after a week of back and forth: what everything costs, how I work, how a date actually gets held, and the other people I'd want on your day. Read it in whatever order you like.",
  ];
}

/** The four numbered sections, as HTML. */
function sections(inquiry: Inquiry, links: { guide: string; vendors: string; calendar: string }) {
  const first = pricingTiers()[0];
  return `
  ${sectionHeading("One", "Full pricing")}
  <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">Three collections, and only three. Every one includes an engagement session, a next-day preview and the full gallery in three weeks.</p>
  ${priceTable("signature")}
  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6B6258;">Canadian dollars, before tax. ${escapeHtml(travelLine(inquiry))}</p>
  <p style="margin:0 0 6px;font-family:Arial,Helvetica,sans-serif;font-size:13px;line-height:1.6;color:#6B6258;">Payment is in three parts: ${escapeHtml(TERMS.schedule.replace(/^Three payments: /, ""))}</p>

  ${sectionHeading("Two", "Your welcome guide")}
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">How I actually work a wedding day: where I am during the getting-ready, how family photographs get done in twenty minutes instead of an hour, what happens if it rains, and what you get back and when. It takes about ten minutes to read and it will save you a dozen questions.</p>
  ${bigButton(links.guide, "Open the wedding guide", "#A95C31", "#FFFFFF")}

  ${sectionHeading("Three", "Securing your date")}
  <p style="margin:0 0 10px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">A date is yours once the contract is signed and the deposit is in, and not before. ${escapeHtml(TERMS.retainer)}, and I'll hold a date for 48 hours free while you decide. The fastest way there is a short call, so you can ask me the things people don't put in an email.</p>
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#2C2420;"><strong>${escapeHtml(TONIGHT_CALL)}</strong>, or pick any time that suits you both.</p>
  ${bigButton(links.calendar, "Book your free 30-minute call", "#B8956A", "#1A1612")}

  ${sectionHeading("Four", "My preferred vendors")}
  <p style="margin:0 0 16px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.65;color:#6B6258;">The planners, florists, hair and makeup artists, DJs, bands and officiants I'd be glad to see on your day, by city. Nobody on it paid to be there and there are no referral fees in either direction. If you want, I'll make the introductions myself with your date in the subject line.</p>
  ${bigButton(links.vendors, "See the vendor list", "#2C2420", "#FFFFFF")}`;
}

const NEXT_STEPS = [
  "I read your inquiry properly and reply myself, within 60 minutes.",
  "We talk for twenty or thirty minutes, by video or phone, whichever you prefer. No pitch, and no obligation.",
  "If it feels right, I send a contract and an invoice for the 30% deposit. Your date is held free for 48 hours while you read them.",
  "Signed and paid, the date is yours, and we start planning the day properly about three months out.",
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
    "ONE. FULL PRICING",
    pricingTiers().map((tier) => `${tier.name}, ${tier.hours} hours: ${money(tier.price)}`).join("\n"),
    `Canadian dollars, before tax. ${travelLine(inquiry)}`,
    TERMS.schedule,
    `TWO. YOUR WELCOME GUIDE\nHow I work a wedding day, start to finish: ${links.guide}`,
    `THREE. SECURING YOUR DATE\n${TERMS.retainer}, and I'll hold a date free for 48 hours while you decide. ${TONIGHT_CALL}, or pick any time: ${links.calendar}`,
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
