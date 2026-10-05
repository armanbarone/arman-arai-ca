"use server";
import { revalidatePath } from "next/cache";
import { requireBookingAccess, requireAdmin } from "@/lib/portal/auth";
import { updateBooking } from "@/lib/portal/store";
import {
  ensureWedding,
  templateFor,
  resolveBlocks,
  defaultDocumentFields,
} from "@/lib/portal/wedding";
import {
  contractDetailsSchema,
  missingContractDetails,
  contractIsLocked,
  applyContractDetails,
  collectionFor,
  collectionBookingFields,
  type ContractDetails,
} from "@/lib/portal/contract-details";
import { defaultTaxesFor, TIMEZONES } from "@/lib/portal/presets";
import {
  buildSchedule,
  computeTotals,
  todayInBusinessTz,
} from "@/lib/portal/money";
import { randomId, sha256Hex } from "@/lib/portal/token";

type Result =
  | { ok: true; updatedAt?: string; message: string }
  | { ok: false; error: string };
const failure = (e: unknown): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : "Please try again.",
});
const refresh = (ref: string) => {
  revalidatePath(`/portal/${ref}`, "layout");
  revalidatePath(`/admin/bookings/${ref}`, "layout");
  revalidatePath("/admin");
};
export async function saveWeddingContractDetails(
  ref: string,
  raw: ContractDetails,
  submit: boolean,
  expectedUpdatedAt: string | null,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    const v = contractDetailsSchema.parse(raw);
    if (submit && missingContractDetails(v).length)
      throw new Error(
        `Complete ${missingContractDetails(v).join(", ")}. Use Not applicable for a location you will not use.`,
      );
    let updatedAt = "";
    await updateBooking(ref, (b) => {
      if (
        session.role !== "admin" &&
        !b.clients.some((c) => c.email === session.email)
      )
        throw new Error("Booking access changed. Sign in again.");
      if (contractIsLocked(b))
        throw new Error(
          "The signed agreement is fixed. Request a change order for contract changes.",
        );
      const w = ensureWedding(b),
        current = w.intake;
      if ((current?.updatedAt || null) !== expectedUpdatedAt)
        throw new Error(
          "Your partner or the studio saved newer details. Your entries remain on screen; reload and compare before saving.",
        );
      updatedAt = new Date(
        Math.max(Date.now(), Date.parse(current?.updatedAt || "") + 1 || 0),
      ).toISOString();
      if (
        current?.status === "approved" &&
        JSON.stringify(current.values) === JSON.stringify(v)
      ) {
        updatedAt = current.updatedAt;
        return;
      }
      w.intake = {
        values: v,
        status: submit ? "submitted" : "draft",
        updatedAt,
        actor: session.email,
      };
      b.events.push({
        at: updatedAt,
        type: submit ? "contract_details_submitted" : "contract_details_saved",
        actor: session.email,
      });
    });
    refresh(ref);
    return {
      ok: true,
      updatedAt,
      message: submit
        ? "Details sent to Arman. He will confirm your locations, collection and exact quote before you initial and sign."
        : "Wedding details saved. You and your partner can finish them together.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function approveWeddingContractDetails(
  ref: string,
  revision: string,
): Promise<Result> {
  const admin = await requireAdmin();
  try {
    await updateBooking(ref, async (b) => {
      if (contractIsLocked(b))
        throw new Error(
          "Use a signed change order after the agreement has a client signature or a payment is recorded.",
        );
      const w = ensureWedding(b),
        intake = w.intake;
      if (
        !intake ||
        intake.updatedAt !== revision ||
        intake.status !== "submitted"
      )
        throw new Error(
          "Review the current submitted details before approving them.",
        );
      const v = contractDetailsSchema.parse(intake.values);
      if (missingContractDetails(v).length)
        throw new Error(
          "Complete the couple's event details and addresses first.",
        );
      const at = new Date().toISOString(),
        changedCollection = v.collectionKey !== b.packageKey,
        changedProvince = v.province !== b.event.province;
      applyContractDetails(b, v);
      b.event.timezone = TIMEZONES[v.province];
      const tier = collectionFor(v.collectionKey);
      if (changedCollection && tier) {
        b.packageKey = tier.slug;
        b.packageName = tier.name;
        const line = b.lines.find((l) => l.kind === "package");
        if (line) {
          line.label = `${tier.name} — ${tier.coverage}`;
          line.cents = tier.price * 100;
        } else
          b.lines.unshift({
            id: randomId(8),
            kind: "package",
            label: tier.name,
            cents: tier.price * 100,
          });
        Object.assign(b.fields, collectionBookingFields(tier, v.date));
      }
      if (changedProvince) b.taxes = defaultTaxesFor(v.province);
      b.totals = computeTotals(b.lines, b.taxes);
      b.schedule = buildSchedule(b, todayInBusinessTz());
      b.status = "draft";
      w.intake = {
        ...intake,
        status: "approved",
        approvedAt: at,
        approvedBy: admin.email,
      };
      for (const d of w.documents)
        if (
          ["proposal", "agreement"].includes(d.templateKey) &&
          ["issued", "partial"].includes(d.status) &&
          !d.signatures.some((s) => s.party === "client")
        )
          d.status = "withdrawn";
      for (const key of ["proposal", "agreement"]) {
        const previous = [...w.documents]
            .reverse()
            .find((d) => d.templateKey === key),
          t = templateFor(key, b);
        const fields = { ...previous?.fields, ...defaultDocumentFields(t, b) },
          blocks = resolveBlocks(t, fields);
        let d = w.documents.find(
          (d) => d.templateKey === key && d.status === "draft",
        );
        if (!d) {
          d = {
            id: `${key}-${randomId(8)}`,
            templateKey: key,
            title: t.title,
            version:
              w.documents.filter((d) => d.templateKey === key).length + 1,
            status: "draft",
            createdAt: at,
            fields,
            blocks,
            requiredEmails: [],
            signatures: [],
          };
          w.documents.push(d);
        }
        d.fields = fields;
        d.blocks = blocks;
        d.draftRevision = await sha256Hex(
          JSON.stringify({ blocks, dueDate: d.dueDate || "" }),
        );
      }
      b.events.push({
        at,
        type: "contract_details_approved",
        actor: admin.email,
        detail: { intakeRevision: revision, collection: b.packageKey },
      });
    });
    refresh(ref);
    return {
      ok: true,
      message:
        "Details approved. Review or customize the collection in Booking details, then prepare the proposal and agreement drafts. Previously signed records stay unchanged.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function saveWeddingCreativeDirection(
  ref: string,
  raw: {
    direction: string;
    palette: string;
    priorities: string;
    avoid: string;
  },
  expectedUpdatedAt: string | null,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    const keys = ["direction", "palette", "priorities", "avoid"];
    if (
      !raw ||
      Object.keys(raw).some((k) => !keys.includes(k)) ||
      keys.some(
        (k) =>
          typeof raw[k as keyof typeof raw] !== "string" ||
          raw[k as keyof typeof raw].length > 5000,
      )
    )
      throw new Error("Enter valid creative notes.");
    let updatedAt = "";
    await updateBooking(ref, (b) => {
      const w = ensureWedding(b);
      if (
        session.role !== "admin" &&
        !b.clients.some((c) => c.email === session.email)
      )
        throw new Error("Booking access changed. Sign in again.");
      if (b.status === "cancelled")
        throw new Error(
          "Contact the studio before changing a cancelled booking.",
        );
      if ((w.creative?.updatedAt || null) !== expectedUpdatedAt)
        throw new Error(
          "Your partner or the studio saved newer notes. Reload and compare before saving.",
        );
      updatedAt = new Date(
        Math.max(Date.now(), Date.parse(w.creative?.updatedAt || "") + 1 || 0),
      ).toISOString();
      w.creative = {
        direction: raw.direction.trim(),
        palette: raw.palette.trim(),
        priorities: raw.priorities.trim(),
        avoid: raw.avoid.trim(),
        updatedAt,
        actor: session.email,
      };
      b.events.push({
        at: updatedAt,
        type: "creative_direction_saved",
        actor: session.email,
      });
    });
    refresh(ref);
    return {
      ok: true,
      updatedAt,
      message: "Creative direction saved for you, your partner and Arman.",
    };
  } catch (e) {
    return failure(e);
  }
}
export async function removeWeddingImage(
  ref: string,
  id: string,
): Promise<Result> {
  const { session } = await requireBookingAccess(ref);
  try {
    await updateBooking(ref, (b) => {
      if (
        session.role !== "admin" &&
        !b.clients.some((c) => c.email === session.email)
      )
        throw new Error("Booking access changed. Sign in again.");
      const image = b.wedding?.media?.find((m) => m.id === id && !m.removedAt);
      if (!image) throw new Error("Image not found.");
      image.removedAt = new Date().toISOString();
      b.events.push({
        at: image.removedAt,
        type: "wedding_image_removed_from_board",
        actor: session.email,
        detail: { id },
      });
    });
    refresh(ref);
    return { ok: true, message: "Image removed from your board." };
  } catch (e) {
    return failure(e);
  }
}
