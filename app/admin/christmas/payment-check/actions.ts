"use server";

import { redirect } from "next/navigation";
import { requireAdmin, requestMeta } from "@/lib/portal/auth";
import { BUSINESS } from "@/lib/portal/business";
import { checkoutRateLimit, OWNER_PAYMENT_CHECK, startOwnerPaymentCheck } from "@/lib/christmas/payments";

export async function openOwnerPaymentCheck(form: FormData) {
  const owner = await requireAdmin();
  if (owner.email !== BUSINESS.email) throw Error("Only the studio owner can open this payment check.");
  await checkoutRateLimit((await requestMeta()).ip);
  const result = await startOwnerPaymentCheck({
    slotId: String(form.get("slotId") || ""), packageId: "santa", name: BUSINESS.lead,
    email: owner.email, phone: BUSINESS.phone, albums: 0, shareActivity: false,
    acceptedPolicy: String(form.get("acceptedPolicy") || ""),
    expectedSubtotal: OWNER_PAYMENT_CHECK.subtotal, expectedTotal: OWNER_PAYMENT_CHECK.total,
    delivery: { letterNames: "Arman · payment check", line1: BUSINESS.address.line1, line2: "", city: BUSINESS.address.city, postalCode: BUSINESS.address.postalCode, province: "BC", country: "CA" },
  });
  redirect(result.checkoutUrl);
}
