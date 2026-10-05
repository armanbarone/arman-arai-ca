"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin, requestMeta, sendInvite } from "@/lib/portal/auth";
import {
  buildSchedule,
  computeTotals,
  todayInBusinessTz,
} from "@/lib/portal/money";
import { defaultPlanning } from "@/lib/portal/planning";
import { PROVINCES, TIMEZONES, packageByKey } from "@/lib/portal/presets";
import {
  ConflictError,
  createBooking,
  getBooking,
  nextReference,
  updateBooking,
} from "@/lib/portal/store";
import type { Booking } from "@/lib/portal/types";
import {
  clientIdentity,
  ensureWedding,
  templateFor,
  seedFields,
  defaultDocumentFields,
  resolveBlocks,
  type WeddingAmendment,
} from "@/lib/portal/wedding";
import { amendmentBase, revisedSchedule } from "@/lib/portal/amendments";
import { randomId, sha256Hex } from "@/lib/portal/token";
import { initialContractDetails } from "@/lib/portal/contract-details";

const provinceCodes = PROVINCES.map((p) => p.code) as [string, ...string[]];
const validDate = (value: string) =>
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  Number.isFinite(Date.parse(`${value}T12:00:00Z`)) &&
  new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
const isoDate = z.string().refine(validDate, "Use a valid full date");

const clientSchema = z.object({
  legalName: z.string().trim().min(3, "Full legal name is required"),
  preferredName: z.string().trim().default(""),
  email: z.string().trim().toLowerCase().email("A valid email is required"),
  phone: z.string().trim().min(7, "Phone is required"),
  address: z.object({
    line1: z.string().trim().min(3, "Street address is required"),
    line2: z.string().trim().optional().default(""),
    city: z.string().trim().min(2, "City is required"),
    province: z.enum(provinceCodes, {
      message: "Pick a Canadian province or territory",
    }),
    postalCode: z
      .string()
      .trim()
      .toUpperCase()
      .regex(
        /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/,
        "Use a Canadian postal code, e.g. V6G 3J3",
      ),
  }),
});

export type BookingInput = z.input<typeof bookingSchema>;

const bookingSchema = z
  .object({
    clients: z.tuple([clientSchema, clientSchema]),
    packageKey: z.string(),
    packageName: z.string().trim().min(2),
    event: z.object({
      date: isoDate,
      backupDate: z
        .string()
        .refine(
          (value) => !value || validDate(value),
          "Use a valid alternate date",
        ),
      serviceDates: z.string().trim().default(""),
      location: z.string().trim().min(2, "Location is required"),
      province: z.enum(provinceCodes),
      ceremonyType: z.enum(["legal", "symbolic"]),
    }),
    lines: z
      .array(
        z.object({
          id: z.string(),
          kind: z.enum(["package", "addon", "discount"]),
          label: z.string().trim().min(1, "Every price line needs a label"),
          cents: z.number().int(),
        }),
      )
      .min(1),
    allocation: z.array(
      z.object({
        key: z.string(),
        label: z.string().trim().min(1),
        bps: z.number().int().min(0).max(10000),
      }),
    ),
    taxes: z.array(
      z.object({
        code: z.string(),
        label: z.string(),
        rateBps: z.number().int().min(0).max(2000),
        registration: z.string(),
      }),
    ),
    fields: z.record(z.string(), z.string()),
    internalNotes: z.string().default(""),
    remindersPaused: z.boolean().default(false),
  })
  .superRefine((b, ctx) => {
    if (b.clients[0].email === b.clients[1].email)
      ctx.addIssue({
        code: "custom",
        message: "Each partner needs their own email address",
        path: ["clients"],
      });
    if (b.event.backupDate && b.event.backupDate <= b.event.date)
      ctx.addIssue({
        code: "custom",
        message: "The optional alternate date must be after the wedding date",
        path: ["event", "backupDate"],
      });
    const sum = b.allocation.reduce((s, a) => s + a.bps, 0);
    if (b.allocation.length && sum !== 10000)
      ctx.addIssue({
        code: "custom",
        message: `The allocation adds up to ${sum / 100}%, not 100%`,
        path: ["allocation"],
      });
    if (!b.lines.some((l) => l.kind === "package" && l.cents > 0))
      ctx.addIssue({
        code: "custom",
        message: "Enter the package price",
        path: ["lines"],
      });
  });

export type SaveResult =
  | { ok: true; ref: string }
  | { ok: false; error: string };

function firstError(err: z.ZodError): string {
  const issue = err.issues[0];
  return issue
    ? `${issue.message}${issue.path.length ? ` (${issue.path.join(".")})` : ""}`
    : "Invalid booking";
}

