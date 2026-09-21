import "server-only";
import { Resend } from "resend";
import { BUSINESS, BUSINESS_ADDRESS_ONE_LINE } from "./business";

// Every portal email is transactional: it concerns one booking and nothing
// else. No offers, no newsletter content, ever.

// Sent from the armanarai.ca domain, which is what this project's Resend key is
// authorised for, with Reply-To set to i@armanarai.com below.
export const EMAIL_FROM = process.env.EMAIL_FROM || `${BUSINESS.tradeName} <${BUSINESS.sendingAddress}>`;

export function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

interface Attachment { filename: string; content: Buffer }

export async function sendEmail(opts: {
  to: string | string[];
  subject: string;
  html: string;
  text: string;
  attachments?: Attachment[];
}): Promise<{ id: string | null }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    if (process.env.VERCEL_ENV === "production") {
      throw new Error("RESEND_API_KEY is not set on the canadian-weddings project; portal email cannot be sent.");
    }
    console.log(`\n[portal email, not sent: no RESEND_API_KEY]\nTo: ${opts.to}\nSubject: ${opts.subject}\n\n${opts.text}\n`);
    return { id: null };
  }
  const resend = new Resend(key);
  const { data, error } = await resend.emails.send({
    from: EMAIL_FROM,
    to: Array.isArray(opts.to) ? opts.to : [opts.to],
    replyTo: BUSINESS.email,
    subject: opts.subject,
    html: opts.html,
    text: opts.text,
    attachments: opts.attachments,
  });
  if (error) throw new Error(`Email failed: ${error.message}`);
  return { id: data?.id ?? null };
}

/** A plain, high-contrast layout that reads the same in light and dark mail clients. */
export function layout(opts: { heading: string; bodyHtml: string; button?: { label: string; href: string } }): string {
  const button = opts.button
    ? `<p style="margin:28px 0"><a href="${esc(opts.button.href)}" style="background:#1A1612;color:#F4EFE6;text-decoration:none;padding:13px 26px;border-radius:2px;font-size:14px;letter-spacing:.06em;display:inline-block">${esc(opts.button.label)}</a></p>`
    : "";
  return `<!doctype html><html><body style="margin:0;padding:0;background:#F4EFE6">
<div style="max-width:560px;margin:0 auto;padding:36px 28px;font-family:Georgia,'Times New Roman',serif;color:#1A1612;background:#F4EFE6">
  <p style="margin:0 0 28px;font-family:Arial,sans-serif;font-size:11px;letter-spacing:.24em;text-transform:uppercase;color:#6B5A48">Arman Arai</p>
  <h1 style="margin:0 0 18px;font-weight:normal;font-size:26px;line-height:1.25;color:#1A1612">${esc(opts.heading)}</h1>
  <div style="font-size:16px;line-height:1.65;color:#2A2520">${opts.bodyHtml}</div>
  ${button}
  <hr style="border:none;border-top:1px solid #D9CEBC;margin:36px 0 16px">
  <p style="margin:0;font-family:Arial,sans-serif;font-size:12px;line-height:1.6;color:#6B5A48">
    ${esc(BUSINESS.legalName)}, operating as ${esc(BUSINESS.tradeName)}<br>
    ${esc(BUSINESS_ADDRESS_ONE_LINE)}<br>
    ${esc(BUSINESS.phone)} · <a href="mailto:${BUSINESS.email}" style="color:#6B5A48">${BUSINESS.email}</a><br>
    You are receiving this because of your booking with us. It is not a marketing message.
  </p>
</div></body></html>`;
}

export function footerText(): string {
  return `\n--\n${BUSINESS.legalName}, operating as ${BUSINESS.tradeName}\n${BUSINESS_ADDRESS_ONE_LINE}\n${BUSINESS.phone} · ${BUSINESS.email}\nYou are receiving this because of your booking with us. It is not a marketing message.`;
}
