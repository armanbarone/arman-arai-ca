import "server-only";
import { listJson, readJson, writeJson, remove } from "./store";
import { randomId } from "./token";

/* Every inquiry the website takes, kept.
 *
 * Until now a form submission was turned into an email and thrown away, so the
 * only record of a lead was Arman's inbox and the only way to count them was to
 * read it. Meta and Google will report a cost per lead; neither can ever report
 * a cost per booking, because neither knows which lead signed. That number only
 * exists if the lead and the outcome are written down in the same row.
 *
 * One blob per lead rather than one index file: two inquiries arriving in the
 * same second must not overwrite each other.
 */

export * from "./lead-types";
import type { Lead } from "./lead-types";

const leadPath = (id: string) => `leads/${id}.json`;

export async function listLeads(): Promise<Lead[]> {
  const rows = await listJson<Lead>("leads/");
  return rows
    .map((r) => r.data)
    .sort((a, b) => b.receivedAt.localeCompare(a.receivedAt));
}

export async function getLead(id: string): Promise<Lead | null> {
  const row = await readJson<Lead>(leadPath(id));
  return row?.data ?? null;
}

/**
 * Record an inquiry. Never throws: a tracker that can break the contact form
 * is worse than no tracker, so the caller fires this and moves on.
 */
export async function recordLead(
  input: Omit<Lead, "id" | "stage" | "consult" | "booked" | "createdAt" | "updatedAt">,
): Promise<Lead | null> {
  try {
    const now = new Date().toISOString();
    const lead: Lead = {
      ...input,
      id: randomId(9).replace(/[^A-Za-z0-9]/g, "").slice(0, 12) || randomId(8),
      stage: "new",
      consult: false,
      booked: false,
      createdAt: now,
      updatedAt: now,
    };
    await writeJson(leadPath(lead.id), lead, { createOnly: true });
    return lead;
  } catch {
    return null;
  }
}

export async function updateLead(
  id: string,
  fn: (lead: Lead) => void,
): Promise<Lead> {
  const row = await readJson<Lead>(leadPath(id));
  if (!row) throw new Error("That inquiry no longer exists.");
  const next = structuredClone(row.data);
  fn(next);
  // Booked and the stage are two views of one fact; keep them agreeing.
  if (next.stage === "booked") next.booked = true;
  if (next.booked && next.stage !== "booked" && next.stage !== "lost")
    next.stage = "booked";
  if (next.stage === "consult" || next.booked) next.consult = true;
  next.updatedAt = new Date().toISOString();
  await writeJson(leadPath(id), next, { etag: row.etag });
  return next;
}

export async function deleteLead(id: string): Promise<void> {
  await remove(leadPath(id));
}

/** Already recorded, by email and inquiry date. Keeps a backfill idempotent. */
export function isDuplicate(leads: Lead[], email: string, receivedAt: string) {
  const day = receivedAt.slice(0, 10);
  return leads.some(
    (l) =>
      l.email.toLowerCase() === email.toLowerCase() &&
      l.receivedAt.slice(0, 10) === day,
  );
}

export interface LeadTotals {
  leads: number;
  consults: number;
  booked: number;
  valueCents: number;
  /** Of the leads that reached a decision, the share that booked. */
  closeRate: number | null;
}

export function totalsFor(leads: Lead[]): LeadTotals {
  const booked = leads.filter((l) => l.booked);
  const decided = leads.filter((l) => l.booked || l.stage === "lost");
  return {
    leads: leads.length,
    consults: leads.filter((l) => l.consult).length,
    booked: booked.length,
    valueCents: booked.reduce((s, l) => s + (l.valueCents ?? 0), 0),
    closeRate: decided.length ? booked.length / decided.length : null,
  };
}

/** Grouped by source, which is the whole point: cost per booking by channel. */
export function bySource(leads: Lead[]): { source: string; totals: LeadTotals }[] {
  const groups = new Map<string, Lead[]>();
  for (const l of leads) {
    const key = l.source || "Unknown";
    groups.set(key, [...(groups.get(key) ?? []), l]);
  }
  return [...groups.entries()]
    .map(([source, rows]) => ({ source, totals: totalsFor(rows) }))
    .sort((a, b) => b.totals.leads - a.totals.leads);
}
