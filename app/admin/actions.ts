"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requestMeta, sendInvite } from "@/lib/portal/auth";
import { buildSchedule, computeTotals, todayInBusinessTz } from "@/lib/portal/money";
import { defaultPlanning } from "@/lib/portal/planning";
import { PROVINCES, TIMEZONES, packageByKey } from "@/lib/portal/presets";
import { ConflictError, createBooking, getBooking, getSettings, nextReference, saveSettings, updateBooking } from "@/lib/portal/store";
import type { Booking } from "@/lib/portal/types";
import { randomId } from "@/lib/portal/token";

const provinceCodes = PROVINCES.map((p) => p.code) as [string, ...string[]];
const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use a full date");

const clientSchema = z.object({
  legalName: z.string().trim().min(3, "Full legal name is required"),
  preferredName: z.string().trim().default(""),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  phone: z.string().trim().min(7, "Phone is required"),
  address: z.object({
    line1: z.string().trim().min(3, "Street address is required"),
    line2: z.string().trim().optional().default(""),
    city: z.string().trim().min(2, "City is required"),
    province: z.enum(provinceCodes, { message: "Pick a Canadian province or territory" }),
    postalCode: z.string().trim().toUpperCase().regex(/^[A-Z]\d[A-Z] ?\d[A-Z]\d$/, "Use a Canadian postal code, e.g. V6G 3J3"),
  }),
});

export type BookingInput = z.input<typeof bookingSchema>;

const bookingSchema = z.object({
  clients: z.tuple([clientSchema, clientSchema]),
  packageKey: z.string(),
  packageName: z.string().trim().min(2),
  event: z.object({
    date: isoDate,
    backupDate: isoDate,
    serviceDates: z.string().trim().default(""),
    location: z.string().trim().min(2, "Location is required"),
    province: z.enum(provinceCodes),
    ceremonyType: z.enum(["legal", "symbolic"]),
  }),
  lines: z.array(z.object({
    id: z.string(),
    kind: z.enum(["package", "addon", "discount"]),
    label: z.string().trim().min(1, "Every price line needs a label"),
    cents: z.number().int(),
  })).min(1),
  allocation: z.array(z.object({ key: z.string(), label: z.string().trim().min(1), bps: z.number().int().min(0).max(10000) })),
  taxes: z.array(z.object({ code: z.string(), label: z.string(), rateBps: z.number().int().min(0).max(2000), registration: z.string() })),
  fields: z.record(z.string(), z.string()),
  internalNotes: z.string().default(""),
  remindersPaused: z.boolean().default(false),
}).superRefine((b, ctx) => {
  if (b.clients[0].email === b.clients[1].email) ctx.addIssue({ code: "custom", message: "Each partner needs their own email address", path: ["clients"] });
  if (b.event.backupDate <= b.event.date) ctx.addIssue({ code: "custom", message: "The backup date must be after the elopement date", path: ["event", "backupDate"] });
  const sum = b.allocation.reduce((s, a) => s + a.bps, 0);
  if (b.allocation.length && sum !== 10000) ctx.addIssue({ code: "custom", message: `The allocation adds up to ${sum / 100}%, not 100%`, path: ["allocation"] });
  if (!b.lines.some((l) => l.kind === "package" && l.cents > 0)) ctx.addIssue({ code: "custom", message: "Enter the package price", path: ["lines"] });
});

export type SaveResult = { ok: true; ref: string } | { ok: false; error: string };

function firstError(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue ? `${issue.message}${issue.path.length ? ` (${issue.path.join(".")})` : ""}` : "Invalid booking";
}

