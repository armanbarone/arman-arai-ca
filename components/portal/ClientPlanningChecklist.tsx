"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { Booking } from "@/lib/portal/types";
import { completeClientTask } from "@/app/admin/manage-actions";
import { formatDate } from "@/lib/portal/money";
import { useWeddingPreview } from "./WeddingPreviewProvider";
import { Card, StatusPill } from "./Shell";
export default function ClientPlanningChecklist({
  booking: b,
  preview = false,
}: {
  booking: Booking;
  preview?: boolean;
}) {
  const router = useRouter(),
    context = useWeddingPreview(),
    [pending, start] = useTransition(),
    [error, setError] = useState("");
  const items = b.planning
    .filter((p) => p.clientVisible)
    .map((p) => {
      const documents = b.wedding?.documents || [],
        forms = b.wedding?.forms || {};
      const completed =
        p.titleEn === "Agreement signed"
          ? documents.some(
              (d) => d.templateKey === "agreement" && d.status === "executed",
            )
          : p.titleEn === "Booking payment received"
            ? b.schedule.some(
                (i) => i.kind === "deposit" && i.paidCents >= i.totalCents,
              )
            : p.titleEn === "Discovery answers submitted"
              ? !!forms.discovery && forms.discovery.status !== "draft"
              : p.titleEn === "Family photo list confirmed"
                ? forms.family?.status === "reviewed"
                : p.titleEn === "Creative brief approved"
                  ? documents.some(
                      (d) =>
                        d.templateKey === "creative" && d.status === "executed",
                    )
                  : p.titleEn === "Final wedding plan approved"
                    ? documents.some(
                        (d) =>
                          d.templateKey === "dossier" &&
                          d.status === "executed",
                      )
                    : p.titleEn === "Photographs delivered"
                      ? !!b.wedding?.galleryUrl && !!b.wedding?.deliveryDate
                      : p.titleEn === "Films delivered"
                        ? !!b.wedding?.filmUrl && !!b.wedding?.deliveryDate
                        : false;
      return completed && !p.clientCanComplete
        ? { ...p, status: "done" as const }
        : p;
    })
    .sort((a, b) => a.sortOrder - b.sortOrder);
  if (!items.length) return null;
  return (
    <Card>
      <h2>Your wedding checklist</h2>
      {items.map((p) => (
        <div className="wp-checklist-row" key={p.id} id={`task-${p.id}`}>
          {p.clientCanComplete ? (
            <input
              type="checkbox"
              aria-label={`Complete ${p.titleEn}`}
              checked={p.status === "done"}
              disabled={pending}
              onChange={(e) => {
                const done = e.target.checked;
                start(async () => {
                  if (preview && context) {
                    context.update((b) => {
                      const item = b.planning.find((x) => x.id === p.id);
                      if (item) item.status = done ? "done" : "todo";
                    });
                    return;
                  }
                  const r = await completeClientTask(b.ref, p.id, done);
                  if (!r.ok) setError(r.error);
                  router.refresh();
                });
              }}
            />
          ) : (
            <StatusPill status={p.status} />
          )}
          <div>
            <strong>{p.titleEn}</strong>
            {p.dueDate && <small>Due {formatDate(p.dueDate)}</small>}
            {p.clientNote && <p>{p.clientNote}</p>}
          </div>
        </div>
      ))}
      {error && (
        <p className="wp-message wp-message-error" role="alert">
          {error}
        </p>
      )}
    </Card>
  );
}
