"use server";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import { requireAdmin, requireBookingAccess } from "@/lib/portal/auth";
import { updateBooking } from "@/lib/portal/store";
import { WEDDING_TEMPLATES } from "@/lib/portal/wedding";
import {
  ALWAYS_VISIBLE_WORKFLOWS,
  assertClientPortalAccess,
} from "@/lib/portal/portal-controls";
import { expireWeddingCheckouts } from "@/lib/portal/stripe";
import { activeCheckouts, invoiceBalance } from "@/lib/portal/billing";
const schema = z
  .object({
    enabled: z.boolean(),
    welcomeMessage: z.string().trim().max(3000),
    hiddenWorkflows: z.array(z.string()).max(20),
    internalNotes: z.string().max(20000),
    planning: z
      .array(
        z.object({
          id: z.string().max(100),
          section: z.string().trim().max(100),
          titleEn: z.string().trim().min(2).max(200),
          titleFr: z.string().max(200),
          dueDate: z
            .string()
            .refine(
              (v) =>
                !v ||
                (/^\d{4}-\d{2}-\d{2}$/.test(v) &&
                  new Date(v + "T12:00:00Z").toISOString().slice(0, 10) === v),
            ),
          status: z.enum(["todo", "in_progress", "done", "not_applicable"]),
          clientVisible: z.boolean(),
          clientCanComplete: z.boolean().optional(),
          clientNote: z.string().max(2000).optional(),
          internalNote: z.string().max(2000).optional(),
          sortOrder: z.number().int().min(0).max(1000),
        }),
      )
      .max(60),
  })
  .strict();
type Result = { ok: true; message: string } | { ok: false; error: string };
const fail = (e: unknown): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : "Please try again.",
});
function refresh(ref: string) {
  revalidatePath("/admin", "layout");
  revalidatePath(`/portal/${ref}`, "layout");
}
export async function saveClientPortal(
  ref: string,
  raw: z.input<typeof schema>,
  expected: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    const v = schema.parse(raw);
    const allowed = WEDDING_TEMPLATES.filter(
      (t) =>
        t.audience === "client" && !ALWAYS_VISIBLE_WORKFLOWS.includes(t.key),
    ).map((t) => t.key);
    if (
      v.hiddenWorkflows.some((k) => !allowed.includes(k)) ||
      new Set(v.planning.map((p) => p.id)).size !== v.planning.length
    )
      throw Error("Use valid unique client workflows and tasks.");
    await updateBooking(ref, (b) => {
      if (b.updatedAt !== expected)
        throw Error(
          "This wedding changed while you were editing. Reload and compare before saving.",
        );
      if (b.archivedAt && v.enabled)
        throw Error("Restore the archived wedding before opening its portal.");
      if (!v.enabled && activeCheckouts(b).length)
        throw Error(
          "A checkout started while this portal was being closed. Retry after cancelling it.",
        );
      const at = new Date().toISOString();
      b.portal = {
        enabled: v.enabled,
        welcomeMessage: v.welcomeMessage,
        hiddenWorkflows: v.hiddenWorkflows,
        updatedAt: at,
        actor: admin.email,
      };
      b.internalNotes = v.internalNotes;
      b.planning = v.planning.map((p, i) => ({
        ...p,
        sortOrder: i,
        completedAt:
          p.status === "done"
            ? b.planning.find((x) => x.id === p.id)?.completedAt || at
            : undefined,
      }));
      b.events.push({
        at,
        type: "client_portal_updated",
        actor: admin.email,
        detail: { enabled: v.enabled, hiddenWorkflows: v.hiddenWorkflows },
      });
    });
    refresh(ref);
    return {
      ok: true,
      message:
        "Client dashboard saved. Changes are now visible to this couple.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function archiveWedding(
  ref: string,
  reason: string,
  restore = false,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (!restore && reason.trim().length < 5)
      throw Error("Enter a reason for archiving.");
    if (!restore) await expireWeddingCheckouts(ref);
    await updateBooking(ref, (b) => {
      if (!restore && activeCheckouts(b).length)
        throw Error("Cancel the open checkout before archiving.");
      const at = new Date().toISOString();
      if (restore) {
        delete b.archivedAt;
        delete b.archiveReason;
        if (b.portal) b.portal.enabled = true;
      } else {
        b.archivedAt = at;
        b.archiveReason = reason.trim();
        if (b.portal) b.portal.enabled = false;
        for (const i of b.invoices || [])
          if (i.status === "issued" && invoiceBalance(b, i) > 0)
            i.status = "void";
      }
      b.events.push({
        at,
        type: restore ? "wedding_restored" : "wedding_archived",
        actor: admin.email,
        detail: { reason: reason.trim() },
      });
    });
    refresh(ref);
    return {
      ok: true,
      message: restore
        ? "Wedding restored and client access reopened."
        : "Wedding archived. Client access is closed; records and receipts are retained.",
    };
  } catch (e) {
    return fail(e);
  }
}
export async function changeWeddingStage(
  ref: string,
  status: "in_planning" | "completed" | "cancelled",
  reason: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    if (
      !["in_planning", "completed", "cancelled"].includes(status) ||
      reason.trim().length < 5
    )
      throw Error("Choose a status and enter a reason.");
    if (status === "cancelled") await expireWeddingCheckouts(ref);
    await updateBooking(ref, (b) => {
      if (status === "cancelled" && activeCheckouts(b).length)
        throw Error("Cancel the open checkout first.");
      if (b.archivedAt) throw Error("Restore the wedding first.");
      if (
        status !== "cancelled" &&
        !b.wedding?.documents.some(
          (d) => d.templateKey === "agreement" && d.status === "executed",
        )
      )
        throw Error("Complete the agreement first.");
      if (
        status === "completed" &&
        b.schedule.some(
          (i) => i.status !== "void" && i.paidCents < i.totalCents,
        )
      )
        throw Error(
          "Settle the outstanding balance before completing this wedding.",
        );
      const at = new Date().toISOString();
      b.events.push({
        at,
        type: "wedding_stage_changed",
        actor: admin.email,
        detail: { from: b.status, to: status, reason: reason.trim() },
      });
      b.status = status;
      if (status === "cancelled")
        for (const i of b.invoices || [])
          if (i.status === "issued" && invoiceBalance(b, i) > 0)
            i.status = "void";
    });
    refresh(ref);
    return { ok: true, message: "Wedding status updated." };
  } catch (e) {
    return fail(e);
  }
}
export async function completeClientTask(
  ref: string,
  id: string,
  done: boolean,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    await updateBooking(ref, (b) => {
      assertClientPortalAccess(b, session);
      const p = b.planning.find(
        (p) => p.id === id && p.clientVisible && p.clientCanComplete,
      );
      if (!p || b.status === "cancelled")
        throw Error("This task is managed by the studio.");
      const at = new Date().toISOString();
      p.status = done ? "done" : "todo";
      p.completedAt = done ? at : undefined;
      b.events.push({
        at,
        type: "client_task_updated",
        actor: session.email,
        detail: { id, done },
      });
    });
    refresh(ref);
    return { ok: true, message: "Task updated." };
  } catch (e) {
    return fail(e);
  }
}
