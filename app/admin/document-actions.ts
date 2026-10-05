"use server";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/portal/auth";
import { updateBooking } from "@/lib/portal/store";
import { changeDraftRemoval } from "@/lib/portal/document-lifecycle";

async function changeRemoval(
  ref: string,
  id: string,
  expectedUpdatedAt: string,
  restore: boolean,
) {
  const admin = await requireAdmin();
  try {
    await updateBooking(ref, (booking) => {
      if (!expectedUpdatedAt || booking.updatedAt !== expectedUpdatedAt)
        throw Error(
          "This wedding changed. Reload and review the latest version before continuing.",
        );
      changeDraftRemoval(booking, id, admin.email, restore);
    });
    revalidatePath("/admin", "layout");
    revalidatePath(`/portal/${ref}`, "layout");
    return {
      ok: true as const,
      message: restore
        ? "Draft restored. Review it before publishing."
        : "Draft deleted. You can restore it from Deleted drafts.",
    };
  } catch (error) {
    return {
      ok: false as const,
      error: error instanceof Error ? error.message : "Please try again.",
    };
  }
}
export async function deleteWeddingDraft(
  ref: string,
  id: string,
  expectedUpdatedAt: string,
) {
  return changeRemoval(ref, id, expectedUpdatedAt, false);
}
export async function restoreWeddingDraft(
  ref: string,
  id: string,
  expectedUpdatedAt: string,
) {
  return changeRemoval(ref, id, expectedUpdatedAt, true);
}
