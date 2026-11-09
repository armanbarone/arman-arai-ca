import "server-only";
import { APP_URL, BUSINESS } from "@/lib/portal/business";
import { esc, layout, sendEmail } from "@/lib/portal/email";
import { dateLabel, timeLabel, money, packageById } from "./catalog";
import { bookingLink } from "./access";
import type { Slot } from "./inventory";
import { inventoryStore, updateSlot } from "./store";

export function calendarAttachment(slot: Slot) {
  const r = slot.reservation!, minutes = r.packageSnapshot?.minutes ?? 45;
  const start = new Date(`${slot.date}T${slot.time}:00-08:00`), end = new Date(start.getTime() + minutes * 60000);
  const stamp = (d: Date) => d.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
  const safe = (t: string) => t.replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n").replace(/;/g, "\\;").replace(/,/g, "\\,");
  return Buffer.from(["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arman Arai//Christmas Sessions//EN", "BEGIN:VEVENT", `UID:${r.id}@armanarai.ca`, `DTSTAMP:${stamp(new Date())}`, `DTSTART:${stamp(start)}`, `DTEND:${stamp(end)}`, "SUMMARY:Christmas with Santa - Arman Arai", `LOCATION:${safe(r.bookingDetails.studioAddress + ", " + r.bookingDetails.postalCode)}`, `DESCRIPTION:${safe(r.bookingDetails.arrivalNotes + "\n" + BUSINESS.email)}`, "END:VEVENT", "END:VCALENDAR"].join("\r\n"));
}

