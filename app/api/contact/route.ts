import { NextRequest, NextResponse } from "next/server";

async function sendViaGHL(data: Record<string, string>) {
  const webhookUrl = process.env.GHL_WEBHOOK_URL;
  if (!webhookUrl) return false;
  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return res.ok;
  } catch {
    return false;
  }
}

async function sendViaResend(subject: string, html: string, replyTo: string) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return false;
  try {
    const { Resend } = await import("resend");
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: "Arman Arai <onboarding@resend.dev>",
      to: ["i@armanarai.com"],
      replyTo,
      subject,
      html,
    });
    return !error;
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type } = body;

    const ghlData: Record<string, string> = {
      source: "armanarai.com",
      type: type ?? "quick",
      name: body.name ?? "",
      phone: body.phone ?? "",
      email: body.email ?? "",
      bestTime: body.bestTime ?? "",
      partnerName: body.partnerName ?? "",
      weddingDate: body.weddingDate ?? "",
      venue: body.venue ?? "",
      guestCount: body.guestCount ?? "",
      collection: body.collection ?? "",
      message: body.message ?? "",
      referral: body.referral ?? "",
    };

    const isQuick = type === "quick";
    const subject = isQuick
      ? `New Inquiry — ${body.name}`
      : `Wedding Inquiry — ${body.name}${body.partnerName ? ` & ${body.partnerName}` : ""}`;

    const rows: [string, string][] = isQuick
      ? [
          ["Name", body.name ?? ""],
          ["Phone", body.phone || "Not provided"],
          ["Email", body.email ?? ""],
          ["Best Time", body.bestTime || "Not specified"],
        ]
      : [
          ["Couple", `${body.name ?? ""}${body.partnerName ? ` & ${body.partnerName}` : ""}`],
          ["Phone", body.phone || "Not provided"],
          ["Email", body.email ?? ""],
          ["Wedding Date", body.weddingDate || "Not provided"],
          ["Venue", body.venue || "Not provided"],
          ["Guests", body.guestCount || "Not provided"],
          ["Referral", body.referral || "Not provided"],
        ];

    const html = `
      <div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;color:#2C2420;">
        <h2 style="font-size:1.3rem;font-weight:normal;border-bottom:1px solid #D9CEBC;padding-bottom:0.75rem;margin-bottom:1.5rem;">
          ${isQuick ? "New Website Inquiry" : "Wedding Inquiry"}
        </h2>
        <table style="width:100%;border-collapse:collapse;">
          ${rows.map(([label, value]) => `<tr><td style="padding:0.5rem 0;color:#A67268;font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;width:140px;vertical-align:top;">${label}</td><td style="padding:0.5rem 0;">${value}</td></tr>`).join("")}
        </table>
        ${body.message ? `<div style="margin-top:1.5rem;padding:1.25rem;background:#F7F3EC;border-left:2px solid #C9A89A;"><p style="margin:0 0 0.5rem;color:#A67268;font-size:0.75rem;text-transform:uppercase;">Message</p><p style="margin:0;line-height:1.7;">${body.message}</p></div>` : ""}
        <p style="margin-top:2rem;font-size:0.75rem;color:#6B7280;border-top:1px solid #EDE7DA;padding-top:1rem;">Sent via armanarai.com</p>
      </div>`;

    let sent = false;
    if (process.env.GHL_WEBHOOK_URL) sent = await sendViaGHL(ghlData);
    if (!sent && process.env.RESEND_API_KEY) sent = await sendViaResend(subject, html, body.email);
    if (!sent) console.warn("No email provider configured. Set GHL_WEBHOOK_URL or RESEND_API_KEY in Vercel.");

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Contact API error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
