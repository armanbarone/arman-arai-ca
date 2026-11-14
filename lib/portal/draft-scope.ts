import "server-only";
import type { Booking } from "./types";
import { formatCad, formatDate, todayInBusinessTz } from "./money";
import { esc, layout, footerText } from "./email";
import { TIERS } from "@/lib/site";

/* The commercial half of a contract, written out for a couple to read before
 * anything is issued.
 *
 * A draft proposal cannot be published until the couple's own details are
 * approved, and their details cannot be approved until they have filled the
 * form, so there was no way to show somebody what they were being offered
 * without typing it out by hand into an email. Typed by hand it drifts from
 * the booking the moment either changes, so this renders from the booking.
 *
 * It is deliberately not the agreement: the clauses, the liability and the
 * cancellation terms live there and are not reproduced here, and the email
 * says so.
 */

const SPECS: [string, string][] = [
  ["coverage", "Hours on the day"],
  ["teamOnSite", "Who photographs it"],
  ["photoSpec", "Photography"],
  ["filmSpec", "Film"],
  ["engagementSpec", "Portrait session"],
  ["planningSpec", "Planning"],
  ["previewSpec", "First look at the photographs"],
  ["gallerySpec", "Your gallery"],
  ["socialSpec", "Social reels"],
  ["analogueSpec", "Analogue film"],
  ["printsSpec", "Prints on the night"],
  ["albumSpec", "Album"],
  ["otherSpec", "Also included"],
];

export function draftScopeLines(b: Booking) {
  const money = [
    ["Collection", b.packageName],
    ...b.lines
      .filter((l) => l.kind !== "package")
      .map((l) => [l.label, formatCad(l.cents)] as [string, string]),
    ["Before tax", formatCad(b.totals.subtotalCents)],
    ...Object.entries(b.totals.taxCents).map(
      ([code, cents]) => [code, formatCad(cents)] as [string, string],
    ),
    ["Total", formatCad(b.totals.totalCents)],
  ] as [string, string][];

  /* The first instalment falls due at booking, which for an unsigned draft is
     a date that has already gone. Quoting it to somebody who owes nothing
     reads as a mistake, so it is described rather than dated. */
  const today = todayInBusinessTz();
  const schedule = b.schedule
    .filter((i) => i.status !== "void")
    .map(
      (i) =>
        [
          i.label,
          `${formatCad(i.totalCents)} · ${
            i.dueDate <= today ? "due on signing" : `due ${formatDate(i.dueDate)}`
          }`,
        ] as [string, string],
    );

  const scope: [string, string][] = [];
  const seen: string[] = [];
  for (const [key, label] of SPECS) {
    const value = (b.fields[key] ?? "").trim();
    if (!value) continue;
    /* "Also included" is a roll-up of the rows above it, so on most bookings it
       repeats the film rolls and the prints word for word. Only the parts that
       say something new are worth a reader's time. */
    const parts = value
      .split("\n")
      .flatMap((line) => line.split(";"))
      .flatMap((piece) => piece.split(/(?<=\.)\s+/))
      .map((x) => x.trim())
      .filter(Boolean);
    const fresh = parts.filter(
      (x) => !seen.some((y) => y.toLowerCase().includes(x.replace(/\.$/, "").toLowerCase())),
    );
    if (!fresh.length) continue;
    scope.push([label, fresh.join(" ")]);
    seen.push(value);
  }
  if ((b.fields.locations ?? "").trim())
    scope.push(["Where", b.fields.locations.trim()]);
  if ((b.fields.guestCount ?? "").trim())
    scope.push(["Guests included", b.fields.guestCount.trim()]);

  const included = (b.fields.overview ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const alternatives =
    b.status === "draft" &&
    !b.collectionChosen &&
    TIERS.some((t) => t.slug === b.packageKey)
      ? TIERS.filter((t) => t.slug !== b.packageKey).map((t) => ({
          name: t.name,
          price: formatCad(t.price * 100),
        }))
      : [];

  return { money, schedule, scope, included, alternatives };
}

const rows = (pairs: [string, string][]) =>
  pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:7px 14px 7px 0;vertical-align:top;font-family:Arial,sans-serif;font-size:12px;letter-spacing:.04em;text-transform:uppercase;color:#6B5A48;white-space:nowrap">${esc(
          k,
        )}</td><td style="padding:7px 0;vertical-align:top;font-size:15px;line-height:1.55">${esc(
          v,
        ).replace(/\n/g, "<br>")}</td></tr>`,
    )
    .join("");

export function draftScopeEmail(b: Booking, firstName: string) {
  const { money, schedule, scope, included, alternatives } = draftScopeLines(b);
  const choiceHtml = alternatives.length
    ? `<p>The collection below is where we started, not a decision. ${alternatives
        .map((a) => `<strong>${esc(a.name)}</strong> at ${esc(a.price)}`)
        .join(" and ")} ${
        alternatives.length === 1 ? "is the other option" : "are the other options"
      }, and you choose in your own portal, where each one lists everything it carries.</p>`
    : "";
  const names = b.clients
    .map((c) => c.preferredName || c.legalName)
    .filter(Boolean)
    .join(" and ");

  const bodyHtml = `
