import type { Booking, Client } from "./types";
export type WeddingInvoice = {
  id: string;
  number: string;
  status: "issued" | "void";
  installmentId: string;
  label: string;
  description: string;
  dueDate: string;
  issuedAt: string;
  issuedBy: string;
  currency: "cad";
  subtotalCents: number;
  taxes: { label: string; registration: string; cents: number }[];
  totalCents: number;
  paidCentsAtIssue: number;
  amountDueCents: number;
  clients: [Client, Client];
  eventDate: string;
  location: string;
  packageName: string;
  cardEnabled: boolean;
  basis: string;
  hash: string;
  pdfKey?: string;
  deliveries?: Record<string, { id: string; sentAt: string }>;
  notificationRequests?: Record<
    string,
    { url: string; key: string; createdAt: string }
  >;
  deliveryError?: string;
  voidReason?: string;
  sourceSha256: string;
};
export type WeddingCheckout = {
  id: string;
  invoiceId: string;
  installmentId: string;
  amountCents: number;
  email: string;
  createdAt: string;
  expiresAt: string;
  status: "open" | "completed" | "expired";
  livemode: boolean;
};
export function invoiceBasis(b: Booking, id: string) {
  const i = b.schedule.find((x) => x.id === id);
  return JSON.stringify({
    clients: b.clients,
    eventDate: b.event.date,
    location: b.event.location,
    packageName: b.packageName,
    lines: b.lines,
    taxes: b.taxes,
    installment: i
      ? {
          id: i.id,
          total: i.totalCents,
          subtotal: i.subtotalCents,
          taxes: i.taxCents,
          due: i.dueDate,
        }
      : null,
  });
}
export function invoiceBalance(b: Booking, v: WeddingInvoice) {
  const i = b.schedule.find((x) => x.id === v.installmentId);
  if (
    v.status === "void" ||
    !i ||
    i.status === "void" ||
    invoiceBasis(b, v.installmentId) !== v.basis
  )
    return 0;
  return Math.max(0, Math.min(v.amountDueCents, i.totalCents - i.paidCents));
}
export function invoiceState(b: Booking, v: WeddingInvoice) {
  if (v.status === "void") return "void";
  if (invoiceBasis(b, v.installmentId) !== v.basis) return "superseded";
  return invoiceBalance(b, v) === 0
    ? "paid"
    : v.deliveries && Object.keys(v.deliveries).length
      ? "sent"
      : "issued";
}
export function activeCheckouts(b: Booking) {
  return (b.checkouts || []).filter(
    (c) =>
      c.status === "open" &&
      (!c.id.startsWith("pending-") || Date.parse(c.expiresAt) > Date.now()),
  );
}
