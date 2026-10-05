"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Booking, PlanningItem } from "@/lib/portal/types";
import { WEDDING_TEMPLATES } from "@/lib/portal/wedding";
import { ALWAYS_VISIBLE_WORKFLOWS } from "@/lib/portal/portal-controls";
import { invoiceBalance } from "@/lib/portal/billing";
import {
  saveClientPortal,
  archiveWedding,
  changeWeddingStage,
} from "@/app/admin/manage-actions";
import { sendInviteAction } from "@/app/admin/actions";
import { useWeddingPreview } from "./WeddingPreviewProvider";
import { Card, buttonCls, ghostButtonCls, Eyebrow } from "./Shell";
export default function WeddingPortalControls({
  booking: b,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const router = useRouter(),
    context = useWeddingPreview(),
    [enabled, setEnabled] = useState(b.portal?.enabled !== false),
    [welcome, setWelcome] = useState(b.portal?.welcomeMessage || ""),
    [hidden, setHidden] = useState(b.portal?.hiddenWorkflows || []),
    [notes, setNotes] = useState(b.internalNotes),
    [planning, setPlanning] = useState(
      b.planning.map((p) => ({
        ...p,
        section: p.section || "Wedding planning",
        titleFr: p.titleFr || "",
      })),
    ),
    [reason, setReason] = useState(""),
    [confirmation, setConfirmation] = useState(""),
    [stage, setStage] = useState<"in_planning" | "completed" | "cancelled">(
      "in_planning",
    ),
    [message, setMessage] = useState(""),
    [error, setError] = useState(""),
    [pending, start] = useTransition();
  const run = (
    mode: "save" | "archive" | "restore" | "stage" | "invite",
    email = "",
  ) =>
    start(async () => {
      setMessage("");
      setError("");
      if (
        (mode === "archive" || mode === "stage") &&
        (confirmation !== b.ref || reason.trim().length < 5)
      ) {
        setError(
          "Enter this wedding reference and a reason before proceeding.",
        );
        return;
      }
      if (preview && context) {
        context.update((next) => {
          const at = new Date().toISOString();
          if (mode === "save") {
            next.portal = {
              enabled,
              welcomeMessage: welcome,
              hiddenWorkflows: hidden,
              updatedAt: at,
              actor: "studio@example.com",
            };
            next.planning = planning;
            next.internalNotes = notes;
          }
          if (mode === "archive") {
            next.archivedAt = at;
            if (next.portal) next.portal.enabled = false;
            next.archiveReason = reason;
            for (const v of next.invoices || [])
              if (v.status === "issued" && invoiceBalance(next, v) > 0)
                v.status = "void";
          }
          if (mode === "restore") {
            delete next.archivedAt;
            delete next.archiveReason;
            if (next.portal) next.portal.enabled = true;
          }
          if (mode === "stage") next.status = stage;
          next.events.push({
            at,
            type: `practice_${mode}`,
            actor: "studio@example.com",
          });
        });
        if (mode === "archive") setEnabled(false);
        if (mode === "restore") setEnabled(true);
        setMessage(
          mode === "archive"
            ? "Sample wedding archived. Client access is closed."
            : mode === "restore"
              ? "Sample wedding restored."
              : mode === "invite"
                ? "Practice invitation recorded. No email was sent."
                : "Sample dashboard updated.",
        );
        router.refresh();
        return;
      }
      const r =
        mode === "save"
          ? await saveClientPortal(
              b.ref,
              {
                enabled,
                welcomeMessage: welcome,
                hiddenWorkflows: hidden,
                internalNotes: notes,
                planning: planning.map(
                  ({
                    id,
                    section,
                    titleEn,
                    titleFr,
                    dueDate,
                    status,
                    clientVisible,
                    clientCanComplete,
                    clientNote,
                    internalNote,
                    sortOrder,
                  }) => ({
                    id,
                    section,
                    titleEn,
                    titleFr,
                    dueDate: dueDate || "",
                    status,
                    clientVisible,
                    clientCanComplete,
                    clientNote,
                    internalNote,
                    sortOrder,
                  }),
                ),
              },
              b.updatedAt,
            )
          : mode === "archive"
            ? await archiveWedding(b.ref, reason)
            : mode === "restore"
              ? await archiveWedding(b.ref, "Restored by studio", true)
              : mode === "stage"
                ? await changeWeddingStage(b.ref, stage, reason)
                : await sendInviteAction(b.ref, email);
      if (!r.ok) {
        setError(
          "error" in r ? r.error || "Please try again." : "Please try again.",
        );
        return;
      }
      setMessage("message" in r ? r.message : "Invitation emailed.");
      router.refresh();
    });
  const editTask = (id: string, fn: (p: PlanningItem) => void) =>
    setPlanning((old) =>
      old.map((p) => {
        if (p.id !== id) return p;
        const n = { ...p };
        fn(n);
        return n;
      }),
    );
  return (
    <>
      <Eyebrow>{b.ref} · Manage client dashboard</Eyebrow>
      <h1>Client portal controls</h1>
      <p className="wp-lead">
        Manage this couple’s access, next steps, planning tools and the
        information they see. Signed contracts and payment receipts remain fixed
        records.
      </p>
      <div className="wp-toolbar">
        <Link
          href={
            preview
              ? "/portal/preview/admin/booking"
              : `/admin/bookings/${b.ref}`
          }
        >
          ← Wedding workspace
        </Link>
        <Link href={preview ? "/portal/preview" : `/portal/${b.ref}`}>
          Open client view ↗
        </Link>
        <Link
          href={
            preview
              ? "/portal/preview/admin/settings"
              : `/admin/bookings/${b.ref}/settings`
          }
        >
          Edit couple, collection & quote →
        </Link>
      </div>
      <Card>
        <h2>Access & invitations</h2>
        <p>
          {b.archivedAt
            ? "This wedding is archived. Restore it to reopen client access."
            : enabled
              ? "Client portal is open to the two email addresses below."
              : "Client portal access is suspended."}
        </p>
        <label className="wp-checkbox">
          <input
            type="checkbox"
            checked={enabled}
            disabled={!!b.archivedAt}
            onChange={(e) => setEnabled(e.target.checked)}
          />
          Allow this couple to access their portal
        </label>
        <div className="wp-doc-grid">
          {b.clients.map((c) => (
            <div className="wp-management-tile" key={c.id}>
              <h3>{c.legalName}</h3>
              <p>{c.email}</p>
              <button
                className={ghostButtonCls}
                disabled={pending || !!b.archivedAt || !enabled}
                onClick={() => run("invite", c.email)}
              >
                Email portal invitation
              </button>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <h2>A note from you</h2>
        <label className="wp-label">
          Message shown on their overview
          <textarea
            className="wp-input"
            rows={4}
            maxLength={3000}
            value={welcome}
            onChange={(e) => setWelcome(e.target.value)}
            placeholder="A personal welcome or the next thing you want them to do."
          />
        </label>
      </Card>
      <Card>
        <h2>Client workflows</h2>
        <p>
          Choose the optional tools relevant to this wedding. Issued documents
          remain available even if a planning tool is hidden.
        </p>
        <div className="wp-doc-grid">
          {WEDDING_TEMPLATES.filter(
            (t) =>
              t.audience === "client" &&
              !ALWAYS_VISIBLE_WORKFLOWS.includes(t.key),
          ).map((t) => (
            <label className="wp-checkbox" key={t.key}>
              <input
                type="checkbox"
                checked={!hidden.includes(t.key)}
                onChange={(e) =>
                  setHidden((old) =>
                    e.target.checked
                      ? old.filter((k) => k !== t.key)
                      : [...old, t.key],
                  )
                }
              />
              {t.title}
            </label>
          ))}
        </div>
      </Card>
      <Card>
        <div className="wp-section-title">
          <h2>Checklist & deadlines</h2>
          <button
            className={ghostButtonCls}
            onClick={() =>
              setPlanning((old) => [
                ...old,
                {
                  id: `task-${Date.now()}`,
                  section: "Wedding planning",
                  titleEn: "New client task",
                  titleFr: "",
                  status: "todo",
                  clientVisible: true,
                  clientCanComplete: true,
                  sortOrder: old.length,
                },
              ])
            }
          >
            + Add client task
          </button>
        </div>
        <p>Set what needs to happen, who completes it, and when it is due.</p>
        {planning.map((p) => (
          <details
            className="wp-form-section wp-planning-edit"
            key={p.id}
            open={p.id.startsWith("task-")}
          >
            <summary>
              {p.titleEn} · {p.status.replace(/_/g, " ")}
            </summary>
            <div className="wp-form-body">
              <label className="wp-label">
                Task
                <input
                  className="wp-input"
                  value={p.titleEn}
                  onChange={(e) =>
                    editTask(p.id, (n) => {
                      n.titleEn = e.target.value;
                    })
                  }
                />
              </label>
              <div className="wp-doc-grid">
                <label className="wp-label">
                  Due date
                  <input
                    className="wp-input"
                    type="date"
                    value={p.dueDate || ""}
                    onChange={(e) =>
                      editTask(p.id, (n) => {
                        n.dueDate = e.target.value;
                      })
                    }
                  />
                </label>
                <label className="wp-label">
                  Status
                  <select
                    className="wp-input"
                    value={p.status}
                    onChange={(e) =>
                      editTask(p.id, (n) => {
                        n.status = e.target.value as PlanningItem["status"];
                      })
                    }
                  >
                    {["todo", "in_progress", "done", "not_applicable"].map(
                      (s) => (
                        <option value={s} key={s}>
                          {s.replace(/_/g, " ")}
                        </option>
                      ),
                    )}
                  </select>
                </label>
              </div>
              <label className="wp-checkbox">
                <input
                  type="checkbox"
                  checked={p.clientVisible}
                  onChange={(e) =>
                    editTask(p.id, (n) => {
                      n.clientVisible = e.target.checked;
                    })
                  }
                />
                Show on client dashboard
              </label>
              <label className="wp-checkbox">
                <input
                  type="checkbox"
                  checked={!!p.clientCanComplete}
                  onChange={(e) =>
                    editTask(p.id, (n) => {
                      n.clientCanComplete = e.target.checked;
                    })
                  }
                />
                Couple can mark this task complete
              </label>
              <label className="wp-label">
                Note for the couple
                <input
                  className="wp-input"
                  value={p.clientNote || ""}
                  onChange={(e) =>
                    editTask(p.id, (n) => {
                      n.clientNote = e.target.value;
                    })
                  }
                />
              </label>
              <button
                className="wp-text-button"
                onClick={() =>
                  setPlanning((old) => old.filter((x) => x.id !== p.id))
                }
              >
                Remove checklist item
              </button>
            </div>
          </details>
        ))}
      </Card>
      <Card>
        <h2>Private studio notes</h2>
        <textarea
          aria-label="Private studio notes"
          className="wp-input"
          rows={5}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <p>Only the studio sees these notes.</p>
      </Card>
      <button
        className={buttonCls}
        disabled={pending}
        onClick={() => run("save")}
      >
        {pending ? "Saving…" : "Save client dashboard →"}
      </button>
      <Card className="wp-doc-section">
        <h2>Wedding status & archive</h2>
        {b.archivedAt ? (
          <>
            <p>
              Archived: {b.archiveReason}. Stored contracts, invoices and
              receipts remain in the studio.
            </p>
            <button
              className={ghostButtonCls}
              disabled={pending}
              onClick={() => run("restore")}
            >
              Restore wedding & client access
            </button>
          </>
        ) : (
          <>
            <p>
              Archiving removes this wedding from the active list and closes
              client access. It preserves the records; it does not cancel a
              contract or issue a refund.
            </p>
            <label className="wp-label">
              Reason
              <input
                className="wp-input"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </label>
            <label className="wp-label">
              Type {b.ref} to confirm
              <input
                className="wp-input"
                value={confirmation}
                onChange={(e) => setConfirmation(e.target.value)}
              />
            </label>
            <button
              className={ghostButtonCls}
              disabled={
                pending || confirmation !== b.ref || reason.trim().length < 5
              }
              onClick={() => run("archive")}
            >
              Archive wedding & close client access
            </button>
            <hr className="wp-divider" />
            <label className="wp-label">
              Wedding stage
              <select
                className="wp-input"
                value={stage}
                onChange={(e) => setStage(e.target.value as typeof stage)}
              >
                <option value="in_planning">In planning</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </label>
            <p>
              Cancellation records the studio’s decision. It does not calculate
              or send a refund.
            </p>
            <button
              className={ghostButtonCls}
              disabled={
                pending || confirmation !== b.ref || reason.trim().length < 5
              }
              onClick={() => run("stage")}
            >
              Update wedding status
            </button>
          </>
        )}
      </Card>
      {message && (
        <p className="wp-message" role="status">
          {message}
        </p>
      )}
      {error && (
        <p className="wp-message wp-message-error" role="alert">
          {error}
        </p>
      )}
    </>
  );
}
