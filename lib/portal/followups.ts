import "server-only";
import { listJson, readJson, writeJson, remove } from "./store";
import { randomId } from "./token";
import type { FollowUp, FollowUpSubject } from "./followup-types";

export type { FollowUp, FollowUpSubject } from "./followup-types";

/* Follow-ups: the thing that turns a list of names into a CRM.
 *
 * Two inquiries went cold this autumn because nothing anywhere said "chase
 * Amina on Friday". The client planning checklist is the couple's list of what
 * the wedding needs; this is Arman's list of what he owes people, and it hangs
 * off a lead or a booking rather than living in his head.
 */

const path = (id: string) => `followups/${id}.json`;

export async function listFollowUps(): Promise<FollowUp[]> {
  const rows = await listJson<FollowUp>("followups/");
  return rows
    .map((r) => r.data)
    .sort((a, b) => (a.done === b.done ? a.due.localeCompare(b.due) : a.done ? 1 : -1));
}

export async function createFollowUp(input: {
  subject: FollowUpSubject;
  title: string;
  due: string;
  notes?: string;
}): Promise<FollowUp> {
  const now = new Date().toISOString();
  const task: FollowUp = {
    id: randomId(9).replace(/[^A-Za-z0-9]/g, "").slice(0, 12) || randomId(8),
    subject: input.subject,
    title: input.title.trim().slice(0, 200),
    due: input.due,
    done: false,
    notes: input.notes?.trim().slice(0, 2000),
    createdAt: now,
    updatedAt: now,
  };
  await writeJson(path(task.id), task, { createOnly: true });
  return task;
}

export async function updateFollowUp(
  id: string,
  fn: (t: FollowUp) => void,
): Promise<FollowUp> {
  const row = await readJson<FollowUp>(path(id));
  if (!row) throw new Error("That follow-up no longer exists.");
  const next = structuredClone(row.data);
  fn(next);
  if (next.done && !next.doneAt) next.doneAt = new Date().toISOString();
  if (!next.done) delete next.doneAt;
  next.updatedAt = new Date().toISOString();
  await writeJson(path(id), next, { etag: row.etag });
  return next;
}

export async function deleteFollowUp(id: string): Promise<void> {
  await remove(path(id));
}

/** Open, overdue first, then by date. What the dashboard leads with. */
export function due(tasks: FollowUp[], today: string) {
  const open = tasks.filter((t) => !t.done);
  return {
    overdue: open.filter((t) => t.due < today),
    today: open.filter((t) => t.due === today),
    soon: open.filter((t) => t.due > today),
  };
}