export async function saveBookingAction(
  ref: string | null,
  raw: BookingInput,
): Promise<SaveResult> {
  const admin = await requireAdmin();
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  const input = parsed.data;
  const now = new Date().toISOString();
  const meta = await requestMeta();
  const totals = computeTotals(input.lines, input.taxes);
  if (totals.subtotalCents <= 0)
    return { ok: false, error: "The subtotal must be above zero" };

  const clients = input.clients.map((c) => ({
    ...c,
    id: randomId(8),
  })) as Booking["clients"];
  const event = {
    ...input.event,
    timezone: TIMEZONES[input.event.province] ?? "America/Vancouver",
  };

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
        eventType: "wedding",
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
        planning: defaultPlanning(input.event.date, {
          film: preset.includesFilm,
          album: preset.includesAlbum,
        }),
        payments: [],
        events: [
          {
            at: now,
            type: "booking_created",
            actor: admin.email,
            ip: meta.ip,
            userAgent: meta.userAgent,
          },
        ],
        internalNotes: input.internalNotes,
        remindersPaused: input.remindersPaused,
      };
      booking.schedule = buildSchedule(booking, todayInBusinessTz());
      ensureWedding(booking).intake = {
        values: initialContractDetails(booking),
        status: "draft",
        updatedAt: now,
        actor: admin.email,
      };
      try {
        await createBooking(booking);
        revalidatePath("/admin");
        return { ok: true, ref: newRef };
      } catch (err) {
        if (!(err instanceof ConflictError)) throw err;
      }
    }
    return {
      ok: false,
      error: "Could not allocate a booking reference; try again.",
    };
  }

  const existing = await getBooking(ref);
  if (!existing) return { ok: false, error: "Booking not found" };

  const priceChanged =
    JSON.stringify(existing.lines) !== JSON.stringify(input.lines) ||
    JSON.stringify(existing.taxes) !== JSON.stringify(input.taxes) ||
    existing.event.date !== input.event.date ||
    existing.event.backupDate !== input.event.backupDate ||
    JSON.stringify(existing.clients.map(clientIdentity)) !==
      JSON.stringify(input.clients.map(clientIdentity)) ||
    JSON.stringify(existing.fields) !== JSON.stringify(input.fields) ||
    existing.packageKey !== input.packageKey ||
    existing.packageName !== input.packageName ||
    JSON.stringify({ ...existing.event, timezone: undefined }) !==
      JSON.stringify(input.event);
  if (existing.status !== "draft" && priceChanged) {
    return {
      ok: false,
      error:
        "The agreement has already been sent. Price, tax and date changes need a signed amendment, not an edit.",
    };
  }

  try {
    await updateBooking(ref, async (b) => {
      const before = structuredClone(b);
      const materialChanged =
        JSON.stringify({
          clients: b.clients.map(clientIdentity),
          event: { ...b.event, timezone: undefined },
          lines: b.lines,
          taxes: b.taxes,
          fields: b.fields,
          allocation: b.allocation,
          packageKey: b.packageKey,
          packageName: b.packageName,
        }) !==
        JSON.stringify({
          clients: input.clients.map(clientIdentity),
          event: input.event,
          lines: input.lines,
          taxes: input.taxes,
          fields: input.fields,
          allocation: input.allocation,
          packageKey: input.packageKey,
          packageName: input.packageName,
        });
      if (
        materialChanged &&
        (b.status !== "draft" ||
          b.wedding?.documents.some(
            (d) =>
              d.templateKey === "agreement" &&
              !["draft", "withdrawn"].includes(d.status),
          ))
      )
        throw new Error(
          "Issued agreement details are locked. Use a signed change order.",
        );
      // Keep stable client ids so signatures stay attached to the right person.
      b.clients = input.clients.map((c, i) => ({
        ...c,
        id: b.clients[i]?.id ?? randomId(8),
      })) as Booking["clients"];
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
      if (b.status === "draft")
        b.schedule = buildSchedule(b, todayInBusinessTz(), b.schedule);
      if (materialChanged)
        for (const d of b.wedding?.documents || [])
          if (
            d.status === "draft" &&
            ["proposal", "agreement"].includes(d.templateKey)
          ) {
            const t = templateFor(d.templateKey, b),
              oldDefaults = defaultDocumentFields(
                templateFor(d.templateKey, before),
                before,
              ),
              newDefaults = defaultDocumentFields(t, b);
            for (const [id, value] of Object.entries(newDefaults))
              if (oldDefaults[id] !== value) d.fields[id] = value;
            d.blocks = resolveBlocks(t, d.fields);
            d.draftRevision = await sha256Hex(
              JSON.stringify({ blocks: d.blocks, dueDate: d.dueDate || "" }),
            );
          }
      b.events.push({
        at: now,
        type: "booking_updated",
        actor: admin.email,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
    });
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Could not save booking",
    };
  }
  revalidatePath(`/admin/bookings/${ref}`);
  revalidatePath(`/portal/${ref}`);
  return { ok: true, ref };
}