<p>${esc(firstName)}, here is everything on your wedding as it stands, so you can read it over before anything is signed.</p>
<p><strong>This is a draft.</strong> Nothing here is agreed, nothing is booked and no payment is due. Tell me what you want changed and I will change it.</p>
${choiceHtml}
<h2 style="font-weight:normal;font-size:19px;margin:32px 0 6px">The wedding</h2>
<table style="border-collapse:collapse;width:100%">${rows([
    ["Date", formatDate(b.event.date)],
    ...(b.event.backupDate
      ? ([["Alternate date", formatDate(b.event.backupDate)]] as [string, string][])
      : []),
    ["Place", `${b.event.location}, ${b.event.province}`],
    ["For", names],
  ])}</table>
<h2 style="font-weight:normal;font-size:19px;margin:32px 0 6px">What is included</h2>
${
  included.length
    ? `<ul style="margin:8px 0;padding-left:20px">${included
        .map((l) => `<li style="margin:5px 0">${esc(l)}</li>`)
        .join("")}</ul>`
    : "<p>To be confirmed.</p>"
}
<h2 style="font-weight:normal;font-size:19px;margin:32px 0 6px">In detail</h2>
<table style="border-collapse:collapse;width:100%">${rows(scope)}</table>
<h2 style="font-weight:normal;font-size:19px;margin:32px 0 6px">The price</h2>
<table style="border-collapse:collapse;width:100%">${rows(money)}</table>
<h2 style="font-weight:normal;font-size:19px;margin:32px 0 6px">How it would be paid</h2>
<table style="border-collapse:collapse;width:100%">${rows(schedule)}</table>
<p style="margin-top:12px">Canadian dollars. Interac e-Transfer or card.</p>
<h2 style="font-weight:normal;font-size:19px;margin:32px 0 6px">What is not here</h2>
<p>The full agreement carries the terms this summary does not: cancellation, what happens in bad weather, how the photographs may be used, and the liability either side carries. You will get the whole thing to read and sign before anything is binding, and you can ask me about any line in it first.</p>
<p>Anything you would like changed, just reply.</p>`;

  const text = [
    `${firstName}, here is everything on your wedding as it stands.`,
    "",
    "THIS IS A DRAFT. Nothing is agreed, nothing is booked and no payment is due.",
    ...(alternatives.length
      ? [
          "",
          `The collection below is where we started, not a decision. ${alternatives
            .map((a) => `${a.name} at ${a.price}`)
            .join(" and ")} ${alternatives.length === 1 ? "is the other option" : "are the other options"}, and you choose in your own portal.`,
        ]
      : []),
    "",
    "THE WEDDING",
    `Date: ${formatDate(b.event.date)}`,
    ...(b.event.backupDate ? [`Alternate date: ${formatDate(b.event.backupDate)}`] : []),
    `Place: ${b.event.location}, ${b.event.province}`,
    `For: ${names}`,
    "",
    "WHAT IS INCLUDED",
    ...(included.length ? included.map((l) => `- ${l}`) : ["To be confirmed."]),
    "",
    "IN DETAIL",
    ...scope.map(([k, v]) => `${k}: ${v}`),
    "",
    "THE PRICE",
    ...money.map(([k, v]) => `${k}: ${v}`),
    "",
    "HOW IT WOULD BE PAID",
    ...schedule.map(([k, v]) => `${k}: ${v}`),
    "Canadian dollars. Interac e-Transfer or card.",
    "",
    "WHAT IS NOT HERE",
    "The full agreement carries cancellation, bad weather, how the photographs may be used and the liability either side carries. You will get the whole thing to read and sign before anything is binding.",
    "",
    "Anything you would like changed, just reply.",
    footerText(),
  ].join("\n");

  return {
    subject: `Your wedding photography, in detail (${b.ref})`,
    html: layout({
      heading: "Everything on your wedding, in one place",
      bodyHtml,
    }),
    text,
  };
}