export function bookingEmails(slot: Slot, { preview = false }: { preview?: boolean } = {}) {
  const r = slot.reservation!, cfg = r.bookingDetails, pkg = r.packageSnapshot ?? packageById(r.packageId)!;
  const when = `${dateLabel(slot.date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${timeLabel(slot.time)} Pacific`;
  const confirmation = preview ? "/christmas/confirmation/preview" : bookingLink(slot.id, r, "confirmation"), questionnaire = preview ? "/christmas/questionnaire/preview" : bookingLink(slot.id, r, "questionnaire");
  const first = r.name.trim().split(/\s+/)[0];
  const album = r.albums ? `${r.albums} printed album(s), 10 pages and 20 photographs each. Hand delivery across Greater Vancouver through Surrey is arranged after selections; pre-Christmas album delivery is not guaranteed.` : "No printed albums added.";
  const details = `${when}\n${cfg.studioAddress}, ${cfg.postalCode}\n${cfg.arrivalNotes}\nApproximately ${pkg.minutes} minutes · ${pkg.images} digital photographs · ${pkg.sets} sets · Santa included\n${album}\nPaid ${money(r.paidCents ?? r.totalCents ?? r.subtotalCents)} CAD · ${r.id}`;
  const guide = [
    { title: "Where to come", paragraphs: [`${cfg.studioAddress}, ${cfg.postalCode}. ${cfg.arrivalNotes}`, `Your ${pkg.minutes}-minute session takes place indoors across ${pkg.sets} Christmas sets. Arrive dressed and ready for your booked start time.`] },
    { title: "What to wear & bring", paragraphs: ["Cream, burgundy, olive, warm neutrals and simple knitwear suit the sets. Coordinate colours; identical outfits are not necessary. Plan one outfit so we can spend the session taking photographs.", "Bring water, wipes and a small comfort toy if it helps. Spare clothes for little ones are welcome."] },
    { title: "Your family & Santa", paragraphs: ["Your session is for one household of up to five people, including parents. Reply if your group has changed or you need help with access.", "Shy children can stay close to a parent. There is no pressure to sit on Santa’s lap or smile on cue; we can start with family photographs and let your child settle in.", "Cookies and warm milk are included. Tell us about food allergies or dietary needs in your questionnaire before the visit; treats can be skipped."] },
    { title: "When your photographs arrive", paragraphs: [`Your ${pkg.images} edited digital photographs arrive in a private download gallery within five days. Sessions from December 18 onward have a 48-hour turnaround. You can download, print and share the finished photographs. RAW files are not included.`] },
    { title: "Your Santa letter & keepsake", paragraphs: ["Your Santa letter and complimentary printed keepsake are mailed separately to the BC address you entered at checkout. BC postage is included. Reply if the names or mailing address need correcting. Postal arrival before Christmas is not guaranteed."] },
    { title: "Printed albums", paragraphs: [r.albums ? `Your booking includes ${r.albums} printed album${r.albums > 1 ? "s" : ""}.` : "No printed albums were added to your booking.", "Each album has 10 pages and 20 photographs. The first costs $67, the second $55 and the third $45, plus tax. Album buyers receive 20 edited digital photographs. Hand delivery across Greater Vancouver through Surrey is included after your photo selections. Delivery before Christmas is not guaranteed."] },
    { title: "Cancellation & rescheduling", paragraphs: [cfg.cancellationPolicy] },
  ];
  const guideHtml = guide.map(section => `<h2 style="font-size:20px;font-weight:normal;margin:28px 0 10px">${esc(section.title)}</h2>${section.paragraphs.map(p => `<p>${esc(p)}</p>`).join("")}`).join("");
  const guideText = guide.map(section => `${section.title.toUpperCase()}\n${section.paragraphs.join("\n\n")}`).join("\n\n");
  const welcome = {
    subject: `You’re booked · Your Christmas session guide · ${dateLabel(slot.date)}`,
    html: layout({ heading: "Your Christmas visit is booked.", bodyHtml: `<p>Hi ${esc(first)},</p><p>Your payment is received and your appointment is confirmed. Here’s your guide to the visit.</p><p><strong>${esc(when)}</strong><br>Approximately ${pkg.minutes} minutes · ${pkg.images} edited digital photographs · ${pkg.sets} Christmas sets · Santa included.</p><p><strong>Paid ${esc(money(r.paidCents ?? r.totalCents ?? r.subtotalCents))} CAD</strong><br>Booking reference: ${esc(r.id)}. Stripe emails your payment receipt separately.${r.invoiceUrl ? ` <a href="${esc(r.invoiceUrl)}">View your paid invoice</a>.` : " Your paid invoice link will also appear on your booking page when Stripe finishes generating it."}</p><p><strong>Next: your family questionnaire.</strong> A separate email follows this guide. Tell us who’s coming, the children’s ages, outfits and comfort with Santa so we can prepare.</p>${guideHtml}<p>Keep this email handy. Questions or changes? Reply to this email.<br>Arman</p>`, button: { label: "View your booking", href: confirmation } }),
    text: `Hi ${first},\nYour Christmas visit is confirmed. Here’s your session guide.\n\n${details}\n\nNEXT: YOUR FAMILY QUESTIONNAIRE\nA separate email follows this guide. Tell us who’s coming, the children’s ages, outfits and comfort with Santa so we can prepare.\n\n${guideText}\n\nStripe emails your receipt separately. Your paid invoice appears on your booking page when ready.\nView booking: ${confirmation}\nKeep this email handy. Reply with questions or changes: ${BUSINESS.email}\nArman`,
  };
  const survey = {
    subject: "A few details for your family’s Christmas session",
    html: layout({ heading: "Tell us a little about your family.", bodyHtml: `<p>Hi ${esc(first)},</p><p>Your Christmas session is booked for <strong>${esc(when)}</strong>. Please complete this short questionnaire so we can plan for your family.</p><p>We’ll ask who is coming, the children’s first names and approximate ages, how many people will be photographed, outfits, the photographs you’d love, and how comfortable everyone feels around Santa.</p><p>Food and access notes are optional. Share only what helps us prepare; medical diagnoses are not needed. These answers are private and used to plan your booking.</p><p>Please send it before your session. You can return to the same link to update your answers. Your appointment is already confirmed; this is not another payment step.</p><p>Thank you,<br>Arman</p>`, button: { label: "Complete your family questionnaire", href: questionnaire } }),
    text: `Hi ${first},\nYour session: ${when}.\nPlease complete your private family questionnaire before your visit: ${questionnaire}\nWe’ll ask who is coming, children’s first names/approximate ages, group size, outfits, favourite photographs and comfort with Santa. Food and access notes are optional. No medical diagnoses are needed. You can update your answers using the same link. Your appointment is already confirmed and no further payment is required here.\nArman`,
  };
  const studio = {
    subject: `New Christmas booking · ${dateLabel(slot.date)} · ${timeLabel(slot.time)} · ${r.name}`,
    html: layout({ heading: "A Christmas session was purchased", bodyHtml: `<h2 style="font-size:21px;color:#264232">${esc(when)}</h2><p><strong>${esc(r.name)}</strong><br>${esc(r.email)}<br>${esc(r.phone)}</p><p>${esc(details).replace(/\n/g, "<br>")}</p><p>This alert is sent after Stripe confirms payment. The appointment is marked sold in your booking calendar.</p>`, button: { label: "Open Christmas calendar", href: `${APP_URL}/admin/christmas?date=${slot.date}` } }),
    text: `NEW PAID CHRISTMAS BOOKING\n\n${r.name} · ${r.email} · ${r.phone}\n${details}\n\n${APP_URL}/admin/christmas?date=${slot.date}`,
  };
  if (r.testMode) for (const message of [welcome, survey, studio]) {
    message.subject = `[TEST BOOKING · NO REAL APPOINTMENT] ${message.subject}`;
    message.html = message.html.replace("<body", '<body data-test-booking="true"').replace(/(<body[^>]*>)/, '$1<p style="padding:16px;text-align:center;background:#fff2cc;color:#543f17">TEST PAYMENT · NO REAL APPOINTMENT · DO NOT ATTEND</p>');
    message.text = `TEST PAYMENT · NO REAL APPOINTMENT · DO NOT ATTEND\n\n${message.text}`;
  }
  return { welcome, survey, studio, details, confirmation, questionnaire };
}