export async function sendInviteAction(
  ref: string,
  email: string,
): Promise<{ ok: boolean; error?: string }> {
  const admin = await requireAdmin();
  const booking = await getBooking(ref);
  if (!booking) return { ok: false, error: "Booking not found" };
  try {
    await sendInvite(booking, email);
    await updateBooking(ref, (b) => {
      b.events.push({
        at: new Date().toISOString(),
        type: "portal_invite_sent",
        actor: admin.email,
        detail: { to: email },
      });
    });
    return { ok: true };
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Invite failed",
    };
  }
}

export async function setStatusAction(
  ref: string,
  status: "cancelled" | "draft",
): Promise<void> {
  const admin = await requireAdmin();
  await updateBooking(ref, (b) => {
    if (
      status === "draft" &&
      b.wedding?.documents.some(
        (d) =>
          d.signatures.some((s) => s.party === "client") ||
          ["issued", "partial", "executed"].includes(d.status),
      )
    )
      throw new Error("Issued or signed records cannot be reset to a draft");
    b.events.push({
      at: new Date().toISOString(),
      type: "status_changed",
      actor: admin.email,
      detail: { from: b.status, to: status },
    });
    b.status = status;
  });
  revalidatePath(`/admin/bookings/${ref}`);
  revalidatePath("/admin");
}

export async function saveBookingAmendmentAction(
  ref: string,
  raw: BookingInput,
  reason: string,
  dueDate: string,
): Promise<SaveResult> {
  const admin = await requireAdmin();
  const parsed = bookingSchema.safeParse(raw);
  if (!parsed.success) return { ok: false, error: firstError(parsed.error) };
  if (reason.trim().length < 10 || !validDate(dueDate))
    return {
      ok: false,
      error:
        "Describe the exact revision and choose the revised balance due date.",
    };
  try {
    const input = parsed.data,
      totals = computeTotals(input.lines, input.taxes);
    if (totals.subtotalCents <= 0)
      throw new Error("Enter a positive revised price");
    await updateBooking(ref, async (b) => {
      const w = ensureWedding(b);
      if (
        !w.documents.some(
          (d) => d.templateKey === "agreement" && d.status === "executed",
        ) ||
        b.status === "cancelled"
      )
        throw new Error(
          "A completed active agreement is required for a change order",
        );
      if (
        JSON.stringify(b.clients.map(clientIdentity)) !==
        JSON.stringify(input.clients.map(clientIdentity))
      )
        throw new Error(
          "Client identities remain fixed. This revision changes event, scope and payment terms.",
        );
      if (
        input.event.province === "QC" ||
        b.clients.some((c) => c.address.province === "QC")
      )
        throw new Error(
          "The source pack contains only English documents. Add the reviewed French pack and language process before preparing a Quebec change order.",
        );
      const a: WeddingAmendment = {
        baseHash: await sha256Hex(amendmentBase(b)),
        reason: reason.trim(),
        plan: {
          packageKey: input.packageKey,
          packageName: input.packageName,
          event: {
            ...input.event,
            timezone: TIMEZONES[input.event.province] || "America/Vancouver",
          },
          lines: input.lines,
          allocation: input.allocation,
          taxes: input.taxes,
          totals,
          fields: input.fields,
          schedule: revisedSchedule(
            b,
            totals,
            dueDate,
            `change-${randomId(8)}`,
          ),
        },
      };
      let d = w.documents.find(
        (d) => d.templateKey === "change" && d.status === "draft",
      );
      const t = templateFor("change", b, a);
      if (!d) {
        d = {
          id: `change-${randomId(8)}`,
          templateKey: "change",
          title: t.title,
          version:
            w.documents.filter((d) => d.templateKey === "change").length + 1,
          status: "draft",
          createdAt: new Date().toISOString(),
          fields: {},
          blocks: [],
          requiredEmails: [],
          signatures: [],
        };
        w.documents.push(d);
      }
      d.amendment = a;
      d.fields = { ...seedFields(t, b), ...d.fields };
      d.blocks = resolveBlocks(t, d.fields);
      d.draftRevision = await sha256Hex(
        JSON.stringify({ blocks: d.blocks, dueDate: d.dueDate || "" }),
      );
      b.events.push({
        at: new Date().toISOString(),
        type: "change_order_prepared",
        actor: admin.email,
        detail: { id: d.id },
      });
    });
    revalidatePath(`/admin/bookings/${ref}`, "layout");
    return { ok: true, ref };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not prepare the revision",
    };
  }
}