export async function saveBookingAction(ref: string | null, raw: BookingInput): Promise<SaveResult> {
  const admin = await requireAdmin();
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const input = parsed.data;
  const now = new Date().toISOString();
  const meta = await requestMeta();
  const totals = computeTotals(input.lines, input.taxes);
  if (totals.subtotalCents <= 0) return { ok: false, error: "The subtotal must be above zero" };

  const clients = input.clients.map((c) => ({ ...c, id: randomId(8) })) as Booking["clients"];
  const event = { ...input.event, timezone: TIMEZONES[input.event.province] ?? "America/Vancouver" };

  if (!ref) {
    const preset = packageByKey(input.packageKey);
    for (let attempt = 0; attempt < 5; attempt++) {
      const newRef = await nextReference(input.event.date.slice(0, 4));
      const booking: Booking = {
        schema: 1,
        ref: newRef,
        createdAt: now,
        updatedAt: now,
        status: "draft",
        eventType: "elopement",
        clients,
        packageKey: input.packageKey,
        packageName: input.packageName,
        event,
        lines: input.lines,
        allocation: input.allocation,
        taxes: input.taxes,
        totals,
        schedule: [],
        fields: input.fields,
        planning: defaultPlanning(input.event.date, { film: preset.includesFilm, album: preset.includesAlbum }),
        payments: [],
        events: [{ at: now, type: "booking_created", actor: admin.email, ip: meta.ip, userAgent: meta.userAgent }],
        internalNotes: input.internalNotes,
        remindersPaused: input.remindersPaused,
      };
      booking.schedule = buildSchedule(booking, todayInBusinessTz());
      try {
        await createBooking(booking);
        revalidatePath("/admin");
        return { ok: true, ref: newRef };
      } catch (err) {
        if (!(err instanceof ConflictError)) throw err;
      }
    }
    return { ok: false, error: "Could not allocate a booking reference; try again." };
  }

  const existing = await getBooking(ref);
  if (!existing) return { ok: false, error: "Booking not found" };

  const priceChanged =
    JSON.stringify(existing.lines) !== JSON.stringify(input.lines) ||
    JSON.stringify(existing.taxes) !== JSON.stringify(input.taxes) ||
    existing.event.date !== input.event.date ||
    existing.event.backupDate !== input.event.backupDate;
  if (existing.status !== "draft" && priceChanged) {
    return { ok: false, error: "The agreement has already been sent. Price, tax and date changes need a signed amendment, not an edit." };
  }

  await updateBooking(ref, (b) => {
    // Keep stable client ids so signatures stay attached to the right person.
    b.clients = input.clients.map((c, i) => ({ ...c, id: b.clients[i]?.id ?? randomId(8) })) as Booking["clients"];
    b.packageKey = input.packageKey;
    b.packageName = input.packageName;
    b.event = event;
    b.lines = input.lines;
    b.allocation = input.allocation;
    b.taxes = input.taxes;
    b.totals = totals;
    b.fields = input.fields;
    b.internalNotes = input.internalNotes;
    b.remindersPaused = input.remindersPaused;
    if (b.status === "draft") b.schedule = buildSchedule(b, todayInBusinessTz(), b.schedule);
    b.events.push({ at: now, type: "booking_updated", actor: admin.email, ip: meta.ip, userAgent: meta.userAgent });
  });
  revalidatePath(`/admin/bookings/${ref}`);
  revalidatePath(`/portal/${ref}`);
  return { ok: true, ref };
}

export async function sendInviteAction(ref: string, email: string): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  const booking = await getBooking(ref);
  if (!booking) return { ok: false, error: "Booking not found" };
  try {
    await sendInvite(booking, email);
    await updateBooking(ref, (b) => {
      b.events.push({ at: new Date().toISOString(), type: "portal_invite_sent", actor: admin.email, detail: { to: email } });
    });
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Invite failed" };
  }
}

export async function setStatusAction(ref: string, status: "cancelled" | "draft"): Promise<void> {
  const admin = await requireAdmin();
  await updateBooking(ref, (b) => {
    b.events.push({ at: new Date().toISOString(), type: "status_changed", actor: admin.email, detail: { from: b.status, to: status } });
    b.status = status;
  });
  revalidatePath(`/admin/bookings/${ref}`);
  revalidatePath("/admin");
}

const insuranceSchema = z.object({
  insurer: z.string().trim().min(2),
  policyReference: z.string().trim().min(2),
  namedInsured: z.string().trim().min(2),
  effectiveDate: isoDate,
  expiryDate: isoDate,
  liabilityLimits: z.string().trim().min(2),
  recordingLossCoverage: z.string().trim().min(2),
  territories: z.string().trim().min(2),
});

export async function saveInsuranceAction(_prev: { ok: boolean; error?: string } | null, form: FormData) {
  await requireAdmin();
  const parsed = insuranceSchema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  if (parsed.data.expiryDate <= parsed.data.effectiveDate) return { ok: false, error: "Expiry must be after the effective date" };
  const settings = await getSettings();
  settings.insurance = { ...parsed.data, confirmedAt: new Date().toISOString() };
  await saveSettings(settings);
  revalidatePath("/admin/settings");
  revalidatePath("/admin");
  return { ok: true };
}
