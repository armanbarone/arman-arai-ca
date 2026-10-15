"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  addFollowUp,
  setFollowUpDone,
  snoozeFollowUp,
  removeFollowUp,
} from "@/app/admin/followup-actions";
import { QUICK_FOLLOW_UPS, type FollowUpSubject } from "@/lib/portal/followup-types";
import { buttonCls, ghostButtonCls, Card, Eyebrow } from "./Shell";

export interface ActionRow {
  kind: string;
  urgency: "overdue" | "now" | "soon";
  title: string;
  detail: string;
  href: string;
  followUpId?: string;
  due?: string;
}

const ICON: Record<string, string> = {
  followup: "↺",
  signature: "✎",
  payment: "$",
  inquiry: "✉",
  intake: "▤",
  delivery: "⇪",
};

/* What needs Arman today, and the one control that makes a CRM a CRM: being
   able to put something back on the list for a date in the future. */
export default function StudioToday({
  actions,
  subjects,
}: {
  actions: ActionRow[];
  /** Everyone a follow-up can be attached to. */
  subjects: FollowUpSubject[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState("");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({
    subject: subjects[0]?.id ?? "",
    title: QUICK_FOLLOW_UPS[0],
    due: new Date(Date.now() + 2 * 86400000).toISOString().slice(0, 10),
  });

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>) =>
    start(async () => {
      setError("");
      const r = await fn();
      if (!r.ok && r.error) setError(r.error);
      router.refresh();
    });

  return (
    <Card className="wp-today">
      <div className="wp-section-title">
        <Eyebrow>
          {actions.length === 0
            ? "Nothing needs you today"
            : `${actions.length} thing${actions.length === 1 ? "" : "s"} need you`}
        </Eyebrow>
        <button className="wp-text-button" onClick={() => setAdding((v) => !v)}>
          {adding ? "Close" : "+ Follow-up"}
        </button>
      </div>

      {adding && (
        <div className="wp-followup-form">
          <label className="wp-label">
            About
            <select
              className="wp-input"
              value={draft.subject}
              onChange={(e) => setDraft({ ...draft, subject: e.target.value })}
            >
              {subjects.map((s) => (
                <option key={`${s.kind}:${s.id}`} value={s.id}>
                  {s.label}
                </option>
              ))}
            </select>
          </label>
          <label className="wp-label">
            What
            <input
              className="wp-input"
              list="wp-quick-followups"
              value={draft.title}
              onChange={(e) => setDraft({ ...draft, title: e.target.value })}
            />
            <datalist id="wp-quick-followups">
              {QUICK_FOLLOW_UPS.map((q) => <option key={q} value={q} />)}
            </datalist>
          </label>
          <label className="wp-label">
            When
            <input
              type="date"
              className="wp-input"
              value={draft.due}
              onChange={(e) => setDraft({ ...draft, due: e.target.value })}
            />
          </label>
          <button
            className={buttonCls}
            disabled={pending || !draft.subject || draft.title.trim().length < 2}
            onClick={() => {
              const s = subjects.find((x) => x.id === draft.subject);
              if (!s) return;
              run(async () => {
                const r = await addFollowUp({
                  subject: s,
                  title: draft.title,
                  due: draft.due,
                });
                if (r.ok) setAdding(false);
                return r;
              });
            }}
          >
            {pending ? "Adding…" : "Add"}
          </button>
        </div>
      )}

      {error && <div className="wp-message wp-message-error">{error}</div>}

      {actions.length === 0 ? (
        <p className="wp-today-clear">
          No overdue payments, no unsigned documents, no inquiry waiting on a
          reply. Anything you want to remember is a follow-up away.
        </p>
      ) : (
        <ul className="wp-today-list">
          {actions.map((a, i) => (
            <li key={`${a.kind}-${i}`} className={`wp-today-row is-${a.urgency}`}>
              <span className="wp-today-icon" aria-hidden>{ICON[a.kind] ?? "•"}</span>
              <div className="wp-today-copy">
                <Link href={a.href}>{a.title}</Link>
                <small>{a.detail}</small>
              </div>
              <div className="wp-today-actions">
                {a.followUpId ? (
                  <>
                    <button
                      className="wp-text-button"
                      disabled={pending}
                      onClick={() => run(() => setFollowUpDone(a.followUpId!, true))}
                    >
                      Done
                    </button>
                    <button
                      className="wp-text-button"
                      disabled={pending}
                      onClick={() => run(() => snoozeFollowUp(a.followUpId!, 3))}
                    >
                      +3d
                    </button>
                    <button
                      className="wp-text-button wp-danger"
                      disabled={pending}
                      onClick={() => {
                        if (!confirm("Delete this follow-up?")) return;
                        run(() => removeFollowUp(a.followUpId!));
                      }}
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <Link className={ghostButtonCls} href={a.href}>Open</Link>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
