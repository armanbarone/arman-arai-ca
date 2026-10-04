import type { Booking, Installment } from "./types";
import { formatCad, formatDate, roundDiv } from "./money";
import type { WeddingBlock, WeddingAmendment } from "./wedding";
import { FIELD_GROUPS } from "./workOrderFields";
export function amendmentBase(b: Booking) {
  return JSON.stringify({
    clients: b.clients,
    event: b.event,
    lines: b.lines,
    taxes: b.taxes,
    fields: b.fields,
    packageKey: b.packageKey,
    packageName: b.packageName,
    schedule: b.schedule,
    payments: b.payments,
  });
}
export function revisedSchedule(
  b: Booking,
  total: Booking["totals"],
  dueDate: string,
  id: string,
): Installment[] {
  const paid = b.schedule.filter((i) => i.paidCents > 0),
    received = paid.reduce((s, i) => s + i.paidCents, 0);
  if (total.totalCents < received)
    throw new Error(
      "The revised price is below confirmed payments. Resolve and record the refund or settlement before revising the balance.",
    );
  const rows = [
    ...paid.map((i) => ({
      ...i,
      totalCents: i.paidCents,
      status: "paid" as const,
    })),
    ...(total.totalCents > received
      ? [
          {
            id,
            label: paid.length ? "Revised balance" : "Revised booking payment",
            kind: paid.length ? ("instalment" as const) : ("deposit" as const),
            dueDate,
            dueRule: "Exact date approved in the signed change order",
            subtotalCents: 0,
            taxCents: {},
            totalCents: total.totalCents - received,
            paidCents: 0,
            status: "scheduled" as const,
            reference: `${b.ref}-CHANGE`,
          },
        ]
      : []),
  ];
  const left = { ...total.taxCents };
  return rows.map((r, i) => {
    const taxCents: Record<string, number> = {};
    for (const code of Object.keys(left)) {
      taxCents[code] =
        i === rows.length - 1
          ? left[code]
          : roundDiv(r.totalCents * total.taxCents[code], total.totalCents);
      left[code] -= taxCents[code];
    }
    return {
      ...r,
      taxCents,
      subtotalCents:
        r.totalCents - Object.values(taxCents).reduce((s, v) => s + v, 0),
    };
  });
}
export function amendmentBlocks(
  b: Booking,
  a: WeddingAmendment,
): WeddingBlock[] {
  const p = a.plan;
  const table = (id: string, rows: string[][]): WeddingBlock => ({
    kind: "table",
    id,
    header: true,
    rows: rows.map((row) => row.map((text) => ({ text }))),
  });
  return [
    { kind: "h", text: "Exact booking revision approved by this change order" },
    { kind: "p", text: a.reason },
    table("amendment-values", [
      ["Detail", "Before", "After"],
      ["Wedding date", formatDate(b.event.date), formatDate(p.event.date)],
      ["Location", b.event.location, p.event.location],
      [
        "Service dates",
        b.event.serviceDates || b.event.date,
        p.event.serviceDates || p.event.date,
      ],
      ["Collection", b.packageName, p.packageName],
      ...FIELD_GROUPS.flatMap((g) => g.fields).map((f) => [
        f.label,
        b.fields[f.id] || "Not included / not applicable",
        p.fields[f.id] || "Not included / not applicable",
      ]),
    ]),
    table("amendment-total", [
      ["Amount (CAD)", "Before", "After"],
      [
        "Subtotal",
        formatCad(b.totals.subtotalCents),
        formatCad(p.totals.subtotalCents),
      ],
      [
        "Tax",
        formatCad(b.totals.taxTotalCents),
        formatCad(p.totals.taxTotalCents),
      ],
      ["Total", formatCad(b.totals.totalCents), formatCad(p.totals.totalCents)],
      ["Net change", "", formatCad(p.totals.totalCents - b.totals.totalCents)],
    ]),
    table("amendment-lines", [
      ["Revised price line", "Amount (CAD)"],
      ...p.lines.map((l) => [l.label, formatCad(l.cents)]),
    ]),
    table("amendment-taxes", [
      ["Tax", "Rate", "Registration", "Amount (CAD)"],
      ...p.taxes.map((t) => [
        t.label,
        `${t.rateBps / 100}%`,
        t.registration,
        formatCad(p.totals.taxCents[t.code] || 0),
      ]),
    ]),
    table("amendment-schedule", [
      ["Revised payment", "Amount (CAD)", "Due", "Already received"],
      ...p.schedule.map((i) => [
        i.label,
        formatCad(i.totalCents),
        formatDate(i.dueDate),
        formatCad(i.paidCents),
      ]),
    ]),
    {
      kind: "p",
      text: "This exact revision takes effect after the Company and both clients sign. Confirmed receipts are preserved. All other signed terms and optional privacy choices remain unchanged.",
    },
  ];
}
