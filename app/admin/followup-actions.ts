"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/portal/auth";
import {
  createFollowUp,
  updateFollowUp,
  deleteFollowUp,
} from "@/lib/portal/followups";
import type { FollowUpSubject } from "@/lib/portal/followup-types";

type Result = { ok: true; message: string } | { ok: false; error: string };
const fail = (e: unknown): Result => ({
  ok: false,
  error: e instanceof Error ? e.message : "Please try again.",
});

export async function addFollowUp(input: {
  subject: FollowUpSubject;
  title: string;
  due: string;
  notes?: string;
}): Promise<Result> {
  await requireAdmin();
  try {
    if (input.title.trim().length < 2) throw new Error("What is the follow-up?");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(input.due))
      throw new Error("Give it a date.");
    await createFollowUp(input);
    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return { ok: true, message: "Follow-up added." };
  } catch (e) {
    return fail(e);
  }
}

export async function setFollowUpDone(id: string, done: boolean): Promise<Result> {
  await requireAdmin();
  try {
    await updateFollowUp(id, (t) => {
      t.done = done;
    });
    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return { ok: true, message: done ? "Done." : "Reopened." };
  } catch (e) {
    return fail(e);
  }
}

/** Push a follow-up out by a number of days without retyping it. */
export async function snoozeFollowUp(id: string, days: number): Promise<Result> {
  await requireAdmin();
  try {
    await updateFollowUp(id, (t) => {
      const [y, m, d] = t.due.split("-").map(Number);
      t.due = new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
    });
    revalidatePath("/admin");
    return { ok: true, message: `Moved on ${days} days.` };
  } catch (e) {
    return fail(e);
  }
}

export async function removeFollowUp(id: string): Promise<Result> {
  await requireAdmin();
  try {
    await deleteFollowUp(id);
    revalidatePath("/admin");
    revalidatePath("/admin/inquiries");
    return { ok: true, message: "Removed." };
  } catch (e) {
    return fail(e);
  }
}