export async function sendBookingNotifications(slotId: string) {
  let slot = (await inventoryStore.read(slotId))?.data, r = slot?.reservation;
  if (!slot || !r || r.status !== "paid" || r.emailsSent) return;
  const messages = bookingEmails(slot), reservationId = r.id, email = r.email;
  async function clientEmails() {
    if (!r!.welcomeSentAt) {
      await sendEmail({ to: email, ...messages.welcome, attachments: [{ filename: "Christmas-session.ics", content: calendarAttachment(slot!) }], idempotencyKey: `christmas-welcome-v2-${reservationId}` });
      await updateSlot(slotId, s => { if (s.reservation?.id === reservationId) s.reservation.welcomeSentAt = Date.now(); });
    }
    const current = (await inventoryStore.read(slotId))?.data.reservation;
    if (current?.id === reservationId && !current.questionnaireSentAt) {
      await sendEmail({ to: email, ...messages.survey, idempotencyKey: `christmas-questionnaire-v1-${reservationId}` });
      await updateSlot(slotId, s => { if (s.reservation?.id === reservationId) s.reservation.questionnaireSentAt = Date.now(); });
    }
  }
  async function studioEmail() {
    if (r!.studioSentAt) return;
    await sendEmail({ to: BUSINESS.email, ...messages.studio, idempotencyKey: `christmas-studio-v2-${reservationId}` });
    await updateSlot(slotId, s => { if (s.reservation?.id === reservationId) s.reservation.studioSentAt = Date.now(); });
  }
  const results = await Promise.allSettled([clientEmails(), studioEmail()]);
  await updateSlot(slotId, s => { if (s.reservation?.id === r!.id) s.reservation.emailsSent = !!(s.reservation.welcomeSentAt && s.reservation.questionnaireSentAt && s.reservation.studioSentAt); });
  const failed = results.find(result => result.status === "rejected");
  if (failed?.status === "rejected") throw failed.reason;
}
