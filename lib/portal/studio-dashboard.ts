import "server-only";
import { listBookings } from "./store";
import { listLeads } from "./leads";
import { listFollowUps } from "./followups";
import { weddingData } from "./wedding";
import { todayInBusinessTz } from "./money";
import type { Booking } from "./types";
import type { Lead } from "./lead-types";
import type { FollowUp } from "./followup-types";

/* One read of everything, turned into the two questions a studio owner opens
 * the morning with: what needs me today, and what is the year doing.
 *
 * It is assembled here rather than in the page so the dashboard and the
 * calendar cannot disagree about what counts as booked.
 */

export type ActionKind =
  | "followup"
  | "signature"
  | "payment"
  | "inquiry"
  | "intake"
  | "delivery";

export interface StudioAction {
  kind: ActionKind;
  urgency: "overdue" | "now" | "soon";
  title: string;
  detail: string;
  href: string;
  /** For completing a follow-up straight from the list. */
  followUpId?: string;
  due?: string;
}

export interface CalendarEntry {
  date: string;
  kind: "wedding" | "backup" | "commitment";
  label: string;
  ref?: string;
  href?: string;
}

/** A booking holds its date once it is past draft. Shared with availability. */
const HOLDS = [
  "contract_sent",
  "partially_signed",
  "signed",
  "booked",
  "in_planning",
  "completed",
];

export interface StudioDashboard {
  today: string;
  actions: StudioAction[];
  calendar: CalendarEntry[];
  money: {
    bookedValueCents: number;
    outstandingCents: number;
    overdueCents: number;
    nextDue?: { ref: string; label: string; date: string; cents: number };
  };
  pipeline: { leads: number; consults: number; booked: number; closeRate: number | null };
  counts: { weddings: number; openFollowUps: number; newInquiries: number };
  bookings: Booking[];
  leads: Lead[];
  followUps: FollowUp[];
}

export async function studioDashboard(): Promise<StudioDashboard> {
  const [bookings, leads, followUps] = await Promise.all([
    listBookings(),
    listLeads(),
    listFollowUps(),
  ]);
  const today = todayInBusinessTz();
  const actions: StudioAction[] = [];
  const calendar: CalendarEntry[] = [];

  // ------------------------------------------------------------- follow-ups
  for (const t of followUps.filter((t) => !t.done)) {
    if (t.due > today) continue;
    actions.push({
      kind: "followup",
      urgency: t.due < today ? "overdue" : "now",
      title: t.title,
      detail: `${t.subject.label}${t.due < today ? ` · due ${t.due}` : " · due today"}`,
      href: t.subject.kind === "booking" ? `/admin/bookings/${t.subject.id}` : "/admin/inquiries",
      followUpId: t.id,
      due: t.due,
    });
  }

  // --------------------------------------------------------------- weddings
  let outstanding = 0;
  let overdue = 0;
  let bookedValue = 0;
  let nextDue: StudioDashboard["money"]["nextDue"];

  for (const b of bookings) {
    if (b.archivedAt || b.status === "cancelled") continue;
    const w = weddingData(b);
    const holds = HOLDS.includes(b.status);

    if (holds && b.event?.date) {
      bookedValue += b.totals.totalCents;
      calendar.push({
        date: b.event.date,
        kind: "wedding",
        label: b.clients.map((c) => c.preferredName || c.legalName.split(" ")[0]).join(" & "),
        ref: b.ref,
        href: `/admin/bookings/${b.ref}`,
      });
      if (b.event.backupDate)
        calendar.push({
          date: b.event.backupDate,
          kind: "backup",
          label: `Backup · ${b.clients.map((c) => c.preferredName || c.legalName.split(" ")[0]).join(" & ")}`,
          ref: b.ref,
          href: `/admin/bookings/${b.ref}`,
        });
    }

    // Signatures outstanding on something already sent.
    for (const d of w.documents) {
      if (!["issued", "partial"].includes(d.status) || !d.requiredEmails.length) continue;
      const waiting = d.requiredEmails.filter(
        (e) => !d.signatures.some((s) => s.party === "client" && s.email === e),
      );
      if (!waiting.length) continue;
      actions.push({
        kind: "signature",
        urgency: "soon",
        title: `${d.title} unsigned`,
        detail: `${b.ref} · waiting on ${waiting.length === d.requiredEmails.length ? "both" : "one"} of them`,
        href: `/admin/bookings/${b.ref}/documents`,
      });
    }

    if (w.intake?.status === "submitted")
      actions.push({
        kind: "intake",
        urgency: "now",
        title: "Contract details to review",
        detail: `${b.ref} · ${b.clients.map((c) => c.preferredName || c.legalName).join(" and ")}`,
        href: `/admin/bookings/${b.ref}`,
      });

    for (const i of b.schedule) {
      // A draft booking's schedule is a proposal, not money anybody owes, so
      // it must not land in "outstanding" beside real contracts.
      if (!holds) break;
      const left = i.totalCents - i.paidCents;
      if (left <= 0 || i.status === "void") continue;
      outstanding += left;
      if (i.dueDate && i.dueDate < today) {
        overdue += left;
        actions.push({
          kind: "payment",
          urgency: "overdue",
          title: `${i.label} overdue`,
          detail: `${b.ref} · due ${i.dueDate}`,
          href: `/admin/bookings/${b.ref}/payments`,
          due: i.dueDate,
        });
      } else if (i.dueDate && (!nextDue || i.dueDate < nextDue.date)) {
        nextDue = { ref: b.ref, label: i.label, date: i.dueDate, cents: left };
      }
      if (i.clientReportedSentAt && left > 0)
        actions.push({
          kind: "payment",
          urgency: "now",
          title: "Interac reported, not confirmed",
          detail: `${b.ref} · ${i.label}. Check the bank and record it.`,
          href: `/admin/bookings/${b.ref}/payments`,
        });
    }
  }

  // ---------------------------------------------------------------- inquiries
  for (const l of leads) {
    if (l.stage !== "new") continue;
    actions.push({
      kind: "inquiry",
      urgency: "now",
      title: `New inquiry from ${l.name}`,
      detail: `${l.source}${l.weddingDate ? ` · ${l.weddingDate}` : ""}`,
      href: "/admin/inquiries",
    });
  }

  const booked = leads.filter((l) => l.booked);
  const decided = leads.filter((l) => l.booked || l.stage === "lost");

  const order = { overdue: 0, now: 1, soon: 2 };
  actions.sort((a, b2) => order[a.urgency] - order[b2.urgency]);
  calendar.sort((a, b2) => a.date.localeCompare(b2.date));

  return {
    today,
    actions,
    calendar,
    money: {
      bookedValueCents: bookedValue,
      outstandingCents: outstanding,
      overdueCents: overdue,
      nextDue,
    },
    pipeline: {
      leads: leads.length,
      consults: leads.filter((l) => l.consult).length,
      booked: booked.length,
      closeRate: decided.length ? booked.length / decided.length : null,
    },
    counts: {
      // Weddings means weddings he actually has, which is the same test the
      // booked value and the diary use.
      weddings: bookings.filter(
        (b) => !b.archivedAt && b.status !== "cancelled" && HOLDS.includes(b.status),
      ).length,
      openFollowUps: followUps.filter((t) => !t.done).length,
      newInquiries: leads.filter((l) => l.stage === "new").length,
    },
    bookings,
    leads,
    followUps,
  };
}
