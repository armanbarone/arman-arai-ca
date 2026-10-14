"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/portal/auth";
import {
  deleteLead,
  updateLead,
  recordLead,
  listLeads,
  isDuplicate,
  type LeadStage,
} from "@/lib/portal/leads";

type Result = { ok: true; message: string } | { ok: false; error: string };
const fail = (e: unknown): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : "Please try again.",
});

/** The one row Arman keeps up to date: where it got to, and what it was worth. */
export async function saveLead(
  id: string,
  patch: {
    stage?: LeadStage;
    consult?: boolean;
    booked?: boolean;
    value?: string;
    bookingRef?: string;
    lostReason?: string;
    notes?: string;
    weddingDate?: string;
  },
): Promise<Result> {
  await requireAdmin();
  try {
    await updateLead(id, (l) => {
      if (patch.stage) l.stage = patch.stage;
      if (patch.consult !== undefined) l.consult = patch.consult;
      if (patch.booked !== undefined) l.booked = patch.booked;
      if (patch.bookingRef !== undefined)
        l.bookingRef = patch.bookingRef.trim() || undefined;
      if (patch.lostReason !== undefined)
        l.lostReason = patch.lostReason.trim() || undefined;
      if (patch.notes !== undefined) l.notes = patch.notes.slice(0, 4000);
      if (patch.weddingDate !== undefined)
        l.weddingDate = patch.weddingDate.trim() || undefined;
      if (patch.value !== undefined) {
        const clean = patch.value.replace(/[^0-9.]/g, "");
        if (!clean) l.valueCents = undefined;
        else {
          const cents = Math.round(Number(clean) * 100);
          if (!Number.isFinite(cents) || cents < 0)
            throw new Error("Enter the value as a number, for example 4500.");
          l.valueCents = cents;
        }
      }
      if (l.consult && !l.consultAt) l.consultAt = new Date().toISOString();
    });
    revalidatePath("/admin/inquiries");
    return { ok: true, message: "Saved." };
  } catch (e) {
    return fail(e);
  }
}

export async function removeLead(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await deleteLead(id);
    revalidatePath("/admin/inquiries");
    return { ok: true, message: "Inquiry removed." };
  } catch (e) {
    return fail(e);
  }
}

/** An inquiry that arrived by phone, by referral, or before the tracker existed. */
export async function addLeadByHand(input: {
  name: string;
  email: string;
  receivedAt: string;
  source: string;
  phone?: string;
  weddingDate?: string;
  message?: string;
}): Promise<Result> {
  await requireAdmin();
  try {
    if (input.name.trim().length < 2) throw new Error("Enter their name.");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.receivedAt))
      throw new Error("Enter the date the inquiry arrived.");
    const lead = await recordLead({
      receivedAt: `${input.receivedAt}T12:00:00.000Z`,
      name: input.name.trim(),
      email: input.email.trim().toLowerCase(),
      phone: input.phone?.trim() || undefined,
      source: input.source.trim() || "Added by hand",
      formType: "manual",
      weddingDate: input.weddingDate?.trim() || undefined,
      message: input.message?.trim() || undefined,
    });
    if (!lead) throw new Error("Could not save that inquiry.");
    revalidatePath("/admin/inquiries");
    return { ok: true, message: `${lead.name} added.` };
  } catch (e) {
    return fail(e);
  }
}

/**
 * Backfill, used by the Gmail import. Skips anything already on the board for
 * that address on that day, so running it twice does not double the list.
 */
export async function importLeads(
  rows: {
    name: string;
    email: string;
    receivedAt: string;
    source: string;
    phone?: string;
    weddingDate?: string;
    message?: string;
    importedFrom?: string;
  }[],
): Promise<Result> {
  await requireAdmin();
  try {
    const existing = await listLeads();
    let added = 0;
    let skipped = 0;
    for (const r of rows) {
      if (!r.email || isDuplicate(existing, r.email, r.receivedAt)) {
        skipped++;
        continue;
      }
      const lead = await recordLead({
        receivedAt: r.receivedAt,
        name: r.name,
        email: r.email.toLowerCase(),
        phone: r.phone,
        source: r.source,
        formType: "imported",
        weddingDate: r.weddingDate,
        message: r.message,
        importedFrom: r.importedFrom,
      });
      if (lead) {
        existing.push(lead);
        added++;
      }
    }
    revalidatePath("/admin/inquiries");
    return {
      ok: true,
      message: `${added} added, ${skipped} already on the board.`,
    };
  } catch (e) {
    return fail(e);
  }
}
