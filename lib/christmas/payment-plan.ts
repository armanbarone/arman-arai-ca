import { sessionQuote, dateLabel, timeLabel, money } from "./catalog";
import type { Reservation } from "./inventory";

export const DEPOSIT_PLAN = "deposit-50-v1" as const;
// Applied immediately as part-payment of the base session, including 5% GST.
export const DEPOSIT = { subtotal: 4762, gst: 238, total: 5000 } as const;
export interface DepositPlan {
  kind: typeof DEPOSIT_PLAN;
  depositSubtotalCents: number; depositGstCents: number; depositCents: number;
  balanceDueAt?: number; depositPaidCents?: number; balancePaidCents?: number;
  customerId?: string; balanceInvoiceId?: string; balanceInvoiceUrl?: string;
  balanceReceiptSentAt?: number;
}
export function depositQuote(albums: number) {
  const order = sessionQuote(albums);
  return { ...order, dueNow: DEPOSIT.total, depositSubtotal: DEPOSIT.subtotal, depositGst: DEPOSIT.gst,
    balanceSubtotal: order.subtotal - DEPOSIT.subtotal, balanceGst: order.gst - DEPOSIT.gst,
    balancePst: order.pst, balance: order.total - DEPOSIT.total };
}
export function bookingPaymentSummary(r: Reservation) {
  const total = r.totalCents ?? r.subtotalCents + Math.round(r.subtotalCents * .05);
  const paid = r.paidCents ?? (!r.paymentPlan && r.status === "paid" ? total : 0);
  return { total, paid, balance: r.paymentPlan ? Math.max(0, total - paid) : r.status === "paid" ? 0 : total,
    deposit: !!r.paymentPlan, dueAt: r.paymentPlan?.balanceDueAt };
}
export function balanceDeadline(date: string, time: string) {
  if (!date || !time) return "on arrival, before your session starts";
  return `on arrival, before your session starts on ${dateLabel(date, { weekday: "long", month: "long", day: "numeric", year: "numeric" })} at ${timeLabel(time)} Pacific`;
}
export function bookingPaymentText(r: Reservation, date: string, time: string) {
  const p = bookingPaymentSummary(r);
  return r.paymentPlan ? `Order total ${money(p.total)} CAD including tax · Paid ${money(p.paid)} CAD · Balance ${money(p.balance)} CAD${p.balance ? ` due ${balanceDeadline(date, time)}` : " · Paid in full"}` : `Paid ${money(p.paid)} CAD`;
}
